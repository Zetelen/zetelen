// Over de maker (E3-S7). Tekst van Niels (B15, 26 oktober 2026): wie maakt dit, het lidmaatschap van Volt en de
// regels die de cijfers objectief houden.
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
          Zetelen is een hobbyproject van {SITE.maker}, data-analist. Er zit geen organisatie of partij achter dit project.
          Het doel: met openbare data laten zien hoe er in de Tweede Kamer wordt gestemd, en dat je een cijfer op meer dan
          één manier kunt lezen.
        </Tekst>
        <Tekst>
          Ik wil de informatie zo objectief mogelijk brengen, maar ik ben wel lid van Volt. Daarom heb ik een aantal strenge
          regels voor mezelf opgesteld:
        </Tekst>
        <ul style={{ margin: 0, paddingLeft: "1.2em", display: "flex", flexDirection: "column", gap: 8, color: "var(--tekst-zacht)", maxWidth: "68ch" }}>
          <li>alle cijfers komen uit de open data van de Tweede Kamer;</li>
          <li>voor elke fractie gelden dezelfde rekenregels; ze staan op de <Link href="/methodiek">methodiekpagina</Link>, en de code is openbaar;</li>
          <li>bij elk cijfer staan twee lezingen, en jij kiest;</li>
          <li>fouten herstel ik, en ze komen op <Link href="/wijzigingen">/wijzigingen</Link>.</li>
        </ul>
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
          Zie je toch een scheve formulering of een fout? Of heb je suggesties voor nieuwe analyses of invalshoeken? Meld
          het, dan kijk ik ernaar. Je krijgt binnen 5 werkdagen antwoord. Mail <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a> of meld het
          op <a href={`${SITE.broncode}/issues`}>GitHub</a>. Zet erbij op welke pagina het was en wat je verwachtte. Elke
          correctie komt in het <Link href="/wijzigingen">wijzigingslog</Link>.
        </Tekst>
      </section>
    </Inhoud>
  );
}
