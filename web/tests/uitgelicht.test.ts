// Tests voor Uitgelicht (lib/uitgelicht.ts): stappen per casus en de telling met een vergissing
import { describe, expect, it } from "vitest";
import { CASUSSEN, type Casus, type CasusData, casusStappen, hoogteSmal, indeling, kabinetOp, perFractie, perFractieZin, totalen, uitslagKort, verdeeld, vergissingen, wissels } from "../lib/uitgelicht";
import { stemZaal } from "../lib/verhaal";

const vind = (slug: string) => CASUSSEN.find((c) => c.slug === slug)!;
const teksten = (c: Casus) => casusStappen(c, false).map((s) => s.tekst);

describe("gegevens", () => {
  it("telling in elk bestand gelijk aan de uitslag in BesluitTekst, 150 leden", () => {
    for (const c of CASUSSEN) for (const b of c.data.besluiten) {
      const t = totalen(b);
      expect(b.bron).toEqual({ voor: t.voor, tegen: t.tegen });
      expect(b.verschillen).toEqual([]);
      expect(t.voor + t.tegen + t.niet).toBe(150);
    }
  });
});

describe("stappen per casus", () => {
  it("elke casus heeft vijf tot zeven stappen, op breed en smal evenveel", () => {
    for (const c of CASUSSEN) {
      const n = casusStappen(c, false).length;
      expect(n, c.slug).toBeGreaterThanOrEqual(5);
      expect(n, c.slug).toBeLessThanOrEqual(7);
      expect(casusStappen(c, true)).toHaveLength(n);
    }
  });
  it("elke stap zet alle 150 stippen neer met unieke sleutels", () => {
    for (const c of CASUSSEN) for (const smal of [false, true]) for (const st of casusStappen(c, smal)) {
      expect(new Set(st.stippen.map((p) => p.key)).size, c.slug).toBe(150);
    }
  });
  it("de blokken passen in de tekening: breed onder y 505, smal binnen de berekende hoogte", () => {
    for (const c of CASUSSEN) for (const b of c.data.besluiten) for (const groep of [false, true]) {
      const zs = stemZaal(b.stemmen);
      const breed = indeling(zs, groep, false);
      expect(breed.onder, c.slug).toBeLessThanOrEqual(505);
      expect(Math.max(...breed.stippen.map((p) => p.x)), c.slug).toBeLessThanOrEqual(1060 - 11);
      expect(indeling(zs, groep, true).onder, c.slug).toBeLessThanOrEqual(hoogteSmal(c) - 50);
    }
  });
  it("geen gedachtestreepjes en geen uitroeptekens in de teksten", () => {
    for (const c of CASUSSEN) for (const t of [...teksten(c), c.omschrijving, c.vraag]) expect(t).not.toMatch(/[—–!]/);
  });
  it("ritueel slachten: uitslag, kabinet met gedoogsteun en twee verdeelde fracties", () => {
    const t = teksten(vind("ritueel-slachten"));
    expect(t[1]).toBe("116 voor, 30 tegen. Het wetsvoorstel is aangenomen.");
    expect(t[3]).toContain("Kabinet-Rutte I steunt op VVD en CDA, met gedoogsteun van PVV: samen 76 zetels.");
    expect(t.find((x) => x.includes("verdeeld"))).toContain("PvdA: 26 voor, 3 tegen. PVV: 23 voor, 1 tegen.");
  });
  it("live-weddenschappen: twee stemmen verschil", () => {
    expect(teksten(vind("live-weddenschappen"))).toContain("74 voor en 72 tegen: twee stemmen verschil. Vier Kamerleden doen niet mee.");
  });
  it("studievoorschot: gelijke stand, de regel, en de herstemming een week later", () => {
    const st = casusStappen(vind("studievoorschot"), false);
    expect(st).toHaveLength(7);
    expect(st[1].tekst).toContain("72 voor, 72 tegen. De stemmen staken. Zes Kamerleden doen niet mee.");
    expect(st[3].tekst).toBe("Een week later stemt de Kamer opnieuw: 73 voor, 73 tegen. Weer gelijk, dus de motie is niet aangenomen.");
    expect(st[4].tekst).toContain("Voor ging van 72 naar 73, tegen van 72 naar 73. Niet mee deden er eerst 6, nu 4.");
    expect(st[4].tekst).toContain("GL, CDA, 50PLUS en FVD");
  });
  it("gehandicaptenzorg: één stem verschil tegen een minderheidskabinet", () => {
    const t = teksten(vind("gehandicaptenzorg"));
    expect(t).toContain("75 voor en 74 tegen: één stem verschil. Eén Kamerlid doet niet mee.");
    expect(t[3]).toContain("Kabinet-Jetten steunt op D66, VVD en CDA: samen 66 zetels, geen meerderheid. Die stemmen allemaal tegen.");
  });
  it("Mercosur: demissionair kabinet en een meerderheid van alle zetels", () => {
    const t = teksten(vind("mercosur"));
    expect(t[3]).toContain("Kabinet-Schoof is demissionair en bestaat nog uit VVD en BBB: samen 26 zetels");
    expect(t.join(" ")).toContain("Met 76 stemmen is het ook een meerderheid van alle 150 zetels.");
  });
  it("uitslag in het kort voor de lijst", () => {
    expect(uitslagKort(vind("ritueel-slachten"))).toBe("aangenomen, 116-30");
    expect(uitslagKort(vind("studievoorschot"))).toBe("na herstemming niet aangenomen, 73-73");
  });
});

