import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user, leaveRequest } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

export default async function ManagerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/team/sign-in?next=/team/manager");
  const role = (session.user as { role?: string }).role;
  if (role !== "manager" && role !== "owner" && role !== "admin") redirect("/team");
  const members = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role }).from(user).where(role === "manager" ? eq(user.managerId, session.user.id) : undefined);
  const pending = await db.select({ value: count() }).from(leaveRequest).where(and(eq(leaveRequest.status, "pending"), role === "manager" ? eq(leaveRequest.reviewedBy, session.user.id) : undefined));
  return <main className="team-page"><div className="team-container"><header className="team-header"><div><p className="eyebrow">Manager workspace</p><h1>Lead the work clearly.</h1><p>Keep your team, attendance, leave, and delivery priorities in view.</p></div><span className="team-role">{role === "manager" ? "Manager" : "Owner"}</span></header><section className="team-summary"><div><span>Team members</span><strong>{members.length}</strong><small>In your scope</small></div><div><span>Pending leave</span><strong>{pending[0]?.value ?? 0}</strong><small>Needs review</small></div><div><span>Delivery</span><strong>Workboard</strong><small>Assignments and status</small></div></section><section className="team-history"><div className="team-section-heading"><div><p className="eyebrow">My team</p><h2>People in scope</h2></div><span>{members.length} members</span></div><div className="team-table">{members.length ? members.map((member) => <div className="team-row" key={member.id}><strong>{member.name}</strong><span>{member.email}</span><span>{member.role}</span><b>View profile</b></div>) : <p className="team-empty">No direct reports are assigned yet.</p>}</div></section></div></main>;
}
