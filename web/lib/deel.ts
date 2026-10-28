// Delen per grafiek (verzoek Niels, 28 oktober 2026): elke grafiek heeft een eigen deellink /deel/<grafiek>, met een
// eigen voorbeeldplaatje voor WhatsApp, LinkedIn en X. Die platforms negeren alles na een #, dus een link naar de pagina
// zelf kan maar één plaatje per pagina hebben. Wie op de deellink klikt, gaat door naar de grafiek op de site, met
// dezelfde keuzes (partij, periode) als degene die deelde.
export type Grafiek = "verkenner" | "vvd-en-pro" | "brede-steun";
type Zoek = Record<string, string | string[] | undefined> | URLSearchParams;

export const BRON = "Bron: Zetelen.nl";

export const GRAFIEKEN: Record<Grafiek, { pad: string; anker: string; titel: string; parameters: string[] }> = {
  verkenner: { pad: "/verkenner", anker: "zaal", titel: "Met wie stemt een partij het vaakst mee?", parameters: ["soort", "periode", "variant", "fractie"] },
  "vvd-en-pro": { pad: "/uitgelicht/vvd-en-pro", anker: "ranglijst", titel: "Hoe vaak stemmen VVD en PRO hetzelfde?", parameters: [] },
  "brede-steun": { pad: "/", anker: "brede-steun", titel: "Hoe vaak stemmen kabinet en oppositie samen?", parameters: [] },
};

export const isGrafiek = (g: string): g is Grafiek => Object.prototype.hasOwnProperty.call(GRAFIEKEN, g);

const waarde = (zoek: Zoek, k: string) => {
  const w = zoek instanceof URLSearchParams ? zoek.get(k) : zoek[k];
  return (Array.isArray(w) ? w[0] : w) || undefined;
};

// Alleen de parameters die bij de grafiek horen gaan mee, in vaste volgorde; de rest (bijvoorbeeld utm-codes) niet
export function zoekVan(g: Grafiek, zoek: Zoek): string {
  const q = new URLSearchParams();
  for (const k of GRAFIEKEN[g].parameters) {
    const w = waarde(zoek, k);
    if (w) q.set(k, w);
  }
  return q.toString();
}

const metZoek = (pad: string, q: string) => (q ? `${pad}?${q}` : pad);

// Waar de bezoeker heen gaat: de grafiek op de site
export const doelVan = (g: Grafiek, zoek: Zoek) => `${metZoek(GRAFIEKEN[g].pad, zoekVan(g, zoek))}#${GRAFIEKEN[g].anker}`;
// De link die gedeeld wordt, en het plaatje dat erbij hoort
export const deellinkVan = (g: Grafiek, zoek: Zoek) => metZoek(`/deel/${g}`, zoekVan(g, zoek));
export const plaatjeVan = (g: Grafiek, zoek: Zoek) => metZoek(`/deel/${g}/plaatje`, zoekVan(g, zoek));

// Titel bij het delen; bij de verkenner met de gekozen partij en periode als die in de link staan
export function titelVan(g: Grafiek, zoek: Zoek): string {
  if (g === "verkenner") {
    const f = waarde(zoek, "fractie"), p = waarde(zoek, "periode");
    const wanneer = p ? (waarde(zoek, "soort") === "kamerperiode" ? ` (Kamer ${p})` : ` (kabinet-${p})`) : "";
    return f ? `Met wie stemt ${f} het vaakst mee?${wanneer}` : `${GRAFIEKEN[g].titel}${wanneer}`;
  }
  return GRAFIEKEN[g].titel;
}
