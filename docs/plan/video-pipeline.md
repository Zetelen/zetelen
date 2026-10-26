# Video's en pipeline voor nieuwe casussen

Opgesteld door Claude op 26 oktober 2026, op verzoek van Niels. Status: de video's zijn gebouwd (`video/`); de pipeline is een plan en wacht op akkoord.

## Uitgangspunten (besluiten Niels, 26 oktober 2026)

- **Kanalen:** Instagram Reels, TikTok, YouTube Shorts, LinkedIn en Bluesky. Staand 9:16, 30 tot 60 seconden.
- **Geluid:** tekst in beeld, geen stem. Zelf inspreken kan later.
- **Geen namen of gezichten van Kamerleden:** alleen fracties. Een video gaat rond zonder context. Op de site kun je verder kijken.
- **Eerst de video's, de pipeline als plan.**

## Wat er staat

Een Remotion-project in `video/` dat de gegevens en rekenfuncties van de site hergebruikt (`web/lib/uitgelicht.ts`, `web/lib/verhaal.ts`). Site en video tellen dus gelijk. Een nieuwe stemming is één JSON-bestand, gemaakt met `pipeline/stemming_casus.py <zaaknummer>`.

| Format | Wanneer | Beeld | Duur |
|---|---|---|---|
| **Stemming** (vast) | Elke stemming | Titel, zaal van 150, de zaal valt uiteen in voor en tegen, wat valt op, uitslag | 31 s |
| **Weegschaal** | Krap: hooguit 2 stemmen verschil | Fracties vallen afwisselend in de schaal, de balk kantelt mee | 32 s |
| **Hoefijzer** | De uiteinden van de rij stemmen gelijk en het midden anders (alleen Mercosur; behandelvoorbehoud krijgt het vaste format, besluit Niels 26 oktober) | 150 stemmen op een rij, die dichtbuigt | 33 s |
| **Gelijke stand** | De stemmen staakten | Twee scoreborden, en wat er in een week veranderde | 32 s |
| **Eén fractie** | Een fractie stemt verdeeld, of er is een vergissing | Inzoomen op de Kamerleden van één fractie | 36 s |
| **Tijdlijn** | Van Rutte IV tot nu | De zaal als timelapse, scorebord tegen 76 | 40 s |

Vast in elke video: het palet van de site, het Binnenhof in de opening en op de eindkaart, en de bron met het zaaknummer. Op de eindkaart staat ook dat de kleuren een eigen palet zijn.

Gebruik:
```
cd video
npm run studio          # bekijken en bijstellen in Remotion Studio
npm run render          # alle video's naar video/out/
node render.mjs Tijdlijn
node scripts/tijdlijn.mjs   # tijdlijn-gegevens opnieuw ophalen
```

## Pipeline: van nieuwe stemming tot video (plan)

### 1. Ontdekken in de data

Dagelijks na Ververs. Elke nieuwe stemming krijgt een score uit signalen die we al kunnen meten:

| Signaal | Hoe | Gewicht (voorstel) |
|---|---|---|
| Krap | hooguit 4 stemmen verschil | 3 |
| Gestaakt | besluitsoort "gestaakt" | 4 |
| Hoofdelijk | stemmingssoort | 2 |
| Verdeelde fractie | een fractie met stemmen voor en tegen | 3 |
| Vergissing | `Vergissing = true` in de bron | 2 |
| Kabinet verliest | alle kabinetsfracties aan de verliezende kant | 3 |
| **Onverwachte samenwerking** | twee fracties met een lage cohesie (onder 40%) stemmen samen voor, en het wordt aangenomen | 3 |
| **Brede steun** | aangenomen met kabinet en oppositie, bij een onderwerp waar het paar gewoonlijk verschilt | 2 |

De laatste twee wegen bewust even zwaar als de conflictsignalen. Een algoritme dat alleen op spanning stuurt, vindt vooral ruzie, en dat is het beeld waar Zetelen tegenin wil gaan.

