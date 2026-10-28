// "Wat opvalt" bovenaan de pagina's (K11): feitelijke zinnen uit de data, null zonder genoeg data
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { FractieInPeriode, Rol } from "../lib/cohesie";
import { coalitieOpvalt, fractiesOpvalt, hernoemingen, kabinetBijStart, kamerledenOpvalt, onderwerpenOpvalt, paarOpvalt, periodeTekst, verkennerOpvalt } from "../lib/kern";
import { MENU } from "../lib/menu";
import { PAGINAS } from "../lib/site";
import type { CohesieKaart, Paar } from "../lib/zaal";
import type { FractieWerk } from "../lib/zetelwerk";

const fr = (afkorting: string, zetels: number, extra: Partial<FractieInPeriode> = {}): FractieInPeriode => ({
  id: afkorting.toLowerCase(), afkorting, naam: afkorting, zetels, stemmingen: 100, eerste: "", laatste: "", inZaal: true,
  zetelsBegin: zetels, bijBegin: true, ...extra,
});
const kaartVan = (paren: Array<[string, string, number | null, boolean?]>): CohesieKaart => {
  const k: CohesieKaart = new Map();
  for (const [a, b, c, teWeinig] of paren) {
    const p = { cohesie: c, gezamenlijk: 100, teWeinig: !!teWeinig };
    k.set(`${a}|${b}`, p);
    k.set(`${b}|${a}`, p);
  }
  return k;
};

describe("verkennerOpvalt", () => {
  const fracties = [fr("A", 30), fr("B", 20), fr("C", 10), fr("D", 1)];
  it("noemt het hoogste en het laagste paar, zonder kleine fracties", () => {
    const kaart = kaartVan([["a", "b", 90], ["a", "c", 40], ["b", "c", 60], ["a", "d", 10]]);
    expect(verkennerOpvalt("kabinet", "Schoof", fracties, kaart)).toBe(
      "Onder kabinet-Schoof stemden A en B het vaakst hetzelfde (90%), A en C het minst (40%). Dat geldt voor fracties met minstens 5 zetels.");
  });
  it("slaat paren met te weinig data over en geeft null met minder dan twee paren", () => {
    expect(verkennerOpvalt("kabinet", "X", fracties, kaartVan([["a", "b", 90], ["a", "c", 40, true]]))).toBeNull();
  });
});

describe("onderwerpen", () => {
  const terrein = (paren: Record<string, Record<string, number>>) =>
    new Map(Object.entries(paren).map(([t, m]) => [t, new Map(Object.entries(m).map(([f, c]) => [f, { cohesie: c, gezamenlijk: 80, teWeinig: false } as Paar]))]));
  const perTerrein = terrein({ Zorg: { b: 90, c: 70 }, Asiel: { b: 20, c: 60 }, Klimaat: { b: 50, c: 65 } });
  it("kiest de fractie met het grootste verschil tussen onderwerpen", () => {
    expect(onderwerpenOpvalt("kabinet", "X", "A", [{ id: "b", afkorting: "B", zetels: 20 }, { id: "c", afkorting: "C", zetels: 10 }], perTerrein)).toBe(
      "Onder kabinet-X verschilt het per onderwerp het meest tussen A en B, van de 5 grootste andere fracties: het vaakst eens bij Zorg (90%), het minst bij Asiel (20%). Alleen onderwerpen met minstens 50 stemmingen samen.");
  });
  it("kijkt alleen naar de vijf grootste andere fracties", () => {
    const klein = ["d", "e", "f", "g", "h"].map((id) => ({ id, afkorting: id.toUpperCase(), zetels: 30 }));
    expect(onderwerpenOpvalt("kabinet", "X", "A", [{ id: "b", afkorting: "B", zetels: 2 }, ...klein], perTerrein)).toBeNull();
    expect(onderwerpenOpvalt("kabinet", "X", "A", [{ id: "b", afkorting: "B", zetels: 2 }, { id: "c", afkorting: "C", zetels: 10 }], perTerrein)).toContain("A en B");
  });
  it("noemt bij een paar het hoogste en laagste terrein", () => {
    expect(paarOpvalt("A", "C", [
      { terrein: "Zorg", cohesie: 70, gezamenlijk: 80, teWeinig: false },
      { terrein: "Asiel", cohesie: 60, gezamenlijk: 80, teWeinig: false },
    ])).toBe("A en C stemden het vaakst hetzelfde bij Zorg (70%), het minst bij Asiel (60%).");
  });
});

