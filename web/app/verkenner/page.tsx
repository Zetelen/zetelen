// Cohesie-verkenner (component cohesie-pagina). Periode, periodesoort en variant staan in de URL
// en worden op de server opgehaald; fractie en weergave regelt de verkenner in de browser.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { PeriodeKeuze } from "@/components/cohesie/PeriodeKeuze";
import { Verkenner } from "@/components/cohesie/Verkenner";
import { Label, SectieKop, Tekst } from "@/components/Typografie";
import { cohesieIn, fractiesIn, keuzeUitUrl, perioden } from "@/lib/cohesie";
import { ordenFracties } from "@/lib/ordening";
import s from "@/components/cohesie/verkenner.module.css";
import { Inklapbaar } from "@/components/Inklapbaar";
import { SamenRegeren } from "@/components/lezingen/SamenRegeren";
import { MobielPaneel } from "@/components/MobielPaneel";
import o from "@/components/onderwerpen/onderwerpen.module.css";

export const metadata: Metadata = {
  title: "Verkenner",
  description: "Hoe vaak stemmen twee fracties in de Tweede Kamer hetzelfde? Kies een fractie en een periode.",
  alternates: { canonical: "/verkenner" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function VerkennerPagina({ searchParams }: Props) {
  const zoek = await searchParams;
  const lijst = await perioden();
  const { soort, periode, variant } = keuzeUitUrl(zoek, lijst);
  const fractieKeuze = (Array.isArray(zoek.fractie) ? zoek.fractie[0] : zoek.fractie) as string | undefined;
  const [fracties, kaart] = periode
    ? await Promise.all([fractiesIn(soort, periode.naam), cohesieIn(soort, periode.naam, variant)])
    : [null, null];
  const soortTekst = soort === "kabinet" ? "dit kabinet" : "deze Kamerperiode";

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
        <Label>Verkenner</Label>
        <SectieKop niveau={1}>Met wie stemt een fractie het vaakst hetzelfde?</SectieKop>
        <div className={o.alleenBreed}>
          <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} />
        </div>
      </section>
      {periode && (
        <Suspense>
          <MobielPaneel samenvatting={<>{periode.naam} · {variant === "alle" ? "alle stemmingen" : "verdeelde stemmingen"}{fractieKeuze ? <> · <strong>{fractieKeuze}</strong></> : ""}</>}>
            <PeriodeKeuze perioden={lijst} soort={soort} periode={periode.naam} variant={variant} />
          </MobielPaneel>
        </Suspense>
      )}

      <Inklapbaar titel="Hoe lees je dit?" className={s.leeswijzer}>
          <Tekst>
            Kies een fractie in de lijst en kijk wie er meekleurt. Lichte stoelen stemden vaak hetzelfde, donkere zelden.
            Gestreept: te weinig stemmingen samen, dus geen oordeel.
          </Tekst>
          <Tekst>
            Een klein deel van de stemmingen is unaniem: iedereen voor of iedereen tegen. Wil je die niet meetellen? Kies dan
            &quot;alleen verdeelde stemmingen&quot;.
          </Tekst>
          <Tekst>
            Zaal, boog of tabel: dezelfde cijfers, drie manieren van kijken. De tabel is het preciest.{" "}
            <Link href="/methodiek#cohesie">Benieuwd hoe we tellen?</Link>
          </Tekst>
        </Inklapbaar>
      <div className={s.indeling}>
        <div style={{ minWidth: 0 }}>
          {!lijst.length ? (
            <LegeStaat label="Niet bereikbaar" titel="De cijfers konden niet worden geladen"
              uitleg="De gegevens zijn nu waarschijnlijk niet bereikbaar. Probeer het over een paar minuten opnieuw." />
          ) : !periode || !fracties?.length || !kaart ? (
            <LegeStaat label="Geen stemmingen" titel="Hier is niet gezeteld"
              uitleg={`In ${soortTekst} zijn geen stemmingen om te vergelijken. Kies een ander ${soort === "kabinet" ? "kabinet" : "Kamerperiode"}.`}
              terug={{ href: "/verkenner", tekst: "Naar het nieuwste kabinet" }} />
          ) : (
            <Suspense>
              <Verkenner fracties={ordenFracties(fracties, kaart)} paren={[...kaart.entries()]} periodeNaam={periode.naam} />
            </Suspense>
          )}
          {periode && fracties?.length && kaart && (
            <Bronregel toelichting={`${periode.naam} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}`} />
          )}
        </div>
      </div>
      {/* Lezing 3 (B4): bij een fractie die in het kabinet zit, de lijn met elke kabinetspartner door de kabinetten */}
      {soort === "kabinet" && periode && fractieKeuze && (
        <SamenRegeren fractie={fractieKeuze} kabinet={periode.naam}
          kabinetten={lijst.filter((p) => p.soort === "kabinet").sort((a, b) => a.begin.localeCompare(b.begin)).map((p) => p.naam)} />
      )}
    </Inhoud>
  );
}
