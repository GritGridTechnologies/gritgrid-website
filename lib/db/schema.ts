import { sql } from "drizzle-orm";
import { boolean, check, customType, date, index, integer, jsonb, numeric, pgTable, text, time, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

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

const financeBytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });

export const financeCategories = pgTable("finance_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  isSystem: boolean("is_system").notNull().default(false),
  createdBy: text("created_by").references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("finance_categories_name_unique_idx").on(sql`lower(btrim(${table.name}))`),
  index("finance_categories_active_name_idx").on(table.name).where(sql`${table.archivedAt} is null`),
  check("finance_categories_name_length", sql`char_length(btrim(${table.name})) between 1 and 80`),
  check("finance_categories_description_length", sql`char_length(${table.description}) <= 500`),
]);

export const financeExpenses = pgTable("finance_expenses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  categoryId: text("category_id").notNull().references(() => financeCategories.id, { onDelete: "restrict" }),
  expenseDate: date("expense_date", { mode: "string" }).notNull(),
  expenseTime: time("expense_time"),
  paymentMethod: text("payment_method").notNull(),
  paidBy: text("paid_by").notNull().default(""),
  vendor: text("vendor").notNull().default(""),
  projectReference: text("project_reference").notNull().default(""),
  referenceNumber: text("reference_number"),
  status: text("status").notNull().default("active"),
  source: text("source").notNull().default("manual"),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  voidedBy: text("voided_by").references(() => user.id, { onDelete: "restrict" }),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
}, (table) => [
  index("finance_expenses_active_date_currency_idx").on(table.expenseDate.desc(), table.currency).where(sql`${table.status} = 'active'`),
  index("finance_expenses_active_category_date_idx").on(table.categoryId, table.expenseDate.desc()).where(sql`${table.status} = 'active'`),
  index("finance_expenses_active_payment_date_idx").on(table.paymentMethod, table.expenseDate.desc()).where(sql`${table.status} = 'active'`),
  index("finance_expenses_vendor_search_idx").using("gin", sql`to_tsvector('simple'::regconfig, coalesce(${table.title}, '') || ' ' || coalesce(${table.vendor}, '') || ' ' || coalesce(${table.description}, '') || ' ' || coalesce(${table.projectReference}, ''))`),
  check("finance_expenses_title_length", sql`char_length(btrim(${table.title})) between 1 and 160`),
  check("finance_expenses_description_length", sql`char_length(${table.description}) <= 4000`),
  check("finance_expenses_amount_positive", sql`${table.amount} > 0`),
  check("finance_expenses_currency_valid", sql`${table.currency} ~ '^[A-Z]{3}$'`),
  check("finance_expenses_payment_method_valid", sql`${table.paymentMethod} in ('cash', 'upi', 'bank_transfer', 'debit_card', 'credit_card', 'other')`),
  check("finance_expenses_vendor_length", sql`char_length(${table.vendor}) <= 160`),
  check("finance_expenses_paid_by_length", sql`char_length(${table.paidBy}) <= 160`),
  check("finance_expenses_project_reference_length", sql`char_length(${table.projectReference}) <= 160`),
  check("finance_expenses_reference_number_length", sql`${table.referenceNumber} is null or char_length(${table.referenceNumber}) <= 120`),
  check("finance_expenses_status_valid", sql`${table.status} in ('active', 'void')`),
  check("finance_expenses_source_valid", sql`${table.source} in ('manual', 'assistant')`),
  check("finance_expenses_idempotency_key_length", sql`char_length(${table.idempotencyKey}) between 1 and 180`),
  check("finance_expenses_void_metadata_consistent", sql`(${table.status} = 'active' and ${table.voidedBy} is null and ${table.voidedAt} is null) or (${table.status} = 'void' and ${table.voidedBy} is not null and ${table.voidedAt} is not null)`),
]);

