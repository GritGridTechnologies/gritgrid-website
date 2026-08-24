import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { studentRequest } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendGritGridEmail, formatSubmittedFields } from "@/lib/resend";

const required = ["fullName", "email", "projectType", "projectTitle", "requirements"] as const;
const optional = ["phone", "college", "course", "year", "technologyPreference", "deadline", "budgetRange", "additionalRequirements"] as const;
const clean = (value: unknown) => String(value ?? "").trim();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = Object.fromEntries([...required, ...optional].map((key) => [key, clean(body[key])]));
    if (required.some((key) => !values[key])) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    if (values.fullName.length > 120 || values.projectTitle.length > 200 || values.requirements.length > 5000 || values.additionalRequirements.length > 5000) return NextResponse.json({ error: "Please shorten the submitted details and try again." }, { status: 400 });

    const session = await auth.api.getSession({ headers: await headers() });
    const referenceId = `GG-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
    await db.insert(studentRequest).values({
      id: crypto.randomUUID(), referenceId, userId: session?.user?.id,
      fullName: values.fullName, email: values.email, phone: values.phone, college: values.college,
      course: values.course, year: values.year, projectType: values.projectType, projectTitle: values.projectTitle,
      requirements: values.requirements, technologyPreference: values.technologyPreference, deadline: values.deadline,
      budgetRange: values.budgetRange, additionalRequirements: values.additionalRequirements,
    });

    const submitted = formatSubmittedFields([
      ["Request type", "NEW STUDENT PROJECT REQUEST"], ["Reference ID", referenceId], ["Student Name", values.fullName], ["Email", values.email], ["Phone", values.phone], ["College / University", values.college], ["Course", values.course], ["Year", values.year], ["Service / Project Type", values.projectType], ["Project Title", values.projectTitle], ["Technology Preference", values.technologyPreference], ["Deadline", values.deadline], ["Budget / Price Range", values.budgetRange], ["Project Description", values.requirements], ["Additional Requirements", values.additionalRequirements], ["Submitted", new Date().toISOString()],
    ]);
    const delivery = await sendGritGridEmail({ subject: `New Student Project Request — ${referenceId}`, replyTo: values.email, text: submitted });
    if (!delivery.ok) {
      console.error("[student-request] Resend delivery failed", { referenceId, reason: delivery.reason });
      return NextResponse.json({ ok: true, referenceId, emailDelivery: "attention", message: `Request submitted successfully. Reference ID: ${referenceId}. Our team will follow up shortly.` });
    }
    return NextResponse.json({ ok: true, referenceId });
  } catch (error) {
    console.error("[student-request] Request creation failed", error);
    return NextResponse.json({ error: "We could not save your request right now." }, { status: 500 });
  }
}
