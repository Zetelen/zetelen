# STATUS

Laatst bijgewerkt: 23 oktober 2026

## Huidige fase

Fase 4: koppelen en bouwen (stap 9). Backend van R1 gebouwd en getest, plus `ontwerpsysteem` en `site-shell`. De site staat online op https://zetelen.vercel.app, niet geindexeerd tot de livegang. Repo in de organisatie Zetelen (`Zetelen/zetelen`).

## Afgerond

- Stap 1: `01-idee.md` (akkoord Niels)
- Stap 2 en 3: `02-beoordeling.md`, drie iteraties
- Stap 5: `05-techniek.md` (akkoord Niels)
- Stap 6 en 7: `06-epics.md` (R1 niet kleiner gemaakt, besluit Niels)
- Stap 8: `08-componenten/` met `_conventies.md`, `_overzicht.md` en 16 componenten voor R1
- Stap 9, voorbereiding: `09-koppelingen.md`, `CLAUDE-snippet.md`, `BRIEFING.md`
- Handmatige API-check (23 oktober 2026): uitkomst in `api-check-handmatig.md`, verwerkt in `06-epics.md` (E1-S4, E1-S8, E2-S1, E6-S1)
- Ontwerp (23 oktober 2026): in `docs/ontwerp/`, verwerkt in `06-epics.md` (E3-S2) en `08-componenten/ontwerpsysteem.md`
- Repo `zetelen` aangemaakt met plan, ontwerp en `CLAUDE.md` (23 oktober 2026). Supabase en Vercel zijn nog niet gekoppeld
- Component `repo-ci` (23 oktober 2026): secret scan (gitleaks), CI-placeholder, README, pull request-sjabloon en `docs/onderhoud.md` met het onderhoudspad voor de 60-dagenregel. Getest: de scan faalt op een nepsleutel in een testbranch en slaagt op `main`
- Component `api-check` (23 oktober 2026): `pipeline/api_check.py` met tests in CI, rapport in `api-check-rapport.md`. Getest: 6 pytest-tests lokaal en in CI, tellingen gelijk aan de handmatige check en aan losse aanroepen
- Component `ingest` (23 oktober 2026): schema `raw`, eerste laad van de 14 entiteiten vanaf 2010 (ongeveer 4,1 miljoen rijen, twee runs, ongeveer 8 uur) en dagelijkse verversing om 04:17 UTC. Database 1.349 MB. Getest: 29 tests lokaal en in CI, aantallen per entiteit vergeleken met de API
- Component `bewaking` (23 en 24 oktober 2026): logboek `beheer.verversing`, externe controle via healthchecks.io (mail bij een fout of na 2 dagen zonder geslaagde verversing), stap die de workflow actief houdt, runbook `docs/onderhoud.md`. Getest: 34 tests, fout-mails van GitHub en healthchecks aangekomen
- Component `core-model` (24 oktober 2026): schema `core` met de handmatige tabellen kabinet, kamerperiode en fractie_partij, en zeven afgeleide tabellen die na elke verversing opnieuw worden opgebouwd (unlogged). 60.133 besluiten en 899.200 fractiestemmen sinds 2010. Beschrijving in `docs/datamodel.md`. Getest: 48 tests
- Component `rechten` (24 oktober 2026): schema `api` als enige open schema, RLS op elke tabel, rechtencontrole in de database en een test als bezoeker via de Data API, beide na elke migratie. Getest: 56 tests, zes controles en tien proeven via de API op Supabase. De test op de frontendbuild is verplaatst naar `site-shell`
- Component `cohesie-analyse` (24 oktober 2026): definitie goedgekeurd (`definitie-cohesie.md`), cohesie per fractiepaar, periode en variant, plus eensgezindheid binnen fracties, publiek via `api.cohesie` en `api.eensgezindheid`. Getest: 64 tests, berekening op de volledige data in 25 seconden
- Component `datakwaliteit` (24 oktober 2026): vier controles na elke verversing, waaronder de grens van 150 zetels (harde fout) en de vergelijking van elke uitslag met de officiele uitslag in de bron (signaal: 8 van 60.133 besluiten). Steekproef per release voorbereid. Getest: 68 tests
- Component `ontwerpsysteem` (24 oktober 2026): Next.js 16 in `web/`, tokens, basiscomponenten, voorbeeldpagina `/ontwerpsysteem`. Getest: 24 contrasttests, bekeken op telefoon en groot scherm, goedgekeurd door Niels
- Component `site-shell` (24 oktober 2026): navigatie, voet, voorpagina, Over, lege staat en foutstaat, sitemap, robots, deelafbeelding, buildcontrole. Online op Vercel. Getest: 28 tests en online gecontroleerd

