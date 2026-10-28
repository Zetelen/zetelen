// Voorpagina (E3-S1), herzien op 25 oktober 2026: het verhaal van de site in hoofdstukken, die elk eindigen
// bij de plek op de site waar je verder kunt kijken (besluit Niels). Hoofdstuk 3 (onderwerpen) laat de twee
// grootste kabinetspartijen per beleidsterrein zien (component onderwerpen).
// Sinds 26 oktober 2026 (B14 en K3): de opening vraagt waar fracties elkaar vinden, met twee lezingen en een
// uitnodiging; dan "Maar eerst: hoe zijn we hier gekomen?". Hoofdstukken met een kop over de volle breedte.
// Sinds 27 oktober 2026 (K11): het overzicht "Kijk zelf" staat direct na de opening, voor het verhaal.
// Sinds 28 oktober 2026: de kop zegt wat de site is; de cijfers volgen daarna, direct met de twee lezingen.
import type { Metadata } from "next";
import { KAMERLEDEN, SITE } from "@/lib/site";
import Link from "next/link";
import { Inhoud, knopKlasse } from "@/components/Kader";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { HoofdstukKop, Lezingen } from "@/components/Onderdelen";
import { Data, HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { TerreinBalken } from "@/components/onderwerpen/TerreinBalken";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { procent } from "@/lib/cohesie";
import { cohesiePerTerrein, paarPerTerrein, uitersten } from "@/lib/onderwerpen";
import type { Stap } from "@/lib/verhaal";
import { bredeSteunPerKabinet, kabinetNu, kabinetspartners, laadVerhaal, samenwerking, zaalVerhaal } from "@/lib/voorpagina";
import { BredeSteun } from "@/components/BredeSteun";
import { jaarWerk, periodeWerk } from "@/lib/zetelwerk";
import s from "./voorpagina.module.css";

// Titel met het onderwerp erin; "Zetelen" alleen zegt niets aan wie de site niet kent (SEO-audit 26 oktober)
export const metadata: Metadata = {
  title: { absolute: "Zetelen: wie stemt met wie in de Tweede Kamer?" },
  description: SITE.beschrijving,
  alternates: { canonical: "/" },
};

// Het overzicht na de opening: de drie vragen staan al als knoppen in de hero, dus de tegels tonen de andere
// onderdelen en de rest staat op één regel (feedback Niels K3 en K11, 27 oktober 2026)
const VRAGEN = [
  { href: "/stemgenoten", vraag: "Stem jij zoals zij?", tekst: "Kies je kant bij echte stemmingen en zie welke fracties net zo stemden." },
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
  // De kop "Maar eerst: hoe zijn we hier gekomen?" staat boven het verhaal; de eerste kaart herhaalt hem niet
  const zonderKop = (stappen: Stap[]): Stap[] => stappen.map((st, i) => (i === 0 ? { ...st, hoofdstuk: undefined } : st));
  return (
    <Inhoud>
      {/* Hero met de lijntekening van het Binnenhof (ontwerp Niels, public/binnenhof.svg). Het tekstvlak staat links,
          de Ridderzaal rechts; op een telefoon staat het beeld boven het vlak. */}
      <section className={s.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/binnenhof.svg" alt="" aria-hidden="true" className={s.heroBeeld} />
        <div className={s.heroVlak}>
        <Label><em>zetelen</em> (ww.) · stemmen, onderhandelen en meetellen in de Tweede Kamer</Label>
        {/* Een kop die zegt wat de site is, in plaats van een vraag met een strekking (feedback van bezoekers, besluit Niels
            28 oktober 2026). De cijfers staan daaronder, direct met de twee lezingen. */}
        <HeroKop>Wie stemt met wie in de Tweede Kamer?</HeroKop>
        <Tekst>
          Alle stemmingen sinds 2010, per fractie, per onderwerp en per kabinet. Zoek zelf, of lees eerst wat opvalt.
        </Tekst>
        <nav className={s.cta} aria-label="Zoek zelf">
          <Link href="/verkenner" className={s.ctaHoofd}>Wie stemt met wie?</Link>
          <Link href="/onderwerpen" className={knopKlasse}>Waar zijn ze het over eens?</Link>
          <Link href="/coalitie" className={knopKlasse}>Stel zelf een coalitie samen</Link>
        </nav>
        </div>
      </section>

      <section className={s.opening}>
        <Label>Wat opvalt</Label>
        <SectieKop>Hoe vaak stemmen kabinet en oppositie samen?</SectieKop>
        {samen && kabinet && (
          <>
            {/* De getallen als trechter (feedback Niels K3, 27 oktober 2026); de zin blijft voor schermlezers */}
            <p className="verborgen">
              Onder kabinet-{kabinet.naam} nam de Kamer {getal(samen.aangenomen)} van de {getal(samen.moties)} moties aan. Bij{" "}
              {getal(samen.breed)} daarvan stemde ten minste één fractie uit het kabinet én één uit de oppositie voor.
            </p>
            <div className={s.trechter} aria-hidden="true">
              <span className={s.trechterKop}>Moties onder kabinet-{kabinet.naam}</span>
              {[
                { tekst: "ingediend", n: samen.moties },
                { tekst: "aangenomen", n: samen.aangenomen },
                { tekst: "met stemmen van kabinet én oppositie", n: samen.breed },
              ].map((r, i) => (
                <div key={r.tekst} className={s.trechterRij} data-stap={i}>
                  <span className={s.trechterBalk} style={{ width: `${Math.max(18, (100 * r.n) / samen.moties)}%` }}>{getal(r.n)}</span>
                  <span className={s.trechterTekst}>{r.tekst}</span>
                </div>
              ))}
            </div>
            <Tekst>
              De oppositie kreeg {samen.oppositieNu}% van haar moties erdoor. Onder {samen.eerste} was dat {samen.oppositieEerst}%.
            </Tekst>
          </>
        )}
        {/* De twee lezingen direct bij de cijfers, naast elkaar (tekst akkoord Niels, 26 oktober 2026) */}
        <Lezingen
          links={{ titel: "Er wordt meer samengewerkt dan het lijkt", tekst: "Achter de ruzie in het debat stemmen kabinet en oppositie vaak samen, en dat is sinds 2010 flink toegenomen." }}
          rechts={{ titel: "Of: eens zijn over een motie zegt weinig", tekst: "Over een verzoek om een onderzoek of een brief is de Kamer het snel eens. Waar het om geld en koers gaat, bij de begroting en de grote wetten, staan kabinet en oppositie nog steeds vaak tegenover elkaar." }}
        />
        {perPeriode && perPeriode.length > 0 && (
          <>
            <Label>Aangenomen met stemmen van kabinet én oppositie, per kabinet</Label>
            <BredeSteun rijen={bredeSteunPerKabinet(perPeriode)} />
            <Data>
              Deel van alle ingediende moties en amendementen per kabinet dat werd aangenomen met stemmen voor van ten minste één
              fractie uit het kabinet en één uit de oppositie, naast de indieners. Gedoogsteun telt als kabinet.
            </Data>
          </>
        )}
        <Tekst>
          Op sommige onderwerpen, zoals asiel, gaan fracties juist verder uit elkaar dan gemiddeld. Zoek zelf waar ze elkaar vinden,
          en waar niet.
        </Tekst>
      </section>

      {/* Het overzicht direct na de opening, voor het scrollverhaal (K11, 27 oktober 2026): bezoekers misten het
          overzicht, en het stond helemaal onderaan */}
      <section id="verder" className={s.hoofdstuk} style={{ maxWidth: "none", scrollMarginTop: 80 }}>
        <HoofdstukKop titel="Meer op Zetelen" />
        <div className={s.tegels}>
          {VRAGEN.map((t) => (
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

      <HoofdstukKop titel="Maar eerst: hoe zijn we hier gekomen?" id="verhaal" />
      {d ? (
        <ScrollVerhaal verhaal={{ breed: zonderKop(zaalVerhaal(d)) }} label="De zaal van de Tweede Kamer" tijdlijn stapHoogte="70vh" />
      ) : (
        <Tekst>Het verhaal kon niet worden geladen. Probeer het over een paar minuten opnieuw, of ga direct naar de verkenner.</Tekst>
      )}

      {partners && paar && u && kabinet && (
        <section className={s.hoofdstuk} style={{ maxWidth: "none" }}>
          <HoofdstukKop nummer="3" titel="Samen in het kabinet. Overal eens?" />
          <Tekst>
            {partners.a.afkorting} en {partners.b.afkorting} zijn de grootste partijen van kabinet-{kabinet.naam}
            {partners.totaal != null ? ` en stemmen in ${procent(partners.totaal)} van de stemmingen hetzelfde` : ""}. Per onderwerp
            verschilt dat: het vaakst eens bij {u.hoog.terrein} ({procent(u.hoog.cohesie)}), het minst bij {u.laag.terrein} ({procent(u.laag.cohesie)}).
          </Tekst>
          <TerreinBalken lijst={paar} totaal={partners.totaal} label={`Cohesie van ${partners.a.afkorting} en ${partners.b.afkorting} per beleidsterrein`} />
          <Link href={`/onderwerpen?soort=kabinet&periode=${encodeURIComponent(kabinet.naam)}&fractie=${encodeURIComponent(partners.a.afkorting)}&met=${encodeURIComponent(partners.b.afkorting)}`}
            className={knopKlasse}>
            Vergelijk zelf twee fracties per onderwerp
          </Link>
        </section>
      )}

      <section className={s.hoofdstuk}>
        <HoofdstukKop nummer="4" titel="Stel zelf een coalitie samen" />
        <Tekst>
          {kabinet && kabinet.zetels < 76
            ? `Kabinet-${kabinet.naam} heeft ${kabinet.zetels} zetels en heeft er 76 nodig voor een meerderheid. `
            : ""}
          Stel zelf een groep fracties samen en zie bij welke andere fracties die groep in het verleden een meerderheid
          haalde.
        </Tekst>
        <Link href="/coalitie" className={knopKlasse}>Naar de coalitiebouwer</Link>
      </section>

      {jaren && jaren.length > 0 && (() => {
        // Hoofdstuk 5: de andere kant. Het kabinet heeft de oppositie nodig; wat kan de oppositie zelf?
        const moties = jaren.filter((r) => r.soort === "Motie");
        const perJaar = [...new Set(moties.map((r) => r.jaar))].sort().map((j) => ({
          jaar: j, totaal: moties.filter((r) => r.jaar === j).reduce((t, r) => t + r.ingediend, 0),
          oppositie: moties.filter((r) => r.jaar === j && r.indiener_rol === "oppositie").reduce((t, r) => t + r.ingediend, 0),
        }));
        const max = Math.max(...perJaar.map((x) => x.totaal));
        const eerste = perJaar[0], laatste = perJaar.filter((x) => x.jaar < new Date().getFullYear()).pop() ?? perJaar[perJaar.length - 1];
        return (
          <section className={s.hoofdstuk}>
            <HoofdstukKop nummer="5" titel="En de oppositie? Wat kun je als je niet regeert?" />
            <Tekst>
              Het belangrijkste middel van de oppositie is de motie: een verzoek van de Kamer aan het kabinet. In {eerste.jaar} stemde de Kamer over {eerste.totaal.toLocaleString("nl-NL")} moties, in {laatste.jaar} over{" "}
              {laatste.totaal.toLocaleString("nl-NL")}. Het grootste deel komt van de oppositie. Maar hoeveel haalt het, en verandert dat
              als het kabinet geen meerderheid heeft?
            </Tekst>
            <Data>Moties per jaar sinds {eerste.jaar}; blauw is het deel van de oppositie.</Data>
            <div className={s.jaren} aria-hidden="true">
              {perJaar.map((x) => (
                <span key={x.jaar} title={`${x.jaar}: ${x.totaal} moties`} style={{ height: `${(100 * x.totaal) / max}%` }}>
                  <span style={{ height: `${x.totaal ? (100 * x.oppositie) / x.totaal : 0}%` }} />
                </span>
              ))}
            </div>
            <Link href="/oppositie" className={knopKlasse}>Naar Oppositiewerk</Link>
          </section>
        );
      })()}

      {/* Het overzicht staat sinds K11 bovenaan; onderaan alleen de weg terug */}
      <nav className={s.verder} aria-label="Terug naar het overzicht">
        <a href="#verder">Terug naar het overzicht van Zetelen</a>
      </nav>

      <Bronregel toelichting="Zetels bij het begin van elk kabinet en elke Kamerperiode, gemeten 30 dagen na de start. Kleuren van fracties zijn een eigen palet, geen partijkleuren." />
    </Inhoud>
  );
}
