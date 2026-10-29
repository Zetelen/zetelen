// Tests voor de deellinks per grafiek (lib/deel.ts)
import { describe, expect, it } from "vitest";
import { deellinkVan, doelVan, halfjaarTekst, isGrafiek, plaatjeVan, schoneUitslag, titelVan, zoekVan } from "../lib/deel";

describe("deellinks", () => {
  it("neemt alleen de parameters van de grafiek mee, in vaste volgorde", () => {
    const zoek = new URLSearchParams("fractie=PVV&utm_source=x&periode=Rutte IV&soort=kabinet");
    expect(zoekVan("verkenner", zoek)).toBe("soort=kabinet&periode=Rutte+IV&fractie=PVV");
    expect(zoekVan("vvd-en-pro", zoek)).toBe("");
  });
  it("maakt deellink, plaatje en doel met dezelfde keuzes", () => {
    const zoek = { fractie: "D66", periode: "Jetten" };
    expect(deellinkVan("verkenner", zoek)).toBe("/deel/verkenner?periode=Jetten&fractie=D66");
    expect(plaatjeVan("verkenner", zoek)).toBe("/deel/verkenner/plaatje?periode=Jetten&fractie=D66");
    expect(doelVan("verkenner", zoek)).toBe("/verkenner?periode=Jetten&fractie=D66#zaal");
    expect(doelVan("brede-steun", {})).toBe("/#brede-steun");
    expect(deellinkVan("vvd-en-pro", { fractie: "X" })).toBe("/deel/vvd-en-pro");
  });
  it("noemt de gekozen partij en periode in de titel", () => {
    expect(titelVan("verkenner", { fractie: "PVV", periode: "Rutte IV", soort: "kabinet" })).toBe("Met wie stemt PVV het vaakst mee? (kabinet-Rutte IV)");
    expect(titelVan("verkenner", { periode: "2025-", soort: "kamerperiode" })).toBe("Met wie stemt een partij het vaakst mee? (Kamer 2025-)");
    expect(titelVan("vvd-en-pro", {})).toBe("Hoe vaak stemmen VVD en PRO hetzelfde?");
  });
  it("neemt de periode van Door de jaren mee in link en titel", () => {
    const zoek = { fractie: "VVD", met: "D66", van: "2011-01", tot: "2023-07" };
    expect(doelVan("trend", zoek)).toBe("/verkenner?fractie=VVD&met=D66&van=2011-01&tot=2023-07#door-de-jaren");
    expect(titelVan("trend", zoek)).toBe("Hoe vaak stemden VVD en D66 hetzelfde, van 2011 tot en met 2023?");
    expect(titelVan("trend", { fractie: "VVD", met: "D66" })).toBe("Hoe vaak stemden VVD en D66 hetzelfde, in de laatste tien jaar?");
    expect(halfjaarTekst("2023-07", true)).toBe("december 2023");
    expect(halfjaarTekst("2011-01")).toBe("januari 2011");
    expect(halfjaarTekst("2023-07-01", true)).toBe("december 2023");
  });
  it("kent alleen bekende grafieken", () => {
    expect(isGrafiek("verkenner")).toBe(true);
    expect(isGrafiek("constructor")).toBe(false);
    expect(isGrafiek("onbekend")).toBe(false);
  });
});

describe("deellinks van de overige grafieken", () => {
  it("geeft de keuzes van Stemgenoten niet door aan de pagina", () => {
    expect(doelVan("stemgenoten", { u: "PVV:62", b: "18", n: "25" })).toBe("/stemgenoten");
    expect(deellinkVan("stemgenoten", { u: "PVV:62", b: "18", n: "25" })).toBe("/deel/stemgenoten?u=PVV%3A62&b=18&n=25");
  });
  it("kiest het anker en het pad uit de keuzes", () => {
    expect(doelVan("onderwerpen", { fractie: "D66", met: "VVD" })).toBe("/onderwerpen?fractie=D66&met=VVD#vergelijking");
    expect(doelVan("onderwerpen", { fractie: "D66" })).toBe("/onderwerpen?fractie=D66#zelf");
    expect(doelVan("oppositie-kabinetten", { stuk: "Amendement" })).toBe("/oppositie?stuk=Amendement#amendementen");
    expect(doelVan("stemming", { casus: "motie-eerdmans" })).toBe("/uitgelicht/motie-eerdmans?casus=motie-eerdmans#stemming");
  });
  it("gebruikt het bestaande plaatje van de coalitie", () => {
    expect(plaatjeVan("coalitie", { groep: "D66,VVD" })).toBe("/coalitie/plaatje?groep=D66%2CVVD");
  });
  it("laat in de uitslag van Stemgenoten alleen bestaande partijen en percentages door", () => {
    const partijen = new Set(["PVV", "VVD", "D66"]);
    expect(schoneUitslag("PVV:62,VVD:58,Nep:99,D66:140,D66:40", partijen)).toBe("PVV:62,VVD:58,D66:40");
    expect(schoneUitslag("<script>:1", partijen)).toBeNull();
    expect(schoneUitslag("PVV:6.5", partijen)).toBeNull();
  });
});
