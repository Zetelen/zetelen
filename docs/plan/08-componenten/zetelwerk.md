# Component: zetelwerk (moties, amendementen en oppositiewerk)

Status: plan, 25 oktober 2026, ter goedkeuring. Besluit Niels: in R1, moties en amendementen allebei en apart, met een eigen pagina over oppositiewerk met motion graphics.
Eerst lezen: `_conventies.md`, `../../ontwerp/tone-of-voice.md`, `coalitie-analyse.md`, `../lezingen-kandidaten.md`.

## Doel

Laten zien wat Kamerleden en fracties zelf indienen, wat ervan aangenomen wordt, met wiens steun, en hoe dat over de jaren veranderde. Vooral de oppositie: wat kan een fractie die niet regeert?

Bron: per zaak de `ZaakActor` met `Relatie` = 'Indiener' of 'Medeindiener' (Kamerlid in `Persoon_Id`, fractie in `ActorFractie` en `Fractie_Id`). Staat al in `raw.zaakactor`; steekproef maart 2026: 94 indieners en 69 medeindieners op moties, allemaal met persoon en fractie.

## Ter goedkeuring: de definities

1. **Ingediend:** een motie of amendement waarover gestemd is, met dit Kamerlid als indiener. Medeindieners tellen apart, als "mede ingediend". Een motie met drie indieners telt voor elk van de drie.
2. **Fractie van de indiener:** de fractie op het moment van indienen (`ActorFractie`), niet de huidige.
3. **Uitslag:** uit de stemmen, niet uit de tekst van het besluit. Aangenomen als de zetels voor meer zijn dan de zetels tegen, met dezelfde zetelregels als de coalitiebouwer. In 8 gevallen klopt de tekst van de bron niet met de stemmen (zie datakwaliteit). Is er over een zaak vaker gestemd, dan telt de laatste stemming.
4. **Rol:** kabinet, gedoogsteun of oppositie, op de datum van de stemming, uit `core.coalitie`. Voorstel: gedoogsteun valt onder kabinet.
5. **Steun:**
   - de zetels voor;
   - het aantal fracties voor;
   - **brede steun** = aangenomen met stemmen voor van ten minste één kabinets- en één oppositiefractie die niet de indiener is.
6. **Tegenstemmen per fractie:** het aandeel van alle stemmingen waarop de fractie tegen stemde. Dat zijn alle stemmingen, niet alleen moties.
7. **Moties en amendementen apart:** elk met een eigen score. Ze worden nooit opgeteld, want een amendement wijzigt een wet en een motie is een verzoek.
8. **Drempel:** tellingen onder de 10 ingediende stukken per periode tonen we wel, maar zonder percentage.

**Wat we bewust niet meten:** of een aangenomen motie is uitgevoerd. Dat staat niet in de data. Op de pagina staat dat er ook bij.

## Databank (migratie 018)

- `analyses.zaak_uitslag`: per motie en amendement de zaak, de soort, de datum, het kabinet, de Kamerperiode, de zetels voor en tegen, aangenomen ja of nee, de fracties voor (ids), en brede steun ja of nee.
- `analyses.indiening`: per zaak en Kamerlid de relatie (indiener of medeindiener), de fractie op dat moment en de rol.
- `analyses.zetelwerk_fractie` en `analyses.zetelwerk_persoon`: per periode en soort de tellingen ingediend, mede ingediend, aangenomen, brede steun en de mediane steun in zetels. Bij een fractie ook het aandeel tegenstemmen.
- Views `api.zetelwerk_fractie`, `api.zetelwerk_persoon` en `api.indiening_netwerk`, dat laatste voor het samenwerken: per paar fracties het aantal stukken met een indiener van de ene en een medeindiener van de andere.
- Opgebouwd in een eigen functie `analyses.herbouw_zetelwerk()`, die meedraait in Ververs. Na de bouw zijn Migreer en Ververs nodig.
- **Namen van Kamerleden:** alleen naam en fractie, uit `core.persoon`. Dat mag volgens de afspraken op de site, maar nooit in logs.

## Pagina "Oppositiewerk" (/oppositie), een scrollverhaal

Een verhaal over 16 jaar oppositie, met dezelfde scrolltechniek als de voorpagina: een vaste tekening links of rechts, met een tijdlijn van kaarten. Werktitel van de kop, in de toon van de stijlgids: **"Wat kun je als je niet regeert?"**

Elk hoofdstuk heeft één beeld dat beweegt bij het scrollen, en eindigt waar het kan met een lezingenpaar.

**1. Steeds meer moties**
- **Beeld:** stippen vallen jaar voor jaar in een kolom, waarbij één stip 25 moties is. Van 1.362 moties in 2010 naar 3.873 in 2025. Gekleurd naar de rol van de indiener, kabinet of oppositie.
- **Tekst:** "In 2010 stemde de Kamer over 1.362 moties. In 2025 over 3.873."
- **Lezing:** "meer moties is meer invloed" tegenover "meer moties is inflatie".

