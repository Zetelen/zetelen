# Stappenplan controles C1 tot en met C6

Klaargezet op 26 oktober 2026 voor Niels. Alles wat je nodig hebt staat in dit bestand: per controle wat je doet, hoe lang het ongeveer duurt, en wat je doet als iets niet klopt. Ik heb elke rij al zelf naast de bron gelegd; jij doet de onafhankelijke controle.

**Zo geef je het door:** in de chat, bijvoorbeeld "C1: klopt", "C3: 2 en 9 gekeken, klopt", "C4: A" of "C5: kabinetten klopt, bij trefwoorden mist X". Ik verwerk het en vink het af in [te-beoordelen.md](te-beoordelen.md).

## Overzicht

| | Wat | Soort | Tijd | Houdt de livegang op? |
|---|---|---|---|---|
| ☐ C1 | Steekproef uitslagen: 3 van de 10 rijen openen | controleren | 15 min | ja |
| ☐ C2 | Nacontrole cohesie VVD en CDA: 3 van de 10 rijen openen | controleren | 15 min | ja |
| ☐ C3 | Steekproef zetelwerk: 5 van de 19 rijen openen | controleren | 20 min | ja |
| ☑ C4 | Afwijkende uitslagen: één keuze, A of B | besluit | 10 min | ja |
| ☐ C5 | Handmatige tabellen nalopen | controleren | 30 tot 45 min | ja |
| ☐ C6 | Test van de bewaking | uitvoeren | 15 min plus wachten | nee, wel voor de livegang |

**Volgorde:** C4 eerst (alleen lezen en kiezen), dan C1 tot en met C3 (zelfde manier van werken), dan C5, en C6 als laatste, omdat je daar op mails wacht.

## Voor je begint

- [ ] Open https://www.tweedekamer.nl in je browser.
- [ ] Houd dit bestand ernaast open.
- [ ] Een zaaknummer (zoals 2014Z03255) openen: klik op het nummer in de tabel. Je komt op de zoekpagina van de Kamer; klik op het eerste resultaat. Op de pagina van de motie staat onderaan of rechts **Stemmingsuitslagen**, met per fractie voor of tegen en de uitslag.
- Lukt een nummer niet, zoek dan op tweedekamer.nl naar het nummer zelf in het zoekveld. Lukt het dan nog niet: noteer het nummer en sla de rij over. Neem een andere rij.

---

## ☐ C1. Steekproef uitslagen (10 minuten tot een kwartier)

**Waarom:** dit toont dat de uitslag op de site dezelfde is als die van de Kamer.

**Stappen**
1. Kies 3 rijen, verspreid over de jaren. Voorstel: 2, 6 en 10.
2. Open het zaaknummer.
3. Vergelijk drie dingen met de tabel:
   - de uitslag (aangenomen of verworpen);
   - het aantal stemmen voor en tegen;
   - de fracties aan de kleinste kant.
4. Zet een vinkje in de laatste kolom, of noteer wat afwijkt.

**Klopt het niet?** Noteer het zaaknummer en wat je ziet. Ik zoek dan uit of het aan de bron ligt of aan onze telling. Ga gewoon door met de rest.

Vaste steekproef: `db/controles/klik_uitslagen.sql`. Eenmansfracties en groepen met de naam van een persoon staan zonder naam in de tabel.

| # | Datum | Zaak | Wij | Bron (besluittekst, zetels) | Kleinste kant (wij, gelijk aan de bron) | Klopt? |
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

Rij 5 heeft een andere datum dan de indiening (8 december): wij tonen de stemdatum, 13 december. Dat klopt. De site van berthub (tkconv) is geen onafhankelijke bron, want die leest dezelfde API als wij.

---

## ☐ C2. Nacontrole cohesie: VVD en CDA onder Schoof (een kwartier)

**Waarom:** cohesie telt hoe vaak twee fracties hetzelfde stemmen. Als de stem per fractie klopt, klopt de telling.

