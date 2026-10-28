// Uitgelicht: hoe vaak stemmen VVD en PRO hetzelfde? (verzoek Niels, 28 oktober 2026; opzet en cijfers in de vault, K13).
// Aanleiding is de actualiteit, maar de pagina noemt geen uitspraak van een partij: de kop is een neutrale vraag, de
// data geeft twee lezingen met elk eigen getallen (feitencontrole 28 oktober 2026). Alle getallen in de tekst komen uit de data (lib/vvdPro.ts) en kloppen dus na elke verversing.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { HoofdstukKop, Kern, Lezingen } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { Trend } from "@/components/cohesie/Trend";
import { LijnKabinetten, type Reeks } from "@/components/lezingen/Grafieken";
import { TerreinBalken } from "@/components/onderwerpen/TerreinBalken";
import { CasusKiezer } from "@/components/verhaal/CasusKiezer";
import { perioden } from "@/lib/cohesie";
import { uitersten } from "@/lib/onderwerpen";
import { cohesiePerHalfjaar, halveJaren, punten } from "@/lib/trend";
import { KIEZER } from "@/lib/uitgelichtLijst";
import { PALET } from "@/lib/verhaal";
import { KABINETTEN, cohesieVan, laadVvdPro, perTerrein, rangorde } from "@/lib/vvdPro";
import s from "@/components/verhaal/uitgelicht.module.css";

export const metadata: Metadata = {
  title: "Hoe vaak stemmen VVD en PRO hetzelfde?",
  description: "Hoe vaak stemden VVD en PRO (en daarvoor GroenLinks en PvdA) hetzelfde in de Tweede Kamer, sinds 2010? En wat verandert er als partijen samen regeren?",
  alternates: { canonical: "/uitgelicht/vvd-en-pro" },
};

const pct = (c: number | null) => (c == null ? "" : `${Math.round(c)}%`);
// Met één decimaal, waar afronden misleidt (99,5% is geen 100%)
const pct1 = (c: number | null) => (c == null ? "" : `${c.toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`);

