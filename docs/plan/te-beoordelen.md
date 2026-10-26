# Te beoordelen door Niels

Bijgehouden door Claude in de nacht van 25 op 26 oktober 2026. Per punt: wat het is, waar je het ziet en wat ik van je nodig heb. Bovenaan staat wat het meest telt. Vink af wat je gedaan hebt.

Bijgewerkt op 26 oktober 2026 (overdag): bovenaan de lijst voor de livegang, twee kliktabellen voor de controles en de verklaring van de extra rijen. Sindsdien geen nieuwe onderdelen gebouwd.

## 1. Wat de livegang van R1 tegenhoudt

Livegang betekent: `LIVE = true` (indexeren, sitemap), het label concept eraf waar dat mag, en de site delen. Per punt: klaar of niet, of er een besluit van jou nodig is, en of het R1 is of later kan.

| # | Punt | Klaar? | Besluit Niels? | R1 of later |
|---|---|---|---|---|
| 1 | Dit document doornemen: site, teksten, definities | nee | ja | R1 |
| 2 | Lezingen kiezen (E4), daarna de dynamische lezingen in de tools bouwen | nee, proefpagina staat | ja | R1 |
| 3 | Coalitiebouwer: lezingen (E2-S10) en nacontrole, dan het label concept eraf | nee | ja (na punt 2) | R1 |
| 4 | Controles: nacontrole cohesie en steekproef uitslagen (kliktabellen hieronder) | voorbereid, jouw klik ontbreekt | nee, alleen controleren | R1 |
| 5 | De 8 afwijkende uitslagen bekijken (`beheer.afwijkende_uitslag`) | nee | ja, per geval | R1 |
| 6 | Handmatige tabellen nakijken: kabinetten en coalities (011), Kamerperiodes, partijkoppeling, koppeltabel beleidsterreinen (014), trefwoorden (015) | nee | ja | R1, want ze sturen de getoonde cijfers |
| 7 | `analytics` (E3-S6): dienst kiezen, zonder cookies | niet gestart | ja, welke dienst | R1 volgens het plan; kan later als je zonder bezoekcijfers live wilt |
| 8 | Methodiek: reactietermijn op een foutmelding (E7-S2) en privacytekst beoordelen | nee | ja | R1 |
| 9 | Gebruiksvoorwaarden open data | klaar (CC0, vermeld op /methodiek) | nee | R1, gedaan |
| 10 | Bewaking: test met het uitblijvende signaal van healthchecks | nee | nee, alleen uitvoeren | R1 |
| 11 | Kamerleden met namen (zie hieronder) | live als concept, buiten het plan | ja | R3 in het plan |
| 12 | Open besluit uit het plan: blijven rankings van individuele Kamerleden in scope? | nee | ja | hoort bij R3, maar raakt punt 11 |
| 13 | Open besluit uit het plan: beleid bij een verwijderverzoek van een Kamerlid | nee | ja | R1 zodra er namen live staan |
| 14 | Naam Zetelen controleren en domein registreren | nee | ja | kan later: live op zetelen.vercel.app kan ook |
| 15 | Feedbackronde: link naar de vragenlijst, dienst en bewaartermijn in de privacytekst | nee | ja | voor de feedbackronde, niet voor de livegang |
| 16 | Oppositiewerk en lezingen op de telefoon (kleine stippen en letters) | nee | nee | R1 als die pagina's live gaan |
| 17 | Aanpassing verversing voor verwijderingen (zie punt 3 hieronder) | nee | ja, akkoord op de aanpassing | R1 aanbevolen, maar blokkeert niet |
| 18 | Prestatie-audit opnieuw meten na `LIVE = true` | nee | nee | R1, als laatste stap |
| 19 | Push protection van GitHub secret scanning aanzetten | nee | ja, jouw instelling | kan later, is goedkoop |

**Kamerleden met namen.** In het plan is dit R3 (`kamerleden-analyse` en `kamerleden-pagina`, E6). Ik heb de pagina in de nacht gebouwd als onderdeel van zetelwerk. Hij staat nu niet in het menu, maar wel in de sitemap (`PAGINAS` in `web/lib/site.ts`) en is bereikbaar via Oppositiewerk, de fractiepagina's en de tegels. Twee besluiten uit het plan staan nog open: rankings van individuele Kamerleden (punt 12) en het beleid bij een verwijderverzoek (punt 13).

**Mijn advies:** zet Kamerleden bij de livegang achter een conceptvlag, niet alleen uit het menu. Uit het menu is niet genoeg: via de links en de sitemap blijft de pagina vindbaar en wordt hij geindexeerd. Met een vlag (zoals `LIVE`) is de pagina in productie weg, met de links ernaartoe, en kun je hem aanzetten zodra punt 12 en 13 besloten zijn. Reden: namen met tellingen per Kamerlid lezen als een ranglijst, ook zonder ranglijst, en een Kamerlid dat bezwaar maakt, moet een antwoord krijgen dat al vastligt. Het verhaal van R1 werkt zonder deze pagina; Oppositiewerk blijft op fractieniveau.

