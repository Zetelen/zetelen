// Merk van Zetelen (besluit Niels, 28 oktober 2026): de zaal met 150 zetels, van diep koper onderaan naar licht goud
// bovenaan (bewust niet van links naar rechts: dat leest als een politiek spectrum), half achter het woord "zetelen" in
// Fraunces. Stilstaande beelden voor profielfoto, banners, woordmerk, deelplaatje en favicon; render met
// node scripts/merk.mjs (zet het deelplaatje en het favicon ook in web/app).
import { AbsoluteFill } from "remotion";
import { loadFont as laadFraunces } from "@remotion/google-fonts/Fraunces";
import { MIDDEN, zetels } from "../../web/lib/zaal";
import { K, LETTER } from "./stijl";

export const FRAUNCES = laadFraunces("normal", { weights: ["600"], subsets: ["latin"] }).fontFamily;

// Kleur per zetel naar hoogte: diep koper onderaan, goud bovenaan
const STOPS: Array<[number, [number, number, number]]> = [[0, [74, 38, 26]], [0.45, [194, 120, 72]], [0.8, [233, 168, 102]], [1, [255, 228, 163]]];
export function zetelKleur(t: number) {
  for (let i = 1; i < STOPS.length; i++) {
    const [t0, a] = STOPS[i - 1], [t1, b] = STOPS[i];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      return `rgb(${a.map((x, j) => Math.round(x + (b[j] - x) * u)).join(",")})`;
    }
  }
  return "rgb(255,228,163)";
}

// De zaal met 150 zetels; vervaagt onder de middellijn (daar staat het woord). breedte in pixels
export function Zaal150({ breedte, vervaag = true }: { breedte: number; vervaag?: boolean }) {
  const z = zetels([{ id: "k", zetels: 150 }]);
  return (
    <svg width={breedte} height={breedte * 0.68} viewBox="40 0 920 625">
      {z.map((p, i) => {
        const hoogte = (MIDDEN.y - p.y) / 443;
        const t = Math.min(1, Math.max(0, (hoogte + 0.35) / 1.35));
        const onder = Math.max(0, -hoogte);
        return <circle key={i} cx={p.x} cy={p.y} r={10.5} fill={zetelKleur(t)} opacity={vervaag ? 1 - onder * 2.2 : 1} />;
      })}
    </svg>
  );
}

const gloed = `radial-gradient(ellipse 45% 55% at 50% 52%, rgba(208,138,85,0.22), rgba(208,138,85,0) 70%), ${K.nacht950}`;

function Woord({ maat }: { maat: number }) {
  return (
    <div style={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: maat, letterSpacing: "-0.02em", lineHeight: 0.95, color: K.tekst,
      textShadow: `0 0 ${maat * 0.25}px ${K.nacht950}, 0 0 ${maat * 0.08}px ${K.nacht950}` }}>
      zetelen
    </div>
  );
}

function Onder({ maat }: { maat: number }) {
  return (
    <div style={{ fontFamily: LETTER.sans, fontSize: maat, letterSpacing: "0.16em", textTransform: "uppercase", color: K.koper }}>
      Wie stemt met wie in de Tweede Kamer
    </div>
  );
}

// Zaal met het woord over de onderste helft; schaal: breedte van de zaal in pixels
export function Beeldmerk({ schaal, onder = true }: { schaal: number; onder?: boolean }) {
  return (
    <div style={{ position: "relative", width: schaal, height: schaal * 0.72, display: "flex", justifyContent: "center" }}>
      <Zaal150 breedte={schaal} />
      <div style={{ position: "absolute", left: -schaal, right: -schaal, top: schaal * 0.4, display: "flex", flexDirection: "column", alignItems: "center", gap: schaal * 0.014 }}>
        <Woord maat={schaal * 0.23} />
        {onder && <Onder maat={schaal * 0.03} />}
      </div>
    </div>
  );
}

// Profielfoto: alleen de zaal, want die wordt klein getoond; past ook in een ronde uitsnede
export function Profiel() {
  return (
    <AbsoluteFill style={{ background: gloed, alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginTop: 40 }}><Zaal150 breedte={900} vervaag={false} /></div>
    </AbsoluteFill>
  );
}

export function Banner() {
  return (
    <AbsoluteFill style={{ background: gloed, alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginTop: 40 }}><Beeldmerk schaal={470} /></div>
    </AbsoluteFill>
  );
}

// Deelplaatje voor links (1200 bij 630): het merk met de ondertitel
export function Deel() {
  return (
    <AbsoluteFill style={{ background: gloed, alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginTop: 50 }}><Beeldmerk schaal={760} /></div>
    </AbsoluteFill>
  );
}

// Woordmerk op transparant, voor documenten en video
export function Woordmerk() {
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Beeldmerk schaal={1000} />
    </AbsoluteFill>
  );
}

// Favicon: vereenvoudigd tot twee rijen zetels in het verloop, op nacht met afgeronde hoeken
export function Icoon() {
  const rijen: Array<[number, number]> = [[0.5, 5], [0.86, 9]];
  const punten = rijen.flatMap(([r, n], ri) => Array.from({ length: n }, (_, i) => {
    const a = Math.PI - (Math.PI * i) / (n - 1);
    return { x: 256 + Math.cos(a) * r * 216, y: 350 - Math.sin(a) * r * 216, t: Math.sin(a) * (ri ? 1 : 0.7) };
  }));
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950, borderRadius: 96 }}>
      <svg width={512} height={512}>
        {punten.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={26} fill={zetelKleur(0.35 + 0.65 * p.t)} />)}
      </svg>
    </AbsoluteFill>
  );
}
