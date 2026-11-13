// Tests voor de coalitiebouwer na K18 punt 3 (13 november 2026): de keuze bij snel tikken (3a), de snelkeuzes (3c) en
// de uitkomst van een groep met een meerderheid (3b).
import { describe, expect, it } from "vitest";
import { type Stemmatrix, bereken, groepUitUrl, snelkeuzes, wisselFractie, zonderElk } from "../lib/coalitie";
import { deellinkVan, doelVan } from "../lib/deel";

describe("keuze bij snel tikken (3a)", () => {
  // Twee tikken direct na elkaar. De oude bouwer rekende elke tik uit vanaf de keuze in de URL; die was bij de tweede
  // tik nog leeg, dus bleef alleen de tweede over. Met een functionele update bouwt de tweede tik voort op de eerste.
  const tikken = ["D66", "CDA"];
  it("bouwt twee tikken op elkaar op, als functionele update", () => {
    const updates = tikken.map((a) => (k: string[]) => wisselFractie(k, a));
    expect(updates.reduce((k, f) => f(k), [] as string[])).toEqual(["D66", "CDA"]);
  });
  it("verliest de eerste tik als beide vanaf dezelfde, verouderde keuze rekenen (de oude fout)", () => {
    const urlBijTweedeTik: string[] = []; // router.replace van de eerste tik was nog niet klaar
    const oud = tikken.map((a) => wisselFractie(urlBijTweedeTik, a));
    expect(oud[oud.length - 1]).toEqual(["CDA"]);
  });
  it("haalt een fractie eruit bij een tweede tik op dezelfde", () => {
    expect(wisselFractie(["D66", "CDA"], "D66")).toEqual(["CDA"]);
  });
  it("leest uit de URL alleen bestaande fracties, zonder dubbele", () => {
    expect(groepUitUrl("D66,Onzin,CDA,D66", ["D66", "CDA", "VVD"])).toEqual(["D66", "CDA"]);
    expect(groepUitUrl(null, ["D66"])).toEqual([]);
  });
});

describe("snelkeuzes (3c)", () => {
  const zaal = ["D66", "VVD", "CDA", "ChristenUnie", "50PLUS", "Groep Markuszower", "PRO"];
  const k = snelkeuzes(["D66", "VVD", "CDA"], ["ChristenUnie", "50PLUS", "Groep Markuszower"], "VVD", zaal);
  it("geeft het kabinet, het kabinet met de drie partijen en het kabinet zonder de VVD", () => {
    expect(k.map((x) => [x.id, x.naam, x.groep.join(",")])).toEqual([
      ["kabinet", "Huidig kabinet", "D66,VVD,CDA"],
      ["met-steun", "Kabinet + ChristenUnie, 50PLUS en Groep Markuszower", "D66,VVD,CDA,ChristenUnie,50PLUS,Groep Markuszower"],
      ["zonder-vvd", "D66 en CDA (zonder de VVD)", "D66,CDA"],
    ]);
  });
  it("laat een snelkeuze weg die niet kan", () => {
    expect(snelkeuzes(["D66", "VVD", "CDA"], [], "", zaal).map((x) => x.id)).toEqual(["kabinet"]);
    expect(snelkeuzes(["D66", "VVD", "CDA"], ["Bestaat niet"], "VVD", zaal).map((x) => x.id)).toEqual(["kabinet", "zonder-vvd"]);
  });
  it("heeft per snelkeuze een eigen deellink naar dezelfde groep", () => {
    const zonder = k.find((x) => x.id === "zonder-vvd")!;
    const zoek = { soort: "kabinet", periode: "Jetten", groep: zonder.groep.join(",") };
    expect(deellinkVan("coalitie", zoek)).toBe("/deel/coalitie?soort=kabinet&periode=Jetten&groep=D66%2CCDA");
    expect(doelVan("coalitie", zoek)).toBe("/coalitie?soort=kabinet&periode=Jetten&groep=D66%2CCDA#bouwer");
  });
});

describe("een groep met een meerderheid (3b)", () => {
  // Vier fracties: A 70, B 10, C 40, D 30 zetels
  const m: Stemmatrix = {
    fracties: [{ id: "a", afkorting: "A" }, { id: "b", afkorting: "B" }, { id: "c", afkorting: "C" }, { id: "d", afkorting: "D" }],
    stemmen: ["VVTT", "VTTV", "TTVV", "V-TT", "VVVV"],
    zetels: [[[0, 70]], [[0, 10]], [[0, 40]], [[0, 30]]],
  };
  it("telt hoe vaak de groep verdeeld stemde, alleen als alle fracties uit de groep stemden", () => {
    const u = bereken(m, ["a", "b"], undefined, true);
    // VVTT eensgezind, VTTV verdeeld binnen, TTVV eensgezind, V-TT telt niet (B stemde niet), VVVV niet verdeeld
    expect([u.eensgezind, u.verdeeldBinnen, u.gestemd]).toEqual([2, 1, 3]);
    const alle = bereken(m, ["a", "b"]);
    expect([alle.eensgezind, alle.verdeeldBinnen]).toEqual([3, 1]);
  });
  it("geeft per fractie de zetels zonder haar, en of dat nog een meerderheid is", () => {
    expect(zonderElk([{ afkorting: "D66", zetels: 26 }, { afkorting: "CDA", zetels: 18 }, { afkorting: "PRO", zetels: 20 }, { afkorting: "Volt", zetels: 1 },
      { afkorting: "ChristenUnie", zetels: 3 }, { afkorting: "50PLUS", zetels: 2 }, { afkorting: "Groep Markuszower", zetels: 7 }], 76))
      .toEqual([
        { afkorting: "D66", zetels: 51, meerderheid: false }, { afkorting: "CDA", zetels: 59, meerderheid: false },
        { afkorting: "PRO", zetels: 57, meerderheid: false }, { afkorting: "Volt", zetels: 76, meerderheid: true },
        { afkorting: "ChristenUnie", zetels: 74, meerderheid: false }, { afkorting: "50PLUS", zetels: 75, meerderheid: false },
        { afkorting: "Groep Markuszower", zetels: 70, meerderheid: false },
      ]);
  });
});
