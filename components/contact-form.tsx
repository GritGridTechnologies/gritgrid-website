"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";

const categories = [
  "Business & Enterprise",
  "Education & Institutions",
  "Students",
  "College Projects",
  "AI & Machine Learning",
  "Software & Web Development",
  "Cloud & DevOps",
  "Data & Analytics",
  "Technology Consulting",
  "Careers & Opportunities",
  "Partnership",
  "General Enquiry",
  "Other",
];

export function ContactForm() {
  const [category, setCategory] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    if (!category) {
      setError("Please select an enquiry category.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not send your enquiry. Please try again.");
      setSubmitted(true);
      form.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not send your enquiry. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return <div className="contact-success" role="status"><div className="success-icon"><Check aria-hidden="true" /></div><span>Enquiry received</span><h3>Thank you for contacting GritGrid.</h3><p>We&apos;ve received your enquiry and will get back to you soon.</p><button className="text-link" type="button" onClick={() => { setSubmitted(false); setCategory(""); }}>Send another enquiry <ArrowUpRight aria-hidden="true" /></button></div>;
  }

  return <form className="enquiry-form" onSubmit={submit} noValidate>
    <div className="category-bar"><label htmlFor="enquiryType">Enquiry category <b>*</b></label><select id="enquiryType" name="enquiryType" value={category} onChange={(event) => setCategory(event.target.value)} required><option value="">Select a category</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
    <div className="form-fields">
      <div className="form-field"><label htmlFor="fullName">Full Name <b>*</b></label><input id="fullName" name="fullName" required autoComplete="name" /></div>
      <div className="form-field"><label htmlFor="email">Email Address <b>*</b></label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="form-field"><label htmlFor="phone">Phone Number <span>(optional)</span></label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      <div className="form-field"><label htmlFor="organization">Company / College / Organization <span>(optional)</span></label><input id="organization" name="organization" autoComplete="organization" /></div>
      <div className="form-field full"><label htmlFor="subject">Subject <b>*</b></label><input id="subject" name="subject" required /></div>
      <div className="form-field full"><label htmlFor="requirement">Message / Requirement <b>*</b></label><textarea id="requirement" name="requirement" required placeholder="Tell us about your requirement, idea, or question..." rows={7} /></div>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-submit"><button className="button button-light" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="spin" aria-hidden="true" /> Sending...</> : <>Send Enquiry <ArrowUpRight aria-hidden="true" /></>}</button><p>We&apos;ll only use your details to respond to this enquiry.</p></div>
  </form>;
}

export default ContactForm;
