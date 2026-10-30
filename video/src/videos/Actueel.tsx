// Explainer bij een Actueel-stuk (besluit Niels, 30 oktober 2026): de vier vaste blokken van de pagina als vier scènes,
// met dezelfde koppen en getallen (web/lib/actueel.ts leest ze uit web/content/actueel/<slug>.json). Opening met de
// aanleiding, dan hecht, mee, wringt, telt, de slotzin en de eindkaart. Twee formaten: 9:16 voor verhalen en reels,
// 4:5 voor de tijdlijn; de opmaak rekent met de hoogte van de compositie. Op de maat van de huismuziek: 44 seconden.
// Geen partijkleuren, geen namen van personen.
import type { ReactNode } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { type ActueelData, aantal, datumTekst, paar, procent, stukVan, vierkantjes } from "../../../web/lib/actueel";
import { schaalkleur, tekstOp } from "../../../web/lib/kleur";
import { Banner, Flits, Woorden, ZWAAR } from "../flits";
import { FRAUNCES, Zaal150 } from "../merk";
import { Achtergrond, Label, Tekst, useVeer, zacht } from "../onderdelen";
import { K, LETTER, VEILIG } from "../stijl";

// Scènes in frames (30 per seconde)
const A = 0, B = 100, C = 340, D = 580, E = 860, F = 1100, G = 1190;
export const DUUR_ACTUEEL = 1320;

