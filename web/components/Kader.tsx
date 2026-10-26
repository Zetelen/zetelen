// Paginaraamwerk: navigatie, voet, en de lege staat en foutstaat (component site-shell)
import Link from "next/link";
import type { ReactNode } from "react";
import { datumTekst } from "@/lib/api";
import { FEEDBACK, SITE } from "@/lib/site";
import { Data, Label, Woordmerk } from "./Typografie";
export { Navigatie } from "./Navigatie";
import s from "./kader.module.css";

export function Inhoud({ children }: { children: ReactNode }) {
  return (
    <main id="inhoud" className={s.inhoud}>
      {children}
    </main>
  );
}

export function Voet({ ververst }: { ververst: Date | null }) {
  return (
    <footer className={s.voet}>
      <div className={s.voetbinnen}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Woordmerk />
          <p>
            Een onafhankelijk project van {SITE.maker}. Geen organisatie, geen partij.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Label>Bron</Label>
          <p>
            <a href={SITE.bron}>Tweede Kamer open data</a>, eigen berekening
          </p>
          <Data>Laatst ververst: {ververst ? datumTekst(ververst) : "onbekend"}</Data>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Label>Contact</Label>
          <p>
            Fout gezien? Mail <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a> of meld het op{" "}
            <a href={`${SITE.broncode}/issues`}>GitHub</a>.
          </p>
          <p>
            <a href={SITE.broncode}>Broncode en methode</a> · <a href="/privacy">Privacy</a>
          </p>
          {FEEDBACK && (
            <p>
              <Link href="/feedback">Geef feedback</Link>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

// Lege staat: er is niets te tonen, met uitleg (E3-S9)
export function LegeStaat({
  label,
  titel,
  uitleg,
  terug,
}: {
  label: string;
  titel: string;
  uitleg: string;
  terug?: { href: string; tekst: string };
}) {
  return (
    <section className={s.staat} aria-live="polite">
      <Label>{label}</Label>
      <h2>{titel}</h2>
      <p>{uitleg}</p>
      {terug ? (
        <Link href={terug.href} className={s.knop}>
          {terug.tekst}
        </Link>
      ) : null}
    </section>
  );
}

// Foutstaat: iets ging mis; geen technische details voor de bezoeker (E3-S9)
export function FoutStaat({ titel, uitleg, kinderen }: { titel: string; uitleg: string; kinderen?: ReactNode }) {
  return (
    <section className={s.staat} role="alert">
      <Label>Er ging iets mis</Label>
      <h2>{titel}</h2>
      <p>{uitleg}</p>
      {kinderen}
    </section>
  );
}

export const knopKlasse = s.knop;
