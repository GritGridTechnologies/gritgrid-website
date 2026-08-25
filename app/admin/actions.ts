"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { inquiry, project } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireOwnerOrAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || (role !== "admin" && role !== "owner")) throw new Error("Unauthorized");
}

export async function createProject(formData: FormData) {
  await requireOwnerOrAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !slug || !category || !description) throw new Error("Required fields missing");
  await db.insert(project).values({ id: crypto.randomUUID(), title, slug, category, description, status: "draft", featured: false });
  revalidatePath("/admin/projects");
}

export async function updateInquiryStatus(formData: FormData) {
  await requireOwnerOrAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new");
  if (!id || !["new", "in-progress", "resolved"].includes(status)) throw new Error("Invalid inquiry");
  await db.update(inquiry).set({ status }).where(eq(inquiry.id, id));
  revalidatePath("/admin/inquiries");
}
