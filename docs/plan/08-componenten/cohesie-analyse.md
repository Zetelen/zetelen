# Component: cohesie-analyse

Status: gebouwd en getest (24 oktober 2026). Open: handmatige nacontrole van 10 stemmingen door Niels (E2-S2)
Eerst lezen: `_conventies.md`, `_overzicht.md`, `../05-techniek.md`, `docs/plan/api-check-rapport.md`

## Doel

De definitie en de berekening van cohesie tussen fracties: hoe vaak twee fracties hetzelfde stemmen, per periode, als voorberekende tabel in de analyse-laag.

## Laag

Backend (SQL)

## Interface

Biedt: een voorberekende tabel in de analyse-laag met per fractiepaar en per periode de cohesie en het aantal onderliggende stemmingen, plus een afgesproken waarde voor "te weinig data". Publiek leesbaar (zie `rechten`). Daarnaast de definitie als tekst voor de methodiekpagina.

Verwacht: het core-model met stemmingen op fractieniveau.

## Afhankelijkheden

`core-model`, `rechten`.

## Stories

**E2-S1 Definitie.** Als beheerder wil ik een exacte definitie van cohesie, zodat elk cijfer navertelbaar is.
- De definitie staat op papier met formule, en beantwoordt: hoe tellen afwezigen en niet-deelnemers, wat is een gedeelde stemming, hoe tellen hamerstukken en besluiten zonder stemming
- Besluit Niels (22 oktober 2026): cohesie is het percentage gezamenlijke stemmingen waarop twee fracties hetzelfde stemden (beide voor of beide tegen); stemmingen waarbij een van de twee niet meedeed tellen niet mee
- Twee varianten: alle stemmingen, en alleen stemmingen waarover de Kamer verdeeld was. Voorstel van Claude voor "verdeeld": zowel fracties voor als tegen (niet unaniem); alternatief met een zetelsdrempel is ingewikkelder en nog niet gekozen
- De definitie is in een alinea uit te leggen, zodat Niels het aan een ander kan navertellen
- Niels heeft de definitie goedgekeurd
- Fracties worden alleen vergeleken in periodes waarin ze beide bestonden
- Periode is een Kamerperiode of een kabinet; beide soorten worden voorberekend. Standaard op de site: kabinet (besluit Niels, 22 oktober 2026)
- Een stemming hoort bij een periode via de datum van de vergadering (`Besluit/Agendapunt/Activiteit/Datum`). Stemmingen zonder datum langs die weg tellen niet mee (5.766, 0,6%; besluit Niels, 23 oktober 2026)
- Voorstel van Claude, Niels beslist: een demissionaire fase telt bij het kabinet waar die uit voortkomt

**E2-S2 Berekening.** Als bezoeker wil ik cohesie per paar fracties per periode zien.
- Voor een gekozen periode bestaat een voorberekende tabel met alle fractieparen en hun cohesie, plus het aantal onderliggende stemmingen
- Een steekproef van minstens 10 stemmingen is met de hand nagerekend en komt overeen (aantal is een voorstel)
- De tabel bevat per fractiepaar en periode de cohesie in twee varianten (alle stemmingen, alleen verdeelde stemmingen), met het aantal onderliggende stemmingen per variant
- Een fractie met te weinig gezamenlijke stemmingen toont "te weinig data" in plaats van een getal (drempel: 25 gezamenlijke stemmingen per variant, besluit Niels, een grove keuze die na de API-check wordt getoetst)
- Het filter op onderwerp is geen onderdeel van R1

## Testen

- Handmatige nacontrole van minstens 10 stemmingen (voorstel) tegen de berekende tabel
- Twee fracties die nooit gelijktijdig bestonden komen niet in dezelfde periode voor
- Een eenvoudig scenario met bekende uitkomst (zelfde stem altijd, tegengestelde stem altijd) geeft de uiterste waarden
- De tabel is leesbaar voor de anon-rol en niet beschrijfbaar

## Aandachtspunten

