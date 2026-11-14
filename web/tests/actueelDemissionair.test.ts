// Tests voor het Actueel-stuk "demissionair" (lib/actueel.ts): elke zin moet kloppen met de vastgelegde cijfers uit
// pipeline/demissionair.py, kleine periodes moeten gemarkeerd zijn en niet beslissen, en het stuk staat alleen op een
// preview van Vercel totdat Niels het live zet.
import { describe, expect, it, vi } from "vitest";
import data from "../content/actueel/demissionair.json";
import akkoordJson from "../content/actueel/akkoord-belastingplan.json";
import {
  type AkkoordData, type DemissionairData, DEMISSIONAIR, DEM_PERIODES, STUKKEN, aantal, campagneGroot, datumTekst, demDalingen,
  demissionair, demVergelijking, eensPct, grootsteVerschuiving, paarPct, kleinePeriodes, mediaanBereik, missionairBereik, periodeGetal,
  periodeUitleg, procent, punt, schoonActueel, sterksteDalingen, verschuivingen,
} from "../lib/actueel";
import { deellinkVan, doelVan } from "../lib/deel";

const d = data as unknown as DemissionairData;
const ak = akkoordJson as unknown as AkkoordData;
const stuk = demissionair(d, ak);
const blok = (id: string) => stuk.blokken.find((b) => b.id === id)!;
const k = (naam: string) => d.kabinetten.find((x) => x.kabinet === naam)!;
const alleTekst = [stuk.kop, stuk.beschrijving, stuk.ziet, stuk.opvalt, stuk.aanleiding,
  ...stuk.blokken.flatMap((b) => [b.vraag, b.kop, ...b.tekst, b.data]),
  stuk.lezingen!.links.titel, stuk.lezingen!.links.tekst, stuk.lezingen!.rechts.titel, stuk.lezingen!.rechts.tekst, stuk.slot].join("\n");
