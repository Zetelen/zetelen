// Verdieping (component onderwerpen): de dossiers van een terrein voor een paar fracties, gesorteerd op het
// minst eens, en per dossier de stemmingen met wat beide fracties stemden. Tellingen, geen percentages:
// per dossier haalt een paar de drempel van 25 stemmingen bijna nooit.
import Link from "next/link";
import { getal } from "@/lib/cohesie";
import { type DossierTelling, type StemmingRij, linkTweedeKamer } from "@/lib/onderwerpen";
import { Data, Label, Tekst } from "@/components/Typografie";
import s from "./onderwerpen.module.css";

export function DossierLijst({ dossiers, a, b, hrefVoor, actief }: {
  dossiers: DossierTelling[]; a: string; b: string; hrefVoor: (dossier: string) => string; actief: string | null;
}) {
  if (!dossiers.length) return <Tekst>Geen stemmingen waarop {a} en {b} allebei stemden.</Tekst>;
  return (
    <ol className={s.dossiers} aria-label={`Dossiers, van minst naar meest eens tussen ${a} en ${b}`}>
      {dossiers.map((d) => (
        <li key={d.dossier}>
          <Link href={hrefVoor(d.dossier)} className={s.dossierRij} data-actief={actief === d.dossier} scroll={false}
            aria-current={actief === d.dossier ? "true" : undefined}>
            <span className={s.dossierTitel}>
              {d.titel}
              <span className={s.aantal}>Dossier {d.nummer}</span>
            </span>
            <span className={s.telling}>
              <strong>{getal(d.eens)}</strong> van de {getal(d.samen)} keer eens
            </span>
            <span className={s.stipjes} aria-hidden="true">
              {Array.from({ length: Math.min(d.samen, 20) }, (_, i) => (
                <span key={i} data-eens={i < Math.round((d.eens / d.samen) * Math.min(d.samen, 20))} />
              ))}
            </span>
          </Link>
        </li>
      ))}
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
