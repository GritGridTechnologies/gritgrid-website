"use server";

import { and, asc, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { attendance, user, lead, workItem, leaveRequest, notification } from "@/lib/db/schema";

export type OrgRole = "owner" | "manager" | "employee" | "user" | "admin";

export async function changePassword(currentPassword: string, newPassword: string) {
  const member = await currentUser();
  if (newPassword.length < 8 || newPassword === currentPassword) throw new Error("Choose a different password with at least 8 characters.");
  await auth.api.changePassword({ body: { currentPassword, newPassword, revokeOtherSessions: false }, headers: await headers() });
  await db.update(user).set({ mustChangePassword: false, updatedAt: new Date() }).where(eq(user.id, member.id));
  revalidatePath("/team");
}
type CurrentUser = { id: string; name: string; email: string; role?: string; managerId?: string | null };

async function currentUser(): Promise<CurrentUser> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user as CurrentUser;
}

function isOwner(member: CurrentUser) { return member.role === "owner"; }

async function requireOwner() {
  const member = await currentUser();
  if (!isOwner(member)) throw new Error("Forbidden");
  return member;
}

export async function getMyAttendance() {
  const member = await currentUser();
  return db.select().from(attendance).where(eq(attendance.userId, member.id)).orderBy(desc(attendance.workDate)).limit(30);
}

export async function clockIn() {
  const member = await currentUser();
  const workDate = new Date().toISOString().slice(0, 10);
  const existing = await db.select().from(attendance).where(and(eq(attendance.userId, member.id), eq(attendance.workDate, workDate))).limit(1);
  if (existing[0]) return existing[0];
  const [record] = await db.insert(attendance).values({ id: crypto.randomUUID(), userId: member.id, workDate, clockIn: new Date() }).returning();
  revalidatePath("/team");
  return record;
}

export async function clockOut() {
  const member = await currentUser();
  const workDate = new Date().toISOString().slice(0, 10);
  const [record] = await db.update(attendance).set({ clockOut: new Date() }).where(and(eq(attendance.userId, member.id), eq(attendance.workDate, workDate), isNull(attendance.clockOut))).returning();
  revalidatePath("/team");
  return record ?? null;
}

export async function getManagerTeam() {
  const member = await currentUser();
  if (member.role !== "manager") throw new Error("Forbidden");
  const members = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role }).from(user).where(eq(user.managerId, member.id)).orderBy(asc(user.name));
  const ids = [member.id, ...members.map((item) => item.id)];
  return db.select({ record: attendance, member: { id: user.id, name: user.name, email: user.email, role: user.role } }).from(attendance).innerJoin(user, eq(attendance.userId, user.id)).where(or(...ids.map((id) => eq(attendance.userId, id)))).orderBy(desc(attendance.workDate), asc(user.name));
}

export async function getOrganization() {
  await requireOwner();
  const members = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role, managerId: user.managerId, createdAt: user.createdAt }).from(user).orderBy(asc(user.name));
  return { owners: members.filter((item) => item.role === "owner" || item.role === "admin"), managers: members.filter((item) => item.role === "manager"), employees: members.filter((item) => item.role === "employee"), unassigned: members.filter((item) => item.role === "user") };
}

export async function getCompanyAttendance() {
  await requireOwner();
  return db.select({ record: attendance, member: { id: user.id, name: user.name, email: user.email, role: user.role, managerId: user.managerId } }).from(attendance).innerJoin(user, eq(attendance.userId, user.id)).orderBy(desc(attendance.workDate), asc(user.name));
}

export async function changeRole(userId: string, nextRole: "employee" | "manager" | "user", managerId: string | null) {
  const owner = await requireOwner();
  if (userId === owner.id) throw new Error("You cannot change your own owner access.");
  if (managerId === userId) throw new Error("A user cannot manage themselves.");
  if (nextRole === "manager" && managerId) throw new Error("Managers cannot be assigned to a manager.");
  if (nextRole === "employee" && managerId) {
    const [manager] = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.id, managerId)).limit(1);
    if (!manager || manager.role !== "manager") throw new Error("Invalid manager assignment.");
  }
  await db.update(user).set({ role: nextRole, managerId: nextRole === "employee" ? managerId : null, updatedAt: new Date() }).where(eq(user.id, userId));
  revalidatePath("/admin/team");
  revalidatePath("/team");
}

