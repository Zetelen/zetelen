// Tegen het advies in (besluit Niels B18, 26 oktober 2026): moties die het kabinet ontraadde en die de Kamer toch
// aannam. In het format van Uitgelicht. Statisch: gegevens in content/ontraden (pipeline/ontraden.py).
import { DeelKnop } from "@/components/deel/DeelKnop";
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud } from "@/components/Kader";
import { HoofdstukKop, Kern } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { CasusKiezer } from "@/components/verhaal/CasusKiezer";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { getal } from "@/lib/cohesie";
import { KLEUR, MOTIES, blokken, telling } from "@/lib/ontraden";
import { SITE } from "@/lib/site";
import { KIEZER } from "@/lib/uitgelichtLijst";
import { KORT, type Stap } from "@/lib/verhaal";
import s from "@/components/verhaal/uitgelicht.module.css";

export const metadata: Metadata = {
  title: "Moties die het kabinet ontraadde",
  description: "Moties die het kabinet ontraadde en die de Tweede Kamer toch aannam, sinds april 2019.",
  alternates: { canonical: "/uitgelicht/tegen-het-advies-in" },
};

const pct = (a: number, b: number) => `${b ? Math.round((100 * a) / b) : 0}%`;
const naam = (f: string) => KORT[f] ?? f;
const PER = 50;

