// Tests voor de gedeelde uitsnede van een scrollverhaal op de telefoon (uitsnedeGroep in lib/verhaal.ts)
import { describe, expect, it } from "vitest";
import { type Pad, type Stap, uitsnedeGroep } from "../lib/verhaal";

const stap = (datum: string, paden: Pad[] = []): Stap => ({ datum, tekst: datum, stippen: [], labels: [], paden });
const raster: Pad = { d: "M0,0 H1", zacht: true, naam: "raster-50" };
const rang: Pad = { d: "M0,0 V1", zacht: true, naam: "rang-50" };

describe("uitsnedeGroep", () => {
  const stappen = [stap("ranglijst", [rang]), stap("lijn 1", [raster]), stap("lijn 2", [raster]), stap("lijn 3", [raster]), stap("onderwerp", [rang])];

  it("geeft opeenvolgende stappen met dezelfde as samen", () => {
    expect(uitsnedeGroep(stappen, 2).map((s) => s.datum)).toEqual(["lijn 1", "lijn 2", "lijn 3"]);
  });
  it("houdt een andere as apart, ook als die later terugkomt", () => {
    expect(uitsnedeGroep(stappen, 0).map((s) => s.datum)).toEqual(["ranglijst"]);
    expect(uitsnedeGroep(stappen, 4).map((s) => s.datum)).toEqual(["onderwerp"]);
  });
  it("telt alleen benoemde, zachte lijnen als as", () => {
    const los = [stap("a", [{ d: "M0,0", naam: "lijn-p-0" }]), stap("b", [{ d: "M0,0", naam: "lijn-p-0" }]), stap("c", [{ d: "M0,0", zacht: true }]), stap("d", [{ d: "M0,0", zacht: true }])];
    expect(uitsnedeGroep(los, 0)).toHaveLength(1);
    expect(uitsnedeGroep(los, 2)).toHaveLength(1);
  });
});
