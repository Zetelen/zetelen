// Oppositiewerk: het scrollverhaal "Wat kun je als je niet regeert?" (docs/plan/08-componenten/zetelwerk.md).
// De server rekent per stap de plek van elke stip en elke lijn uit; de browser verplaatst alleen nog stippen.
// Alle zinnen worden uit de cijfers opgebouwd; een lezing is altijd een paar, de lezer kiest.
import { getal } from "./cohesie";
import { type Kleur, KORT, PALET, type Pad, type Stap, type Stip, type Tekstlabel, rond, tinten } from "./verhaal";
import { KAMERLEDEN } from "./site";
import { type FractieWerk, type JaarWerk, type PeriodeWerk, type Stuk, type Verbinding, MINIMUM } from "./zetelwerk";

// Gemengd is paars, zodat het duidelijk verschilt van het lichtblauw van de oppositie (feedback Niels K2, 26 oktober 2026)
export const ROL_TINT: Record<string, string> = { oppositie: "#7fb7c9", kabinet: "#d2bb5a", gemengd: "#a08fe0", onbekend: "#6d7590" };
const ROLLEN = ["kabinet", "gemengd", "oppositie", "onbekend"] as const;
const naam = (f: string) => KORT[f] ?? f;
const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);

// Een kolom stippen, van onder naar boven gevuld; sleutel per plek, zodat een stip blijft staan en alleen verkleurt
type Segment = { aantal: number; tint: string; kleur: Kleur };
export function kolom(prefix: string, x0: number, bodem: number, breed: number, stap: number, r: number, segmenten: Segment[]): Stip[] {
  const uit: Stip[] = [];
  let i = 0;
  for (const s of segmenten) {
    for (let k = 0; k < s.aantal; k++, i++) {
      uit.push({ key: `${prefix}-${i}`, x: rond(x0 + (i % breed) * stap), y: rond(bodem - Math.floor(i / breed) * stap), kleur: s.kleur, tint: s.tint, r });
    }
  }
  return uit;
}

// Per groep (jaar of kabinet) de segmenten: per rol, en binnen de rol eerst aangenomen
function segmenten(rijen: Array<{ indiener_rol: string; ingediend: number; aangenomen: number }>, per: number, modus: "neutraal" | "rol" | "aangenomen"): Segment[] {
  const uit: Segment[] = [];
  for (const rol of ROLLEN) {
    const r = rijen.find((x) => x.indiener_rol === rol);
    if (!r) continue;
    const totaal = Math.round(r.ingediend / per);
    const aan = Math.min(totaal, Math.round(r.aangenomen / per));
    if (modus === "neutraal") uit.push({ aantal: totaal, tint: "#566aa6", kleur: null });
    else if (modus === "rol") uit.push({ aantal: totaal, tint: ROL_TINT[rol], kleur: null });
    else uit.push({ aantal: aan, tint: ROL_TINT[rol], kleur: null }, { aantal: totaal - aan, tint: ROL_TINT[rol], kleur: "zacht" });
  }
  return uit;
}

// Legenda groot, direct onder de x-as en in het midden van de grafiek (feedback Niels K2, 26 oktober 2026)
const LEGENDA_Y = 500;
const legenda = (y: number = LEGENDA_Y): Tekstlabel[] => [
  { x: 220, y, tekst: "● kabinet", tint: ROL_TINT.kabinet, groot: true },
  { x: 370, y, tekst: "● oppositie", tint: ROL_TINT.oppositie, groot: true },
  { x: 540, y, tekst: "● indieners uit allebei", tint: ROL_TINT.gemengd, groot: true },
];

