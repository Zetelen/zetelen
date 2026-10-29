// Hoe lang duurt een wet? (feedback Niels, 26 oktober 2026: het wetgevingsproces als reis, in het format van
// Uitgelicht). Drie wetten als reis met haltes, daarna alle wetsvoorstellen sinds 2010, en twee interpretaties.
// Statisch: de gegevens staan in content/wetten (pipeline/wet_reis.py).
import { GrafiekKader, GrafiekVlak } from "@/components/deel/GrafiekKader";
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud } from "@/components/Kader";
import { HoofdstukKop, Kern } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { CasusKiezer } from "@/components/verhaal/CasusKiezer";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { getal } from "@/lib/cohesie";
import { SITE } from "@/lib/site";
import { KIEZER } from "@/lib/uitgelichtLijst";
import type { Stap } from "@/lib/verhaal";
import { type Reis, type ReisMetTekst, WETSVOORSTELLEN, alleStap, dagen, duurTekst, duurVan, reisStap, samenStap, telling, zonderVoorafAdvies } from "@/lib/wetten";
import snel from "@/content/wetten/2020Z17945.json";
import gewoon from "@/content/wetten/2018Z15488.json";
import lang from "@/content/wetten/2020Z11768.json";
import s from "@/components/verhaal/uitgelicht.module.css";

export const metadata: Metadata = {
  title: "Hoe lang duurt een wet?",
  description: "Van indiening tot besluit in de Tweede Kamer: drie wetten als reis, en alle wetsvoorstellen sinds 2010 naar doorlooptijd.",
  alternates: { canonical: "/uitgelicht/hoe-lang-duurt-een-wet" },
};

const datum = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
const duur = duurVan;
const pct = (a: number, b: number) => `${Math.round((100 * a) / b)}%`;

