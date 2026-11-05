import type { Metadata } from "next";
import FinanceExpenseForm from "@/components/finance/finance-expense-form";
import { getFinanceCategories } from "@/lib/finance/data";
import { getIndiaDate } from "@/lib/finance/dates";

export const metadata: Metadata = { title: "Add expense", robots: { index: false, follow: false } };

export default async function NewFinanceExpensePage() {
  const categories = await getFinanceCategories();
  return <FinanceExpenseForm mode="create" categories={categories} today={getIndiaDate()} />;
}