**2. Wie dient in?**
- **Beeld:** dezelfde stippen splitsen per kabinet in twee stapels, kabinet en oppositie.
- **Verwachting, nog te controleren:** de oppositie dient het overgrote deel in.

**3. Hoe vaak lukt het?**
- **Beeld:** elke stip van de oppositie valt in de bak "aangenomen" of "verworpen". Daarna schuiven de kabinetten langs: meerderheidskabinetten (Rutte II tot en met IV) tegenover gedoogd of minderheid (Rutte I, Jetten).
- **Lezing:** "onder een minderheidskabinet heeft de oppositie meer invloed" tegenover "maar vooral met moties die het kabinet toch al wilde".

**4. Tegen stemmen en zelf scoren: de fracties bewegen**
- **Beeld:** een spreidingsdiagram. Horizontaal het aandeel tegenstemmen, verticaal het aandeel aangenomen eigen moties, elke fractie een stip in haar eigen tint. Bij het scrollen lopen de stippen door de kabinetten heen, met een spoor erachter. Dit is het pronkstuk.
  - Je ziet een fractie van kabinet naar oppositie gaan en terug, zoals de PVV van Schoof naar Jetten.
  - De vier kwadranten krijgen beschrijvende namen, geen oordeel: "veel tegen, weinig eigen succes", enzovoort.
- **Lezing:** "veel tegenstemmen is dwarsliggen" tegenover "het is precies het werk van de oppositie: controleren".

**5. Samenwerken over de grens**
- **Beeld:** een netwerk van fracties. Een lijn betekent samen ingediend, met dikte naar het aantal. Per kabinet verschuift het netwerk, en lijnen tussen kabinet en oppositie lichten op.
- **Tekst:** wie dient vaak samen in over de grens tussen kabinet en oppositie?

**6. Amendementen: aan de wet zelf zitten**
- **Beeld:** hetzelfde als hoofdstuk 3, maar voor amendementen. Minder stukken, maar met direct effect op een wet.
- **Tekst:** hoeveel amendementen van de oppositie haalden het per kabinet?

**Einde:** knoppen naar de pagina Kamerleden, naar de fractiepagina's (met daar een blok zetelwerk) en naar de coalitiebouwer.

**Op de telefoon:** dezelfde stappen, het spreidingsdiagram vierkant, en het netwerk als lijst van de vijf sterkste verbindingen.

## Pagina "Kamerleden" (/kamerleden, concept)

- **Per fractie en periode** een lijst van de Kamerleden: ingediend, mede ingediend, aangenomen en brede steun, apart voor moties en amendementen.
- **Zoeken op naam.** Geen ranglijst over de hele Kamer, om "wie is de beste" te vermijden. Wel sorteren binnen een fractie.
- **Per Kamerlid de stukken:** titel, uitslag en zetels voor, met een link naar tweedekamer.nl.
- **Op de fractiepagina's** komt een blok "zetelwerk" met de tellingen van de fractie.

## Toon en onpartijdigheid

- Maten met beschrijvende namen: ingediend, aangenomen, brede steun, tegenstemmen. Geen "effectief", "constructief" of "dwarsligger".
- Kabinet en oppositie altijd zichtbaar apart. Een ranglijst zonder rol vergelijkt appels met peren.
- "Zetelwerk" als koepelbegrip: "ingediend, aangenomen en mede ingediend: dat is zetelwerk".

## Techniek

- De scrolltechniek bestaat al (`components/verhaal/ScrollVerhaal.tsx`). Stippen die schuiven passen bij hoofdstukken 1, 2, 3 en 6. Een stip per 25 moties houdt het aantal beheersbaar, zo'n 1.500 stippen.
- **Nieuw:**
  - een spreidingsdiagram met sporen (hoofdstuk 4);
  - een netwerk (hoofdstuk 5): vaste posities in een cirkel, alleen de lijnen veranderen.
  Beide in SVG met CSS-overgangen, zoals de rest.
- Plekken en tellingen rekent de server uit, zoals nu.

## Volgorde en schatting

1. Migratie 018 en de herbouw, met pytest. Daarna Migreer en Ververs.
2. Controle van de cijfers: een steekproef van 20 moties met de hand naast tweedekamer.nl.
3. De pagina Kamerleden en het blok op de fractiepagina's.
4. De pagina Oppositiewerk: eerst de hoofdstukken 1 tot en met 3, dan 4 (het pronkstuk), dan 5 en 6.
5. Lezingen voor deze pagina, met dezelfde vier criteria.

Grove schatting: 12 tot 20 uur werk aan mijn kant. Voor Niels: het nakijken van de definities en de steekproef, ongeveer 2 uur.

## Vragen aan Niels

1. Akkoord met de definities 1 tot en met 8? Vooral: gedoogsteun telt als kabinet (4), en de laatste stemming over een zaak telt (3).
2. Telt een motie met meerdere indieners voor elk van hen volledig (voorstel), of naar rato?
3. De periode-eenheid op de oppositiepagina: per kabinet (voorstel, past bij de rest van de site) of per jaar?
4. Werktitel "Wat kun je als je niet regeert?": goed als richting?
