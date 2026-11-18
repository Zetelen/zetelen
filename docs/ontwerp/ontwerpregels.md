# Ontwerpregels Zetelen

Vastgelegd op 18 november 2026 (ontwerpronde fase A), overgenomen van de uitgangspunten van Oorlog in kaart en aangepast aan Zetelen. Het ontwerpsysteem (`HANDOVER.md`, `web/styles/tokens.css`) blijft de bron voor kleur en vorm; de tone of voice (`tone-of-voice.md`) blijft leidend voor tekst. Bij een tegenspraak geldt de nieuwste keuze van Niels; zet die dan hier en in het wijzigingslog van de skill `zetelen-site`.

## Opbouw

- Ontwerp op 360 tot 375 px breed en schaal op. Meet op 375 (telefoon), 768 (iPad staand), 1024 (iPad liggend) en 1280 px (laptop).
- Niets is breder dan het scherm, ook niet in een uitklapblok of tabel. Een brede tabel krijgt een eigen strook met `overflow-x: auto`, of onder 600 px een blok per rij.
- Elk gereedschap opent met een antwoord: de eerste grafiek of keuze staat in het eerste scherm op 375 x 812. Uitleg ("Hoe lees je dit?", Wat je ziet, Wat opvalt) staat eronder of in een uitklapblok.
- De voorpagina opent met één bevinding: een vraag, een cijfer, een zin en een grafiek, met direct de twee lezingen. Daaronder Actueel, dan het gereedschap.
- Een scherm is gevuld: geen lege strook hoger dan 35% van het scherm.

## Ruimte

- Tussen tekstvlakken en blokken een vaste maat, hoogstens 64 px (`--r-8`). Op de telefoon 48 px tussen de blokken van een pagina.
- Nooit `vh` of `svh` voor ruimte tussen tekstvlakken. Uitzondering: de scrolllengte per stap in een scrollverhaal, waar de tekening het scherm vult terwijl de kaarten eroverheen schuiven (`components/verhaal`). Zie het open punt in K25.
- Een leeg element neemt geen ruimte in (`:empty { display: none }`). Geen `min-height` als plaatshouder.

## Letters

- Twee lettertypen: Newsreader voor koppen, grote getallen en het woordmerk; Hanken Grotesk met tabelcijfers voor al het andere, ook labels en tabellen. Geen schrijfmachineletter meer.
- Lopende tekst minstens 16 px. Kleiner alleen voor labels, bronregels, bijschriften en assen.

## Tikken

- Elk aantikbaar element minstens 44 px (`--doel-min`), liefst 48. Links midden in een zin zijn uitgezonderd.

## Kleur

- Koper (`--koper`) alleen voor markering en interactie: links, de gekozen fractie of groep, de focusrand. Nooit als kleur van een reeks of categorie in een grafiek.
- Kleur is nooit de enige drager van betekenis: er staat altijd een getal, label of patroon bij.

## Delen

- Elke grafiek staat in een `GrafiekKader` met een eigen anker (`id`) en een eigen deelbeeld (`/deel/<grafiek>/plaatje`) met kop, cijfer en bron.

## Meten

`node web/scripts/telefoon.mjs <basisadres> [pad ...]`, met `BREEDTE` en `HOOGTE` voor andere schermen. Meet breedte, lege stroken, kleine letters, kleine knoppen en de plek van de eerste grafiek. Zie de skill `zetelen-site` voor de eindcontrole.
