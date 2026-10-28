// Oppositiewerk (concept, component zetelwerk): "Wat kun je als je niet regeert?" Een scrollverhaal in zes
// hoofdstukken over moties en amendementen sinds 2010, met elk een bewegend beeld en een lezingenpaar.
// Plan: docs/plan/08-componenten/zetelwerk.md. Alle zinnen en plekken komen uit de data (lib/oppositie.ts).
import { DeelKnop } from "@/components/deel/DeelKnop";
import { KAMERLEDEN } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { Inhoud, LegeStaat, knopKlasse } from "@/components/Kader";
import { Label, SectieKop, Tekst } from "@/components/Typografie";
import { HoofdstukKop, Kern } from "@/components/Onderdelen";
import { oppositieOpvalt } from "@/lib/kern";
import { samenwerking } from "@/lib/voorpagina";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import type { Stap } from "@/lib/verhaal";
import { hoofdstukJaren, hoofdstukKabinetten, hoofdstukNetwerk, SMAL_SPREIDING, hoofdstukSpreiding, hoofdstukTegenEnSamen } from "@/lib/oppositie";
import { fractieWerk, jaarWerk, netwerk, periodeWerk } from "@/lib/zetelwerk";
import { fractiesIn } from "@/lib/cohesie";
import u from "@/components/verhaal/uitgelicht.module.css";

export const metadata: Metadata = {
  title: "Oppositie",
  description: "Wat kun je als je niet regeert? Moties en amendementen van de oppositie in de Tweede Kamer sinds 2010.",
  alternates: { canonical: "/oppositie" },
};

// Kabinetten in het verhaal: vanaf Rutte I (Balkenende IV telt pas vanaf 2010 en is te kort)
const KABINETTEN = ["Rutte I", "Rutte II", "Rutte III", "Rutte IV", "Schoof", "Jetten"];

// De kop staat boven het verhaal; de eerste kaart herhaalt hem niet
const zonderKop = (stappen: Stap[]): Stap[] => stappen.map((s, i) => (i === 0 ? { ...s, hoofdstuk: undefined } : s));

