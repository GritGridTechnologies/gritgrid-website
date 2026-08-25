import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { leaveRequest } from "@/lib/db/schema";

export default async function AdminLeavePage() {
  const requests = await db.select().from(leaveRequest).orderBy(desc(leaveRequest.createdAt)).limit(30);
  return <section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">People operations</p><h1>Leave requests</h1><p>Review time-off requests with a clear audit trail.</p></div></div><div className="admin-list">{requests.length ? requests.map((item) => <article className="admin-inquiry" key={item.id}><div><strong>{item.startDate} → {item.endDate}</strong><p>{item.reason}</p></div><span>{item.status}</span></article>) : <p className="empty-state">No leave requests are waiting for review.</p>}</div></section>;
}
