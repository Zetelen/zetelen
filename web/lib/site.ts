// Vaste gegevens van de site. LIVE blijft false tot de livegang (R1): tot dan niet indexeren.
export const SITE = {
  naam: "Zetelen",
  maker: "Niels Stol",
  contact: "niels@datavizd.io",
  broncode: "https://github.com/Zetelen/zetelen",
  bron: "https://opendata.tweedekamer.nl",
  beschrijving: "Wie stemt met wie in de Tweede Kamer? Geteld uit de open data van de Tweede Kamer.",
};

export const LIVE = false;

// Conceptvlag voor de pagina Kamerleden (besluit Niels B1, 26 oktober 2026). Uit: de pagina geeft een 404 en alle
// links ernaartoe en de vermelding in de sitemap verdwijnen. Aan sinds B2 (ranglijst) en B3 (verwijderverzoek)
// besloten zijn; voor de livegang nog een keer nalopen.
export const KAMERLEDEN = true;

// Feedbackronde: een eigen formulier op /feedback (besluit Niels B13, 26 oktober 2026). Uit: geen balk.
export const FEEDBACK = true;

// Adres van de site: op Vercel het productieadres, lokaal localhost
export function siteUrl(): URL {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(host ? `https://${host}` : "http://localhost:3000");
}

// Publieke pagina's, voor de sitemap
export const PAGINAS = ["/", "/verkenner", "/onderwerpen", "/coalitie", "/oppositie", "/fracties", ...(KAMERLEDEN ? ["/kamerleden"] : []), "/methodiek", "/wijzigingen", "/over"];
