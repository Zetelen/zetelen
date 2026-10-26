# Fundament voor een stemhulp op basis van echte stemmingen

Onderzoek door Claude op 26 oktober 2026, op verzoek van Niels. Status: alleen onderzoek, niets gebouwd. Werktitel hieronder "stemhulp"; de naam is een open vraag (zie punt 7).

## Het idee in één zin

Je geeft je mening over echte wetsvoorstellen en amendementen waarover de Kamer heeft gestemd, en ziet daarna welke fracties net zo stemden. Positief benaderd: "met wie vind je elkaar", niet "wie is je vijand". Dat sluit aan op de vraag waar Zetelen mee opent.

## 1. Wat er al bestaat

- **StemWijzer (ProDemos) en Kieskompas** werken met verkiezingsprogramma's en antwoorden van partijen op stellingen, niet met gedrag in de Kamer. [NOS over stemhulpen](https://nos.nl/l/2584717)
- **Stemmentracker (ProDemos) en Stemchecker (Volkskrant)** gaan wel uit van hoe fracties in de Kamer stemden. De bron die dat noemt, gaat over de verkiezingen van 2023. Niet gecontroleerd: of ze nog bestaan, hoe ze stellingen kiezen, en of ze ook buiten verkiezingstijd draaien. [Overzicht stemhulpen](https://www.duurzaamnieuws.nl/?p=23778)
- **Parlement.com** heeft alle stemmingen sinds 1995, te filteren op indiener en fractie, maar geen stemhulp.
- **Onderzoek** (Fossen, Anderson en Tiemeijer, 2012) noemt als zwakte van stemhulpen dat stellingen ambigu zijn, overlappen en te weinig onderscheiden tussen partijen, en stelt voor de selectie te vergelijken met het volledige stemgedrag. [Wijzer stemmen](https://dspace.library.uu.nl/bitstream/handle/1874/272681/Fossen%2520Anderson%2520Tiemeijer%25202012%2520Wijzer%2520stemmen%2520%28drukproeven%29.pdf?sequence=1)

**Wat Zetelen anders kan doen:** altijd beschikbaar (niet alleen voor verkiezingen), alleen wetsvoorstellen en amendementen (de echte beslissingen, geen verzoeken), bij elke stelling de echte stemming met een link naar de bron, en de selectie te controleren tegen al het stemgedrag dat de site al telt. Dat laatste is precies het punt uit het onderzoek, en wij hebben die gegevens al.

## 2. De gegevens: is er genoeg?

Al in de database (`api.stemming_dossier`): per stemming de stem van elke fractie, het soort stuk, het beleidsterrein en of de stemming verdeeld was. Verdeelde stemmingen (rijen per dossier, dus een stemming over twee dossiers telt twee keer):

| Kabinet | Amendementen | Regeringswetten | Initiatiefwetten | (Moties, ter vergelijking) |
|---|---|---|---|---|
| Schoof | 736 | 81 | 9 | 5.437 |
| Jetten (tot nu) | 413 | 47 | 2 | 3.193 |

Genoeg om uit te kiezen: een stemhulp heeft 20 tot 30 stellingen nodig. Wetten en amendementen zijn er veel minder dan moties, maar ruim voldoende. Een eindstemming over een wet is vaak minder verdeeld (veel brede steun); amendementen geven de scherpere keuzes.

**Wat nog niet in de database staat, en het meeste werk is:** de stelling zelf. De titel van een amendement ("Amendement van het lid X ter vervanging van nr. 12") zegt de bezoeker niets. Per stemming is nodig: één neutrale zin over wat het voorstel doet, plus de vraag ("Moet de inkomensgrens omhoog?"). Dat kan met de hand, of met de Claude API als concept met een controle op oordelen (zoals in het plan voor de videopipeline), maar altijd met een menselijke controle.

## 3. Welke fracties

De fracties van de huidige Kamerperiode (sinds de verkiezingen van 2025). Stemmingen van vóór die periode tellen alleen voor fracties die toen al bestonden; een fractie die is opgegaan in een nieuwe (GroenLinks en PvdA in PRO) heeft dan geen stem. Twee opties: alleen stemmingen uit de huidige periode (zuiver, maar minder keuze), of de voorganger laten meetellen met een vermelding (VOORGANGER in `web/lib/verhaal.ts` bestaat al). Advies: alleen de huidige periode, want "zo stemde PRO" over een stemming van GL-PvdA is een aanname.

## 4. De rekenregel

Zelfde definitie als de cohesie op de site, zodat het uit te leggen is:

- Per stelling kiest de bezoeker voor, tegen of geen mening (of overslaan).
- Overeenkomst met een fractie = het deel van de beantwoorde stellingen waarop die fractie dezelfde kant koos. "Niet deelgenomen" van een fractie telt niet mee (zoals bij de cohesie).
- Altijd met het aantal erbij ("12 van de 15"), en bij te weinig gemeenschappelijke stellingen geen percentage.
- Geen weging, of een eenvoudige ("dit vind ik belangrijk" telt dubbel); geen ingewikkelde afstandsmaten. Hoe eenvoudiger, hoe beter uit te leggen.
- Uitkomst: per fractie het percentage, gesorteerd, met bij elke stelling hoe de fracties stemden. Plus per beleidsterrein, omdat iemand bij wonen met de één en bij asiel met de ander kan meegaan. Dat past bij Onderwerpen.

## 5. Privacy: de belangrijkste randvoorwaarde

Politieke opvattingen zijn bijzondere persoonsgegevens (AVG, artikel 9). Daarom:

- Alles rekent in de browser; antwoorden gaan niet naar een server en worden nergens opgeslagen.
- Geen meting van antwoorden in de bezoekersstatistieken (Vercel Analytics telt alleen paginabezoeken, dat blijft zo).
- Delen van een uitslag alleen als de bezoeker dat zelf doet, en dan in het deel van de URL na `#` (dat gaat niet naar de server). Geen deelplaatje met iemands uitslag.
- Op /privacy een alinea erbij.

## 6. Onpartijdigheid: hier zit het grootste risico

De maker is lid van Volt; dat staat op /over. Een stemhulp is gevoeliger dan een telling, omdat de selectie van stellingen de uitkomst stuurt. Voorstel:

- **Vaste selectieregels, vooraf gepubliceerd** op de methodiekpagina, bijvoorbeeld: alleen verdeelde stemmingen; per beleidsterrein evenveel; elke fractie staat minstens een paar keer aan de winnende en aan de verliezende kant; geen twee stellingen over hetzelfde dossier.
- **De selectie controleren tegen al het stemgedrag:** de overeenkomst tussen fracties in de selectie moet ongeveer gelijk zijn aan de cohesie over alle stemmingen. Wijkt het veel af, dan stuurt de selectie. Dat kan de site zelf uitrekenen en tonen.
- **Teksten door twee mensen laten lezen** die politiek anders denken, voordat het live gaat. Dat kan in de feedbackrondes met bekenden.
- **Geen advies** ("stem op X"), alleen "zo stemden zij".

## 7. De naam

"StemWijzer" is de naam van de stemhulp van ProDemos (sinds 1989). Niet gecontroleerd of het een ingeschreven merk is; dat staat in het Benelux-merkenregister (boip.int). Advies: een eigen naam, die ook beter past bij de positieve benadering. Ideeën: "Waar vind jij ze?", "Stem mee", "Hoe zou jij stemmen?".

## 8. Wat er gebouwd moet worden (schatting)

1. **Selectie** (script plus jouw controle): kandidaten uit de database volgens de regels van punt 6, met de controle tegen de cohesie. 4 tot 6 uur.
2. **Stellingen schrijven:** 20 tot 30 neutrale zinnen. Met de hand 3 tot 5 uur voor jou; met een concept van de Claude API minder, plus controle.
3. **De pagina:** stellingen een voor een, daarna de uitkomst per fractie en per terrein, met bij elke stelling de echte stemming en de link naar de bron. Alles in de browser. 8 tot 12 uur.
4. **Methodiek en privacytekst.** 1 tot 2 uur.

Samen ongeveer 15 tot 20 uur werk aan mijn kant, plus het schrijven of controleren van de stellingen door jou.

## Vragen aan Niels

1. Alleen wetsvoorstellen en amendementen (zoals je eerder zei), of ook een paar moties als er op een terrein weinig wetten zijn?
2. Alleen stemmingen uit de huidige Kamerperiode (advies), of ook ouder met de voorganger?
3. Stellingen met de hand, of een concept met de Claude API en dan jouw controle?
4. Wie zijn de twee meelezers met een andere politieke kleur?
5. Een naam: een van de ideeën uit punt 7, of iets anders?
