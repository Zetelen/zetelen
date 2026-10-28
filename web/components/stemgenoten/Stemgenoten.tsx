"use client";
// Stemgenoten (besluit Niels, 26 oktober 2026; onderzoek in docs/plan/stemwijzer-onderzoek.md). Echte stemmingen
// over wetten en amendementen, een voor een; daarna per fractie hoe vaak die net zo stemde. Alles rekent in de
// browser: antwoorden gaan nergens heen en worden niet opgeslagen (politieke opvattingen zijn bijzondere
// persoonsgegevens). Zelfde telling als de cohesie: alleen stellingen waarop jij en de fractie allebei een kant kozen.
// Feedback Niels (27 oktober 2026): eerst je verwachting, een bronlink per stelling, de uitslag uitklapbaar met
// het label kabinet of oppositie, een deelplaatje dat in de browser wordt getekend, en een overzicht met de
// uitkomst als vast label en de zetels als balk.
import Link from "next/link";
import { useRef, useState } from "react";
import { deelPlaatje } from "./plaatje";
import s from "./stemgenoten.module.css";

export type Stelling = {
  besluit: string; zaak: string; stelling: string; uitleg: string; terrein: string; soort: string; datum: string;
  uitslag: string; voor: number; tegen: number; stemmen: Record<string, string>; kamerstuk: string | null;
};
export type Rollen = Record<string, "kabinet" | "oppositie">;
type Antwoord = "Voor" | "Tegen" | "geen";
const MINIMUM = 5; // onder dit aantal gemeenschappelijke stellingen geen percentage

// De pagina van het wetsvoorstel op tweedekamer.nl; bij een amendement de wet die het wilde wijzigen, bij een
// begroting met de toevoeging (36800-XVI; zonder toevoeging geeft de Kamer een fout). De zoekpagina
// van de Kamer gaf time-outs, deze pagina niet.
export const WETSVOORSTEL = (kamerstuk: string) =>
  `https://www.tweedekamer.nl/kamerstukken/wetsvoorstellen/detail?cfg=wetsvoorsteldetails&qry=wetsvoorstel%3A${encodeURIComponent(kamerstuk)}`;
const datum = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export type Uitslag = { fractie: string; samen: number; gelijk: number; aandeel: number | null };

export function uitslagen(stellingen: Stelling[], antwoorden: Record<string, Antwoord>, fracties: string[]): Uitslag[] {
  return fracties.map((f) => {
    let samen = 0, gelijk = 0;
    for (const st of stellingen) {
      const a = antwoorden[st.besluit], v = st.stemmen[f];
      if ((a === "Voor" || a === "Tegen") && (v === "Voor" || v === "Tegen")) { samen++; if (a === v) gelijk++; }
    }
    return { fractie: f, samen, gelijk, aandeel: samen >= MINIMUM ? (100 * gelijk) / samen : null };
  }).sort((a, b) => (b.aandeel ?? -1) - (a.aandeel ?? -1) || b.samen - a.samen || a.fractie.localeCompare(b.fractie));
}

// De stellingen waarop een fractie een andere kant koos dan jij (voor het uitklappen per fractie)
export function verschillen(stellingen: Stelling[], antwoorden: Record<string, Antwoord>, fractie: string): Stelling[] {
  return stellingen.filter((st) => {
    const a = antwoorden[st.besluit], v = st.stemmen[fractie];
    return (a === "Voor" || a === "Tegen") && (v === "Voor" || v === "Tegen") && a !== v;
  });
}

// "Je verwachtte JA21 op plek 11 en PVV op plek 16 van de 17." Een fractie zonder percentage heeft geen plek.
export function verwachtingZin(lijst: Uitslag[], verwacht: string[]): string | null {
  if (verwacht.length === 0) return null;
  const met = lijst.filter((u) => u.aandeel != null);
  const en = (x: string[]) => (x.length === 1 ? x[0] : `${x.slice(0, -1).join(", ")} en ${x[x.length - 1]}`);
  const metPlek = verwacht
    .map((f) => ({ f, plek: met.findIndex((u) => u.fractie === f) + 1 }))
    .filter((x) => x.plek > 0)
    .sort((a, b) => a.plek - b.plek);
  const zonder = verwacht.filter((f) => !metPlek.some((x) => x.f === f));
  const zinnen = [];
  if (metPlek.length) zinnen.push(`Je verwachtte ${en(metPlek.map((x) => `${x.f} op plek ${x.plek}`))} van de ${met.length}.`);
  if (zonder.length) zinnen.push(`${metPlek.length ? "Voor" : "Je verwachtte"} ${en(zonder)}${metPlek.length ? " zijn" : ", maar daarvoor zijn"} te weinig gemeenschappelijke stellingen.`);
  return zinnen.join(" ");
}