## Openstaand

- Secret scanning met push protection van GitHub aanzetten (voorstel Claude, 23 oktober 2026): blokkeert een sleutel al voor de push, gitleaks vindt hem pas erna. Instelling voor Niels
- Controles op de naam Zetelen (zie `01-idee.md`), domein registreren
- Demissionaire periodes (voorstel: tellen bij het kabinet waar ze uit voortkomen); periodesoorten, standaard en de bron van de kabinettentabel (Wikidata) zijn besloten
- Reactietermijn bij foutmelding. De drempel "te weinig data" (25) is besloten; na de API-check ruim gehaald in de variant "alle stemmingen", de variant "alleen verdeelde stemmingen" wordt bij `cohesie-analyse` gecontroleerd
- Meetmoment en meetmethode van 500 bezoekers per maand
- Gebruiksvoorwaarden open data, foto-licentie, beleid bij verwijderverzoek
- Invalshoeken voor de lezingen bij het wetgevingsproces en de Kamerleden (bij cohesie besloten: samenwerking tegenover profilering, 22 oktober 2026)
- Blijven rankings van individuele Kamerleden in scope
- Gerichte controle op bestaande sites
- R2 tot en met R4 en Later: componenten nog niet uitgewerkt
- Bewaking: de mail bij een uitblijvend signaal testen (healthchecks-periode tijdelijk op 1 minuut, zie `docs/onderhoud.md`). De fout-mails van GitHub en healthchecks zijn getest (23 oktober 2026)
- Geplande workflows: opgelost. Ververs draaide op 24 oktober om 08:54 UTC volgens planning (gepland 04:17) en Planningstest om 12:03 UTC; GitHub start geplande runs in een nieuwe repo pas na een tijd, en een vertraging van uren is mogelijk. Planningstest is verwijderd. De stap die Ververs actief houdt, blijft
- Handmatige tabellen van `core-model` nakijken (Niels): kabinetten (Wikidata), Kamerperiodes (verkiezingsdata nog te controleren bij de Kiesraad) en de partijkoppeling (vier twijfelgevallen: GroenLinks-PvdA, PRO, DPK, Groep Markuszower)
- Handmatige nacontrole van cohesie op 10 stemmingen (E2-S2, Niels): `db/controles/steekproef_cohesie.sql` in VS Code
- Agendapunt en Besluit hebben 5 en 4 rijen meer dan de API. Niet verklaard door een datum van voor 2010 (controle van `datakwaliteit`); oorzaak onbekend
- Datakwaliteit: de 8 besluiten in `beheer.afwijkende_uitslag` bekijken (Niels, met de besluittekst). Al vastgesteld: bij 20 januari 2026 meldt de bron zelf dat de conclusie "aangenomen" fout was; de zetels in de database kloppen. De steekproef van 10 besluiten tegen tweedekamer.nl uitvoeren (`docs/steekproeven/R1-uitslagen.md`)

## Uitkomst API-check (rapport)

23 oktober 2026, details in `api-check-rapport.md`. Maximaal 250 records per pagina bij alle entiteiten. Stemmingen per jaar 2010 tot en met 2026: 22.243 tot 99.330; persoonsstemmen per jaar ongeveer 1.000 tot 11.000. Besluiten met een stemming: 1.911 tot 4.749 per jaar, waarvan 8 tot 75 met een persoonsstem. 5.766 stemmingen (0,6%) zijn niet te dateren via Agendapunt en Activiteit. Wijzigingen via `ApiGewijzigdOp` en verwijderingen via `Verwijderd` zijn bij alle 14 entiteiten herkenbaar.

## Uitkomst handmatige API-check

23 oktober 2026, details in `api-check-handmatig.md`. De API werkt zonder registratie. Individuele stemmen bestaan vrijwel alleen bij hoofdelijke stemmingen (538 besluiten 'Hoofdelijk', 561 met een persoonsstem, tegen 63.719 met handopsteken). Wijzigingen en verwijderingen zijn herkenbaar via `ApiGewijzigdOp` en `Verwijderd`. Er zijn geen kabinetten in de API. Stemming en Besluit hebben geen datum; die komt via Agendapunt en Activiteit.

## Besluit: laden en Supabase

