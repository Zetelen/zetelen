// Privacyverklaring (E7-S4). CONCEPT: Niels beoordeelt de tekst; de keuze voor analytics staat nog open.
// Niet in het menu en niet in de sitemap tot Niels akkoord geeft.
import type { Metadata } from "next";
import { Inhoud } from "@/components/Kader";
import { HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", robots: { index: false, follow: false } };

export default function Privacy() {
  const sectie = { display: "flex", flexDirection: "column" as const, gap: "var(--r-4)" };
  return (
    <Inhoud>
      <section style={sectie}>
        <Label>Privacy · concept</Label>
        <HeroKop>Welke gegevens verwerkt Zetelen?</HeroKop>
        <Tekst>
          Zetelen heeft geen accounts, bewaart geen opvattingen van bezoekers en plaatst geen cookies. Wat je kiest in de
          verkenner of de coalitiebouwer, staat alleen in de link in je browser.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Waar draait de site?</SectieKop>
        <Tekst>
          Bij Vercel. Zoals elke webserver verwerkt Vercel technische gegevens, zoals je IP-adres. Dat is nodig om de pagina
          te leveren en misbruik te voorkomen. Zetelen gebruikt die gegevens niet.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Bezoekersstatistieken</SectieKop>
        <Tekst>Nog niet gekozen. We vullen deze tekst aan voordat we statistieken bijhouden.</Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Feedback</SectieKop>
        <Tekst>
          In de testperiode staat er een link naar een vragenlijst bij een externe dienst. Wat je daar invult, verwerkt die
          dienst. Zetelen gebruikt de antwoorden alleen om de site te verbeteren en vraagt niet om je naam. Invullen is
          vrijwillig. {/* Niels: naam van de dienst en bewaartermijn aanvullen zodra het formulier er is */}
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Kamerleden</SectieKop>
        <Tekst>
          Van Kamerleden gebruikt Zetelen alleen naam, fractie en stemgedrag uit de open data van de Tweede Kamer. Geen
          geboortedatum, woonplaats of andere persoonsgegevens. Vragen of een verzoek? Mail{" "}
          <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
        </Tekst>
      </section>
    </Inhoud>
  );
}
