import { createHash, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financeExpenseAttachments, financeExpenses } from "@/lib/db/schema";
import { financeAccessStatus, isFinanceSameOrigin } from "@/lib/finance/http";
import { getFinanceAccess } from "@/lib/finance/access";

export const runtime = "nodejs";
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

function matchesFileSignature(type: string, bytes: Buffer) {
  if (type === "application/pdf") return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  if (type === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return false;
}

export async function POST(request: Request, { params }: { params: { expenseId: string } }) {
  if (!isFinanceSameOrigin(request)) return NextResponse.json({ error: "This request could not be verified." }, { status: 403 });
  const access = await getFinanceAccess();
  if (access.kind !== "owner") return NextResponse.json({ error: "Owner access is required to upload receipts." }, { status: financeAccessStatus(access.kind) });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_ATTACHMENT_BYTES + 128_000) return NextResponse.json({ error: "The file exceeds the 4 MB limit." }, { status: 413 });
  if (!/^[A-Za-z0-9:_-]{1,180}$/.test(params.expenseId)) return NextResponse.json({ error: "Expense not found." }, { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "The upload could not be read." }, { status: 400 });
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size < 1) return NextResponse.json({ error: "Choose a receipt or invoice." }, { status: 400 });
  if (file.size > MAX_ATTACHMENT_BYTES) return NextResponse.json({ error: "The file exceeds the 4 MB limit." }, { status: 413 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Only PDF, PNG, and JPEG files are accepted." }, { status: 415 });

  const [expense] = await db.select({ id: financeExpenses.id, status: financeExpenses.status }).from(financeExpenses)
    .where(and(eq(financeExpenses.id, params.expenseId), eq(financeExpenses.status, "active"))).limit(1);
  if (!expense) return NextResponse.json({ error: "Active expense not found." }, { status: 404 });

  const content = Buffer.from(await file.arrayBuffer());
  if (!matchesFileSignature(file.type, content)) return NextResponse.json({ error: "The file content does not match its declared PDF, PNG, or JPEG type." }, { status: 415 });
  const fileName = file.name.replace(/[\u0000-\u001f/\\]/g, "_").trim().slice(0, 180) || "receipt";
  const sha256 = createHash("sha256").update(content).digest("hex");
  const id = randomUUID();
  const [attachment] = await db.transaction((tx) => tx.insert(financeExpenseAttachments).values({
    id,
    expenseId: expense.id,
    fileName,
    mimeType: file.type,
    byteSize: content.length,
    sha256,
    content,
    uploadedBy: access.owner.id,
  }).onConflictDoNothing().returning({ id: financeExpenseAttachments.id }));

  return NextResponse.json({ ok: true, duplicate: !attachment }, { status: attachment ? 201 : 200, headers: { "Cache-Control": "private, no-store" } });
}
