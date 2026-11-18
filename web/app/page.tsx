// Voorpagina (E3-S1), herzien op 25 oktober 2026: het verhaal van de site in hoofdstukken, die elk eindigen
// bij de plek op de site waar je verder kunt kijken (besluit Niels). Hoofdstuk 3 (onderwerpen) laat de twee
// grootste kabinetspartijen per beleidsterrein zien (component onderwerpen).
// Sinds 26 oktober 2026 (B14 en K3): de opening vraagt waar fracties elkaar vinden, met twee lezingen en een
// uitnodiging; dan "Hoe kwam deze Kamer tot stand?" (tot 28 oktober 2026 "Maar eerst: hoe zijn we hier gekomen?"). Hoofdstukken met een kop over de volle breedte.
// Sinds 27 oktober 2026 (K11): het overzicht "Kijk zelf" staat direct na de opening, voor het verhaal.
// Sinds 28 oktober 2026: de kop zegt wat de site is; de cijfers volgen daarna, direct met de twee lezingen.
// Later die dag (bezoekerscijfers, akkoord Niels): op de telefoon staan de drie knoppen in het eerste scherm, het verhaal
// is over te slaan en elke stap eindigt bij een plek op de site.
import type { Metadata } from "next";
import { KAMERLEDEN, SITE } from "@/lib/site";
import Link from "next/link";
import { Inhoud, knopKlasse } from "@/components/Kader";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { HoofdstukKop, Lezingen } from "@/components/Onderdelen";
import { Tabbladen } from "@/components/Tabbladen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { TerreinBalken } from "@/components/onderwerpen/TerreinBalken";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { procent } from "@/lib/cohesie";
import { cohesiePerTerrein, paarPerTerrein, uitersten } from "@/lib/onderwerpen";
import type { Stap } from "@/lib/verhaal";
import { bredeSteunPerKabinet, kabinetNu, kabinetspartners, laadVerhaal, samenwerking, zaalVerhaal } from "@/lib/voorpagina";
import { BredeSteun } from "@/components/BredeSteun";
import { GrafiekKader, GrafiekVlak } from "@/components/deel/GrafiekKader";
import { jaarWerk, periodeWerk } from "@/lib/zetelwerk";
import { STUKKEN, datumTekst } from "@/lib/actueel";
import s from "./voorpagina.module.css";
import uitgelicht from "@/components/verhaal/uitgelicht.module.css";

// Titel met het onderwerp erin; "Zetelen" alleen zegt niets aan wie de site niet kent (SEO-audit 26 oktober)
export const metadata: Metadata = {
  title: { absolute: "Zetelen: wie stemt met wie in de Tweede Kamer?" },
  description: SITE.beschrijving,
  alternates: { canonical: "/" },
};

// Het overzicht na de opening: de drie vragen staan al als knoppen in de hero, dus de tegels tonen de andere
// onderdelen en de rest staat op één regel (feedback Niels K3 en K11, 27 oktober 2026)
const HOOFDVRAGEN = [
  { href: "/verkenner", vraag: "Wie stemt met wie?", tekst: "Zie per kabinet welke fracties het vaakst hetzelfde stemmen." },
  { href: "/onderwerpen", vraag: "Waar zijn ze het over eens?", tekst: "Per beleidsterrein: waar fracties elkaar vinden, en waar niet." },
  { href: "/coalitie", vraag: "Stel zelf een coalitie samen", tekst: "Kies fracties en zie bij wie die groep een meerderheid haalde." },
];
const VRAGEN = [
  { href: "/stemgenoten", vraag: "Met welke partij stem jij het vaakst mee?", tekst: "Kies je kant bij echte stemmingen en zie welke fracties net zo stemden." },
  { href: "/uitgelicht", vraag: "Stemmingen van dichtbij", tekst: "Wie stemde wat, wie stemde anders dan de eigen fractie, en hoe krap was het." },
  { href: "/oppositie", vraag: "Wat kun je als je niet regeert?", tekst: "Zestien jaar moties en amendementen van de oppositie: wat haalt het, en met wie." },
];
const VERDER = [
  { href: "/fracties", titel: "Fracties" },
  ...(KAMERLEDEN ? [{ href: "/kamerleden", titel: "Kamerleden" }] : []),
  { href: "/methodiek", titel: "Methodiek" },
  { href: "/over", titel: "Over Zetelen" },
];

