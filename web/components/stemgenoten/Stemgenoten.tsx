"use client";
// Stemgenoten (besluit Niels, 26 oktober 2026; onderzoek in docs/plan/stemwijzer-onderzoek.md). Echte stemmingen
// over wetten en amendementen, een voor een; daarna per fractie hoe vaak die net zo stemde. Alles rekent in de
// browser: antwoorden gaan nergens heen en worden niet opgeslagen (politieke opvattingen zijn bijzondere
// persoonsgegevens). Zelfde telling als de cohesie: alleen stellingen waarop jij en de fractie allebei een kant kozen.
import Link from "next/link";
import { useRef, useState } from "react";
import s from "./stemgenoten.module.css";

export type Stelling = {
  besluit: string; zaak: string; stelling: string; uitleg: string; terrein: string; soort: string; datum: string;
  uitslag: string; voor: number; tegen: number; stemmen: Record<string, string>;
};
type Antwoord = "Voor" | "Tegen" | "geen";
const MINIMUM = 5; // onder dit aantal gemeenschappelijke stellingen geen percentage

const ZOEK = (zaak: string) => `https://www.tweedekamer.nl/zoeken?qry=${encodeURIComponent(zaak)}`;
const datum = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export function uitslagen(stellingen: Stelling[], antwoorden: Record<string, Antwoord>, fracties: string[]) {
  return fracties.map((f) => {
    let samen = 0, gelijk = 0;
    for (const st of stellingen) {
      const a = antwoorden[st.besluit], v = st.stemmen[f];
      if ((a === "Voor" || a === "Tegen") && (v === "Voor" || v === "Tegen")) { samen++; if (a === v) gelijk++; }
    }
    return { fractie: f, samen, gelijk, aandeel: samen >= MINIMUM ? (100 * gelijk) / samen : null };
  }).sort((a, b) => (b.aandeel ?? -1) - (a.aandeel ?? -1) || b.samen - a.samen || a.fractie.localeCompare(b.fractie));
}

