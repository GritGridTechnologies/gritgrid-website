import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/about", "/services", "/technology", "/projects", "/leadership", "/careers", "/contact", "/student"];
  return routes.map((route) => ({ url: `https://gritgrid.in${route}`, lastModified: new Date(), changeFrequency: "monthly", priority: route === "/" ? 1 : 0.7 }));
}
