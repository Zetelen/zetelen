"use client";
// Coalitiebouwer (componenten coalitie-analyse en coalitie-pagina, E2-S8 en E2-S9), opzet goedgekeurd door Niels
// op 25 oktober 2026. Zelfde bediening als de verkenner: links een bullet chart op zetels waarin je fracties aan
// en uit zet, rechts de zaal met de groep in koper en de andere fracties naar hoe vaak ze meestemden. Daaronder
// de partners (eerst beslissend, dan meegestemd) en per partner de stemmingen waarop die beslissend was.
// De keuze van fracties staat in de URL; de browser rekent op de stemmatrix van de periode.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { FractieInPeriode } from "@/lib/cohesie";
import { getal, procent } from "@/lib/cohesie";
import { DREMPEL, type Partner, type Stemmatrix, bereken, zetelTabel } from "@/lib/coalitie";
import { schaalkleur } from "@/lib/kleur";
import { MIDDEN, punt, sector, vakken, zetels as zetelsVan } from "@/lib/zaal";
import { Schaal } from "@/components/Onderdelen";
import { Data, Label, Tekst } from "@/components/Typografie";
import s from "@/components/cohesie/verkenner.module.css";
import c from "./coalitie.module.css";

const MEERDERHEID = 76;

type Stemming = { besluit: string; datum: string; onderwerp: string | null; uitslag: string | null; zaak_nummer: string | null; zaak_soort: string | null };

