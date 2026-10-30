# 06 Epics en user stories

Opgesteld: 22 oktober 2026, op basis van `01-idee.md` en `05-techniek.md`.
Bijgewerkt: 23 oktober 2026, met de uitkomst van de handmatige API-check (`api-check-handmatig.md`) en het ontwerp in `docs/ontwerp/` (E1-S4, E1-S8, E2-S1, E3-S2, E6-S1).
Bijgewerkt: 23 oktober 2026, met het API-checkrapport (`api-check-rapport.md`) (E1-S2, E1-S3, E1-S4, E2-S1, E2-S2, E6-S1, E6-S2).

Regels in dit document:

- Rollen: bezoeker, beheerder (Niels), en betrokkene (een Kamerlid of partij die een fout meldt)
- Veldnamen en kolomnamen staan er niet in. Die komen uit de API-check (zie E1-S2)
- Waar een drempel of getal een voorstel van Claude is, staat dat erbij. Niels beslist
- MVP betekent: hoort bij Release 1, de eerste live-gang

## Releases

| Release | Inhoud | Wanneer klaar |
|---|---|---|
| R1 | Fundament, data, cohesie-matrix, coalitiebouwer, lezingenformat op cohesie, basis van betrouwbaarheid | Eerste live-gang (geen haast, Niels 24 oktober 2026) |
| R2 | Wetgevingsproces en aanname, met lezingen | Na R1 |
| R3 | Kamerleden: activiteit en afwijkend stemgedrag, met lezingen | Na R2, afhankelijk van API-check |
| R4 | Engelse versie | Pas als alle vier de analyses live zijn |
| Later | Lens-keuze, nieuws en podcasts, Eerste Kamer | Geen datum |

## Epic 1: Data en verversing

Doel: een betrouwbare database die dagelijks vanzelf bijgewerkt wordt.

**E1-S1 Repo en geheimen** (MVP)
Als beheerder wil ik een publieke repo waarin nooit een geheim terechtkomt, zodat ik de code kan laten zien zonder risico.
- Er is een geautomatiseerde controle (secret scan) bij elke push die faalt als een sleutel in de code of historie staat
- Schrijfrol van de database staat alleen als GitHub Actions secret, de anon-sleutel alleen als Vercel environment variable
- De README beschrijft in een alinea wat het project doet en hoe de data verloopt

**E1-S2 API-check** (MVP)
Als beheerder wil ik een controlescript dat de API doorlicht, zodat het plan op feiten staat en niet op aannames.
- Het rapport toont per entiteit uit het informatiemodel of de toegang zonder registratie werkt, welke velden bestaan, de paginering en maximale paginagrootte, en het aantal records
- Het rapport toont per jaar vanaf 2010 het aantal stemmingen, en hoeveel daarvan een Persoon hebben
- Het rapport meldt of wijzigingen en verwijderingen via de API herkenbaar zijn
- Het rapport bevat geen namen van personen, alleen aantallen
- Het rapport staat als markdown in `docs/plan/` zodat de epics erop bijgewerkt kunnen worden
- Gedaan (23 oktober 2026): `api-check-rapport.md`, gemaakt door `pipeline/api_check.py`

**E1-S3 Volledige eerste laad** (MVP)
Als beheerder wil ik de benodigde entiteiten vanaf 2010 in de raw-laag laden, zodat de analyses een volledige basis hebben.
- De 14 entiteiten uit het API-checkrapport worden geladen (besluit Niels, 23 oktober 2026), geen contactgegevens, geschenken, reizen, nevenfuncties of inkomsten van personen
- Entiteiten met een datum laden vanaf 2010. Persoon, Fractie, FractieZetel, FractieZetelPersoon en Commissie laden volledig, omdat ze klein zijn en geen eigen stemdatum hebben. Het datumfilter per entiteit volgt uit de velden in het rapport
- Na de laad is het aantal records per entiteit gelijk aan het aantal in de API met hetzelfde filter (telling vergeleken en vastgelegd)
- Het script is herhaalbaar: opnieuw draaien na een onderbreking levert geen dubbele rijen op
- De totale databasegrootte inclusief indexes is gemeten en vastgelegd, met een vergelijking met de 500 MB van het Free plan. Het API-checkrapport schat de 14 entiteiten als JSON op 2,7 GB; in Postgres waarschijnlijk minder, niet gemeten
- Past de database na de eerste laad niet in Supabase Free (500 MB), dan wordt het Supabase Pro (besluit Niels, 23 oktober 2026)

