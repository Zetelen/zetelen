// Vragenlijst feedbackronde: alleen bekende vragen met geldige antwoorden gaan naar de database
import { describe, expect, it } from "vitest";
import { MAX_TEKST, schoonAntwoorden, schoonSnel } from "../lib/feedback";

describe("schoonAntwoorden", () => {
  it("houdt geldige antwoorden over en laat onbekende en lege weg", () => {
    expect(schoonAntwoorden({ indruk: "  helder  ", begrip: "4", pagina: "Verkenner", onbekend: "x", fout: "" }))
      .toEqual({ indruk: "helder", begrip: 4, pagina: "Verkenner" });
  });
  it("weigert een schaal buiten 1 tot 5, een onbekende keuze en een ongeldig mailadres", () => {
    expect(schoonAntwoorden({ begrip: 7, pagina: "Elders", mail: "geen-adres" })).toBeNull();
  });
  it("kort lange tekst in", () => {
    expect((schoonAntwoorden({ indruk: "x".repeat(5000) })!.indruk as string).length).toBe(MAX_TEKST);
  });
  it("geeft null bij geen object", () => {
    expect(schoonAntwoorden("tekst")).toBeNull();
    expect(schoonAntwoorden([1])).toBeNull();
  });
});

describe("snelle vraag", () => {
  it("neemt een geldige keuze en toelichting over, met het adres als pagina", () => {
    expect(schoonSnel({ duidelijk: "nee", onduidelijk: "  te veel tekst  " }, "/verkenner"))
      .toEqual({ pagina: "snel /verkenner", antwoorden: { duidelijk: "nee", onduidelijk: "te veel tekst" } });
    expect(schoonSnel({ duidelijk: "ja", onduidelijk: "" }, "/fracties/vvd")).toEqual({ pagina: "snel /fracties/vvd", antwoorden: { duidelijk: "ja" } });
  });
  it("weigert een onbekende keuze of een vreemd adres", () => {
    expect(schoonSnel({ duidelijk: "misschien" }, "/verkenner")).toBeNull();
    expect(schoonSnel({ duidelijk: "ja" }, "https://ergens.nl")).toBeNull();
    expect(schoonSnel({ duidelijk: "ja" }, "/verkenner?fractie=VVD")).toBeNull();
  });
});
