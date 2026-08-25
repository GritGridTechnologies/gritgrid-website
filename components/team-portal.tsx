"use client";

import { useTransition } from "react";
import { Clock3, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { clockIn, clockOut } from "@/app/team/actions";

type RecordItem = { id: string; workDate: string; clockIn: Date | string; clockOut: Date | string | null };

function time(value: Date | string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function TeamPortal({ name, role, records }: { name: string; role?: string; records: RecordItem[] }) {
  const [pending, startTransition] = useTransition();
  const today = records.find((record) => record.workDate === new Date().toISOString().slice(0, 10));
  const action = today?.clockOut ? "complete" : today ? "out" : "in";
  return <main className="team-page"><div className="team-container"><header className="team-header"><div><p className="eyebrow"><ShieldCheck aria-hidden="true" /> Team Portal</p><h1>Good morning, <em>{name.split(" ")[0]}.</em></h1><p>One place to mark your workday and keep your attendance history clear.</p></div><span className="team-role">{role === "admin" ? "Admin" : "Team member"}</span></header><section className="team-clock-card"><div><p className="eyebrow"><Clock3 aria-hidden="true" /> Today</p><h2>{today ? (today.clockOut ? "Day complete" : "You are clocked in") : "Ready when you are"}</h2><p>{today ? `Clocked in at ${time(today.clockIn)}${today.clockOut ? ` · out at ${time(today.clockOut)}` : ""}` : "Your start time is recorded securely when you clock in."}</p></div>{action === "complete" ? <span className="team-complete">Attendance complete</span> : <button className="button button-primary team-action" disabled={pending} onClick={() => startTransition(() => { void (action === "in" ? clockIn() : clockOut()); })}>{action === "in" ? <><LogIn aria-hidden="true" /> Clock in</> : <><LogOut aria-hidden="true" /> Clock out</>}</button>}</section><section className="team-history"><div className="team-section-heading"><div><p className="eyebrow">Your record</p><h2>Attendance history</h2></div><span>Last 30 days</span></div><div className="team-table">{records.length ? records.map((record) => <div className="team-row" key={record.id}><strong>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${record.workDate}T00:00:00`))}</strong><span>In {time(record.clockIn)}</span><span>Out {time(record.clockOut)}</span><b>{record.clockOut ? "Complete" : "Open"}</b></div>) : <p className="team-empty">No attendance records yet.</p>}</div></section></div></main>;
}
