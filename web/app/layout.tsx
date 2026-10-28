import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { DM_Mono, Fraunces, Hanken_Grotesk, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { FeedbackBalk } from "@/components/FeedbackBalk";
import { SnelleFeedback } from "@/components/SnelleFeedback";
import { JsonLd, MAKER } from "@/components/JsonLd";
import { Navigatie, Voet } from "@/components/Kader";
import { Korrel } from "@/components/Onderdelen";
import { laatstBijgewerkt } from "@/lib/api";
import { DOMEIN, LIVE, SITE, siteUrl } from "@/lib/site";
import "@/styles/globals.css";

// Statisch gebouwd en elk uur ververst (ISR); gelijk aan VERVERS_SECONDEN in lib/api.ts
export const revalidate = 3600;

// next/font haalt de lettertypes bij het bouwen op en levert ze zelf uit:
// bezoekers maken geen verbinding met Google
// Alleen rechtop: de cursieve variant werd nergens gebruikt en kostte op elke pagina bijna 140 kB vooraf laden
// (prestatie-audit 26 oktober 2026)
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });
// Alleen voor het woordmerk (merk van 28 oktober 2026), één gewicht
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: { default: SITE.naam, template: `%s · ${SITE.naam}` },
  description: SITE.beschrijving,
  openGraph: { siteName: SITE.naam, locale: "nl_NL", type: "website" },
  // Tot de livegang niet indexeren
  robots: LIVE ? undefined : { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const ververst = await laatstBijgewerkt();
  return (
    <html lang="nl" className={`${newsreader.variable} ${hanken.variable} ${dmMono.variable} ${fraunces.variable}`}>
      <body>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE.naam, url: DOMEIN, inLanguage: "nl", description: SITE.beschrijving, creator: MAKER }} />
        <Korrel />
        <Navigatie />
        <FeedbackBalk />
        {children}
        {/* Snelle vraag onderaan elke pagina (28 oktober 2026) */}
        <SnelleFeedback />
        <Voet ververst={ververst} />
        {/* Bezoekersstatistieken zonder cookies (besluit Niels B5, 26 oktober 2026); telt pas als Niels het in Vercel aanzet */}
        <Analytics />
      </body>
    </html>
  );
}
