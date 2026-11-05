"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowLeft, FileUp, Pencil, ShieldCheck, XCircle } from "lucide-react";
import { voidExpense } from "@/app/team/finance/actions";
import { formatFinanceDate } from "@/lib/finance/dates";
import { formatMoney } from "@/lib/finance/money";
import { FINANCE_PAYMENT_LABELS, type FinanceExpenseDetail as FinanceExpenseDetailData } from "@/lib/finance/types";

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2) ?? "No snapshot available.";
}

export default function FinanceExpenseDetail({ detail }: { detail: FinanceExpenseDetailData }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const expense = detail.expense;

  async function handleVoid() {
    if (pending || !window.confirm(`Void “${expense.title}”? The expense will stay in the audit history and be excluded from future totals.`)) return;
    setPending(true);
    const result = await voidExpense(expense.id);
    if (!result.ok) {
      setError(true);
      setMessage(result.error);
      setPending(false);
      return;
    }
    setError(false);
    setMessage("Expense voided. The historical record and audit trail are preserved.");
    setPending(false);
    router.refresh();
  }

  async function uploadAttachment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const file = new FormData(form).get("file");
    if (!(file instanceof File) || file.size < 1) {
      setError(true);
      setMessage("Choose a receipt or invoice to upload.");
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES || !ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError(true);
      setMessage("Receipts must be a PDF, PNG, or JPEG up to 4 MB.");
      return;
    }
    setPending(true);
    setError(false);
    setMessage("");
    try {
      const response = await fetch(`/api/team/finance/expenses/${encodeURIComponent(expense.id)}/attachments`, { method: "POST", body: new FormData(form) });
      const payload = await response.json().catch(() => null) as { error?: string; duplicate?: boolean } | null;
      if (!response.ok) {
        setError(true);
        setMessage(payload?.error ?? "The receipt could not be uploaded.");
      } else {
        setMessage(payload?.duplicate ? "This file is already attached to the expense." : "Receipt uploaded privately.");
        form.reset();
        router.refresh();
      }
    } catch {
      setError(true);
      setMessage("The receipt could not be uploaded. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="finance-main">
      <div className="finance-heading-row"><div className="finance-heading-copy"><p className="finance-eyebrow"><ShieldCheck aria-hidden="true" /> Transaction record</p><h1>Expense <em>details</em></h1><p>Created {formatFinanceDate(expense.expenseDate)} · {expense.source === "assistant" ? "Finance AI draft" : "Manual entry"}</p></div><div className="finance-heading-actions"><Link className="finance-button finance-button-secondary" href="/team/finance"><ArrowLeft aria-hidden="true" /> Ledger</Link>{expense.status === "active" && <><Link className="finance-button finance-button-secondary" href={`/team/finance/expenses/${encodeURIComponent(expense.id)}/edit`}><Pencil aria-hidden="true" /> Edit</Link><button className="finance-button finance-button-danger" type="button" onClick={() => void handleVoid()} disabled={pending}><XCircle aria-hidden="true" />{pending ? "Updating…" : "Void expense"}</button></>}</div></div>
      {message && <p className={`finance-message${error ? " error" : " success"}`} role={error ? "alert" : "status"}>{message}</p>}
      <div className="finance-detail-grid">
        <section className="finance-panel" aria-labelledby="expense-details-title"><div className="finance-panel-heading"><div><h2 id="expense-details-title">{expense.title}</h2><p>{formatMoney(expense.amount, expense.currency)} · {expense.categoryName}</p></div><span className={`finance-status${expense.status === "void" ? " void" : ""}`}>{expense.status === "void" ? "Voided" : "Active"}</span></div><div className="finance-detail-list">
          <div className="finance-detail-item"><span>Expense date</span><strong>{formatFinanceDate(expense.expenseDate)}</strong></div><div className="finance-detail-item"><span>Time</span><strong>{expense.expenseTime ?? "Not recorded"}</strong></div>
          <div className="finance-detail-item"><span>Payment method</span><strong>{FINANCE_PAYMENT_LABELS[expense.paymentMethod]}</strong></div><div className="finance-detail-item"><span>Paid by</span><strong>{expense.paidBy || "Not recorded"}</strong></div>
          <div className="finance-detail-item"><span>Vendor or recipient</span><strong>{expense.vendor || "Not recorded"}</strong></div><div className="finance-detail-item"><span>Project or department</span><strong>{expense.projectReference || "Not recorded"}</strong></div>
          <div className="finance-detail-item"><span>Reference number</span><strong>{expense.referenceNumber || "Not recorded"}</strong></div><div className="finance-detail-item"><span>Created by</span><strong>{expense.createdBy}</strong></div>
          <div className="finance-detail-item"><span>Created at</span><strong>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(expense.createdAt))}</strong></div><div className="finance-detail-item"><span>Last updated</span><strong>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(expense.updatedAt))}</strong></div>
          <div className="finance-detail-item full"><span>Description</span><strong>{expense.description || "No description"}</strong></div>
        </div></section>
        <section className="finance-panel" aria-labelledby="expense-attachments-title"><div className="finance-panel-heading"><div><h2 id="expense-attachments-title">Receipts &amp; invoices</h2><p>Private files · Owner access only</p></div></div>{detail.attachments.length ? <ul className="finance-attachment-list">{detail.attachments.map((attachment) => <li key={attachment.id}><a href={`/api/team/finance/attachments/${encodeURIComponent(attachment.id)}`}><span>{attachment.fileName}<small>{Math.ceil(attachment.byteSize / 1024)} KB · {attachment.mimeType}</small></span><ArrowDownToLine aria-hidden="true" /></a></li>)}</ul> : <div className="finance-empty-state">No receipt is attached.</div>}{expense.status === "active" && <form className="finance-form" onSubmit={uploadAttachment}><hr className="finance-divider" /><div className="finance-field"><label htmlFor="finance-attachment-file">Upload a receipt</label><input id="finance-attachment-file" name="file" type="file" accept="application/pdf,image/jpeg,image/png" required /></div><p className="finance-form-note">PDF, PNG, or JPEG · up to 4 MB. Files are stored privately and never served from a public URL.</p><button className="finance-button finance-button-secondary" type="submit" disabled={pending}><FileUp aria-hidden="true" /> Upload file</button></form>}</section>
      </div>
      <section className="finance-panel" aria-labelledby="expense-audit-title"><div className="finance-panel-heading"><div><h2 id="expense-audit-title">Audit history</h2><p>Creation, edits, and voiding are recorded with actor and snapshots.</p></div><span>{detail.audit.length} events</span></div>{detail.audit.length ? <ol className="finance-audit-list">{detail.audit.map((entry) => <li key={entry.id}><strong>{entry.action}</strong><small>{entry.changedByName ?? entry.changedBy} · {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(entry.createdAt))}</small><details><summary>View recorded values</summary><div className="finance-audit-snapshots"><div><span>Previous</span><pre>{prettyJson(entry.previousData)}</pre></div><div><span>Saved</span><pre>{prettyJson(entry.newData)}</pre></div></div></details></li>)}</ol> : <div className="finance-empty-state">No audit events are available.</div>}</section>
    </main>
  );
}
