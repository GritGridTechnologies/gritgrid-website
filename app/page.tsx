"use client";

import { useState } from "react";
import ContactForm from "../components/contact-form";
import { ProjectCard, projects } from "../lib/projects";
import {
  ArrowUpRight,
  BrainCircuit,
  Check,
  Cloud,
  Code2,
  Database,
  Menu,
  Network,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const services = [
  { icon: BrainCircuit, title: "AI & machine learning", description: "Practical intelligence that turns complex data into better decisions, faster workflows and new possibilities." },
  { icon: Database, title: "Data analytics", description: "Clear systems for understanding performance, finding opportunity and making information useful." },
  { icon: Code2, title: "Software development", description: "Thoughtful digital products built around real requirements, strong foundations and people who use them." },
  { icon: Network, title: "Full-stack development", description: "Frontend, backend, APIs and databases working together as one dependable product." },
  { icon: Cloud, title: "Cloud & DevOps", description: "Modern delivery systems that make applications easier to release, observe and improve." },
  { icon: Search, title: "Research & technical solutions", description: "Focused technical research, prototypes and documentation for problems without obvious answers." },
];

const technologies = ["Python", "Java", "C# / .NET", "JavaScript", "TypeScript", "React", "Next.js", "FastAPI", "Spring Boot", "SQL", "PostgreSQL", "AWS", "Azure", "Docker", "Git"];
const navItems = [["About", "about"], ["Services", "services"], ["Technology", "technologies"], ["Projects", "projects"], ["Leadership", "leadership"], ["Careers", "careers"]];

function Brand() {
  return <a href="#home" className="brand" aria-label="GritGrid Technologies home"><span className="brand-mark">G</span><span><strong>GritGrid</strong><small>Technologies</small></span></a>;
}

function SectionIntro({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return <div className="section-intro"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <div className="intro-copy">{children}</div>}</div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <header className="site-header">
        <div className="container nav-wrap"><Brand /><nav className="desktop-nav" aria-label="Primary navigation">{navItems.map(([label, href]) => <a key={href} href={`#${href}`}>{label}</a>)}</nav><a className="nav-cta" href="#contact">Start a conversation <ArrowUpRight aria-hidden="true" /></a><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"}>{menuOpen ? <X /> : <Menu />}</button></div>
        {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation"><a href="#home" onClick={closeMenu}>Home</a>{navItems.map(([label, href]) => <a key={href} href={`#${href}`} onClick={closeMenu}>{label}</a>)}<a href="#contact" onClick={closeMenu}>Contact</a></nav>}
      </header>

      <section id="home" className="hero"><div className="hero-grid" aria-hidden="true" /><div className="container hero-layout"><div className="hero-copy"><p className="eyebrow"><Sparkles aria-hidden="true" /> Independent technology studio</p><h1>Make the complex <em>useful.</em></h1><p className="hero-lead">GritGrid Technologies builds practical solutions across software, data, artificial intelligence and cloud — with the curiosity to explore and the discipline to deliver.</p><div className="hero-actions"><a className="button button-primary" href="#services">Explore capabilities <ArrowUpRight aria-hidden="true" /></a><a className="text-link" href="#contact">Talk to GritGrid <ArrowUpRight aria-hidden="true" /></a></div></div><div className="signal-panel" aria-label="GritGrid technology focus"><div className="signal-top"><span>GG / 001</span><span>Systems in progress</span></div><div className="signal-core"><div className="core-ring ring-one" /><div className="core-ring ring-two" /><div className="core-node"><span>G</span></div><div className="orbit orbit-one" /><div className="orbit orbit-two" /></div><div className="signal-bottom"><span>DATA</span><span>INTELLIGENCE</span><span>DELIVERY</span></div></div></div><div className="container proof-row">{[["01", "Technology-first"], ["02", "Data-driven"], ["03", "Built to evolve"]].map(([number, text]) => <div key={number}><span>{number}</span><strong>{text}</strong></div>)}</div></section>

      <section id="about" className="section about-section"><div className="container about-layout"><SectionIntro eyebrow="Who we are" title="Starting small. Thinking bigger."><p>GritGrid Technologies is an early-stage technology venture focused on building practical digital and technical solutions.</p><p>Our initial focus is on developing strong capabilities, delivering quality projects and creating a foundation for a larger technology organization.</p></SectionIntro><div className="about-note"><span>Our point of view</span><p>Good technology should reduce friction, reveal possibility and leave people with more room to think.</p><a href="#services" className="text-link">See what we do <ArrowUpRight aria-hidden="true" /></a></div></div></section>

      <section id="services" className="section services-section"><div className="container"><SectionIntro eyebrow="What we do" title="Capabilities for real-world problems."><p>We bring together strategy, engineering and technical curiosity to build things that can work in the real world.</p></SectionIntro><div className="services-grid">{services.map(({ icon: Icon, title, description }, index) => <article className="service-card" key={title}><div className="service-icon"><Icon aria-hidden="true" /></div><span className="card-index">0{index + 1}</span><h3>{title}</h3><p>{description}</p><a href="#contact" aria-label={`Discuss ${title}`}>Discuss a project <ArrowUpRight aria-hidden="true" /></a></article>)}</div></div></section>

      <section id="projects" className="section projects-preview"><div className="container"><SectionIntro eyebrow="Selected work" title="Selected Work"><p>Building practical technology across software, AI, cybersecurity, data and digital experiences.</p></SectionIntro><div className="portfolio-grid homepage-project-grid">{projects.map((project) => <ProjectCard project={project} key={project.slug} />)}</div><a className="button button-primary view-all-projects" href="/projects">View All Projects →</a></div></section>

      <section className="dark-section"><div className="container why-layout"><SectionIntro eyebrow="Why GritGrid" title="Built on learning, execution and ambition."><p>We are building the habits, systems and relationships that turn an early-stage venture into a lasting technology company.</p></SectionIntro><div className="principles">{["Practical thinking", "Continuous learning", "Quality-focused delivery", "Long-term vision"].map((item) => <div key={item}><Check aria-hidden="true" /><span>{item}</span></div>)}</div></div></section>

      <section id="technologies" className="section tech-section"><div className="container"><SectionIntro eyebrow="Technology" title="A growing technical foundation."><p>We work across a modern, evolving stack — choosing tools for the problem, not the trend.</p></SectionIntro><div className="tech-list">{technologies.map((technology) => <span key={technology}>{technology}</span>)}</div></div></section>

      <section id="leadership" className="section leadership-section"><div className="container"><SectionIntro eyebrow="Leadership" title="The people building GritGrid." /><div className="leaders"><article><div className="leader-avatar">D</div><div><h3>Deekshith</h3><p className="role">Founder</p><p>Driving the overall direction, technology strategy and long-term vision of GritGrid Technologies.</p></div></article><article><div className="leader-avatar">D</div><div><h3>Divya</h3><p className="role">Co-Founder</p><p>Contributing to data, analytics, business development and the strategic growth of GritGrid.</p></div></article></div></div></section>

      <section id="careers" className="career-section"><div className="container career-card"><div><p className="eyebrow">Future opportunities</p><h2>Learn. Build. Grow with GritGrid.</h2><p>As we grow, we plan to create opportunities for students and emerging technologists through internships and project-based work.</p></div><a className="button button-light" href="#contact">Explore opportunities <ArrowUpRight aria-hidden="true" /></a></div></section>

      <section id="contact" className="contact-section"><div className="container contact-layout"><SectionIntro eyebrow="Contact" title={<>Have an idea?<br /><em>Let&apos;s talk.</em></>}><p>Tell us about your requirement, idea or technical challenge and our team will get back to you.</p></SectionIntro><div><ContactForm /><div className="contact-alternatives"><div><span>Prefer email?</span><a href="mailto:hello@gritgrid.in">hello@gritgrid.in</a></div><div><span>Technical support</span><a href="mailto:support@gritgrid.in">support@gritgrid.in</a></div></div></div></div></section>

      <footer><div className="container footer-wrap"><Brand /><p>© {new Date().getFullYear()} GritGrid Technologies. All rights reserved.</p><div><a href="#about">About</a><a href="#services">Services</a><a href="#contact">Contact</a></div></div></footer>
    </main>
  );
}

