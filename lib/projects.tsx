export type Project = {
  slug: string;
  title: string;
  category: string;
  filters: string[];
  description: string;
  highlight: string;
  technologies: string[];
  repo: string;
  visual: string;
  featured?: boolean;
  live?: string;
};

export const projects: Project[] = [
  { slug: "gittasker", title: "GitTasker", category: "Software Engineering / Full-Stack Development", filters: ["Software Engineering", "Cloud & Deployment"], description: "A full-stack task management application featuring CRUD operations, REST APIs, GitHub OAuth2 authentication, Redis caching, PostgreSQL metadata storage and IPFS-based decentralized task data storage.", highlight: "Enterprise-style backend architecture with authentication, caching, database integration and decentralized storage.", technologies: ["Spring Boot", "REST API", "OAuth2", "GitHub", "Redis", "PostgreSQL", "IPFS", "Docker"], repo: "https://github.com/voddinenideekshith/GitTasker", visual: "TASKS / API / STORAGE", featured: true },
  { slug: "ddos-detection-sdn", title: "DDoS Detection in SDN", category: "Cybersecurity / Machine Learning", filters: ["Cybersecurity", "AI & Machine Learning"], description: "A machine-learning-based cybersecurity project focused on detecting Distributed Denial-of-Service attacks in Software Defined Networks using Random Forest, Bayesian optimization and SHAP-based explainability.", highlight: "Combines machine learning with explainable AI for network security analysis.", technologies: ["Python", "Machine Learning", "Random Forest", "Bayesian Optimization", "SHAP", "SDN", "Jupyter"], repo: "https://github.com/voddinenideekshith/DDOS-detection-sdn-rf-shap", visual: "SDN / RF / SHAP", featured: true },
  { slug: "aircargo-logistics", title: "AirCargo RealTime Logistics Tracking Database System", category: "Database Systems / Logistics Technology", filters: ["Data & Databases", "Software Engineering"], description: "A real-time air cargo logistics database system designed to manage shipments, flights, ULDs and tracking events while supporting operational analytics such as revenue, delays and utilization.", highlight: "Focus on structured database architecture, data integrity and logistics intelligence.", technologies: ["SQL", "Database Design", "3NF", "Data Analytics", "Logistics", "Real-Time Tracking"], repo: "https://github.com/voddinenideekshith/AirCargo-RealTime-Logistics-Tracking-Database-System", visual: "FLIGHTS / ULDs / EVENTS", featured: true },
  { slug: "cafe-website", title: "Cafe Website", category: "Web Development / Digital Experience", filters: ["Web Development", "Cloud & Deployment"], description: "A responsive café website designed to provide a modern digital experience with structured content, responsive layouts and deployment-ready web architecture.", highlight: "Demonstrates practical website development and deployment.", technologies: ["HTML", "CSS", "JavaScript", "Responsive Design", "Deployment"], repo: "https://github.com/voddinenideekshith/cafe-website", visual: "MENU / STORY / PLACE" },
  { slug: "automated-code-review-bot", title: "Automated Code Review Bot", category: "Developer Tools / Automation", filters: ["Automation", "Software Engineering"], description: "An automated developer tool designed to analyze source code for style issues, common bugs and code complexity, with potential to integrate into GitHub workflows and provide automated pull-request feedback.", highlight: "Automation-focused developer tooling for improving software quality.", technologies: ["Automation", "Code Analysis", "GitHub", "Developer Tools", "CI/CD"], repo: "https://github.com/voddinenideekshith/Automated-Code-Review-Bot", visual: "DIFF / CHECK / REVIEW" },
  { slug: "idealfoodz", title: "IdealFoodz", category: "Web Development / Food Technology", filters: ["Web Development", "Cloud & Deployment"], description: "A cloud-kitchen web platform designed to present food offerings through a structured digital experience with responsive pages, menu presentation and deployment support.", highlight: "Practical digital product development with deployment and content management considerations.", technologies: ["Web Development", "HTML", "CSS", "JavaScript", "Cloud Kitchen"], repo: "https://github.com/voddinenideekshith/ideal-foodz", visual: "MENU / ORDER / KITCHEN" },
];

