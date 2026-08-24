export const ENQUIRY_CATEGORIES = [
  "Business & Corporate",
  "Software & Technology Services",
  "AI & Data Solutions",
  "Cloud & Digital Solutions",
  "Education & Institutions",
  "Students",
  "College / University Projects",
  "Academic / Research Projects",
  "Internship / Careers",
  "Partnership / Collaboration",
  "General Enquiry",
  "Other",
] as const;

export type EnquiryCategory = (typeof ENQUIRY_CATEGORIES)[number];

export function isEnquiryCategory(value: unknown): value is EnquiryCategory {
  return typeof value === "string" && ENQUIRY_CATEGORIES.includes(value as EnquiryCategory);
}