## 2. Controles om aan te klikken

Beide steekproeven zijn vast, niet willekeurig, zodat jij dezelfde rijen ziet als ik: `db/controles/klik_uitslagen.sql` en `db/controles/klik_cohesie.sql`, gedraaid via Controlequery op 26 oktober 2026. Ik heb elke rij al naast de bron gelegd (de API van de Tweede Kamer, de stemmen per fractie). Jouw deel: klik op het zaaknummer, kijk op tweedekamer.nl en vul de laatste kolom in.

Eenmansfracties staan er zonder naam in: hun fractienaam is de naam van een persoon.

### Steekproef uitslagen (E7-S5, 10 besluiten)

Alle tien kloppen met de bron: dezelfde uitslag, dezelfde zetels en dezelfde fracties aan elke kant. De kolom "Kleinste kant" noemt de fracties aan de kant met de minste zetels; dat is het snelst te controleren.

| # | Datum | Zaak | Wij | Bron (besluittekst, zetels) | Kleinste kant (wij, gelijk aan de bron) | Niels: klopt |
|---|---|---|---|---|---|---|
| 1 | 26-01-2010 | [2010Z00939](https://www.tweedekamer.nl/zoeken?qry=2010Z00939) motie | aangenomen, 85 tegen 65 | Aangenomen, 85 tegen 65 | tegen: GL, PVV, SGP, SP, VVD en 1 eenmansfractie | |
| 2 | 11-06-2013 | [2013Z11750](https://www.tweedekamer.nl/zoeken?qry=2013Z11750) motie | verworpen, 27 tegen 123 | Verworpen, 27 tegen 123 | voor: 50PLUS, ChristenUnie, PvdD, SGP, SP | |
| 3 | 20-02-2014 | [2014Z03255](https://www.tweedekamer.nl/zoeken?qry=2014Z03255) motie | verworpen, 37 tegen 113 | Verworpen, 37 tegen 113 | voor: 50PLUS, GL, PvdD, PVV, SP | |
| 4 | 25-11-2014 | [2014Z21517](https://www.tweedekamer.nl/zoeken?qry=2014Z21517) motie | aangenomen, 119 tegen 31 | Aangenomen, 119 tegen 31 | tegen: GrBvK, PvdD, PVV, SP | |
| 5 | 13-12-2016 | [2016Z23468](https://www.tweedekamer.nl/zoeken?qry=2016Z23468) motie | verworpen, 36 tegen 113 | Verworpen, 36 tegen 113 (1 fractie niet deelgenomen) | voor: 50PLUS, GL, GrKÖ, PvdD, PVV, SP | |
| 6 | 19-06-2018 | [2018Z11433](https://www.tweedekamer.nl/zoeken?qry=2018Z11433) motie | verworpen, 71 tegen 79 | Verworpen, 71 tegen 79 | tegen: CDA, ChristenUnie, D66, SGP, VVD | |
| 7 | 22-09-2020 | [2020Z15847](https://www.tweedekamer.nl/zoeken?qry=2020Z15847) motie | aangenomen, 98 tegen 52 | Aangenomen, 98 tegen 52 | tegen: ChristenUnie, D66, GL, PvdA, PvdD en 1 eenmansfractie | |
| 8 | 08-12-2020 | [2020Z18763](https://www.tweedekamer.nl/zoeken?qry=2020Z18763) amendement | verworpen, 51 tegen 98 | Verworpen, 51 tegen 98 | tegen: CDA, ChristenUnie, D66, PVV, SGP, VVD | |
| 9 | 08-10-2024 | [2024Z13894](https://www.tweedekamer.nl/zoeken?qry=2024Z13894) motie | verworpen, 26 tegen 124 | Verworpen, 26 tegen 124 | voor: CDA, ChristenUnie, D66, FVD, JA21, SGP, Volt | |
| 10 | 19-05-2026 | [2026Z09643](https://www.tweedekamer.nl/zoeken?qry=2026Z09643) motie | aangenomen, 102 tegen 48 | Aangenomen, 102 tegen 48 | tegen: BBB, FVD, Groep Markuszower, JA21, VVD | |

Na jouw controle zet ik de uitkomst in `docs/steekproeven/R1-uitslagen.md`.

### Nacontrole cohesie (E2-S2): VVD en CDA onder Schoof

Alle tien stemmen kloppen met de bron. In deze tien stemden VVD en CDA 6 keer hetzelfde.

| # | Datum | Zaak | VVD (wij) | CDA (wij) | Bron VVD en CDA | Hetzelfde? | Niels: klopt |
|---|---|---|---|---|---|---|---|
| 1 | 08-10-2024 | [2024Z13894](https://www.tweedekamer.nl/zoeken?qry=2024Z13894) motie | tegen | voor | tegen, voor | nee | |
| 2 | 15-10-2024 | [2024Z15637](https://www.tweedekamer.nl/zoeken?qry=2024Z15637) motie | tegen | voor | tegen, voor | nee | |
| 3 | 19-11-2024 | [2024Z18629](https://www.tweedekamer.nl/zoeken?qry=2024Z18629) motie | tegen | voor | tegen, voor | nee | |
| 4 | 11-03-2025 | [2024Z15575](https://www.tweedekamer.nl/zoeken?qry=2024Z15575) motie | tegen | tegen | tegen, tegen | ja | |
| 5 | 01-04-2025 | [2025Z05727](https://www.tweedekamer.nl/zoeken?qry=2025Z05727) motie | tegen | tegen | tegen, tegen | ja | |
| 6 | 27-05-2025 | [2025Z10578](https://www.tweedekamer.nl/zoeken?qry=2025Z10578) motie | voor | voor | voor, voor | ja | |
| 7 | 03-06-2025 | [2025Z10883](https://www.tweedekamer.nl/zoeken?qry=2025Z10883) motie | tegen | tegen | tegen, tegen | ja | |
| 8 | 03-07-2025 | [2025Z14214](https://www.tweedekamer.nl/zoeken?qry=2025Z14214) motie | tegen | voor | tegen, voor | nee | |
| 9 | 02-10-2025 | [2025Z18582](https://www.tweedekamer.nl/zoeken?qry=2025Z18582) motie | voor | voor | voor, voor | ja | |
| 10 | 16-12-2025 | [2025Z21729](https://www.tweedekamer.nl/zoeken?qry=2025Z21729) motie | voor | voor | voor, voor | ja | |

De berekende cohesie voor dit paar onder Schoof: 79,7% over alle stemmingen (5.578 van 6.998) en 77,7% over de verdeelde (4.951 van 6.371). Dat de steekproef 6 van de 10 geeft, is geen tegenspraak: bij tien stemmingen en 80% is 6 of minder ongeveer 1 op 8. De controle gaat over de stemmen per rij, niet over het percentage. Geen van de tien is een hoofdelijke stemming, dus de afleiding uit de leden zit niet in deze steekproef.

## 3. Extra rijen bij Agendapunt en Besluit: verklaard

**Oorzaak.** De 5 agendapunten en 4 besluiten zijn op 23 oktober 2026 in de bron verwijderd, een paar uur na onze eerste laad. Bij die verwijdering zette de bron `Verwijderd` op waar en maakte hij de koppeling naar de activiteit leeg (`Activiteit_Id` is nu leeg). De verversing vraagt wijzigingen op met het datumfilter via die koppeling (`Activiteit/Datum`) plus `ApiGewijzigdOp`. Een record zonder activiteit valt buiten dat filter, dus de verwijdering komt nooit binnen en bij ons staat het record nog als niet verwijderd.

**Hoe gevonden.** Per jaar en daarna per dag geteld, bij ons en in de API met hetzelfde filter. Het verschil zit alleen op vier dagen: 27 en 29 oktober, 2 november en 9 december 2026. De ids van die dagen naast elkaar gelegd, en de 5 losse agendapunten in de API opgevraagd. Alle vijf: verwijderd, zonder activiteit, gewijzigd op 23 oktober.

**Uitgesloten:** een datum van voor 2010; een activiteit die niet geladen of verwijderd is; verwijderde records die wij wel en de API niet meetelt (13.476 verwijderde agendapunten en 9.979 verwijderde besluiten, bij ons en in de API gelijk).

**Effect op de site: geen.** Het gaat om agendapunten van vergaderingen die nog moeten komen, zonder stemmingen. Een besluit telt bij ons alleen mee als er gestemd is. Stemming telt precies gelijk aan de API: 978.678.

**Risico.** Hetzelfde kan gebeuren met een besluit of stemming waarover al gestemd is. Dan blijft een verwijderde stemming bij ons meetellen. Dat is nu niet gebeurd, maar de verversing zou het niet merken.

**Voorstel, niet uitgevoerd:** in `pipeline/ververs.py` de wijzigingen voor Agendapunt, Besluit en Stemming (en de andere entiteiten met een datumfilter via een koppeling) opvragen op `ApiGewijzigdOp` alleen, zonder datumfilter. Wijzigingen per dag zijn klein, dus dat kost weinig. Records van voor 2010 die zo binnenkomen, vallen in `core` toch buiten het datumfilter. Na de aanpassing is een Ververs nodig die terugkijkt tot 23 oktober; Migreer is niet nodig. Ik heb niets in de database hersteld.

**Let op, log met namen.** De Controlequery-run van de uitslagensteekproef (https://github.com/Zetelen/zetelen/actions/runs/40265489488) toont de afkortingen van fracties zoals de database ze heeft. Bij eenmansfracties is dat een achternaam. De log is publiek. Wil je dat ik die run verwijder? Ook de tabel "Steekproef zetelwerk" verderop noemt de indieners bij naam. Dat zijn Kamerleden, maar dit document is een rapport in een publieke repo. Zal ik die kolom vervangen door alleen de fractie?

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
