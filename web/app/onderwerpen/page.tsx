// Onderwerpen (concept, component onderwerpen, hoofdstuk 3 van het verhaal): waar zijn fracties het over eens?
// Cohesie per beleidsterrein. Zonder tweede fractie een kaart van terrein tegen fractie (op een telefoon een lijst
// per terrein); met een tweede fractie een balk per terrein, met de cohesie over alle stemmingen als referentie.
// Verdieping: tik op een terrein en de dossiers klappen eronder uit, tik op een dossier voor de stemmingen
// (sinds 26 oktober 2026 in de lijst zelf, verzoek Niels). Bovenaan graphic 2 als opening. Keuzes staan in de URL.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { FractieKeuze } from "@/components/onderwerpen/FractieKeuze";
import { MobieleBalk } from "@/components/onderwerpen/MobieleBalk";
import { TerreinBalken, terreinAnker } from "@/components/onderwerpen/TerreinBalken";
import { TerreinLijst } from "@/components/onderwerpen/TerreinLijst";
import { DossierLijst, StemLegenda, StemmingLijst } from "@/components/onderwerpen/Verdieping";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { Inklapbaar } from "@/components/Inklapbaar";
import { dagMaandJaar } from "@/lib/verhaal";
import { stemVerhaal, stemming } from "@/lib/stemmingVerhaal";
import { Data, Label, SectieKop, Tekst } from "@/components/Typografie";
import { cohesieIn, fractiesIn, keuzeUitUrl, perioden, procent } from "@/lib/cohesie";
import { schaalkleur, tekstOp } from "@/lib/kleur";
import { cohesiePerTerrein, paarPerTerrein, perDossier, stemmingenInTerrein, stemmingenPerTerrein, uitersten, verschillen } from "@/lib/onderwerpen";
import { sleutel } from "@/lib/zaal";
import s from "@/components/onderwerpen/onderwerpen.module.css";

