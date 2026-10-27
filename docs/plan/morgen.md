# Dagplan voor Niels: dinsdag 27 oktober 2026

Alles wat op jou wacht, in een volgorde die werkt, met de tijd erbij. Samen ongeveer **4 tot 5 uur**; verdeel het gerust. De volledige lijst blijft [te-beoordelen.md](te-beoordelen.md); dit is de route erdoorheen.

**Zo geef je het door:** in de chat, met de code. Bijvoorbeeld "C4: A", "C1: klopt", "K10: 3 en 17 anders, zie opmerking". Ik verwerk het en vink het af.

## Ochtend: wat de livegang ophoudt (ongeveer 2 uur)

| ☐ | Code | Wat | Tijd | Waar |
|---|---|---|---|---|
| ☑ | C4 | Kies A of B voor de 8 afwijkende uitslagen (advies A) | 10 min | [controles-stappenplan.md](controles-stappenplan.md#-c4-afwijkende-uitslagen-kies-a-of-b-tien-minuten) |
| ☐ | C1 tot en met C3 | Claude heeft alle 38 zaken vergeleken met tweedekamer.nl: alles klopt. Jij opent er drie als steekproef (C1 rij 6, C2 rij 8, C3 rij 16) | 10 min | [controles-uitkomst-2026-10-27.md](controles-uitkomst-2026-10-27.md) |
| ☐ | C5 | Handmatige tabellen nalopen (kabinetten, terreinen, trefwoorden) | 30 tot 45 min | idem, C5 |
| ☐ | C6 | Test van de bewaking (Terminal en healthchecks.io), als laatste: je wacht op mails | 15 min | idem, C6 |

## Middag: kijken en lezen (ongeveer 2 uur)

| ☐ | Code | Wat | Tijd | Waar |
|---|---|---|---|---|
| ☐ | K10 | De 25 stellingen van Stemgenoten nakijken; begin bij de 8 met "nakijken" | 45 min | [stemgenoten-controle.md](stemgenoten-controle.md), en probeer zelf https://zetelen.nl/stemgenoten |
| ☐ | K1, K2, K3, K5 | Onderwerpen, Oppositiewerk, voorpagina en Kamerleden opnieuw bekijken; ook op je telefoon | 40 min | [te-beoordelen.md](te-beoordelen.md#-k1-k2-k3-k5-opnieuw-bekijken-na-de-aanpassingen) |
| ☐ | K7, K9 | Uitgelicht: de omschrijvingen, de nieuwe beelden per stemming, Hoe lang duurt een wet? en Tegen het advies in | 30 min | https://zetelen.nl/uitgelicht |

## Tussendoor of later (geen haast)

| ☐ | Code | Wat | Tijd |
|---|---|---|---|
| ☐ | S4 | Twee meelezers voor Stemgenoten vragen (iemand die politiek anders denkt dan jij), en "Stemgenoten" opzoeken op https://www.boip.int | 15 min plus hun tijd |
| ☐ | S5 | Claude API-sleutel met een maandlimiet (pas nodig voor de pipeline, na je feedbackrondes) | 10 min |

### S5. Claude API-sleutel (stappen)

1. Ga naar https://console.anthropic.com en log in (of maak een account).
2. **Settings, Limits:** zet een maandlimiet van 5 euro (in dollars ongeveer 5 dollar). Dat is ruim genoeg voor één video per week.
3. **API keys, Create key:** naam `zetelen-pipeline`. Kopieer de sleutel; je ziet hem maar één keer.
4. Zet hem niet in de chat en niet in de repo. Zet hem als geheim in GitHub:

```bash
gh secret set ANTHROPIC_API_KEY --repo Zetelen/zetelen
```

   Terminal vraagt dan om de waarde; plak de sleutel en druk op Enter.

**Gaat het mis?** Zegt Terminal dat je geen rechten hebt, controleer dan of je bent ingelogd met `gh auth status`. Ben je de sleutel kwijt voordat je hem had opgeslagen, maak dan een nieuwe en verwijder de oude in de Console.

## Wat ik ondertussen doe (geen actie van jou)

- B18 is gebouwd: https://zetelen.nl/uitgelicht/tegen-het-advies-in (bekijken bij K9).
- Gedaan: de scroll graphics op de telefoon zijn groter (eigen uitsnede per stap, voor en tegen naast elkaar, leesbare letters); bekijk ze bij K1 en K7 op je telefoon.
- Gedaan: toegankelijkheidscontrole (Lighthouse, mobiel): 100 op de voorpagina, Oppositiewerk, Kamerleden en Stemgenoten; op Onderwerpen en Hoe lang duurt een wet? was het contrast van niet-actieve tekstkaarten te laag, dat is verhoogd. Prestaties: van 87 naar 92 (voorpagina) en 91 (Oppositiewerk) op mobiel, door een ongebruikt cursief lettertype weg te laten. Een besluit over verder (B20) staat in de lijst. Scroll graphics op de telefoon gecontroleerd op elke pagina.
- De methodiekpagina is bijgewerkt (initiatiefwetten, doorlooptijd, ontraden); Stemgenoten komt erbij als het live gaat.
- Na jouw antwoorden: C4 verwerken, labels concept eraf waar je K-punten goedkeurt.
