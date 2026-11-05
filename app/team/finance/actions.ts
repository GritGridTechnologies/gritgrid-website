"use server";

import { randomUUID } from "node:crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { financeAiDrafts, financeAuditLog, financeBudgets, financeCategories, financeExpenses } from "@/lib/db/schema";
import { requireFinanceOwner } from "@/lib/finance/access";
import { addMoneyStrings } from "@/lib/finance/money";
import { FinanceValidationError, validateFinanceBudgetInput, validateFinanceExpenseInput, validateIdempotencyKey, type FinanceExpenseInput } from "@/lib/finance/validation";
import type { FinanceActionResult, FinanceAiDraftItem, FinanceAiDraftPayload } from "@/lib/finance/types";

type FinanceTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

type ExpenseRecord = typeof financeExpenses.$inferSelect;

function formValues(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, String(formData.get(key) ?? "")]));
}

function expenseSnapshot(expense: Partial<ExpenseRecord>) {
  return {
    title: expense.title,
    description: expense.description,
    amount: expense.amount,
    currency: expense.currency,
    categoryId: expense.categoryId,
    expenseDate: expense.expenseDate,
    expenseTime: expense.expenseTime,
    paymentMethod: expense.paymentMethod,
    paidBy: expense.paidBy,
    vendor: expense.vendor,
    projectReference: expense.projectReference,
    referenceNumber: expense.referenceNumber,
    status: expense.status,
    source: expense.source,
  };
}

async function appendAudit(
  tx: FinanceTransaction,
  expenseId: string,
  action: "created" | "updated" | "voided",
  changedBy: string,
  previous: Partial<ExpenseRecord> | null,
  next: Partial<ExpenseRecord>,
) {
  await tx.insert(financeAuditLog).values({
    id: randomUUID(),
    expenseId,
    action,
    previousData: previous ? expenseSnapshot(previous) : null,
    newData: expenseSnapshot(next),
    changedBy,
  });
}

function validationResult<T>(error: unknown, fallback: string): FinanceActionResult<T> {
  if (error instanceof FinanceValidationError) return { ok: false, error: error.message };
  return { ok: false, error: fallback };
}

function expenseInputFromForm(formData: FormData): FinanceExpenseInput {
  return validateFinanceExpenseInput(formValues(formData, [
    "title", "amount", "currency", "categoryId", "expenseDate", "expenseTime", "paymentMethod",
    "paidBy", "vendor", "projectReference", "description", "referenceNumber",
  ]));
}

function isSameExpense(existing: ExpenseRecord, input: FinanceExpenseInput) {
  return existing.title === input.title && existing.amount === input.amount && existing.currency === input.currency &&
    existing.categoryId === input.categoryId && existing.expenseDate === input.expenseDate && existing.expenseTime === input.expenseTime &&
    existing.paymentMethod === input.paymentMethod && existing.paidBy === input.paidBy && existing.vendor === input.vendor &&
    existing.projectReference === input.projectReference && existing.description === input.description && existing.referenceNumber === input.referenceNumber;
}

export async function createExpense(formData: FormData): Promise<FinanceActionResult<{ expenseId: string }>> {
  const owner = await requireFinanceOwner();
  try {
    const input = expenseInputFromForm(formData);
    const idempotencyKey = validateIdempotencyKey(formData.get("idempotencyKey"));
    const expenseId = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(financeExpenses).where(eq(financeExpenses.idempotencyKey, idempotencyKey)).limit(1);
      if (existing) {
        if (!isSameExpense(existing, input)) throw new FinanceValidationError("This submission key was already used for different expense details. Refresh the form before trying again.");
        return existing.id;
      }

      const [category] = await tx.select({ id: financeCategories.id }).from(financeCategories)
        .where(and(eq(financeCategories.id, input.categoryId), isNull(financeCategories.archivedAt))).limit(1);
      if (!category) throw new FinanceValidationError("Choose an active expense category.");

      const id = randomUUID();
      const values = { ...input, id, source: "manual", idempotencyKey, createdBy: owner.id };
      const [created] = await tx.insert(financeExpenses).values(values).onConflictDoNothing({ target: financeExpenses.idempotencyKey }).returning();
      if (!created) {
        const [concurrent] = await tx.select().from(financeExpenses).where(eq(financeExpenses.idempotencyKey, idempotencyKey)).limit(1);
        if (concurrent && isSameExpense(concurrent, input)) return concurrent.id;
        throw new FinanceValidationError("This expense was already submitted. Refresh the page and check the transaction list.");
      }
      await appendAudit(tx, id, "created", owner.id, null, created);
      return id;
    });

    revalidateFinancePaths();
    return { ok: true, data: { expenseId } };
  } catch (error) {
    return validationResult(error, "Unable to save the expense. No changes were applied.");
  }
}

