"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/finance/money";
import type { FinanceChartPoint } from "@/lib/finance/types";

const CHART_COLORS = ["#0b6e9e", "#ef6c2f", "#58b9d2", "#10243b", "#7290a3"];

type ChartData = {
  daily: FinanceChartPoint[];
  monthly: FinanceChartPoint[];
  categories: FinanceChartPoint[];
  yearly: FinanceChartPoint[];
  topCategories: FinanceChartPoint[];
};

function ChartCard({ title, description, data, currency, kind = "bar", wide = false }: {
  title: string;
  description: string;
  data: FinanceChartPoint[];
  currency: string;
  kind?: "bar" | "line" | "pie";
  wide?: boolean;
}) {
  const hasSpending = data.some((point) => point.amount > 0);
  return (
    <section className={`finance-chart-card${wide ? " wide" : ""}`} aria-label={title}>
      <div className="finance-chart-heading"><div><h2>{title}</h2><p>{description}</p></div></div>
      {hasSpending ? (
        <div className="finance-chart-shell" role="img" aria-label={`${title}. Values are summarized below for screen readers.`}>
          <ResponsiveContainer width="100%" height="100%">
            {kind === "line" ? (
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e1ea" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#5b6b7d", fontSize: 9 }} tickLine={false} axisLine={false} minTickGap={18} />
                <YAxis tick={{ fill: "#5b6b7d", fontSize: 9 }} tickLine={false} axisLine={false} width={45} tickFormatter={(value: number) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value)} />
                <Tooltip formatter={(value: unknown) => [formatMoney(Number(value ?? 0).toFixed(2), currency), "Spend"] as [string, string]} contentStyle={{ borderRadius: 9, borderColor: "#d7e1ea", fontSize: 11 }} />
                <Line type="monotone" dataKey="amount" name="Spend" stroke="#0b6e9e" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: "#ef6c2f", strokeWidth: 0 }} />
              </LineChart>
            ) : kind === "pie" ? (
              <PieChart>
                <Pie data={data} dataKey="amount" nameKey="label" innerRadius={54} outerRadius={83} paddingAngle={2} stroke="none">
                  {data.map((point, index) => <Cell key={point.key} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: unknown) => [formatMoney(Number(value ?? 0).toFixed(2), currency), "Spend"] as [string, string]} contentStyle={{ borderRadius: 9, borderColor: "#d7e1ea", fontSize: 11 }} />
                <Legend verticalAlign="bottom" height={34} wrapperStyle={{ fontSize: 9 }} />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7e1ea" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#5b6b7d", fontSize: 9 }} tickLine={false} axisLine={false} minTickGap={18} />
                <YAxis tick={{ fill: "#5b6b7d", fontSize: 9 }} tickLine={false} axisLine={false} width={45} tickFormatter={(value: number) => new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value)} />
                <Tooltip formatter={(value: unknown) => [formatMoney(Number(value ?? 0).toFixed(2), currency), "Spend"] as [string, string]} contentStyle={{ borderRadius: 9, borderColor: "#d7e1ea", fontSize: 11 }} />
                <Bar dataKey="amount" name="Spend" fill="#0b6e9e" radius={[5, 5, 0, 0]} maxBarSize={34} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : <div className="finance-empty-chart">No recorded spending for this chart yet.</div>}
      <ul className="finance-visually-hidden" aria-label={`${title} data`}>
        {data.filter((point) => point.amount > 0).map((point) => <li key={point.key}>{point.label}: {formatMoney(point.exactAmount, currency)}</li>)}
      </ul>
    </section>
  );
}

export default function FinanceCharts({ charts, currency }: { charts: ChartData; currency: string }) {
  return (
    <div className="finance-chart-grid">
      <ChartCard title="Daily expenditure" description="Last 30 days · grouped by expense date" data={charts.daily} currency={currency} kind="line" wide />
      <ChartCard title="Monthly trend" description="Current month and previous 11 months" data={charts.monthly} currency={currency} />
      <ChartCard title="Category distribution" description="Year to date · active transactions" data={charts.categories} currency={currency} kind="pie" />
      <ChartCard title="Yearly comparison" description="Current year and previous four years" data={charts.yearly} currency={currency} />
      <ChartCard title="Top expense categories" description="Highest category totals this year" data={charts.topCategories} currency={currency} />
    </div>
  );
}
