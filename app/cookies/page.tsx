import { PageHero, SiteShell } from "@/components/site-shell";

export default function CookiesPage() {
  return <SiteShell><PageHero eyebrow="Legal" title={<>A simple approach to <em>cookies.</em></>} intro="We use only the cookies needed to keep the site and authenticated workspaces working." /><main className="section legal-copy"><div className="container"><h2>Essential cookies</h2><p>Authenticated areas may use secure session cookies so signed-in users can access the correct workspace. These cookies are not used to sell or advertise to you.</p><h2>Questions</h2><p>If you have a question about cookies or privacy, contact <a className="text-link" href="mailto:contact@gritgrid.in">contact@gritgrid.in</a>.</p></div></main></SiteShell>;
}
