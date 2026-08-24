import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiry, project } from "@/lib/db/schema";

export default async function AdminPage() {
  const [projectCount, inquiryCount, newInquiryCount] = await Promise.all([db.select({ value: count() }).from(project), db.select({ value: count() }).from(inquiry), db.select({ value: count() }).from(inquiry).where(eq(inquiry.status, "new"))]);
  return <section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Control center</p><h1>Overview</h1><p>Manage the public GritGrid platform from one secure workspace.</p></div></div><div className="admin-stats"><div><span>Projects</span><strong>{projectCount[0]?.value ?? 0}</strong><small>Stored in Neon</small></div><div><span>Inquiries</span><strong>{inquiryCount[0]?.value ?? 0}</strong><small>Contact submissions</small></div><div><span>New</span><strong>{newInquiryCount[0]?.value ?? 0}</strong><small>Needs attention</small></div></div><div className="admin-quick-links"><a href="/admin/projects"><strong>Manage projects</strong><span>Create and edit portfolio entries →</span></a><a href="/admin/inquiries"><strong>Review inquiries</strong><span>Track contact requests and statuses →</span></a><a href="/admin/settings"><strong>Workspace settings</strong><span>Account and platform controls →</span></a></div></section>;
}