**E1-S4 Dagelijkse incrementele verversing** (MVP)
Als beheerder wil ik dat de data elke dag zelf bijgewerkt wordt, zodat de site actueel blijft zonder dat ik eraan denk.
- Een GitHub Actions workflow draait dagelijks en laadt alleen wat sinds de vorige run is gewijzigd. Uit de API-check (23 oktober 2026) blijkt dat dit kan: alle 14 entiteiten hebben `ApiGewijzigdOp` en `Verwijderd`, en filteren op `ApiGewijzigdOp` werkt
- Verwijderde records in de bron worden ook in de database verwerkt. De API markeert ze met de vlag `Verwijderd` in plaats van ze weg te laten (7.247 stemmingen op 23 oktober 2026)
- De run is herhaalbaar en schrijft een log met aantallen en duur
- Bij een mislukte run krijgt de beheerder een melding

**E1-S5 Core-laag** (MVP)
Als beheerder wil ik een opgeschoond datamodel boven de raw-laag, zodat de analyses niet op ruwe data hoeven te draaien.
- Relaties tussen stemmingen, besluiten, zaken, personen en fracties zijn vastgelegd met controles op ontbrekende sleutels
- Fracties die door de tijd veranderen (splitsing, fusie, naamswijziging) zijn zo gemodelleerd dat een stemming altijd bij de fractie hoort die op dat moment bestond
- Het model is beschreven in een diagram en in een alinea per tabel

**E1-S6 Rechten** (MVP)
Als beheerder wil ik dat bezoekers alleen kunnen lezen wat publiek mag zijn, zodat er niets kan lekken of veranderen.
- Row Level Security staat aan op elke tabel in een blootgesteld schema
- De anon-rol kan alleen selecteren op de publieke analyse- en core-tabellen en kan nergens schrijven
- Views gebruiken `security_invoker` zodat ze RLS niet omzeilen
- Een geautomatiseerde test controleert deze rechten en draait bij elke wijziging aan de database
- De service_role-sleutel komt niet voor in de gebouwde frontend (gecontroleerd door een test op de build)

**E1-S7 Bewaking en runbook** (MVP)
Als beheerder wil ik weten wanneer de verversing uitblijft, zodat de 60-dagenregel of een pauzering niet onopgemerkt blijft.
- Er is een melding als er na een bepaald aantal dagen geen succesvolle run is geweest (drempel: voorstel 2 dagen)
- Er is een runbook van een pagina: een workflow heractiveren, een pauzering van Supabase opheffen, een mislukte run herhalen
- De site toont een "laatst bijgewerkt"-datum (zie E3-S1)

**E1-S8 Kabinettentabel** (MVP)
Als beheerder wil ik een handmatig beheerde tabel met kabinetten, zodat de periodefilter kabinetten kent.
- Elke rij heeft naam, begin, einde, bron en datum van controle
- Niels heeft de tabel nagekeken tegen de bron; Claude heeft de data niet nagezocht
- Er is een kolom voor de coalitiefracties, in R1 nog niet gevuld
- De Tweede Kamer-API bevat geen entiteit voor kabinetten (handmatige API-check, 23 oktober 2026). De tabel blijft dus handmatig
- Bron: Wikidata (licentie CC0), besluit Niels 23 oktober 2026. Wikidata wordt door vrijwilligers bijgehouden, dus elke rij wordt nagekeken voordat hij in de tabel komt

## Epic 2: Cohesie van fracties (R1)

Doel: laten zien welke fracties vaak samen stemmen.

