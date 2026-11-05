"use client";

import { useState, type FormEvent } from "react";
import { Check, CircleHelp, Loader2, Send, Sparkles, X } from "lucide-react";
import { confirmFinanceAiDraft, cancelFinanceAiDraft } from "@/app/team/finance/actions";
import { formatMoney, addMoneyStrings } from "@/lib/finance/money";
import { FINANCE_PAYMENT_LABELS, FINANCE_PAYMENT_METHODS, type FinanceAiDraftItem, type FinanceCategoryOption } from "@/lib/finance/types";
import { useRouter } from "next/navigation";

type AssistantResult = {
  kind: "clarification" | "answer" | "draft";
  message: string;
  details?: { label: string; value: string }[];
  draftId?: string;
  items?: FinanceAiDraftItem[];
  totals?: { currency: string; amount: string }[];
};

const EXAMPLES = [
  "Spent 850 rupees on domain renewal today.",
  "Yesterday we spent 750 on transportation.",
  "How much did we spend on marketing this month?",
];

function calculateTotals(items: FinanceAiDraftItem[]) {
  const byCurrency = items.reduce<Record<string, string[]>>((totals, item) => {
    (totals[item.currency] ??= []).push(item.amount);
    return totals;
  }, {});
  return Object.entries(byCurrency).map(([currency, amounts]) => ({ currency, amount: addMoneyStrings(amounts) }));
}

