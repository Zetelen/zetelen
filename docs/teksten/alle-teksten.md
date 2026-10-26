# Alle vaste teksten op de site

Automatisch verzameld op 25 oktober 2026 uit de broncode (`web/app`, `web/components`, `web/lib/maten.ts` en de verhaalteksten). Per bestand de teksten met regelnummer. `${...}` is een plek waar een getal of naam uit de data komt. Herschrijf direct in dit bestand (zet je versie onder de oude, of streep door); ik verwerk het daarna in de code.

Door de code gegenereerde zinnen (bijvoorbeeld "D66 stemt het vaakst hetzelfde als ...") staan hier als sjabloon.

## /coalitie

`app/coalitie/page.tsx`

- r29 (zin): ${groep.split(",").join(", ")}: bij wie haalde deze groep een meerderheid in de Tweede Kamer?
- r30 (zin): Stel zelf een groep fracties samen. Bij welke andere fracties haalde die groep eerder een meerderheid?
- r46 (tekst): Coalitiebouwer · concept
- r47 (tekst): Bij wie haal je een meerderheid?
- r49 (tekst): Nu zetel jij. Kies fracties in de lijst of in de zaal en stel een kabinet samen, fictief of niet. Je ziet hoeveel zetels het heeft, en bij welke andere fracties die groep in de gekozen periode een meerderheid haalde.
- r65 (titel): Zo lees je dit
- r67 (tekst): Eensgezind: alle fracties in je groep stemden hetzelfde, allemaal voor of allemaal tegen. Meegestemd: een andere fractie koos dezelfde kant. Beslissend: de groep had een meerderheid, en zonder die fractie niet meer. De zetels tellen zoals ze waren op het moment van de stemming. Standaard tellen alleen verdeelde stemmingen mee: er stemden fracties voor en tegen.
- r70 (tekst): Benieuwd hoe we tellen?
- r74 (tekst): Terugkijken, geen voorspelling
- r76 (tekst): Hier tel je hoe er echt is gestemd. Het zegt niets over hoe fracties straks zullen stemmen. En het is geen advies over welke samenwerking goed of wenselijk is.
- r81 (label): Geen stemmingen
- r81 (titel): In deze periode zijn geen stemmingen
- r81 (uitleg): Kies een andere periode en tel opnieuw.
- r87 (toelichting): ${periode.naam} · eigen berekening, zie de methodiek

## /coalitie/plaatje/route.tsx

`app/coalitie/plaatje/route.tsx`

- r26 (zin): ${76 - zetels} zetels tekort voor een meerderheid
- r31 (tekst): ZETELEN · COALITIEBOUWER
- r47 (tekst): Te weinig eensgezinde stemmingen om iets te zeggen
- r49 (zin): ${periode ? (soort === "kabinet" ? `Kabinet-${periode.naam}` : periode.naam) : ""} · ${alleenVerdeeld ? "verdeelde stemmingen" : "alle stemmingen"} · Terugkijken, geen voorspelling · Bron: Tweede Kamer open data · Stand: ${ververst ? datumTekst(ververst) : "onbekend"}

## /error.tsx

`app/error.tsx`

- r9 (titel): De cijfers laden nu niet
- r10 (uitleg): De gegevens zijn waarschijnlijk even niet bereikbaar. Probeer het over een paar minuten nog eens.
- r13 (tekst): Nog een keer

## /fracties/[fractie]/opengraph-image.tsx

`app/fracties/[fractie]/opengraph-image.tsx`

- r29 (tekst): Te weinig stemmingen om iets te zeggen
- r44 (zin): Kabinet-${periode?.naam ?? "?"} · alle stemmingen · Bron: Tweede Kamer open data, eigen berekening · Stand: ${ververst ? datumTekst(ververst) : "onbekend"}

## /fracties/[fractie]

`app/fracties/[fractie]/page.tsx`

- r26 (title): Fractie niet gevonden
- r64 (tekst): zetels aan het eind van
- r64 (tekst): stemmingen in deze periode
- r92 (label): Geen stemmingen
- r92 (titel): ${f.afkorting} stemde niet mee in deze ${soort === "kabinet" ? "kabinetsperiode" : "Kamerperiode"}
- r93 (uitleg): Deze fractie bestond toen niet, of deed niet mee aan de stemmingen. Kies een andere periode.
- r96 (tekst): Met wie stemt
- r96 (tekst): het vaakst hetzelfde? ·
- r113 (toelichting): ${periode.naam} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}
- r117 (tekst): Bekijk in de verkenner
- r120 (tekst): per onderwerp
- r123 (tekst): Bij wie haalt
- r123 (tekst): een meerderheid?

## /fracties

`app/fracties/page.tsx`

