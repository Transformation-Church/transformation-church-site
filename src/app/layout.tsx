import type { Metadata } from "next";
import {
  Instrument_Sans,
  Newsreader,
  Noto_Sans_Malayalam,
} from "next/font/google";

import { Chrome } from "@/components/chrome";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { getGatherings } from "@/lib/events";
import { churchSchema } from "@/lib/seo";
import { site } from "@/lib/site";

import "./globals.css";

// Newsreader is drawn for on-screen reading: lower stroke contrast and larger
// counters than a Didone-ish display face, so it stays legible at body sizes
// while still carrying an editorial voice.
const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});

// Malayalam script needs a face that actually supports it. Without this the
// browser falls back to whatever it can find, and conjuncts render badly.
const malayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-noto-malayalam",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    // Names the languages people actually search for. All three services are
    // real and weekly, so this is descriptive, not keyword stuffing.
    default: `${site.name} | Malayalam & English Pentecostal Church in Birmingham`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: "/" },
  keywords: [
    "Malayalam church Birmingham",
    "Malayalam Pentecostal church",
    "Malayalam church near me",
    "Hindi church Birmingham",
    "Pentecostal church Birmingham",
    "AOG church near me",
    "Assemblies of God church Birmingham",
    "church in Rowley Regis",
    "church in Sandwell",
    "Birmingham Pentecostal Fellowship",
    "Kerala Christian community Birmingham",
    "foodbank Rowley Regis",
  ],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    url: site.url,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: [
      {
        url: "/brand/og-default.png",
        width: 1200,
        height: 630,
        alt: `${site.name}, ${site.address.town}, Birmingham`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    images: ["/brand/og-default.png"],
  },
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "religion",
  formatDetection: { telephone: true, address: true, email: true },
  // Mirrors the SITE_INDEXABLE gate in next.config.ts and robots.ts.
  robots:
    process.env.SITE_INDEXABLE === "true"
      ? { index: true, follow: true }
      : { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const gatherings = await getGatherings();

  return (
    <html lang="en-GB" className={`${newsreader.variable} ${instrument.variable} ${malayalam.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
        >
          Skip to content
        </a>
        {/* Identity, address, service times and socials, once for the site. */}
        <JsonLd data={churchSchema(gatherings)} />
        <Reveal />
        <Chrome header={<Header />} footer={<Footer />}>
          {children}
        </Chrome>
      </body>
    </html>
  );
}
