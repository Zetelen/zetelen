# Jouw lijst: te beoordelen door Niels

Bijgewerkt op 26 oktober 2026, met je antwoorden van die middag erin (☑ = beantwoord). Alles wat op jou wacht, in drie soorten:

- **B. Besluiten.** Jij kiest. Per besluit staan de opties en mijn advies.
- **C. Controleren.** Jij klikt naar de bron en zegt of het klopt.
- **K. Bekijken.** Jij kijkt op de site en zegt of het goed is, of wat anders moet.

**Zo antwoord je:** in de chat, met de code. Bijvoorbeeld "B1: A", "B4: A, maar zonder lezing 6", "C1: klopt" of "K2: labels nog te klein". Ik zet je antwoord erbij en vink het af (☐ wordt ☑). Onderaan, in D, staat wat ter informatie is: daar hoef je niets mee.

Volgorde: B1 tot en met B3 en C1 en C2 houden de livegang het meest op. Nieuw sinds de vorige versie: B14 tot en met B16. De rest kan in elke volgorde.

## Werklijst van Claude (uit je antwoorden van 26 oktober)

In deze volgorde; ☑ is gebouwd, getest en live.

1. ☑ Kleine tekstpunten: 404 (B10), "Hoe lees je dit?" (B9c), /over (B15 en knipoog 3), reactietermijn (B6)
2. ☑ Kamerleden achter een conceptvlag (B1; `KAMERLEDEN` in `web/lib/site.ts`, nu aan). Labels concept per pagina (B7): Privacy kan eraf zodra je de nieuwe tekst ziet; de rest volgt per pagina
3. ☑ Menuknop op de telefoon (B8), Vercel Analytics in de code (B5)
4. ☑ Eigen feedbackformulier op /feedback, opslag in `beheer.feedback` (migratie 021), bewaartermijn 12 maanden, privacytekst (B13, B3). Jouw test: vul het formulier één keer in en kijk in Supabase (Table Editor, schema beheer, tabel feedback) of je antwoord er staat
5. ☑ Onderwerpen (K1), voorpagina met de nieuwe opening (B14, K3), Oppositiewerk breed (K2). Graag opnieuw bekijken: K1, K2 en K3. Bekend: de spreiding is op de telefoon nog klein
6. ☐ Kamerleden: strakkere tabel, ranglijst op aandeel aangenomen per rol, spreidingsdiagram (K5, B2); fractiepagina met onderwerpen die uitklappen (K5)
7. ☐ Vaste lezingen en dynamische lezingen in de tools (B4)
8. ☐ Reeks casussen "één stemming uit elkaar gehaald" (B16), kliktabel afwijkende uitslagen (C4)
9. ☐ Stappen voor jou: zetelen.nl koppelen (B11), push protection (B12), Analytics aanzetten in Vercel (B5)

## B. Besluiten

### ☑ B1. Kamerleden met namen bij de livegang

In het plan hoort de pagina Kamerleden bij R3. Ik heb hem in de nacht gebouwd, als concept. Hij staat niet in het menu, maar wel in de sitemap, en is bereikbaar via Oppositiewerk, de fractiepagina's en de tegels.

- **A. Achter een conceptvlag** (zoals `LIVE`): in productie weg, met alle links ernaartoe. Aan zodra B2 en B3 besloten zijn.
- **B. Alleen uit de sitemap**: de links blijven, de pagina blijft vindbaar.
- **C. Mee live zoals hij nu is.**

**Advies: A.** Namen met tellingen per Kamerlid lezen als een ranglijst, ook zonder ranglijst. En een Kamerlid dat bezwaar maakt, moet een antwoord krijgen dat al vastligt (B3). Het verhaal van R1 werkt zonder deze pagina.

Jouw besluit: A (26 oktober 2026).

### ☑ B2. Ranglijsten van individuele Kamerleden

Open besluit uit het plan. Nu: zoeken op naam en sorteren binnen een fractie, geen ranglijst over de hele Kamer.

- **A. Zo laten:** geen ranglijst over de hele Kamer.
- **B. Ook een ranglijst over de hele Kamer**, apart voor kabinet en oppositie.
- **C. Helemaal niet sorteren op aantallen**, alleen op naam.

**Advies: A.** Een Kamerbrede ranglijst maakt van tellingen een oordeel ("wie is de beste"), en dat botst met onpartijdig. Binnen een fractie vergelijk je gelijken.

Jouw besluit: B, maar objectief: sorteren op uitkomst, niet op aantal. Uitgewerkt (26 oktober): aandeel eigen moties aangenomen, apart voor kabinet en oppositie, alleen Kamerleden met minstens 10 ingediend.

### ☑ B3. Wat doen we als een Kamerlid vraagt om gegevens te verwijderen?

Open besluit uit het plan. Nodig zodra er namen live staan (B1).

- **A. Gegevens blijven staan, fouten herstellen we.** Het zijn openbare stemmingen en stukken uit een openbare bron (CC0). Een fout herstellen we binnen de reactietermijn (B6) en melden we op /wijzigingen. Op /privacy komt een contactadres.
- **B. Op verzoek alleen de naam verbergen**, de fractie blijft.
- **C. Op verzoek alles van dat Kamerlid weghalen.**

**Advies: A**, met een kanttekening: ik ben geen jurist. Laat dit toetsen voordat de namen live gaan.

Jouw besluit: A (26 oktober 2026). Melden kan via het eigen feedbackformulier (B13).

### ☑ B4. Welke lezingen komen vast in het verhaal?

Kijk op https://zetelen.vercel.app/lezingen (niet in het menu). Achtergrond: [lezingen-kandidaten.md](lezingen-kandidaten.md).

- **A. Alle vier van de proefpagina:** 3 (eens of regeerakkoord), 1 en 2 (steun voor een minderheidskabinet) en 6 (asiel).
- **B. Een deel daarvan** (noem welke).
- **C. Andere uit de kandidatenlijst** (noem welke).

