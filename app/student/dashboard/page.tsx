import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SiteShell, PageHero } from "@/components/site-shell";

export default async function StudentDashboardPage() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) redirect("/sign-in?next=/student/dashboard"); return <SiteShell><PageHero eyebrow="Student dashboard" title={`Welcome back, ${session.user.name}.`} intro="Your project workspace is ready. Request tracking and delivery messages will appear here as your work progresses." /><main className="section"><div className="container student-dashboard-grid"><article className="admin-form-card"><p className="card-kicker">My requests</p><h2>No requests yet</h2><p>Start with a clear project brief and receive a private reference ID.</p><a className="button button-primary" href="/student/request">Request a project →</a></article><article className="admin-form-card"><p className="card-kicker">Workspace</p><h2>Coming soon</h2><p>Messages, project details and delivery files will be added to your workspace.</p></article></div></main></SiteShell>; }
