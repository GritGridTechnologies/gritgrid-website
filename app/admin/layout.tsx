import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  const role = (session.user as { role?: string }).role;
  if (role !== "admin" && role !== "owner") redirect("/");
  return <AdminShell email={session.user.email} role={role}>{children}</AdminShell>;
}
