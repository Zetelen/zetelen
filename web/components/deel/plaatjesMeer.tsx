// Voorbeeldplaatjes voor de deellinks van de overige grafieken (ronde 2 en 3, 28 oktober 2026). Zelfde opbouw en
// kleuren als components/deel/plaatjes.tsx; alleen cijfers uit de database of uit de vaste gegevens van de pagina, met
// dezelfde berekening als op de site. De keuzes in `zoek` zijn al gecontroleerd (lib/deelSchoon.ts).
import opvolgers from "@/content/fractie-opvolgers.json";
import snel from "@/content/wetten/2020Z17945.json";
import gewoon from "@/content/wetten/2018Z15488.json";
import lang from "@/content/wetten/2020Z11768.json";
import { laatstBijgewerkt } from "@/lib/api";
import { cohesieIn, fractiesIn, keuzeUitUrl, perioden, procent } from "@/lib/cohesie";
import { schaalkleur } from "@/lib/kleur";
import { MINIMUM_UITERSTEN, cohesiePerTerrein, paarPerTerrein, stemmingenPerTerrein } from "@/lib/onderwerpen";
import { MOTIES, telling as ontradenTelling } from "@/lib/ontraden";
import { stemming as eerdmans } from "@/lib/stemmingVerhaal";
import { type Opvolger, halveJaren, laadTrend, punten } from "@/lib/trend";
import { CASUSSEN, perFractie } from "@/lib/uitgelicht";
import { UITGELICHT } from "@/lib/uitgelichtLijst";
import type { Stemming } from "@/lib/verhaal";
import { KABINETTEN_SINDS_2010 } from "@/lib/voorpagina";
import { sleutel } from "@/lib/zaal";
import { type Reis, WETSVOORSTELLEN, duurTekst, duurVan, telling as wettenTelling, zonderVoorafAdvies } from "@/lib/wetten";
import { MINIMUM, type Stuk, fractieWerk, jaarWerk, kamerleden, periodeWerk, persoonWerk, ranglijst } from "@/lib/zetelwerk";
import { KLEUR, Kader, Melding, rond } from "./plaatjes";

type Zoek = Record<string, string>;
const GRAFIEK_HOOG = 250; // ruimte voor de grafiek, ook als de titel twee regels beslaat

// Liggende balken, de rijen verdelen de ruimte; bij veel rijen kleiner
type BalkRij = { label: string; waarde: number | null; tekst: string; tint?: string; nadruk?: boolean };
function Balken({ rijen, max = 100, labelBreed = 300, tekstBreed = 150 }: { rijen: BalkRij[]; max?: number; labelBreed?: number; tekstBreed?: number }) {
  const h = Math.min(46, Math.floor(GRAFIEK_HOOG / Math.max(1, rijen.length)));
  const letter = Math.max(15, Math.min(28, h - 12));
  const baan = 1072 - labelBreed - tekstBreed - 40;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rijen.map((r) => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 20, height: h }}>
          <div style={{ display: "flex", width: labelBreed, fontSize: letter, color: r.nadruk ? KLEUR.goud : KLEUR.tekst }}>{r.label}</div>
          <div style={{ display: "flex", width: baan, height: Math.max(8, h - 18), background: KLEUR.vlak, borderRadius: 4 }}>
            {r.waarde != null && <div style={{ display: "flex", width: `${Math.min(100, (100 * r.waarde) / max)}%`, height: "100%", background: r.tint ?? schaalkleur(r.waarde), borderRadius: 4 }} />}
          </div>
          <div style={{ display: "flex", fontSize: letter, color: r.nadruk ? KLEUR.goud : KLEUR.tekst }}>{r.tekst}</div>
        </div>
      ))}
    </div>
  );
}

