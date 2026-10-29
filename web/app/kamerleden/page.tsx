// Kamerleden (concept, component zetelwerk): wat dienen Kamerleden en fracties zelf in, en wat wordt aangenomen?
// Moties en amendementen apart. Per fractie, dan per Kamerlid van die fractie, dan de stukken van een Kamerlid.
// Bewust geen ranglijst over de hele Kamer: kabinet en oppositie zijn niet te vergelijken (zie het plan).
import { GrafiekKader, GrafiekVlak } from "@/components/deel/GrafiekKader";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inklapbaar } from "@/components/Inklapbaar";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { MobielPaneel } from "@/components/MobielPaneel";
import { Kern, Lezingen } from "@/components/Onderdelen";
import { hernoemingen, kamerledenOpvalt } from "@/lib/kern";
import opvolgers from "@/content/fractie-opvolgers.json";
import { Data, Label, SectieKop, Tekst } from "@/components/Typografie";
import { Spreiding } from "@/components/zetelwerk/Spreiding";
import { FractieTabel, KamerledenTabel, RanglijstTabel } from "@/components/zetelwerk/Tabellen";
import { getal, keuzeUitUrl, perioden } from "@/lib/cohesie";
import { KAMERLEDEN } from "@/lib/site";
import { MINIMUM, STUKKEN, type Stuk, fractieWerk, kamerleden, meervoudVan, minimumVoor, persoonWerk, ranglijst, stukkenVan } from "@/lib/zetelwerk";
import o from "@/components/onderwerpen/onderwerpen.module.css";
import s from "@/components/zetelwerk/zetelwerk.module.css";

