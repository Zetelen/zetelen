// Oppositiewerk (concept, component zetelwerk): "Wat kun je als je niet regeert?" Een scrollverhaal in zes
// hoofdstukken over moties en amendementen sinds 2010, met elk een bewegend beeld en een lezingenpaar.
// Plan: docs/plan/08-componenten/zetelwerk.md. Alle zinnen en plekken komen uit de data (lib/oppositie.ts).
import type { Metadata } from "next";
import Link from "next/link";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { Inhoud, knopKlasse } from "@/components/Kader";
import { Label, SectieKop, Tekst } from "@/components/Typografie";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { hoofdstukJaren, hoofdstukKabinetten, hoofdstukNetwerk, hoofdstukSpreiding } from "@/lib/oppositie";
import { fractieWerk, jaarWerk, netwerk, periodeWerk } from "@/lib/zetelwerk";

export const metadata: Metadata = {
  title: "Oppositiewerk",
  description: "Wat kun je als je niet regeert? Moties en amendementen van de oppositie in de Tweede Kamer sinds 2010.",
  robots: { index: false, follow: false },
};

// Kabinetten in het verhaal: vanaf Rutte I (Balkenende IV telt pas vanaf 2010 en is te kort)
const KABINETTEN = ["Rutte I", "Rutte II", "Rutte III", "Rutte IV", "Schoof", "Jetten"];

export default async function Oppositie() {
  const [jaren, perioden, fracties] = await Promise.all([jaarWerk(), periodeWerk("kabinet"), fractieWerk("kabinet")]);
  const netwerken = await Promise.all(["Schoof", "Jetten"].map(async (k) => ({ kabinet: k, verbindingen: (await netwerk("kabinet", k, "Motie")) ?? [] })));
  // Geen data: een fout in plaats van een lege staat. Dan bewaart de site die mislukte versie niet, en blijft de
  // laatste goede pagina staan (E3-S9); de foutpagina verschijnt alleen als er nog nooit een goede versie was.
  if (!jaren?.length || !perioden || !fracties) throw new Error("Oppositiewerk: de gegevens zijn niet bereikbaar");
  // Minderheid of gedoogd: Rutte I (gedoogsteun van de PVV) en Jetten (66 zetels)
  const minderheid = ["Rutte I", "Jetten"];
  const rollen = (k: string) => new Map(fracties.filter((r) => r.periode === k && r.soort === "Motie").map((r) => [r.afkorting, r.rol]));
  const ditJaar = new Date().getFullYear();

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Oppositiewerk · concept</Label>
        <SectieKop>Wat kun je als je niet regeert?</SectieKop>
        <Tekst>
          Wie in de oppositie zit, mist de ministers en het regeerakkoord. Wat overblijft: stemmen, en zelf moties en amendementen
          indienen. Scroll door zestien jaar oppositiewerk, en kijk daarna zelf wie wat indiende.
        </Tekst>
      </section>

      <ScrollVerhaal verhaal={{ breed: hoofdstukJaren(jaren, ditJaar) }} label="Moties per jaar" tijdlijn stapHoogte="80vh" />
      <ScrollVerhaal verhaal={{ breed: hoofdstukKabinetten(perioden, KABINETTEN, "Motie", minderheid) }} label="Moties per kabinet" tijdlijn stapHoogte="80vh" />
      <ScrollVerhaal verhaal={{ breed: hoofdstukSpreiding(fracties, KABINETTEN) }} label="Tegenstemmen en aangenomen moties per fractie" tijdlijn stapHoogte="80vh" />
      <ScrollVerhaal verhaal={{ breed: hoofdstukNetwerk(netwerken.map((n) => ({ ...n, rollen: rollen(n.kabinet) }))) }} label="Samen ingediend" tijdlijn stapHoogte="80vh" />
      <ScrollVerhaal verhaal={{ breed: hoofdstukKabinetten(perioden, KABINETTEN, "Amendement", minderheid) }} label="Amendementen per kabinet" tijdlijn stapHoogte="80vh" />

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Nu jij</Label>
        <SectieKop>Wie diende wat in?</SectieKop>
        <Tekst>
          Achter elke stip zitten Kamerleden die iets indienden. Zoek ze op, per fractie en per kabinet, of kijk op een fractiepagina
          hoeveel zetelwerk die fractie verzette.
        </Tekst>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--r-3)" }}>
          <Link href="/kamerleden" className={knopKlasse}>Naar de Kamerleden</Link>
          <Link href="/fracties" className={knopKlasse}>Naar de fracties</Link>
          <Link href="/coalitie" className={knopKlasse}>Zelf een meerderheid zoeken</Link>
        </div>
      </section>
      <Bronregel toelichting="Moties en amendementen waarover gestemd is; uitslag geteld uit de stemmen; kabinet of oppositie op de dag van de stemming, gedoogsteun telt als kabinet." />
    </Inhoud>
  );
}
