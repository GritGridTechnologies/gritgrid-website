const RESEND_ENDPOINT = "https://api.resend.com/emails";
export const GRITGRID_SENDER = "GritGrid Technologies <onboarding@resend.dev>";

export async function sendGritGridEmail(input: {
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !recipient) return { ok: false as const, reason: "not-configured" as const };

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: GRITGRID_SENDER,
      reply_to: input.replyTo,
      to: [recipient],
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) return { ok: false as const, reason: "delivery-failed" as const };
  return { ok: true as const };
}

export function formatSubmittedFields(fields: Array<[string, unknown]>) {
  return ["----------------------------------------", ...fields.map(([key, value]) => `${key}: ${value || "Not provided"}`), "----------------------------------------"].join("\n");
}
