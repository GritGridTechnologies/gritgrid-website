import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteShell, PageHero } from "@/components/site-shell";

export default async function StudentSessionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in?next=/student/sessions");
  return <SiteShell><PageHero eyebrow="Explanation sessions" title="Prepare to explain your work." intro="Request technical mentoring, code walkthroughs, methodology explanation, presentation preparation, or viva coaching." /><main className="section"><div className="container student-dashboard-grid"><article className="admin-form-card"><p className="card-kicker">Indicative hourly rates</p><h2>Support that builds understanding.</h2><p>Undergraduate: $15–$30/hour. Postgraduate: $25–$50/hour. Doctoral: $40–$75+/hour.</p><p className="pricing-disclaimer">Pricing is indicative and negotiable based on project complexity, academic level, duration and support required.</p></article><article className="admin-form-card"><p className="card-kicker">Request a session</p><form className="admin-form" action="/student/sessions"><select name="type" defaultValue="code"><option value="explanation">Project explanation</option><option value="code">Code walkthrough</option><option value="methodology">Methodology explanation</option><option value="presentation">Presentation preparation</option><option value="viva">Viva preparation</option></select><input name="topic" placeholder="Topic or project reference" required /><input name="preferredDate" type="date" required /><textarea name="description" placeholder="What would you like to understand?" required /><button className="button button-primary" type="submit">Request session</button></form></article></div></main></SiteShell>;
}