export default async function VvdEnPro() {
  const d = await laadVvdPro();
  if (!d) {
    if (process.env.SUPABASE_URL) throw new Error("VVD en PRO: de gegevens zijn niet bereikbaar");
    return <Inhoud><LegeStaat label="Niet bereikbaar" titel="De cijfers laden nu niet" uitleg="Probeer het over een paar minuten opnieuw." /></Inhoud>;
  }
  const { vvd, lijnPro, idVan, fracties, rijen, coalitie, terrein, onderling } = d;
  const pvda = idVan("PvdA")!, gl = idVan("GL")!, pvv = idVan("PVV")!;
  const jaren = halveJaren(new Date());
  const [hoofd, metPvda, metGl, metPvv] = await Promise.all([
    cohesiePerHalfjaar([vvd], lijnPro.ids, "alle"), cohesiePerHalfjaar([vvd], [pvda], "alle"), cohesiePerHalfjaar([vvd], [gl], "alle"),
    cohesiePerHalfjaar([vvd], [pvv], "alle"),
  ]);

  // Per kabinet; een gouden stip waar de VVD en de andere fractie het hele kabinet samen in het kabinet zaten (de PVV
  // stapte in juni 2025 uit kabinet-Schoof: geen stip)
  const samen = (k: string, a: string) => coalitie.some((c) => c.kabinet === k && c.afkorting === a && c.rol === "kabinet" && !c.tot)
    && coalitie.some((c) => c.kabinet === k && c.afkorting === "VVD" && c.rol === "kabinet");
  const reeks = (naam: string, ids: string[], afk: string[], tint: string): Reeks => ({
    naam, tint, punten: KABINETTEN.map((k) => ({ kabinet: k, waarde: cohesieVan(rijen, k, ids).cohesie, samen: afk.some((a) => samen(k, a)) })),
  });
  const reeksen = [
    // Dezelfde kleuren als de dunne lijnen in de trendgrafiek (TINTEN in components/cohesie/Trend.tsx)
    reeks("PvdA", [pvda], ["PvdA"], PALET[0]),
    reeks("GL", [gl], ["GL"], PALET[4]),
    reeks("PRO", lijnPro.ids, ["GroenLinks-PvdA", "PRO"], "var(--goud)"),
    reeks("PVV", [pvv], ["PVV"], PALET[2]),
  ];
  const c = (k: string, ids: string[]) => cohesieVan(rijen, k, ids).cohesie;
  const pvvHj = punten(metPvv ?? [], halveJaren(new Date()));
  const pvvIn = pvvHj.find((p) => p.halfjaar === "2024-07-01")?.cohesie ?? null; // samen in kabinet-Schoof
  const pvvUit = pvvHj.find((p) => p.halfjaar === "2026-01-01")?.cohesie ?? null; // PVV in de oppositie
  const glPvda = (k: string) => onderling.find((x) => x.periode === k)?.cohesie ?? null;

  // Rangorde onder het huidige en het vorige kabinet, met PRO als één lijn
  const lijnNaam = new Map(lijnPro.ids.map((i) => [i, "PRO"]));
  const zetels = (k: string) => {
    const m = new Map<string, number>();
    for (const f of fracties.filter((x) => x.periode === k && x.in_zaal)) {
      const n = lijnNaam.get(f.fractie) ?? f.afkorting;
      m.set(n, Math.max(m.get(n) ?? 0, f.zetels));
    }
    return m;
  };
  const nu = rangorde(rijen, "Jetten", zetels("Jetten"), lijnNaam);
  const toen = rangorde(rijen, "Schoof", zetels("Schoof"), lijnNaam);
  const plek = (l: typeof nu) => l.findIndex((x) => x.naam === "PRO") + 1;
  const proNu = nu.find((x) => x.naam === "PRO"), proToen = toen.find((x) => x.naam === "PRO");
  const onderPro = nu.filter((x) => proNu && x.cohesie < proNu.cohesie).map((x) => x.naam);
  const paar = perTerrein(terrein, lijnPro.ids);
  const u = uitersten(paar);

  // Per half jaar: het laatste volledige punt en het hoogste punt sinds Rutte II (vanaf 2018)
  const hp = punten(hoofd ?? [], jaren);
  const laatste = [...hp].reverse().find((p) => p.cohesie != null);
  const lopend = laatste?.halfjaar === jaren[jaren.length - 1];
  const maand = (h: string) => (h.slice(5, 7) === "07" ? "juli" : "januari") + " " + h.slice(0, 4);
  const alleReeksen = [...hp, ...punten(metPvda ?? [], jaren), ...punten(metGl ?? [], jaren)];
  const hoogsteNa2018 = Math.max(...alleReeksen.filter((p) => p.halfjaar >= "2018-01-01" && p.halfjaar !== laatste?.halfjaar && p.cohesie != null).map((p) => p.cohesie!));
  const kab = await perioden();

  return (
    <Inhoud>
      <section className={s.blok}>
        <CasusKiezer casussen={KIEZER} gekozen="vvd-en-pro" />
        <Label>Uitgelicht · VVD en PRO</Label>
        <HeroKop>Hoe vaak stemmen VVD en PRO hetzelfde?</HeroKop>
        <Kern ziet="Hoe vaak VVD en PRO hetzelfde stemden, en daarvoor GroenLinks en PvdA, van 2010 tot nu. En wat er verandert als partijen samen regeren."
          opvalt={proNu && proToen
            ? `Onder kabinet-Jetten stemden VVD en PRO in ${pct(proNu.cohesie)} van de stemmingen hetzelfde: plek ${plek(nu)} van de ${nu.length} fracties met minstens 3 zetels. Onder kabinet-Schoof was dat ${pct(proToen.cohesie)}, plek ${plek(toen)} van ${toen.length}.`
            : null} />
        <Tekst>
          Of twee partijen kunnen samenwerken, is een politieke vraag. Wat wel te meten is: hoe vaak ze in de Kamer dezelfde kant
          kiezen. PRO is de fractie GroenLinks-PvdA onder een nieuwe naam; tot oktober 2023 waren GroenLinks en PvdA twee fracties.
        </Tekst>
      </section>

      <section className={s.blok} style={{ maxWidth: "none" }}>
        <HoofdstukKop nummer="1" titel="Van 2010 tot nu" />
        <Tekst>
          De gouden lijn is VVD met GroenLinks-PvdA en PRO. Daarvoor de dunne lijnen: VVD met de PvdA en met GroenLinks. Vanaf 2018
          liepen die twee bijna gelijk op.{glPvda("Rutte III") != null && ` GroenLinks en PvdA stemden ook onderling bijna altijd hetzelfde: ${pct1(glPvda("Rutte III"))} onder Rutte III, ${pct1(glPvda("Rutte IV"))} onder Rutte IV.`}
          {laatste?.cohesie != null && ` ${lopend ? `Sinds ${maand(laatste.halfjaar)}` : `In het halve jaar vanaf ${maand(laatste.halfjaar)}`} stemden VVD en PRO in ${pct(laatste.cohesie)} hetzelfde${laatste.cohesie > hoogsteNa2018 ? ". Dat is meer dan in enig half jaar sinds 2018" : ""}.${lopend ? " Dit half jaar loopt nog." : ""}`}
        </Tekst>
        <Suspense>
          <Trend a="VVD" b="PRO" keuzes={[]} vast alles punten={hp}
            extra={[{ naam: "VVD en PvdA", punten: punten(metPvda ?? [], jaren) }, { naam: "VVD en GL", punten: punten(metGl ?? [], jaren) }]}
            eerder={lijnPro.teksten}
            uitleg={`Elk punt is een half jaar: van alle stemmingen waarin beide fracties voor of tegen stemden, het deel waarin ze dezelfde kant kozen. Een punt vanaf 25 stemmingen samen. De vlakken zijn de kabinetten. ${lijnPro.teksten.join(". ")}.`}
            kabinetten={kab.filter((p) => p.soort === "kabinet").sort((a, b) => a.begin.localeCompare(b.begin))} />
        </Suspense>
      </section>

      <section className={s.blok} style={{ maxWidth: "none" }}>
        <HoofdstukKop nummer="2" titel="Wat er verandert als partijen samen regeren" />
        <Tekst>
          Onder Rutte II zaten VVD en PvdA samen in het kabinet. Toen stemden ze in {pct(c("Rutte II", [pvda]))} van de stemmingen
          hetzelfde. Onder Rutte I, met de PvdA in de oppositie, was dat {pct(c("Rutte I", [pvda]))}; onder Rutte III, weer apart,
          {" "}{pct(c("Rutte III", [pvda]))}. GroenLinks, niet in het kabinet, bleef onder Rutte II op {pct(c("Rutte II", [gl]))}.{" "}
          {pvvIn != null && pvvUit != null && <>Bij de PVV hetzelfde patroon: in de tweede helft van 2024, samen in kabinet-Schoof,
          {" "}{pct(pvvIn)}; in de eerste helft van 2026, met de PVV in de oppositie, {pct(pvvUit)}. De PVV stapte in juni 2025 uit het kabinet.</>}
        </Tekst>
        {/* Op de telefoon opzij te schuiven: zeven kabinetten passen niet leesbaar in de breedte */}
        <div className={s.schuifVlak}>
          <LijnKabinetten kabinetten={KABINETTEN} reeksen={reeksen} vanaf={20}
            label="Hoe vaak de VVD hetzelfde stemde als PvdA, GroenLinks, PRO en PVV, per kabinet" />
        </div>
        <Data>Per kabinet, alle stemmingen; Balkenende IV vanaf 2010. Een gouden stip: het hele kabinet samen in het kabinet. PRO: GroenLinks-PvdA en PRO samen.</Data>
      </section>

      <section className={s.blok}>
        <HoofdstukKop nummer="3" titel="Nu, tussen de andere fracties" />
        <Tekst>
          Onder kabinet-Jetten zit PRO in de middenmoot.
          {onderPro.length > 0 && ` Met ${onderPro.join(", ").replace(/, ([^,]*)$/, " en $1")} stemde de VVD minder vaak hetzelfde.`}
        </Tekst>
        <ol className={s.rangorde} aria-label="Hoe vaak de VVD hetzelfde stemde als elke fractie, onder kabinet-Jetten">
          {nu.map((x) => (
            <li key={x.naam} data-nadruk={x.naam === "PRO" || undefined}>
              <span className={s.rangNaam}>{x.naam}</span>
              <span className={s.rangBalk} aria-hidden="true"><span style={{ width: `${x.cohesie}%` }} /></span>
              <span className={s.rangGetal}>{pct(x.cohesie)}</span>
            </li>
          ))}
        </ol>
        <Data>Kabinet-Jetten, alle stemmingen, fracties met minstens 3 zetels.</Data>
      </section>

      {u && (
        <section className={s.blok} style={{ maxWidth: "none" }}>
          <HoofdstukKop nummer="4" titel="Per onderwerp" />
          <Tekst>
            Het vaakst eens bij {paar.filter((p) => p.gezamenlijk >= 50 && pct(p.cohesie) === pct(u.hoog.cohesie)).map((p) => p.terrein.toLowerCase()).join(" en bij ")} ({pct(u.hoog.cohesie)}),
            het minst bij {u.laag.terrein.toLowerCase()} ({pct(u.laag.cohesie)}).
          </Tekst>
          <TerreinBalken lijst={paar} totaal={proNu?.cohesie ?? null} label="Hoe vaak VVD en PRO hetzelfde stemden per beleidsterrein, onder kabinet-Jetten" />
          <Data>Kabinet-Jetten. De witte lijn: over alle stemmingen samen.</Data>
        </section>
      )}

      <section className={s.blok}>
        <HoofdstukKop titel="Twee lezingen" />
        <Lezingen
          links={{ titel: "Ze kiezen vaak een andere kant", tekst: `Onder Schoof stond PRO bij de VVD op plek ${plek(toen)} van ${toen.length}, onder Jetten op plek ${plek(nu)} van ${nu.length}.${u ? ` Bij ${u.laag.terrein.toLowerCase()} kozen ze vaker een andere kant dan dezelfde.` : ""} En na Rutte II zakte de PvdA bij de VVD weer naar ${pct(c("Rutte III", [pvda]))}.` }}
          rechts={{ titel: "Samen regeren verkleint de afstand", tekst: `Onder Rutte II stemde de VVD met de PvdA in ${pct(c("Rutte II", [pvda]))} hetzelfde, tegen ${pct(c("Rutte I", [pvda]))} onder Rutte I. Een regeerakkoord stemt mee. Cijfers uit de oppositie zeggen minder over een kabinet.` }}
        />
        <Tekst>
          Vergelijk zelf: in de verkenner kun je elk paar fracties door de jaren volgen.{" "}
          <Link href="/verkenner?fractie=VVD&met=PRO#door-de-jaren">VVD en PRO in de verkenner</Link>
        </Tekst>
        <Data>
          Bron: open data van de Tweede Kamer, eigen berekening (<Link href="/methodiek">methodiek</Link>). Hetzelfde stemmen: van de stemmingen
          waarin beide fracties voor of tegen stemden, het deel waarin ze dezelfde kant kozen. Alle stemmingen: moties, amendementen en
          wetten. Onder de 25 stemmingen samen geen percentage.
        </Data>
      </section>
    </Inhoud>
  );
}