export default function FinanceAssistant({ categories }: { categories: FinanceCategoryOption[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (!text || pending) return;
    setPending(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/team/finance/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const payload = await response.json() as AssistantResult & { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "The assistant could not process that request.");
        return;
      }
      setResult(payload);
      if (payload.kind !== "draft") setMessage("");
    } catch {
      setError("The assistant could not be reached. No transaction was saved.");
    } finally {
      setPending(false);
    }
  }

  function updateDraftItem(index: number, field: keyof FinanceAiDraftItem, value: string) {
    setResult((current) => {
      if (!current?.items) return current;
      const items = current.items.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (field === "categoryId") {
          const selected = categories.find((category) => category.id === value);
          return { ...item, categoryId: value || null, categoryName: selected?.name ?? null };
        }
        if (field === "paymentMethod") return { ...item, paymentMethod: value ? value as FinanceAiDraftItem["paymentMethod"] : null };
        if (field === "expenseDate") return { ...item, expenseDate: value, dateAssumed: false };
        if (field === "currency") return { ...item, currency: value.toUpperCase().slice(0, 3), currencyAssumed: false };
        return { ...item, [field]: value };
      });
      return { ...current, items };
    });
  }

  async function confirmDraft() {
    if (!result?.draftId || !result.items || pending) return;
    setPending(true);
    setError("");
    const saved = await confirmFinanceAiDraft(result.draftId, result.items);
    if (!saved.ok) {
      setError(saved.error);
      setPending(false);
      return;
    }
    const { createdCount, alreadyConfirmed, totals } = saved.data;
    const totalText = totals.map((total) => formatMoney(total.amount, total.currency)).join(" + ");
    setResult({
      kind: "answer",
      message: alreadyConfirmed
        ? "This preview was already confirmed. No duplicate transactions were created."
        : `Successfully added ${createdCount} ${createdCount === 1 ? "expense" : "expenses"}${totalText ? ` · ${totalText}` : ""}. Dashboard totals recalculate from the saved ledger.`,
    });
    setMessage("");
    setPending(false);
    router.refresh();
  }

  async function cancelDraft() {
    if (!result?.draftId || pending) return;
    setPending(true);
    setError("");
    const cancelled = await cancelFinanceAiDraft(result.draftId);
    if (!cancelled.ok) {
      setError(cancelled.error);
      setPending(false);
      return;
    }
    setResult({ kind: "answer", message: "Draft cancelled. No transactions were added." });
    setMessage("");
    setPending(false);
  }

  const isDraft = result?.kind === "draft" && Boolean(result.items && result.draftId);
  const totals = isDraft && result.items ? calculateTotals(result.items) : [];

  return (
    <section className="finance-assistant" aria-labelledby="finance-ai-title">
      <div className="finance-assistant-top"><span className="finance-assistant-icon"><Sparkles aria-hidden="true" /></span><div><h2 id="finance-ai-title">GritGrid Finance AI</h2><p>Describe expenses or ask about saved records. Questions use verified database totals; entries stay drafts until you confirm.</p></div></div>
      <form className="finance-assistant-body" onSubmit={submitMessage}>
        <div className="finance-field"><label htmlFor="finance-ai-message">Your message</label><textarea id="finance-ai-message" value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1200} placeholder="e.g. Spent 850 rupees on domain renewal today" /></div>
        <button className="finance-button finance-button-primary" type="submit" disabled={pending || !message.trim()}>{pending ? <Loader2 className="finance-spinner" aria-hidden="true" /> : <Send aria-hidden="true" />}{pending ? "Working…" : "Ask Finance AI"}</button>
      </form>
      <div className="finance-assistant-examples" aria-label="Example requests">{EXAMPLES.map((example) => <button key={example} type="button" onClick={() => setMessage(example)}>{example}</button>)}</div>
      {error && <p className="finance-message error finance-assistant-result" role="alert">{error}</p>}
      {result && <div className="finance-assistant-result" aria-live="polite">
        <p className={`finance-message${result.kind === "clarification" ? " error" : ""}`}><CircleHelp aria-hidden="true" /> {result.message}</p>
        {result.details?.length ? <ul className="finance-ai-answer-list">{result.details.map((detail, index) => <li key={`${detail.label}-${index}`}><span>{detail.label}</span><strong>{detail.value}</strong></li>)}</ul> : null}
        {isDraft && result.items && <div className="finance-preview">
          <div className="finance-preview-heading"><div><h3>Review before adding</h3><p>Unmatched categories and missing payment methods must be selected before confirmation.</p></div><span>{result.items.length} {result.items.length === 1 ? "transaction" : "transactions"}</span></div>
          <div className="finance-preview-list">{result.items.map((item, index) => <article className="finance-preview-item" key={`${result.draftId}-${index}`}>
            <h4>Expense {index + 1}{item.dateAssumed ? <span className="finance-default-badge"> · Date defaulted to today</span> : null}{item.currencyAssumed ? <span className="finance-default-badge"> · INR default</span> : null}</h4>
            <div className="finance-preview-fields">
              <div className="finance-field"><label htmlFor={`ai-title-${index}`}>Title</label><input id={`ai-title-${index}`} value={item.title} maxLength={160} onChange={(event) => updateDraftItem(index, "title", event.target.value)} /></div>
              <div className="finance-field"><label htmlFor={`ai-amount-${index}`}>Amount</label><input id={`ai-amount-${index}`} value={item.amount} inputMode="decimal" maxLength={16} onChange={(event) => updateDraftItem(index, "amount", event.target.value)} /></div>
              <div className="finance-field"><label htmlFor={`ai-currency-${index}`}>Currency</label><input id={`ai-currency-${index}`} value={item.currency} maxLength={3} pattern="[A-Za-z]{3}" onChange={(event) => updateDraftItem(index, "currency", event.target.value)} /></div>
              <div className="finance-field"><label htmlFor={`ai-category-${index}`}>Category</label><select id={`ai-category-${index}`} value={item.categoryId ?? ""} onChange={(event) => updateDraftItem(index, "categoryId", event.target.value)}><option value="">Choose category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              <div className="finance-field"><label htmlFor={`ai-date-${index}`}>Expense date</label><input id={`ai-date-${index}`} type="date" value={item.expenseDate} onChange={(event) => updateDraftItem(index, "expenseDate", event.target.value)} /></div>
              <div className="finance-field"><label htmlFor={`ai-payment-${index}`}>Payment method</label><select id={`ai-payment-${index}`} value={item.paymentMethod ?? ""} onChange={(event) => updateDraftItem(index, "paymentMethod", event.target.value)}><option value="">Choose method</option>{FINANCE_PAYMENT_METHODS.map((method) => <option key={method} value={method}>{FINANCE_PAYMENT_LABELS[method]}</option>)}</select></div>
              <div className="finance-field"><label htmlFor={`ai-vendor-${index}`}>Vendor / recipient</label><input id={`ai-vendor-${index}`} value={item.vendor} maxLength={160} onChange={(event) => updateDraftItem(index, "vendor", event.target.value)} /></div>
              <div className="finance-field"><label htmlFor={`ai-paid-by-${index}`}>Paid by</label><input id={`ai-paid-by-${index}`} value={item.paidBy} maxLength={160} onChange={(event) => updateDraftItem(index, "paidBy", event.target.value)} /></div>
              <div className="finance-field"><label htmlFor={`ai-project-${index}`}>Project / department</label><input id={`ai-project-${index}`} value={item.projectReference} maxLength={160} onChange={(event) => updateDraftItem(index, "projectReference", event.target.value)} /></div>
              <div className="finance-field full"><label htmlFor={`ai-description-${index}`}>Description</label><textarea id={`ai-description-${index}`} value={item.description} maxLength={4000} onChange={(event) => updateDraftItem(index, "description", event.target.value)} /></div>
            </div>
          </article>)}</div>
          <div className="finance-preview-total"><span>Preview total{totals.length === 1 ? ` · ${totals[0].currency}` : ""}</span>{totals.map((total) => <strong key={total.currency}>{formatMoney(total.amount, total.currency)}</strong>)}</div>
          <div className="finance-form-footer"><p className="finance-form-note">No record is saved until you confirm this preview.</p><div className="finance-panel-actions"><button className="finance-button finance-button-secondary" type="button" onClick={() => void cancelDraft()} disabled={pending}><X aria-hidden="true" /> Cancel</button><button className="finance-button finance-button-primary" type="button" onClick={() => void confirmDraft()} disabled={pending}><Check aria-hidden="true" />{pending ? "Saving…" : "Confirm and add"}</button></div></div>
        </div>}
      </div>}
    </section>
  );
}
