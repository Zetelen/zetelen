// Tests voor het Actueel-stuk "kabinet-cu-50plus" (lib/actueel.ts): de zinnen moeten kloppen met de vastgelegde cijfers,
// en de tekst moet neutraal blijven: de cijfers gaan over stemgedrag, niet over hoe logisch een combinatie is.
import { describe, expect, it } from "vitest";
import { aantal, gemiddelde, mee, paarCohesie, perFractieGemiddelde, procent, schoonActueel, stukVan, titelActueel } from "../lib/actueel";
import { deellinkVan, doelVan } from "../lib/deel";

const stuk = stukVan("kabinet-cu-50plus")!;
const d = stuk.data;
const M = "Groep Markuszower";
const alleTekst = [stuk.kop, stuk.beschrijving, stuk.ziet, stuk.opvalt, stuk.aanleiding, ...stuk.blokken.flatMap((b) => [b.vraag, b.kop, ...b.tekst, b.data]),
  stuk.lezingen!.links.titel, stuk.lezingen!.links.tekst, stuk.lezingen!.rechts.titel, stuk.lezingen!.rechts.tekst, stuk.slot].join("\n");

describe("Actueel: kabinet met ChristenUnie, 50PLUS en Groep Markuszower", () => {
  it("heeft de vier blokken in de volgorde van het verhaal", () => {
    expect(stuk.blokken.map((b) => b.id)).toEqual(["hecht", "stappen", "telt", "steun"]);
  });
  it("noemt de gemiddelden uit de data en ze dalen per stap", () => {
    const [g3, g5, g6] = ["kabinet", "met-cu-50plus", "met-markuszower"].map((n) => gemiddelde(d, n));
    expect([g3.paren, g5.paren, g6.paren]).toEqual([3, 10, 15]);
    expect(g3.gemiddelde).toBeGreaterThan(g5.gemiddelde);
    expect(g5.gemiddelde).toBeGreaterThan(g6.gemiddelde);
    expect(stuk.blokken[0].kop).toBe(`Het gemiddelde zakt van ${procent(g3.gemiddelde)} bij het kabinet naar ${procent(g5.gemiddelde)} met ChristenUnie en 50PLUS, en naar ${procent(g6.gemiddelde)} met de ${M}`);
  });
  it("klopt het gemiddelde met de paren: ongewogen gemiddelde van alle paren in de groep", () => {
    const zes = gemiddelde(d, "met-markuszower").fracties;
    const waarden: number[] = [];
    zes.forEach((a, i) => zes.slice(i + 1).forEach((b) => waarden.push(paarCohesie(d, a, b))));
    expect(waarden).toHaveLength(15);
    expect(Math.round((waarden.reduce((x, y) => x + y, 0) / 15) * 10) / 10).toBe(gemiddelde(d, "met-markuszower").gemiddelde);
  });
  it("zegt dat de kop waar is: ChristenUnie en 50PLUS gaan vaker mee dan de Groep Markuszower", () => {
    expect(mee(d, "ChristenUnie")!.pct!).toBeGreaterThan(mee(d, M)!.pct!);
    expect(mee(d, "50PLUS")!.pct!).toBeGreaterThan(mee(d, M)!.pct!);
    expect(perFractieGemiddelde(d, M)).toBeLessThan(perFractieGemiddelde(d, "ChristenUnie"));
    expect(perFractieGemiddelde(d, M)).toBeLessThan(perFractieGemiddelde(d, "50PLUS"));
  });
  it("noemt bij het meegaan de aantallen per fractie", () => {
    // Eerst het blok met ChristenUnie en 50PLUS, dan de Groep Markuszower erbij, dan de PVV ter vergelijking
    for (const a of ["ChristenUnie", "50PLUS"]) {
      const f = mee(d, a)!;
      expect(stuk.blokken[1].tekst[0]).toContain(`${aantal(f.mee)} van de ${aantal(f.gestemd)}`);
    }
    const mk = mee(d, M)!;
    expect(stuk.blokken[1].tekst[0]).not.toContain(M);
    expect(stuk.blokken[1].tekst[1]).toContain(`De ${M}, die erbij komt, koos op ${aantal(mk.mee)} van de ${aantal(mk.gestemd)} stemmingen waarop ze stemde dezelfde kant, ${procent(mk.pct)}`);
    expect(stuk.blokken[1].tekst[1]).toContain(procent(mee(d, "PVV")!.pct));
    expect(stuk.aanleiding.indexOf("ChristenUnie")).toBeLessThan(stuk.aanleiding.indexOf(M));
  });
  it("rekent de zetels: de vijf partijen missen de meerderheid, met de Groep Markuszower niet", () => {
    const z = d.zetelsom;
    const vijf = z.ref + z.zetels.ChristenUnie + z.zetels["50PLUS"];
    expect(vijf).toBe(71);
    expect(z.samen).toBe(78);
    expect(vijf).toBeLessThan(z.meerderheid);
    expect(z.samen).toBeGreaterThanOrEqual(z.meerderheid);
    expect(stuk.blokken[2].kop).toBe(`Het kabinet, ChristenUnie en 50PLUS hebben samen ${vijf} zetels, met de ${M} ${z.samen}`);
    expect(z.ref + z.zetels.ChristenUnie + z.zetels[M]).toBeGreaterThanOrEqual(z.meerderheid);
    expect(stuk.blokken[2].tekst[0]).toContain(`brengen het kabinet op ${z.ref + z.zetels.ChristenUnie + z.zetels[M]}`);
  });
  it("telt bij de steun alleen stemmingen waarop de Groep Markuszower stemde, en de delen kloppen", () => {
    const x = d.doorslag!;
    expect(x.mee + x.tegen).toBe(x.gestemd);
    expect(x.gestemd + x.nietGestemd).toBe(x.eensgezind);
    expect(x.nodig).toBeLessThanOrEqual(x.mee);
    expect(x.kostte).toBeLessThanOrEqual(x.tegen);
    expect(stuk.blokken[3].tekst[0]).toContain(`${aantal(x.mee)} keer dezelfde kant en ${aantal(x.tegen)} keer de andere`);
    // Smalle formulering na de controle: de kant (de vijf plus anderen), niet "de vijf partijen", en geen "nodig voor een meerderheid van de vijf"
    expect(stuk.blokken[3].kop).toBe(x.nodig === 0
      ? "Waar de Groep Markuszower met de vijf partijen meestemde, bleef de uitslag ook zonder haar zetels dezelfde"
      : `Waar de Groep Markuszower met de vijf partijen meestemde, was de uitslag zonder haar zetels in ${aantal(x.nodig)} van de ${aantal(x.mee)} gevallen niet dezelfde geweest`);
    // Geen dubbelzinnige "die kant" (kon als "de vijf alleen" gelezen worden) en geen "nodig voor een meerderheid van de vijf"
    expect(alleTekst).not.toMatch(/meerderheid van de vijf partijen|kostte dat de vijf|die kant/);
    expect(stuk.blokken[3].tekst[1]).toContain(`was de uitslag ${x.kostte} keer anders geweest als haar ${d.zetelsom.zetels[M]} zetels bij de vijf partijen hadden gestaan`);
    expect(stuk.blokken[3].tekst[1]).toContain(`In ${x.krap} van de ${aantal(x.gestemd)} stemmingen was het verschil`);
  });
  it("noemt de Eerste Kamer en doet geen uitspraak over inhoudelijke aansluiting", () => {
    expect(alleTekst).toContain("Eerste Kamer");
    expect(alleTekst).not.toMatch(/\b(vreemd|onlogisch|past niet|hoort niet|past bij)\b/i);
    // De aanleiding noemt de bron (NOS) en dat er toen geen deal was, en doet geen uitspraak over rollen of verwachtingen
    expect(stuk.aanleiding).toContain("Er was toen geen deal (NOS, 29 en 31 oktober 2026: nos.nl/artikel/2637182 en nos.nl/artikel/2637476)");
    expect(stuk.aanleiding).toContain("(zetels volgens tweedekamer.nl, eigen optelling)");
    expect(stuk.aanleiding).toContain(`${d.zetelsom.ref + d.zetelsom.zetels.ChristenUnie + d.zetelsom.zetels["50PLUS"]} zetels, ${d.zetelsom.meerderheid - (d.zetelsom.ref + d.zetelsom.zetels.ChristenUnie + d.zetelsom.zetels["50PLUS"])} te weinig`);
    expect(stuk.aanleiding).not.toMatch(/denkbare combinatie|op de achtergrond|gedoog|onderhandelpartner|verwacht(ing)? dat/);
  });
  it("noemt in de lezingen de afwijking als complement van het meegaan, met de getallen uit de data", () => {
    const f = (a: string) => procent(100 - mee(d, a)!.pct!);
    expect(stuk.lezingen!.links.tekst).toContain(`(${f("ChristenUnie")} en ${f("50PLUS")}) kozen ze een andere kant`);
    expect(stuk.lezingen!.rechts.tekst).toContain(`koos in ${f(M)} van de stemmingen een andere kant`);
    expect(stuk.lezingen!.rechts.titel).toBe("De Groep Markuszower koos vaker dan ChristenUnie en 50PLUS een andere kant dan het eensgezinde kabinet");
    expect(stuk.lezingen!.links.titel).toBe(`ChristenUnie en 50PLUS kozen in ${procent(mee(d, "ChristenUnie")!.pct)} en ${procent(mee(d, "50PLUS")!.pct)} van de gevallen dezelfde kant als het eensgezinde kabinet`);
  });
  it("heeft een slot in twee zinnen voor de video", () => {
    expect(stuk.slot.split(/(?<=\.) /)).toHaveLength(2);
  });
  it("volgt de tone of voice: geen ik, wij of lange streepjes", () => {
    expect(alleTekst).not.toMatch(/\b(we|wij|ons|onze|ik)\b/i);
    expect(alleTekst).not.toMatch(/[—–]/);
  });
});

describe("Actueel: delen per blok van dit stuk", () => {
  it("linkt naar het blok op de pagina", () => {
    expect(deellinkVan("actueel", { stuk: "kabinet-cu-50plus", blok: "steun" })).toBe("/deel/actueel?stuk=kabinet-cu-50plus&blok=steun");
    expect(doelVan("actueel", { stuk: "kabinet-cu-50plus", blok: "steun" })).toBe("/actueel/kabinet-cu-50plus#steun");
  });
  it("laat alleen bestaande blokken door en gebruikt de kop als titel", () => {
    expect(schoonActueel({ stuk: "kabinet-cu-50plus", blok: "hecht" })).toEqual({ stuk: "kabinet-cu-50plus", blok: "hecht" });
    expect(schoonActueel({ stuk: "kabinet-cu-50plus", blok: "wringt" })).toEqual({ stuk: "kabinet-cu-50plus" });
    expect(titelActueel({ stuk: "kabinet-cu-50plus", blok: "telt" })).toBe(stuk.blokken[2].kop);
  });
});
