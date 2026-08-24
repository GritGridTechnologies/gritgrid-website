import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function AdminPageGuard({ children }: { children: React.ReactNode }) { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) redirect("/sign-in?next=/admin"); if ((session.user as { role?: string }).role !== "admin") return <main className="admin-page"><section className="admin-section"><p className="eyebrow">Team Portal / Access denied</p><h1>Admin access required.</h1><p className="hero-lead">Your account is signed in, but it does not have the admin role.</p></section></main>; return <>{children}</>; }
