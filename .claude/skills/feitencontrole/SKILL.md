---
name: feitencontrole
description: Verplichte controle vóór een push naar Zetelen die code, data, analyses of teksten met getallen raakt, en vóór elke tekst die naar buiten gaat (persmail, social post, video). Twee onafhankelijke agents herrekenen en weerleggen elke nieuwe of gewijzigde feitelijke bewering; pas daarna een goedkeuring. Gebruik bij "push", "live zetten", "versturen", "klaarzetten voor pers of social".
---

# Feitencontrole

Waarom: Zetelen zegt iets over hoe Kamerleden en fracties stemmen. Een verkeerd getal, een verkeerde fractie of een
zin die een oordeel velt is bij zo'n site meteen een probleem. Lezen vangt dat niet; herrekenen wel. Daarom controleert
niet de sessie die het werk deed, maar twee agents die alleen de wijziging en de bron zien.

De poort `.githooks/pre-push` laat een push met code, data of tekst alleen door als
`.git/feitencontrole/<sha>.ok` bestaat voor de commit die gepusht wordt, en als de tests groen zijn. Pushes die alleen
`docs/` raken hebben geen goedkeuring nodig. Dat bestand schrijft alleen deze skill, aan het eind van stap 5.
**Nooit** het bestand met de hand of buiten deze stappen aanmaken, **nooit** `git push --no-verify`.

De repo is publiek: geen geheimen, geen namen van personen die niet al op tweedekamer.nl staan, en alles wat de
agents in de scratchpad zetten blijft daar en wordt aan het eind verwijderd.

## Bronnen voor het herrekenen

De agents herrekenen uit een bron buiten onze eigen code, nooit met onze eigen rekencode:

- De open API van de Tweede Kamer: `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0` (entiteiten en velden:
  `docs/plan/api-check-rapport.md`; kolomnamen niet raden).
- De detailpagina's op tweedekamer.nl voor uitslag en zetels per fractie (werkwijze: `docs/plan/controles-uitkomst-2026-10-27.md`).
  De site van de Kamer heeft storingen; probeer een pagina meermaals voordat je "niet na te gaan" meldt.
- Voor wat uit onze eigen database komt (cohesie, tellingen per periode): de vaste queries in `db/controles/`, die de
  sessie via `gh workflow run controlequery.yml -f bestand=<naam>.sql` draait. De uitkomst gaat als bestand naar de
  agent; de agent herrekent dezelfde getallen uit de OData-bron met een eigen script.
  Beperking: de bron en onze database komen allebei uit het systeem van de Kamer. De controle toont dat wij de bron goed
  overnemen en tellen, niet dat de bron zelf klopt.

## Stappen vóór een push

1. **Wijziging bepalen.** `git fetch origin` en dan `git log --oneline origin/main..HEAD` en
   `git diff origin/main...HEAD`. Leg de diff vast in een bestand in de scratchpad, bijvoorbeeld `diff.patch`, en
   controleer dat het bestand volledig is (`git diff --stat` telt evenveel bestanden); geef de agents anders het
   git-commando in plaats van het bestand.
   **Na een fixronde** (stap 5) is dit alleen de diff van de fix-commit(s) sinds de laatst gecontroleerde sha, plus
   de gegenereerde bestanden en tellingen die erdoor veranderen. Geef de agent de oude sha erbij.

2. **Deterministische checks.** Vanuit de root:
   - `cd web && npx vitest run` en `npm run controleer-build` (na een build);
   - `uv run --with-requirements pipeline/requirements.txt --with-requirements pipeline/requirements-dev.txt pytest pipeline -q`
     (de databasetests draaien alleen met `TEST_DATABASE_URL`; in CI draaien ze altijd, kijk daar na de push of eerst
     lokaal met een wegwerpdatabase);
   - bij gewijzigde analyses of migraties: de bijbehorende query in `db/controles/` en `pipeline/datakwaliteit`-controles
     (grens van 150 zetels, vergelijking van uitslagen met de bron).
   Faalt er iets: eerst oplossen. Een nieuw getal in een tekst op de site komt uit de data of heeft een bron in de tekst.

