// Tests voor Actueel (lib/actueel.ts): de zinnen moeten kloppen met de vastgelegde cijfers, en de deellinks per blok
// mogen alleen bestaande stukken en blokken doorlaten.
import { describe, expect, it } from "vitest";
import { STUKKEN, datumTekst, mee, procent, schoonActueel, stukVan, thema, titelActueel, vierkantjes } from "../lib/actueel";
import { doelVan, deellinkVan } from "../lib/deel";

const stuk = stukVan("blok-kabinet")!;
const d = stuk.data;
const alleTekst = [stuk.kop, stuk.ziet, stuk.opvalt, stuk.aanleiding, ...stuk.blokken.flatMap((b) => [b.kop, ...b.tekst, b.data]),
  stuk.lezingen!.links.tekst, stuk.lezingen!.rechts.tekst, stuk.slot].join("\n");

describe("Actueel: blok tegenover kabinet", () => {
  it("heeft de vier vaste blokken in vaste volgorde", () => {
    expect(stuk.blokken.map((b) => b.id)).toEqual(["hecht", "mee", "wringt", "telt"]);
  });
  it("noemt de getallen uit de data, niet uit het hoofd", () => {
    const stik = thema(d, "Stikstof")!;
    expect(stuk.kop).toContain(`${stik.tegenover} van de ${stik.beide}`);
    for (const a of ["SGP", "PRO", "JA21", "BBB"]) expect(alleTekst).toContain(procent(mee(d, a)!.pct));
    expect(alleTekst).toContain(`${d.zetelsom.ref} zetels`);
    expect(alleTekst).toContain(`Het blok telt ${d.zetelsom.groep} zetels`);
  });
  it("zegt bij de zetels dat BBB en SGP allebei kunnen, niet alleen een van de twee", () => {
    expect(d.zetelsom.kleinsteMeerderheid).toEqual([["JA21", "BBB"], ["JA21", "SGP"]]);
    expect(alleTekst).toContain("BBB of SGP");
  });
  it("telt in blok 3 alleen stemmingen waarop beide groepen eensgezind waren", () => {
    for (const t of d.botspunten.themas) {
      expect(vierkantjes(t)).toHaveLength(t.beide);
      expect(vierkantjes(t).filter((x) => x.stand === "tegen")).toHaveLength(t.tegenover);
    }
  });
  it("volgt de tone of voice: geen ik, wij of lange streepjes", () => {
    expect(alleTekst).not.toMatch(/\b(we|wij|ons|onze|ik)\b/i);
    expect(alleTekst).not.toMatch(/[—–]/);
  });
  it("schrijft een datum voluit", () => {
    expect(datumTekst("2026-10-29")).toBe("29 oktober 2026");
  });
  it("heeft unieke slugs", () => {
    expect(new Set(STUKKEN.map((x) => x.slug)).size).toBe(STUKKEN.length);
  });
});

describe("Actueel: delen per blok", () => {
  it("linkt naar het blok op de pagina", () => {
    expect(deellinkVan("actueel", { stuk: "blok-kabinet", blok: "telt" })).toBe("/deel/actueel?stuk=blok-kabinet&blok=telt");
    expect(doelVan("actueel", { stuk: "blok-kabinet", blok: "telt" })).toBe("/actueel/blok-kabinet#telt");
  });
  it("laat alleen bestaande stukken en blokken door", () => {
    expect(schoonActueel({ stuk: "blok-kabinet", blok: "telt" })).toEqual({ stuk: "blok-kabinet", blok: "telt" });
    expect(schoonActueel({ stuk: "blok-kabinet", blok: "<script>" })).toEqual({ stuk: "blok-kabinet" });
    expect(schoonActueel({ stuk: "bestaat-niet", blok: "telt" })).toEqual({});
  });
  it("gebruikt de kop van het blok als titel", () => {
    expect(titelActueel({ stuk: "blok-kabinet", blok: "hecht" })).toBe("Het blok is hecht, het kabinet hechter");
  });
});
