import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

type FinanceOwner = { id: string; name: string; email: string };

export type FinanceAccess =
  | { kind: "anonymous" }
  | { kind: "password-change" }
  | { kind: "forbidden" }
  | { kind: "owner"; owner: FinanceOwner };

export async function getFinanceAccess(): Promise<FinanceAccess> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { kind: "anonymous" };
  const user = session.user as typeof session.user & { role?: string; mustChangePassword?: boolean };
  if (user.mustChangePassword) return { kind: "password-change" };
  if (user.role !== "owner") return { kind: "forbidden" };
  return { kind: "owner", owner: { id: user.id, name: user.name, email: user.email } };
}

export async function requireFinanceOwner() {
  const access = await getFinanceAccess();
  if (access.kind !== "owner") throw new Error("Owner authorization required.");
  return access.owner;
}