export async function updateExpense(formData: FormData): Promise<FinanceActionResult<{ expenseId: string }>> {
  const owner = await requireFinanceOwner();
  try {
    const id = String(formData.get("id") ?? "").trim();
    if (!/^[A-Za-z0-9:_-]{1,180}$/.test(id)) throw new FinanceValidationError("Expense not found.");
    const input = expenseInputFromForm(formData);
    const expenseId = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(financeExpenses).where(and(eq(financeExpenses.id, id), eq(financeExpenses.status, "active"))).limit(1).for("update");
      if (!existing) throw new FinanceValidationError("This expense is no longer active. Reload the page before editing.");
      const [category] = await tx.select({ id: financeCategories.id }).from(financeCategories)
        .where(and(eq(financeCategories.id, input.categoryId), isNull(financeCategories.archivedAt))).limit(1);
      if (!category) throw new FinanceValidationError("Choose an active expense category.");

      const [updated] = await tx.update(financeExpenses).set({
        ...input,
        updatedBy: owner.id,
        updatedAt: new Date(),
      }).where(and(eq(financeExpenses.id, id), eq(financeExpenses.status, "active"))).returning();
      if (!updated) throw new FinanceValidationError("This expense changed while you were editing it. Reload and try again.");
      await appendAudit(tx, id, "updated", owner.id, existing, updated);
      return updated.id;
    });

    revalidateFinancePaths();
    return { ok: true, data: { expenseId } };
  } catch (error) {
    return validationResult(error, "Unable to update the expense. No changes were applied.");
  }
}

export async function voidExpense(id: string): Promise<FinanceActionResult> {
  const owner = await requireFinanceOwner();
  try {
    if (!/^[A-Za-z0-9:_-]{1,180}$/.test(id)) throw new FinanceValidationError("Expense not found.");
    await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(financeExpenses).where(and(eq(financeExpenses.id, id), eq(financeExpenses.status, "active"))).limit(1).for("update");
      if (!existing) throw new FinanceValidationError("This expense is already voided or no longer exists.");
      const voidedAt = new Date();
      const [updated] = await tx.update(financeExpenses).set({ status: "void", voidedBy: owner.id, voidedAt, updatedBy: owner.id, updatedAt: voidedAt })
        .where(and(eq(financeExpenses.id, id), eq(financeExpenses.status, "active"))).returning();
      if (!updated) throw new FinanceValidationError("This expense changed before it could be voided. Reload and try again.");
      await appendAudit(tx, id, "voided", owner.id, existing, updated);
    });
    revalidateFinancePaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return validationResult(error, "Unable to void the expense. No changes were applied.");
  }
}

export async function createFinanceCategory(formData: FormData): Promise<FinanceActionResult<{ categoryId: string }>> {
  const owner = await requireFinanceOwner();
  try {
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!name || name.length > 80) throw new FinanceValidationError("Category name must be between 1 and 80 characters.");
    if (description.length > 500) throw new FinanceValidationError("Category description must be 500 characters or fewer.");
    const id = `finance-cat-${randomUUID()}`;
    const [created] = await db.transaction((tx) => tx.insert(financeCategories).values({ id, name, description, isSystem: false, createdBy: owner.id }).onConflictDoNothing().returning({ id: financeCategories.id }));
    if (!created) throw new FinanceValidationError("A category with that name already exists.");
    revalidateFinancePaths();
    return { ok: true, data: { categoryId: created.id } };
  } catch (error) {
    return validationResult(error, "Unable to create the category.");
  }
}