**Stappen**
1. Kies 3 rijen. Voorstel: 1, 4 en 8 (twee keer verschillend, één keer gelijk).
2. Open het zaaknummer en zoek bij Stemmingsuitslagen de stem van de VVD en van het CDA.
3. Vergelijk met de kolommen VVD en CDA. Zet een vinkje.

**Klopt het niet?** Noteer het zaaknummer en de stem die je ziet.

Vaste steekproef: `db/controles/klik_cohesie.sql`.

| # | Datum | Zaak | VVD (wij) | CDA (wij) | Bron VVD en CDA | Hetzelfde? | Klopt? |
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

Ter achtergrond: de berekende cohesie voor dit paar onder Schoof is 79,7% over alle stemmingen (5.578 van 6.998) en 77,7% over de verdeelde (4.951 van 6.371). Dat de steekproef 6 van de 10 geeft, is geen tegenspraak: bij tien stemmingen en 80% is 6 of minder ongeveer 1 op 8. Geen van de tien is een hoofdelijke stemming.

---

## ☐ C3. Steekproef zetelwerk: kies er 5 (twintig minuten)

**Waarom:** zetelwerk telt per fractie de ingediende moties en amendementen, en hoeveel daarvan het haalden.

**Stappen**
1. Kies 5 rijen, het liefst uit verschillende kabinetten en minstens één amendement. Voorstel: 1, 6, 11, 16 en 19.
2. Open het nummer en vergelijk drie dingen:
   - de uitslag;
   - de fractie van de indiener;
   - bij een motie het onderwerp.
3. Zet een vinkje.

**Klopt het niet?** Noteer het nummer. Een andere indiener is ernstiger dan een ander onderwerp: het onderwerp is ingekort.

