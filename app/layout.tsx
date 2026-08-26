import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gritgrid.in"),
  title: {
    default: "GritGrid Technologies | AI, Data, Software & Digital Solutions",
    template: "%s | GritGrid Technologies",
  },
  description:
    "GritGrid Technologies builds practical technology solutions across artificial intelligence, data science, software, cloud and digital innovation.",
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
  twitter: { card: "summary_large_image", title: "GritGrid Technologies", description: "Make the complex useful.", images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3m2ppM8PB6HQH4KdXyw7510e7ydkNS.png"] },
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gzvmg8y86Sjl6hZg8fDnsuFq2znPLG.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gzvmg8y86Sjl6hZg8fDnsuFq2znPLG.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-[var(--background)]"><body>{children}</body></html>;
}