Besluit Niels, 23 oktober 2026, na het API-checkrapport. Alle 14 entiteiten uit het rapport worden geladen vanaf 2010 (Persoon, Fractie, FractieZetel, FractieZetelPersoon en Commissie volledig). Past de database niet in Supabase Free, dan wordt het Pro (25 dollar per maand). Gemeten bij `ingest`: 1.349 MB, dus Pro; Niels heeft Pro genomen (23 oktober 2026). Tegenspraak van Claude, vastgelegd: met een beperkte laad (vijf entiteiten voor R1) paste Free waarschijnlijk; niet gemeten. Stemmingen zonder datum via Agendapunt en Activiteit (5.766) tellen niet mee in de analyses. Afwijkend stemgedrag (E6-S1) blijft in R3, alleen over de hele Kamerperiode en met het label "alleen hoofdelijke stemmingen". Verwerkt in `05-techniek.md`, `06-epics.md`, `ingest.md`, `core-model.md` en `cohesie-analyse.md`.

## Besluit: coalitiebouwer in R1

Besluit Niels, 24 oktober 2026. Bezoekers stellen zelf een groep fracties samen, zien hun zetels en het totaal in de zaal, en zien voor een (fictief) minderheidskabinet bij welke fracties de groep in het verleden een meerderheid haalde. In R1, omdat de livegang geen haast heeft. Tegenspraak van Claude, vastgelegd: nieuwe analyse met eigen definitie en lezingen (grof 15 tot 25 uur), politiek gevoelig (leest snel als advies), en R1 wordt groter; advies was een R1.1 direct na de livegang. Verwerkt in `01-idee.md`, `06-epics.md` (E2-S7 tot en met E2-S10), `_overzicht.md` (componenten `coalitie-analyse` en `coalitie-pagina`) en `lezingen.md`. Cohesie door de tijd en een netwerk van indieners staan onder Later in `01-idee.md`.

## Besluit: extra databronnen

Besluit Niels, 23 oktober 2026, op advies van Claude. Nu alleen Wikidata (CC0) als bron voor de kabinettentabel (E1-S8), met controle per rij. Bij R2 de entiteit Kamerstukdossier laden als het filter op onderwerp terugkomt. Overige bronnen staan onder Later in `01-idee.md`. Reden: meer data is niet het knelpunt, R1 is al groot. Verwerkt in `01-idee.md`, `06-epics.md` (E1-S8, E2-S2) en `core-model.md`.

## Besluit: ontwerp

Besluit Niels, 23 oktober 2026. Het ontwerp "nacht met koperlicht" in `docs/ontwerp/` is de basis voor de frontend. Het is gemaakt op een eerdere versie van de design-prompt; op vier punten (periodes, schakelaar verdeelde stemmingen, drempel, naam) gaat het plan voor, zie `08-componenten/ontwerpsysteem.md`.

## Idee voor Later: Eerste Kamer

Opgenomen op verzoek van Niels (22 oktober 2026) in `01-idee.md` en `06-epics.md` (E8-S4) als Later. In de eerste zoekronde vond ik geen vergelijkbare open data API; niet uitputtend onderzocht. Eerste stap bij oppakken: een gerichte controle van de bronnen.

## Fracties op 22 oktober 2026

De Tweede Kamer toont 17 fracties met samen 150 zetels. Twee daarvan zijn geen gevestigde partij: Groep Markuszower (7 zetels) en Lid Keijzer (1 zetel). Dat bevestigt dat fracties door de tijd veranderen, wat het datamodel (E1-S5) moet kunnen dragen.

## Besluit: geen partijlogo's of partijkleuren in R1

Besluit Niels, 22 oktober 2026. Partijen worden getoond met naam en afkorting in het eigen palet. Verwerkt in `01-idee.md`, `06-epics.md` (E3-S2) en de componenten `ontwerpsysteem`, `cohesie-pagina` en `core-model`. Gevonden: officiële huisstijl-PDF's van CDA en ChristenUnie, en logodownloads van Volt Europa met de voorwaarde dat derden vooraf toestemming nodig hebben (behalve redactioneel gebruik door media). Voor 11 andere partijen vond ik geen officiële huisstijl of logopagina; de zoekronde was grof.

## Besluit: naam Zetelen

Besluit Niels, 22 oktober 2026. Journalistiek met een speelse knipoog; een hobbyproject onder eigen naam. Verwerkt in `01-idee.md`, `08-componenten/ontwerpsysteem.md` en `claude-design-prompt.md`. Reden voor het werkwoord (door Claude aangedragen): het geeft herhaalbare formules voor de microcopy. Niet gecontroleerd: betekenis van het woord, merkenregister, zoekresultaten, sociale handles, domeinvoorwaarden.

## Besluit: cohesie en drempel

