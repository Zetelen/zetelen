// Conceptvlag Kamerleden (besluit Niels B1): de sitemap volgt de vlag. En de SEO-afspraken uit de audit van
// 26 oktober: geen pagina in de sitemap die zelf noindex zet, elke pagina een canonical naar zijn eigen pad,
// en in productie altijd het eigen domein.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DOMEIN, KAMERLEDEN, PAGINAS, siteUrl } from "../lib/site";

const bron = (pad: string) => readFileSync(join(__dirname, "..", "app", pad === "/" ? "" : pad, "page.tsx"), "utf8");

describe("conceptvlag Kamerleden", () => {
  it("staat in de sitemap precies als de vlag aan staat", () => {
    expect(PAGINAS.includes("/kamerleden")).toBe(KAMERLEDEN);
  });
});

describe("sitemap en metadata", () => {
  it.each(PAGINAS)("%s zet zelf geen noindex", (pad) => {
    expect(bron(pad)).not.toMatch(/index:\s*false/);
  });
  it.each(PAGINAS)("%s heeft een canonical naar zijn eigen pad", (pad) => {
    expect(bron(pad)).toContain(`canonical: "${pad}"`);
  });
});

describe("domein", () => {
  afterEach(() => vi.unstubAllEnvs());
  it("is in productie altijd zetelen.nl", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "zetelen.vercel.app");
    expect(siteUrl().toString()).toBe(`${DOMEIN}/`);
  });
  it("volgt in een preview het Vercel-adres", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "zetelen.vercel.app");
    expect(siteUrl().host).toBe("zetelen.vercel.app");
  });
});
