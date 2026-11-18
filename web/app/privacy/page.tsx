// Privacyverklaring (E7-S4). Tekst goedgekeurd door Niels op 29 oktober 2026 (S6), met de snelle vraag en het delen
// van de uitslag van Stemgenoten erbij. Bereikbaar via de footer; niet in het menu en niet in de zoekmachines.
import type { Metadata } from "next";
import { Inhoud } from "@/components/Kader";
import { HeroKop, Label, SectieKop, Tekst } from "@/components/Typografie";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy", robots: { index: false, follow: false } };

export default function Privacy() {
  const sectie = { display: "flex", flexDirection: "column" as const, gap: "var(--r-4)" };
  return (
    <Inhoud licht>
      <section style={sectie}>
        <Label>Privacy</Label>
        <HeroKop>Welke gegevens verwerkt Zetelen?</HeroKop>
        <Tekst>
          Zetelen heeft geen accounts en plaatst geen cookies. Zetelen bewaart geen opvattingen van bezoekers, behalve wat je
          zelf invult in de vragenlijst of bij de snelle vraag onderaan een pagina. Wat je kiest in de
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
        <Tekst>
          Klik je op een link in een bericht van Zetelen op sociale media, dan staat er een korte code in die link, zoals
          bs-12. Zetelen telt dan dat er via dat bericht is geklikt, en een keer of je daarna verder kijkt op de site.
          Bewaard worden alleen het tijdstip, die code, de grafiek, het soort apparaat (mobiel, tablet of desktop) en het
          land. Geen IP-adres, geen browsergegevens, geen cookie. Na 12 maanden wordt het automatisch verwijderd.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Feedback</SectieKop>
        <Tekst>
          In de testperiode staat er een eigen vragenlijst op de site. Je antwoorden gaan naar de database van Zetelen, niet
          naar een andere dienst. Zetelen slaat alleen je antwoorden en het tijdstip op: geen naam, geen IP-adres, geen
          browsergegevens. Een e-mailadres alleen als je dat zelf invult, en dan alleen om je te kunnen antwoorden. Alleen
          de maker kan de antwoorden lezen. Na 12 maanden worden ze automatisch verwijderd. Invullen is vrijwillig.
        </Tekst>
        <Tekst>
          Onderaan elke pagina staat ook een snelle vraag: was deze pagina duidelijk? Je antwoord (ja, een beetje of nee), een
          toelichting als je die invult, het adres van de pagina en het tijdstip gaan naar dezelfde database. Geen
          e-mailadres, geen naam, geen IP-adres. Ook dit wordt na 12 maanden automatisch verwijderd.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Stemgenoten</SectieKop>
        <Tekst>
          Bij Stemgenoten geef je je mening over echte stemmingen. Een politieke mening is een bijzonder persoonsgegeven, dus
          die blijft bij jou: de uitslag wordt in je eigen browser berekend. Je antwoorden worden niet verstuurd, niet opgeslagen
          en niet gemeten. Sluit je de pagina, dan zijn ze weg.
        </Tekst>
        <Tekst>
          Deel je je uitslag als link, dan staan alleen de percentages per partij in die link, en hoeveel stellingen je
          beantwoordde. Je antwoorden zelf staan er niet in. Wie de link opent, ziet die percentages.
        </Tekst>
      </section>
      <section style={sectie}>
        <SectieKop>Kamerleden</SectieKop>
        {/* Beleid bij een verwijderverzoek: akkoord Niels, K21, 16 november 2026 */}
        <Tekst>
          Van Kamerleden gebruikt Zetelen alleen naam, fractie en stemgedrag uit de open data van de Tweede Kamer. Geen
          geboortedatum, woonplaats, nevenfuncties of andere persoonsgegevens.
        </Tekst>
        <Tekst>
          <strong>Waarom ze blijven staan.</strong> Hoe een Kamerlid stemt, is openbaar en hoort bij het ambt. Zetelen verwerkt
          het om te laten zien hoe er in de Kamer gestemd wordt; dat is een gerechtvaardigd belang (artikel 6, lid 1f van de
          AVG). Een verzoek om stemgedrag of de naam bij een stemming weg te halen, wijs ik daarom in de regel af: bij openbaar
          stemgedrag weegt de openbaarheid zwaar. Ik leg dan uit waarom. Dat geldt ook voor oud-Kamerleden.
        </Tekst>
        <Tekst>
          <strong>Wat je wel kunt vragen.</strong> Klopt een gegeven niet, bijvoorbeeld een stem, een fractie of een naam, dan
          herstel ik het binnen 5 werkdagen en meld ik dat in het wijzigingslog. Komt de fout uit de open data van de Kamer,
          dan meld ik hem ook daar. Je kunt ook bezwaar maken vanwege je eigen situatie. Dan stop ik met de verwerking, tenzij
          ik dwingende redenen kan aantonen die zwaarder wegen dan jouw belangen, zoals de openbaarheid van stemgedrag. Je
          krijgt daarover een gemotiveerd bericht.
        </Tekst>
        <Tekst>
          <strong>Hoe snel.</strong> Je krijgt binnen 5 werkdagen een reactie en binnen een maand een besluit, zoals de AVG
          vraagt. Niet eens met het besluit? Dan kun je een klacht indienen bij de{" "}
          <a href="https://autoriteitpersoonsgegevens.nl">Autoriteit Persoonsgegevens</a>.
        </Tekst>
        <Tekst>
          Vragen of een verzoek? Mail <a href={`mailto:${SITE.contact}`}>{SITE.contact}</a>.
        </Tekst>
      </section>
    </Inhoud>
  );
}
