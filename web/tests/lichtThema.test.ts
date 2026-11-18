// Contrast van het lichte leesthema (ontwerpronde fase B, 18 november 2026) tegen WCAG AA.
// De kleuren komen uit styles/tokens.css, blok [data-thema="licht"], zodat de test meegaat met een wijziging daar.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrast } from "../lib/kleur";

const css = readFileSync(join(__dirname, "..", "styles", "tokens.css"), "utf8");
const blok = css.slice(css.indexOf('[data-thema="licht"] {'), css.indexOf("}", css.indexOf('[data-thema="licht"] {')));
const kleur = (naam: string) => {
  const m = blok.match(new RegExp(`--${naam}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token ${naam} niet gevonden in het lichte thema`);
  return m[1];
};

describe("licht leesthema", () => {
  for (const voorgrond of ["tekst", "tekst-zacht", "koper", "goud"]) {
    for (const achtergrond of ["nacht-950", "nacht-900", "nacht-800"]) {
      it(`${voorgrond} op ${achtergrond} haalt 4,5`, () => {
        expect(contrast(kleur(voorgrond), kleur(achtergrond))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  // Op nacht-700 (knop gekozen, hover) staat alleen gewone tekst
  for (const voorgrond of ["tekst", "tekst-zacht"]) {
    it(`${voorgrond} op nacht-700 haalt 4,5`, () => {
      expect(contrast(kleur(voorgrond), kleur("nacht-700"))).toBeGreaterThanOrEqual(4.5);
    });
  }
  for (const achtergrond of ["nacht-950", "nacht-900", "nacht-800"]) {
    it(`lijn-licht op ${achtergrond} haalt 3 (randen)`, () => {
      expect(contrast(kleur("lijn-licht"), kleur(achtergrond))).toBeGreaterThanOrEqual(3);
    });
  }
  it("de body van een lichte pagina heeft dezelfde papierkleur als nacht-950", () => {
    const globals = readFileSync(join(__dirname, "..", "styles", "globals.css"), "utf8");
    expect(globals).toContain(`body:has(main[data-thema="licht"]) {\n  background: ${kleur("nacht-950")};`);
  });
});
