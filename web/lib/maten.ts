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
      "Zetelwerk is wat Kamerleden en fracties zelf op tafel leggen: moties (een verzoek aan het kabinet) en amendementen (een wijziging van een wet). We tellen wie een stuk indiende, of het werd aangenomen, en met wiens steun. Moties en amendementen tellen we altijd apart.",
    formule:
      "ingediend: het aantal stukken met het Kamerlid of de fractie als indiener. Aangenomen: meer zetels voor dan tegen, geteld uit de stemmen. Brede steun: aangenomen met stemmen voor van minstens een kabinets- en een oppositiefractie die zelf geen indiener of medeindiener was. Onder 10 ingediende stukken geen percentage.",
    keuzes: [
      "De uitslag komt uit de stemmen, niet uit de tekst van het besluit: in een handvol gevallen spreekt de bron zichzelf tegen. Bij handopsteken telt de fractiegrootte, bij een hoofdelijke stemming het aantal leden dat voor of tegen stemde.",
      "Is er vaker over een stuk gestemd, dan telt de laatste stemming.",
      "Kabinet of oppositie op de dag van de stemming. Gedoogsteun telt als kabinet.",
      "Een stuk met meer indieners telt voor elk van hen volledig. Medeindieners tellen apart, als mede ingediend.",
      "Tegenstemmen per fractie: het aandeel van alle stemmingen in de periode waarop de fractie tegen stemde.",
    ],
    beperkingen: [
      "Een aangenomen motie is een verzoek aan het kabinet. Of het ook gebeurt, staat niet in de data.",
      "Kabinet en oppositie hebben een andere rol. Wensen van kabinetspartijen staan vaak in het regeerakkoord, dus zij dienen minder in. Vergelijk binnen de eigen kant.",
      "Elk stuk telt even zwaar, of het nu een kleine procedurele motie is of een amendement dat een wet verandert.",
    ],
  },
];