const mediaan = (l: number[]) => {
  const s = [...l].sort((a, b) => a - b), m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

describe("Actueel: demissionaire kabinetten, de data", () => {
  it("heeft de zes kabinetten sinds 2010 met de nagekeken datums", () => {
    expect(d.kabinetten.map((x) => x.kabinet)).toEqual(["Balkenende IV", "Rutte I", "Rutte II", "Rutte III", "Rutte IV", "Schoof"]);
    expect(d.kabinetten.map((x) => [x.demissionair, x.kamer])).toEqual([
      ["2010-02-20", "2010-06-17"], ["2012-04-23", "2012-09-20"], ["2017-03-14", "2017-03-23"],
      ["2021-01-15", "2021-03-31"], ["2023-07-07", "2023-12-06"], ["2025-06-03", "2025-11-12"],
    ]);
    for (const x of d.kabinetten) {
      expect(x.demissionair <= x.verkiezing && x.verkiezing < x.kamer && x.kamer < x.einde).toBe(true);
      for (const v of ["demissionair", "verkiezing", "kamer"]) expect(x.bron[v]).toMatch(/^https:\/\/(www\.)?(parlement\.com|rijksoverheid\.nl|tweedekamer\.nl)\//);
    }
  });

  it("knipt elke periode op de datums: de stemmingen liggen binnen hun periode", () => {
    for (const x of d.kabinetten) {
      const p = x.periodes;
      if (p.missionair) expect(p.missionair.tot < x.demissionair).toBe(true);
      if (p.demVoor) expect(p.demVoor.van >= x.demissionair && p.demVoor.tot < x.kamer).toBe(true);
      if (p.demNa) expect(p.demNa.van >= x.kamer && p.demNa.tot < x.einde).toBe(true);
    }
    // Rutte II: geen stemming tussen het ontslag en de installatie
    expect(k("Rutte II").periodes.demVoor).toBeNull();
  });

  it("rekent eensgezind en paren binnen hun noemer; bij twee blijvende partijen is eensgezind de cohesie van het paar", () => {
    for (const x of d.kabinetten) for (const n of DEM_PERIODES) {
      const p = x.periodes[n];
      if (!p) continue;
      expect(p.eensgezind.eensgezind).toBeLessThanOrEqual(p.eensgezind.gestemd);
      expect(p.eensgezind.gestemd).toBeLessThanOrEqual(p.verdeeld);
      expect(p.klein).toBe(p.verdeeld < d.grenzen.klein);
      for (const q of p.paren) expect(q.gezamenlijk).toBeLessThanOrEqual(p.verdeeld);
      if (x.blijvend.length === 2) {
        const q = p.paren.find((y) => y.a === x.blijvend[0] && y.b === x.blijvend[1])!;
        expect(q.cohesie).toBe(p.eensgezind.pct);
      }
    }
  });

  it("blok oppositie: de mediaan van kabinet en oppositie, en per partij de sterkste stijger en daler uit de lijst", () => {
    for (const x of d.kabinetten.filter((y) => y.campagne)) {
      const c = x.campagne!;
      // Afronding in Python op één decimaal: hooguit een halve tiende verschil
      expect(Math.abs(c.mediaanKabOpp! - mediaan(c.kabOpp.map((v) => v.verschil)))).toBeLessThanOrEqual(0.051);
      for (const v of c.kabOpp) {
        expect(v.nVoor).toBeGreaterThanOrEqual(d.grenzen.minPaar);
        expect(v.nNa).toBeGreaterThanOrEqual(d.grenzen.minPaar);
        expect(v.verschil).toBeCloseTo(v.na - v.voor, 1);
        expect(x.blijvend).toContain(v.kabinetspartij);
        // Wie ooit in het kabinet zat, is geen oppositie
        expect(x.partijen).not.toContain(v.oppositie);
      }
      for (const p of c.perPartij) {
        const eigen = c.kabOpp.filter((v) => v.kabinetspartij === p.kabinetspartij).map((v) => v.verschil);
        if (p.stijger) expect(p.stijger.verschil).toBe(Math.max(...eigen));
        if (p.daler) expect(p.daler.verschil).toBe(Math.min(...eigen));
        expect(p.stijger === null || p.stijger.verschil > 0).toBe(true);
        expect(p.daler === null || p.daler.verschil < 0).toBe(true);
      }
    }
  });
});

describe("Actueel: demissionaire kabinetten, de zinnen", () => {
  it("heeft twee blokken, het goede label en verwijst naar het stuk over het Belastingplan", () => {
    expect(stuk.slug).toBe("demissionair");
    expect(stuk.label).toBe("Actueel · Demissionair");
    expect(stuk.blokken.map((b) => b.id)).toEqual(["val", "oppositie"]);
    expect(stuk.blokken[1].vraag).toBe("Demissionair, vóór de nieuwe Kamer: met welke oppositiepartijen stemden ze vaker of minder vaak?");
    expect(stuk.verwijzing).toEqual({ href: "/actueel/akkoord-belastingplan", tekst: "Lees het stuk over het Belastingplan" });
    expect(DEMISSIONAIR.kop).toBe(stuk.kop);
  });

  it("kop en slot: de daling bij de kabinetten met genoeg stemmingen, uit de data", () => {
    const dl = demDalingen(d);
    expect(dl).toMatchObject({ n: 5, lager: 5 });
    expect(stuk.kop).toBe("Demissionair stemden de kabinetspartijen minder vaak eensgezind, bij alle vijf kabinetten met genoeg stemmingen sinds 2010");
    // Balkenende IV telt niet mee: de missionaire periode is klein
    expect(demVergelijking(k("Balkenende IV"))).toBeNull();
    expect(stuk.slot).toContain("Bij alle vijf kabinetten met genoeg stemmingen stemden de kabinetspartijen demissionair minder vaak eensgezind dan ervoor.");
    expect(stuk.slot).toContain(`Kabinet-Jetten is missionair, met ${procent(eensPct(d.jetten.missionair))} eensgezind tot en met ${datumTekst(d.jetten.stand)}`);
    expect(stuk.slot).toContain("voorspellen deze cijfers niet");
  });

  it("opvalt: de sterkste daling en de grootste verschuiving tegenover de mediaan", () => {
    const [top] = sterksteDalingen(d), gv = grootsteVerschuiving(d), mb = mediaanBereik(d);
    expect(top).toMatchObject({ kabinet: "Rutte IV", periode: "demNa" });
    expect(stuk.opvalt).toContain(`onder Rutte IV demissionair met de nieuwe Kamer, van ${procent(top.van)} naar ${procent(top.naar)}`);
    expect([gv.kabinet, gv.kabinetspartij, gv.oppositie]).toEqual(["Rutte III", "D66", "SGP"]);
    expect(stuk.opvalt).toContain(`van D66 en SGP onder Rutte III met ${punt(gv.verschil)} procentpunt`);
    expect(stuk.opvalt).toContain(`tussen ${punt(mb.min)} en ${punt(mb.max)} bleef`);
  });

  it("aanleiding: de uitslag uit het stuk over het Belastingplan, neutraal, zonder voorspelling", () => {
    const nu = ak.plannen!.lijst[ak.plannen!.lijst.length - 1];
    expect(stuk.aanleiding.startsWith(`Het Belastingplan ${nu.plan} ging op ${datumTekst(nu.datum)} met ${nu.voor} tegen ${nu.tegen} door de Tweede Kamer, met de VVD tegen.`)).toBe(true);
    // Bron die zelf is gelezen: RD, 13 november 2026
    expect(stuk.aanleiding).toContain("Het RD schreef op 13 november 2026 dat de kabinetscrisis nog niet is opgelost (rd.nl/a/kabinet-strompelt-verder-maar-kabinetscrisis-is-nog-niet-opgelost).");
    expect(stuk.aanleiding).toContain("voorspelt niets");
    // Geen bron die niet zelf is gelezen
    expect(stuk.aanleiding).not.toMatch(/nos\.nl|volgens/i);
  });

  it("blok val: de zinnen noemen de getallen uit de data", () => {
    const b = blok("val"), dl = demDalingen(d), mb = missionairBereik(d), r4 = k("Rutte IV").periodes;
    expect(b.kop).toBe(`Het sterkst daalde de eensgezindheid onder Rutte IV: van ${procent(eensPct(r4.missionair!))} missionair naar ${procent(eensPct(r4.demVoor!))} vóór de nieuwe Kamer en ${procent(eensPct(r4.demNa!))} met de nieuwe Kamer`);
    expect(b.tekst[0]).toContain(`missionair in ${Math.round(mb.min)} tot ${procent(mb.max)} van de verdeelde stemmingen eensgezind`);
    expect(dl.demVoor).toEqual({ n: 4, lager: 4 });
    expect(dl.demNa).toEqual({ n: 4, lager: 4 });
    expect(b.tekst[0]).toContain("Demissionair vóór de nieuwe Kamer lag dat lager bij alle vier kabinetten met genoeg stemmingen, met de nieuwe Kamer bij alle vier.");
    const r3 = k("Rutte III").periodes;
    // Afgerond vanaf de breuk: 2.154 van 2.973 (72,45) en 366 van 605 (60,496), niet vanaf 72,5 en 60,5
    expect(b.tekst[0]).toContain("Onder Rutte III lag het met de nieuwe Kamer weer hoger dan in de maanden ervoor (72% tegen 60%), maar onder het missionaire niveau.");
    // Waarom per periode vier kabinetten en in de kop vijf
    expect(b.tekst[0]).toContain("De kop van het stuk telt vijf kabinetten; per periode zijn het er minder, omdat demissionair vóór de nieuwe Kamer Rutte II geen stemmingen heeft en demissionair met de nieuwe Kamer Rutte I te weinig stemmingen heeft.");
    // Paren: met noemers
    const cuVvd = r4.demVoor!.paren.find((p) => p.a === "ChristenUnie" && p.b === "VVD")!;
    expect(b.tekst[1]).toContain(`onder Rutte IV ChristenUnie en VVD, van ${procent(paarPct(r4.missionair!.paren.find((p) => p.a === "ChristenUnie" && p.b === "VVD")!))} naar ${procent(paarPct(cuVvd))} (demissionair vóór de nieuwe Kamer, ${aantal(cuVvd.gezamenlijk)} gezamenlijke stemmingen)`);
    // De kabinetten bij naam, en het voorbeeld bij Schoof uit een periode met nog drie partijen (niet VVD en BBB met de nieuwe Kamer)
    expect(b.tekst[1]).toContain("In de kabinetten met drie of vier partijen, Rutte III, Rutte IV en Schoof,");
    expect(b.tekst[1]).not.toContain("onder Schoof BBB en VVD");
    expect(k("Schoof").periodes.demNa!.partijen).toBe(2);
    // Alleen staan
    const v3 = (n: "missionair" | "demVoor" | "demNa") => r3[n]!.alleen.partijen[0];
    expect([v3("missionair"), v3("demVoor"), v3("demNa")].map((x) => x.afkorting)).toEqual(["VVD", "VVD", "VVD"]);
    expect(b.tekst[2]).toContain(`Onder Rutte III in alle drie de periodes de VVD (${aantal(v3("missionair").keer)} van ${aantal(v3("missionair").basis)}, ${aantal(v3("demVoor").keer)} van ${aantal(v3("demVoor").basis)} en ${aantal(v3("demNa").keer)} van ${aantal(v3("demNa").basis)})`);
    expect(b.tekst[2]).toContain("vóór de nieuwe Kamer geteld tot NSC op 22 augustus 2025 uit het kabinet stapte");
    // Jetten ter vergelijking
    const j = d.jetten.missionair;
    expect(b.tekst[4]).toContain(`in ${procent(eensPct(j))} van de ${aantal(j.eensgezind.gestemd)} verdeelde stemmingen waarop ze alle drie stemden eensgezind`);
    expect(b.data).toContain("Rutte II 14 maart 2017 en 23 maart 2017");
    expect(b.data).toContain(`Klein: minder dan ${d.grenzen.klein} verdeelde stemmingen`);
  });

  it("blok oppositie: per kabinet de sterkste stijgers en dalers, met de mediaan van alle paren als referentie", () => {
    const b = blok("oppositie"), mb = mediaanBereik(d), gv = grootsteVerschuiving(d);
    expect(campagneGroot(d).map((x) => x.kabinet)).toEqual(["Rutte I", "Rutte III", "Rutte IV", "Schoof"]);
    expect(b.kop).toBe(`Demissionair vóór de nieuwe Kamer verschoof, tegenover missionair, een paar van kabinets- en oppositiepartij tot ${Math.abs(gv.verschil).toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} procentpunt, de mediaan van alle paren tussen ${punt(mb.min)} en ${punt(mb.max)}`);
    const r3 = k("Rutte III").campagne!;
    const sp = r3.perPartij.map((p) => p.stijger!), sgp = r3.perPartij.map((p) => p.daler!);
    expect(new Set(sp.map((v) => v.oppositie))).toEqual(new Set(["SP"]));
    expect(new Set(sgp.map((v) => v.oppositie))).toEqual(new Set(["SGP"]));
    const sp2 = sp.map((v) => v.verschil), sgp2 = sgp.map((v) => Math.abs(v.verschil));
    expect(b.tekst).toContain(`Onder Rutte III steeg het sterkst: alle vier met de SP (${punt(Math.min(...sp2))} tot ${punt(Math.max(...sp2))}); daalde het sterkst: alle vier met de SGP (${punt(-Math.min(...sgp2))} tot ${punt(-Math.max(...sgp2))}).`);
    const s = k("Schoof").campagne!;
    expect(b.tekst.join(" ")).toContain(`Geen paar verschoof meer dan ${Math.max(...verschuivingen(k("Schoof")).map((v) => Math.abs(v.verschil))).toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} procentpunt.`);
    expect(s.mediaan).toBeGreaterThanOrEqual(mb.min);
    expect(b.tekst.join(" ")).toContain("In die maanden sloten VVD en CDA het Lenteakkoord met D66, GroenLinks en ChristenUnie, op 26 april 2012.");
    const afw = campagneGroot(d).map((x) => x.campagne!.motieAfwijking!);
    expect(b.data).toContain(`in de mediaan ${Math.min(...afw).toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} tot ${Math.max(...afw).toLocaleString("nl-NL", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} procentpunt af`);
    expect(b.data).toContain(`minstens ${d.grenzen.minPaar} gezamenlijke stemmingen in beide periodes`);
  });
});

describe("Actueel: demissionaire kabinetten, kleine aantallen", () => {
  const klein = kleinePeriodes(d);
  it("markeert precies de kleine periodes: Balkenende IV missionair en met de nieuwe Kamer, Rutte I met de nieuwe Kamer", () => {
    expect(klein.map((x) => `${x.kabinet} ${x.periode}`)).toEqual(["Balkenende IV missionair", "Balkenende IV demNa", "Rutte I demNa"]);
  });
  it("noemt elke kleine periode met haar aantal in de tekst, en de grafiek zegt klein met een sterretje", () => {
    const t = blok("val").tekst.join(" ");
    for (const x of klein) {
      expect(t).toContain(x.kabinet);
      expect(t).toContain(aantal(x.verdeeld));
      const p = k(x.kabinet).periodes[x.periode]!;
      expect(periodeUitleg(p, x.periode, { pct: p.eensgezind.pct, deel: p.eensgezind.eensgezind, geheel: p.eensgezind.gestemd })).toMatch(/, klein$/);
      expect(periodeGetal(p, p.eensgezind.pct)).toMatch(/\*$/);
    }
    const groot = k("Rutte IV").periodes.missionair!;
    expect(periodeGetal(groot, groot.eensgezind.pct)).not.toMatch(/\*/);
    expect(t).toContain("Rutte II heeft geen periode vóór de nieuwe Kamer");
    expect(blok("oppositie").tekst.join(" ")).toContain(`Balkenende IV staat er gemarkeerd bij: de missionaire periode telt maar ${aantal(k("Balkenende IV").periodes.missionair!.verdeeld)} verdeelde stemmingen.`);
  });
  it("laat kleine periodes niet beslissen in kop, opvalt, slot of een alle-zin", () => {
    const kleinKab = new Set(klein.map((x) => x.kabinet));
    for (const x of sterksteDalingen(d)) expect(kleinKab.has(x.kabinet) && klein.some((y) => y.kabinet === x.kabinet && (y.periode === x.periode || y.periode === "missionair"))).toBe(false);
    for (const x of campagneGroot(d)) expect(x.periodes.missionair!.klein || x.periodes.demVoor!.klein).toBe(false);
    expect(grootsteVerschuiving(d).kabinet).not.toBe("Balkenende IV");
    // Een groot Rutte I vóór de nieuwe Kamer telt wel mee, de kleine periode erna niet
    expect(demVergelijking(k("Rutte I"))!.stappen.map((x) => x.periode)).toEqual(["demVoor"]);
  });
});

describe("Actueel: demissionaire kabinetten, afronding vanaf de breuk", () => {
  it("rondt percentages één keer af, vanaf teller en noemer, in tekst en grafiek", () => {
    const r3 = k("Rutte III").periodes;
    // Het JSON-bestand heeft 72,5 en 60,5; twee keer afronden gaf 73 en 61
    expect(r3.demNa!.eensgezind.pct).toBe(72.5);
    expect(procent(eensPct(r3.demNa!))).toBe("72%");
    expect(procent(eensPct(r3.demVoor!))).toBe("60%");
    // Grafiek: ChristenUnie en D66 onder Rutte III met de nieuwe Kamer (86,5 in het bestand, 86,45 uit de breuk)
    const cuD66 = r3.demNa!.paren.find((p) => p.a === "ChristenUnie" && p.b === "D66")!;
    expect(periodeGetal(r3.demNa!, paarPct(cuD66))).toBe("86");
    expect(Math.round((100 * cuD66.gelijk) / cuD66.gezamenlijk)).toBe(86);
    // Balkenende IV missionair: 170 van 206
    const b4 = k("Balkenende IV").periodes.missionair!;
    expect([b4.eensgezind.eensgezind, b4.eensgezind.gestemd]).toEqual([170, 206]);
    expect(eensPct(b4)!.toFixed(1)).toBe("82.5");
  });
  it("rekent verschuivingen uit de breuken: D66 en SGP onder Rutte III is min 16,8", () => {
    for (const x of d.kabinetten.filter((y) => y.campagne)) for (const v of x.campagne!.kabOpp) {
      expect(v.verschil).toBeCloseTo((100 * v.gelijkNa) / v.nNa - (100 * v.gelijkVoor) / v.nVoor, 3);
    }
    const gv = grootsteVerschuiving(d);
    expect(punt(gv.verschil)).toBe("min 16,8");
    expect(stuk.opvalt).toContain("met min 16,8 procentpunt");
  });
  it("NSC telt na 22 augustus 2025 niet meer als kabinetspartij in een paar", () => {
    const s = k("Schoof").periodes;
    const nscVvd = (p: typeof s.demVoor) => p!.paren.find((q) => q.a === "Nieuw Sociaal Contract" && q.b === "VVD")!;
    expect(nscVvd(s.demVoor).gezamenlijk).toBeLessThanOrEqual(s.demVoor!.alleen.verdeeld);
    expect(nscVvd(s.demNa).gezamenlijk).toBe(0);
  });
});

describe("Actueel: demissionaire kabinetten, tone of voice", () => {
  it("geen ik of wij, geen gedachtestreepjes, geen decimalen met een punt, wel met een komma", () => {
    expect(alleTekst).not.toMatch(/\b(we|wij|ons|onze|ik)\b/i);
    expect(alleTekst).not.toMatch(/[—–]/);
    expect(alleTekst).not.toMatch(/\d\.\d{1,2}(?!\d)/);
    expect(alleTekst).toMatch(/\d,\d procentpunt/);
  });
  it("noemt geen campagne en geen periode vóór de verkiezingen: de periode loopt tot de nieuwe Kamer", () => {
    expect(alleTekst).not.toMatch(/campagne/i);
    expect(alleTekst).not.toMatch(/v[oó]{1,2}r de verkiezingen/i);
    expect(stuk.lezingen!.links.tekst).toContain("wijst op de paren met de oppositie");
  });
  it("voorspelt niets en oordeelt niet", () => {
    expect(alleTekst).not.toMatch(/\b(valt|vallen|zal|zullen|verwacht|verwachten|straks|binnenkort|waarschijnlijk)\b/i);
    expect(alleTekst).not.toMatch(/\b(cruciaal|essentieel|kortom|concluderend|breuk|schuld|chaos|ruzie)\b/i);
    expect(stuk.slot).toMatch(/voorspellen deze cijfers niet\.$/);
  });
  it("noemt geen personen: alleen fracties", () => {
    // Fracties met een persoonsnaam staan niet in de data van dit stuk
    const namen = new Set(d.kabinetten.flatMap((x) => [...x.partijen, ...Object.values(x.periodes).flatMap((p) => p?.paren.flatMap((q) => [q.a, q.b]) ?? []),
      ...(x.campagne?.kabOpp.flatMap((v) => [v.kabinetspartij, v.oppositie]) ?? [])]));
    for (const n of namen) expect(n).toMatch(/^(CDA|ChristenUnie|D66|PvdA|VVD|PVV|SP|GL|SGP|PvdD|50PLUS|DENK|FVD|BIJ1|BBB|Volt|JA21|Nieuw Sociaal Contract|GroenLinks-PvdA|PRO)$/);
  });
});

describe("Actueel: demissionaire kabinetten, zichtbaarheid en delen", () => {
  it("staat buiten een preview niet in STUKKEN, en de deellink laat het dan niet door", () => {
    expect(process.env.VERCEL_ENV).not.toBe("preview");
    expect(STUKKEN.some((s) => s.slug === "demissionair")).toBe(false);
    expect(schoonActueel({ stuk: "demissionair", blok: "val" })).toEqual({});
  });
  it("staat op een preview van Vercel wel op de site, met deellinks per blok", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.resetModules();
    const m = await import("../lib/actueel");
    expect(m.STUKKEN.some((s) => s.slug === "demissionair")).toBe(true);
    expect(m.schoonActueel({ stuk: "demissionair", blok: "oppositie" })).toEqual({ stuk: "demissionair", blok: "oppositie" });
    const maten = await import("../lib/maten");
    expect(maten.MATEN.some((x) => x.id === "verschuiving")).toBe(true);
    vi.unstubAllEnvs();
    vi.resetModules();
    expect(deellinkVan("actueel", { stuk: "demissionair", blok: "val" })).toBe("/deel/actueel?stuk=demissionair&blok=val");
    expect(doelVan("actueel", { stuk: "demissionair", blok: "oppositie" })).toBe("/actueel/demissionair#oppositie");
  });
});
