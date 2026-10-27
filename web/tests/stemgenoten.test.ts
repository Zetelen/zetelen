// Tests voor Stemgenoten: de telling per fractie en de vaste gegevens
import { describe, expect, it } from "vitest";
import { type Stelling, uitslagen, verschillen, verwachtingZin } from "../components/stemgenoten/Stemgenoten";
import kandidaten from "../content/stemgenoten/kandidaten.json";
import stellingen from "../content/stemgenoten/stellingen.json";

const st = (besluit: string, stemmen: Record<string, string>): Stelling =>
  ({ besluit, zaak: "Z", stelling: "", uitleg: "", terrein: "", soort: "Amendement", datum: "2026-01-01", uitslag: "", voor: 0, tegen: 0, stemmen, kamerstuk: null });

describe("uitslagen", () => {
  const set = Array.from({ length: 6 }, (_, i) => st(`b${i}`, { A: "Voor", B: i < 3 ? "Voor" : "Tegen", C: "Niet deelgenomen" }));
  it("telt alleen stellingen waarop jij en de fractie allebei een kant kozen", () => {
    const antwoorden = Object.fromEntries(set.map((s, i) => [s.besluit, i === 5 ? ("geen" as const) : ("Voor" as const)]));
    const u = uitslagen(set, antwoorden, ["A", "B", "C"]);
    expect(u[0]).toMatchObject({ fractie: "A", samen: 5, gelijk: 5, aandeel: 100 });
    expect(u.find((x) => x.fractie === "B")).toMatchObject({ samen: 5, gelijk: 3, aandeel: 60 });
    expect(u.find((x) => x.fractie === "C")).toMatchObject({ samen: 0, aandeel: null });
  });
  it("geen percentage onder 5 gemeenschappelijke stellingen", () => {
    const u = uitslagen(set.slice(0, 4), { b0: "Voor", b1: "Tegen", b2: "Voor", b3: "Voor" }, ["A"]);
    expect(u[0]).toMatchObject({ samen: 4, aandeel: null });
  });
});

describe("uitklappen en verwachting", () => {
  const set = Array.from({ length: 6 }, (_, i) => st(`b${i}`, { A: "Voor", B: i < 3 ? "Voor" : "Tegen" }));
  const antwoorden = Object.fromEntries(set.map((s, i) => [s.besluit, i === 5 ? ("geen" as const) : ("Voor" as const)]));
  it("toont alleen stellingen waarop de fractie een andere kant koos", () => {
    expect(verschillen(set, antwoorden, "A")).toEqual([]);
    expect(verschillen(set, antwoorden, "B").map((s) => s.besluit)).toEqual(["b3", "b4"]);
  });
  it("noemt de plek van de verwachte fracties", () => {
    const lijst = uitslagen(set, antwoorden, ["A", "B", "C"]);
    expect(verwachtingZin(lijst, [])).toBeNull();
    expect(verwachtingZin(lijst, ["B"])).toBe("Je verwachtte B op plek 2 van de 2.");
    expect(verwachtingZin(lijst, ["C", "B", "A"])).toBe("Je verwachtte A op plek 1 en B op plek 2 van de 2. Voor C zijn te weinig gemeenschappelijke stellingen.");
    expect(verwachtingZin(lijst, ["C"])).toBe("Je verwachtte C, maar daarvoor zijn te weinig gemeenschappelijke stellingen.");
  });
});

describe("gegevens", () => {
  it("alleen stemmingen onder het huidige kabinet, met een kamerstuknummer voor de bronlink", () => {
    for (const k of kandidaten.gekozen) {
      expect(k.datum >= "2026-02-23").toBe(true);
      expect(k.kamerstuk).toMatch(/^\d{5}(-[A-Z]+)?$/);
    }
  });
  it("bij elke gekozen stemming precies één stelling, zonder gedachtestreepjes", () => {
    expect(stellingen.map((s) => s.besluit).sort()).toEqual(kandidaten.gekozen.map((k) => k.besluit).sort());
    for (const s of stellingen) expect(`${s.stelling} ${s.uitleg}`).not.toMatch(/[—–!]/);
  });
  it("de selectie wijkt weinig af van al het stemgedrag", () => {
    expect(kandidaten.controle_verschil).toBeLessThan(8);
  });
});
