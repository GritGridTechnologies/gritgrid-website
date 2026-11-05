import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FinanceExpenseForm from "@/components/finance/finance-expense-form";
import { getFinanceCategories, getFinanceExpenseDetail } from "@/lib/finance/data";

export const metadata: Metadata = { title: "Edit expense", robots: { index: false, follow: false } };

export default async function EditFinanceExpensePage({ params }: { params: { id: string } }) {
  const [detail, categories] = await Promise.all([getFinanceExpenseDetail(params.id), getFinanceCategories()]);
  if (!detail || detail.expense.status !== "active") notFound();
  return <FinanceExpenseForm mode="edit" categories={categories} initial={detail.expense} />;
}
