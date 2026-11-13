// Coalitiebouwer (componenten coalitie-analyse en coalitie-pagina). Definitie en opzet goedgekeurd door Niels op
// 25 oktober 2026; label "concept" weg bij de livegang op 27 oktober 2026 (besluit Niels).
// Standaard alleen verdeelde stemmingen (schakelaar naar alle stemmingen). Deelplaatje per combinatie via
// /coalitie/plaatje.
import { GrafiekKader, GrafiekVlak } from "@/components/deel/GrafiekKader";
import type { Metadata } from "next";
import { Suspense } from "react";
import { CoalitieBouwer } from "@/components/coalitie/CoalitieBouwer";
import { GroepSamenvatting } from "@/components/coalitie/GroepSamenvatting";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { Inklapbaar } from "@/components/Inklapbaar";
import { MobielPaneel } from "@/components/MobielPaneel";
import { Kaart, Kern } from "@/components/Onderdelen";
import { Label, SectieKop, Tekst } from "@/components/Typografie";
import { coalitieVan, cohesieIn, fractiesIn, keuzeUitUrl, perioden } from "@/lib/cohesie";
import { coalitieOpvalt, kabinetBijStart } from "@/lib/kern";
import { ordenFracties } from "@/lib/ordening";
import { snelkeuzes } from "@/lib/coalitie";
import kabinetCu50Plus from "@/content/actueel/kabinet-cu-50plus.json";
import blokKabinet from "@/content/actueel/blok-kabinet.json";
import akkoordBelastingplan from "@/content/actueel/akkoord-belastingplan.json";
import coalitieVerdeeld from "@/content/actueel/coalitie-verdeeld.json";
import o from "@/components/onderwerpen/onderwerpen.module.css";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const waarde = (zoek: Record<string, string | string[] | undefined>, k: string) => (Array.isArray(zoek[k]) ? zoek[k]?.[0] : zoek[k]) as string | undefined;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const zoek = await searchParams;
  const plaatje = new URLSearchParams(Object.fromEntries(["soort", "periode", "groep", "variant"].flatMap((k) => (waarde(zoek, k) ? [[k, waarde(zoek, k)!]] : []))));
  const groep = waarde(zoek, "groep");
  return {
    title: "Coalitie",
    description: groep
      ? `${groep.split(",").join(", ")}: bij wie haalde deze groep een meerderheid in de Tweede Kamer?`
      : "Stel zelf een groep fracties samen. Bij welke andere fracties haalde die groep eerder een meerderheid?",
    openGraph: { images: [{ url: `/coalitie/plaatje?${plaatje.toString()}`, width: 1200, height: 630 }] },
    // Elke combinatie van keuzes is dezelfde pagina: de canonical wijst naar het kale pad (SEO-audit 26 oktober)
    alternates: { canonical: "/coalitie" },
  };
}

