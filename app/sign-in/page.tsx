import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect("/admin");
  return <main className="auth-page"><div className="auth-panel"><p className="eyebrow">GritGrid Technologies</p><h1>Sign in to admin</h1><p>Manage enquiries and access your private workspace.</p><AuthForm mode="sign-in" /><p className="auth-switch">Need an account? <Link href="/sign-up">Create one</Link></p></div></main>;
}