export default async function Oppositie() {
  const [jaren, perioden, fracties] = await Promise.all([jaarWerk(), periodeWerk("kabinet"), fractieWerk("kabinet")]);
  // Eenmansfracties per kabinet: op de telefoon niet in de spreiding, daar maken ze het te druk (feedback Niels K2, 27 oktober 2026)
  const klein = new Set((await Promise.all(KABINETTEN.map(async (k) => ((await fractiesIn("kabinet", k)) ?? [])
    .filter((f) => f.zetels <= 1).map((f) => `${k}|${f.afkorting}`)))).flat());
  const netwerken = await Promise.all(["Schoof", "Jetten"].map(async (k) => ({ kabinet: k, verbindingen: (await netwerk("kabinet", k, "Motie")) ?? [] })));
  // Geen data: een fout in plaats van een lege staat. Dan bewaart de site die mislukte versie niet, en blijft de
  // laatste goede pagina staan (E3-S9); de foutpagina verschijnt alleen als er nog nooit een goede versie was.
  if (!jaren?.length || !perioden || !fracties) {
    // Zonder ingestelde database (CI, lokaal zonder .env) een lege staat; mét database een fout, zodat de laatste
    // goede versie blijft staan
    if (process.env.SUPABASE_URL) throw new Error("Oppositiewerk: de gegevens zijn niet bereikbaar");
    return (
      <Inhoud>
        <LegeStaat label="Niet bereikbaar" titel="De cijfers laden nu niet" uitleg="Probeer het over een paar minuten opnieuw." />
      </Inhoud>
    );
  }
  // Minderheid of gedoogd: Rutte I (gedoogsteun van de PVV) en Jetten (66 zetels)
  const minderheid = ["Rutte I", "Jetten"];
  const rollen = (k: string) => new Map(fracties.filter((r) => r.periode === k && r.soort === "Motie").map((r) => [r.afkorting, r.rol]));
  const ditJaar = new Date().getFullYear();
  // Wat opvalt (K11): het deel van de oppositiemoties dat werd aangenomen, onder het nieuwste en het eerste kabinet
  const samen = samenwerking(perioden, KABINETTEN[KABINETTEN.length - 1], KABINETTEN[0]);
  const vorig = samenwerking(perioden, KABINETTEN[KABINETTEN.length - 1], KABINETTEN[KABINETTEN.length - 2]);

  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Oppositie</Label>
        <SectieKop niveau={1}>Wat kun je als je niet regeert?</SectieKop>
        <Kern ziet="Zestien jaar moties en amendementen: hoeveel de oppositie indiende, wat het haalde, en met wie ze samenwerkte."
          opvalt={samen && vorig ? oppositieOpvalt(KABINETTEN[KABINETTEN.length - 1], samen.oppositieNu, vorig.eerste, vorig.oppositieEerst, samen.eerste, samen.oppositieEerst) : null} />
        <Tekst>
          Wat doe je als oppositie? Alleen maar tegen stemmen? Juist niet. Scroll door zestien jaar oppositiewerk, en kijk daarna
          zelf wie wat indiende.
        </Tekst>
      </section>

      {/* Elk hoofdstuk opent met een kop over de volle breedte (feedback Niels K2, 26 oktober 2026); hoofdstuk 4 en 5
          breed, met de kaart onder de tekening. Kop en verhaal als één blok, anders viel de grote ruimte tussen de blokken
          van de pagina tussen kop en grafiek (Niels, 28 oktober 2026) */}
      <section id="moties-per-jaar" className={u.graphic}>
        <HoofdstukKop nummer="1" titel="Steeds meer moties" />
        <DeelKnop grafiek="oppositie-jaren" />
        <ScrollVerhaal verhaal={{ breed: zonderKop(hoofdstukJaren(jaren, ditJaar)) }} label="Moties per jaar" tijdlijn stapHoogte="60vh" />
      </section>
      <section id="per-kabinet" className={u.graphic}>
        <HoofdstukKop nummer="2" titel="Per kabinet" />
        <DeelKnop grafiek="oppositie-kabinetten" zoek={{ stuk: "Motie" }} />
        <ScrollVerhaal verhaal={{ breed: zonderKop(hoofdstukKabinetten(perioden, KABINETTEN, "Motie", minderheid)) }} label="Moties per kabinet" tijdlijn stapHoogte="60vh" />
      </section>
      <section id="tegenstemmen" className={u.graphic}>
        <HoofdstukKop nummer="4" titel="Tegenstemmen en zelf iets binnenhalen" />
        <DeelKnop grafiek="oppositie-spreiding" />
        <ScrollVerhaal verhaal={{
          breed: zonderKop(hoofdstukTegenEnSamen(hoofdstukSpreiding(fracties, KABINETTEN), hoofdstukNetwerk(netwerken.map((n) => ({ ...n, rollen: rollen(n.kabinet) }))))),
          smal: zonderKop(hoofdstukTegenEnSamen(hoofdstukSpreiding(fracties, KABINETTEN, true, klein), hoofdstukNetwerk(netwerken.map((n) => ({ ...n, rollen: rollen(n.kabinet) })), true))),
        }} hoogteSmal={SMAL_SPREIDING.hoogte} breedteSmal={SMAL_SPREIDING.breedte}
          label="Tegenstemmen en aangenomen moties per fractie, daarna samen ingediend" breed stapHoogte="60vh" />
      </section>
      <section id="amendementen" className={u.graphic}>
        <HoofdstukKop nummer="6" titel="Wetten aanpassen met amendementen" />
        <DeelKnop grafiek="oppositie-kabinetten" zoek={{ stuk: "Amendement" }} />
        <ScrollVerhaal verhaal={{ breed: zonderKop(hoofdstukKabinetten(perioden, KABINETTEN, "Amendement", minderheid)) }} label="Amendementen per kabinet" tijdlijn stapHoogte="60vh" />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 860 }}>
        <Label>Nu jij</Label>
        <SectieKop>Welke partij diende wat in?</SectieKop>
        <Tekst>
          Achter elke stip zitten Kamerleden die iets indienden. Zoek ze op, per fractie en per kabinet, of kijk op een fractiepagina
          hoeveel zetelwerk die fractie verzette.
        </Tekst>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--r-3)" }}>
          {KAMERLEDEN && <Link href="/kamerleden" className={knopKlasse}>Naar de Kamerleden</Link>}
          <Link href="/fracties" className={knopKlasse}>Naar de fracties</Link>
          <Link href="/coalitie" className={knopKlasse}>Zelf een meerderheid zoeken</Link>
        </div>
      </section>
      <Bronregel toelichting="Moties en amendementen waarover gestemd is; de uitslag is die van de Kamer; kabinet of oppositie op de dag van de stemming, gedoogsteun telt als kabinet." />
    </Inhoud>
  );
}