export default async function Coalitie({ searchParams }: Props) {
  const zoek = await searchParams;
  const lijst = await perioden();
  const { soort, periode } = keuzeUitUrl(zoek, lijst);
  // Standaard alleen verdeelde stemmingen (besluit Niels): bij alle stemmingen wint een groep bijna altijd
  const variant = waarde(zoek, "variant") === "alle" ? "alle" : "verdeeld";
  const [fracties, kaart] = periode ? await Promise.all([fractiesIn(soort, periode.naam), cohesieIn(soort, periode.naam, "alle")]) : [null, null];
  // Wat opvalt (K11): had het gekozen kabinet bij de start een meerderheid? Bij een Kamerperiode geen regel.
  const rollen = soort === "kabinet" && periode ? await coalitieVan(periode.naam) : null;
  const opvalt = rollen?.size && fracties && periode ? coalitieOpvalt(periode.naam, kabinetBijStart(fracties, rollen)) : null;
  // Snelkeuzes (K18 punt 3c) voor het huidige kabinet (zonder einde). Kabinetspartijen uit api.coalitie; de partijen
  // waarmee het kabinet eind oktober 2026 sprak uit het Actueel-stuk kabinet-cu-50plus (ze staan niet in api.coalitie,
  // want ze hebben geen rol in het kabinet); "zonder" is de partij uit het Actueel-stuk coalitie-verdeeld.
  const huidig = lijst.find((p) => p.soort === "kabinet" && !p.einde);
  const huidigRollen = huidig ? (huidig.naam === periode?.naam && rollen ? rollen : await coalitieVan(huidig.naam)) : null;
  const volgorde = kabinetCu50Plus.tegen;
  const kabinet = huidigRollen ? [...huidigRollen.entries()].filter(([, r]) => r.rol === "kabinet" && !r.tot).map(([a]) => a)
    .sort((a, b) => (volgorde.indexOf(a) + 1 || 99) - (volgorde.indexOf(b) + 1 || 99) || a.localeCompare(b)) : [];
  const steun = huidig && kabinetCu50Plus.kabinet === huidig.naam ? kabinetCu50Plus.groep : [];
  const zonder = huidig && coalitieVerdeeld.kabinet === huidig.naam ? coalitieVerdeeld.buiten : "";
  // JA21, BBB en SGP uit het Actueel-stuk blok-kabinet (snelkeuze op verzoek van Niels, 13 november 2026)
  const blok = huidig && blokKabinet.kabinet === huidig.naam ? blokKabinet.groep : [];
  // D66, CDA, PRO en Volt: de partijen van het akkoord uit het Actueel-stuk akkoord-belastingplan
  const akkoord = huidig && akkoordBelastingplan.kabinet === huidig.naam ? akkoordBelastingplan.kamers.vier : [];
  const zaalHuidig = huidig?.naam === periode?.naam && soort === "kabinet" && fracties ? fracties.filter((f) => f.inZaal).map((f) => f.afkorting) : [...kabinet, ...steun, ...blok, ...akkoord];
  const snel = huidig && kabinet.length ? { periode: huidig.naam, keuzes: snelkeuzes(kabinet, steun, zonder, zaalHuidig, blok, akkoord) } : undefined;
  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
        <Label>Coalitie</Label>
        <SectieKop niveau={1}>Welke partijen halen samen een meerderheid?</SectieKop>
        <Kern ziet="Een groep fracties die jij kiest: hoeveel zetels die heeft, en met welke andere fracties ze eerder een meerderheid haalde." opvalt={opvalt} />
        <Tekst>
          Nu zetel jij. Kies fracties in de lijst of in de zaal en stel een kabinet samen, fictief of niet. Je ziet hoeveel zetels het
          heeft, en bij welke andere fracties die groep in de gekozen periode een meerderheid haalde.
        </Tekst>
        <div className={o.alleenBreed}>
          <Suspense>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} pad="/coalitie" />
          </Suspense>
        </div>
      </section>
      {periode && (
        <Suspense>
          <MobielPaneel samenvatting={<>{periode.naam} · {variant === "alle" ? "alle stemmingen" : "verdeelde stemmingen"}<GroepSamenvatting /></>}>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode.naam} variant={variant} pad="/coalitie" />
          </MobielPaneel>
        </Suspense>
      )}
      <Inklapbaar titel="Hoe lees je dit?">
        <Tekst>
          Eensgezind: alle fracties in je groep stemden hetzelfde, allemaal voor of allemaal tegen. Meegestemd: een andere fractie
          koos dezelfde kant. Beslissend: de groep had een meerderheid, en zonder die fractie niet meer. De zetels tellen zoals ze
          waren op het moment van de stemming. Standaard tellen alleen verdeelde stemmingen mee: er stemden fracties voor en tegen.{" "}
          <a href="/methodiek#coalitie">Hoe Zetelen telt</a>
        </Tekst>
      </Inklapbaar>
      <Kaart>
        <Label>Terugkijken, geen voorspelling</Label>
        <Tekst>
          Hier tel je hoe er echt is gestemd. Het zegt niets over hoe fracties straks zullen stemmen. En het is geen advies over
          welke samenwerking goed of wenselijk is.
        </Tekst>
      </Kaart>
      {!periode || !fracties?.length || !kaart ? (
        <LegeStaat label="Geen stemmingen" titel="In deze periode zijn geen stemmingen" uitleg="Kies een andere periode en tel opnieuw." />
      ) : (
        <GrafiekKader grafiek="coalitie" id="bouwer" style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", scrollMarginTop: 80 }}>
          <GrafiekVlak>
            <Suspense>
              <CoalitieBouwer key={`${soort}|${periode.naam}`} fracties={ordenFracties(fracties, kaart)} soort={soort} periode={periode.naam}
                alleenVerdeeld={variant === "verdeeld"} snel={snel} />
            </Suspense>
          </GrafiekVlak>
          <Bronregel toelichting={`${periode.naam} · eigen berekening, zie de methodiek`} />
        </GrafiekKader>
      )}
    </Inhoud>
  );
}
