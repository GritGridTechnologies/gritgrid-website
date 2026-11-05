import type { Metadata } from "next";
import FinanceReports from "@/components/finance/finance-reports";
import { getFinanceReport } from "@/lib/finance/data";

export const metadata: Metadata = { title: "Finance reports", robots: { index: false, follow: false } };

type SearchParams = Record<string, string | string[] | undefined>;
function firstValue(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function FinanceReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const report = await getFinanceReport({
    period: firstValue(searchParams.period),
    currency: firstValue(searchParams.currency),
    from: firstValue(searchParams.from),
    to: firstValue(searchParams.to),
  });
  return <FinanceReports report={report} />;
}
