# Overzicht componenten

Opgesteld: 22 oktober 2026. Bron: `../06-epics.md`. Gedeelde regels: `_conventies.md`.

## Componenten van R1

| # | Component | Laag | Stories | Schatting (uur van Niels) |
|---|---|---|---|---|
| 1 | `repo-ci` | Backend | E1-S1 | 2 tot 4 |
| 2 | `api-check` | Backend | E1-S2 | 2 tot 4 |
| 3 | `ingest` | Backend | E1-S3, E1-S4 | 10 tot 20 |
| 4 | `bewaking` | Backend | E1-S7 | 3 tot 5 |
| 5 | `core-model` | Backend | E1-S5 | 6 tot 12 |
| 6 | `rechten` | Backend | E1-S6 | 3 tot 5 |
| 7 | `cohesie-analyse` | Backend | E2-S1, E2-S2 | 8 tot 14 |
| 8 | `datakwaliteit` | Backend | E7-S5 | 3 tot 6 |
| 9 | `ontwerpsysteem` | Frontend | E3-S2 | 6 tot 10 |
| 10 | `site-shell` | Frontend | E3-S1, E3-S4, E3-S7, E3-S9 | 8 tot 14 |
| 11 | `cohesie-pagina` | Frontend | E2-S3, E2-S4, E2-S5, E2-S6 | 10 tot 18 |
| 12 | `lezingen` | Frontend met inhoud | E4-S1, E4-S2, E4-S3, E4-S4 | 8 tot 14 |
| 13 | `methodiek-betrouwbaarheid` | Frontend met inhoud | E3-S3, E7-S1, E7-S2, E7-S3, E7-S4 | 6 tot 10 |
| 14 | `analytics` | Frontend | E3-S6 | 2 tot 4 |
| 15 | `deelplaatjes` | Frontend | E3-S5 | 4 tot 8 |
| 16 | `prestatie-audit` | Frontend | E3-S8 | 2 tot 4 |
| 17 | `coalitie-analyse` | Backend | E2-S7, E2-S8 | 8 tot 14 |
| 18 | `coalitie-pagina` | Frontend | E2-S9 | 6 tot 12 |
| 19 | `onderwerpen` | Backend en frontend | nog te maken | 8 tot 14 |
| 20 | `zetelwerk` | Backend en frontend | geen eigen story; deels E6 (R3) vervroegd | ongeveer 2 (nakijken) |

Alle 35 stories van R1 uit `../06-epics.md` zijn aan een component gekoppeld. Componenten 17 en 18 en de stories E2-S7 tot en met E2-S10 zijn op 24 oktober 2026 toegevoegd (besluit Niels: coalitiebouwer in R1); E2-S10 hoort bij `lezingen`.

De schatting is de tijd van Niels (kiezen, schrijven, beoordelen, testen), niet de rekentijd van Claude Code. Het zijn grove schattingen zonder meting; bijstellen na het eerste component. Totaal R1: 97 tot 178 uur (was 83 tot 152 voor de coalitiebouwer). Bij 6 tot 10 uur per week is dat ruwweg 10 tot 30 weken, met een midden rond 18 weken. R2 tot en met R4 zitten daar niet in.

## Stand op 26 oktober 2026

| Component | Stand |
|---|---|
| `repo-ci`, `api-check`, `ingest` | klaar |
| `bewaking`, `core-model`, `rechten`, `cohesie-analyse`, `datakwaliteit` | gebouwd en getest; open punten voor Niels in het componentbestand |
| `ontwerpsysteem`, `site-shell`, `cohesie-pagina`, `deelplaatjes` | gebouwd en getest, online (niet geindexeerd) |
| `coalitie-analyse`, `coalitie-pagina` | gebouwd, live als concept |
| `onderwerpen`, `zetelwerk` | gebouwd, live als concept |
| `lezingen` | in bouw: proefpagina, wacht op de keuze van Niels |
| `methodiek-betrouwbaarheid` | in bouw: reactietermijn, privacytekst en analytics open |
| `prestatie-audit` | twee metingen; opnieuw voor de livegang |
| `analytics` | niet gestart |

De werkelijke bouwvolgorde week af van de lijst hieronder: `onderwerpen`, `zetelwerk` en het verhaal op de voorpagina kwamen voor `lezingen` en `analytics`, op verzoek van Niels. Wat de livegang nog tegenhoudt, staat bovenaan in `../te-beoordelen.md`.

## Afhankelijkheden

| Component | Hangt af van | Wordt gebruikt door |
|---|---|---|
| `repo-ci` | (geen) | alle |
| `api-check` | `repo-ci` | `ingest`, `core-model`, `cohesie-analyse` |
| `ingest` | `repo-ci`, `api-check` | `bewaking`, `core-model` |
| `bewaking` | `ingest` | `site-shell` (laatst-bijgewerkt-datum) |
| `core-model` | `ingest` | `rechten`, `cohesie-analyse`, `datakwaliteit` |
| `rechten` | `core-model` | `cohesie-analyse`, `cohesie-pagina` |
| `cohesie-analyse` | `core-model`, `rechten` | `datakwaliteit`, `cohesie-pagina`, `lezingen`, `methodiek-betrouwbaarheid` |
| `datakwaliteit` | `core-model`, `cohesie-analyse` | (geen) |
| `ontwerpsysteem` | `repo-ci` | `site-shell`, `cohesie-pagina`, `deelplaatjes` |
| `site-shell` | `ontwerpsysteem` | `cohesie-pagina`, `methodiek-betrouwbaarheid`, `analytics` |
| `cohesie-pagina` | `cohesie-analyse`, `rechten`, `ontwerpsysteem`, `site-shell` | `lezingen`, `deelplaatjes` |
| `lezingen` | `cohesie-analyse`, `cohesie-pagina` | `prestatie-audit` |
| `methodiek-betrouwbaarheid` | `site-shell`, `cohesie-analyse` | `prestatie-audit` |
| `analytics` | `site-shell` | (geen) |
| `deelplaatjes` | `cohesie-pagina` | (geen) |
| `prestatie-audit` | `cohesie-pagina`, `lezingen`, `site-shell`, `methodiek-betrouwbaarheid` | (geen) |
| `coalitie-analyse` | `cohesie-analyse`, `rechten` | `coalitie-pagina` |
| `coalitie-pagina` | `coalitie-analyse`, `cohesie-pagina` | `lezingen`, `deelplaatjes` |

