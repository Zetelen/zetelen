// Tests voor Actueel (lib/actueel.ts): de zinnen moeten kloppen met de vastgelegde cijfers, en de deellinks per blok
// mogen alleen bestaande stukken en blokken doorlaten.
import { describe, expect, it } from "vitest";
import { STUKKEN, aantal, datumTekst, mee, opDrieThemas, perThema, procent, schoonActueel, stukVan, thema, titelActueel, vierkantjes } from "../lib/actueel";
import { doelVan, deellinkVan } from "../lib/deel";

const stuk = stukVan("blok-kabinet")!;
const d = stuk.data;
const alleTekst = [stuk.kop, stuk.ziet, stuk.opvalt, stuk.aanleiding, ...stuk.blokken.flatMap((b) => [b.kop, ...b.tekst, b.data]),
  stuk.lezingen!.links.tekst, stuk.lezingen!.rechts.tekst, stuk.slot].join("\n");

describe("Actueel: blok tegenover kabinet", () => {
  it("heeft de vier blokken in de volgorde van het verhaal", () => {
    expect(stuk.blokken.map((b) => b.id)).toEqual(["mee", "wringt", "abortus", "telt"]);
  });
  it("noemt de getallen uit de data, niet uit het hoofd", () => {
    const drie = d.botspunten.themas;
    expect(stuk.opvalt).toContain(`${drie.reduce((n, t) => n + t.tegenover, 0)} van de ${drie.reduce((n, t) => n + t.beide, 0)} keer tegenover het kabinet`);
    expect(stuk.blokken[0].tekst[0]).toContain(`(${aantal(d.meegaan.groep.eensgezind)} keer), dan koos het ${aantal(d.meegaan.groep.mee)} keer dezelfde kant als het kabinet, in ${procent(d.meegaan.groep.pct)}`);
    expect(thema(d, "Stikstof")!.tegenover).toBe(26);
    for (const a of ["SGP", "PRO", "JA21", "BBB"]) expect(alleTekst).toContain(procent(mee(d, a)!.pct));
    expect(alleTekst).toContain(`${d.zetelsom.ref} zetels`);
    expect(stuk.blokken[3].kop).toContain(`${d.zetelsom.samen} zetels`);
  });
  it("noemt bij abortus de aantallen per fractie uit de data", () => {
    const ab = perThema(d, "Abortus, embryo, draagmoeder")!;
    const f = (a: string) => ab.fracties.find((x) => x.afkorting === a)!;
    const tekst = stuk.blokken[2].tekst.join(" ");
    expect(tekst).toContain(`stemde het blok ${ab.groepEensgezind} keer eensgezind`);
    expect(tekst).toContain(`JA21 ging ${f("JA21").mee} van de ${f("JA21").gestemd} keer mee`);
    expect(tekst).toContain(`De SGP deed dat ${f("SGP").mee} keer, BBB ${f("BBB").mee} keer`);
  });
  it("trekt in de slotzin de conclusie met de getallen uit de data, in twee zinnen voor de video", () => {
    const ab = perThema(d, "Abortus, embryo, draagmoeder")!;
    expect(stuk.slot).toContain("38 van de 41 keer de andere kant");
    expect(stuk.slot).toContain(`${ab.groepEensgezind} van de ${ab.verdeeld} keer eensgezind`);
    expect(stuk.slot.split(/(?<=\.) /)).toHaveLength(2);
  });
  it("zet het contrast en de conclusie voorop, zoals in de video", () => {
    expect(stuk.kop).toBe("Het blok stelt eisen waar het kabinet tot nu toe bijna altijd de andere kant koos");
    expect(stuk.opvalt.startsWith("Op stikstof, asiel en abortus stemden JA21, BBB en SGP in 12 tot 32% mee met het kabinet, over alle onderwerpen in 60 tot 74%")).toBe(true);
    expect(stuk.opvalt).toContain("38 van de 41 keer tegenover het kabinet");
    expect(stuk.blokken[1].kop).toBe("Op stikstof, asiel en abortus stemden ze in 12 tot 32% mee, over alles in 60 tot 74%");
    expect(opDrieThemas(d).map((f) => [f.afkorting, f.mee, f.gestemd])).toEqual([["JA21", 19, 60], ["BBB", 7, 60], ["SGP", 11, 60]]);
    expect(stuk.blokken[0].kop).toContain(`PRO in ${procent(mee(d, "PRO")!.pct)}`);
  });
  it("zegt niet wie nodig is, want de Eerste Kamer staat niet in de data", () => {
    expect(alleTekst).not.toMatch(/heeft het kabinet \w+ nodig|te groot|niet nodig/);
    expect(alleTekst).toContain("Eerste Kamer");
  });
  it("heeft per thema eerst alle stemmingen als vergelijking", () => {
    expect(d.perThema.map((t) => t.thema)).toEqual(["Alles", ...d.botspunten.themas.map((t) => t.thema)]);
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
    expect(titelActueel({ stuk: "blok-kabinet", blok: "abortus" })).toBe("Bij abortus valt het blok uiteen");
  });
});
