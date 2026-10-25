// Tests voor de rekenkern van de scroll graphics (lib/verhaal.ts)
import { describe, expect, it } from "vitest";
import { blokken, sleutels, stemZaal, zaal } from "../lib/verhaal";

describe("zaal", () => {
  it("vult precies de zetels van de fracties, in de vaste volgorde", () => {
    const z = zaal({ PVV: 37, VVD: 24, PvdD: 3 });
    expect(z).toHaveLength(64);
    expect(z[0].fractie).toBe("PvdD");
    expect(z[z.length - 1].fractie).toBe("PVV");
  });
});

describe("sleutels", () => {
  it("houdt stippen bij een fractie en geeft een opvolger de stippen van zijn voorganger", () => {
    const [a, b] = sleutels([zaal({ PVV: 26, VVD: 22 }), zaal({ PVV: 19, "Groep Markuszower": 7, VVD: 22 })]);
    const pvvVoor = new Set(a.slice(22));
    const nieuw = b.slice(22 + 19);
    expect(nieuw.every((k) => pvvVoor.has(k))).toBe(true);
    expect(new Set(b).size).toBe(48);
  });
});

describe("stemming", () => {
  const st = { Voor: { VVD: 23 }, Tegen: { VVD: 1, PVV: 34 }, "Niet deelgenomen": { PVV: 3 } };
  it("geeft elke zetel een stem en telt per stem goed", () => {
    const z = stemZaal(st);
    expect(z).toHaveLength(61);
    expect(z.filter((p) => p.stem === "Tegen" && p.fractie === "VVD")).toHaveLength(1);
    expect(z.filter((p) => p.stem === "Niet deelgenomen")).toHaveLength(3);
  });
  it("zet in blokken elke stip een keer neer, met een label per fractie als gegroepeerd", () => {
    const z = stemZaal(st);
    const b = blokken(z, true, false);
    expect(b.stippen).toHaveLength(61);
    expect(new Set(b.stippen.map((p) => p.key)).size).toBe(61);
    expect(b.labels.map((l) => l.tekst)).toEqual(["Voor", "VVD", "Tegen", "VVD", "PVV", "Niet deelgenomen", "PVV"]);
  });
});
