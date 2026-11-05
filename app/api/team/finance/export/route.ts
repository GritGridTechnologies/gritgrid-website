import { and, desc, eq, gte, ilike, lte, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financeCategories, financeExpenses } from "@/lib/db/schema";
import { getFinanceAccess } from "@/lib/finance/access";
import { financeAccessStatus } from "@/lib/finance/http";
import { getIndiaDate } from "@/lib/finance/dates";
import { isValidFinanceDate } from "@/lib/finance/validation";

export const runtime = "nodejs";
const MAX_EXPORT_ROWS = 10_000;

function csvCell(value: unknown, formulaSafe = true) {
  let text = String(value ?? "").replace(/[\r\n]+/g, " ");
  if (formulaSafe && /^[\u0000-\u0020]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function unauthorized(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(request: Request) {
  const access = await getFinanceAccess();
  if (access.kind !== "owner") return unauthorized(financeAccessStatus(access.kind), "Owner access is required to export finance records.");
  const params = new URL(request.url).searchParams;
  const requestedCurrency = (params.get("currency") ?? "INR").toUpperCase();
  const currency = /^[A-Z]{3}$/.test(requestedCurrency) ? requestedCurrency : "INR";
  const status = params.get("status");
  const search = (params.get("q") ?? "").trim().slice(0, 120);
  const fromValue = params.get("from") ?? "";
  const toValue = params.get("to") ?? "";
  const from = isValidFinanceDate(fromValue) ? fromValue : "";
  const to = isValidFinanceDate(toValue) ? toValue : "";
  const categoryId = (params.get("category") ?? "").slice(0, 180);
  const paymentMethod = params.get("payment") ?? "";
  const conditions = [eq(financeExpenses.currency, currency)];
  if (status !== "all") conditions.push(eq(financeExpenses.status, status === "void" ? "void" : "active"));
  if (from && to && from <= to) {
    conditions.push(gte(financeExpenses.expenseDate, from));
    conditions.push(lte(financeExpenses.expenseDate, to));
  } else if (from) conditions.push(gte(financeExpenses.expenseDate, from));
  else if (to) conditions.push(lte(financeExpenses.expenseDate, to));
  if (categoryId) conditions.push(eq(financeExpenses.categoryId, categoryId));
  if (paymentMethod) conditions.push(eq(financeExpenses.paymentMethod, paymentMethod));
  if (search) {
    const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
    conditions.push(or(ilike(financeExpenses.title, pattern), ilike(financeExpenses.vendor, pattern), ilike(financeExpenses.description, pattern), ilike(financeExpenses.projectReference, pattern))!);
  }

  const rows = await db.select({
    title: financeExpenses.title,
    amount: financeExpenses.amount,
    currency: financeExpenses.currency,
    category: financeCategories.name,
    date: financeExpenses.expenseDate,
    time: financeExpenses.expenseTime,
    payment: financeExpenses.paymentMethod,
    paidBy: financeExpenses.paidBy,
    vendor: financeExpenses.vendor,
    project: financeExpenses.projectReference,
    description: financeExpenses.description,
    reference: financeExpenses.referenceNumber,
    status: financeExpenses.status,
    source: financeExpenses.source,
    createdBy: financeExpenses.createdBy,
  }).from(financeExpenses).innerJoin(financeCategories, eq(financeExpenses.categoryId, financeCategories.id))
    .where(and(...conditions)).orderBy(desc(financeExpenses.expenseDate), desc(financeExpenses.createdAt)).limit(MAX_EXPORT_ROWS);

  const header = ["Title", "Amount", "Currency", "Category", "Expense date", "Expense time", "Payment method", "Paid by", "Vendor", "Project or department", "Description", "Reference number", "Status", "Source", "Created by"];
  const lines = [header.map((cell) => csvCell(cell)).join(","), ...rows.map((row) => [
    csvCell(row.title),
    csvCell(row.amount, false),
    csvCell(row.currency),
    csvCell(row.category),
    csvCell(row.date, false),
    csvCell(row.time, false),
    csvCell(row.payment),
    csvCell(row.paidBy),
    csvCell(row.vendor),
    csvCell(row.project),
    csvCell(row.description),
    csvCell(row.reference),
    csvCell(row.status),
    csvCell(row.source),
    csvCell(row.createdBy),
  ].join(","))];
  if (rows.length === MAX_EXPORT_ROWS) lines.push(csvCell(`Export limited to ${MAX_EXPORT_ROWS} rows; apply narrower filters for additional records.`));
  const filenameDate = getIndiaDate();
  return new Response(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="gritgrid-expenses-${filenameDate}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
