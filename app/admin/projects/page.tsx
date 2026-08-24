import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { project } from "@/lib/db/schema";
import { createProject } from "../actions";

export default async function AdminProjectsPage() {
  const projects = await db.select().from(project).orderBy(desc(project.createdAt));
  return <section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Content management</p><h1>Projects</h1><p>Create portfolio entries that can be managed independently from the public catalog.</p></div></div><div className="admin-form-card"><h2>Add project</h2><form action={createProject} className="admin-form"><input name="title" placeholder="Project title" required /><input name="slug" placeholder="URL slug" required /><input name="category" placeholder="Category" required /><textarea name="description" placeholder="Short description" required rows={4} /><button className="button button-primary" type="submit">Create Project</button></form></div><div className="admin-table">{projects.length === 0 ? <p>No managed projects yet.</p> : projects.map((item) => <div className="admin-row" key={item.id}><div><strong>{item.title}</strong><span>{item.category}</span></div><span className={`status-pill ${item.status}`}>{item.status}</span></div>)}</div></section>;
}
