// Vaste gegevens van de site. LIVE blijft false tot de livegang (R1): tot dan niet indexeren.
export const SITE = {
  naam: "Zetelen",
  maker: "Niels Stol",
  contact: "niels@datavizd.io",
  broncode: "https://github.com/Zetelen/zetelen",
  bron: "https://opendata.tweedekamer.nl",
  beschrijving: "Hoe vaak stemmen fracties in de Tweede Kamer hetzelfde? Op basis van de open data van de Tweede Kamer.",
};

export const LIVE = false;

// Adres van de site: op Vercel het productieadres, lokaal localhost
export function siteUrl(): URL {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(host ? `https://${host}` : "http://localhost:3000");
}

// Publieke pagina's, voor de sitemap
export const PAGINAS = ["/", "/verkenner", "/fracties", "/coalitie", "/methodiek", "/wijzigingen", "/over"];