export const financeExpenseAttachments = pgTable("finance_expense_attachments", {
  id: text("id").primaryKey(),
  expenseId: text("expense_id").notNull().references(() => financeExpenses.id, { onDelete: "restrict" }),
  fileName: text("file_name").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  sha256: text("sha256").notNull(),
  content: financeBytea("content").notNull(),
  uploadedBy: text("uploaded_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("finance_expense_attachments_expense_created_idx").on(table.expenseId, table.createdAt.desc()),
  uniqueIndex("finance_attachment_expense_hash_unique").on(table.expenseId, table.sha256),
  check("finance_attachment_file_name_length", sql`char_length(${table.fileName}) between 1 and 180`),
  check("finance_attachment_mime_valid", sql`${table.mimeType} in ('application/pdf', 'image/jpeg', 'image/png')`),
  check("finance_attachment_size_valid", sql`${table.byteSize} between 1 and 4194304`),
  check("finance_attachment_hash_valid", sql`${table.sha256} ~ '^[a-f0-9]{64}$'`),
  check("finance_attachment_content_size_matches", sql`octet_length(${table.content}) = ${table.byteSize}`),
]);

export const financeBudgets = pgTable("finance_budgets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  budgetType: text("budget_type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("INR"),
  categoryId: text("category_id").references(() => financeCategories.id, { onDelete: "restrict" }),
  projectReference: text("project_reference"),
  periodStart: date("period_start", { mode: "string" }).notNull(),
  periodEnd: date("period_end", { mode: "string" }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: text("created_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: text("updated_by").references(() => user.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("finance_budgets_scope_period_unique_idx").on(table.budgetType, sql`coalesce(${table.categoryId}, '')`, sql`coalesce(${table.projectReference}, '')`, table.currency, table.periodStart, table.periodEnd).where(sql`${table.isActive} = true`),
  index("finance_budgets_active_period_idx").on(table.periodStart, table.periodEnd).where(sql`${table.isActive} = true`),
  check("finance_budgets_name_length", sql`char_length(btrim(${table.name})) between 1 and 120`),
  check("finance_budgets_type_valid", sql`${table.budgetType} in ('company', 'category', 'project')`),
  check("finance_budgets_amount_positive", sql`${table.amount} > 0`),
  check("finance_budgets_currency_valid", sql`${table.currency} ~ '^[A-Z]{3}$'`),
  check("finance_budgets_period_valid", sql`${table.periodStart} <= ${table.periodEnd}`),
  check("finance_budgets_scope_valid", sql`(${table.budgetType} = 'company' and ${table.categoryId} is null and ${table.projectReference} is null) or (${table.budgetType} = 'category' and ${table.categoryId} is not null and ${table.projectReference} is null) or (${table.budgetType} = 'project' and ${table.categoryId} is null and nullif(btrim(${table.projectReference}), '') is not null)`),
]);

export const financeAuditLog = pgTable("finance_audit_log", {
  id: text("id").primaryKey(),
  expenseId: text("expense_id").notNull().references(() => financeExpenses.id, { onDelete: "restrict" }),
  action: text("action").notNull(),
  previousData: jsonb("previous_data"),
  newData: jsonb("new_data").notNull(),
  changedBy: text("changed_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("finance_audit_expense_created_idx").on(table.expenseId, table.createdAt.desc()),
  index("finance_audit_changed_by_created_idx").on(table.changedBy, table.createdAt.desc()),
  check("finance_audit_action_valid", sql`${table.action} in ('created', 'updated', 'voided')`),
]);

export const financeAiDrafts = pgTable("finance_ai_drafts", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  requestDate: date("request_date", { mode: "string" }).notNull(),
  requestHash: text("request_hash").notNull(),
  draftPayload: jsonb("draft_payload").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull().default(sql`now() + interval '24 hours'`),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
}, (table) => [
  uniqueIndex("finance_ai_draft_request_unique").on(table.ownerId, table.requestDate, table.requestHash),
  index("finance_ai_drafts_owner_created_idx").on(table.ownerId, table.createdAt.desc()),
  check("finance_ai_draft_hash_valid", sql`${table.requestHash} ~ '^[a-f0-9]{64}$'`),
  check("finance_ai_draft_status_valid", sql`${table.status} in ('pending', 'confirmed', 'cancelled')`),
  check("finance_ai_draft_confirmation_consistent", sql`(${table.status} = 'confirmed' and ${table.confirmedAt} is not null) or (${table.status} in ('pending', 'cancelled') and ${table.confirmedAt} is null)`),
]);
