"use client";

import { useState } from "react";
import { BriefcaseBusiness, ChevronDown, GraduationCap, ShieldCheck } from "lucide-react";

const modes = [
  { label: "Business", description: "Corporate website", href: "/", Icon: BriefcaseBusiness },
  { label: "Student", description: "Projects & academic services", href: "/student", Icon: GraduationCap },
  { label: "Team Portal", description: "Authorized team access", href: "/sign-in", Icon: ShieldCheck },
];

export function ModeSwitcher() {
  const [open, setOpen] = useState(false);
  return <div className="mode-switcher">
    <button className="mode-trigger" type="button" aria-expanded={open} onClick={() => setOpen(!open)}><BriefcaseBusiness aria-hidden="true" /> Business <ChevronDown aria-hidden="true" /></button>
    {open && <div className="mode-menu" role="menu"><p>MODE</p>{modes.map(({ label, description, href, Icon }) => <a key={label} href={href} role="menuitem" className={label === "Business" ? "active" : ""}><Icon aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span></a>)}</div>}
  </div>;
}