// Staande kolommen per groep, met één of meer reeksen naast elkaar of gestapeld
type Reeks = { naam: string; tint: string };
function Kolommen({ groepen, reeksen, max, waardeTekst, gestapeld = false, labelElke = 1 }: {
  groepen: Array<{ label: string; waarden: Array<number | null> }>; reeksen: Reeks[]; max: number;
  waardeTekst?: (w: number) => string; gestapeld?: boolean; labelElke?: number;
}) {
  const HOOG = 190, breed = Math.floor((860 - groepen.length * 6) / groepen.length);
  const kolom = gestapeld ? breed : Math.floor((breed - 6) / reeksen.length);
  return (
    <div style={{ display: "flex", width: "100%", alignItems: "flex-end", gap: 24 }}>
      <div style={{ display: "flex", flex: 1, alignItems: "flex-end", justifyContent: "space-between", borderBottom: `2px solid ${KLEUR.lijn}` }}>
        {groepen.map((g, i) => (
          <div key={g.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: breed }}>
            <div style={{ display: "flex", flexDirection: gestapeld ? "column-reverse" : "row", alignItems: gestapeld ? "stretch" : "flex-end", gap: gestapeld ? 0 : 4, height: HOOG + 30, justifyContent: gestapeld ? "flex-start" : "center" }}>
              {g.waarden.map((w, j) => (
                <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: kolom, height: gestapeld ? (HOOG * (w ?? 0)) / max : HOOG + 30 }}>
                  {!gestapeld && waardeTekst && w != null && <div style={{ display: "flex", fontSize: 18, marginBottom: 4 }}>{waardeTekst(w)}</div>}
                  <div style={{ display: "flex", width: kolom, height: w == null ? 0 : (HOOG * Math.min(w, max)) / max, background: reeksen[j].tint, borderRadius: gestapeld ? 0 : "3px 3px 0 0" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 18, height: 26, marginTop: 6 }}>{i % labelElke === 0 ? g.label : ""}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 190, fontSize: 20, paddingBottom: 40 }}>
        {reeksen.map((r) => (
          <div key={r.naam} style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ display: "flex", width: 18, height: 18, background: r.tint }} />{r.naam}</div>
        ))}
      </div>
    </div>
  );
}

const periodeRegel = (soort: string, naam: string) => (soort === "kabinet" ? `Kabinet-${naam}` : `Kamer ${naam}`);

// Verkenner, door de jaren: hoe vaak twee partijen hetzelfde stemden, per half jaar sinds 2010
export async function trendPlaatje(zoek: Zoek) {
  const [lijst, stand] = await Promise.all([perioden(), laatstBijgewerkt()]);
  const { soort, periode, variant } = keuzeUitUrl(zoek, lijst);
  const fracties = periode ? await fractiesIn(soort, periode.naam) : null;
  const trend = fracties ? await laadTrend(fracties, zoek.fractie, zoek.met, variant, opvolgers.opvolgers as Opvolger[]) : null;
  if (!trend) return <Kader kop="Wie stemt met wie" titel="Hoe vaak stemden twee partijen hetzelfde?" regel="" stand={stand}><Melding tekst="De cijfers laden nu niet" /></Kader>;
  const jaren = halveJaren(new Date());
  const reeks = punten(trend.hoofd, jaren);
  const B = 1000, H = 250, sx = (i: number) => 40 + (i / Math.max(1, jaren.length - 1)) * (B - 60), sy = (c: number) => 10 + (1 - c / 100) * (H - 40);
  const pad = (ps: Array<{ cohesie: number | null }>) => {
    let d = "", nieuw = true;
    ps.forEach((p, i) => { if (p.cohesie == null) { nieuw = true; return; } d += `${nieuw ? "M" : "L"}${sx(i).toFixed(1)},${sy(p.cohesie).toFixed(1)} `; nieuw = false; });
    return d.trim();
  };
  const laatste = [...reeks].reverse().find((p) => p.cohesie != null);
  return (
    <Kader kop="Wie stemt met wie" titel={`Hoe vaak stemden ${trend.a.naam} en ${trend.b.naam} hetzelfde, sinds 2010?`} stand={stand}
      regel={`Per half jaar · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}${laatste ? ` · laatst ${rond(laatste.cohesie)}` : ""}`}>
      {/* next/og tekent geen tekst in een svg: de aslabels staan er als losse blokken overheen */}
      <div style={{ display: "flex", position: "relative", width: B, height: H }}>
        <svg width={B} height={H} viewBox={`0 0 ${B} ${H}`}>
          {[0, 50, 100].map((c) => <line key={c} x1={40} x2={B - 20} y1={sy(c)} y2={sy(c)} stroke={KLEUR.lijn} strokeWidth={1} />)}
          {trend.extra.map((e) => <path key={e.naam} d={pad(punten(e.rijen, jaren))} fill="none" stroke={KLEUR.zacht} strokeWidth={2} strokeDasharray="4 4" />)}
          <path d={pad(reeks)} fill="none" stroke={KLEUR.goud} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        {[0, 50, 100].map((c) => <div key={`t${c}`} style={{ display: "flex", position: "absolute", left: 0, top: sy(c) - 11, fontSize: 18, color: KLEUR.zacht }}>{`${c}%`}</div>)}
        {jaren.map((j, i) => (j.endsWith("01-01") && Number(j.slice(0, 4)) % 4 === 2
          ? <div key={j} style={{ display: "flex", position: "absolute", left: sx(i) - 22, top: H - 24, fontSize: 18, color: KLEUR.zacht }}>{j.slice(0, 4)}</div> : null))}
      </div>
    </Kader>
  );
}

