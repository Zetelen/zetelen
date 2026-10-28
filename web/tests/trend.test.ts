// Cohesie door de jaren: halve jaren, optellen over een gekozen periode en de toelichting over wat uitvalt
import { describe, expect, it } from "vitest";
import opvolgers from "../content/fractie-opvolgers.json";
import { type Opvolger, halveJaren, lijnVan, punten, reeksTekst, samenvatting, uitvalTekst } from "../lib/trend";

describe("halveJaren", () => {
  it("loopt van januari 2010 tot en met het halve jaar van vandaag", () => {
    const h = halveJaren(new Date(2011, 7, 1));
    expect(h).toEqual(["2010-01-01", "2010-07-01", "2011-01-01", "2011-07-01"]);
  });
});

describe("punten en samenvatting", () => {
  const jaren = ["2010-01-01", "2010-07-01", "2011-01-01", "2011-07-01", "2012-01-01"];
  const rijen = [
    { halfjaar: "2010-07-01", gezamenlijk: 10, gelijk: 9 },
    { halfjaar: "2011-01-01", gezamenlijk: 100, gelijk: 80 },
    { halfjaar: "2011-07-01", gezamenlijk: 50, gelijk: 20 },
  ];
  const p = punten(rijen, jaren);
  it("geeft een punt per half jaar, zonder percentage onder de 25 stemmingen", () => {
    expect(p.map((x) => x.cohesie)).toEqual([null, null, 80, 40, null]);
    expect(p[0].gezamenlijk).toBe(0);
  });
  it("telt de tellingen op, niet de percentages", () => {
    const sv = samenvatting(p, 0, 4);
    expect(sv.gezamenlijk).toBe(160);
    expect(sv.cohesie).toBeCloseTo((100 * 109) / 160);
    expect(sv.zonder).toEqual(["2010-01-01", "2012-01-01"]);
    expect(sv.teWeinig).toEqual(["2010-07-01"]);
  });
  it("noemt in de toelichting wat er in de gekozen periode uitvalt", () => {
    const t = uitvalTekst("A", "B", samenvatting(p, 0, 2), jaren);
    expect(t).toContain("januari 2010 tot en met juni 2010");
    expect(t).toContain("Te weinig stemmingen samen (minder dan 25) voor een eigen punt in juli 2010 tot en met december 2010");
    expect(uitvalTekst("A", "B", samenvatting(p, 2, 3), jaren)).toBeNull();
  });
  it("voegt aaneengesloten halve jaren samen", () => {
    expect(reeksTekst(["2010-01-01", "2010-07-01", "2012-01-01"], jaren)).toEqual(["januari 2010 tot en met december 2010", "januari 2012 tot en met juni 2012"]);
  });
});

describe("opvolgers", () => {
  const o = opvolgers.opvolgers as Opvolger[];
  const GLPVDA = "0208097d-ef04-438a-8c29-eebb84956204", PRO = "d60f373a-5bb2-477f-9979-a8f3a0514e6b";
  it("maakt van een naamswijziging één lijn met de nieuwste naam, vanaf beide kanten", () => {
    for (const [id, afk] of [[PRO, "PRO"], [GLPVDA, "GroenLinks-PvdA"]]) {
      const l = lijnVan(id, afk, o);
      expect(l.naam).toBe("PRO");
      expect(l.ids.sort()).toEqual([GLPVDA, PRO].sort());
      expect(l.eerder).toEqual(["GroenLinks-PvdA"]);
    }
  });
  it("geeft bij een fusie de voorgangers als aparte lijnen", () => {
    expect(lijnVan(PRO, "PRO", o).voorgangers.map((v) => v.afkorting)).toEqual(["GL", "PvdA"]);
  });
  it("laat een fractie zonder opvolger zoals ze is", () => {
    const l = lijnVan("x", "VVD", o);
    expect(l).toEqual({ ids: ["x"], naam: "VVD", eerder: [], voorgangers: [], teksten: [] });
  });
  it("heeft alleen bekende soorten en geen fractie die naar zichzelf wijst", () => {
    for (const r of o) {
      expect(["fusie", "naamswijziging"]).toContain(r.soort);
      expect(r.van.map((v) => v.id)).not.toContain(r.naar.id);
    }
  });
});