**Advies: A.** Na je keuze bouw ik de dynamische lezingen in de tools. Daarna kan het label concept van de coalitiebouwer eraf (die wacht op E2-S10).

Jouw besluit: A (26 oktober 2026).

### ☑ B5. Bezoekers meten (analytics)

Nodig om de 500 bezoekers per maand te meten.

- **A. Vercel Web Analytics:** zonder cookies, zit bij de hosting, 50.000 events per maand in het gratis plan.
- **B. Een andere privacyvriendelijke dienst** (betaald, aparte dienst).
- **C. Niet meten bij de livegang**, later beslissen.

**Advies: A.** Het eenvoudigste: geen extra dienst, geen cookiebanner. Let op: een event is geen unieke bezoeker. "500 bezoekers" wordt dan bijvoorbeeld 500 bezoeken per maand.

Jouw besluit: A. Mocht het ooit nodig zijn, dan B.

### ☑ B6. Reactietermijn op een foutmelding (E7-S2)

Staat straks op /methodiek: hoe snel reageren we als iemand een fout meldt?

- **A. Binnen 5 werkdagen.**
- **B. Binnen 2 werkdagen.**
- **C. Geen termijn noemen**, alleen "zo snel als we kunnen".

**Advies: A.** Haalbaar naast je werk, en toch een belofte.

Jouw besluit: A (26 oktober 2026).

### ☑ B7. Wanneer gaat het label "concept" eraf, en waarvan?

- **A. Per pagina, zodra de controles erbij af zijn:**
  - Verkenner, Fracties en Onderwerpen na jouw blik (K-punten);
  - Coalitie na B4;
  - Oppositiewerk na de verbetering voor de telefoon;
  - Kamerleden pas na B1 tot en met B3.
- **B. Alles tegelijk bij de livegang.**

**Advies: A.** Zo blokkeert de traagste pagina de rest niet.

Jouw besluit: A (26 oktober 2026).

### ☑ B8. Het menu

Nu zeven onderdelen: Verkenner, Onderwerpen, Coalitie, Oppositie, Fracties, Methodiek, Over. Op de telefoon lopen ze over twee regels.

- **A. Zo laten.**
- **B. Korter:** Methodiek en Over naar de voet van de pagina, vijf in het menu.

**Advies: A.** Methodiek hoort zichtbaar te zijn bij een site die op eerlijk tellen leunt.

Jouw besluit: A. Op de telefoon een menuknop in plaats van twee regels (uitwerking Claude, op je vraag naar een dropdown).

### ☑ B9. Drie woordkeuzes uit de stijlgids

Uit [tone-of-voice.md](../ontwerp/tone-of-voice.md):

- **B9a. "Fractie" of "partij"?**
  - A: "fractie" in de tools, "partij" waar het om de partij zelf gaat.
  - B: overal "partij", behalve bij afsplitsingen.
  - Advies: A, omdat een afsplitsing een fractie is maar geen partij.
- **B9b. "Eén VVD-Kamerlid" bij een hoofdelijke stemming, zonder naam?**
  - A: zo laten.
  - B: "één lid van de VVD-fractie".
  - Advies: A.
- **B9c. Labels in hoofdletters ("ZO LEES JE DIT")?**
  - A: houden als ontwerpelement.
  - B: vervangen door een vraag ("Hoe lees je dit?").
  - Advies: A.

Jouw besluit: a: A. b: A. c: B, alleen voor uitleglabels: "ZO LEES JE DIT" wordt "Hoe lees je dit?". Kleine labels boven koppen blijven.

### ☑ B10. Drie knipogen in de teksten

Per knipoog ja of nee. Overzicht van alle teksten: [alle-teksten.md](../teksten/alle-teksten.md).

1. 404: "Hier is nooit gezeteld."
2. /wijzigingen: "Er zijn nog geen correcties. We blijven natellen."
3. /over: "Er zit geen organisatie of partij achter, alleen nieuwsgierigheid."

**Advies: ja op alle drie.**

Jouw besluit: 1: niet deze; de 404 wordt "Het zetelt hier niet echt." 2: eens. 3: eens, maar zonder knipoog vanwege B15.

### ☑ B11. Naam en domein

Nog niet gecontroleerd: merkenregister, betekenis van het woord, zoekresultaten. Domein nog niet geregistreerd.

- **A. Voor de livegang:** naam controleren en een domein registreren.
- **B. Later:** eerst live op zetelen.vercel.app.

**Advies: A** als je de site breed gaat delen, want een adres wisselen na het delen kost bezoekers. **B** is goed voor de feedbackronde.

Jouw besluit: A. zetelen.nl is geregistreerd bij TransIP; merkenregister gecontroleerd door Niels. Volgende stap: het domein aan Vercel koppelen.

### ☑ B12. Push protection van GitHub aanzetten

Blokkeert een geheim al voor de push. Onze scan (gitleaks) vindt het pas erna. Instelling in GitHub: Settings, Code security, Push protection.

- **A. Aanzetten.**
- **B. Niet.**

**Advies: A.** Kost niets, en de repo is publiek.

Jouw besluit: A. Niels zet het aan.

### ☑ B13. Wat ik van je nodig heb voor de feedbackronde (geen keuze, aanleveren)

- de link naar je vragenlijst (voor de feedbackknop, `FEEDBACK_URL`);
- de naam van de dienst en de bewaartermijn (voor de privacytekst).

### ☑ B14. De opening van de voorpagina (tekstvoorstel)

Jouw richting: eerst het beeld van een verdeelde Kamer, dan de vraag waar ze elkaar wel vinden, een uitnodiging om zelf te zoeken, en dan "Maar eerst: hoe zijn we hier gekomen?". Als vraag, niet als stelling, met twee lezingen. Cijfers nagekeken op 26 oktober 2026 (`api.zetelwerk_periode`). Op de site rekent de pagina ze elke dag opnieuw uit, want Jetten loopt nog.

