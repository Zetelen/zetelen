"use client";
// Basiscomponenten van het ontwerpsysteem: kaart, segmentkeuze, uitleesvak, tabel,
// grafiekkader, lezingenblok, cohesieschaal en -cel, en de korrel over de pagina.
import type { ReactNode } from "react";
import { schaalkleur, tekstOp } from "@/lib/kleur";
import { Data, Label } from "./Typografie";
import s from "./onderdelen.module.css";

export function Kaart({ children }: { children: ReactNode }) {
  return <div className={s.kaart}>{children}</div>;
}

// Segmentkeuze, bijvoorbeeld periodesoort of "alle / alleen verdeelde stemmingen".
// Knoppen met aria-pressed, minimaal 44 px hoog. De keuze hoort in de URL; dat regelt de pagina.
export function Segment<T extends string>({
  label,
  opties,
  waarde,
  bijKeuze,
}: {
  label: string;
  opties: Array<{ waarde: T; tekst: string }>;
  waarde: T;
  bijKeuze: (w: T) => void;
}) {
  return (
    <fieldset className={s.segment}>
      <legend>
        <Label>{label}</Label>
      </legend>
      {opties.map((o) => (
        <button
          key={o.waarde}
          type="button"
          className={s.optie}
          aria-pressed={o.waarde === waarde}
          onClick={() => bijKeuze(o.waarde)}
        >
          {o.tekst}
        </button>
      ))}
    </fieldset>
  );
}

// Uitleesvak: de waarde achter een zetel, knoop of cel
export function Uitleesvak({ titel, waarde, toelichting }: { titel: string; waarde: string; toelichting: string }) {
  return (
    <div className={s.uitlees} role="status">
      <Data>{titel}</Data>
      <strong style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 400 }}>{waarde}</strong>
      <Data>{toelichting}</Data>
    </div>
  );
}

export function Tabel({
  kop,
  rijen,
  getalKolommen = [],
  bijschrift,
}: {
  kop: string[];
  rijen: Array<Array<string>>;
  getalKolommen?: number[];
  bijschrift: string;
}) {
  return (
    <div className={s.tabelkader}>
      <table className={s.tabel}>
        <caption className="verborgen">{bijschrift}</caption>
        <thead>
          <tr>
            {kop.map((k, i) => (
              <th key={k} scope="col" className={getalKolommen.includes(i) ? s.getal : undefined}>
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rijen.map((rij, r) => (
            <tr key={r}>
              {rij.map((cel, i) => (
                <td key={i} className={getalKolommen.includes(i) ? s.getal : undefined}>
                  {cel}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Grafiekkader: titel, toelichting en bron bij elke grafiek (E7-S1: bron per cijfer)
export function Grafiekkader({
  titel,
  toelichting,
  bron,
  children,
}: {
  titel: string;
  toelichting?: string;
  bron: string;
  children: ReactNode;
}) {
  return (
    <figure className={s.grafiek}>
      <figcaption>
        <Label>{titel}</Label>
        {toelichting ? <span style={{ color: "var(--tekst-zacht)" }}>{toelichting}</span> : null}
      </figcaption>
      {children}
      <Data>Bron: {bron}</Data>
    </figure>
  );
}

// Twee lezingen naast elkaar, op een telefoon onder elkaar
// Hoofdstukkop over de volle breedte: een duidelijke scheiding tussen de hoofdstukken van een verhaal
// (feedback Niels K2 en K3, 26 oktober 2026)
export function HoofdstukKop({ nummer, titel, id }: { nummer?: string; titel: string; id?: string }) {
  return (
    <div className={s.hoofdstukKop} id={id}>
      {nummer && <span className={s.hoofdstukNummer}>{nummer}</span>}
      <h2>{titel}</h2>
    </div>
  );
}

export function Lezingen({ links, rechts }: { links: { titel: string; tekst: ReactNode }; rechts: { titel: string; tekst: ReactNode } }) {
  return (
    <div className={s.lezingen}>
      {[links, rechts].map((l) => (
        <article key={l.titel} className={s.lezing}>
          <h3>{l.titel}</h3>
          <div style={{ color: "var(--tekst-zacht)" }}>{l.tekst}</div>
        </article>
      ))}
    </div>
  );
}

// Legenda van de cohesieschaal, met de arcering voor te weinig data
export function Schaal() {
  const verloop = `linear-gradient(90deg, ${[0, 33, 67, 100].map((p) => `${schaalkleur(p)} ${p}%`).join(", ")})`;
  return (
    <div className={s.schaal}>
      <div className={s.schaalbalk} style={{ background: verloop }} aria-hidden="true" />
      <div className={s.schaalas}>
        <Data>0%</Data>
        <Data>50%</Data>
        <Data>100%</Data>
      </div>
      <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
        <span className={`${s.cel} ${s.teWeinig}`} style={{ minWidth: 32, minHeight: 20 }} aria-hidden="true" />
        <Data>Te weinig stemmingen: minder dan 25 samen, dus geen oordeel</Data>
      </span>
    </div>
  );
}

// Een cel met cohesie: schaalkleur, met het getal erin (kleur is nooit de enige drager)
export function CohesieCel({ procent }: { procent: number | null }) {
  if (procent === null) {
    return (
      <span className={`${s.cel} ${s.teWeinig}`} title="Te weinig stemmingen">
        <span className="verborgen">Te weinig stemmingen</span>
      </span>
    );
  }
  const achtergrond = schaalkleur(procent);
  return (
    <span className={s.cel} style={{ background: achtergrond, color: tekstOp(achtergrond) }}>
      {procent.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}%
    </span>
  );
}

// Korrel van ongeveer 3% over de pagina: een klein, vooraf gemaakt ruisplaatje (public/korrel.png).
// Eerder een SVG-filter met overvloeimodus; die moest de browser bij elke scrollbeweging opnieuw
// tekenen, wat het scrollen schokkerig maakte (feedback Niels, 24 oktober 2026).
export function Korrel() {
  return <div aria-hidden="true" className={s.korrel} />;
}
