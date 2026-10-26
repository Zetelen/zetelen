// Verdieping (component onderwerpen): de dossiers van een terrein voor een paar fracties, gesorteerd op het
// minst eens, met per dossier een gestapelde balk (allebei voor, verschillend, allebei tegen). Een dossier
// klapt uit naar zijn stemmingen. Tellingen, geen percentages: per dossier haalt een paar de drempel van 25
// stemmingen bijna nooit.
import Link from "next/link";
import type { ReactNode } from "react";
import { getal } from "@/lib/cohesie";
import { type DossierTelling, type StemmingRij, linkTweedeKamer } from "@/lib/onderwerpen";
import { Data, Label, Tekst } from "@/components/Typografie";
import s from "./onderwerpen.module.css";

export function StemLegenda({ a, b }: { a: string; b: string }) {
  return (
    <p className={s.legenda}>
      <span><i className={s.vakVoor} aria-hidden="true" />allebei voor</span>
      <span><i className={s.vakAnders} aria-hidden="true" />{a} en {b} verschillend</span>
      <span><i className={s.vakTegen} aria-hidden="true" />allebei tegen</span>
    </p>
  );
}

export function StemBalk({ voor, anders, tegen }: { voor: number; anders: number; tegen: number }) {
  const totaal = voor + anders + tegen;
  if (!totaal) return null;
  const breed = (n: number) => `${(100 * n) / totaal}%`;
  return (
    <span className={s.stemBalk} aria-hidden="true">
      {voor > 0 && <span className={s.vakVoor} style={{ width: breed(voor) }} />}
      {anders > 0 && <span className={s.vakAnders} style={{ width: breed(anders) }} />}
      {tegen > 0 && <span className={s.vakTegen} style={{ width: breed(tegen) }} />}
    </span>
  );
}

export function DossierLijst({ dossiers, a, b, hrefVoor, actief, sluitHref, uitklap }: {
  dossiers: DossierTelling[]; a: string; b: string; hrefVoor: (dossier: string) => string; actief: string | null;
  sluitHref: string; uitklap?: ReactNode;
}) {
  if (!dossiers.length) return <Tekst>Hier stemden {a} en {b} nooit allebei.</Tekst>;
  return (
    <ol className={s.dossiers} aria-label={`Dossiers, van minst naar meest eens tussen ${a} en ${b}`}>
      {dossiers.map((d) => {
        const open = actief === d.dossier;
        const anders = d.samen - d.eens;
        return (
          <li key={d.dossier} id={`dossier-${d.dossier}`} className={s.terreinItem}>
            <Link href={open ? sluitHref : hrefVoor(d.dossier)} className={s.dossierRij} data-actief={open} scroll={false} aria-expanded={open}
              aria-label={`${d.titel}: ${d.beideVoor} keer allebei voor, ${anders} keer verschillend, ${d.beideTegen} keer allebei tegen`}>
              <span className={s.dossierTitel}>
                {d.titel}
                <span className={s.aantal}>Dossier {d.nummer}</span>
              </span>
              <span className={s.dossierMaat}>
                <StemBalk voor={d.beideVoor} anders={anders} tegen={d.beideTegen} />
                <span className={s.telling}>
                  <strong>{getal(d.eens)}</strong> van de {getal(d.samen)} keer eens
                  <span className={s.pijl} aria-hidden="true">{open ? "▾" : "▸"}</span>
                </span>
              </span>
            </Link>
            {open && uitklap && <div className={s.uitklapDossier}>{uitklap}</div>}
          </li>
        );
      })}
    </ol>
  );
}

const stemTekst = (s: string | null) => (s ? s.toLowerCase() : "niet meegeteld");

export function StemmingLijst({ rijen, a, b, titel }: { rijen: StemmingRij[]; a: string; b: string; titel: string }) {
  return (
    <section className={s.stemmingen} aria-label={`Stemmingen in ${titel}`}>
      <Label>{titel}</Label>
      <ol>
        {rijen.map((r) => {
          const samen = !!(r.a && r.b);
          return (
            <li key={r.besluit} className={s.stemming} data-eens={samen ? r.a === r.b : undefined}>
              <Data>{new Date(r.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}{r.zaakSoort ? ` · ${r.zaakSoort}` : ""}{r.uitslag ? ` · ${r.uitslag}` : ""}</Data>
              <span className={s.stemmingTitel}>{r.onderwerp ?? "Zonder titel"}</span>
              <span className={s.stemmen}>
                <span>{a}: <strong>{stemTekst(r.a)}</strong></span>
                <span>{b}: <strong>{stemTekst(r.b)}</strong></span>
                <span className={s.oordeel}>{samen ? (r.a === r.b ? "eens" : "oneens") : "niet allebei gestemd"}</span>
              </span>
              {r.andereDossiers.length > 0 && <Data>Hoort ook bij: {r.andereDossiers.join("; ")}. Telt in elk dossier mee.</Data>}
              {r.zaakNummer && <a href={linkTweedeKamer(r.zaakNummer)} className={s.extern} target="_blank" rel="noopener noreferrer">Zoek {r.zaakNummer} op tweedekamer.nl ↗</a>}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