// Hoofdstuk 1: steeds meer moties, per jaar (een stip is 50 moties)
export function hoofdstukJaren(rijen: JaarWerk[], ditJaar: number): Stap[] {
  const PER = 50;
  const moties = rijen.filter((r) => r.soort === "Motie" && r.jaar >= 2010);
  const jaren = [...new Set(moties.map((r) => r.jaar))].sort();
  const per = (j: number) => moties.filter((r) => r.jaar === j);
  const totaal = (j: number) => per(j).reduce((t, r) => t + r.ingediend, 0);
  const breedte = 1000 / jaren.length;
  const bouw = (modus: "neutraal" | "rol" | "aangenomen") => jaren.flatMap((j, i) => kolom(`j${j}`, i * breedte + 6, 440, 4, 11, 4.2, segmenten(per(j), PER, modus)));
  const labels: Tekstlabel[] = jaren.filter((_, i) => i % 2 === 0).map((j) => ({ x: Math.round(jaren.indexOf(j) * breedte + 22), y: 470, tekst: String(j), anchor: "middle" }));
  const eerste = jaren[0], laatsteVol = jaren.filter((j) => j < ditJaar).pop() ?? jaren[jaren.length - 1];
  const opp = (j: number) => per(j).find((r) => r.indiener_rol === "oppositie") ?? { ingediend: 0, aangenomen: 0 };
  const kab = (j: number) => per(j).find((r) => r.indiener_rol === "kabinet") ?? { ingediend: 0, aangenomen: 0 };
  const som = (f: (j: number) => { ingediend: number; aangenomen: number }, js: number[]) =>
    js.reduce((t, j) => ({ ingediend: t.ingediend + f(j).ingediend, aangenomen: t.aangenomen + f(j).aangenomen }), { ingediend: 0, aangenomen: 0 });
  const begin = som(opp, jaren.slice(0, 3)), eind = som(opp, jaren.filter((j) => j <= laatsteVol).slice(-3));
  const kabAlles = som(kab, jaren), oppAlles = som(opp, jaren);
  return [
    {
      hoofdstuk: "1 · Steeds meer moties", datum: `${eerste} tot nu`,
      tekst: `In ${eerste} stemde de Kamer over ${getal(totaal(eerste))} moties. In ${laatsteVol} over ${getal(totaal(laatsteVol))}: ${(totaal(laatsteVol) / totaal(eerste)).toLocaleString("nl-NL", { maximumFractionDigits: 1 })} keer zoveel. Elke stip is ${PER} moties.${jaren.includes(ditJaar) ? ` ${ditJaar} is nog niet om.` : ""}`,
      stippen: bouw("neutraal"), labels,
    },
    {
      datum: "wie dient in?",
      tekst: `Het overgrote deel komt van de oppositie: in ${laatsteVol} ${pct(opp(laatsteVol).ingediend, totaal(laatsteVol))}% van alle moties. Kabinetspartijen hebben hun wensen al in het regeerakkoord staan.`,
      stippen: bouw("rol"), labels: [...labels, ...legenda()],
    },
    {
      datum: "en wat haalt het?",
      tekst: `De heldere stippen zijn aangenomen. Van alle moties van de oppositie sinds ${eerste} haalde ${pct(oppAlles.aangenomen, oppAlles.ingediend)}% het, van die van kabinetspartijen ${pct(kabAlles.aangenomen, kabAlles.ingediend)}%. In ${jaren.slice(0, 3).join(", ").replace(/, ([^,]*)$/, " en $1")} haalde ${pct(begin.aangenomen, begin.ingediend)}% van de oppositiemoties het, in de laatste drie volle jaren ${pct(eind.aangenomen, eind.ingediend)}%.`,
      stippen: bouw("aangenomen"), labels: [...labels, ...legenda()],
    },
    {
      datum: "twee lezingen",
      tekst: pct(eind.aangenomen, eind.ingediend) > pct(begin.aangenomen, begin.ingediend)
        ? `Twee lezingen. Meer invloed: de oppositie krijgt vaker iets binnen dan in ${eerste}, en in aantallen meer dan ooit. Of inflatie: moties vragen vaak weinig, een kabinet stemt makkelijk in met een onderzoek of een brief, en een aangenomen motie is nog geen uitgevoerd besluit.`
        : `Twee lezingen. Meer moties, meer kansen: in aantallen krijgt de oppositie meer binnen dan in ${eerste}. Of inflatie: naar verhouding haalt minder het, en een aangenomen motie is nog geen uitgevoerd besluit.`,
      stippen: bouw("aangenomen"), labels: [...labels, ...legenda()],
    },
  ];
}