export async function getMyLeaveRequests() {
  const member = await currentUser();
  return db.select().from(leaveRequest).where(eq(leaveRequest.userId, member.id)).orderBy(desc(leaveRequest.createdAt));
}

export async function requestLeave(startDate: string, endDate: string, reason: string) {
  const member = await currentUser();
  if (!startDate || !endDate || !reason.trim() || reason.length > 500 || endDate < startDate) throw new Error("Enter valid leave dates and a short reason.");
  const [request] = await db.insert(leaveRequest).values({ id: crypto.randomUUID(), userId: member.id, startDate, endDate, reason: reason.trim() }).returning();
  revalidatePath("/team");
  return request;
}

export async function getMyNotifications() {
  const member = await currentUser();
  return db.select().from(notification).where(eq(notification.userId, member.id)).orderBy(desc(notification.createdAt)).limit(30);
}

export async function markNotificationRead(id: string) {
  const member = await currentUser();
  await db.update(notification).set({ readAt: new Date() }).where(and(eq(notification.id, id), eq(notification.userId, member.id)));
  revalidatePath("/team");
}

export async function reviewLeave(id: string, status: "approved" | "rejected") {
  const reviewer = await currentUser();
  if (reviewer.role !== "owner" && reviewer.role !== "manager") throw new Error("Forbidden");
  const request = await db.select().from(leaveRequest).where(eq(leaveRequest.id, id)).limit(1);
  if (!request[0]) throw new Error("Leave request not found.");
  if (reviewer.role === "manager") {
    const employee = await db.select({ managerId: user.managerId }).from(user).where(eq(user.id, request[0].userId)).limit(1);
    if (employee[0]?.managerId !== reviewer.id) throw new Error("Forbidden");
  }
  await db.update(leaveRequest).set({ status, reviewedBy: reviewer.id, updatedAt: new Date() }).where(eq(leaveRequest.id, id));
  await db.insert(notification).values({ id: crypto.randomUUID(), userId: request[0].userId, title: `Leave request ${status}`, body: `Your request for ${request[0].startDate} to ${request[0].endDate} was ${status}.`, href: "/team" });
  revalidatePath("/admin/leave");
  revalidatePath("/team");
}

export async function updateLeadStatus(id: string, status: "new" | "qualified" | "won" | "lost") {
  await requireOwner();
  await db.update(lead).set({ status, updatedAt: new Date() }).where(eq(lead.id, id));
  revalidatePath("/admin/crm");
}

export async function updateWorkStatus(id: string, status: "backlog" | "in-progress" | "blocked" | "done") {
  const member = await currentUser();
  const item = await db.select().from(workItem).where(eq(workItem.id, id)).limit(1);
  if (!item[0] || (member.role !== "owner" && member.role !== "manager" && item[0].assigneeId !== member.id)) throw new Error("Forbidden");
  await db.update(workItem).set({ status, updatedAt: new Date() }).where(eq(workItem.id, id));
  revalidatePath("/admin/work");
}

export async function getScopedAttendance(startDate?: string, endDate?: string) {
  const member = await currentUser();
  const dateFilter = startDate && endDate ? and(gte(attendance.workDate, startDate), lte(attendance.workDate, endDate)) : undefined;
  if (isOwner(member)) return db.select({ record: attendance, member: { id: user.id, name: user.name, role: user.role, managerId: user.managerId } }).from(attendance).innerJoin(user, eq(attendance.userId, user.id)).where(dateFilter).orderBy(desc(attendance.workDate));
  if (member.role === "manager") return db.select({ record: attendance, member: { id: user.id, name: user.name, role: user.role, managerId: user.managerId } }).from(attendance).innerJoin(user, eq(attendance.userId, user.id)).where(and(or(eq(attendance.userId, member.id), eq(user.managerId, member.id)), dateFilter)).orderBy(desc(attendance.workDate));
  return db.select({ record: attendance, member: { id: user.id, name: user.name, role: user.role, managerId: user.managerId } }).from(attendance).innerJoin(user, eq(attendance.userId, member.id)).where(and(eq(attendance.userId, member.id), dateFilter)).orderBy(desc(attendance.workDate));
}
