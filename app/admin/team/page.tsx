import { getTeamMembers, updateTeamRole } from "@/app/team/actions";

export default async function AdminTeamPage() {
  const members = await getTeamMembers();
  return <div className="admin-page"><section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Team Portal / People</p><h1>Team access.</h1><p className="hero-lead">Manage who can access the Team Portal and admin workspace.</p></div></div><div className="admin-list">{members.map((member) => <article className="admin-inquiry" key={member.id}><div><strong>{member.name}</strong><p>{member.email}</p></div><form action={async (formData) => { "use server"; await updateTeamRole(String(formData.get("userId")), String(formData.get("role")) === "admin" ? "admin" : "user"); }}><input type="hidden" name="userId" value={member.id} /><select name="role" defaultValue={member.role === "admin" ? "admin" : "user"} aria-label={`Role for ${member.name}`}><option value="user">Team member</option><option value="admin">Admin</option></select><button className="button" type="submit">Save role</button></form></article>)}</div></section></div>;
}
