import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, CalendarDays, CircleDollarSign, Receipt, ShieldCheck, Sparkles, TrendingUp, Wallet } from "lucide-react";
import FinanceAssistant from "@/components/finance/finance-assistant";
import FinanceCharts from "@/components/finance/finance-charts";
import { formatFinanceDate } from "@/lib/finance/dates";
import { formatMoney } from "@/lib/finance/money";
import { FINANCE_PAYMENT_LABELS } from "@/lib/finance/types";
import type { FinanceDashboardData } from "@/lib/finance/types";

function exportHref(data: FinanceDashboardData) {
  const params = new URLSearchParams();
  params.set("currency", data.filters.currency);
  params.set("status", data.filters.status);
  if (data.filters.search) params.set("q", data.filters.search);
  if (data.filters.from) params.set("from", data.filters.from);
  if (data.filters.to) params.set("to", data.filters.to);
  if (data.filters.categoryId) params.set("category", data.filters.categoryId);
  if (data.filters.paymentMethod) params.set("payment", data.filters.paymentMethod);
  return `/api/team/finance/export?${params.toString()}`;
}

function StatCard({ label, value, note, tone, icon: Icon }: { label: string; value: string; note: string; tone: string; icon: typeof Receipt }) {
  return <article className={`finance-stat-card ${tone}`}><div className="finance-stat-label"><span>{label}</span><Icon aria-hidden="true" /></div><strong className="finance-stat-value">{value}</strong><small className="finance-stat-note">{note}</small></article>;
}