export function Stemgenoten({ stellingen, fracties }: { stellingen: Stelling[]; fracties: Record<string, number> }) {
  const [stap, setStap] = useState(-1); // -1: uitleg, 0..n-1: stellingen, n: uitslag
  const [antwoorden, setAntwoorden] = useState<Record<string, Antwoord>>({});
  const n = stellingen.length;
  const kader = useRef<HTMLDivElement>(null);
  // Na een keuze naar het begin van de kaart, niet naar de bovenkant van de pagina
  const naarKaart = () => requestAnimationFrame(() => kader.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
  const kies = (a: Antwoord | null) => {
    const st = stellingen[stap];
    setAntwoorden((x) => { const y = { ...x }; if (a) y[st.besluit] = a; else delete y[st.besluit]; return y; });
    setStap(stap + 1);
    naarKaart();
  };

  const zetels = (f: string) => `${fracties[f]} ${fracties[f] === 1 ? "zetel" : "zetels"}`;
  if (stap < 0) {
    return (
      <div className={s.kaart} ref={kader}>
        <p className={s.tekst}>
          Je krijgt {n} echte stemmingen uit de Tweede Kamer: wetten en amendementen (wijzigingen in een wet) uit deze
          Kamerperiode. Kies bij elke stelling eens, oneens of geen mening. Daarna zie je per fractie hoe vaak die net zo stemde als
          jij, en bij elke stemming hoe het afliep.
        </p>
        <p className={s.klein}>
          Je antwoorden blijven op je eigen apparaat: er wordt niets verstuurd of opgeslagen. Dit is geen stemadvies; het laat alleen
          zien wie er in de Kamer stemde zoals jij.
        </p>
        <button type="button" className={s.hoofdknop} onClick={() => setStap(0)}>Begin</button>
      </div>
    );
  }

  if (stap < n) {
    const st = stellingen[stap];
    const huidig = antwoorden[st.besluit];
    return (
      <div className={s.kaart} ref={kader} style={{ scrollMarginTop: 90 }}>
        <div className={s.voortgang} aria-label={`Stelling ${stap + 1} van ${n}`}>
          <span style={{ width: `${(100 * stap) / n}%` }} />
        </div>
        <p className={s.label}>{stap + 1} van {n} · {st.terrein}</p>
        <h2 className={s.stelling}>{st.stelling}</h2>
        <p className={s.tekst}>{st.uitleg}</p>
        <div className={s.knoppen}>
          <button type="button" className={s.eens} aria-pressed={huidig === "Voor"} onClick={() => kies("Voor")}>Eens</button>
          <button type="button" className={s.oneens} aria-pressed={huidig === "Tegen"} onClick={() => kies("Tegen")}>Oneens</button>
          <button type="button" className={s.neutraal} aria-pressed={huidig === "geen"} onClick={() => kies("geen")}>Geen mening</button>
        </div>
        <div className={s.onder}>
          {stap > 0 && <button type="button" className={s.link} onClick={() => { setStap(stap - 1); naarKaart(); }}>← Vorige</button>}
          <button type="button" className={s.link} onClick={() => kies(null)}>Sla over</button>
        </div>
      </div>
    );
  }

  const lijst = uitslagen(stellingen, antwoorden, Object.keys(fracties));
  const beantwoord = stellingen.filter((st) => antwoorden[st.besluit] === "Voor" || antwoorden[st.besluit] === "Tegen").length;
  const met = lijst.filter((u) => u.aandeel != null), zonder = lijst.filter((u) => u.aandeel == null);
  return (
    <div className={s.uitslag}>
      <div className={s.kaart} ref={kader} style={{ scrollMarginTop: 90 }}>
        <p className={s.label}>Jouw stemgenoten</p>
        <p className={s.tekst}>
          Je koos bij {beantwoord} van de {n} stellingen een kant. Zo vaak stemde elke fractie net als jij, op de stellingen waarop
          jullie allebei een kant kozen.
        </p>
        {beantwoord < MINIMUM ? (
          <p className={s.tekst}>Kies bij minstens {MINIMUM} stellingen een kant om een uitslag te zien.</p>
        ) : (
          <ol className={s.fracties}>
            {met.map((u) => (
              <li key={u.fractie}>
                <span className={s.naam}>{u.fractie} <span className={s.zetels}>{zetels(u.fractie)}</span></span>
                <span className={s.balk} aria-hidden="true"><span style={{ width: `${u.aandeel}%` }} /></span>
                <span className={s.getal}>{Math.round(u.aandeel!)}% <span className={s.zetels}>({u.gelijk} van {u.samen})</span></span>
              </li>
            ))}
          </ol>
        )}
        {zonder.length > 0 && beantwoord >= MINIMUM && (
          <p className={s.klein}>Te weinig gemeenschappelijke stellingen voor een percentage: {zonder.map((u) => u.fractie).join(", ")}.</p>
        )}
        <div className={s.onder}>
          <button type="button" className={s.link} onClick={() => setStap(n - 1)}>← Terug naar de laatste stelling</button>
          <button type="button" className={s.link} onClick={() => { setAntwoorden({}); setStap(-1); }}>Opnieuw beginnen</button>
        </div>
      </div>

      <h2 className={s.kop}>Hoe stemde de Kamer?</h2>
      <ol className={s.overzicht}>
        {stellingen.map((st) => {
          const a = antwoorden[st.besluit];
          const kant = (k: string) => Object.entries(st.stemmen).filter(([, v]) => v === k).map(([f]) => f).sort((x, y) => (fracties[y] ?? 0) - (fracties[x] ?? 0));
          return (
            <li key={st.besluit} className={s.regel}>
              <p className={s.label}>{st.terrein} · {datum(st.datum)} · {st.soort === "Amendement" ? "amendement" : "wet"}</p>
              <p className={s.regelStelling}>{st.stelling}</p>
              <p className={s.klein}>
                Jij: <strong>{a === "Voor" ? "eens" : a === "Tegen" ? "oneens" : a === "geen" ? "geen mening" : "overgeslagen"}</strong>.
                {" "}De Kamer: {st.uitslag}, {st.voor} tegen {st.tegen} zetels.
              </p>
              <p className={s.klein}><span className={s.voor}>Voor:</span> {kant("Voor").join(", ")}</p>
              <p className={s.klein}><span className={s.tegen}>Tegen:</span> {kant("Tegen").join(", ")}</p>
              <p className={s.klein}><a href={ZOEK(st.zaak)}>Bekijk op tweedekamer.nl ({st.zaak})</a></p>
            </li>
          );
        })}
      </ol>
      <p className={s.klein}>Hoe de stemmingen zijn gekozen: <Link href="#methode">zie onderaan</Link>.</p>
    </div>
  );
}