> **Ruzie, ophef, de waan van de dag.** Wie het nieuws volgt, ziet een verdeelde Kamer en een politiek die op slot zit. Maar wat zie je als je de stemmingen telt?
>
> Onder kabinet-Jetten nam de Kamer 2.017 van de 3.471 moties aan. Bij 1.785 daarvan stemde ten minste één fractie uit het kabinet én één uit de oppositie voor. De oppositie kreeg de helft van haar moties erdoor. Onder Rutte I en II was dat 31%.
>
> Twee lezingen. *Er wordt meer samengewerkt dan het lijkt.* Of: *een motie kost niets: een kabinet stemt makkelijk in met een verzoek, en de echte strijd zit in de wetten.* En op sommige thema's, zoals asiel, staan de flanken lijnrecht tegenover elkaar.
>
> **Zoek zelf waar ze elkaar vinden, en waar niet.** [Wie stemt met wie?] [Waar zijn ze het over eens?] [Kun jij er 76 vinden?]
>
> **Maar eerst: hoe zijn we hier gekomen?**

- **A. Zo.**
- **B. Zo, met aanpassingen** (noem ze).
- **C. Anders** (zeg hoe).

Nieuw voorstel voor de tweede lezing:

> *Breed is niet diep.* Over een verzoek om een onderzoek of een brief is de Kamer het snel eens. Waar het om geld en koers gaat, bij de begroting en de grote wetten, staan kabinet en oppositie nog steeds vaak tegenover elkaar.

Jouw besluit: B: zo, met een betere tweede lezing dan "een motie kost niets". Zie het nieuwe voorstel hieronder.

### ☑ B15. Tekst voor /over: wie maakt dit (tekstvoorstel)

> **Wie maakt dit?** Zetelen is een hobbyproject van [jouw naam], data-analist. Ik ben lid van Volt. Juist daarom zijn de regels streng:
> - alle cijfers komen uit de open data van de Tweede Kamer;
> - voor elke fractie gelden dezelfde rekenregels; ze staan op de methodiekpagina, en de code is openbaar;
> - bij elk cijfer staan twee lezingen, en jij kiest;
> - fouten herstel ik, en ze komen op /wijzigingen.
>
> Zie je toch een scheve formulering of een fout? Meld het, dan kijk ik ernaar.

Let op: dit botst met knipoog 3 uit B10 ("Er zit geen organisatie of partij achter, alleen nieuwsgierigheid"). Voorstel: die zin wordt "Er zit geen organisatie of partij achter dit project.", zonder knipoog.

- **A. Zo**, en knipoog 3 aangepast.
- **B. Zo, met aanpassingen** (noem ze).
- **C. Lidmaatschap toch niet noemen.**

Jouw besluit: eigen tekst van Niels:

> **Wie maakt dit?** Zetelen is een hobbyproject van Niels Stol, data-analist. Ik wil de informatie zo objectief mogelijk brengen, maar ik ben wel lid van Volt. Daarom heb ik een aantal strenge regels voor mezelf opgesteld:
> - alle cijfers komen uit de open data van de Tweede Kamer;
> - voor elke fractie gelden dezelfde rekenregels; ze staan op de methodiekpagina, en de code is openbaar;
> - bij elk cijfer staan twee lezingen, en jij kiest;
> - fouten herstel ik, en ze komen op /wijzigingen.
>
> Zie je toch een scheve formulering of een fout? Of heb je suggesties voor nieuwe analyses of invalshoeken? Meld het, dan kijk ik ernaar.

(Claude veranderde alleen "Data-Analist" in "data-analist" en maakte er één zin van.)

### ☑ B16. De casus die Onderwerpen opent

Nu: de stemming over het asielplan (motie-Eerdmans, 10 juni 2025), waarin de PVV tegen het uitvoeren van het eigen plan stemt. Dat klopt, maar het is een steek naar één kant. De graphic vraagt een hoofdelijke stemming. Ik zocht die sinds 2016 waarin fracties onderling verdeeld stemden (`db/controles/casussen_hoofdelijk.sql`). Dat zijn vooral medisch-ethische wetten:

