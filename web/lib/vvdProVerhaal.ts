// Scroll graphic voor /uitgelicht/vvd-en-pro (verzoek Niels, 28 oktober 2026): de analyse als verhaal in stappen, zoals
// de andere uitgelichte pagina's. Stippen met een vaste sleutel schuiven tussen de stappen: de stip van PRO in de rangorde
// wordt het laatste punt van de lijn. Lijnen vloeiend (lib/vloeiend.ts). Alle getallen komen binnen als argument.
import type { TerreinPaar } from "./onderwerpen";
import type { Punt } from "./trend";
import { type Kleur, type Pad, type Stap, type Stip, type Tekstlabel, rond } from "./verhaal";
import { vloeiendPad } from "./vloeiend";

export const TINT = { pro: "#e3b76a", pvda: "#7fb7c9", gl: "#e57f93", pvv: "#a08fe0", rest: "#566aa6" };
const pct = (c: number | null | undefined) => (c == null ? "" : `${Math.round(c)}%`);

export type VerhaalInvoer = {
  rangorde: Array<{ naam: string; cohesie: number }>; // onder het huidige kabinet, PRO als één lijn
  pro: Punt[]; pvda: Punt[]; gl: Punt[]; pvv: Punt[]; // per half jaar, zelfde reeks halve jaren
  anderen: Array<{ naam: string; punten: Punt[] }>; // de VVD met elke andere fractie, als grijze referentie
  perKabinet: { r1: number | null; r2: number | null; r3: number | null; r2Gl: number | null };
  pvvSamen: number | null; pvvOppositie: number | null; // VVD en PVV: tweede helft 2024 en eerste helft 2026
  terreinen: TerreinPaar[]; // VVD en PRO per beleidsterrein onder het huidige kabinet
  rutte2: { begin: string; einde: string };
  kabinet: string;
};

// Tijdas: halve jaren van links naar rechts, cohesie van 20 tot 100% van onder naar boven
const X0 = 70, X1 = 960, Y0 = 40, Y1 = 450;
const cy = (c: number) => rond(Y1 - ((c - 20) / 80) * (Y1 - Y0));