**E2-S1 Definitie** (MVP)
Als beheerder wil ik een exacte definitie van cohesie, zodat elk cijfer navertelbaar is.
- De definitie staat op papier met formule, en beantwoordt: hoe tellen afwezigen en niet-deelnemers, wat is een gedeelde stemming, hoe tellen hamerstukken en besluiten zonder stemming, en hoe tellen stemmen die als vergissing zijn gemarkeerd (veld `Vergissing`, 1.437 stemmingen op 23 oktober 2026)
- Een stemming hoort bij een periode via de datum van de vergadering (`Besluit/Agendapunt/Activiteit/Datum`). Stemmingen zonder datum via die weg tellen niet mee (5.766, 0,6%, op 23 oktober 2026; besluit Niels, 23 oktober 2026). Het aantal staat bij de datakwaliteit (E7-S5)
- De definitie is in een alinea uit te leggen, zodat Niels het aan een ander kan navertellen
- Niels heeft de definitie goedgekeurd
- Fracties worden alleen vergeleken in periodes waarin ze beide bestonden

**E2-S2 Berekening** (MVP)
Als bezoeker wil ik cohesie per paar fracties per periode zien, zodat ik patronen kan vergelijken.
- Voor een gekozen periode bestaat een voorberekende tabel met alle fractieparen en hun cohesie, plus het aantal onderliggende stemmingen
- Een steekproef van minstens 10 stemmingen is met de hand nagerekend en komt overeen (aantal steekproef is een voorstel)
- Een fractie met te weinig gezamenlijke stemmingen toont "te weinig data" in plaats van een getal (drempel: 25, besluit Niels). Volgens het API-checkrapport zijn er 1.911 tot 4.749 besluiten met een stemming per jaar; in de variant "alle stemmingen" halen fracties die langer dan enkele weken bestonden de drempel dus ruim. Het aandeel verdeelde stemmingen is via de API niet te tellen en wordt bij de berekening gecontroleerd
- Het filter op onderwerp is geen onderdeel van R1, want hoe "onderwerp" uit de data volgt is nog niet bekend (zie E1-S2). Kandidaat-bron bij R2: de entiteit Kamerstukdossier uit dezelfde API (dossiers met titel), nu niet geladen

**E2-S3 Matrix** (MVP)
Als bezoeker wil ik een matrix van fracties met kleur voor cohesie, zodat ik in een oogopslag zie wie het vaakst samen stemt.
- De matrix toont alle fracties van de gekozen periode
- Een legenda, een tooltip met cijfer en aantal stemmingen, en een tabelweergave als alternatief zijn aanwezig
- De kleurschaal is leesbaar voor kleurenblinde bezoekers
- Op een telefoonscherm blijft de matrix bruikbaar (scrollen of een andere weergave, ontwerpkeuze in het componentbestand)

**E2-S4 Periodefilter** (MVP)
Als bezoeker wil ik de periode kiezen, zodat ik kabinetten of jaren kan vergelijken.
- De gekozen periode staat in de URL, zodat die deelbaar is
- Er zijn twee periodesoorten: kabinet (standaard, besluit Niels, 22 oktober 2026) en Kamerperiode. De gekozen soort staat ook in de URL
- Bij een kabinet met een demissionaire fase is vastgelegd hoe die telt (zie `08-componenten/cohesie-analyse.md`)
- Bij een periode zonder data staat een lege staat met uitleg (zie E3-S9)

**E2-S5 Leeswijzer** (MVP)
Als bezoeker wil ik uitleg bij de matrix, zodat ik snap wat ik zie zonder de methodiek te hoeven lezen.
- Een korte leeswijzer van maximaal een paar zinnen staat naast de matrix, met een link naar de volledige definitie

**E2-S6 Fractiepagina** (MVP)
Als bezoeker wil ik per fractie een pagina met die fractie's cohesie met anderen, zodat ik die kan delen.
- Elke fractie heeft een stabiele, deelbare URL
- De pagina toont de cohesie met elke andere fractie, de periode en de bron

