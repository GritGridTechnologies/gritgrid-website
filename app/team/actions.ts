"use server";

import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, user } from "@/lib/db/schema";

async function sessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
}

export async function getMyAttendance() {
  const current = await sessionUser();
  return db.select().from(attendance).where(eq(attendance.userId, current.id)).orderBy(desc(attendance.workDate)).limit(30);
}

export async function clockIn() {
  const current = await sessionUser();
  const workDate = new Date().toISOString().slice(0, 10);
  const existing = await db.select().from(attendance).where(and(eq(attendance.userId, current.id), eq(attendance.workDate, workDate))).limit(1);
  if (existing[0]) return existing[0];
  const [record] = await db.insert(attendance).values({ id: crypto.randomUUID(), userId: current.id, workDate, clockIn: new Date() }).returning();
  revalidatePath("/team");
  revalidatePath("/admin/attendance");
  return record;
}

export async function clockOut() {
  const current = await sessionUser();
  const workDate = new Date().toISOString().slice(0, 10);
  const [record] = await db.update(attendance).set({ clockOut: new Date() }).where(and(eq(attendance.userId, current.id), eq(attendance.workDate, workDate), isNull(attendance.clockOut))).returning();
  revalidatePath("/team");
  revalidatePath("/admin/attendance");
  return record ?? null;
}

async function requireAdmin() {
  const current = await sessionUser();
  if ((current as { role?: string }).role !== "admin") throw new Error("Forbidden");
  return current;
}

export async function getTeamAttendance() {
  await requireAdmin();
  return db.select({ record: attendance, member: { id: user.id, name: user.name, email: user.email, role: user.role } }).from(attendance).innerJoin(user, eq(attendance.userId, user.id)).orderBy(desc(attendance.workDate), asc(user.name));
}

export async function getTeamMembers() {
  await requireAdmin();
  return db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }).from(user).orderBy(asc(user.name));
}

export async function updateTeamRole(userId: string, role: "user" | "admin") {
  await requireAdmin();
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId));
  revalidatePath("/admin/team");
  revalidatePath("/team");
}
