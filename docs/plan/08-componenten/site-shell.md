# Component: site-shell

Status: gebouwd en getest (24 oktober 2026), online op https://zetelen.vercel.app (niet geindexeerd tot de livegang). Sinds 25 en 26 oktober 2026 is de voorpagina een scrollverhaal in vijf hoofdstukken met tegels naar de tools; menu in de volgorde van het verhaal, ook op de telefoon. Open: beoordeling van het verhaal door Niels
Eerst lezen: `_conventies.md`, `_overzicht.md`, `../05-techniek.md`, `ontwerpsysteem.md`

## Doel

De basis van de Next.js-site: navigatie, voorpagina, over-de-maker-pagina, delen en zoekmachines, en lege- en foutstaten.

## Laag

Frontend

## Interface

Biedt:
- Paginastructuur en navigatie
- De voorpagina met een doorklik naar de verkenner
- Een over-de-maker-pagina
- Standaard titel, beschrijving en deelafbeelding per pagina, en een sitemap
- Een standaard lege staat en foutstaat

Verwacht: de tokens en basiscomponenten van `ontwerpsysteem`, de "laatst bijgewerkt"-datum van `bewaking` (view `api.laatst_bijgewerkt`, kolom `laatst_bijgewerkt`, via de Data API met de publieke sleutel; zie `rechten.md`).

## Afhankelijkheden

`ontwerpsysteem`. Voor de "laatst bijgewerkt"-datum: `bewaking` (kan met een tijdelijke waarde starten).

## Stories

**E3-S1 Voorpagina.** Als bezoeker wil ik een korte verhalende voorpagina met een eerste vondst en een doorklik naar de verkenner.
- De voorpagina bevat minstens een door Niels goedgekeurde conclusie met bron
- Een "laatst bijgewerkt"-datum staat zichtbaar
- Overgenomen van `rechten` (E1-S6): een test op de gebouwde frontend zoekt naar de `service_role`- of secret-sleutel en naar alles wat op een geheim lijkt, en faalt als er iets gevonden wordt
- Een link naar de cohesie-verkenner en naar de methodiekpagina

**E3-S4 Delen en zoekmachines.** Elke publieke pagina kan gedeeld worden en is vindbaar.
- Elke publieke pagina heeft een eigen URL, titel, beschrijving en voorbeeldafbeelding voor delen
- Er is een sitemap

**E3-S7 Over de maker.** Als bezoeker wil ik weten wie de site maakt.
- Een pagina toont de maker onder eigen naam, het doel van de site, en hoe fouten gemeld worden

**E3-S9 Lege en foutstaten.** Als bezoeker wil ik een duidelijke melding als er niets te tonen is of iets misgaat.
- Een periode of fractie zonder data toont een uitleg en geen lege grafiek
- Als de database onbereikbaar is, toont de site de laatst bekende goede versie (indien beschikbaar) of een nette foutpagina

## Testen

- Controleer per pagina titel, beschrijving en deelafbeelding
- Open een periode zonder data: er staat een uitleg
- Zet de database tijdelijk uit (in een testomgeving): de site toont de foutpagina of de laatste goede versie
- De sitemap bevat alle publieke pagina's

## Aandachtspunten

- De inhoud van de voorpagina (de eerste conclusie) bestaat pas als de cohesie-analyse draait en Niels hem heeft goedgekeurd; bouw eerst het raamwerk
- Over-de-maker bevat alleen wat Niels wil publiceren; neem geen persoonlijke gegevens over uit andere bronnen

## Gebouwd (24 oktober 2026)

Keuzes (akkoord Niels, 24 oktober 2026): statisch gebouwd en elk uur ververst (ISR), zodat de site de laatste goede versie toont als de database weg is; de cijfers met gewone verzoeken aan de Data API op de server, zonder Supabase-bibliotheek; in het menu alleen pagina's die bestaan; Vercel gekoppeld met "niet indexeren" tot de livegang (`LIVE` in `web/lib/site.ts`).

- `web/components/Kader.tsx`, `Navigatie.tsx`: navigatie (met link naar de inhoud), voet (maker Niels Stol, bron, laatst ververst, contact niels@datavizd.io en GitHub Issues, broncode), lege staat en foutstaat
- `web/app/page.tsx` (voorpagina met plek voor de zaal), `web/app/over/page.tsx` (tekst goedgekeurd door Niels; de zin over het wijzigingslog komt terug met `methodiek-betrouwbaarheid`), `not-found.tsx`, `error.tsx`
- `web/app/robots.ts`, `sitemap.ts`, `opengraph-image.tsx` (standaard deelafbeelding in het eigen palet), titel en beschrijving per pagina
- `web/lib/api.ts`: lezen uit `api` (onder meer `api.laatst_bijgewerkt`); vergevingsgezind voor spaties en `/rest/v1` in de instelling
- `web/scripts/controleer-build.mjs`: buildcontrole (E1-S6, overgenomen van `rechten`), in de CI: geen secret-sleutel, geen `service_role`, geen connectiestring met wachtwoord, en de publieke sleutel niet in de browsercode

## Getest (24 oktober 2026)

- 28 Vitest-tests (onder meer datumnotatie, en "onbekend" als de API onbereikbaar is), typecheck, build en buildcontrole, lokaal en in CI
- Lokaal in de browser: voorpagina, Over, 404, robots.txt
- Online: `/`, `/over`, `/sitemap.xml`, `/opengraph-image` geven 200, een onbekende pagina 404, robots.txt sluit alles uit, meta "noindex, nofollow", "Laatst ververst: 24 oktober 2026 om 10:55"
- Gevonden en opgelost: de waarden in Vercel kwamen eerst niet goed aan (datum "onbekend"); na opnieuw invoeren en een redeploy wel
- Niet getest: de database tijdelijk uitzetten om de laatste goede versie te zien (vraagt een testomgeving); het mechanisme is ISR van Next.js

## Schatting

Middel, ca. 8 tot 14 uur van Niels. Grove schatting, niet gemeten.
