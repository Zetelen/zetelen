---
name: zetelen-site
description: Vaste ontwerpregels en de verplichte eindcontrole voor zetelen.nl (repo zetelen-repo, Next.js in web/). Gebruik dit bij elke wijziging aan de site die je op het scherm ziet, ook een kleine stijlaanpassing, bij elke nieuwe pagina of grafiek, en voordat je een push voorstelt. Trefwoorden - zetelen, telefoon, mobiel, iPad, ontwerp, CSS, lettertype, tikvlak, witruimte, grafiek, deelbeeld, voorpagina.
---

# Zetelen: de site

Veel bezoekers komen via Bluesky en LinkedIn op de telefoon. Daarom: **telefoon eerst** ontwerpen, en **meten** voor je iets af noemt.

## 1. Lees eerst

- `docs/ontwerp/ontwerpregels.md`: de regels voor opbouw, ruimte, letters, tikken, kleur en delen.
- `docs/ontwerp/tone-of-voice.md`: voor elke tekst.
- `docs/ontwerp/HANDOVER.md` en `web/styles/tokens.css`: kleur en vorm.
- `docs/plan/08-componenten/_conventies.md`: de harde regels van het project, ook over de feitencontrole.

## 2. Kernregels (kort)

- Ontwerp op 375 px en schaal op; meet op 375, 768, 1024 en 1280 px.
- Niets breder dan het scherm, ook niet in uitklapblokken en tabellen.
- Elk gereedschap opent met een antwoord: de eerste grafiek of keuze in het eerste scherm.
- Ruimte tussen blokken hoogstens 64 px; geen `vh` of `svh` voor ruimte (uitzondering: scrolllengte in scrollverhalen).
- Lopende tekst minstens 16 px; aantikbaar minstens 44 px.
- Twee lettertypen: Newsreader (koppen) en Hanken Grotesk met tabelcijfers (de rest).
- Koper alleen voor markering en interactie, nooit als datakleur.
- Elke grafiek een eigen anker en deelbeeld (`GrafiekKader`, `lib/deel.ts`).
- Geen bestaand bestand aanpassen zonder dat Niels de wijziging eerst ziet: bij ontwerp eerst voor- en na-beelden in de vault en de chat.

## 3. Terugkerende fouten

| Fout | Datum | Gevangen door |
|---|---|---|
| Pagina breder dan de telefoon door een lange link | 16 november 2026, opgelost in fd0fbb7 | `telefoon.mjs`, punt 1 |
| Gekantelde kolomkoppen op /onderwerpen breder dan de tablet | 16 november 2026, opgelost in fd0fbb7 | `telefoon.mjs` op 768 px |
| De bouwer op /coalitie bijna twee schermen onder de kop | 16 november 2026, opgelost in f440e17 | `telefoon.mjs`: eerste grafiek op |
| Lokale server hield na dagen een oude versie van `lib/deel.ts` vast (deellink gaf 404) | 18 november 2026 | herstart de server voor je meet |

## 4. Eindcontrole (verplicht, voor je iets af noemt of een push voorstelt)

1. `cd web && npx vitest run`, daarna de CI-build zonder `.env.local` en `npm run controleer-build`.
2. Start de lokale server (preview `web`, poort 3001) en meet:
   ```
   node web/scripts/telefoon.mjs http://localhost:3001
   BREEDTE=768 HOOGTE=1024 node web/scripts/telefoon.mjs http://localhost:3001
   BREEDTE=1024 HOOGTE=768 node web/scripts/telefoon.mjs http://localhost:3001
   BREEDTE=1280 HOOGTE=800 node web/scripts/telefoon.mjs http://localhost:3001
   ```
   Exitcode 1 is een fout: eerst oplossen.
3. Bekijk zelf de schermafbeeldingen van de pagina's die je hebt veranderd en zet voor en na in de vault (`Zetelen/Bijlagen/`), met een notitie in `Zetelen/Beoordelen/`.
4. Feitencontrole met de skill `feitencontrole` voor elke tekst of elk getal dat verandert.
5. Na de push: wacht op Vercel en meet de live site opnieuw.

## 5. Bijhouden

Elke nieuwe keuze of feedback van Niels over het ontwerp wordt meteen een regel in `docs/ontwerp/ontwerpregels.md` of paragraaf 3 hierboven, waar het kan een meting in `telefoon.mjs`, en een regel in het wijzigingslog.

## Wijzigingslog

- 18 november 2026: skill en `ontwerpregels.md` gemaakt in de ontwerpronde fase A, naar de uitgangspunten van Oorlog in kaart. `web/scripts/telefoon.mjs` overgenomen en aangepast (Zetelen-pagina's, breedte instelbaar, eerste grafiek). Nog niet goedgekeurd door Niels: zie K25 in de vault.
