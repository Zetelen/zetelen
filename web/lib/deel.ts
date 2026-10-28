// Delen per grafiek (verzoek Niels, 28 oktober 2026): elke grafiek heeft een eigen deellink /deel/<grafiek>, met een
// eigen voorbeeldplaatje voor WhatsApp, LinkedIn en X. Die platforms negeren alles na een #, dus een link naar de pagina
// zelf kan maar één plaatje per pagina hebben. Wie op de deellink klikt, gaat door naar de grafiek op de site, met
// dezelfde keuzes (partij, periode) als degene die deelde. De keuzes worden gecontroleerd in lib/deelSchoon.ts.
type Zoek = Record<string, string | string[] | undefined> | URLSearchParams;
type Waarden = Record<string, string>;

export const BRON = "Bron: Zetelen.nl";

type Definitie = {
  pad: string | ((w: Waarden) => string);
  anker: string | ((w: Waarden) => string);
  titel: (w: Waarden) => string;
  parameters: string[];
  doorgeven?: boolean; // de keuzes gaan mee naar de pagina (standaard ja; bij Stemgenoten niet, daar kiest de bezoeker zelf)
  plaatje?: string; // een bestaand plaatje, anders /deel/<grafiek>/plaatje
};

const periodeTekst = (w: Waarden) => (w.periode ? (w.soort === "kamerperiode" ? ` (Kamer ${w.periode})` : ` (kabinet-${w.periode})`) : "");
const stukWoord = (w: Waarden) => (w.stuk === "Amendement" ? "amendementen" : w.stuk === "Wetsvoorstel" ? "initiatiefwetten" : "moties");

export const GRAFIEKEN = {
  verkenner: {
    pad: "/verkenner", anker: "zaal", parameters: ["soort", "periode", "variant", "fractie"],
    titel: (w) => `Met wie stemt ${w.fractie ?? "een partij"} het vaakst mee?${periodeTekst(w)}`,
  },
  trend: {
    pad: "/verkenner", anker: "door-de-jaren", parameters: ["soort", "periode", "variant", "fractie", "met"],
    titel: (w) => (w.fractie && w.met ? `Hoe vaak stemden ${w.fractie} en ${w.met} hetzelfde, sinds 2010?` : "Hoe vaak stemden twee partijen hetzelfde, sinds 2010?"),
  },
  "vvd-en-pro": { pad: "/uitgelicht/vvd-en-pro", anker: "ranglijst", parameters: [], titel: () => "Hoe vaak stemmen VVD en PRO hetzelfde?" },
  "brede-steun": { pad: "/", anker: "brede-steun", parameters: [], titel: () => "Hoe vaak stemmen kabinet en oppositie samen?" },
  stemgenoten: {
    pad: "/stemgenoten", anker: "", parameters: ["u", "b", "n"], doorgeven: false,
    titel: (w) => (w.u ? "Mijn stemgenoten in de Tweede Kamer" : "Met welke partij stem jij het vaakst mee?"),
  },
  onderwerpen: {
    pad: "/onderwerpen", anker: (w) => (w.met ? "vergelijking" : "zelf"), parameters: ["soort", "periode", "variant", "fractie", "met"],
    titel: (w) => (w.fractie && w.met ? `Waarover zijn ${w.fractie} en ${w.met} het eens?${periodeTekst(w)}` : `Waarover is ${w.fractie ?? "een partij"} het eens met de anderen?${periodeTekst(w)}`),
  },
  stemming: {
    pad: (w) => `/uitgelicht/${w.casus ?? ""}`, anker: "stemming", parameters: ["casus"], titel: () => "Eén stemming van dichtbij",
  },
  coalitie: {
    pad: "/coalitie", anker: "bouwer", parameters: ["soort", "periode", "variant", "groep"], plaatje: "/coalitie/plaatje",
    titel: (w) => (w.groep ? `${w.groep.split(",").join(" + ")}: halen ze samen een meerderheid?` : "Welke partijen halen samen een meerderheid?"),
  },
  kamerleden: {
    pad: "/kamerleden", anker: "fracties", parameters: ["soort", "periode", "stuk"],
    titel: (w) => `Hoeveel ${stukWoord(w)} dienden de partijen in, en wat werd aangenomen?${periodeTekst(w)}`,
  },
  ranglijst: {
    pad: "/kamerleden", anker: "ranglijst", parameters: ["soort", "periode", "stuk", "rol"],
    titel: (w) => `Wie krijgt het vaakst iets aangenomen?${periodeTekst(w)}`,
  },
  "oppositie-jaren": { pad: "/oppositie", anker: "moties-per-jaar", parameters: [], titel: () => "Steeds meer moties" },
  "oppositie-kabinetten": {
    pad: "/oppositie", anker: (w) => (w.stuk === "Amendement" ? "amendementen" : "per-kabinet"), parameters: ["stuk"],
    titel: (w) => (w.stuk === "Amendement" ? "Hoeveel amendementen van de oppositie werden aangenomen?" : "Hoeveel moties van de oppositie werden aangenomen?"),
  },
  "oppositie-spreiding": { pad: "/oppositie", anker: "tegenstemmen", parameters: [], titel: () => "Tegenstemmen en zelf iets binnenhalen" },
  ontraden: { pad: "/uitgelicht/tegen-het-advies-in", anker: "oordeel", parameters: [], titel: () => "Moties die het kabinet ontraadde" },
  wetten: { pad: "/uitgelicht/hoe-lang-duurt-een-wet", anker: "reizen", parameters: [], titel: () => "Hoe lang duurt een wet?" },
} satisfies Record<string, Definitie>;

