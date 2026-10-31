// Explainer bij een Actueel-stuk (besluit Niels, 30 oktober 2026; verhaal herzien dezelfde dag). Eén boodschap per
// scène, eerst in grote woorden, dan de grafiek die het bewijst, dan stilstand om te lezen:
//   1. aanleiding: het blok stelt eisen;
//   2. hoe vaak mee: JA21, BBB en SGP per stuk in 60 tot 74%, PRO als oppositiepartij ter vergelijking;
//   3. behalve precies daar: op stikstof, asiel en abortus per partij 12 tot 32% mee, met het gemiddelde over alles ernaast;
//   4. bij abortus valt het blok uiteen: per fractie hoe vaak mee met het kabinet, met het gemiddelde ernaast;
//   5. de conclusie, expliciet in twee zinnen (de slotzin van het stuk), en een eindkaart die naar de site verwijst.
// Geen bewering over wie nodig is: de Eerste Kamer staat niet in de data (feedback Niels). Getallen uit
// web/lib/actueel.ts en web/content/actueel/<slug>.json, dezelfde als op de pagina. Kleine aantallen als "1 van 11",
// niet als procent. Twee formaten: 9:16 voor verhalen en reels, 4:5 voor de tijdlijn; de opmaak rekent met de hoogte.
// Op de maat van de huismuziek: 44 seconden. Geen partijkleuren, geen namen van personen.
import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { type ActueelData, datumTekst, mee, opDrieThemas, perThema, procent, stukVan, vierkantjes } from "../../../web/lib/actueel";
import { Banner, Woorden } from "../flits";
import { FRAUNCES, Zaal150 } from "../merk";
import { Achtergrond, Label, Tekst, useVeer, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

// Scènes in frames (30 per seconde)
const A = 0, B = 120, C = 330, D = 690, E = 990, F = 1200;
export const DUUR_ACTUEEL = 1320;

const uitloop = { ...zacht, easing: (t: number) => 1 - (1 - t) ** 3 };

// Formaat: 9:16 houdt de veilige zone van sociale media aan, 4:5 heeft die niet en is lager
function useMaat() {
  const { height } = useVideoConfig();
  const lang = height > 1500;
  return {
    lang,
    boven: lang ? VEILIG.boven + 30 : 140,
    onder: lang ? VEILIG.onder : 90,
    kop: lang ? 84 : 66,
    tekst: lang ? 38 : 32,
  };
}

// Achtergrond, merk en een kolom tussen de veilige randen, verticaal in het midden; de marge direct onder de grafiek
function Vlak({ children, voet, binnenhof = 0 }: { children: ReactNode; voet?: ReactNode; binnenhof?: number }) {
  const m = useMaat();
  return (
    <AbsoluteFill>
      <Achtergrond binnenhof={binnenhof} />
      <div style={{ position: "absolute", top: m.lang ? VEILIG.boven - 90 : 50, left: VEILIG.zij, fontFamily: FRAUNCES, fontWeight: 600, fontSize: m.lang ? 46 : 40, color: K.tekst }}>
        zetelen
      </div>
      <div style={{ position: "absolute", top: m.boven, bottom: m.onder, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", justifyContent: "center", gap: m.lang ? 34 : 22 }}>
        {children}
        {voet && <div style={{ marginTop: m.lang ? 30 : 10 }}>{voet}</div>}
      </div>
    </AbsoluteFill>
  );
}

// Marge onder een scène: één korte regel, verschijnt na de grafiek
function Voet({ bij, children }: { bij: number; children: ReactNode }) {
  const m = useMaat();
  const z = interpolate(useCurrentFrame(), [bij, bij + 12], [0, 1], zacht);
  return <Tekst grootte={m.tekst - 6} style={{ color: K.zacht, opacity: z, lineHeight: 1.4 }}>{children}</Tekst>;
}

// Kop van een scène: een label en de boodschap in grote woorden
function Kop({ label, kop, bij = 4 }: { label: string; kop: string; bij?: number }) {
  const m = useMaat();
  return (
    <>
      <Label style={{ fontSize: m.lang ? 30 : 26 }}>{label}</Label>
      <Woorden tekst={kop} bij={bij} grootte={m.kop} />
    </>
  );
}

// Een balk die vanaf een frame vol loopt tot een percentage, met label links en waarde rechts
function Balk({ bij, pct, label, waarde, kleur, hoog }: { bij: number; pct: number; label: string; waarde: string; kleur: string; hoog: number }) {
  const m = useMaat();
  const s = interpolate(useCurrentFrame(), [bij, bij + 30], [0, 1], uitloop);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: Math.min(1, s * 3) }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: LETTER.sans, fontSize: m.tekst, color: K.tekst }}>
        <span>{label}</span>
        <span style={{ fontFamily: LETTER.mono, color: kleur }}>{waarde}</span>
      </div>
      <div style={{ height: hoog, borderRadius: 8, background: K.nacht800, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct * s}%`, background: kleur }} />
      </div>
    </div>
  );
}

function Opening() {
  const m = useMaat();
  return (
    <Vlak binnenhof={0.35}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        <div><Banner bij={4}>Actueel · kabinet-Jetten</Banner></div>
        <Woorden tekst="JA21, BBB en SGP stellen eisen aan het kabinet" bij={12} grootte={m.lang ? 112 : 96} />
        <Woorden tekst="Over stikstof, asiel en abortus" bij={50} grootte={m.lang ? 56 : 48} kleur={K.koper} />
      </div>
    </Vlak>
  );
}

// Scène 2: per partij hoe vaak mee met het eensgezinde kabinet, met de oppositiepartij PRO ter vergelijking (zoals blok 1
// op de site; het blok als geheel, 76%, is een andere maat en staat alleen in de tekst op de site)
function Meestal({ d }: { d: ActueelData }) {
  const m = useMaat();
  const blok = d.groep.map((a) => mee(d, a)!).sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const pro = mee(d, "PRO")!;
  const pcts = blok.map((f) => f.pct ?? 0);
  const HOOG = m.lang ? 48 : 36;
  return (
    <Vlak voet={<Voet bij={140}>PRO is een oppositiepartij, ter vergelijking.</Voet>}>
      <Kop label="Als het kabinet eensgezind stemde" kop={`${d.groep.join(", ").replace(/, ([^,]*)$/, " en $1")} stemden in ${Math.round(Math.min(...pcts))} tot ${procent(Math.max(...pcts))} van de stemmingen mee met het kabinet`} />
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 28 : 16, marginTop: m.lang ? 20 : 6 }}>
        {blok.map((f, i) => <Balk key={f.afkorting} bij={45 + i * 15} pct={f.pct ?? 0} label={f.afkorting} waarde={procent(f.pct)} kleur={K.koper} hoog={HOOG} />)}
        <Balk bij={105} pct={pro.pct ?? 0} label="PRO, oppositie" waarde={procent(pro.pct)} kleur={K.lijnLicht} hoog={HOOG} />
      </div>
    </Vlak>
  );
}

// Scène 3: behalve precies daar; dezelfde maat als scène 2, maar op de drie thema's, met een streep bij het eigen
// gemiddelde over alles (zelfde beeld als scène 4)
function Behalve({ d }: { d: ActueelData }) {
  const frame = useCurrentFrame();
  const m = useMaat();
  const drie = opDrieThemas(d).sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const alles = perThema(d, "Alles")!;
  const pcts = drie.map((f) => f.pct ?? 0);
  const HOOG = m.lang ? 70 : 52;
  const streep = interpolate(frame, [130, 145], [0, 1], zacht);
  return (
    <Vlak voet={<Voet bij={190}>{`Stemmingen over stikstof, asiel en abortus waarop het kabinet eensgezind stemde: ${drie[0].gestemd}.`}</Voet>}>
      <Kop label="Behalve precies daar" kop={`Op hun eigen eisen draait het om: ${Math.round(Math.min(...pcts))} tot ${procent(Math.max(...pcts))} mee`} />
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 40 : 22, marginTop: 10 }}>
        {drie.map((f, i) => {
          const gem = alles.fracties.find((x) => x.afkorting === f.afkorting)!;
          const s = interpolate(frame, [50 + i * 20, 80 + i * 20], [0, 1], uitloop);
          return (
            <div key={f.afkorting} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: LETTER.mono, fontSize: m.tekst + 6 }}>
                <span style={{ color: K.koper }}>{f.afkorting}</span>
                <span style={{ color: K.tekst, opacity: Math.min(1, s * 2) }}>{procent(f.pct)} mee</span>
              </div>
              <div style={{ position: "relative", height: HOOG, borderRadius: 8, background: K.nacht800 }}>
                <div style={{ height: "100%", width: `${(f.pct ?? 0) * s}%`, background: K.koper, borderRadius: 8 }} />
                <div style={{ position: "absolute", left: `${gem.pct ?? 0}%`, top: -10, bottom: -10, borderLeft: `4px solid ${K.goud}`, opacity: streep }} />
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: LETTER.sans, fontSize: m.tekst - 4, color: K.zacht, opacity: streep }}>
          <span style={{ display: "inline-block", width: 0, height: 34, borderLeft: `4px solid ${K.goud}` }} />
          Streep: over alle onderwerpen, zoals in het vorige beeld
        </div>
      </div>
    </Vlak>
  );
}

// Scène 4: bij abortus valt het blok uiteen; per fractie een balk voor abortus, met een streep bij het eigen gemiddelde
function Abortus({ d }: { d: ActueelData }) {
  const frame = useCurrentFrame();
  const m = useMaat();
  const ab = perThema(d, "Abortus, embryo, draagmoeder")!, alles = perThema(d, "Alles")!;
  const HOOG = m.lang ? 70 : 52;
  const streep = interpolate(frame, [150, 165], [0, 1], zacht);
  return (
    <Vlak voet={<Voet bij={200}>{`Hoe vaak mee met het kabinet, als dat eensgezind stemde: ${ab.fracties[0].gestemd} stemmingen. JA21 was bij elke hoofdelijke stemming hierover zelf verdeeld.`}</Voet>}>
      <Kop label="Is het blok één blok?" kop="Bij abortus valt het blok uiteen" />
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 40 : 22, marginTop: 10 }}>
        {d.groep.map((a, i) => {
          const f = ab.fracties.find((x) => x.afkorting === a)!, gem = alles.fracties.find((x) => x.afkorting === a)!;
          const s = interpolate(frame, [50 + i * 20, 80 + i * 20], [0, 1], uitloop);
          return (
            <div key={a} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: LETTER.mono, fontSize: m.tekst + 6 }}>
                <span style={{ color: K.koper }}>{a}</span>
                <span style={{ color: K.tekst, opacity: Math.min(1, s * 2) }}>{f.mee} van {f.gestemd} keer mee</span>
              </div>
              <div style={{ position: "relative", height: HOOG, borderRadius: 8, background: K.nacht800 }}>
                <div style={{ height: "100%", width: `${(f.pct ?? 0) * s}%`, background: K.koper, borderRadius: 8 }} />
                <div style={{ position: "absolute", left: `${gem.pct ?? 0}%`, top: -10, bottom: -10, borderLeft: `4px solid ${K.goud}`, opacity: streep }} />
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: LETTER.sans, fontSize: m.tekst - 4, color: K.zacht, opacity: streep }}>
          <span style={{ display: "inline-block", width: 0, height: 34, borderLeft: `4px solid ${K.goud}` }} />
          Streep: hoe vaak de partij meeging over alle onderwerpen
        </div>
      </div>
    </Vlak>
  );
}

// Scène 5: de conclusie, de slotzin van het stuk in twee delen
function Conclusie({ slot }: { slot: string }) {
  const m = useMaat();
  const [eerste, tweede] = slot.split(/(?<=\.) /);
  return (
    <Vlak>
      <Kop label="De conclusie" kop={eerste} />
      <Woorden tekst={tweede} bij={75} grootte={m.lang ? 56 : 46} kleur={K.koper} />
    </Vlak>
  );
}

// Eindkaart met het merk; de bron, de stand van de data en de marge onderaan
function Eind({ slug, bron, marge }: { slug: string; bron: string; marge: string }) {
  const m = useMaat();
  const z = useVeer(0, 20);
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, z * 1.3) }}>
      <Achtergrond binnenhof={0} />
      <div style={{ position: "absolute", top: m.lang ? 360 : 90, left: 0, right: 0, display: "flex", justifyContent: "center" }}><Zaal150 breedte={m.lang ? 820 : 720} /></div>
      <div style={{ position: "absolute", top: m.lang ? 860 : 520, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 26 }}>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: m.lang ? 100 : 88, letterSpacing: "-0.02em", lineHeight: 1.05, color: K.tekst, textShadow: `0 0 40px ${K.nacht950}` }}>Meer toelichting op zetelen.nl</div>
        <Tekst grootte={m.tekst} style={{ fontFamily: LETTER.mono, color: K.koper }}>{`zetelen.nl/actueel/${slug}`}</Tekst>
      </div>
      <div style={{ position: "absolute", bottom: m.onder - (m.lang ? 60 : 30), left: VEILIG.zij, right: VEILIG.zij, fontFamily: LETTER.mono, fontSize: m.lang ? 26 : 22, lineHeight: 1.5, color: K.zacht }}>
        Bron: Tweede Kamer, open data · {bron}
        <br />{marge}
      </div>
    </AbsoluteFill>
  );
}

export function Actueel({ slug }: { slug: string }) {
  const x = stukVan(slug)!;
  const drie = x.data.botspunten.themas.flatMap(vierkantjes);
  const marge = `Alleen de Tweede Kamer. Van de ${drie.length} stemmingen op de drie thema's zijn er ${drie.filter((v) => v.soort === "Motie").length} moties.`;
  const bron = `stemmingen onder kabinet-${x.data.kabinet} tot en met ${datumTekst(x.data.stand)}`;
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      {/* Huismuziek van 44 seconden, zoals bij VvdEnPro; niet in de repo */}
      <Audio src={staticFile("muziek/zetelen.wav")} volume={(f) => 0.7 * interpolate(f, [0, 6], [0, 1], zacht)} />
      <Sequence from={A} durationInFrames={B - A}><Opening /></Sequence>
      <Sequence from={B} durationInFrames={C - B}><Meestal d={x.data} /></Sequence>
      <Sequence from={C} durationInFrames={D - C}><Behalve d={x.data} /></Sequence>
      <Sequence from={D} durationInFrames={E - D}><Abortus d={x.data} /></Sequence>
      <Sequence from={E} durationInFrames={F - E}><Conclusie slot={x.slot} /></Sequence>
      <Sequence from={F}><Eind slug={slug} bron={bron} marge={marge} /></Sequence>
    </AbsoluteFill>
  );
}
