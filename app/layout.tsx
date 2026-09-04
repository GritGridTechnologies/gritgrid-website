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
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-R9kMzItDuu3i4AlQdfGLt58rqu31QK.png"],
  },
  twitter: { card: "summary_large_image", title: "GritGrid Technologies", description: "Make the complex useful.", images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-R9kMzItDuu3i4AlQdfGLt58rqu31QK.png"] },
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-R9kMzItDuu3i4AlQdfGLt58rqu31QK.png",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-R9kMzItDuu3i4AlQdfGLt58rqu31QK.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = { "@context": "https://schema.org", "@type": "Organization", name: "GritGrid Technologies", url: "https://gritgrid.in", logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-R9kMzItDuu3i4AlQdfGLt58rqu31QK.png" };
  return <html lang="en" className="bg-[var(--background)]"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />{children}</body></html>;
}
