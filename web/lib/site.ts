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

// Feedbackronde (besluit Niels, 25 oktober 2026): een vaste vragenlijst bij een externe dienst. Niels maakt het
// formulier; zolang het adres leeg is, toont de site geen feedbackknop.
export const FEEDBACK_URL = "";

// Adres van de site: op Vercel het productieadres, lokaal localhost
export function siteUrl(): URL {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(host ? `https://${host}` : "http://localhost:3000");
}

// Publieke pagina's, voor de sitemap
export const PAGINAS = ["/", "/verkenner", "/onderwerpen", "/coalitie", "/oppositie", "/fracties", "/kamerleden", "/methodiek", "/wijzigingen", "/over"];
