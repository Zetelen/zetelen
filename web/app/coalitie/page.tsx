// Coalitiebouwer (componenten coalitie-analyse en coalitie-pagina). Definitie en opzet goedgekeurd door Niels op
// 25 oktober 2026; label "concept" tot de lezingen (E2-S10) en de nacontrole van een steekproef er zijn.
// Standaard alleen verdeelde stemmingen (schakelaar naar alle stemmingen). Deelplaatje per combinatie via
// /coalitie/plaatje.
import type { Metadata } from "next";
import { Suspense } from "react";
import { CoalitieBouwer } from "@/components/coalitie/CoalitieBouwer";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { Inklapbaar } from "@/components/Inklapbaar";
import { MobielPaneel } from "@/components/MobielPaneel";
import { Kaart } from "@/components/Onderdelen";
import { Label, SectieKop, Tekst } from "@/components/Typografie";
import { cohesieIn, fractiesIn, keuzeUitUrl, perioden } from "@/lib/cohesie";
import { ordenFracties } from "@/lib/ordening";
import o from "@/components/onderwerpen/onderwerpen.module.css";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const waarde = (zoek: Record<string, string | string[] | undefined>, k: string) => (Array.isArray(zoek[k]) ? zoek[k]?.[0] : zoek[k]) as string | undefined;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const zoek = await searchParams;
  const plaatje = new URLSearchParams(Object.fromEntries(["soort", "periode", "groep", "variant"].flatMap((k) => (waarde(zoek, k) ? [[k, waarde(zoek, k)!]] : []))));
  const groep = waarde(zoek, "groep");
  return {
    title: "Coalitiebouwer",
    description: groep
      ? `${groep.split(",").join(", ")}: bij wie haalde deze groep een meerderheid in de Tweede Kamer?`
      : "Stel zelf een groep fracties samen en zie bij wie die groep in het verleden een meerderheid haalde.",
    openGraph: { images: [{ url: `/coalitie/plaatje?${plaatje.toString()}`, width: 1200, height: 630 }] },
  };
}

export default async function Coalitie({ searchParams }: Props) {
  const zoek = await searchParams;
  const lijst = await perioden();
  const { soort, periode } = keuzeUitUrl(zoek, lijst);
  // Standaard alleen verdeelde stemmingen (besluit Niels): bij alle stemmingen wint een groep bijna altijd
  const variant = waarde(zoek, "variant") === "alle" ? "alle" : "verdeeld";
  const groep = (waarde(zoek, "groep") ?? "").split(",").filter(Boolean);
  const [fracties, kaart] = periode ? await Promise.all([fractiesIn(soort, periode.naam), cohesieIn(soort, periode.naam, "alle")]) : [null, null];
  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
        <Label>Coalitiebouwer · concept</Label>
        <SectieKop>Bij wie haal je een meerderheid?</SectieKop>
        <Tekst>
          Kies fracties in de lijst of in de zaal en stel zo een (fictief) kabinet samen. Je ziet hun zetels, en bij welke andere fracties
          die groep in de gekozen periode een meerderheid haalde.
        </Tekst>
        <div className={o.alleenBreed}>
          <Suspense>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} pad="/coalitie" />
          </Suspense>
        </div>
      </section>
      {periode && (
        <Suspense>
          <MobielPaneel samenvatting={<>{periode.naam} · {variant === "alle" ? "alle stemmingen" : "verdeelde stemmingen"}{groep.length ? <> · <strong>{groep.join(" + ")}</strong></> : ""}</>}>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode.naam} variant={variant} pad="/coalitie" />
          </MobielPaneel>
        </Suspense>
      )}
      <Inklapbaar titel="Zo lees je dit">
        <Tekst>
          Eensgezind: elke fractie in je groep stemde voor of tegen, allemaal hetzelfde. Meegestemd: een andere fractie koos
          dezelfde kant. Beslissend: de groep had de meerderheid, en zonder die fractie niet meer. Zetels tellen zoals ze op het
          moment van de stemming waren. Standaard alleen verdeelde stemmingen (fracties voor en tegen).{" "}
          <a href="/methodiek#coalitie">Hoe is dit berekend?</a>
        </Tekst>
      </Inklapbaar>
      <Kaart>
        <Label>Terugkijken, geen voorspelling</Label>
        <Tekst>
          Dit telt hoe er in het verleden echt is gestemd. Het zegt niets over hoe fracties in de toekomst zouden stemmen, en
          het is geen advies over welke samenwerking goed of wenselijk is.
        </Tekst>
      </Kaart>
      {!periode || !fracties?.length || !kaart ? (
        <LegeStaat label="Geen stemmingen" titel="Geen stemmingen in deze periode" uitleg="Kies een andere periode." />
      ) : (
        <Suspense>
          <CoalitieBouwer fracties={ordenFracties(fracties, kaart)} soort={soort} periode={periode.naam} alleenVerdeeld={variant === "verdeeld"} />
        </Suspense>
      )}
      {periode && <Bronregel toelichting={`${periode.naam} · eigen berekening, zie de methodiek`} />}
    </Inhoud>
  );
}
