"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Save } from "lucide-react";
import { createExpense, updateExpense } from "@/app/team/finance/actions";
import { FINANCE_PAYMENT_LABELS, FINANCE_PAYMENT_METHODS, type FinanceCategoryOption, type FinanceExpenseDetail } from "@/lib/finance/types";

const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function FinanceExpenseForm({ mode, categories, today, initial }: {
  mode: "create" | "edit";
  categories: FinanceCategoryOption[];
  today?: string;
  initial?: FinanceExpenseDetail["expense"];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyKey = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savedExpenseId, setSavedExpenseId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || savedExpenseId) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const fileValue = formData.get("receipt");
    const receipt = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
    formData.delete("receipt");

    if (receipt && (receipt.size > MAX_ATTACHMENT_BYTES || !ACCEPTED_MIME_TYPES.includes(receipt.type))) {
      setError(true);
      setMessage("Receipts must be a PDF, PNG, or JPEG up to 4 MB.");
      return;
    }

    setPending(true);
    setMessage("");
    setError(false);
    if (mode === "create") {
      idempotencyKey.current ??= crypto.randomUUID();
      formData.set("idempotencyKey", idempotencyKey.current);
    }

    const result = mode === "create" ? await createExpense(formData) : await updateExpense(formData);
    if (!result.ok) {
      setError(true);
      setMessage(result.error);
      setPending(false);
      return;
    }

    const expenseId = result.data.expenseId;
    if (mode === "create") idempotencyKey.current = null;
    if (receipt) setSavedExpenseId(expenseId);

    if (receipt) {
      const uploadData = new FormData();
      uploadData.append("file", receipt, receipt.name);
      try {
        const response = await fetch(`/api/team/finance/expenses/${encodeURIComponent(expenseId)}/attachments`, { method: "POST", body: uploadData });
        if (!response.ok) {
          const payload = await response.json().catch(() => null) as { error?: string } | null;
          setError(true);
          setMessage(`Expense saved. Receipt upload failed: ${payload?.error ?? "try again from the transaction details page."}`);
          setPending(false);
          return;
        }
      } catch {
        setError(true);
        setMessage("Expense saved, but the receipt could not be uploaded. You can retry from the transaction details page.");
        setPending(false);
        return;
      }
    }

    router.push(`/team/finance/expenses/${encodeURIComponent(expenseId)}`);
    router.refresh();
  }

  const initialCurrency = initial?.currency ?? "INR";
  return (
    <main className="finance-main">
      <div className="finance-heading-row">
        <div className="finance-heading-copy"><p className="finance-eyebrow">{mode === "create" ? "New transaction" : "Transaction update"}</p><h1>{mode === "create" ? <>Add an <em>expense</em></> : <>Edit <em>expense</em></>}</h1><p>Amounts are stored at fixed precision. Changes are recorded in the transaction audit trail.</p></div>
        <Link className="finance-button finance-button-secondary" href={initial ? `/team/finance/expenses/${encodeURIComponent(initial.id)}` : "/team/finance"}><ArrowLeft aria-hidden="true" /> Back</Link>
      </div>
      <section className="finance-panel" aria-labelledby="expense-form-title">
        <div className="finance-panel-heading"><div><h2 id="expense-form-title">Transaction details</h2><p>Required fields are marked with an asterisk.</p></div></div>
        <form ref={formRef} className="finance-form" onSubmit={handleSubmit}>
          {initial && <input type="hidden" name="id" value={initial.id} />}
          <div className="finance-form-grid">
            <div className="finance-field full"><label htmlFor="finance-expense-title">Expense title <span aria-hidden="true">*</span></label><input id="finance-expense-title" name="title" maxLength={160} required defaultValue={initial?.title ?? ""} placeholder="e.g. Domain renewal" /></div>
            <div className="finance-field"><label htmlFor="finance-expense-amount">Amount <span aria-hidden="true">*</span></label><input id="finance-expense-amount" name="amount" type="number" min="0.01" max="999999999999.99" step="0.01" inputMode="decimal" required defaultValue={initial?.amount ?? ""} placeholder="0.00" /></div>
            <div className="finance-field"><label htmlFor="finance-expense-currency">Currency code <span aria-hidden="true">*</span></label><input id="finance-expense-currency" name="currency" required maxLength={3} minLength={3} pattern="[A-Za-z]{3}" title="Enter a three-letter currency code, such as INR." defaultValue={initialCurrency} /></div>
            <div className="finance-field"><label htmlFor="finance-expense-category">Category <span aria-hidden="true">*</span></label><select id="finance-expense-category" name="categoryId" required defaultValue={initial?.categoryId ?? ""}><option value="" disabled>Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><Link className="finance-form-note" href="/team/finance/categories">Manage categories</Link></div>
            <div className="finance-field"><label htmlFor="finance-expense-date">Expense date <span aria-hidden="true">*</span></label><input id="finance-expense-date" name="expenseDate" type="date" required defaultValue={initial?.expenseDate ?? today} /></div>
            <div className="finance-field"><label htmlFor="finance-expense-time">Expense time</label><input id="finance-expense-time" name="expenseTime" type="time" defaultValue={initial?.expenseTime?.slice(0, 5) ?? ""} /></div>
            <div className="finance-field"><label htmlFor="finance-expense-payment">Payment method <span aria-hidden="true">*</span></label><select id="finance-expense-payment" name="paymentMethod" required defaultValue={initial?.paymentMethod ?? ""}><option value="" disabled>Select method</option>{FINANCE_PAYMENT_METHODS.map((method) => <option key={method} value={method}>{FINANCE_PAYMENT_LABELS[method]}</option>)}</select></div>
            <div className="finance-field"><label htmlFor="finance-expense-paid-by">Paid by</label><input id="finance-expense-paid-by" name="paidBy" maxLength={160} defaultValue={initial?.paidBy ?? ""} placeholder="Person or team" /></div>
            <div className="finance-field"><label htmlFor="finance-expense-vendor">Vendor or recipient</label><input id="finance-expense-vendor" name="vendor" maxLength={160} defaultValue={initial?.vendor ?? ""} placeholder="Business or recipient" /></div>
            <div className="finance-field"><label htmlFor="finance-expense-project">Project or department</label><input id="finance-expense-project" name="projectReference" maxLength={160} defaultValue={initial?.projectReference ?? ""} placeholder="Optional reference" /></div>
            <div className="finance-field"><label htmlFor="finance-expense-reference">Reference number</label><input id="finance-expense-reference" name="referenceNumber" maxLength={120} defaultValue={initial?.referenceNumber ?? ""} placeholder="Invoice or transaction ID" /></div>
            <div className="finance-field full"><label htmlFor="finance-expense-description">Description</label><textarea id="finance-expense-description" name="description" maxLength={4000} defaultValue={initial?.description ?? ""} placeholder="Add context for the transaction" /></div>
            {mode === "create" && <div className="finance-field full"><label htmlFor="finance-expense-receipt">Receipt or invoice</label><input id="finance-expense-receipt" name="receipt" type="file" accept="application/pdf,image/jpeg,image/png" /><small className="finance-form-note">Private upload · PDF, PNG, or JPEG · up to 4 MB</small></div>}
          </div>
          {message && <p className={`finance-message${error ? " error" : " success"}`} role={error ? "alert" : "status"}>{message}{savedExpenseId && <><br /><Link className="finance-row-link" href={`/team/finance/expenses/${encodeURIComponent(savedExpenseId)}`}>Open transaction details</Link></>}</p>}
          <div className="finance-form-footer"><p className="finance-form-note">{initial ? "The original record remains in the audit history." : `New entries use the ${initialCurrency} default unless you choose another currency.`}</p><button className="finance-button finance-button-primary" type="submit" disabled={pending || Boolean(savedExpenseId)}><Save aria-hidden="true" />{pending ? "Saving…" : savedExpenseId ? "Expense saved" : mode === "create" ? "Save expense" : "Save changes"}</button></div>
        </form>
      </section>
    </main>
  );
}
