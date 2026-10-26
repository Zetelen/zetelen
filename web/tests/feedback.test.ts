// Vragenlijst feedbackronde: alleen bekende vragen met geldige antwoorden gaan naar de database
import { describe, expect, it } from "vitest";
import { MAX_TEKST, schoonAntwoorden } from "../lib/feedback";

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
