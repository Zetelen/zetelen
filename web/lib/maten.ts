// De maten op de site, voor de methodiekpagina (E3-S3). Een nieuwe analyse voegt hier haar maat toe
// voordat ze live gaat; een test controleert dat elke maat compleet is.
// Bron van de tekst over cohesie: docs/plan/definitie-cohesie.md (goedgekeurd door Niels, 24 oktober 2026).
export type Maat = { id: string; naam: string; definitie: string; formule: string; keuzes: string[]; beperkingen: string[] };

export const MATEN: Maat[] = [
  {
    id: "cohesie",
    naam: "Cohesie tussen fracties",
    definitie:
      "Cohesie tussen twee fracties is het percentage van hun gezamenlijke stemmingen waarin ze hetzelfde stemden. Een gezamenlijke stemming is een besluit waarover beide fracties voor of tegen stemden; stemmingen waarbij een van de twee niet deelnam of afwezig was, tellen niet mee. Bij een hoofdelijke stemming telt als stem van de fractie wat de meerderheid van haar leden stemde.",
    formule:
      "het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen, maal 100. Bij minder dan 25 gezamenlijke stemmingen geen percentage maar \"te weinig data\".",
    keuzes: [
      "Per kabinet en per Kamerperiode. Een kabinet loopt tot het volgende is beëdigd: de demissionaire tijd telt mee bij het kabinet waar die uit voortkomt.",
      "Twee varianten: alle stemmingen, en alleen de stemmingen waarover de Kamer verdeeld was (minstens één fractie voor en één tegen). Veel stemmingen zijn unaniem; de tweede variant laat die weg.",
      "Een stem die de fractie zelf als vergissing heeft gemeld, telt niet mee: de bron zegt niet wat de fractie wel bedoelde.",
      "Bij een hoofdelijke stemming en een gelijke stand binnen de fractie is er geen fractiestem.",
      "Hamerstukken en besluiten zonder stemming tellen niet mee.",
    ],
    beperkingen: [
      "Cohesie telt stemmen, geen redenen. Twee fracties kunnen om heel verschillende redenen hetzelfde stemmen.",
      "Elk besluit telt even zwaar, of het nu gaat om een wet of om een procedurele motie.",
      "De volgorde van de fracties in de zaal komt uit de cijfers (fracties die vaak hetzelfde stemmen, zitten naast elkaar), niet uit de echte zaalindeling of een links-rechtsschaal.",
    ],
  },
  {
    id: "onderwerpen",
    naam: "Cohesie per beleidsterrein",
    definitie:
      "Dezelfde cohesie als hierboven, maar per beleidsterrein. Elke stemming hoort via haar zaak bij een of meer Kamerstukdossiers, en elk dossier bij een van zeventien beleidsterreinen, zoals Zorg, Asiel en migratie of Digitalisering.",
    formule:
      "per terrein: het aantal gezamenlijke stemmingen met dezelfde stem, gedeeld door het aantal gezamenlijke stemmingen in dat terrein, maal 100; onder 25 gezamenlijke stemmingen \"te weinig data\". Per dossier en per stemming: tellingen (\"3 van de 5 keer eens\"), geen percentages.",
    keuzes: [
      "Het terrein van een dossier volgt eerst uit een trefwoord in de titel (bijvoorbeeld asiel, vreemdeling, huur, woning, cyber, kunstmatige intelligentie), anders uit de vaste commissie die het vaakst voortouw had over de zaken in dat dossier. Zo vallen onderwerpen die van commissie wisselden, zoals asiel tot 2024, toch onder hun eigen terrein.",
      "Een stemming die bij meer dossiers hoort, telt bij elk terrein mee.",
      "Commissies krijgen per kabinet een andere naam; een vaste koppeltabel zet elke commissie om in een terrein.",
      "In de koppen \"het vaakst eens bij\" en \"het minst bij\" tellen alleen terreinen met minstens 50 gezamenlijke stemmingen, zodat een klein terrein niet de kop haalt.",
    ],
    beperkingen: [
      "De indeling is een eigen keuze. Een dossier kan over meer onderwerpen gaan dan zijn titel of commissie laat zien.",
      "Ongeveer 1 procent van de stemmingen valt onder Overig: dossiers zonder vaste commissie en zonder trefwoord.",
      "Trefwoorden kunnen een enkel dossier verkeerd indelen; de lijst staat in de broncode en wordt nagekeken.",
    ],
  },
  {
    id: "coalitie",
    naam: "Coalitiebouwer: meegestemd en beslissend",
    definitie:
      "Voor een zelf gekozen groep fracties telt de coalitiebouwer de stemmingen waarop de groep eensgezind was: elke fractie in de groep stemde voor of tegen, allemaal hetzelfde. Van die stemmingen telt hij hoe vaak de kant van de groep won, en per andere fractie hoe vaak die meestemde en hoe vaak die beslissend was.",
    formule:
      "meegestemd: het aantal eensgezinde stemmingen waarop de fractie dezelfde kant koos als de groep, gedeeld door het aantal eensgezinde stemmingen, maal 100. Beslissend: het aantal stemmingen waarop de groep de meerderheid had en zonder de zetels van die fractie niet meer. Onder 25 eensgezinde stemmingen \"te weinig data\".",
    keuzes: [
      "Standaard alleen verdeelde stemmingen (minstens een fractie voor en een tegen), met een schakelaar naar alle stemmingen (besluit 25 oktober 2026).",
      "Zetels zijn die van het moment van de stemming. Bij een hoofdelijke stemming tellen de leden die echt stemden; afwezigen helpen geen meerderheid.",
      "De partners staan op volgorde van eerst beslissend, dan meegestemd.",
    ],
    beperkingen: [
      "Dit is terugkijken op echte stemmingen, geen voorspelling of advies over een samenwerking.",
      "Elke stemming telt even zwaar, of het nu gaat om een wet of om een procedurele motie.",
      "Een fractie die vaak meestemt, deed dat niet per se om dezelfde reden als de groep.",
    ],
  },
];