- r15 (description): Alle fracties in de Tweede Kamer sinds 2010. Hoeveel zetels, kabinet of oppositie, en met wie stemden ze het vaakst hetzelfde?
- r32 (label): Niet bereikbaar
- r32 (titel): De fracties laden nu niet
- r32 (uitleg): Probeer het over een paar minuten nog eens.
- r47 (tekst): Wie zit er in de Kamer?
- r49 (tekst): De fracties bij het begin van de gekozen periode, de grootste bovenaan. Het lichte stuk van een balk: Kamerleden die tijdens de periode overstapten naar een andere fractie. Kies een fractie en zie met wie ze het vaakst hetzelfde stemde.
- r55 (tekst): begon met
- r55 (tekst): van de 150 zetels
- r55 (tekst): . Deze samenstelling kijken we nog na.
- r61 (aria-label): Fracties bij het begin van ${periode.naam}, op volgorde van zetels
- r92 (tekst): Nieuw in de Kamer tijdens
- r106 (tekst): Alle fracties sinds 2010

## /methodiek

`app/methodiek/page.tsx`

- r12 (description): Hoe telt Zetelen? Wat cohesie is, de formule, de bron en wat de cijfers niet zeggen.
- r22 (tekst): Hoe tellen we?
- r24 (tekst): Hieronder staat elke maat van de site: wat hij meet, de formule in woorden, de keuzes die we maakten en wat hij niet zegt. Wil je zelf narekenen? De code en de SQL staan op
- r34 (tekst): Formule:
- r48 (tekst): De data
- r50 (tekst): Alle cijfers komen uit de
- r50 (tekst): open data van de Tweede Kamer
- r50 (tekst): . Iedereen mag die vrij gebruiken, onder de publiek-domeinverklaring CC0. De Tweede Kamer is niet betrokken bij deze site en heeft de analyses niet goedgekeurd. Ze garandeert ook niet dat de brondata foutloos is.
- r55 (tekst): Elke nacht haalt een script de wijzigingen op en rekent alles opnieuw uit. We tellen de stemmingen vanaf 2010. Verwijderde records en stemmingen zonder vergaderdatum tellen niet mee.
- r64 (tekst): Na elke verversing controleert het script onder meer of geen stemming meer dan 150 zetels telt, en of de uitslag volgens de stemmen past bij de officiële uitslag. Bij een handvol van de ruim 60.000 besluiten past die niet. In minstens één geval meldt de Tweede Kamer zelf dat de officiële conclusie een vergissing was. Cohesie gebruikt de stemmen per fractie, niet de conclusie, en heeft daar dus geen last van.
- r70 (tekst): Fout gezien? Mail
- r70 (tekst): of meld het op
- r71 (tekst): . Correcties staan in het

## /not-found.tsx

`app/not-found.tsx`

- r7 (label): Niet gevonden
- r7 (titel): Deze pagina bestaat niet
- r7 (uitleg): Hier is nooit gezeteld. Misschien is het adres veranderd, of zit er een tikfout in.
- r9 (tekst): Terug naar de voorpagina

## /onderwerpen

`app/onderwerpen/page.tsx`

