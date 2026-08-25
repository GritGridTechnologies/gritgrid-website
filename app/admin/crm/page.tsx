import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { lead } from "@/lib/db/schema";

export default async function AdminCrmPage() {
  const leads = await db.select().from(lead).orderBy(desc(lead.createdAt)).limit(30);
  return <section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Revenue operations</p><h1>CRM pipeline</h1><p>Track inbound opportunities and assign clear next actions.</p></div></div><div className="admin-list">{leads.length ? leads.map((item) => <article className="admin-inquiry" key={item.id}><div><strong>{item.name}</strong><p>{item.email}{item.company ? ` · ${item.company}` : ""}</p></div><span>{item.status}</span></article>) : <p className="empty-state">No leads yet. New website enquiries will appear here.</p>}</div></section>;
}
