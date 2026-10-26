// Conceptvlag Kamerleden (besluit Niels B1): de sitemap volgt de vlag
import { describe, expect, it } from "vitest";
import { KAMERLEDEN, PAGINAS } from "../lib/site";

describe("conceptvlag Kamerleden", () => {
  it("staat in de sitemap precies als de vlag aan staat", () => {
    expect(PAGINAS.includes("/kamerleden")).toBe(KAMERLEDEN);
  });
});
