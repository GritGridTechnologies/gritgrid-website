"use server";

import { and, asc, count, countDistinct, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { privateDiaryNote, sharedDiaryEntry, user } from "@/lib/db/schema";

const TEAM_ROLES = ["employee", "manager", "owner", "admin"] as const;
const PAGE_SIZE = 20;
const PRIVATE_CATEGORIES = ["Personal Notes", "Technical Notes", "Important Links", "Server & Infrastructure", "IP References", "Project References", "Reminders", "Other"];

type TeamRole = (typeof TEAM_ROLES)[number];
type TeamMember = { id: string; name: string; role: TeamRole; mustChangePassword?: boolean };
type DiaryPeriod = "day" | "week" | "month";
type PrivateNoteInput = { id?: string | null; title: string; content: string; category: string; tags: string[] };
type SharedEntryInput = { id?: string | null; workDate: string; workSummary: string; completedTasks: string; ongoingTasks: string; blockers: string; nextDayPlan: string; projectReference: string; links: string };
type SharedFilters = { query?: string; page?: number; period?: DiaryPeriod; anchor?: string; employeeId?: string; role?: string; project?: string };

async function requireTeamMember(): Promise<TeamMember> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Please sign in to access the team diary.");
  const signedInUser = session.user as typeof session.user & { role?: string; mustChangePassword?: boolean };
  if (signedInUser.mustChangePassword) throw new Error("Change your password before using the team diary.");
  const role = signedInUser.role;
  if (!role || !TEAM_ROLES.includes(role as TeamRole)) throw new Error("You do not have access to the team diary.");
  return { id: signedInUser.id, name: signedInUser.name, role: role as TeamRole, mustChangePassword: signedInUser.mustChangePassword };
}

function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function dateRange(anchor: string, period: DiaryPeriod) {
  const start = new Date(`${anchor}T00:00:00.000Z`);
  if (period === "week") {
    const mondayOffset = (start.getUTCDay() + 6) % 7;
    start.setUTCDate(start.getUTCDate() - mondayOffset);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
  }
  if (period === "month") {
    start.setUTCDate(1);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1, 0);
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
  }
  return { from: anchor, to: anchor };
}

function safeText(value: unknown, maxLength: number, label: string, required = false) {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const normalized = value.replace(/\0/g, "").trim();
  if (required && !normalized) throw new Error(`${label} is required.`);
  if (normalized.length > maxLength) throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  return normalized;
}

function credentialLike(value: string) {
  const patterns = [
    /\b(?:password|passwd|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|secret)\s*[:=]\s*["']?(?!(?:your|replace|placeholder|redacted|process\.env|<))[A-Za-z0-9_./+=-]{12,}/i,
    /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|sk_(?:live|test)_[A-Za-z0-9]{16,}|xox[baprs]-[A-Za-z0-9-]{16,})\b/,
    /\bBearer\s+[A-Za-z0-9._~+/-]{20,}/i,
    /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
  ];
  return patterns.some((pattern) => pattern.test(value));
}

function rejectCredentials(values: string[]) {
  if (values.some(credentialLike)) {
    throw new Error("Diary entries cannot store passwords, API keys, access tokens, or private keys. Save a secure vault reference instead.");
  }
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) throw new Error("Tags must be a list.");
  const tags = value.map((tag) => safeText(tag, 32, "Each tag")).filter(Boolean).map((tag) => tag.toLowerCase());
  const uniqueTags: string[] = [];
  const seen = new Set<string>();
  for (const tag of tags) {
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueTags.push(tag);
    }
  }
  if (uniqueTags.length > 10) throw new Error("Use no more than 10 tags per note.");
  return uniqueTags;
}

function normalizedSearch(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}

function pageNumber(value: unknown) {
  const parsed = typeof value === "number" ? Math.floor(value) : Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(10000, parsed)) : 1;
}

function privateSearchCondition(query: string) {
  if (!query) return undefined;
  const textMatch = sql`to_tsvector('simple'::regconfig, coalesce(${privateDiaryNote.title}, '') || ' ' || coalesce(${privateDiaryNote.content}, '') || ' ' || coalesce(${privateDiaryNote.category}, '')) @@ plainto_tsquery('simple'::regconfig, ${query})`;
  const tagMatch = sql`${privateDiaryNote.tags} @> ARRAY[${query.toLowerCase()}]::text[]`;
  return or(textMatch, tagMatch);
}

function sharedSearchCondition(query: string) {
  if (!query) return undefined;
  return sql`to_tsvector('simple'::regconfig, coalesce(${sharedDiaryEntry.workSummary}, '') || ' ' || coalesce(${sharedDiaryEntry.completedTasks}, '') || ' ' || coalesce(${sharedDiaryEntry.ongoingTasks}, '') || ' ' || coalesce(${sharedDiaryEntry.blockers}, '') || ' ' || coalesce(${sharedDiaryEntry.nextDayPlan}, '') || ' ' || coalesce(${sharedDiaryEntry.projectReference}, '')) @@ plainto_tsquery('simple'::regconfig, ${query})`;
}