// Hoofdstukken 2, 3 en 6: per kabinet, voor moties of amendementen
export function hoofdstukKabinetten(rijen: PeriodeWerk[], kabinetten: string[], stuk: Stuk, minderheid: string[]): Stap[] {
  const PER = stuk === "Motie" ? 50 : 10;
  const woord = stuk === "Motie" ? "moties" : "amendementen";
  const per = (k: string) => rijen.filter((r) => r.periode === k && r.soort === stuk);
  const breedte = 1000 / kabinetten.length;
  const bouw = (modus: "rol" | "aangenomen") => kabinetten.flatMap((k, i) => kolom(`${stuk}-${k}`, i * breedte + 10, 440, 11, 12, 4.6, segmenten(per(k), PER, modus)));
  const labels: Tekstlabel[] = kabinetten.map((k, i) => ({ x: Math.round(i * breedte + 70), y: 470, tekst: k, anchor: "middle" }));
  const rol = (k: string, r: string) => per(k).find((x) => x.indiener_rol === r) ?? { ingediend: 0, aangenomen: 0, brede_steun: 0 };
  const succes = (k: string) => pct(rol(k, "oppositie").aangenomen, rol(k, "oppositie").ingediend);
  const meerderheid = kabinetten.filter((k) => !minderheid.includes(k));
  const gem = (ks: string[]) => Math.round(ks.reduce((t, k) => t + succes(k), 0) / Math.max(ks.length, 1));
  const lijst = kabinetten.map((k) => `${k} ${succes(k)}%`).join(", ");
  const hoogste = [...kabinetten].sort((a, b) => succes(b) - succes(a))[0];
  if (stuk === "Amendement") {
    return [
      {
        hoofdstuk: "6 · Aan de wet zelf zitten", datum: "amendementen",
        tekst: `Een amendement verandert een wet direct. Het zijn er veel minder dan moties: elke stip is ${PER} amendementen. Ook hier dient vooral de oppositie in.`,
        stippen: bouw("rol"), labels: [...labels, ...legenda()],
      },
      {
        datum: "wat haalt het?",
        tekst: `Aangenomen amendementen van de oppositie, per kabinet: ${lijst}. Het hoogste aandeel: onder kabinet-${hoogste}.`,
        stippen: bouw("aangenomen"), labels: [...labels, ...legenda()],
        link: KAMERLEDEN ? { href: "/kamerleden?stuk=Amendement", tekst: "Wie dienden de amendementen in?" } : undefined,
      },
    ];
  }
  return [
    {
      hoofdstuk: "2 · Per kabinet", datum: "wie dient in?",
      tekst: `Dezelfde moties, nu per kabinet. Elke stip is ${PER} ${woord}. Onder elk kabinet komt ${Math.min(...kabinetten.map((k) => pct(rol(k, "oppositie").ingediend, per(k).reduce((t, r) => t + r.ingediend, 0))))} tot ${Math.max(...kabinetten.map((k) => pct(rol(k, "oppositie").ingediend, per(k).reduce((t, r) => t + r.ingediend, 0))))}% van de moties van de oppositie.`,
      stippen: bouw("rol"), labels: [...labels, ...legenda()],
    },
    {
      hoofdstuk: "3 · Hoe vaak lukt het?", datum: "aangenomen",
      tekst: `Aangenomen moties van de oppositie, per kabinet: ${lijst}.`,
      stippen: bouw("aangenomen"), labels: [...labels, ...legenda()],
    },
    {
      datum: "twee lezingen",
      // De lezing volgt het verschil: is er geen verschil tussen minderheid en meerderheid, dan zegt de tekst dat
      tekst: Math.abs(gem(minderheid) - gem(meerderheid)) < 5
        ? `Maakt het uit of het kabinet een meerderheid heeft? Nauwelijks: onder ${minderheid.map((k) => `kabinet-${k}`).join(" en ")} haalde gemiddeld ${gem(minderheid)}% van de oppositiemoties het, onder de meerderheidskabinetten ${gem(meerderheid)}%. Wat wel verschuift, is de tijd: van ${succes(kabinetten[0])}% onder kabinet-${kabinetten[0]} naar ${succes(kabinetten[kabinetten.length - 1])}% onder kabinet-${kabinetten[kabinetten.length - 1]}. Twee lezingen: de oppositie wint terrein, of haar moties vragen minder.`
        : `Onder ${minderheid.map((k) => `kabinet-${k}`).join(" en ")}, zonder eigen meerderheid of met gedoogsteun, haalde gemiddeld ${gem(minderheid)}% van de oppositiemoties het, onder de meerderheidskabinetten ${gem(meerderheid)}%. Meer invloed voor de oppositie als het kabinet steun nodig heeft? Of moties die het kabinet toch al wilde? Allebei te verdedigen.`,
      stippen: bouw("aangenomen"), labels: [...labels, ...legenda()],
    },
  ];
}

