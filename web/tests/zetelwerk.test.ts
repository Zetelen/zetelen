// Tests voor zetelwerk en het verhaal Oppositiewerk (lib/zetelwerk.ts, lib/oppositie.ts)
import { describe, expect, it } from "vitest";
import { hoofdstukJaren, hoofdstukKabinetten, hoofdstukNetwerk, hoofdstukTegenEnSamen, kolom, plaatsLabels } from "../lib/oppositie";
import { type Kamerlid, type PersoonWerk, aandeel, kamerleden, ranglijst } from "../lib/zetelwerk";

describe("zetelwerk", () => {
  it("geeft geen percentage onder 10 ingediende stukken", () => {
    expect(aandeel(3, 9)).toBeNull();
    expect(aandeel(5, 10)).toBe(50);
  });
  it("zet moties en amendementen van een Kamerlid in een rij, gesorteerd op moties", () => {
    const r = (persoon: string, soort: "Motie" | "Amendement", ingediend: number): PersoonWerk =>
      ({ persoon, naam: persoon, fractie_afkorting: "X", soort, ingediend, mede: 0, aangenomen: 0, brede_steun: 0 });
    const uit = kamerleden([r("a", "Motie", 3), r("b", "Motie", 8), r("a", "Amendement", 2)]);
    expect(uit.map((k) => k.persoon)).toEqual(["b", "a"]);
    expect(uit[1].amendement?.ingediend).toBe(2);
  });
});

describe("oppositie", () => {
  it("vult een kolom stippen van onder naar boven, met vaste sleutels per plek", () => {
    const s = kolom("k", 0, 100, 2, 10, 4, [{ aantal: 3, tint: "a", kleur: null }, { aantal: 1, tint: "b", kleur: "zacht" }]);
    expect(s.map((x) => [x.key, x.x, x.y, x.tint])).toEqual([["k-0", 0, 100, "a"], ["k-1", 10, 100, "a"], ["k-2", 0, 90, "a"], ["k-3", 10, 90, "b"]]);
  });
  it("bouwt hoofdstuk 1 met het verschil tussen het eerste en laatste volle jaar", () => {
    const rijen = [2010, 2011, 2012, 2025, 2026].flatMap((jaar) => [
      { jaar, soort: "Motie" as const, indiener_rol: "oppositie", ingediend: jaar === 2010 ? 1000 : 3000, aangenomen: 500 },
      { jaar, soort: "Motie" as const, indiener_rol: "kabinet", ingediend: 100, aangenomen: 90 },
    ]);
    const stappen = hoofdstukJaren(rijen, 2026);
    // Drie stappen en daarna de twee interpretaties, elk een eigen stap met een nummer (feedback Niels K2)
    expect(stappen).toHaveLength(5);
    expect(stappen.slice(3).map((s) => s.lezing)).toEqual([1, 2]);
    expect(stappen[0].tekst).toContain("In 2010 stemde de Kamer over 1.100 moties. In 2025 over 3.100");
    expect(stappen[0].tekst).toContain("2026 is nog niet om");
    // een stip is 50 moties: 2010 heeft 20 + 2 stippen
    expect(stappen[0].stippen.filter((s) => s.key.startsWith("j2010-"))).toHaveLength(22);
  });
  it("vergelijkt minderheids- en meerderheidskabinetten in hoofdstuk 3", () => {
    const rijen = ["A", "B"].flatMap((periode) => [
      { periode, soort: "Motie" as const, indiener_rol: "oppositie", ingediend: 1000, aangenomen: periode === "A" ? 400 : 200, brede_steun: 0 },
    ]);
    const stappen = hoofdstukKabinetten(rijen, ["A", "B"], "Motie", ["A"]);
    expect(stappen[2].tekst).toContain("gemiddeld 40% van de oppositiemoties het, onder de meerderheidskabinetten 20%");
  });
  it("zegt het eerlijk als minderheid en meerderheid nauwelijks verschillen", () => {
    const rijen = ["A", "B"].map((periode) => ({ periode, soort: "Motie" as const, indiener_rol: "oppositie", ingediend: 1000, aangenomen: periode === "A" ? 410 : 400, brede_steun: 0 }));
    expect(hoofdstukKabinetten(rijen, ["A", "B"], "Motie", ["A"])[2].tekst).toContain("Nauwelijks");
  });
  it("kleurt verbindingen over de grens tussen kabinet en oppositie", () => {
    const [stap] = hoofdstukNetwerk([{ kabinet: "K", verbindingen: [{ fractie_a: "A", fractie_b: "B", stukken: 4 }, { fractie_a: "B", fractie_b: "C", stukken: 2 }], rollen: new Map([["A", "kabinet"], ["B", "oppositie"], ["C", "oppositie"]]) }]);
    expect(stap.paden?.map((p) => p.tint)).toEqual(["#e0915a", "#566aa6"]);
    expect(stap.tekst).toContain("4 keer over de grens, het vaakst A met B");
  });
  it("zet labels van stippen die dicht bij elkaar liggen niet over elkaar, met een lijntje als het moet", () => {
    const stippen = ["DENK", "SP", "PvdD", "50PLUS", "GL"].map((tekst, i) => ({ x: 300 + i * 4, y: 300 + i * 3, r: 10, tekst }));
    const { labels, lijnen } = plaatsLabels(stippen);
    const doos = (l: (typeof labels)[number]) => {
      const b = l.tekst.length * 8.5 + 6;
      const x0 = l.anchor === "start" ? l.x - 3 : l.anchor === "end" ? l.x - b + 3 : l.x - b / 2;
      return { x0, y0: l.y - 14, x1: x0 + b, y1: l.y + 4 };
    };
    for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) {
      const a = doos(labels[i]), b = doos(labels[j]);
      expect(a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1).toBe(false);
    }
    expect(labels.every((l) => l.halo)).toBe(true);
    expect(lijnen.length).toBeGreaterThan(0);
  });
  it("laat de stippen van de spreiding doorschuiven naar het netwerk, met een brug zonder lijnen", () => {
    const spreiding = [{ datum: "a", tekst: "", stippen: [{ key: "f-A", x: 1, y: 1, kleur: null, tint: "#fff" }], labels: [] }];
    const netwerk = hoofdstukNetwerk([{ kabinet: "K", verbindingen: [{ fractie_a: "A", fractie_b: "B", stukken: 4 }], rollen: new Map([["A", "kabinet"], ["B", "oppositie"]]) }]);
    const stappen = hoofdstukTegenEnSamen(spreiding, netwerk);
    expect(stappen).toHaveLength(3);
    expect(stappen[1].paden).toEqual([]);
    expect(stappen[1].hoofdstuk).toContain("5");
    expect(stappen[2].hoofdstuk).toBeUndefined();
    expect(stappen[1].stippen.map((s) => s.key)).toContain("f-A");
    expect(stappen[1].stippen.find((s) => s.key === "f-A")?.tint).toBe("#fff");
    const tints = stappen[1].stippen.map((s) => s.tint);
    expect(new Set(tints).size).toBe(tints.length);
  });
});


