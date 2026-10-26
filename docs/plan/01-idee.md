# 01 Idee: Tweede Kamer data-website

Status: stap 1 akkoord Niels; bijgewerkt na beoordelingsronde 1 met fasering, lezingen en extra ideeen (22 oktober 2026)

## Doel

Een publieke website (eerst Nederlands, later tweetalig) op basis van de Tweede Kamer Open Data API (OData). De site maakt stemgedrag, wetgevingsproces en Kamerleden inzichtelijk, met duiding. Het is tegelijk een portfolio-stuk onder Niels' eigen naam en een leertraject (database, geplande dataverversing, analyses, webapp).

Besluit uit eerdere ronde: geen Power BI rapport, wel een eigen website met eigen database.

## Doelgroep

- Algemeen publiek dat geinteresseerd is in politiek en data
- Secundair: recruiters en werkgevers die de site via portfolio bekijken
- Apparaten: desktop en mobiel (aanname, nog niet bevestigd)

## Functionaliteit (MVP)

Vorm: korte verhalende voorpagina met daaronder een interactieve verkenner (filteren op partij, periode, onderwerp en doorklikken).

Vier must-have analyses:

1. Cohesie-matrix van fracties: welke fracties stemmen het vaakst samen, per periode en onderwerp
2. Afwijkend stemgedrag van Kamerleden: hoe vaak wijkt een Kamerlid af van de eigen fractie (alleen mogelijk bij hoofdelijke stemmingen, te verifieren)
3. Wetgevingsproces en aanname: aantal, aanname-percentage en doorlooptijd van moties en amendementen per partij en commissie
4. Activiteitsprofiel per Kamerlid: moties, vragen en aanwezigheid, met een eigen profielpagina

Toegevoegd aan R1 (besluit Niels, 24 oktober 2026): de coalitiebouwer. De bezoeker stelt zelf een groep fracties samen, ziet in de zaal hun zetels en het totaal, en ziet voor een (fictief) minderheidskabinet bij welke andere fracties de groep in het verleden een meerderheid haalde. Terugkijkend op echte stemmingen, geen voorspelling. De keuze blijft in de browser en de URL, net als de lens. Livegang heeft geen haast (Niels).

Daarnaast (volgt uit "live en gebruikt"):

- Deelbare URL's per partij en Kamerlid
- Deelplaatjes voor social media
- Methodiekpagina waarin elke ranking en maat exact is gedefinieerd, met bronvermelding per cijfer

Scope: alle vier de analyses diep uitgewerkt, data vanaf 2010, gefaseerd opgeleverd. Elke invalshoek gaat los live. Voorgestelde volgorde (door Niels niet apart bevestigd, wel akkoord op fasering per invalshoek):

1. Cohesie-matrix van fracties. Werkt op fractiestemmen, heeft geen individuele data nodig, dus het minste risico. Dit is de eerste live-gang.
2. Wetgevingsproces en aanname
3. Kamerleden: activiteitsprofiel en afwijkend stemgedrag. Hangt af van de check op individuele stemmen, dus komt als laatste.

Expliciet niet (nu):

- Geen gebruikersaccounts en geen server-side profielen met opvattingen. Reden (door Claude aangedragen, gevolgd door Niels in zijn keuze): politieke opvattingen zijn onder de AVG een bijzondere categorie persoonsgegevens
- Geen eigen invoer van bezoekers
- Geen voorspellende modellen (aanname, nog bevestigen)

## Duiding: twee lezingen

Bij elke analyse komen twee lezingen naast elkaar, vanuit verschillende invalshoeken (bijvoorbeeld links/rechts of progressief/conservatief). Vastgelegd:

