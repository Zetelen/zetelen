// Tests voor de cohesie per beleidsterrein (lib/onderwerpen.ts)
import { describe, expect, it } from "vitest";
import { paarPerTerrein, uitersten } from "../lib/onderwerpen";
import type { Paar } from "../lib/zaal";

const p = (cohesie: number | null, teWeinig = false): Paar => ({ cohesie, gezamenlijk: teWeinig ? 10 : 100, teWeinig });

describe("paarPerTerrein en uitersten", () => {
  const perTerrein = new Map([
    ["Zorg", new Map([["B", p(80)]])],
    ["Defensie", new Map([["B", p(40)]])],
    ["Koninkrijk", new Map([["B", p(null, true)]])],
    ["Europa", new Map([["C", p(99)]])],
  ]);
  it("sorteert van meest naar minst eens, te weinig data achteraan, alleen het gekozen paar", () => {
    expect(paarPerTerrein(perTerrein, "B").map((x) => x.terrein)).toEqual(["Zorg", "Defensie", "Koninkrijk"]);
  });
  it("vindt het hoogste en laagste terrein met genoeg data", () => {
    const u = uitersten(paarPerTerrein(perTerrein, "B"))!;
    expect([u.hoog.terrein, u.laag.terrein]).toEqual(["Zorg", "Defensie"]);
    expect(uitersten(paarPerTerrein(perTerrein, "C"))).toBeNull();
  });
  it("laat terreinen met minder dan 50 gezamenlijke stemmingen buiten de koppen", () => {
    const klein = new Map([...perTerrein, ["Koninkrijk", new Map([["B", { cohesie: 10, gezamenlijk: 26, teWeinig: false }]])]]);
    expect(uitersten(paarPerTerrein(klein, "B"))!.laag.terrein).toBe("Defensie");
  });
});
