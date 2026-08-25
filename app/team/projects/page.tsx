import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workItem } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function TeamProjectsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/team/sign-in?next=/team/projects");
  const items = await db.select().from(workItem).where(eq(workItem.assigneeId, session.user.id)).orderBy(desc(workItem.updatedAt));
  return <main className="team-page"><div className="team-container"><header className="team-header"><div><p className="eyebrow">My projects</p><h1>Assigned work, clearly.</h1><p>Only work assigned to your account appears here.</p></div></header><section className="team-history"><div className="team-section-heading"><div><p className="eyebrow">My tasks</p><h2>Current delivery</h2></div><span>{items.length} items</span></div><div className="team-table">{items.length ? items.map((item) => <div className="team-row" key={item.id}><strong>{item.title}</strong><span>{item.clientName ?? "Internal"}</span><span>{item.priority}</span><b>{item.status}</b></div>) : <p className="team-empty">No assigned work yet.</p>}</div></section></div></main>;
}
