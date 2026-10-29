// Tests voor het inpakken van de stippen van een scrollverhaal (lib/verhaalPak.ts)
import { describe, expect, it } from "vitest";
import type { Verhaal } from "../lib/verhaal";
import { pakUit, pakVerhaal } from "../lib/verhaalPak";

const verhaal: Verhaal = {
  breed: [
    { datum: "a", tekst: "een", labels: [{ x: 1, y: 2, tekst: "VVD" }], stippen: [
      { key: "s1", x: 10, y: 20.5, kleur: null, tint: "#566aa6", r: 5.6 },
      { key: "s2", x: 11, y: 21, kleur: "kabinet", tint: "#d2bb5a", wacht: 120 },
    ] },
    { datum: "b", tekst: "twee", labels: [], stippen: [{ key: "s1", x: 30, y: 40, kleur: "hol", tint: "#566aa6" }] },
  ],
  smal: [{ datum: "c", tekst: "drie", labels: [], stippen: [{ key: "s3", x: 0, y: 0, kleur: "uit", tint: "#fff", r: 0 }] }],
};

describe("stippen inpakken", () => {
  it("geeft na uitpakken precies hetzelfde verhaal terug", () => {
    expect(pakUit(pakVerhaal(verhaal))).toEqual(verhaal);
  });
  it("zet sleutels en tinten één keer in de woordenlijst", () => {
    const g = pakVerhaal(verhaal);
    expect(g.sleutels).toEqual(["s1", "s2", "s3"]);
    expect(g.tinten).toEqual(["#566aa6", "#d2bb5a", "#fff"]);
    expect(g.breed[0].stippen).toEqual([0, 10, 20.5, 0, 0, 5.6, -1, 1, 11, 21, 1, 1, -1, 120]);
  });
  it("rondt de straal af op een tiende", () => {
    const g = pakVerhaal({ breed: [{ datum: "", tekst: "", labels: [], stippen: [{ key: "a", x: 1, y: 2, kleur: null, tint: "#000", r: 16.93025150224688 }] }] });
    expect(pakUit(g).breed[0].stippen[0].r).toBe(16.9);
  });
  it("laat een verhaal zonder telefoonversie zonder telefoonversie", () => {
    expect("smal" in pakUit(pakVerhaal({ breed: verhaal.breed }))).toBe(false);
  });
});
