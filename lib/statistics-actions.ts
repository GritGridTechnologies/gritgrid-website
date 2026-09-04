"use server";

import { createProjectUpdate as createProjectUpdateImpl, reviewProjectUpdate as reviewProjectUpdateImpl } from "@/lib/statistics";

export async function createProjectUpdate(...args: Parameters<typeof createProjectUpdateImpl>) {
  return createProjectUpdateImpl(...args);
}

export async function reviewProjectUpdate(...args: Parameters<typeof reviewProjectUpdateImpl>) {
  return reviewProjectUpdateImpl(...args);
}
