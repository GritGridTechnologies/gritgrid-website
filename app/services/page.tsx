import { ArrowUpRight, BrainCircuit, Cloud, Code2, Database, Network, Search } from "lucide-react";
import { PageHero, SiteShell } from "../../components/site-shell";
import { services } from "../../lib/site-content";
import { whatsappUrl } from "@/lib/whatsapp";
import PublicStatistics from "@/components/public-statistics";

const serviceIcons = [BrainCircuit, Database, Code2, Network, Cloud, Search] as const;

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="What we do" title={<>Capabilities for <em>real-world</em> problems.</>} intro="We bring together strategy, engineering and technical curiosity to build things that can work in the real world." />
      <main className="section services-section">
        <div className="container">
          <div className="services-grid">
            {services.map(([number, title, description], index) => {
              const Icon = serviceIcons[index];
              return (
                <article className="service-card" key={title}>
                  <div className="service-icon"><Icon aria-hidden="true" /></div>
                  <span className="card-index">{number}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <a href={whatsappUrl(`Hello GritGrid, I am interested in ${title}.`)} target="_blank" rel="noreferrer">Ask on WhatsApp <ArrowUpRight aria-hidden="true" /></a>
                </article>
              );
            })}
          </div>
        </div>
      </main>
      <PublicStatistics context="Technology work in motion" />
    </SiteShell>
  );
}