- Eerst de definitie vastleggen en door Niels laten goedkeuren, daarna pas de SQL
- Uit `core-model` (24 oktober 2026): bij hoofdelijke stemmingen bestaat geen fractiestem, alleen stemmen per Kamerlid (ongeveer 100 besluiten per jaar). De definitie moet kiezen: weglaten of een fractiestem afleiden. Ook te kiezen: hoe stemmen met de vlag `vergissing` tellen
- Periodesoorten besloten: kabinet (standaard) en Kamerperiode. Na de API-check (23 oktober 2026): 1.911 tot 4.749 besluiten met een stemming per jaar. In de variant "alle stemmingen" halen fractieparen de drempel van 25 dus ruim, ook in korte kabinetten, behalve fracties die maar enkele weken bestonden
- Drempel "te weinig data": 25 gezamenlijke stemmingen per variant. Het aandeel verdeelde stemmingen is via de API niet te tellen; controleer bij de berekening hoeveel fractieparen in de variant "alleen verdeelde stemmingen" wegvallen

## Gebouwd (24 oktober 2026)

- Definitie goedgekeurd door Niels (24 oktober 2026): `../definitie-cohesie.md`. Hoofdelijke stemmingen: fractiestem afgeleid uit de meerderheid van de leden; vergissingen tellen niet mee; verdeeld = minstens een fractie voor en een tegen
- Nieuw op verzoek van Niels: eensgezindheid binnen een fractie (hoofdelijke stemmingen en afwijkers bij handopsteken). Alleen berekend en publiek via `api`; of en hoe het op de site komt, beslist Niels bij `cohesie-pagina`
- `db/migrations/006_analyse_cohesie.sql`: schema `analyses` (`analyse` is een gereserveerd woord in Postgres) met `fractie_besluit_stem`, `cohesie` en `eensgezindheid` (unlogged), de functie `analyses.herbouw()` en de views `api.cohesie` (beide richtingen, met afkortingen) en `api.eensgezindheid`
- De verversing bouwt na `core` ook `analyses` opnieuw op
- `db/controles/steekproef_cohesie.sql`: query voor de handmatige nacontrole

Interface naar `cohesie-pagina`: `api.fractie_periode` (per periode en fractie: zetels, stemmingen, eerste en laatste stemming, in_zaal; toegevoegd 24 oktober 2026 door `cohesie-pagina`, migratie 009) en `api.cohesie` met `periodesoort`, `periode`, `variant` (`alle`, `verdeeld`), `fractie`, `fractie_afkorting`, `andere_fractie`, `andere_fractie_afkorting`, `gezamenlijk`, `gelijk`, `cohesie` (leeg bij te weinig data) en `te_weinig_data`. Let op: de Data API geeft standaard maximaal 1.000 rijen per verzoek; de site moet dus per periode en variant opvragen.

## Getest (24 oktober 2026)

- 64 tests slagen lokaal en in CI, met een scenario met bekende uitkomst: altijd gelijk geeft 100%, altijd tegengesteld 3,0% (een unaniem besluit was gelijk); niet deelgenomen, vergissing en gelijke stand binnen een fractie tellen niet; de variant verdeeld laat unanieme besluiten weg; onder 25 gezamenlijke stemmingen "te weinig data"; eensgezindheid telt de verdeelde hoofdelijke stemming en de afwijker; bezoekers lezen cohesie, niet de tussenstap
- Op Supabase: berekening in 25 seconden. 897.076 fractiestemmen (inclusief afgeleid), 4.081 rijen cohesie (paren per periode en variant), 245 rijen eensgezindheid. Rechtencontrole en test via de API geslaagd
- Voorbeeld via de API: onder Schoof stemde de VVD het vaakst gelijk met BBB (79,8%), CDA (79,7%) en NSC (79,2%), over ongeveer 7.000 gezamenlijke stemmingen
- Niet gedaan: de handmatige nacontrole van 10 stemmingen (Niels, met de steekproefquery)

## Schatting

Middel, ca. 8 tot 14 uur van Niels (inclusief de definitie en de nacontrole), plus waarschijnlijk enkele uren voor de tweede variant en enkele uren voor de tweede periodesoort. Grove schatting, niet gemeten.
