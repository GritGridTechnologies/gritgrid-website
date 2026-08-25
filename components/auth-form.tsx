"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthForm({ mode, redirectTo }: { mode: "sign-in" | "sign-up"; redirectTo?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isSignUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setPending(true);
    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) { setError("We could not complete that request. Check your details and try again."); return; }
    router.push(redirectTo ?? (isSignUp ? "/team" : "/admin")); router.refresh();
  }

  return <form className="auth-form" onSubmit={submit}>
    {isSignUp && <label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} /></label>}
    <label>Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
    <label>Password<input required minLength={8} type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" disabled={pending}>{pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button>
  </form>;
}
