// Stemgenoten (concept, besluit Niels 26 oktober 2026): wie stemde in de Kamer zoals jij? Niet in het menu, niet in de
// sitemap en niet geïndexeerd tot Niels en twee meelezers met een andere politieke kleur de stellingen hebben gezien.
// De selectie komt uit pipeline/stemgenoten_selectie.py, de stellingen uit content/stemgenoten/stellingen.json.
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud } from "@/components/Kader";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { type Stelling, Stemgenoten } from "@/components/stemgenoten/Stemgenoten";
import kandidaten from "@/content/stemgenoten/kandidaten.json";
import teksten from "@/content/stemgenoten/stellingen.json";

export const metadata: Metadata = {
  title: "Stemgenoten",
  description: "Wie stemde in de Tweede Kamer zoals jij? Echte stemmingen over wetten en amendementen.",
  robots: { index: false, follow: false },
};

export default function StemgenotenPagina() {
  const per = new Map(kandidaten.gekozen.map((k) => [k.besluit, k]));
  const stellingen: Stelling[] = teksten.map((t) => {
    const k = per.get(t.besluit)!;
    return { besluit: t.besluit, zaak: t.zaak, stelling: t.stelling, uitleg: t.uitleg, terrein: k.terrein, soort: k.soort, datum: k.datum,
      uitslag: k.uitslag, voor: k.voor, tegen: k.tegen, stemmen: k.stemmen as Record<string, string> };
  });
  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Stemgenoten · concept</Label>
        <HeroKop>Wie stemt als jij?</HeroKop>
        <Tekst>
          Vind je stemgenoten in de Tweede Kamer: niet aan de hand van beloftes, maar van wat fracties echt stemden.
        </Tekst>
      </section>
      <Stemgenoten stellingen={stellingen} fracties={kandidaten.fracties} />
      <section id="methode" style={{ display: "flex", flexDirection: "column", gap: "var(--r-3)", maxWidth: 860, scrollMarginTop: 80 }}>
        <Label>Hoe de stemmingen zijn gekozen</Label>
        <Tekst>
          Uit alle {kandidaten.aantal_verdeeld} verdeelde stemmingen over wetten en amendementen in deze Kamerperiode (sinds november 2025)
          koos een vast programma er {stellingen.length}, volgens regels die vooraf vastlagen: geen stemming waarin bijna iedereen aan één
          kant stond, hooguit één per dossier, gespreid over de beleidsterreinen, minstens vijf wetten, en elke grote fractie een paar keer
          aan elke kant. Stemmingen die te technisch zijn om als vraag te stellen (zoals evaluatietermijnen of procedures) doen niet mee.
        </Tekst>
        <Tekst>
          Uit duizenden sets die aan die regels voldoen, is de set gekozen die het meest lijkt op al het stemgedrag: hoe vaak twee fracties
          in deze set hetzelfde stemmen, wijkt gemiddeld {String(kandidaten.controle_verschil).replace(".", ",")} procentpunt af van hoe vaak ze
          dat in alle verdeelde stemmingen deden. Zo stuurt de keuze van de stellingen de uitslag zo min mogelijk.
        </Tekst>
        <Data>
          Overeenkomst: van de stellingen waarop jij en een fractie allebei een kant kozen, het deel waarop dat dezelfde kant was. Zelfde
          telling als de cohesie op de rest van Zetelen. Onder 5 gemeenschappelijke stellingen geen percentage. De stellingen zijn
          samenvattingen; de stemming zelf staat bij elke stelling op tweedekamer.nl. <Link href="/methodiek">Methodiek</Link>
        </Data>
      </section>
    </Inhoud>
  );
}
