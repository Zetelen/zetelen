# Jouw lijst: wat nog op je wacht

Bijgewerkt op 26 oktober 2026, 's avonds. Hier staat alleen wat nog open is. **Voor dinsdag 27 oktober staat een dagplan klaar: [morgen.md](morgen.md).** Wat beantwoord of gedaan is, met je antwoorden en wat ik ermee deed, staat in [afgehandeld.md](afgehandeld.md).

**Zo antwoord je:** in de chat, met de code. Bijvoorbeeld "C1: klopt", "C4: A" of "K7: omschrijving ritueel slachten aanpassen". Ik verwerk het, en het punt verhuist naar afgehandeld.md.

## Overzicht

| | Wat | Soort | Houdt de livegang op? | Waar |
|---|---|---|---|---|
| ☑ C1 tot en met C6 | Controles: alle zes afgerond op 27 oktober 2026 (uitkomst in controles-uitkomst-2026-10-27.md) | klaar | nee | [controles-stappenplan.md](controles-stappenplan.md) |
| ☐ K1, K2, K3, K5 | Opnieuw bekijken na de aanpassingen: Onderwerpen, Oppositiewerk, voorpagina, Kamerleden | bekijken | ja, voor het label concept | hieronder |
| ☐ K7 | Uitgelicht: omschrijvingen en spreiding | bekijken | nee | hieronder |
| ☐ K9 | Nieuw: Hoe lang duurt een wet?, Tegen het advies in (B18), en een eigen beeld per stemming op Uitgelicht | bekijken | nee | hieronder |
| ☐ K10 | Stemgenoten (concept): 25 stellingen nakijken, 8 gemarkeerd met "nakijken" | controleren | ja, voor Stemgenoten | [stemgenoten-controle.md](stemgenoten-controle.md) |
| ☐ S4 | Stemgenoten: twee meelezers met een andere politieke kleur vragen, en de naam controleren in het merkenregister (boip.int) | uitvoeren | ja, voor Stemgenoten | hieronder |
| ☐ B20 | Prestaties: koplettertype lichter maken of zo laten (advies: zo laten) | besluit | nee | hieronder |
| ☐ S5 | Claude API-sleutel met maandlimiet (voor de pipeline, na de feedbackrondes) | uitvoeren | nee | [morgen.md](morgen.md) |
| ☐ L1 | Bij de livegang: sitemap indienen en PageSpeed draaien | uitvoeren | nee, na de livegang | hieronder |

## Je feedback van 26 oktober (mail)

Volledig in [feedback-2026-10-26.md](feedback-2026-10-26.md). Alles uit ronde 1, 2 en 3 is verwerkt en live, behalve de pipeline (wacht op je feedbackrondes). De K-punten hieronder blijven open tot je de nieuwe versie hebt gezien.

## C. Controles (morgen)

Alles staat met stappen, tijden en wat te doen als iets niet klopt in [controles-stappenplan.md](controles-stappenplan.md). C4 is besloten (A, 27 oktober) en verwerkt in migratie 023; Migreer en Ververs volgen na akkoord.

## K. Bekijken op de site

### ☐ K1, K2, K3, K5. Opnieuw bekijken na de aanpassingen