export default function TegenHetAdviesIn() {
  const t = telling(MOTIES);
  const o = t.perOordeel;
  const anders = { gestemd: o.A.gestemd + o.V.gestemd, aangenomen: o.A.aangenomen + o.V.aangenomen };
  const groep = (label: string, g: { gestemd: number; aangenomen: number }, tint: string, sleutel: string, metUitslag: boolean, nadruk = true) => ({
    label, segmenten: metUitslag
      ? [{ n: g.aangenomen, tint, sleutel: `${sleutel}a`, zacht: !nadruk }, { n: g.gestemd - g.aangenomen, tint, sleutel: `${sleutel}v`, zacht: true }]
      : [{ n: g.aangenomen, tint, sleutel: `${sleutel}a` }, { n: g.gestemd - g.aangenomen, tint, sleutel: `${sleutel}v` }],
  });
  const oordelen = (metUitslag: boolean, alleenOntraden = false) => blokken([
    groep("oordeel Kamer", o.K, KLEUR.K, "k", metUitslag, !alleenOntraden),
    groep("ontraden", o.O, KLEUR.O, "o", metUitslag),
    groep("anders", anders, KLEUR.A, "x", metUitslag, !alleenOntraden),
  ], PER);
  const kabinetten = t.perKabinet;
  const perKab = blokken(kabinetten.map((k) => ({ label: k.kabinet, segmenten: [
    { n: k.ontraden, tint: KLEUR.O, sleutel: `ko-${k.kabinet}` }, { n: k.aangenomen - k.ontraden, tint: KLEUR.K, sleutel: `kk-${k.kabinet}`, zacht: true }] })), PER / 2);
  const perRol = blokken([
    { label: "uit de oppositie", segmenten: [{ n: t.perRol.oppositie, tint: KLEUR.O, sleutel: "ro" }] },
    { label: "uit het kabinet", segmenten: [{ n: t.perRol.kabinet, tint: "#d2bb5a", sleutel: "rk" }] },
  ], 10);
  const hoogste = [...kabinetten].sort((a, b) => b.ontraden / b.aangenomen - a.ontraden / a.aangenomen)[0];
  const top = t.perFractie.slice(0, 4).map((f) => `${naam(f.fractie)} (${getal(f.n)})`);
  const stappen: Stap[] = [
    { datum: "voor de stemming", ...oordelen(false),
      tekst: `Voor een stemming zegt het kabinet wat het van elke motie vindt. "Oordeel Kamer": het kabinet laat het aan de Kamer. "Ontraden": het kabinet raadt de Kamer af om de motie aan te nemen. Sinds april 2019 staat dat oordeel in de open data. Elke stip is ${PER} moties waarover is gestemd: ${getal(t.gestemd)} in totaal.` },
    { datum: "wat haalt het?", ...oordelen(true),
      tekst: `De heldere stippen zijn aangenomen. Van de moties met oordeel Kamer haalde ${pct(o.K.aangenomen, o.K.gestemd)} het. Van de ontraden moties ${pct(o.O.aangenomen, o.O.gestemd)}: het oordeel van het kabinet weegt zwaar.` },
    { datum: "toch aangenomen", ...oordelen(true, true),
      tekst: `Toch werden ${getal(t.tochAangenomen.length)} moties aangenomen terwijl het kabinet ze ontraadde. Dat is ${pct(t.tochAangenomen.length, t.aangenomen)} van alle aangenomen moties.` },
    { datum: "per kabinet", ...perKab,
      tekst: `Per kabinet: ${kabinetten.map((k) => `${k.kabinet} ${pct(k.ontraden, k.aangenomen)}`).join(", ")} van de aangenomen moties was ontraden. Het meest onder kabinet-${hoogste.kabinet}. Elke stip is ${PER / 2} aangenomen moties; rood is ontraden. Rutte III telt vanaf april 2019, Jetten loopt nog.` },
    { datum: "wie dient ze in?", ...perRol,
      tekst: `Van de ontraden maar toch aangenomen moties kwamen er ${getal(t.perRol.oppositie)} uit de oppositie en ${getal(t.perRol.kabinet)} van fracties die zelf in het kabinet zaten. De meeste van ${top.join(", ")}. Elke stip is 10 moties.` },
    { datum: "2 interpretaties", ...oordelen(true, true), lezing: 1,
      tekst: "De Kamer controleert. Het kabinet bepaalt niet wat de Kamer vindt: een meerderheid kan iets vragen waar de minister tegen is, ook als die meerderheid deels uit kabinetspartijen bestaat." },
    { datum: "2 interpretaties", ...oordelen(true, true), lezing: 2,
      tekst: "Een motie is geen besluit. Het kabinet moet hem nog uitvoeren, en wat het eerst ontraadde, gebeurt niet altijd. Of een motie is uitgevoerd, staat niet in de open data." },
  ];
  return (
    <Inhoud>
      <section className={s.blok}>
        <CasusKiezer casussen={KIEZER} gekozen="tegen-het-advies-in" />
        <Label>Uitgelicht · moties en het kabinet</Label>
        <HeroKop>Moties die het kabinet ontraadde</HeroKop>
        {/* Kern van de pagina (K11, 27 oktober 2026) */}
        <Kern ziet="Alle moties sinds april 2019, naar wat het kabinet ervan vond en wat de Kamer besloot."
          opvalt={`Sinds april 2019 nam de Kamer ${getal(t.tochAangenomen.length)} moties aan terwijl het kabinet ze ontraadde: ${pct(t.tochAangenomen.length, t.aangenomen)} van alle aangenomen moties.`} />
        <Tekst>
          Het kabinet zegt voor elke stemming wat het van een motie vindt. Meestal volgt de Kamer dat. Maar soms neemt een
          meerderheid een motie aan die het kabinet ontraadde. Hoe vaak gebeurt dat, en wie zit erachter?
        </Tekst>
      </section>
      <section id="oordeel" className={s.graphic}>
        <HoofdstukKop titel="Het oordeel van het kabinet" />
        <DeelKnop grafiek="ontraden" />
        <ScrollVerhaal verhaal={{ breed: stappen }} label="Moties naar het oordeel van het kabinet en de uitslag" stapHoogte="60vh" tijdlijn />
        <Data>
          Bron: <a href={SITE.bron}>open data van de Tweede Kamer</a>, het oordeel van het kabinet (Kabinetsappreciatie) bij elke motie die
          vanaf 1 april 2019 is ingediend. Ontraden telt ook &quot;ontraden, tenzij gewijzigd&quot;. Anders: onder meer overbodig, ontijdig,
          verzocht aan te houden, of geen oordeel. Uitslag: de laatste stemming over de motie. Kabinet en oppositie: de fractie van de
          indiener op de dag van indiening; gedoogsteun telt als kabinet. Moties zonder stemming (aangehouden of ingetrokken) tellen niet mee.
        </Data>
        <Data><Link href="/methodiek">Hoe we tellen</Link></Data>
      </section>
    </Inhoud>
  );
}