// Onderwerpen: een paar per beleidsterrein, of zonder tweede partij per terrein de partij waarmee het vaakst eens
export async function onderwerpenPlaatje(zoek: Zoek) {
  const [lijst, stand] = await Promise.all([perioden(), laatstBijgewerkt()]);
  const { soort, periode, variant } = keuzeUitUrl(zoek, lijst);
  const fracties = periode ? await fractiesIn(soort, periode.naam) : null;
  const zaal = (fracties ?? []).filter((f) => f.inZaal).sort((a, b) => b.zetels - a.zetels || a.afkorting.localeCompare(b.afkorting));
  const gekozen = zaal.find((f) => f.afkorting === zoek.fractie) ?? zaal[0];
  const met = zaal.find((f) => f.afkorting === zoek.met && f.id !== gekozen?.id) ?? null;
  const perTerrein = periode && gekozen ? await cohesiePerTerrein(soort, periode.naam, variant, gekozen.id) : null;
  const wanneer = periode ? `${periodeRegel(soort, periode.naam)} · ${variant === "alle" ? "alle stemmingen" : "alleen verdeelde stemmingen"}` : "";
  if (!perTerrein || !gekozen || !periode) return <Kader kop="Per onderwerp" titel="Waarover zijn partijen het eens?" regel="" stand={stand}><Melding tekst="De cijfers laden nu niet" /></Kader>;
  if (met) {
    const [paar, kaart] = [paarPerTerrein(perTerrein, met.id), await cohesieIn(soort, periode.naam, variant)];
    const totaal = kaart?.get(sleutel(gekozen.id, met.id))?.cohesie ?? null;
    const rijen = paar.filter((p) => !p.teWeinig && p.cohesie != null && p.gezamenlijk >= MINIMUM_UITERSTEN).slice(0, 10)
      .map((p) => ({ label: p.terrein, waarde: p.cohesie, tekst: procent(p.cohesie) }));
    return (
      <Kader kop="Per onderwerp" titel={`Waarover zijn ${gekozen.afkorting} en ${met.afkorting} het eens?`} stand={stand}
        regel={`${wanneer}${totaal != null ? ` · over alles samen ${procent(totaal)}` : ""}`}>
        {rijen.length ? <Balken rijen={rijen} labelBreed={380} /> : <Melding tekst="Te weinig stemmingen om iets te zeggen" />}
      </Kader>
    );
  }
  const aantallen = await stemmingenPerTerrein(soort, periode.naam);
  const naamVan = new Map(zaal.map((f) => [f.id, f.afkorting]));
  const rijen = [...aantallen.keys()].filter((t) => perTerrein.has(t)).sort((a, b) => (aantallen.get(b) ?? 0) - (aantallen.get(a) ?? 0)).slice(0, 8)
    .flatMap((t) => {
      const beste = [...perTerrein.get(t)!].filter(([id, p]) => naamVan.has(id) && !p.teWeinig && p.cohesie != null).sort((a, b) => b[1].cohesie! - a[1].cohesie!)[0];
      return beste ? [{ label: t, waarde: beste[1].cohesie, tekst: `${naamVan.get(beste[0])} ${procent(beste[1].cohesie)}` }] : [];
    });
  return (
    <Kader kop="Per onderwerp" titel={`Met wie is ${gekozen.afkorting} het per onderwerp het vaakst eens?`} stand={stand}
      regel={`${wanneer} · de acht onderwerpen met de meeste stemmingen`}>
      <Balken rijen={rijen} labelBreed={320} tekstBreed={300} />
    </Kader>
  );
}

