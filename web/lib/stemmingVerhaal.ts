// Graphic 2: een stemming uit elkaar gehaald (de motie-Eerdmans, hoofdelijk, 10 juni 2025). Staat sinds
// 25 oktober 2026 op /onderwerpen (besluit Niels). Vaste casus uit content/verhaal-stemming.json.
import stemming from "@/content/verhaal-stemming.json";
import { KORT, type Kleur, type Stap, type Stemming, blokken, dagMaandJaar, rond, stemZaal, tinten, zaalLabels } from "./verhaal";

export { stemming };

const naam = (f: string) => KORT[f] ?? f;
const lijstTekst = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} en ${l[l.length - 1]}`);

// Graphic 2: één stemming uit elkaar gehaald (vaste casus, zie content/verhaal-stemming.json)
export function stemVerhaal(smal: boolean): Stap[] {
  const st = stemming.stemmen as Stemming;
  const z = stemZaal(st);
  const tint = tinten([Object.fromEntries(z.map((p) => [p.fractie, z.filter((q) => q.fractie === p.fractie).length]))]);
  const los = blokken(z, false, smal), groep = blokken(z, true, smal);
  const voor = Object.values(st.Voor).reduce((a, b) => a + b, 0), tegen = Object.values(st.Tegen).reduce((a, b) => a + b, 0);
  const pvv = (st.Tegen.PVV ?? 0) + (st.Voor.PVV ?? 0) + (st["Niet deelgenomen"].PVV ?? 0);
  const kleurVoor = (): Kleur => null;
  const kaders = groep.kaders.map((k) => ({ ...k, tint: tint.get(k.fractie) }));
  const maak = (b: typeof los, kleur: (p: (typeof los.stippen)[number]) => Kleur) => b.stippen.map((p) => ({ key: p.key, x: rond(p.x), y: rond(p.y), kleur: kleur(p), tint: tint.get(p.fractie)! }));
  return [
    { datum: dagMaandJaar(stemming.datum), tekst: "Een week na de val van kabinet-Schoof stemt de Kamer over een motie van JA21: werk het asielplan van Wilders uit en voer het waar mogelijk uit.",
      stippen: z.map((p) => ({ key: p.key, x: rond(p.x), y: rond(p.y), kleur: null, tint: tint.get(p.fractie)! })), labels: zaalLabels(z, tint) },
    { datum: "de uitslag", tekst: `${voor} voor, ${tegen} tegen. De motie is verworpen.`, stippen: maak(los, kleurVoor), labels: los.labels },
    { datum: "per fractie", tekst: `Voor stemmen ${lijstTekst(Object.keys(st.Voor).filter((f) => st.Voor[f] > 1).map(naam))}. Tegen onder meer ${lijstTekst(Object.keys(st.Tegen).filter((f) => f !== "PVV" && st.Tegen[f] > 3).map(naam))}.`,
      stippen: maak(groep, kleurVoor), labels: groep.labels, kaders },
    { datum: "de PVV", tekst: `En de PVV: ${st.Tegen.PVV} van haar ${pvv} leden stemmen tegen het uitvoeren van het eigen plan. De andere ${pvv - st.Tegen.PVV} doen niet mee.`,
      stippen: maak(groep, (p) => (p.fractie === "PVV" ? "nadruk" : "zacht")), labels: groep.labels, kaders },
    // De tegenstem van dit Kamerlid staat in de bron als vergissing (Vergissing = true, gevonden 26 oktober 2026):
    // de stem telt mee in de uitslag, maar het Kamerlid wilde voor stemmen
    { datum: "één stem", tekst: "Eén VVD-Kamerlid stemt tegen, de rest van de fractie voor. Achteraf laat dit Kamerlid vastleggen dat het een vergissing was. De stem telt toch mee: een uitslag ligt vast. Bij een hoofdelijke stemming zie je zulke details, bij handopsteken telt de fractie als één stem.",
      stippen: maak(groep, (p) => (p.fractie === "VVD" && p.stem === "Tegen" ? "nadruk" : p.fractie === "VVD" ? null : "zacht")), labels: groep.labels, kaders },
  ];
}

