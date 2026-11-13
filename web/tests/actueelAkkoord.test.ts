// Tests voor het Actueel-stuk "akkoord-belastingplan" (lib/actueel.ts): elke zin moet kloppen met de vastgelegde cijfers
// uit pipeline/akkoord_belastingplan.py. Blok 1 (de uitslag van 12 november) staat nog niet in de data; de zinnen
// daarvan worden getest met twee verzonnen uitslagen, een waarin de VVD voor het belastingplan stemt en een waarin
// ze tegen stemt. Die testuitslagen zijn geen voorspelling.
import { describe, expect, it } from "vitest";
import data from "../content/actueel/akkoord-belastingplan.json";
import {
  type AkkoordData, type Fractiestem, type UitslagStemming, AKKOORD_BELASTINGPLAN, STUKKEN, akkoordBelastingplan, aantal, buitenVan,
  datumTekst, ekSom, hogerDanPartner, procent, schoonActueel, tkSom, verschuiving,
} from "../lib/actueel";
import { deellinkVan, doelVan } from "../lib/deel";

const d = data as unknown as AkkoordData;
const zonder = akkoordBelastingplan({ ...d, uitslag: null });

// Een testuitslag: per fractie een stem, zetels uit de zaal
function stemming(rol: UitslagStemming["rol"], zaak: string, voor: string[]): UitslagStemming {
  const fracties: Fractiestem[] = Object.entries(d.kamers.tk.zetels)
    .map(([afkorting, zetels]) => ({ afkorting, zetels, stem: voor.includes(afkorting) ? "Voor" as const : "Tegen" as const, kabinet: d.tegen.includes(afkorting) }))
    .sort((a, b) => b.zetels - a.zetels || a.afkorting.localeCompare(b.afkorting));
  const v = fracties.filter((f) => f.stem === "Voor").reduce((n, f) => n + f.zetels, 0);
  return { rol, zaak, datum: "2026-11-12", uitslag: v > 75 ? "Aangenomen." : "Verworpen.", aangenomen: v > 75, hoofdelijk: false, voor: v, tegen: 150 - v, fracties };
}
const LINKS = ["D66", "CDA", "PRO", "Volt", "SP", "PvdD", "DENK", "ChristenUnie", "50PLUS"];
const metUitslag = (wetVoor: string[]) => akkoordBelastingplan({
  ...d, uitslag: { bron: "open data van de Tweede Kamer (OData)", opgehaald: "2026-11-12",
    stemmingen: [stemming("amendement", "2026Z99901", LINKS), stemming("wet", "2026Z99902", wetVoor)] },
});
const vvdVoor = metUitslag([...LINKS, "VVD"]);
const vvdTegen = metUitslag(LINKS);

const tekstVan = (s: typeof zonder) => [s.kop, s.beschrijving, s.ziet, s.opvalt, s.aanleiding, ...s.blokken.flatMap((b) => [b.vraag, b.kop, ...b.tekst, b.data]),
  s.lezingen!.links.titel, s.lezingen!.links.tekst, s.lezingen!.rechts.titel, s.lezingen!.rechts.tekst, s.slot].join("\n");
const blok = (s: typeof zonder, id: string) => s.blokken.find((b) => b.id === id)!;

