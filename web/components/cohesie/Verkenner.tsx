"use client";
// Cohesie-verkenner (component cohesie-pagina, E2-S3 tot en met E2-S5): zaal, boog en matrix
// van dezelfde cijfers. De keuze van fractie en weergave staat in de URL, net als periode en variant.
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FractieInPeriode } from "@/lib/cohesie";
import { getal, procent } from "@/lib/cohesie";
import { schaalkleur, tekstOp } from "@/lib/kleur";
import { MIDDEN, type Paar, punt, sector, sleutel, vakken, zetels as zetelsVan } from "@/lib/zaal";
import { Schaal } from "@/components/Onderdelen";
import { Data } from "@/components/Typografie";
import s from "./verkenner.module.css";

type Weergave = "zaal" | "boog" | "tabel";
const WEERGAVEN: Array<{ waarde: Weergave; tekst: string }> = [
  { waarde: "zaal", tekst: "Zaal" },
  { waarde: "boog", tekst: "Boog" },
  { waarde: "tabel", tekst: "Tabel" },
];

export type VerkennerProps = {
  fracties: FractieInPeriode[]; // in volgorde: eerst de zaal, dan wie halverwege stopte
  paren: Array<[string, Paar]>;
  periodeNaam: string;
};

export function Verkenner({ fracties, paren, periodeNaam }: VerkennerProps) {
  const router = useRouter();
  const pad = usePathname();
  const zoek = useSearchParams();
  const kaart = useMemo(() => new Map(paren), [paren]);
  const perAfkorting = useMemo(() => new Map(fracties.map((f) => [f.afkorting, f])), [fracties]);
  const inZaal = fracties.filter((f) => f.inZaal);
  const standaard = [...inZaal].sort((a, b) => b.zetels - a.zetels)[0] ?? fracties[0];
  const gekozen = perAfkorting.get(zoek.get("fractie") ?? "") ?? standaard;
  const weergave = (WEERGAVEN.find((w) => w.waarde === zoek.get("weergave"))?.waarde ?? "zaal") as Weergave;
  const [hover, setHover] = useState<string | null>(null);

  function zet(param: string, waarde: string) {
    const nieuw = new URLSearchParams(zoek.toString());
    nieuw.set(param, waarde);
    router.replace(`${pad}?${nieuw.toString()}`, { scroll: false });
  }

  const paar = (a: string, b: string) => kaart.get(sleutel(a, b));
  const uitlees = hover && hover !== gekozen.id ? fracties.find((f) => f.id === hover) : undefined;
  const uitleesPaar = uitlees ? paar(gekozen.id, uitlees.id) : undefined;

  return (
    <div className={s.verkenner}>
      <div className={s.balk}>
        <div className={s.segment} role="group" aria-label="Weergave">
          {WEERGAVEN.map((w) => (
            <button key={w.waarde} type="button" aria-pressed={w.waarde === weergave} onClick={() => zet("weergave", w.waarde)}>
              {w.tekst}
            </button>
          ))}
        </div>
      </div>

      {/* Voor schermlezers: wat er gekozen is en wat de muis aanwijst */}
      <p className="verborgen" aria-live="polite">
        Gekozen fractie: {gekozen.naam}.
        {uitlees && uitleesPaar ? ` Stemde hetzelfde als ${uitlees.naam}: ${uitleesPaar.teWeinig ? "te weinig stemmingen" : procent(uitleesPaar.cohesie, 1)}.` : ""}
      </p>

      {weergave === "tabel" ? (
        <Matrix fracties={fracties} gekozen={gekozen} kies={(f) => zet("fractie", f)} paar={paar} />
      ) : (
        <div className={s.werkvlak}>
          <Paneel fracties={inZaal} gekozen={gekozen} hover={hover} setHover={setHover} kies={(f) => zet("fractie", f)} paar={paar} />
          <div className={s.figuur}>
            {weergave === "zaal" ? (
              <Zaal fracties={inZaal} gekozen={gekozen} hover={hover} setHover={setHover} kies={(f) => zet("fractie", f)} paar={paar}
                uitlees={uitlees} uitleesPaar={uitleesPaar} />
            ) : (
              <Boog fracties={inZaal} gekozen={gekozen} hover={hover} setHover={setHover} kies={(f) => zet("fractie", f)} paar={paar}
                uitlees={uitlees} uitleesPaar={uitleesPaar} />
            )}
            <Schaal />
            <Verder gekozen={gekozen.afkorting} zoek={zoek} />
            {fracties.some((f) => !f.inZaal) && (
              <Data>
                Niet in de zaal, wel in deze periode: {fracties.filter((f) => !f.inZaal).map((f) => f.afkorting).join(", ")}. Deze
                fracties stopten halverwege {periodeNaam}, of kwamen er pas na verkiezingen bij: bij een kabinet dat demissionair
                doorloopt, is de zaal die van voor de verkiezingen. In de tabel staan ze wel.
              </Data>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Verder op de site (samentrekken, 25 oktober 2026): de gekozen fractie per onderwerp en in de coalitiebouwer
function Verder({ gekozen, zoek }: { gekozen: string; zoek: URLSearchParams }) {
  const basis = new URLSearchParams(zoek.toString());
  basis.delete("weergave");
  basis.set("fractie", gekozen);
  const coalitie = new URLSearchParams({ soort: basis.get("soort") ?? "kabinet", ...(basis.get("periode") ? { periode: basis.get("periode")! } : {}), groep: gekozen });
  return (
    <div className={s.verder}>
      <Link href={`/onderwerpen?${basis.toString()}`}>{gekozen} per onderwerp →</Link>
      <Link href={`/coalitie?${coalitie.toString()}`}>Bij wie haalt {gekozen} een meerderheid? →</Link>
    </div>
  );
}

type WeergaveProps = {
  fracties: FractieInPeriode[];
  gekozen: FractieInPeriode;
  hover: string | null;
  setHover: (id: string | null) => void;
  kies: (afkorting: string) => void;
  paar: (a: string, b: string) => Paar | undefined;
  uitlees?: FractieInPeriode;
  uitleesPaar?: Paar;
};

function kleurVan(p: Paar | undefined): string | null {
  if (!p || p.teWeinig || p.cohesie == null) return null;
  return schaalkleur(p.cohesie);
}

function Uitlees({ gekozen, uitlees, uitleesPaar, y }: { gekozen: FractieInPeriode; uitlees?: FractieInPeriode; uitleesPaar?: Paar; y: number }) {
  return (
    <g className={s.uitlees} aria-hidden="true">
      {uitlees && uitleesPaar ? (
        <>
          <text x={MIDDEN.x} y={y - 78} className={s.uitleesKlein}>{`${gekozen.afkorting} en ${uitlees.afkorting}`}</text>
          <text x={MIDDEN.x} y={y - 26} className={s.uitleesGroot}>
            {uitleesPaar.teWeinig ? "te weinig data" : procent(uitleesPaar.cohesie, 1)}
          </text>
          <text x={MIDDEN.x} y={y + 4} className={s.uitleesKlein}>{`${getal(uitleesPaar.gezamenlijk)} gezamenlijke stemmingen`}</text>
        </>
      ) : (
        <>
          <text x={MIDDEN.x} y={y - 78} className={s.uitleesKlein}>Gekozen</text>
          <text x={MIDDEN.x} y={y - 26} className={s.uitleesGroot}>{gekozen.afkorting}</text>
          <text x={MIDDEN.x} y={y + 4} className={s.uitleesKlein}>{`${gekozen.zetels} zetels · ${getal(gekozen.stemmingen)} stemmingen`}</text>
        </>
      )}
    </g>
  );
}

// Bedienpaneel (feedback Niels, 25 oktober 2026): een bullet chart naast de zaal, op volgorde van zetels
// zodat de rijen niet verspringen. De balk is de cohesie met de gekozen fractie. Klikken kiest een fractie,
// aanwijzen licht haar op in de zaal (en andersom).
function Paneel({ fracties, gekozen, hover, setHover, kies, paar }: Omit<WeergaveProps, "uitlees" | "uitleesPaar">) {
  const rijen = [...fracties].sort((a, b) => b.zetels - a.zetels || a.afkorting.localeCompare(b.afkorting));
  return (
    <div className={s.paneel} role="group" aria-label="Kies een fractie">
      <div className={s.paneelKop} aria-hidden="true">
        <span>Zetels</span>
        <span>Fractie</span>
        <span>Eens met {gekozen.afkorting}</span>
      </div>
      {rijen.map((f) => {
        const ik = f.id === gekozen.id;
        const p = ik ? undefined : paar(gekozen.id, f.id);
        const kleur = kleurVan(p);
        const waarde = ik ? "gekozen" : p ? (p.teWeinig ? "te weinig" : procent(p.cohesie)) : "geen";
        return (
          <button key={f.id} type="button" className={s.paneelRij} aria-pressed={ik} data-aan={hover === f.id}
            aria-label={`${f.naam}, ${f.zetels} zetels, stemde hetzelfde: ${waarde}`}
            onClick={() => kies(f.afkorting)} onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(f.id)} onBlur={() => setHover(null)}>
            <span className={s.paneelZetels}>{f.zetels}</span>
            <span className={s.paneelNaam}>{f.afkorting}</span>
            {ik ? (
              <span className={s.paneelGekozen}>gekozen</span>
            ) : (
              <>
                <span className={s.paneelBaan} aria-hidden="true">
                  {kleur ? <span style={{ width: `${p!.cohesie}%`, background: kleur }} /> : <span className={s.paneelTeWeinig} />}
                </span>
                <span className={s.paneelWaarde}>{p && !p.teWeinig ? procent(p.cohesie) : "–"}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Zaal: fracties als omlijnde vakken; de naam staat midden in de eigen zetels (alleen als hij past),
// de percentages staan in het paneel ernaast. De hele fractie licht op (feedback Niels)
function Zaal({ fracties, gekozen, hover, setHover, kies, paar, uitlees, uitleesPaar }: WeergaveProps) {
  const zetelLijst = useMemo(() => zetelsVan(fracties.map((f) => ({ id: f.id, zetels: f.zetels }))), [fracties]);
  const vakLijst = useMemo(() => vakken(zetelLijst, fracties.map((f) => f.id)), [zetelLijst, fracties]);
  const perId = new Map(fracties.map((f) => [f.id, f]));
  const gz = zetelLijst.filter((z) => z.fractie === gekozen.id);
  const zw = gz.length ? { x: gz.reduce((t, z) => t + z.x, 0) / gz.length, y: gz.reduce((t, z) => t + z.y, 0) / gz.length } : MIDDEN;

  return (
    // Hoogte tot onder de laagste zetels (hoefijzer van 220 graden): anders liep de zaal over de legenda heen
    <svg viewBox="80 -10 840 640" className={s.zaal} role="img" aria-label={`Zaal met ${fracties.length} fracties; gekozen: ${gekozen.naam}`}>
      {vakLijst.map((v) => {
        const f = perId.get(v.fractie)!;
        const ik = f.id === gekozen.id;
        const aan = f.id === hover;
        return (
          <g key={f.id} className={s.vakGroep} onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(null)}
            onClick={() => kies(f.afkorting)}>
            <path d={sector(132, 443, v.van, v.tot)} className={s.vak} data-gekozen={ik} data-aan={aan} />
          </g>
        );
      })}
      {zetelLijst.map((z, i) => {
        const ik = z.fractie === gekozen.id;
        const kleur = z.fractie == null ? null : ik ? "var(--koper)" : kleurVan(paar(gekozen.id, z.fractie));
        const vertraging = Math.round(Math.min(280, Math.hypot(z.x - zw.x, z.y - zw.y) / 3));
        return (
          <circle key={i} cx={z.x.toFixed(1)} cy={z.y.toFixed(1)} r={10.5}
            className={z.fractie == null ? s.leeg : kleur ? s.zetel : `${s.zetel} ${s.zetelTeWeinig}`}
            style={{ fill: kleur ?? undefined, transitionDelay: `${vertraging}ms` }}
            onMouseEnter={() => z.fractie && setHover(z.fractie)} onMouseLeave={() => setHover(null)}
            onClick={() => { const f = z.fractie ? perId.get(z.fractie) : undefined; if (f) kies(f.afkorting); }} />
        );
      })}
      {/* Namen boven de zetels, zodat ze leesbaar blijven; alleen als de naam in de breedte van het vak past */}
      <g aria-hidden="true" pointerEvents="none">
        {vakLijst.map((v) => {
          const f = perId.get(v.fractie)!;
          const naam = f.afkorting.replace(/^Groep /, "Gr. ");
          const breedte = ((v.van - v.tot) * Math.PI / 180) * 330;
          if (breedte < naam.length * 9) return null;
          const l = punt(330, v.midden);
          return (
            <text key={f.id} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" className={s.labelBinnen}
              data-gekozen={f.id === gekozen.id} data-aan={f.id === hover}>
              {naam}
            </text>
          );
        })}
      </g>
      <Uitlees gekozen={gekozen} uitlees={uitlees} uitleesPaar={uitleesPaar} y={MIDDEN.y} />
    </svg>
  );
}

// Boog: fracties als knopen op een halve cirkel (grootte naar zetels), lijnen vanuit de gekozen
// fractie met een dikte naar cohesie; gestreepte dunne lijn bij te weinig data
function Boog({ fracties, gekozen, hover, setHover, kies, paar, uitlees, uitleesPaar }: WeergaveProps) {
  const n = fracties.length;
  const knopen = fracties.map((f, i) => {
    const hoek = n === 1 ? 90 : 180 - (180 * i) / (n - 1);
    return { f, ...punt(380, hoek), hoek, r: 8 + Math.sqrt(f.zetels) * 3.2 };
  });
  const bron = knopen.find((k) => k.f.id === gekozen.id);
  return (
    <svg viewBox="-80 0 1160 520" className={s.zaal} role="img" aria-label={`Boog met ${n} fracties; gekozen: ${gekozen.naam}`}>
      {bron && knopen.filter((k) => k.f.id !== gekozen.id).map((k) => {
        const p = paar(gekozen.id, k.f.id);
        const weinig = !p || p.teWeinig || p.cohesie == null;
        return (
          <path key={k.f.id} d={`M${bron.x},${bron.y} Q${MIDDEN.x},${MIDDEN.y - 40} ${k.x},${k.y}`} className={s.boogLijn}
            style={{ stroke: weinig ? "var(--lijn-licht)" : schaalkleur(p!.cohesie!), strokeWidth: weinig ? 1 : 1 + (p!.cohesie! / 100) * 9,
              strokeDasharray: weinig ? "4 5" : undefined, opacity: hover && hover !== k.f.id ? 0.35 : 1 }} />
        );
      })}
      {knopen.map((k) => {
        const ik = k.f.id === gekozen.id;
        const kleur = ik ? "var(--koper)" : kleurVan(paar(gekozen.id, k.f.id)) ?? "var(--nacht-800)";
        const l = punt(380 + k.r + 22, k.hoek);
        return (
          <g key={k.f.id} className={s.vakGroep} onMouseEnter={() => setHover(k.f.id)} onMouseLeave={() => setHover(null)}
            onClick={() => kies(k.f.afkorting)}>
            <circle cx={k.x} cy={k.y} r={k.r} style={{ fill: kleur }} className={s.knoop} data-gekozen={ik} data-aan={hover === k.f.id} />
            <text x={l.x} y={l.y} textAnchor={l.x < MIDDEN.x - 30 ? "end" : l.x > MIDDEN.x + 30 ? "start" : "middle"}
              dominantBaseline="middle" className={`${s.label} ${s.boogLabel}`} data-gekozen={ik}>
              {k.f.afkorting.replace(/^Groep /, "Gr. ")}
            </text>
          </g>
        );
      })}
      <Uitlees gekozen={gekozen} uitlees={uitlees} uitleesPaar={uitleesPaar} y={MIDDEN.y + 20} />
    </svg>
  );
}

// Matrix: fractie tegen fractie met het getal in elke cel; kolomkop sorteert de rijen;
// de eerste kolom blijft staan bij horizontaal scrollen. Ook het toegankelijke alternatief.
function Matrix({ fracties, gekozen, kies, paar }: Omit<WeergaveProps, "hover" | "setHover" | "uitlees" | "uitleesPaar">) {
  const [sorteer, setSorteer] = useState<string | null>(null);
  const rijen = useMemo(() => {
    if (!sorteer) return fracties;
    const waarde = (f: FractieInPeriode) => (f.id === sorteer ? 101 : paar(sorteer, f.id)?.cohesie ?? -1);
    return [...fracties].sort((a, b) => waarde(b) - waarde(a));
  }, [fracties, sorteer, paar]);
  return (
    <div className={s.matrixKader}>
      <div role="table" aria-label="Hoe vaak elke twee fracties hetzelfde stemden, in procenten" className={s.matrix}
        style={{ gridTemplateColumns: `minmax(120px, max-content) repeat(${fracties.length}, minmax(52px, 1fr))` }}>
        <div role="row" className={s.matrixRij}>
          <div role="columnheader" className={`${s.kop} ${s.eerste}`}>Fractie</div>
          {fracties.map((f) => (
            <div role="columnheader" key={f.id} className={s.kop} aria-sort={sorteer === f.id ? "descending" : "none"}>
              <button type="button" onClick={() => setSorteer(sorteer === f.id ? null : f.id)} title={`Sorteer op ${f.naam}`}
                data-gekozen={f.id === gekozen.id}>
                {f.afkorting}
              </button>
            </div>
          ))}
        </div>
        {rijen.map((r) => (
          <div role="row" key={r.id} className={s.matrixRij}>
            <div role="rowheader" className={`${s.eerste} ${s.rijkop}`}>
              <button type="button" onClick={() => kies(r.afkorting)} aria-pressed={r.id === gekozen.id}>
                {r.afkorting}
              </button>
            </div>
            {fracties.map((k) => {
              if (k.id === r.id) return <div role="cell" key={k.id} className={`${s.cel} ${s.diagonaal}`} aria-label="zelfde fractie" />;
              const p = paar(r.id, k.id);
              const kleur = kleurVan(p);
              return (
                <div role="cell" key={k.id} className={kleur ? s.cel : `${s.cel} ${s.celTeWeinig}`}
                  style={kleur ? { background: kleur, color: tekstOp(kleur) } : undefined}
                  title={p ? `${r.afkorting} en ${k.afkorting}: ${p.teWeinig ? "te weinig stemmingen" : procent(p.cohesie, 1)}, ${getal(p.gezamenlijk)} stemmingen` : "geen gezamenlijke stemmingen"}>
                  {p && !p.teWeinig ? procent(p.cohesie) : <span className="verborgen">{p ? "te weinig stemmingen" : "geen"}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <Data>Kies een kolomkop en de rijen sorteren zich. Kies een fractie in de eerste kolom en ze licht op.</Data>
    </div>
  );
}
