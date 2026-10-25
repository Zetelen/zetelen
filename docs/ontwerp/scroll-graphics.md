# Ontwerpvoorstel: scroll graphics op de voorpagina

Concept, 25 oktober 2026. Gebouwd als conceptpagina `/verhaal` (niet in het menu, niet in de sitemap) tot Niels akkoord is voor de voorpagina; graphic 1 rekent alle stappen, datums en aantallen uit de data, graphic 2 leest de stemming uit `web/content/verhaal-stemming.json` (controle: `db/controles/verhaal_stemming.sql`). Op basis van de vragen aan Niels (24 en 25 oktober 2026). Werkende schets met echte cijfers: `docs/ontwerp/scroll/schets.html` (open via een lokale webserver, bijvoorbeeld `python3 -m http.server` in die map).

## Feedback Niels, 25 oktober 2026 (verwerkt)

- Elke fractie een eigen kleur, uit een eigen palet van tien tinten (geen partijkleuren, besluit 22 oktober 2026). Fracties die tegelijk in de Kamer zitten krijgen nooit dezelfde tint; fracties onder de 5 zetels delen een neutrale tint. PRO houdt de tint van GroenLinks-PvdA. Het kabinet krijgt een gouden rand, de oppositie wordt gedimd.
- Tekstkaarten als tijdlijn: op brede schermen links langs een verticale lijn, met de datum groot bij een punt; de zaal staat rechts stil. Op smalle schermen kaarten onder de zaal.
- Graphic 1 is het verhaal "Hoe zijn we hier gekomen?" op `/verhaal`. Graphic 2 krijgt een andere plek: voorlopig `/verhaal/stemming`, met minder scrollafstand per stap (60vh).

## Voorpagina (25 oktober 2026)

Het verhaal staat nu op de voorpagina (`web/app/page.tsx`, data in `web/lib/voorpagina.ts`); `/verhaal` stuurt door. Opbouw: opening met snelknoppen en "sla het verhaal over", hoofdstuk 1 (hoe zijn we hier gekomen, knop naar Fracties), hoofdstuk 2 (hoe stemt elke partij nu: de zaal kleurt naar cohesie met de grootste kabinets- en de grootste oppositiefractie, knop naar de Verkenner), de oproep naar de coalitiebouwer (concept), en tegels naar de rest van de site. Het hoofdstuk over onderwerpen komt tussen 2 en de coalitiebouwer zodra de beleidsterreinen gevuld zijn.

## Uitgangspunten (besluiten Niels)

- Op de voorpagina, als het overkoepelende verhaal. Verhaalpagina's kunnen later.
- Alleen kijken: de bezoeker scrolt, maar klikt of hovert niet in de graphic.
- Periode: van nu terug tot en met Rutte IV (2022).
- 2D, geen 3D. Diepte met lagen, schaal en parallax.
- Toon: tussen sober en flitsend. Wow, maar het mag niet afleiden van het verhaal.
- Moet op mobiel werken; daar mag het eenvoudiger.
- Inspiratie: de productpagina's uit de voorbeelden van Niels (een object blijft staan en verandert terwijl je scrolt). Bij ons is de zaal dat object.

## Graphic 1: de zaal door de tijd

De zaal blijft in beeld. Per stap schuiven de zetels naar hun nieuwe fractie; fracties die doorgaan houden hun stippen, een opvolger neemt de stippen van zijn voorganger over (GroenLinks en PvdA naar GroenLinks-PvdA, PVV naar Groep Markuszower, GroenLinks-PvdA naar PRO). De kabinetsfracties zijn koper; in het midden staat het aantal zetels van het kabinet.

