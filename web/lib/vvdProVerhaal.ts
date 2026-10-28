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
  // Gemiddelde van de VVD met elke fractie van 2010 tot en met 2023, op afkorting; voor PRO de markeringen PvdA en GL
  gemiddeld: Record<string, number | null>;
  pro: Punt[]; pvda: Punt[]; gl: Punt[]; pvv: Punt[]; // per half jaar, zelfde reeks halve jaren
  anderen: Array<{ naam: string; punten: Punt[] }>; // de VVD met elke andere fractie, als grijze referentie
  perKabinet: { r1: number | null; r2: number | null; r3: number | null; r2Gl: number | null };
  pvvSamen: number | null; pvvOppositie: number | null; // VVD en PVV: tweede helft 2024 en eerste helft 2026
  terreinen: TerreinPaar[]; // VVD en PRO per beleidsterrein onder het huidige kabinet
  rutte2: { begin: string; einde: string };
  kabinet: string;
};

// Tijdas: halve jaren van links naar rechts, cohesie van 20 tot 100% van onder naar boven
const X0 = 70, X1 = 960, Y0 = 40;

// smal: de telefoonversie (vraag Niels, 28 oktober 2026). Daar past de tekening zich aan de inhoud aan, dus mogen de
// tijdgrafiek en de ranglijst hoger zijn: zelfde breedte, meer hoogte, zodat ze op het scherm groter staan
export function vvdProVerhaal(d: VerhaalInvoer, smal = false): Stap[] {
  const Y1 = smal ? 760 : 450;
  const cy = (c: number) => rond(Y1 - ((c - 20) / 80) * (Y1 - Y0));
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

  // Stap 1: de rangorde onder het huidige kabinet als bullet chart (vraag Niels, 28 oktober 2026): een balk vanaf 0% voor
  // nu, een streepje voor het gemiddelde van 2010 tot en met 2023. PRO bestond toen niet: daar twee streepjes, PvdA en
  // GroenLinks. Smaller en met meer ruimte tussen de rijen dan de stippen ervoor, zodat hij op de telefoon groter staat.
  const R = d.rangorde, rx = (c: number) => rond(220 + ((c - 30) / 70) * 720);
  const bx = (c: number) => rond(220 + (c / 100) * 440), ry = (i: number) => rond(30 + i * (smal ? 54 : 36));
  const plek = R.findIndex((x) => x.naam === "PRO") + 1;
  const isPro = (x: { naam: string }) => x.naam === "PRO";
  const rangStippen: Stip[] = R.map((x, i) => ({ key: isPro(x) ? "pro-nu" : `r-${x.naam}`, x: bx(x.cohesie), y: ry(i),
    kleur: isPro(x) ? "nadruk" : null, tint: isPro(x) ? TINT.pro : TINT.rest, r: isPro(x) ? 7 : 6 }));
  const streepjes = (x: { naam: string }): Array<[number, string]> =>
    (isPro(x) ? ([["PvdA", TINT.pvda], ["GL", TINT.gl]] as const) : ([[x.naam, "#e8ecf5"]] as const))
      .flatMap(([k, t]) => (d.gemiddeld[k] == null ? [] : [[d.gemiddeld[k]!, t] as [number, string]]));
  const rangPaden: Pad[] = [
    ...[25, 50, 75, 100].map((v) => ({ d: `M${bx(v)},12 V${ry(R.length - 1) + 18}`, tint: TINT.rest, streep: true, zacht: true, naam: `rang-${v}` })),
    ...R.map((x, i) => ({ d: `M${bx(0)},${ry(i)} H${bx(x.cohesie)}`, tint: isPro(x) ? TINT.pro : TINT.rest, breedte: smal ? 24 : 16, naam: `balk-${x.naam}` })),
    ...R.flatMap((x, i) => streepjes(x).map(([c, t], j) => ({ d: `M${bx(c)},${ry(i) - (smal ? 18 : 13)} V${ry(i) + (smal ? 18 : 13)}`, tint: t, breedte: 3.5, naam: `gem-${x.naam}-${j}` }))),
  ];
  const rangLabels: Tekstlabel[] = [
    ...R.flatMap((x, i) => [
      { x: 200, y: ry(i) + 5, tekst: x.naam, anchor: "end" as const, tint: isPro(x) ? TINT.pro : undefined, zacht: !isPro(x) },
      { x: bx(Math.max(x.cohesie, ...streepjes(x).map(([c]) => c))) + 16, y: ry(i) + 5, tekst: pct(x.cohesie), tint: isPro(x) ? TINT.pro : undefined, zacht: !isPro(x) },
    ]),
    ...[0, 50, 100].map((v) => ({ x: bx(v), y: ry(R.length - 1) + (smal ? 50 : 40), tekst: `${v}%`, anchor: "middle" as const, zacht: true })),
    { x: bx(0), y: -14, tekst: `▬ onder kabinet-${d.kabinet}   | gemiddeld 2010 t/m 2023`, zacht: true },
  ];
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
  // Venster van 2018 tot de fusie (vraag Niels, 28 oktober 2026): de periode waarin de twee lijnen samenvallen
  const FUSIE = "2023-10-27";
  const pvdaSamen = reeks("a", d.pvda, TINT.pvda, (p) => (binnen(p, "2018-01-01", "2024-01-01") ? "nadruk" : "zacht"));
  const glSamen = reeks("g", d.gl, TINT.gl, (p) => (binnen(p, "2018-01-01", "2024-01-01") ? "nadruk" : "zacht"));
  const venster: Pad[] = [{ d: `M${tx("2018-01-01")},${Y0} V${Y1}`, tint: TINT.gl, streep: true, naam: "samen-van" },
    { d: `M${maandX(FUSIE)},${Y0} V${Y1}`, tint: TINT.gl, streep: true, naam: "samen-tot" }];
  const band: Pad[] = [{ d: `M${maandX(d.rutte2.begin)},${Y0} V${Y1}`, tint: TINT.pvda, streep: true, naam: "r2-van" },
    { d: `M${maandX(d.rutte2.einde)},${Y0} V${Y1}`, tint: TINT.pvda, streep: true, naam: "r2-tot" }];
  // Legenda onder elkaar boven de grafiek: naast elkaar vielen de labels op de telefoon over elkaar (daar worden letters groter)
  const legenda = (met: Array<[string, string]>): Tekstlabel[] =>
    met.map(([t, k], i) => ({ x: X0, y: rond(Y0 - 20 - (met.length - 1 - i) * 42), tekst: `● ${t}`, tint: k, groot: true }));
  const l3: Array<[string, string]> = [["VVD en PvdA", TINT.pvda], ["VVD en GroenLinks", TINT.gl], ["VVD en PRO", TINT.pro]];

  // Per onderwerp: een rij per beleidsterrein met minstens 50 stemmingen samen
  const T = d.terreinen.filter((t) => t.gezamenlijk >= 50 && t.cohesie != null).slice(0, 14);
  const ty = (i: number) => rond(30 + i * (smal ? 48 : 31));
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
  // Twee referenties uitgelicht (vraag Niels, 28 oktober 2026): de fractie waarmee de VVD nu het vaakst hetzelfde stemt,
  // en die waarmee het minst; hun lijn in kleur in het grijze veld, PRO ernaast
  const uitgelicht = (x: { naam: string; cohesie: number }, tint: string) => {
    const a = d.anderen.find((y) => y.naam === x.naam);
    if (!a) return null;
    const lijn = reeks(`u-${x.naam}`, a.punten, tint);
    const eind = [...a.punten].reverse().find((p) => p.cohesie != null);
    return { lijn, label: eind ? naam(tx(eind.halfjaar) + 12, cy(eind.cohesie!) + 5, x.naam, tint) : null };
  };
  const HOOG_TINT = "#9CCF83", LAAG_TINT = "#4FB0A6";
  const refHoog = hoogNu.naam !== "PRO" ? uitgelicht(hoogNu, HOOG_TINT) : null;
  const refLaag = laagNu.naam !== "PRO" ? uitgelicht(laagNu, LAAG_TINT) : null;
  const refStap = (u: NonNullable<typeof refHoog>, x: { naam: string; cohesie: number }, tint: string, tekst: string): Stap => ({
    datum: `VVD en ${x.naam}`, tekst,
    ...tijd([...u.lijn.stippen, ...proZacht.stippen], [...u.lijn.paden, ...pro.paden],
      [...legenda([[`VVD en ${x.naam}`, tint], ["VVD en PRO", TINT.pro]]), ...(u.label ? [u.label] : [])]),
  });
  const refStappen: Stap[] = [
    ...(refHoog ? [refStap(refHoog, hoogNu, HOOG_TINT,
      `Het vaakst hetzelfde stemt de VVD nu met ${hoogNu.naam}: ${pct(hoogNu.cohesie)} onder kabinet-${d.kabinet}, tegen ${pct(proNu?.cohesie)} met PRO.`)] : []),
    ...(refLaag ? [refStap(refLaag, laagNu, LAAG_TINT,
      `Het minst met ${laagNu.naam}: ${pct(laagNu.cohesie)} onder kabinet-${d.kabinet}. Met PRO was dat ${pct(proNu?.cohesie)}.`)] : []),
  ];

  return [
    { datum: `onder kabinet-${d.kabinet}`, hoofdstuk: "Nu",
      tekst: `Onder kabinet-${d.kabinet} stemden VVD en PRO in ${pct(proNu?.cohesie)} van de stemmingen hetzelfde: plek ${plek} van ${R.length} fracties met minstens 3 zetels. Middenmoot. Het streepje: hoe vaak de VVD van 2010 tot en met 2023 hetzelfde stemde als die fractie, of zolang die er toen zat; zonder streepje zat ze er toen niet. Bij PRO in blauw de PvdA en in roze GroenLinks, toen nog twee fracties.`,
      stippen: rangStippen, paden: rangPaden, labels: rangLabels },
    { datum: "sinds oktober 2023", hoofdstuk: "Door de jaren",
      tekst: `De lijn van VVD met GroenLinks-PvdA, sinds juni 2026 PRO. Eerst rond de ${pct(eersteNa(d.pro).cohesie)}, het laatste halve jaar ${pct(laatste.cohesie)}. Dat halve jaar loopt nog.`,
      ...tijd(pro.stippen, pro.paden, [...legenda([["VVD en PRO", TINT.pro]]), naam(tx(laatste.halfjaar) - 40, cy(laatste.cohesie!) - 20, pct(laatste.cohesie), TINT.pro)], false) },
    { datum: "ter vergelijking",
      tekst: `In grijs: de VVD met elke andere fractie. Onder kabinet-${d.kabinet} stemde de VVD het vaakst hetzelfde als ${hoogNu.naam} (${pct(hoogNu.cohesie)}), het minst als ${laagNu.naam} (${pct(laagNu.cohesie)}). PRO zit daartussen.`,
      ...tijd(pro.stippen, pro.paden, [...legenda([["VVD en PRO", TINT.pro], ["VVD en de andere fracties", TINT.rest]]), naam(tx(laatste.halfjaar) - 40, cy(laatste.cohesie!) - 20, pct(laatste.cohesie), TINT.pro)]) },
    ...refStappen,
    { datum: "Rutte II", hoofdstuk: "Samen regeren",
      tekst: `Tot oktober 2023 waren GroenLinks en PvdA twee fracties. Onder Rutte II zaten VVD en PvdA samen in het kabinet. Ze stemden in ${pct(d.perKabinet.r2)} hetzelfde. Onder Rutte I, met de PvdA in de oppositie, was dat ${pct(d.perKabinet.r1)}. GroenLinks bleef onder Rutte II op ${pct(d.perKabinet.r2Gl)}.`,
      ...tijd([...pvdaR2.stippen, ...glZacht.stippen, ...proZacht.stippen], [...band, ...pvda.paden, ...gl.paden, ...pro.paden],
        [...legenda(l3), { x: rond((maandX(d.rutte2.begin) + maandX(d.rutte2.einde)) / 2), y: Y0 + 10, tekst: "Rutte II", anchor: "middle", tint: TINT.pvda, halo: true }]) },
    { datum: "na Rutte II",
      tekst: `Na Rutte II zakte het weer: onder Rutte III stemden VVD en PvdA in ${pct(d.perKabinet.r3)} hetzelfde.`,
      ...tijd([...pvdaNa.stippen, ...glZacht.stippen, ...proZacht.stippen], [...band, ...pvda.paden, ...gl.paden, ...pro.paden], legenda(l3)) },
    { datum: "2018 tot 2023",
      tekst: `Vanaf 2018 kwamen GroenLinks en PvdA tegenover de VVD dicht bij elkaar, vanaf 2019 stemden ze bijna precies hetzelfde: hun lijnen lopen over elkaar. In oktober 2023 gingen ze verder als één fractie, sinds juni 2026 PRO.`,
      ...tijd([...pvdaSamen.stippen, ...glSamen.stippen, ...proZacht.stippen], [...venster, ...pvda.paden, ...gl.paden, ...pro.paden],
        [...legenda(l3), { x: rond((tx("2018-01-01") + maandX(FUSIE)) / 2), y: Y0 + 10, tekst: "samen", anchor: "middle", tint: TINT.gl, halo: true }]) },
    { datum: "de PVV",
      tekst: `Bij de PVV hetzelfde patroon. In de tweede helft van 2024, samen in kabinet-Schoof: ${pct(d.pvvSamen)}. In de eerste helft van 2026, met de PVV in de oppositie: ${pct(d.pvvOppositie)}. De PVV stapte in juni 2025 uit het kabinet.`,
      ...tijd([...pvv.stippen, ...proZacht.stippen], [...pvv.paden, ...pro.paden], legenda([["VVD en PVV", TINT.pvv], ["VVD en PRO", TINT.pro]])) },
    { datum: `onder kabinet-${d.kabinet}`, hoofdstuk: "Per onderwerp",
      tekst: `Onder kabinet-${d.kabinet} het vaakst eens bij ${hoog.terrein.toLowerCase()} (${pct(hoog.cohesie)}), het minst bij ${laag.terrein.toLowerCase()} (${pct(laag.cohesie)}).`,
      stippen: terStippen, paden: [50, 75].map((v) => ({ d: `M${rx(v)},10 V${ty(T.length - 1) + 20}`, tint: TINT.rest, streep: true, zacht: true, naam: `rang-${v}` })), labels: terLabels },
    { ...overzicht, datum: "2 interpretaties", lezing: 1,
      tekst: `Ze kiezen vaak een andere kant. Nu staat PRO bij de VVD op plek ${plek} van ${R.length}. Bij ${laag.terrein.toLowerCase()} kozen ze vaker een andere kant dan dezelfde. En na Rutte II zakte de PvdA weer naar ${pct(d.perKabinet.r3)}.` },
    { ...overzicht, datum: "2 interpretaties", lezing: 2,
      tekst: `Samen regeren verkleint de afstand. Onder Rutte II stemde de VVD met de PvdA in ${pct(d.perKabinet.r2)} hetzelfde, tegen ${pct(d.perKabinet.r1)} onder Rutte I. Een regeerakkoord stemt mee. Cijfers uit de oppositie zeggen minder over een kabinet.` },
  ];
}
