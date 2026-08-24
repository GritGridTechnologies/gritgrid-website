import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <section className="admin-section"><div className="admin-heading"><div><p className="eyebrow">Workspace</p><h1>Settings</h1><p>Account details and operational configuration for the admin workspace.</p></div></div><div className="settings-grid"><div className="admin-form-card"><p className="card-kicker">Signed-in account</p><h2>{session?.user.name}</h2><p>{session?.user.email}</p><span className="status-pill live">Admin role</span></div><div className="admin-form-card"><p className="card-kicker">Platform status</p><h2>Connected</h2><p>Neon database and Better Auth sessions are configured for this workspace.</p><span className="status-pill live">Operational</span></div></div></section>;
}
