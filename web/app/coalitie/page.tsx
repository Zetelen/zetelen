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
  const groep = (waarde(zoek, "groep") ?? "").split(",").filter(Boolean);
  const [fracties, kaart] = periode ? await Promise.all([fractiesIn(soort, periode.naam), cohesieIn(soort, periode.naam, "alle")]) : [null, null];
  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
        <Label>Coalitiebouwer · concept</Label>
        <SectieKop niveau={1}>Bij wie haal je een meerderheid?</SectieKop>
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
          <MobielPaneel samenvatting={<>{periode.naam} · {variant === "alle" ? "alle stemmingen" : "verdeelde stemmingen"}{groep.length ? <> · <strong>{groep.join(" + ")}</strong></> : ""}</>}>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode.naam} variant={variant} pad="/coalitie" />
          </MobielPaneel>
        </Suspense>
      )}
      <Inklapbaar titel="Hoe lees je dit?">
        <Tekst>
          Eensgezind: alle fracties in je groep stemden hetzelfde, allemaal voor of allemaal tegen. Meegestemd: een andere fractie
          koos dezelfde kant. Beslissend: de groep had een meerderheid, en zonder die fractie niet meer. De zetels tellen zoals ze
          waren op het moment van de stemming. Standaard tellen alleen verdeelde stemmingen mee: er stemden fracties voor en tegen.{" "}
          <a href="/methodiek#coalitie">Benieuwd hoe we tellen?</a>
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
        <Suspense>
          <CoalitieBouwer fracties={ordenFracties(fracties, kaart)} soort={soort} periode={periode.naam} alleenVerdeeld={variant === "verdeeld"} />
        </Suspense>
      )}
      {periode && <Bronregel toelichting={`${periode.naam} · eigen berekening, zie de methodiek`} />}
    </Inhoud>
  );
}
