import "server-only";
import { and, asc, count, desc, eq, gte, ilike, isNull, lte, or, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import { financeAuditLog, financeBudgets, financeCategories, financeExpenseAttachments, financeExpenses, user } from "@/lib/db/schema";
import { getIndiaDate, financeDaysBetween, financeMonthKey, financeMonthStart, financeWeekStart, financeYearStart, formatFinanceDate, shiftFinanceDate } from "./dates";
import { compareMoneyStrings, moneyToChartNumber, subtractMoneyStrings } from "./money";
import { requireFinancePageOwner } from "./access";
import { isValidFinanceDate } from "./validation";
import type { FinanceAttachmentMetadata, FinanceAuditEntry, FinanceBudgetUsage, FinanceCategoryOption, FinanceChartPoint, FinanceDashboardData, FinanceExpenseDetail, FinanceExpenseRow, FinanceFilters, FinancePaymentMethod, FinanceReportData, FinanceReportPeriod } from "./types";

const DEFAULT_CURRENCY = "INR";
const ACTIVE = "active";

function normalizeFilters(filters: Partial<FinanceFilters> = {}): FinanceFilters {
  const currency = typeof filters.currency === "string" && /^[A-Z]{3}$/.test(filters.currency.toUpperCase())
    ? filters.currency.toUpperCase()
    : DEFAULT_CURRENCY;
  const search = typeof filters.search === "string" ? filters.search.trim().slice(0, 120) : "";
  const from = typeof filters.from === "string" && isValidFinanceDate(filters.from) ? filters.from : "";
  const to = typeof filters.to === "string" && isValidFinanceDate(filters.to) ? filters.to : "";
  const categoryId = typeof filters.categoryId === "string" ? filters.categoryId.slice(0, 180) : "";
  const paymentMethod = typeof filters.paymentMethod === "string" ? filters.paymentMethod : "";
  const status = filters.status === "void" || filters.status === "all" ? filters.status : "active";
  return { currency, search, from: from && to && from > to ? "" : from, to: from && to && from > to ? "" : to, categoryId, paymentMethod, status };
}

function chartPoint(label: string, key: string, exactAmount: string): FinanceChartPoint {
  return { label, key, amount: moneyToChartNumber(exactAmount), exactAmount };
}

function mapRowsToAmounts(rows: { key: string; amount: string }[]) {
  return new Map(rows.map((row) => [row.key, row.amount]));
}

function asIso(value: Date | string | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

function toExpenseRow(row: {
  id: string;
  title: string;
  amount: string;
  currency: string;
  categoryId: string;
  categoryName: string;
  expenseDate: string;
  expenseTime: string | null;
  paymentMethod: string;
  vendor: string;
  projectReference: string;
  status: string;
  createdAt: Date | string;
}): FinanceExpenseRow {
  return {
    ...row,
    paymentMethod: row.paymentMethod as FinancePaymentMethod,
    status: row.status as FinanceExpenseRow["status"],
    createdAt: asIso(row.createdAt),
  };
}

async function activeCategories(): Promise<FinanceCategoryOption[]> {
  return db.select({ id: financeCategories.id, name: financeCategories.name, description: financeCategories.description, isSystem: financeCategories.isSystem })
    .from(financeCategories)
    .where(isNull(financeCategories.archivedAt))
    .orderBy(asc(financeCategories.name));
}

export async function getFinanceCategories() {
  await requireFinancePageOwner();
  return activeCategories();
}

export async function getFinanceDashboard(inputFilters: Partial<FinanceFilters> = {}): Promise<FinanceDashboardData> {
  await requireFinancePageOwner();
  const filters = normalizeFilters(inputFilters);
  const today = getIndiaDate();
  const yesterday = shiftFinanceDate(today, -1);
  const weekStart = financeWeekStart(today);
  const monthStart = financeMonthStart(today);
  const yearStart = financeYearStart(today);
  const elapsedMonthDays = Number(today.slice(8, 10));

  const [statRow] = await db.select({
    today: sql<string>`coalesce(sum(case when ${financeExpenses.expenseDate} = ${today} then ${financeExpenses.amount} else 0 end), 0)::text`,
    yesterday: sql<string>`coalesce(sum(case when ${financeExpenses.expenseDate} = ${yesterday} then ${financeExpenses.amount} else 0 end), 0)::text`,
    week: sql<string>`coalesce(sum(case when ${financeExpenses.expenseDate} >= ${weekStart} and ${financeExpenses.expenseDate} <= ${today} then ${financeExpenses.amount} else 0 end), 0)::text`,
    month: sql<string>`coalesce(sum(case when ${financeExpenses.expenseDate} >= ${monthStart} and ${financeExpenses.expenseDate} <= ${today} then ${financeExpenses.amount} else 0 end), 0)::text`,
    year: sql<string>`coalesce(sum(case when ${financeExpenses.expenseDate} >= ${yearStart} and ${financeExpenses.expenseDate} <= ${today} then ${financeExpenses.amount} else 0 end), 0)::text`,
    total: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text`,
    averageDaily: sql<string>`coalesce(round(sum(case when ${financeExpenses.expenseDate} >= ${monthStart} and ${financeExpenses.expenseDate} <= ${today} then ${financeExpenses.amount} else 0 end) / ${elapsedMonthDays}, 2), 0)::text`,
    transactions: count(),
  }).from(financeExpenses).where(and(eq(financeExpenses.status, ACTIVE), eq(financeExpenses.currency, filters.currency)));

  const [dailyRows, monthRows, yearRows, categoryRows, categoryOptions, currencyRows] = await Promise.all([
    db.select({ key: financeExpenses.expenseDate, amount: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text` })
      .from(financeExpenses)
      .where(and(eq(financeExpenses.status, ACTIVE), eq(financeExpenses.currency, filters.currency), gte(financeExpenses.expenseDate, shiftFinanceDate(today, -29)), lte(financeExpenses.expenseDate, today)))
      .groupBy(financeExpenses.expenseDate)
      .orderBy(asc(financeExpenses.expenseDate)),
    db.select({ key: sql<string>`to_char(date_trunc('month', ${financeExpenses.expenseDate}::date), 'YYYY-MM')`, amount: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text` })
      .from(financeExpenses)
      .where(and(eq(financeExpenses.status, ACTIVE), eq(financeExpenses.currency, filters.currency), gte(financeExpenses.expenseDate, financeMonthKey(today, -11) + "-01"), lte(financeExpenses.expenseDate, today)))
      .groupBy(sql`date_trunc('month', ${financeExpenses.expenseDate}::date)`)
      .orderBy(asc(sql`date_trunc('month', ${financeExpenses.expenseDate}::date)`)),
    db.select({ key: sql<string>`extract(year from ${financeExpenses.expenseDate}::date)::int::text`, amount: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text` })
      .from(financeExpenses)
      .where(and(eq(financeExpenses.status, ACTIVE), eq(financeExpenses.currency, filters.currency), gte(financeExpenses.expenseDate, `${Number(today.slice(0, 4)) - 4}-01-01`), lte(financeExpenses.expenseDate, today)))
      .groupBy(sql`extract(year from ${financeExpenses.expenseDate}::date)`)
      .orderBy(asc(sql`extract(year from ${financeExpenses.expenseDate}::date)`)),
    db.select({ id: financeCategories.id, name: financeCategories.name, amount: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text` })
      .from(financeExpenses)
      .innerJoin(financeCategories, eq(financeExpenses.categoryId, financeCategories.id))
      .where(and(eq(financeExpenses.status, ACTIVE), eq(financeExpenses.currency, filters.currency), gte(financeExpenses.expenseDate, yearStart), lte(financeExpenses.expenseDate, today)))
      .groupBy(financeCategories.id, financeCategories.name)
      .orderBy(desc(sum(financeExpenses.amount)), asc(financeCategories.name)),
    activeCategories(),
    db.select({ currency: financeExpenses.currency }).from(financeExpenses).where(eq(financeExpenses.status, ACTIVE)).groupBy(financeExpenses.currency).orderBy(asc(financeExpenses.currency)),
  ]);

  const dailyMap = mapRowsToAmounts(dailyRows);
  const monthlyMap = mapRowsToAmounts(monthRows);
  const yearlyMap = mapRowsToAmounts(yearRows);
  const daily = Array.from({ length: 30 }, (_, index) => {
    const date = shiftFinanceDate(today, index - 29);
    return chartPoint(formatFinanceDate(date, { day: "numeric", month: "short" }), date, dailyMap.get(date) ?? "0.00");
  });
  const monthly = Array.from({ length: 12 }, (_, index) => {
    const key = financeMonthKey(today, index - 11);
    return chartPoint(formatFinanceDate(`${key}-01`, { month: "short" }), key, monthlyMap.get(key) ?? "0.00");
  });
  const yearly = Array.from({ length: 5 }, (_, index) => {
    const year = String(Number(today.slice(0, 4)) - 4 + index);
    return chartPoint(year, year, yearlyMap.get(year) ?? "0.00");
  });
  const categoryCharts = categoryRows.map((row) => chartPoint(row.name, row.id, row.amount));

  const expenseConditions = [eq(financeExpenses.currency, filters.currency)];
  if (filters.status !== "all") expenseConditions.push(eq(financeExpenses.status, filters.status));
  if (filters.from) expenseConditions.push(gte(financeExpenses.expenseDate, filters.from));
  if (filters.to) expenseConditions.push(lte(financeExpenses.expenseDate, filters.to));
  if (filters.categoryId) expenseConditions.push(eq(financeExpenses.categoryId, filters.categoryId));
  if (filters.paymentMethod) expenseConditions.push(eq(financeExpenses.paymentMethod, filters.paymentMethod));
  if (filters.search) {
    const pattern = `%${filters.search.replace(/[\\%_]/g, "\\$&")}%`;
    expenseConditions.push(or(ilike(financeExpenses.title, pattern), ilike(financeExpenses.vendor, pattern), ilike(financeExpenses.description, pattern), ilike(financeExpenses.projectReference, pattern))!);
  }

  const expenseRows = await db.select({
    id: financeExpenses.id,
    title: financeExpenses.title,
    amount: financeExpenses.amount,
    currency: financeExpenses.currency,
    categoryId: financeCategories.id,
    categoryName: financeCategories.name,
    expenseDate: financeExpenses.expenseDate,
    expenseTime: financeExpenses.expenseTime,
    paymentMethod: financeExpenses.paymentMethod,
    vendor: financeExpenses.vendor,
    projectReference: financeExpenses.projectReference,
    status: financeExpenses.status,
    createdAt: financeExpenses.createdAt,
  }).from(financeExpenses)
    .innerJoin(financeCategories, eq(financeExpenses.categoryId, financeCategories.id))
    .where(and(...expenseConditions))
    .orderBy(desc(financeExpenses.expenseDate), desc(financeExpenses.createdAt))
    .limit(100);

  const availableCurrencies = Array.from(new Set([DEFAULT_CURRENCY, ...currencyRows.map((row) => row.currency)]));
  const highestCategory = categoryRows[0] ? { name: categoryRows[0].name, amount: categoryRows[0].amount } : null;
  return {
    today,
    currency: filters.currency,
    availableCurrencies,
    stats: {
      today: statRow?.today ?? "0.00",
      yesterday: statRow?.yesterday ?? "0.00",
      week: statRow?.week ?? "0.00",
      month: statRow?.month ?? "0.00",
      year: statRow?.year ?? "0.00",
      total: statRow?.total ?? "0.00",
      averageDaily: statRow?.averageDaily ?? "0.00",
      transactions: Number(statRow?.transactions ?? 0),
      highestCategory,
    },
    charts: {
      daily,
      monthly,
      categories: categoryCharts,
      yearly,
      topCategories: categoryCharts.slice(0, 5),
    },
    expenses: expenseRows.map(toExpenseRow),
    categories: categoryOptions,
    filters,
  };
}

function reportBounds(period: FinanceReportPeriod, today: string, from?: string, to?: string) {
  if (period === "daily") return { startDate: today, endDate: today };
  if (period === "weekly") return { startDate: financeWeekStart(today), endDate: today };
  if (period === "yearly") return { startDate: financeYearStart(today), endDate: today };
  if (period === "custom") {
    const validFrom = from && isValidFinanceDate(from) ? from : financeMonthStart(today);
    const validTo = to && isValidFinanceDate(to) ? to : today;
    if (validFrom > validTo) return { startDate: financeMonthStart(today), endDate: today };
    if (financeDaysBetween(validFrom, validTo) > 366) return { startDate: shiftFinanceDate(validTo, -365), endDate: validTo };
    return { startDate: validFrom, endDate: validTo };
  }
  return { startDate: financeMonthStart(today), endDate: today };
}

export async function getFinanceReport(input: { period?: string; currency?: string; from?: string; to?: string } = {}): Promise<FinanceReportData> {
  await requireFinancePageOwner();
  const today = getIndiaDate();
  const period = (["daily", "weekly", "monthly", "yearly", "custom"] as const).includes(input.period as FinanceReportPeriod) ? input.period as FinanceReportPeriod : "monthly";
  const currency = typeof input.currency === "string" && /^[A-Z]{3}$/.test(input.currency.toUpperCase()) ? input.currency.toUpperCase() : DEFAULT_CURRENCY;
  const { startDate, endDate } = reportBounds(period, today, input.from, input.to);
  const where = and(eq(financeExpenses.status, ACTIVE), eq(financeExpenses.currency, currency), gte(financeExpenses.expenseDate, startDate), lte(financeExpenses.expenseDate, endDate));
  const days = financeDaysBetween(startDate, endDate);

  const [[totals], dailyRows, categories, paymentRows, topRows] = await Promise.all([
    db.select({ total: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text`, averageDaily: sql<string>`coalesce(round(sum(${financeExpenses.amount}) / ${days}, 2), 0)::text`, transactions: count() }).from(financeExpenses).where(where),
    db.select({ date: financeExpenses.expenseDate, amount: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text`, transactions: count() }).from(financeExpenses).where(where).groupBy(financeExpenses.expenseDate).orderBy(asc(financeExpenses.expenseDate)),
    db.select({ id: financeCategories.id, name: financeCategories.name, amount: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text`, transactions: count() }).from(financeExpenses).innerJoin(financeCategories, eq(financeExpenses.categoryId, financeCategories.id)).where(where).groupBy(financeCategories.id, financeCategories.name).orderBy(desc(sum(financeExpenses.amount)), asc(financeCategories.name)),
    db.select({ method: financeExpenses.paymentMethod, amount: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text`, transactions: count() }).from(financeExpenses).where(where).groupBy(financeExpenses.paymentMethod).orderBy(desc(sum(financeExpenses.amount))),
    db.select({ id: financeExpenses.id, title: financeExpenses.title, amount: financeExpenses.amount, currency: financeExpenses.currency, categoryId: financeCategories.id, categoryName: financeCategories.name, expenseDate: financeExpenses.expenseDate, expenseTime: financeExpenses.expenseTime, paymentMethod: financeExpenses.paymentMethod, vendor: financeExpenses.vendor, projectReference: financeExpenses.projectReference, status: financeExpenses.status, createdAt: financeExpenses.createdAt }).from(financeExpenses).innerJoin(financeCategories, eq(financeExpenses.categoryId, financeCategories.id)).where(where).orderBy(desc(financeExpenses.amount), desc(financeExpenses.expenseDate)).limit(10),
  ]);

  const daily = dailyRows.map((row) => chartPoint(formatFinanceDate(row.date, { day: "numeric", month: "short" }), row.date, row.amount));
  const highestDay = dailyRows.reduce<{ date: string; amount: string } | null>((best, row) => !best || compareMoneyStrings(row.amount, best.amount) > 0 ? { date: row.date, amount: row.amount } : best, null);
  return {
    currency,
    period,
    startDate,
    endDate,
    total: totals?.total ?? "0.00",
    averageDaily: totals?.averageDaily ?? "0.00",
    transactions: Number(totals?.transactions ?? 0),
    highestDay,
    daily,
    categories: categories.map((row) => ({ id: row.id, name: row.name, amount: row.amount, count: Number(row.transactions) })),
    paymentMethods: paymentRows.map((row) => ({ method: row.method as FinancePaymentMethod, amount: row.amount, count: Number(row.transactions) })),
    topExpenses: topRows.map(toExpenseRow),
  };
}

export async function getFinanceBudgets(): Promise<FinanceBudgetUsage[]> {
  await requireFinancePageOwner();
  const rows = await db.select({
    id: financeBudgets.id,
    name: financeBudgets.name,
    budgetType: financeBudgets.budgetType,
    amount: financeBudgets.amount,
    currency: financeBudgets.currency,
    categoryId: financeBudgets.categoryId,
    categoryName: financeCategories.name,
    projectReference: financeBudgets.projectReference,
    periodStart: financeBudgets.periodStart,
    periodEnd: financeBudgets.periodEnd,
  }).from(financeBudgets)
    .leftJoin(financeCategories, eq(financeBudgets.categoryId, financeCategories.id))
    .where(eq(financeBudgets.isActive, true))
    .orderBy(asc(financeBudgets.periodStart), asc(financeBudgets.name));

  return Promise.all(rows.map(async (budget) => {
    const conditions = [
      eq(financeExpenses.status, ACTIVE),
      eq(financeExpenses.currency, budget.currency),
      gte(financeExpenses.expenseDate, budget.periodStart),
      lte(financeExpenses.expenseDate, budget.periodEnd),
    ];
    if (budget.budgetType === "category" && budget.categoryId) conditions.push(eq(financeExpenses.categoryId, budget.categoryId));
    if (budget.budgetType === "project" && budget.projectReference) conditions.push(eq(financeExpenses.projectReference, budget.projectReference));
    const [actualRow] = await db.select({ actual: sql<string>`coalesce(sum(${financeExpenses.amount}), 0)::text` }).from(financeExpenses).where(and(...conditions));
    const actual = actualRow?.actual ?? "0.00";
    const budgetNumber = Number(budget.amount);
    const actualNumber = Number(actual);
    return {
      ...budget,
      budgetType: budget.budgetType as FinanceBudgetUsage["budgetType"],
      actual,
      remaining: subtractMoneyStrings(budget.amount, actual),
      percentUsed: budgetNumber > 0 ? Math.max(0, (actualNumber / budgetNumber) * 100) : 0,
    };
  }));
}

export async function getFinanceExpenseDetail(id: string): Promise<FinanceExpenseDetail | null> {
  await requireFinancePageOwner();
  if (!/^[A-Za-z0-9:_-]{1,180}$/.test(id)) return null;
  const [row] = await db.select({
    id: financeExpenses.id,
    title: financeExpenses.title,
    description: financeExpenses.description,
    amount: financeExpenses.amount,
    currency: financeExpenses.currency,
    categoryId: financeExpenses.categoryId,
    categoryName: financeCategories.name,
    expenseDate: financeExpenses.expenseDate,
    expenseTime: financeExpenses.expenseTime,
    paymentMethod: financeExpenses.paymentMethod,
    paidBy: financeExpenses.paidBy,
    vendor: financeExpenses.vendor,
    projectReference: financeExpenses.projectReference,
    referenceNumber: financeExpenses.referenceNumber,
    status: financeExpenses.status,
    source: financeExpenses.source,
    createdBy: financeExpenses.createdBy,
    createdAt: financeExpenses.createdAt,
    updatedBy: financeExpenses.updatedBy,
    updatedAt: financeExpenses.updatedAt,
    voidedBy: financeExpenses.voidedBy,
    voidedAt: financeExpenses.voidedAt,
  }).from(financeExpenses)
    .innerJoin(financeCategories, eq(financeExpenses.categoryId, financeCategories.id))
    .where(eq(financeExpenses.id, id))
    .limit(1);
  if (!row) return null;

  const [attachments, audit] = await Promise.all([
    db.select({ id: financeExpenseAttachments.id, fileName: financeExpenseAttachments.fileName, mimeType: financeExpenseAttachments.mimeType, byteSize: financeExpenseAttachments.byteSize, createdAt: financeExpenseAttachments.createdAt }).from(financeExpenseAttachments).where(eq(financeExpenseAttachments.expenseId, id)).orderBy(desc(financeExpenseAttachments.createdAt)),
    db.select({ id: financeAuditLog.id, action: financeAuditLog.action, previousData: financeAuditLog.previousData, newData: financeAuditLog.newData, changedBy: financeAuditLog.changedBy, changedByName: user.name, createdAt: financeAuditLog.createdAt }).from(financeAuditLog).leftJoin(user, eq(financeAuditLog.changedBy, user.id)).where(eq(financeAuditLog.expenseId, id)).orderBy(desc(financeAuditLog.createdAt)).limit(100),
  ]);

  const expense: FinanceExpenseDetail["expense"] = {
    id: row.id,
    title: row.title,
    description: row.description,
    amount: row.amount,
    currency: row.currency,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    expenseDate: row.expenseDate,
    expenseTime: row.expenseTime,
    paymentMethod: row.paymentMethod as FinancePaymentMethod,
    paidBy: row.paidBy,
    vendor: row.vendor,
    projectReference: row.projectReference,
    referenceNumber: row.referenceNumber,
    status: row.status as FinanceExpenseDetail["expense"]["status"],
    source: row.source as FinanceExpenseDetail["expense"]["source"],
    createdBy: row.createdBy,
    createdAt: asIso(row.createdAt),
    updatedBy: row.updatedBy,
    updatedAt: asIso(row.updatedAt),
    voidedBy: row.voidedBy,
    voidedAt: row.voidedAt ? asIso(row.voidedAt) : null,
  };
  return {
    expense,
    attachments: attachments.map((attachment): FinanceAttachmentMetadata => ({ ...attachment, createdAt: asIso(attachment.createdAt) })),
    audit: audit.map((entry): FinanceAuditEntry => ({ ...entry, action: entry.action as FinanceAuditEntry["action"], createdAt: asIso(entry.createdAt) })),
  };
}
