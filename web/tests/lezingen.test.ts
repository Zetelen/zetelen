// Tests voor de cijfers achter de vaste lezingen (lib/lezingen.ts)
import { describe, expect, it } from "vitest";
import type { Stemmatrix } from "../lib/coalitie";
import { meestemmen } from "../lib/lezingen";

// A 70 en B 10 vormen de groep; C 40 en D 30 de oppositie
const m: Stemmatrix = {
  fracties: [{ id: "a", afkorting: "A" }, { id: "b", afkorting: "B" }, { id: "c", afkorting: "C" }, { id: "d", afkorting: "D" }],
  stemmen: ["VVVT", "VVTT", "VVTV", "VVVV"],
  zetels: [[[0, 70]], [[0, 10]], [[0, 40]], [[0, 30]]],
};

describe("meestemmen", () => {
  it("telt alleen verdeelde eensgezinde stemmingen, en apart de krappe", () => {
    const u = meestemmen(m, ["A", "B"]);
    expect(u.eensgezind).toBe(3); // de unanieme vierde telt niet
    expect(u.gewonnen).toBe(3);
    expect(u.krappe).toBe(1); // 80 tegen 70
    const c = u.fracties.find((f) => f.afkorting === "C")!;
    expect(Math.round(c.alle)).toBe(33);
    expect(c.krap).toBe(0);
  });
});
