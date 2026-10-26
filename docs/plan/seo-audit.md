# SEO-audit zetelen.nl

> **Verwerkt op 26 oktober 2026** (Claude, op verzoek van Niels; zijn keuzes: alle drie conceptpagina's indexeren bij de livegang, titels zoals voorgesteld, structured data met hem als maker, H1 in dezelfde stijl).
> - 1: de vaste noindex op onderwerpen, oppositie en kamerleden is eraf; de sitemap heeft nu ook de fractie- en uitgelicht-pagina's. Een test bewaakt dat geen pagina in `PAGINAS` zelf noindex zet.
> - 2: elke pagina heeft een canonical naar het kale pad (getest), de detailpagina's naar hun eigen pad.
> - 3: gecontroleerd, de live sitemap gebruikte al zetelen.nl. Nu staat zetelen.nl in productie vast (`VERCEL_ENV`), en zetelen.vercel.app stuurt permanent door naar zetelen.nl.
> - 4: de vraag bovenaan verkenner, coalitie, fracties, oppositie en kamerleden is nu de H1 (`SectieKop niveau={1}`).
> - 5: WebSite met maker (layout), Dataset (/methodiek), Article (uitgelicht). Zonder licentie in de Dataset en zonder publicatiedatum in de Article: die gegevens hebben we niet.
> - 6, 7, 8: titels aangepast; de drie omleidingen staan permanent (308) in `next.config.ts` en de lege pagina's zijn weg; /ontwerpsysteem zonder dubbele naam.
> - 9: overgeslagen, zoals voorgesteld.


- **Datum:** 26 oktober 2026
- **Bron:** code in `Zetelen/zetelen`, commit `b586016`. De live site kon ik niet ophalen, omdat `LIVE = false` alles blokkeert.
- **Methode:** de checklist uit [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) (technisch, on-page, schema, E-E-A-T, GEO), met de hand toegepast. De plugin zelf is niet gedraaid.
- **Status:** alleen een rapport. Er is niets gewijzigd of gecommit.

Alle paden zijn relatief aan `web/`.

---

## Samenvatting

| # | Bevinding | Prioriteit | Moeite |
|---|---|---|---|
| 1 | Sitemap komt niet overeen met de noindex-vlaggen en mist de detailpagina's | Kritiek | Klein |
| 2 | Er staat nergens een canonical, terwijl vijf pagina's hun keuzes in de URL zetten | Kritiek | Klein |
| 3 | Het domein hangt af van een Vercel-variabele | Kritiek (eerst controleren) | Klein |
| 4 | Vijf pagina's hebben geen H1 | Belangrijk | Klein |
| 5 | Er is geen structured data | Belangrijk | Middel |
| 6 | De titels van de voorpagina en de fractiepagina's zeggen te weinig | Belangrijk | Klein |
| 7 | De omleidingen zijn tijdelijk (307) in plaats van permanent | Belangrijk | Klein |
| 8 | Op /ontwerpsysteem staat de sitenaam twee keer in de titel | Klein | Klein |
| 9 | llms.txt | Overslaan | - |

Waarom de site nu niet bereikbaar is voor crawlers: `lib/site.ts:11` zet `LIVE = false`. Dan geeft `app/robots.ts` een `Disallow: /` en zet `app/layout.tsx` op alle pagina's `noindex, nofollow`. Zo is het ook bedoeld tot de livegang (R1). Alles hieronder gaat over wat klaar moet zijn op het moment dat die vlag op `true` gaat.

---

## Kritiek bij livegang

### 1. Sitemap en noindex spreken elkaar tegen

**Wat ik zag**
- In `lib/site.ts:28` (`PAGINAS`) staan `/onderwerpen`, `/oppositie` en `/kamerleden`.
- Die drie pagina's hebben een vaste `robots: { index: false, follow: false }`, los van `LIVE`:
  - `app/onderwerpen/page.tsx:32`
  - `app/oppositie/page.tsx:19`
  - `app/kamerleden/page.tsx:26`
- De detailpagina's ontbreken in de sitemap: `/fracties/[fractie]` (één per fractie, uit `alleFracties()`) en `/uitgelicht/[casus]` (uit `UITGELICHT` in `lib/uitgelichtLijst.ts`).

**Waarom het telt.** Search Console meldt pagina's die in de sitemap staan maar op noindex staan als fout ("Submitted URL marked noindex"). En de pagina's met het meeste zoekpotentieel ("stemgedrag VVD", een bekende hoofdelijke stemming) staan juist niet in de sitemap. Google vindt ze dan alleen via interne links.

**Voorstel**
- Kies per conceptpagina of hij bij de livegang geïndexeerd mag worden. Leg dat vast in één vlag per pagina (zoals `KAMERLEDEN`), en laat zowel de `robots`-metadata als `PAGINAS` die vlag lezen. Dan kunnen ze niet meer uit elkaar lopen.
- Maak `sitemap.ts` async en voeg de detailpagina's toe:

```ts
// app/sitemap.ts (voorstel, niet doorgevoerd)
import type { MetadataRoute } from "next";
import { alleFracties, slug } from "@/lib/cohesie";
import { UITGELICHT } from "@/lib/uitgelichtLijst";
import { PAGINAS, siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (pad: string) => new URL(pad, siteUrl()).toString();
  const fracties = (await alleFracties()) ?? [];
  const uniek = [...new Set(fracties.map((f) => slug(f.afkorting)))];
  return [
    ...PAGINAS.map((pad) => ({ url: url(pad) })),
    ...uniek.map((s) => ({ url: url(`/fracties/${s}`) })),
    ...UITGELICHT.map((u) => ({ url: url(`/uitgelicht/${u.slug}`) })),
  ];
}
```

Controleer of `alleFracties()` per fractie meerdere rijen geeft (één per periode). Vandaar de `Set` in het voorstel. Breid de test in `tests/site.test.ts` uit, zodat een pagina met noindex nooit in de sitemap kan komen.

**Hoe je weet dat het werkt:** in Search Console, onder Pagina's, verschijnt geen melding "Ingediend, maar uitgesloten door noindex", en de fractiepagina's staan bij Geïndexeerd.

### 2. Er staat nergens een canonical

**Wat ik zag.** `alternates` of `canonical` komt nergens in `app/`, `components/` of `lib/` voor. Deze pagina's zetten hun keuzes in de URL via `searchParams`: `/verkenner`, `/coalitie`, `/fracties`, `/onderwerpen` en `/kamerleden`.

**Waarom het telt.** Elke combinatie van `?groep=`, `?periode=`, `?soort=` enzovoort is voor Google een aparte URL met bijna dezelfde inhoud. Zonder canonical kiest Google zelf welke versie telt, en het crawlbudget gaat naar varianten.

**Voorstel.** Zet per pagina een canonical naar het kale pad. In `generateMetadata` kun je de deelparameters houden voor de OG-afbeelding, zoals coalitie nu al doet, en toch een canonical naar het kale pad zetten.

```ts
// bijvoorbeeld app/verkenner/page.tsx
export const metadata: Metadata = {
  title: "Verkenner",
  description: "...",
  alternates: { canonical: "/verkenner" },
};
```

Zet geen canonical in `layout.tsx`. Dan zou elke pagina naar `/` wijzen.

Bewuste keuze om te maken: wil je dat bepaalde combinaties wel als eigen pagina indexeren (bijvoorbeeld de coalitiebouwer met een vaste groep)? Dan krijgt alleen die variant een eigen canonical.

### 3. Het domein hangt af van `VERCEL_PROJECT_PRODUCTION_URL`

**Wat ik zag.** `lib/site.ts:23` bouwt `siteUrl()` uit `process.env.VERCEL_PROJECT_PRODUCTION_URL`. Die URL voedt `metadataBase`, de sitemap, robots.txt en de OG-afbeeldingen.

**Waarom het telt.** Geeft die variabele `zetelen.vercel.app` terug in plaats van `zetelen.nl`, dan wijzen de sitemap, `og:image` en straks de canonicals naar het Vercel-domein. Google ziet dan twee hosts.

**Voorstel.** Controleer het eenmalig: open na een productiedeploy `/sitemap.xml` en kijk naar het domein. Robuuster is het om `https://zetelen.nl` vast te zetten voor productie (bijvoorbeeld via `VERCEL_ENV === "production"`) en de variabele alleen voor previews te gebruiken. Zet daarnaast in Vercel een redirect van `zetelen.vercel.app` naar `zetelen.nl`, of houd die host buiten de index.

---

## Belangrijk

### 4. Vijf pagina's hebben geen H1

**Wat ik zag.** `HeroKop` in `components/Typografie.tsx` is het enige onderdeel dat een `<h1>` maakt. Deze pagina's gebruiken hem niet en beginnen met `SectieKop` (h2) of `HoofdstukKop` (een div):

- `app/verkenner/page.tsx`
- `app/coalitie/page.tsx`
- `app/fracties/page.tsx`
- `app/oppositie/page.tsx`
- `app/kamerleden/page.tsx`

**Waarom het telt.** De H1 is voor zoekmachines en schermlezers het sterkste signaal waar een pagina over gaat. Het is ook een toegankelijkheidspunt.

**Voorstel.** Geef elke pagina precies één H1 die de vraag van de pagina noemt, bijvoorbeeld "Hoe vaak stemmen twee fracties hetzelfde?". Zie je liever geen grote kop in het ontwerp, maak dan een `h1`-variant met de stijl van `SectieKop`.

### 5. Er is geen structured data

**Wat ik zag.** Er staat nergens `application/ld+json`.

**Voorstel, per plek**

| Plek | Type | Waarom |
|---|---|---|
| `app/layout.tsx` | `WebSite` + `Person` (Niels Stol, `sameAs` naar GitHub) | Koppelt de site aan een herkenbare maker. Dat telt voor E-E-A-T. |
| `app/methodiek/page.tsx` | `Dataset` (naam, beschrijving, `creator`, `isBasedOn` = opendata.tweedekamer.nl, `license`, `temporalCoverage` "2010/..") | Maakt de site vindbaar in Google Dataset Search. Dat past goed bij een site die op open data draait. |
| `app/uitgelicht/[casus]/page.tsx` | `Article` (`headline`, `author`, `datePublished`, `dateModified`) | Zo staan datum en auteur bij de casussen, en die wegen zwaar bij politieke onderwerpen. |
| `app/fracties/[fractie]/page.tsx` | eventueel `BreadcrumbList` | Voor de kruimelpaden in de zoekresultaten. Lage prioriteit. |

Niet doen: `FAQPage`. Google toont daar sinds 7 mei 2026 geen rich results meer voor. `HowTo` is al langer vervallen.

Valideer na de livegang met de Rich Results Test en de Schema Markup Validator.

### 6. De titels zeggen te weinig

**Wat ik zag**
- `app/page.tsx` heeft geen eigen metadata, dus de voorpagina heet alleen "Zetelen".
- `app/fracties/[fractie]/page.tsx:33` zet de titel op `f.afkorting`, dus de titel wordt "VVD · Zetelen".

**Waarom het telt.** Op de titel weegt het onderwerp het zwaarst, en hij staat bovenaan in het zoekresultaat. "Zetelen" alleen zegt niets aan iemand die de site niet kent.

**Voorstel** (dit is mijn inschatting, ik heb geen zoekvolumes gecontroleerd):
- Voorpagina: `Zetelen: wie stemt met wie in de Tweede Kamer?`, met `title.absolute` zodat de template er niet nog eens achter komt.
- Fractiepagina: `Stemgedrag ${f.afkorting} in de Tweede Kamer`. De beschrijving is al goed.
- Uitgelicht-casus: de titel is al inhoudelijk. Houd hem onder ongeveer 60 tekens, want daarna wordt hij afgekapt.

Wil je onderbouwen welke woorden mensen echt gebruiken, kijk dan na de livegang in Search Console bij Zoekopdrachten.

### 7. De omleidingen zijn tijdelijk

**Wat ik zag.** Deze drie pagina's gebruiken `redirect()`, en dat geeft in een servercomponent een 307:

- `app/verhaal/page.tsx:5`
- `app/lezingen/page.tsx:6`
- `app/verhaal/stemming/page.tsx:5`

**Waarom het telt.** Een 307 zegt tegen Google "kom later terug". Bij pagina's die definitief zijn verhuisd hoort een permanente omleiding, zodat links en signalen naar het nieuwe adres gaan.

**Voorstel.** Vervang `redirect` door `permanentRedirect` (308) uit `next/navigation`. Of zet de drie omleidingen in `next.config.ts` onder `redirects()` met `permanent: true`. Dan kun je de lege pagina's verwijderen.

Let op bij `/verhaal/stemming`: het doel bevat een `#een-stemming`. Het deel na de `#` wordt bij een redirect wel meegestuurd naar de browser, maar Google negeert het.

---

## Klein

### 8. De sitenaam staat twee keer in de titel op /ontwerpsysteem

`app/ontwerpsysteem/page.tsx:7` zet `title: "Ontwerpsysteem · Zetelen"`, en de template in de layout voegt daar nog eens `· Zetelen` aan toe. Maak er `title: "Ontwerpsysteem"` van. De pagina staat op noindex, dus je ziet het alleen in het tabblad.

### 9. llms.txt: overslaan

Volgens de claude-seo-repo zelf negeert Google llms.txt en levert het bestand geen vermeldingen in AI-antwoorden op. Voor AI-zichtbaarheid gelden dezelfde dingen als voor gewone SEO: geïndexeerd zijn, duidelijke koppen en antwoorden die op zichzelf staan. Je robots-regel bij LIVE (`allow: /`) laat de AI-crawlers ook gewoon toe. Dat is in orde, tenzij je ze bewust wilt weren.

---

## Wat al sterk is

Politiek valt sinds de Quality Rater Guidelines van september 2025 onder YMYL. Google kijkt dan extra streng naar vertrouwen. De site heeft al wat daarbij telt:

- een maker met naam en een contactadres (`/over`)
- een methodiek met de formule en wat de cijfers niet zeggen (`/methodiek`)
- een wijzigingslog met datums (`/wijzigingen`)
- openbare broncode en een bron bij elke analyse (`Bronregel`)
- twee onderbouwde lezingen naast elkaar, wat neutraliteit laat zien
- analytics zonder cookies en een privacypagina
- `lang="nl"`, `og:locale nl_NL`, een eigen OG-afbeelding en deelplaatjes per pagina
- lettertypes via `next/font`, dus zonder verbinding met Google en zonder layout shift door laat ladende fonts

Houd dit zo. Voor GEO is /methodiek je beste pagina om in AI-antwoorden genoemd te worden: de definitie van cohesie staat daar al als tekst die op zichzelf staat.

---

## Niet gemeten, pas na de livegang

| Wat | Hoe |
|---|---|
| Core Web Vitals (LCP, INP, CLS) | PageSpeed Insights op de voorpagina, een fractiepagina en de coalitiebouwer (die zijn het zwaarst). Later de veldgegevens in Search Console. |
| Gerenderde HTML | In Search Console, URL-inspectie: staat de inhoud van de grafieken ook als tekst in de HTML, of pas na JavaScript? |
| Indexering | Sitemap indienen in Search Console. Na een week of twee het rapport Pagina's nalopen. |
| Backlinks | Pas zinvol na een paar maanden live. |

---

## Volgorde om te verwerken

1. Kies per conceptpagina (onderwerpen, oppositie, kamerleden): indexeren bij livegang, ja of nee.
2. Punt 3 controleren (domein), daarna punt 1 en 2 (sitemap, canonicals). Doe dit vóór je `LIVE` omzet.
3. Punt 4 en 7 (H1, omleidingen). Dat zijn kleine, losse wijzigingen.
4. Punt 6 (titels) en punt 5 (structured data).
5. `LIVE = true`, sitemap indienen, PageSpeed draaien.
