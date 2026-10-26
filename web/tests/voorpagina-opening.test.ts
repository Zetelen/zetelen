// Opening van de voorpagina (B14): de cijfers komen uit api.zetelwerk_periode
import { describe, expect, it } from "vitest";
import { samenwerking } from "../lib/voorpagina";

const r = (periode: string, indiener_rol: string, ingediend: number, aangenomen: number, brede_steun: number, soort = "Motie") =>
  ({ periode, soort, indiener_rol, ingediend, aangenomen, brede_steun });

describe("samenwerking", () => {
  it("telt moties, aangenomen en brede steun van het kabinet, en het aandeel van de oppositie nu en toen", () => {
    const rijen = [r("Nu", "kabinet", 600, 500, 400), r("Nu", "oppositie", 2800, 1400, 1300), r("Nu", "oppositie", 50, 50, 50, "Amendement"),
      r("Eerst", "oppositie", 1000, 310, 200)];
    expect(samenwerking(rijen, "Nu", "Eerst")).toEqual({ moties: 3400, aangenomen: 1900, breed: 1700, oppositieNu: 50, oppositieEerst: 31, eerste: "Eerst" });
  });
  it("geeft null zonder gegevens", () => {
    expect(samenwerking([], "Nu", "Eerst")).toBeNull();
  });
});
