import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { workItem } from "@/lib/db/schema";

export default async function AdminWorkPage() {
  const work = await db.select().from(workItem).orderBy(desc(workItem.updatedAt)).limit(30);
  return <section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Delivery operations</p><h1>Workboard</h1><p>Keep projects visible, assigned, and moving toward done.</p></div></div><div className="admin-list">{work.length ? work.map((item) => <article className="admin-inquiry" key={item.id}><div><strong>{item.title}</strong><p>{item.clientName ?? "Internal"} · {item.priority} priority</p></div><span>{item.status}</span></article>) : <p className="empty-state">No work items yet. Add delivery tasks as projects are scoped.</p>}</div></section>;
}
