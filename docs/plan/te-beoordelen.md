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

- [ ] **Lezingen:** welke komen vast in het verhaal? Zie [lezingen-kandidaten.md](lezingen-kandidaten.md). Mijn advies: 3 (eens tegenover regeerakkoord), 1 en 2 (coalitie), en 6 (asiel). De dynamische lezingen in de tools bouw ik daarna.
- [ ] **Feedbackronde:** de link naar je vragenlijst, voor `FEEDBACK_URL` in `web/lib/site.ts`, plus de naam van de dienst en de bewaartermijn in de privacytekst.
- [ ] **Menu:** er staan nu zeven onderdelen in (Verkenner, Onderwerpen, Coalitie, Oppositie, Fracties, Methodiek, Over). Kamerleden staat er niet in, maar is bereikbaar via Oppositiewerk, de fractiepagina's en de tegels. Akkoord, of liever korter?
- [ ] **Labels "concept":** wanneer mogen ze eraf, en waarvan?

## Wat ik deze nacht deed

Zie de sectie "Verslag" onderaan, die ik aanvul tot ik stop.

## Steekproef zetelwerk

Volgt.

## Verslag

Volgt.
