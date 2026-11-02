// Tests voor de klikteller (lib/klik.ts, migratie 029): alleen geldige via-codes, de code voor het hekje, en het apparaat
// als grove soort.
import { describe, expect, it } from "vitest";
import { apparaatVan, metVia, schoneVia } from "../lib/klik";

describe("klikteller", () => {
  it("laat alleen geldige via-codes door", () => {
    expect(schoneVia("bs-12")).toBe("bs-12");
    expect(schoneVia("li-1")).toBe("li-1");
    expect(schoneVia("bs-")).toBeNull();
    expect(schoneVia("x-12")).toBeNull();
    expect(schoneVia("bs-12<script>")).toBeNull();
    expect(schoneVia(["bs-12"])).toBeNull();
  });
  it("zet de via-code voor het hekje", () => {
    expect(metVia("/uitgelicht/vvd-en-pro#ranglijst", "bs-3")).toBe("/uitgelicht/vvd-en-pro?via=bs-3#ranglijst");
    expect(metVia("/verkenner?fractie=VVD", "bs-3")).toBe("/verkenner?fractie=VVD&via=bs-3");
    expect(metVia("/verkenner", null)).toBe("/verkenner");
  });
  it("bewaart alleen de grove soort apparaat", () => {
    expect(apparaatVan("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)")).toBe("mobiel");
    expect(apparaatVan("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari")).toBe("mobiel");
    expect(apparaatVan("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(apparaatVan("Mozilla/5.0 (Linux; Android 14; SM-X710)")).toBe("tablet");
    expect(apparaatVan("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe("desktop");
    expect(apparaatVan(null)).toBeNull();
  });
});