async function privateNotesFor(userId: string, query: string, category: string, page: number) {
  const where = and(
    eq(privateDiaryNote.userId, userId),
    category ? eq(privateDiaryNote.category, category) : undefined,
    privateSearchCondition(query),
  );
  const offset = (page - 1) * PAGE_SIZE;
  const [items, totalRows, categoryRows] = await Promise.all([
    db.select({ id: privateDiaryNote.id, title: privateDiaryNote.title, content: privateDiaryNote.content, category: privateDiaryNote.category, tags: privateDiaryNote.tags, createdAt: privateDiaryNote.createdAt, updatedAt: privateDiaryNote.updatedAt })
      .from(privateDiaryNote).where(where).orderBy(desc(privateDiaryNote.updatedAt)).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(privateDiaryNote).where(where),
    db.selectDistinct({ category: privateDiaryNote.category }).from(privateDiaryNote).where(eq(privateDiaryNote.userId, userId)).orderBy(asc(privateDiaryNote.category)),
  ]);
  const total = totalRows[0]?.total ?? 0;
  return { items, total, page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)), categories: categoryRows.map((item) => item.category) };
}

function normalizeSharedFilters(filters: SharedFilters) {
  const period: DiaryPeriod = filters.period === "week" || filters.period === "month" ? filters.period : "day";
  const requestedAnchor = typeof filters.anchor === "string" ? filters.anchor : "";
  const anchor = isValidDate(requestedAnchor) ? requestedAnchor : todayInIndia();
  const role = TEAM_ROLES.includes(filters.role as TeamRole) ? filters.role : "";
  return {
    query: normalizedSearch(filters.query),
    page: pageNumber(filters.page),
    period,
    anchor,
    employeeId: typeof filters.employeeId === "string" ? filters.employeeId.slice(0, 128) : "",
    role,
    project: typeof filters.project === "string" ? filters.project.trim().slice(0, 120) : "",
  };
}

