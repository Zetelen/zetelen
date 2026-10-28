// Stemgenoten (concept, besluit Niels 26 oktober 2026): wie stemde in de Kamer zoals jij? Sinds 27 oktober 2026 live,
// in het menu en de sitemap (besluit Niels); de twee meelezers kijken de stellingen na terwijl de pagina online staat.
// De selectie komt uit pipeline/stemgenoten_selectie.py, de stellingen uit content/stemgenoten/stellingen.json.
// Vanaf 27 oktober 2026 alleen stemmingen onder het huidige kabinet, zodat het label kabinet of oppositie klopt.
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud } from "@/components/Kader";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { type Rollen, type Stelling, Stemgenoten } from "@/components/stemgenoten/Stemgenoten";
import kandidaten from "@/content/stemgenoten/kandidaten.json";
import teksten from "@/content/stemgenoten/stellingen.json";
import { Kern } from "@/components/Onderdelen";
import { coalitieVan } from "@/lib/cohesie";

export const metadata: Metadata = {
  title: "Stem jij zoals zij?",
  description: "Wie stemde in de Tweede Kamer zoals jij? Echte stemmingen over wetten en amendementen.",
  alternates: { canonical: "/stemgenoten" },
};

export default async function StemgenotenPagina() {
  // De eerste ronde (gekozen) en de extra ronde achter de knop "Nog 15 stellingen" (besluit Niels, 28 oktober 2026)
  const per = new Map([...kandidaten.gekozen, ...(kandidaten.extra ?? [])].map((k) => [k.besluit, k]));
  const alle: Stelling[] = teksten.map((t) => {
    const k = per.get(t.besluit)!;
    return { besluit: t.besluit, zaak: t.zaak, stelling: t.stelling, uitleg: t.uitleg, terrein: k.terrein, soort: k.soort, datum: k.datum,
      uitslag: k.uitslag, voor: k.voor, tegen: k.tegen, stemmen: k.stemmen as Record<string, string>, kamerstuk: k.kamerstuk ?? null };
  });
  const extraIds = new Set((kandidaten.extra ?? []).map((k) => k.besluit));
  const stellingen = alle.filter((st) => !extraIds.has(st.besluit));
  const extra = alle.filter((st) => extraIds.has(st.besluit));
  // Kabinet of oppositie volgens het huidige kabinet; zonder antwoord van de database geen labels, liever dan allemaal oppositie
  const coalitie = await coalitieVan(kandidaten.kabinet);
  const rollen: Rollen | null = coalitie.size === 0 ? null : Object.fromEntries(
    Object.keys(kandidaten.fracties).map((f) => {
      const r = coalitie.get(f);
      return [f, r && r.rol === "kabinet" && !r.tot ? "kabinet" : "oppositie"];
    }),
  );
  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Stemgenoten</Label>
        <HeroKop>Stem jij zoals zij?</HeroKop>
        {/* Kern van de pagina (K11, 27 oktober 2026); geen "wat opvalt", dat zou de uitkomst verklappen */}
        <Kern ziet={`${stellingen.length} echte stemmingen uit de Tweede Kamer. Kies je kant en zie welke fracties net zo stemden: niet op basis van beloftes, maar van wat ze echt stemden.`} />
      </section>
      <Stemgenoten stellingen={stellingen} extra={extra} fracties={kandidaten.fracties} rollen={rollen} />
      <section id="methode" style={{ display: "flex", flexDirection: "column", gap: "var(--r-3)", maxWidth: 860, scrollMarginTop: 80 }}>
        <Label>Hoe de stemmingen zijn gekozen</Label>
        <Tekst>
          Uit alle {kandidaten.aantal_verdeeld} verdeelde stemmingen over wetten en amendementen onder het huidige kabinet-{kandidaten.kabinet}
          {" "}(sinds 23 februari 2026) koos een vast programma er {stellingen.length}, volgens regels die vooraf vastlagen:
        </Tekst>
        <ul style={{ margin: 0, paddingLeft: "1.2em", maxWidth: "68ch", display: "flex", flexDirection: "column", gap: 4,
          fontSize: "var(--tekst-lopend)", lineHeight: 1.6, color: "var(--tekst-zacht)" }}>
          <li>geen stemming waarin bijna iedereen aan één kant stond;</li>
          <li>hooguit één stemming per dossier;</li>
          <li>gespreid over de beleidsterreinen;</li>
          <li>minstens vijf wetten;</li>
          <li>elke grote fractie een paar keer aan elke kant;</li>
          <li>geen stemmingen die te technisch zijn om als vraag te stellen, zoals evaluatietermijnen of procedures.</li>
        </ul>
        <Tekst>
          Uit duizenden sets die aan die regels voldoen, is de set gekozen die het meest lijkt op al het stemgedrag: hoe vaak twee fracties
          in deze set hetzelfde stemmen, wijkt gemiddeld {String(kandidaten.controle_verschil).replace(".", ",")} procentpunt af van hoe vaak ze
          dat in alle verdeelde stemmingen deden. Zo stuurt de keuze van de stellingen de uitslag zo min mogelijk.
        </Tekst>
        {extra.length > 0 && (
          <Tekst>
            Wie meer wil, krijgt na de uitslag nog {extra.length} stellingen, gekozen met dezelfde regels en uit andere dossiers. Over alle{" "}
            {stellingen.length + extra.length} samen is het verschil gemiddeld {String(kandidaten.controle_verschil_extra).replace(".", ",")} procentpunt.
          </Tekst>
        )}
        <Data>
          Overeenkomst: van de stellingen waarop jij en een fractie allebei een kant kozen, het deel waarop dat dezelfde kant was. Zelfde
          telling als de cohesie op de rest van Zetelen. Onder 5 gemeenschappelijke stellingen geen percentage. Kabinet of oppositie: de
          rol in het huidige kabinet. De uitkomst is die van de Kamer; de zetels zijn de fractiegroottes onder dit kabinet. De stellingen
          zijn samenvattingen; bij elke stelling staat een link naar het wetsvoorstel op tweedekamer.nl. <Link href="/methodiek">Methodiek</Link>
        </Data>
      </section>
    </Inhoud>
  );
}
