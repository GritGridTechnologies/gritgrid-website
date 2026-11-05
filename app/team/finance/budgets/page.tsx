import type { Metadata } from "next";
import FinanceBudgetManager from "@/components/finance/finance-budget-manager";
import { getFinanceBudgets, getFinanceCategories } from "@/lib/finance/data";
import { getIndiaDate } from "@/lib/finance/dates";

export const metadata: Metadata = { title: "Budget management", robots: { index: false, follow: false } };

export default async function FinanceBudgetsPage() {
  const [budgets, categories] = await Promise.all([getFinanceBudgets(), getFinanceCategories()]);
  return <FinanceBudgetManager budgets={budgets} categories={categories} today={getIndiaDate()} />;
}
