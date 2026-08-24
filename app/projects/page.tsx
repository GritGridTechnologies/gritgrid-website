import { PageHero, SiteShell } from "../../components/site-shell";
import ProjectBrowser from "../../components/project-browser";
import { GitHubCta } from "../../lib/projects";

export const metadata = { title: "GritGrid Technologies | Selected Work & Projects", description: "Explore selected software engineering, AI, cybersecurity, database and web development projects by GritGrid Technologies." };

export default function ProjectsPage() {
  return <SiteShell><main><PageHero eyebrow="Selected work" title="Technical projects, built with intent." intro="Explore our technical projects across software engineering, cybersecurity, AI, data systems and digital experiences." /><section className="section projects-page"><div className="container"><div className="section-intro"><p className="eyebrow">Project portfolio</p><h2>Selected work</h2><div className="intro-copy"><p>Engineering ideas into practical digital solutions.</p></div></div><ProjectBrowser /></div></section><GitHubCta /><section className="section project-cta"><div className="container"><p className="eyebrow">Start something practical</p><h2>Have a project in mind?</h2><p>Let&apos;s turn your idea into a practical digital solution.</p><a className="button button-primary" href="/contact">Start a Conversation ↗</a></div></section></main></SiteShell>;
}
