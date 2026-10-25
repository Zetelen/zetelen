# Alle vaste teksten op de site

Automatisch verzameld op 25 oktober 2026 uit de broncode (`web/app`, `web/components`, `web/lib/maten.ts` en de verhaalteksten). Per bestand de teksten met regelnummer. `${...}` is een plek waar een getal of naam uit de data komt. Herschrijf direct in dit bestand (zet je versie onder de oude, of streep door); ik verwerk het daarna in de code.

Door de code gegenereerde zinnen (bijvoorbeeld "D66 stemt het vaakst hetzelfde als ...") staan hier als sjabloon.

## /coalitie

`app/coalitie/page.tsx`

- r29 (zin): ${groep.split(",").join(", ")}: bij wie haalde deze groep een meerderheid in de Tweede Kamer?
- r30 (zin): Stel zelf een groep fracties samen en zie bij wie die groep in het verleden een meerderheid haalde.
- r46 (tekst): Coalitiebouwer · concept
- r47 (tekst): Bij wie haal je een meerderheid?
- r49 (tekst): Kies fracties in de lijst of in de zaal en stel zo een (fictief) kabinet samen. Je ziet hun zetels, en bij welke andere fracties die groep in de gekozen periode een meerderheid haalde.
- r65 (titel): Zo lees je dit
- r67 (tekst): Eensgezind: elke fractie in je groep stemde voor of tegen, allemaal hetzelfde. Meegestemd: een andere fractie koos dezelfde kant. Beslissend: de groep had de meerderheid, en zonder die fractie niet meer. Zetels tellen zoals ze op het moment van de stemming waren. Standaard alleen verdeelde stemmingen (fracties voor en tegen).
- r70 (tekst): Hoe is dit berekend?
- r74 (tekst): Terugkijken, geen voorspelling
- r76 (tekst): Dit telt hoe er in het verleden echt is gestemd. Het zegt niets over hoe fracties in de toekomst zouden stemmen, en het is geen advies over welke samenwerking goed of wenselijk is.
- r81 (label): Geen stemmingen
- r81 (titel): Geen stemmingen in deze periode
- r81 (uitleg): Kies een andere periode.
- r87 (toelichting): ${periode.naam} · eigen berekening, zie de methodiek

## /coalitie/plaatje/route.tsx

`app/coalitie/plaatje/route.tsx`

- r26 (zin): ${76 - zetels} zetels tekort voor een meerderheid
- r31 (tekst): ZETELEN · COALITIEBOUWER
- r47 (tekst): Te weinig eensgezinde stemmingen om iets te zeggen
- r49 (zin): ${periode ? (soort === "kabinet" ? `Kabinet-${periode.naam}` : periode.naam) : ""} · ${alleenVerdeeld ? "verdeelde stemmingen" : "alle stemmingen"} · Terugkijken, geen voorspelling · Bron: Tweede Kamer open data · Stand: ${ververst ? datumTekst(ververst) : "onbekend"}

## /error.tsx

`app/error.tsx`

- r9 (titel): De cijfers konden niet worden geladen
- r10 (uitleg): De gegevens zijn nu waarschijnlijk niet bereikbaar. Probeer het over een paar minuten opnieuw.
- r13 (tekst): Probeer opnieuw

## /fracties/[fractie]/opengraph-image.tsx

`app/fracties/[fractie]/opengraph-image.tsx`

- r29 (tekst): Te weinig data
- r44 (zin): Kabinet-${periode?.naam ?? "?"} · alle stemmingen · Bron: Tweede Kamer open data, eigen berekening · Stand: ${ververst ? datumTekst(ververst) : "onbekend"}

## /fracties/[fractie]

`app/fracties/[fractie]/page.tsx`

