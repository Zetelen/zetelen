# Component: ingest

Status: klaar (24 oktober 2026). De melding bij een mislukte run is getest bij `bewaking`: mails van GitHub en healthchecks komen aan. Gevonden op 26 oktober 2026: een verwijdering waarbij de bron de koppeling leegmaakt, komt niet door de verversing; opgelost dezelfde dag (akkoord Niels): de verversing haalt verwijderde records ook buiten het datumfilter op, en een Ververs met `terug_tot=2026-10-23` haalde de gemiste verwijderingen binnen. Zie "Extra rijen" in `../te-beoordelen.md`
Eerst lezen: `_conventies.md`, `_overzicht.md`, `../05-techniek.md`, `docs/plan/api-check-rapport.md`

## Doel

Het Python-script en de GitHub Actions workflow die de 14 entiteiten uit het API-checkrapport vanaf 2010 in de raw-laag laden en daarna dagelijks incrementeel bijwerken.

## Laag

Backend

## Interface

Biedt:
- Een raw-laag in Supabase met een tabel per geladen entiteit (veld- en tabelnamen volgen uit het API-checkrapport)
- Een herhaalbaar script: opnieuw draaien geeft geen dubbele rijen
- Een logregel per run met aantallen en duur
- Een dagelijkse GitHub Actions workflow

Verwacht:
- Het API-checkrapport (veldnamen, paginering, volume, herkenning van wijzigingen en verwijderingen)
- Schrijfrol en connectiestring van de database als GitHub Actions secrets (via de session pooler)

## Afhankelijkheden

`repo-ci`, `api-check`. Extern: Tweede Kamer API, Supabase.

## Stories

**E1-S3 Volledige eerste laad.** Als beheerder wil ik de benodigde entiteiten vanaf 2010 in de raw-laag laden.
- De 14 entiteiten uit het API-checkrapport worden geladen (besluit Niels, 23 oktober 2026), geen contactgegevens, geschenken, reizen, nevenfuncties of inkomsten van personen
- Entiteiten met een datum laden vanaf 2010. Persoon, Fractie, FractieZetel, FractieZetelPersoon en Commissie laden volledig. Het datumfilter per entiteit volgt uit de velden in het rapport
- Na de laad is het aantal records per entiteit gelijk aan het aantal in de API met hetzelfde filter (telling vergeleken en vastgelegd)
- Het script is herhaalbaar: opnieuw draaien na een onderbreking levert geen dubbele rijen op
- De totale databasegrootte inclusief indexes is gemeten en vastgelegd, met een vergelijking met de 500 MB van het Free plan
- Past de database na de eerste laad niet in Supabase Free (500 MB), dan wordt het Supabase Pro (besluit Niels, 23 oktober 2026)

**E1-S4 Dagelijkse incrementele verversing.** Als beheerder wil ik dat de data elke dag zelf bijgewerkt wordt.
- Een GitHub Actions workflow draait dagelijks en laadt alleen wat sinds de vorige run is gewijzigd (`ApiGewijzigdOp`, bij alle 14 entiteiten aanwezig en filterbaar volgens het API-checkrapport)
- Verwijderde records in de bron worden ook in de database verwerkt (vlag `Verwijderd`, bij alle 14 entiteiten aanwezig)
- De run is herhaalbaar en schrijft een log met aantallen en duur
- Bij een mislukte run krijgt de beheerder een melding

## Testen

- Eerste laad: vergelijk per entiteit het aantal in de database met het aantal uit de API
- Onderbreek de laad halverwege en start opnieuw: geen dubbele rijen
- Draai de verversing twee keer achter elkaar: de tweede run wijzigt niets
- Zet een fout in (onjuiste connectiestring) en controleer dat de melding komt
- Meet de databasegrootte na de eerste laad en leg het resultaat vast in `docs/plan/`

## Aandachtspunten

- De eerste volledige laad kan lang duren en meer API-verkeer geven dan de dagelijkse run; houd rekening met paginering en netwerkfouten (herhalen met uitstel). De API geeft maximaal 250 records per pagina; Stemming vanaf 2010 is ongeveer 3.900 pagina's, alle 14 entiteiten zonder datumfilter ongeveer 18.200
- Het datumfilter voor Stemming loopt via `Besluit/Agendapunt/Activiteit/Datum`; dat werkt in de API (API-checkrapport)
- Een GitHub Actions run heeft een maximale duur; een lange eerste laad moet daarom in te delen zijn (per entiteit of per periode) en hervatbaar zijn
- Grootte na de eerste laad: 1.349 MB, dus Supabase Pro (zie `../05-techniek.md`)

## Bouwstappen