- r29 (description): Waar zijn fracties in de Tweede Kamer het over eens? Kijk per beleidsterrein, per kabinet of Kamerperiode.
- r68 (tekst): Onderwerpen · concept
- r69 (tekst): Waar zijn ze het over eens?
- r71 (tekst): Kies een fractie en zie per beleidsterrein hoe vaak andere fracties dezelfde kant kozen. Kies er een tweede bij en vergelijk het paar per onderwerp. Kies daarna een terrein, en je ziet de dossiers en stemmingen erachter.
- r74 (titel): Zo lees je dit
- r76 (tekst): Elke stemming hoort bij een Kamerstukdossier, en elk dossier bij een beleidsterrein. Dat gaat via een trefwoord in de titel (asiel, wonen, digitaal), en anders via de vaste commissie die het dossier het vaakst behandelt. Hoort een stemming bij meer dossiers, dan telt ze bij elk terrein mee. Lichter betekent vaker hetzelfde gestemd. Gestreept: minder dan 25 stemmingen samen, dus geen oordeel.
- r79 (tekst): Benieuwd hoe we indelen?
- r97 (label): Niet bereikbaar
- r97 (titel): De onderwerpen laden nu niet
- r97 (uitleg): Probeer het over een paar minuten nog eens.
- r103 (tekst): Het vaakst eens bij
- r103 (tekst): ), het minst bij
- r104 (zin): Over alle stemmingen samen: ${procent(totaal)} (de witte lijn).
- r107 (tekst): Tik op een terrein en zie waar
- r107 (tekst): verschillend stemden.
- r108 (label): Hoe vaak ${gekozen.afkorting} en ${met.afkorting} hetzelfde stemden, per beleidsterrein
- r110 (tekst): Terug naar alle fracties
- r114 (tekst): De dossiers laden nu niet. Probeer het over een paar minuten nog eens.
- r123 (tekst): · hier verschilden
- r127 (titel): ${anders.length} stemmingen waarop ze allebei stemden en verschilden${!toonAlle && anders.length > 15 ? " · de 15 nieuwste" : ""}
- r129 (tekst): Toon alle
- r133 (tekst): Als ze allebei stemden, stemden ze in dit terrein steeds hetzelfde.
- r138 (tekst): · per dossier, van minst naar meest eens
- r139 (tekst): Geteld: de stemmingen waarop
- r139 (tekst): allebei voor of tegen stemden. Per dossier zijn dat er te weinig voor een percentage, dus staat er een telling.
- r147 (titel): ${dossier.titel} · ${dossier.eens} van de ${dossier.samen} keer eens
- r155 (tekst): en elke andere fractie, per beleidsterrein ·
- r158 (tekst): Hoe vaak
- r158 (tekst): hetzelfde stemde als elke andere fractie, per beleidsterrein, in procenten
- r177 (tekst): te weinig stemmingen
- r193 (tekst): Het getal achter een terrein is het aantal stemmingen in deze periode. Kies een cel en vergelijk
- r193 (tekst): en die fractie per terrein. Gestreept: minder dan 25 stemmingen samen.
- r201 (tekst): Achter het cijfer · één stemming uit elkaar gehaald
- r202 (tekst): Het asielplan van Wilders
- r204 (tekst): Elk percentage hierboven is opgeteld uit stemmingen zoals deze. Een hoofdelijke stemming laat zien wat bij handopsteken verborgen blijft: hoe elk Kamerlid stemde.
- r207 (label): De stemming over de motie-Eerdmans
- r208 (tekst): Stemming over zaak
- r208 (tekst): , hoofdelijk,
- r208 (tekst): . Kleuren zijn een eigen palet, geen partijkleuren.
- r211 (toelichting): Beleidsterrein via het Kamerstukdossier: een trefwoord in de titel, anders de vaste commissie die het dossier het vaakst behandelt. Een stemming bij meer dossiers telt bij elk terrein mee. ${variant === "alle" ? "Alle stemmingen" : "Alleen verdeelde stemmingen"}.

## /ontwerpsysteem

`app/ontwerpsysteem/page.tsx`

- r7 (title): Ontwerpsysteem · Zetelen

## /ontwerpsysteem/Voorbeelden.tsx

`app/ontwerpsysteem/Voorbeelden.tsx`

- r23 (tekst): Ontwerpsysteem, versie 0.1
- r25 (tekst): Nacht met
- r27 (tekst): Een diepe, koele ondergrond met warm licht op wat de bezoeker kiest. Eigen palet, geen partijkleuren, geen logo&apos;s. Alle cijfers op deze pagina zijn voorbeelddata.
- r31 (tekst): Kleur en contrast
- r32 (tekst): Contrast per combinatie van voorgrond en achtergrond. WCAG AA vraagt 4,5 voor tekst.
- r44 (tekst): Hero-kop · Newsreader 400
- r45 (tekst): Wie stemt met wie in de Kamer?
- r48 (tekst): Sectiekop · Newsreader 400
- r49 (tekst): Wat een percentage wel en niet zegt
- r52 (tekst): Uitgelicht cijfer · tabulaire cijfers
- r56 (tekst): Lopende tekst · Hanken Grotesk 17 px
- r57 (tekst): Hoe vaak stemden twee fracties hetzelfde? Een hoog percentage betekent niet dat ze het inhoudelijk eens zijn.
- r60 (tekst): Datalabel en bron · DM Mono
- r61 (tekst): Bron: Tweede Kamer open data · Laatst ververst: 24 oktober 2026
- r90 (tekst): Alle stemmingen
- r91 (tekst): Alleen verdeelde stemmingen
- r96 (titel): Eens met D66
- r96 (toelichting): Geteld over 2.104 stemmingen samen
- r97 (toelichting): Voorbeeld van een grafiekkader met bron
- r110 (tekst): Voorbeeldtekst voor de eerste lezing.
- r111 (tekst): Voorbeeldtekst voor de tweede lezing.

## /opengraph-image.tsx

`app/opengraph-image.tsx`

- r25 (tekst): Wie stemt met wie in de Kamer?
- r26 (tekst): Geteld uit de open data van de Tweede Kamer

## /over

`app/over/page.tsx`

