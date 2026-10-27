# Uitkomst C1, C2 en C3 (27 oktober 2026)

Route 2, gekozen door Niels: Claude opende elke zaak op tweedekamer.nl en vergeleek de pagina met onze tabellen in [controles-stappenplan.md](controles-stappenplan.md). Niels controleert daarna een paar rijen zelf.

## Werkwijze

- Per zaak de detailpagina op tweedekamer.nl: `/kamerstukken/moties/detail?id=<zaak>&did=<document>` (amendementen: `/kamerstukken/amendementen/...`). Het documentnummer komt uit de open API; de zoekpagina van de Kamer gaf een time-out.
- Van de pagina gelezen: de uitslag ("Aangenomen met handopsteken" of "Verworpen met handopsteken"), het aantal stemmen voor, en de tabel "Detail stemming" met per fractie de zetels en voor of tegen.
- Vergeleken met onze waarden: de uitslag, zetels voor en tegen (opgeteld uit de tabel), de fracties aan de kant met de minste fracties (C1), de stem van VVD en CDA (C2).
- Wat dit wel en niet toont: de website en de API komen allebei uit het systeem van de Kamer. De vergelijking toont dat wij de bron goed overnemen en tellen, niet dat de bron zelf klopt. Een andere openbare registratie van stemmingen is er niet.
- De site van de Kamer had storingen ("upstream request timeout", foutcode 500). Zes pagina's zijn pas bij een tweede of derde poging opgehaald.

## C1. Uitslagen: 10 van 10 kloppen

| # | Zaak | Uitslag en zetels | Kant met de minste fracties |
|---|---|---|---|
| 1 | 2010Z00939 | klopt (aangenomen, 85 tegen 65) | klopt |
| 2 | 2013Z11750 | klopt (verworpen, 27 tegen 123) | klopt |
| 3 | 2014Z03255 | klopt (verworpen, 37 tegen 113) | klopt |
| 4 | 2014Z21517 | klopt (aangenomen, 119 tegen 31) | klopt |
| 5 | 2016Z23468 | klopt (verworpen, 36 tegen 113; 1 eenmansfractie niet deelgenomen) | klopt |
| 6 | 2018Z11433 | klopt (verworpen, 71 tegen 79) | klopt |
| 7 | 2020Z15847 | klopt (aangenomen, 98 tegen 52) | klopt |
| 8 | 2020Z18763 | klopt (verworpen, 51 tegen 98) | klopt |
| 9 | 2024Z13894 | klopt (verworpen, 26 tegen 124) | klopt |
| 10 | 2026Z09643 | klopt (aangenomen, 102 tegen 48) | klopt |

Let op bij het nalopen: de kolom "kleinste kant" in het stappenplan is de kant met de minste **fracties**, niet met de minste zetels. Bij rij 6 en 8 is dat de kant met de meeste zetels.

## C2. VVD en CDA onder Schoof: 10 van 10 kloppen

Bij alle tien rijen stemden VVD en CDA op tweedekamer.nl zoals in onze tabel: rij 1, 2, 3 en 8 verschillend (VVD tegen, CDA voor), rij 4, 5 en 7 allebei tegen, rij 6, 9 en 10 allebei voor.

## C3. Zetelwerk: 18 van 19 te controleren, alle 18 kloppen

Uitslag en zetels kloppen bij rij 1, 2 en 4 tot en met 19.

**Rij 3 (amendement 2011Z14134) is op de website niet te controleren.** De pagina toont alleen de stemming over een voorstel om het amendement ontoelaatbaar te verklaren (verworpen, 28 tegen 122), niet de stemming over het amendement zelf. In de API staan beide besluiten op 28 juni 2011: "Aangenomen", 76 tegen 74, en de ontoelaatbaarheid. Wij tonen 76 tegen 74, aangenomen; dat is het juiste besluit.

**Wat niet is gecontroleerd: de fractie van de indiener.** De pagina noemt de eerste ondertekenaar met naam, zonder fractie. De fractie op de dag van indiening staat alleen in de API.

## Een bevinding om op te lossen

Rij 3 laat een zwakke plek zien. Zetelwerk neemt de laatste stemming over een stuk. Staan er twee besluiten op dezelfde dag, zoals hier een procedurele stemming en de stemming over het amendement zelf, dan kiest de query op volgorde van het interne nummer van het besluit. Hier ging dat goed, maar dat is toeval. Voorstel: bij gelijke datum het besluit over het stuk zelf voorrang geven boven een procedureel besluit (ontoelaatbaar verklaren, uitstel en dergelijke). Dit wacht op akkoord van Niels.

## Steekproef

Niels opende C1 rij 6, C2 rij 8 en C3 rij 16 en vond geen afwijking. Omdat dat dezelfde bron is, volgde de tweede controle hieronder.

## Tweede controle: tegen de Handelingen, door een aparte agent (27 oktober 2026)

Op voorstel van Niels heeft een aparte agent, zonder de uitkomsten hierboven te kennen, 12 beweringen getoetst aan de Handelingen (het verslag van de vergadering op officielebekendmakingen.nl). Dat is een andere bron dan de website en de API van de Kamer. Gekozen: C1 rij 1 tot en met 10, C3 rij 3 en C2 rij 8.

**Uitkomst: 12 van 12 kloppen in uitslag en fracties per kant.** Ook het amendement uit C3 rij 3 (2011Z14134): aangenomen, en dezelfde dag eerst de verworpen stemming over ontoelaatbaarheid. De koppeling van een gewijzigde motie aan het zaaknummer klopte in alle gevallen.

Een kanttekening, bij C1 rij 8 (amendement 2020Z18763): de voorzitter noemt de voorstemmers en "de leden van de overige fracties ertegen". Letterlijk hoort daar een eenmansfractie bij die volgens de bron niet deelnam. Wij tellen die fractie niet als tegen (51 tegen 98, samen 149), net als de website van de Kamer. De uitslag verandert er niet door. In de tabel van het stappenplan stond bij rij 5 wel "1 fractie niet deelgenomen" en bij rij 8 niet; dat was onvolledig in de tabel, niet in de data.

Wat de agent verder opmerkte, en wat ermee is gedaan:
- Zetels bij handopsteken tellen de hele fractie, ook als niet alle leden er zijn. Zo telt de Kamer zelf ook; dit staat nu op /methodiek.
- Zetelaantallen rond afsplitsingen hangen af van de exacte datum; de agent kon die niet in een officiële bron nakijken. De uitslag en de fracties per kant kloppen wel.

**C1 tot en met C3 zijn hiermee af.**