Besluit Niels, 22 oktober 2026. Cohesie is het percentage gezamenlijke stemmingen met dezelfde stem; twee varianten met een schakelaar (alle stemmingen, alleen verdeelde stemmingen); drempel 25 gezamenlijke stemmingen per variant. Verwerkt in `08-componenten/cohesie-analyse.md`, `cohesie-pagina.md` en `01-idee.md`. De definitie van "verdeeld" (niet unaniem) is een voorstel van Claude en de drempel is grof gekozen; beide zijn te toetsen na de API-check.

## Besluit: periodesoorten

Besluit Niels, 22 oktober 2026. Twee periodesoorten, kabinet (standaard, herkenbaarder voor het publiek) en Kamerperiode. Verwerkt in `06-epics.md` (E2-S4, nieuwe E1-S8), `core-model.md`, `cohesie-analyse.md`, `cohesie-pagina.md`. Kabinetten komen uit een handmatige tabel; de API bevat ze niet (handmatige API-check, 23 oktober 2026). Coalitie en oppositie als latere lezing is niet in R1.

## Besluit: kabinet en zetels op /fracties

Besluit Niels, 24 oktober 2026. De samenstelling van elk kabinet sinds Balkenende IV is vervroegd (was Later): tabel `core.coalitie` (migratie 011), met gedoogsteun en de datum waarop een fractie uit het kabinet stapte. Nog na te kijken door Niels: Schoof en Jetten komen uit Wikidata (partij van de bewindspersonen), de rest en alle datums uit de kennis van Claude. Op /fracties tellen de zetels bij het begin van de periode (bij Schoof stond anders de Kamer van na de verkiezingen van 2025); wie tijdens de periode overstapte, is een lichter deel van de balk (migratie 012, `analyses.overstap`, uit de zetels per persoon in de bron). Sinds 25 oktober 2026 (migratie 013) gemeten 30 dagen na het begin: bij de eerste stemming van Rutte IV hadden D66 en CDA nog lege zetels.

## Concept: scroll graphics

25 oktober 2026. Ontwerp in `docs/ontwerp/scroll-graphics.md`, gebouwd als conceptpagina `/verhaal`. Open voor Niels: naar de voorpagina, volgorde (nu Rutte IV naar nu), datums nakijken, graphic 3 na de onderwerpen (voorstel in de plan-PR, component `onderwerpen`).

## Besluit: onderwerpen in R1

Besluit Niels, 25 oktober 2026. Beleidsterrein via het Kamerstukdossier (de vaste commissie die het vaakst voortouw heeft over de zaken in dat dossier), dossier als fijner niveau; een stemming telt mee bij elk terrein van haar dossiers; in R1. Ook akkoord: de lijn voor het verhaal van de site (hoe zijn we hier gekomen, hoe stemt elke partij nu, waar zijn ze het over eens, kun jij een meerderheid vinden). Gebouwd: migratie 014 (`raw.kamerstukdossier`, `raw.zaak_kamerstukdossier`, `core.beleidsterrein_commissie` handmatig, `core.dossier`, `core.zaak_dossier`, `analyses.cohesie_terrein`, `api.cohesie_terrein`, `api.beleidsterrein_periode`) en `pipeline/dossiers.py`, dat meedraait in de dagelijkse verversing. Migratie 015: trefwoorden in de dossiertitel gaan voor de commissie (asiel, wonen, digitalisering), zodat terreinen over de jaren vergelijkbaar zijn; nieuw terrein Digitalisering. Frontend: `/onderwerpen` (concept) en hoofdstuk 3 op de voorpagina. Nog na te kijken door Niels: de koppeltabel van commissie naar beleidsterrein (`db/migrations/014_onderwerpen.sql`, blok `core.beleidsterrein_commissie`) en de trefwoorden (`db/migrations/015_trefwoorden.sql`, blok `core.beleidsterrein_trefwoord`). Drilldown naar het dossier volgt.

## Gebruiksvoorwaarden open data

Op data.overheid.nl staat de dataset met licentie CC0 1.0 (22 oktober 2026). De licentielink in de sectie "Hergebruik" is daar leeg en de API-pagina op developer.overheid.nl vermeldt niets over licentie of limieten. Niet gecontroleerd: foto's van Kamerleden, tekst van documenten, persoonsgegevens. Voorstel voor de voetnoot: de bron noemen, ook al is dat niet verplicht.

## Vragen aan Niels

Geen openstaand.

## Eerstvolgende actie

Component `cohesie-pagina` (zaal, boog, matrix, periodekeuze en schakelaar, met de feedback van Niels op de schets). Daarnaast open voor Niels: de nacontrole van cohesie, de steekproef van uitslagen, de handmatige tabellen nakijken en de test met het uitblijvende signaal.
