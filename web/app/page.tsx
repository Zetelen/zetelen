// Voorpagina (E3-S1), herzien op 25 oktober 2026: het verhaal van de site in hoofdstukken, die elk eindigen
// bij de plek op de site waar je verder kunt kijken (besluit Niels). Hoofdstuk 3 (onderwerpen) laat de twee
// grootste kabinetspartijen per beleidsterrein zien (component onderwerpen).
// Sinds 26 oktober 2026 (B14 en K3): de opening vraagt waar fracties elkaar vinden, met twee lezingen en een
// uitnodiging; dan "Maar eerst: hoe zijn we hier gekomen?". Hoofdstukken met een kop over de volle breedte.
import type { Metadata } from "next";
import { KAMERLEDEN, SITE } from "@/lib/site";
import Link from "next/link";
import { Inhoud, knopKlasse } from "@/components/Kader";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { HoofdstukKop } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { TerreinBalken } from "@/components/onderwerpen/TerreinBalken";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { procent } from "@/lib/cohesie";
import { cohesiePerTerrein, paarPerTerrein, uitersten } from "@/lib/onderwerpen";
import type { Stap } from "@/lib/verhaal";
import { kabinetNu, kabinetspartners, laadVerhaal, samenwerking, zaalVerhaal } from "@/lib/voorpagina";
import { jaarWerk, periodeWerk } from "@/lib/zetelwerk";
import s from "./voorpagina.module.css";

// Titel met het onderwerp erin; "Zetelen" alleen zegt niets aan wie de site niet kent (SEO-audit 26 oktober)
export const metadata: Metadata = {
  title: { absolute: "Zetelen: wie stemt met wie in de Tweede Kamer?" },
  description: SITE.beschrijving,
  alternates: { canonical: "/" },
};

// Onderaan drie vragen als uitnodiging, en de rest op één regel; de tegels herhaalden het menu (feedback Niels K3,
// 26 oktober 2026)
const VRAGEN = [
  { href: "/verkenner", vraag: "Wie stemt met wie?", tekst: "Kies een fractie en zie hoe vaak elke andere fractie met haar meestemde, per kabinet of Kamerperiode." },
  { href: "/onderwerpen", vraag: "Waar zijn ze het over eens?", tekst: "Per beleidsterrein, voor elk paar fracties, tot op de motie." },
  { href: "/coalitie", vraag: "Kun jij er 76 vinden?", tekst: "Stel zelf een groep fracties samen en zie bij wie die een meerderheid haalde." },
];
const VERDER = [
  { href: "/oppositie", titel: "Oppositiewerk" },
  { href: "/uitgelicht", titel: "Uitgelicht" },
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
        <Label>zetelen (ww.) · stemmen, onderhandelen en meetellen in de Tweede Kamer</Label>
        <HeroKop>Waar vinden ze elkaar?</HeroKop>
        <Tekst>
          <strong>Ruzie, ophef, de waan van de dag.</strong> Wie het nieuws volgt, ziet een verdeelde Kamer en een politiek die op
          slot zit. Maar wat zie je als je de stemmingen telt?
        </Tekst>
        {samen && kabinet && (
          <Tekst>
            Onder kabinet-{kabinet.naam} nam de Kamer {getal(samen.aangenomen)} van de {getal(samen.moties)} moties aan. Bij{" "}
            {getal(samen.breed)} daarvan stemde ten minste één fractie uit het kabinet én één uit de oppositie voor. De oppositie
            kreeg {samen.oppositieNu}% van haar moties erdoor. Onder {samen.eerste} was dat {samen.oppositieEerst}%.
          </Tekst>
        )}
        <nav className={s.cta} aria-label="Zoek zelf">
          <Link href="/verkenner" className={s.ctaHoofd}>Wie stemt met wie?</Link>
          <Link href="/onderwerpen" className={knopKlasse}>Waar zijn ze het over eens?</Link>
          <Link href="/coalitie" className={knopKlasse}>Kun jij er 76 vinden?</Link>
        </nav>
        </div>
      </section>

      <section className={s.opening}>
        {/* De twee lezingen onder elkaar, zonder tweede kop (feedback Niels K3, 26 oktober 2026) */}
        <Tekst>
          <strong>Er wordt meer samengewerkt dan het lijkt.</strong> Achter de ruzie in het debat stemmen kabinet en oppositie
          vaak samen, en dat is sinds 2010 flink toegenomen.
        </Tekst>
        <Tekst>
          Of: over een verzoek om een onderzoek of een brief is de Kamer het snel eens. Waar het om geld en koers gaat, bij de
          begroting en de grote wetten, staan kabinet en oppositie nog steeds vaak tegenover elkaar.
        </Tekst>
        <Tekst>
          Op sommige onderwerpen, zoals asiel, gaan fracties juist verder uit elkaar dan gemiddeld. Zoek zelf waar ze elkaar vinden,
          en waar niet. <a href="#verder">Alle onderdelen</a>
        </Tekst>
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
        <HoofdstukKop nummer="4" titel="Kun jij er 76 vinden?" />
        <Tekst>
          {kabinet && kabinet.zetels < 76
            ? `Kabinet-${kabinet.naam} heeft ${kabinet.zetels} zetels en heeft er 76 nodig voor een meerderheid. `
            : ""}
          Stel zelf een groep fracties samen en zie bij welke andere fracties die groep in het verleden een meerderheid
          haalde. De coalitiebouwer is nog een concept.
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
              Moties indienen, vooral. In {eerste.jaar} stemde de Kamer over {eerste.totaal.toLocaleString("nl-NL")} moties, in {laatste.jaar} over{" "}
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

      <section id="verder" className={s.hoofdstuk} style={{ maxWidth: "none", scrollMarginTop: 80 }}>
        <HoofdstukKop titel="Maar hoe werd er nou echt gezeteld? Kijk zelf" />
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

      <Bronregel toelichting="Zetels bij het begin van elk kabinet en elke Kamerperiode, gemeten 30 dagen na de start. Kleuren van fracties zijn een eigen palet, geen partijkleuren." />
    </Inhoud>
  );
}
