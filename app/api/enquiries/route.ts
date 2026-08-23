import { NextResponse } from "next/server";

const requiredFields = ["enquiryType", "fullName", "email", "requirement"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = Object.fromEntries(Object.entries(body).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]));
    const missing = requiredFields.filter((field) => !values[field]);
    if (missing.length) return NextResponse.json({ error: `Please complete: ${missing.join(", ")}.` }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(values.email))) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (String(values.fullName).length > 120 || String(values.requirement).length > 5000) return NextResponse.json({ error: "Please shorten the submitted details and try again." }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    const recipient = process.env.CONTACT_TO_EMAIL || "hello@gritgrid.in";
    if (!apiKey) return NextResponse.json({ error: "Enquiry delivery is not configured yet. Please email hello@gritgrid.in directly." }, { status: 503 });

    const fields = Object.entries(values).filter(([key, value]) => key !== "website" || value).map(([key, value]) => `${key}: ${value || "—"}`).join("\n");
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.CONTACT_FROM_EMAIL || "GritGrid Enquiries <onboarding@resend.dev>", to: [recipient], reply_to: String(values.email), subject: `${values.enquiryType}: ${values.fullName}`, text: fields }) });
    if (!response.ok) return NextResponse.json({ error: "We could not send your enquiry right now. Please email hello@gritgrid.in directly." }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We could not process your enquiry. Please try again." }, { status: 400 });
  }
}
