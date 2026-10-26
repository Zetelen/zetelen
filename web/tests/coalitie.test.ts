// Tests voor de rekenkern van de coalitiebouwer: scenario's met bekende uitkomst
import { describe, expect, it } from "vitest";
import { type Stemmatrix, bereken, zetelTabel } from "../lib/coalitie";

// Vier fracties: A 70, B 10, C 40, D 30 zetels (150)
const basis = (stemmen: string[], zetels?: Stemmatrix["zetels"]): Stemmatrix => ({
  fracties: [{ id: "a", afkorting: "A" }, { id: "b", afkorting: "B" }, { id: "c", afkorting: "C" }, { id: "d", afkorting: "D" }],
  stemmen,
  zetels: zetels ?? [[[0, 70]], [[0, 10]], [[0, 40]], [[0, 30]]],
});

describe("bereken", () => {
  it("een groep met 76 of meer zetels heeft altijd een meerderheid", () => {
    const m = basis(["VVTT", "TTVV"], [[[0, 70]], [[0, 10]], [[0, 40]], [[0, 30]]]);
    const u = bereken(m, ["a", "b"]); // 80 zetels
    expect(u.eensgezind).toBe(2);
    expect(u.meerderheid).toBe(2);
    expect(u.zonderHulp).toBe(2);
  });

  it("een fractie die de groep over de grens tilt, is beslissend", () => {
    // A (70) en D (30) samen tegen B en C (50): 100 tegen 50; zonder D 70 tegen 50: niet beslissend
    // A (70) en B (10) tegen C en D (70): 80 tegen 70; zonder B 70 tegen 70: B beslissend
    const m = basis(["VTTV", "VVTT"]);
    const u = bereken(m, ["a"]);
    const p = Object.fromEntries(u.partners.map((x) => [x.afkorting, x]));
    expect(u.eensgezind).toBe(2);
    expect(u.meerderheid).toBe(2);
    expect(u.zonderHulp).toBe(0);
    expect(p.D).toMatchObject({ meegestemd: 1, beslissend: 0 });
    expect(p.B).toMatchObject({ meegestemd: 1, beslissend: 1 });
    expect(p.C.meegestemd).toBe(0);
  });

  it("telt alleen stemmingen waarin de groep eensgezind was", () => {
    const m = basis(["VTVV", "V-VV", "VVVV"]);
    expect(bereken(m, ["a", "b"]).eensgezind).toBe(1);
  });

  it("gebruikt de zetels van het moment van de stemming", () => {
    const m = basis(["VTTT", "VTTT"], [[[0, 70], [1, 80]], [[0, 10]], [[0, 40]], [[0, 20]]]);
    const z = zetelTabel(m);
    expect([z[0][0], z[0][1]]).toEqual([70, 80]);
    expect(bereken(m, ["a"], z).meerderheid).toBe(1); // 70 tegen 70 nee, 80 tegen 70 ja
  });

  it("telt met alleenVerdeeld alleen stemmingen waarop fracties voor en tegen stemden", () => {
    const m = basis(["VVVV", "VVTT", "TTTT"]);
    expect(bereken(m, ["a"]).eensgezind).toBe(3);
    expect(bereken(m, ["a"], zetelTabel(m), true).eensgezind).toBe(1);
  });

  it("onthoudt op welke stemmingen een partner beslissend was", () => {
    const m = basis(["VTTV", "VVTT", "VVTT"]);
    const b = bereken(m, ["a"]).partners.find((p) => p.afkorting === "B")!;
    expect(b.beslissendIn).toEqual([1, 2]);
  });
});