- r26 (title): Fractie niet gevonden
- r64 (tekst): zetels aan het eind van
- r64 (tekst): stemmingen in deze periode
- r92 (label): Geen stemmingen
- r92 (titel): Geen stemmingen van ${f.afkorting} in deze ${soort === "kabinet" ? "kabinetsperiode" : "Kamerperiode"}
- r93 (uitleg): Deze fractie bestond in de gekozen periode niet, of stemde niet mee. Kies een andere periode.
- r96 (tekst): Met wie stemt
- r96 (tekst): het vaakst hetzelfde? ·
- r113 (toelichting): ${periode.naam} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}
- r117 (tekst): Bekijk in de verkenner
- r120 (tekst): per onderwerp
- r123 (tekst): Bij wie haalt
- r123 (tekst): een meerderheid?

## /fracties

`app/fracties/page.tsx`

- r15 (description): Alle fracties in de Tweede Kamer sinds 2010: zetels, kabinet of oppositie, en met wie ze het vaakst hetzelfde stemden.
- r32 (label): Niet bereikbaar
- r32 (titel): De fracties konden niet worden geladen
- r32 (uitleg): Probeer het over een paar minuten opnieuw.
- r47 (tekst): Wie zit er in de Kamer?
- r49 (tekst): De fracties bij het begin van de gekozen periode, op volgorde van zetels. Een lichter deel van de balk: Kamerleden die tijdens de periode naar een andere fractie overstapten. Kies een fractie voor haar cohesie met alle andere.
- r55 (tekst): begon met
- r55 (tekst): van de 150 zetels
- r55 (tekst): . Samenstelling nog na te kijken.
- r61 (aria-label): Fracties bij het begin van ${periode.naam}, op volgorde van zetels
- r92 (tekst): Nieuw in de Kamer tijdens
- r106 (tekst): Alle fracties sinds 2010

## /methodiek

`app/methodiek/page.tsx`

- r12 (description): Hoe Zetelen cohesie berekent: definitie, formule, bron en beperkingen.
- r22 (tekst): Hoe de cijfers tot stand komen
- r24 (tekst): Elke maat op deze site staat hieronder met de definitie, de formule in woorden, de bron en de beperkingen. Wie de berekening wil nalopen, vindt de code en de SQL op
- r34 (tekst): Formule:
- r48 (tekst): De data
- r50 (tekst): Alle cijfers komen uit de
- r50 (tekst): open data van de Tweede Kamer
- r50 (tekst): . Die is vrij te gebruiken onder de publiek-domeinverklaring CC0. De Tweede Kamer is niet betrokken bij deze site en heeft de analyses niet goedgekeurd; zij garandeert ook niet dat de brondata foutloos is.
- r55 (tekst): Elke nacht haalt een script de wijzigingen op en rekent de analyses opnieuw uit. Mee tellen de stemmingen vanaf 2010; verwijderde records en stemmingen zonder vergaderdatum tellen niet mee.
- r64 (tekst): Na elke verversing controleert het script onder meer dat geen stemming meer dan 150 zetels telt, en dat de uitslag volgens de stemmen past bij de officiële uitslag. Bij een handvol van de ruim 60.000 besluiten past die niet; in minstens één geval meldt de Tweede Kamer zelf dat de officiële conclusie een vergissing was. Cohesie gebruikt de stemmen per fractie, niet de conclusie, en heeft daar dus geen last van.
- r70 (tekst): Fout gezien? Mail
- r70 (tekst): of meld het op
- r71 (tekst): . Correcties staan in het

## /not-found.tsx

`app/not-found.tsx`

- r7 (label): Niet gevonden
- r7 (titel): Deze pagina bestaat niet
- r7 (uitleg): Misschien is het adres veranderd, of zit er een tikfout in.
- r9 (tekst): Naar de voorpagina

## /onderwerpen

`app/onderwerpen/page.tsx`