**E2-S7 Definitie coalitiebouwer** (MVP, toegevoegd 24 oktober 2026)
Als beheerder wil ik een exacte definitie van "bij wie haalt een groep een meerderheid", zodat elk cijfer navertelbaar is.
- De definitie beantwoordt: wanneer stemt een groep eensgezind, welke zetels tellen (die van het moment van de stemming), wanneer heeft een andere fractie de groep aan een meerderheid geholpen, en wanneer was die fractie beslissend (zonder haar had de groep verloren)
- Terugkijkend op echte stemmingen; nergens wordt een uitkomst voorspeld
- Niels heeft de definitie goedgekeurd

**E2-S8 Berekening coalitiebouwer** (MVP)
Als bezoeker wil ik voor een zelf gekozen groep fracties en een periode zien bij wie de groep een meerderheid haalde.
- Werkt voor elke combinatie van fracties die in de gekozen periode bestonden, zonder dat alle combinaties vooraf berekend zijn
- Per andere fractie: hoe vaak die meestemde met de groep en hoe vaak die beslissend was, met het aantal onderliggende stemmingen
- Een steekproef is met de hand nagerekend
- Onder een minimaal aantal eensgezinde stemmingen toont de site "te weinig data" (drempel: voorstel 25, gelijk aan cohesie)

**E2-S9 Coalitiebouwer in de zaal** (MVP)
Als bezoeker wil ik fracties aanklikken en in de zaal hun zetels en het totaal zien, en daarna zien welke fracties het vaakst voor een meerderheid zorgden.
- De zaal licht de gekozen fracties op en toont het totaal en het tekort of overschot ten opzichte van 76
- De steunpartners staan in een rangorde en zijn in de zaal te zien
- De keuze staat in de URL, zodat een combinatie deelbaar is
- Met het toetsenbord te bedienen (lijst met knoppen, zoals bij de cohesiezaal)

**E2-S10 Lezingen bij de coalitiebouwer** (MVP)
Als bezoeker wil ik twee lezingen bij de uitkomst, zodat een rangorde van steunpartners niet als advies leest.
- Twee onderbouwde invalshoeken (zie E4), door Niels gekozen
- Een vaste tekst die uitlegt dat het terugkijken is, geen voorspelling of advies

## Epic 3: Site-fundament (R1)

Doel: een site die er journalistiek en strak uitziet en vindbaar en deelbaar is.

**E3-S1 Voorpagina** (MVP)
Als bezoeker wil ik een korte verhalende voorpagina met een eerste vondst en een doorklik naar de verkenner.
- De voorpagina bevat minstens een door Niels goedgekeurde conclusie met bron
- Een "laatst bijgewerkt"-datum staat zichtbaar
- Een link naar de cohesie-verkenner en naar de methodiekpagina

**E3-S2 Ontwerpsysteem** (MVP)
Als beheerder wil ik een vastgelegd ontwerpsysteem, zodat elke pagina en elk component er hetzelfde uitziet.
- Kleuren, typografie, grafiekstijl en spacing zijn vastgelegd in een bestand en in tokens
- Het palet is eigen en volgt het ontwerp "nacht met koperlicht" in `docs/ontwerp/` (besluit Niels, 23 oktober 2026), zonder merkelementen van The Economist of een andere krant over te nemen
- Contrast voldoet aan WCAG AA
- Er staan geen partijlogo's en geen partijkleuren in het ontwerpsysteem of op de site in R1; partijen worden getoond met naam en afkorting in het eigen palet

**E3-S3 Methodiekpagina** (MVP)
Als bezoeker wil ik per maat de definitie en bron zien, zodat ik de cijfers kan beoordelen.
- Elke maat die op de site staat heeft een definitie, formule in woorden, bron en beperking
- De pagina groeit mee: nieuwe analyses voegen hier een sectie toe voordat ze live gaan

**E3-S4 Delen en zoekmachines** (MVP)
Als bezoeker wil ik pagina's kunnen delen, en als beheerder vindbaar zijn.
- Elke publieke pagina heeft een eigen URL, titel, beschrijving en voorbeeldafbeelding voor delen
- Er is een sitemap

