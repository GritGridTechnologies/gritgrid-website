"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Clock3, LogIn, LogOut, ShieldCheck, Users, BarChart3 } from "lucide-react";
import { clockIn, clockOut } from "@/app/team/actions";

type RecordItem = { id: string; workDate: string; clockIn: Date | string; clockOut: Date | string | null };
type TeamItem = { record: RecordItem; member: { id: string; name: string; email: string; role: string } };

function time(value: Date | string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
}

export default function TeamPortal({ name, role, records, teamRecords }: { name: string; role?: string; records: RecordItem[]; teamRecords: TeamItem[] }) {
  const [pending, startTransition] = useTransition();
  const today = records.find((record) => record.workDate === new Date().toISOString().slice(0, 10));
  const action = today?.clockOut ? "complete" : today ? "out" : "in";
  const teamMembers = teamRecords.filter((item, index, list) => list.findIndex((candidate) => candidate.member.id === item.member.id) === index);
  const label = role === "owner" || role === "admin" ? "Owner" : role === "manager" ? "Manager" : "Employee";

  return (
    <main className="team-page">
      <div className="team-container">
        <header className="team-header">
          <div>
            <p className="eyebrow"><ShieldCheck aria-hidden="true" /> Team Portal</p>
            <h1>Good morning, <em>{name.split(" ")[0]}.</em></h1>
            <p>{role === "manager" ? "Lead your team and keep your workday clear." : "One place to mark your workday and keep your attendance history clear."}</p>
          </div>
          <span className="team-role">{label}</span>
        </header>

        {(role === "owner" || role === "admin") && <section className="team-owner-controls" aria-labelledby="owner-controls-title">
          <div className="team-section-heading"><div><p className="eyebrow">Owner controls</p><h2 id="owner-controls-title">Run the organization.</h2></div><span>Full access</span></div>
          <div className="team-owner-actions"><Link className="team-owner-action" href="/admin/team"><Users aria-hidden="true" /><span><strong>Manage team</strong><small>Promote managers, assign employees, view hierarchy</small></span></Link><Link className="team-owner-action" href="/admin/attendance"><BarChart3 aria-hidden="true" /><span><strong>Company attendance</strong><small>Review attendance across the organization</small></span></Link></div>
        </section>}

        <section className="team-clock-card">
          <div>
            <p className="eyebrow"><Clock3 aria-hidden="true" /> Today</p>
            <h2>{today ? (today.clockOut ? "Day complete" : "You are clocked in") : "Ready when you are"}</h2>
            <p>{today ? `Clocked in at ${time(today.clockIn)}${today.clockOut ? ` · out at ${time(today.clockOut)}` : ""}` : "Your start time is recorded securely when you clock in."}</p>
          </div>
          {action === "complete" ? <span className="team-complete">Attendance complete</span> : <button className="button button-primary team-action" disabled={pending} onClick={() => startTransition(() => { void (action === "in" ? clockIn() : clockOut()); })}>{action === "in" ? <><LogIn aria-hidden="true" /> Clock in</> : <><LogOut aria-hidden="true" /> Clock out</>}</button>}
        </section>

        {role === "manager" && <section className="team-history">
          <div className="team-section-heading"><div><p className="eyebrow">My team</p><h2>Today&apos;s team status</h2></div><span>{teamMembers.length} members</span></div>
          <div className="team-table">{teamMembers.length ? teamMembers.map(({ record, member }) => <div className="team-row" key={record.id}><strong>{member.name}</strong><span>In {time(record.clockIn)}</span><span>Out {time(record.clockOut)}</span><b>{record.clockOut ? "Checked out" : "Present"}</b></div>) : <p className="team-empty">No team attendance records yet.</p>}</div>
        </section>}

        <section className="team-history">
          <div className="team-section-heading"><div><p className="eyebrow">My record</p><h2>Attendance history</h2></div><span>Last 30 days</span></div>
          <div className="team-table">{records.length ? records.map((record) => <div className="team-row" key={record.id}><strong>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${record.workDate}T00:00:00`))}</strong><span>In {time(record.clockIn)}</span><span>Out {time(record.clockOut)}</span><b>{record.clockOut ? "Complete" : "Open"}</b></div>) : <p className="team-empty">No attendance records yet.</p>}</div>
        </section>
      </div>
    </main>
  );
}
