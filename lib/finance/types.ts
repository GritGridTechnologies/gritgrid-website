export const FINANCE_PAYMENT_METHODS = ["cash", "upi", "bank_transfer", "debit_card", "credit_card", "other"] as const;

export const FINANCE_PAYMENT_LABELS: Record<(typeof FINANCE_PAYMENT_METHODS)[number], string> = {
  cash: "Cash",
  upi: "UPI",
  bank_transfer: "Bank transfer",
  debit_card: "Debit card",
  credit_card: "Credit card",
  other: "Other",
};

export type FinancePaymentMethod = (typeof FINANCE_PAYMENT_METHODS)[number];
export type FinanceExpenseStatus = "active" | "void";
export type FinanceBudgetType = "company" | "category" | "project";
export type FinanceReportPeriod = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export type FinanceCategoryOption = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
};

export type FinanceFilters = {
  currency: string;
  search: string;
  from: string;
  to: string;
  categoryId: string;
  paymentMethod: string;
  status: "active" | "void" | "all";
};

export type FinanceExpenseRow = {
  id: string;
  title: string;
  amount: string;
  currency: string;
  categoryId: string;
  categoryName: string;
  expenseDate: string;
  expenseTime: string | null;
  paymentMethod: FinancePaymentMethod;
  vendor: string;
  projectReference: string;
  status: FinanceExpenseStatus;
  createdAt: string;
};

export type FinanceChartPoint = {
  label: string;
  key: string;
  amount: number;
  exactAmount: string;
};

export type FinanceDashboardData = {
  today: string;
  currency: string;
  availableCurrencies: string[];
  stats: {
    today: string;
    yesterday: string;
    week: string;
    month: string;
    year: string;
    total: string;
    averageDaily: string;
    transactions: number;
    highestCategory: { name: string; amount: string } | null;
  };
  charts: {
    daily: FinanceChartPoint[];
    monthly: FinanceChartPoint[];
    categories: FinanceChartPoint[];
    yearly: FinanceChartPoint[];
    topCategories: FinanceChartPoint[];
  };
  expenses: FinanceExpenseRow[];
  categories: FinanceCategoryOption[];
  filters: FinanceFilters;
};

export type FinanceBudgetUsage = {
  id: string;
  name: string;
  budgetType: FinanceBudgetType;
  amount: string;
  currency: string;
  categoryId: string | null;
  categoryName: string | null;
  projectReference: string | null;
  periodStart: string;
  periodEnd: string;
  actual: string;
  remaining: string;
  percentUsed: number;
};

export type FinanceReportData = {
  currency: string;
  period: FinanceReportPeriod;
  startDate: string;
  endDate: string;
  total: string;
  averageDaily: string;
  transactions: number;
  highestDay: { date: string; amount: string } | null;
  daily: FinanceChartPoint[];
  categories: { id: string; name: string; amount: string; count: number }[];
  paymentMethods: { method: FinancePaymentMethod; amount: string; count: number }[];
  topExpenses: FinanceExpenseRow[];
};

export type FinanceAiDraftItem = {
  title: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  categoryName: string | null;
  expenseDate: string;
  dateAssumed: boolean;
  currencyAssumed: boolean;
  expenseTime: string | null;
  paymentMethod: FinancePaymentMethod | null;
  paidBy: string;
  vendor: string;
  projectReference: string;
  description: string;
  referenceNumber: string | null;
};

export type FinanceAiDraftPayload = {
  originalMessage: string;
  items: FinanceAiDraftItem[];
};

export type FinanceAttachmentMetadata = {
  id: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  createdAt: string;
};

export type FinanceAuditEntry = {
  id: string;
  action: "created" | "updated" | "voided";
  previousData: unknown;
  newData: unknown;
  changedBy: string;
  changedByName: string | null;
  createdAt: string;
};

export type FinanceExpenseDetail = {
  expense: FinanceExpenseRow & {
    description: string;
    paidBy: string;
    referenceNumber: string | null;
    createdBy: string;
    updatedBy: string | null;
    updatedAt: string;
    voidedBy: string | null;
    voidedAt: string | null;
    source: "manual" | "assistant";
  };
  attachments: FinanceAttachmentMetadata[];
  audit: FinanceAuditEntry[];
};

export type FinanceActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };
