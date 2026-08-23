"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";

const enquiryTypes = [
  ["Business & Enterprise", "Business solutions, software, automation, AI, data or cloud."],
  ["Education & Institutions", "Schools, colleges, universities and education technology."],
  ["Student", "Guidance, technical assistance, internships or project support."],
  ["College / Academic Project", "Final-year, AI/ML, data, cloud or technical projects."],
  ["Startup / Product Development", "MVPs, SaaS products, websites and technology platforms."],
  ["AI / Data / ML", "Artificial intelligence, analytics, modelling and automation."],
  ["Software / Web Development", "Websites, applications, APIs, dashboards and systems."],
  ["Cloud / DevOps", "Deployment, CI/CD, infrastructure and cloud migration."],
  ["Partnership / Collaboration", "Business, technology and academic collaborations."],
  ["Careers / Internship", "Career opportunities, internships and joining GritGrid."],
  ["Other", "Anything that does not fit the categories above."],
] as const;

const timelineOptions = ["ASAP", "Within 1 month", "1–3 months", "3–6 months", "Just exploring"];
const budgetOptions = ["Not decided", "Under ₹25,000", "₹25,000–₹1 Lakh", "₹1–5 Lakhs", "₹5 Lakhs+", "Prefer to discuss"];

export function ContactForm() {
  const [type, setType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const isAcademic = type === "Student" || type === "College / Academic Project";
  const requirementPlaceholder = useMemo(() => {
    if (type === "College / Academic Project") return "Describe your project, technology stack, current stage, and the type of help you need.";
    if (type === "Business & Enterprise") return "Tell us about your business requirement, goals, current system, and expected outcome.";
    return "Briefly describe your project, business requirement, idea, technical challenge, or what you would like to discuss...";
  }, [type]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!type) {
      setError("Please select what you can help you with before continuing.");
      return;
    }
    setPending(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not send your enquiry. Please try again.");
      setSubmitted(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "We could not send your enquiry. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (submitted) {
    return <div className="contact-success" role="status"><div className="success-icon"><Check aria-hidden="true" /></div><span>Enquiry received</span><h3>Thank you for reaching out.</h3><p>We&apos;ve received your enquiry. The GritGrid team will review it and get back to you soon.</p><button className="text-link" type="button" onClick={() => { setSubmitted(false); setType(""); setFormKey((value) => value + 1); }}>Send another enquiry <ArrowUpRight aria-hidden="true" /></button></div>;
  }

  return <form key={formKey} className="enquiry-form" onSubmit={submit} noValidate>
    <fieldset className="enquiry-types"><legend>What can we help you with?</legend><p className="form-hint">Choose one enquiry type to get started.</p><div className="type-grid">{enquiryTypes.map(([label, description]) => <label className={`type-option${type === label ? " selected" : ""}`} key={label}><input type="radio" name="enquiryType" value={label} checked={type === label} onChange={() => setType(label)} required /><span><strong>{label}</strong><small>{description}</small></span></label>)}</div></fieldset>
    <input type="hidden" name="enquiryType" value={type} />
    <div className="form-fields">
      <div className="form-field"><label htmlFor="fullName">Full Name <b>*</b></label><input id="fullName" name="fullName" required autoComplete="name" /></div>
      <div className="form-field"><label htmlFor="email">Work / College Email <b>*</b></label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="form-field"><label htmlFor="phone">Phone Number</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      <div className="form-field"><label htmlFor="organization">Organization / College / Company</label><input id="organization" name="organization" autoComplete="organization" /></div>
      <div className="form-field"><label htmlFor="location">Location</label><input id="location" name="location" autoComplete="address-level2" /></div>
      <div className="form-field"><label htmlFor="website">Website / LinkedIn <span>(optional)</span></label><input id="website" name="website" type="url" /></div>
      {isAcademic && <><div className="form-field"><label htmlFor="course">Course / Degree</label><input id="course" name="course" /></div><div className="form-field"><label htmlFor="college">College / University</label><input id="college" name="college" /></div><div className="form-field"><label htmlFor="year">Year of Study</label><input id="year" name="year" /></div></>}
      <div className="form-field full"><label htmlFor="requirement">Tell us about your requirement <b>*</b></label><textarea id="requirement" name="requirement" required placeholder={requirementPlaceholder} rows={7} /></div>
      <div className="form-field"><label htmlFor="timeline">Expected Timeline</label><select id="timeline" name="timeline" defaultValue=""><option value="">Select timeline</option>{timelineOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
      <div className="form-field"><label htmlFor="budget">Budget Range <span>(optional)</span></label><select id="budget" name="budget" defaultValue=""><option value="">Select budget</option>{budgetOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="form-submit"><button className="button button-light" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="spin" aria-hidden="true" /> Sending...</> : <>Send Enquiry <ArrowUpRight aria-hidden="true" /></>}</button><p>We&apos;ll only use your details to respond to this enquiry.</p></div>
  </form>;
}

export default ContactForm;

