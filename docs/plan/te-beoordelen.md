# Te beoordelen door Niels

Bijgehouden door Claude in de nacht van 25 op 26 oktober 2026. Per punt: wat het is, waar je het ziet en wat ik van je nodig heb. Bovenaan staat wat het meest telt. Vink af wat je gedaan hebt.

## Eerst kijken (op de site)

- [ ] **Voorpagina als geheel**, https://zetelen.vercel.app. Loopt het verhaal van begin tot eind?
  - De hoofdstukken: 1 hoe zijn we hier gekomen, 2 wie stemt er nu met wie, 3 samen in het kabinet: overal eens?, 4 kun jij er 76 vinden?, 5 en de oppositie?
  - Daarna de tegels naar alle onderdelen.
  - Vraag: klopt de volgorde, en mist er een overgang?
- [ ] **Oppositiewerk (nieuw, concept)**, https://zetelen.vercel.app/oppositie. Zes hoofdstukken met bewegende beelden, alle zinnen uit de data.
  - Vraag: werken de beelden?
  - Vraag: zijn de lezingenparen eerlijk en onpartijdig geformuleerd?
  - Vraag: is "een stip is 50 moties" duidelijk genoeg?
- [ ] **Kamerleden (nieuw, concept)**, https://zetelen.vercel.app/kamerleden. Per fractie, dan per Kamerlid, dan de stukken.
  - Vraag: mogen de namen zo op de site?
  - Vraag: is het zonder ranglijst over de hele Kamer goed zo?
- [ ] **Blok zetelwerk op de fractiepagina's**, bijvoorbeeld https://zetelen.vercel.app/fracties/d66.

## Teksten en toon

- [ ] **Stijlgids:** [tone-of-voice.md](../ontwerp/tone-of-voice.md). Drie open vragen over woorden:
  1. "fractie" of "partij";
  2. "één VVD-Kamerlid" bij hoofdelijke stemmingen;
  3. labels in hoofdletters.
- [ ] **Alle teksten in de nieuwe toon:** een agent herschreef ze, ik heb ze nagelopen. Het overzicht staat in [alle-teksten.md](../teksten/alle-teksten.md). Drie knipogen wachten op je goedkeuring:
  - 404: "Hier is nooit gezeteld.";
  - /wijzigingen: "Er zijn nog geen correcties. We blijven natellen.";
  - /over: "Er zit geen organisatie of partij achter, alleen nieuwsgierigheid.".
- [ ] **De nieuwe teksten van deze nacht** (Oppositiewerk, Kamerleden, zetelwerk): in dezelfde toon geschreven, maar nog niet door jou gezien.

## Definities en data (jouw controle)

- [ ] **Zetelwerk:** een steekproef van 20 moties naast tweedekamer.nl. Zie de sectie "Steekproef zetelwerk" hieronder, die ik in de loop van de nacht vul.
- [ ] **Koppeltabel commissie naar beleidsterrein:** [014_onderwerpen.sql](../../db/migrations/014_onderwerpen.sql), blok `core.beleidsterrein_commissie`.
- [ ] **Trefwoorden voor beleidsterreinen:** [015_trefwoorden.sql](../../db/migrations/015_trefwoorden.sql), blok `core.beleidsterrein_trefwoord`.
- [ ] **Kabinetstabel:** [011_coalitie.sql](../../db/migrations/011_coalitie.sql). De samenstelling en de datums van uittreden.
- [ ] **De controles die al langer openstaan:**
  - de nacontrole van cohesie;
  - de steekproef van uitslagen;
  - de 8 afwijkende uitslagen;
  - de test met het uitblijvende signaal van healthchecks.

## Keuzes