| # | Kabinet | Soort | Nummer | Onderwerp (begin) | Wij | Bron | Fractie indiener (bron) | Gekeken |
|---|---|---|---|---|---|---|---|---|
| 1 | Rutte I | Motie | [2010Z18649](https://www.tweedekamer.nl/zoeken?qry=2010Z18649) | ... over een tender gericht op vrouwe | verworpen (57 tegen 93) | verworpen | GroenLinks | ☐ |
| 2 | Rutte I | Motie | [2011Z00574](https://www.tweedekamer.nl/zoeken?qry=2011Z00574) | ... over minimumhandhavingsstandaarden | verworpen (62 tegen 88) | verworpen | SP | ☐ |
| 3 | Rutte I | Amendement | [2011Z14134](https://www.tweedekamer.nl/zoeken?qry=2011Z14134) | ... ter vervanging van | aangenomen (76 tegen 74) | aangenomen | PvdA | ☐ |
| 4 | Rutte II | Motie | [2016Z07435](https://www.tweedekamer.nl/zoeken?qry=2016Z07435) | ... over een gelijk speelveld in alle l | aangenomen (149 tegen 1) | aangenomen | SP | ☐ |
| 5 | Rutte II | Motie | [2016Z16595](https://www.tweedekamer.nl/zoeken?qry=2016Z16595) | ... over in beeld brengen van de ef | verworpen (34 tegen 115) | verworpen | PvdD | ☐ |
| 6 | Rutte II | Amendement | [2016Z20784](https://www.tweedekamer.nl/zoeken?qry=2016Z20784) | ... over het versterken | aangenomen (121 tegen 29) | aangenomen | PvdA | ☐ |
| 7 | Rutte III | Motie | [2018Z12559](https://www.tweedekamer.nl/zoeken?qry=2018Z12559) | ... over een Wsnp-traject zond | verworpen (46 tegen 104) | verworpen | SP | ☐ |
| 8 | Rutte III | Motie | [2019Z24905](https://www.tweedekamer.nl/zoeken?qry=2019Z24905) | ... over het handhaven van de | aangenomen (150 tegen 0) | aangenomen | SP | ☐ |
| 9 | Rutte III | Motie | [2020Z05025](https://www.tweedekamer.nl/zoeken?qry=2020Z05025) | ... over een steunpakket voor de c | aangenomen (127 tegen 23) | aangenomen | D66 | ☐ |
| 10 | Rutte III | Amendement | [2019Z23148](https://www.tweedekamer.nl/zoeken?qry=2019Z23148) | ... over meer landelijke d | aangenomen (117 tegen 33) | aangenomen | VVD | ☐ |
| 11 | Rutte IV | Motie | [2022Z10177](https://www.tweedekamer.nl/zoeken?qry=2022Z10177) | ... over voorstellen om de u | aangenomen (147 tegen 0) | aangenomen | CDA | ☐ |
| 12 | Rutte IV | Motie | [2024Z02139](https://www.tweedekamer.nl/zoeken?qry=2024Z02139) | ... over in gesprekken met h | aangenomen (80 tegen 70) | aangenomen | SGP | ☐ |
| 13 | Rutte IV | Amendement | [2022Z24409](https://www.tweedekamer.nl/zoeken?qry=2022Z24409) | ... ter vervanging van nr. 12 | aangenomen (147 tegen 3) | aangenomen | CDA | ☐ |
| 14 | Schoof | Motie | [2025Z00585](https://www.tweedekamer.nl/zoeken?qry=2025Z00585) | ... over deelnemen aan de EU Talent P | verworpen (14 tegen 136) | verworpen | Volt | ☐ |
| 15 | Schoof | Motie | [2024Z15582](https://www.tweedekamer.nl/zoeken?qry=2024Z15582) | ... over een plan van JenV en IenW voo | aangenomen (144 tegen 6) | aangenomen | VVD | ☐ |
| 16 | Schoof | Amendement | [2025Z13261](https://www.tweedekamer.nl/zoeken?qry=2025Z13261) | ... ter vervanging (gewijzigd amendement) | aangenomen (86 tegen 64) | aangenomen | GroenLinks-PvdA | ☐ |
| 17 | Jetten | Motie | [2026Z06701](https://www.tweedekamer.nl/zoeken?qry=2026Z06701) | ... over het in kaart brengen van de u | verworpen (42 tegen 108) | verworpen | GroenLinks-PvdA | ☐ |
| 18 | Jetten | Motie | [2026Z19664](https://www.tweedekamer.nl/zoeken?qry=2026Z19664) | ... over een versnellingsaanpak | aangenomen (131 tegen 19) | aangenomen | D66 | ☐ |
| 19 | Jetten | Motie | [2026Z03135](https://www.tweedekamer.nl/zoeken?qry=2026Z03135) | ... over aanscherping van de huid | aangenomen (105 tegen 45) | aangenomen | ChristenUnie | ☐ |

Ook vergeleken: de aantallen per jaar met de telling in de API. In 2010 tellen wij 1.359 moties waarover gestemd is, de API 1.362. In de andere jaren is het verschil net zo klein: een paar stukken waarvan de stemming in de bron ontbreekt of verwijderd is.

---

## ☑ C4. Afwijkende uitslagen: kies A of B (tien minuten)

**Waarom:** bij 8 besluiten past de uitslag van de Kamer niet bij de stemmen in de bron. Cohesie en de coalitiebouwer gebruiken de stemmen, dus daar verandert niets. Zetelwerk telt "aangenomen" nu uit de stemmen. Bij 6 moties wijkt zetelwerk daardoor af van wat de Kamer formeel besloot.

**Wat ik voorbereid heb (26 oktober):** elk geval opnieuw nagelopen in de API: de besluittekst, de opmerking en de datum waarop de stemmen zijn gewijzigd. Plus de fractie van de indiener, zodat je ziet wie het raakt. Drie gevallen waren eerst een aanname; twee daarvan zijn nu verklaard.

| # | Datum | Zaak | Stemmen in de bron | Uitslag Kamer | Verklaring | Indiener (fractie) | Effect van A op zetelwerk |
|---|---|---|---|---|---|---|---|
| 1 | 20-05-2014 | [2014Z08729](https://www.tweedekamer.nl/zoeken?qry=2014Z08729) motie | 74 voor, 76 tegen | aangenomen | **Telfout.** De voorzitter meldt later dat de telling niet klopte, maar dat de uitslag volgens het Reglement van Orde niet meer kan veranderen. | GrBvK | +1 aangenomen |
| 2 | 05-07-2022 | [2021Z02980](https://www.tweedekamer.nl/zoeken?qry=2021Z02980) grondwetswijziging | 87 voor, 55 tegen | verworpen | **Tweederdemeerderheid nodig.** 87 van 142 is minder dan twee derde: terecht verworpen. | (geen motie) | geen, telt niet mee |
| 3 | 05-07-2022 | idem, tweede besluit | 85 voor, 55 tegen | verworpen | Idem. | (geen motie) | geen |
| 4 | 07-12-2022 | [2022Z24291](https://www.tweedekamer.nl/zoeken?qry=2022Z24291) motie | 78 voor, 72 tegen | verworpen | **Stem achteraf gecorrigeerd.** Volgens de opmerking in de bron was de SP ook voor, maar telde ze niet mee. De stemmen zijn een dag later aangepast; de uitslag bleef staan. | BBB | −1 aangenomen |
| 5 | 24-05-2023 | [2023Z09118](https://www.tweedekamer.nl/zoeken?qry=2023Z09118) motie | 74 voor, 72 tegen | verworpen | **Stem achteraf gecorrigeerd** (nu nagekeken): de stemmen zijn een dag na de stemming gewijzigd, net als bij 4. Er staat geen opmerking bij. | Volt | −1 |
| 6 | 19-10-2023 | [2023Z17815](https://www.tweedekamer.nl/zoeken?qry=2023Z17815) motie | 74 voor, 70 tegen | verworpen | **Stem achteraf gecorrigeerd** (nu nagekeken): stemmen een dag later gewijzigd, geen opmerking. | PvdA, mede GroenLinks | −1 |
| 7 | 20-01-2026 | [2026Z00559](https://www.tweedekamer.nl/zoeken?qry=2026Z00559) motie | 71 voor, 79 tegen | aangenomen | **Telfout.** Volgens de bron was de conclusie "aangenomen" abusievelijk; dat is aan de Kamer meegedeeld. De uitslag in de bron staat nog op aangenomen. | PVV | +1 |
| 8 | 29-09-2026 | [2026Z20415](https://www.tweedekamer.nl/zoeken?qry=2026Z20415) motie | 75 voor, 72 tegen | verworpen | **Onverklaard.** De stemmen zijn niet achteraf gewijzigd (zelfde minuut als het besluit), en er staat geen opmerking bij. Mogelijk een telfout zonder melding. | PvdD, mede PRO | −1 |

**De keuze:** hoe telt zetelwerk "aangenomen" als de stemmen en de uitslag verschillen?

- **A. De uitslag van de Kamer volgen.** Die is formeel besloten en kan niet meer veranderen. De 8 komen met uitleg op de methodiekpagina.
- **B. De stemmen volgen, zoals nu.** Dat laat zien wat de fracties stemden, ook als de Kamer anders besloot.

**Advies: A.** "Aangenomen" betekent: de Kamer heeft het aangenomen. Het effect is klein: zes stukken op 57.401, en per fractie hooguit één stuk erbij of eraf. Bij grondwetswijzigingen geldt bovendien een andere drempel, en die moet sowieso goed.

**Wat er gebeurt na je keuze**
- **A:** één migratie die bij zetelwerk de uitslag uit de besluittekst haalt, en alleen de stemmen gebruikt als de besluittekst geen uitslag noemt. Daarna een tekst op /methodiek met de 8 gevallen, een test, en Migreer. Ongeveer een uur werk aan mijn kant; voor jou niets.
- **B:** alleen de tekst op /methodiek.

Jouw besluit: ☑ A (27 oktober 2026; verwerkt in migratie 023, Migreer en Ververs wachten op je akkoord) ☐ B

---

## ☐ C5. Handmatige tabellen nalopen (half uur tot drie kwartier)

**Waarom:** deze tabellen heb ik met de hand gevuld, en ze sturen veel cijfers op de site. Een fout in een datum verschuift elke telling per kabinet.

Open elk bestand op GitHub (klik op de link) en loop de punten na. Noteer per tabel "klopt" of wat er anders moet.

**1. Kabinetten en coalities:** [db/migrations/011_coalitie.sql](../../db/migrations/011_coalitie.sql) (15 minuten)
- [ ] Per kabinet: zijn de fracties in de coalitie juist? Gedoogsteun telt als kabinet (PVV onder Rutte I).
- [ ] De begin- en einddatum per kabinet. Bron: [parlement.com](https://www.parlement.com) of Wikipedia.
- [ ] Een fractie die uitstapt, met de datum (bijvoorbeeld de PVV uit Schoof, en NSC).
- Let op: Schoof en Jetten komen uit Wikidata, de rest uit mijn kennis. Kijk die dus het scherpst na.

**2. Commissie naar beleidsterrein:** [db/migrations/014_onderwerpen.sql](../../db/migrations/014_onderwerpen.sql), het blok `core.beleidsterrein_commissie` (10 minuten)
- [ ] Hoort elke commissie bij het goede terrein? Twijfelgevallen zijn commissies met een breed werkterrein, zoals Binnenlandse Zaken.

**3. Trefwoorden voor beleidsterreinen:** [db/migrations/015_trefwoorden.sql](../../db/migrations/015_trefwoorden.sql), het blok `core.beleidsterrein_trefwoord` (10 minuten)
- [ ] Zijn er trefwoorden die ook in een ander terrein vallen en dus verkeerd kunnen sorteren?
- [ ] Mist er een voor de hand liggend woord?

**4. Kamerperiodes en partijkoppeling:** `db/migrations/003_core.sql` (5 minuten)
- [ ] De vier twijfelgevallen: GroenLinks-PvdA, PRO, DPK, Groep Markuszower. Klopt de koppeling aan de voorganger?

**Klopt iets niet?** Schrijf op wat het moet zijn en waar je het vond. Ik pas de migratie aan en draai Migreer; de analyses worden daarna opnieuw berekend.

---

## ☐ C6. Test van de bewaking (een kwartier, plus wachten)

**Waarom:** als de dagelijkse verversing faalt of uitblijft, moet je een mail krijgen. Dit test of dat werkt.

**Deel 1: een foutmelding (5 minuten plus wachten)**
1. Open Terminal en ga naar de map van de repo.
2. Start een verversing die expres faalt. Het echte geheim wordt niet aangeraakt.

   ```bash
   gh workflow run ververs.yml --repo Zetelen/zetelen -f test_fout=true
   ```

3. Wacht een paar minuten. Je verwacht **twee mails**: een van GitHub ("Run failed: Ververs") en een van healthchecks.io.
4. Kreeg je beide? Dan is deel 1 geslaagd.

**Gaat het mis?**
- Zegt Terminal dat `gh` niet bestaat of dat je niet bent ingelogd? Draai dan eerst `gh auth login` en volg de stappen.
- Komt er geen mail van GitHub? Kijk in GitHub bij je instellingen onder Notifications, Actions, of "Send notifications for failed workflows" aan staat.
- Komt er geen mail van healthchecks? Kijk op healthchecks.io bij de check `zetelen-ververs` of er een melding binnenkwam. Zo ja, dan zit het bij de mailinstelling van healthchecks; zo nee, laat het me weten.

**Deel 2: een uitblijvend signaal (10 minuten)**
1. Log in op healthchecks.io en open de check `zetelen-ververs`.
2. Zet **Period** op 1 minuut en **Grace** op 1 minuut. Bewaar.
3. Binnen een paar minuten komt een mail dat de check "down" is.
4. **Zet daarna Period en Grace terug op 1 dag.** Vergeet je dit, dan krijg je elke dag onterecht mails.

Na de test meldt de eerstvolgende gewone verversing (dagelijks) zich weer als "up". Je hoeft niets te herstellen in GitHub.

Achtergrond: [onderhoud.md](../onderhoud.md), onder "De bewaking zelf testen".