async function sharedEntriesFor(memberId: string, filters: SharedFilters) {
  const normalized = normalizeSharedFilters(filters);
  const range = dateRange(normalized.anchor, normalized.period);
  const escapedProject = normalized.project.replace(/[\\%_]/g, "\\$&");
  const where = and(
    or(eq(sharedDiaryEntry.status, "published"), eq(sharedDiaryEntry.userId, memberId)),
    gte(sharedDiaryEntry.workDate, range.from),
    lte(sharedDiaryEntry.workDate, range.to),
    normalized.employeeId ? eq(sharedDiaryEntry.userId, normalized.employeeId) : undefined,
    normalized.role ? eq(user.role, normalized.role) : undefined,
    escapedProject ? ilike(sharedDiaryEntry.projectReference, `%${escapedProject}%`) : undefined,
    sharedSearchCondition(normalized.query),
  );
  const offset = (normalized.page - 1) * PAGE_SIZE;
  const [items, totalRows] = await Promise.all([
    db.select({
      id: sharedDiaryEntry.id,
      workDate: sharedDiaryEntry.workDate,
      workSummary: sharedDiaryEntry.workSummary,
      completedTasks: sharedDiaryEntry.completedTasks,
      ongoingTasks: sharedDiaryEntry.ongoingTasks,
      blockers: sharedDiaryEntry.blockers,
      nextDayPlan: sharedDiaryEntry.nextDayPlan,
      projectReference: sharedDiaryEntry.projectReference,
      links: sharedDiaryEntry.links,
      status: sharedDiaryEntry.status,
      createdAt: sharedDiaryEntry.createdAt,
      updatedAt: sharedDiaryEntry.updatedAt,
      publishedAt: sharedDiaryEntry.publishedAt,
      member: { id: user.id, name: user.name, role: user.role, image: user.image },
    }).from(sharedDiaryEntry).innerJoin(user, eq(sharedDiaryEntry.userId, user.id)).where(where)
      .orderBy(desc(sharedDiaryEntry.workDate), desc(sharedDiaryEntry.updatedAt)).limit(PAGE_SIZE).offset(offset),
    db.select({ total: count() }).from(sharedDiaryEntry).innerJoin(user, eq(sharedDiaryEntry.userId, user.id)).where(where),
  ]);
  const total = totalRows[0]?.total ?? 0;
  return { items, total, page: normalized.page, pageSize: PAGE_SIZE, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

async function diaryPeople() {
  return db.selectDistinct({ id: user.id, name: user.name, role: user.role, image: user.image })
    .from(user).where(inArray(user.role, [...TEAM_ROLES])).orderBy(asc(user.name));
}

async function diaryDashboard(today: string) {
  const lookback = new Date(`${today}T00:00:00.000Z`);
  lookback.setUTCDate(lookback.getUTCDate() - 6);
  const lookbackDate = lookback.toISOString().slice(0, 10);
  const [todayRows, recentUpdates, blockers] = await Promise.all([
    db.select({ updates: count(), contributors: countDistinct(sharedDiaryEntry.userId) }).from(sharedDiaryEntry)
      .where(and(eq(sharedDiaryEntry.workDate, today), eq(sharedDiaryEntry.status, "published"))),
    db.select({
      id: sharedDiaryEntry.id,
      workDate: sharedDiaryEntry.workDate,
      workSummary: sharedDiaryEntry.workSummary,
      status: sharedDiaryEntry.status,
      member: { name: user.name, role: user.role },
    }).from(sharedDiaryEntry).innerJoin(user, eq(sharedDiaryEntry.userId, user.id))
      .where(eq(sharedDiaryEntry.status, "published"))
      .orderBy(desc(sharedDiaryEntry.workDate), desc(sharedDiaryEntry.updatedAt)).limit(5),
    db.select({
      id: sharedDiaryEntry.id,
      workDate: sharedDiaryEntry.workDate,
      blockers: sharedDiaryEntry.blockers,
      projectReference: sharedDiaryEntry.projectReference,
      member: { name: user.name, role: user.role },
    }).from(sharedDiaryEntry).innerJoin(user, eq(sharedDiaryEntry.userId, user.id))
      .where(and(eq(sharedDiaryEntry.status, "published"), gte(sharedDiaryEntry.workDate, lookbackDate), sql`length(trim(${sharedDiaryEntry.blockers})) > 0`))
      .orderBy(desc(sharedDiaryEntry.workDate), desc(sharedDiaryEntry.updatedAt)).limit(5),
  ]);
  return { todayUpdates: todayRows[0]?.updates ?? 0, todayContributors: todayRows[0]?.contributors ?? 0, recentUpdates, blockers };
}

async function myEntryForDate(userId: string, workDate: string) {
  const [entry] = await db.select({
    id: sharedDiaryEntry.id,
    workDate: sharedDiaryEntry.workDate,
    workSummary: sharedDiaryEntry.workSummary,
    completedTasks: sharedDiaryEntry.completedTasks,
    ongoingTasks: sharedDiaryEntry.ongoingTasks,
    blockers: sharedDiaryEntry.blockers,
    nextDayPlan: sharedDiaryEntry.nextDayPlan,
    projectReference: sharedDiaryEntry.projectReference,
    links: sharedDiaryEntry.links,
    status: sharedDiaryEntry.status,
    createdAt: sharedDiaryEntry.createdAt,
    updatedAt: sharedDiaryEntry.updatedAt,
    publishedAt: sharedDiaryEntry.publishedAt,
  }).from(sharedDiaryEntry).where(and(eq(sharedDiaryEntry.userId, userId), eq(sharedDiaryEntry.workDate, workDate))).limit(1);
  return entry ?? null;
}

export async function getDiaryInitialData() {
  const member = await requireTeamMember();
  const today = todayInIndia();
  const [privateNotes, shared, dashboard, people, myTodayEntry] = await Promise.all([
    privateNotesFor(member.id, "", "", 1),
    sharedEntriesFor(member.id, { period: "day", anchor: today, page: 1 }),
    diaryDashboard(today),
    diaryPeople(),
    myEntryForDate(member.id, today),
  ]);
  return { viewerId: member.id, viewerRole: member.role, today, privateNotes, shared, dashboard, people, myTodayEntry };
}

export async function getPrivateDiaryPage(filters: { query?: string; category?: string; page?: number }) {
  const member = await requireTeamMember();
  const query = normalizedSearch(filters?.query);
  const category = typeof filters?.category === "string" ? filters.category.trim().slice(0, 64) : "";
  return privateNotesFor(member.id, query, category, pageNumber(filters?.page));
}

export async function getSharedDiaryPage(filters: SharedFilters) {
  const member = await requireTeamMember();
  return sharedEntriesFor(member.id, filters ?? {});
}

export async function getMyDiaryEntry(workDate: string) {
  const member = await requireTeamMember();
  if (!isValidDate(workDate)) throw new Error("Choose a valid work date.");
  return myEntryForDate(member.id, workDate);
}

export async function savePrivateDiaryNote(input: PrivateNoteInput) {
  const member = await requireTeamMember();
  const title = safeText(input?.title, 160, "Title", true);
  const content = safeText(input?.content, 20000, "Note content");
  const category = safeText(input?.category, 64, "Category", true);
  if (!PRIVATE_CATEGORIES.includes(category) && category.length < 2) throw new Error("Custom categories must be at least 2 characters.");
  const tags = normalizeTags(input?.tags);
  rejectCredentials([title, content, category, ...tags]);
  const id = typeof input?.id === "string" ? safeText(input.id, 128, "Note ID") : "";
  const now = new Date();
  if (id) {
    const [updated] = await db.update(privateDiaryNote).set({ title, content, category, tags, updatedAt: now })
      .where(and(eq(privateDiaryNote.id, id), eq(privateDiaryNote.userId, member.id))).returning({ id: privateDiaryNote.id });
    if (!updated) throw new Error("Note not found or access denied.");
    revalidatePath("/team/diary");
    return { id: updated.id, updated: true };
  }
  const [created] = await db.insert(privateDiaryNote).values({ id: crypto.randomUUID(), userId: member.id, title, content, category, tags, createdAt: now, updatedAt: now }).returning({ id: privateDiaryNote.id });
  revalidatePath("/team/diary");
  return { id: created.id, updated: false };
}

export async function deletePrivateDiaryNote(id: string) {
  const member = await requireTeamMember();
  const safeId = safeText(id, 128, "Note ID", true);
  const [deleted] = await db.delete(privateDiaryNote).where(and(eq(privateDiaryNote.id, safeId), eq(privateDiaryNote.userId, member.id))).returning({ id: privateDiaryNote.id });
  if (!deleted) throw new Error("Note not found or access denied.");
  revalidatePath("/team/diary");
  return { id: deleted.id };
}

function normalizeLinks(value: unknown) {
  const links = safeText(value, 2000, "Links");
  const entries = links.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  if (entries.length > 10) throw new Error("Add no more than 10 links.");
  for (const link of entries) {
    let parsed: URL;
    try { parsed = new URL(link); } catch { throw new Error("Each link must be a complete URL beginning with https:// or http://."); }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Only web links beginning with https:// or http:// are allowed.");
  }
  return entries.join("\n");
}

export async function saveSharedDiaryEntry(input: SharedEntryInput, status: "draft" | "published") {
  const member = await requireTeamMember();
  if (status !== "draft" && status !== "published") throw new Error("Invalid diary status.");
  const workDate = safeText(input?.workDate, 10, "Work date", true);
  if (!isValidDate(workDate)) throw new Error("Choose a valid work date.");
  const values = {
    workDate,
    workSummary: safeText(input?.workSummary, 4000, "Work summary", true),
    completedTasks: safeText(input?.completedTasks, 4000, "Completed tasks"),
    ongoingTasks: safeText(input?.ongoingTasks, 4000, "Work in progress"),
    blockers: safeText(input?.blockers, 4000, "Blockers"),
    nextDayPlan: safeText(input?.nextDayPlan, 4000, "Next-day plan"),
    projectReference: safeText(input?.projectReference, 500, "Project or ticket references"),
    links: normalizeLinks(input?.links),
  };
  rejectCredentials(Object.values(values));
  const now = new Date();
  const publishedAt = status === "published" ? now : null;
  const id = typeof input?.id === "string" ? safeText(input.id, 128, "Entry ID") : "";
  if (id) {
    const [saved] = await db.update(sharedDiaryEntry).set({ ...values, status, publishedAt: status === "published" ? sql`coalesce(${sharedDiaryEntry.publishedAt}, ${now})` : null, updatedAt: now })
      .where(and(eq(sharedDiaryEntry.id, id), eq(sharedDiaryEntry.userId, member.id))).returning({ id: sharedDiaryEntry.id });
    if (!saved) throw new Error("Diary entry not found or access denied.");
    revalidatePath("/team/diary");
    return { id: saved.id, status, created: false };
  }
  const [created] = await db.insert(sharedDiaryEntry).values({ id: crypto.randomUUID(), userId: member.id, ...values, status, publishedAt, createdAt: now, updatedAt: now })
    .onConflictDoNothing({ target: [sharedDiaryEntry.userId, sharedDiaryEntry.workDate] }).returning({ id: sharedDiaryEntry.id });
  if (!created) throw new Error("You already have an entry for this work date. Open your update from the timeline to edit it.");
  revalidatePath("/team/diary");
  return { id: created.id, status, created: true };
}

export async function deleteSharedDiaryEntry(id: string) {
  const member = await requireTeamMember();
  const safeId = safeText(id, 128, "Entry ID", true);
  const [deleted] = await db.delete(sharedDiaryEntry).where(and(eq(sharedDiaryEntry.id, safeId), eq(sharedDiaryEntry.userId, member.id))).returning({ id: sharedDiaryEntry.id });
  if (!deleted) throw new Error("Diary entry not found or access denied.");
  revalidatePath("/team/diary");
  return { id: deleted.id };
}
