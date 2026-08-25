import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyAttendance } from "./actions";
import TeamPortal from "@/components/team-portal";

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/team/sign-in");
  const records = await getMyAttendance();
  return <TeamPortal name={session.user.name} role={(session.user as { role?: string }).role} records={records} />;
}