Je feedback is verwerkt (zie afgehandeld.md). Kijk of het nu goed is:
- **K1 Onderwerpen** (https://zetelen.nl/onderwerpen): is het één geheel? De stemming over het asielplan opent, daarna "Nu jij"; dossiers en stemmingen klappen uit.
- **K2 Oppositiewerk** (https://zetelen.nl/oppositie): leesbaar, en loopt de overgang naar hoofdstuk 5?
- **K3 Voorpagina** (https://zetelen.nl): klopt de volgorde van de hoofdstukken, en mist er een overgang?
- **K5 Kamerleden** (https://zetelen.nl/kamerleden) en het blok zetelwerk op een fractiepagina (bijvoorbeeld https://zetelen.nl/fracties/d66): klopt het beeld?

Bekend: de spreiding op Oppositiewerk is op de telefoon nog klein.

### ☐ K7. Uitgelicht: zeven stemmingen van dichtbij

https://zetelen.nl/uitgelicht. Alle uitslagen zijn nagekeken tegen de besluittekst in de bron. Na te kijken:
- **De omschrijvingen** zijn met de hand geschreven en neutraal bedoeld. Lees vooral die over ritueel slachten (2011: wat mocht toen) en over het behandelvoorbehoud (2025: wat houdt het in).
- **Staken van stemmen** (studievoorschot, 2018): de uitleg dat de Kamer bij staken opnieuw stemt, komt uit het Reglement van Orde, niet uit de data.
- **Kabinetten** komen uit de kabinetstabel (C5). Bij Mercosur staat daardoor: kabinet-Schoof is demissionair en bestaat nog uit VVD en BBB.
- **Het behandelvoorbehoud** (2025Z05204) is formeel een brief van een commissie; de bron noemt BBB als indiener, en zo staat het er.

Vraag: kloppen de omschrijvingen, en is de spreiding over partijen goed zo?

### ☐ K9. Nieuw op Uitgelicht (26 oktober)

- **Hoe lang duurt een wet?** https://zetelen.nl/uitgelicht/hoe-lang-duurt-een-wet: drie wetten als reis (13 dagen, 6 maanden, 6 jaar), op één tijdas, en alle 1.979 wetsvoorstellen uit 2010 tot en met 2022 naar doorlooptijd. Gegevens met `pipeline/wet_reis.py`. Na te kijken: de korte omschrijvingen van de drie wetten (met de hand), en of je deze drie voorbeelden goed vindt.
- **Tegen het advies in** https://zetelen.nl/uitgelicht/tegen-het-advies-in: 1.918 moties die het kabinet ontraadde en die de Kamer toch aannam (12% van alle aangenomen moties sinds april 2019), per kabinet en naar indiener. Gegevens met `pipeline/ontraden.py`. Opvallend: onder kabinet-Jetten 5%, eerder 12 tot 15%.
- **Eigen beeld per stemming:** weegschaal (gehandicaptenzorg, live-weddenschappen), hoefijzer (Mercosur), van dichtbij (PvdA bij ritueel slachten). Zelfde keuze als bij de video's.

## B. Besluiten

### ☐ B20. Prestaties: het koplettertype lichter maken?

Na de nachtelijke ronde: mobiel 92 op de voorpagina en 91 op Oppositiewerk (was 87). De grootste resterende vertraging is het koplettertype Newsreader: met de as voor optische grootte is het bestand 130 kB, en de koppen wachten erop.

- **A. Zo laten.** 92 is goed; de koppen houden hun huidige vorm.
- **B. Zonder de optische-grootte-as.** Een kleiner bestand en een snellere eerste weergave van de koppen, maar grote koppen worden iets minder verfijnd (de letters zijn dan dezelfde snede als bij kleine tekst).

**Advies: A**, tenzij je merkt dat de site op je telefoon traag aanvoelt. Het verschil zit vooral in de gesimuleerde meting op een langzame verbinding.

## S. Stappen voor jou

### ☐ S4. Stemgenoten: meelezers en naam

1. Vraag twee mensen die politiek anders denken dan jij om de stellingen te lezen: https://zetelen.nl/stemgenoten (concept, niet in het menu). Vraag: is er een stelling scheef, sturend of onduidelijk?
2. Zoek "Stemgenoten" op https://www.boip.int (Benelux-merkenregister). Staat het er niet als merk voor stemhulp of politieke informatie, dan is de naam vrij. Ik vond online geen stemhulp met deze naam.

## L. Bij de livegang

### ☐ L1. Na `LIVE = true`

1. Dien de sitemap in bij Google Search Console: https://zetelen.nl/sitemap.xml.
2. Draai PageSpeed Insights op de voorpagina, een fractiepagina en de coalitiebouwer.
3. Na een week of twee: kijk in Search Console onder Pagina's of er meldingen zijn.

Achtergrond: [seo-audit.md](seo-audit.md).

## Wat de livegang nog tegenhoudt

Livegang betekent: indexeren aan (`LIVE = true`), het label concept eraf waar dat mag, en de site delen.

| Punt | Stand | Wie |
|---|---|---|
| Controles C1 tot en met C3 | af: tweedekamer.nl en Handelingen (aparte agent), alles klopt | klaar |
| Controle C5 | nagelopen; besluiten verwerkt in migratie 025 | klaar |
| Bevinding uit C3: twee besluiten op dezelfde dag | opgelost in migratie 024 | klaar |
| Afwijkende uitslagen (C4) | A gekozen, migratie 023 klaar; Migreer en Ververs na akkoord | ik |
| Test bewaking (C6) | klaargezet | jij, morgen |
| Label concept per pagina | wacht op K1, K2, K3, K5 | jij, daarna ik |
| Prestatie-audit | na `LIVE = true` | ik, als laatste |
