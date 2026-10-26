"use client";
// Alle cijfers op deze pagina zijn voorbeelddata.
import { useState } from "react";
import { CohesieCel, Grafiekkader, Kaart, Lezingen, Schaal, Segment, Tabel, Uitleesvak } from "@/components/Onderdelen";
import { Cijfer, Data, HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { TOKENS, contrast } from "@/lib/kleur";

const ACHTERGRONDEN = ["nacht-950", "nacht-900", "nacht-800", "nacht-700"] as const;
const VOORGRONDEN = ["tekst", "tekst-zacht", "koper", "goud"] as const;

function getal(n: number, decimalen = 1) {
  return n.toLocaleString("nl-NL", { minimumFractionDigits: decimalen, maximumFractionDigits: decimalen });
}

export function Voorbeelden() {
  const [periode, setPeriode] = useState<"kabinet" | "kamerperiode">("kabinet");
  const [variant, setVariant] = useState<"alle" | "verdeeld">("alle");
  const sectie = { display: "flex", flexDirection: "column" as const, gap: "var(--r-5)" };

  return (
    <main id="inhoud" style={{ maxWidth: "var(--pagina-max)", margin: "0 auto", padding: "var(--r-7) var(--pagina-marge)", display: "flex", flexDirection: "column", gap: "var(--r-9)" }}>
      <header style={sectie}>
        <Label>Ontwerpsysteem, versie 0.1</Label>
        <HeroKop>
          Nacht met <em>koperlicht</em>
        </HeroKop>
        <Tekst>Een diepe, koele ondergrond met warm licht op wat de bezoeker kiest. Eigen palet, geen partijkleuren, geen logo&apos;s. Alle cijfers op deze pagina zijn voorbeelddata.</Tekst>
      </header>

      <section aria-labelledby="kleur" style={sectie}>
        <SectieKop id="kleur">Kleur en contrast</SectieKop>
        <Tekst>Contrast per combinatie van voorgrond en achtergrond. WCAG AA vraagt 4,5 voor tekst.</Tekst>
        <Tabel
          bijschrift="Contrast van tekstkleuren op de achtergronden"
          kop={["Voorgrond", ...ACHTERGRONDEN]}
          getalKolommen={[1, 2, 3, 4]}
          rijen={VOORGRONDEN.map((v) => [v, ...ACHTERGRONDEN.map((a) => getal(contrast(TOKENS[v], TOKENS[a])))])}
        />
      </section>

      <section aria-labelledby="type" style={sectie}>
        <SectieKop id="type">Typografie</SectieKop>
        <Kaart>
          <Data>Hero-kop · Newsreader 400</Data>
          <HeroKop>Wie stemt met wie in de Kamer?</HeroKop>
        </Kaart>
        <Kaart>
          <Data>Sectiekop · Newsreader 400</Data>
          <SectieKop>Wat een percentage wel en niet zegt</SectieKop>
        </Kaart>
        <Kaart>
          <Data>Uitgelicht cijfer · tabulaire cijfers</Data>
          <Cijfer>74%</Cijfer>
        </Kaart>
        <Kaart>
          <Data>Lopende tekst · Hanken Grotesk 17 px</Data>
          <Tekst>Hoe vaak stemden twee fracties hetzelfde? Een hoog percentage betekent niet dat ze het inhoudelijk eens zijn.</Tekst>
        </Kaart>
        <Kaart>
          <Data>Datalabel en bron · DM Mono</Data>
          <Data>Bron: Tweede Kamer open data · Laatst ververst: 24 oktober 2026</Data>
        </Kaart>
      </section>

      <section aria-labelledby="schaal" style={sectie}>
        <SectieKop id="schaal">Cohesieschaal</SectieKop>
        <Schaal />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--r-2)" }}>
          {[3, 15, 33, 50, 67, 80, 97].map((p) => (
            <CohesieCel key={p} procent={p} />
          ))}
          <CohesieCel procent={null} />
        </div>
      </section>

      <section aria-labelledby="comp" style={sectie}>
        <SectieKop id="comp">Componenten</SectieKop>
        <Segment
          label="Periode"
          opties={[
            { waarde: "kabinet", tekst: "Kabinet" },
            { waarde: "kamerperiode", tekst: "Kamerperiode" },
          ]}
          waarde={periode}
          bijKeuze={setPeriode}
        />
        <Segment
          label="Stemmingen"
          opties={[
            { waarde: "alle", tekst: "Alle stemmingen" },
            { waarde: "verdeeld", tekst: "Alleen verdeelde stemmingen" },
          ]}
          waarde={variant}
          bijKeuze={setVariant}
        />
        <Uitleesvak titel="Eens met D66" waarde="74%" toelichting="Geteld over 2.104 stemmingen samen" />
        <Grafiekkader titel="Cohesie" toelichting="Voorbeeld van een grafiekkader met bron" bron="Tweede Kamer open data, eigen berekening">
          <Tabel
            bijschrift="Voorbeeld van cohesie per fractie"
            kop={["Fractie", "Cohesie", "Stemmingen"]}
            getalKolommen={[1, 2]}
            rijen={[
              ["Fractie A", "80%", "7.000"],
              ["Fractie B", "62%", "6.950"],
              ["Fractie C", "41%", "6.990"],
            ]}
          />
        </Grafiekkader>
        <Lezingen
          links={{ titel: "Samenwerking", tekst: "Voorbeeldtekst voor de eerste lezing." }}
          rechts={{ titel: "Profilering", tekst: "Voorbeeldtekst voor de tweede lezing." }}
        />
      </section>
    </main>
  );
}