export default async function Voorpagina() {
  const d = await laadVerhaal();
  const kabinet = d ? kabinetNu(d) : null;
  const partners = d ? kabinetspartners(d) : null;
  const perTerrein = partners && kabinet ? await cohesiePerTerrein("kabinet", kabinet.naam, "alle", partners.a.id) : null;
  const paar = partners && perTerrein ? paarPerTerrein(perTerrein, partners.b.id) : null;
  const u = paar ? uitersten(paar) : null;
  const jaren = await jaarWerk();
  const perPeriode = await periodeWerk("kabinet");
  const samen = kabinet && perPeriode ? samenwerking(perPeriode, kabinet.naam, "Rutte I") : null;
  const getal = (n: number) => n.toLocaleString("nl-NL");
  // Brede steun per kabinet (de grafiek in "Wat opvalt"), ook voor de lezing bij het cijfer bovenaan
  const breed = perPeriode ? bredeSteunPerKabinet(perPeriode) : [];
  // De laatste drie stukken uit Actueel, nieuwste eerst (ontwerpronde fase A, 18 november 2026)
  const nieuwste = [...STUKKEN].sort((x, y) => y.datum.localeCompare(x.datum)).slice(0, 3);
  // De kop "Hoe kwam deze Kamer tot stand?" staat boven het verhaal; de eerste kaart herhaalt hem niet
  const zonderKop = (stappen: Stap[]): Stap[] => stappen.map((st, i) => (i === 0 ? { ...st, hoofdstuk: undefined } : st));
  return (
    <Inhoud>
      {/* Ontwerpronde fase A (18 november 2026): het eerste scherm toont één bevinding. Een vraag, een cijfer, een zin en
          een grafiek, met direct de twee lezingen; daaronder de laatste stukken uit Actueel en dan het gereedschap.
          De getallen en zinnen zijn die van de trechter die sinds 27 oktober in "Wat opvalt" stond (K3), niet nieuw.
          De tekening van het Binnenhof staat alleen nog op een breed scherm; op de telefoon is het logo genoeg. */}
      <section className={s.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/binnenhof.svg" alt="" aria-hidden="true" className={s.heroBeeld} />
        <div className={s.heroVlak}>
          <Label><em>zetelen</em> · wie stemt met wie in de Tweede Kamer</Label>
          <HeroKop>Hoe vaak stemmen kabinet en oppositie samen?</HeroKop>
          {samen && kabinet ? (
            <>
              <p className={s.bevinding}>
                <span className={s.bevindingCijfer}>{getal(samen.breed)}</span>{" "}
                van de {getal(samen.aangenomen)} aangenomen moties onder kabinet-{kabinet.naam} kregen stemmen voor van ten
                minste één kabinetspartij én één oppositiepartij.
              </p>
              {/* De getallen als trechter (K3); de zin hierboven zegt hetzelfde voor schermlezers. Eigen anker en deelbeeld
                  (ontwerpronde fase A, punt 6). Geen vergroten: de trechter is al op zijn grootst. */}
              <GrafiekKader grafiek="samen" id="samen" vergroot={false} style={{ scrollMarginTop: 80 }}>
              <GrafiekVlak>
              <div className={s.trechter} aria-hidden="true">
                {[
                  { tekst: "moties in stemming gebracht", n: samen.moties },
                  { tekst: "aangenomen", n: samen.aangenomen },
                  { tekst: "met stemmen van kabinet én oppositie", n: samen.breed },
                ].map((r, i) => (
                  <div key={r.tekst} className={s.trechterRij} data-stap={i}>
                    <span className={s.trechterBalk} style={{ width: `${Math.max(18, (100 * r.n) / samen.moties)}%` }}>{getal(r.n)}</span>
                    <span className={s.trechterTekst}>{r.tekst}</span>
                  </div>
                ))}
              </div>
              </GrafiekVlak>
              </GrafiekKader>
              {/* De voorwaarde bij de kernzin, direct onder de trechter (feitencontrole 18 november 2026: de indieners tellen
                  niet mee); de kernzin zelf is korter sinds de feedback van 18 november */}
              <Data>
                Alleen fracties die de motie niet zelf indienden of mede ondertekenden, tellen mee. Gedoogsteun telt als kabinet.
              </Data>
              {/* De zetels van het kabinet staan sinds 18 november in de lezing hieronder, niet ook hier */}
              {/* Eén knop naar het gereedschap in het eerste scherm: met de knoppen in de hero klikten meer bezoekers door
                  (bezoekerscijfers, akkoord Niels 28 oktober 2026); de andere ingangen staan onder "Zoek zelf" */}
              <Link href="/verkenner" className={s.ctaHoofd} style={{ alignSelf: "flex-start" }}>Wie stemt met wie? Zoek zelf</Link>
            </>
          ) : (
            <Tekst>
              Zetelen zet alle stemmingen sinds 2010 naast elkaar: wie met wie meestemt, op welk onderwerp en onder welk kabinet.
            </Tekst>
          )}
        </div>
      </section>

      {/* De twee lezingen direct bij het cijfer. Herschreven op 18 november 2026 (Niels, na de feitencontrole van de
          posts): het debat zit niet in de data, en voor "bij de begroting en de grote wetten staan ze vaak tegenover
          elkaar" stond geen cijfer op de site. Nu staat er alleen wat de data dragen. Geen steunpartijen (besluit Niels,
          18 november 2026, K18 3e). Geen zetels als verklaring: Rutte IV had wel een meerderheid en kwam even hoog
          (feitencontrole 18 november 2026). */}
      <Lezingen
        links={{ titel: "Er wordt vaak samen gestemd", tekst: `Bij de meeste aangenomen moties stemden een kabinetspartij en een oppositiepartij allebei voor.${breed.length > 1 && breed[0].moties != null && breed[breed.length - 1].moties != null ? ` Het deel van alle moties dat zo werd aangenomen, ging van ${procent(breed[0].moties)} onder ${breed[0].kabinet} naar ${procent(breed[breed.length - 1].moties)} onder ${breed[breed.length - 1].kabinet}.` : ""}` }}
        rechts={{ titel: "Of: een motie is geen wet", tekst: "Een aangenomen motie is een verzoek aan het kabinet. Of het ook gebeurt, staat niet in de stemmingen. Over wetten en de begroting zegt dit cijfer niets." }}
      />

      {/* De laatste drie stukken uit Actueel. Kop en datum komen uit lib/actueel.ts, net als op /actueel zelf. */}
      {nieuwste.length > 0 && (
        <section className={s.actueel} aria-labelledby="nieuw-in-actueel">
          <div className={s.actueelKop}>
            <h2 id="nieuw-in-actueel" className={s.actueelTitel}>Nieuw in Actueel</h2>
            <Link href="/actueel" className={s.actueelAlle}>Alle stukken →</Link>
          </div>
          <ul className={s.actueelLijst}>
            {nieuwste.map((st) => (
              <li key={st.slug}>
                <Link href={`/actueel/${st.slug}`} className={s.actueelStuk}>
                  <span className={s.actueelDatum}>{datumTekst(st.datum)}</span>
                  <span className={s.actueelStukKop}>{st.kop}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Het gereedschap na de bevinding en de stukken. Het overzicht "Meer op Zetelen" (K11) staat hier, de drie
          hoofdvragen als eerste tegels. */}
      <section id="verder" className={s.hoofdstuk} style={{ maxWidth: "none", scrollMarginTop: 80 }}>
        <HoofdstukKop titel="Zoek zelf" />
        <Tekst>
          Zetelen zet alle stemmingen sinds 2010 naast elkaar: wie met wie meestemt, op welk onderwerp en onder welk kabinet.
        </Tekst>
        <div className={s.tegels}>
          {[...HOOFDVRAGEN, ...VRAGEN].map((t) => (
            <Link key={t.href} href={t.href} className={s.tegel}>
              <strong>{t.vraag}</strong>
              <span>{t.tekst}</span>
            </Link>
          ))}
        </div>
        <nav className={s.verder} aria-label="Verder op Zetelen">
          <span>Verder:</span>
          {VERDER.map((t) => <Link key={t.href} href={t.href}>{t.titel}</Link>)}
        </nav>
      </section>

      {/* Telefoon: de hoofdstukken als tabbladen, een tegelijk (1 november 2026); op een groter scherm onder elkaar */}
      <Tabbladen label="Hoofdstukken" delen={[
      { naam: "Wat opvalt", inhoud: <>
      <section className={s.opening}>
        <HoofdstukKop titel="Samen stemmen door de jaren" />
        {samen && kabinet && (
          <Tekst>
            Onder kabinet-{kabinet.naam} kreeg de oppositie {samen.oppositieNu}% van haar moties erdoor. Onder {samen.eerste} was dat {samen.oppositieEerst}%.
            {/* De zetels naast de vergelijking, zonder te zeggen dat ze het verschil verklaren (feitencontrole 18 november 2026) */}
            {kabinet.zetels < 76 && samen.eerste === "Rutte I"
              ? ` Ter vergelijking: kabinet-${kabinet.naam} heeft ${kabinet.zetels} van de 150 zetels; Rutte I had bij de start in oktober 2010 samen met gedoogpartner PVV 76 zetels.`
              : ""}
          </Tekst>
        )}
        {perPeriode && perPeriode.length > 0 && (
          <GrafiekKader grafiek="brede-steun" id="brede-steun" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
            <Label>Aangenomen met stemmen van kabinet én oppositie, per kabinet</Label>
            <GrafiekVlak><BredeSteun rijen={bredeSteunPerKabinet(perPeriode)} /></GrafiekVlak>
            <Data>
              Deel van alle moties en amendementen per kabinet waarover is gestemd, dat werd aangenomen met stemmen van kabinet én oppositie.
              Naast de fracties van de indieners en medeindieners stemde minstens één fractie uit elk kamp voor. Gedoogsteun telt als kabinet.
            </Data>
          </GrafiekKader>
        )}
        <Tekst>
          Op sommige onderwerpen, zoals asiel, gaan fracties juist verder uit elkaar dan gemiddeld. Zoek zelf waar ze elkaar vinden,
          en waar niet.
        </Tekst>
      </section>
      </> },

      /* Kop, link en verhaal als één blok, zodat de grote ruimte tussen de blokken van de pagina er niet tussen valt.
          De kop was "Maar eerst: hoe zijn we hier gekomen?"; sinds het overzicht ervoor staat, klopte "maar eerst" niet
          meer (Niels, 28 oktober 2026; voorstel uit K14) */
      { naam: "De zaal", inhoud: <>
      <section className={uitgelicht.graphic}>
        <HoofdstukKop titel="Hoe kwam deze Kamer tot stand?" id="verhaal" />
        <Tekst><a href="#na-verhaal">Sla het verhaal over ↓</a></Tekst>
        {d ? (
          <ScrollVerhaal verhaal={{ breed: zonderKop(zaalVerhaal(d)) }} label="De zaal van de Tweede Kamer" titel="Hoe kwam deze Kamer tot stand?" tijdlijn tikken stapHoogte="70vh" />
        ) : (
          <Tekst>Het verhaal kon niet worden geladen. Probeer het over een paar minuten opnieuw, of ga direct naar de verkenner.</Tekst>
        )}
      </section>
      <div id="na-verhaal" style={{ scrollMarginTop: 80 }} />
      </> },

      partners && paar && u && kabinet && { naam: "Kabinet", inhoud: (
        // Gedeeld als het paar op Onderwerpen: daar staat dezelfde grafiek met alle keuzes
        <GrafiekKader grafiek="onderwerpen" zoek={{ soort: "kabinet", periode: kabinet.naam, fractie: partners.a.afkorting, met: partners.b.afkorting }}
          id="kabinetspartijen" className={s.hoofdstuk} style={{ maxWidth: "none" }}>
          <HoofdstukKop nummer="3" titel="Zijn kabinetspartijen het overal over eens?" />
          <Tekst>
            {partners.a.afkorting} en {partners.b.afkorting} zijn de grootste partijen van kabinet-{kabinet.naam}
            {partners.totaal != null ? ` en stemmen in ${procent(partners.totaal)} van de stemmingen hetzelfde` : ""}. Per onderwerp
            verschilt dat: het vaakst eens bij {u.hoog.terrein} ({procent(u.hoog.cohesie)}), het minst bij {u.laag.terrein} ({procent(u.laag.cohesie)}).
          </Tekst>
          <GrafiekVlak>
            <TerreinBalken lijst={paar} totaal={partners.totaal} label={`Cohesie van ${partners.a.afkorting} en ${partners.b.afkorting} per beleidsterrein`} />
          </GrafiekVlak>
          <Link href={`/onderwerpen?soort=kabinet&periode=${encodeURIComponent(kabinet.naam)}&fractie=${encodeURIComponent(partners.a.afkorting)}&met=${encodeURIComponent(partners.b.afkorting)}`}
            className={knopKlasse}>
            Vergelijk zelf twee fracties per onderwerp
          </Link>
        </GrafiekKader>
      ) },

      { naam: "Coalitie", inhoud: (
      <section className={s.hoofdstuk}>
        <HoofdstukKop nummer="4" titel="Stel zelf een coalitie samen" />
        <Tekst>
          {kabinet && kabinet.zetels < 76
            ? `Kabinet-${kabinet.naam} heeft ${kabinet.zetels} zetels en heeft er 76 nodig voor een meerderheid. `
            : ""}
          Stel zelf een groep fracties samen en zie bij welke andere fracties die groep in het verleden een meerderheid
          haalde.
        </Tekst>
        <Link href="/coalitie" className={knopKlasse}>Naar Coalitie</Link>
      </section>
      ) },

      jaren && jaren.length > 0 && { naam: "Oppositie", inhoud: (() => {
        // Hoofdstuk 5: de andere kant. Het kabinet heeft de oppositie nodig; wat kan de oppositie zelf?
        const moties = jaren.filter((r) => r.soort === "Motie");
        const perJaar = [...new Set(moties.map((r) => r.jaar))].sort().map((j) => ({
          jaar: j, totaal: moties.filter((r) => r.jaar === j).reduce((t, r) => t + r.ingediend, 0),
          oppositie: moties.filter((r) => r.jaar === j && r.indiener_rol === "oppositie").reduce((t, r) => t + r.ingediend, 0),
        }));
        const max = Math.max(...perJaar.map((x) => x.totaal));
        const eerste = perJaar[0], laatste = perJaar.filter((x) => x.jaar < new Date().getFullYear()).pop() ?? perJaar[perJaar.length - 1];
        return (
          <GrafiekKader grafiek="oppositie-jaren" id="oppositie-per-jaar" className={s.hoofdstuk}>
            <HoofdstukKop nummer="5" titel="Wat kan de oppositie?" />
            <Tekst>
              Het belangrijkste middel van de oppositie is de motie: een verzoek van de Kamer aan het kabinet. In {eerste.jaar} stemde de Kamer over {eerste.totaal.toLocaleString("nl-NL")} moties, in {laatste.jaar} over{" "}
              {laatste.totaal.toLocaleString("nl-NL")}. Het grootste deel komt van de oppositie. Maar hoeveel haalt het, en verandert dat
              als het kabinet geen meerderheid heeft?
            </Tekst>
            <Data>Moties per jaar sinds {eerste.jaar}; blauw is het deel van de oppositie.</Data>
            <GrafiekVlak>
            <div className={s.jaren} aria-hidden="true">
              {perJaar.map((x) => (
                <span key={x.jaar} title={`${x.jaar}: ${x.totaal} moties`} style={{ height: `${(100 * x.totaal) / max}%` }}>
                  <span style={{ height: `${x.totaal ? (100 * x.oppositie) / x.totaal : 0}%` }} />
                </span>
              ))}
            </div>
            </GrafiekVlak>
            <Link href="/oppositie" className={knopKlasse}>Naar Oppositie</Link>
          </GrafiekKader>
        );
      })() },
      ]} />

      {/* Het overzicht staat sinds K11 bovenaan; onderaan alleen de weg terug */}
      <nav className={s.verder} aria-label="Terug naar het overzicht">
        <a href="#verder">Terug naar het overzicht van Zetelen</a>
      </nav>

      <Bronregel toelichting="Zetels bij het begin van elk kabinet en elke Kamerperiode, gemeten 30 dagen na de start. Kleuren van fracties zijn een eigen palet, geen partijkleuren." />
    </Inhoud>
  );
}
