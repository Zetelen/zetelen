// Tests voor het Actueel-stuk "coalitie-verdeeld" (lib/actueel.ts): elke zin moet kloppen met de vastgelegde cijfers
// uit pipeline/coalitie_verdeeld.py, en het stuk mag niet botsen met akkoord-belastingplan.
import { describe, expect, it } from "vitest";
import data from "../content/actueel/coalitie-verdeeld.json";
import akkoordJson from "../content/actueel/akkoord-belastingplan.json";
import {
  type AkkoordData, type VerdeeldData, COALITIE_VERDEELD, STUKKEN, aantal, afwijkingAkkoord, anderen, bereik, buitenVan,
  coalitieVerdeeld, datumTekst, maandPct, maandTekst, metStemmingen, procent, schoonActueel, zonderLink,
} from "../lib/actueel";
import { deellinkVan, doelVan } from "../lib/deel";

const d = data as unknown as VerdeeldData;
const ak = akkoordJson as unknown as AkkoordData;
const stuk = coalitieVerdeeld(d, ak);
const blok = (id: string) => stuk.blokken.find((b) => b.id === id)!;
const tekstVan = (s: typeof stuk) => [s.kop, s.beschrijving, s.ziet, s.opvalt, s.aanleiding, ...s.blokken.flatMap((b) => [b.vraag, b.kop, ...b.tekst, b.data]), s.slot].join("\n");
const vanTot = (b: { min: number; max: number }) => `${Math.round(b.min)} tot ${procent(b.max)}`;

// Na de stand van akkoord-belastingplan (10 november) is in de bron één stemming van 10 november bijgewerkt
// (2026Z24248): daar telt de stem van de VVD niet meer. Daardoor staat de VVD tot dezelfde datum hier één keer minder
// alleen. Wordt akkoord-belastingplan opnieuw gedraaid, dan is het verschil weg en blijft de test groen.
const BEKEND_VERSCHIL: Record<string, number> = { VVD: 1 };

