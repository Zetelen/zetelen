// Kamerleden (concept, component zetelwerk): wat dienen Kamerleden en fracties zelf in, en wat wordt aangenomen?
// Moties en amendementen apart. Per fractie, dan per Kamerlid van die fractie, dan de stukken van een Kamerlid.
// Bewust geen ranglijst over de hele Kamer: kabinet en oppositie zijn niet te vergelijken (zie het plan).
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inklapbaar } from "@/components/Inklapbaar";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { MobielPaneel } from "@/components/MobielPaneel";
import { Data, Label, SectieKop, Tekst } from "@/components/Typografie";
import { FractieTabel, KamerledenTabel } from "@/components/zetelwerk/Tabellen";
import { getal, keuzeUitUrl, perioden } from "@/lib/cohesie";
import { STUKKEN, type Stuk, fractieWerk, kamerleden, persoonWerk, stukkenVan } from "@/lib/zetelwerk";
import o from "@/components/onderwerpen/onderwerpen.module.css";
import s from "@/components/zetelwerk/zetelwerk.module.css";

export const metadata: Metadata = {
  title: "Kamerleden",
  description: "Wat dienen Kamerleden zelf in, en wat haalt het? Moties en amendementen per fractie en per Kamerlid.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const UUID = /^[0-9a-f-]{36}$/;

export default async function Kamerleden({ searchParams }: Props) {
  const zoek = await searchParams;
  const waarde = (k: string) => (Array.isArray(zoek[k]) ? zoek[k]?.[0] : zoek[k]) as string | undefined;
  const lijst = await perioden();
  const { soort, periode } = keuzeUitUrl(zoek, lijst);
  const stuk: Stuk = waarde("stuk") === "Amendement" ? "Amendement" : "Motie";
  const q = (waarde("q") ?? "").trim();
  const persoon = UUID.test(waarde("persoon") ?? "") ? waarde("persoon")! : null;
  const [fracties, personen, stukken] = periode
    ? await Promise.all([fractieWerk(soort, periode.naam), persoonWerk(soort, periode.naam), persoon ? stukkenVan(persoon, soort, periode.naam) : Promise.resolve(null)])
    : [null, null, null];
  const rijen = (fracties ?? []).filter((r) => r.soort === stuk).sort((a, b) => b.ingediend - a.ingediend);
  const fractie = rijen.find((r) => r.afkorting === waarde("fractie"))?.afkorting ?? null;
  const leden = kamerleden(personen ?? []);
  const getoond = q ? leden.filter((k) => k.naam.toLowerCase().includes(q.toLowerCase())) : fractie ? leden.filter((k) => k.fractie === fractie) : [];
  const gekozen = persoon ? leden.find((k) => k.persoon === persoon) ?? null : null;
  const basis = { soort, ...(periode ? { periode: periode.naam } : {}) };
  const link = (extra: Record<string, string>) => `/kamerleden?${new URLSearchParams({ ...basis, stuk, ...extra }).toString()}`;
  const meervoud = stuk === "Motie" ? "moties" : "amendementen";

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Kamerleden · concept</Label>
        <SectieKop>Wat dienen Kamerleden zelf in, en wat haalt het?</SectieKop>
        <Tekst>
          Stemmen is één kant van zetelen. De andere: zelf iets op tafel leggen. Een motie vraagt het kabinet iets te doen, een
          amendement verandert een wet. Kies een fractie en zie wie er wat indiende.
        </Tekst>
        <Inklapbaar titel="Zo lees je dit">
          <Tekst>
            Ingediend: het Kamerlid of de fractie staat als indiener op het stuk. Mede ingediend: als medeindiener. Aangenomen: meer
            zetels voor dan tegen, geteld uit de stemmen zelf. Brede steun: aangenomen met stemmen van een kabinets- én een
            oppositiefractie die zelf niet indienden. Onder de 10 stukken geen percentage. Een aangenomen motie is een verzoek aan
            het kabinet: of het ook gebeurt, staat niet in de data. <Link href="/methodiek#zetelwerk">Benieuwd hoe we tellen?</Link>
          </Tekst>
        </Inklapbaar>
        <div className={o.alleenBreed}>
          <Suspense><PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} pad="/kamerleden" /></Suspense>
        </div>
        <nav className={s.pillen} aria-label="Soort stuk">
          {STUKKEN.map((x) => (
            <Link key={x.waarde} href={`/kamerleden?${new URLSearchParams({ ...basis, stuk: x.waarde, ...(fractie ? { fractie } : {}), ...(persoon ? { persoon } : {}) }).toString()}`}
              aria-current={x.waarde === stuk ? "true" : undefined} scroll={false}>{x.tekst}</Link>
          ))}
        </nav>
      </section>
      {periode && (
        <Suspense>
          <MobielPaneel samenvatting={<>{periode.naam} · {meervoud}{fractie ? <> · <strong>{fractie}</strong></> : ""}</>}>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode.naam} pad="/kamerleden" />
          </MobielPaneel>
        </Suspense>
      )}

      {!periode || !fracties ? (
        <LegeStaat label="Niet bereikbaar" titel="De gegevens laden nu niet" uitleg="Probeer het over een paar minuten opnieuw." />
      ) : (
        <>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
            <Label>{periode.naam} · {meervoud} per fractie</Label>
            <Data>Kabinet en oppositie hebben een andere rol: vergelijk binnen de eigen kant. Kies een fractie voor haar Kamerleden.</Data>
            <FractieTabel rijen={rijen} stuk={stuk} actief={fractie} hrefVoor={(afk) => `${link({ fractie: afk })}#leden`} />
          </section>

          <section id="leden" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
            <Label>{q ? `Gezocht op "${q}"` : fractie ? `De Kamerleden van ${fractie}` : "Zoek een Kamerlid"}</Label>
            <form className={s.zoek} action="/kamerleden" method="get">
              {Object.entries(basis).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
              <input type="hidden" name="stuk" value={stuk} />
              <label className="verborgen" htmlFor="zoek-naam">Naam</label>
              <input id="zoek-naam" name="q" defaultValue={q} placeholder="Zoek op naam" />
              <button type="submit">Zoek</button>
            </form>
            {(q || fractie) && (getoond.length ? (
              <KamerledenTabel leden={getoond} actief={persoon} hrefVoor={(p) => `${link({ ...(fractie ? { fractie } : {}), ...(q ? { q } : {}), persoon: p })}#stukken`} />
            ) : (
              <Tekst>Geen Kamerleden gevonden die in deze periode iets indienden.</Tekst>
            ))}
          </section>

          {gekozen && stukken && (
            <section id="stukken" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
              <Label>{gekozen.naam} · {periode.naam}</Label>
              <Tekst>
                {getal(stukken.filter((x) => x.relatie === "Indiener").length)} stukken ingediend, waarvan{" "}
                {getal(stukken.filter((x) => x.relatie === "Indiener" && x.aangenomen).length)} aangenomen, en{" "}
                {getal(stukken.filter((x) => x.relatie === "Medeindiener").length)} mede ingediend.
              </Tekst>
              <ol className={s.stukken}>
                {stukken.slice(0, 100).map((x) => (
                  <li key={`${x.zaak}-${x.relatie}`} data-aangenomen={x.aangenomen}>
                    <Data>
                      {new Date(x.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })} · {x.soort}
                      {x.relatie === "Medeindiener" ? " · mede ingediend" : ""} · {x.aangenomen ? "aangenomen" : "verworpen"} met {x.zetels_voor} tegen {x.zetels_tegen}
                      {x.brede_steun ? " · brede steun" : ""}
                    </Data>
                    <span>{x.onderwerp ?? "Zonder titel"}</span>
                    {x.nummer && <a href={`https://www.tweedekamer.nl/zoeken?qry=${encodeURIComponent(x.nummer)}`} target="_blank" rel="noopener noreferrer">Zoek {x.nummer} op tweedekamer.nl ↗</a>}
                  </li>
                ))}
              </ol>
              {stukken.length > 100 && <Data>De 100 nieuwste van {getal(stukken.length)}.</Data>}
            </section>
          )}
        </>
      )}
      <Bronregel toelichting="Indieners uit de open data van de Tweede Kamer; uitslag geteld uit de stemmen. Moties en amendementen apart." />
    </Inhoud>
  );
}
