// Klikteller voor social (migratie 029, besluit Niels K17, 2 november 2026). Een link in een post draagt
// ?via=<kanaal>-<issuenummer>; de deellink meldt de klik en de pagina waar de bezoeker landt meldt een keer of die
// verder kijkt. Hier de controles die zowel de browser als de server gebruiken.

// bs = Bluesky, li = LinkedIn, ma = Mastodon; het nummer is het issue in de wachtrij (Zetelen/zetelen-social)
export const VIA = /^(bs|li|ma)-\d{1,6}$/;

export function schoneVia(v: unknown): string | null {
  return typeof v === "string" && VIA.test(v) ? v : null;
}

// Alleen de grove soort apparaat; de user agent zelf wordt nergens bewaard
export function apparaatVan(ua: string | null | undefined): "mobiel" | "tablet" | "desktop" | null {
  if (!ua) return null;
  if (/iPad|Tablet|Android(?!.*Mobile)/i.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android/i.test(ua)) return "mobiel";
  return "desktop";
}

// Het doel van een deellink met de via-code erbij, voor het hekje
export function metVia(doel: string, via: string | null): string {
  if (!via) return doel;
  const [pad, hekje] = doel.split("#", 2);
  const sep = pad.includes("?") ? "&" : "?";
  return `${pad}${sep}via=${via}${hekje !== undefined ? `#${hekje}` : ""}`;
}

// Meldt een klik of een blijver. sendBeacon overleeft het doorsturen naar een andere pagina; mislukt het, dan niets.
export function meld(soort: "klik" | "blijft", via: string, grafiek?: string): void {
  try {
    const body = new Blob([JSON.stringify({ soort, via, grafiek })], { type: "application/json" });
    navigator.sendBeacon?.("/api/klik", body);
  } catch {
    // tellen is nooit belangrijker dan doorsturen
  }
}
