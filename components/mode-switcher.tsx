"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, ChevronDown, GraduationCap, ShieldCheck } from "lucide-react";
import { STUDENT_HINT_STORAGE_KEY } from "./student-discovery-hint";

const modes = [
  { label: "Business", description: "Corporate website", href: "/", Icon: BriefcaseBusiness },
  { label: "Student", description: "Projects & academic services", href: "/student", Icon: GraduationCap },
  { label: "Team Portal", description: "Authorized team access", href: "/team", Icon: ShieldCheck },
];

export function ModeSwitcher() {
  const [open, setOpen] = useState(false);

  const openMenu = () => {
    setOpen(true);
    try {
      window.localStorage.setItem(STUDENT_HINT_STORAGE_KEY, "1");
    } catch {
      // The switcher remains usable when storage is unavailable.
    }
  };
  const pathname = usePathname();
  const activeMode = pathname.startsWith("/student") ? "Student" : pathname.startsWith("/admin") || pathname.startsWith("/team") || pathname === "/sign-in" ? "Team Portal" : "Business";
  return <div className="mode-switcher">
    <button className="mode-trigger" type="button" aria-expanded={open} onClick={open ? () => setOpen(false) : openMenu}><BriefcaseBusiness aria-hidden="true" /> {activeMode} <ChevronDown aria-hidden="true" /></button>
    {open && <div className="mode-menu" role="menu"><p>MODE</p>{modes.map(({ label, description, href, Icon }) => <a key={label} href={href} role="menuitem" className={label === activeMode ? "active" : ""}><Icon aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span></a>)}</div>}
  </div>;
}