// Labels bij stippen zonder overlap (verzoek Niels, 26 oktober 2026). Grootste stip eerst; per label de eerste
// vrije plek rechts, links, boven of onder de stip. Is er geen plek, dan schuift het label omhoog of omlaag en
// wijst een dun lijntje naar de stip. Breedte van een label geschat op 8,5 px per teken (15 px, vet).
type Doos = { x0: number; y0: number; x1: number; y1: number };
type LabelStip = { x: number; y: number; r: number; tekst: string; tint?: string };
const raakt = (a: Doos, b: Doos) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
export function plaatsLabels(stippen: LabelStip[], obstakels: Doos[] = [], grens: Doos = { x0: -60, y0: -50, x1: 1060, y1: 505 }): { labels: Tekstlabel[]; lijnen: Pad[] } {
  const bezet: Doos[] = [...obstakels];
  const rondjes = stippen.map((p) => ({ x0: p.x - p.r, y0: p.y - p.r, x1: p.x + p.r, y1: p.y + p.r }));
  const labels: Tekstlabel[] = [], lijnen: Pad[] = [];
  for (const p of [...stippen].sort((a, b) => b.r - a.r)) {
    const b = p.tekst.length * 8.5 + 6, h = 18;
    const doos = (x: number, y: number, anchor: "start" | "middle" | "end"): Doos => {
      const x0 = anchor === "start" ? x - 3 : anchor === "end" ? x - b + 3 : x - b / 2;
      return { x0, y0: y - 14, x1: x0 + b, y1: y + 4 };
    };
    const vrij = (d: Doos, eigen: Doos) => d.x0 >= grens.x0 && d.x1 <= grens.x1 && d.y0 >= grens.y0 && d.y1 <= grens.y1
      && !bezet.some((o) => raakt(o, d)) && !rondjes.some((o) => o !== eigen && raakt(o, d));
    const eigen = rondjes[stippen.indexOf(p)];
    const kandidaten: Array<[number, number, "start" | "middle" | "end"]> = [
      [p.x + p.r + 5, p.y + 5, "start"], [p.x - p.r - 5, p.y + 5, "end"], [p.x, p.y - p.r - 6, "middle"], [p.x, p.y + p.r + 17, "middle"],
    ];
    let keuze = kandidaten.find(([x, y, a]) => vrij(doos(x, y, a), eigen));
    let lijn = false;
    for (let stap = 1; !keuze && stap <= 10; stap++) {
      for (const teken of [-1, 1]) {
        for (const [x, y, a] of [kandidaten[0], kandidaten[1]]) {
          const yy = y + teken * stap * 16;
          if (!keuze && vrij(doos(x + (a === "start" ? 10 : -10), yy, a), eigen)) { keuze = [x + (a === "start" ? 10 : -10), yy, a]; lijn = true; }
        }
      }
    }
    if (!keuze) { keuze = kandidaten[0]; lijn = false; }
    const [x, y, anchor] = keuze;
    bezet.push(doos(x, y, anchor));
    labels.push({ x: rond(x), y: rond(y), tekst: p.tekst, anchor, tint: p.tint, halo: true });
    if (lijn) lijnen.push({ d: `M${rond(p.x)},${rond(p.y)} L${rond(anchor === "start" ? x - 4 : x + 4)},${rond(y - 5)}`, tint: p.tint, breedte: 1, zacht: true });
  }
  return { labels, lijnen };
}