- r10 (description): Wie maakt Zetelen, met welke data, en hoe meld je een fout?
- r19 (tekst): Wie maakt Zetelen?
- r21 (tekst): Zetelen is een onafhankelijk project van
- r21 (tekst): . Er zit geen organisatie of partij achter, alleen nieuwsgierigheid. Het doel: met openbare data laten zien hoe er in de Tweede Kamer wordt gestemd. En laten zien dat je een cijfer op meer dan één manier kunt lezen.
- r28 (tekst): Waar komen de cijfers vandaan?
- r30 (tekst): Uit de open data van de Tweede Kamer. Een script haalt die elke dag op, rekent alles uit en controleert de uitkomst, onder meer tegen de officiële uitslagen. De broncode en de berekeningen zijn openbaar.
- r34 (tekst): Bekijk de broncode op GitHub
- r39 (tekst): Klopt er iets niet?
- r41 (tekst): Zie je een cijfer dat niet klopt? Mail
- r41 (tekst): of meld het op
- r42 (tekst): . Zet erbij op welke pagina het was en wat je verwachtte. Elke correctie komt in het

## /

`app/page.tsx`

- r16 (tekst): Kies een fractie en zie hoe vaak elke andere fractie met haar meestemde, per kabinet of Kamerperiode.
- r16 (zin): Kies een fractie en zie hoe vaak elke andere fractie met haar meestemde, per kabinet of Kamerperiode.
- r17 (tekst): Waar zijn fracties het over eens? Cohesie per beleidsterrein, voor elk paar fracties.
- r17 (zin): Waar zijn fracties het over eens? Cohesie per beleidsterrein, voor elk paar fracties.
- r18 (tekst): Stel zelf een groep fracties samen en zie bij wie die een meerderheid haalde.
- r18 (zin): Stel zelf een groep fracties samen en zie bij wie die een meerderheid haalde.
- r19 (tekst): Alle fracties sinds 2010: zetels, kabinet of oppositie, en wie er overstapte.
- r19 (zin): Alle fracties sinds 2010: zetels, kabinet of oppositie, en wie er overstapte.
- r20 (tekst): Hoe de cijfers tot stand komen, wat ze wel en niet zeggen, en wat er veranderde.
- r20 (zin): Hoe de cijfers tot stand komen, wat ze wel en niet zeggen, en wat er veranderde.
- r33 (tekst): zetelen (ww.) · stemmen, onderhandelen en meetellen in de Tweede Kamer
- r34 (tekst): Wie stemt met wie in de Kamer?
- r36 (tekst): In de Kamer wordt veel gepraat. Uiteindelijk telt wie zijn hand opsteekt. Zetelen telt mee, bij elke stemming sinds 2010. Scroll door vier jaar Kamer, of ga meteen zelf op zoek.
- r39 (aria-label): Direct naar
- r46 (tekst): Meteen zelf kijken
- r51 (label): De zaal van de Tweede Kamer
- r53 (tekst): Het verhaal kon niet worden geladen. Probeer het over een paar minuten opnieuw, of ga direct naar de verkenner.
- r58 (tekst): 3 · Waar zijn ze het over eens?
- r59 (tekst): Samen in het kabinet. Overal eens?
- r61 (tekst): zijn de grootste partijen van kabinet-
- r62 (zin): en stemmen in ${procent(partners.totaal)} van de stemmingen hetzelfde
- r62 (tekst): . Per onderwerp verschilt dat: het vaakst eens bij
- r63 (tekst): ), het minst bij
- r65 (label): Cohesie van ${partners.a.afkorting} en ${partners.b.afkorting} per beleidsterrein
- r68 (tekst): Vergelijk zelf twee fracties per onderwerp
- r74 (tekst): 4 · Kun jij een meerderheid vinden?
- r75 (tekst): Kun jij er 76 vinden?
- r78 (zin): Kabinet-${kabinet.naam} heeft ${kabinet.zetels} zetels en heeft er 76 nodig voor een meerderheid.
- r80 (tekst): Stel zelf een groep fracties samen en zie bij welke andere fracties die groep in het verleden een meerderheid haalde. De coalitiebouwer is nog een concept: de rekenwijze wordt nog nagekeken.
- r83 (tekst): Naar de coalitiebouwer
- r87 (tekst): Maar hoe werd er nou echt gezeteld? Kijk zelf
- r97 (tekst): Wie maakt dit, met welke data, en hoe meld je een fout?
- r97 (tekst): Over Zetelen
- r101 (toelichting): Zetels bij het begin van elk kabinet en elke Kamerperiode, gemeten 30 dagen na de start. Kleuren van fracties zijn een eigen palet, geen partijkleuren.

## /privacy

`app/privacy/page.tsx`