**E3-S5 Deelplaatjes** (MVP, na de fractiepagina)
Als bezoeker wil ik een plaatje van een resultaat kunnen delen, zodat het op social media circuleert.
- Per fractiepagina wordt automatisch een plaatje gegenereerd met het cijfer, de periode, de bron en de datum
- Het plaatje toont nooit een cijfer dat niet in de database staat

**E3-S6 Analytics** (MVP)
Als beheerder wil ik de 500 bezoekers per maand kunnen meten, zonder bezoekers te volgen.
- Gekozen analyses leggen geen persoonlijke identificatie vast, de keuze is gedocumenteerd
- Het meetmoment en de definitie van "bezoeker" zijn vastgelegd (zie open punten in `01-idee.md`)

**E3-S7 Over de maker** (MVP)
Als bezoeker wil ik weten wie de site maakt, zodat ik de bron kan beoordelen.
- Een pagina toont de maker onder eigen naam, het doel van de site, en hoe fouten gemeld worden

**E3-S8 Prestatie en toegankelijkheid** (MVP)
Als bezoeker wil ik een snelle, toegankelijke site.
- Voorstel: de voorpagina en de matrixpagina scoren minstens 90 op prestatie en toegankelijkheid in een standaard audit
- Bedienbaar met toetsenbord, met zichtbare focus

**E3-S9 Lege en foutstaten** (MVP)
Als bezoeker wil ik een duidelijke melding als er niets te tonen is of iets misgaat.
- Een periode of fractie zonder data toont een uitleg en geen lege grafiek
- Als de database onbereikbaar is, toont de site de laatst bekende goede versie (indien beschikbaar) of een nette foutpagina

## Epic 4: Twee lezingen (R1 op cohesie, daarna per analyse)

Doel: bij elke analyse twee onderbouwde lezingen naast elkaar.

**E4-S1 Format** (MVP)
Als bezoeker wil ik twee lezingen naast elkaar, zodat ik zelf kan oordelen.
- Beide lezingen zijn altijd tegelijk zichtbaar en even prominent
- Elke lezing heeft een label voor de invalshoek en verwijst per bewering naar het cijfer waarop het rust
- Op mobiel staan ze onder elkaar met gelijke opmaak
- Een uitleg bij het format zegt dat de lezingen invalshoeken zijn, geen oordeel van de maker

**E4-S2 Lezingen voor cohesie schrijven** (MVP)
Als beheerder wil ik twee lezingen voor de cohesie-analyse schrijven en kunnen verdedigen.
- Beide lezingen zijn de sterkste versie van hun argument, niet een stropop
- Voorstel: een lezer met een andere voorkeur dan Niels leest beide mee en herkent ze als eerlijk
- Niels kan elke lezing in zijn eigen woorden navertellen

**E4-S3 Sjabloonlogica** (MVP)
Als bezoeker wil ik dat de tekst bij de lezing klopt bij het getoonde cijfer, ook als ik filter.
- De tekst wisselt van variant op basis van vastgelegde drempels
- Voor elke filtercombinatie in een testlijst toont de tekst een variant die bij de cijfers past
- Bij een onbekende of onvoldoende dekkende combinatie toont de site "geen duiding beschikbaar" en niet een verkeerde tekst
- Een geautomatiseerde test faalt als een combinatie uit de testlijst een tekst toont die de cijfers tegenspreekt

**E4-S4 Goedkeuring** (MVP)
Als beheerder wil ik dat een lezing pas live gaat na mijn goedkeuring.
- Lezingen staan als tekstbestanden in de repo en veranderen alleen via een pull request
- Een checklist in de pull request vraagt om definitie, bron en beide invalshoeken

## Epic 5: Wetgevingsproces en aanname (R2)