// Hoofdstuk 4: tegenstemmen tegenover aangenomen eigen moties, per fractie, door de kabinetten heen (met sporen)
export function hoofdstukSpreiding(rijen: Array<FractieWerk & { periode: string }>, kabinetten: string[]): Stap[] {
  const X0 = 60, X1 = 960, Y0 = 440, Y1 = 30;
  const geldig = rijen.filter((r) => r.soort === "Motie" && r.ingediend >= MINIMUM && r.tegen_aandeel != null && kabinetten.includes(r.periode));
  // De assen lopen over het bereik in de data (afgerond op 5), zodat de fracties niet op een kluitje staan
  const xs = geldig.map((r) => r.tegen_aandeel!), ys = geldig.map((r) => (100 * r.aangenomen) / r.ingediend);
  const XMIN = Math.max(0, Math.floor((Math.min(...xs) - 3) / 5) * 5), XMAX = Math.min(100, Math.ceil((Math.max(...xs) + 3) / 5) * 5);
  const YMIN = Math.max(0, Math.floor((Math.min(...ys) - 3) / 10) * 10);
  const sx = (t: number) => rond(X0 + ((t - XMIN) / (XMAX - XMIN)) * (X1 - X0));
  const sy = (a: number) => rond(Y0 - ((a - YMIN) / (100 - YMIN)) * (Y0 - Y1));
  const tint = tinten(kabinetten.map((k) => Object.fromEntries(geldig.filter((r) => r.periode === k).map((r) => [r.afkorting, 10]))));
  const midX = (XMIN + XMAX) / 2, midY = (YMIN + 100) / 2;
  const assen: Pad[] = [
    { d: `M${X0},${Y0} H${X1}`, tint: "#566aa6" }, { d: `M${X0},${Y0} V${Y1}`, tint: "#566aa6" },
    { d: `M${sx(midX)},${Y0} V${Y1}`, tint: "#566aa6", streep: true, zacht: true }, { d: `M${X0},${sy(midY)} H${X1}`, tint: "#566aa6", streep: true, zacht: true },
  ];
  const vast: Tekstlabel[] = [
    { x: X1, y: Y0 + 40, tekst: `${XMAX}% tegen gestemd →`, anchor: "end" },
    { x: X0, y: Y0 + 40, tekst: `${XMIN}%`, anchor: "start" },
    { x: X0 - 10, y: Y1 + 5, tekst: "100%", anchor: "end" },
    { x: X0 - 10, y: Y0, tekst: `${YMIN}%`, anchor: "end" },
    { x: X0 - 10, y: sy(midY) + 5, tekst: "eigen moties aangenomen", anchor: "end" },
  ];
  // Kwadrantnamen in de hoeken, kleiner en gedimd; bovenaan boven het vlak, onderaan net onder de as.
  // Ze tellen als obstakel, zodat de fractielabels eromheen gaan.
  const kwadranten: Tekstlabel[] = [
    { x: X0 + 6, y: Y1 - 14, tekst: "stemt weinig tegen, veel eigen moties aangenomen", tint: "#a9b4cc", zacht: true },
    { x: X1, y: Y1 - 14, tekst: "stemt veel tegen, veel eigen moties aangenomen", anchor: "end", tint: "#a9b4cc", zacht: true },
    { x: X0 + 6, y: Y0 + 19, tekst: "stemt weinig tegen, weinig eigen moties aangenomen", tint: "#a9b4cc", zacht: true },
    { x: X1, y: Y0 + 19, tekst: "stemt veel tegen, weinig eigen moties aangenomen", anchor: "end", tint: "#a9b4cc", zacht: true },
  ];
  const obstakels = kwadranten.map((l) => {
    const b = l.tekst.length * 7;
    const x0 = l.anchor === "end" ? l.x - b : l.x;
    return { x0, y0: l.y - 12, x1: x0 + b, y1: l.y + 3 };
  });
  vast.push(...kwadranten);
  const plek = (r: FractieWerk) => ({ x: sx(r.tegen_aandeel!), y: sy((100 * r.aangenomen) / r.ingediend) });
  const stappen: Stap[] = kabinetten.map((k, i) => {
    const hier = geldig.filter((r) => r.periode === k);
    // Sporen alleen voor fracties die van rol wisselden (kabinet en oppositie): daar zit de beweging
    const sporen: Pad[] = [...new Set(hier.map((r) => r.afkorting))].flatMap((f) => {
      const eerder = kabinetten.slice(0, i + 1).map((kk) => geldig.find((r) => r.periode === kk && r.afkorting === f)).filter((r): r is NonNullable<typeof r> => !!r);
      if (new Set(eerder.map((r) => r.rol)).size < 2) return [];
      const punten = eerder.map(plek);
      return punten.length > 1 ? [{ d: `M${punten.map((p) => `${p.x},${p.y}`).join(" L")}`, tint: tint.get(f), breedte: 2.5 }] : [];
    });
    // De oppositie centraal: wie stemde daar het vaakst tegen, en wie kreeg naar verhouding het meeste binnen?
    const opp = hier.filter((r) => r.rol !== "kabinet");
    const kab = hier.filter((r) => r.rol === "kabinet");
    const gemTegen = (rs: typeof hier) => Math.round(rs.reduce((t, r) => t + (r.tegen_aandeel ?? 0), 0) / Math.max(rs.length, 1));
    // In de zinnen alleen fracties met minstens 25 eigen moties: een afsplitsing met net 10 haalt anders de kop
    const groot = opp.filter((r) => r.ingediend >= 25);
    const tegen = [...groot].sort((a, b) => (b.tegen_aandeel ?? 0) - (a.tegen_aandeel ?? 0))[0];
    const succes = [...groot].sort((a, b) => b.aangenomen / b.ingediend - a.aangenomen / a.ingediend)[0];
    const straal = (r: FractieWerk) => 9 + Math.min(10, Math.sqrt(r.ingediend) / 3);
    const geplaatst = plaatsLabels(hier.map((r) => ({ ...plek(r), r: straal(r), tekst: naam(r.afkorting), tint: tint.get(r.afkorting) })), obstakels);
    const oppZin = tegen && succes
      ? `In de oppositie stemde ${naam(tegen.afkorting)} het vaakst tegen (${Math.round(tegen.tegen_aandeel!)}%), en kreeg ${naam(succes.afkorting)} naar verhouding de meeste eigen moties aangenomen (${pct(succes.aangenomen, succes.ingediend)}%).`
      : "";
    return {
      hoofdstuk: i === 0 ? "4 · Tegenstemmen en zelf scoren" : undefined,
      datum: `kabinet-${k}`,
      tekst: i === 0
        ? `Elke stip is een fractie. Naar rechts: vaker tegen gestemd. Naar boven: meer eigen moties aangenomen. Een gouden rand: in het kabinet. Wat opvalt: wie regeert, stemt het vaakst tegen. Onder kabinet-${k} stemden de kabinetsfracties gemiddeld op ${gemTegen(kab)}% van de stemmingen tegen, de oppositie op ${gemTegen(opp)}%. Ze stemmen tegen de vele moties van de oppositie. ${oppZin}`
        : `Onder kabinet-${k}: kabinetsfracties gemiddeld ${gemTegen(kab)}% tegen, oppositie ${gemTegen(opp)}%. ${oppZin} De lijnen volgen fracties die van rol wisselden.`,
      stippen: hier.map((r) => ({ key: `f-${r.afkorting}`, ...plek(r), r: straal(r), tint: tint.get(r.afkorting)!, kleur: (r.rol === "kabinet" ? "kabinet" : null) as Kleur })),
      labels: [...vast, ...geplaatst.labels],
      paden: [...assen, ...sporen, ...geplaatst.lijnen],
    };
  });
  const laatste = stappen[stappen.length - 1];
  stappen.push({
    ...laatste, datum: "twee lezingen",
    tekst: "Twee lezingen. Wie vaak tegen stemt en zelf weinig binnenhaalt, ligt dwars. Of: tegenstemmen is gewoon wat een meerderheid doet met moties die ze niet wil, en het zegt meer over je rol dan over je houding. De lijnen volgen de fracties die van rol wisselden: kijk hoe ze verschoven zodra ze gingen regeren, of ermee ophielden.",
    hoofdstuk: undefined,
  });
  return stappen;
}

