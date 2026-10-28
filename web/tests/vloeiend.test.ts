// Vloeiende lijnen: de kromme mag nooit boven of onder de punten uitschieten (monotoon per stuk)
import { describe, expect, it } from "vitest";
import { vloeiendPad } from "../lib/vloeiend";

// Bezierpunten uit het pad halen en de kromme bemonsteren
function bemonster(d: string): number[] {
  const getallen = d.replace(/[MC]/g, " ").trim().split(/[\s,]+/).map(Number);
  const ys: number[] = [];
  let x0 = getallen[0], y0 = getallen[1];
  for (let i = 2; i + 5 < getallen.length + 1; i += 6) {
    const [, y1, , y2, x3, y3] = getallen.slice(i, i + 6);
    for (let t = 0; t <= 1; t += 0.05) ys.push((1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3 * y3);
    x0 = x3; y0 = y3;
  }
  return ys;
}

describe("vloeiendPad", () => {
  it("gaat door elk punt", () => {
    const d = vloeiendPad([[0, 10], [10, 30], [20, 20], [30, 50]]);
    for (const p of ["0,10", "10,30", "20,20", "30,50"]) expect(d).toContain(p);
  });
  it("schiet niet boven het hoogste of onder het laagste punt uit", () => {
    const punten: Array<[number, number]> = [[0, 50], [10, 52], [20, 90], [30, 91], [40, 40], [50, 41]];
    for (const y of bemonster(vloeiendPad(punten))) {
      expect(y).toBeGreaterThanOrEqual(40 - 0.01);
      expect(y).toBeLessThanOrEqual(91 + 0.01);
    }
  });
  it("tekent twee punten als een rechte lijn en een punt als begin", () => {
    expect(vloeiendPad([[0, 0], [5, 5]])).toBe("M0,0 L5,5");
    expect(vloeiendPad([[1, 2]])).toBe("M1,2");
  });
});
