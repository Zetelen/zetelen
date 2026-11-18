// Het hoofdmenu in drie groepen, elk onderdeel met één regel uitleg (feedback van bezoekers, K11, 27 oktober 2026):
// uit het menu viel niet te raden wat er achter een pagina zit.
export type MenuItem = { href: string; tekst: string; regel: string };
export type MenuGroep = { naam: string; items: MenuItem[] };

// Sinds de ontwerpronde fase B (18 november 2026, punt 2): Actueel eerst (aanname: wie via Bluesky of LinkedIn komt,
// zoekt eerst een verhaal); daarna het gereedschap; Methodiek en Over staan nu ook in het menu. De adressen veranderen niet.
export const MENU: MenuGroep[] = [
  {
    naam: "Actueel",
    items: [
      { href: "/actueel", tekst: "Stukken", regel: "Het nieuws naast de stemmingen: wat de Kamer tot nu toe deed." },
      { href: "/uitgelicht", tekst: "Uitgelicht", regel: "Stemmingen van dichtbij: wie stemde wat, en hoe krap was het." },
    ],
  },
  {
    naam: "Zoek zelf",
    items: [
      { href: "/verkenner", tekst: "Wie stemt met wie", regel: "Hoe vaak twee fracties dezelfde kant kozen, per kabinet en door de jaren." },
      { href: "/onderwerpen", tekst: "Per onderwerp", regel: "Waar fracties het eens en oneens zijn, per beleidsterrein." },
      { href: "/coalitie", tekst: "Coalitie", regel: "Stel een groep fracties samen en zie of die een meerderheid haalde." },
      { href: "/stemgenoten", tekst: "Stemgenoten", regel: "Kies je kant bij echte stemmingen en zie welke fracties net zo stemden." },
      { href: "/oppositie", tekst: "Oppositie", regel: "Wat kun je als je niet regeert? Moties en amendementen sinds 2010." },
    ],
  },
  {
    naam: "De Kamer", // was "Wie zit er" (K14, 28 oktober 2026)
    items: [
      { href: "/fracties", tekst: "Fracties", regel: "Alle fracties sinds 2010, met hun zetels en met wie ze meestemden." },
      { href: "/kamerleden", tekst: "Kamerleden", regel: "Wat Kamerleden zelf indienen, en wat het haalt." },
      { href: "/methodiek", tekst: "Methodiek", regel: "Hoe Zetelen telt: de keuzes en de beperkingen." },
      { href: "/over", tekst: "Over Zetelen", regel: "Wie Zetelen maakt, waar de cijfers vandaan komen en wat je doet als er iets niet klopt." },
    ],
  },
];

// Is dit menu-item de huidige pagina (of een pagina eronder)?
export const isHier = (pad: string, href: string) => pad === href || pad.startsWith(`${href}/`);
