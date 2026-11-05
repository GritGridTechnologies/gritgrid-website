"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BarChart3, Landmark, Layers3, Receipt, Tags } from "lucide-react";

const sections = [
  { href: "/team/finance", label: "Overview", icon: Landmark },
  { href: "/team/finance/reports", label: "Reports", icon: BarChart3 },
  { href: "/team/finance/budgets", label: "Budgets", icon: Layers3 },
  { href: "/team/finance/categories", label: "Categories", icon: Tags },
];

export default function FinanceNavigation() {
  const pathname = usePathname();
  const active = sections.find((section) => section.href === pathname)?.href ?? (pathname.startsWith("/team/finance/expenses") ? "/team/finance" : "");
  return (
    <header className="finance-topbar">
      <div className="finance-topbar-inner">
        <Link className="finance-back-link" href="/team"><ArrowLeft aria-hidden="true" /><span>Team Portal</span></Link>
        <Link className="finance-brand" href="/team/finance"><span className="finance-brand-mark"><Receipt aria-hidden="true" /></span><span><strong>GritGrid</strong><small>Owner Finance</small></span></Link>
        <nav className="finance-nav" aria-label="Finance sections">
          {sections.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={active === href ? "active" : undefined} aria-current={active === href ? "page" : undefined}>
              <Icon aria-hidden="true" /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <span className="finance-owner-pill">Owner access</span>
      </div>
    </header>
  );
}
