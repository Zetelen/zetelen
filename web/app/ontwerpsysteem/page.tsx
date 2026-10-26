// Voorbeeldpagina met alle basiscomponenten (component ontwerpsysteem, test uit E3-S2).
// Niet bedoeld voor bezoekers: niet in de sitemap en niet geindexeerd.
import type { Metadata } from "next";
import { Voorbeelden } from "./Voorbeelden";

export const metadata: Metadata = {
  title: "Ontwerpsysteem",
  robots: { index: false, follow: false },
};

export default function Ontwerpsysteem() {
  return <Voorbeelden />;
}
