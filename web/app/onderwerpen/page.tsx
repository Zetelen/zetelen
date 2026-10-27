// Onderwerpen (concept, component onderwerpen, hoofdstuk 3 van het verhaal): waar zijn fracties het over eens?
// Cohesie per beleidsterrein. Zonder tweede fractie een kaart van terrein tegen fractie (op een telefoon een lijst
// per terrein); met een tweede fractie een balk per terrein, met de cohesie over alle stemmingen als referentie.
// Verdieping: tik op een terrein en de dossiers klappen eronder uit, tik op een dossier voor de stemmingen
// (sinds 26 oktober 2026 in de lijst zelf, verzoek Niels). Bovenaan graphic 2 als opening. Keuzes staan in de URL.
import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, Suspense } from "react";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { FractieKeuze } from "@/components/onderwerpen/FractieKeuze";
import { MobieleBalk } from "@/components/onderwerpen/MobieleBalk";
import { TerreinBalken, terreinAnker } from "@/components/onderwerpen/TerreinBalken";
import { TerreinLijst } from "@/components/onderwerpen/TerreinLijst";
import { TerreinUitklap } from "@/components/onderwerpen/TerreinUitklap";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { Inklapbaar } from "@/components/Inklapbaar";
import { dagMaandJaar } from "@/lib/verhaal";
import { stemVerhaal, stemming } from "@/lib/stemmingVerhaal";
import { HoofdstukKop } from "@/components/Onderdelen";
import { Data, HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { cohesieIn, fractiesIn, keuzeUitUrl, perioden, procent } from "@/lib/cohesie";
import { schaalkleur, tekstOp } from "@/lib/kleur";
import { MINIMUM_UITERSTEN, cohesiePerTerrein, dossiersVoorMatrix, paarPerTerrein, perDossier, stemmingenInTerrein, stemmingenPerTerrein, uitersten } from "@/lib/onderwerpen";
import { type Punt, Spreiding } from "@/components/onderwerpen/Spreiding";
import { sleutel } from "@/lib/zaal";
import s from "@/components/onderwerpen/onderwerpen.module.css";
import v from "@/components/cohesie/verkenner.module.css";

export const metadata: Metadata = {
  title: "Onderwerpen",
  description: "Waar zijn fracties in de Tweede Kamer het over eens? Kijk per beleidsterrein, per kabinet of Kamerperiode.",
  alternates: { canonical: "/onderwerpen" },
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
  // Verdieping: het terrein klapt uit met de dossiers en stemmingen (components/onderwerpen/TerreinUitklap.tsx)
  const terrein = met && paar?.some((p) => p.terrein === waarde("terrein")) ? waarde("terrein")! : null;
  const paarQuery: Record<string, string> = met ? { fractie: gekozen.afkorting, met: met.afkorting } : {};
  // Tabel zonder tweede fractie: een terrein klapt uit tot dossiers, in de tabel zelf (zoals een matrix in Power BI)
  const openTerrein = !met && terreinen.includes(waarde("open") ?? "") ? waarde("open")! : null;
  const dossierRijen = openTerrein && periode && gekozen ? await dossiersVoorMatrix(soort, periode.naam, variant, openTerrein, gekozen.id) : null;
  const MAX_DOSSIERS = 20;
  // Paar: balken of spreidingsdiagram (verzoek Niels, 26 oktober 2026). In de spreiding worden na een klik op een
  // terrein de dossiers de punten.
  const spreiding = met ? waarde("weergave") === "spreiding" : false;
  const weergaveQuery: Record<string, string> = spreiding ? { ...paarQuery, weergave: "spreiding" } : paarQuery;
  let punten: Punt[] = [];
  if (spreiding && paar && met && periode) {
    if (terrein) {
      const rijen = await stemmingenInTerrein(soort, periode.naam, variant, terrein, gekozen.id, met.id);
      punten = perDossier(rijen ?? []).map((d) => ({
        sleutel: d.dossier, label: d.titel, samen: d.samen, cohesie: (100 * d.eens) / d.samen, klein: d.samen < 5,
        actief: d.dossier === waarde("dossier"), href: `/onderwerpen${query({ ...weergaveQuery, terrein, dossier: d.dossier })}#dossier-${d.dossier}`,
      }));
    } else {
      punten = paar.filter((p) => p.cohesie != null).map((p) => ({
        sleutel: p.terrein, label: p.terrein, samen: p.gezamenlijk, cohesie: p.cohesie!, klein: p.teWeinig || p.gezamenlijk < MINIMUM_UITERSTEN,
        href: `/onderwerpen${query({ ...weergaveQuery, terrein: p.terrein })}#vergelijking`,
      }));
    }
  }
  const uitklapTerrein = terrein && met && periode ? (
    <TerreinUitklap soort={soort} periode={periode.naam} variant={variant} a={gekozen} b={met} terrein={terrein}
      dossier={waarde("dossier") ?? null} toonVerschillen={waarde("alle") === "1"}
      href={(extra) => `/onderwerpen${query({ ...weergaveQuery, terrein, ...extra })}`} sluitHref={`/onderwerpen${query({ ...weergaveQuery, terrein })}`} />
  ) : null;

  const filters = (
    <div className={s.alleenBreed}>
      <Suspense>
        <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} pad="/onderwerpen" deel="filters" />
      </Suspense>
    </div>
  );

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Onderwerpen · concept</Label>
        <HeroKop>Waar vinden ze elkaar?</HeroKop>
        <Tekst>
          Fracties die het op het ene onderwerp zelden eens worden, stemmen op een ander onderwerp vaak hetzelfde. Hier zie je
          per beleidsterrein hoe vaak fracties dezelfde kant kozen, tot op het dossier en de motie.
        </Tekst>
        <Tekst>
          Elk percentage is opgeteld uit stemmingen. Daarom eerst één stemming van dichtbij: wie stemde wat, en wat telt mee.
          Daarna kies je zelf. <a href="#zelf">Meteen zelf kiezen</a>
        </Tekst>
      </section>

      {/* Graphic 2 als opening: één stemming uit elkaar gehaald (verzoek Niels, 26 oktober 2026) */}
      <section id="een-stemming" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
        <HoofdstukKop titel="Eén stemming uit elkaar gehaald" />
        <ScrollVerhaal verhaal={{ breed: stemVerhaal(false), smal: stemVerhaal(true) }} label="De stemming over de motie-Eerdmans" hoogteSmal={1080} stapHoogte="45vh" tijdlijn />
        <Data>
          Stemming over zaak {stemming.zaak}, hoofdelijk, {dagMaandJaar(stemming.datum)}. Kleuren zijn een eigen palet, geen
          partijkleuren. <Link href="/uitgelicht">Meer stemmingen uit elkaar gehaald</Link>
        </Data>
      </section>

      {/* Nu jij als duidelijke uitnodiging (feedback Niels K1, 26 oktober 2026) */}
      <section id="zelf" className={s.nuJij}>
        <Label>Nu jij</Label>
        <SectieKop>Kies een fractie. Waar vindt ze de anderen?</SectieKop>
        <Tekst>
          Elk percentage hieronder is opgeteld uit duizenden stemmingen zoals deze. Kies een fractie en zie per beleidsterrein
          hoe vaak de andere fracties dezelfde kant kozen. Kies er een tweede bij om het paar te vergelijken, en klik dan op een
          terrein: de dossiers en stemmingen erachter klappen eronder uit.
        </Tekst>
        {/* Fractie, vergelijking en kabinet op één regel; periodesoort en stemmingen als knoppen boven de grafiek
            (feedback Niels K1, 26 oktober 2026) */}
        <div className={`${s.alleenBreed} ${s.keuzeRegel}`}>
          <Suspense>
            {gekozen && <FractieKeuze fracties={zaal.map((f) => ({ afkorting: f.afkorting, zetels: f.zetels }))} fractie={gekozen.afkorting} met={met?.afkorting ?? null} />}
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} pad="/onderwerpen" deel="periode" />
          </Suspense>
        </div>
        <Inklapbaar titel="Hoe lees je dit?">
          <Tekst>
            Elke stemming hoort bij een Kamerstukdossier, en elk dossier bij een beleidsterrein. Dat gaat via een trefwoord in de
            titel (asiel, wonen, digitaal), en anders via de vaste commissie die het dossier het vaakst behandelt. Hoort een
            stemming bij meer dossiers, dan telt ze bij elk terrein mee. Lichter betekent vaker hetzelfde gestemd. Gestreept:
            minder dan 25 stemmingen samen, dus geen oordeel. Een kabinet loopt tot het volgende is beëdigd; de demissionaire tijd
            telt dus mee. <Link href="/methodiek#onderwerpen">Benieuwd hoe we indelen?</Link>
          </Tekst>
        </Inklapbaar>
      </section>
      {periode && gekozen && (
        <Suspense>
          <MobieleBalk perioden={lijst} soort={soort} periode={periode.naam} variant={variant}
            fracties={zaal.map((f) => ({ afkorting: f.afkorting, zetels: f.zetels }))} fractie={gekozen.afkorting} met={met?.afkorting ?? null} />
        </Suspense>
      )}

      {!periode || !gekozen || !perTerrein ? (
        <LegeStaat label="Niet bereikbaar" titel="De onderwerpen laden nu niet" uitleg="Probeer het over een paar minuten nog eens." />
      ) : met && paar ? (
        <section id="vergelijking" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
          {filters}
          <Label>{gekozen.afkorting} en {met.afkorting} · {periode.naam}</Label>
          {u && (
            <Tekst>
              Het vaakst eens bij {u.hoog.terrein} ({procent(u.hoog.cohesie)}), het minst bij {u.laag.terrein} ({procent(u.laag.cohesie)}).
              {totaal != null ? ` Over alle stemmingen samen: ${procent(totaal)} (de witte lijn).` : ""}
            </Tekst>
          )}
          <div className={v.segment} role="group" aria-label="Weergave">
            <Link href={`/onderwerpen${query({ ...paarQuery, ...(terrein ? { terrein } : {}) })}#vergelijking`} scroll={false} aria-current={!spreiding || undefined} className={s.weergaveKnop}>Balken</Link>
            <Link href={`/onderwerpen${query({ ...paarQuery, weergave: "spreiding", ...(terrein ? { terrein } : {}) })}#vergelijking`} scroll={false} aria-current={spreiding || undefined} className={s.weergaveKnop}>Spreiding</Link>
          </div>
          {spreiding ? (
            <>
              <p className={s.toelichting}>
                {terrein
                  ? <>Elk punt is een dossier in {terrein}. Naar rechts: meer stemmingen waarop {gekozen.afkorting} en {met.afkorting} allebei stemden; naar boven: vaker hetzelfde. Hol: minder dan 5 stemmingen samen. Klik op een dossier voor de stemmingen. <Link href={`/onderwerpen${query(weergaveQuery)}#vergelijking`} scroll={false}>← Alle terreinen</Link></>
                  : <>Elk punt is een beleidsterrein. Naar rechts: meer stemmingen waarop {gekozen.afkorting} en {met.afkorting} allebei stemden; naar boven: vaker hetzelfde. Hol: minder dan {MINIMUM_UITERSTEN} stemmingen samen. Klik op een terrein voor de dossiers.</>}
              </p>
              <Spreiding punten={punten} eenheid="stemmingen" labelVanaf={terrein ? Math.max(5, [...punten].sort((x, y) => y.samen - x.samen)[11]?.samen ?? 0) : 0}
                beschrijving={terrein ? `Dossiers in ${terrein}: aantal stemmingen samen en hoe vaak ${gekozen.afkorting} en ${met.afkorting} hetzelfde stemden` : `Beleidsterreinen: aantal stemmingen samen en hoe vaak ${gekozen.afkorting} en ${met.afkorting} hetzelfde stemden`} />
              {terrein && uitklapTerrein}
            </>
          ) : (
          <>
          <p className={s.toelichting}>Klik op een terrein: de dossiers klappen eronder uit, van meest naar minst eens.</p>
          <TerreinBalken lijst={paar} totaal={totaal} label={`Hoe vaak ${gekozen.afkorting} en ${met.afkorting} hetzelfde stemden, per beleidsterrein`}
            hrefVoor={(t) => `/onderwerpen${query({ ...paarQuery, terrein: t })}#${terreinAnker(t)}`} actief={terrein}
            sluitHref={terrein ? `/onderwerpen${query(paarQuery)}#${terreinAnker(terrein)}` : undefined}
            uitklap={terrein ? uitklapTerrein : null} />
          </>
          )}
          <Data><Link href={`/onderwerpen${query({ fractie: gekozen.afkorting })}`}>Terug naar alle fracties</Link></Data>
        </section>
      ) : (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
          {filters}
          <Label>{gekozen.afkorting} en elke andere fractie, per beleidsterrein · {periode.naam}</Label>
          <div className={`${s.kaartKader} ${s.alleenBreed}`}>
            <table className={s.kaart}>
              <caption className="verborgen">Hoe vaak {gekozen.afkorting} hetzelfde stemde als elke andere fractie, per beleidsterrein, in procenten</caption>
              <thead>
                <tr>
                  <th scope="col">Beleidsterrein</th>
                  {zaal.filter((f) => f.id !== gekozen.id).map((f) => <th key={f.id} scope="col">{f.afkorting}</th>)}
                </tr>
              </thead>
              <tbody>
                {terreinen.map((t) => (
                  <Fragment key={t}>
                  <tr id={`rij-${terreinAnker(t)}`} className={t === openTerrein ? s.rijOpen : undefined}>
                    <th scope="row">
                      <Link href={`/onderwerpen${query({ fractie: gekozen.afkorting, ...(t === openTerrein ? {} : { open: t }) })}#rij-${terreinAnker(t)}`}
                        scroll={false} className={s.rijKnop} aria-expanded={t === openTerrein}>
                        <span aria-hidden="true">{t === openTerrein ? "▾" : "▸"}</span> {t} <span className={s.aantal}>{aantallen.get(t)}</span>
                      </Link>
                    </th>
                    {zaal.filter((f) => f.id !== gekozen.id).map((f) => {
                      const p = perTerrein.get(t)?.get(f.id);
                      const geldig = p && !p.teWeinig && p.cohesie != null;
                      const kleur = geldig ? schaalkleur(p.cohesie!) : null;
                      return (
                        <td key={f.id} className={kleur ? s.cel : `${s.cel} ${s.celTeWeinig}`} style={kleur ? { background: kleur, color: tekstOp(kleur) } : undefined}>
                          <Link href={`/onderwerpen${query({ fractie: gekozen.afkorting, met: f.afkorting })}#vergelijking`}
                            title={`${gekozen.afkorting} en ${f.afkorting}, ${t}: ${geldig ? procent(p.cohesie, 1) : "te weinig stemmingen"}`}>
                            {geldig ? procent(p.cohesie) : <span className="verborgen">te weinig stemmingen</span>}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                  {t === openTerrein && (dossierRijen ?? []).slice(0, MAX_DOSSIERS).map((d) => (
                    <tr key={d.dossier} className={s.matrixDossier}>
                      {/* Volledige titel bij hover of tik; title alleen werkt niet op een tablet (feedback Niels, 27 oktober 2026) */}
                      <th scope="row" tabIndex={0}>
                        <span className={s.dossierKort}>{d.titel} <span className={s.aantal}>{d.stemmingen}</span></span>
                        <span className={s.dossierVol} aria-hidden="true">{d.titel} · {d.stemmingen} {d.stemmingen === 1 ? "stemming" : "stemmingen"}</span>
                      </th>
                      {zaal.filter((f) => f.id !== gekozen.id).map((f, i, rij) => {
                        const p = d.per.get(f.id);
                        // Minder dan 5 stemmingen samen: geen percentage, dat zegt dan te weinig
                        const c = p && p.samen >= 5 ? (100 * p.eens) / p.samen : null;
                        const kleur = c != null ? schaalkleur(c) : null;
                        return (
                          // Aantikbaar met een eigen tooltip, ook op tablet; rechts in de tabel opent hij naar links
                          <td key={f.id} tabIndex={0} data-rechts={i >= rij.length / 2 || undefined}
                            className={kleur ? `${s.cel} ${s.celTip}` : `${s.cel} ${s.celTip} ${s.celTeWeinig}`} style={kleur ? { background: kleur, color: tekstOp(kleur) } : undefined}>
                            {c != null ? procent(c) : <span className="verborgen">te weinig stemmingen</span>}
                            <span className={s.celVol} aria-hidden="true">
                              {gekozen.afkorting} en {f.afkorting}: {c != null ? `${p!.eens} van de ${p!.samen} keer hetzelfde (${procent(c)})` : `te weinig stemmingen samen (${p?.samen ?? 0})`}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {t === openTerrein && dossierRijen && dossierRijen.length > MAX_DOSSIERS && (
                    <tr className={s.matrixDossier}><th scope="row" colSpan={zaal.length}>en {dossierRijen.length - MAX_DOSSIERS} kleinere dossiers. Kies een fractie om mee te vergelijken voor de hele lijst.</th></tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.alleenSmal}>
            <TerreinLijst terreinen={terreinen} perTerrein={perTerrein} aantallen={aantallen}
              fracties={zaal.filter((f) => f.id !== gekozen.id).map((f) => ({ id: f.id, afkorting: f.afkorting }))}
              hrefMet={(afk) => `/onderwerpen${query({ fractie: gekozen.afkorting, met: afk })}`} />
          </div>
          {/* Meer contrast dan de gewone datatekst (feedback Niels K1, 26 oktober 2026) */}
          <p className={s.toelichting}>
            Klik op een terrein: de dossiers klappen eronder uit, met de grootste dossiers eerst. Het getal erachter is het aantal
            stemmingen in deze periode. Kies een cel en vergelijk {gekozen.afkorting} en die fractie per terrein. Gestreept: te weinig
            stemmingen samen (een terrein onder de 25, een dossier onder de 5).
          </p>
        </section>
      )}

      <Bronregel toelichting={`Beleidsterrein via het Kamerstukdossier: een trefwoord in de titel, anders de vaste commissie die het dossier het vaakst behandelt. Een stemming bij meer dossiers telt bij elk terrein mee. ${variant === "alle" ? "Alle stemmingen" : "Alleen verdeelde stemmingen"}.`} />
    </Inhoud>
  );
}