describe("telling met vergissing", () => {
  // Een kleine nagebootste stemming: één VVD-stem tegen staat in de bron als vergissing
  const data: CasusData = {
    zaak: "2099Z00001", soort: "Motie", onderwerp: null, indieners: ["JA21"],
    besluiten: [{
      datum: "2025-06-10", besluitSoort: "Stemmen - verworpen", besluitTekst: "Verworpen (23-38).",
      stemmen: { Voor: { VVD: 23 }, Tegen: { PVV: 37, VVD: 1 }, "Niet deelgenomen": { PVV: 3 } },
      vergissingen: { Tegen: { VVD: 1 } }, telling: { Voor: 23, Tegen: 38, "Niet deelgenomen": 3 },
      bron: { voor: 23, tegen: 38 }, verschillen: [],
    }],
  };
  const c: Casus = { slug: "proef", titel: "Proef", vraag: "Proef?", omschrijving: "Een proef.", data };
  it("telt de vergissing mee in de uitslag en benoemt haar in een eigen stap", () => {
    const st = casusStappen(c, false);
    expect(st[1].tekst).toBe("23 voor, 38 tegen. De motie is verworpen.");
    const v = st.find((s) => s.datum === "een vergissing")!;
    expect(v.tekst).toBe("Eén VVD-Kamerlid stemt tegen. Achteraf laat dit Kamerlid vastleggen dat het een vergissing was. De stem telt toch mee: een uitslag ligt vast.");
    // Precies één stip met nadruk: de VVD-stem tegen
    const nadruk = v.stippen.filter((p) => p.kleur === "nadruk");
    expect(nadruk).toHaveLength(1);
    expect(vergissingen(data.besluiten[0])).toEqual([{ stem: "Tegen", fractie: "VVD", aantal: 1 }]);
  });
  it("benoemt een verschil met de uitslag in de bron", () => {
    const anders: Casus = { ...c, data: { ...data, besluiten: [{ ...data.besluiten[0], bron: { voor: 24, tegen: 37 } }] } };
    expect(casusStappen(anders, false)[1].tekst).toContain("Let op: in de bron staat 24-37, geteld uit de stemmen is het 23-38.");
  });
  it("de motie-Eerdmans: verdeelde VVD en per fractie in zaalvolgorde", () => {
    const st = data.besluiten[0].stemmen;
    expect(verdeeld(st).map((f) => f.fractie)).toEqual(["VVD"]);
    expect(perFractie(st).map((f) => f.fractie)).toEqual(["VVD", "PVV"]);
    expect(perFractieZin(st)).toBe("Tegen stemt PVV. Verdeeld: VVD.");
  });
});

describe("hulpfuncties", () => {
  it("kabinet op een datum, met uitgetreden fracties en gedoogsteun", () => {
    expect(kabinetOp("2011-06-28")).toEqual({ naam: "Rutte I", demissionair: false, leden: ["VVD", "CDA"], gedoog: ["PVV"] });
    expect(kabinetOp("2025-12-16")).toEqual({ naam: "Schoof", demissionair: true, leden: ["VVD", "BBB"], gedoog: [] });
    expect(kabinetOp("2025-03-25")?.leden).toEqual(["PVV", "VVD", "Nieuw Sociaal Contract", "BBB"]);
    expect(kabinetOp("2009-01-01")).toBeNull();
  });
  it("wissels tussen voor en tegen door de zaal", () => {
    expect(wissels({ Voor: { PvdD: 3, PVV: 30 }, Tegen: { VVD: 20 }, "Niet deelgenomen": {} })).toBe(2);
    expect(wissels({ Voor: { PvdD: 3 }, Tegen: { VVD: 20, PVV: 30 }, "Niet deelgenomen": {} })).toBe(1);
  });
  it("indeling zet niet deelgenomen onder het kortste blok en laat een leeg blok weg", () => {
    const zs = stemZaal({ Voor: { VVD: 40 }, Tegen: { PVV: 5 }, "Niet deelgenomen": { PVV: 1 } });
    const b = indeling(zs, true, false);
    const niet = b.stippen.filter((p) => p.stem === "Niet deelgenomen");
    expect(niet[0].x).toBeGreaterThan(560);
    const leeg = indeling(stemZaal({ Voor: { VVD: 4 }, Tegen: { PVV: 5 }, "Niet deelgenomen": {} }), false, false);
    expect(leeg.labels.map((l) => l.tekst)).toEqual(["Voor", "Tegen"]);
  });
});

