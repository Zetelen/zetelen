// Hoe lang duurt een wet? (feedback Niels, 26 oktober 2026: het wetgevingsproces pakkend, als reis). Drie wetten
// als reis met haltes op een tijdas, daarna alle wetsvoorstellen sinds 2010 naar doorlooptijd. Gegevens uit
// content/wetten (gemaakt met pipeline/wet_reis.py). Alle zinnen met cijfers worden uit de gegevens opgebouwd;
// alleen de korte omschrijving per wet is met de hand geschreven.
import alle from "../content/wetten/doorlooptijd.json";
import { KABINETTEN } from "./uitgelicht";
import { type Pad, type Stap, type Stip, type Tekstlabel, rond } from "./verhaal";

export type Halte = { halte: "ingediend" | "advies" | "vragen" | "antwoord" | "aangepast" | "gestemd"; datum: string };
export type Reis = { nummer: string; soort: string; ingediend: string; indiener: string[]; uitslag: string | null; haltes: Halte[] };
export type Wetsvoorstel = { nummer: string; soort: "W" | "I"; ingediend: string; gestemd: string | null; uitslag: string | null };
export type ReisMetTekst = { reis: Reis; titel: string; tekst: string };

export const WETSVOORSTELLEN = alle as Wetsvoorstel[];

const HALTE_NAAM: Record<Halte["halte"], string> = {
  ingediend: "ingediend", advies: "advies Raad van State", vragen: "vragen van de Kamer", antwoord: "antwoord",
  aangepast: "aangepast", gestemd: "besluit",
};
const HALTE_TINT: Record<Halte["halte"], string> = {
  ingediend: "#b9bfcc", advies: "#a08fe0", vragen: "#7fb7c9", antwoord: "#6fbf8e", aangepast: "#d2bb5a", gestemd: "#e0915a",
};

export const dagen = (van: string, tot: string) => Math.round((Date.parse(tot) - Date.parse(van)) / 864e5);

// Een duur in gewone woorden: "13 dagen", "7 maanden", "bijna 6 jaar"
export function duurTekst(d: number): string {
  if (d < 45) return `${d} ${d === 1 ? "dag" : "dagen"}`;
  const maanden = Math.round(d / 30.44);
  if (maanden < 18) return `${maanden} maanden`;
  const jaren = d / 365.25, heel = Math.round(jaren);
  if (Math.abs(jaren - heel) < 0.15) return `${heel} jaar`;
  return jaren < heel ? `bijna ${heel} jaar` : `ruim ${Math.floor(jaren)} jaar`;
}

const maandJaar = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { month: "long", year: "numeric" });

// Kabinetten met hun begin, plus Balkenende IV voor de wetten die begin 2010 zijn ingediend
const PERIODES = [{ naam: "Balkenende IV", begin: "2007-02-22" }, ...KABINETTEN.map((k) => ({ naam: k.naam, begin: k.begin }))];

