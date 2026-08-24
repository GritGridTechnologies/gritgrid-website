import { db } from "@/lib/db";
import { studentRequest } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminPageGuard } from "@/components/admin-page-guard";
export const metadata = { title: "Project Requests | GritGrid Team Portal", robots: { index: false, follow: false } };
export default async function RequestsPage() { const requests = await db.select().from(studentRequest).orderBy(desc(studentRequest.createdAt)); return <AdminPageGuard><section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Team Portal / Project Requests</p><h1>Student requests</h1><p>Private project briefs and delivery status.</p></div></div><div className="admin-table">{requests.length ? requests.map((request) => <article className="admin-row" key={request.id}><div><strong>{request.projectTitle}</strong><span>{request.fullName} · {request.email}</span></div><span className="status-pill">{request.status}</span></article>) : <p>No student requests yet.</p>}</div></section></AdminPageGuard>; }
