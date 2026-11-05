import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FinanceExpenseDetail from "@/components/finance/finance-expense-detail";
import { getFinanceExpenseDetail } from "@/lib/finance/data";

export const metadata: Metadata = { title: "Expense details", robots: { index: false, follow: false } };

export default async function FinanceExpenseDetailPage({ params }: { params: { id: string } }) {
  const detail = await getFinanceExpenseDetail(params.id);
  if (!detail) notFound();
  return <FinanceExpenseDetail detail={detail} />;
}