// Eén uitgelichte stemming: de uitslag en welke partijen voor en tegen stemden
export async function stemmingPlaatje(zoek: Zoek) {
  const stand = await laatstBijgewerkt();
  const u = UITGELICHT.find((x) => x.slug === zoek.casus);
  if (!u) return <Kader kop="Uitgelicht" titel="Eén stemming van dichtbij" regel="" stand={stand}><Melding tekst="Deze stemming bestaat niet" /></Kader>;
  const casus = CASUSSEN.find((c) => c.slug === u.slug);
  const st = (casus ? casus.data.besluiten[casus.data.besluiten.length - 1].stemmen : eerdmans.stemmen) as Stemming;
  const rijen = perFractie(st);
  const voor = rijen.reduce((t, r) => t + r.voor, 0), tegen = rijen.reduce((t, r) => t + r.tegen, 0);
  const lijstVan = (kant: string) => rijen.filter((r) => r.kant === kant).map((r) => r.fractie).join(", ");
  return (
    <Kader kop={`Uitgelicht · ${u.datums.map((d) => d.slice(0, 4)).join(", ")}`} titel={u.vraag} regel={`${u.titel}: ${u.uitslag}`} stand={stand}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, width: "100%" }}>
        <div style={{ display: "flex", width: "100%", height: 54, borderRadius: 6, overflow: "hidden" }}>
          <div style={{ display: "flex", width: `${(100 * voor) / Math.max(1, voor + tegen)}%`, background: "#9CCF83", color: KLEUR.achter, fontSize: 30, alignItems: "center", paddingLeft: 16 }}>{`voor ${voor}`}</div>
          <div style={{ display: "flex", flex: 1, background: "#E57F93", color: KLEUR.achter, fontSize: 30, alignItems: "center", justifyContent: "flex-end", paddingRight: 16 }}>{`tegen ${tegen}`}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, lineHeight: 1.35 }}>{`Voor: ${lijstVan("Voor") || "geen"}`}</div>
        <div style={{ display: "flex", fontSize: 24, lineHeight: 1.35 }}>{`Tegen: ${lijstVan("Tegen") || "geen"}`}</div>
      </div>
    </Kader>
  );
}

const stukVan = (z: Zoek): Stuk => (z.stuk === "Amendement" ? "Amendement" : z.stuk === "Wetsvoorstel" ? "Wetsvoorstel" : "Motie");
const woordVan = (stuk: Stuk) => (stuk === "Amendement" ? "amendementen" : stuk === "Wetsvoorstel" ? "initiatiefwetten" : "moties");

// Kamerleden: per partij hoeveel er werd ingediend en welk deel werd aangenomen
export async function kamerledenPlaatje(zoek: Zoek) {
  const [lijst, stand] = await Promise.all([perioden(), laatstBijgewerkt()]);
  const { soort, periode } = keuzeUitUrl(zoek, lijst);
  const stuk = stukVan(zoek);
  const rijen = periode ? ((await fractieWerk(soort, periode.naam)) ?? []).filter((r) => r.soort === stuk && r.ingediend > 0).sort((a, b) => b.ingediend - a.ingediend).slice(0, 10) : [];
  return (
    <Kader kop="Kamerleden" titel={`Hoeveel ${woordVan(stuk)} dienden de partijen in?`} stand={stand}
      regel={`${periode ? periodeRegel(soort, periode.naam) : ""} · balk: deel aangenomen · goud: kabinet, blauw: oppositie`}>
      {rijen.length ? (
        <Balken labelBreed={260} tekstBreed={170} rijen={rijen.map((r) => ({ label: r.afkorting, waarde: (100 * r.aangenomen) / r.ingediend,
          tekst: `${rond((100 * r.aangenomen) / r.ingediend)} van ${r.ingediend}`, tint: r.rol === "kabinet" ? KLEUR.goud : KLEUR.amendement }))} />
      ) : <Melding tekst="Geen gegevens voor deze keuze" />}
    </Kader>
  );
}

