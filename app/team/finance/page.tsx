import type { Metadata } from "next";
import { getFinanceDashboard } from "@/lib/finance/data";
import FinanceDashboard from "@/components/finance/finance-dashboard";

export const metadata: Metadata = {
  title: "Finance & Expenses",
  description: "Private Owner-only company finance dashboard for GritGrid Technologies.",
  robots: { index: false, follow: false },
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  const data = await getFinanceDashboard({
    currency: firstValue(searchParams.currency),
    search: firstValue(searchParams.q),
    from: firstValue(searchParams.from),
    to: firstValue(searchParams.to),
    categoryId: firstValue(searchParams.category),
    paymentMethod: firstValue(searchParams.payment),
    status: firstValue(searchParams.status) as "active" | "void" | "all" | undefined,
  });
  return <FinanceDashboard data={data} />;
}
