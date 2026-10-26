// Tests voor Tegen het advies in (lib/ontraden.ts)
import { describe, expect, it } from "vitest";
import { type Motie, rolVan, telling } from "../lib/ontraden";

const m = (n: string, d: string, o: Motie["o"], u: Motie["u"], f: string[]): Motie => ({ n, d, o, u, f });

describe("rolVan", () => {
  it("kabinet, oppositie of gemengd op de dag van indiening", () => {
    expect(rolVan(m("1", "2026-05-01", "O", 1, ["D66"]))).toBe("kabinet");
    expect(rolVan(m("2", "2026-05-01", "O", 1, ["PVV"]))).toBe("oppositie");
    expect(rolVan(m("3", "2026-05-01", "O", 1, ["D66", "PVV"]))).toBe("gemengd");
    expect(rolVan(m("4", "2024-09-01", "O", 1, ["PVV"]))).toBe("kabinet"); // Schoof
  });
});

describe("telling", () => {
  const rijen = [
    m("1", "2026-05-01", "O", 1, ["PVV"]), m("2", "2026-05-01", "O", 0, ["SP"]), m("3", "2026-05-01", "K", 1, ["D66"]),
    m("4", "2026-05-01", "K", null, ["D66"]), m("5", "2024-09-01", "O", 1, ["VVD"]),
  ];
  it("telt alleen moties met een stemming, en ontraden maar toch aangenomen apart", () => {
    const t = telling(rijen);
    expect(t.gestemd).toBe(4);
    expect(t.perOordeel.O).toEqual({ gestemd: 3, aangenomen: 2 });
    expect(t.tochAangenomen.map((x) => x.n)).toEqual(["1", "5"]);
    expect(t.perRol).toMatchObject({ oppositie: 1, kabinet: 1 });
    expect(t.perKabinet.find((k) => k.kabinet === "Jetten")).toEqual({ kabinet: "Jetten", aangenomen: 2, ontraden: 1 });
  });
});
