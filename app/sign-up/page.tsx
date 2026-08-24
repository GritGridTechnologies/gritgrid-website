import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect("/admin");
  return <main className="auth-page"><div className="auth-panel"><p className="eyebrow">GritGrid Technologies</p><h1>Create admin account</h1><p>Set up secure email and password access for the team.</p><AuthForm mode="sign-up" /><p className="auth-switch">Already have an account? <Link href="/sign-in">Sign in</Link></p></div></main>;
}
