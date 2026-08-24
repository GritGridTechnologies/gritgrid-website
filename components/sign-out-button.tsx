"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  return <button className="button button-primary" onClick={async () => { await authClient.signOut(); router.push("/"); router.refresh(); }}>Sign out</button>;
}