export function vvdProVerhaal(d: VerhaalInvoer): Stap[] {
  const jaren = d.pro.map((p) => p.halfjaar);
  const n = jaren.length;
  const tx = (h: string) => rond(X0 + (jaren.indexOf(h) / Math.max(1, n - 1)) * (X1 - X0));
  const maandX = (iso: string) => {
    const j = Number(iso.slice(0, 4)) - Number(jaren[0].slice(0, 4)), m = Number(iso.slice(5, 7)) - 1;
    return rond(X0 + ((j * 12 + m - 3) / 6 / Math.max(1, n - 1)) * (X1 - X0));
  };

  // Assen van de tijdgrafiek
  const raster: Pad[] = [25, 50, 75, 100].map((v) => ({ d: `M${X0},${cy(v)} H${X1}`, tint: TINT.rest, zacht: true, naam: `raster-${v}` }));
  const asLabels: Tekstlabel[] = [
    ...[25, 50, 75, 100].map((v) => ({ x: X0 - 10, y: cy(v) + 5, tekst: `${v}%`, anchor: "end" as const, zacht: true })),
    ...jaren.filter((h) => h.slice(5, 7) === "01" && Number(h.slice(0, 4)) % 4 === 2).map((h) => ({ x: tx(h), y: Y1 + 34, tekst: h.slice(0, 4), anchor: "middle" as const, zacht: true })),
  ];

  // Een reeks: stippen per half jaar met een percentage, en de vloeiende lijn erdoor (onderbroken waar een gat zit)
  const reeks = (sleutel: string, punten: Punt[], tint: string, kleur: (p: Punt) => Kleur = () => null, r = 5) => {
    const stippen: Stip[] = punten.filter((p) => p.cohesie != null).map((p, i, a) => ({
      key: sleutel === "p" && i === a.length - 1 ? "pro-nu" : `${sleutel}-${p.halfjaar}`, x: tx(p.halfjaar), y: cy(p.cohesie!), kleur: kleur(p), tint, r,
    }));
    const stukken: Punt[][] = [];
    punten.forEach((p, i) => {
      if (p.cohesie == null) return;
      if (i > 0 && punten[i - 1].cohesie != null && stukken.length) stukken[stukken.length - 1].push(p); else stukken.push([p]);
    });
    const paden: Pad[] = stukken.filter((s) => s.length > 1).map((s, i) => ({
      d: vloeiendPad(s.map((p) => [tx(p.halfjaar), cy(p.cohesie!)])), tint, breedte: sleutel === "p" ? 3.5 : 2.5, naam: `lijn-${sleutel}-${i}`,
    }));
    return { stippen, paden };
  };
  const pro = reeks("p", d.pro, TINT.pro);
  const laatste = [...d.pro].reverse().find((p) => p.cohesie != null)!;
  const eersteNa = (punten: Punt[]) => punten.find((p) => p.cohesie != null)!;
  const naam = (x: number, y: number, tekst: string, tint: string): Tekstlabel => ({ x, y, tekst, tint, halo: true, anchor: "start" });

  // Stap 1: de rangorde onder het huidige kabinet
  const R = d.rangorde, rx = (c: number) => rond(220 + ((c - 30) / 70) * 720), ry = (i: number) => rond(30 + i * 33);
  const plek = R.findIndex((x) => x.naam === "PRO") + 1;
  const rangStippen: Stip[] = R.map((x, i) => ({ key: x.naam === "PRO" ? "pro-nu" : `r-${x.naam}`, x: rx(x.cohesie), y: ry(i),
    kleur: x.naam === "PRO" ? "nadruk" : null, tint: x.naam === "PRO" ? TINT.pro : TINT.rest, r: x.naam === "PRO" ? 10 : 7 }));
  const rangLabels: Tekstlabel[] = R.flatMap((x, i) => [
    { x: 200, y: ry(i) + 5, tekst: x.naam, anchor: "end" as const, tint: x.naam === "PRO" ? TINT.pro : undefined, zacht: x.naam !== "PRO" },
    { x: rx(x.cohesie) + 16, y: ry(i) + 5, tekst: pct(x.cohesie), tint: x.naam === "PRO" ? TINT.pro : undefined, zacht: x.naam !== "PRO" },
  ]);
  const rangPaden: Pad[] = [50, 75].map((v) => ({ d: `M${rx(v)},10 V${ry(R.length - 1) + 20}`, tint: TINT.rest, streep: true, zacht: true, naam: `rang-${v}` }));
  const proNu = R.find((x) => x.naam === "PRO");

  // Lijnen van PvdA, GroenLinks en PVV, met nadruk op een periode
  const binnen = (p: Punt, van: string, tot: string) => p.halfjaar >= van && p.halfjaar < tot;
  const r2van = d.rutte2.begin.slice(0, 4) + (Number(d.rutte2.begin.slice(5, 7)) > 6 ? "-07-01" : "-01-01");
  const r2tot = d.rutte2.einde.slice(0, 4) + (Number(d.rutte2.einde.slice(5, 7)) > 6 ? "-07-01" : "-01-01");
  const pvda = reeks("a", d.pvda, TINT.pvda);
  const gl = reeks("g", d.gl, TINT.gl);
  const pvdaR2 = reeks("a", d.pvda, TINT.pvda, (p) => (binnen(p, r2van, r2tot) ? "nadruk" : "zacht"));
  const pvdaNa = reeks("a", d.pvda, TINT.pvda, (p) => (binnen(p, r2tot, "2018-01-01") ? "nadruk" : "zacht"));
  const glZacht = reeks("g", d.gl, TINT.gl, () => "zacht");
  const proZacht = reeks("p", d.pro, TINT.pro, () => "zacht");
  const pvv = reeks("v", d.pvv, TINT.pvv, (p) => (p.halfjaar === "2024-07-01" || p.halfjaar === "2026-01-01" ? "nadruk" : "zacht"));
  const band: Pad[] = [{ d: `M${maandX(d.rutte2.begin)},${Y0} V${Y1}`, tint: TINT.pvda, streep: true, naam: "r2-van" },
    { d: `M${maandX(d.rutte2.einde)},${Y0} V${Y1}`, tint: TINT.pvda, streep: true, naam: "r2-tot" }];
  // Legenda onder elkaar boven de grafiek: naast elkaar vielen de labels op de telefoon over elkaar (daar worden letters groter)
  const legenda = (met: Array<[string, string]>): Tekstlabel[] =>
    met.map(([t, k], i) => ({ x: X0, y: rond(Y0 - 20 - (met.length - 1 - i) * 42), tekst: `● ${t}`, tint: k, groot: true }));
  const l3: Array<[string, string]> = [["VVD en PvdA", TINT.pvda], ["VVD en GroenLinks", TINT.gl], ["VVD en PRO", TINT.pro]];

  // Per onderwerp: een rij per beleidsterrein met minstens 50 stemmingen samen
  const T = d.terreinen.filter((t) => t.gezamenlijk >= 50 && t.cohesie != null).slice(0, 14);
  const ty = (i: number) => rond(30 + i * 31);
  const hoog = T[0], laag = T[T.length - 1];
  const terStippen: Stip[] = T.map((t, i) => ({ key: `t-${t.terrein}`, x: rx(t.cohesie!), y: ty(i),
    kleur: t === hoog || t === laag ? "nadruk" : null, tint: t === hoog || t === laag ? TINT.pro : TINT.rest, r: 7 }));
  const terLabels: Tekstlabel[] = T.flatMap((t, i) => [
    { x: 200, y: ty(i) + 5, tekst: t.terrein, anchor: "end" as const, zacht: t !== hoog && t !== laag },
    { x: rx(t.cohesie!) + 16, y: ty(i) + 5, tekst: pct(t.cohesie), zacht: t !== hoog && t !== laag },
  ]);

  // Referentie (vraag Niels, 28 oktober 2026): de VVD met alle andere fracties als dunne grijze lijnen op de achtergrond,
  // zodat je ziet of PRO bovenin, in het midden of onderin zit. Alleen lijnen, geen stippen: anders wordt het druk.
  const ref: Pad[] = d.anderen.flatMap((a) => reeks(`ref-${a.naam}`, a.punten, TINT.rest).paden.map((p) => ({ ...p, breedte: 1, zacht: true })));
  const tijd = (stippen: Stip[], paden: Pad[], labels: Tekstlabel[], metRef = true) =>
    ({ stippen, paden: [...raster, ...(metRef ? ref : []), ...paden], labels: [...asLabels, ...labels] });
  const overzicht = tijd([...pvda.stippen, ...gl.stippen, ...pro.stippen], [...pvda.paden, ...gl.paden, ...pro.paden], legenda(l3));
  const hoogNu = R[0], laagNu = R[R.length - 1];

  return [
    { datum: `onder kabinet-${d.kabinet}`, hoofdstuk: "Nu",
      tekst: `Onder kabinet-${d.kabinet} stemden VVD en PRO in ${pct(proNu?.cohesie)} van de stemmingen hetzelfde: plek ${plek} van ${R.length} fracties met minstens 3 zetels. Middenmoot.`,
      stippen: rangStippen, paden: rangPaden, labels: rangLabels },
    { datum: "sinds oktober 2023", hoofdstuk: "Door de jaren",
      tekst: `De lijn van VVD met GroenLinks-PvdA, sinds juni 2026 PRO. Eerst rond de ${pct(eersteNa(d.pro).cohesie)}, het laatste halve jaar ${pct(laatste.cohesie)}. Dat halve jaar loopt nog.`,
      ...tijd(pro.stippen, pro.paden, [...legenda([["VVD en PRO", TINT.pro]]), naam(tx(laatste.halfjaar) - 40, cy(laatste.cohesie!) - 20, pct(laatste.cohesie), TINT.pro)], false) },
    { datum: "ter vergelijking",
      tekst: `In grijs: de VVD met elke andere fractie. Onder kabinet-${d.kabinet} stemde de VVD het vaakst hetzelfde als ${hoogNu.naam} (${pct(hoogNu.cohesie)}), het minst als ${laagNu.naam} (${pct(laagNu.cohesie)}). PRO zit daartussen.`,
      ...tijd(pro.stippen, pro.paden, [...legenda([["VVD en PRO", TINT.pro], ["VVD en de andere fracties", TINT.rest]]), naam(tx(laatste.halfjaar) - 40, cy(laatste.cohesie!) - 20, pct(laatste.cohesie), TINT.pro)]) },
    { datum: "2010 tot 2023",
      tekst: "Daarvoor waren GroenLinks en PvdA twee fracties. Vanaf 2018 stemden ze tegenover de VVD bijna precies hetzelfde.",
      ...overzicht },
    { datum: "Rutte II", hoofdstuk: "Samen regeren",
      tekst: `Onder Rutte II zaten VVD en PvdA samen in het kabinet. Ze stemden in ${pct(d.perKabinet.r2)} hetzelfde. Onder Rutte I, met de PvdA in de oppositie, was dat ${pct(d.perKabinet.r1)}. GroenLinks bleef onder Rutte II op ${pct(d.perKabinet.r2Gl)}.`,
      ...tijd([...pvdaR2.stippen, ...glZacht.stippen, ...proZacht.stippen], [...band, ...pvda.paden, ...gl.paden, ...pro.paden],
        [...legenda(l3), { x: rond((maandX(d.rutte2.begin) + maandX(d.rutte2.einde)) / 2), y: Y0 + 10, tekst: "Rutte II", anchor: "middle", tint: TINT.pvda, halo: true }]) },
    { datum: "na Rutte II",
      tekst: `Na Rutte II zakte het weer: onder Rutte III stemden VVD en PvdA in ${pct(d.perKabinet.r3)} hetzelfde.`,
      ...tijd([...pvdaNa.stippen, ...glZacht.stippen, ...proZacht.stippen], [...band, ...pvda.paden, ...gl.paden, ...pro.paden], legenda(l3)) },
    { datum: "de PVV",
      tekst: `Bij de PVV hetzelfde patroon. In de tweede helft van 2024, samen in kabinet-Schoof: ${pct(d.pvvSamen)}. In de eerste helft van 2026, met de PVV in de oppositie: ${pct(d.pvvOppositie)}. De PVV stapte in juni 2025 uit het kabinet.`,
      ...tijd([...pvv.stippen, ...proZacht.stippen], [...pvv.paden, ...pro.paden], legenda([["VVD en PVV", TINT.pvv], ["VVD en PRO", TINT.pro]])) },
    { datum: "per onderwerp", hoofdstuk: "Per onderwerp",
      tekst: `Onder kabinet-${d.kabinet} het vaakst eens bij ${hoog.terrein.toLowerCase()} (${pct(hoog.cohesie)}), het minst bij ${laag.terrein.toLowerCase()} (${pct(laag.cohesie)}).`,
      stippen: terStippen, paden: [50, 75].map((v) => ({ d: `M${rx(v)},10 V${ty(T.length - 1) + 20}`, tint: TINT.rest, streep: true, zacht: true, naam: `rang-${v}` })), labels: terLabels },
    { ...overzicht, datum: "2 interpretaties", lezing: 1,
      tekst: `Ze kiezen vaak een andere kant. Nu staat PRO bij de VVD op plek ${plek} van ${R.length}. Bij ${laag.terrein.toLowerCase()} kozen ze vaker een andere kant dan dezelfde. En na Rutte II zakte de PvdA weer naar ${pct(d.perKabinet.r3)}.` },
    { ...overzicht, datum: "2 interpretaties", lezing: 2,
      tekst: `Samen regeren verkleint de afstand. Onder Rutte II stemde de VVD met de PvdA in ${pct(d.perKabinet.r2)} hetzelfde, tegen ${pct(d.perKabinet.r1)} onder Rutte I. Een regeerakkoord stemt mee. Cijfers uit de oppositie zeggen minder over een kabinet.` },
  ];
}