export default function HoeLang() {
  const A = zonderVoorafAdvies(snel as Reis), B = zonderVoorafAdvies(gewoon as Reis), C = zonderVoorafAdvies(lang as Reis);
  const stil = (r: Reis) => Math.max(...r.haltes.slice(1).map((h, i) => dagen(r.haltes[i].datum, h.datum)));
  const reizen: ReisMetTekst[] = [
    { reis: A, titel: "Tijdelijke wet verkiezingen covid-19",
      tekst: `Oktober 2020, midden in de coronacrisis. De regering regelt hoe er in maart veilig gestemd kan worden. Ingediend op ${datum(A.haltes[0].datum)}, besluit op ${datum(A.haltes[A.haltes.length - 1].datum)}: ${duurTekst(duur(A))}. Vragen en antwoord binnen een week. Het advies van de Raad van State lag er al voor de indiening.` },
    { reis: B, titel: "Hogere inkomensgrens kindgebonden budget",
      tekst: `Een gewone wet: de inkomensgrens van het kindgebonden budget voor paren gaat omhoog. De Kamer stelt vragen, de regering antwoordt en past het voorstel aan. Na ${duurTekst(duur(B))} besluit de Kamer. Zo lang duurt ongeveer de helft van de wetten.` },
    { reis: C, titel: "Aanpassing van de wet over terugkeer en vreemdelingenbewaring",
      tekst: `Juni 2020: de regering wil meer mogelijkheden om op te treden tegen vreemdelingen die overlast geven. De Kamer stelt vragen, het antwoord komt in februari 2021. Dan blijft het ${duurTekst(stil(C))} stil. Drie kabinetten later, in juni 2026, besluit de Kamer: na ${duurTekst(duur(C))}.` },
  ];
  const t = telling(WETSVOORSTELLEN, 2010, 2022);
  const tA = reisStap(reizen[0], "a"), tB = reisStap(reizen[1], "b"), tC = reisStap(reizen[2], "c");
  const stappen: Stap[] = [
    tA, tB, tC,
    { ...samenStap(reizen, ["a", "b", "c"]), tekst: `Dezelfde drie wetten op één tijdas, gemeten vanaf de indiening. De snelle wet is een stip, de gewone een streepje.` },
    { ...alleStap(t, 5),
      tekst: `En alle wetsvoorstellen? Van de ${getal(t.cohort.length)} die van 2010 tot en met 2022 zijn ingediend, kreeg ${pct(t.besloten.length, t.cohort.length)} een besluit. De helft daarvan binnen ${duurTekst(t.mediaan)}, ${pct(t.binnenJaar, t.besloten.length)} binnen een jaar. ${pct(t.hamer, t.besloten.length)} ging als hamerstuk: aangenomen zonder stemming. Verworpen werden er ${getal(t.verworpen)}.` },
    { ...alleStap(t, 5, true), datum: "wie dient in?",
      tekst: `Wetten die Kamerleden zelf schrijven, duren langer: de helft binnen ${duurTekst(t.mediaanInitiatief ?? 0)}, tegen ${duurTekst(t.mediaanRegering ?? 0)} voor wetten van de regering. Een Kamerlid heeft geen ministerie achter zich.` },
    { ...alleStap(t, 5), datum: "2 interpretaties", lezing: 1, tekst: "Zorgvuldigheid. Een wet geldt voor iedereen. Vragen stellen, antwoorden, advies vragen en aanpassen kosten tijd, en dat is de bedoeling." },
    { ...alleStap(t, 5), datum: "2 interpretaties", lezing: 2, tekst: "Traagheid. Een wet kan jaren stilliggen, en een nieuw kabinet zet het werk op pauze. Wie wacht op een regel, wacht soms heel lang." },
  ];
  return (
    <Inhoud>
      <section className={s.blok}>
        <CasusKiezer casussen={KIEZER} gekozen="hoe-lang-duurt-een-wet" />
        <Label>Uitgelicht · van indiening tot besluit</Label>
        <HeroKop>Hoe lang duurt een wet?</HeroKop>
        {/* Kern van de pagina (K11, 27 oktober 2026) */}
        <Kern ziet="Drie wetten van indiening tot besluit, als reis met haltes. Daarna alle wetsvoorstellen sinds 2010."
          opvalt={`Van de wetsvoorstellen uit 2010 tot en met 2022 met een besluit van de Tweede Kamer kreeg de helft dat binnen ${duurTekst(t.mediaan)}, ${pct(t.binnenJaar, t.besloten.length)} binnen een jaar.`} />
        <Tekst>
          Een wet begint met een voorstel, van de regering of van Kamerleden zelf. Dan volgen haltes: het advies van de Raad van
          State, vragen van de Kamer, antwoorden, aanpassingen, en een besluit. Soms gaat dat in twee weken, soms duurt het jaren.
          Drie wetten als reis, en daarna alle wetsvoorstellen sinds 2010.
        </Tekst>
      </section>
      <GrafiekKader grafiek="wetten" vergroot={false} id="reizen" className={s.graphic}>
        <HoofdstukKop titel="Drie wetten gevolgd" />
        <GrafiekVlak><ScrollVerhaal verhaal={{ breed: stappen }} label="Hoe lang duurt een wet: drie reizen en alle wetsvoorstellen" stapHoogte="60vh" tijdlijn /></GrafiekVlak>
        <Data>
          Bron: <a href={SITE.bron}>open data van de Tweede Kamer</a>. Haltes uit de documenten bij elk wetsvoorstel (zaken {A.nummer},{" "}
          {B.nummer} en {C.nummer}). Doorlooptijd: van de indiening tot het besluit in de Tweede Kamer (een stemming of een hamerstuk);
          de Eerste Kamer komt daarna en telt hier niet mee. Alleen wetsvoorstellen tot en met 2022: latere hebben nog niet de tijd
          gehad. Geen besluit: nog in behandeling, ingetrokken of vervallen.
        </Data>
        <Data><Link href="/methodiek">Hoe we tellen</Link></Data>
      </GrafiekKader>
    </Inhoud>
  );
}
