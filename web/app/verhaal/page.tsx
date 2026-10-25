// Verhaal (concept): de scroll graphics uit docs/ontwerp/scroll-graphics.md, op echte data.
// Bedoeld voor de voorpagina; staat hier apart tot Niels akkoord is. Niet in het menu en niet in de sitemap.
import type { Metadata } from "next";
import { Inhoud, LegeStaat } from "@/components/Kader";
import { Bronregel } from "@/components/cohesie/Bronregel";
import { Label, SectieKop, Tekst } from "@/components/Typografie";
import { ScrollVerhaal } from "@/components/verhaal/ScrollVerhaal";
import stemming from "@/content/verhaal-stemming.json";
import { leesApi } from "@/lib/api";
import {
  KORT, type Kleur, type Stap, type Stemming, type Verhaal, type ZaalStip,
  blokken, dagMaandJaar, maandJaar, rond, sleutels, stemZaal, zaal, zaalLabels,
} from "@/lib/verhaal";

export const metadata: Metadata = {
  title: "Verhaal",
  description: "Vier jaar Tweede Kamer in twee beelden: de zaal door de tijd en één stemming uit elkaar gehaald.",
  robots: { index: false, follow: false },
};

type FP = { periodesoort: string; periode: string; afkorting: string; zetels: number; zetels_begin: number; bij_begin: boolean; in_zaal: boolean; eerste_stemming: string };
type Co = { kabinet: string; afkorting: string; rol: string; tot: string | null };
type Ov = { periodesoort: string; periode: string; van: string; naar: string; leden: number };
type Per = { naam: string; begin: string };

const KABINETTEN = ["Rutte IV", "Schoof", "Jetten"];
const KAMER = "2025-";
const naam = (f: string) => KORT[f] ?? f;
const som = (z: Record<string, number>, fr: string[]) => fr.reduce((t, f) => t + (z[f] ?? 0), 0);
const lijstTekst = (l: string[]) => (l.length < 2 ? l.join("") : `${l.slice(0, -1).join(", ")} en ${l[l.length - 1]}`);

async function laad() {
  const lijst = KABINETTEN.map((k) => `"${k}"`).join(",");
  const [fp, co, ov, kab, kp] = await Promise.all([
    leesApi<FP[]>(`fractie_periode?select=periodesoort,periode,afkorting,zetels,zetels_begin,bij_begin,in_zaal,eerste_stemming&or=(and(periodesoort.eq.kabinet,periode.in.(${encodeURIComponent(lijst)})),and(periodesoort.eq.kamerperiode,periode.eq.${encodeURIComponent(KAMER)}))`),
    leesApi<Co[]>(`coalitie?select=kabinet,afkorting,rol,tot&kabinet=in.(${encodeURIComponent(lijst)})`),
    leesApi<Ov[]>(`overstap?select=periodesoort,periode,van,naar,leden&or=(and(periodesoort.eq.kabinet,periode.eq.Jetten),and(periodesoort.eq.kamerperiode,periode.eq.${encodeURIComponent(KAMER)}))`),
    leesApi<Per[]>("kabinet?select=naam,begin"),
    leesApi<Per[]>("kamerperiode?select=naam,begin"),
  ]);
  return fp && co && ov && kab && kp ? { fp, co, ov, kab, kp } : null;
}

