"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navItems = [["About", "/about"], ["Services", "/services"], ["Technology", "/technology"], ["Projects", "/projects"], ["Leadership", "/leadership"], ["Careers", "/careers"]];

export function Brand() {
  return <a href="/" className="brand" aria-label="GritGrid Technologies home"><span className="brand-mark">G</span><span><strong>GritGrid</strong><small>Technologies</small></span></a>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="site-header"><div className="container nav-wrap"><Brand /><nav className="desktop-nav" aria-label="Primary navigation">{navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav><a className="nav-cta" href="/contact">Start a conversation <ArrowUpRight aria-hidden="true" /></a><button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close navigation" : "Open navigation"}>{open ? <X /> : <Menu />}</button></div>{open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><a href="/">Home</a>{navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href="/contact">Contact</a></nav>}</header>;
}

export function SiteFooter() {
  return <footer><div className="container footer-wrap"><Brand /><p>© {new Date().getFullYear()} GritGrid Technologies. All rights reserved.</p><div><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/contact">Contact</a></div></div></footer>;
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader />{children}<SiteFooter /></>;
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: React.ReactNode; intro: string }) {
  return <section className="page-hero"><div className="hero-grid" aria-hidden="true" /><div className="container page-hero-inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="hero-lead">{intro}</p></div></section>;
}

export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="text-link" href={href}>{children} <ArrowUpRight aria-hidden="true" /></a>;
}