export default function FinanceDashboard({ data }: { data: FinanceDashboardData }) {
  const stats = data.stats;
  const currency = data.currency;
  return (
    <main className="finance-main">
      <section className="finance-heading-row">
        <div className="finance-heading-copy"><p className="finance-eyebrow"><ShieldCheck aria-hidden="true" /> Private Owner workspace</p><h1>Finance <em>&amp; expenses</em></h1><p>Company-wide expense records, budgets, and reports. All totals are derived from active transactions.</p></div>
        <div className="finance-heading-actions"><Link className="finance-button finance-button-secondary" href="/team/finance/reports"><TrendingUp aria-hidden="true" /> View reports</Link><Link className="finance-button finance-button-primary" href="/team/finance/expenses/new"><Receipt aria-hidden="true" /> Add expense</Link></div>
      </section>

      <section className="finance-banner" aria-label="Finance data policy">
        <div className="finance-banner-content"><div><p className="finance-eyebrow"><CircleDollarSign aria-hidden="true" /> Live financial data</p><h2>Every total comes from the transaction ledger.</h2><p>All users with the Owner role share this company ledger; each change records its Owner. Daily, monthly, and yearly figures recalculate from active expenses. Voided records remain in the audit history and are excluded from totals.</p></div><div className="finance-banner-meta"><span>Business date · Asia/Kolkata</span><strong>{formatFinanceDate(data.today)}</strong><span>Reporting currency · {currency}</span></div></div>
      </section>

      <section className="finance-stats-grid" aria-label="Expense summary">
        <StatCard label="Today" value={formatMoney(stats.today, currency)} note={formatFinanceDate(data.today)} tone="blue" icon={CalendarDays} />
        <StatCard label="Yesterday" value={formatMoney(stats.yesterday, currency)} note="Previous business date" tone="cyan" icon={CalendarDays} />
        <StatCard label="This week" value={formatMoney(stats.week, currency)} note="Monday through today" tone="navy" icon={TrendingUp} />
        <StatCard label="This month" value={formatMoney(stats.month, currency)} note="Month to date" tone="orange" icon={Wallet} />
        <StatCard label="This year" value={formatMoney(stats.year, currency)} note="Year to date" tone="blue" icon={TrendingUp} />
        <StatCard label="Recorded total" value={formatMoney(stats.total, currency)} note="All active transactions" tone="navy" icon={CircleDollarSign} />
        <StatCard label="Transactions" value={stats.transactions.toLocaleString("en-IN")} note="Active transactions · all dates" tone="cyan" icon={Receipt} />
        <StatCard label="Average per day" value={formatMoney(stats.averageDaily, currency)} note="Month-to-date daily average" tone="orange" icon={CalendarDays} />
      </section>

      {stats.highestCategory && <p className="finance-message"><strong>Highest category this year:</strong> {stats.highestCategory.name} · {formatMoney(stats.highestCategory.amount, currency)}</p>}

      <FinanceCharts charts={data.charts} currency={currency} />

      <FinanceAssistant categories={data.categories} />

      <section className="finance-panel" aria-labelledby="finance-transactions-heading">
        <div className="finance-panel-heading"><div><h2 id="finance-transactions-heading">Transactions</h2><p>Search and filter the company expense ledger.</p></div><div className="finance-panel-actions"><Link className="finance-button finance-button-secondary" href="/team/finance/budgets"><Wallet aria-hidden="true" /> Budgets</Link><a className="finance-button finance-button-secondary" href={exportHref(data)}><ArrowDownToLine aria-hidden="true" /> Export CSV</a></div></div>
        <form className="finance-filter-form" method="get" action="/team/finance" aria-label="Filter expenses">
          <div className="finance-field"><label htmlFor="finance-filter-q">Search</label><input id="finance-filter-q" name="q" type="search" maxLength={120} placeholder="Title, vendor, project…" defaultValue={data.filters.search} /></div>
          <div className="finance-field"><label htmlFor="finance-filter-currency">Currency</label><select id="finance-filter-currency" name="currency" defaultValue={currency}>{data.availableCurrencies.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
          <div className="finance-field"><label htmlFor="finance-filter-from">From</label><input id="finance-filter-from" name="from" type="date" defaultValue={data.filters.from} /></div>
          <div className="finance-field"><label htmlFor="finance-filter-to">To</label><input id="finance-filter-to" name="to" type="date" defaultValue={data.filters.to} /></div>
          <div className="finance-field"><label htmlFor="finance-filter-category">Category</label><select id="finance-filter-category" name="category" defaultValue={data.filters.categoryId}><option value="">All categories</option>{data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div className="finance-field"><label htmlFor="finance-filter-payment">Payment</label><select id="finance-filter-payment" name="payment" defaultValue={data.filters.paymentMethod}><option value="">All methods</option>{Object.entries(FINANCE_PAYMENT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div className="finance-field"><label htmlFor="finance-filter-status">Record status</label><select id="finance-filter-status" name="status" defaultValue={data.filters.status}><option value="active">Active</option><option value="void">Voided</option><option value="all">All records</option></select></div>
          <div className="finance-filter-actions"><button className="finance-button finance-button-primary" type="submit">Apply</button><Link className="finance-button finance-button-secondary" href="/team/finance">Reset</Link></div>
        </form>
        <p className="finance-results-count">Showing up to 100 matching records · totals above use active transactions only.</p>
        {data.expenses.length ? <div className="finance-table-wrap"><table className="finance-table"><thead><tr><th scope="col">Expense</th><th scope="col">Date</th><th scope="col">Category</th><th scope="col">Payment</th><th scope="col">Amount</th><th scope="col">Status</th><th scope="col"><span className="finance-visually-hidden">Details</span></th></tr></thead><tbody>{data.expenses.map((expense) => <tr key={expense.id}><td><strong>{expense.title}</strong><small>{expense.vendor || expense.projectReference || "No vendor or project"}</small></td><td>{formatFinanceDate(expense.expenseDate, { day: "numeric", month: "short", year: "numeric" })}</td><td>{expense.categoryName}</td><td>{FINANCE_PAYMENT_LABELS[expense.paymentMethod]}</td><td className="amount-cell">{formatMoney(expense.amount, expense.currency)}</td><td><span className={`finance-status${expense.status === "void" ? " void" : ""}`}>{expense.status === "void" ? "Voided" : "Active"}</span></td><td><Link className="finance-row-link" href={`/team/finance/expenses/${encodeURIComponent(expense.id)}`} aria-label={`View ${expense.title}`}>Details <ArrowUpRight aria-hidden="true" /></Link></td></tr>)}</tbody></table></div> : <div className="finance-empty-state"><strong>No matching expenses</strong>There are no recorded transactions for these filters. Add an expense to begin the live ledger.</div>}
      </section>

      <p className="finance-form-note"><Sparkles aria-hidden="true" /> AI drafts are never saved as transactions until an Owner reviews and confirms them.</p>
    </main>
  );
}
