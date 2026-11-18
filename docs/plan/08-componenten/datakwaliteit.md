# Component: datakwaliteit

Status: gebouwd en getest (24 oktober 2026). Open: de steekproef van 10 uitslagen en de nacontrole van cohesie, beide als kliktabel klaargezet in `../te-beoordelen.md` (26 oktober 2026), en de 8 afwijkende uitslagen bekijken. De extra rijen bij Agendapunt en Besluit zijn verklaard (zie `ingest.md`)
Eerst lezen: `_conventies.md`, `_overzicht.md`, `../05-techniek.md`

## Doel

Geautomatiseerde en handmatige controles dat de cijfers in de database overeenkomen met de officiele uitslagen, zodat een fout niet onder Niels' naam live gaat.

## Laag

Backend

## Interface

Biedt:
- Geautomatiseerde controles die bij elke verversing en in CI draaien
- Een vastgelegde steekproefvergelijking per release (in `docs/`)

Verwacht: het core-model en de cohesie-analyse.

## Afhankelijkheden

`core-model`, `cohesie-analyse`.

## Stories

**E7-S5 Datakwaliteitscontrole.** Als beheerder wil ik afwijkingen tussen mijn cijfers en de officiele uitslagen kunnen vinden.
- Een geautomatiseerde controle toetst dat het totaal aantal zetels per stemming nooit boven 150 komt
- Een steekproef van besluiten (aantal: voorstel 10 per release) is vergeleken met de officiele stemmingsuitslagen en vastgelegd

## Testen

- Voeg een bewust foute testrij toe (meer dan 150 zetels): de controle slaat aan
- Voer de steekproef uit en leg per besluit vast of het klopt, met een verwijzing naar de officiele uitslag

## Aandachtspunten

- De Tweede Kamer toont stemmingsuitslagen per datum op haar eigen site. Gebruik die als referentie
- Vastleggen zonder namen van personen waar het niet nodig is

## Gebouwd (24 oktober 2026)

- `db/migrations/007_datakwaliteit.sql`: tabel `beheer.datakwaliteit` (uitkomst per run), view `beheer.afwijkende_uitslag` (details) en functie `beheer.controleer_datakwaliteit()` met vier controles:
  1. Besluiten met meer dan 150 zetels (fractiegrootte bij handopsteken, aantal leden bij hoofdelijk). Oordeel `fout`: de verversing faalt en er komt een melding
  2. Besluiten waarvan de uitslag volgens de stemmen niet past bij de officiele uitslag in de bron (`BesluitSoort`: aangenomen, verworpen, niet aangenomen, gestaakt). Oordeel `signaal`: de verversing gaat door. Vergissingen tellen mee, omdat een stem officieel telt zoals hij is uitgebracht
  3. Geladen stemmingen die niet (meer) te dateren zijn. Signaal
  4. Besluiten in raw met een datum van voor 2010. Signaal
- `pipeline/ververs.py` draait de controles na de herbouw van `core` en `analyses` en logt ze
- `db/controles/steekproef_uitslagen.sql` en `docs/steekproeven/R1-uitslagen.md`: steekproef van 10 besluiten per release, met sjabloon om de vergelijking met tweedekamer.nl vast te leggen

Toevoeging van Claude: controle 2 vergelijkt elk besluit automatisch met de officiele uitslag in de bron. Dat vangt meer dan de grens van 150 zetels en vervangt de handmatige steekproef niet, want beide komen uit dezelfde bron.

## Getest (24 oktober 2026)

- 68 tests slagen lokaal en in CI, waaronder: een bewust foute rij met 160 zetels geeft `fout` en laat de verversing falen; een aangenomen besluit met meer stemmen tegen geeft `signaal`; schone data geeft alleen `goed`
- Op Supabase, volledige data: 0 besluiten boven 150 zetels; 8 van de 60.133 besluiten waarvan de uitslag niet past bij de stemmen (signaal, nog niet bekeken); 0 geladen stemmingen zonder datum; 0 besluiten in raw van voor 2010
- Niet gedaan: de handmatige steekproef tegen tweedekamer.nl (Niels)

Bevinding: de 5 en 4 rijen die Agendapunt en Besluit meer hebben dan de API (zie `ingest.md`) zijn niet verklaard door een datum van voor 2010 (controle 4 geeft 0). De oorzaak is nog onbekend.

## Schatting

Klein, ca. 3 tot 6 uur van Niels. Grove schatting, niet gemeten.
