// Rekenkern van de coalitiebouwer (component coalitie-analyse, E2-S7 en E2-S8).
// Definitie goedgekeurd door Niels op 25 oktober 2026 (docs/plan/08-componenten/coalitie-analyse.md):
//   eensgezind   elke fractie in de groep stemde voor of tegen, allemaal hetzelfde
//   zetels       de fractiegrootte op het moment van de stemming
//   meerderheid  de zetels aan de kant van de groep zijn meer dan de zetels aan de andere kant
//   meegestemd   een fractie buiten de groep stemde hetzelfde als de groep
//   beslissend   de groep had de meerderheid, en zonder de zetels van die fractie niet meer
//   variant      standaard alleen verdeelde stemmingen (fracties voor en tegen); alle stemmingen met een schakelaar
//   zetels bij hoofdelijk: de leden die echt stemden; rangorde: eerst beslissend, dan meegestemd; drempel 25

export type Stemmatrix = {
  fracties: Array<{ id: string; afkorting: string }>;
  stemmen: string[]; // per besluit: per fractie V, T of -
  zetels: Array<Array<[number, number]>>; // per fractie: [besluitnummer, zetels] bij elke wijziging
  besluiten?: string[]; // per regel in stemmen het besluit (migratie 017)
};

export const DREMPEL = 25;

export type Partner = {
  id: string; afkorting: string; meegestemd: number; beslissend: number; aandeel: number;
  beslissendIn: number[]; // regelnummers in de stemmatrix waarop de fractie beslissend was
};
export type Uitkomst = {
  eensgezind: number;
  meerderheid: number;
  zonderHulp: number; // meerderheid met alleen de eigen zetels
  // Verdeeld binnen de groep (K18 punt 3b, 13 november 2026): alle fracties uit de groep stemden voor of tegen, maar
  // niet allemaal hetzelfde. gestemd: alle fracties uit de groep stemden (eensgezind plus verdeeld)
  verdeeldBinnen: number;
  gestemd: number;
  partners: Partner[];
};

// Zetels per fractie per besluit, uit de lijst met wijzigingen
export function zetelTabel(m: Stemmatrix): Int16Array[] {
  return m.zetels.map((reeks) => {
    const t = new Int16Array(m.stemmen.length);
    let i = 0;
    let huidig = reeks.length ? reeks[0][1] : 0;
    for (let b = 0; b < m.stemmen.length; b++) {
      while (i < reeks.length && reeks[i][0] <= b) huidig = reeks[i++][1];
      t[b] = huidig;
    }
    return t;
  });
}

// Verdeeld: er stemden fracties voor en fracties tegen
export const verdeeld = (regel: string) => regel.includes("V") && regel.includes("T");

export function bereken(m: Stemmatrix, groep: string[], zetels = zetelTabel(m), alleenVerdeeld = false): Uitkomst {
  const idx = groep.map((id) => m.fracties.findIndex((f) => f.id === id)).filter((i) => i >= 0);
  const n = m.fracties.length;
  const mee = new Array<number>(n).fill(0);
  const doorslag = new Array<number>(n).fill(0);
  const doorslagIn: number[][] = Array.from({ length: n }, () => []);
  let eensgezind = 0, meerderheid = 0, zonderHulp = 0, verdeeldBinnen = 0;
  if (idx.length) {
    for (let b = 0; b < m.stemmen.length; b++) {
      const regel = m.stemmen[b];
      const stem = regel[idx[0]];
      if (alleenVerdeeld && !verdeeld(regel)) continue;
      if (idx.some((i) => regel[i] === "-")) continue;
      if (idx.some((i) => regel[i] !== stem)) { verdeeldBinnen++; continue; }
      eensgezind++;
      let voor = 0, tegen = 0, eigen = 0;
      for (let f = 0; f < n; f++) {
        const s = regel[f];
        if (s === "-") continue;
        if (s === stem) voor += zetels[f][b];
        else tegen += zetels[f][b];
      }
      for (const i of idx) eigen += zetels[i][b];
      const gewonnen = voor > tegen;
      if (gewonnen) meerderheid++;
      if (eigen > tegen + (voor - eigen)) zonderHulp++;
      for (let f = 0; f < n; f++) {
        if (idx.includes(f) || regel[f] !== stem) continue;
        mee[f]++;
        if (gewonnen && voor - zetels[f][b] <= tegen) { doorslag[f]++; doorslagIn[f].push(b); }
      }
    }
  }
  const partners = m.fracties
    .map((fr, f) => ({ id: fr.id, afkorting: fr.afkorting, meegestemd: mee[f], beslissend: doorslag[f], aandeel: eensgezind ? (100 * mee[f]) / eensgezind : 0, beslissendIn: doorslagIn[f] }))
    .filter((p) => !groep.includes(p.id))
    .sort((a, b) => b.beslissend - a.beslissend || b.meegestemd - a.meegestemd);
  return { eensgezind, meerderheid, zonderHulp, verdeeldBinnen, gestemd: eensgezind + verdeeldBinnen, partners };
}

// De keuze van fracties (K18 punt 3a, 13 november 2026). De bouwer houdt de keuze in eigen state bij en past deze
// functie toe als functionele update: twee tikken direct na elkaar bouwen dan op elkaar voort. Eerder kwam de keuze
// uit de URL, en die was bij de tweede tik nog niet bijgewerkt: dan bleef alleen de tweede fractie over.
export const wisselFractie = (groep: string[], afkorting: string): string[] =>
  groep.includes(afkorting) ? groep.filter((a) => a !== afkorting) : [...groep, afkorting];
// De keuze uit de URL (groep=D66,CDA), alleen bestaande fracties en zonder dubbele
export const groepUitUrl = (waarde: string | null, bestaand: string[]): string[] =>
  [...new Set((waarde ?? "").split(",").filter((a) => bestaand.includes(a)))];

// Per fractie in een groep: hoeveel zetels er zonder haar overblijven en of dat nog een meerderheid is (K18 punt 3b)
export const zonderElk = (groep: Array<{ afkorting: string; zetels: number }>, meerderheid: number) => {
  const totaal = groep.reduce((n, f) => n + f.zetels, 0);
  return groep.map((f) => ({ afkorting: f.afkorting, zetels: totaal - f.zetels, meerderheid: totaal - f.zetels >= meerderheid }));
};

// Snelkeuzes (K18 punt 3c): het huidige kabinet uit api.coalitie, met de partijen uit het stuk kabinet-cu-50plus, en
// zonder één kabinetspartij. Een snelkeuze met een fractie die niet in de zaal zit, valt weg.
export type Snelkeuze = { id: string; naam: string; groep: string[] };
export function snelkeuzes(kabinet: string[], steun: string[], zonder: string, zaal: string[]): Snelkeuze[] {
  const lijst: Snelkeuze[] = [
    { id: "kabinet", naam: "Huidig kabinet", groep: kabinet },
    { id: "met-steun", naam: `Kabinet + ${steun.join(", ").replace(/, ([^,]*)$/, " en $1")}`, groep: [...kabinet, ...steun.filter((a) => !kabinet.includes(a))] },
    { id: `zonder-${zonder.toLowerCase()}`, naam: `${kabinet.filter((a) => a !== zonder).join(" en ")} (zonder de ${zonder})`, groep: kabinet.filter((a) => a !== zonder) },
  ];
  const zinvol = (k: Snelkeuze) => (k.id === "met-steun" ? steun.length > 0 : k.id === "kabinet" || kabinet.includes(zonder));
  return lijst.filter((k) => zinvol(k) && k.groep.length > 0 && k.groep.every((a) => zaal.includes(a)));
}
