"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArrowLeft, Layers3, Plus } from "lucide-react";
import { createFinanceBudget, deactivateFinanceBudget } from "@/app/team/finance/actions";
import { financeMonthDays, formatFinanceDate } from "@/lib/finance/dates";
import { formatMoney } from "@/lib/finance/money";
import type { FinanceBudgetUsage, FinanceCategoryOption } from "@/lib/finance/types";

function scopeLabel(budget: FinanceBudgetUsage) {
  if (budget.budgetType === "company") return "Company";
  if (budget.budgetType === "category") return budget.categoryName ?? "Category";
  return budget.projectReference ?? "Project";
}

export default function FinanceBudgetManager({ budgets, categories, today }: { budgets: FinanceBudgetUsage[]; categories: FinanceCategoryOption[]; today: string }) {
  const router = useRouter();
  const [budgetType, setBudgetType] = useState<"company" | "category" | "project">("company");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const month = today.slice(0, 7);
  const periodStart = `${month}-01`;
  const periodEnd = `${month}-${String(financeMonthDays(month)).padStart(2, "0")}`;

  async function createBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage("");
    const result = await createFinanceBudget(new FormData(event.currentTarget));
    if (!result.ok) {
      setError(true);
      setMessage(result.error);
      setPending(false);
      return;
    }
    setError(false);
    setMessage("Budget created. Expense entries remain available even if the budget is exceeded.");
    event.currentTarget.reset();
    setBudgetType("company");
    setPending(false);
    router.refresh();
  }

  async function deactivateBudget(budget: FinanceBudgetUsage) {
    if (pending || !window.confirm(`Deactivate “${budget.name}”? The budget record will be preserved.`)) return;
    setPending(true);
    const result = await deactivateFinanceBudget(budget.id);
    if (!result.ok) {
      setError(true);
      setMessage(result.error);
      setPending(false);
      return;
    }
    setError(false);
    setMessage("Budget deactivated; its history is retained.");
    setPending(false);
    router.refresh();
  }

  return (
    <main className="finance-main">
      <div className="finance-heading-row"><div className="finance-heading-copy"><p className="finance-eyebrow"><Layers3 aria-hidden="true" /> Spend planning</p><h1>Budget <em>management</em></h1><p>Track allocated funds against real active expenses. Warnings inform planning but never block a legitimate transaction.</p></div><Link className="finance-button finance-button-secondary" href="/team/finance"><ArrowLeft aria-hidden="true" /> Overview</Link></div>
      {message && <p className={`finance-message${error ? " error" : " success"}`} role={error ? "alert" : "status"}>{message}</p>}
      <div className="finance-page-grid">
        <section className="finance-panel" aria-labelledby="budget-list-title"><div className="finance-panel-heading"><div><h2 id="budget-list-title">Active budgets</h2><p>{budgets.length} active budget{budgets.length === 1 ? "" : "s"}</p></div></div>{budgets.length ? <div className="finance-budget-grid">{budgets.map((budget) => {
          const warning = budget.percentUsed >= 80;
          return <article className="finance-budget-card" key={budget.id}><div className="finance-budget-heading"><div><h3>{budget.name}</h3><p>{scopeLabel(budget)} · {budget.currency}</p></div><button className="finance-button finance-button-ghost" type="button" onClick={() => void deactivateBudget(budget)} disabled={pending} aria-label={`Deactivate ${budget.name}`}><Archive aria-hidden="true" /></button></div><div className="finance-budget-amounts"><div><span>Allocated</span><strong>{formatMoney(budget.amount, budget.currency)}</strong></div><div><span>Actual</span><strong>{formatMoney(budget.actual, budget.currency)}</strong></div><div><span>Remaining</span><strong>{formatMoney(budget.remaining, budget.currency)}</strong></div></div><div className="finance-budget-progress" role="progressbar" aria-label={`${budget.name} budget used`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(budget.percentUsed))}><span className={warning ? "warning" : ""} style={{ width: `${Math.min(100, Math.max(0, budget.percentUsed))}%` }} /></div><div className="finance-budget-caption"><span>{formatFinanceDate(budget.periodStart)} – {formatFinanceDate(budget.periodEnd)}</span><strong>{budget.percentUsed.toFixed(0)}% used · {budget.percentUsed >= 100 ? "Exceeded" : warning ? "Approaching" : "On track"}</strong></div></article>;
        })}</div> : <div className="finance-empty-state"><strong>No budgets yet</strong>Create a company, category, or project budget to start tracking planned spend.</div>}</section>

        <section className="finance-panel" aria-labelledby="create-budget-title"><div className="finance-panel-heading"><div><h2 id="create-budget-title">Create budget</h2><p>One active budget per scope and period.</p></div></div><form className="finance-form" onSubmit={createBudget}><div className="finance-form-grid"><div className="finance-field full"><label htmlFor="finance-budget-name">Budget name</label><input id="finance-budget-name" name="name" required maxLength={120} placeholder="e.g. November operating budget" /></div><div className="finance-field"><label htmlFor="finance-budget-type">Scope</label><select id="finance-budget-type" name="budgetType" value={budgetType} onChange={(event) => setBudgetType(event.target.value as typeof budgetType)}><option value="company">Company</option><option value="category">Category</option><option value="project">Project</option></select></div><div className="finance-field"><label htmlFor="finance-budget-amount">Amount</label><input id="finance-budget-amount" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" /></div><div className="finance-field"><label htmlFor="finance-budget-currency">Currency</label><input id="finance-budget-currency" name="currency" required maxLength={3} minLength={3} pattern="[A-Za-z]{3}" defaultValue="INR" /></div>{budgetType === "category" && <div className="finance-field"><label htmlFor="finance-budget-category">Category</label><select id="finance-budget-category" name="categoryId" required defaultValue=""><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>}{budgetType === "project" && <div className="finance-field"><label htmlFor="finance-budget-project">Project or department</label><input id="finance-budget-project" name="projectReference" required maxLength={160} /></div>}<div className="finance-field"><label htmlFor="finance-budget-start">Period starts</label><input id="finance-budget-start" name="periodStart" type="date" required defaultValue={periodStart} /></div><div className="finance-field"><label htmlFor="finance-budget-end">Period ends</label><input id="finance-budget-end" name="periodEnd" type="date" required defaultValue={periodEnd} /></div></div><div className="finance-form-footer"><p className="finance-form-note">Default period: current calendar month. Budgets do not block entries.</p><button className="finance-button finance-button-primary" type="submit" disabled={pending}><Plus aria-hidden="true" />{pending ? "Saving…" : "Create budget"}</button></div></form></section>
      </div>
    </main>
  );
}
