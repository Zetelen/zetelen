import type { NextConfig } from "next";

const config: NextConfig = {
  // Geen "Powered by Next.js"-kop in de antwoorden
  poweredByHeader: false,
  // Verhuisde pagina's: permanent (308), zodat links en signalen meegaan (SEO-audit 26 oktober)
  async redirects() {
    return [
      // Het verhaal staat sinds 25 oktober 2026 op de voorpagina
      { source: "/verhaal", destination: "/", permanent: true },
      // Graphic 2 staat sinds 25 oktober 2026 op /onderwerpen
      { source: "/verhaal/stemming", destination: "/onderwerpen#een-stemming", permanent: true },
      // De proefpagina met lezingen is op 26 oktober 2026 opgeheven (B4); de lezingen staan bij de tools
      { source: "/lezingen", destination: "/", permanent: true },
      // Het Vercel-adres van productie wijst naar het eigen domein; previews hebben een ander adres en blijven werken
      { source: "/:pad*", has: [{ type: "host", value: "zetelen.vercel.app" }], destination: "https://zetelen.nl/:pad*", permanent: true },
    ];
  },
};

export default config;
