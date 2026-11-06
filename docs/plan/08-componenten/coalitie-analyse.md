# Component: coalitie-analyse

Status: gebouwd en live als concept (25 oktober 2026). Definitie goedgekeurd door Niels op 25 oktober 2026: standaard alleen verdeelde stemmingen met een schakelaar, zetels bij hoofdelijk de leden die stemden, rangorde beslissend en dan meegestemd, drempel 25. Migratie 017 (besluiten in de stemmatrix). Open: de lezingen (E2-S10) en de nacontrole van een steekproef
Eerst lezen: `_conventies.md`, `_overzicht.md`, `../05-techniek.md`, `../definitie-cohesie.md`, `cohesie-analyse.md`

## Doel

De definitie en de berekening achter de coalitiebouwer: voor een zelf gekozen groep fracties en een periode, hoe vaak de groep eensgezind stemde, hoe vaak ze daarbij een meerderheid had, en bij welke andere fracties ze die meerderheid haalde.

## Laag

Backend (SQL), met een keuze over waar de berekening draait (zie Aandachtspunten)

## Interface

Biedt: per periode de gegevens waarmee de site voor elke combinatie van fracties de uitkomst kan tonen, publiek via schema `api`. Verwacht: `analyses.fractie_besluit_stem` (stem per fractie per besluit, inclusief afgeleid bij hoofdelijk) en de fractiegrootte per stemming uit `core.fractiestem`.

## Afhankelijkheden

`cohesie-analyse`, `rechten`.

## Stories

**E2-S7 Definitie** en **E2-S8 Berekening**: zie `../06-epics.md`.

## Definitie (voorstel Claude, goedgekeurd door Niels op 25 oktober 2026)

Voor een groep G en een periode P:
- Eensgezinde stemming: een besluit in P waarop elke fractie in G voor of tegen stemde, allemaal hetzelfde
- Zetels: de fractiegrootte op het moment van de stemming (zo telt een fractie die later kromp met haar toenmalige zetels)
- Meerderheid: de zetels aan de kant van G zijn meer dan de zetels aan de andere kant
- Meegestemd: een fractie buiten G stemde op een eensgezinde stemming hetzelfde als G
- Beslissend: G had de meerderheid, en zonder de zetels van die fractie niet meer
- Per fractie buiten G: aantal en aandeel keer meegestemd, en aantal keer beslissend. Onder 25 eensgezinde stemmingen "te weinig data" (voorstel, gelijk aan cohesie)

## Testen

- Scenario met bekende uitkomst: een groep met 76 zetels heeft altijd een meerderheid; een fractie die altijd meestemt en de groep over de grens tilt, is altijd beslissend
- Handmatige nacontrole van een steekproef
- Elke combinatie van fracties in een periode geeft een uitkomst binnen de gestelde tijd

## Aandachtspunten

- Het aantal combinaties is te groot om vooraf te berekenen (2 tot de macht 17 per periode). Twee opties, te kiezen bij de start van dit component:
  1. Per periode een compact bestand met per besluit de stem en grootte van elke fractie (orde van grootte 4.000 besluiten x 17 fracties); de browser rekent. Snel en interactief, geen belasting van de database, past bij een statische site
  2. Een functie in de database die de site aanroept. Vraagt een uitzondering in de rechtencontrole (bezoekers mogen nu geen functies uitvoeren) en valt onder de time-out voor bezoekers
- Politiek gevoelig: de uitkomst leest snel als advies. De lezingen (E2-S10) en de vaste uitlegtekst zijn onderdeel van R1, geen bijzaak
- Fracties per periode koppelen op de stemmen en de afkorting (zie `cohesie-pagina.md`, bevinding 50PLUS)

## Gebouwd als concept (24 oktober 2026)

Gekozen optie: 1, rekenen in de browser.
- `db/migrations/010_stemmatrix.sql`: tabel `analyses.stemmatrix` en view `api.stemmatrix`, een rij per periode met de fracties, per besluit een regel met V, T of - per fractie, en per fractie de wijzigingen van de zetels. Opgebouwd na elke verversing (`analyses.herbouw_stemmatrix()`, ongeveer een minuut)
- `web/lib/coalitie.ts`: de rekenkern volgens het voorstel hieronder
- `web/app/api/stemmatrix/route.ts`: levert de stemmatrix via de server (de publieke sleutel blijft uit de browser), een uur bewaard door het CDN van Vercel; de grootste periode (Rutte II) is gecomprimeerd ongeveer 56 kB

Getest: 4 scenario's met bekende uitkomst in Vitest (76 zetels is altijd een meerderheid, beslissend, alleen eensgezinde stemmingen, zetels van het moment); de stemmatrix in pytest; op Supabase 14 perioden opgebouwd. Voorbeeld onder Jetten: D66, CDA en VVD (66 zetels) stemden 3.393 keer eensgezind en hadden 3.322 keer een meerderheid; JA21 was 44 keer beslissend.

Vragen aan Niels over de definitie, beantwoord op 25 oktober 2026 (advies Claude gevolgd: alleen verdeelde stemmingen met een schakelaar, de andere drie zoals hieronder):
1. Alle stemmingen of alleen verdeelde? Nu alle; daardoor wint een groep in bijna elke eensgezinde stemming (98% in het voorbeeld), omdat veel stemmingen unaniem zijn. Voorstel Claude: alleen verdeelde stemmingen, of beide met een schakelaar zoals bij cohesie
2. Zetels bij hoofdelijke stemmingen: nu het aantal leden dat echt stemde (afwezigen tellen niet). Bij handopsteken de fractiegrootte
3. Rangorde van de partners: nu op het aantal keer beslissend, daarna meegestemd
4. Drempel "te weinig data": 25 eensgezinde stemmingen, gelijk aan cohesie

## Schatting

Middel, ca. 8 tot 14 uur van Niels (vooral de definitie en de nacontrole). Grove schatting, niet gemeten.