export function CoalitieBouwer({ fracties, soort, periode, alleenVerdeeld }: {
  fracties: FractieInPeriode[]; soort: string; periode: string; alleenVerdeeld: boolean;
}) {
  const router = useRouter();
  const pad = usePathname();
  const zoek = useSearchParams();
  const zaal = fracties.filter((f) => f.inZaal);
  const groep = (zoek.get("groep") ?? "").split(",").map((a) => zaal.find((f) => f.afkorting === a)?.id).filter((x): x is string => !!x);
  const [matrix, setMatrix] = useState<Stemmatrix | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    let weg = false;
    setMatrix(null);
    setFout(null);
    fetch(`/api/stemmatrix?${new URLSearchParams({ soort, periode })}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((m: Stemmatrix) => !weg && setMatrix(m))
      .catch(() => !weg && setFout("De stemmingen laden nu niet. Probeer het over een paar minuten nog eens."));
    return () => { weg = true; };
  }, [soort, periode]);

  const tabel = useMemo(() => (matrix ? zetelTabel(matrix) : null), [matrix]);
  const sleutel = groep.join(",");
  const uitkomst = useMemo(
    () => (matrix && tabel && groep.length ? bereken(matrix, groep, tabel, alleenVerdeeld) : null),
    [matrix, tabel, sleutel, alleenVerdeeld], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const genoeg = !!uitkomst && uitkomst.eensgezind >= DREMPEL;
  const perPartner = new Map(uitkomst?.partners.map((p) => [p.id, p]) ?? []);
  const zetelsGroep = zaal.filter((f) => groep.includes(f.id)).reduce((t, f) => t + f.zetels, 0);
  const tekort = MEERDERHEID - zetelsGroep;
  const partner = partnerId ? perPartner.get(partnerId) ?? null : null;

  function wissel(afkorting: string) {
    const huidig = groep.map((id) => zaal.find((f) => f.id === id)!.afkorting);
    const nieuw = huidig.includes(afkorting) ? huidig.filter((a) => a !== afkorting) : [...huidig, afkorting];
    const q = new URLSearchParams(zoek.toString());
    if (nieuw.length) q.set("groep", nieuw.join(","));
    else q.delete("groep");
    setPartnerId(null);
    router.replace(`${pad}?${q.toString()}`, { scroll: false });
  }

  const kleurVan = (id: string) => {
    if (groep.includes(id)) return "var(--koper)";
    const p = perPartner.get(id);
    return p && genoeg ? schaalkleur(p.aandeel) : null;
  };

  return (
    <div className={s.verkenner}>
      <p className="verborgen" aria-live="polite">
        {groep.length ? `Gekozen groep: ${zetelsGroep} zetels.` : "Nog geen fracties gekozen."}
        {uitkomst ? ` De groep stemde ${uitkomst.eensgezind} keer eensgezind en had ${uitkomst.meerderheid} keer een meerderheid.` : ""}
      </p>
      <div className={s.werkvlak}>
        <GroepPaneel zaal={zaal} groep={groep} wissel={wissel} hover={hover} setHover={setHover} perPartner={perPartner} genoeg={genoeg} />
        <div className={s.figuur}>
          <Zaal zaal={zaal} groep={groep} wissel={wissel} hover={hover} setHover={setHover} kleurVan={kleurVan}
            zetelsGroep={zetelsGroep} tekort={tekort} />
          {groep.length > 0 && genoeg && <Schaal />}
        </div>
      </div>

      {fout && <Tekst>{fout}</Tekst>}
      {!fout && groep.length > 0 && !uitkomst && <Data>Stemmingen laden…</Data>}
      {uitkomst && (
        <section className={c.uitkomst}>
          <Label>Bij wie haalde deze groep een meerderheid? · {periode} · {alleenVerdeeld ? "verdeelde stemmingen" : "alle stemmingen"}</Label>
          {!genoeg ? (
            <Tekst>
              Deze groep stemde in deze periode maar {uitkomst.eensgezind} keer eensgezind. Dat zijn te weinig stemmingen om iets te
              zeggen: de grens ligt op {DREMPEL}.
            </Tekst>
          ) : (
            <>
              <Tekst>
                De groep stemde {getal(uitkomst.eensgezind)} keer eensgezind. Daarvan won haar kant{" "}
                {getal(uitkomst.meerderheid)} keer ({procent((100 * uitkomst.meerderheid) / uitkomst.eensgezind)}). Op eigen kracht lukte dat{" "}
                {getal(uitkomst.zonderHulp)} keer.
              </Tekst>
              <ol className={c.partners} aria-label="Partners, eerst op beslissend en dan op meegestemd">
                {uitkomst.partners.map((p) => (
                  <li key={p.id}>
                    <button type="button" className={c.partnerRij} aria-pressed={p.id === partnerId} data-aan={hover === p.id}
                      onClick={() => setPartnerId(p.id === partnerId ? null : p.id)}
                      onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(p.id)} onBlur={() => setHover(null)}>
                      <span className={c.naam}>{p.afkorting}</span>
                      <span className={c.getal}><strong>{getal(p.beslissend)}</strong> keer beslissend</span>
                      <span className={s.paneelBaan} aria-hidden="true"><span style={{ width: `${p.aandeel}%`, background: schaalkleur(p.aandeel) }} /></span>
                      <span className={c.getal}>meegestemd {procent(p.aandeel)}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <Data>
                Meegestemd: hoe vaak de fractie dezelfde kant koos als de groep. Beslissend: de groep had een meerderheid, en zonder
                deze fractie niet meer. De zetels tellen zoals ze waren op het moment van de stemming. Kies een partner en zie op welke
                stemmingen die beslissend was.
              </Data>
              {partner && <Beslissend partner={partner} besluiten={matrix?.besluiten ?? []} />}
              {partner && groep.length > 0 && (
                <div className={s.verder}>
                  {(() => {
                    // De grootste fractie van de groep tegenover de partner, per onderwerp
                    const grootste = zaal.filter((f) => groep.includes(f.id)).sort((a, b) => b.zetels - a.zetels)[0];
                    const q = new URLSearchParams({ soort, periode, variant: alleenVerdeeld ? "verdeeld" : "alle", fractie: grootste.afkorting, met: partner.afkorting });
                    return <a href={`/onderwerpen?${q.toString()}`}>{grootste.afkorting} en {partner.afkorting} per onderwerp →</a>;
                  })()}
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

// Bedienpaneel: fracties op zetels; een klik zet een fractie in de groep of haalt haar eruit.
// Bij een fractie buiten de groep: hoe vaak die meestemde, als balk in de kleur van de schaal.
function GroepPaneel({ zaal, groep, wissel, hover, setHover, perPartner, genoeg }: {
  zaal: FractieInPeriode[]; groep: string[]; wissel: (a: string) => void; hover: string | null; setHover: (id: string | null) => void;
  perPartner: Map<string, Partner>; genoeg: boolean;
}) {
  const rijen = [...zaal].sort((a, b) => b.zetels - a.zetels || a.afkorting.localeCompare(b.afkorting));
  return (
    <div className={s.paneel} role="group" aria-label="Stel een groep fracties samen">
      <div className={s.paneelKop} aria-hidden="true">
        <span>Zetels</span>
        <span>Fractie</span>
        <span>{groep.length ? "Meegestemd" : "Kies fracties"}</span>
      </div>
      {rijen.map((f) => {
        const inGroep = groep.includes(f.id);
        const p = perPartner.get(f.id);
        return (
          <button key={f.id} type="button" className={s.paneelRij} aria-pressed={inGroep} data-aan={hover === f.id}
            aria-label={`${f.naam}, ${f.zetels} zetels, ${inGroep ? "in de groep" : "niet in de groep"}`}
            onClick={() => wissel(f.afkorting)} onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(f.id)} onBlur={() => setHover(null)}>
            <span className={s.paneelZetels}>{f.zetels}</span>
            <span className={s.paneelNaam}>{f.afkorting}</span>
            {inGroep ? (
              <span className={s.paneelGekozen}>in de groep</span>
            ) : p && genoeg ? (
              <>
                <span className={s.paneelBaan} aria-hidden="true"><span style={{ width: `${p.aandeel}%`, background: schaalkleur(p.aandeel) }} /></span>
                <span className={s.paneelWaarde}>{procent(p.aandeel)}</span>
              </>
            ) : (
              <span className={s.paneelGekozen} style={{ color: "var(--tekst-zacht)" }}>+ toevoegen</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Zaal({ zaal, groep, wissel, hover, setHover, kleurVan, zetelsGroep, tekort }: {
  zaal: FractieInPeriode[]; groep: string[]; wissel: (a: string) => void; hover: string | null; setHover: (id: string | null) => void;
  kleurVan: (id: string) => string | null; zetelsGroep: number; tekort: number;
}) {
  const zetelLijst = useMemo(() => zetelsVan(zaal.map((f) => ({ id: f.id, zetels: f.zetels }))), [zaal]);
  const vakLijst = useMemo(() => vakken(zetelLijst, zaal.map((f) => f.id)), [zetelLijst, zaal]);
  const perId = new Map(zaal.map((f) => [f.id, f]));
  return (
    <svg viewBox="80 -10 840 640" className={s.zaal} role="img" aria-label={`Zaal; gekozen groep: ${zetelsGroep} zetels`}>
      {vakLijst.map((v) => {
        const f = perId.get(v.fractie)!;
        return (
          <g key={f.id} className={s.vakGroep} onClick={() => wissel(f.afkorting)} onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(null)}>
            <path d={sector(132, 443, v.van, v.tot)} className={s.vak} data-gekozen={groep.includes(f.id)} data-aan={hover === f.id} />
          </g>
        );
      })}
      {zetelLijst.map((z, i) => {
        const k = z.fractie ? kleurVan(z.fractie) : null;
        return (
          <circle key={i} cx={z.x.toFixed(1)} cy={z.y.toFixed(1)} r={10.5} className={z.fractie == null ? s.leeg : s.zetel} style={{ fill: k ?? undefined }}
            onMouseEnter={() => z.fractie && setHover(z.fractie)} onMouseLeave={() => setHover(null)}
            onClick={() => { const f = z.fractie ? perId.get(z.fractie) : undefined; if (f) wissel(f.afkorting); }} />
        );
      })}
      <g aria-hidden="true" pointerEvents="none">
        {vakLijst.map((v) => {
          const f = perId.get(v.fractie)!;
          const naam = f.afkorting.replace(/^Groep /, "Gr. ");
          if (((v.van - v.tot) * Math.PI / 180) * 330 < naam.length * 9) return null;
          const l = punt(330, v.midden);
          return (
            <text key={f.id} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" className={s.labelBinnen}
              data-gekozen={groep.includes(f.id)} data-aan={hover === f.id}>{naam}</text>
          );
        })}
      </g>
      <g className={s.uitlees} aria-hidden="true">
        <text x={MIDDEN.x} y={MIDDEN.y - 78} className={s.uitleesKlein}>{groep.length ? "Gekozen groep" : "Kies fracties"}</text>
        <text x={MIDDEN.x} y={MIDDEN.y - 26} className={s.uitleesGroot}>{groep.length ? `${zetelsGroep} zetels` : "0"}</text>
        <text x={MIDDEN.x} y={MIDDEN.y + 4} className={s.uitleesKlein}>
          {groep.length ? (tekort > 0 ? `${tekort} tekort voor een meerderheid` : tekort === 0 ? "precies een meerderheid" : `meerderheid, ${-tekort} over`) : "in de lijst of de zaal"}
        </text>
      </g>
    </svg>
  );
}

// De stemmingen waarop een partner beslissend was, nieuwste eerst (hooguit 40)
function Beslissend({ partner, besluiten }: { partner: Partner; besluiten: string[] }) {
  const ids = useMemo(() => partner.beslissendIn.map((b) => besluiten[b]).filter(Boolean).reverse().slice(0, 40), [partner, besluiten]);
  const [rijen, setRijen] = useState<Stemming[] | null>(null);
  const [fout, setFout] = useState(false);
  useEffect(() => {
    let weg = false;
    setRijen(null);
    setFout(false);
    if (!ids.length) { setRijen([]); return; }
    fetch(`/api/stemmingen?ids=${ids.join(",")}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: Stemming[]) => !weg && setRijen(d))
      .catch(() => !weg && setFout(true));
    return () => { weg = true; };
  }, [ids]);
  return (
    <section className={c.beslissend} aria-label={`Stemmingen waarop ${partner.afkorting} beslissend was`}>
      <Label>{partner.afkorting} was {getal(partner.beslissend)} keer beslissend{partner.beslissend > 40 ? " · de 40 nieuwste" : ""}</Label>
      {!besluiten.length ? <Tekst>Deze stemmingen staan hier nog niet. Ze komen mee met de volgende verversing.</Tekst>
        : fout ? <Tekst>De stemmingen laden nu niet. Probeer het later nog eens.</Tekst> : !rijen ? <Data>Stemmingen laden…</Data> : !rijen.length ? (
        <Tekst>{partner.afkorting} was op geen enkele stemming beslissend.</Tekst>
      ) : (
        <ol>
          {rijen.map((r) => (
            <li key={r.besluit}>
              <Data>
                {new Date(r.datum).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                {r.zaak_soort ? ` · ${r.zaak_soort}` : ""}{r.uitslag ? ` · ${r.uitslag}` : ""}
              </Data>
              <span>{r.onderwerp ?? "Zonder titel"}</span>
              {r.zaak_nummer && (
                <a href={`https://www.tweedekamer.nl/zoeken?qry=${encodeURIComponent(r.zaak_nummer)}`} target="_blank" rel="noopener noreferrer">
                  Zoek {r.zaak_nummer} op tweedekamer.nl ↗
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
