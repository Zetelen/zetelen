// Tests voor Hoe lang duurt een wet? (lib/wetten.ts)
import { describe, expect, it } from "vitest";
import { type Wetsvoorstel, duurTekst, telling } from "../lib/wetten";

describe("duurTekst", () => {
  it("in gewone woorden", () => {
    expect(duurTekst(13)).toBe("13 dagen");
    expect(duurTekst(181)).toBe("6 maanden");
    expect(duurTekst(2175)).toBe("6 jaar");
    expect(duurTekst(1550)).toBe("ruim 4 jaar");
    expect(duurTekst(1700)).toBe("bijna 5 jaar");
  });
});

describe("telling", () => {
  const w = (nummer: string, soort: "W" | "I", ingediend: string, gestemd: string | null, uitslag: string | null): Wetsvoorstel => ({ nummer, soort, ingediend, gestemd, uitslag });
  const rijen = [
    w("1", "W", "2015-01-01", "2015-01-20", "aangenomen"),
    w("2", "W", "2015-01-01", "2015-07-01", "hamerstuk"),
    w("3", "I", "2016-01-01", "2018-01-01", "aangenomen"),
    w("4", "W", "2016-01-01", null, null),
    w("5", "W", "2024-01-01", "2024-02-01", "aangenomen"), // buiten het cohort
  ];
  it("telt alleen het cohort, met besluit, hamerstuk en zonder besluit apart", () => {
    const t = telling(rijen, 2010, 2022);
    expect(t.cohort).toHaveLength(4);
    expect(t.besloten).toHaveLength(3);
    expect(t.hamer).toBe(1);
    expect(t.zonder).toBe(1);
    expect(t.mediaan).toBe(181);
    expect(t.mediaanInitiatief).toBe(731);
    expect(t.perBak.reduce((a, b) => a + b.gestemd + b.hamer, 0)).toBe(3);
    expect(t.perBak.reduce((a, b) => a + b.initiatief, 0)).toBe(1);
  });
});