- r29 (description): Waar zijn fracties in de Tweede Kamer het over eens? Cohesie per beleidsterrein, per kabinet of Kamerperiode.
- r68 (tekst): Onderwerpen · concept
- r69 (tekst): Waar zijn ze het over eens?
- r71 (tekst): Kies een fractie en zie per beleidsterrein hoe vaak andere fracties dezelfde kant kozen. Kies een tweede fractie om het paar per onderwerp te vergelijken, en een terrein voor de dossiers en stemmingen erachter.
- r74 (titel): Zo lees je dit
- r76 (tekst): Elke stemming hoort bij een Kamerstukdossier, en elk dossier bij een beleidsterrein: via een trefwoord in de titel (asiel, wonen, digitaal) of anders de vaste commissie die het dossier het vaakst behandelt. Een stemming bij meer dossiers telt bij elk terrein mee. Lichter is vaker hetzelfde; gearceerd betekent minder dan 25 gezamenlijke stemmingen.
- r79 (tekst): Hoe is dit ingedeeld?
- r97 (label): Niet bereikbaar
- r97 (titel): De onderwerpen konden niet worden geladen
- r97 (uitleg): Probeer het over een paar minuten opnieuw.
- r103 (tekst): Het vaakst eens bij
- r103 (tekst): ), het minst bij
- r104 (zin): Over alle stemmingen samen: ${procent(totaal)} (de witte lijn).
- r107 (tekst): Tik op een terrein voor de dossiers waarin
- r107 (tekst): het minst eens waren.
- r108 (label): Cohesie van ${gekozen.afkorting} en ${met.afkorting} per beleidsterrein
- r110 (tekst): Terug naar alle fracties
- r113 (tekst): · dossiers, van minst naar meest eens
- r115 (tekst): De dossiers konden niet worden geladen. Probeer het over een paar minuten opnieuw.
- r118 (tekst): Geteld zijn de stemmingen waarop
- r118 (tekst): allebei voor of tegen stemden. Per dossier zijn het er te weinig voor een percentage.
- r126 (titel): ${dossier.titel} · ${dossier.eens} van de ${dossier.samen} keer eens
- r134 (tekst): tegenover elke fractie, per beleidsterrein ·
- r137 (tekst): Cohesie van
- r137 (tekst): met elke fractie, per beleidsterrein, in procenten
- r156 (tekst): te weinig data
- r172 (tekst): Het getal achter een terrein is het aantal stemmingen in deze periode. Kies een cel om
- r172 (tekst): en die fractie per terrein te vergelijken. Gearceerd: minder dan 25 gezamenlijke stemmingen.
- r180 (tekst): Achter het cijfer · één stemming uit elkaar gehaald
- r181 (tekst): Het asielplan van Wilders
- r183 (tekst): Elk percentage hierboven telt stemmingen zoals deze. Een hoofdelijke stemming laat zien wat bij handopsteken verborgen blijft: hoe elk Kamerlid stemde.
- r186 (label): De stemming over de motie-Eerdmans
- r187 (tekst): Stemming over zaak
- r187 (tekst): , hoofdelijk,
- r187 (tekst): . Kleuren zijn een eigen palet, geen partijkleuren.
- r190 (toelichting): Beleidsterrein via het Kamerstukdossier: een trefwoord in de titel, anders de vaste commissie die het dossier het vaakst behandelt. Een stemming bij meer dossiers telt bij elk terrein mee. ${variant === "alle" ? "Alle stemmingen" : "Alleen verdeelde stemmingen"}.

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
- r45 (tekst): Hoe vaak stemmen fracties hetzelfde?
- r48 (tekst): Sectiekop · Newsreader 400
- r49 (tekst): Wat een percentage wel en niet zegt
- r52 (tekst): Uitgelicht cijfer · tabulaire cijfers
- r56 (tekst): Lopende tekst · Hanken Grotesk 17 px
- r57 (tekst): Cohesie is het percentage stemmingen waarop twee fracties hetzelfde stemden. Een hoog percentage betekent niet dat fracties het inhoudelijk eens zijn.
- r60 (tekst): Datalabel en bron · DM Mono
- r61 (tekst): Bron: Tweede Kamer open data · Laatst ververst: 24 oktober 2026
- r90 (tekst): Alle stemmingen
- r91 (tekst): Alleen verdeelde stemmingen
- r96 (titel): Cohesie met D66
- r96 (toelichting): Gebaseerd op 2.104 gezamenlijke stemmingen
- r97 (toelichting): Voorbeeld van een grafiekkader met bron
- r110 (tekst): Voorbeeldtekst voor de eerste lezing.
- r111 (tekst): Voorbeeldtekst voor de tweede lezing.