- Beide lezingen staan altijd naast elkaar zichtbaar. Er is in de eerste versie geen keuze voor een standpunt
- De lezingen hangen aan argumenten, niet aan partijen. Links/rechts en progressief/conservatief zijn twee verschillende assen, en een partij kan op de ene as anders scoren dan op de andere
- Elke lezing is de sterkste versie van het argument, niet een stropop
- De lezingen zijn handgeschreven sjablonen waarin de cijfers automatisch worden ingevuld. Niels keurt elke tekst goed voor publicatie. Geen automatisch gegenereerde duiding, geen lopende modelkosten
- Het format wordt eerst bewezen op de cohesie-matrix in de eerste live-gang, daarna uitgebreid naar de andere analyses
- Invalshoek bij de cohesiecijfers (besluit Niels, 22 oktober 2026): samenwerking tegenover profilering. Lezing A leest hoge cohesie als samenwerking en compromis, Lezing B leest hoge cohesie als gebrek aan eigen profiel. De formuleringen zijn een voorstel van Claude; Niels keurt de uiteindelijke teksten goed. Voor het wetgevingsproces en de Kamerleden zijn de paren nog niet gekozen

## Later (niet in de eerste oplevering)

- **Lens-keuze:** de bezoeker kiest een invalshoek, de keuze blijft in de browser of in de URL (deelbaar). Geen account. Alleen bouwen als blijkt dat bezoekers dit willen. Risico (opmerking van Claude, niet van Niels): personalisatie werkt tegen het doel van twee lezingen naast elkaar (filterbubbel)
- **Nieuws en podcasts koppelen aan onderwerpen:** een extra datastroom (feeds, onderwerpkoppeling, podcast-afleveringen). Pas na de vier analyses. Auteursrecht beperken door alleen titel, bron en link te tonen. Een verkeerde koppeling onder Niels' eigen naam is zichtbaar, dus kwaliteit van de koppeling is een eis
- **Eerste Kamer:** idee van Niels (22 oktober 2026). In de eerste zoekronde is geen vergelijkbare open data API gevonden, alleen verkiezingsuitslagen op data.overheid.nl; niet uitputtend onderzocht. De Eerste Kamer stemt vaker via de toerekenmethode, dus cohesie en afwijking rusten daar op minder harde data. Scrapen is zwaarder en juridisch gevoeliger. Eerste stap bij oppakken: een gerichte controle van de beschikbare bronnen
- **Partijlogo's met toestemming:** alleen als per partij vooraf toestemming is gevraagd en gekregen. Niet gepland
- **Cohesie door de tijd:** twee fracties per maand volgen in een lijngrafiek, om te zien of ze naar elkaar toe groeien of uit elkaar (idee Claude, 24 oktober 2026)
- **Netwerk van indieners:** welke fracties dienen samen moties in (ZaakActor: indiener en medeindieners) (idee Claude, 24 oktober 2026)
- **Zelf meestemmen:** de bezoeker stemt zelf op echte moties en ziet welke fracties het vaakst net zo stemden (idee Niels, 26 oktober 2026). Na R1. Twee manieren om moties te krijgen: een willekeurige trekking uit de verdeelde stemmingen, verspreid over de terreinen, en een keuze van de bezoeker voor de terreinen die hem het meest interesseren. Vergelijkbare tools bestaan waarschijnlijk; de eigen draai komt uit wat er al staat: echte stemmingen in plaats van stellingen, per kabinet, per terrein, met de verdieping naar dossiers en de coalitiebouwer. Risico's (Claude): de keuze van de moties stuurt de uitslag, dus de trekking moet uitlegbaar en herhaalbaar zijn; moties zijn moeilijk te lezen en vragen een korte, neutrale samenvatting; antwoorden zijn politieke opvattingen, dus alles rekent in de browser en niets wordt opgeslagen
- **Extra databronnen** (opgesomd door Claude, 23 oktober 2026; licenties en beschikbaarheid niet gecontroleerd tenzij vermeld). Pas oppakken als een release ze nodig heeft:
  - Kamerstukdossier, Toezegging, CommissieZetel en Verslag uit de API van de Tweede Kamer. Kamerstukdossier is de kandidaat voor het filter op onderwerp (R2); CommissieZetel voor het wetgevingsproces per commissie (R2)
  - Kiesraad: verkiezingsuitslagen en verkiezingsdata (open data van de overheid). Kan de data voor de Kamerperioden leveren
  - Officiële bekendmakingen (KOOP): volledige tekst van Kamerstukken, moties en Handelingen, ook van de Eerste Kamer. Kansrijkste route voor de Eerste Kamer
  - wetten.overheid.nl: inwerkingtreding van wetten, als eindpunt van een doorlooptijd (R2)
  - ParlGov en Chapel Hill Expert Survey: posities van partijen, mogelijk voor de lens. Risico: een links-rechtsas brengt een duiding binnen die kan botsen met het principe van twee lezingen
  - Niet bruikbaar zonder toestemming: parlement.com (PDC), Stemwijzer, Kieskompas (geen open data)