| Datum | Zaak | Uitslag | Fracties die verdeeld stemden |
|---|---|---|---|
| 13-09-2016 | [Donorwet (actieve donorregistratie)](https://www.tweedekamer.nl/zoeken?qry=2012Z22373) | 75 voor, 74 tegen | 2 |
| 10-02-2022 | [Afschaffen verplichte bedenktermijn abortus](https://www.tweedekamer.nl/zoeken?qry=2021Z03572) | 101 voor, 38 tegen | 3 |
| 16-12-2025 | [Embryowet (verbod op embryo's kweken voor onderzoek)](https://www.tweedekamer.nl/zoeken?qry=2023Z15369) | 90 voor, 59 tegen | 2 |

Kanttekening: alle drie zijn initiatiefwetten met D66 als (mede)indiener. Een andere angel dan bij de PVV, maar wel een angel.

- **A. De Donorwet:** één stem verschil, fracties gaan dwars door elkaar heen. Het past bij "waar vinden ze elkaar", en de stemming is bij velen bekend. Nadeel: 2016.
- **B. Wisselend:** bij elk bezoek een andere van een vaste set (de drie hierboven en de motie-Eerdmans), met de set op de methodiekpagina.
- **C. Zo laten.**

**Advies: A.** De stemming laat het beste zien wat de graphic wil laten zien: dat een fractie niet altijd één blok is. En ze heeft geen verliezer die je kunt aanwijzen.

Jouw besluit: C: de motie-Eerdmans blijft. Werk de andere voorbeelden op dezelfde manier uit, op een eigen plek op de site, en zoek er meer, ook van andere partijen. Later ook als explainervideo's.

Jouw besluit: Claude stelt de vragenlijst op en kiest de dienst: een eigen formulier op de site, opslag in de eigen database, geen externe dienst.

## C. Controleren

> **Stand 26 oktober:** nog open. De ingevulde antwoorden zeiden bij de meeste rijen "nog niet volledig geverifieerd". Rij 5 leek een datumfout (8 tegen 13 december 2016): de motie is op 8 december ingediend en op dinsdag 13 december in stemming gebracht, en wij tonen de stemdatum, dus dat klopt. De site van berthub (tkconv) is geen onafhankelijke bron: die leest dezelfde API. Voorstel: open drie rijen zelf op tweedekamer.nl bij de stemmingsuitslagen.

### ☐ C1. Steekproef uitslagen (E7-S5, 10 besluiten)

Ik heb elke rij al naast de bron gelegd: alle tien kloppen (dezelfde uitslag, dezelfde zetels, dezelfde fracties aan elke kant). Jij: klik op het zaaknummer, kijk op tweedekamer.nl en zet een vinkje. De kolom "Kleinste kant" noemt de fracties aan de kant met de minste zetels; dat is het snelst te controleren. Eenmansfracties en groepen met de naam van een persoon staan er zonder naam in. Vaste steekproef: `db/controles/klik_uitslagen.sql`.

| # | Datum | Zaak | Wij | Bron (besluittekst, zetels) | Kleinste kant (wij, gelijk aan de bron) | Klopt? (jij) |
|---|---|---|---|---|---|---|
| 1 | 26-01-2010 | [2010Z00939](https://www.tweedekamer.nl/zoeken?qry=2010Z00939) motie | aangenomen, 85 tegen 65 | Aangenomen, 85 tegen 65 | tegen: GL, PVV, SGP, SP, VVD en 1 eenmansfractie | ☐ |
| 2 | 11-06-2013 | [2013Z11750](https://www.tweedekamer.nl/zoeken?qry=2013Z11750) motie | verworpen, 27 tegen 123 | Verworpen, 27 tegen 123 | voor: 50PLUS, ChristenUnie, PvdD, SGP, SP | ☐ |
| 3 | 20-02-2014 | [2014Z03255](https://www.tweedekamer.nl/zoeken?qry=2014Z03255) motie | verworpen, 37 tegen 113 | Verworpen, 37 tegen 113 | voor: 50PLUS, GL, PvdD, PVV, SP | ☐ |
| 4 | 25-11-2014 | [2014Z21517](https://www.tweedekamer.nl/zoeken?qry=2014Z21517) motie | aangenomen, 119 tegen 31 | Aangenomen, 119 tegen 31 | tegen: GrBvK, PvdD, PVV, SP | ☐ |
| 5 | 13-12-2016 | [2016Z23468](https://www.tweedekamer.nl/zoeken?qry=2016Z23468) motie | verworpen, 36 tegen 113 | Verworpen, 36 tegen 113 (1 fractie niet deelgenomen) | voor: 50PLUS, GL, GrKÖ, PvdD, PVV, SP | ☐ |
| 6 | 19-06-2018 | [2018Z11433](https://www.tweedekamer.nl/zoeken?qry=2018Z11433) motie | verworpen, 71 tegen 79 | Verworpen, 71 tegen 79 | tegen: CDA, ChristenUnie, D66, SGP, VVD | ☐ |
| 7 | 22-09-2020 | [2020Z15847](https://www.tweedekamer.nl/zoeken?qry=2020Z15847) motie | aangenomen, 98 tegen 52 | Aangenomen, 98 tegen 52 | tegen: ChristenUnie, D66, GL, PvdA, PvdD en 1 eenmansfractie | ☐ |
| 8 | 08-12-2020 | [2020Z18763](https://www.tweedekamer.nl/zoeken?qry=2020Z18763) amendement | verworpen, 51 tegen 98 | Verworpen, 51 tegen 98 | tegen: CDA, ChristenUnie, D66, PVV, SGP, VVD | ☐ |
| 9 | 08-10-2024 | [2024Z13894](https://www.tweedekamer.nl/zoeken?qry=2024Z13894) motie | verworpen, 26 tegen 124 | Verworpen, 26 tegen 124 | voor: CDA, ChristenUnie, D66, FVD, JA21, SGP, Volt | ☐ |
| 10 | 19-05-2026 | [2026Z09643](https://www.tweedekamer.nl/zoeken?qry=2026Z09643) motie | aangenomen, 102 tegen 48 | Aangenomen, 102 tegen 48 | tegen: BBB, FVD, JA21, VVD en 1 afgesplitste groep | ☐ |

### ☐ C2. Nacontrole cohesie (E2-S2): VVD en CDA onder Schoof

Alle tien stemmen kloppen met de bron. Jij: klik en vink af. Vaste steekproef: `db/controles/klik_cohesie.sql`.

| # | Datum | Zaak | VVD (wij) | CDA (wij) | Bron VVD en CDA | Hetzelfde? | Klopt? (jij) |
|---|---|---|---|---|---|---|---|
| 1 | 08-10-2024 | [2024Z13894](https://www.tweedekamer.nl/zoeken?qry=2024Z13894) motie | tegen | voor | tegen, voor | nee | ☐ |
| 2 | 15-10-2024 | [2024Z15637](https://www.tweedekamer.nl/zoeken?qry=2024Z15637) motie | tegen | voor | tegen, voor | nee | ☐ |
| 3 | 19-11-2024 | [2024Z18629](https://www.tweedekamer.nl/zoeken?qry=2024Z18629) motie | tegen | voor | tegen, voor | nee | ☐ |
| 4 | 11-03-2025 | [2024Z15575](https://www.tweedekamer.nl/zoeken?qry=2024Z15575) motie | tegen | tegen | tegen, tegen | ja | ☐ |
| 5 | 01-04-2025 | [2025Z05727](https://www.tweedekamer.nl/zoeken?qry=2025Z05727) motie | tegen | tegen | tegen, tegen | ja | ☐ |
| 6 | 27-05-2025 | [2025Z10578](https://www.tweedekamer.nl/zoeken?qry=2025Z10578) motie | voor | voor | voor, voor | ja | ☐ |
| 7 | 03-06-2025 | [2025Z10883](https://www.tweedekamer.nl/zoeken?qry=2025Z10883) motie | tegen | tegen | tegen, tegen | ja | ☐ |
| 8 | 03-07-2025 | [2025Z14214](https://www.tweedekamer.nl/zoeken?qry=2025Z14214) motie | tegen | voor | tegen, voor | nee | ☐ |
| 9 | 02-10-2025 | [2025Z18582](https://www.tweedekamer.nl/zoeken?qry=2025Z18582) motie | voor | voor | voor, voor | ja | ☐ |
| 10 | 16-12-2025 | [2025Z21729](https://www.tweedekamer.nl/zoeken?qry=2025Z21729) motie | voor | voor | voor, voor | ja | ☐ |

De berekende cohesie voor dit paar onder Schoof: 79,7% over alle stemmingen (5.578 van 6.998) en 77,7% over de verdeelde (4.951 van 6.371). Dat de steekproef 6 van de 10 geeft, is geen tegenspraak: bij tien stemmingen en 80% is 6 of minder ongeveer 1 op 8. De controle gaat over de stemmen per rij, niet over het percentage. Geen van de tien is een hoofdelijke stemming, dus de afleiding uit de leden zit niet in deze steekproef.

### ☐ C3. Steekproef zetelwerk: kies er 5

Ik vergeleek 19 stukken met de bron: uitslag, indiener en fractie kloppen 19 van de 19 keer. Jij: kies er 5, klik op het nummer en vink af.

| Kabinet | Soort | Nummer | Onderwerp (begin) | Wij | Bron (besluittekst) | Fractie indiener volgens bron | Klopt volgens mij | Gekeken (jij) |
|---|---|---|---|---|---|---|---|---|
| Rutte I | Motie | [2010Z18649](https://www.tweedekamer.nl/zoeken?qry=2010Z18649) | ... over een tender gericht op vrouwe | verworpen (57 tegen 93) | verworpen | GroenLinks | ja | ☐ |
| Rutte I | Motie | [2011Z00574](https://www.tweedekamer.nl/zoeken?qry=2011Z00574) | ... over minimumhandhavingsstandaarden | verworpen (62 tegen 88) | verworpen | SP | ja | ☐ |
| Rutte I | Amendement | [2011Z14134](https://www.tweedekamer.nl/zoeken?qry=2011Z14134) | ... ter vervanging van | aangenomen (76 tegen 74) | aangenomen | PvdA | ja | ☐ |
| Rutte II | Motie | [2016Z07435](https://www.tweedekamer.nl/zoeken?qry=2016Z07435) | ... over een gelijk speelveld in alle l | aangenomen (149 tegen 1) | aangenomen | SP | ja | ☐ |
| Rutte II | Motie | [2016Z16595](https://www.tweedekamer.nl/zoeken?qry=2016Z16595) | ... over in beeld brengen van de ef | verworpen (34 tegen 115) | verworpen | PvdD | ja | ☐ |
| Rutte II | Amendement | [2016Z20784](https://www.tweedekamer.nl/zoeken?qry=2016Z20784) | ... over het versterken | aangenomen (121 tegen 29) | aangenomen | PvdA | ja | ☐ |
| Rutte III | Motie | [2018Z12559](https://www.tweedekamer.nl/zoeken?qry=2018Z12559) | ... over een Wsnp-traject zond | verworpen (46 tegen 104) | verworpen | SP | ja | ☐ |
| Rutte III | Motie | [2019Z24905](https://www.tweedekamer.nl/zoeken?qry=2019Z24905) | ... over het handhaven van de | aangenomen (150 tegen 0) | aangenomen | SP | ja | ☐ |
| Rutte III | Motie | [2020Z05025](https://www.tweedekamer.nl/zoeken?qry=2020Z05025) | ... over een steunpakket voor de c | aangenomen (127 tegen 23) | aangenomen | D66 | ja | ☐ |
| Rutte III | Amendement | [2019Z23148](https://www.tweedekamer.nl/zoeken?qry=2019Z23148) | ... over meer landelijke d | aangenomen (117 tegen 33) | aangenomen | VVD | ja | ☐ |
| Rutte IV | Motie | [2022Z10177](https://www.tweedekamer.nl/zoeken?qry=2022Z10177) | ... over voorstellen om de u | aangenomen (147 tegen 0) | aangenomen | CDA | ja | ☐ |
| Rutte IV | Motie | [2024Z02139](https://www.tweedekamer.nl/zoeken?qry=2024Z02139) | ... over in gesprekken met h | aangenomen (80 tegen 70) | aangenomen | SGP | ja | ☐ |
| Rutte IV | Amendement | [2022Z24409](https://www.tweedekamer.nl/zoeken?qry=2022Z24409) | ... ter vervanging van nr. 12 | aangenomen (147 tegen 3) | aangenomen | CDA | ja | ☐ |
| Schoof | Motie | [2025Z00585](https://www.tweedekamer.nl/zoeken?qry=2025Z00585) | ... over deelnemen aan de EU Talent P | verworpen (14 tegen 136) | verworpen | Volt | ja | ☐ |
| Schoof | Motie | [2024Z15582](https://www.tweedekamer.nl/zoeken?qry=2024Z15582) | ... over een plan van JenV en IenW voo | aangenomen (144 tegen 6) | aangenomen | VVD | ja | ☐ |
| Schoof | Amendement | [2025Z13261](https://www.tweedekamer.nl/zoeken?qry=2025Z13261) | ... ter vervanging (gewijzigd amendement) | aangenomen (86 tegen 64) | aangenomen | GroenLinks-PvdA | ja | ☐ |
| Jetten | Motie | [2026Z06701](https://www.tweedekamer.nl/zoeken?qry=2026Z06701) | ... over het in kaart brengen van de u | verworpen (42 tegen 108) | verworpen | GroenLinks-PvdA | ja | ☐ |
| Jetten | Motie | [2026Z19664](https://www.tweedekamer.nl/zoeken?qry=2026Z19664) | ... over een versnellingsaanpak | aangenomen (131 tegen 19) | aangenomen | D66 | ja | ☐ |
| Jetten | Motie | [2026Z03135](https://www.tweedekamer.nl/zoeken?qry=2026Z03135) | ... over aanscherping van de huid | aangenomen (105 tegen 45) | aangenomen | ChristenUnie | ja | ☐ |

Ook vergeleken: de aantallen per jaar met de telling in de API. In 2010 tellen wij 1.359 moties waarover gestemd is, de API 1.362. In de andere jaren is het verschil net zo klein: een paar stukken waarvan de stemming in de bron ontbreekt of verwijderd is.

### ☐ C4. De 8 afwijkende uitslagen (Niels: klaarzetten; staat op de werklijst van Claude)

Bij 8 van de 60.133 besluiten past de uitslag in de bron niet bij de stemmen. Bij 20 januari 2026 meldt de bron zelf dat "aangenomen" fout was. Jij: per geval zeggen of wij het goed tonen (wij volgen de stemmen). Wil je ze als kliktabel, zoals C1? Zeg "C4 klaarzetten".

### ☐ C5. Handmatige tabellen nakijken (Niels: doe ik morgen)

Deze tabellen heb ik met de hand gevuld, en ze sturen de cijfers op de site:

- **Kabinetten en coalities:** [011_coalitie.sql](../../db/migrations/011_coalitie.sql). De samenstelling en de datums van uittreden. Schoof en Jetten komen uit Wikidata, de rest uit mijn kennis.
- **Koppeltabel commissie naar beleidsterrein:** [014_onderwerpen.sql](../../db/migrations/014_onderwerpen.sql), blok `core.beleidsterrein_commissie`.
- **Trefwoorden voor beleidsterreinen:** [015_trefwoorden.sql](../../db/migrations/015_trefwoorden.sql), blok `core.beleidsterrein_trefwoord`.
- **Kamerperiodes en partijkoppeling:** in `db/migrations/003_core.sql`. Vier twijfelgevallen: GroenLinks-PvdA, PRO, DPK, Groep Markuszower.

Jij: per tabel "klopt" of wat er anders moet.

### ☐ C6. Test van de bewaking (uitvoeren; Niels: doe ik morgen)

Testen of je een mail krijgt als de verversing een dag uitblijft. De stappen staan in [onderhoud.md](../onderhoud.md). Duurt een paar minuten, plus wachten op de mail.

## K. Bekijken op de site

### ☑ K1. Onderwerpen, aangepast na je feedback

> **Jouw feedback (26 oktober):** Nee, nog geen geheel. De kop ("Waar zijn ze het over eens?") past niet bij een intro over hoe een stemming verloopt: andere kop, intro iets uitgebreider. Minder scrollen. Het bedieningspaneel bij "Nu jij" intuïtiever, en "Nu jij" prominenter, als uitnodiging. Dossiers sorteren op cohesie, van hoog naar laag.

https://zetelen.vercel.app/onderwerpen

- De stemming over het asielplan opent nu de pagina, met de kop "Eén stemming uit elkaar gehaald". Daarna komt "Nu jij", met de keuzes.
- Kies twee fracties en klik op een terrein: de dossiers klappen eronder uit. Elk dossier heeft een balk met allebei voor, verschillend en allebei tegen.
- Klik op een dossier: de stemmingen klappen uit, met de verschillen eerst.

Vraag: is het nu één geheel?

### ☑ K2. Oppositiewerk, aangepast na je feedback

> **Jouw feedback (26 oktober):** De legenda groter en direct onder de x-as. Minder scrollen. Nog steeds veel zwart en een abrupte overgang. Hoofdstuk 4 groter, over de hele pagina, als duidelijke afscheiding (uitgewerkt: brede grafiek met de kaarten eroverheen, grote hoofdstuktitels als scheiding, de brug naar 5 blijft).

https://zetelen.vercel.app/oppositie

- Hoofdstuk 4: de labels hebben een donkere rand en lopen niet meer over elkaar.
- Geen gat meer voor hoofdstuk 5: de stippen schuiven door naar de cirkel.
- Het palet heeft nu 18 tinten in plaats van 10, dus geen twee fracties meer in dezelfde kleur.

Vraag: leesbaar, en loopt de overgang?

### ☑ K3. De voorpagina als geheel

> **Jouw feedback (26 oktober):** De graphic vraagt nog iets te veel scrollen, en er is te veel ruimte tussen de graphic en de volgende kop. Verder een goed geheel. De onderdelen scheiden met een soort paginascheiding, of de hoofdstuknamen prominenter.

https://zetelen.vercel.app

Vijf hoofdstukken, dan de tegels: 1 hoe zijn we hier gekomen, 2 wie stemt er nu met wie, 3 samen in het kabinet: overal eens?, 4 kun jij er 76 vinden?, 5 en de oppositie?

Vraag: klopt de volgorde, en mist er een overgang?

### ☑ K4. Oppositiewerk als geheel

> **Jouw feedback (26 oktober):** Zie K2.

Vragen:
- werken de beelden?
- zijn de lezingenparen eerlijk en onpartijdig?
- is "een stip is 50 moties" duidelijk?

### ☑ K5. Kamerleden en het blok zetelwerk

> **Jouw feedback (26 oktober):** Kamerleden: de pil met kabinet of oppositie goed uitlijnen of als kolom; de hele tabel strakker. Ook als spreidingsdiagram, met een schakelaar tussen de weergaven. Fractiepagina: mooi; graag ook onderwerpen die uitklappen.

- Kamerleden: https://zetelen.vercel.app/kamerleden. Per fractie, dan per Kamerlid, dan de stukken. Of hij live gaat, is B1.
- Het blok zetelwerk op een fractiepagina, bijvoorbeeld https://zetelen.vercel.app/fracties/d66.

Vraag: klopt het beeld?

### ☑ K6. Teksten

> **Jouw feedback (26 oktober):** Akkoord.

- De nieuwe teksten van de nacht (Oppositiewerk, Kamerleden, zetelwerk). Ze zijn in de toon van de stijlgids geschreven, maar jij hebt ze nog niet gezien.
- De privacytekst: https://zetelen.vercel.app/privacy (concept).

Vraag: akkoord, of wat moet anders?

## D. Ter informatie (geen actie nodig)

### Wat de livegang van R1 tegenhoudt

Livegang betekent: indexeren aan (`LIVE = true`), het label concept eraf waar dat mag, en de site delen. Per punt: waar het in deze lijst staat.

| Punt | Stand | Waar |
|---|---|---|
| Lezingen kiezen en bouwen (E4) | proefpagina staat | B4, daarna ik |
| Coalitiebouwer uit concept | wacht op lezingen | B4, B7 |
| Nacontrole cohesie en steekproef uitslagen | klaargezet | C1, C2 |
| De 8 afwijkende uitslagen | open | C4 |
| Handmatige tabellen | open | C5 |
| Analytics (E3-S6) | niet gestart | B5, daarna ik |
| Reactietermijn en privacytekst | open | B6, K6 |
| Gebruiksvoorwaarden open data | klaar (CC0, op /methodiek) | |
| Test bewaking | open | C6 |
| Kamerleden met namen (R3 in het plan) | live als concept | B1, B2, B3 |
| Naam en domein | open | B11 |
| Oppositiewerk en lezingen op de telefoon | open | ik, na K4 |
| Verversing van verwijderingen | klaar (26 oktober) | |
| Prestatie-audit na `LIVE = true` | open | ik, als laatste |
| Push protection | open | B12 |

### Extra rijen bij Agendapunt en Besluit: verklaard en opgelost

**Oorzaak.** De 5 agendapunten en 4 besluiten zijn op 23 oktober 2026 in de bron verwijderd, een paar uur na onze eerste laad. Bij die verwijdering zette de bron `Verwijderd` op waar en maakte hij de koppeling naar de activiteit leeg (`Activiteit_Id` is nu leeg). De verversing vraagt wijzigingen op met het datumfilter via die koppeling (`Activiteit/Datum`) plus `ApiGewijzigdOp`. Een record zonder activiteit valt buiten dat filter, dus de verwijdering komt nooit binnen en bij ons staat het record nog als niet verwijderd.

**Hoe gevonden.** Per jaar en daarna per dag geteld, bij ons en in de API met hetzelfde filter. Het verschil zit alleen op vier dagen: 27 en 29 oktober, 2 november en 9 december 2026. De ids van die dagen naast elkaar gelegd, en de 5 losse agendapunten in de API opgevraagd. Alle vijf: verwijderd, zonder activiteit, gewijzigd op 23 oktober.

**Uitgesloten:** een datum van voor 2010; een activiteit die niet geladen of verwijderd is; verwijderde records die wij wel en de API niet meetelt (13.476 verwijderde agendapunten en 9.979 verwijderde besluiten, bij ons en in de API gelijk).

**Effect op de site: geen.** Het gaat om agendapunten van vergaderingen die nog moeten komen, zonder stemmingen. Een besluit telt bij ons alleen mee als er gestemd is. Stemming telt precies gelijk aan de API: 978.678.

**Risico.** Hetzelfde kan gebeuren met een besluit of stemming waarover al gestemd is. Dan blijft een verwijderde stemming bij ons meetellen. Dat is nu niet gebeurd, maar de verversing zou het niet merken.

**Opgelost (26 oktober 2026, akkoord Niels):** de verversing haalt verwijderde records nu ook buiten het datumfilter op: `(datumpad ge 2010 or Verwijderd eq true) and ApiGewijzigdOp ge ...`. Een Ververs met de nieuwe invoer `terug_tot=2026-10-23` haalde de gemiste verwijderingen binnen: nu 13.488 verwijderde agendapunten en 10.012 verwijderde besluiten, precies de API-telling met datumfilter plus de verwijderingen sinds 23 oktober waarbij de koppeling leeg is (12 en 33). De analyses veranderden niet (60.133 besluiten). Let op: de telling van de eerste laad (`controleer_aantal`) komt daardoor niet meer precies uit; het verschil zijn deze verwijderde records. Het oorspronkelijke voorstel: in `pipeline/ververs.py` de wijzigingen voor Agendapunt, Besluit en Stemming (en de andere entiteiten met een datumfilter via een koppeling) opvragen op `ApiGewijzigdOp` alleen, zonder datumfilter. Wijzigingen per dag zijn klein, dus dat kost weinig. Records van voor 2010 die zo binnenkomen, vallen in `core` toch buiten het datumfilter. Na de aanpassing is een Ververs nodig die terugkijkt tot 23 oktober; Migreer is niet nodig. Ik heb niets in de database hersteld.

**Namen uit dit document gehaald (26 oktober 2026, op verzoek van Niels).** In de steekproef zetelwerk staat nu de fractie van de indiener in plaats van de naam, en het onderwerp zonder de namen van de indieners. De publieke log van de Controlequery-run met fractienamen van eenmansfracties (run 40265489488) is door Niels verwijderd; de git-historie blijft zoals hij is (besluit Niels). De andere runs van vandaag geven alleen aantallen en ids.

### Verslag van de nacht van 25 op 26 oktober

**Gebouwd en live (alles met het label concept)**
- **Analyse zetelwerk** (migraties 018 en 019): moties en amendementen met indieners, de uitslag uit de stemmen, rol, brede steun en samenwerking. Goed voor 57.401 stukken en 116.906 indieningen. De herbouw duurt 23 seconden.
- **Kamerleden:** https://zetelen.vercel.app/kamerleden. Per fractie, dan per Kamerlid, dan de stukken van dat Kamerlid, met zoeken op naam.
- **Blok zetelwerk op elke fractiepagina**, met een link naar de Kamerleden van die fractie.
- **Oppositiewerk:** https://zetelen.vercel.app/oppositie. Zes hoofdstukken, met een tijdlijn van 18 stappen; alle zinnen komen uit de data.
- **Voorpagina, hoofdstuk 5 "En de oppositie?":** een staafje per jaar, met een knop naar Oppositiewerk.
- **Menu:** Oppositie erbij. Tegels voor Oppositiewerk en Kamerleden.
- **Methodiek:** een nieuwe maat "Zetelwerk", met definities, keuzes en beperkingen.
- **Losse punten opgelost:**
  - de herbouw van de verdieping duurt nu 42 seconden in plaats van 400 (migratie 020);
  - stemmingen zonder dossier staan erin, onder Overig (migratie 020);
  - bij precies 76 zetels staat er nu "precies een meerderheid" in plaats van "1 over";
  - de tegel van Onderwerpen zonder het woord "cohesie".

**Getest**
- 83 pytest en 74 vitest;
- de build en de controle op geheimen;
- de rechtencontrole en de rechtentest via de API, bij elke Migreer;
- de steekproef hierboven;
- Lighthouse, live:

  | Pagina | Prestaties | Toegankelijkheid |
  |---|---|---|
  | Oppositiewerk | 90 | 96, nu opgelost |
  | Kamerleden | 90 | 100 |
  | Voorpagina | 91 | 96, nu opgelost |

  Het verschil op 96 kwam door het lage contrast van de gedimde tekstkaarten. Die staan nu op 60% in plaats van 35%.

**Bevindingen die het verhaal sterker maken (en die je moet zien)**
- **Wie regeert, stemt het vaakst tegen.** Onder Jetten stemden de kabinetsfracties op ongeveer 45% van de stemmingen tegen, de oppositie op ongeveer 34%. Ze stemmen tegen de vele moties van de oppositie. Dit staat in hoofdstuk 4 van Oppositiewerk, als lezing. Het gaat in tegen het beeld van de "dwarse oppositie".
- **De oppositie haalt vaker iets binnen dan vroeger.** Van de oppositiemoties werd in 2010 tot en met 2012 32% aangenomen, in de laatste drie volle jaren 50%. De lezing in hoofdstuk 1 volgt nu deze data: "meer invloed" tegenover "inflatie: moties vragen vaak weinig".
- **Ook coalitiepartners verschillen.** D66 en VVD stemden onder Jetten 47 keer anders over asiel. Je ziet het via Onderwerpen, de vergelijking van D66 met VVD, en dan het terrein Asiel.

- **Een minderheidskabinet maakt voor de oppositie nauwelijks verschil.** Onder Rutte I en Jetten haalde gemiddeld 41% van de oppositiemoties het, onder de meerderheidskabinetten 40%. De tijd maakt wel verschil: van 31% onder Rutte I naar 50% onder Jetten. De tekst in hoofdstuk 3 volgt nu de data. Mijn eerdere kandidaat-lezing ("meer invloed onder een minderheidskabinet") houdt dus geen stand.
- **Ook amendementen van de oppositie halen het vaker:** van 23% onder Rutte I naar 34% onder Jetten, met 39% onder Schoof als hoogste.

**Later in de nacht nog gedaan**
- **Proefpagina lezingen** (https://zetelen.vercel.app/lezingen): de vier aanbevolen lezingen met grafieken. Lezing 2 heeft een kanttekening gekregen: een stemming is krap juist doordat weinig fracties meestemmen, dus dat de oppositie daar minder meestemt, volgt deels uit de definitie.
- **Menu op de telefoon:** liep van het scherm af ("Over" was onzichtbaar), en loopt nu door op een tweede regel.
- **Deelplaatje voor Oppositiewerk:** de groei van het aantal moties per jaar en het aandeel dat de oppositie binnenhaalt.
- **Onderwerpen en voorpagina:** terreinen met minder dan 50 stemmingen samen staan onderaan en gedimd. Koninkrijk, met 26 stemmingen en 100%, stond eerst bovenaan.
- **Kamerleden op de telefoon:** elke rij is nu een kaart, met het label bij elk getal.
- **Oppositiewerk, hoofdstuk 4:** de zinnen noemen alleen fracties met minstens 25 eigen moties, en de assen lopen over het bereik in de data.

**Correctie op wat ik eerder schreef**
Het "onbekende terrein" bij 23 van de 59 beslissende stemmingen van JA21 kwam uit mijn eigen analyse-script, dat rijen kwijtraakte bij het ophalen in pagina's. Op de site ontbrak alleen één stemming, en die staat er nu in.

**Incident, opgelost:** zes CI-runs waren rood, van commit `41b886d` tot en met `6ec9938`. Oorzaak: Oppositiewerk gaf een fout als de database niet bereikbaar was, en in CI bouwt de site zonder database. De live site op Vercel had er geen last van. Opgelost in `849ee70`: zonder ingestelde database toont de pagina een lege staat, mét database een fout, zodat de laatste goede versie blijft staan. CI is weer groen.

**Bekende beperkingen op de telefoon (nog niet opgelost)**
- Lezingen (proef): de grafieken schalen mee, maar de letters worden dan klein. Komen de lezingen vast op de site, dan maak ik er een smalle versie van.
- Oppositiewerk: werkt, maar de stippen zijn op een telefoon klein. Hoofdstuk 4 en 5 zijn op een smal scherm minder goed te lezen dan op desktop.

**Nog niet gedaan, en waarom**
- **De dynamische lezingen in de tools:** daarvoor wacht ik op jouw keuze van de lezingen.
- **Een eigen deelplaatje voor Oppositiewerk en Kamerleden:** nu gebruiken ze het algemene plaatje.
