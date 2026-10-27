// De maten op de site, voor de methodiekpagina (E3-S3). Een nieuwe analyse voegt hier haar maat toe
// voordat ze live gaat; een test controleert dat elke maat compleet is.
// Bron van de tekst over cohesie: docs/plan/definitie-cohesie.md (goedgekeurd door Niels, 24 oktober 2026).
export type Maat = { id: string; naam: string; definitie: string; formule: string; keuzes: string[]; beperkingen: string[] };

export const MATEN: Maat[] = [
  {
    id: "cohesie",
    naam: "Cohesie: hoe vaak stemmen twee fracties hetzelfde?",
    definitie:
      "Cohesie is het percentage van de gezamenlijke stemmingen van twee fracties waarop ze hetzelfde stemden. Een gezamenlijke stemming is een besluit waarover beide fracties voor of tegen stemden. Nam een van de twee niet deel of was ze afwezig, dan telt de stemming niet mee. Bij een hoofdelijke stemming is de stem van de fractie wat de meerderheid van haar leden stemde.",
    formule:
      "het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen, maal 100. Bij minder dan 25 gezamenlijke stemmingen geen percentage, maar \"te weinig stemmingen\".",
    keuzes: [
      "We tellen per kabinet en per Kamerperiode. Een kabinet loopt tot het volgende is beëdigd: de demissionaire tijd telt mee bij het kabinet waar die uit voortkomt.",
      "Er zijn twee varianten: alle stemmingen, en alleen de stemmingen waarover de Kamer verdeeld was (minstens één fractie voor en één tegen). Per kabinet is 7 tot 17 procent van de stemmingen unaniem. De tweede variant laat die weg.",
      "Meldt een fractie zelf dat een stem een vergissing was, dan telt die stem niet mee. De bron zegt namelijk niet wat de fractie wel bedoelde.",
      "Is het bij een hoofdelijke stemming binnen de fractie gelijk op, dan is er geen fractiestem.",
      "Hamerstukken en besluiten zonder stemming tellen niet mee.",
    ],
    beperkingen: [
      "Cohesie telt stemmen, geen redenen. Twee fracties kunnen om heel verschillende redenen hetzelfde stemmen.",
      "Elk besluit telt even zwaar, of het nu gaat om een wet of om een procedurele motie.",
      "De volgorde van de fracties in de zaal komt uit de cijfers: fracties die vaak hetzelfde stemmen, zitten naast elkaar. Het is niet de echte zaalindeling en ook geen links-rechtsschaal.",
    ],
  },
  {
    id: "onderwerpen",
    naam: "Cohesie per beleidsterrein: waar zijn ze het over eens?",
    definitie:
      "Dezelfde cohesie als hierboven, maar dan per beleidsterrein. Elke stemming hoort via haar zaak bij een of meer Kamerstukdossiers, en elk dossier bij een van zeventien beleidsterreinen, zoals Zorg, Asiel en migratie of Digitalisering.",
    formule:
      "per terrein: het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen in dat terrein, maal 100. Onder 25 gezamenlijke stemmingen: \"te weinig stemmingen\". Per dossier en per stemming tellen we (\"3 van de 5 keer eens\"), zonder percentages.",
    keuzes: [
      "Het terrein van een dossier volgt eerst uit een trefwoord in de titel (bijvoorbeeld asiel, vreemdeling, huur, woning, cyber, kunstmatige intelligentie). Is er geen trefwoord, dan telt de vaste commissie die het vaakst voortouw had over de zaken in dat dossier. Zo vallen onderwerpen die van commissie wisselden, zoals asiel tot 2024, toch onder hun eigen terrein.",
      "Een stemming die bij meer dossiers hoort, telt bij elk terrein mee.",
      "Commissies krijgen per kabinet een andere naam. Een vaste koppeltabel zet elke commissie om in een terrein.",
      "In de koppen \"het vaakst eens bij\" en \"het minst bij\" tellen alleen terreinen met minstens 50 gezamenlijke stemmingen. Zo haalt een klein terrein niet de kop.",
    ],
    beperkingen: [
      "De indeling is een eigen keuze. Een dossier kan over meer onderwerpen gaan dan zijn titel of commissie laat zien.",
      "Ongeveer 1 procent van de stemmingen valt onder Overig: dossiers zonder vaste commissie en zonder trefwoord.",
      "Een trefwoord kan een enkel dossier verkeerd indelen. De lijst staat in de broncode en wordt nagekeken.",
    ],
  },
  {
    id: "coalitie",
    naam: "Coalitiebouwer: meegestemd en beslissend",
    definitie:
      "Voor een groep fracties die je zelf kiest, telt de coalitiebouwer de stemmingen waarop de groep eensgezind was: alle fracties in de groep stemden hetzelfde, allemaal voor of allemaal tegen. Van die stemmingen telt hij hoe vaak de kant van de groep won. En per andere fractie hoe vaak die meestemde en hoe vaak die beslissend was.",
    formule:
      "meegestemd: het aantal eensgezinde stemmingen waarop de fractie dezelfde kant koos als de groep, gedeeld door het aantal eensgezinde stemmingen, maal 100. Beslissend: het aantal stemmingen waarop de groep de meerderheid had, en zonder de zetels van die fractie niet meer. Onder 25 eensgezinde stemmingen: \"te weinig stemmingen\".",
    keuzes: [
      "Standaard tellen alleen verdeelde stemmingen (minstens een fractie voor en een tegen). Met een schakelaar kies je alle stemmingen (besluit 25 oktober 2026).",
      "De zetels zijn die van het moment van de stemming. Bij een hoofdelijke stemming tellen de leden die echt stemden: wie afwezig is, helpt geen meerderheid.",
      "De partners staan op volgorde: eerst beslissend, dan meegestemd.",
    ],
    beperkingen: [
      "Dit is terugkijken op echte stemmingen. Het is geen voorspelling en geen advies over een samenwerking.",
      "Elke stemming telt even zwaar, of het nu gaat om een wet of om een procedurele motie.",
      "Een fractie die vaak meestemt, deed dat niet per se om dezelfde reden als de groep.",
    ],
  },
  {
    id: "zetelwerk",
    naam: "Zetelwerk: ingediend, aangenomen en brede steun",
    definitie:
      "Zetelwerk is wat Kamerleden en fracties zelf op tafel leggen: moties (een verzoek aan het kabinet), amendementen (een wijziging van een wet) en initiatiefwetten (een wetsvoorstel dat Kamerleden zelf schrijven). We tellen wie een stuk indiende, of het werd aangenomen, en met wiens steun. De drie soorten tellen we altijd apart.",
    formule:
      "ingediend: het aantal stukken met het Kamerlid of de fractie als indiener. Aangenomen: de uitslag die de Kamer vaststelde; noemt de bron geen uitslag, dan meer zetels voor dan tegen. Brede steun: aangenomen met stemmen voor van minstens een kabinets- en een oppositiefractie die zelf geen indiener of medeindiener was. Onder 10 ingediende stukken geen percentage.",
    keuzes: [
      "De uitslag is die van de Kamer, want die is formeel besloten. Bij 8 besluiten sinds 2010 past die niet bij de stemmen in de bron: twee keer een telfout die achteraf werd gemeld, waarna de uitslag volgens het Reglement van Orde bleef staan (2014Z08729 en 2026Z00559); drie keer stemmen die een dag later zijn gecorrigeerd terwijl de uitslag bleef staan (2022Z24291, 2023Z09118, 2023Z17815); twee besluiten over een grondwetswijziging, waar twee derde nodig is (2021Z02980); en een geval zonder verklaring in de bron (2026Z20415). De grondwetswijziging is geen zetelwerk; de zes moties tellen met de uitslag van de Kamer.",
      "Noemt de bron geen uitslag, dan tellen de stemmen: bij handopsteken de fractiegrootte, bij een hoofdelijke stemming het aantal leden dat voor of tegen stemde.",
      "Is er vaker over een stuk gestemd, dan telt de laatste stemming. Op dezelfde dag gaat de stemming over het stuk zelf voor op een procedurele stemming, zoals over ontoelaatbaar verklaren of uitstel.",
      "Kabinet of oppositie op de dag van de stemming. Gedoogsteun telt als kabinet.",
      "Een stuk met meer indieners telt voor elk van hen volledig. Medeindieners tellen apart, als mede ingediend.",
      "Tegenstemmen per fractie: het aandeel van alle stemmingen in de periode waarop de fractie tegen stemde.",
      "Initiatiefwetten: alleen wetsvoorstellen met een Kamerlid als indiener (in de bron \"Initiatiefwetgeving\"); wetten van de regering tellen niet mee. De uitslag is de eindstemming in de Tweede Kamer, niet die in de Eerste Kamer. Omdat het er per Kamerlid weinig zijn, staat de ranglijst op het aantal aangenomen wetten, zonder percentage.",
    ],
    beperkingen: [
      "Een aangenomen motie is een verzoek aan het kabinet. Of het ook gebeurt, staat niet in de data.",
      "Kabinet en oppositie hebben een andere rol. Wensen van kabinetspartijen staan vaak in het regeerakkoord, dus zij dienen minder in. Vergelijk binnen de eigen kant.",
      "Elk stuk telt even zwaar, of het nu een kleine procedurele motie is of een amendement dat een wet verandert.",
      "Een initiatiefwet die geen meerderheid lijkt te halen, wordt soms ingetrokken voor de stemming. Die telt niet mee, dus bijna alle getelde initiatiefwetten zijn aangenomen.",
    ],
  },
  {
    id: "doorlooptijd",
    naam: "Doorlooptijd: hoe lang duurt een wet?",
    definitie:
      "De doorlooptijd van een wetsvoorstel is de tijd van de indiening tot het besluit in de Tweede Kamer: een stemming, of een hamerstuk (aangenomen zonder stemming). Te zien op Uitgelicht, bij Hoe lang duurt een wet?",
    formule:
      "dagen tussen de datum van indiening (Zaak.GestartOp) en de vergaderdatum van het laatste besluit over het wetsvoorstel. De mediaan: de helft van de wetsvoorstellen duurde korter, de helft langer.",
    keuzes: [
      "Alleen wetsvoorstellen die tot en met 2022 zijn ingediend: latere hebben nog niet de tijd gehad, en meetellen zou de doorlooptijd te kort maken.",
      "Een hamerstuk telt als besluit. Zonder hamerstukken zou het lijken alsof een derde van de wetten nog in behandeling is.",
      "Wetsvoorstellen zonder besluit (nog in behandeling, ingetrokken of vervallen) tellen apart, niet in de doorlooptijd.",
      "De haltes van een wet (advies van de Raad van State, vragen van de Kamer, antwoord, aanpassingen) komen uit de soorten documenten bij het wetsvoorstel. Bij een regeringswet komt het advies van de Raad van State voor de indiening; dat staat dan niet als aparte halte op de tijdas.",
    ],
    beperkingen: [
      "De Eerste Kamer komt na de Tweede Kamer en telt niet mee. Een wet is pas klaar na de Eerste Kamer en de bekendmaking.",
      "Een lange doorlooptijd zegt niet waarom: wachten op advies, een kabinetswissel of een bewuste pauze zien er in de data hetzelfde uit.",
    ],
  },
  {
    id: "ontraden",
    naam: "Tegen het advies in: ontraden en toch aangenomen",
    definitie:
      "Voor een stemming zegt het kabinet wat het van een motie vindt (in de bron: Kabinetsappreciatie). Een motie die het kabinet ontraadde en die de Kamer toch aannam, telt als ontraden en toch aangenomen. Te zien op Uitgelicht, bij Tegen het advies in.",
    formule:
      "het aantal moties met het oordeel ontraden en als uitslag van de laatste stemming aangenomen, gedeeld door alle aangenomen moties, maal 100. Per kabinet op de datum van indiening.",
    keuzes: [
      "Alleen moties die vanaf 1 april 2019 zijn ingediend: daarvoor staat het oordeel van het kabinet niet in de bron.",
      "Ontraden telt ook \"ontraden, tenzij gewijzigd\". Andere oordelen (overbodig, ontijdig, verzocht aan te houden, geen oordeel) staan apart.",
      "De uitslag is die van de laatste stemming; moties zonder stemming (aangehouden of ingetrokken) tellen niet mee.",
      "Kabinet of oppositie: de fractie van de indiener op de dag van indiening; gedoogsteun telt als kabinet.",
    ],
    beperkingen: [
      "Of een aangenomen motie is uitgevoerd, staat niet in de open data. Wel of er later een brief over kwam, maar een brief is geen uitvoering.",
      "Een kabinet kan een motie ontraden om de inhoud, maar ook om de timing of de kosten. Het oordeel zegt niet waarom.",
    ],
  },
];
