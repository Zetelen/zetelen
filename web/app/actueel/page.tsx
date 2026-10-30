// Actueel (besluit Niels, 30 oktober 2026): stukken bij het nieuws, nieuwste eerst. Elk stuk is een momentopname met
// de stand van de data erbij (lib/actueel.ts).
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud } from "@/components/Kader";
import { HeroKop, Label, Tekst } from "@/components/Typografie";
import { STUKKEN, datumTekst } from "@/lib/actueel";
import s from "@/components/verhaal/uitgelicht.module.css";

export const metadata: Metadata = {
  title: "Actueel",
  description: "Stukken bij het nieuws: wat de stemmingen in de Tweede Kamer zeggen over wat er nu speelt.",
  alternates: { canonical: "/actueel" },
};

export default function Actueel() {
  const lijst = [...STUKKEN].sort((a, b) => b.datum.localeCompare(a.datum));
  return (
    <Inhoud>
      <section className={s.blok}>
        <Label>Actueel</Label>
        <HeroKop>Het nieuws, naast de stemmingen</HeroKop>
        <Tekst>
          Bij een politieke kwestie in het nieuws: wat zeggen de stemmingen in de Kamer tot nu toe? Elk stuk staat vast op
          de dag van schrijven, met de stand van de data erbij.
        </Tekst>
        <ul className={s.lijst}>
          {lijst.map((x) => (
            <li key={x.slug}>
              <Link href={`/actueel/${x.slug}`} className={s.item}>
                <span>{datumTekst(x.datum)}</span>
                <strong>{x.kop}</strong>
                <span>{x.beschrijving}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Inhoud>
  );
}
