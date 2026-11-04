import { sql } from "drizzle-orm";
import { boolean, check, date, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  role: text("role").notNull().default("employee"),
  managerId: text("managerId"),
  mustChangePassword: boolean("mustChangePassword").notNull().default(false),
});

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  liveUrl: text("liveUrl"),
  repoUrl: text("repoUrl"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const studentRequest = pgTable("student_request", {
  id: text("id").primaryKey(), referenceId: text("referenceId").notNull().unique(), userId: text("userId"), fullName: text("fullName").notNull(), email: text("email").notNull(), phone: text("phone"), college: text("college"), course: text("course"), year: text("year"), projectType: text("projectType").notNull(), projectTitle: text("projectTitle").notNull(), requirements: text("requirements").notNull(), technologyPreference: text("technologyPreference"), deadline: text("deadline"), budgetRange: text("budgetRange"), additionalRequirements: text("additionalRequirements"), status: text("status").notNull().default("new"), createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const pricing = pgTable("pricing", {
  id: text("id").primaryKey(), service: text("service").notNull().unique(), rangeLabel: text("rangeLabel"), notes: text("notes"), updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const inquiry = pgTable("inquiry", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  issuer: text("issuer"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const attendance = pgTable("attendance", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  workDate: text("workDate").notNull(),
  clockIn: timestamp("clockIn", { withTimezone: true }).notNull(),
  clockOut: timestamp("clockOut", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
});

export const lead = pgTable("lead", {
  id: text("id").primaryKey(), name: text("name").notNull(), email: text("email").notNull(), company: text("company"), source: text("source").notNull().default("website"), status: text("status").notNull().default("new"), ownerId: text("owner_id"), notes: text("notes"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const workItem = pgTable("work_item", {
  id: text("id").primaryKey(), title: text("title").notNull(), description: text("description"), status: text("status").notNull().default("backlog"), priority: text("priority").notNull().default("medium"), assigneeId: text("assignee_id"), clientName: text("client_name"), dueDate: text("due_date"), createdBy: text("created_by").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leaveRequest = pgTable("leave_request", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), startDate: text("start_date").notNull(), endDate: text("end_date").notNull(), reason: text("reason").notNull(), status: text("status").notNull().default("pending"), reviewedBy: text("reviewed_by"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notification = pgTable("notification", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), title: text("title").notNull(), body: text("body").notNull(), href: text("href"), readAt: timestamp("read_at", { withTimezone: true }), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companyStatistics = pgTable("company_statistics", {
  id: text("id").primaryKey(), internalQueryCount: integer("internal_query_count").notNull().default(0), internalCompletedProjects: integer("internal_completed_projects").notNull().default(0), internalLiveProjects: integer("internal_live_projects").notNull().default(0), publicQueryCount: integer("public_query_count").notNull().default(347), publicCompletedProjects: integer("public_completed_projects").notNull().default(149), publicLiveProjects: integer("public_live_projects").notNull().default(6), updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
export const projectUpdateRequest = pgTable("project_update_request", {
  id: text("id").primaryKey(), type: text("type").notNull(), projectName: text("project_name"), description: text("description"), requestedBy: text("requested_by").notNull(), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(), status: text("status").notNull().default("pending_manager"), managerApproval: text("manager_approval").notNull().default("pending"), ownerApproval: text("owner_approval").notNull().default("pending"), managerApprovedAt: timestamp("manager_approved_at", { withTimezone: true }), ownerApprovedAt: timestamp("owner_approved_at", { withTimezone: true }), rejectionReason: text("rejection_reason"),
});
export const statisticsAuditLog = pgTable("statistics_audit_log", {
  id: text("id").primaryKey(), action: text("action").notNull(), userId: text("user_id").notNull(), previousValue: integer("previous_value").notNull(), newValue: integer("new_value").notNull(), approvalStatus: text("approval_status").notNull(), managerApproval: text("manager_approval").notNull(), ownerApproval: text("owner_approval").notNull(), relatedRequestId: text("related_request_id"), createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const privateDiaryNote = pgTable("private_diary_note", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  category: text("category").notNull().default("Personal Notes"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("private_diary_note_owner_updated_idx").on(table.userId, table.updatedAt.desc()),
  index("private_diary_note_search_idx").using("gin", sql`to_tsvector('simple'::regconfig, coalesce(${table.title}, '') || ' ' || coalesce(${table.content}, '') || ' ' || coalesce(${table.category}, ''))`),
  index("private_diary_note_tags_idx").using("gin", table.tags),
  check("private_diary_note_title_length", sql`char_length(${table.title}) between 1 and 160`),
  check("private_diary_note_content_length", sql`char_length(${table.content}) <= 20000`),
  check("private_diary_note_category_length", sql`char_length(${table.category}) between 1 and 64`),
  check("private_diary_note_tags_limit", sql`cardinality(${table.tags}) <= 10`),
]);

export const sharedDiaryEntry = pgTable("shared_diary_entry", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  workDate: date("work_date", { mode: "string" }).notNull(),
  workSummary: text("work_summary").notNull(),
  completedTasks: text("completed_tasks").notNull().default(""),
  ongoingTasks: text("ongoing_tasks").notNull().default(""),
  blockers: text("blockers").notNull().default(""),
  nextDayPlan: text("next_day_plan").notNull().default(""),
  projectReference: text("project_reference").notNull().default(""),
  links: text("links").notNull().default(""),
  status: text("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("shared_diary_user_date_unique").on(table.userId, table.workDate),
  index("shared_diary_published_date_idx").on(table.workDate.desc(), table.createdAt.desc()).where(sql`${table.status} = 'published'`),
  index("shared_diary_search_idx").using("gin", sql`to_tsvector('simple'::regconfig, coalesce(${table.workSummary}, '') || ' ' || coalesce(${table.completedTasks}, '') || ' ' || coalesce(${table.ongoingTasks}, '') || ' ' || coalesce(${table.blockers}, '') || ' ' || coalesce(${table.nextDayPlan}, '') || ' ' || coalesce(${table.projectReference}, ''))`),
  check("shared_diary_status_valid", sql`${table.status} in ('draft', 'published')`),
  check("shared_diary_summary_length", sql`char_length(${table.workSummary}) between 1 and 4000`),
  check("shared_diary_completed_length", sql`char_length(${table.completedTasks}) <= 4000`),
  check("shared_diary_ongoing_length", sql`char_length(${table.ongoingTasks}) <= 4000`),
  check("shared_diary_blockers_length", sql`char_length(${table.blockers}) <= 4000`),
  check("shared_diary_next_day_length", sql`char_length(${table.nextDayPlan}) <= 4000`),
  check("shared_diary_project_ref_length", sql`char_length(${table.projectReference}) <= 500`),
  check("shared_diary_links_length", sql`char_length(${table.links}) <= 2000`),
  check("shared_diary_publish_timestamp_consistent", sql`(${table.status} = 'draft' and ${table.publishedAt} is null) or (${table.status} = 'published' and ${table.publishedAt} is not null)`),
]);