// Hoofdstuk 5: samen ingediend, een netwerk van fracties op een cirkel; oranje lijnen gaan over de grens
export function hoofdstukNetwerk(perKabinet: Array<{ kabinet: string; verbindingen: Verbinding[]; rollen: Map<string, string> }>): Stap[] {
  const fracties = [...new Set(perKabinet.flatMap((p) => p.verbindingen.flatMap((v) => [v.fractie_a, v.fractie_b])))].sort();
  const tint = tinten([Object.fromEntries(fracties.map((f) => [f, 10]))]);
  const plek = new Map(fracties.map((f, i) => {
    const hoek = (2 * Math.PI * i) / fracties.length - Math.PI / 2;
    return [f, { x: rond(500 + 330 * Math.cos(hoek)), y: rond(235 + 210 * Math.sin(hoek)) }];
  }));
  return perKabinet.map((pAlles, i) => {
    // Alleen de 25 sterkste verbindingen in beeld; de tellingen in de tekst gaan over alle
    const p = { ...pAlles, verbindingen: [...pAlles.verbindingen].sort((a, b) => b.stukken - a.stukken).slice(0, 25) };
    const max = Math.max(1, ...p.verbindingen.map((v) => v.stukken));
    const actief = new Set(p.verbindingen.flatMap((v) => [v.fractie_a, v.fractie_b]));
    const grens = (v: Verbinding) => (p.rollen.get(v.fractie_a) ?? "oppositie") !== (p.rollen.get(v.fractie_b) ?? "oppositie");
    const over = pAlles.verbindingen.filter(grens);
    const sterkste = [...over].sort((a, b) => b.stukken - a.stukken)[0];
    return {
      hoofdstuk: i === 0 ? "5 · Samenwerken over de grens" : undefined,
      datum: `kabinet-${p.kabinet}`,
      tekst: `Een lijn: samen moties ingediend, hoe dikker hoe vaker; de 25 sterkste verbindingen staan in beeld. Oranje lijnen lopen tussen kabinet en oppositie. Onder kabinet-${p.kabinet} ${getal(over.reduce((t, v) => t + v.stukken, 0))} keer over de grens${sterkste ? `, het vaakst ${naam(sterkste.fractie_a)} met ${naam(sterkste.fractie_b)} (${getal(sterkste.stukken)} keer)` : ""}.`,
      stippen: fracties.filter((f) => actief.has(f)).map((f) => ({ key: `f-${f}`, ...plek.get(f)!, tint: tint.get(f)!, kleur: (p.rollen.get(f) === "kabinet" ? "kabinet" : null) as Kleur, r: 11 })),
      labels: fracties.filter((f) => actief.has(f)).map((f) => {
        const q = plek.get(f)!;
        return { x: q.x + (q.x >= 500 ? 16 : -16), y: q.y + 5, tekst: naam(f), anchor: (q.x >= 500 ? "start" : "end") as "start" | "end", tint: tint.get(f) };
      }),
      paden: p.verbindingen.filter((v) => plek.has(v.fractie_a) && plek.has(v.fractie_b)).map((v) => {
        const a = plek.get(v.fractie_a)!, b = plek.get(v.fractie_b)!;
        return { d: `M${a.x},${a.y} Q500,235 ${b.x},${b.y}`, breedte: rond(0.6 + (8 * v.stukken) / max), tint: grens(v) ? "#e0915a" : "#566aa6", zacht: !grens(v) };
      }),
      link: i === perKabinet.length - 1 && KAMERLEDEN ? { href: "/kamerleden", tekst: "Wie dienden wat in?" } : undefined,
    };
  });
}

