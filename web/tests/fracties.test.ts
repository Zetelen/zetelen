// Tests voor de rijen van de bullet chart (lib/fracties.ts)
import { describe, expect, it } from "vitest";
import type { FractieInPeriode } from "../lib/cohesie";
import { balken } from "../lib/fracties";

const f = (afkorting: string, zetelsBegin: number, bijBegin = true, zetels = zetelsBegin): FractieInPeriode => ({
  id: afkorting, afkorting, naam: afkorting, zetels, stemmingen: 100, eerste: "2025-01-01", laatste: "2026-01-01",
  inZaal: true, zetelsBegin, bijBegin,
});

describe("balken", () => {
  it("sorteert op zetels bij het begin en splitst de overstappers af", () => {
    const { rijen, nieuw } = balken(
      [f("VVD", 24), f("PVV", 37, true, 19), f("Groep Markuszower", 0, false, 7)],
      [{ van: "PVV", naar: "Groep Markuszower", leden: 3 }],
    );
    expect(rijen.map((r) => r.fractie.afkorting)).toEqual(["PVV", "VVD"]);
    expect(rijen[0]).toMatchObject({ zetels: 37, gebleven: 34, delen: [{ naar: "Groep Markuszower", leden: 3 }] });
    expect(nieuw).toHaveLength(1);
    expect(nieuw[0].uit).toEqual([{ van: "PVV", leden: 3 }]);
  });
  it("laat de balk nooit onder nul komen", () => {
    const { rijen } = balken([f("X", 2)], [{ van: "X", naar: "Y", leden: 5 }]);
    expect(rijen[0].gebleven).toBe(0);
  });
  it("telt overstappen naar dezelfde afkorting op", () => {
    const { rijen } = balken([f("A", 10)], [{ van: "A", naar: "B", leden: 1 }, { van: "A", naar: "B", leden: 1 }]);
    expect(rijen[0].delen).toEqual([{ naar: "B", leden: 2 }]);
  });
});
