# Onderzoek: wat gebeurt er na een aangenomen motie?

Gedaan op 26 oktober 2026 tegen de live API (`https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0`), alleen lezen. Tellingen via `$count=true` en `$apply=groupby`, steekproeven van 40 tot 106 records. Geen namen van personen; zaaknummers wel.

Vraag: kan Zetelen een pagina maken met "En toen? Wat gebeurt er met een aangenomen motie?", met cijfers per kabinet en per ministerie?

Definitie van aangenomen motie in dit onderzoek: `Zaak` met `Soort eq 'Motie'`, `Verwijderd eq false` en minstens een niet-verwijderd `Besluit` met `BesluitSoort eq 'Stemmen - aangenomen'`. Dat is "ooit aangenomen", niet strikt "laatste besluit is aangenomen"; dat verschil is via OData niet te filteren en moet in de database worden gecontroleerd. Totaal: 66.159 moties, waarvan 26.502 aangenomen.

## 1. Toezegging

**Velden** (uit `$metadata`, staat niet in `api-check-rapport.md`): `Id`, `Aanmaakdatum`, `Nummer`, `ActiviteitNummer`, `Naam`, `Achternaam`, `Initialen`, `Voornaam`, `Achtervoegsel`, `Titulatuur`, `Tussenvoegsel`, `Functie`, `Status`, `DatumNakoming`, `Ministerie`, `Tekst`, `Notities`, `Verwijderd`, `GewijzigdOp`, `ApiGewijzigdOp`.
Relaties: `Activiteit`, `KamerbriefNakoming` (naar Document), `ToegezegdAan` (Persoon en Fractie), en zes onderlinge relaties (`IsHerhalingVan`, `IsWijzigingVan`, `IsAanvullingOp` en hun tegenhangers).
Er is **geen relatie naar Zaak**, dus ook niet naar een motie.

**Aantallen**: 6.787 records, 51 verwijderd. Per jaar van `Aanmaakdatum` (niet verwijderd):

| Jaar | Toezeggingen | Afgedaan | Deels afgedaan | Openstaand | Vervallen |
|---|---|---|---|---|---|
| 2010 tot en met 2021 | 0 | | | | |
| 2022 (vanaf september) | 809 | 699 | 5 | 101 | 4 |
| 2023 | 1.619 | 1.246 | 23 | 333 | 17 |
| 2024 | 1.362 | 920 | 18 | 419 | 5 |
| 2025 | 1.475 | 970 | 11 | 485 | 9 |
| 2026 (tot 26 okt) | 1.471 | 395 | 10 | 1.066 | 0 |

Het oudste record is TZ202209-001 van 8 september 2022. Daarvoor bestaat er niets in de API.

**Statussen**: Afgedaan 4.230, Openstaand 2.404, Deels Afgedaan 67, Vervallen 35.

**Vulling**:

- `Ministerie`: 100% gevuld, 17 waarden (de ministeries zoals ze op dat moment heetten, dus zowel 'Landbouw, Natuur en Voedselkwaliteit' als 'Landbouw, Visserij, Voedselzekerheid en Natuur'). Een omzettabel naar een vast ministerie is nodig voor een reeks.
- `Functie` (functie van de bewindspersoon): 100% gevuld.
- `Activiteit`: 100% gekoppeld. In een steekproef van 40: 31 commissiedebat, 4 wetgevingsoverleg, 3 notaoverleg, 2 plenair debat (wetgeving). Het gaat dus vooral om toezeggingen in commissies.
- `KamerbriefNakoming`: 3.921 gekoppeld. Bij Afgedaan 3.855 van 4.230 (91%). In een steekproef zijn dat brieven met Soort 'Brief regering'.
- `DatumNakoming`: gevuld bij 3.945; leeg betekent de waarde `0001-01-01`. Bij Afgedaan 3.892 van 4.230.
- `ToegezegdAan`: 3.092 gekoppeld (46%).
- `Notities`: nooit gevuld.
- `Tekst`: in 359 toezeggingen komt het woord 'motie' voor, maar dat is vrije tekst zonder koppeling.

**Doorlooptijd** (Afgedaan met datum): mediaan 89 dagen van aanmaak tot nakoming, kwartielen 31 en 185 dagen. 247 records hebben een nakomingsdatum voor de aanmaakdatum; die moeten eruit of apart.
**Achterstand**: van de 2.404 openstaande toezeggingen zijn er 1.302 ouder dan een jaar en 723 ouder dan twee jaar.

**Per ministerie** (alle jaren, aandeel openstaand): Defensie 123 van 181 open, Justitie en Veiligheid 413 van 730, Volksgezondheid 403 van 892, Binnenlandse Zaken 342 van 740; tegenover Infrastructuur en Waterstaat 172 van 1.088 en Sociale Zaken 109 van 475. Let op: recente jaren hebben vanzelf meer open toezeggingen, dus vergelijk per aanmaakjaar.

