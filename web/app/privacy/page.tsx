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
        <Label>Privacy</Label>
        <HeroKop>Welke gegevens verwerkt Zetelen?</HeroKop>
        <Tekst>
          Zetelen heeft geen accounts en plaatst geen cookies. Opvattingen van bezoekers bewaren we niet, behalve wat je
          zelf invult in de vragenlijst. Wat je kiest in de
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
        <Tekst>
          Zetelen telt bezoeken met Vercel Web Analytics. Dat werkt zonder cookies en zonder je over websites heen te volgen.
          Geteld wordt welke pagina&apos;s bezocht worden, met land, browser en type apparaat. Er wordt geen profiel van je
          gemaakt, en een bezoek is na een dag niet meer aan een eerder bezoek te koppelen.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Feedback</SectieKop>
        <Tekst>
          In de testperiode staat er een eigen vragenlijst op de site. Je antwoorden gaan naar de database van Zetelen, niet
          naar een andere dienst. We slaan alleen je antwoorden en het tijdstip op: geen naam, geen IP-adres, geen
          browsergegevens. Een e-mailadres alleen als je dat zelf invult, en dan alleen om je te kunnen antwoorden. Alleen
          de maker kan de antwoorden lezen. Na 12 maanden worden ze automatisch verwijderd. Invullen is vrijwillig.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Stemgenoten</SectieKop>
        <Tekst>
          Bij Stemgenoten geef je je mening over echte stemmingen. Een politieke mening is een bijzonder persoonsgegeven, dus
          die blijft bij jou: de uitslag wordt in je eigen browser berekend. Je antwoorden worden niet verstuurd, niet opgeslagen
          en niet gemeten. Sluit je de pagina, dan zijn ze weg.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Kamerleden</SectieKop>
        <Tekst>
          Van Kamerleden gebruikt Zetelen alleen naam, fractie en stemgedrag uit de open data van de Tweede Kamer. Geen
          geboortedatum, woonplaats of andere persoonsgegevens. Het gaat om openbare stemmingen en stukken uit een openbare bron.
          Daarom blijven ze staan, ook als een Kamerlid vraagt ze weg te halen. Klopt er iets niet, dan herstellen we het
          binnen 5 werkdagen en melden we het in het wijzigingslog. Vragen of een verzoek? Mail{" "}
          <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
        </Tekst>
      </section>
    </Inhoud>
  );
}
