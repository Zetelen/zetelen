# Afgehandeld: besluiten, stappen en terugkoppeling

Alles uit [te-beoordelen.md](te-beoordelen.md) dat beantwoord of gedaan is, met je antwoorden en wat ik ermee deed. Hier hoef je niets mee: het is het archief, zodat de lijst met open punten kort blijft. Nieuwste afgehandelde punten komen bovenaan in "Recent".

## Recent

- **26 oktober, T1 feedbackformulier getest door Niels**: formulier ingevuld, het antwoord staat in Supabase.
- **26 oktober, SEO-audit verwerkt** (`3ea05fb`): sitemap, canonicals, vast domein, H1, structured data, titels, permanente omleidingen. Zie [seo-audit.md](seo-audit.md). Licentie: bewust nog niet gekozen (geen noodzaak).
- **26 oktober, video's**: alle formats in de flitsende stijl, ook het vaste format; behandelvoorbehoud zonder hoefijzer; lopende tekst schuift van links in (`b586016`, `a4dbe04`).
- **26 oktober, C4 voorbereid**: de drie aannames nagelopen in de API; zie [controles-stappenplan.md](controles-stappenplan.md).

## Werklijst van Claude (uit je antwoorden van 26 oktober)

In deze volgorde; ☑ is gebouwd, getest en live.

1. ☑ Kleine tekstpunten: 404 (B10), "Hoe lees je dit?" (B9c), /over (B15 en knipoog 3), reactietermijn (B6)
2. ☑ Kamerleden achter een conceptvlag (B1; `KAMERLEDEN` in `web/lib/site.ts`, nu aan). Labels concept per pagina (B7): Privacy kan eraf zodra je de nieuwe tekst ziet; de rest volgt per pagina
3. ☑ Menuknop op de telefoon (B8), Vercel Analytics in de code (B5)
4. ☑ Eigen feedbackformulier op /feedback, opslag in `beheer.feedback` (migratie 021), bewaartermijn 12 maanden, privacytekst (B13, B3). Jouw test: vul het formulier één keer in en kijk in Supabase (Table Editor, schema beheer, tabel feedback) of je antwoord er staat
5. ☑ Onderwerpen (K1), voorpagina met de nieuwe opening (B14, K3), Oppositiewerk breed (K2). Graag opnieuw bekijken: K1, K2 en K3. Bekend: de spreiding is op de telefoon nog klein
6. ☑ Kamerleden: strakkere tabel met rol als kolom, ranglijst op aandeel aangenomen per rol (vanaf 10 stukken, met twee lezingen), schakelaar tabel of spreidingsdiagram (K5, B2); fractiepagina: klik op een fractie en de onderwerpen klappen uit, tot op dossier en stemming (K5). Graag bekijken: K5
7. ☑ Lezingen bij de tool (B4): lezing 3 in de verkenner zodra je een kabinetsfractie kiest, lezing 1 en 2 in de coalitiebouwer bij een groep zonder meerderheid, lezing 6 bij Onderwerpen als je Asiel openklapt. De cijfers rekenen mee met je keuze. De proefpagina /lezingen verwijst nu naar de voorpagina. Ook nieuw: de hero met het Binnenhof op de voorpagina
8. ☑ Reeks "Uitgelicht" op /uitgelicht (B16): zes hoofdelijke stemmingen en de motie-Eerdmans, elk met een eigen pagina; script `pipeline/stemming_casus.py` maakt de gegevens per zaaknummer. Graag bekijken: K7. Kliktabel afwijkende uitslagen (C4): ☑ klaargezet, met een besluit voor jou
9. ☑ Stappen voor jou uitgeschreven: S1 tot en met S3 hieronder, en door jou gedaan (26 oktober)

## Stappen voor jou (uit B5, B11 en B12)

### ☑ S1. Bezoekersstatistieken aanzetten in Vercel (B5)

> **Gedaan door Niels (26 oktober):** aangezet, en de eerste bezoeken zijn zichtbaar in Vercel.

De code staat er al, maar Vercel telt pas als jij het aanzet.
1. Ga naar vercel.com, open het project zetelen en klik bovenaan op **Analytics**.
2. Klik op **Enable**. Kies het gratis plan als Vercel ernaar vraagt.
3. Open de site en klik een paar pagina's aan. Na een paar minuten zie je de eerste bezoeken onder Analytics.

Gaat het mis? Zie je na een uur nog niets, laat het me weten. Dan kijk ik of de site de juiste versie draait.

### ☑ S2. zetelen.nl aan de site koppelen (B11)

> **Gedaan door Niels (26 oktober), nagekeken door Claude:** https://zetelen.nl werkt, www.zetelen.nl verwijst door, en de sitemap en de deelafbeelding gebruiken het nieuwe adres.

1. **Vercel:** project zetelen, **Settings**, **Domains**. Voeg `zetelen.nl` toe en daarna `www.zetelen.nl`. Kies bij www dat het doorverwijst naar zetelen.nl.
2. Vercel toont nu per domein welke DNS-records nodig zijn: meestal een **A-record** voor zetelen.nl en een **CNAME** voor www. Laat dat scherm openstaan.
3. **TransIP:** log in, ga naar **Domeinen**, `zetelen.nl`, tabblad **DNS**. Zet de schakelaar "TransIP-instellingen" uit als die aan staat; anders blijven de oude records staan. Voeg de records toe met precies de waarden die Vercel toont, en verwijder bestaande A- en CNAME-records voor `@` en `www`.
4. Wacht. Meestal is het binnen een uur klaar, soms duurt het tot een dag. In Vercel wordt het domein dan groen (Valid Configuration), en het https-certificaat regelt Vercel zelf.
5. Zeg het mij als het groen is. Dan controleer ik de deelafbeeldingen en de sitemap, want die gebruiken het hoofdadres.

Gaat het mis? Blijft Vercel "Invalid Configuration" zeggen, controleer dan of er nog een oud A-record in TransIP staat. Er mag er maar één zijn. De site op zetelen.vercel.app blijft intussen gewoon werken.

### ☑ S3. Push protection aanzetten op GitHub (B12)

> **Gedaan door Niels (26 oktober), nagekeken door Claude:** secret scanning en push protection staan aan.

1. Ga naar github.com/Zetelen/zetelen, **Settings**.
2. In het menu links: **Advanced Security** (bij sommige accounts heet het **Code security**).
3. Zet bij **Secret Protection** de schakelaar **Push protection** aan.

Gaat het mis? Zie je de optie niet, dan heb je waarschijnlijk geen beheerrechten op de organisatie Zetelen. Het werkt verder zonder: gitleaks blijft controleren na elke push.

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

## K. Bekijken op de site (afgehandeld)

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
