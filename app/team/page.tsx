import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getManagerTeam, getMyAttendance } from "./actions";
import { getCompanyStatistics } from "@/lib/statistics";
import TeamStatistics from "@/components/team-statistics";
import TeamPortal from "@/components/team-portal";

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/team/sign-in");
  if ((session.user as { mustChangePassword?: boolean }).mustChangePassword) redirect("/change-password");
  const role = (session.user as { role?: string }).role ?? "user";
  if (!["employee", "manager", "owner", "admin"].includes(role)) redirect("/team/sign-in");
  const records = await getMyAttendance();
  const teamRecords = role === "manager" ? await getManagerTeam() : [];
  const statistics = await getCompanyStatistics();
  return <><TeamPortal name={session.user.name} role={role} records={records} teamRecords={teamRecords} /><TeamStatistics data={statistics} role={role} /></>;
}
