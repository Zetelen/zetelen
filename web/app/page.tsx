// Voorpagina (E3-S1), herzien op 25 oktober 2026: het verhaal van de site in hoofdstukken, die elk eindigen
// bij de plek op de site waar je verder kunt kijken (besluit Niels). Hoofdstuk 3 (onderwerpen) laat de twee
// grootste kabinetspartijen per beleidsterrein zien (component onderwerpen).
import Link from "next/link";
import { Inhoud, knopKlasse } from "@/components/Kader";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { TerreinBalken } from "@/components/onderwerpen/TerreinBalken";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { procent } from "@/lib/cohesie";
import { cohesiePerTerrein, paarPerTerrein, uitersten } from "@/lib/onderwerpen";
import { kabinetNu, kabinetspartners, laadVerhaal, zaalVerhaal } from "@/lib/voorpagina";
import s from "./voorpagina.module.css";

const TOOLS = [
  { href: "/verkenner", titel: "Verkenner", tekst: "Kies een fractie en zie hoe vaak elke andere fractie met haar meestemde, per kabinet of Kamerperiode." },
  { href: "/onderwerpen", titel: "Onderwerpen", tekst: "Waar zijn fracties het over eens? Cohesie per beleidsterrein, voor elk paar fracties.", concept: true },
  { href: "/fracties", titel: "Fracties", tekst: "Alle fracties sinds 2010: zetels, kabinet of oppositie, en wie er overstapte." },
  { href: "/coalitie", titel: "Coalitiebouwer", tekst: "Stel zelf een groep fracties samen en zie bij wie die een meerderheid haalde.", concept: true },
  { href: "/methodiek", titel: "Methodiek", tekst: "Hoe de cijfers tot stand komen, wat ze wel en niet zeggen, en wat er veranderde." },
];

export default async function Voorpagina() {
  const d = await laadVerhaal();
  const kabinet = d ? kabinetNu(d) : null;
  const partners = d ? kabinetspartners(d) : null;
  const perTerrein = partners && kabinet ? await cohesiePerTerrein("kabinet", kabinet.naam, "alle", partners.a.id) : null;
  const paar = partners && perTerrein ? paarPerTerrein(perTerrein, partners.b.id) : null;
  const u = paar ? uitersten(paar) : null;
  return (
    <Inhoud>
      <section className={s.opening}>
        <Label>Zetelen</Label>
        <HeroKop>Wat de Tweede Kamer stemt, en met wie</HeroKop>
        <Tekst>
          Zetelen volgt elke stemming in de Tweede Kamer sinds 2010. Scroll door het verhaal van de afgelopen jaren, of ga
          direct naar wat je zoekt.
        </Tekst>
        <nav className={s.snel} aria-label="Direct naar">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href}>
              {t.titel}
              {t.concept && <span className={s.concept}>concept</span>}
            </Link>
          ))}
          <a href="#verder" className={s.overslaan}>Sla het verhaal over</a>
        </nav>
      </section>

      {d ? (
        <ScrollVerhaal verhaal={{ breed: zaalVerhaal(d) }} label="De zaal van de Tweede Kamer" tijdlijn />
      ) : (
        <Tekst>Het verhaal kon niet worden geladen. Probeer het over een paar minuten opnieuw, of ga direct naar de verkenner.</Tekst>
      )}

      {partners && paar && u && kabinet && (
        <section className={s.hoofdstuk} style={{ maxWidth: 960 }}>
          <Label>3 · Waar zijn ze het over eens?</Label>
          <SectieKop>Samen in het kabinet, niet overal eens</SectieKop>
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
        <Label>4 · Kun jij een meerderheid vinden?</Label>
        <SectieKop>Zoek mee naar 76 zetels</SectieKop>
        <Tekst>
          {kabinet && kabinet.zetels < 76
            ? `Kabinet-${kabinet.naam} heeft ${kabinet.zetels} zetels en heeft er 76 nodig voor een meerderheid. `
            : ""}
          Stel zelf een groep fracties samen en zie bij welke andere fracties die groep in het verleden een meerderheid
          haalde. De coalitiebouwer is nog een concept: de rekenwijze wordt nog nagekeken.
        </Tekst>
        <Link href="/coalitie" className={knopKlasse}>Naar de coalitiebouwer</Link>
      </section>

      <section id="verder" className={s.hoofdstuk} style={{ maxWidth: "none" }}>
        <Label>Verder op Zetelen</Label>
        <div className={s.tegels}>
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className={s.tegel}>
              <strong>{t.titel}{t.concept && <> <span className={s.concept}>concept</span></>}</strong>
              <span>{t.tekst}</span>
            </Link>
          ))}
        </div>
        <Tekst>
          Wie maakt dit, met welke data, en hoe meld je een fout? <Link href="/over">Over Zetelen</Link>
        </Tekst>
      </section>

      <Bronregel toelichting="Zetels bij het begin van elk kabinet en elke Kamerperiode, gemeten 30 dagen na de start. Kleuren van fracties zijn een eigen palet, geen partijkleuren." />
    </Inhoud>
  );
}
