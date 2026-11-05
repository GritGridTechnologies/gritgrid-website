"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, ArrowLeft, Plus, Tags } from "lucide-react";
import { archiveFinanceCategory, createFinanceCategory } from "@/app/team/finance/actions";
import type { FinanceCategoryOption } from "@/lib/finance/types";

export default function FinanceCategoryManager({ categories }: { categories: FinanceCategoryOption[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const result = await createFinanceCategory(form);
    if (!result.ok) {
      setError(true);
      setMessage(result.error);
      setPending(false);
      return;
    }
    setError(false);
    setMessage("Custom category added.");
    event.currentTarget.reset();
    setPending(false);
    router.refresh();
  }

  async function archiveCategory(category: FinanceCategoryOption) {
    if (pending || !window.confirm(`Archive “${category.name}”? Existing transactions will keep this category in their history.`)) return;
    setPending(true);
    const result = await archiveFinanceCategory(category.id);
    if (!result.ok) {
      setError(true);
      setMessage(result.error);
      setPending(false);
      return;
    }
    setError(false);
    setMessage(`“${category.name}” archived. Historical expenses remain unchanged.`);
    setPending(false);
    router.refresh();
  }

  return (
    <main className="finance-main">
      <div className="finance-heading-row"><div className="finance-heading-copy"><p className="finance-eyebrow"><Tags aria-hidden="true" /> Ledger setup</p><h1>Expense <em>categories</em></h1><p>System categories cannot be removed. Custom categories can be archived without changing historical transactions.</p></div><Link className="finance-button finance-button-secondary" href="/team/finance"><ArrowLeft aria-hidden="true" /> Overview</Link></div>
      <div className="finance-page-grid">
        <section className="finance-panel" aria-labelledby="category-list-title"><div className="finance-panel-heading"><div><h2 id="category-list-title">Active categories</h2><p>{categories.length} available to new transactions</p></div></div><div className="finance-categories-list">{categories.map((category) => <article className="finance-category-item" key={category.id}><div><strong>{category.name}</strong><small>{category.description || (category.isSystem ? "GritGrid default category" : "Custom category")}</small></div>{category.isSystem ? <span className="finance-category-system">System</span> : <button className="finance-button finance-button-ghost" type="button" disabled={pending} onClick={() => void archiveCategory(category)} aria-label={`Archive ${category.name}`}><Archive aria-hidden="true" /> Archive</button>}</article>)}</div></section>
        <section className="finance-panel" aria-labelledby="create-category-title"><div className="finance-panel-heading"><div><h2 id="create-category-title">Add a category</h2><p>Custom categories are shared across Owner accounts.</p></div></div><form className="finance-form" onSubmit={createCategory}><div className="finance-form-grid"><div className="finance-field full"><label htmlFor="finance-category-name">Category name</label><input id="finance-category-name" name="name" maxLength={80} required placeholder="e.g. Recruiting" /></div><div className="finance-field full"><label htmlFor="finance-category-description">Description</label><textarea id="finance-category-description" name="description" maxLength={500} placeholder="Optional guidance for future entries" /></div></div><div className="finance-form-footer"><p className="finance-form-note">Names are unique regardless of letter case.</p><button className="finance-button finance-button-primary" type="submit" disabled={pending}><Plus aria-hidden="true" />{pending ? "Saving…" : "Add category"}</button></div></form>{message && <p className={`finance-message${error ? " error" : " success"}`} role={error ? "alert" : "status"}>{message}</p>}</section>
      </div>
    </main>
  );
}