## /opengraph-image.tsx

`app/opengraph-image.tsx`

- r4 (zin): Zetelen: hoe vaak stemmen fracties in de Tweede Kamer hetzelfde?
- r25 (tekst): Hoe vaak stemmen fracties hetzelfde?
- r26 (tekst): Op basis van de open data van de Tweede Kamer

## /over

`app/over/page.tsx`

- r10 (description): Wie maakt Zetelen, met welke data, en hoe meld je een fout.
- r19 (tekst): Over Zetelen
- r21 (tekst): Zetelen is een onafhankelijk project van
- r21 (tekst): . Er zit geen organisatie of partij achter. Het doel is het stemgedrag in de Tweede Kamer inzichtelijk te maken met openbare data, en daarbij te laten zien dat een cijfer meer dan een lezing kent.
- r28 (tekst): De data
- r30 (tekst): Alle cijfers komen uit de open data van de Tweede Kamer. Een script haalt die elke dag op, rekent de analyses uit en controleert de uitkomst, onder meer tegen de officiële uitslagen. De broncode en de berekeningen zijn openbaar.
- r35 (tekst): Bekijk de broncode op GitHub
- r40 (tekst): Een fout melden
- r42 (tekst): Zie je een cijfer dat niet klopt? Mail
- r42 (tekst): of meld het op
- r43 (tekst): . Noem de pagina en wat je verwachtte. Elke correctie komt in het

## /

`app/page.tsx`

- r16 (tekst): Kies een fractie en zie hoe vaak elke andere fractie met haar meestemde, per kabinet of Kamerperiode.
- r16 (zin): Kies een fractie en zie hoe vaak elke andere fractie met haar meestemde, per kabinet of Kamerperiode.
- r17 (tekst): Waar zijn fracties het over eens? Cohesie per beleidsterrein, voor elk paar fracties.
- r17 (zin): Waar zijn fracties het over eens? Cohesie per beleidsterrein, voor elk paar fracties.
- r18 (tekst): Alle fracties sinds 2010: zetels, kabinet of oppositie, en wie er overstapte.
- r18 (zin): Alle fracties sinds 2010: zetels, kabinet of oppositie, en wie er overstapte.
- r19 (tekst): Stel zelf een groep fracties samen en zie bij wie die een meerderheid haalde.
- r19 (zin): Stel zelf een groep fracties samen en zie bij wie die een meerderheid haalde.
- r20 (tekst): Hoe de cijfers tot stand komen, wat ze wel en niet zeggen, en wat er veranderde.
- r20 (zin): Hoe de cijfers tot stand komen, wat ze wel en niet zeggen, en wat er veranderde.
- r34 (tekst): Wat de Tweede Kamer stemt, en met wie
- r36 (tekst): Zetelen volgt elke stemming in de Tweede Kamer sinds 2010. Scroll door het verhaal van de afgelopen jaren, of ga direct naar wat je zoekt.
- r39 (aria-label): Direct naar
- r46 (tekst): Sla het verhaal over
- r51 (label): De zaal van de Tweede Kamer
- r53 (tekst): Het verhaal kon niet worden geladen. Probeer het over een paar minuten opnieuw, of ga direct naar de verkenner.
- r58 (tekst): 3 · Waar zijn ze het over eens?
- r59 (tekst): Samen in het kabinet, niet overal eens
- r61 (tekst): zijn de grootste partijen van kabinet-
- r62 (zin): en stemmen in ${procent(partners.totaal)} van de stemmingen hetzelfde
- r62 (tekst): . Per onderwerp verschilt dat: het vaakst eens bij
- r63 (tekst): ), het minst bij
- r65 (label): Cohesie van ${partners.a.afkorting} en ${partners.b.afkorting} per beleidsterrein
- r68 (tekst): Vergelijk zelf twee fracties per onderwerp
- r74 (tekst): 4 · Kun jij een meerderheid vinden?
- r75 (tekst): Zoek mee naar 76 zetels
- r78 (zin): Kabinet-${kabinet.naam} heeft ${kabinet.zetels} zetels en heeft er 76 nodig voor een meerderheid.
- r80 (tekst): Stel zelf een groep fracties samen en zie bij welke andere fracties die groep in het verleden een meerderheid haalde. De coalitiebouwer is nog een concept: de rekenwijze wordt nog nagekeken.
- r83 (tekst): Naar de coalitiebouwer
- r87 (tekst): Verder op Zetelen
- r97 (tekst): Wie maakt dit, met welke data, en hoe meld je een fout?
- r97 (tekst): Over Zetelen
- r101 (toelichting): Zetels bij het begin van elk kabinet en elke Kamerperiode, gemeten 30 dagen na de start. Kleuren van fracties zijn een eigen palet, geen partijkleuren.