export type Grafiek = keyof typeof GRAFIEKEN;
const def = (g: Grafiek): Definitie => GRAFIEKEN[g];

export const isGrafiek = (g: string): g is Grafiek => Object.prototype.hasOwnProperty.call(GRAFIEKEN, g);

const waarde = (zoek: Zoek, k: string) => {
  const w = zoek instanceof URLSearchParams ? zoek.get(k) : zoek[k];
  return (Array.isArray(w) ? w[0] : w) || undefined;
};

// Alleen de parameters die bij de grafiek horen gaan mee, in vaste volgorde; de rest (bijvoorbeeld utm-codes) niet
export function waardenVan(g: Grafiek, zoek: Zoek): Waarden {
  const uit: Waarden = {};
  for (const k of def(g).parameters) {
    const w = waarde(zoek, k);
    if (w) uit[k] = w;
  }
  return uit;
}
export const zoekVan = (g: Grafiek, zoek: Zoek) => new URLSearchParams(waardenVan(g, zoek)).toString();

const metZoek = (pad: string, q: string) => (q ? `${pad}?${q}` : pad);

// Waar de bezoeker heen gaat: de grafiek op de site
export function doelVan(g: Grafiek, zoek: Zoek): string {
  const d = def(g), w = waardenVan(g, zoek);
  const pad = typeof d.pad === "function" ? d.pad(w) : d.pad;
  const anker = typeof d.anker === "function" ? d.anker(w) : d.anker;
  const q = d.doorgeven === false ? "" : zoekVan(g, zoek);
  return `${metZoek(pad, q)}${anker ? `#${anker}` : ""}`;
}
// De link die gedeeld wordt, en het plaatje dat erbij hoort
export const deellinkVan = (g: Grafiek, zoek: Zoek) => metZoek(`/deel/${g}`, zoekVan(g, zoek));
export const plaatjeVan = (g: Grafiek, zoek: Zoek) => metZoek(def(g).plaatje ?? `/deel/${g}/plaatje`, zoekVan(g, zoek));
// Titel bij het delen, met de keuzes uit de link
export const titelVan = (g: Grafiek, zoek: Zoek) => def(g).titel(waardenVan(g, zoek));

// Een geheel getal van hooguit drie cijfers binnen de grenzen
export const geheel = (v: string, min: number, max: number) => /^\d{1,3}$/.test(v) && Number(v) >= min && Number(v) <= max;

// Uitslag van Stemgenoten in de link: "PVV:62,VVD:58", hooguit twintig bestaande partijen met een percentage van 0 tot 100
export function schoneUitslag(v: string, partijen: Set<string>): string | null {
  const paren = v.split(",").slice(0, 20).map((p) => p.split(":"))
    .filter(([a, n]) => a && n !== undefined && partijen.has(a) && geheel(n, 0, 100));
  return paren.length ? paren.map(([a, n]) => `${a}:${Number(n)}`).join(",") : null;
}
