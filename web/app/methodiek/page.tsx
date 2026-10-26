// Methodiek (component methodiek-betrouwbaarheid, E3-S3): per maat de definitie, formule in woorden,
// bron en beperking. Tekst gebaseerd op docs/plan/definitie-cohesie.md (goedgekeurd door Niels).
import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, MAKER } from "@/components/JsonLd";
import { Inhoud } from "@/components/Kader";
import { Data, HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { MATEN } from "@/lib/maten";
import { DOMEIN, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Methodiek",
  description: "Hoe telt Zetelen? Wat cohesie is, de formule, de bron en wat de cijfers niet zeggen.",
  alternates: { canonical: "/methodiek" },
};

const sectie = { display: "flex", flexDirection: "column" as const, gap: "var(--r-4)" };

export default function Methodiek() {
  return (
    <Inhoud>
      {/* Dataset: vindbaar in Google Dataset Search. Geen licentie opgegeven: die is nog niet gekozen */}
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Dataset", name: "Stemmingen in de Tweede Kamer, geteld per fractie",
        description: "Hoe vaak fracties in de Tweede Kamer hetzelfde stemmen (cohesie), per kabinet, per Kamerperiode en per beleidsterrein. Geteld uit de open data van de Tweede Kamer.",
        url: `${DOMEIN}/methodiek`, creator: MAKER, isBasedOn: SITE.bron, temporalCoverage: "2010/..", inLanguage: "nl",
      }} />
      <section style={sectie}>
        <Label>Methodiek</Label>
        <HeroKop>Hoe tellen we?</HeroKop>
        <Tekst>
          Hieronder staat elke maat van de site: wat hij meet, de formule in woorden, de keuzes die we maakten en wat hij
          niet zegt. Wil je zelf narekenen? De code en de SQL staan op <a href={SITE.broncode}>GitHub</a>.
        </Tekst>
      </section>

      {MATEN.map((m) => (
        <section key={m.id} id={m.id} style={sectie}>
          <Label>Maat</Label>
          <SectieKop>{m.naam}</SectieKop>
          <Tekst>{m.definitie}</Tekst>
          <Data>Formule: {m.formule}</Data>
          <Label>Keuzes</Label>
          <ul style={{ margin: 0, paddingLeft: "1.2em", display: "flex", flexDirection: "column", gap: 8, color: "var(--tekst-zacht)", maxWidth: "68ch" }}>
            {m.keuzes.map((k) => <li key={k}>{k}</li>)}
          </ul>
          <Label>Beperkingen</Label>
          <ul style={{ margin: 0, paddingLeft: "1.2em", display: "flex", flexDirection: "column", gap: 8, color: "var(--tekst-zacht)", maxWidth: "68ch" }}>
            {m.beperkingen.map((k) => <li key={k}>{k}</li>)}
          </ul>
        </section>
      ))}

      <section id="data" style={sectie}>
        <Label>Bron</Label>
        <SectieKop>De data</SectieKop>
        <Tekst>
          Alle cijfers komen uit de <a href={SITE.bron}>open data van de Tweede Kamer</a>. Iedereen mag die vrij gebruiken,
          onder de publiek-domeinverklaring CC0. De Tweede Kamer is niet betrokken bij deze site en heeft de analyses niet
          goedgekeurd. Ze garandeert ook niet dat de brondata foutloos is.
        </Tekst>
        <Tekst>
          Elke nacht haalt een script de wijzigingen op en rekent alles opnieuw uit. We tellen de stemmingen vanaf 2010.
          Verwijderde records en stemmingen zonder vergaderdatum tellen niet mee.
        </Tekst>
      </section>

      <section id="controles" style={sectie}>
        <Label>Betrouwbaarheid</Label>
        <SectieKop>Controles</SectieKop>
        <Tekst>
          Na elke verversing controleert het script onder meer of geen stemming meer dan 150 zetels telt, en of de uitslag
          volgens de stemmen past bij de officiële uitslag. Bij een handvol van de ruim 60.000 besluiten past die niet. In
          minstens één geval meldt de Tweede Kamer zelf dat de officiële conclusie een vergissing was. Cohesie gebruikt de
          stemmen per fractie, niet de conclusie, en heeft daar dus geen last van.
        </Tekst>
        <Tekst>
          Fout gezien? Mail <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a> of meld het op{" "}
          <a href={`${SITE.broncode}/issues`}>GitHub</a>. Je krijgt binnen 5 werkdagen antwoord. Correcties staan in het{" "}
          <Link href="/wijzigingen">wijzigingslog</Link>.
        </Tekst>
      </section>
    </Inhoud>
  );
}
