# Component: lezingen

Status: in bouw (26 oktober 2026). Kandidaten in `../lezingen-kandidaten.md`; proefpagina https://zetelen.vercel.app/lezingen (niet in het menu, niet geindexeerd) met vier lezingen op echte data. Vaste lezingen staan op de voorpagina en Oppositiewerk. Wacht op de keuze van Niels; daarna de dynamische lezingen in de tools
Eerst lezen: `_conventies.md`, `_overzicht.md`, `../01-idee.md` (sectie "Duiding: twee lezingen"), `cohesie-analyse.md`, `cohesie-pagina.md`

## Doel

Bij elke analyse twee onderbouwde lezingen naast elkaar tonen, als handgeschreven sjablonen waarin de cijfers automatisch worden ingevuld. Niels keurt elke tekst goed voor publicatie. In R1 alleen voor de cohesie-analyse; het format wordt hier bewezen.

## Laag

Frontend met inhoud (teksten in `content/`)

## Interface

Biedt:
- Een lezingenblok dat twee teksten naast elkaar toont (onder elkaar op mobiel)
- Sjabloonlogica die per filtercombinatie de tekstvariant kiest
- Tekstbestanden in `content/` die alleen via een pull request wijzigen

Verwacht: de cijfers uit `cohesie-analyse`, de pagina van `cohesie-pagina`.

## Afhankelijkheden

`cohesie-analyse`, `cohesie-pagina`.

## Stories

**E4-S1 Format.** Als bezoeker wil ik twee lezingen naast elkaar.
- Beide lezingen zijn altijd tegelijk zichtbaar en even prominent
- Elke lezing heeft een label voor de invalshoek en verwijst per bewering naar het cijfer waarop het rust
- Op mobiel staan ze onder elkaar met gelijke opmaak
- Een uitleg bij het format zegt dat de lezingen invalshoeken zijn, geen oordeel van de maker

**E4-S2 Lezingen voor cohesie schrijven.** Als beheerder wil ik twee lezingen schrijven en kunnen verdedigen.
- Beide lezingen zijn de sterkste versie van hun argument, niet een stropop
- Voorstel: een lezer met een andere voorkeur dan Niels leest beide mee en herkent ze als eerlijk
- Niels kan elke lezing in zijn eigen woorden navertellen

**E4-S3 Sjabloonlogica.** Als bezoeker wil ik dat de tekst bij de lezing klopt bij het getoonde cijfer, ook als ik filter.
- De tekst wisselt van variant op basis van vastgelegde drempels
- Voor elke filtercombinatie in een testlijst toont de tekst een variant die bij de cijfers past
- Bij een onbekende of onvoldoende dekkende combinatie toont de site "geen duiding beschikbaar" en niet een verkeerde tekst
- Een geautomatiseerde test faalt als een combinatie uit de testlijst een tekst toont die de cijfers tegenspreekt

**E4-S4 Goedkeuring.** Als beheerder wil ik dat een lezing pas live gaat na mijn goedkeuring.
- Lezingen staan als tekstbestanden in de repo en veranderen alleen via een pull request
- Een checklist in de pull request vraagt om definitie, bron en beide invalshoeken

## Testen

- Elke combinatie in de testlijst (periode en fractiepaar uit een vooraf bepaalde reeks) toont een variant die bij de cijfers past
- Een combinatie buiten de testlijst toont "geen duiding beschikbaar"
- De geautomatiseerde test faalt als een tekstvariant niet bij de cijfers past
- Een pull request voor een lezing krijgt automatisch de checklist

## Aandachtspunten

- Dit is het component met het meeste inhoudelijke werk van Niels. De tekst schrijft Niels (eventueel met hulp), niet een model dat bij elke verversing opnieuw genereert
- Links/rechts en progressief/conservatief zijn twee verschillende assen. De lezingen hangen aan argumenten, niet aan partijen. Bij cohesie is de invalshoek besloten: samenwerking tegenover profilering (zie `../01-idee.md`). Voor de andere analyses is het paar nog open
- Definieer de drempels voor de tekstvarianten voordat er code komt
- Beide lezingen krijgen dezelfde opmaak en prominentie

Toegevoegd (24 oktober 2026): E2-S10, lezingen bij de coalitiebouwer, met een vaste tekst dat het terugkijken is en geen voorspelling of advies.

## Schatting

Middel, ca. 8 tot 14 uur van Niels (veel schrijven en beoordelen). Grove schatting, niet gemeten.
