import { ArrowUpRight } from "lucide-react";
import { PageHero, SiteShell } from "../../components/site-shell";
import { services } from "../../lib/site-content";

export default function ServicesPage() { return <SiteShell><PageHero eyebrow="What we do" title={<>Capabilities for <em>real-world</em> problems.</>} intro="We bring together strategy, engineering and technical curiosity to build things that can work in the real world." /><main className="section services-section"><div className="container"><div className="services-grid">{services.map(([number,title,description]) => <article className="service-card" key={title}><span className="card-index">{number}</span><h3>{title}</h3><p>{description}</p><a href="/contact">Discuss a project <ArrowUpRight aria-hidden="true" /></a></article>)}</div></div></main></SiteShell>; }
