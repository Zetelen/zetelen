// Kleurrekening voor het ontwerpsysteem: WCAG-contrast en de cohesieschaal.
// Bron van de waarden: docs/ontwerp/HANDOVER.md.

export const TOKENS = {
  "nacht-950": "#070B18",
  "nacht-900": "#0B1226",
  "nacht-800": "#111B36",
  "nacht-700": "#1A2748",
  lijn: "#2A3A63",
  "lijn-licht": "#566AA6",
  tekst: "#E8ECF5",
  "tekst-zacht": "#A9B4CC",
  koper: "#D08A55",
  goud: "#E3B76A",
} as const;

// Vier stops van het oude verloop; nog gebruikt als vaste kleuren in CSS (--schaal-33, -67, -100), niet meer voor cohesie
export const SCHAAL: Array<[number, string]> = [
  [0, "#2B2F6B"],
  [33, "#3E7CB1"],
  [67, "#7FB7C9"],
  [100, "#F2D38B"],
];

type Rgb = [number, number, number];

export function naarRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
}

export function naarHex([r, g, b]: Rgb): string {
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase();
}

// Relatieve luminantie volgens WCAG 2.x
export function luminantie(hex: string): number {
  const [r, g, b] = naarRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminantie(a), luminantie(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// Vijf duidelijk verschillende klassen in plaats van een doorlopend verloop (feedback van een bezoeker, besluit Niels
// 28 oktober 2026): op de telefoon was 60% niet van 75% te onderscheiden. Elke klasse is lichter dan de vorige, ook bij
// kleurenblindheid; de donkerste haalt 3:1 op nacht-950. "vanaf" is de ondergrens in procenten.
export const KLASSEN: Array<{ vanaf: number; kleur: string; woord: string; bereik: string }> = [
  { vanaf: 0, kleur: "#4A55B0", woord: "zelden", bereik: "onder 40%" },
  { vanaf: 40, kleur: "#3984C0", woord: "soms", bereik: "40 tot 55%" },
  { vanaf: 55, kleur: "#4FB0A6", woord: "vaak", bereik: "55 tot 70%" },
  { vanaf: 70, kleur: "#9CCF83", woord: "meestal", bereik: "70 tot 85%" },
  { vanaf: 85, kleur: "#FFE08A", woord: "bijna altijd", bereik: "85% en meer" },
];

// Kleur voor een cohesie van 0 tot 100 procent: de kleur van de klasse (afgerond op hele procenten, zoals het getal
// dat ernaast staat)
export function schaalkleur(procent: number): string {
  const p = Math.round(Math.min(100, Math.max(0, procent)));
  return [...KLASSEN].reverse().find((k) => p >= k.vanaf)!.kleur;
}

// Tekst in een gekleurde cel: wit of zwart, gekozen op relatieve luminantie (grens 0,179)
export function tekstOp(achtergrond: string): "#FFFFFF" | "#000000" {
  return luminantie(achtergrond) < 0.179 ? "#FFFFFF" : "#000000";
}