## /privacy

`app/privacy/page.tsx`

- r15 (tekst): Privacy · concept
- r16 (tekst): Welke gegevens Zetelen verwerkt
- r18 (tekst): Zetelen heeft geen accounts, slaat geen opvattingen van bezoekers op en plaatst geen cookies. Wat je kiest in de verkenner of de coalitiebouwer staat alleen in de link in je browser.
- r25 (tekst): De site draait bij Vercel. Zoals elke webserver verwerkt Vercel technische gegevens, zoals je IP-adres, om de pagina te kunnen leveren en misbruik te voorkomen. Zetelen gebruikt die gegevens niet.
- r31 (tekst): Nog niet gekozen. Deze tekst wordt aangevuld voordat er statistieken worden bijgehouden.
- r36 (tekst): In de testperiode staat er een link naar een vragenlijst bij een externe dienst. Wat je daar invult, verwerkt die dienst; Zetelen gebruikt de antwoorden alleen om de site te verbeteren en vraagt niet om je naam. Invullen is vrijwillig.
- r44 (tekst): Van Kamerleden gebruikt Zetelen alleen naam, fractie en stemgedrag uit de open data van de Tweede Kamer. Geen geboortedatum, woonplaats of andere persoonsgegevens. Vragen of een verzoek? Mail

## /verkenner

`app/verkenner/page.tsx`

- r20 (description): Hoe vaak stemmen twee fracties in de Tweede Kamer hetzelfde? Kies een fractie en een periode.
- r39 (tekst): Elke fractie tegenover elke andere
- r52 (titel): Zo lees je dit
- r54 (tekst): Kies een fractie in de lijst naast de zaal. Die licht op in koper; de andere fracties kleuren naar het aandeel stemmingen waarop zij dezelfde kant kozen. Licht is een hoge cohesie, donker een lage. Gearceerd betekent te weinig gezamenlijke stemmingen (minder dan 25) om iets te zeggen.
- r59 (tekst): Veel stemmingen zijn unaniem; die maken iedereen een beetje eensgezind. Met &quot;alleen verdeelde stemmingen&quot; tel je alleen de stemmingen waarover de Kamer verdeeld was, en zie je de verschillen scherper.
- r63 (tekst): Zaal, boog en tabel tonen dezelfde cijfers; de tabel is het meest precies.
- r64 (tekst): Hoe is dit berekend?
- r70 (label): Niet bereikbaar
- r70 (titel): De cijfers konden niet worden geladen
- r71 (uitleg): De gegevens zijn nu waarschijnlijk niet bereikbaar. Probeer het over een paar minuten opnieuw.
- r73 (label): Geen stemmingen
- r73 (titel): Geen stemmingen in ${soortTekst}
- r74 (uitleg): Voor de gekozen periode zijn er geen stemmingen om te vergelijken. Kies een ander ${soort === "kabinet" ? "kabinet" : "Kamerperiode"}.
- r75 (tekst): Naar het nieuwste kabinet
- r82 (toelichting): ${periode.naam} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}