- r15 (tekst): Privacy · concept
- r16 (tekst): Welke gegevens verwerkt Zetelen?
- r18 (tekst): Zetelen heeft geen accounts, bewaart geen opvattingen van bezoekers en plaatst geen cookies. Wat je kiest in de verkenner of de coalitiebouwer, staat alleen in de link in je browser.
- r23 (tekst): Waar draait de site?
- r25 (tekst): Bij Vercel. Zoals elke webserver verwerkt Vercel technische gegevens, zoals je IP-adres. Dat is nodig om de pagina te leveren en misbruik te voorkomen. Zetelen gebruikt die gegevens niet.
- r31 (tekst): Nog niet gekozen. We vullen deze tekst aan voordat we statistieken bijhouden.
- r36 (tekst): In de testperiode staat er een link naar een vragenlijst bij een externe dienst. Wat je daar invult, verwerkt die dienst. Zetelen gebruikt de antwoorden alleen om de site te verbeteren en vraagt niet om je naam. Invullen is vrijwillig.
- r44 (tekst): Van Kamerleden gebruikt Zetelen alleen naam, fractie en stemgedrag uit de open data van de Tweede Kamer. Geen geboortedatum, woonplaats of andere persoonsgegevens. Vragen of een verzoek? Mail

## /verkenner

`app/verkenner/page.tsx`

- r20 (description): Hoe vaak stemmen twee fracties in de Tweede Kamer hetzelfde? Kies een fractie en een periode.
- r39 (tekst): Met wie stemt een fractie het vaakst hetzelfde?
- r52 (titel): Zo lees je dit
- r54 (tekst): Kies een fractie in de lijst en kijk wie er meekleurt. Lichte stoelen stemden vaak hetzelfde, donkere zelden. Gestreept: te weinig stemmingen samen, dus geen oordeel.
- r58 (tekst): Een klein deel van de stemmingen is unaniem: iedereen voor of iedereen tegen. Wil je die niet meetellen? Kies dan &quot;alleen verdeelde stemmingen&quot;.
- r62 (tekst): Zaal, boog of tabel: dezelfde cijfers, drie manieren van kijken. De tabel is het preciest.
- r63 (tekst): Benieuwd hoe we tellen?
- r69 (label): Niet bereikbaar
- r69 (titel): De cijfers konden niet worden geladen
- r70 (uitleg): De gegevens zijn nu waarschijnlijk niet bereikbaar. Probeer het over een paar minuten opnieuw.
- r72 (label): Geen stemmingen
- r72 (titel): Hier is niet gezeteld
- r73 (uitleg): In ${soortTekst} zijn geen stemmingen om te vergelijken. Kies een ander ${soort === "kabinet" ? "kabinet" : "Kamerperiode"}.
- r74 (tekst): Naar het nieuwste kabinet
- r81 (toelichting): ${periode.naam} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}

## /wijzigingen

`app/wijzigingen/page.tsx`

- r7 (description): Alle inhoudelijke correcties op Zetelen, met datum.
- r14 (tekst): Wat is er gecorrigeerd?
- r16 (tekst): Hier staat elke inhoudelijke correctie van een cijfer of tekst, met datum. De dagelijkse verversing van de data staat er niet in: dat is geen correctie.
- r21 (tekst): Er zijn nog geen correcties. We blijven natellen.

## components/coalitie/CoalitieBouwer.tsx

`components/coalitie/CoalitieBouwer.tsx`

- r43 (zin): De stemmingen laden nu niet. Probeer het over een paar minuten nog eens.
- r79 (zin): De groep stemde ${uitkomst.eensgezind} keer eensgezind en had ${uitkomst.meerderheid} keer een meerderheid.
- r91 (tekst): Stemmingen laden…
- r94 (tekst): Bij wie haalde deze groep een meerderheid? ·
- r97 (tekst): Deze groep stemde in deze periode maar
- r97 (tekst): keer eensgezind. Dat zijn te weinig stemmingen om iets te zeggen: de grens ligt op
- r103 (tekst): De groep stemde
- r103 (tekst): keer eensgezind. Daarvan won haar kant
- r104 (tekst): keer (
- r104 (tekst): ). Op eigen kracht lukte dat
- r107 (aria-label): Partners, eerst op beslissend en dan op meegestemd
- r114 (tekst): keer beslissend
- r122 (tekst): Meegestemd: hoe vaak de fractie dezelfde kant koos als de groep. Beslissend: de groep had een meerderheid, en zonder deze fractie niet meer. De zetels tellen zoals ze waren op het moment van de stemming. Kies een partner en zie op welke stemmingen die beslissend was.
- r133 (tekst): per onderwerp →
- r153 (aria-label): Stel een groep fracties samen
- r164 (aria-label): ${f.naam}, ${f.zetels} zetels, ${inGroep ? "in de groep" : "niet in de groep"}
- r170 (tekst): in de groep
- r177 (tekst): + toevoegen
- r194 (aria-label): Zaal; gekozen groep: ${zetelsGroep} zetels
- r251 (aria-label): Stemmingen waarop ${partner.afkorting} beslissend was
- r252 (tekst): keer beslissend
- r253 (tekst): Deze stemmingen staan hier nog niet. Ze komen mee met de volgende verversing.
- r254 (tekst): De stemmingen laden nu niet. Probeer het later nog eens.
- r254 (tekst): Stemmingen laden…
- r255 (tekst): was op geen enkele stemming beslissend.
- r267 (tekst): op tweedekamer.nl ↗

