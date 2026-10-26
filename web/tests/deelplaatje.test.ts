// Tests voor de inhoud van het deelplaatje (E3-S5)
import { describe, expect, it } from "vitest";
import type { FractieInPeriode } from "../lib/cohesie";
import { plaatjeInhoud } from "../lib/deelplaatje";
import { type CohesieKaart, sleutel } from "../lib/zaal";

const f = (id: string, afkorting: string): FractieInPeriode => ({ id, afkorting, naam: afkorting, zetels: 10, stemmingen: 100, eerste: "2025-01-01", laatste: "2026-01-01", inZaal: true, zetelsBegin: 10, bijBegin: true });
const fracties = [f("a", "A"), f("b", "B"), f("c", "C"), f("d", "D")];
function kaart(paren: Array<[string, string, number | null, boolean]>): CohesieKaart {
  const k: CohesieKaart = new Map();
  for (const [x, y, c, weinig] of paren) {
    const p = { cohesie: c, gezamenlijk: weinig ? 10 : 100, teWeinig: weinig };
    k.set(sleutel(x, y), p);
    k.set(sleutel(y, x), p);
  }
  return k;
}

describe("plaatjeInhoud", () => {
  it("neemt de hoogste cijfers uit de database, in volgorde", () => {
    const u = plaatjeInhoud("A", fracties, kaart([["a", "b", 61.2, false], ["a", "c", 88.4, false], ["a", "d", null, true]]));
    expect(u.regels).toEqual([{ afkorting: "C", cohesie: 88.4 }, { afkorting: "B", cohesie: 61.2 }]);
    expect(u.teWeinig).toBe(false);
  });
  it("volgt het cijfer als dat in de database verandert", () => {
    const u = plaatjeInhoud("A", fracties, kaart([["a", "b", 95, false], ["a", "c", 88.4, false]]));
    expect(u.regels[0]).toEqual({ afkorting: "B", cohesie: 95 });
  });
  it("geeft te weinig data als er geen bruikbaar cijfer is", () => {
    expect(plaatjeInhoud("A", fracties, kaart([["a", "b", null, true]])).teWeinig).toBe(true);
    expect(plaatjeInhoud("X", fracties, kaart([])).teWeinig).toBe(true);
  });
});
