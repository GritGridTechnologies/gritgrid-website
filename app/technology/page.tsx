import { PageHero, SiteShell } from "../../components/site-shell";
import { technologies } from "../../lib/site-content";

export default function TechnologyPage() { return <SiteShell><PageHero eyebrow="Technology" title={<>A growing technical <em>foundation.</em></>} intro="We work across a modern, evolving stack — choosing tools for the problem, not the trend." /><main className="section"><div className="container"><div className="section-intro"><p className="eyebrow">Our stack</p><h2>Tools that help ideas become dependable systems.</h2></div><div className="tech-list">{technologies.map(item => <span key={item}>{item}</span>)}</div></div></main></SiteShell>; }