| Stap | Wat | Status |
|---|---|---|
| A | `pipeline/verbindingstest.py` en workflow Verbindingstest | Klaar en getest (23 oktober 2026): verbinding via de session pooler, Postgres 17.11 |
| B | Schema `raw` (`db/migrations/001_raw_schema.sql`, gegenereerd door `pipeline/raw_schema.py`), migratierunner `pipeline/migreer.py`, workflow Migreer | Klaar en getest (23 oktober 2026): tests lokaal en in CI, uitgevoerd op Supabase (16 tabellen in `raw`) |
| C | `pipeline/laad.py` en workflow Laad: eerste laad per entiteit, upsert op `Id`, hervatbaar via het skiptoken, stopt op tijdslimiet (330 min) en groottegrens (450 MB), vergelijkt aantallen met de API | Klaar en getest (23 oktober 2026): tests lokaal en in CI; eerste laad op Supabase in twee runs (de eerste stopte op de tijdslimiet en de tweede hervatte), zie Meting |
| D | `pipeline/ververs.py` en workflow Ververs: dagelijks om 04:17 UTC, haalt alleen records op met `ApiGewijzigdOp` na de vorige run (een uur overlap), verwijderingen via de vlag `Verwijderd` | Klaar en getest (23 oktober 2026): tests lokaal en in CI; eerste run met de hand: 312 records in 0,3 minuut. De melding bij een mislukte run is nog niet getest |

Keuzes (besluit Niels, 23 oktober 2026):
- Raw-laag met een kolom per veld uit `$metadata`, geen `jsonb`. Uitwerking door Claude: kolomnamen exact de API-namen tussen aanhalingstekens, tabelnamen de entiteitnaam in kleine letters, plus een eigen kolom `_geladen_op`
- Persoon zonder `Geslacht`, `Geboortedatum`, `Geboorteplaats`, `Geboorteland`, `Overlijdensdatum`, `Overlijdensplaats`, `Woonplaats`, `Land`, `ContentType`, `ContentLength`. Het laadscript vraagt alleen de bewaarde velden op (`$select`)
- Alleen de koppeling Besluit en Zaak extra (`raw.besluit_zaak`, via `$expand`); andere koppelingen pas als een release ze nodig heeft
- Zaak zonder datumfilter, zodat een zaak die voor 2010 begon en later is gestemd niet ontbreekt. Aanname Claude: ZaakActor dan ook zonder datumfilter, omdat het filter via Zaak zou lopen
- Voorlopig verbindt het script als `postgres`; een aparte schrijfrol volgt bij `rechten`

Feiten uit de API (23 oktober 2026, niet in het rapport):
- Pagineren werkt alleen zonder `$top`: dan geeft de API 250 records en een `@odata.nextLink` met `$skiptoken=Id-<guid>`, gesorteerd op `Id`. Met `$top` ontbreekt de volgende-link
- Koppelingen als Besluit en Zaak staan niet als veld in het record, alleen als relatie; `$expand=Zaak($select=Id)` werkt

Meting stap C (23 oktober 2026, lokale Postgres 16, live API):
- De vijf kleine entiteiten: 7.055 rijen in 10 seconden, aantallen gelijk aan de API
- Stemming, eerste minuut: 162 pagina's (40.500 rijen), 267 bytes per rij inclusief primaire sleutel. Geschat voor Stemming vanaf 2010: ongeveer 260 MB en 25 minuten
- Schatting voor alle 14 entiteiten: ongeveer de helft van de JSON-schatting (2,7 GB), dus rond 1,3 GB. Free (500 MB) is daarmee te klein; grove extrapolatie, alleen Stemming gemeten

Eerste laad op Supabase Pro (23 oktober 2026), na de verversing vergeleken met de API:

| Entiteit | Rijen | Duur | Tabel (MB) | Tegen de API |
|---|---|---|---|---|
| Fractie, Commissie, Persoon, FractieZetel, FractieZetelPersoon | 7.055 | 1 min | 1,4 | gelijk |
| Vergadering | 7.578 | 1 min | 1,9 | gelijk |
| Activiteit | 66.870 | 7 min | 39,8 | gelijk |
| Agendapunt | 311.290 | 30 min | 104,9 | 5 meer |
| Besluit | 638.733 | 100 min | 156,9 | 4 meer |
| Stemming | 978.678 | 91 min | 259,1 | gelijk |
| ActiviteitActor | 292.057 | 28 min | 86,4 | gelijk |
| Zaak | 343.822 | 37 min | 119,7 | gelijk |
| ZaakActor | 922.008 | 2 runs, samen ongeveer 87 min | 261,4 | gelijk na de verversing (3 ontbraken na de laad) |
| Document | 567.098 | 57 min | 222,4 | gelijk na de verversing (2 ontbraken na de laad) |

Database na de laad: 1.349 MB. Tempo vanuit GitHub Actions: ongeveer 9.000 rijen per minuut, Besluit (met de koppeling naar Zaak) ongeveer 6.400.

Verklaringen (niet gecontroleerd):
- Ontbrekende rijen na de laad: de API sorteert op `Id` (een willekeurige GUID). Een record dat tijdens de laad bijkomt met een `Id` voor het huidige punt, wordt overgeslagen. De verversing vult dat aan, omdat het startpunt de start van de laad is
- Rijen meer dan de API bij Agendapunt en Besluit: records die na de laad buiten het datumfilter vielen (datum van de vergadering verschoven of activiteit verwijderd). De verversing ruimt die niet op; `core-model` filtert op datum

## Schatting

Groot, ca. 10 tot 20 uur van Niels (inclusief herhaalde review van de eerste laad). Grove schatting, niet gemeten.