// Hoofdstuk 4 en 5 als één beeld (verzoek Niels, 26 oktober 2026): na de spreiding schuiven dezelfde
// fractiestippen naar hun plek op de cirkel, eerst zonder lijnen; daarna verschijnt het netwerk.
export function hoofdstukTegenEnSamen(spreiding: Stap[], netwerk: Stap[]): Stap[] {
  if (!netwerk.length) return spreiding;
  // Elke fractie houdt de tint uit de laatste stap van de spreiding (daar zijn alle tinten verschillend), zodat een
  // stip niet van kleur verschiet als hij doorschuift. Fracties die daar niet staan, krijgen een tint die nog vrij is.
  const tintVan = new Map((spreiding[spreiding.length - 1]?.stippen ?? []).map((p) => [p.key, p.tint] as const));
  for (const key of [...new Set(netwerk.flatMap((st) => st.stippen.map((p) => p.key)))].sort()) {
    if (tintVan.has(key)) continue;
    const vrij = PALET.find((k) => ![...tintVan.values()].includes(k));
    if (vrij) tintVan.set(key, vrij);
  }
  const naarTint = new Map([...tintVan].map(([k, v]) => [naam(k.slice(2)), v]));
  const hertint = (st: Stap): Stap => ({
    ...st,
    stippen: st.stippen.map((p) => ({ ...p, tint: tintVan.get(p.key) ?? p.tint })),
    labels: st.labels.map((l) => ({ ...l, tint: naarTint.get(l.tekst) ?? l.tint })),
  });
  const [eerste, ...rest] = netwerk.map(hertint);
  const brug: Stap = {
    ...eerste,
    hoofdstuk: "5 · Samenwerken over de grens",
    datum: "van tegen naar samen",
    tekst: "Tegenstemmen zegt veel over je rol. Wat je zelf indient, laat zien met wie je werkt. Dezelfde fracties, nu op een cirkel. Zo meteen betekent een lijn: samen een motie ingediend.",
    paden: [],
    link: undefined,
  };
  return [...spreiding, brug, { ...eerste, hoofdstuk: undefined }, ...rest];
}
