import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDiaryInitialData } from "@/app/team/diary/actions";
import TeamDiary from "@/components/team-diary";

export const metadata: Metadata = {
  title: "Team Diary | GritGrid Technologies",
  description: "Private notes and daily work updates for the authenticated GritGrid Technologies team.",
  robots: { index: false, follow: false },
};

const TEAM_ROLES = ["employee", "manager", "owner", "admin"];

export default async function TeamDiaryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/team/sign-in");
  const user = session.user as typeof session.user & { role?: string; mustChangePassword?: boolean };
  if (user.mustChangePassword) redirect("/change-password");
  if (!user.role || !TEAM_ROLES.includes(user.role)) redirect("/team/sign-in");
  const initialData = await getDiaryInitialData();
  return <TeamDiary initialData={initialData} />;
}