// Ranglijst: welke Kamerleden kregen het grootste deel van hun eigen stukken aangenomen, per rol
export async function ranglijstPlaatje(zoek: Zoek) {
  const [lijst, stand] = await Promise.all([perioden(), laatstBijgewerkt()]);
  const { soort, periode } = keuzeUitUrl(zoek, lijst);
  const stuk = stukVan(zoek), rol = zoek.rol === "kabinet" ? "kabinet" : "oppositie";
  const [fracties, personen] = periode ? await Promise.all([fractieWerk(soort, periode.naam), persoonWerk(soort, periode.naam)]) : [null, null];
  const rollen = new Map((fracties ?? []).map((r) => [r.afkorting, r.rol]));
  const plekken = ranglijst(kamerleden(personen ?? []), stuk, rol, (f) => (f ? rollen.get(f) : undefined)).slice(0, 8);
  const wet = stuk === "Wetsvoorstel";
  return (
    <Kader kop="Kamerleden" titel={`Wie krijgt het vaakst iets aangenomen? (${rol})`} stand={stand}
      regel={`${periode ? periodeRegel(soort, periode.naam) : ""} · ${wet ? "aantal aangenomen initiatiefwetten" : `deel van de eigen ${woordVan(stuk)} aangenomen, vanaf ${MINIMUM} ingediend`}`}>
      {plekken.length ? (
        <Balken labelBreed={420} max={wet ? Math.max(...plekken.map((p) => p.aangenomen)) : 100}
          rijen={plekken.map((p) => ({ label: `${p.naam} (${p.fractie ?? "?"})`, waarde: wet ? p.aangenomen : p.aandeel,
            tekst: wet ? String(p.aangenomen) : `${rond(p.aandeel)} van ${p.ingediend}`, tint: rol === "kabinet" ? KLEUR.goud : KLEUR.amendement }))} />
      ) : <Melding tekst="Geen gegevens voor deze keuze" />}
    </Kader>
  );
}

// Oppositie, hoofdstuk 1: moties per jaar, met het deel van de oppositie
export async function oppositieJarenPlaatje() {
  const [jaren, stand] = await Promise.all([jaarWerk(), laatstBijgewerkt()]);
  const moties = (jaren ?? []).filter((r) => r.soort === "Motie" && r.jaar >= 2010);
  const lijst = [...new Set(moties.map((r) => r.jaar))].sort();
  const som = (j: number, rol?: string) => moties.filter((r) => r.jaar === j && (!rol || r.indiener_rol === rol)).reduce((t, r) => t + r.ingediend, 0);
  const groepen = lijst.map((j) => ({ label: String(j), waarden: [som(j, "oppositie"), som(j) - som(j, "oppositie")] }));
  const max = Math.max(1, ...lijst.map((j) => som(j)));
  return (
    <Kader kop="Oppositie" titel="Steeds meer moties" stand={stand} regel="Moties per jaar waarover de Kamer stemde, van de oppositie en de rest">
      {groepen.length ? <Kolommen groepen={groepen} reeksen={[{ naam: "oppositie", tint: KLEUR.koper }, { naam: "kabinet en gemengd", tint: "#566AA6" }]} max={max} gestapeld labelElke={2} /> : <Melding tekst="De cijfers laden nu niet" />}
    </Kader>
  );
}