describe("coalitie en fracties", () => {
  const rollen = new Map<string, Rol>([["A", { rol: "kabinet", tot: null }], ["B", { rol: "kabinet", tot: "2026-01-01" }], ["C", { rol: "gedoogsteun", tot: null }]]);
  it("telt de zetels van het kabinet bij de start, zonder gedoogsteun en zonder later ontstane fracties", () => {
    expect(kabinetBijStart([fr("A", 40), fr("B", 26), fr("C", 10), fr("E", 5, { bijBegin: false })], rollen)).toBe(66);
  });
  it("zegt of het kabinet een meerderheid had", () => {
    expect(coalitieOpvalt("X", 66)).toContain("76 nodig");
    expect(coalitieOpvalt("X", 88)).toContain("genoeg voor een meerderheid");
    expect(coalitieOpvalt("X", 0)).toBeNull();
  });
  it("noemt het aantal fracties en de grootste", () => {
    expect(fractiesOpvalt("kabinet", "X", [{ fractie: { afkorting: "B" }, zetels: 20 }, { fractie: { afkorting: "A" }, zetels: 30 }]))
      .toBe("Bij de start van kabinet-X zaten er 2 fracties in de Kamer. De grootste was A met 30 zetels.");
  });
});

describe("periodeTekst", () => {
  it("schrijft een lopende Kamerperiode als 'sinds'", () => {
    expect(periodeTekst("kamerperiode", "2025-")).toBe("In de Kamerperiode sinds 2025");
    expect(periodeTekst("kamerperiode", "2023-2025")).toBe("In de Kamerperiode 2023-2025");
  });
});

describe("kamerledenOpvalt", () => {
  const w = (afkorting: string, soort: FractieWerk["soort"], ingediend: number) => ({ afkorting, soort, ingediend }) as FractieWerk;
  it("noemt de twee fracties die het meest indienden, alleen van de gekozen soort", () => {
    expect(kamerledenOpvalt("kabinet", "X", "Motie", "moties", [w("A", "Motie", 1200), w("B", "Motie", 900), w("C", "Amendement", 5000)]))
      .toBe("Onder kabinet-X diende A (1.200) de meeste moties in, daarna B (900).");
  });
  it("telt een fractie onder een nieuwe naam samen met haar voorganger", () => {
    const h = hernoemingen([{ soort: "naamswijziging", van: [{ afkorting: "Oud" }], naar: { afkorting: "Nieuw" } }]);
    expect(kamerledenOpvalt("kabinet", "X", "Motie", "moties", [w("A", "Motie", 300), w("Oud", "Motie", 200), w("Nieuw", "Motie", 250)], h))
      .toBe("Onder kabinet-X diende Nieuw (450, ook als Oud) de meeste moties in, daarna A (300).");
  });
  it("geeft null zonder stukken", () => {
    expect(kamerledenOpvalt("kabinet", "X", "Wetsvoorstel", "initiatiefwetten", [])).toBeNull();
  });
});

describe("menu", () => {
  const items = MENU.flatMap((g) => g.items);
  it("heeft voor elk onderdeel een regel uitleg", () => {
    for (const m of items) expect(m.regel.length).toBeGreaterThan(20);
  });
  // /uitgelicht zelf staat niet in de sitemap: het stuurt door naar de nieuwste stemming
  it("wijst alleen naar bestaande pagina's, Uitgelicht en Stemgenoten inbegrepen", () => {
    for (const m of items) expect(existsSync(join(__dirname, "..", "app", m.href, "page.tsx"))).toBe(true);
    for (const m of items) if (m.href !== "/uitgelicht") expect(PAGINAS).toContain(m.href);
    expect(items.map((m) => m.href)).toEqual(expect.arrayContaining(["/uitgelicht", "/stemgenoten"]));
  });
});

describe("verkennerOpvalt bij bijna gelijke paren", () => {
  it("noemt een paar dat binnen 1 procentpunt van het hoogste ligt", () => {
    const fr = ["A", "B", "C", "D"].map((a) => ({ id: a.toLowerCase(), afkorting: a, naam: a, zetels: 20, stemmingen: 100, eerste: "", laatste: "",
      inZaal: true, zetelsBegin: 20, bijBegin: true }));
    const k = new Map<string, { cohesie: number; gezamenlijk: number; teWeinig: boolean }>();
    for (const [a, b, c] of [["a", "b", 91.8], ["a", "c", 91.7], ["b", "c", 70], ["a", "d", 40], ["b", "d", 50], ["c", "d", 60]] as const) {
      k.set(`${a}|${b}`, { cohesie: c, gezamenlijk: 100, teWeinig: false });
      k.set(`${b}|${a}`, { cohesie: c, gezamenlijk: 100, teWeinig: false });
    }
    expect(verkennerOpvalt("kabinet", "X", fr, k)).toContain("A en B het vaakst hetzelfde (92%), A en D het minst (40%). Bijna even vaak: A en C (92%). Dat geldt");
  });
});
