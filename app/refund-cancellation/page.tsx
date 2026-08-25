import { PageHero, SiteShell } from "@/components/site-shell";

export default function RefundCancellationPage() {
  return <SiteShell><PageHero eyebrow="Legal" title={<>Clear terms for <em>every engagement.</em></>} intro="Our approach to cancellations, revisions, and refunds is designed to be straightforward." /><main className="section legal-copy"><div className="container"><h2>Before work begins</h2><p>Project scope, milestones, fees, and delivery expectations are confirmed before work starts. If a request is cancelled before work begins, contact us to discuss the applicable refund or credit.</p><h2>During delivery</h2><p>For active engagements, cancellation and refund outcomes depend on work completed, approved milestones, and any third-party costs already incurred. We will communicate clearly and fairly.</p><h2>Questions</h2><p>For help with an engagement, email <a className="text-link" href="mailto:contact@gritgrid.in">contact@gritgrid.in</a>.</p></div></main></SiteShell>;
}
