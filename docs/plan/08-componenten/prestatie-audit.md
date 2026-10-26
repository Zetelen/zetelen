# Component: prestatie-audit

Status: tweede meting gedaan (26 oktober 2026): prestaties 90 tot 91 op Oppositiewerk, Kamerleden en de voorpagina; toegankelijkheid 96 opgelost (contrast van de gedimde tekstkaarten). Opnieuw meten voor de livegang
Eerst lezen: `_conventies.md`, `_overzicht.md`

## Doel

Een afsluitende controle van R1 op snelheid en toegankelijkheid, en het oplossen van wat de controle vindt.

## Laag

Frontend

## Interface

Biedt: een auditrapport in `docs/` met scores en een lijst verbeteringen die zijn doorgevoerd.

Verwacht: een volledig werkende R1-site.

## Afhankelijkheden

`cohesie-pagina`, `lezingen`, `site-shell`, `methodiek-betrouwbaarheid`.

## Stories

**E3-S8 Prestatie en toegankelijkheid.** Als bezoeker wil ik een snelle, toegankelijke site.
- Voorstel: de voorpagina en de matrixpagina scoren minstens 90 op prestatie en toegankelijkheid in een standaard audit
- Bedienbaar met toetsenbord, met zichtbare focus

## Testen

- Draai een standaard audit op de voorpagina en de matrixpagina, op mobiel en desktop, en leg de scores vast
- Bedien de hele site met alleen het toetsenbord
- Controleer de focus op alle interactieve elementen

## Aandachtspunten

- De drempel van 90 is een voorstel van Claude, niet door Niels besloten
- Controleer ook de matrix-tabelweergave voor schermlezers

## Eerste meting (24 oktober 2026)

Lighthouse 12 op https://zetelen.vercel.app (prestatie / toegankelijkheid / best practices / SEO):

| Pagina | Mobiel | Desktop |
|---|---|---|
| Voorpagina | 90 / 100 / 100 / 63 | 100 / 100 / 100 / 63 |
| Verkenner, zaal | 91 / 100 / 100 / 63 | 100 / 100 / 100 / 63 |
| Verkenner, tabel | 92 / 100 / 100 / 63 | 100 / 100 / 100 / 63 |

- SEO 63 komt alleen door "niet indexeren" (`LIVE = false`); bij de livegang opnieuw meten
- Zwakste punt mobiel: grootste zichtbare element na 3,6 seconden op de voorpagina (de kop in Newsreader)
- Toetsenbord: in de verkenner bereikt Tab eerst "naar de inhoud", dan de periodekeuze, varianten, weergaven en de fracties; Enter kiest een fractie, zet die in de URL en meldt de keuze aan schermlezers. Focusrand koper, 2 px
- Niet gedaan: een test met een echte schermlezer

## Schatting

Klein, ca. 2 tot 4 uur van Niels. Grove schatting, niet gemeten.