export const metadata: Metadata = {
  title: "Onderwerpen",
  description: "Waar zijn fracties in de Tweede Kamer het over eens? Kijk per beleidsterrein, per kabinet of Kamerperiode.",
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
  // Verdieping: dossiers in een terrein, en de stemmingen van een dossier
  const terrein = met && paar?.some((p) => p.terrein === waarde("terrein")) ? waarde("terrein")! : null;
  const stemmingen = terrein && periode && met ? await stemmingenInTerrein(soort, periode.naam, variant, terrein, gekozen.id, met.id) : null;
  const dossiers = stemmingen ? perDossier(stemmingen) : null;
  const dossier = dossiers?.find((d) => d.dossier === waarde("dossier")) ?? null;
  const paarQuery: Record<string, string> = met ? { fractie: gekozen.afkorting, met: met.afkorting } : {};

  // De uitklap onder het gekozen terrein: dossiers met een gestapelde balk, per dossier de stemmingen (oneens eerst),
  // en onderaan alle stemmingen in het terrein waarop het paar verschilde
  const terreinHref = (extra: Record<string, string>) => `/onderwerpen${query({ ...paarQuery, ...(terrein ? { terrein } : {}), ...extra })}`;
  const anders = stemmingen ? verschillen(stemmingen) : [];
  const toonVerschillen = waarde("alle") === "1";
  const uitklapTerrein = !terrein || !met ? null : !dossiers || !stemmingen ? (
    <Tekst>De dossiers laden nu niet. Probeer het over een paar minuten nog eens.</Tekst>
  ) : (
    <>
      <Label>{terrein} · per dossier, van minst naar meest eens</Label>
      <StemLegenda a={gekozen.afkorting} b={met.afkorting} />
      <Data>Geteld: de stemmingen waarop {gekozen.afkorting} en {met.afkorting} allebei voor of tegen stemden. Klik op een dossier voor de stemmingen.</Data>
      <DossierLijst dossiers={dossiers} a={gekozen.afkorting} b={met.afkorting} actief={dossier?.dossier ?? null}
        hrefVoor={(d) => `${terreinHref({ dossier: d })}#dossier-${d}`} sluitHref={`${terreinHref({})}#${terreinAnker(terrein)}`}
        uitklap={dossier ? (
          <StemmingLijst rijen={stemmingen.filter((r) => r.dossier === dossier.dossier).sort((x, y) => Number(!!(x.a && x.b && x.a !== x.b)) > Number(!!(y.a && y.b && y.a !== y.b)) ? -1 : Number(!!(x.a && x.b && x.a !== x.b)) < Number(!!(y.a && y.b && y.a !== y.b)) ? 1 : y.datum.localeCompare(x.datum))}
            a={gekozen.afkorting} b={met.afkorting} titel={`${dossier.eens} van de ${dossier.samen} keer eens · verschillen eerst`} />
        ) : null} />
      {anders.length > 0 ? (
        <>
          <Data>
            <Link href={`${terreinHref(toonVerschillen ? {} : { alle: "1" })}#verschillen`} scroll={false} aria-expanded={toonVerschillen}>
              {toonVerschillen ? "▾" : "▸"} Alle {anders.length} {anders.length === 1 ? "stemming" : "stemmingen"} in {terrein} waarop {gekozen.afkorting} en {met.afkorting} verschilden, nieuwste eerst
            </Link>
          </Data>
          {toonVerschillen && (
            <div id="verschillen" style={{ scrollMarginTop: 80 }}>
              <StemmingLijst rijen={anders} a={gekozen.afkorting} b={met.afkorting} titel={`${terrein} · hier verschilden ${gekozen.afkorting} en ${met.afkorting}`} />
            </div>
          )}
        </>
      ) : (
        <Tekst>Als ze allebei stemden, stemden ze in dit terrein steeds hetzelfde.</Tekst>
      )}
    </>
  );

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Onderwerpen · concept</Label>
        <SectieKop>Waar zijn ze het over eens?</SectieKop>
        <Tekst>
          Achter elk cijfer op deze pagina zitten stemmingen. Eerst één, uit elkaar gehaald. Daarna kies je zelf.
        </Tekst>
      </section>

      {/* Graphic 2 als opening: één stemming uit elkaar gehaald (verzoek Niels, 26 oktober 2026) */}
      <section id="een-stemming" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
        <Label>Achter het cijfer</Label>
        <SectieKop>Eén stemming uit elkaar gehaald</SectieKop>
        <ScrollVerhaal verhaal={{ breed: stemVerhaal(false), smal: stemVerhaal(true) }} label="De stemming over de motie-Eerdmans" hoogteSmal={1080} stapHoogte="60vh" tijdlijn />
        <Data>Stemming over zaak {stemming.zaak}, hoofdelijk, {dagMaandJaar(stemming.datum)}. Kleuren zijn een eigen palet, geen partijkleuren.</Data>
      </section>

      <section id="zelf" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860, scrollMarginTop: 80 }}>
        <Label>Nu jij</Label>
        <SectieKop>Elk percentage is zo opgeteld</SectieKop>
        <Tekst>
          Uit duizenden stemmingen zoals deze. Kies een fractie en zie per beleidsterrein hoe vaak andere fracties dezelfde kant
          kozen. Kies er een tweede bij en vergelijk het paar per onderwerp. Klik dan op een terrein: de dossiers en stemmingen
          erachter klappen eronder uit.
        </Tekst>
        <Inklapbaar titel="Zo lees je dit">
          <Tekst>
            Elke stemming hoort bij een Kamerstukdossier, en elk dossier bij een beleidsterrein. Dat gaat via een trefwoord in de
            titel (asiel, wonen, digitaal), en anders via de vaste commissie die het dossier het vaakst behandelt. Hoort een
            stemming bij meer dossiers, dan telt ze bij elk terrein mee. Lichter betekent vaker hetzelfde gestemd. Gestreept:
            minder dan 25 stemmingen samen, dus geen oordeel. <Link href="/methodiek#onderwerpen">Benieuwd hoe we indelen?</Link>
          </Tekst>
        </Inklapbaar>
        <div className={s.alleenBreed} style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
          <Suspense>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} pad="/onderwerpen" />
            {gekozen && <FractieKeuze fracties={zaal.map((f) => ({ afkorting: f.afkorting, zetels: f.zetels }))} fractie={gekozen.afkorting} met={met?.afkorting ?? null} />}
          </Suspense>
        </div>
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
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
          <Label>{gekozen.afkorting} en {met.afkorting} · {periode.naam}</Label>
          {u && (
            <Tekst>
              Het vaakst eens bij {u.hoog.terrein} ({procent(u.hoog.cohesie)}), het minst bij {u.laag.terrein} ({procent(u.laag.cohesie)}).
              {totaal != null ? ` Over alle stemmingen samen: ${procent(totaal)} (de witte lijn).` : ""}
            </Tekst>
          )}
          <Data>Klik op een terrein: de dossiers klappen eronder uit, van minst naar meest eens.</Data>
          <TerreinBalken lijst={paar} totaal={totaal} label={`Hoe vaak ${gekozen.afkorting} en ${met.afkorting} hetzelfde stemden, per beleidsterrein`}
            hrefVoor={(t) => `/onderwerpen${query({ ...paarQuery, terrein: t })}#${terreinAnker(t)}`} actief={terrein}
            sluitHref={terrein ? `/onderwerpen${query(paarQuery)}#${terreinAnker(terrein)}` : undefined}
            uitklap={terrein ? uitklapTerrein : null} />
          <Data><Link href={`/onderwerpen${query({ fractie: gekozen.afkorting })}`}>Terug naar alle fracties</Link></Data>
        </section>
      ) : (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
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
                  <tr key={t}>
                    <th scope="row">{t} <span className={s.aantal}>{aantallen.get(t)}</span></th>
                    {zaal.filter((f) => f.id !== gekozen.id).map((f) => {
                      const p = perTerrein.get(t)?.get(f.id);
                      const geldig = p && !p.teWeinig && p.cohesie != null;
                      const kleur = geldig ? schaalkleur(p.cohesie!) : null;
                      return (
                        <td key={f.id} className={kleur ? s.cel : `${s.cel} ${s.celTeWeinig}`} style={kleur ? { background: kleur, color: tekstOp(kleur) } : undefined}>
                          <Link href={`/onderwerpen${query({ fractie: gekozen.afkorting, met: f.afkorting })}`}
                            title={`${gekozen.afkorting} en ${f.afkorting}, ${t}: ${geldig ? procent(p.cohesie, 1) : "te weinig stemmingen"}`}>
                            {geldig ? procent(p.cohesie) : <span className="verborgen">te weinig stemmingen</span>}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.alleenSmal}>
            <TerreinLijst terreinen={terreinen} perTerrein={perTerrein} aantallen={aantallen}
              fracties={zaal.filter((f) => f.id !== gekozen.id).map((f) => ({ id: f.id, afkorting: f.afkorting }))}
              hrefMet={(afk) => `/onderwerpen${query({ fractie: gekozen.afkorting, met: afk })}`} />
          </div>
          <Data>
            Het getal achter een terrein is het aantal stemmingen in deze periode. Kies een cel en vergelijk {gekozen.afkorting} en die fractie per
            terrein. Gestreept: minder dan 25 stemmingen samen.
          </Data>
        </section>
      )}

      <Bronregel toelichting={`Beleidsterrein via het Kamerstukdossier: een trefwoord in de titel, anders de vaste commissie die het dossier het vaakst behandelt. Een stemming bij meer dossiers telt bij elk terrein mee. ${variant === "alle" ? "Alle stemmingen" : "Alleen verdeelde stemmingen"}.`} />
    </Inhoud>
  );
}
