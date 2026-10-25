// Tests voor de cohesie per beleidsterrein (lib/onderwerpen.ts)
import { describe, expect, it } from "vitest";
import { type StemmingRij, paarPerTerrein, perDossier, uitersten, verschillen } from "../lib/onderwerpen";
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

describe("perDossier", () => {
  const r = (dossier: string, a: string | null, b: string | null): StemmingRij => ({
    besluit: Math.random().toString(), dossier, datum: "2026-01-01", zaakNummer: null, zaakSoort: null, onderwerp: null, uitslag: null,
    dossierNummer: 1, dossierToevoeging: null, dossierTitel: dossier, andereDossiers: [], a, b,
  });
  it("telt samen en eens per dossier en zet het minst eens bovenaan", () => {
    const uit = perDossier([r("X", "Voor", "Voor"), r("X", "Voor", "Tegen"), r("Y", "Tegen", "Voor"), r("Y", null, "Voor"), r("Z", null, null)]);
    expect(uit.map((d) => [d.titel, d.eens, d.samen, d.stemmingen])).toEqual([["Y", 0, 1, 2], ["X", 1, 2, 2]]);
  });
});

describe("verschillen", () => {
  const r = (besluit: string, datum: string, a: string | null, b: string | null, dossier = "X"): StemmingRij => ({
    besluit, dossier, datum, zaakNummer: null, zaakSoort: null, onderwerp: null, uitslag: null,
    dossierNummer: 1, dossierToevoeging: null, dossierTitel: dossier, andereDossiers: [], a, b,
  });
  it("geeft elke stemming waarop ze verschilden een keer, nieuwste eerst", () => {
    const uit = verschillen([r("1", "2026-01-01", "Voor", "Tegen"), r("1", "2026-01-01", "Voor", "Tegen", "Y"), r("2", "2026-02-01", "Tegen", "Voor"), r("3", "2026-03-01", "Voor", "Voor"), r("4", "2026-04-01", null, "Voor")]);
    expect(uit.map((x) => x.besluit)).toEqual(["2", "1"]);
  });
});
