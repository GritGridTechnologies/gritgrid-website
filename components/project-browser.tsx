"use client";

import { useMemo, useState } from "react";
import { ProjectCard, matchesProject } from "../lib/projects";
import { projectFilters, projects } from "../lib/projects";

export default function ProjectBrowser() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const visibleProjects = useMemo(() => projects.filter((project) => matchesProject(project, query, filter)), [query, filter]);
  return <>
    <div className="project-controls" aria-label="Project filters"><label className="project-search"><span className="sr-only">Search projects</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects..." type="search" /></label><div className="project-filters" role="group" aria-label="Filter projects">{projectFilters.map((item) => <button type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div></div>
    <p className="project-result-count">Showing {visibleProjects.length} of {projects.length} projects</p>
    <div className="portfolio-grid">{visibleProjects.map((project) => <ProjectCard project={project} key={project.slug} />)}</div>
    {visibleProjects.length === 0 && <div className="empty-projects"><h2>No projects found.</h2><p>Try another search or reset the filters.</p><button className="button button-primary" type="button" onClick={() => { setQuery(""); setFilter("All"); }}>Reset filters</button></div>}
  </>;
}
