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

export const metadata: Metadata = {
  title: "Verkenner",
  description: "Hoe vaak stemmen twee fracties in de Tweede Kamer hetzelfde? Kies een fractie en een periode.",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function VerkennerPagina({ searchParams }: Props) {
  const lijst = await perioden();
  const { soort, periode, variant } = keuzeUitUrl(await searchParams, lijst);
  const [fracties, kaart] = periode
    ? await Promise.all([fractiesIn(soort, periode.naam), cohesieIn(soort, periode.naam, variant)])
    : [null, null];
  const soortTekst = soort === "kabinet" ? "dit kabinet" : "deze Kamerperiode";

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)" }}>
        <Label>Verkenner</Label>
        <SectieKop>Elke fractie tegenover elke andere</SectieKop>
        <PeriodeKeuze perioden={lijst} soort={soort} periode={periode?.naam ?? null} variant={variant} />
      </section>

      <Inklapbaar titel="Zo lees je dit" className={s.leeswijzer}>
          <Tekst>
            Kies een fractie in de lijst naast de zaal. Die licht op in koper; de andere fracties kleuren naar het aandeel stemmingen waarop zij
            dezelfde kant kozen. Licht is een hoge cohesie, donker een lage. Gearceerd betekent te weinig gezamenlijke
            stemmingen (minder dan 25) om iets te zeggen.
          </Tekst>
          <Tekst>
            Veel stemmingen zijn unaniem; die maken iedereen een beetje eensgezind. Met &quot;alleen verdeelde
            stemmingen&quot; tel je alleen de stemmingen waarover de Kamer verdeeld was, en zie je de verschillen scherper.
          </Tekst>
          <Tekst>
            Zaal, boog en tabel tonen dezelfde cijfers; de tabel is het meest precies.{" "}
            <Link href="/methodiek#cohesie">Hoe is dit berekend?</Link>
          </Tekst>
        </Inklapbaar>
      <div className={s.indeling}>
        <div style={{ minWidth: 0 }}>
          {!lijst.length ? (
            <LegeStaat label="Niet bereikbaar" titel="De cijfers konden niet worden geladen"
              uitleg="De gegevens zijn nu waarschijnlijk niet bereikbaar. Probeer het over een paar minuten opnieuw." />
          ) : !periode || !fracties?.length || !kaart ? (
            <LegeStaat label="Geen stemmingen" titel={`Geen stemmingen in ${soortTekst}`}
              uitleg={`Voor de gekozen periode zijn er geen stemmingen om te vergelijken. Kies een ander ${soort === "kabinet" ? "kabinet" : "Kamerperiode"}.`}
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
    </Inhoud>
  );
}