**E5-S1 Definitie aanname en doorlooptijd** (R2)
Als beheerder wil ik exacte definities, zodat een motie die niet is gestemd niet als verworpen telt.
- De definitie behandelt: gestemd en aangenomen, gestemd en verworpen, aangehouden, ingetrokken, en afgedaan zonder stemming
- Uit `datakwaliteit` (24 oktober 2026): de officiele conclusie in de bron (aangenomen of verworpen) is bij een handvol besluiten fout; bij 20 januari 2026 meldt de bron dat zelf. Leid de uitkomst af uit de stemmen, of toon deze uitzonderingen expliciet
- Doorlooptijd heeft een begin (indiening) en een eind (besluit), en wat er gebeurt als een motie geen besluit krijgt
- Niels heeft de definitie goedgekeurd

**E5-S2 Berekening** (R2)
Als bezoeker wil ik aantallen, aanname-percentage en doorlooptijd per partij en commissie.
- Voorberekende tabellen per partij en per commissie en per periode
- Een steekproef is met de hand nagerekend
- Moties zonder besluit staan apart, niet in het aanname-percentage

**E5-S3 Visuals en filters** (R2)
Als bezoeker wil ik trends over tijd en een vergelijking tussen partijen.
- Een tijdlijn per partij, een vergelijking tussen partijen, filter op periode en commissie
- Gekozen filters staan in de URL

**E5-S4 Lezingen** (R2)
Als bezoeker wil ik twee lezingen bij deze analyse (zie E4).

## Epic 6: Kamerleden (R3, afhankelijk van API-check)

**E6-S1 Beslissing over afwijkend stemgedrag** (R3)
Als beheerder wil ik op basis van de API-check beslissen of afwijkend stemgedrag in scope blijft.
- De beslissing en de onderliggende aantallen per jaar staan vastgelegd
- Is de dekking te klein, dan wordt de analyse beperkt tot de hoofdelijke stemmingen of laat Niels hem vallen
- Uitkomst handmatige API-check (23 oktober 2026): individuele stemmen bestaan vrijwel alleen bij hoofdelijke stemmingen. Over de hele dataset zijn dat 538 besluiten met `StemmingsSoort` 'Hoofdelijk' en 561 besluiten met een persoonsstem, tegen 63.719 met handopsteken
- Aantallen per jaar (API-checkrapport, 23 oktober 2026): 8 tot 75 besluiten met een persoonsstem per jaar, tegen 1.911 tot 4.749 besluiten met een stemming. Per Kamerlid per kabinet blijft dat vaak onder een drempel van 25
- Beslissing Niels (23 oktober 2026): afwijkend stemgedrag blijft in R3, alleen over de hele Kamerperiode en met het label "alleen hoofdelijke stemmingen"

**E6-S2 Berekening afwijkend stemgedrag** (R3)
Als bezoeker wil ik zien hoe vaak een Kamerlid afwijkt van zijn fractie, met erbij waarop dat gebaseerd is.
- Elke weergave toont het aantal onderliggende stemmingen en het label "alleen hoofdelijke stemmingen"
- De berekening is per Kamerlid over de hele Kamerperiode, niet per kabinet (besluit Niels, 23 oktober 2026)
- Onder een minimaal aantal stemmingen toont de site geen percentage (drempel: Niels bepaalt)

**E6-S3 Activiteitsprofiel** (R3)
Als bezoeker wil ik per Kamerlid moties, vragen en aanwezigheid zien.
- Definitie van activiteit is vastgelegd en goedgekeurd
- Kamerleden die van fractie wisselen of tussentijds vertrekken worden correct per periode getoond

**E6-S4 Kamerlidpagina** (R3)
Als bezoeker wil ik een deelbare pagina per Kamerlid.
- Alleen data die de analyses nodig hebben staat erop. Geen contactgegevens, geschenken, reizen, nevenfuncties of inkomsten
- Foto's alleen met een duidelijke licentie (nog uit te zoeken, zie open punten)

**E6-S5 Rankings van individuele Kamerleden** (R3, nog te beslissen)
Dit is een open punt in `01-idee.md`. Als het in scope blijft:
- Elke ranking staat op de methodiekpagina met definitie en minimale aantallen
- Een ranking toont nooit een persoon als laatste of eerste op te weinig data

