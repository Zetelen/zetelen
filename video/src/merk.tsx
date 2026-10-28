// Merkteken van Zetelen (besluit Niels, 28 oktober 2026: ontwerp A, "de zaal"): een halfrond van zetels in koper, met
// één gouden zetel in het midden. Bewust geen partijkleur. Hier getekend voor de profielfoto, de banners en het woordmerk
// (stilstaande beelden, render met node render.mjs Merk-...). Het favicon van de site is een vereenvoudigde versie met twee
// rijen (web/app/icon.tsx), omdat dertig zetels op 32 pixels dichtslibben.
import { AbsoluteFill } from "remotion";
import { K, LETTER } from "./stijl";

// Zetels in drie rijen: per rij een straal (als deel van de maat) en een aantal
const RIJEN: Array<[number, number]> = [[0.42, 7], [0.62, 10], [0.82, 13]];

export function zetels(rijen = RIJEN) {
  return rijen.flatMap(([r, n], ri) => Array.from({ length: n }, (_, i) => {
    const a = Math.PI - (Math.PI * i) / (n - 1);
    return { x: Math.cos(a) * r, y: -Math.sin(a) * r, goud: ri === rijen.length - 1 && i === (n - 1) / 2 };
  }));
}

// Het teken in een vierkant van maat x maat; het halfrond staat optisch in het midden
export function Merkteken({ maat }: { maat: number }) {
  const m = maat / 2;
  return (
    <svg width={maat} height={maat} viewBox={`${-m} ${-m} ${maat} ${maat}`}>
      {zetels().map((z, i) => (
        <circle key={i} cx={z.x * m} cy={z.y * m + m * 0.36} r={m * (z.goud ? 0.06 : 0.048)} fill={z.goud ? K.goud : K.koper} />
      ))}
    </svg>
  );
}

function Woord({ grootte }: { grootte: number }) {
  return (
    <div style={{ fontFamily: LETTER.serif, fontSize: grootte, letterSpacing: "0.14em", fontVariant: "small-caps", color: K.tekst, lineHeight: 1 }}>
      Zetelen
    </div>
  );
}

// Profielfoto: het teken op nacht; past ook in een ronde uitsnede
export function Profiel() {
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950, alignItems: "center", justifyContent: "center" }}>
      <Merkteken maat={920} />
    </AbsoluteFill>
  );
}

// Banner: teken en woord naast elkaar, met de ondertitel van de site
export function Banner() {
  return (
    <AbsoluteFill style={{ backgroundColor: K.nacht950, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 48 }}>
      <Merkteken maat={260} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Woord grootte={120} />
        <div style={{ fontFamily: LETTER.sans, fontSize: 34, color: K.zacht }}>Wie stemt met wie in de Tweede Kamer · zetelen.nl</div>
      </div>
    </AbsoluteFill>
  );
}

// Woordmerk: teken en woord op een transparante achtergrond
export function Woordmerk() {
  return (
    <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 36 }}>
      <Merkteken maat={300} />
      <Woord grootte={150} />
    </AbsoluteFill>
  );
}
