import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financeExpenseAttachments } from "@/lib/db/schema";
import { financeAccessStatus } from "@/lib/finance/http";
import { getFinanceAccess } from "@/lib/finance/access";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { attachmentId: string } }) {
  const access = await getFinanceAccess();
  if (access.kind !== "owner") return NextResponse.json({ error: "Owner access is required to view receipts." }, { status: financeAccessStatus(access.kind), headers: { "Cache-Control": "private, no-store" } });
  if (!/^[A-Za-z0-9:_-]{1,180}$/.test(params.attachmentId)) return NextResponse.json({ error: "Receipt not found." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  const [attachment] = await db.select({ fileName: financeExpenseAttachments.fileName, mimeType: financeExpenseAttachments.mimeType, content: financeExpenseAttachments.content })
    .from(financeExpenseAttachments).where(eq(financeExpenseAttachments.id, params.attachmentId)).limit(1);
  if (!attachment) return NextResponse.json({ error: "Receipt not found." }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
  const filename = encodeURIComponent(attachment.fileName).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  return new Response(new Uint8Array(attachment.content), {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Length": String(attachment.content.length),
    },
  });
}
