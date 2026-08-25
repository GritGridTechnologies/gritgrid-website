import { getTeamAttendance } from "@/app/team/actions";

export default async function AdminAttendancePage() {
  const rows = await getTeamAttendance();
  return <div className="admin-page"><section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Team Portal / Attendance</p><h1>Attendance overview.</h1><p className="hero-lead">A clear daily view of who is in, who is out, and which workdays are still open.</p></div></div><div className="admin-list">{rows.length ? rows.map(({ record, member }) => <article className="admin-inquiry" key={record.id}><div><strong>{member.name}</strong><p>{member.email} · {record.workDate}</p></div><div><b>{record.clockOut ? "Complete" : "Clocked in"}</b><p>{new Date(record.clockIn).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}{record.clockOut ? ` → ${new Date(record.clockOut).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}</p></div></article>) : <p className="team-empty">No attendance records yet.</p>}</div></section></div>;
}