// Graphic 1: de zaal door de tijd, van Rutte IV tot nu
function zaalVerhaal(d: NonNullable<Awaited<ReturnType<typeof laad>>>): Stap[] {
  const zetels = (soort: string, periode: string, begin: boolean) =>
    Object.fromEntries(d.fp.filter((r) => r.periodesoort === soort && r.periode === periode && (begin ? r.bij_begin : r.in_zaal))
      .map((r) => [r.afkorting, begin ? r.zetels_begin : r.zetels]));
  const beginVan = (k: string) => d.kab.find((x) => x.naam === k)?.begin ?? "";
  const kabinet = (k: string, op?: string) => d.co.filter((c) => c.kabinet === k && c.rol === "kabinet" && (!op || !c.tot || c.tot > op)).map((c) => c.afkorting);

  type Ruw = { datum: string; tekst: string; zetels: Record<string, number>; kleur: (f: string) => Kleur; groot?: string; klein?: string };
  const ruw: Ruw[] = [];
  const koper = (fr: string[]) => (f: string) => (fr.includes(f) ? "koper" : null);
  const kabinetStap = (k: string, z: Record<string, number>, intro: string) => {
    const fr = kabinet(k);
    const n = som(z, fr);
    ruw.push({ datum: maandJaar(beginVan(k)), tekst: `${intro} ${lijstTekst(fr.map(naam))}: samen ${n} van de 150 zetels${n < 76 ? ", een minderheid" : ""}.`,
      zetels: z, kleur: koper(fr), groot: String(n), klein: "zetels voor het kabinet" });
  };

  kabinetStap("Rutte IV", zetels("kabinet", "Rutte IV", true), "Kabinet-Rutte IV begint met");
  const schoof = zetels("kabinet", "Schoof", true);
  kabinetStap("Schoof", schoof, "Na de verkiezingen van 2023 begint kabinet-Schoof met");
  for (const c of d.co.filter((x) => x.kabinet === "Schoof" && x.tot).sort((a, b) => a.tot!.localeCompare(b.tot!))) {
    const fr = kabinet("Schoof", c.tot!);
    const n = som(schoof, fr);
    ruw.push({ datum: dagMaandJaar(c.tot!), tekst: `${naam(c.afkorting)} stapt uit het kabinet. Er blijven ${n} zetels over.`, zetels: schoof, kleur: koper(fr), groot: String(n), klein: "zetels voor het kabinet" });
  }
  const nieuweKamer = zetels("kamerperiode", KAMER, true);
  const grootste = Math.max(...Object.values(nieuweKamer));
  const kop = Object.keys(nieuweKamer).filter((f) => nieuweKamer[f] === grootste);
  ruw.push({ datum: maandJaar(d.kp.find((p) => p.naam === KAMER)?.begin ?? ""), tekst: `Een nieuwe Kamer na de verkiezingen. Grootste: ${lijstTekst(kop.map(naam))}, met ${grootste} zetels.`,
    zetels: nieuweKamer, kleur: (f) => (kop.includes(f) ? "goud" : null) });
  const jettenBegin = zetels("kabinet", "Jetten", true);
  for (const o of d.ov.filter((x) => x.periodesoort === "kamerperiode" && x.leden >= 2 && jettenBegin[x.naar] && !nieuweKamer[x.naar])) {
    const eerste = d.fp.find((r) => r.periodesoort === "kamerperiode" && r.afkorting === o.naar)?.eerste_stemming ?? "";
    ruw.push({ datum: maandJaar(eerste), tekst: `${o.leden} Kamerleden verlaten de ${naam(o.van)} en gaan verder als ${naam(o.naar)}.`,
      zetels: jettenBegin, kleur: (f) => (f === o.naar ? "goud" : f === o.van ? null : "zacht") });
  }
  kabinetStap("Jetten", jettenBegin, "Kabinet-Jetten begint met");
  const nu = zetels("kabinet", "Jetten", false);
  const fr = kabinet("Jetten");
  const n = som(nu, fr);
  const verder = d.ov.filter((o) => o.periodesoort === "kabinet" && !jettenBegin[o.naar] && nu[o.naar] && o.leden >= 0.8 * (jettenBegin[o.van] ?? 0))
    .map((o) => `${naam(o.van)} gaat verder als ${naam(o.naar)}.`);
  ruw.push({ datum: "nu", tekst: `${verder.join(" ")} ${n < 76 ? `Het kabinet zoekt per stemming ${76 - n} zetels of meer bij de oppositie.` : ""}`.trim(),
    zetels: nu, kleur: koper(fr), groot: String(n), klein: n < 76 ? "van de 76 voor een meerderheid" : "zetels voor het kabinet" });

  const zalen: ZaalStip[][] = ruw.map((r) => zaal(r.zetels));
  const keys = sleutels(zalen);
  return ruw.map((r, i) => ({
    datum: r.datum, tekst: r.tekst, groot: r.groot, klein: r.klein, labels: zaalLabels(zalen[i]),
    stippen: zalen[i].map((z, j) => ({ key: keys[i][j], x: rond(z.x), y: rond(z.y), kleur: r.kleur(z.fractie) })),
  }));
}