Verworpen: een account met opgeslagen profiel (opvattingen of interesses) op de server.

## Toon

Met duiding, via twee lezingen naast elkaar (zie "Duiding: twee lezingen"). Rankings van partijen en Kamerleden zijn toegestaan, mits elke ranking is gedefinieerd op de methodiekpagina en herleidbaar naar de bron. Of rankings van individuele Kamerleden nog in scope blijven naast de twee lezingen is een open punt.

Naam: Zetelen (besluit Niels, 22 oktober 2026). Toon: droog met een knipoog; het woordspel zit in microcopy en nooit in een oordeel over een partij. Het blijft een hobbyproject van Niels, en dat staat openlijk op de site. Reden voor het werkwoord (door Claude aangedragen): het geeft herhaalbare formules voor de microcopy ("Zo wordt er gezeteld") en past bij de zaal met 150 zetels als hoofdbeeld.

## Taal

Eerst alleen Nederlands. De Engelse versie komt pas als alle vier de analyses live zijn. Beperking: titels van moties en besluiten komen uit de bron en blijven Nederlands.

## Afzender en uiterlijk

- Onder Niels' eigen naam
- Stijl: journalistiek en strak vormgegeven, in de geest van The Economist (sobere datastijl, sterke grafieken), maar met een eigen kleurpalet. Geen kopie van het merk.
- Geen partijlogo's en geen partijkleuren in R1 (besluit Niels, 22 oktober 2026). Partijen verschijnen met naam en afkorting in het eigen palet. Redenen (door Claude aangedragen): rechten op logo's en huisstijl (Volt vraagt voorafgaande toestemming van derden, behalve redactioneel gebruik door media), de schijn van een band met een partij bij duiding onder eigen naam, en een matrix van 17 logo's of partijkleuren is niet kleurenblind-veilig te maken

## Randvoorwaarden

- Data: openbare bron, geen API-key nodig (te verifieren in stap 5)
- Kosten: gratis beginnen, tot ca. 25 euro per maand als het groeit
- Rolverdeling: Claude Code bouwt per component, Niels reviewt en moet alles kunnen uitleggen
- Tijd: ca. 6 tot 10 uur per week
- Beheerder: Niels
- Aanpak: gefaseerd bouwplan (idee, scoren, techniek, epics, componenten, koppelen, bouwen)
- Aanname: dataverversing dagelijks (niet bevestigd)

## Succescriterium

De site staat live en haalt minimaal 500 bezoekers per maand. Het oorspronkelijke "over drie maanden" is niet meer vanzelfsprekend haalbaar met alle vier de analyses (gefaseerde oplevering); het meetmoment is een open punt.

## Open punten

- Meetmoment en meetmethode van de 500 bezoekers per maand (vanaf start, of vanaf de eerste live-gang) en welke privacyvriendelijke analytics
- Controle van de naam Zetelen: betekenis in Van Dale, BOIP-merkenregister (klasse 9, 35, 41), zoekresultaten, sociale handles en domeinvoorwaarden (introductieprijs, verlenging)
- Zijn individuele stemmen van Kamerleden voldoende beschikbaar buiten hoofdelijke stemmingen
- Definities voor duiding: wat is "afwijken", wat is "aanname", wat telt als "activiteit". Cohesie en "verdeeld" zijn besloten, zie `08-componenten/cohesie-analyse.md`
- Verversingsfrequentie bevestigen
- Hoe omgaan met fouten of bezwaren van Kamerleden en partijen bij duiding onder eigen naam
- Mobiel versus desktop als primair apparaat
- Blijven rankings van individuele Kamerleden in scope naast de twee lezingen
- Invalshoeken voor de lezingen bij het wetgevingsproces en de Kamerleden (bij cohesie besloten: samenwerking tegenover profilering)
- Wanneer is er "vraag naar" de lens-keuze (criterium om die later te bouwen)