## components/cohesie/Bronregel.tsx

`components/cohesie/Bronregel.tsx`

- r10 (tekst): Bron:
- r10 (tekst): Tweede Kamer open data
- r10 (tekst): , eigen berekening ·
- r10 (tekst): · Laatst ververst:

## components/cohesie/PeriodeKeuze.tsx

`components/cohesie/PeriodeKeuze.tsx`

- r67 (tekst): Een kabinet loopt tot het volgende is beëdigd. De demissionaire tijd telt dus mee.

## components/cohesie/Verkenner.tsx

`components/cohesie/Verkenner.tsx`

- r64 (tekst): Gekozen fractie:
- r65 (zin): Stemde hetzelfde als ${uitlees.naam}: ${uitleesPaar.teWeinig ? "te weinig stemmingen" : procent(uitleesPaar.cohesie, 1)}.
- r85 (tekst): Niet in de zaal, wel in deze periode:
- r85 (tekst): . Deze fracties stopten halverwege
- r86 (tekst): . In de tabel staan ze wel.
- r104 (tekst): per onderwerp →
- r105 (tekst): Bij wie haalt
- r105 (tekst): een meerderheid? →
- r154 (aria-label): Kies een fractie
- r158 (tekst): Eens met
- r167 (aria-label): ${f.naam}, ${f.zetels} zetels, stemde hetzelfde: ${waarde}
- r200 (aria-label): Zaal met ${fracties.length} fracties; gekozen: ${gekozen.naam}
- r255 (aria-label): Boog met ${n} fracties; gekozen: ${gekozen.naam}
- r296 (aria-label): Hoe vaak elke twee fracties hetzelfde stemden, in procenten
- r317 (aria-label): zelfde fractie
- r331 (tekst): Kies een kolomkop en de rijen sorteren zich. Kies een fractie in de eerste kolom en ze licht op.

## components/FeedbackBalk.tsx

`components/FeedbackBalk.tsx`

- r10 (tekst): Zetelen is nog een testversie. Wat vind je ervan?
- r11 (tekst): Zeg het in 3 minuten ↗

## components/Kader.tsx

`components/Kader.tsx`

- r25 (tekst): Een onafhankelijk project van
- r25 (tekst): . Geen organisatie, geen partij.
- r31 (tekst): Tweede Kamer open data
- r31 (tekst): , eigen berekening
- r33 (tekst): Laatst ververst:
- r38 (tekst): Fout gezien? Mail
- r38 (tekst): of meld het op
- r42 (tekst): Broncode en methode
- r46 (tekst): Geef feedback ↗
- r85 (tekst): Er ging iets mis

## components/MobielPaneel.tsx

`components/MobielPaneel.tsx`

- r22 (aria-label): Keuze wijzigen

## components/Navigatie.tsx

`components/Navigatie.tsx`

- r23 (tekst): Naar de inhoud

## components/Onderdelen.tsx

`components/Onderdelen.tsx`

- r116 (tekst): Bron:
- r148 (tekst): Te weinig stemmingen: minder dan 25 samen, dus geen oordeel
- r159 (tekst): Te weinig stemmingen

## components/onderwerpen/FractieKeuze.tsx

`components/onderwerpen/FractieKeuze.tsx`

- r27 (tekst): Vergelijk met
- r29 (tekst): alle fracties

## components/onderwerpen/MobieleBalk.tsx

`components/onderwerpen/MobieleBalk.tsx`

- r41 (aria-label): Keuze wijzigen

## components/onderwerpen/TerreinBalken.tsx

`components/onderwerpen/TerreinBalken.tsx`

- r21 (tekst): stemmingen samen

## components/onderwerpen/TerreinLijst.tsx

`components/onderwerpen/TerreinLijst.tsx`

- r32 (zin): vaakst eens met ${hoog.f.afkorting} ${procent(hoog.c)}, minst vaak met ${laag.f.afkorting} ${procent(laag.c)}