- [ ] **Lezingen:** kijk op de proefpagina https://zetelen.vercel.app/lezingen (niet in het menu). Daar staan de vier aanbevolen lezingen met een grafiek op echte data en de twee lezingen naast elkaar. Welke komen vast in het verhaal? Zie [lezingen-kandidaten.md](lezingen-kandidaten.md). Mijn advies: 3 (eens tegenover regeerakkoord), 1 en 2 (coalitie), en 6 (asiel). De dynamische lezingen in de tools bouw ik daarna.
- [ ] **Feedbackronde:** de link naar je vragenlijst, voor `FEEDBACK_URL` in `web/lib/site.ts`, plus de naam van de dienst en de bewaartermijn in de privacytekst.
- [ ] **Menu:** er staan nu zeven onderdelen in (Verkenner, Onderwerpen, Coalitie, Oppositie, Fracties, Methodiek, Over). Kamerleden staat er niet in, maar is bereikbaar via Oppositiewerk, de fractiepagina's en de tegels. Akkoord, of liever korter?
- [ ] **Labels "concept":** wanneer mogen ze eraf, en waarvan?

## Wat ik deze nacht deed

Zie de sectie "Verslag" onderaan, die ik aanvul tot ik stop.

## Steekproef zetelwerk

Automatisch vergeleken met de bron (26 oktober 2026, nacht): 19 willekeurige stukken, verspreid over zes kabinetten. **De uitslag, de indiener en diens fractie kloppen 19 van de 19 keer.** Jouw deel: kies er 5 en klik op het nummer, dan zie je op tweedekamer.nl of het klopt.

