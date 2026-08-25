import { PageHero, SiteShell } from "@/components/site-shell";

export default function ResponsibleAcademicSupportPage() {
  return <SiteShell><PageHero eyebrow="Student support" title={<>Support that builds <em>understanding.</em></>} intro="GritGrid helps students learn, plan, explain, and present their own work." /><main className="section legal-copy"><div className="container"><h2>What we can do</h2><p>We can help clarify requirements, explore technical approaches, review drafts, explain concepts, and prepare for a viva or presentation.</p><h2>What we do not do</h2><p>We do not impersonate students, submit assessed work as their own, fabricate results, or complete examinations. Any final submission and decision remains the student&apos;s responsibility.</p><h2>Good collaboration</h2><p>Bring your rubric, constraints, questions, and current understanding. The strongest outcome is a clear next step you can explain yourself.</p></div></main></SiteShell>;
}