describe("ranglijst (B2)", () => {
  const lid = (persoon: string, fractie: string, ingediend: number, aangenomen: number): Kamerlid => ({
    persoon, naam: persoon, fractie, motie: { persoon, naam: persoon, fractie_afkorting: fractie, soort: "Motie", ingediend, mede: 0, aangenomen, brede_steun: 0 },
  });
  const leden = [lid("A", "K", 20, 18), lid("B", "O", 40, 20), lid("C", "O", 10, 6), lid("D", "O", 9, 9), lid("E", "O", 20, 12)];
  const rolVan = (f: string | null) => (f === "K" ? "kabinet" : "oppositie");
  it("sorteert op aandeel aangenomen, alleen de eigen rol en vanaf 10 stukken", () => {
    expect(ranglijst(leden, "Motie", "oppositie", rolVan).map((p) => p.persoon)).toEqual(["E", "C", "B"]);
    expect(ranglijst(leden, "Motie", "kabinet", rolVan).map((p) => p.persoon)).toEqual(["A"]);
  });
  it("initiatiefwetten: elke wet telt, volgorde op het aantal aangenomen wetten (migratie 022)", () => {
    const wet = (persoon: string, ingediend: number, aangenomen: number) =>
      kamerleden([{ persoon, naam: persoon, fractie_afkorting: "O", soort: "Wetsvoorstel", ingediend, mede: 0, aangenomen, brede_steun: 0 }])[0];
    const uit = ranglijst([wet("P", 1, 1), wet("Q", 3, 2), wet("R", 2, 0)], "Wetsvoorstel", "oppositie", rolVan);
    expect(uit.map((p) => p.persoon)).toEqual(["Q", "P", "R"]);
    expect(wet("P", 1, 1).wetsvoorstel?.ingediend).toBe(1);
  });
  it("bij gelijk aandeel eerst wie meer indiende", () => {
    expect(ranglijst([lid("X", "O", 10, 5), lid("Y", "O", 20, 10)], "Motie", "oppositie", rolVan).map((p) => p.persoon)).toEqual(["Y", "X"]);
  });
});
