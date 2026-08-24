import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/sign-out-button";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");
  return <main className="admin-page"><div className="container"><p className="eyebrow">Private workspace</p><h1>Admin dashboard</h1><p className="hero-lead">Signed in as {session.user.email}.</p><SignOutButton /></div></main>;
}
