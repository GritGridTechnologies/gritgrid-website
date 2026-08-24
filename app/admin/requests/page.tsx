import { db } from "@/lib/db";
import { studentRequest } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AdminPageGuard } from "@/components/admin-page-guard";

export const metadata = { title: "Project Requests | GritGrid Team Portal", robots: { index: false, follow: false } };

export default async function RequestsPage() {
  const requests = await db.select().from(studentRequest).orderBy(desc(studentRequest.createdAt));
  return <AdminPageGuard><section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Team Portal / Project Requests</p><h1>Student requests</h1><p>Private project briefs and delivery status.</p></div></div><div className="admin-table">{requests.length ? requests.map((request) => <details className="admin-row" key={request.id}><summary><div><strong>{request.projectTitle}</strong><span>{request.fullName} · {request.email}</span></div><span className="status-pill">{request.status}</span></summary><div className="admin-request-details"><p><b>Reference:</b> {request.referenceId}</p><p><b>Service / type:</b> {request.projectType}</p><p><b>Deadline:</b> {request.deadline || "Not provided"}</p><p><b>Budget:</b> {request.budgetRange || "Not provided"}</p><p><b>College:</b> {request.college || "Not provided"}</p><p><b>Technology:</b> {request.technologyPreference || "Not provided"}</p><p><b>Requirements:</b> {request.requirements}</p><p><b>Additional requirements:</b> {request.additionalRequirements || "Not provided"}</p><p><b>Submitted:</b> {request.createdAt.toISOString()}</p></div></details>) : <p>No student requests yet.</p>}</div></section></AdminPageGuard>;
}