| Stap | Datum | Wat je ziet |
|---|---|---|
| 1 | januari 2022 | Rutte IV: 77 zetels |
| 2 | juli 2024 | Kabinet-Schoof: 88 zetels |
| 3 | 3 juni 2025 | PVV stapt uit het kabinet: 51 |
| 4 | 22 augustus 2025 | NSC vertrekt: 31 |
| 5 | 29 oktober 2025 | Verkiezingen: D66 en PVV elk 26 |
| 6 | januari 2026 | Zeven Kamerleden gaan van de PVV naar Groep Markuszower |
| 7 | februari 2026 | Kabinet-Jetten, minderheid: 66 |
| 8 | nu | GroenLinks-PvdA gaat verder als PRO; het kabinet zoekt per stemming 10 zetels |

Data: zetels per fractie (`api.fractie_periode`, kolom `zetels_begin`), kabinet (`api.coalitie`), overstappers (`api.overstap`). De stap na de verkiezingen (stap 5) heeft nog geen eigen bron in de database: in de schets staan de fractiegroottes uit de API van eind november 2025. Voor de echte bouw: per Kamerperiode `zetels_begin`.

## Graphic 2: één stemming uit elkaar gehaald

De motie-Eerdmans van 10 juni 2025 (zaak 2025Z11623): "het tienpuntenplan over asiel van Wilders uitwerken en waar mogelijk uitvoeren". Hoofdelijk gestemd, verworpen met 55 tegen 88. Gekozen omdat de PVV (34 van 37) tegen het uitvoeren van het eigen plan stemde en een VVD-Kamerlid anders stemde dan de fractie.

| Stap | Wat je ziet |
|---|---|
| 1 | De zaal zoals hij toen was (Schoof) |
| 2 | De 150 stippen splitsen in voor, tegen en niet deelgenomen |
| 3 | Binnen elk blok per fractie, met namen |
| 4 | De PVV licht op, de rest dimt |
| 5 | Eén VVD-stip licht op: de afwijker, zonder naam |

Data: `core.persoonsstem` (alleen bij hoofdelijke stemmingen). Waarom de PVV tegen stemde, staat niet in de data; dat moet in de tekst uit een bron komen, of weg.

## Graphic 3: wie stemt met wie (later)

De fracties verlaten de zaal en schuiven naar een kaart waarop afstand betekent hoe vaak ze verschillend stemden (dezelfde MDS als de volgorde van de zaal, nu in twee richtingen). Daarna verschuift de kaart per beleidsterrein. Wacht op de onderwerpen (beleidsterrein via het Kamerstukdossier, zie STATUS.md).

## Gedrag en techniek

- Opbouw: een vaste (sticky) graphic en tekstkaarten die eroverheen scrollen. Een stap wisselt als de kaart het midden van het scherm passeert (IntersectionObserver); de overgang is een animatie van 0,9 seconde, niet gekoppeld aan de scrollpositie. Zo blijft het soepel op telefoons.
- SVG met 150 cirkels, verplaatst met CSS `transform`. Geen bibliotheek nodig.
- Minder beweging (systeeminstelling): de stappen wisselen zonder animatie.
- Geen partijkleuren (besluit R1): koper voor het kabinet of de kant die we uitlichten, goud voor de uitzondering, de rest neutraal.
- Prestaties: geen invloed op het laden van de pagina (geen data uit de browser; de cijfers komen mee in de HTML van de server).

## Open punten

1. Graphic 2 op mobiel: de blokken staan op smalle schermen onder elkaar (in de schets). De stippen blijven klein; in de echte bouw testen op een telefoon.
2. Stap 5 van graphic 1 (na de verkiezingen) heeft nog geen eigen bron; zie hierboven.
3. Datums in de teksten (verkiezingen, uittreden, splitsing) nakijken.
4. Volgorde: chronologisch (Rutte IV naar nu) gekozen, zodat het verhaal bij het heden eindigt. Andersom kan ook.
5. Stap 8 van graphic 1 ("zoekt per stemming 10 zetels") is een sprong naar de coalitiebouwer: daar kan de voorpagina naar doorverwijzen.