// Na de uitslag kan de bezoeker nog een ronde extra stellingen doen; de uitslag telt dan alle stellingen mee
// (feedback van een bezoeker, besluit Niels 28 oktober 2026)
export function Stemgenoten({ stellingen: eerste, extra = [], fracties, rollen }: {
  stellingen: Stelling[]; extra?: Stelling[]; fracties: Record<string, number>; rollen: Rollen | null;
}) {
  const [meer, setMeer] = useState(false);
  const stellingen = meer ? [...eerste, ...extra] : eerste;
  const [stap, setStap] = useState(-2); // -2: uitleg, -1: verwachting, 0..n-1: stellingen, n: uitslag
  const [antwoorden, setAntwoorden] = useState<Record<string, Antwoord>>({});
  const [verwacht, setVerwacht] = useState<string[]>([]);
  const [delen, setDelen] = useState<"" | "bezig" | "gedownload" | "fout">("");
  const n = stellingen.length;
  const kader = useRef<HTMLDivElement>(null);
  // Na een keuze naar het begin van de kaart, niet naar de bovenkant van de pagina
  const naarKaart = () => requestAnimationFrame(() => kader.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
  const naar = (i: number) => { setStap(i); naarKaart(); };
  const kies = (a: Antwoord | null) => {
    const st = stellingen[stap];
    setAntwoorden((x) => { const y = { ...x }; if (a) y[st.besluit] = a; else delete y[st.besluit]; return y; });
    naar(stap + 1);
  };

  const opZetels = Object.keys(fracties).sort((a, b) => fracties[b] - fracties[a] || a.localeCompare(b));
  const zetels = (f: string) => `${fracties[f]} ${fracties[f] === 1 ? "zetel" : "zetels"}`;
  const rol = (f: string) => rollen && <span className={s.rol} data-rol={rollen[f] ?? "oppositie"}>{rollen[f] ?? "oppositie"}</span>;

  if (stap === -2) {
    return (
      <div className={s.kaart} ref={kader}>
        <p className={s.tekst}>
          Je krijgt {eerste.length} echte stemmingen uit de Tweede Kamer: wetten en amendementen (wijzigingen in een wet) van onder het
          huidige kabinet. Kies bij elke stelling eens, oneens of geen mening. Daarna zie je per fractie hoe vaak die net zo stemde als
          jij, en bij elke stemming hoe het afliep.
        </p>
        <p className={s.klein}>
          Je antwoorden blijven op je eigen apparaat: er wordt niets verstuurd of opgeslagen. Dit is geen stemadvies; het laat alleen
          zien wie er in de Kamer stemde zoals jij.
        </p>
        <button type="button" className={s.hoofdknop} onClick={() => naar(-1)}>Begin</button>
      </div>
    );
  }

  if (stap === -1) {
    const wissel = (f: string) => setVerwacht((v) => (v.includes(f) ? v.filter((x) => x !== f) : [...v, f]));
    return (
      <div className={s.kaart} ref={kader} style={{ scrollMarginTop: 90 }}>
        <p className={s.label}>Eerst je verwachting</p>
        <h2 className={s.stelling}>Welke fracties stemmen volgens jou zoals jij?</h2>
        <p className={s.klein}>Tik er een paar aan. In de uitslag zie je ze terug in een eigen kleur. Je kunt dit ook overslaan.</p>
        <div className={s.keuzes}>
          {opZetels.map((f) => (
            <button key={f} type="button" aria-pressed={verwacht.includes(f)} onClick={() => wissel(f)}>{f}</button>
          ))}
        </div>
        <div className={s.onder}>
          <button type="button" className={s.hoofdknop} onClick={() => naar(0)}>{verwacht.length ? "Verder" : "Overslaan"}</button>
        </div>
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
        {st.kamerstuk != null && (
          <p className={s.klein}>
            <a href={WETSVOORSTEL(st.kamerstuk)} target="_blank" rel="noopener noreferrer">
              {st.soort === "Amendement" ? "Lees meer over de wet die dit amendement wilde wijzigen" : "Lees meer over deze wet"} op tweedekamer.nl ↗
            </a>
          </p>
        )}
        {/* Per stelling nieuwe knoppen (key), zodat focus en aantiktoestand niet meegaan naar de volgende */}
        <div className={s.knoppen} key={st.besluit}>
          <button type="button" className={s.eens} aria-pressed={huidig === "Voor"} onClick={() => kies("Voor")}>Eens</button>
          <button type="button" className={s.oneens} aria-pressed={huidig === "Tegen"} onClick={() => kies("Tegen")}>Oneens</button>
          <button type="button" className={s.neutraal} aria-pressed={huidig === "geen"} onClick={() => kies("geen")}>Geen mening</button>
        </div>
        <div className={s.onder}>
          <button type="button" className={s.link} onClick={() => naar(stap - 1)}>← Vorige</button>
          <button type="button" className={s.link} onClick={() => kies(null)}>Sla over</button>
        </div>
      </div>
    );
  }

  const lijst = uitslagen(stellingen, antwoorden, Object.keys(fracties));
  const beantwoord = stellingen.filter((st) => antwoorden[st.besluit] === "Voor" || antwoorden[st.besluit] === "Tegen").length;
  const met = lijst.filter((u) => u.aandeel != null), zonder = lijst.filter((u) => u.aandeel == null);
  const zin = verwachtingZin(lijst, verwacht);
  const jijWoord = (a: Antwoord | undefined) => (a === "Voor" ? "eens" : a === "Tegen" ? "oneens" : a === "geen" ? "geen mening" : "overgeslagen");

  const deel = async () => {
    setDelen("bezig");
    try {
      const blob = await deelPlaatje({ rijen: met, verwacht, rollen, beantwoord, n, zin });
      const bestand = new File([blob], "mijn-stemgenoten.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [bestand] })) {
        await navigator.share({ files: [bestand], title: "Stem jij zoals zij?", text: "Mijn stemgenoten in de Tweede Kamer: zetelen.nl/stemgenoten" });
        setDelen("");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = bestand.name; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDelen("gedownload");
      }
    } catch (e) {
      setDelen((e as Error)?.name === "AbortError" ? "" : "fout"); // zelf afgebroken is geen fout
    }
  };

  return (
    <div className={s.uitslag}>
      <div className={s.kaart} ref={kader} style={{ scrollMarginTop: 90 }}>
        <p className={s.label}>Jouw stemgenoten</p>
        <p className={s.tekst}>
          Je koos bij {beantwoord} van de {n} stellingen een kant. Zo vaak stemde elke fractie net als jij, op de stellingen waarop
          jullie allebei een kant kozen. Tik op een fractie voor de stellingen waarop die anders stemde.
        </p>
        {zin && <p className={s.verwachtZin}><span className={s.stip} aria-hidden="true" />{zin}</p>}
        {beantwoord < MINIMUM ? (
          <p className={s.tekst}>Kies bij minstens {MINIMUM} stellingen een kant om een uitslag te zien.</p>
        ) : (
          <ol className={s.fracties}>
            {met.map((u) => {
              const anders = verschillen(stellingen, antwoorden, u.fractie);
              return (
                <li key={u.fractie} data-verwacht={verwacht.includes(u.fractie) || undefined}>
                  <details>
                    <summary>
                      <span className={s.naam}>{u.fractie} <span className={s.zetels}>{zetels(u.fractie)}</span> {rol(u.fractie)}</span>
                      <span className={s.balk} aria-hidden="true"><span style={{ width: `${u.aandeel}%` }} /></span>
                      <span className={s.getal}>{Math.round(u.aandeel!)}% <span className={s.zetels}>({u.gelijk} van {u.samen})</span></span>
                      <span className={s.uitklapHint} aria-hidden="true" />
                    </summary>
                    <div className={s.anders}>
                      {anders.length === 0 ? (
                        <p className={s.klein}>{u.fractie} koos bij elke stelling dezelfde kant als jij.</p>
                      ) : (
                        <>
                          <p className={s.klein}>
                            {u.fractie} koos bij {u.gelijk} van de {u.samen} stellingen dezelfde kant als jij. Hier een andere kant:
                          </p>
                          <ul>
                            {anders.map((st) => (
                              <li key={st.besluit}>
                                {st.stelling}{" "}
                                <span className={s.zetels}>
                                  Jij {jijWoord(antwoorden[st.besluit])}, {u.fractie} {st.stemmen[u.fractie] === "Voor" ? "eens" : "oneens"}.
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        )}
        {zonder.length > 0 && beantwoord >= MINIMUM && (
          <p className={s.klein}>Te weinig gemeenschappelijke stellingen voor een percentage: {zonder.map((u) => u.fractie).join(", ")}.</p>
        )}
        {!meer && extra.length > 0 && (
          <div className={s.meer}>
            <p className={s.tekst}>Wil je een preciezer beeld? Hoe meer stellingen, hoe betrouwbaarder de percentages.</p>
            <button type="button" className={s.hoofdknop} onClick={() => { setMeer(true); naar(eerste.length); }}>
              Nog {extra.length} stellingen
            </button>
          </div>
        )}
        {beantwoord >= MINIMUM && (
          <div className={s.onder}>
            <button type="button" className={meer || !extra.length ? s.hoofdknop : s.link} onClick={deel} disabled={delen === "bezig"}>Deel als plaatje</button>
            <p className={s.klein} aria-live="polite">
              {delen === "gedownload" ? "Het plaatje staat in je downloads." : delen === "fout" ? "Het plaatje lukte niet. Probeer het nog eens." : ""}
            </p>
          </div>
        )}
        <div className={s.onder}>
          <button type="button" className={s.link} onClick={() => naar(n - 1)}>← Terug naar de laatste stelling</button>
          <button type="button" className={s.link} onClick={() => { setAntwoorden({}); setVerwacht([]); setDelen(""); setMeer(false); naar(-2); }}>Opnieuw beginnen</button>
        </div>
      </div>

      <h2 className={s.kop}>Hoe stemde de Kamer?</h2>
      <ol className={s.overzicht}>
        {stellingen.map((st) => {
          const a = antwoorden[st.besluit];
          const kant = (k: string) => Object.entries(st.stemmen).filter(([, v]) => v === k).map(([f]) => f).sort((x, y) => (fracties[y] ?? 0) - (fracties[x] ?? 0));
          const jij = <span className={s.jij}>Jij</span>;
          const aangenomen = st.uitslag === "aangenomen";
          const pVoor = (100 * st.voor) / (st.voor + st.tegen);
          return (
            <li key={st.besluit} className={s.regel}>
              <p className={s.label}>{st.terrein} · {datum(st.datum)} · {st.soort === "Amendement" ? "amendement" : "wet"}</p>
              <p className={s.regelStelling}>{st.stelling}</p>
              <div className={s.uitkomst}>
                <span className={s.uitkomstLabel}>Uitkomst</span>
                <span className={s.pil} data-uitslag={aangenomen ? "aangenomen" : "verworpen"}>{aangenomen ? "Aangenomen" : "Verworpen"}</span>
              </div>
              <div className={s.zetelbalk} role="img" aria-label={`${st.voor} zetels voor, ${st.tegen} zetels tegen`}>
                <span className={s.zetelVoor} style={{ width: `${pVoor}%` }} />
                <span className={s.zetelTegen} style={{ width: `${100 - pVoor}%` }} />
                <span className={s.helft} aria-hidden="true" />
              </div>
              <p className={s.zetelGetallen} aria-hidden="true">
                <span className={s.voor}>{st.voor} voor</span><span className={s.tegen}>{st.tegen} tegen</span>
              </p>
              <p className={s.klein}><span className={s.voor}>Voor:</span> {a === "Voor" && <>{jij} </>}{kant("Voor").join(", ")}</p>
              <p className={s.klein}><span className={s.tegen}>Tegen:</span> {a === "Tegen" && <>{jij} </>}{kant("Tegen").join(", ")}</p>
              {a !== "Voor" && a !== "Tegen" && <p className={s.klein}>{jij} {jijWoord(a)}</p>}
              {st.kamerstuk != null && (
                <p className={s.klein}>
                  <a href={WETSVOORSTEL(st.kamerstuk)} target="_blank" rel="noopener noreferrer">
                    Wetsvoorstel {st.kamerstuk} op tweedekamer.nl ↗
                  </a>
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <p className={s.klein}>Hoe de stemmingen zijn gekozen: <Link href="#methode">zie onderaan</Link>.</p>
    </div>
  );
}