**Oordeel**: schoon en volledig vanaf september 2022, met ministerie, status en nakomingsbrief. Bruikbaar voor de laatste twee kabinetten, niet voor eerdere. Geen brug naar moties.

## 2. Zaak voor moties: Afgedaan, HuidigeBehandelstatus, Status, Termijn, Kabinetsappreciatie

| Veld | Alle moties (66.159) | Aangenomen (26.502) | Betekenis |
|---|---|---|---|
| `Afgedaan` | true 65.921, false 238 | true 26.502 | Afgedaan in de Kamer: er is over gestemd of de motie is vervallen. De 238 false zijn moties uit 2025-2026 en 2026-2027 waarover nog niet besloten is. Zegt niets over uitvoering. |
| `HuidigeBehandelstatus` | 0 gevuld | 0 gevuld | Nooit gevuld bij moties. |
| `Status` | 'Vrijgegeven' 66.159 | 'Vrijgegeven' 26.502 | Publicatiestatus, geen inhoud. |
| `Termijn` | 7.368 gevuld | 485 gevuld | Termijn van een aangehouden motie (mediaan 104 dagen na indienen). In de steekproef hebben vrijwel alle moties met een termijn het besluit 'Stemmen - aangehouden', vaak gevolgd door 'Termijn - vervallen in verband met verstrijken termijn'. Geen uitvoeringstermijn. |
| `Kabinetsappreciatie` | 100% gevuld | 100% gevuld | Oordeel van het kabinet **voor** de stemming. |

Waarden van `Kabinetsappreciatie`:

| Waarde | Alle moties | Aangenomen |
|---|---|---|
| Niet beschikbaar bij moties en/of amendementen vóór 1 april 2019 | 29.003 | 8.337 |
| Ontraden | 13.682 | 1.890 |
| Oordeel Kamer | 13.002 | 11.613 |
| Niet beschikbaar bij gewijzigde moties en/of amendementen | 5.948 | 3.661 |
| Verzocht motie aan te houden | 1.437 | 176 |
| Geen (expliciete) appreciatie | 1.256 | 351 |
| Ontijdig | 595 | 186 |
| Overbodig | 467 | 165 |
| Ontraden, tenzij gewijzigd | 344 | 28 |
| Overgenomen | 236 | 6 |
| Nog te ontvangen | 155 | 73 |
| Nog niet bekend | 34 | 16 |

Aangenomen moties per vergaderjaar: van 854 (2008-2009) naar 2.742 (2024-2025).

**Oordeel**: geen van deze velden zegt of een aangenomen motie is uitgevoerd. `Kabinetsappreciatie` is wel een sterk gegeven voor de pagina: sinds april 2019 is bekend welke aangenomen moties het kabinet had ontraden (1.890 aangenomen terwijl ontraden).

## 3. Spoor van een kabinetsreactie via relaties

**Wat bestaat er**:

- `Zaak.GerelateerdVanuit` bij aangenomen moties: 14.834 moties hebben minstens een gerelateerde zaak; 14.711 daarvan hebben een gerelateerde zaak met Soort 'Brief regering'. Bij 296 is er (ook) een andere soort, zoals 'Nota n.a.v. het verslag'.
- `GerelateerdNaar`: 19 aangenomen moties. `VervangenDoor`: 0.
- `Zaak.Document` van een motie bevat alleen de motie zelf ('Motie' of 'Motie (gewijzigd/nader)'), nooit een brief (0 aangenomen moties met een document van Soort 'Brief regering').
- Ter vergelijking: 582 verworpen moties hebben ook een gerelateerde zaak.

**Vulling per vergaderjaar** (aangenomen moties met een gerelateerde zaak van Soort 'Brief regering'):

| Vergaderjaar | Aangenomen | Met brief | Aandeel |
|---|---|---|---|
| 2008-2009 t/m 2014-2015 | 5.858 | 202 | 1 tot 8% |
| 2015-2016 | 1.289 | 164 | 13% |
| 2016-2017 | 905 | 335 | 37% |
| 2017-2018 | 1.137 | 913 | 80% |
| 2018-2019 | 1.770 | 1.500 | 85% |
| 2019-2020 | 1.867 | 1.569 | 84% |
| 2020-2021 | 2.310 | 1.972 | 85% |
| 2021-2022 | 1.922 | 1.578 | 82% |
| 2022-2023 | 2.156 | 1.858 | 86% |
| 2023-2024 | 1.683 | 1.404 | 83% |
| 2024-2025 | 2.742 | 2.071 | 76% |
| 2025-2026 | 2.453 | 1.130 | 46% |
| 2026-2027 | 404 | 15 | 4% |

De registratie loopt pas goed vanaf 2017-2018. Het lage aandeel in de laatste twee jaren is te verwachten: de brief komt later (zie doorlooptijd).

