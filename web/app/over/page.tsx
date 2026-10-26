// Over de maker (E3-S7). Concepttekst van Claude; Niels keurt hem goed.
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud } from "@/components/Kader";
import { HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Over",
  description: "Wie maakt Zetelen, met welke data, en hoe meld je een fout?",
};

export default function Over() {
  const sectie = { display: "flex", flexDirection: "column" as const, gap: "var(--r-4)" };
  return (
    <Inhoud>
      <section style={sectie}>
        <Label>Over</Label>
        <HeroKop>Wie maakt Zetelen?</HeroKop>
        <Tekst>
          Zetelen is een onafhankelijk project van {SITE.maker}. Er zit geen organisatie of partij achter, alleen
          nieuwsgierigheid. Het doel: met openbare data laten zien hoe er in de Tweede Kamer wordt gestemd. En laten zien
          dat je een cijfer op meer dan één manier kunt lezen.
        </Tekst>
      </section>

      <section style={sectie}>
        <SectieKop>Waar komen de cijfers vandaan?</SectieKop>
        <Tekst>
          Uit de open data van de Tweede Kamer. Een script haalt die elke dag op, rekent alles uit en controleert de
          uitkomst, onder meer tegen de officiële uitslagen. De broncode en de berekeningen zijn openbaar.
        </Tekst>
        <Tekst>
          <a href={SITE.broncode}>Bekijk de broncode op GitHub</a>
        </Tekst>
      </section>

      <section style={sectie}>
        <SectieKop>Klopt er iets niet?</SectieKop>
        <Tekst>
          Zie je een cijfer dat niet klopt? Mail <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a> of meld het
          op <a href={`${SITE.broncode}/issues`}>GitHub</a>. Zet erbij op welke pagina het was en wat je verwachtte. Elke
          correctie komt in het <Link href="/wijzigingen">wijzigingslog</Link>.
        </Tekst>
      </section>
    </Inhoud>
  );
}
