import { compareMoneyStrings } from "./money";
import { FINANCE_PAYMENT_METHODS, type FinancePaymentMethod } from "./types";

export class FinanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FinanceValidationError";
  }
}

export type FinanceExpenseInput = {
  title: string;
  amount: string;
  currency: string;
  categoryId: string;
  expenseDate: string;
  expenseTime: string | null;
  paymentMethod: FinancePaymentMethod;
  paidBy: string;
  vendor: string;
  projectReference: string;
  description: string;
  referenceNumber: string | null;
};

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function boundedText(value: unknown, label: string, max: number, required = false) {
  const text = textValue(value);
  if (required && !text) throw new FinanceValidationError(`${label} is required.`);
  if (text.length > max) throw new FinanceValidationError(`${label} must be ${max} characters or fewer.`);
  return text;
}

export function isValidFinanceDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
}

export function normalizeFinanceAmount(value: unknown) {
  const raw = textValue(value);
  if (!/^\d{1,12}(?:\.\d{1,2})?$/.test(raw) || compareMoneyStrings(raw, "0") <= 0) {
    throw new FinanceValidationError("Enter a positive amount with up to 12 digits and 2 decimal places.");
  }
  const [wholeValue, fractionValue = ""] = raw.split(".");
  const whole = wholeValue.replace(/^0+(?=\d)/, "");
  return `${whole}.${fractionValue.padEnd(2, "0")}`;
}

export function normalizeFinanceCurrency(value: unknown) {
  const currency = textValue(value || "INR").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new FinanceValidationError("Use a three-letter currency code, such as INR.");
  return currency;
}

export function validateFinanceExpenseInput(input: Record<string, unknown>): FinanceExpenseInput {
  const title = boundedText(input.title, "Expense title", 160, true);
  if (title.length < 1) throw new FinanceValidationError("Expense title is required.");

  const amount = normalizeFinanceAmount(input.amount);
  const currency = normalizeFinanceCurrency(input.currency);
  const categoryId = boundedText(input.categoryId, "Category", 180, true);
  const expenseDate = textValue(input.expenseDate);
  if (!isValidFinanceDate(expenseDate)) throw new FinanceValidationError("Choose a valid expense date.");

  const timeValue = textValue(input.expenseTime);
  if (timeValue && !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?$/.test(timeValue)) {
    throw new FinanceValidationError("Choose a valid time.");
  }

  const paymentMethod = textValue(input.paymentMethod);
  if (!FINANCE_PAYMENT_METHODS.includes(paymentMethod as FinancePaymentMethod)) {
    throw new FinanceValidationError("Choose a valid payment method.");
  }

  const description = boundedText(input.description, "Description", 4000);
  const paidBy = boundedText(input.paidBy, "Paid by", 160);
  const vendor = boundedText(input.vendor, "Vendor or recipient", 160);
  const projectReference = boundedText(input.projectReference, "Project or department", 160);
  const referenceNumber = boundedText(input.referenceNumber, "Reference number", 120) || null;

  return {
    title,
    amount,
    currency,
    categoryId,
    expenseDate,
    expenseTime: timeValue || null,
    paymentMethod: paymentMethod as FinancePaymentMethod,
    paidBy,
    vendor,
    projectReference,
    description,
    referenceNumber,
  };
}

export function validateIdempotencyKey(value: unknown) {
  const key = textValue(value);
  if (!/^[A-Za-z0-9:_-]{1,180}$/.test(key)) throw new FinanceValidationError("Refresh the form and try again.");
  return key;
}

export function validateFinanceBudgetInput(input: Record<string, unknown>) {
  const name = boundedText(input.name, "Budget name", 120, true);
  const budgetType = textValue(input.budgetType);
  if (!(["company", "category", "project"] as const).includes(budgetType as "company" | "category" | "project")) {
    throw new FinanceValidationError("Choose a valid budget scope.");
  }
  const amount = normalizeFinanceAmount(input.amount);
  const currency = normalizeFinanceCurrency(input.currency);
  const periodStart = textValue(input.periodStart);
  const periodEnd = textValue(input.periodEnd);
  if (!isValidFinanceDate(periodStart) || !isValidFinanceDate(periodEnd) || periodStart > periodEnd) {
    throw new FinanceValidationError("Choose a valid budget period.");
  }
  const categoryId = boundedText(input.categoryId, "Category", 180);
  const projectReference = boundedText(input.projectReference, "Project", 160);
  if (budgetType === "category" && !categoryId) throw new FinanceValidationError("Choose a category for this budget.");
  if (budgetType === "project" && !projectReference) throw new FinanceValidationError("Enter a project or department.");
  return {
    name,
    budgetType: budgetType as "company" | "category" | "project",
    amount,
    currency,
    categoryId: budgetType === "category" ? categoryId : null,
    projectReference: budgetType === "project" ? projectReference : null,
    periodStart,
    periodEnd,
  };
}
