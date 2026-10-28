// Uitgelicht: hoe vaak stemmen VVD en PRO hetzelfde? (verzoek Niels, 28 oktober 2026; opzet en cijfers in de vault, K13).
// Aanleiding is de actualiteit, maar de pagina noemt geen uitspraak van een partij: de kop is een neutrale vraag, de
// data geeft twee lezingen met elk eigen getallen (feitencontrole 28 oktober 2026). Sinds dezelfde dag als scroll
// graphic, zoals de andere uitgelichte pagina's (lib/vvdProVerhaal.ts). Alle getallen komen uit de data en kloppen dus
// na elke verversing.
import type { Metadata } from "next";
import Link from "next/link";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { HoofdstukKop, Kern } from "@/components/Onderdelen";
import { Data, HeroKop, Label, Tekst } from "@/components/Typografie";
import { CasusKiezer } from "@/components/verhaal/CasusKiezer";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import { leesApi } from "@/lib/api";
import { perioden } from "@/lib/cohesie";
import { cohesiePerHalfjaar, halveJaren, punten } from "@/lib/trend";
import { KIEZER } from "@/lib/uitgelichtLijst";
import { cohesieVan, laadVvdPro, perTerrein, rangorde } from "@/lib/vvdPro";
import { vvdProVerhaal } from "@/lib/vvdProVerhaal";
import s from "@/components/verhaal/uitgelicht.module.css";

export const metadata: Metadata = {
  title: "Hoe vaak stemmen VVD en PRO hetzelfde?",
  description: "Hoe vaak stemden VVD en PRO (en daarvoor GroenLinks en PvdA) hetzelfde in de Tweede Kamer, sinds 2010? En wat verandert er als partijen samen regeren?",
  alternates: { canonical: "/uitgelicht/vvd-en-pro" },
};

const pct = (c: number | null | undefined) => (c == null ? "" : `${Math.round(c)}%`);
const KABINET = "Jetten";