// Eén reis op een eigen tijdas: haltes als stippen op een lijn, kabinetswissels als stippellijnen, en de
// langste stilte tussen twee haltes gemarkeerd
export function reisStap(r: ReisMetTekst, prefix: string): Stap {
  const h = r.reis.haltes;
  const van = h[0].datum, tot = h[h.length - 1].datum;
  const span = Math.max(1, dagen(van, tot));
  const X0 = 40, X1 = 960, Y = 240;
  const sx = (d: string) => rond(X0 + (dagen(van, d) / span) * (X1 - X0));
  const stippen: Stip[] = h.map((x, i) => ({ key: `${prefix}-${i}`, x: sx(x.datum), y: Y, kleur: null, tint: HALTE_TINT[x.halte], r: 10 }));
  // Labels om en om boven en onder; liggen ze te dicht bij de vorige aan dezelfde kant, dan een regel verder
  const labels: Tekstlabel[] = [];
  const laatsteX = { boven: [-999, -999], onder: [-999, -999] };
  h.forEach((x, i) => {
    const kant = i % 2 === 0 ? "boven" : "onder";
    const xx = sx(x.datum);
    const regel = Math.abs(xx - laatsteX[kant][0]) < 150 ? 1 : 0;
    laatsteX[kant] = [xx, regel];
    const y = kant === "boven" ? Y - 30 - regel * 42 : Y + 44 + regel * 42;
    const anchor = xx < 120 ? "start" : xx > 880 ? "end" : "middle";
    labels.push({ x: xx, y, tekst: HALTE_NAAM[x.halte], anchor, tint: HALTE_TINT[x.halte], halo: true });
    labels.push({ x: xx, y: y + 18, tekst: new Date(`${x.datum}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }), anchor, zacht: true, halo: true });
  });
  const paden: Pad[] = [{ d: `M${X0},${Y} H${X1}`, tint: "#566aa6", breedte: 3 }];
  // Kabinetswissels binnen de reis
  for (const p of PERIODES) {
    if (p.begin > van && p.begin < tot) {
      paden.push({ d: `M${sx(p.begin)},${Y - 150} V${Y + 150}`, tint: "#566aa6", streep: true, zacht: true });
      labels.push({ x: sx(p.begin) + 6, y: Y - 140, tekst: `kabinet-${p.naam}`, zacht: true });
    }
  }
  const eerste = [...PERIODES].reverse().find((p) => p.begin <= van);
  if (eerste) labels.push({ x: X0, y: Y - 140, tekst: `kabinet-${eerste.naam}`, zacht: true });
  // De langste stilte: een koperen streep met de duur erbij
  let gat = 0, gi = 0;
  for (let i = 1; i < h.length; i++) { const d = dagen(h[i - 1].datum, h[i].datum); if (d > gat) { gat = d; gi = i; } }
  // Alleen een echte stilte: minstens een half jaar en een groot deel van de reis
  if (h.length > 2 && gat >= 183 && gat > span * 0.35) {
    const a = sx(h[gi - 1].datum), b = sx(h[gi].datum);
    paden.push({ d: `M${a},${Y} H${b}`, tint: "#d08a55", breedte: 6 });
    labels.push({ x: rond((a + b) / 2), y: Y + 120, tekst: `${duurTekst(gat)} stil`, anchor: "middle", groot: true, tint: "#d08a55" });
  }
  labels.push({ x: X1, y: 470, tekst: `in totaal ${duurTekst(span)}`, anchor: "end", groot: true });
  return { datum: duurTekst(span), hoofdstuk: undefined, tekst: r.tekst, stippen, labels, paden };
}

// De drie reizen op één schaal, in dagen vanaf de indiening
export function samenStap(reizen: ReisMetTekst[], prefixen: string[]): Stap {
  const span = Math.max(...reizen.map((r) => dagen(r.reis.haltes[0].datum, r.reis.haltes[r.reis.haltes.length - 1].datum)));
  const X0 = 40, X1 = 960;
  const sx = (d: number) => rond(X0 + (d / span) * (X1 - X0));
  const stippen: Stip[] = [], labels: Tekstlabel[] = [], paden: Pad[] = [];
  reizen.forEach((r, j) => {
    const y = 90 + j * 140, h = r.reis.haltes, van = h[0].datum;
    paden.push({ d: `M${X0},${y} H${sx(dagen(van, h[h.length - 1].datum))}`, tint: "#566aa6", breedte: 3 });
    h.forEach((x, i) => stippen.push({ key: `${prefixen[j]}-${i}`, x: sx(dagen(van, x.datum)), y, kleur: null, tint: HALTE_TINT[x.halte], r: 8 }));
    labels.push({ x: X0, y: y - 22, tekst: r.titel, groot: true });
    labels.push({ x: sx(dagen(van, h[h.length - 1].datum)) + 14, y: y + 5, tekst: duurTekst(dagen(van, h[h.length - 1].datum)), halo: true });
  });
  for (let jaar = 1; jaar * 365.25 < span; jaar++) {
    paden.push({ d: `M${sx(jaar * 365.25)},40 V470`, tint: "#2a3a63", streep: true, zacht: true });
    labels.push({ x: sx(jaar * 365.25), y: 495, tekst: `${jaar} jaar`, anchor: "middle", zacht: true });
  }
  return { datum: "op één tijdas", tekst: "", stippen, labels, paden };
}

// Alle wetsvoorstellen naar doorlooptijd, in kolommen; een stip is een aantal wetsvoorstellen
export const BAKKEN = [
  { naam: "tot 1 mnd", tot: 31 }, { naam: "1 tot 3 mnd", tot: 91 }, { naam: "3 tot 6 mnd", tot: 183 },
  { naam: "6 tot 12 mnd", tot: 365 }, { naam: "1 tot 2 jaar", tot: 730 }, { naam: "2 tot 4 jaar", tot: 1461 }, { naam: "4 jaar of meer", tot: Infinity },
];

export type Telling = {
  cohort: Wetsvoorstel[]; besloten: Wetsvoorstel[]; hamer: number; verworpen: number; zonder: number;
  mediaan: number; binnenJaar: number; mediaanInitiatief: number | null; mediaanRegering: number | null;
  perBak: Array<{ naam: string; gestemd: number; hamer: number; initiatief: number }>;
};

const mediaanVan = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

// Tellingen over een cohort (ingediend van tot en met tot): wie recent is ingediend, heeft nog geen tijd gehad,
// dus het laatste jaar meetellen zou de doorlooptijd te kort maken
export function telling(rijen: Wetsvoorstel[], van: number, tot: number): Telling {
  const cohort = rijen.filter((r) => { const j = Number(r.ingediend.slice(0, 4)); return j >= van && j <= tot; });
  const besloten = cohort.filter((r) => r.gestemd);
  const duur = (r: Wetsvoorstel) => dagen(r.ingediend, r.gestemd!);
  const perBak = BAKKEN.map((b, i) => {
    const hier = besloten.filter((r) => duur(r) >= (i ? BAKKEN[i - 1].tot : 0) && duur(r) < b.tot);
    return { naam: b.naam, gestemd: hier.filter((r) => r.uitslag !== "hamerstuk").length, hamer: hier.filter((r) => r.uitslag === "hamerstuk").length,
      initiatief: hier.filter((r) => r.soort === "I").length };
  });
  return {
    cohort, besloten, hamer: besloten.filter((r) => r.uitslag === "hamerstuk").length, verworpen: besloten.filter((r) => r.uitslag === "verworpen").length,
    zonder: cohort.length - besloten.length, mediaan: mediaanVan(besloten.map(duur)) ?? 0,
    binnenJaar: besloten.filter((r) => duur(r) < 365).length,
    mediaanInitiatief: mediaanVan(besloten.filter((r) => r.soort === "I").map(duur)), mediaanRegering: mediaanVan(besloten.filter((r) => r.soort === "W").map(duur)),
    perBak,
  };
}

// Met initiatief: dezelfde kolommen, maar de initiatiefwetten koper en de rest gedimd
export function alleStap(t: Telling, per: number, initiatief = false): Stap {
  const X0 = 40, KOL = (920 - X0) / (BAKKEN.length + 1), BREED = 6, STAP = 12, BODEM = 430;
  const stippen: Stip[] = [], labels: Tekstlabel[] = [];
  const kolom = (j: number, segmenten: Array<{ n: number; tint: string; sleutel: string; kleur?: "zacht" }>) => {
    let i = 0;
    const x0 = X0 + j * KOL + (KOL - BREED * STAP) / 2;
    for (const s of segmenten) for (let k = 0; k < Math.round(s.n / per); k++, i++) {
      stippen.push({ key: `${s.sleutel}-${j}-${k}`, x: rond(x0 + (i % BREED) * STAP), y: rond(BODEM - Math.floor(i / BREED) * STAP), kleur: s.kleur ?? null, tint: s.tint, r: 4.6 });
    }
  };
  t.perBak.forEach((b, j) => {
    kolom(j, initiatief
      ? [{ n: b.hamer + b.gestemd - b.initiatief, tint: "#566aa6", sleutel: "h", kleur: "zacht" }, { n: b.initiatief, tint: "#d08a55", sleutel: "g" }]
      : [{ n: b.hamer, tint: "#6fbf8e", sleutel: "h" }, { n: b.gestemd, tint: "#e0915a", sleutel: "g" }]);
    labels.push({ x: rond(X0 + j * KOL + KOL / 2), y: BODEM + 26, tekst: b.naam, anchor: "middle" });
  });
  kolom(BAKKEN.length, [{ n: t.zonder, tint: "#566aa6", sleutel: "z", kleur: "zacht" }]);
  labels.push({ x: rond(X0 + BAKKEN.length * KOL + KOL / 2), y: BODEM + 26, tekst: "geen besluit", anchor: "middle", zacht: true });
  if (initiatief) labels.push({ x: 0, y: 500, tekst: "● initiatiefwet van Kamerleden", tint: "#d08a55", groot: true },
    { x: 290, y: 500, tekst: `● wet van de regering · een stip is ${per} wetsvoorstellen`, tint: "#8a96b8", groot: true });
  else labels.push({ x: 0, y: 500, tekst: "● hamerstuk", tint: "#6fbf8e", groot: true }, { x: 170, y: 500, tekst: "● gestemd", tint: "#e0915a", groot: true },
    { x: 310, y: 500, tekst: `● geen besluit · een stip is ${per} wetsvoorstellen`, tint: "#8a96b8", groot: true });
  return { datum: "alle wetsvoorstellen", tekst: "", stippen, labels };
}

export { maandJaar };
