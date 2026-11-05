import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import FinanceNavigation from "@/components/finance/finance-navigation";
import { getFinanceAccess } from "@/lib/finance/access";
import "./finance.css";

export const metadata: Metadata = {
  title: { default: "Finance & Expenses", template: "%s | Owner Finance" },
  robots: { index: false, follow: false },
};

export default async function FinanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const access = await getFinanceAccess();
  if (access.kind === "anonymous") redirect("/team/sign-in?next=/team/finance");
  if (access.kind === "password-change") redirect("/change-password");
  if (access.kind !== "owner") notFound();

  return <div className="finance-shell"><FinanceNavigation /><div className="finance-content">{children}</div></div>;
}