export default async function VvdEnPro() {
  const d = await laadVvdPro();
  if (!d) {
    if (process.env.SUPABASE_URL) throw new Error("VVD en PRO: de gegevens zijn niet bereikbaar");
    return <Inhoud><LegeStaat label="Niet bereikbaar" titel="De cijfers laden nu niet" uitleg="Probeer het over een paar minuten opnieuw." /></Inhoud>;
  }
  const { vvd, lijnPro, idVan, fracties, rijen, terrein } = d;
  const pvda = idVan("PvdA")!, gl = idVan("GL")!, pvv = idVan("PVV")!;
  const jaren = halveJaren(new Date());
  const [hoofd, metPvda, metGl, metPvv, kab] = await Promise.all([
    cohesiePerHalfjaar([vvd], lijnPro.ids, "alle"), cohesiePerHalfjaar([vvd], [pvda], "alle"), cohesiePerHalfjaar([vvd], [gl], "alle"),
    cohesiePerHalfjaar([vvd], [pvv], "alle"), perioden(),
  ]);
  const c = (k: string, ids: string[]) => cohesieVan(rijen, k, ids).cohesie;
  // Referentie: de VVD met elke andere fractie per half jaar (zonder de lijn van PRO, PvdA, GroenLinks en PVV, die in
  // kleur staan); alleen fracties met minstens vier halve jaren met een percentage, anders zijn het losse streepjes
  const uitgezonderd = new Set([...lijnPro.ids, pvda, gl, pvv]);
  const alleRijen = (await leesApi<Array<{ halfjaar: string; andere_fractie: string; andere_fractie_afkorting: string; gezamenlijk: number; gelijk: number }>>(
    `cohesie_halfjaar?select=halfjaar,andere_fractie,andere_fractie_afkorting,gezamenlijk,gelijk&variant=eq.alle&fractie=eq.${vvd}&limit=5000`)) ?? [];
  const perFractie = new Map<string, Array<{ halfjaar: string; gezamenlijk: number; gelijk: number }>>();
  for (const x of alleRijen.filter((x) => !uitgezonderd.has(x.andere_fractie))) {
    const l = perFractie.get(x.andere_fractie_afkorting) ?? [];
    l.push(x);
    perFractie.set(x.andere_fractie_afkorting, l);
  }
  const anderen = [...perFractie].map(([naam, l]) => ({ naam, punten: punten(l, jaren) }))
    .filter((a) => a.punten.filter((p) => p.cohesie != null).length >= 4);

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
  const nu = rangorde(rijen, KABINET, zetels(KABINET), lijnNaam);
  const toen = rangorde(rijen, "Schoof", zetels("Schoof"), lijnNaam);
  const plek = (l: typeof nu) => l.findIndex((x) => x.naam === "PRO") + 1;
  const proNu = nu.find((x) => x.naam === "PRO"), proToen = toen.find((x) => x.naam === "PRO");
  const pvvHj = punten(metPvv ?? [], jaren);
  const r2 = kab.find((p) => p.soort === "kabinet" && p.naam === "Rutte II");

  const stappen = r2 ? vvdProVerhaal({
    rangorde: nu, kabinet: KABINET,
    anderen, pro: punten(hoofd ?? [], jaren), pvda: punten(metPvda ?? [], jaren), gl: punten(metGl ?? [], jaren), pvv: pvvHj,
    perKabinet: { r1: c("Rutte I", [pvda]), r2: c("Rutte II", [pvda]), r3: c("Rutte III", [pvda]), r2Gl: c("Rutte II", [gl]) },
    pvvSamen: pvvHj.find((p) => p.halfjaar === "2024-07-01")?.cohesie ?? null,
    pvvOppositie: pvvHj.find((p) => p.halfjaar === "2026-01-01")?.cohesie ?? null,
    terreinen: perTerrein(terrein, lijnPro.ids),
    rutte2: { begin: r2.begin, einde: r2.einde! },
  }) : null;

  return (
    <Inhoud>
      <section className={s.blok}>
        <CasusKiezer casussen={KIEZER} gekozen="vvd-en-pro" />
        <Label>Uitgelicht · VVD en PRO</Label>
        <HeroKop>Hoe vaak stemmen VVD en PRO hetzelfde?</HeroKop>
        <Kern ziet="Hoe vaak VVD en PRO hetzelfde stemden, en daarvoor GroenLinks en PvdA, van 2010 tot nu. En wat er verandert als partijen samen regeren."
          opvalt={proNu && proToen
            ? `Onder kabinet-${KABINET} stemden VVD en PRO in ${pct(proNu.cohesie)} van de stemmingen hetzelfde: plek ${plek(nu)} van de ${nu.length} fracties met minstens 3 zetels. Onder kabinet-Schoof was dat ${pct(proToen.cohesie)}, plek ${plek(toen)} van ${toen.length}.`
            : null} />
        <Tekst>
          Of twee partijen kunnen samenwerken, is een politieke vraag. Wat wel te meten is: hoe vaak ze in de Kamer dezelfde kant
          kiezen. PRO is de fractie GroenLinks-PvdA onder een nieuwe naam; tot oktober 2023 waren GroenLinks en PvdA twee fracties.
        </Tekst>
      </section>

      {stappen && (
        <section className={s.graphic}>
          <HoofdstukKop titel="VVD en PRO, van 2010 tot nu" />
          <ScrollVerhaal verhaal={{ breed: stappen }} label="Hoe vaak de VVD hetzelfde stemde als PRO, en daarvoor GroenLinks en PvdA" stapHoogte="60vh" tijdlijn />
          <Data>
            Bron: open data van de Tweede Kamer, eigen berekening (<Link href="/methodiek">methodiek</Link>). Hetzelfde stemmen: van de
            stemmingen waarin beide fracties voor of tegen stemden, het deel waarin ze dezelfde kant kozen. Alle stemmingen: moties,
            amendementen en wetten. Per half jaar; een punt vanaf 25 stemmingen samen. PRO: GroenLinks-PvdA en PRO samen.
          </Data>
        </section>
      )}

      <section className={s.blok}>
        <Tekst>
          Vergelijk zelf: in de verkenner kun je elk paar fracties door de jaren volgen.{" "}
          <Link href="/verkenner?fractie=VVD&met=PRO#door-de-jaren">VVD en PRO in de verkenner</Link>
        </Tekst>
      </section>
    </Inhoud>
  );
}