// Oppositie, hoofdstuk 2 en 6: per kabinet het deel dat werd aangenomen, voor kabinet en oppositie
export async function oppositieKabinettenPlaatje(zoek: Zoek) {
  const [werk, stand] = await Promise.all([periodeWerk("kabinet"), laatstBijgewerkt()]);
  const stuk = zoek.stuk === "Amendement" ? "Amendement" : "Motie";
  const deel = (k: string, rol: string) => {
    const r = (werk ?? []).find((x) => x.periode === k && x.soort === stuk && x.indiener_rol === rol);
    return r && r.ingediend ? (100 * r.aangenomen) / r.ingediend : null;
  };
  const groepen = KABINETTEN_SINDS_2010.map((k) => ({ label: k, waarden: [deel(k, "kabinet"), deel(k, "oppositie")] }));
  const woord = stuk === "Motie" ? "moties" : "amendementen";
  return (
    <Kader kop="Oppositie" titel={`Hoeveel ${woord} van de oppositie werden aangenomen?`} stand={stand}
      regel={`Deel van de ingediende ${woord} dat werd aangenomen, per kabinet, naar wie ze indiende`}>
      {werk ? <Kolommen groepen={groepen} reeksen={[{ naam: "kabinet", tint: KLEUR.goud }, { naam: "oppositie", tint: KLEUR.koper }]} max={100} waardeTekst={(w) => `${Math.round(w)}%`} /> : <Melding tekst="De cijfers laden nu niet" />}
    </Kader>
  );
}

