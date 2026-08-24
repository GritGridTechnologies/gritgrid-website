import { NextResponse } from "next/server";
import { isEnquiryCategory } from "../../../lib/enquiry-categories";

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

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_TO_EMAIL;
    if (!apiKey || !recipient) return NextResponse.json({ error: "Enquiry delivery is not configured yet. Please try again later." }, { status: 503 });
    const fields = [
      ["Enquiry Type", values.enquiryType],
      ["Name", values.fullName],
      ["Email", values.email],
      ["Phone", values.phone || "Not provided"],
      ["Organization / College", values.organization || "Not provided"],
      ["Subject", values.subject],
      ["Message", values.requirement],
    ].map(([key, value]) => `${key}: ${value}`).join("\n");
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "GritGrid Technologies <onboarding@resend.dev>", reply_to: String(values.email), to: [recipient], subject: `[${values.enquiryType}] ${values.subject}`, text: fields }) });
    if (!response.ok) return NextResponse.json({ error: "We could not send your enquiry right now. Please try again later." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We could not process your enquiry. Please try again." }, { status: 400 });
  }
}
