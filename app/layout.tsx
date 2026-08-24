import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gritgrid.in"),
  title: {
    default: "GritGrid Technologies | Make the complex useful",
    template: "%s | GritGrid Technologies",
  },
  description:
    "GritGrid Technologies builds practical solutions across software, data, artificial intelligence and cloud.",
  keywords: ["GritGrid Technologies", "software development", "AI solutions", "data analytics", "cloud technology"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "GritGrid Technologies | Make the complex useful",
    description: "Practical technology solutions across software, data, AI and cloud.",
    url: "https://gritgrid.in",
    siteName: "GritGrid Technologies",
    locale: "en_IN",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "GritGrid Technologies", description: "Make the complex useful." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[var(--background)]">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