describe("Actueel: hoe vaak stemde de coalitie verdeeld", () => {
  it("heeft twee blokken, het goede label en staat tegelijk met het stuk over het Belastingplan op de site", () => {
    expect(stuk.blokken.map((b) => b.id)).toEqual(["maanden", "zonder"]);
    expect(stuk.label).toBe("Actueel · Kabinet-Jetten");
    expect(STUKKEN.some((s) => s.slug === "coalitie-verdeeld")).toBe(STUKKEN.some((s) => s.slug === "akkoord-belastingplan"));
    expect(COALITIE_VERDEELD.slug).toBe("coalitie-verdeeld");
    expect(stuk.verwijzing).toEqual({ href: "/actueel/akkoord-belastingplan", tekst: "Lees eerst het stuk over het Belastingplan" });
  });

  it("leest de partijen uit de data: kabinet uit api.coalitie, steun en partners uit de twee eerdere stukken", () => {
    expect(d.tegen).toEqual(["D66", "VVD", "CDA"]);
    expect(d.groep).toEqual(["D66", "CDA"]);
    expect(d.steun).toEqual(["ChristenUnie", "50PLUS", "Groep Markuszower"]);
    expect(d.partners).toEqual(ak.kamers.vier.filter((a) => !d.tegen.includes(a)));
    expect(d.begin).toBe("2026-02-23");
  });

  it("blok maanden: de som over de maanden is het totaal, en elke maand is binnen zijn noemer", () => {
    for (const a of d.tegen) expect(d.maanden.reduce((n, m) => n + m.alleen[a], 0)).toBe(d.totaal.alleen[a]);
    expect(d.maanden.reduce((n, m) => n + m.verdeeld, 0)).toBe(d.totaal.verdeeld);
    expect(d.totaal.verdeeld).toBe(d.verdeeld);
    for (const m of d.maanden) {
      // Met drie partijen die alle drie stemden staat er precies één alleen, of ze zijn eensgezind
      expect(d.tegen.reduce((n, a) => n + m.alleen[a], 0) + m.eensgezind).toBeLessThanOrEqual(m.verdeeld);
      if (m.van) expect(m.van.slice(0, 7)).toBe(m.maand);
    }
    // Maanden zonder gaten, van de start van het kabinet tot de stand
    expect(d.maanden[0].maand).toBe(d.begin.slice(0, 7));
    expect(d.maanden[d.maanden.length - 1].maand).toBe(d.stand.slice(0, 7));
  });

  it("blok maanden: dezelfde telling als blok buiten van akkoord-belastingplan; een verschil komt alleen uit de bron", () => {
    const j = buitenVan(ak, d.kabinet);
    expect(d.controle.stand).toBe(ak.stand);
    expect(d.controle.verdeeld).toBe(j.verdeeld);
    for (const p of j.partijen) expect(Math.abs(d.controle.alleen[p.afkorting] - p.keer)).toBeLessThanOrEqual(BEKEND_VERSCHIL[p.afkorting] ?? 0);
    // De datanoot zegt het, met de aantallen uit beide stukken
    const af = afwijkingAkkoord(d, ak);
    for (const x of af) expect(blok("maanden").data).toContain(`${x.afkorting === "VVD" ? "de VVD" : x.afkorting} ${aantal(x.hier)} keer in plaats van ${aantal(x.daar)}`);
    if (!af.length) expect(blok("maanden").data).toContain("zijn de aantallen gelijk aan blok \"alleen staan\" daar");
  });

  it("blok maanden: de kop en de zinnen noemen de getallen uit de data", () => {
    const b = blok("maanden"), t = d.totaal, [ander, derde] = anderen(d);
    expect([ander, derde]).toEqual(["D66", "CDA"]);
    // "ongeveer even vaak": over de hele periode minder dan 1 procentpunt verschil
    expect(Math.abs(t.alleen.VVD - t.alleen.D66) / t.verdeeld).toBeLessThan(0.01);
    expect(b.kop).toBe(`Sinds februari 2026 stond de VVD ongeveer even vaak alleen als D66, per maand in ${vanTot(bereik(d, "VVD"))} van de verdeelde stemmingen`);
    expect(b.tekst[0]).toBe(`Op ${aantal(t.verdeeld)} verdeelde stemmingen tot en met ${datumTekst(d.stand)} stond de VVD ${aantal(t.alleen.VVD)} keer alleen tegenover D66 en CDA: die twee stemden allebei en kozen dezelfde kant, de VVD de andere. D66 stond ${aantal(t.alleen.D66)} keer alleen tegenover VVD en CDA, het CDA ${aantal(t.alleen.CDA)} keer.`);
    const mnd = metStemmingen(d);
    const vaker = mnd.filter((m) => m.alleen.VVD > m.alleen.D66).length, minder = mnd.filter((m) => m.alleen.VVD < m.alleen.D66).length;
    expect(b.tekst[1]).toContain(`D66 in ${vanTot(bereik(d, "D66"))} van de verdeelde stemmingen alleen, het CDA in ${vanTot(bereik(d, "CDA"))}`);
    expect(b.tekst[1]).toContain(`In ${vaker} van de ${mnd.length} maanden met stemmingen stond de VVD vaker alleen dan D66, in ${minder} minder vaak`);
    // De marge: de kleinste maand, en augustus zonder stemmingen
    const kleinst = [...mnd].sort((x, y) => x.verdeeld - y.verdeeld)[0];
    expect(b.tekst[2]).toContain(`${maandTekst(kleinst.maand)} telde ${aantal(kleinst.verdeeld)} verdeelde stemmingen`);
    expect(b.tekst[2]).toContain("In augustus 2026 was er geen stemming (zomerreces).");
    expect(b.tekst[2]).toContain(`november 2026 loopt tot en met ${datumTekst(d.stand)}`.replace(/^n/, "N"));
    // Het bereik is het laagste en hoogste maandaandeel, alleen over maanden met minstens 100 verdeelde stemmingen
    for (const m of mnd.filter((x) => x.verdeeld >= 100)) expect(maandPct(m, "VVD")!).toBeLessThanOrEqual(bereik(d, "VVD").max);
    expect(bereik(d, "VVD").max).toBeLessThan(10);  // februari (43 stemmingen, 12%) telt niet mee
    expect(b.data).toContain("alleen maanden met minstens 100 verdeelde stemmingen (niet: februari 2026)");
    expect(b.data).toContain("een stem die de Kamer als vergissing heeft aangemerkt");
    expect(b.data).toContain("vanaf 23 februari 2026, de start van kabinet-Jetten");
  });

  it("blok zonder: zetels, eensgezind en het laagste paar uit de data; alleen de groep van zeven heeft een meerderheid", () => {
    const b = blok("zonder"), z = d.zonder, g = z.groepen;
    for (const x of Object.values(g)) {
      expect(x.tk).toBe(x.fracties.reduce((n, a) => n + z.tk.zetels[a], 0));
      expect(x.ek).toBe(x.fracties.reduce((n, a) => n + (z.ek.zetels[a] ?? 0), 0));
      expect(x.fracties).toContain("D66");
      expect(Math.round((1000 * x.eensgezind) / x.gestemd) / 10).toBe(x.pct);
    }
    for (const n of ["zonder", "zonderSteun", "zonderAkkoord", "zonderBeide"] as const) expect(g[n].fracties).not.toContain("VVD");
    expect(["zonder", "zonderSteun", "zonderAkkoord"].every((n) => g[n as "zonder"].tk < z.tk.meerderheid)).toBe(true);
    expect(g.zonderBeide.tk).toBeGreaterThanOrEqual(z.tk.meerderheid);
    expect(b.kop).toBe(`Zonder de VVD hebben D66 en CDA ${g.zonder.tk} zetels, met PRO en Volt ${g.zonderAkkoord.tk}; een meerderheid is 76`);
    expect(b.tekst[0]).toBe(`D66 en CDA hebben samen ${g.zonder.tk} zetels in de Tweede Kamer. Met PRO en Volt, de partners van het akkoord over het Belastingplan, komen ze op ${g.zonderAkkoord.tk}; met ChristenUnie, 50PLUS en de Groep Markuszower op ${g.zonderSteun.tk}; dat zijn de drie fracties uit het stuk over het kabinet met ChristenUnie en 50PLUS. Met de eerste twee sprak het kabinet eind oktober, zonder afspraak. Alle zeven samen hebben er ${g.zonderBeide.tk}; een meerderheid is 76. Deze groepen zijn gekozen, niet afgeleid uit de stemming over het Belastingplan: hoe elke fractie daar stemde, staat nog niet in de open data.`);
    expect(b.tekst[1]).toContain(`D66 en CDA in ${procent(g.zonder.pct)} van de verdeelde stemmingen, met PRO en Volt in ${procent(g.zonderAkkoord.pct)}`);
    expect(b.tekst[1]).toContain(`alle zeven in ${procent(g.zonderBeide.pct)}`);
    expect(b.tekst[1]).toContain(`Het kabinet van D66, VVD en CDA stemde in ${procent(g.kabinet.pct)} eensgezind`);
    const lp = g.zonderBeide.laagstePaar!;
    expect([lp.a, lp.b]).toEqual(["PRO", "Groep Markuszower"]);
    expect(b.tekst[1]).toContain(`kozen PRO en de Groep Markuszower het minst vaak dezelfde kant: in ${procent(lp.cohesie)}`);
    // Eerste Kamer: rekensom, met de bron
    expect(b.tekst[2]).toBe(`In de Eerste Kamer hebben de zeven ${g.zonderBeide.ek} van de 75 zetels; een meerderheid is 38. De Groep Markuszower heeft daar geen zetels. Dit is een rekensom op zetels: Zetelen heeft geen stemmingen van de Eerste Kamer.`);
    expect(g.zonderBeide.ek).toBeLessThan(z.ek.meerderheid);
    expect(b.data).toContain("eerstekamer.nl/fracties, geraadpleegd op 11 november 2026");
  });

  it("noemt de meerderheid zonder de VVD uit akkoord-belastingplan, zodat de twee stukken niet botsen", () => {
    const route = ak.kamers.routes.find((r) => r.zonder === "VVD")!;
    const t = blok("zonder").tekst.join(" ");
    expect(t).toContain(`uit het stuk over het Belastingplan, is D66 en CDA met 50PLUS, ChristenUnie, DENK, PRO, SP en Volt: acht fracties, ${route.tk} zetels, in ${procent(route.pct)} eensgezind.`);
    expect(stuk.opvalt).toContain(`ze stemden in ${procent(d.zonder.groepen.zonder.pct)} van de verdeelde stemmingen eensgezind`);
    expect(blok("zonder").data).toContain("staat in het stuk over het Belastingplan");
  });

  it("verwijst naar de coalitiebouwer met de snelkeuze kabinet zonder VVD", () => {
    expect(zonderLink(d)).toBe("/coalitie?soort=kabinet&periode=Jetten&groep=D66,CDA");
    expect(stuk.bouwer).toEqual({ fracties: ["D66", "CDA"], tekst: "D66 en CDA zonder de VVD in de coalitiebouwer" });
  });

  it("aanleiding en slot: de uitslag uit de data, verwijzing naar het eerdere stuk, geen voorspelling", () => {
    const nu = ak.plannen!.lijst[ak.plannen!.lijst.length - 1];
    expect(stuk.aanleiding.startsWith(`Het Belastingplan ${nu.plan} ging op ${datumTekst(nu.datum)} met ${nu.voor} tegen ${nu.tegen} door de Tweede Kamer.`)).toBe(true);
    // Hoe de VVD stemde, staat nog niet per fractie in de open data: dan zegt de aanleiding het niet
    if (!ak.uitslag && nu.coalitieTegen === null) expect(stuk.aanleiding).not.toMatch(/VVD stemde/);
    expect(stuk.aanleiding).toContain("Het stuk over het Belastingplan zet die uitslag naast");
    expect(stuk.slot).toBe(`De cijfers laten zien hoe er gestemd is: de VVD stond ${aantal(d.totaal.alleen.VVD)} keer alleen tegenover D66 en CDA, D66 ${aantal(d.totaal.alleen.D66)} keer tegenover de twee andere. Of het kabinet valt, voorspellen ze niet.`);
    expect(stuk.slot.split(/(?<=\.) /)).toHaveLength(2);
    // Met een uitslag per fractie noemt de aanleiding de stem van de VVD
    const met = coalitieVerdeeld(d, { ...ak, plannen: { ...ak.plannen!, lijst: [...ak.plannen!.lijst.slice(0, -1), { ...nu, coalitieTegen: ["VVD"], tegenFracties: [] }] } });
    expect(met.aanleiding).toContain("door de Tweede Kamer. De VVD stemde tegen.");
  });

  it("volgt de tone of voice: geen ik of wij, lange streepjes, decimalen met een punt of oordelende koppen", () => {
    const t = tekstVan(stuk);
    expect(t).not.toMatch(/\b(we|wij|ons|onze|ik)\b/i);
    expect(t).not.toMatch(/[—–]/);
    expect(t).not.toMatch(/\d\.\d{1,2}(?!\d)/);
    expect(t).not.toMatch(/\b(cruciaal|essentieel|kortom|concluderend|crisis|breuk|schuld|liet .* vallen|redde)\b/i);
    // Wel een decimaal met een komma waar dat nodig is (de marge van de kleinste maand)
    expect(blok("maanden").tekst[2]).toMatch(/\d,\d procentpunt/);
  });
});

describe("Actueel: delen van coalitie-verdeeld", () => {
  it("linkt naar het blok, en laat het stuk pas door als het op de site staat", () => {
    expect(deellinkVan("actueel", { stuk: "coalitie-verdeeld", blok: "maanden" })).toBe("/deel/actueel?stuk=coalitie-verdeeld&blok=maanden");
    expect(doelVan("actueel", { stuk: "coalitie-verdeeld", blok: "zonder" })).toBe("/actueel/coalitie-verdeeld#zonder");
    const op = STUKKEN.some((s) => s.slug === "coalitie-verdeeld");
    expect(schoonActueel({ stuk: "coalitie-verdeeld", blok: "zonder" })).toEqual(op ? { stuk: "coalitie-verdeeld", blok: "zonder" } : {});
  });
});
