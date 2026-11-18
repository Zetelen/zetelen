# Component: deelplaatjes

Status: gebouwd en getest (24 oktober 2026). Later erbij: deelplaatje van de coalitiebouwer (`/coalitie/plaatje`, 25 oktober) en van Oppositiewerk (26 oktober). Kamerleden gebruikt het algemene plaatje
Eerst lezen: `_conventies.md`, `_overzicht.md`, `ontwerpsysteem.md`, `cohesie-pagina.md`

## Doel

Een automatisch gegenereerd deelplaatje per fractiepagina, zodat resultaten op social media kunnen circuleren.

## Laag

Frontend (met een server-side afbeelding)

## Interface

Biedt: per fractiepagina een afbeelding met het cijfer, de periode, de bron en de datum, bruikbaar als voorbeeldafbeelding bij delen.

Verwacht: de fractiepagina's van `cohesie-pagina`, de tokens van `ontwerpsysteem`.

## Afhankelijkheden

`cohesie-pagina`.

## Stories

**E3-S5 Deelplaatjes.** Als bezoeker wil ik een plaatje van een resultaat kunnen delen.
- Per fractiepagina wordt automatisch een plaatje gegenereerd met het cijfer, de periode, de bron en de datum
- Het plaatje toont nooit een cijfer dat niet in de database staat

## Testen

- Het plaatje van een testfractie bevat het juiste cijfer, de periode, de bron en de datum
- Wijzig het cijfer in de testdatabase: het plaatje volgt
- Een fractie zonder data geeft een plaatje met "te weinig data", niet een verzonnen cijfer

## Aandachtspunten

- Gebruik geen logo's of merkelementen van anderen
- Het plaatje is een weergave van de database; er komt geen tekst of duiding in die niet op de site staat
- Vercel Hobby heeft een grens op functieduur en gebruik; houd het genereren licht

## Gebouwd (24 oktober 2026)

- `web/app/fracties/[fractie]/opengraph-image.tsx`: per fractiepagina een plaatje van 1200 bij 630 met de drie fracties waarmee de fractie onder haar nieuwste kabinet het vaakst hetzelfde stemde (alle stemmingen), de periode, de bron en de stand van de data. Geen logo's; eigen palet
- `web/lib/deelplaatje.ts`: de inhoud, los van de opmaak: alleen cijfers uit de database; zonder bruikbaar cijfer "te weinig data"
- Keuze (Claude): het plaatje toont altijd het nieuwste kabinet van de fractie en alle stemmingen, ook als de bezoeker een andere periode koos. Een plaatje kan de keuze uit de URL niet volgen (beperking van de voorbeeldafbeelding in Next.js)

## Getest (24 oktober 2026)

- 3 Vitest-tests: de hoogste cijfers in volgorde, het plaatje volgt een gewijzigd cijfer, "te weinig data" zonder bruikbaar cijfer
- Lokaal en online gegenereerd en bekeken: PVV (Groep Markuszower 77,6%, BBB 74,0%, FVD 73,8%, gelijk aan de fractiepagina) en BIJ1 (laatste kabinet Rutte IV)
- De fractiepagina verwijst in `og:image` naar het plaatje op het productieadres

## Schatting

Klein tot middel, ca. 4 tot 8 uur van Niels. Grove schatting, niet gemeten.
