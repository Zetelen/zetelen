// Uitgelicht (besluit Niels B16, 26 oktober 2026): een reeks hoofdelijke stemmingen, elk uit elkaar gehaald met
// dezelfde scroll graphic als de motie-Eerdmans op /onderwerpen. Hier de inleiding en de lijst; elke stemming
// heeft een eigen pagina (/uitgelicht/[casus]), zodat ze los te delen is en later een eigen video kan worden.
// Statisch: geen database nodig, de gegevens staan in content/uitgelicht.
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud } from "@/components/Kader";
import { HoofdstukKop, Lezingen } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { kabinetOp, telwoord } from "@/lib/uitgelicht";
import { UITGELICHT } from "@/lib/uitgelichtLijst";
import { SITE } from "@/lib/site";
import { dagMaandJaar } from "@/lib/verhaal";
import s from "@/components/verhaal/uitgelicht.module.css";

export const metadata: Metadata = {
  title: "Uitgelicht",
  description: "Zeven hoofdelijke stemmingen in de Tweede Kamer van dichtbij: wie stemde wat, en wat viel op.",
  alternates: { canonical: "/uitgelicht" },
};

export default function Uitgelicht() {
  // Kengetallen voor de inleiding, uit de lijst zelf
  const jaren = UITGELICHT.map((u) => Number(u.datums[0].slice(0, 4)));
  const kabinetten = new Set(UITGELICHT.map((u) => kabinetOp(u.datums[0])?.naam).filter(Boolean));
  return (
    <Inhoud>
      <section className={s.blok}>
        <Label>Uitgelicht · één stemming uit elkaar gehaald</Label>
        <HeroKop>Wat gebeurt er bij één stemming?</HeroKop>
        <Tekst>
          Elk percentage op Zetelen is opgeteld uit stemmingen. Hier halen we er {telwoord(UITGELICHT.length)} uit elkaar, één
          voor één: waar ging het over, wie stemde wat, en wat viel op. Scroll door een stemming en de zaal valt uiteen in voor,
          tegen en per fractie.
        </Tekst>
      </section>

      <section className={s.blok}>
        <HoofdstukKop titel="Waarom deze?" />
        <Tekst>
          Het zijn allemaal hoofdelijke stemmingen: elk Kamerlid stemt apart, en de bron legt elke stem vast. Bij gewoon
          handopsteken telt de fractie als één stem. Een hoofdelijke stemming is een uitzondering; een Kamerlid moet erom vragen.
        </Tekst>
        <Tekst>
          We kozen ze met de hand, op spreiding: van {Math.min(...jaren)} tot {Math.max(...jaren)}, onder{" "}
          {telwoord(kabinetten.size)} kabinetten, ingediend door fracties van links, midden en rechts, uit kabinet en oppositie.
          De uitslagen lopen van ruim tot één stem verschil, en één stemming eindigde twee keer gelijk. Een andere keuze had net zo goed gekund.
        </Tekst>
        <Lezingen
          links={{ titel: "Eén stemming zegt veel", tekst: "Je ziet wat bij handopsteken verdwijnt: wie in een fractie anders stemt, wie er niet is, en hoe krap het was." }}
          rechts={{ titel: "Eén stemming zegt weinig", tekst: "Hoofdelijk stemmen is een uitzondering. Hoe de Kamer meestal stemt, zie je pas in duizenden stemmingen samen." }}
        />
      </section>

      <section className={s.blok} style={{ maxWidth: "none" }}>
        <HoofdstukKop titel="De stemmingen" />
        <ol className={s.lijst}>
          {UITGELICHT.map((u) => (
            <li key={u.slug}>
              <Link href={`/uitgelicht/${u.slug}`} className={s.item}>
                <Data>{dagMaandJaar(u.datums[0])} · {u.uitslag}</Data>
                <strong>{u.titel}</strong>
                <span>{u.vraag}</span>
              </Link>
            </li>
          ))}
        </ol>
        <Tekst>
          Meer stemmingen zoeken? Elke stemming staat op <a href="https://www.tweedekamer.nl">tweedekamer.nl</a>. De gegevens hier
          komen uit de <a href={SITE.bron}>open data van de Tweede Kamer</a>. Hoe we tellen staat in de <Link href="/methodiek">methodiek</Link>.
        </Tekst>
      </section>
    </Inhoud>
  );
}
