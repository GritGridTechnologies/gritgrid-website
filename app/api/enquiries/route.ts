import { NextResponse } from "next/server";
import { isEnquiryCategory } from "../../../lib/enquiry-categories";
import { sendGritGridEmail, formatSubmittedFields } from "../../../lib/resend";
import { db } from "@/lib/db";
import { inquiry } from "@/lib/db/schema";
import { recordSuccessfulInquiry } from "@/lib/statistics";

const requiredFields = ["enquiryType", "fullName", "email", "subject", "requirement"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = Object.fromEntries(Object.entries(body).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]));
    const missing = requiredFields.filter((field) => !values[field]);
    if (missing.length) return NextResponse.json({ error: `Please complete: ${missing.join(", ")}.` }, { status: 400 });
    if (!isEnquiryCategory(values.enquiryType)) return NextResponse.json({ error: "Please select a valid enquiry type." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email))) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (String(values.fullName).length > 120 || String(values.subject).length > 200 || String(values.requirement).length > 5000) return NextResponse.json({ error: "Please shorten the submitted details and try again." }, { status: 400 });

    const fields = [
      ["Enquiry Type", values.enquiryType],
      ["Name", values.fullName],
      ["Email", values.email],
      ["Phone", values.phone || "Not provided"],
      ["Organization / College", values.organization || "Not provided"],
      ["Subject", values.subject],
      ["Message", values.requirement],
    ].map(([key, value]) => `${key}: ${value}`).join("\n");
    const delivery = await sendGritGridEmail({ replyTo: String(values.email), subject: `[${values.enquiryType}] ${values.subject}`, text: formatSubmittedFields(fields.split("\n").map((line) => { const [key, ...rest] = line.split(": "); return [key, rest.join(": ")]; })) });
    if (!delivery.ok) return NextResponse.json({ error: delivery.reason === "not-configured" ? "Enquiry delivery is not configured yet. Please try again later." : "We could not send your enquiry right now. Please try again later." }, { status: delivery.reason === "not-configured" ? 503 : 502 });
    const [saved] = await db.insert(inquiry).values({ id: crypto.randomUUID(), name: String(values.fullName), email: String(values.email), company: values.organization ? String(values.organization) : null, message: String(values.requirement), status: "new" }).returning({ id: inquiry.id });
    await recordSuccessfulInquiry(saved.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We could not process your enquiry. Please try again." }, { status: 400 });
  }
}