## components/onderwerpen/Verdieping.tsx

`components/onderwerpen/Verdieping.tsx`

- r13 (tekst): Hier stemden
- r13 (tekst): nooit allebei.
- r15 (aria-label): Dossiers, van minst naar meest eens tussen ${a} en ${b}
- r25 (tekst): van de
- r25 (tekst): keer eens
- r43 (aria-label): Stemmingen in ${titel}
- r57 (tekst): Hoort ook bij:
- r57 (tekst): . Telt in elk dossier mee.
- r58 (tekst): op tweedekamer.nl ↗

## components/verhaal/ScrollVerhaal.tsx

`components/verhaal/ScrollVerhaal.tsx`

- r66 (aria-label): ${label}: ${stap.datum}. ${stap.tekst}

## lib/maten.ts

`lib/maten.ts`

- r9 (zin): Cohesie: hoe vaak stemmen twee fracties hetzelfde?
- r11 (definitie): Cohesie is het percentage van de gezamenlijke stemmingen van twee fracties waarop ze hetzelfde stemden. Een gezamenlijke stemming is een besluit waarover beide fracties voor of tegen stemden. Nam een van de twee niet deel of was ze afwezig, dan telt de stemming niet mee. Bij een hoofdelijke stemming is de stem van de fractie wat de meerderheid van haar leden stemde.
- r13 (formule): het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen, maal 100. Bij minder dan 25 gezamenlijke stemmingen geen percentage, maar "te weinig stemmingen".
- r15 (zin): We tellen per kabinet en per Kamerperiode. Een kabinet loopt tot het volgende is beëdigd: de demissionaire tijd telt mee bij het kabinet waar die uit voortkomt.
- r16 (zin): Er zijn twee varianten: alle stemmingen, en alleen de stemmingen waarover de Kamer verdeeld was (minstens één fractie voor en één tegen). Per kabinet is 7 tot 17 procent van de stemmingen unaniem. De tweede variant laat die weg.
- r17 (zin): Meldt een fractie zelf dat een stem een vergissing was, dan telt die stem niet mee. De bron zegt namelijk niet wat de fractie wel bedoelde.
- r18 (zin): Is het bij een hoofdelijke stemming binnen de fractie gelijk op, dan is er geen fractiestem.
- r19 (zin): Hamerstukken en besluiten zonder stemming tellen niet mee.
- r22 (zin): Cohesie telt stemmen, geen redenen. Twee fracties kunnen om heel verschillende redenen hetzelfde stemmen.
- r23 (zin): Elk besluit telt even zwaar, of het nu gaat om een wet of om een procedurele motie.
- r24 (zin): De volgorde van de fracties in de zaal komt uit de cijfers: fracties die vaak hetzelfde stemmen, zitten naast elkaar. Het is niet de echte zaalindeling en ook geen links-rechtsschaal.
- r29 (zin): Cohesie per beleidsterrein: waar zijn ze het over eens?
- r31 (definitie): Dezelfde cohesie als hierboven, maar dan per beleidsterrein. Elke stemming hoort via haar zaak bij een of meer Kamerstukdossiers, en elk dossier bij een van zeventien beleidsterreinen, zoals Zorg, Asiel en migratie of Digitalisering.
- r33 (formule): per terrein: het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen in dat terrein, maal 100. Onder 25 gezamenlijke stemmingen: "te weinig stemmingen". Per dossier en per stemming tellen we ("3 van de 5 keer eens"), zonder percentages.
- r35 (zin): Het terrein van een dossier volgt eerst uit een trefwoord in de titel (bijvoorbeeld asiel, vreemdeling, huur, woning, cyber, kunstmatige intelligentie). Is er geen trefwoord, dan telt de vaste commissie die het vaakst voortouw had over de zaken in dat dossier. Zo vallen onderwerpen die van commissie wisselden, zoals asiel tot 2024, toch onder hun eigen terrein.
- r36 (zin): Een stemming die bij meer dossiers hoort, telt bij elk terrein mee.
- r37 (zin): Commissies krijgen per kabinet een andere naam. Een vaste koppeltabel zet elke commissie om in een terrein.
- r38 (zin): In de koppen \"het vaakst eens bij\" en \"het minst bij\" tellen alleen terreinen met minstens 50 gezamenlijke stemmingen. Zo haalt een klein terrein niet de kop.
- r41 (zin): De indeling is een eigen keuze. Een dossier kan over meer onderwerpen gaan dan zijn titel of commissie laat zien.
- r42 (zin): Ongeveer 1 procent van de stemmingen valt onder Overig: dossiers zonder vaste commissie en zonder trefwoord.
- r43 (zin): Een trefwoord kan een enkel dossier verkeerd indelen. De lijst staat in de broncode en wordt nagekeken.
- r50 (definitie): Voor een groep fracties die je zelf kiest, telt de coalitiebouwer de stemmingen waarop de groep eensgezind was: alle fracties in de groep stemden hetzelfde, allemaal voor of allemaal tegen. Van die stemmingen telt hij hoe vaak de kant van de groep won. En per andere fractie hoe vaak die meestemde en hoe vaak die beslissend was.
- r52 (formule): meegestemd: het aantal eensgezinde stemmingen waarop de fractie dezelfde kant koos als de groep, gedeeld door het aantal eensgezinde stemmingen, maal 100. Beslissend: het aantal stemmingen waarop de groep de meerderheid had, en zonder de zetels van die fractie niet meer. Onder 25 eensgezinde stemmingen: "te weinig stemmingen".
- r54 (zin): Standaard tellen alleen verdeelde stemmingen (minstens een fractie voor en een tegen). Met een schakelaar kies je alle stemmingen (besluit 25 oktober 2026).
- r55 (zin): De zetels zijn die van het moment van de stemming. Bij een hoofdelijke stemming tellen de leden die echt stemden: wie afwezig is, helpt geen meerderheid.
- r56 (zin): De partners staan op volgorde: eerst beslissend, dan meegestemd.
- r59 (zin): Dit is terugkijken op echte stemmingen. Het is geen voorspelling en geen advies over een samenwerking.
- r60 (zin): Elke stemming telt even zwaar, of het nu gaat om een wet of om een procedurele motie.
- r61 (zin): Een fractie die vaak meestemt, deed dat niet per se om dezelfde reden als de groep.