3. **Ronde 1: onafhankelijke controleur.** Start met de Agent-tool een `general-purpose`-agent. Geef hem ALLEEN:
   het pad naar de diff, het pad naar de repo (`~/zetelen-repo`), eventuele uitkomstbestanden van controle-queries en
   deze opdracht, niet je eigen redenering of conclusies:

   > Je controleert een wijziging aan Zetelen (een site over stemgedrag in de Tweede Kamer) vóór publicatie. Lees de
   > diff in <pad>. Maak een lijst van elke nieuwe of gewijzigde feitelijke bewering: getallen, percentages, datums,
   > fracties en hun zetels, welke fractie in welk kabinet zat, volgordes ("de eerste", "meest eens", "meer dan de
   > helft"), uitslagen van stemmingen, citaten, licenties, ook in code die tekst opbouwt en in data. Herreken elk
   > getal zelf uit de open API van de Tweede Kamer (https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0; velden in
   > docs/plan/api-check-rapport.md) of uit de detailpagina op tweedekamer.nl, met een eigen script in de scratchpad,
   > nooit de rekencode van de site overnemen. Ga beweringen die niet uit de Kamerdata komen (kabinetten, partijkoppeling,
   > verkiezingsdata) na bij een externe bron en geef de URL. Let op tegenspraak met andere pagina's van de site.
   > Controleer ook de neutraliteit: de site meet stemgedrag en geeft geen oordeel over partijen, geeft geen advies en
   > zegt niets over inhoudelijke aansluiting als dat niet gemeten is. Meld tekst die een oordeel velt of een
   > oorzaak suggereert die de data niet draagt. Verander niets in de repo. Maak geen kopie van de repo of van
   > node_modules; hulpbestanden alleen in een unieke map in de scratchpad, aan het eind verwijderen. Geef terug: aantal
   > gecontroleerde beweringen, en per probleem: plek, bewering, probleem, bewijs, ernst (fout, misleidend, tegenspraak,
   > neutraliteit, niet na te gaan, klein), voorstel. Meld alleen echte problemen, geen stijlsuggesties of optionele
   > verfijningen. Meld ook als de wijziging geen enkele feitelijke bewering bevat, met uitleg waarom.

4. **Ronde 2: weerlegger.** Start een tweede, nieuwe `general-purpose`-agent met de diff en de lijst vondsten van
   ronde 1 (alleen die lijst, niet jouw mening erover). Opdracht: probeer elke vondst te weerleggen door zelf te
   herrekenen of zelf een bron te zoeken; oordeel per vondst bevestigd, weerlegd of onzeker, met onderbouwing. Bevat
   ronde 1 geen vondsten, laat ronde 2 dan een steekproef van minstens vijf beweringen uit de diff zelf herrekenen,
   zodat "niets gevonden" ook gecontroleerd is.

5. **Besluit.**
   - Alleen een **bevestigde fout of misleidende bewering** blokkeert de push. Die oplossen, committen en de
     controle herhalen volgens stap 1 (alleen de fix-diff). Vindt de herhaling opnieuw een bevestigde fout of
     misleidende bewering, dan is dat een echt signaal: oplossen en weer herhalen. Vindt hij alleen kleine punten,
     dan gaat de push door.
   - **Onzekere, tegenspraak-, neutraliteits-, "niet na te gaan"- en "klein"-vondsten** blokkeren niet. Oplossen mag,
     maar hoeft niet: ze gaan als open punt in het .ok-bestand en als notitie in `Zetelen/Beoordelen` in de vault, met
     een veld `Feedback::` voor Niels. Een bewering die niet na te gaan is, staat op de site als onzeker gemarkeerd of
     is eruit. Een neutraliteitsvondst over een tekst die Niels zelf schreef, leg je aan hem voor in plaats van hem aan
     te passen.
   - Is er geen blokkerende vondst meer: schrijf de goedkeuring voor de commit die je gaat pushen:
     ```
     mkdir -p "$(git rev-parse --git-common-dir)/feitencontrole"
     cat > "$(git rev-parse --git-common-dir)/feitencontrole/$(git rev-parse HEAD).ok" <<OK
     datum: <vandaag>
     commits: <origin/main..HEAD, korte hashes>
     ronde 1: <n> beweringen gecontroleerd, <n> vondsten (bij een herhaling: alleen de fix-diff, sha <oud> tot <nieuw>)
     ronde 2: <n> bevestigd, <n> weerlegd, <n> onzeker (steekproef bij geen vondsten: <n>)
     opgelost: <wat er na ronde 2 veranderde, of "niets">
     open: <kleine punten, tegenspraak en onzekere vondsten die zijn blijven staan, of "niets">
     OK
     ```
   - Een wijziging zonder feitelijke inhoud (alleen opmaak, of code die geen tekst of getal verandert) mag sneller,
     maar alleen als de agent van ronde 1 dat zelf heeft vastgesteld en ronde 2 dat bevestigt. Schrijf dat in het
     .ok-bestand.

6. **Push.** `git push`. De poort draait de tests nog een keer. Meld Niels daarna de commitlink en in één zin wat de
   controle vond.

## Wat niet door deze controle gedekt is

Deze punten blijven bij Niels, omdat ze een oordeel zijn en geen herrekening:
- de handmatige tabellen van `core-model` (kabinetten, Kamerperiodes, partijkoppeling);
- de definitie van een analyse (bijvoorbeeld cohesie) en de lezingen bij de uitkomst;
- toon en naam van de site.

## Teksten die naar buiten gaan zonder push

Persmails, social posts, videoscripts en berichten aan derden gaan door dezelfde twee rondes voordat ze als concept
klaarstaan (Gmail-concept, notitie in de vault):
- De "diff" is dan de tekst zelf. Ronde 1 krijgt alleen de tekst en het pad naar de repo, ronde 2 alleen de tekst en
  de vondsten van ronde 1.
- Elk getal moet uit de data komen of in de tekst een bron hebben.
- Zet onder de tekst in de vault een notitie, bijvoorbeeld:
  `Feitencontrole 2026-11-04: 7 beweringen, 1 vondst, bevestigd en verbeterd; ronde 2 akkoord.`
  Bij een Gmail-concept staat die notitie in de vault-notitie die bij de mail hoort, niet in de mail zelf.
- Verstuurt Niels zelf: alleen na die notitie.
