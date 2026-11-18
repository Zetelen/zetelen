# Component: coalitie-pagina

Status: gebouwd en live als concept (25 oktober 2026), op https://zetelen.vercel.app/coalitie, in het menu en de sitemap. Bediening als de verkenner, verdieping per partner, telefoonbalk, deelplaatje `/coalitie/plaatje`. Label concept tot de lezingen (E2-S10) en de nacontrole er zijn
Eerst lezen: `_conventies.md`, `_overzicht.md`, `ontwerpsysteem.md`, `cohesie-pagina.md`, `coalitie-analyse.md`

## Doel

De coalitiebouwer op de site: fracties aanklikken in de zaal, het totaal aan zetels zien, en zien bij welke fracties de groep in het verleden een meerderheid haalde.

## Laag

Frontend

## Interface

Biedt: een pagina met de zaal (hergebruikt uit `cohesie-pagina`), een keuzelijst van fracties, het totaal en het tekort of overschot ten opzichte van 76, en de rangorde van steunpartners. De keuze van fracties en periode staat in de URL.

Wijziging 13 november 2026 (K18 punt 3a, 3b en 3c):

- De keuze van fracties staat in eigen state van `CoalitieBouwer` en wordt daarna met `history.replaceState` in de URL gezet (zoals `Trend`, met het event `URL_GEWIJZIGD`). De URL wordt alleen gelezen bij binnenkomen en bij terug en vooruit (`popstate`). Een wissel van periode laadt de bouwer opnieuw (`key`). De groep in de vaste balk op de telefoon leest de adresbalk zelf (`GroepSamenvatting`).
- Nieuwe prop `snel` op `CoalitieBouwer`: snelkeuzes voor het huidige kabinet (zonder einde in `api.kabinet`). Kabinetspartijen uit `api.coalitie`; de drie partijen waarmee het kabinet eind oktober 2026 sprak (ChristenUnie, 50PLUS, Groep Markuszower) uit `web/content/actueel/kabinet-cu-50plus.json` (`groep`), want ze hebben geen rol in `api.coalitie`; de partij voor "zonder" uit `web/content/actueel/coalitie-verdeeld.json` (`buiten`). Elke snelkeuze heeft een deelknop met een eigen deellink (`/deel/coalitie?...&groep=...`).
- Bij een groep met een meerderheid: hoe vaak de groep verdeeld stemde (`verdeeldBinnen` en `gestemd` in `bereken`, `lib/coalitie.ts`) en per fractie de zetels zonder haar (`zonderElk`).

Verwacht: de gegevens uit `coalitie-analyse` en de zaal en tokens uit `cohesie-pagina` en `ontwerpsysteem`.

## Afhankelijkheden

`coalitie-analyse`, `cohesie-pagina`.

## Stories

**E2-S9 Coalitiebouwer in de zaal**: zie `../06-epics.md`.

## Testen

- Een gekozen combinatie in de URL geeft na herladen dezelfde weergave
- Met het toetsenbord volledig te bedienen; de zaal is niet de enige drager (lijst met knoppen en een tabel met steunpartners)
- Bekeken op telefoon en groot scherm

## Aandachtspunten

- De vaste uitlegtekst ("terugkijken, geen voorspelling of advies") staat zichtbaar bij de uitkomst
- Deelplaatjes (`deelplaatjes`) voor een gekozen combinatie zijn waarschijnlijk het meest gedeelde onderdeel van de site

## Gebouwd als concept (24 oktober 2026)

- `/coalitie`: periodekeuze, de zaal met omlijnde fractievakken (zelfde opbouw als de verkenner), klikken voegt een fractie toe aan de groep of haalt haar eruit, het totaal en het tekort of overschot ten opzichte van 76 in het midden, de rangorde van partners met meegestemd en beslissend, en de vaste tekst "terugkijken, geen voorspelling" boven de zaal
- Keuze in de URL: `soort`, `periode`, `groep` (afkortingen met komma's)
- Getest in een productiebuild: geen fouten in de console, toevoegen van een fractie werkt en zet de groep in de URL; online bereikbaar
- Niet gedaan: lezingen (E2-S10, component `lezingen`), deelplaatjes, opname in het menu

## Schatting

Middel, ca. 6 tot 12 uur van Niels. Grove schatting, niet gemeten.
