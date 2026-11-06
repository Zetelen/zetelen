# Component: methodiek-betrouwbaarheid

Status: in bouw (26 oktober 2026). Gebouwd: methodiekpagina met de maten cohesie, onderwerpen, coalitie en zetelwerk, bron en verversing bij elke grafiek, wijzigingslog, privacyverklaring als concept, gebruiksvoorwaarden gevonden (CC0). Open: reactietermijn (E7-S2), privacytekst beoordelen, keuze analytics
Eerst lezen: `_conventies.md`, `_overzicht.md`, `../05-techniek.md`, `site-shell.md`

## Doel

De pagina's en voorzieningen waarmee bezoekers en betrokkenen de cijfers kunnen beoordelen en fouten kunnen melden: methodiekpagina, bronvermelding, foutmeldroute, wijzigingslog en privacyverklaring.

## Laag

Frontend (met inhoud van Niels)

## Interface

Biedt:
- Een methodiekpagina met per maat definitie, formule in woorden, bron en beperking
- Bronvermelding en verversingsdatum per cijfer of grafiek
- Een foutmeldroute en een publiek wijzigingslog
- Een privacyverklaring

Verwacht: definities uit `cohesie-analyse`, de paginastructuur van `site-shell`.

## Afhankelijkheden

`site-shell`, `cohesie-analyse` (voor de eerste definitie).

## Stories

**E3-S3 Methodiekpagina.** Als bezoeker wil ik per maat de definitie en bron zien.
- Elke maat die op de site staat heeft een definitie, formule in woorden, bron en beperking
- De pagina groeit mee: nieuwe analyses voegen hier een sectie toe voordat ze live gaan

**E7-S1 Bronvermelding per cijfer.** Als bezoeker wil ik zien waar een cijfer vandaan komt.
- Elk cijfer en elke grafiek heeft een bron en een datum van laatste verversing

**E7-S2 Foutmelding.** Als betrokkene of bezoeker wil ik een fout kunnen melden.
- Er is een duidelijke route (adres of formulier, door Niels te kiezen) op de over-de-maker-pagina
- Een melding wordt binnen een door Niels te bepalen termijn beantwoord

**E7-S3 Wijzigingslog.** Als bezoeker wil ik zien wat er gecorrigeerd is.
- Een publieke lijst met datum en beschrijving van elke inhoudelijke correctie

**E7-S4 Privacy en voorwaarden.** Als bezoeker wil ik weten welke gegevens de site verwerkt.
- Een korte privacyverklaring beschrijft analytics en dat er geen accounts en geen opgeslagen opvattingen zijn
- De gebruiksvoorwaarden van de open data zijn gevonden en nageleefd

## Testen

- Elke maat op de site heeft een sectie op de methodiekpagina (een test vergelijkt de lijst)
- Elke grafiek toont bron en datum
- Stuur een testmelding via de foutmeldroute: die komt aan
- Het wijzigingslog toont een testcorrectie met datum
- De privacyverklaring noemt wat de analytics doet

## Aandachtspunten

- De gebruiksvoorwaarden van de Tweede Kamer open data zijn nog niet gevonden of vastgelegd. Dit is nodig voor de eerste live-gang. Zoek ze op (portaal opendata.tweedekamer.nl en de veelgestelde vragen) en leg ze vast voordat de bronvermelding wordt ingericht
- Het adres voor de foutmeldroute is een keuze van Niels. Gebruik niet een persoonlijk adres uit een andere bron
- Een privacyverklaring geeft geen juridisch advies; laat Niels de tekst beoordelen of juridisch toetsen

## Gebouwd (24 oktober 2026)

- `/methodiek`: per maat definitie, formule in woorden, keuzes en beperkingen (`web/lib/maten.ts`; nu alleen cohesie, tekst uit de goedgekeurde `../definitie-cohesie.md`), plus de bron, de licentie en de controles. Een test controleert dat elke maat compleet is
- Bron en "laatst ververst" bij elke grafiek (E7-S1): verkenner, fractiepagina en coalitiebouwer (`web/components/cohesie/Bronregel.tsx`)
- `/wijzigingen`: publiek wijzigingslog uit `web/content/wijzigingen.json` (nu leeg). Een test controleert dat een testcorrectie met datum bovenaan komt. Op "Over" staat de zin over het wijzigingslog weer (die was weggehaald tot het log er was)
- `/privacy`: CONCEPT, niet in het menu: geen accounts, geen cookies, geen opgeslagen opvattingen, hosting bij Vercel, van Kamerleden alleen naam, fractie en stemgedrag. Bezoekersstatistieken nog niet gekozen. Niet juridisch getoetst
- Foutmeldroute (E7-S2): mail niels@datavizd.io of GitHub Issues, op Over, in de voet en op de methodiek. De reactietermijn bepaalt Niels

Gebruiksvoorwaarden van de open data (gevonden 24 oktober 2026, https://opendata.tweedekamer.nl/disclaimer): CC0 1.0, vrij te gebruiken en te bewerken, ook commercieel, zonder toestemming; bronvermelding niet verplicht (Zetelen vermeldt de bron toch); de Tweede Kamer sluit aansprakelijkheid uit, garandeert geen foutloze data, en gebruik betekent niet dat zij het goedkeurt. Dat laatste staat op de methodiekpagina. Over foto's zegt de disclaimer niets (van belang voor R3).

Afwijking van de mapindeling: teksten die de site gebruikt staan in `web/content/`, niet in `content/` in de hoofdmap, omdat de site geen bestanden buiten `web/` kan importeren.

## Schatting

Middel, ca. 6 tot 10 uur van Niels (veel inhoud en keuzes). Grove schatting, niet gemeten.