## Bouwvolgorde

Een component tegelijk. Dit is de volgorde, zodat elke afhankelijkheid al klaar is:

1. `repo-ci`
2. `api-check`. Stop hierna: Niels draait het script, het rapport komt in `docs/plan/`, en de epics en de componenten `core-model` en `cohesie-analyse` worden bijgewerkt waar het rapport afwijkt
3. `ingest`
4. `bewaking` (vroeg, omdat een stilletjes stoppende verversing het grootste risico is)
5. `core-model`
6. `rechten`
7. `cohesie-analyse`
8. `datakwaliteit`
9. `ontwerpsysteem`
10. `site-shell`
11. `cohesie-pagina`
12. `coalitie-analyse`
13. `coalitie-pagina` (hergebruikt de zaal uit `cohesie-pagina`)
14. `lezingen`
15. `methodiek-betrouwbaarheid`
16. `analytics`
17. `deelplaatjes`
18. `prestatie-audit`

Eerste live-gang (R1) kan pas als `methodiek-betrouwbaarheid` en `analytics` klaar zijn, en de gebruiksvoorwaarden van de open data zijn vastgelegd.

De backend- en frontendlijn delen alleen `repo-ci` en kunnen dus technisch parallel lopen. Met 6 tot 10 uur per week is dat niet zinvol; ze staan daarom achter elkaar.

## Interfaces tussen componenten

| Van | Naar | Interface |
|---|---|---|
| `ingest` | `core-model` | raw-tabellen per entiteit (namen volgen uit het API-checkrapport) |
| `core-model` | `cohesie-analyse` | core-tabellen met stemmingen op fractieniveau |
| `cohesie-analyse` | `cohesie-pagina` | voorberekende cohesietabel in de analyse-laag |
| `cohesie-analyse` | `lezingen` | cijfers en drempels waarop tekstvarianten wisselen |
| `cohesie-analyse` | `methodiek-betrouwbaarheid` | definitietekst |
| `bewaking` | `site-shell` | datum van laatste succesvolle verversing |
| `rechten` | alle publieke tabellen | anon-rol met alleen `select` |

Een wijziging in een van deze interfaces wordt gemeld en in alle geraakte componentbestanden doorgevoerd.

## Componenten van R2 tot en met R4 en Later (nog niet uitgewerkt)

Uitwerken pas na de API-check en na R1: de API-check kan scope en velden wijzigen.

| Release | Component (voorstel) | Laag | Stories |
|---|---|---|---|
| R2 | `proces-analyse` | Backend | E5-S1, E5-S2 |
| R2 | `proces-pagina` | Frontend | E5-S3, E5-S4 |
| R3 | `kamerleden-analyse` | Backend | E6-S1, E6-S2, E6-S3 |
| R3 | `kamerleden-pagina` | Frontend | E6-S4, E6-S5, E6-S6 |
| R4 | `vertaling` | Frontend | E8-S1 |
| Later | `lens` | Frontend | E8-S2 |
| Later | `eerste-kamer-onderzoek` | Backend | E8-S4 |
| Later | `nieuws-podcasts` | Backend en frontend | E8-S3 |

## Score van het hele plan (stap 7)

**Dekking.** Alle stories van R1 staan in een component. De bijbehorende R2-R4-stories staan in `../06-epics.md` en hebben een voorlopig component hierboven.

**Scherpte.** De acceptatiecriteria zijn overgenomen uit `../06-epics.md`. Niet af te vinken zolang Niels niet beslist: de drempel voor "te weinig data", de reactietermijn op een foutmelding, en de grafiekbibliotheek. De periodesoorten zijn besloten: kabinet (standaard) en Kamerperiode (Niels, 22 oktober 2026).

**Volgorde.** Vastgelegd hierboven. De API-check is het keerpunt: de uitkomst kan de componenten `core-model`, `cohesie-analyse` en alles in R2 en R3 wijzigen.

**Gaten.**
- De gebruiksvoorwaarden van de open data zijn niet vastgelegd (nodig voor de eerste live-gang)
- Niet bekend of Supabase Free past bij het volume en of een dagelijkse schrijfjob de pauzering voorkomt
- Niet bekend of de 60-dagenregel van GitHub Actions wordt opgelost door de gekozen maatregel
- Foto's van Kamerleden: licentie niet uitgezocht (R3)
- Geen beleid voor een verzoek van een Kamerlid om gegevens te verwijderen
- Een Eerste Kamer-uitbreiding is niet onderzocht (zie `../STATUS.md`)

**Totaalbeeld.** R1 is groot: 16 componenten (nu 20, met de coalitiebouwer, onderwerpen en zetelwerk) en een grove schatting van 83 tot 152 uur van Niels. De eerste live-gang ligt daarmee niet binnen drie maanden. Wil Niels sneller live, dan is de eerste optie het verplaatsen van `deelplaatjes`, `prestatie-audit` en het wijzigingslog naar een release direct na de live-gang. Hij heeft ervoor gekozen om R1 niet kleiner te maken; dit staat hier zodat het bewust blijft.