// Graphic 2: één stemming uit elkaar gehaald (vaste casus, zie content/verhaal-stemming.json)
function stemVerhaal(smal: boolean): Stap[] {
  const st = stemming.stemmen as Stemming;
  const z = stemZaal(st);
  const los = blokken(z, false, smal), groep = blokken(z, true, smal);
  const voor = Object.values(st.Voor).reduce((a, b) => a + b, 0), tegen = Object.values(st.Tegen).reduce((a, b) => a + b, 0);
  const pvv = (st.Tegen.PVV ?? 0) + (st.Voor.PVV ?? 0) + (st["Niet deelgenomen"].PVV ?? 0);
  const kleurVoor = (p: { stem: string }): Kleur => (p.stem === "Voor" ? "koper" : null);
  const maak = (b: typeof los, kleur: (p: (typeof los.stippen)[number]) => Kleur) => b.stippen.map((p) => ({ key: p.key, x: rond(p.x), y: rond(p.y), kleur: kleur(p) }));
  return [
    { datum: dagMaandJaar(stemming.datum), tekst: "Een week na de val van kabinet-Schoof stemt de Kamer over een motie van JA21: werk het asielplan van Wilders uit en voer het waar mogelijk uit.",
      stippen: z.map((p) => ({ key: p.key, x: rond(p.x), y: rond(p.y), kleur: null })), labels: zaalLabels(z) },
    { datum: "de uitslag", tekst: `${voor} voor, ${tegen} tegen. De motie is verworpen.`, stippen: maak(los, kleurVoor), labels: los.labels },
    { datum: "per fractie", tekst: `Voor stemmen ${lijstTekst(Object.keys(st.Voor).filter((f) => st.Voor[f] > 1).map(naam))}. Tegen onder meer ${lijstTekst(Object.keys(st.Tegen).filter((f) => f !== "PVV" && st.Tegen[f] > 3).map(naam))}.`,
      stippen: maak(groep, kleurVoor), labels: groep.labels },
    { datum: "de PVV", tekst: `En de PVV: ${st.Tegen.PVV} van haar ${pvv} leden stemmen tegen het uitvoeren van het eigen plan. De andere ${pvv - st.Tegen.PVV} doen niet mee.`,
      stippen: maak(groep, (p) => (p.fractie === "PVV" ? "goud" : "zacht")), labels: groep.labels },
    { datum: "één stem", tekst: "Eén VVD-Kamerlid stemt anders dan de rest van de fractie. Bij een hoofdelijke stemming is dat zichtbaar; bij handopsteken telt de fractie als één stem.",
      stippen: maak(groep, (p) => (p.fractie === "VVD" && p.stem === "Tegen" ? "goud" : p.fractie === "VVD" ? null : "zacht")), labels: groep.labels },
  ];
}

export default async function VerhaalPagina() {
  const d = await laad();
  if (!d) {
    return (
      <Inhoud>
        <LegeStaat label="Niet bereikbaar" titel="Het verhaal kon niet worden geladen" uitleg="Probeer het over een paar minuten opnieuw." />
      </Inhoud>
    );
  }
  const g1 = zaalVerhaal(d);
  const g1Verhaal: Verhaal = { breed: g1 };
  const g2Verhaal: Verhaal = { breed: stemVerhaal(false), smal: stemVerhaal(true) };
  return (
    <Inhoud>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--r-4)", maxWidth: 760 }}>
        <Label>Verhaal · concept</Label>
        <SectieKop>Vier jaar Kamer in twee beelden</SectieKop>
        <Tekst>Scroll rustig door. Een derde beeld, wie met wie stemt per onderwerp, volgt als de onderwerpen in de data zitten.</Tekst>
      </section>
      <section>
        <Label>1 · De zaal door de tijd</Label>
        <ScrollVerhaal verhaal={g1Verhaal} label="De zaal van de Tweede Kamer" />
      </section>
      <section>
        <Label>2 · Eén stemming uit elkaar gehaald</Label>
        <ScrollVerhaal verhaal={g2Verhaal} label="De stemming over de motie-Eerdmans" hoogteSmal={1080} />
      </section>
      <Bronregel toelichting={`Zetels bij het begin van elk kabinet en elke Kamerperiode, gemeten 30 dagen na de start. Stemming: ${stemming.zaak}, hoofdelijk, ${dagMaandJaar(stemming.datum)}.`} />
    </Inhoud>
  );
}