export const metadata: Metadata = {
  title: "Kamerleden",
  description: "Wat stellen Kamerleden voor, en wat wordt aangenomen? Moties, amendementen en initiatiefwetten per fractie en per Kamerlid.",
  alternates: { canonical: "/kamerleden" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const UUID = /^[0-9a-f-]{36}$/;

export default async function Kamerleden({ searchParams }: Props) {
  if (!KAMERLEDEN) notFound();
  const zoek = await searchParams;
  const waarde = (k: string) => (Array.isArray(zoek[k]) ? zoek[k]?.[0] : zoek[k]) as string | undefined;
  const lijst = await perioden();
  const { soort, periode } = keuzeUitUrl(zoek, lijst);
  const stuk: Stuk = STUKKEN.find((x) => x.waarde === waarde("stuk"))?.waarde ?? "Motie";
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
  const meervoud = meervoudVan(stuk);
  const minimum = minimumVoor(stuk);
  // Rol van een fractie in deze periode (kabinet of oppositie), voor de tabellen en de ranglijst
  const rollen = new Map((fracties ?? []).map((r) => [r.afkorting, r.rol]));
  const rolVan = (f: string | null) => (f ? rollen.get(f) : undefined);
  // Weergave tabel of spreidingsdiagram (K5), en de ranglijst per rol (B2)
  const spreiding = waarde("weergave") === "spreiding";
  const rangRol: "kabinet" | "oppositie" = waarde("rol") === "kabinet" ? "kabinet" : "oppositie";
  const plekken = ranglijst(leden, stuk, rangRol, rolVan);
  const alleRang = waarde("rang") === "alle";
  const hier = { ...(fractie ? { fractie } : {}), ...(q ? { q } : {}), ...(persoon ? { persoon } : {}) };
  // Lege waarden vallen weg, zodat de URL kort blijft
  const keuzeLink = (extra: Record<string, string>) =>
    link(Object.fromEntries(Object.entries({ ...hier, ...(spreiding ? { weergave: "spreiding" } : {}), ...(rangRol === "kabinet" ? { rol: "kabinet" } : {}), ...(alleRang ? { rang: "alle" } : {}), ...extra }).filter(([, v]) => v)));

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Kamerleden</Label>
        <SectieKop niveau={1}>Wat stellen Kamerleden voor, en wat wordt aangenomen?</SectieKop>
        {/* Kern van de pagina (K11, 27 oktober 2026) */}
        <Kern ziet="Wat fracties en Kamerleden zelf indienden, en hoeveel daarvan de Kamer aannam. Kies moties, amendementen of initiatiefwetten."
          opvalt={periode && fracties ? kamerledenOpvalt(soort, periode.naam, stuk, meervoud, fracties, hernoemingen(opvolgers.opvolgers)) : null} />
        <Tekst>
          Stemmen is één kant van zetelen. De andere: zelf iets op tafel leggen. Een motie vraagt het kabinet iets te doen, een
          amendement verandert een wet. Kies een fractie en zie wie er wat indiende.
        </Tekst>
        <Inklapbaar titel="Hoe lees je dit?">
          <Tekst>
            Ingediend: het Kamerlid of de fractie staat als indiener op het stuk. Mede ingediend: als medeindiener. Aangenomen: de
            uitslag die de Kamer vaststelde. Brede steun: aangenomen met stemmen van een kabinets- én een
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
          <GrafiekKader grafiek="kamerleden" id="fracties" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
            <Label>{periode.naam} · {meervoud} per fractie</Label>
            <Data>Kabinet en oppositie hebben een andere rol: vergelijk binnen de eigen kant. Kies een fractie voor haar Kamerleden.</Data>
            <nav className={s.pillen} aria-label="Weergave">
              <Link href={`${keuzeLink({ weergave: "" })}#fracties`} aria-current={!spreiding ? "true" : undefined} scroll={false}>Tabel</Link>
              <Link href={`${keuzeLink({ weergave: "spreiding" })}#fracties`} aria-current={spreiding ? "true" : undefined} scroll={false}>Spreidingsdiagram</Link>
            </nav>
            <GrafiekVlak>
            {spreiding ? (
              <Spreiding label={`${meervoud} per fractie: ingediend tegenover aandeel aangenomen`} xLabel={`${meervoud} ingediend`}
                punten={rijen.filter((r) => r.ingediend >= MINIMUM).map((r) => ({ key: r.fractie, label: r.afkorting, x: r.ingediend, y: (100 * r.aangenomen) / r.ingediend, rol: r.rol, href: `${link({ fractie: r.afkorting })}#leden` }))} />
            ) : (
              <FractieTabel rijen={rijen} stuk={stuk} actief={fractie} hrefVoor={(afk) => `${link({ fractie: afk })}#leden`} />
            )}
            </GrafiekVlak>
          </GrafiekKader>

          {/* Ranglijst over de hele Kamer, op uitkomst en per rol (besluit Niels B2, 26 oktober 2026) */}
          <GrafiekKader grafiek="ranglijst" id="ranglijst" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
            <Label>{periode.naam} · ranglijst</Label>
            <SectieKop>Wie krijgt het vaakst iets aangenomen?</SectieKop>
            <Tekst>
              {stuk === "Wetsvoorstel"
                ? <>Een initiatiefwet is een wetsvoorstel dat Kamerleden zelf schrijven. Dat zijn er weinig per Kamerlid, dus hier geen
                    percentage: de volgorde is het aantal aangenomen wetten. Kabinet en oppositie apart. Telt mee: de eindstemming in de
                    Tweede Kamer, niet de Eerste Kamer.</>
                : <>Op aandeel, niet op aantal: van alle {meervoud} die een Kamerlid zelf indiende, welk deel haalde het? Kabinet en
                    oppositie apart, want wie regeert, krijgt makkelijker een meerderheid. Alleen Kamerleden met minstens {MINIMUM}{" "}
                    {meervoud}.</>}
            </Tekst>
            {stuk === "Wetsvoorstel" ? (
              <Lezingen
                links={{ titel: "Wie een wet erdoor krijgt, weet steun te vinden", tekst: "Een eigen wet aangenomen krijgen kost jaren werk en een meerderheid die je zelf moet zoeken." }}
                rechts={{ titel: "Of: alleen wat kansrijk is, komt in stemming", tekst: "Een initiatiefwet zonder meerderheid wordt soms ingetrokken voordat erover gestemd wordt. Die telt hier niet mee, dus bijna alles wat hier staat, is aangenomen." }}
              />
            ) : (
              <Lezingen
                links={{ titel: "Wie veel binnenhaalt, weet steun te vinden", tekst: "Een hoog aandeel zegt dat een Kamerlid voorstellen schrijft waar een meerderheid achter kan staan." }}
                rechts={{ titel: "Of vraagt weinig", tekst: "Een motie die om een brief of een onderzoek vraagt, haalt het makkelijk. Wie grote dingen vraagt, verliest vaker." }}
              />
            )}
            <nav className={s.pillen} aria-label="Rol">
              <Link href={`${keuzeLink({ rol: "" })}#ranglijst`} aria-current={rangRol === "oppositie" ? "true" : undefined} scroll={false}>Oppositie</Link>
              <Link href={`${keuzeLink({ rol: "kabinet" })}#ranglijst`} aria-current={rangRol === "kabinet" ? "true" : undefined} scroll={false}>Kabinet</Link>
            </nav>
            {/* De weergave ook hier te kiezen; hij staat gelijk met die bij de fracties (feedback Niels, 28 oktober 2026) */}
            {stuk !== "Wetsvoorstel" && (
              <nav className={s.pillen} aria-label="Weergave van de ranglijst">
                <Link href={`${keuzeLink({ weergave: "" })}#ranglijst`} aria-current={!spreiding ? "true" : undefined} scroll={false}>Tabel</Link>
                <Link href={`${keuzeLink({ weergave: "spreiding" })}#ranglijst`} aria-current={spreiding ? "true" : undefined} scroll={false}>Spreidingsdiagram</Link>
              </nav>
            )}
            <GrafiekVlak>
            {plekken.length === 0 ? (
              <Tekst>Geen Kamerleden met minstens {minimum} {meervoud} in deze periode.</Tekst>
            ) : spreiding && stuk !== "Wetsvoorstel" ? (
              <Spreiding label={`Kamerleden (${rangRol}): ${meervoud} ingediend tegenover aandeel aangenomen`} xLabel={`${meervoud} ingediend`}
                punten={plekken.map((p, i) => ({ key: p.persoon, label: p.naam, x: p.ingediend, y: p.aandeel, rol: rangRol, href: `${link({ persoon: p.persoon })}#stukken`, metLabel: i < 8 }))} />
            ) : (
              <>
                <RanglijstTabel plekken={alleRang ? plekken : plekken.slice(0, 15)} meervoud={meervoud} hrefVoor={(p) => `${link({ persoon: p })}#stukken`} />
                {plekken.length > 15 && (
                  <Data>
                    <Link href={`${keuzeLink({ rang: alleRang ? "" : "alle" })}#ranglijst`} scroll={false}>
                      {alleRang ? "Toon de eerste 15" : `Toon alle ${plekken.length}`}
                    </Link>
                  </Data>
                )}
              </>
            )}
            </GrafiekVlak>
          </GrafiekKader>

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
              <KamerledenTabel leden={getoond} actief={persoon} rolVan={rolVan} hrefVoor={(p) => `${link({ ...(fractie ? { fractie } : {}), ...(q ? { q } : {}), persoon: p })}#stukken`} />
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
      <Bronregel toelichting="Indieners uit de open data van de Tweede Kamer; de uitslag is die van de Kamer. Moties, amendementen en initiatiefwetten apart; bij een initiatiefwet telt de eindstemming in de Tweede Kamer." />
    </Inhoud>
  );
}