export async function archiveFinanceCategory(id: string): Promise<FinanceActionResult> {
  await requireFinanceOwner();
  try {
    const [archived] = await db.update(financeCategories).set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(financeCategories.id, id), eq(financeCategories.isSystem, false), isNull(financeCategories.archivedAt))).returning({ id: financeCategories.id });
    if (!archived) throw new FinanceValidationError("This category cannot be archived.");
    revalidateFinancePaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return validationResult(error, "Unable to archive the category.");
  }
}

export async function createFinanceBudget(formData: FormData): Promise<FinanceActionResult<{ budgetId: string }>> {
  const owner = await requireFinanceOwner();
  try {
    const input = validateFinanceBudgetInput(formValues(formData, ["name", "budgetType", "amount", "currency", "categoryId", "projectReference", "periodStart", "periodEnd"]));
    const budgetId = await db.transaction(async (tx) => {
      if (input.categoryId) {
        const [category] = await tx.select({ id: financeCategories.id }).from(financeCategories)
          .where(and(eq(financeCategories.id, input.categoryId), isNull(financeCategories.archivedAt))).limit(1);
        if (!category) throw new FinanceValidationError("Choose an active category.");
      }
      const id = randomUUID();
      const [created] = await tx.insert(financeBudgets).values({ id, ...input, createdBy: owner.id }).onConflictDoNothing().returning({ id: financeBudgets.id });
      if (!created) throw new FinanceValidationError("An active budget already exists for this scope and period. Deactivate it before creating another.");
      return created.id;
    });
    revalidateFinancePaths();
    return { ok: true, data: { budgetId } };
  } catch (error) {
    return validationResult(error, "Unable to create the budget.");
  }
}

export async function deactivateFinanceBudget(id: string): Promise<FinanceActionResult> {
  const owner = await requireFinanceOwner();
  try {
    const [updated] = await db.update(financeBudgets).set({ isActive: false, updatedBy: owner.id, updatedAt: new Date() })
      .where(and(eq(financeBudgets.id, id), eq(financeBudgets.isActive, true))).returning({ id: financeBudgets.id });
    if (!updated) throw new FinanceValidationError("This budget is already inactive.");
    revalidateFinancePaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return validationResult(error, "Unable to deactivate the budget.");
  }
}

function normalizeAiDraftItems(value: unknown): FinanceAiDraftItem[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) throw new FinanceValidationError("The preview must contain between 1 and 10 expenses.");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object") throw new FinanceValidationError("Review each expense in the preview.");
    const item = entry as Record<string, unknown>;
    const validated = validateFinanceExpenseInput({
      title: item.title,
      amount: item.amount,
      currency: item.currency,
      categoryId: item.categoryId,
      expenseDate: item.expenseDate,
      expenseTime: item.expenseTime,
      paymentMethod: item.paymentMethod,
      paidBy: item.paidBy,
      vendor: item.vendor,
      projectReference: item.projectReference,
      description: item.description,
      referenceNumber: item.referenceNumber,
    });
    return {
      ...validated,
      categoryName: typeof item.categoryName === "string" ? item.categoryName.trim().slice(0, 80) : null,
      dateAssumed: item.dateAssumed === true,
      currencyAssumed: item.currencyAssumed === true,
    };
  });
}

