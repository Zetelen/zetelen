// Tests voor het scrollverhaal VVD en PRO (lib/vvdProVerhaal.ts): volgorde van de stappen en de bullet chart
import { describe, expect, it } from "vitest";
import type { TerreinPaar } from "../lib/onderwerpen";
import { halveJaren } from "../lib/trend";
import { type VerhaalInvoer, vvdProVerhaal } from "../lib/vvdProVerhaal";

const jaren = halveJaren(new Date("2026-10-28"));
const reeks = (c: number) => jaren.map((h) => ({ halfjaar: h, gezamenlijk: 100, gelijk: c, cohesie: c }));
const invoer: VerhaalInvoer = {
  rangorde: [{ naam: "CDA", cohesie: 92 }, { naam: "PRO", cohesie: 62 }, { naam: "Nieuw", cohesie: 55 }],
  gemiddeld: { CDA: 83, PvdA: 62, GL: 50 },
  pro: reeks(60), pvda: reeks(55), gl: reeks(50), pvv: reeks(54), anderen: [{ naam: "CDA", punten: reeks(80) }],
  perKabinet: { r1: 40, r2: 78, r3: 47, r2Gl: 43 }, pvvSamen: 70, pvvOppositie: 54,
  terreinen: [{ terrein: "Zorg", cohesie: 70, gezamenlijk: 80 }, { terrein: "Wonen", cohesie: 40, gezamenlijk: 60 }] as TerreinPaar[],
  rutte2: { begin: "2012-11-05", einde: "2017-10-26" }, kabinet: "Jetten",
};

describe("vvdProVerhaal", () => {
  it("vertelt eerst Rutte II en daarna dat GroenLinks en PvdA samen optrokken, met een venster", () => {
    const st = vvdProVerhaal(invoer);
    const i = (d: string) => st.findIndex((x) => x.datum === d);
    expect(i("Rutte II")).toBeLessThan(i("na Rutte II"));
    expect(i("na Rutte II")).toBeLessThan(i("2018 tot 2023"));
    expect(st.some((x) => x.datum === "2010 tot 2023")).toBe(false);
    expect(st[i("2018 tot 2023")].paden?.map((p) => p.naam)).toEqual(expect.arrayContaining(["samen-van", "samen-tot"]));
  });

  it("tekent de ranglijst als balken met een streepje voor 2010 tot en met 2023, bij PRO PvdA en GL", () => {
    const eerste = vvdProVerhaal(invoer)[0];
    const namen = eerste.paden!.map((p) => p.naam);
    expect(namen).toEqual(expect.arrayContaining(["balk-CDA", "balk-PRO", "gem-CDA-0", "gem-PRO-0", "gem-PRO-1"]));
    expect(namen.some((n) => n?.startsWith("gem-Nieuw"))).toBe(false);
  });

  it("maakt de telefoonversie hoger, niet breder", () => {
    const hoogste = (st: ReturnType<typeof vvdProVerhaal>) => Math.max(...st[0].stippen.map((p) => p.y));
    const breedste = (st: ReturnType<typeof vvdProVerhaal>) => Math.max(...st[0].stippen.map((p) => p.x));
    expect(hoogste(vvdProVerhaal(invoer, true))).toBeGreaterThan(hoogste(vvdProVerhaal(invoer)));
    expect(breedste(vvdProVerhaal(invoer, true))).toBe(breedste(vvdProVerhaal(invoer)));
  });
});