**Wat voor brief is het**: steekproef van 45 aangenomen moties uit 2018-2019, 2022-2023 en 2024-2025 met samen 106 gerelateerde brieven.

- Per motie 1 tot 7 brieven (mediaan 2).
- Tijd van motie tot brief: mediaan 211 dagen, kwartielen 125 en 432 dagen, nooit negatief.
- Slechts 7 van de 106 brieven hebben 'uitvoering' in het onderwerp (bijv. 2018Z24480 met brief 2019Z15145, 2023Z15059 met 2023Z16366). De rest zijn reacties op de motie, verzamelbrieven "stand van zaken moties en toezeggingen" (2022Z22322 met 2023Z11693 en 2024Z15311), voortgangsbrieven, MIRT-brieven, verslagen van EU-raden en schriftelijke overleggen.
- De koppeling is dus "deze brief gaat (ook) over deze motie", gelegd door de Kamer. Het is geen vlag "uitgevoerd" en zegt niet of het kabinet de motie uitvoert, deels uitvoert of naast zich neerlegt.
- Ministerie: de brief-zaak heeft `Organisatie` 'Tweede Kamer', maar via `ZaakActor` met `Relatie` 'Indiener' en een `Functie` als "Minister van ..." of "Staatssecretaris van ..." is de afzender te bepalen. De motie zelf heeft alleen 'Indiener', 'Medeindiener' en 'Voortouwcommissie'; geen ministerie.

Breder: in heel Document zijn er 89.757 brieven van de regering; 4.641 hebben 'motie' in het onderwerp, 796 'uitvoering van de motie', 516 'uitvoering motie' en 327 'moties en toezeggingen'. Die tekst noemt vaak het Kamerstuknummer van de motie, maar dat is vrije tekst.

Kabinetsappreciatie en opvolging (aangenomen, 2017-2018 tot en met 2024-2025): van 1.663 ontraden maar aangenomen moties hebben er 1.490 (90%) een gerelateerde brief; van 9.413 met 'Oordeel Kamer' 7.919 (84%).

## Oordeel over "En toen?"

**Haalbaar, met een eerlijke definitie.** De API kent geen status "uitgevoerd" voor moties. Wat wel kan:

1. **Kreeg de Kamer er een brief over?** Definitie: aangenomen motie met minstens een gerelateerde zaak van Soort 'Brief regering' (`GerelateerdVanuit`). Bruikbaar vanaf vergaderjaar 2017-2018, dus voor Rutte III, Rutte IV en Schoof (en lopend). Cijfers per kabinet en per ministerie (via de indiener van de brief, of via de voortouwcommissie van de motie). Plus: hoe lang duurde het tot de eerste brief. Kop zoals "Bij 1 op de 6 aangenomen moties hoort de Kamer daarna niets" is met deze data te onderbouwen, mits de laatste anderhalf jaar wordt weggelaten of als lopend getoond.
2. **Ontraden en toch aangenomen.** Vanaf april 2019, 1.890 moties. Sterk verhaal: de Kamer gaat tegen het kabinet in; krijgt ze daarna antwoord?
3. **Toezeggingen als tweede hoofdstuk.** Wel een echte status (afgedaan, open, vervallen), ministerie en nakomingsbrief, maar alleen vanaf september 2022 en zonder koppeling naar moties. Sterk voor "welk ministerie laat toezeggingen het langst liggen".

**Beperkingen**:

- "Brief ontvangen" is niet "uitgevoerd". Een voortgangsbrief die de motie noemt telt mee. Op de pagina moet staan dat het om een reactie gaat, niet om uitvoering.
- De koppeling motie en brief is handwerk van de Kamer; vóór 2017 grotendeels afwezig. Geen reeks sinds 2010 mogelijk.
- Recente moties hebben vanzelf nog geen brief (mediaan ruim 200 dagen). Toon pas na een vaste wachttijd, bijvoorbeeld een jaar, of kijk naar "brief binnen een jaar".
- Ministerie zit niet op de motie. Voortouwcommissie is een benadering; de indiener van de brief is preciezer maar alleen bekend als er een brief is. Ministerienamen wisselen per kabinet; een omzettabel is nodig.
- Toezeggingen en moties zijn niet aan elkaar te koppelen.
- "Aangenomen" is hier "ooit een besluit aangenomen"; voor de site eerst controleren met het laatste besluit in de eigen database.
- Kabinetten komen niet uit de API (zie `api-check-handmatig.md`); de eigen kabinettentabel is nodig om per kabinet te tellen, op datum van de stemming.

**Nog niet gedaan**: een telling via de eigen database met het laatste besluit; een grotere steekproef om het aandeel echte reacties (tegenover verzamel- en voortgangsbrieven) te schatten; een telling per ministerie van de brief-indiener.