**E6-S6 Lezingen** (R3)
Als bezoeker wil ik twee lezingen bij deze analyses (zie E4).

## Epic 7: Betrouwbaarheid en correctie (R1)

**E7-S1 Bronvermelding per cijfer** (MVP)
Als bezoeker wil ik zien waar een cijfer vandaan komt.
- Elk cijfer en elke grafiek heeft een bron en een datum van laatste verversing

**E7-S2 Foutmelding** (MVP)
Als betrokkene of bezoeker wil ik een fout kunnen melden.
- Er is een duidelijke route (adres of formulier, door Niels te kiezen) op de over-de-maker-pagina
- Een melding wordt binnen een door Niels te bepalen termijn beantwoord

**E7-S3 Wijzigingslog** (MVP)
Als bezoeker wil ik zien wat er gecorrigeerd is.
- Een publieke lijst met datum en beschrijving van elke inhoudelijke correctie

**E7-S4 Privacy en voorwaarden** (MVP)
Als bezoeker wil ik weten welke gegevens de site verwerkt.
- Een korte privacyverklaring beschrijft analytics en dat er geen accounts en geen opgeslagen opvattingen zijn
- De gebruiksvoorwaarden van de open data zijn gevonden en nageleefd (zie open punten)

**E7-S5 Datakwaliteitscontrole** (MVP)
Als beheerder wil ik afwijkingen tussen mijn cijfers en de officiele uitslagen kunnen vinden.
- Een geautomatiseerde controle toetst dat het totaal aantal zetels per stemming nooit boven 150 komt
- Een steekproef van besluiten (aantal: voorstel 10 per release) is vergeleken met de officiele stemmingsuitslagen en vastgelegd

## Epic 8: Later (niet in R1 tot en met R3)

**E8-S1 Engelse versie** (R4)
Als bezoeker wil ik de site in het Engels lezen.
- Pas als alle vier de analyses live zijn
- Vertaalde teksten, een taalkeuze in de URL en per pagina een verwijzing naar de andere taalversie
- Titels van moties en besluiten blijven Nederlands en dat staat erbij

**E8-S2 Lens-keuze** (Later)
Als bezoeker wil ik een invalshoek kiezen waarvan de duiding wordt benadrukt.
- De keuze blijft in de browser of in de URL, geen account en geen opslag op de server
- Alleen bouwen als blijkt dat bezoekers erom vragen (criterium nog vast te leggen)

**E8-S3 Nieuws en podcasts koppelen** (Later)
Als bezoeker wil ik bij een onderwerp relevante nieuwsartikelen of podcasts zien.
- Alleen titel, bron en link, geen tekst van de artikelen
- Elke koppeling is gecontroleerd voordat die zichtbaar wordt, tot de kwaliteit van automatische koppeling is aangetoond
- Een verkeerde koppeling is snel te verwijderen

**E8-S4 Eerste Kamer** (Later)
Als beheerder wil ik weten of er bruikbare data van de Eerste Kamer is, zodat ik kan beslissen of die erbij komt.
- Een gerichte controle van de beschikbare bronnen is vastgelegd: bestaat er een open data API, wat staat erin, welke voorwaarden gelden
- Het resultaat noemt of cohesie en afwijking mogelijk zijn, gegeven dat de Eerste Kamer vaker via de toerekenmethode stemt
- Scrapen van de website is alleen een optie na controle van de voorwaarden van de site