// Oppositie, hoofdstuk 4: per partij hoe vaak ze tegen stemde en welk deel van haar eigen moties werd aangenomen
export async function oppositieSpreidingPlaatje() {
  const kabinet = KABINETTEN_SINDS_2010[KABINETTEN_SINDS_2010.length - 1];
  const [rijen, stand] = await Promise.all([fractieWerk("kabinet", kabinet), laatstBijgewerkt()]);
  const geldig = (rijen ?? []).filter((r) => r.soort === "Motie" && r.ingediend >= MINIMUM && r.tegen_aandeel != null);
  const B = 1000, H = 300;
  const xs = geldig.map((r) => r.tegen_aandeel!), ys = geldig.map((r) => (100 * r.aangenomen) / r.ingediend);
  const x0 = Math.max(0, Math.floor((Math.min(...xs) - 3) / 5) * 5), x1 = Math.min(100, Math.ceil((Math.max(...xs) + 3) / 5) * 5);
  const y0 = Math.max(0, Math.floor((Math.min(...ys) - 3) / 10) * 10);
  const sx = (t: number) => 60 + ((t - x0) / Math.max(1, x1 - x0)) * (B - 140), sy = (a: number) => H - 40 - ((a - y0) / Math.max(1, 100 - y0)) * (H - 60);
  return (
    <Kader kop="Oppositie" titel="Tegenstemmen en zelf iets binnenhalen" stand={stand}
      regel={`Kabinet-${kabinet} · naar rechts: vaker tegen gestemd · omhoog: meer eigen moties aangenomen`}>
      {geldig.length ? (
        <div style={{ display: "flex", position: "relative", width: B, height: H }}>
          <div style={{ display: "flex", position: "absolute", left: 60, top: H - 40, width: B - 140, height: 2, background: KLEUR.lijn }} />
          <div style={{ display: "flex", position: "absolute", left: 60, top: 0, width: 2, height: H - 40, background: KLEUR.lijn }} />
          <div style={{ display: "flex", position: "absolute", left: 60, top: H - 30, fontSize: 18, color: KLEUR.zacht }}>{`${x0}% tegen`}</div>
          <div style={{ display: "flex", position: "absolute", left: B - 200, top: H - 30, fontSize: 18, color: KLEUR.zacht }}>{`${x1}% tegen →`}</div>
          <div style={{ display: "flex", position: "absolute", left: 0, top: 0, fontSize: 18, color: KLEUR.zacht }}>100%</div>
          <div style={{ display: "flex", position: "absolute", left: 0, top: H - 52, fontSize: 18, color: KLEUR.zacht }}>{`${y0}%`}</div>
          {geldig.map((r) => {
            const x = sx(r.tegen_aandeel!), y = sy((100 * r.aangenomen) / r.ingediend), tint = r.rol === "kabinet" ? KLEUR.goud : KLEUR.koper;
            return (
              <div key={r.afkorting} style={{ display: "flex", position: "absolute", left: x - 9, top: y - 9, alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", width: 18, height: 18, borderRadius: 9, background: r.rol === "kabinet" ? tint : "transparent", border: `3px solid ${tint}` }} />
                <div style={{ display: "flex", fontSize: 16 }}>{r.afkorting}</div>
              </div>
            );
          })}
        </div>
      ) : <Melding tekst="De cijfers laden nu niet" />}
    </Kader>
  );
}

// Tegen het advies in: per kabinet het deel van de aangenomen moties dat het kabinet ontraadde
export async function ontradenPlaatje() {
  const stand = await laatstBijgewerkt();
  const t = ontradenTelling(MOTIES);
  const pct = (a: number, b: number) => (b ? (100 * a) / b : 0);
  return (
    <Kader kop="Uitgelicht" titel="Moties die het kabinet ontraadde" stand={stand}
      regel={`Sinds april 2019 nam de Kamer ${t.tochAangenomen.length.toLocaleString("nl-NL")} ontraden moties toch aan: ${rond(pct(t.tochAangenomen.length, t.aangenomen))} van alle aangenomen moties`}>
      <Balken labelBreed={220} tekstBreed={200} max={Math.max(...t.perKabinet.map((k) => pct(k.ontraden, k.aangenomen))) * 1.15}
        rijen={t.perKabinet.map((k) => ({ label: k.kabinet, waarde: pct(k.ontraden, k.aangenomen), tekst: `${rond(pct(k.ontraden, k.aangenomen))} ontraden`, tint: "#E57F93" }))} />
    </Kader>
  );
}

// Hoe lang duurt een wet: de drie reizen van de pagina, en de helft van alle wetten
export async function wettenPlaatje() {
  const stand = await laatstBijgewerkt();
  const t = wettenTelling(WETSVOORSTELLEN, 2010, 2022);
  const reizen = [
    { titel: "Verkiezingen tijdens covid-19", reis: zonderVoorafAdvies(snel as Reis) },
    { titel: "Kindgebonden budget", reis: zonderVoorafAdvies(gewoon as Reis) },
    { titel: "Terugkeer vreemdelingen", reis: zonderVoorafAdvies(lang as Reis) },
  ].map((r) => ({ ...r, dagen: duurVan(r.reis) }));
  const max = Math.max(...reizen.map((r) => r.dagen), t.mediaan);
  return (
    <Kader kop="Uitgelicht" titel="Hoe lang duurt een wet?" stand={stand}
      regel={`Van indiening tot besluit · van de wetten uit 2010 tot en met 2022 met een besluit kreeg de helft dat binnen ${duurTekst(t.mediaan)}`}>
      <Balken labelBreed={400} tekstBreed={170} max={max}
        rijen={[...reizen.map((r) => ({ label: r.titel, waarde: r.dagen, tekst: duurTekst(r.dagen), tint: KLEUR.koper })),
          { label: "De helft van alle wetten", waarde: t.mediaan, tekst: duurTekst(t.mediaan), tint: KLEUR.zacht, nadruk: true }]} />
    </Kader>
  );
}

// Stemgenoten: de uitslag van wie deelde, uit de link (percentages per partij, gecontroleerd in lib/deelSchoon.ts). De
// antwoorden zelf staan niet in de link.
export async function stemgenotenPlaatje(zoek: Zoek) {
  const stand = await laatstBijgewerkt();
  const rijen = (zoek.u ?? "").split(",").filter(Boolean).map((p) => { const [a, n] = p.split(":"); return { a, n: Number(n) }; })
    .sort((x, y) => y.n - x.n).slice(0, 10);
  const telling = zoek.b && zoek.n ? `op ${zoek.b} van ${zoek.n} echte stemmingen` : "op echte stemmingen";
  return (
    <Kader kop="Stemgenoten" titel={rijen.length ? "Mijn stemgenoten in de Tweede Kamer" : "Met welke partij stem jij het vaakst mee?"} stand={stand}
      regel={rijen.length ? `Zo vaak stemde elke partij net als ik, ${telling}` : "Kies je kant bij echte stemmingen en zie welke partijen net zo stemden"}>
      {rijen.length ? <Balken labelBreed={300} rijen={rijen.map((r) => ({ label: r.a, waarde: r.n, tekst: `${r.n}%`, nadruk: r.n === rijen[0].n }))} />
        : <Melding tekst="Doe zelf mee op zetelen.nl/stemgenoten" />}
    </Kader>
  );
}
