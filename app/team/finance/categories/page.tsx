import type { Metadata } from "next";
import FinanceCategoryManager from "@/components/finance/finance-category-manager";
import { getFinanceCategories } from "@/lib/finance/data";

export const metadata: Metadata = { title: "Expense categories", robots: { index: false, follow: false } };

export default async function FinanceCategoriesPage() {
  const categories = await getFinanceCategories();
  return <FinanceCategoryManager categories={categories} />;
}