| Kabinet | Soort | Nummer | Onderwerp (begin) | Wij | Bron (besluittekst) | Indiener volgens bron | Klopt |
|---|---|---|---|---|---|---|---|
| Rutte I | Motie | [2010Z18649](https://www.tweedekamer.nl/zoeken?qry=2010Z18649) | Motie El Fassed en Hachchi over een tender gericht op vrouwe | verworpen (57 tegen 93) | verworpen | A. El Fassed (GroenLinks) | ja |
| Rutte I | Motie | [2011Z00574](https://www.tweedekamer.nl/zoeken?qry=2011Z00574) | Motie Paulus Jansen c.s. over minimumhandhavingsstandaarden  | verworpen (62 tegen 88) | verworpen | P.F.C. (Paulus) Jansen (SP) | ja |
| Rutte I | Amendement | [2011Z14134](https://www.tweedekamer.nl/zoeken?qry=2011Z14134) | Gewijzigd amendement van het lid Van Dam ter vervanging van  | aangenomen (76 tegen 74) | aangenomen | M.H.P. van Dam (PvdA) | ja |
| Rutte II | Motie | [2016Z07435](https://www.tweedekamer.nl/zoeken?qry=2016Z07435) | Motie van het lid Bashir over een gelijk speelveld in alle l | aangenomen (149 tegen 1) | aangenomen | F. Bashir (SP) | ja |
| Rutte II | Motie | [2016Z16595](https://www.tweedekamer.nl/zoeken?qry=2016Z16595) | Motie van het lid Wassenberg over in beeld brengen van de ef | verworpen (34 tegen 115) | verworpen | F.P. Wassenberg (PvdD) | ja |
| Rutte II | Amendement | [2016Z20784](https://www.tweedekamer.nl/zoeken?qry=2016Z20784) | Amendement van de leden Volp en Potters over het versterken  | aangenomen (121 tegen 29) | aangenomen | M.J.J. Volp (PvdA) | ja |
| Rutte III | Motie | [2018Z12559](https://www.tweedekamer.nl/zoeken?qry=2018Z12559) | Motie van het lid Jasper van Dijk over een Wsnp-traject zond | verworpen (46 tegen 104) | verworpen | J.J. (Jasper) van Dijk (SP) | ja |
| Rutte III | Motie | [2019Z24905](https://www.tweedekamer.nl/zoeken?qry=2019Z24905) | Motie van het lid Van Nispen c.s. over het handhaven van de  | aangenomen (150 tegen 0) | aangenomen | M. van Nispen (SP) | ja |
| Rutte III | Motie | [2020Z05025](https://www.tweedekamer.nl/zoeken?qry=2020Z05025) | Motie van het lid Jetten c.s. over een steunpakket voor de c | aangenomen (127 tegen 23) | aangenomen | R.A.A. Jetten (D66) | ja |
| Rutte III | Amendement | [2019Z23148](https://www.tweedekamer.nl/zoeken?qry=2019Z23148) | Amendement van het lid Remco Dijkstra over meer landelijke d | aangenomen (117 tegen 33) | aangenomen | R.J. (Remco) Dijkstra (VVD) | ja |
| Rutte IV | Motie | [2022Z10177](https://www.tweedekamer.nl/zoeken?qry=2022Z10177) | Gewijzigde motie van het lid Werner over voorstellen om de u | aangenomen (147 tegen 0) | aangenomen | L.M. Werner (CDA) | ja |
| Rutte IV | Motie | [2024Z02139](https://www.tweedekamer.nl/zoeken?qry=2024Z02139) | Motie van het lid Diederik van Dijk over in gesprekken met h | aangenomen (80 tegen 70) | aangenomen | D.J.H. (Diederik) van Dijk (SGP) | ja |
| Rutte IV | Amendement | [2022Z24409](https://www.tweedekamer.nl/zoeken?qry=2022Z24409) | Amendement van het lid Werner c.s. ter vervanging van nr. 12 | aangenomen (147 tegen 3) | aangenomen | L.M. Werner (CDA) | ja |
| Schoof | Motie | [2025Z00585](https://www.tweedekamer.nl/zoeken?qry=2025Z00585) | Motie van het lid Koekkoek over deelnemen aan de EU Talent P | verworpen (14 tegen 136) | verworpen | M. Koekkoek (Volt) | ja |
| Schoof | Motie | [2024Z15582](https://www.tweedekamer.nl/zoeken?qry=2024Z15582) | Motie van het lid Veltman over een plan van JenV en IenW voo | aangenomen (144 tegen 6) | aangenomen | H.N. Veltman (VVD) | ja |
| Schoof | Amendement | [2025Z13261](https://www.tweedekamer.nl/zoeken?qry=2025Z13261) | Gewijzigd amendement van de leden De Hoop en Welzijn ter ver | aangenomen (86 tegen 64) | aangenomen | H.E. de Hoop (GroenLinks-PvdA) | ja |
| Jetten | Motie | [2026Z06701](https://www.tweedekamer.nl/zoeken?qry=2026Z06701) | Motie van het lid Moorman over het in kaart brengen van de u | verworpen (42 tegen 108) | verworpen | M. Moorman (GroenLinks-PvdA) | ja |
| Jetten | Motie | [2026Z19664](https://www.tweedekamer.nl/zoeken?qry=2026Z19664) | Motie van het lid Vervuurt c.s. over een versnellingsaanpak  | aangenomen (131 tegen 19) | aangenomen | M. Vervuurt (D66) | ja |
| Jetten | Motie | [2026Z03135](https://www.tweedekamer.nl/zoeken?qry=2026Z03135) | Motie van het lid Grinwis c.s. over aanscherping van de huid | aangenomen (105 tegen 45) | aangenomen | P.A. Grinwis (ChristenUnie) | ja |

Ook vergeleken: de aantallen per jaar met de telling in de API. In 2010 tellen wij 1.359 moties waarover gestemd is, de API 1.362. In de andere jaren is het verschil net zo klein: een paar stukken waarvan de stemming in de bron ontbreekt of verwijderd is.

## Verslag van de nacht

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
- **Oppositiewerk, hoofdstuk 4:** de zinnen noemen alleen fracties met minstens 25 eigen moties, en de assen lopen over het bereik in de data.

**Correctie op wat ik eerder schreef**
Het "onbekende terrein" bij 23 van de 59 beslissende stemmingen van JA21 kwam uit mijn eigen analyse-script, dat rijen kwijtraakte bij het ophalen in pagina's. Op de site ontbrak alleen één stemming, en die staat er nu in.

**Nog niet gedaan, en waarom**
- **De dynamische lezingen in de tools:** daarvoor wacht ik op jouw keuze van de lezingen.
- **Een eigen deelplaatje voor Oppositiewerk en Kamerleden:** nu gebruiken ze het algemene plaatje.
