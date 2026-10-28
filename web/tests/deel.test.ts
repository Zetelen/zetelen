// Tests voor de deellinks per grafiek (lib/deel.ts)
import { describe, expect, it } from "vitest";
import { deellinkVan, doelVan, isGrafiek, plaatjeVan, titelVan, zoekVan } from "../lib/deel";

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
  it("kent alleen bekende grafieken", () => {
    expect(isGrafiek("verkenner")).toBe(true);
    expect(isGrafiek("constructor")).toBe(false);
    expect(isGrafiek("onbekend")).toBe(false);
  });
});
