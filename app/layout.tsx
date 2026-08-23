import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GritGrid Technologies | Technology & Digital Solutions",
  description:
    "GritGrid Technologies delivers technology, data, AI, software and digital solutions for students, professionals, startups and businesses.",
  keywords: [
    "GritGrid Technologies",
    "AI solutions",
    "data analytics",
    "software development",
    "technology solutions",
    "digital solutions"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