// Formaat: 9:16 houdt de veilige zone van sociale media aan, 4:5 heeft die niet en is lager
function useMaat() {
  const { height } = useVideoConfig();
  const lang = height > 1500;
  return {
    lang,
    boven: lang ? VEILIG.boven + 30 : 140,
    onder: lang ? VEILIG.onder : 90,
    kop: lang ? 74 : 60,
    tekst: lang ? 36 : 30,
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
      <div style={{ position: "absolute", top: m.boven, bottom: m.onder, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", justifyContent: "center", gap: m.lang ? 34 : 24 }}>
        {children}
        {voet && <div style={{ marginTop: m.lang ? 40 : 16 }}>{voet}</div>}
      </div>
    </AbsoluteFill>
  );
}

// Marge onderaan een scène: kleine letters, verschijnt na de grafiek
function Voet({ bij, children }: { bij: number; children: ReactNode }) {
  const m = useMaat();
  const z = interpolate(useCurrentFrame(), [bij, bij + 12], [0, 1], zacht);
  return <Tekst grootte={m.tekst - 6} style={{ color: K.zacht, opacity: z, lineHeight: 1.4 }}>{children}</Tekst>;
}

function Opening() {
  const m = useMaat();
  return (
    <Vlak binnenhof={0.35}>
      <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
        <div><Banner bij={4}>Actueel · kabinet-Jetten</Banner></div>
        <Woorden tekst="JA21, BBB en SGP stellen eisen aan het kabinet" bij={12} grootte={m.lang ? 112 : 96} />
        <Woorden tekst="Hoe stemden ze tot nu toe?" bij={50} grootte={m.lang ? 56 : 48} kleur={K.koper} />
      </div>
    </Vlak>
  );
}

// Kop van een blok: de vraag als label, de conclusie in grote woorden
function Kop({ vraag, kop }: { vraag: string; kop: string }) {
  const m = useMaat();
  return (
    <>
      <Label style={{ fontSize: m.lang ? 30 : 26 }}>{vraag}</Label>
      <Woorden tekst={kop} bij={4} grootte={m.kop} />
    </>
  );
}

// Blok 1: de driehoek met cohesie, cel voor cel
function Hecht({ d, vraag, kop }: { d: ActueelData; vraag: string; kop: string }) {
  const frame = useCurrentFrame();
  const m = useMaat();
  const alle = [...d.groep, ...d.tegen];
  const LBL = 120, GAT = 8, breed = (1080 - 2 * VEILIG.zij - LBL - 4 * GAT) / 5, hoog = m.lang ? 130 : 74;
  const binnen = (l: string[]) => l.flatMap((a, i) => l.slice(i + 1).map((b) => paar(d, a, b)!.cohesie));
  const blok = binnen(d.groep), kab = binnen(d.tegen);
  let n = 0;
  return (
    <Vlak voet={<Voet bij={150}>{`Blok onderling ${procent(Math.min(...blok))} tot ${procent(Math.max(...blok))}, kabinet onderling ${procent(Math.min(...kab))} tot ${procent(Math.max(...kab))}. Cohesie: hoe vaak twee fracties dezelfde kant kozen, onder kabinet-${d.kabinet}.`}</Voet>}>
      <Kop vraag={vraag} kop={kop} />
      <div style={{ display: "flex", flexDirection: "column", gap: GAT, marginTop: 10 }}>
        <div style={{ display: "flex", gap: GAT, paddingLeft: LBL }}>
          {alle.slice(1).map((b) => <div key={b} style={{ width: breed, textAlign: "center", fontFamily: LETTER.mono, fontSize: 26, color: K.zacht }}>{b}</div>)}
        </div>
        {alle.slice(0, -1).map((a, i) => (
          <div key={a} style={{ display: "flex", gap: GAT, alignItems: "center" }}>
            <div style={{ width: LBL - GAT, fontFamily: LETTER.mono, fontSize: 26, color: d.groep.includes(a) ? K.koper : K.zacht }}>{a}</div>
            {alle.slice(1).map((b, j) => {
              if (j < i) return <div key={b} style={{ width: breed, height: hoog }} />;
              const c = paar(d, a, b)!.cohesie;
              const s = interpolate(frame, [40 + n * 4, 52 + n++ * 4], [0, 1], zacht);
              return (
                <div key={b} style={{ width: breed, height: hoog, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  background: schaalkleur(c), color: tekstOp(schaalkleur(c)), fontFamily: LETTER.mono, fontSize: m.lang ? 36 : 30,
                  opacity: s, transform: `scale(${0.7 + 0.3 * s})` }}>
                  {Math.round(c)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Vlak>
  );
}

// Blok 2: per fractie een stip die naar het deel schuift dat ze meeging
function Mee({ d, vraag, kop }: { d: ActueelData; vraag: string; kop: string }) {
  const frame = useCurrentFrame();
  const m = useMaat();
  const rijen = [...d.meegaan.fracties].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
  const AS = 1080 - 2 * VEILIG.zij - 120 - 110 - 40;
  return (
    <Vlak voet={<Voet bij={160}>{`Op ${aantal(d.meegaan.basis)} verdeelde stemmingen waarop ${d.tegen.join(", ").replace(/, ([^,]*)$/, " en $1")} alle drie dezelfde kant kozen. Was het blok zelf eensgezind, dan ging het in ${procent(d.meegaan.groep.pct)} mee.`}</Voet>}>
      <Kop vraag={vraag} kop={kop} />
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 50 : 16, marginTop: 20 }}>
        {rijen.map((f, i) => {
          const s = interpolate(frame, [40 + i * 8, 70 + i * 8], [0, 1], { ...zacht, easing: (t) => 1 - (1 - t) ** 3 });
          const groep = d.groep.includes(f.afkorting);
          const kleur = groep ? K.koper : K.zacht;
          return (
            <div key={f.afkorting} style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 120, fontFamily: LETTER.mono, fontSize: 34, color: kleur }}>{f.afkorting}</div>
              <div style={{ position: "relative", width: AS, height: 36, borderBottom: `2px solid ${K.lijn}` }}>
                {[25, 50, 75].map((t) => <div key={t} style={{ position: "absolute", left: (AS * t) / 100, top: 10, bottom: 0, borderLeft: `2px solid ${K.lijn}` }} />)}
                <div style={{ position: "absolute", left: (AS * (f.pct ?? 0) * s) / 100 - 15, top: 3, width: 30, height: 30, borderRadius: 15, background: kleur }} />
              </div>
              <div style={{ width: 110, textAlign: "right", fontFamily: LETTER.mono, fontSize: 34, color: kleur, opacity: s }}>{procent((f.pct ?? 0) * s)}</div>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ width: 120 }} />
          <div style={{ position: "relative", width: AS, height: 30, fontFamily: LETTER.mono, fontSize: 24, color: K.zacht }}>
            {[0, 50, 100].map((t) => <span key={t} style={{ position: "absolute", left: (AS * t) / 100, transform: "translateX(-50%)" }}>{t}%</span>)}
          </div>
        </div>
      </div>
    </Vlak>
  );
}

// Blok 3: per thema een vierkantje per stemming, koper als ze tegenover elkaar stonden
function Wringt({ d, vraag, kop }: { d: ActueelData; vraag: string; kop: string }) {
  const frame = useCurrentFrame();
  const m = useMaat();
  const VAK = m.lang ? 44 : 34, GAT = 8;
  let n = 0;
  return (
    <Vlak voet={<Voet bij={190}>{`Alleen stemmingen waarop kabinet en blok allebei eensgezind stemden. Over alle onderwerpen samen: ${aantal(d.botspunten.alles.tegenover)} van de ${aantal(d.botspunten.alles.beide)} keer tegenover elkaar.`}</Voet>}>
      <Kop vraag={vraag} kop={kop} />
      <div style={{ display: "flex", gap: 30, fontFamily: LETTER.mono, fontSize: 24, color: K.zacht, marginTop: 6 }}>
        <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 4, background: K.koper, verticalAlign: -3 }} /> tegenover elkaar</span>
        <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 4, border: `3px solid ${K.lijnLicht}`, verticalAlign: -3, boxSizing: "border-box" }} /> zelfde kant</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: m.lang ? 34 : 18 }}>
        {d.botspunten.themas.map((t) => {
          const v = vierkantjes(t);
          const start = 40 + n;
          n += v.length * 2 + 12;
          const tegen = v.filter((x, i) => x.stand === "tegen" && frame >= start + i * 2).length;
          return (
            <div key={t.thema} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: LETTER.sans, fontSize: m.tekst, color: K.tekst }}>
                <span>{t.thema}</span>
                <span style={{ fontFamily: LETTER.mono, color: K.koper, opacity: frame >= start ? 1 : 0 }}>{tegen} van {t.beide}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: GAT }}>
                {v.map((x, i) => {
                  const s = interpolate(frame, [start + i * 2, start + i * 2 + 6], [0, 1], zacht);
                  return <div key={x.besluit} style={{ width: VAK, height: VAK, borderRadius: 6, boxSizing: "border-box", opacity: s, transform: `scale(${0.5 + 0.5 * s})`,
                    background: x.stand === "tegen" ? K.koper : "transparent", border: x.stand === "tegen" ? "none" : `3px solid ${K.lijnLicht}` }} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Vlak>
  );
}

// Blok 4: de zetelbalk loopt op, eerst het kabinet, dan JA21, dan een van de twee kleine; de streep is de meerderheid
function Telt({ d, vraag, kop }: { d: ActueelData; vraag: string; kop: string }) {
  const frame = useCurrentFrame();
  const m = useMaat();
  const z = d.zetelsom;
  const BREED = 1080 - 2 * VEILIG.zij, per = BREED / 150;
  const kleintjes = z.kleinsteMeerderheid.map((c) => c.find((a) => a !== "JA21")!);
  const klein = z.zetels[kleintjes[0]];
  const groei = (van: number, tot: number) => interpolate(frame, [van, tot], [0, 1], { ...zacht, easing: (t) => 1 - (1 - t) ** 3 });
  const s1 = groei(40, 70), s2 = groei(100, 120), s3 = groei(160, 180);
  const stand = Math.round(z.ref * s1 + z.zetels.JA21 * s2 + klein * s3);
  const HOOG = m.lang ? 140 : 90;
  const streep = interpolate(frame, [20, 32], [0, 1], zacht);
  const regel = (bij: number, tekst: string, kleur: string) => {
    const o = interpolate(frame, [bij, bij + 10], [0, 1], zacht);
    return <div style={{ opacity: o, transform: `translateX(${(1 - o) * -40}px)`, fontFamily: LETTER.sans, fontSize: m.tekst + 4, color: kleur }}>{tekst}</div>;
  };
  return (
    <Vlak voet={<Voet bij={200}>{`Het blok telt ${z.groep} zetels. Lid Keijzer (1 zetel) is een eigen fractie en hoort er niet bij. Het kabinet kan ook steun zoeken bij andere fracties; de Eerste Kamer telt hier niet mee.`}</Voet>}>
      <Kop vraag={vraag} kop={kop} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 10 }}>
        <div style={{ fontFamily: ZWAAR, fontWeight: 800, fontSize: m.lang ? 170 : 130, lineHeight: 1, color: stand >= z.meerderheid ? K.goud : K.tekst, fontVariantNumeric: "tabular-nums" }}>{stand}</div>
        <div style={{ fontFamily: LETTER.sans, fontSize: m.tekst + 4, color: K.zacht }}>zetels, meerderheid is {z.meerderheid}</div>
      </div>
      <div style={{ position: "relative", width: BREED, height: HOOG, background: K.nacht800, borderRadius: 8, display: "flex", marginTop: 20 }}>
        <div style={{ width: z.ref * per * s1, background: K.lijnLicht, borderRadius: "8px 0 0 8px" }} />
        <div style={{ width: z.zetels.JA21 * per * s2, background: K.koper, borderLeft: s2 > 0 ? `3px solid ${K.nacht950}` : "none" }} />
        <div style={{ width: klein * per * s3, borderLeft: s3 > 0 ? `3px solid ${K.nacht950}` : "none",
          background: `repeating-linear-gradient(45deg, ${K.koper} 0 6px, ${K.nacht800} 6px 12px)` }} />
        <div style={{ position: "absolute", left: z.meerderheid * per, top: -16, bottom: -16, borderLeft: `5px solid ${K.goud}`, opacity: streep }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
        {regel(70, `${d.tegen.join(", ").replace(/, ([^,]*)$/, " en $1")}: ${z.ref}. Te weinig.`, K.zacht)}
        {regel(120, `Met JA21 erbij: ${z.ref + z.zetels.JA21}. Nog één te weinig.`, K.koper)}
        {regel(180, `Met ${kleintjes.join(" of ")} erbij: ${z.ref + z.zetels.JA21 + klein}.`, K.goud)}
      </div>
      <Flits bij={180} sterkte={0.3} />
    </Vlak>
  );
}

function Slot({ slot }: { slot: string }) {
  const m = useMaat();
  return (
    <Vlak>
      <div>
        <Woorden tekst={slot} bij={6} grootte={m.lang ? 100 : 84} />
      </div>
    </Vlak>
  );
}

// Eindkaart met het merk; de bron en de stand van de data onderaan
function Eind({ bron }: { bron: string }) {
  const m = useMaat();
  const z = useVeer(0, 20);
  return (
    <AbsoluteFill style={{ opacity: Math.min(1, z * 1.3) }}>
      <Achtergrond binnenhof={0} />
      <div style={{ position: "absolute", top: m.lang ? 380 : 150, left: 0, right: 0, display: "flex", justifyContent: "center" }}><Zaal150 breedte={m.lang ? 820 : 720} /></div>
      <div style={{ position: "absolute", top: m.lang ? 720 : 450, left: VEILIG.zij, right: VEILIG.zij, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 26 }}>
        <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: m.lang ? 120 : 104, letterSpacing: "-0.02em", lineHeight: 1, color: K.tekst, textShadow: `0 0 40px ${K.nacht950}` }}>zetelen.nl/actueel</div>
        <Tekst grootte={m.tekst + 2} style={{ color: K.zacht }}>Het hele stuk, met elke stemming terug te vinden.</Tekst>
      </div>
      <div style={{ position: "absolute", bottom: m.onder - (m.lang ? 60 : 30), left: VEILIG.zij, right: VEILIG.zij, fontFamily: LETTER.mono, fontSize: m.lang ? 26 : 22, lineHeight: 1.5, color: K.zacht }}>
        Bron: Tweede Kamer, open data · {bron}
        <br />Kleuren zijn een eigen palet, geen partijkleuren.
      </div>
    </AbsoluteFill>
  );
}

export function Actueel({ slug }: { slug: string }) {
  const x = stukVan(slug)!;
  const b = (id: string) => x.blokken.find((y) => y.id === id)!;
  const bron = `stemmingen onder kabinet-${x.data.kabinet} tot en met ${datumTekst(x.data.stand)}`;
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950 }}>
      {/* Huismuziek van 44 seconden, zoals bij VvdEnPro; niet in de repo */}
      <Audio src={staticFile("muziek/zetelen.wav")} volume={(f) => 0.7 * interpolate(f, [0, 6], [0, 1], zacht)} />
      <Sequence from={A} durationInFrames={B - A}><Opening /></Sequence>
      <Sequence from={B} durationInFrames={C - B}><Hecht d={x.data} {...b("hecht")} /></Sequence>
      <Sequence from={C} durationInFrames={D - C}><Mee d={x.data} {...b("mee")} /></Sequence>
      <Sequence from={D} durationInFrames={E - D}><Wringt d={x.data} {...b("wringt")} /></Sequence>
      <Sequence from={E} durationInFrames={F - E}><Telt d={x.data} {...b("telt")} /></Sequence>
      <Sequence from={F} durationInFrames={G - F}><Slot slot={x.slot} /></Sequence>
      <Sequence from={G}><Eind bron={bron} /></Sequence>
    </AbsoluteFill>
  );
}