describe("Actueel: akkoord over het belastingplan", () => {
  it("staat pas op de site als de uitslag in de data staat", () => {
    expect(STUKKEN.some((s) => s.slug === "akkoord-belastingplan")).toBe(d.uitslag !== null);
    expect(zonder.blokken.map((b) => b.id)).toEqual(["plannen", "partners", "buiten", "kamers", "toen"]);
    expect(akkoordBelastingplan({ ...d, uitslag: null, plannen: null }).blokken.map((b) => b.id)).toEqual(["partners", "buiten", "kamers", "toen"]);
    expect(vvdVoor.blokken.map((b) => b.id)).toEqual(["uitslag", "plannen", "partners", "buiten", "kamers", "toen"]);
    expect(AKKOORD_BELASTINGPLAN.blokken[0].id).toBe(d.uitslag ? "uitslag" : "plannen");
  });

  it("heeft de goedgekeurde kop en label, en Volt niet in de kop", () => {
    expect(zonder.kop).toBe("Een akkoord zonder de VVD en het krapste Belastingplan sinds 2008");
    expect(akkoordBelastingplan({ ...d, plannen: null }).kop).toBe("Een akkoord zonder de VVD over het Belastingplan 2027");
    expect(zonder.label).toBe("Actueel · Belastingplan 2027");
    expect(zonder.kop).not.toContain("Volt");
    for (const b of vvdVoor.blokken) expect(b.kop.startsWith("Volt")).toBe(false);
  });

  it("noemt in de aanleiding het amendement, de voorwaarde en de bron", () => {
    expect(zonder.aanleiding).toContain("over één amendement op het Belastingplan 2027");
    expect(zonder.aanleiding).not.toContain("Wordt het amendement aangenomen");  // staat niet in de genoemde bronnen (feitencontrole 13 november)
    expect(zonder.aanleiding).toContain("(NOS, 11 november 2026: nos.nl/artikel/2639001 en nos.nl/liveblog/2639007)");
    expect(zonder.aanleiding).toContain("De Tweede Kamer stemde op 12 november 2026 over het belastingplan; hoe elke fractie stemde, staat nog niet in de open data.");
    expect(akkoordBelastingplan({ ...d, uitslag: null, plannen: null }).aanleiding).toContain("De Tweede Kamer moet er nog over stemmen.");
    expect(vvdVoor.aanleiding).toContain("De Tweede Kamer stemde op 12 november 2026 over beide.");
  });

  it("blok 2: de drie paren met hun partner, het laagste paar in het kabinet, en wie hoger zit", () => {
    const b = blok(zonder, "partners");
    const p = Object.fromEntries(d.partners.paren.map((x) => [x.kabinetspartij, x]));
    expect([p.D66.partner, p.CDA.partner, p.VVD.partner]).toEqual(["PRO", "SGP", "JA21"]);
    expect(b.kop).toBe(`D66 en PRO kozen in ${procent(p.D66.cohesie)} van de stemmingen dezelfde kant, ongeveer zo vaak als CDA en SGP (${procent(p.CDA.cohesie)}) en VVD en JA21 (${procent(p.VVD.cohesie)})`);
    // "ongeveer zo vaak": de drie liggen binnen 2 procentpunt
    const w = d.partners.paren.map((x) => x.cohesie);
    expect(Math.max(...w) - Math.min(...w)).toBeLessThan(2);
    // Het laagste paar binnen het kabinet is D66 en VVD, en hoger dan elk oppositiepaar
    const laagste = d.partners.binnen[0];
    expect([laagste.a, laagste.b].sort()).toEqual(["D66", "VVD"]);
    expect(laagste.cohesie).toBeGreaterThan(Math.max(...w));
    expect(b.tekst[0]).toContain(`het laagste paar, ${laagste.a} en ${laagste.b}, koos in ${procent(laagste.cohesie)} dezelfde kant`);
    // Wie vaker met een kabinetspartij stemde dan haar partner, staat erbij
    for (const c of d.tegen) for (const x of hogerDanPartner(d, c)) expect(b.tekst[1]).toContain(x.afkorting);
    expect(b.tekst[1]).toContain("ChristenUnie met alle drie de kabinetspartijen");
    expect(b.tekst[1]).toContain(`SGP met de VVD (${procent(d.partners.perKabinetspartij.VVD.find((x) => x.afkorting === "SGP")!.cohesie)})`);
    // De maat van het eerdere stuk: PRO en JA21 gaan even vaak mee
    const m = (a: string) => d.partners.meegaan.fracties.find((f) => f.afkorting === a)!;
    expect(b.tekst[2]).toContain(`ging PRO in ${procent(m("PRO").pct)} mee en JA21 in ${procent(m("JA21").pct)}`);
    expect(b.tekst[2]).toContain(`(${aantal(d.partners.meegaan.basis)} keer)`);
  });

  it("blok 3: alleen staan per kabinet, per partij onder Jetten, en het precedent bij het belastingplan", () => {
    const b = blok(zonder, "buiten");
    const j = buitenVan(d, "Jetten"), r3 = buitenVan(d, "Rutte III");
    expect(b.kop).toBe(`Onder Jetten stond een kabinetspartij in ${procent(j.pct)} van de stemmingen alleen, ongeveer zoals onder Rutte III (${procent(r3.pct)})`);
    expect(Math.abs(j.pct - r3.pct)).toBeLessThan(1);
    // Aandeel = keer gedeeld door verdeelde stemmingen, en keer is de som over de partijen
    for (const k of d.buiten.kabinetten) {
      expect(k.keer).toBe(k.partijen.reduce((n, p) => n + p.keer, 0));
      expect(Math.round((1000 * k.keer) / k.verdeeld) / 10).toBe(k.pct);
    }
    const p = (a: string) => j.partijen.find((x) => x.afkorting === a)!;
    expect(b.tekst[0]).toContain(`VVD ${aantal(p("VVD").keer)} keer alleen tegenover D66 en CDA (${procent(p("VVD").pct)})`);
    expect(b.tekst[0]).toContain(`D66 stond ${aantal(p("D66").keer)} keer alleen tegenover VVD en CDA (${procent(p("D66").pct)})`);
    expect(b.tekst[0]).toContain(`Rutte IV ${procent(buitenVan(d, "Rutte IV").pct)}`);
    expect(b.tekst[0]).toContain(`Rutte I (met gedoogpartner PVV) ${procent(buitenVan(d, "Rutte I").pct)}`);
    // Het precedent is nagekeken tegen de OData API van de Tweede Kamer (11 november 2026)
    const pr = d.buiten.precedent;
    expect([pr.zaak, pr.datum, pr.kabinet, pr.buiten]).toEqual(["2018Z21124", "2018-11-15", "Rutte III", "VVD"]);
    expect(d.buiten.belastingplan.some((g) => g.zaak === pr.zaak)).toBe(true);
    expect(b.tekst[1]).toContain(`Op 15 november 2018 nam de Kamer onder Rutte III een amendement over de differentiatie van de OZB-tarieven aan met de andere coalitiepartijen CDA, ChristenUnie en D66 voor en de VVD tegen`);
    expect(b.tekst[1]).toContain(`${d.buiten.belastingplan.length} keer een amendement op een belastingplan aangenomen`);
    expect(b.data).toContain("Rutte II had twee partijen");
  });

  it("blok 4: zetels in beide Kamers en de hechtste meerderheid zonder elke kabinetspartij", () => {
    const b = blok(zonder, "kamers");
    const vier = d.kamers.vier;
    expect(vier).toEqual(["D66", "CDA", "PRO", "Volt"]);
    expect(tkSom(d, vier)).toBe(65);
    expect(ekSom(d, vier)).toBe(29);
    expect(ekSom(d, [...vier, "VVD"])).toBe(d.kamers.ek.meerderheid);
    expect(d.kamers.ek.meerderheid).toBe(38);
    expect(Object.values(d.kamers.ek.zetels).reduce((a, x) => a + x, 0) + d.kamers.ek.eenmansfracties).toBe(d.kamers.ek.totaal);
    expect(Object.values(d.kamers.tk.zetels).reduce((a, x) => a + x, 0)).toBe(150);
    expect(b.kop).toBe("In de Eerste Kamer hebben D66, CDA, PRO en Volt 29 van de 75 zetels, 9 minder dan een meerderheid");
    expect(b.tekst[0]).toContain(`de vier ${tkSom(d, vier)} zetels, ${d.kamers.tk.meerderheid - tkSom(d, vier)} te weinig voor een meerderheid; met de VVD erbij ${tkSom(d, [...vier, "VVD"])}`);
    expect(b.tekst[1]).toContain(`met de VVD (9) komen ze op 38, met BBB (11) op ${ekSom(d, [...vier, "BBB"])}, en met een combinatie van kleinere fracties kan het ook`);
    expect(b.tekst[1]).toContain("Zetelen heeft geen stemmingen van de Eerste Kamer");
    const r = Object.fromEntries(d.kamers.routes.map((x) => [x.zonder, x]));
    for (const x of d.kamers.routes) {
      expect(x.tk).toBeGreaterThanOrEqual(d.kamers.tk.meerderheid);
      expect(x.start).not.toContain(x.zonder);
      expect(x.extra).not.toContain(x.zonder);
      expect(tkSom(d, [...x.start, ...x.extra])).toBe(x.tk);
      // minimaal: geen extra fractie kan gemist worden
      for (const a of x.extra) expect(x.tk - d.kamers.tk.zetels[a]).toBeLessThan(d.kamers.tk.meerderheid);
      expect(x.pct!).toBeLessThan(d.kamers.kabinet.pct!);
    }
    expect(b.tekst[2]).toContain(`zonder de VVD telt ${r.VVD.start.length + r.VVD.extra.length} fracties en ${r.VVD.tk} zetels, en stemde in ${procent(r.VVD.pct)} van de stemmingen eensgezind`);
    expect(b.tekst[2]).toContain(`Zonder D66 is dat ${procent(r.D66.pct)}, zonder het CDA is dat ${procent(r.CDA.pct)}`);
    expect(b.tekst[2]).toContain(`De drie kabinetspartijen samen: ${procent(d.kamers.kabinet.pct)}`);
    expect(b.data).toContain("eerstekamer.nl/fracties, geraadpleegd op 11 november 2026");
  });

  it("blok 5: het akkoord van 2013 en 2012, en het startpunt van nu, zonder voorspelling", () => {
    const b = blok(zonder, "toen");
    const t = d.toen["2013"];
    const sprong = t.partners.map((a) => verschuiving(t, a));
    expect(b.kop).toBe(`Na het begrotingsakkoord van 2013 gingen D66, ChristenUnie en SGP het jaar erna ${Math.round(Math.min(...sprong))} tot ${Math.round(Math.max(...sprong))} procentpunt vaker mee met het kabinet`);
    expect([Math.round(Math.min(...sprong)), Math.round(Math.max(...sprong))]).toEqual([9, 15]);
    const ander = Math.max(...t.anderen.map((a) => Math.abs(verschuiving(t, a))));
    expect(ander).toBeLessThan(Math.min(...sprong));
    expect(b.tekst[0]).toContain(`hooguit ${Math.round(ander)} procentpunt`);
    const pvv = d.toen["2012"];
    expect(b.tekst[1]).toContain(`ging daarna in ${procent(pvv.na.fracties[0].pct)} mee met het kabinet, tegen ${procent(pvv.voor.fracties[0].pct)} ervoor`);
    expect(b.tekst[2]).toBe(`Nu gaan PRO en Volt in ${d.toen.nu.fracties.map((f) => Math.round(f.pct!)).join(" en ")}% mee met het eensgezinde kabinet. Of dat na dit akkoord ook gebeurt, zie je over een half jaar in de lijn.`);
    expect(b.data).toContain(`${datumTekst(t.voor.van)} tot en met ${datumTekst(t.voor.tot)}`);
  });

  it("blok 1: de uitslag in twee varianten, afhankelijk van wat de VVD stemt, zonder voorspelling over het kabinet", () => {
    expect(d.kader.eindstemmingen).toBe(23);
    expect(d.kader.metCoalitieTegen).toBe(0);
    const a = blok(vvdVoor, "uitslag"), t = blok(vvdTegen, "uitslag");
    const am = vvdVoor.data.uitslag!.stemmingen[0], wv = vvdVoor.data.uitslag!.stemmingen[1], wt = vvdTegen.data.uitslag!.stemmingen[1];
    expect(a.kop).toBe(`De Kamer nam het amendement aan met ${am.voor} tegen ${am.tegen} zetels en het belastingplan met ${wv.voor} tegen ${wv.tegen}`);
    expect(t.kop).toBe(`De Kamer nam het amendement aan met ${am.voor} tegen ${am.tegen} zetels en het belastingplan met ${wt.voor} tegen ${wt.tegen}`);
    expect(a.tekst[0]).toContain("Van de kabinetspartijen stemden D66 en het CDA voor en de VVD tegen.");
    expect(a.tekst[1]).toContain(`Alle drie de kabinetspartijen stemden voor het belastingplan. Dat past in de lijn sinds 2008: bij geen van de 18 eerdere eindstemmingen over een Belastingplan stemde`);
    expect(t.tekst[1]).toContain(`De VVD stemde tegen het belastingplan. Dat gebeurde sinds 2008 niet eerder: bij de 18 eerdere eindstemmingen over een Belastingplan stemde nooit een coalitiefractie of gedoogpartner tegen.`);
    expect(t.tekst[1]).toContain("Wat het betekent voor het kabinet, staat niet in de data.");
    for (const s of [vvdVoor, vvdTegen]) expect(tekstVan(s)).not.toMatch(/\b(valt|val van|crisis|breuk|opstappen|stapt op)\b/i);
    expect(a.data).toContain("amendement 2026Z99901, wetsvoorstel 2026Z99902");
    // Verworpen amendement: andere vorm van de kop
    const verworpen = akkoordBelastingplan({ ...d, uitslag: { bron: "x", opgehaald: "2026-11-12",
      stemmingen: [stemming("amendement", "A", ["D66", "CDA", "PRO", "Volt"]), stemming("wet", "W", [...LINKS, "VVD"])] } });
    expect(blok(verworpen, "uitslag").kop).toMatch(/^De Kamer verwierp het amendement met \d+ tegen \d+ zetels en nam het belastingplan aan met \d+ tegen \d+ zetels$/);
  });

  it("blok plannen: alle Belastingplannen sinds 2008 uit de open data, met het plan van nu als laatste", () => {
    const pl = d.plannen!.lijst;
    expect(pl.map((x) => x.plan)).toEqual(Array.from({ length: 19 }, (_, i) => String(2009 + i)));
    // Uitslagen zoals in de besluiten van de Kamer, nagekeken op 13 november 2026
    expect(pl.map((x) => `${x.voor}-${x.tegen}`)).toEqual(["94-56", "115-34", "133-17", "150-0", "118-32", "103-47", "106-44", "93-57", "135-14",
      "128-22", "83-67", "93-56", "131-19", "144-6", "130-18", "139-9", "109-41", "134-16", "76-74"]);
    for (const x of pl.slice(0, -1)) {
      expect(x.voor + x.tegen).toBeLessThanOrEqual(150);
      expect(x.coalitieTegen).toEqual([]);
      expect(x.hoofdelijk).toBe(false);
      expect(x.tegen).toBe((x.tegenFracties ?? []).reduce((n, f) => n + f.zetels, 0));
    }
    expect(pl[0].coalitie).toEqual(["CDA", "ChristenUnie", "PvdA"]);
    expect(pl.find((x) => x.plan === "2026")!.coalitie).toEqual(["BBB", "VVD"]);
    const b = blok(zonder, "plannen");
    expect(b.kop).toBe("Zo stemde de Kamer over 19 Belastingplannen");
    expect(b.tekst[0]).toBe("De Kamer nam elk Belastingplan sinds het Belastingplan 2009 aan. De krapste uitslag was tot nu toe 83 tegen 67, voor het Belastingplan 2019 op 15 november 2018. Het Belastingplan 2027 nam de Kamer op 12 november 2026 aan met 76 tegen 74, krapper dan alle plannen ervoor. Over de 18 plannen ervoor stemde de Kamer bij handopsteken, per fractie; over dit plan hoofdelijk, elk Kamerlid apart.");
    const sp = pl.slice(0, -1).filter((x) => x.tegenFracties!.some((f) => f.fractie === "SP")).length;
    expect(b.tekst[1]).toContain(`het vaakst van de SP (${sp} van de 18 keer)`);
    expect(b.tekst[1]).toContain("staat nog niet per fractie in de open data");
    // Met een telling per fractie voor 2027: de zin volgt de data
    const met = (tegen: string[]) => akkoordBelastingplan({ ...d, plannen: { ...d.plannen!, lijst: [...pl.slice(0, -1), { ...pl[18], coalitieTegen: tegen, tegenFracties: [] }] } });
    expect(blok(met(["VVD"]), "plannen").tekst[1]).toContain("Bij het Belastingplan 2027 stemde de VVD tegen.");
    expect(blok(met([]), "plannen").tekst[1]).toContain("Ook bij het Belastingplan 2027 stemde geen coalitiefractie tegen.");
  });

  it("heeft lezingen en een slot in twee zinnen met getallen uit de data", () => {
    const j = buitenVan(d, "Jetten");
    const p = (a: string) => j.partijen.find((x) => x.afkorting === a)!;
    expect(zonder.lezingen!.links.tekst).toContain(`stonden D66 en CDA ${aantal(p("VVD").keer)} keer samen tegenover de VVD, en VVD en CDA ${aantal(p("D66").keer)} keer tegenover D66`);
    expect(zonder.lezingen!.rechts.tekst).toContain("Bij de 18 eerdere eindstemmingen over een Belastingplan sinds 2008 stemde geen coalitiefractie of gedoogpartner tegen.");
    expect(zonder.slot).toBe("In de Tweede Kamer hebben de vier 65 zetels en in de Eerste Kamer 29, in beide Kamers minder dan een meerderheid. Of PRO en Volt na dit akkoord vaker meestemmen met het kabinet, zie je over een half jaar in de lijn.");
    expect(zonder.slot.split(/(?<=\.) /)).toHaveLength(2);
    expect(zonder.opvalt).toBe("Het Belastingplan 2027 ging met 76 tegen 74, de krapste uitslag van de 19 Belastingplannen sinds 2008. In de Eerste Kamer hebben D66, CDA, PRO en Volt 29 van de 75 zetels, 9 minder dan een meerderheid.");
  });

  it("volgt de tone of voice: geen ik, wij, lange streepjes of decimalen met een punt", () => {
    for (const s of [zonder, vvdVoor, vvdTegen]) {
      const t = tekstVan(s);
      expect(t).not.toMatch(/\b(we|wij|ons|onze|ik)\b/i);
      expect(t).not.toMatch(/[—–]/);
      expect(t).not.toMatch(/\d\.\d{1,2}(?!\d)/);
      expect(t).not.toMatch(/\b(cruciaal|essentieel|kortom|concluderend)\b/i);
    }
  });

  it("noemt Volt bij het akkoord en de vier, en PRO als één lijn met GroenLinks-PvdA", () => {
    const t = tekstVan(zonder);
    expect(t).toContain("PRO en Volt");
    expect(blok(zonder, "partners").data).toContain("GroenLinks-PvdA en PRO samen, als één lijn");
    expect(zonder.bouwer).toEqual({ fracties: ["D66", "CDA", "PRO", "Volt"], tekst: "deze vier in de coalitiebouwer" });
  });
});

describe("Actueel: delen van het akkoordstuk", () => {
  it("linkt naar het blok, en laat het stuk pas door als het op de site staat", () => {
    expect(deellinkVan("actueel", { stuk: "akkoord-belastingplan", blok: "kamers" })).toBe("/deel/actueel?stuk=akkoord-belastingplan&blok=kamers");
    expect(doelVan("actueel", { stuk: "akkoord-belastingplan", blok: "kamers" })).toBe("/actueel/akkoord-belastingplan#kamers");
    expect(schoonActueel({ stuk: "akkoord-belastingplan", blok: "kamers" })).toEqual(d.uitslag ? { stuk: "akkoord-belastingplan", blok: "kamers" } : {});
  });
});