export const projectFilters = ["All", "Software Engineering", "AI & Machine Learning", "Cybersecurity", "Data & Databases", "Web Development", "Automation", "Cloud & Deployment"];

export function getProject(slug: string) { return projects.find((project) => project.slug === slug); }
export function matchesProject(project: Project, query: string, filter: string) { const haystack = [project.title, project.category, project.description, ...project.technologies].join(" ").toLowerCase(); return (!query || haystack.includes(query.toLowerCase())) && (filter === "All" || project.filters.includes(filter)); }

export function ProjectVisual({ project }: { project: Project }) {
  return <div className="project-visual" role="img" aria-label={`${project.title} technical preview`}><div className="visual-window"><span /><span /><span /></div><div className="visual-grid" /><strong>{project.visual}</strong><small>SELECTED TECHNICAL WORK</small></div>;
}

export function ProjectCard({ project }: { project: Project }) {
  return <article className="portfolio-card"><a href={`/projects/${project.slug}`}><ProjectVisual project={project} /></a><div className="portfolio-card-body"><p className="card-kicker">{project.category}</p><h3><a href={`/projects/${project.slug}`}>{project.title}</a></h3><p>{project.description}</p><div className="tag-list">{project.technologies.slice(0, 5).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="card-actions"><a className="text-link" href={`/projects/${project.slug}`}>View Project ↗</a><a className="github-link" href={project.repo} target="_blank" rel="noreferrer">View on GitHub ↗</a></div></div></article>;
}

export function FeaturedProject({ project }: { project: Project }) {
  return <article className="featured-project"><a href={`/projects/${project.slug}`}><ProjectVisual project={project} /></a><div className="featured-project-copy"><p className="card-kicker">Featured work · {project.category}</p><h3><a href={`/projects/${project.slug}`}>{project.title}</a></h3><p>{project.description}</p><p className="project-highlight">{project.highlight}</p><div className="tag-list">{project.technologies.slice(0, 6).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="card-actions"><a className="button button-primary" href={`/projects/${project.slug}`}>View Project ↗</a><a className="github-link" href={project.repo} target="_blank" rel="noreferrer">View on GitHub ↗</a></div></div></article>;
}

export function ProjectDetail({ project }: { project: Project }) {
  return <><section className="page-hero"><div className="container page-hero-inner"><p className="eyebrow">Selected work / {project.category}</p><h1>{project.title}</h1><p className="hero-lead">{project.description}</p><div className="hero-actions"><a className="button button-primary" href={project.repo} target="_blank" rel="noreferrer">View on GitHub ↗</a><a className="text-link" href="/projects">Back to projects</a></div></div></section><section className="section"><div className="container detail-layout"><ProjectVisual project={project} /><div className="detail-copy"><p className="eyebrow">Project overview</p><h2>Engineering with a clear purpose.</h2><p>{project.description}</p><p className="project-highlight">{project.highlight}</p><h3>Technology stack</h3><div className="tag-list">{project.technologies.map((tag) => <span key={tag}>{tag}</span>)}</div></div></div></section><section className="section detail-bottom"><div className="container"><p className="eyebrow">Have a project in mind?</p><h2>Let&apos;s turn your idea into a practical digital solution.</h2><a className="button button-primary" href="/contact">Start a Conversation ↗</a></div></section></>;
}

export function GitHubCta() { return <section className="section github-cta"><div className="container"><p className="eyebrow">Open source and experiments</p><h2>Explore more of our work.</h2><p>Browse our GitHub repositories, experiments and technical projects.</p><a className="button button-primary" href="https://github.com/voddinenideekshith" target="_blank" rel="noreferrer">Visit GitHub Profile ↗</a></div></section>; }
