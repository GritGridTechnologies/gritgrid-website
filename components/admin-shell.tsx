import Link from "next/link";
import SignOutButton from "@/components/sign-out-button";

export default function AdminShell({ children, email }: { children: React.ReactNode; email: string }) {
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="admin-brand">GRITGRID<span>.</span></Link><p className="admin-label">Workspace</p><nav className="admin-nav"><Link href="/admin">Dashboard</Link><Link href="/admin/requests">Project Requests</Link><Link href="/admin/inquiries">Business Enquiries</Link><Link href="/admin/attendance">Attendance</Link><Link href="/admin/team">Team access</Link><Link href="/admin/projects">Projects</Link><Link href="/admin/pricing">Pricing</Link><Link href="/admin/users">Users</Link><Link href="/admin/settings">Settings</Link></nav><div className="admin-user"><span>{email}</span><SignOutButton /></div></aside><main className="admin-main">{children}</main></div>;
}
