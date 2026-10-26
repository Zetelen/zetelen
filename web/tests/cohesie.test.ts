// Tests voor de keuze uit de URL, de fractie-URL en de ordening (lib/cohesie.ts, lib/ordening.ts)
import { describe, expect, it } from "vitest";
import { type FractieInPeriode, type Periode, keuzeUitUrl, procent, rolTekst, slug } from "../lib/cohesie";
import { ordenFracties } from "../lib/ordening";

const PERIODEN: Periode[] = [
  { soort: "kabinet", naam: "Jetten", begin: "2026-02-23", einde: null },
  { soort: "kabinet", naam: "Schoof", begin: "2024-07-02", einde: "2026-02-23" },
  { soort: "kamerperiode", naam: "2025-", begin: "2025-11-12", einde: null },
];

describe("keuzeUitUrl", () => {
  it("valt terug op het nieuwste kabinet en alle stemmingen", () => {
    const k = keuzeUitUrl({}, PERIODEN);
    expect(k).toEqual({ soort: "kabinet", periode: PERIODEN[0], variant: "alle" });
  });
  it("leest soort, periode en variant", () => {
    const k = keuzeUitUrl({ soort: "kabinet", periode: "Schoof", variant: "verdeeld" }, PERIODEN);
    expect(k.periode?.naam).toBe("Schoof");
    expect(k.variant).toBe("verdeeld");
  });
  it("geeft geen periode bij een onbekende naam (lege staat)", () => {
    expect(keuzeUitUrl({ periode: "Bestaat niet" }, PERIODEN).periode).toBeNull();
  });
});

describe("slug en procent", () => {
  it("maakt stabiele URL's", () => {
    expect(slug("Groep Markuszower")).toBe("groep-markuszower");
    expect(slug("Gündoğan")).toBe("gundogan");
    expect(slug("50PLUS/Klein")).toBe("50plus-klein");
  });
  it("schrijft procenten met een komma", () => {
    expect(procent(74.25, 1)).toBe("74,3%");
    expect(procent(null)).toBe("");
  });
});

describe("ordenFracties", () => {
  const f = (id: string, afkorting: string, inZaal: boolean, eerste = "2020-01-01"): FractieInPeriode => ({
    id, afkorting, naam: afkorting, zetels: 10, stemmingen: 100, eerste, laatste: "2021-01-01", inZaal, zetelsBegin: 10, bijBegin: true,
  });
  it("zet de zaal voorop en maakt dubbele afkortingen uniek", () => {
    const uit = ordenFracties([f("1", "Krol", false, "2020-05-03"), f("2", "Krol", false, "2020-08-06"), f("3", "VVD", true), f("4", "SP", true), f("5", "D66", true)], new Map());
    expect(uit.slice(0, 3).every((x) => x.inZaal)).toBe(true);
    expect(uit.slice(3).map((x) => x.afkorting)).toEqual(["Krol 2020-05", "Krol 2020-08"]);
  });
});

describe("rolTekst", () => {
  it("geeft oppositie zonder rol en de einddatum bij uittreden", () => {
    expect(rolTekst(undefined)).toBe("Oppositie");
    expect(rolTekst({ rol: "kabinet", tot: null })).toBe("Kabinet");
    expect(rolTekst({ rol: "gedoogsteun", tot: "2012-04-21" })).toBe("Gedoogsteun tot 21 april 2012");
  });
});
