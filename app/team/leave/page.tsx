import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyLeaveRequests } from "@/app/team/actions";

export default async function TeamLeavePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/team/sign-in?next=/team/leave");
  const requests = await getMyLeaveRequests();
  return <main className="team-page"><div className="team-container"><header className="team-header"><div><p className="eyebrow">Leave</p><h1>Plan time away.</h1><p>Submit leave requests and keep a clear record of every decision.</p></div></header><section className="admin-form-card"><h2>Request leave</h2><form className="admin-form" action="/team/leave"><input name="startDate" type="date" required /><input name="endDate" type="date" required /><textarea name="reason" placeholder="Reason" required /><button className="button button-primary" type="submit">Submit request</button></form></section><section className="team-history"><div className="team-section-heading"><div><p className="eyebrow">History</p><h2>My requests</h2></div><span>{requests.length} requests</span></div><div className="team-table">{requests.length ? requests.map((request) => <div className="team-row" key={request.id}><strong>{request.startDate} → {request.endDate}</strong><span>{request.reason}</span><b>{request.status}</b></div>) : <p className="team-empty">No leave requests yet.</p>}</div></section></div></main>;
}
