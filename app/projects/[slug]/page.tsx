import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/site-shell";
import { getProject, projects, ProjectDetail } from "../../../lib/projects";

export function generateStaticParams() { return projects.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  return project ? { title: `${project.title} | GritGrid Technologies`, description: project.description } : {};
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return <SiteShell><main><ProjectDetail project={project} /></main></SiteShell>;
}