## lib/stemmingVerhaal.ts

`lib/stemmingVerhaal.ts`

- r23 (tekst): Een week na de val van kabinet-Schoof stemt de Kamer over een motie van JA21: werk het asielplan van Wilders uit en voer het waar mogelijk uit.
- r23 (zin): Een week na de val van kabinet-Schoof stemt de Kamer over een motie van JA21: werk het asielplan van Wilders uit en voer het waar mogelijk uit.
- r25 (datum): de uitslag
- r25 (zin): ${voor} voor, ${tegen} tegen. De motie is verworpen.
- r26 (datum): per fractie
- r26 (zin): Voor stemmen ${lijstTekst(Object.keys(st.Voor).filter((f) => st.Voor[f] > 1).map(naam))}. Tegen onder meer ${lijstTekst(Object.keys(st.Tegen).filter((f) => f !== "PVV" && st.Tegen[f] > 3).map(naam))}.
- r28 (datum): de PVV
- r28 (zin): En de PVV: ${st.Tegen.PVV} van haar ${pvv} leden stemmen tegen het uitvoeren van het eigen plan. De andere ${pvv - st.Tegen.PVV} doen niet mee.
- r30 (datum): één stem
- r30 (tekst): Eén VVD-Kamerlid stemt anders dan de rest van de fractie. Bij een hoofdelijke stemming zie je dat. Bij handopsteken telt de fractie als één stem.
- r30 (zin): Eén VVD-Kamerlid stemt anders dan de rest van de fractie. Bij een hoofdelijke stemming zie je dat. Bij handopsteken telt de fractie als één stem.

## lib/voorpagina.ts

`lib/voorpagina.ts`

- r59 (zin): ${intro} ${lijstTekst(fr.map(naam))}: samen ${n} van de 150 zetels${n < 76 ? ", een minderheid" : ""}.
- r66 (zin): Na de verkiezingen van 2023 begint kabinet-Schoof met
- r70 (zin): ${naam(c.afkorting)} stapt uit het kabinet. Er blijven ${n} zetels over.
- r75 (zin): Verkiezingen, en een nieuwe Kamer. De grootste: ${lijstTekst(kop.map(naam))}, met ${grootste} zetels.
- r80 (zin): ${o.leden} Kamerleden verlaten de ${naam(o.van)} en gaan verder als ${naam(o.naar)}.
- r89 (zin): ${verder.join(" ")} ${n < 76 ? `Per stemming moet het kabinet minstens ${76 - n} zetels bij de oppositie vinden.` : ""}
- r89 (zin): Per stemming moet het kabinet minstens ${76 - n} zetels bij de oppositie vinden.
- r91 (tekst): Alle fracties per kabinet
- r108 (zin): ${intro} ${naam(wie)} stemt het vaakst hetzelfde als ${naam(hoog)} (${procent(cohesie(wie, hoog))}) en het minst vaak als ${naam(laag)} (${procent(cohesie(wie, laag))}).
- r114 (tekst): Kies zelf een fractie in de verkenner