export async function confirmFinanceAiDraft(draftId: string, submittedItems: unknown): Promise<FinanceActionResult<{ createdCount: number; alreadyConfirmed: boolean; totals: { currency: string; amount: string }[] }>> {
  const owner = await requireFinanceOwner();
  try {
    if (!/^[A-Za-z0-9:_-]{1,180}$/.test(draftId)) throw new FinanceValidationError("Expense draft not found.");
    const outcome = await db.transaction(async (tx) => {
      const [draft] = await tx.select().from(financeAiDrafts).where(and(eq(financeAiDrafts.id, draftId), eq(financeAiDrafts.ownerId, owner.id))).limit(1).for("update");
      if (!draft) throw new FinanceValidationError("Expense draft not found.");
      const originalPayload = draft.draftPayload as FinanceAiDraftPayload;
      if (draft.status === "confirmed") {
        const items = Array.isArray(originalPayload?.items) ? originalPayload.items : [];
        const totals = Object.entries(items.reduce<Record<string, string[]>>((groups, item) => {
          (groups[item.currency] ??= []).push(item.amount);
          return groups;
        }, {})).map(([currency, amounts]) => ({ currency, amount: addMoneyStrings(amounts) }));
        return { createdCount: items.length, alreadyConfirmed: true, totals };
      }
      if (draft.status !== "pending") throw new FinanceValidationError("This draft is no longer available. Create a new preview.");
      if (draft.expiresAt.getTime() <= Date.now()) throw new FinanceValidationError("This preview expired. Submit the message again to create a fresh draft.");

      const items = normalizeAiDraftItems(submittedItems);
      if (!Array.isArray(originalPayload?.items) || items.length !== originalPayload.items.length) {
        throw new FinanceValidationError("The preview changed unexpectedly. Create a new draft before confirming.");
      }
      const categoryIds = Array.from(new Set(items.map((item) => item.categoryId).filter((id): id is string => typeof id === "string")));
      if (categoryIds.length !== items.length) throw new FinanceValidationError("Choose an active category for every expense.");
      const categories = await tx.select({ id: financeCategories.id, name: financeCategories.name }).from(financeCategories)
        .where(and(inArray(financeCategories.id, categoryIds), isNull(financeCategories.archivedAt)));
      const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
      if (categoryNames.size !== categoryIds.length) throw new FinanceValidationError("Choose an active category for every expense.");

      const normalizedItems = items.map((item) => ({ ...item, categoryName: categoryNames.get(item.categoryId ?? "") ?? item.categoryName }));
      const totals = Object.entries(normalizedItems.reduce<Record<string, string[]>>((groups, item) => {
        (groups[item.currency] ??= []).push(item.amount);
        return groups;
      }, {})).map(([currency, amounts]) => ({ currency, amount: addMoneyStrings(amounts) }));

      let createdCount = 0;
      for (let index = 0; index < normalizedItems.length; index += 1) {
        const item = normalizedItems[index];
        const idempotencyKey = `finance-ai:${draftId}:${index}`;
        const [existing] = await tx.select().from(financeExpenses).where(eq(financeExpenses.idempotencyKey, idempotencyKey)).limit(1);
        if (existing) continue;
        const id = randomUUID();
        const [created] = await tx.insert(financeExpenses).values({
          id,
          title: item.title,
          amount: item.amount,
          currency: item.currency,
          categoryId: item.categoryId as string,
          expenseDate: item.expenseDate,
          expenseTime: item.expenseTime,
          paymentMethod: item.paymentMethod as string,
          paidBy: item.paidBy,
          vendor: item.vendor,
          projectReference: item.projectReference,
          description: item.description,
          referenceNumber: item.referenceNumber,
          source: "assistant",
          idempotencyKey,
          createdBy: owner.id,
        }).onConflictDoNothing({ target: financeExpenses.idempotencyKey }).returning();
        if (created) {
          createdCount += 1;
          await appendAudit(tx, id, "created", owner.id, null, created);
        }
      }

      const payload: FinanceAiDraftPayload = { ...originalPayload, items: normalizedItems };
      await tx.update(financeAiDrafts).set({ status: "confirmed", confirmedAt: new Date(), draftPayload: payload })
        .where(and(eq(financeAiDrafts.id, draftId), eq(financeAiDrafts.ownerId, owner.id), eq(financeAiDrafts.status, "pending")));
      return { createdCount, alreadyConfirmed: createdCount === 0, totals };
    });
    revalidateFinancePaths();
    return { ok: true, data: outcome };
  } catch (error) {
    return validationResult(error, "Unable to confirm the preview. No transactions were added.");
  }
}

export async function cancelFinanceAiDraft(draftId: string): Promise<FinanceActionResult> {
  const owner = await requireFinanceOwner();
  try {
    const [cancelled] = await db.update(financeAiDrafts).set({ status: "cancelled" })
      .where(and(eq(financeAiDrafts.id, draftId), eq(financeAiDrafts.ownerId, owner.id), eq(financeAiDrafts.status, "pending"))).returning({ id: financeAiDrafts.id });
    if (!cancelled) throw new FinanceValidationError("This draft is no longer available.");
    return { ok: true, data: undefined };
  } catch (error) {
    return validationResult(error, "Unable to cancel the preview.");
  }
}

function revalidateFinancePaths() {
  revalidatePath("/team/finance");
  revalidatePath("/team/finance/reports");
  revalidatePath("/team/finance/budgets");
  revalidatePath("/team/finance/categories");
}