## /wijzigingen

`app/wijzigingen/page.tsx`

- r7 (description): Alle inhoudelijke correcties op Zetelen, met datum.
- r14 (tekst): Wat er is gecorrigeerd
- r16 (tekst): Elke inhoudelijke correctie van een cijfer of tekst staat hier, met datum. Dagelijkse verversingen van de data staan er niet in; die zijn geen correctie.
- r21 (tekst): Er zijn nog geen correcties.

## components/coalitie/CoalitieBouwer.tsx

`components/coalitie/CoalitieBouwer.tsx`

- r43 (zin): De stemmingen konden niet worden geladen. Probeer het over een paar minuten opnieuw.
- r79 (zin): Eensgezind in ${uitkomst.eensgezind} stemmingen, met een meerderheid in ${uitkomst.meerderheid}.
- r91 (tekst): Stemmingen laden…
- r94 (tekst): Bij wie haalde deze groep een meerderheid? ·
- r97 (tekst): Deze groep stemde maar
- r97 (tekst): keer eensgezind in deze periode: te weinig om iets over te zeggen (minder dan
- r102 (tekst): De groep stemde
- r102 (tekst): keer eensgezind. Daarvan won de kant van de groep
- r103 (tekst): keer (
- r103 (tekst): ), en
- r104 (tekst): keer op eigen kracht.
- r106 (aria-label): Partners, eerst op beslissend, dan op meegestemd
- r113 (tekst): keer beslissend
- r121 (tekst): Meegestemd: hoe vaak de fractie dezelfde kant koos als de groep. Beslissend: de groep had de meerderheid, en zonder deze fractie niet meer. Zetels van het moment van de stemming. Kies een partner voor de stemmingen waarop die beslissend was.
- r131 (tekst): per onderwerp →
- r151 (aria-label): Stel een groep fracties samen
- r162 (aria-label): ${f.naam}, ${f.zetels} zetels, ${inGroep ? "in de groep" : "niet in de groep"}
- r168 (tekst): in de groep
- r175 (tekst): + toevoegen
- r192 (aria-label): Zaal; gekozen groep: ${zetelsGroep} zetels
- r249 (aria-label): Stemmingen waarop ${partner.afkorting} beslissend was
- r250 (tekst): keer beslissend
- r251 (tekst): De stemmingen zijn hier nog niet beschikbaar; ze komen na de volgende verversing.
- r252 (tekst): De stemmingen konden niet worden geladen.
- r252 (tekst): Stemmingen laden…
- r253 (tekst): Geen stemmingen waarop
- r253 (tekst): beslissend was.
- r265 (tekst): op tweedekamer.nl ↗

## components/cohesie/Bronregel.tsx

`components/cohesie/Bronregel.tsx`

- r10 (tekst): Bron:
- r10 (tekst): Tweede Kamer open data
- r10 (tekst): , eigen berekening ·
- r10 (tekst): · Laatst ververst:

## components/cohesie/PeriodeKeuze.tsx

`components/cohesie/PeriodeKeuze.tsx`

- r67 (tekst): Een kabinet loopt tot het volgende is beëdigd; de demissionaire tijd telt mee.

## components/cohesie/Verkenner.tsx

`components/cohesie/Verkenner.tsx`

- r64 (tekst): Gekozen fractie:
- r85 (tekst): Niet in de zaal, wel in deze periode:
- r85 (tekst): . Deze fracties stopten halverwege
- r86 (tekst): ; ze staan wel in de tabel.
- r104 (tekst): per onderwerp →
- r105 (tekst): Bij wie haalt
- r105 (tekst): een meerderheid? →
- r154 (aria-label): Kies een fractie
- r158 (tekst): Cohesie met
- r167 (aria-label): ${f.naam}, ${f.zetels} zetels, cohesie ${waarde}
- r200 (aria-label): Zaal met ${fracties.length} fracties; gekozen: ${gekozen.naam}
- r255 (aria-label): Boog met ${n} fracties; gekozen: ${gekozen.naam}
- r296 (aria-label): Cohesie tussen elke twee fracties, in procenten
- r317 (aria-label): zelfde fractie
- r331 (tekst): Kies een kolomkop om de rijen te sorteren. Kies een fractie in de eerste kolom om haar te markeren.

## components/FeedbackBalk.tsx

`components/FeedbackBalk.tsx`

- r10 (tekst): Dit is een testversie van Zetelen. Wat vind je ervan?
- r11 (tekst): Geef feedback in 3 minuten ↗

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
- r148 (tekst): Te weinig data: minder dan 25 gezamenlijke stemmingen
- r159 (tekst): Te weinig data

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

- r32 (zin): meest eens met ${hoog.f.afkorting} ${procent(hoog.c)}, minst met ${laag.f.afkorting} ${procent(laag.c)}

## components/onderwerpen/Verdieping.tsx

`components/onderwerpen/Verdieping.tsx`

- r13 (tekst): Geen stemmingen waarop
- r13 (tekst): allebei stemden.
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

- r11 (definitie): Cohesie tussen twee fracties is het percentage van hun gezamenlijke stemmingen waarin ze hetzelfde stemden. Een gezamenlijke stemming is een besluit waarover beide fracties voor of tegen stemden; stemmingen waarbij een van de twee niet deelnam of afwezig was, tellen niet mee. Bij een hoofdelijke stemming telt als stem van de fractie wat de meerderheid van haar leden stemde.
- r13 (formule): het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen, maal 100. Bij minder dan 25 gezamenlijke stemmingen geen percentage maar "te weinig data".
- r15 (zin): Per kabinet en per Kamerperiode. Een kabinet loopt tot het volgende is beëdigd: de demissionaire tijd telt mee bij het kabinet waar die uit voortkomt.
- r16 (zin): Twee varianten: alle stemmingen, en alleen de stemmingen waarover de Kamer verdeeld was (minstens één fractie voor en één tegen). Veel stemmingen zijn unaniem; de tweede variant laat die weg.
- r17 (zin): Een stem die de fractie zelf als vergissing heeft gemeld, telt niet mee: de bron zegt niet wat de fractie wel bedoelde.
- r18 (zin): Bij een hoofdelijke stemming en een gelijke stand binnen de fractie is er geen fractiestem.
- r19 (zin): Hamerstukken en besluiten zonder stemming tellen niet mee.
- r22 (zin): Cohesie telt stemmen, geen redenen. Twee fracties kunnen om heel verschillende redenen hetzelfde stemmen.
- r23 (zin): Elk besluit telt even zwaar, of het nu gaat om een wet of om een procedurele motie.
- r24 (zin): De volgorde van de fracties in de zaal komt uit de cijfers (fracties die vaak hetzelfde stemmen, zitten naast elkaar), niet uit de echte zaalindeling of een links-rechtsschaal.
- r31 (definitie): Dezelfde cohesie als hierboven, maar per beleidsterrein. Elke stemming hoort via haar zaak bij een of meer Kamerstukdossiers, en elk dossier bij een van zeventien beleidsterreinen, zoals Zorg, Asiel en migratie of Digitalisering.
- r33 (formule): per terrein: het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen in dat terrein, maal 100; onder 25 gezamenlijke stemmingen "te weinig data". Per dossier en per stemming: tellingen ("3 van de 5 keer eens"), geen percentages.
- r35 (zin): Het terrein van een dossier volgt eerst uit een trefwoord in de titel (bijvoorbeeld asiel, vreemdeling, huur, woning, cyber, kunstmatige intelligentie), anders uit de vaste commissie die het vaakst voortouw had over de zaken in dat dossier. Zo vallen onderwerpen die van commissie wisselden, zoals asiel tot 2024, toch onder hun eigen terrein.
- r36 (zin): Een stemming die bij meer dossiers hoort, telt bij elk terrein mee.
- r37 (zin): Commissies krijgen per kabinet een andere naam; een vaste koppeltabel zet elke commissie om in een terrein.
- r38 (zin): In de koppen \"het vaakst eens bij\" en \"het minst bij\" tellen alleen terreinen met minstens 50 gezamenlijke stemmingen, zodat een klein terrein niet de kop haalt.
- r41 (zin): De indeling is een eigen keuze. Een dossier kan over meer onderwerpen gaan dan zijn titel of commissie laat zien.
- r42 (zin): Ongeveer 1 procent van de stemmingen valt onder Overig: dossiers zonder vaste commissie en zonder trefwoord.
- r43 (zin): Trefwoorden kunnen een enkel dossier verkeerd indelen; de lijst staat in de broncode en wordt nagekeken.
- r50 (definitie): Voor een zelf gekozen groep fracties telt de coalitiebouwer de stemmingen waarop de groep eensgezind was: elke fractie in de groep stemde voor of tegen, allemaal hetzelfde. Van die stemmingen telt hij hoe vaak de kant van de groep won, en per andere fractie hoe vaak die meestemde en hoe vaak die beslissend was.
- r52 (formule): meegestemd: het aantal eensgezinde stemmingen waarop de fractie dezelfde kant koos als de groep, gedeeld door het aantal eensgezinde stemmingen, maal 100. Beslissend: het aantal stemmingen waarop de groep de meerderheid had en zonder de zetels van die fractie niet meer. Onder 25 eensgezinde stemmingen "te weinig data".
- r54 (zin): Standaard alleen verdeelde stemmingen (minstens een fractie voor en een tegen), met een schakelaar naar alle stemmingen (besluit 25 oktober 2026).
- r55 (zin): Zetels zijn die van het moment van de stemming. Bij een hoofdelijke stemming tellen de leden die echt stemden; afwezigen helpen geen meerderheid.
- r56 (zin): De partners staan op volgorde van eerst beslissend, dan meegestemd.
- r59 (zin): Dit is terugkijken op echte stemmingen, geen voorspelling of advies over een samenwerking.
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
- r30 (tekst): Eén VVD-Kamerlid stemt anders dan de rest van de fractie. Bij een hoofdelijke stemming is dat zichtbaar; bij handopsteken telt de fractie als één stem.
- r30 (zin): Eén VVD-Kamerlid stemt anders dan de rest van de fractie. Bij een hoofdelijke stemming is dat zichtbaar; bij handopsteken telt de fractie als één stem.

## lib/voorpagina.ts

`lib/voorpagina.ts`

- r59 (zin): ${intro} ${lijstTekst(fr.map(naam))}: samen ${n} van de 150 zetels${n < 76 ? ", een minderheid" : ""}.
- r66 (zin): Na de verkiezingen van 2023 begint kabinet-Schoof met
- r70 (zin): ${naam(c.afkorting)} stapt uit het kabinet. Er blijven ${n} zetels over.
- r75 (zin): Een nieuwe Kamer na de verkiezingen. Grootste: ${lijstTekst(kop.map(naam))}, met ${grootste} zetels.
- r80 (zin): ${o.leden} Kamerleden verlaten de ${naam(o.van)} en gaan verder als ${naam(o.naar)}.
- r89 (zin): ${verder.join(" ")} ${n < 76 ? `Het kabinet zoekt per stemming ${76 - n} zetels of meer bij de oppositie.` : ""}
- r89 (zin): Het kabinet zoekt per stemming ${76 - n} zetels of meer bij de oppositie.
- r91 (tekst): Alle fracties per kabinet
- r108 (zin): ${intro} ${naam(wie)} stemt het vaakst hetzelfde als ${naam(hoog)} (${procent(cohesie(wie, hoog))}) en het minst vaak als ${naam(laag)} (${procent(cohesie(wie, laag))}).
- r113 (zin): Hoe stemt elke partij nu? Neem de grootste kabinetspartij:
- r114 (tekst): Kies zelf een fractie in de verkenner