**Spreiding:** de pipeline houdt bij welke fracties de laatste 30 dagen in een video centraal stonden. Een kandidaat met een fractie die al vaak voorkwam, zakt in de lijst. Die telling komt in de wachtrij te staan, zodat je ziet of het in balans is.

**Format kiezen:** gestaakt wordt Gelijke stand; hooguit 2 verschil wordt Weegschaal; een verdeelde fractie of vergissing wordt Eén fractie; als de uiteinden gelijk stemmen en het midden anders, wordt het Hoefijzer; anders het vaste format.

### 2. Tractie online

Extra punten, nooit de enige reden:
- **Nieuwsfeeds (RSS)** van bijvoorbeeld NOS en NU.nl, rubriek politiek: vermelding van het zaaknummer, het dossiernummer of woorden uit de titel.
- **Bluesky:** de officiële zoek-API is open en gratis; het aantal berichten met de titel of het dossier in de dagen na de stemming.
- **X, TikTok en Instagram uitlezen:** niet. Dat is duur of tegen de voorwaarden. Later alleen via een officiële API.

### 3. Uitwerken

1. `pipeline/stemming_casus.py` maakt de gegevens. Wijkt de telling af van de besluittekst, dan stopt de pipeline voor deze casus.
2. De Claude API schrijft een concept: de vraag (de haak), een neutrale omschrijving van één of twee zinnen, en een bijschrift voor sociale media met de link. De regels van de stijlgids (`docs/ontwerp/tone-of-voice.md`) gaan mee in de opdracht, met een tweede controle op oordelen, bijvoeglijke naamwoorden over partijen en namen van personen. Model: het nieuwste Claude-model; de kosten zijn een paar cent per casus.
3. Remotion rendert in GitHub Actions. Dat is gratis voor een publieke repo, ongeveer 2 minuten per video.

### 4. Beoordelen (jij)

Niets gaat de deur uit zonder jouw akkoord. Een onjuiste of scheve video onder jouw naam kost meer dan het tijd bespaart. Voorstel:
- **Wachtrij in een eigen, private repository** (bijvoorbeeld `Zetelen/video-wachtrij`), met per kandidaat een issue: de video, het bijschrift, de bron, de score met de signalen en de spreidingstelling. Je krijgt een melding op je telefoon. Een label "goedgekeurd" of "afgewezen" is je besluit; aanpassen kan in het issue.
- Niet in de publieke repo: daar zouden concepten openbaar zijn.

### 5. Plaatsen

- **Bluesky:** na het label "goedgekeurd" automatisch, via de officiële API met een app-wachtwoord als geheim.
- **Instagram, TikTok, YouTube en LinkedIn:** met de hand. Hun API's vragen een zakelijk account en een eigen beoordeling. De wachtrij levert het bestand en het bijschrift kant-en-klaar.
- **Correctie:** een fout in een geplaatste video wordt verwijderd, en de correctie komt in het wijzigingslog van de site.

## Volgorde en schatting

1. Signalen en score, met tests, als stap na Ververs. Uitvoer: een lijst kandidaten.
2. Concepttekst met de Claude API, met de controles.
3. Render in GitHub Actions en de wachtrij in de private repository.
4. Plaatsen op Bluesky na goedkeuring.
5. Tractie uit nieuwsfeeds en Bluesky.

Grof: 10 tot 16 uur werk aan mijn kant. Voor jou: een Claude API-sleutel met een budget, een Bluesky-account met een app-wachtwoord, en het beoordelen per kandidaat (een paar minuten).

## Open vragen voor Niels

1. Hoe vaak: hooguit één video per dag, of een vaste reeks per week?
2. Akkoord met de wachtrij in een private repository?
3. Bluesky automatisch plaatsen na goedkeuring, of ook daar met de hand?
4. Budget voor de Claude API (voorstel: een maandlimiet van 10 euro)?
