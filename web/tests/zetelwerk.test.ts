// Tests voor zetelwerk en het verhaal Oppositiewerk (lib/zetelwerk.ts, lib/oppositie.ts)
import { describe, expect, it } from "vitest";
import { hoofdstukJaren, hoofdstukKabinetten, hoofdstukNetwerk, kolom } from "../lib/oppositie";
import { type PersoonWerk, aandeel, kamerleden } from "../lib/zetelwerk";

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
    expect(stappen).toHaveLength(4);
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
  it("kleurt verbindingen over de grens tussen kabinet en oppositie", () => {
    const [stap] = hoofdstukNetwerk([{ kabinet: "K", verbindingen: [{ fractie_a: "A", fractie_b: "B", stukken: 4 }, { fractie_a: "B", fractie_b: "C", stukken: 2 }], rollen: new Map([["A", "kabinet"], ["B", "oppositie"], ["C", "oppositie"]]) }]);
    expect(stap.paden?.map((p) => p.tint)).toEqual(["#e0915a", "#566aa6"]);
    expect(stap.tekst).toContain("4 keer over de grens, het vaakst A met B");
  });
});
