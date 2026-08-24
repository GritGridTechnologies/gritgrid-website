import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { inquiry } from "@/lib/db/schema";
import { updateInquiryStatus } from "../actions";

export default async function AdminInquiriesPage() {
  const inquiries = await db.select().from(inquiry).orderBy(desc(inquiry.createdAt));
  return <section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Lead management</p><h1>Inquiries</h1><p>Review contact requests and keep the conversation moving.</p></div></div><div className="admin-table">{inquiries.length === 0 ? <p>No inquiries yet.</p> : inquiries.map((item) => <article className="admin-inquiry" key={item.id}><div><p className="card-kicker">{item.createdAt.toLocaleDateString()}</p><h2>{item.name}</h2><a href={`mailto:${item.email}`}>{item.email}</a>{item.company && <span>{item.company}</span>}<p>{item.message}</p></div><form action={updateInquiryStatus}><input type="hidden" name="id" value={item.id} /><select name="status" defaultValue={item.status}><option value="new">New</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select><button className="button button-secondary" type="submit">Update</button></form></article>)}</div></section>;
}
