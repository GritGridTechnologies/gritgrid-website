import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/team", "/api/"] }, sitemap: "https://gritgrid.in/sitemap.xml" };
}