**E8-S5 Zelf meestemmen** (na R1, idee Niels, 26 oktober 2026)
Als bezoeker wil ik zelf op echte moties stemmen en zien welke fracties het vaakst net zo stemden.
- Kern: wetsvoorstellen en amendementen, waar echt iets verandert (voorkeur Niels, 26 oktober 2026). Moties nog open, bijvoorbeeld als schakelaar "ook moties". Eerst tellen hoeveel verdeelde stemmingen er per soort zijn; over een wetsvoorstel stemmen fracties vaak volgens het regeerakkoord
- Twee manieren om stemmingen te krijgen: een willekeurige trekking uit de verdeelde stemmingen, verspreid over de beleidsterreinen, met een knop voor andere; of de bezoeker kiest de terreinen die hem interesseren
- De trekking is uitgelegd op de methodiekpagina en herhaalbaar (dezelfde link geeft dezelfde moties)
- Per motie een korte, neutrale samenvatting, door Niels nagekeken, met een link naar de motie op tweedekamer.nl
- De uitkomst per fractie als telling ("8 van de 12 keer hetzelfde"), per kabinet; twee lezingen erbij, zoals overal
- Alles rekent in de browser: antwoorden worden niet opgeslagen of verstuurd (politieke opvattingen zijn bijzondere persoonsgegevens)
- Eerst een korte controle van vergelijkbare tools, om de eigen draai scherp te krijgen

## Controle (stap 7)

### Dekking

Alles in `01-idee.md` staat in een story:

| Uit `01-idee.md` | Story |
|---|---|
| Cohesie-matrix | E2 |
| Afwijkend stemgedrag | E6-S1, E6-S2 |
| Wetgevingsproces en aanname | E5 |
| Activiteitsprofiel en profielpagina | E6-S3, E6-S4 |
| Deelbare URL's | E2-S6, E3-S4, E6-S4 |
| Deelplaatjes | E3-S5 |
| Methodiekpagina en bronvermelding | E3-S3, E7-S1 |
| Twee lezingen, goedkeuring door Niels | E4 |
| Journalistieke stijl | E3-S2 |
| Engels pas na vier analyses | E8-S1 |
| Lens en nieuws/podcasts later | E8-S2, E8-S3 |
| 500 bezoekers per maand | E3-S6 |
| Data minimalisatie, geen accounts | E1-S3, E1-S6, E6-S4, E7-S4 |

Niet in `01-idee.md` maar nu wel in de stories: foutafhandeling en wijzigingslog (E7), lege staten (E3-S9), bewaking van de verversing (E1-S7), datakwaliteitscontrole (E7-S5), ontwerpsysteem (E3-S2).

### Scherpte

- De meeste acceptatiecriteria zijn aan te vinken. Waar een getal een voorstel is, staat dat erbij.
- Niet af te vinken zolang Niels niet besluit: de drempel voor "te weinig data" (E2-S2, E6-S2) en de reactietermijn op een fout (E7-S2).
- "Filter op onderwerp" kon ik niet scherp maken. Hoe een onderwerp uit de API volgt, is niet bekend. Het is uit R1 gehaald en hangt aan de API-check.

### Volgorde

- E1-S2 (API-check) gaat voor alles: de uitkomst kan E2, E5 en E6 wijzigen.
- E1-S3 gaat voor E1-S5, en E1-S5 voor E2-S2.
- E2-S1 (definitie) gaat voor E2-S2.
- E4-S1 kan parallel aan E2-S2, maar E4-S2 en E4-S3 wachten op de definitie en de berekening.
- E3-S2 (ontwerpsysteem) gaat voor E2-S3 (matrix) en E3-S1.
- E7-S4 (voorwaarden van de data) moet voor de eerste live-gang bekend zijn.

### Gaten die ik heb aangevuld

- Foutafhandeling bij onjuiste duiding: E7-S2 en E7-S3
- Lege staten: E3-S9
- Beheer: E1-S7 runbook
- Verwijderen van data: verwerken van verwijderde records uit de bron (E1-S4). Een verzoek van een Kamerlid om gegevens te verwijderen loopt via E7-S2. Of er een beleid voor komt is een open punt voor Niels.
- Onboarding: er zijn geen accounts, dus geen onboarding. Wel een leeswijzer (E2-S5).

### Open punten die in een story vastlopen

- Drempels voor "te weinig data" en reactietermijn bij fouten (Niels)
- Foto's van Kamerleden: licentie nog niet uitgezocht
- Gebruiksvoorwaarden van de open data: nog niet gevonden of vastgelegd. Dit is nodig voor R1.
- Beleid bij een verzoek van een Kamerlid om gegevens te verwijderen
