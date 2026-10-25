// Onderwerpen (concept, component onderwerpen, hoofdstuk 3 van het verhaal): waar zijn fracties het over eens?
// Cohesie per beleidsterrein. Zonder tweede fractie een kaart van terrein tegen fractie; met een tweede fractie
// een balk per terrein, met de cohesie over alle stemmingen als referentie. Keuzes staan in de URL.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { FractieKeuze } from "@/components/onderwerpen/FractieKeuze";
import { TerreinBalken } from "@/components/onderwerpen/TerreinBalken";
import { Data, Label, SectieKop, Tekst } from "@/components/Typografie";
import { cohesieIn, fractiesIn, keuzeUitUrl, perioden, procent } from "@/lib/cohesie";
import { schaalkleur, tekstOp } from "@/lib/kleur";
import { cohesiePerTerrein, paarPerTerrein, stemmingenPerTerrein, uitersten } from "@/lib/onderwerpen";
import { sleutel } from "@/lib/zaal";
import s from "@/components/onderwerpen/onderwerpen.module.css";

export const metadata: Metadata = {
  title: "Onderwerpen",
  description: "Waar zijn fracties in de Tweede Kamer het over eens? Cohesie per beleidsterrein, per kabinet of Kamerperiode.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Onderwerpen({ searchParams }: Props) {
  const zoek = await searchParams;
  const lijst = await perioden();
  const { soort, periode, variant } = keuzeUitUrl(zoek, lijst);
  const fracties = periode ? await fractiesIn(soort, periode.naam) : null;
  const zaal = (fracties ?? []).filter((f) => f.inZaal).sort((a, b) => b.zetels - a.zetels || a.afkorting.localeCompare(b.afkorting));
  const waarde = (k: string) => (Array.isArray(zoek[k]) ? zoek[k]?.[0] : zoek[k]) as string | undefined;
  const gekozen = zaal.find((f) => f.afkorting === waarde("fractie")) ?? zaal[0];
  const met = zaal.find((f) => f.afkorting === waarde("met") && f.id !== gekozen?.id) ?? null;

  const [perTerrein, aantallen, kaart] = periode && gekozen
    ? await Promise.all([
        cohesiePerTerrein(soort, periode.naam, variant, gekozen.id),
        stemmingenPerTerrein(soort, periode.naam),
        met ? cohesieIn(soort, periode.naam, variant) : Promise.resolve(null),
      ])
    : [null, new Map<string, number>(), null];
  const terreinen = [...aantallen.keys()].filter((t) => perTerrein?.has(t)).sort((a, b) => (aantallen.get(b) ?? 0) - (aantallen.get(a) ?? 0));
  const paar = met && perTerrein ? paarPerTerrein(perTerrein, met.id) : null;
  const totaal = met && kaart ? kaart.get(sleutel(gekozen.id, met.id))?.cohesie ?? null : null;
  const u = paar ? uitersten(paar) : null;
  const query = (extra: Record<string, string>) =>
    `?${new URLSearchParams({ soort, ...(periode ? { periode: periode.naam } : {}), variant, ...extra }).toString()}`;

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Onderwerpen · concept</Label>
        <SectieKop>Waar zijn ze het over eens?</SectieKop>
        <Tekst>
          Elke stemming hoort bij een dossier, en elk dossier bij een beleidsterrein. Kies een fractie en zie per terrein hoe vaak
          andere fracties dezelfde kant kozen. Kies een tweede fractie om het paar per onderwerp te vergelijken.
        </Tekst>
        <Suspense>
          <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} pad="/onderwerpen" />
          {gekozen && <FractieKeuze fracties={zaal.map((f) => ({ afkorting: f.afkorting, zetels: f.zetels }))} fractie={gekozen.afkorting} met={met?.afkorting ?? null} />}
        </Suspense>
      </section>

      {!periode || !gekozen || !perTerrein ? (
        <LegeStaat label="Niet bereikbaar" titel="De onderwerpen konden niet worden geladen" uitleg="Probeer het over een paar minuten opnieuw." />
      ) : met && paar ? (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
          <Label>{gekozen.afkorting} en {met.afkorting} · {periode.naam}</Label>
          {u && (
            <Tekst>
              Het vaakst eens bij {u.hoog.terrein} ({procent(u.hoog.cohesie)}), het minst bij {u.laag.terrein} ({procent(u.laag.cohesie)}).
              {totaal != null ? ` Over alle stemmingen samen: ${procent(totaal)} (de witte lijn).` : ""}
            </Tekst>
          )}
          <TerreinBalken lijst={paar} totaal={totaal} label={`Cohesie van ${gekozen.afkorting} en ${met.afkorting} per beleidsterrein`} />
          <Data><Link href={`/onderwerpen${query({ fractie: gekozen.afkorting })}`}>Terug naar alle fracties</Link></Data>
        </section>
      ) : (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
          <Label>{gekozen.afkorting} tegenover elke fractie, per beleidsterrein · {periode.naam}</Label>
          <div className={s.kaartKader}>
            <table className={s.kaart}>
              <caption className="verborgen">Cohesie van {gekozen.afkorting} met elke fractie, per beleidsterrein, in procenten</caption>
              <thead>
                <tr>
                  <th scope="col">Beleidsterrein</th>
                  {zaal.filter((f) => f.id !== gekozen.id).map((f) => <th key={f.id} scope="col">{f.afkorting}</th>)}
                </tr>
              </thead>
              <tbody>
                {terreinen.map((t) => (
                  <tr key={t}>
                    <th scope="row">{t} <span className={s.aantal}>{aantallen.get(t)}</span></th>
                    {zaal.filter((f) => f.id !== gekozen.id).map((f) => {
                      const p = perTerrein.get(t)?.get(f.id);
                      const geldig = p && !p.teWeinig && p.cohesie != null;
                      const kleur = geldig ? schaalkleur(p.cohesie!) : null;
                      return (
                        <td key={f.id} className={kleur ? s.cel : `${s.cel} ${s.celTeWeinig}`} style={kleur ? { background: kleur, color: tekstOp(kleur) } : undefined}>
                          <Link href={`/onderwerpen${query({ fractie: gekozen.afkorting, met: f.afkorting })}`}
                            title={`${gekozen.afkorting} en ${f.afkorting}, ${t}: ${geldig ? procent(p.cohesie, 1) : "te weinig data"}`}>
                            {geldig ? procent(p.cohesie) : <span className="verborgen">te weinig data</span>}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Data>
            Het getal achter een terrein is het aantal stemmingen in deze periode. Kies een cel om {gekozen.afkorting} en die fractie per terrein te
            vergelijken. Gearceerd: minder dan 25 gezamenlijke stemmingen.
          </Data>
        </section>
      )}

      <Bronregel toelichting={`Beleidsterrein via het Kamerstukdossier: een trefwoord in de titel, anders de vaste commissie die het dossier het vaakst behandelt. Een stemming bij meer dossiers telt bij elk terrein mee. ${variant === "alle" ? "Alle stemmingen" : "Alleen verdeelde stemmingen"}.`} />
    </Inhoud>
  );
}
