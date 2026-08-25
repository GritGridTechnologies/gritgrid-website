import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export default async function TeamSignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user) redirect("/team");
  return <main className="auth-page"><section className="auth-panel"><p className="eyebrow">GritGrid / Team Portal</p><h1>Team access.</h1><p>Sign in with your authorized GritGrid account to access attendance and team tools.</p><AuthForm mode="sign-in" redirectTo="/team" /></section></main>;
}
