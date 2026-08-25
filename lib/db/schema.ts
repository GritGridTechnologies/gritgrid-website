import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  role: text("role").notNull().default("user"),
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

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});
