# Conventies voor alle componenten

Elk componentbestand verwijst hiernaar. Een worker zonder gesprekscontext leest dit bestand, het eigen componentbestand, `_overzicht.md` en `../05-techniek.md`.

## Het project in drie zinnen

Een publieke website over de Tweede Kamer, gebouwd op de open data van de Kamer (OData API). Een Python-script ververst dagelijks een Supabase-database, de analyses draaien in SQL, en een Next.js-site op Vercel toont ze. Bij elke analyse staan twee onderbouwde lezingen naast elkaar; de eerste live-gang (R1) bevat alleen de cohesie-analyse tussen fracties.

## Stack (zie `../05-techniek.md` voor de reden en de beperkingen)

- Dataverversing: Python in GitHub Actions, dagelijks
- Database: Supabase Postgres, drie lagen: raw, core, analyse
- Verbinding vanuit Actions: Supabase session pooler (IPv4)
- Frontend: Next.js met TypeScript, op Vercel Hobby
- Repo: GitHub, publiek, nieuw project

## Voorgestelde mapindeling van de repo

```
pipeline/     Python: API-check, laden, verversing
db/           SQL: migraties, views, tests
web/          Next.js
content/      Teksten van de lezingen (tekstbestanden)
docs/plan/    Dit plan
```

## Harde regels

- **Geen verzonnen veld- of kolomnamen.** Namen komen uit het API-checkrapport (`docs/plan/api-check-rapport.md`, aangemaakt door component `api-check`). Bestaat het rapport nog niet, dan bouwt een worker niets dat op veldnamen leunt en meldt dat.
- **Geen geheimen in de repo.** De repo is publiek. Ook niet in voorbeeldbestanden, testdata of de git-historie.
- **Geen namen van personen in rapporten of logs.** Alleen aantallen. Op de site staan Kamerleden met naam, dat is bedoeld; in controle-uitvoer niet.
- **Data-minimalisatie.** Alleen importeren wat de vier analyses nodig hebben. Niet importeren: contactinformatie, geschenken, reizen, nevenfuncties en inkomsten van personen.
- **De frontend heeft alleen leesrechten.** Nooit de `service_role`-sleutel in de browser of in een Next.js client.
- **Een bestaand bestand wordt niet aangepast zonder dat Niels de wijziging eerst ziet.**
- **Niets is "klaar" zonder draaiende tests.** Een component dat niet getest is, heeft status "in bouw", ook als de code er staat.
- **Interfacewijzigingen worden expliciet gemeld.** Verander je een tabel, een view, een functie of een endpoint waar een ander component op leunt, meld dat in het antwoord en werk het componentbestand bij.
- **Voor elke push de build en de tests zoals CI ze draait.** Dus `npm run build` in `web/` zonder database-variabelen (zonder `.env.local`), plus de tests (pytest en vitest). Reden: op 25 oktober 2026 faalde CI 11 keer achter elkaar op `main` en kreeg Niels voor elke run een mail.
- **Is CI op `main` rood, dan niet verder pushen tot het opgelost is.** Eén herstelcommit, daarna controleren dat CI groen is.
- **Het eind van elke taak is een korte samenvatting voor Niels:** wat is er gebouwd, wat is getest, wat valt op. Niels reviewt en moet het kunnen navertellen aan een ander. Kies dus de eenvoudigste oplossing die werkt.

## Voorstellen die Niels nog kan wijzigen

- Taal van code en commentaar: Engels. Teksten op de site: Nederlands.
- Tests: pytest voor Python, pgTAP voor de database, Vitest voor de frontend, een browser-test voor de belangrijkste paden.
- Databasewijzigingen via migratiebestanden in `db/`, niet via handmatige wijzigingen in het dashboard.
- Elke wijziging via een pull request met een checklist.
- Actuele versies van Next.js en Supabase-bibliotheken controleren bij de start van het component.

## Bronnen

Zie `../05-techniek.md` onder "Bronnen". Gebruiksvoorwaarden van de open data zijn nog niet vastgelegd (open punt, nodig voor R1).
