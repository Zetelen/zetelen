// Lezing 3 in de verkenner (besluit Niels B4, 26 oktober 2026): kies je een fractie die in het kabinet zit, dan zie je
// per kabinetspartner hoe vaak ze hetzelfde stemden, door alle kabinetten heen, met een gouden stip waar ze samen
// regeerden. Twee lezingen: ze liggen dicht bij elkaar, of het regeerakkoord stemt mee. Servercomponent.
import { Lezingen } from "@/components/Onderdelen";
import { Data, Label, Tekst } from "@/components/Typografie";
import { leesApi } from "@/lib/api";
import { PALET } from "@/lib/verhaal";
import { LijnKabinetten, type Reeks } from "./Grafieken";
import s from "./lezingen.module.css";

type Coalitie = { kabinet: string; afkorting: string; rol: string };

export async function SamenRegeren({ fractie, kabinet, kabinetten }: { fractie: string; kabinet: string; kabinetten: string[] }) {
  const coalitie = await leesApi<Coalitie[]>("coalitie?select=kabinet,afkorting,rol");
  if (!coalitie) return null;
  const inKabinet = (k: string, f: string) => coalitie.some((c) => c.kabinet === k && c.afkorting === f && c.rol === "kabinet");
  if (!inKabinet(kabinet, fractie)) return null;
  const partners = coalitie.filter((c) => c.kabinet === kabinet && c.rol === "kabinet" && c.afkorting !== fractie).map((c) => c.afkorting).slice(0, 3);
  if (!partners.length) return null;
  const reeksen: Reeks[] = (await Promise.all(partners.map(async (p, i) => {
    const rijen = await leesApi<Array<{ periode: string; cohesie: number | null }>>(
      `cohesie?select=periode,cohesie&periodesoort=eq.kabinet&variant=eq.alle&fractie_afkorting=eq.${encodeURIComponent(fractie)}&andere_fractie_afkorting=eq.${encodeURIComponent(p)}`,
    );
    return {
      naam: `${fractie} en ${p}`, tint: PALET[i],
      punten: kabinetten.map((k) => ({ kabinet: k, waarde: rijen?.find((r) => r.periode === k)?.cohesie ?? null, samen: inKabinet(k, fractie) && inKabinet(k, p) })),
    };
  }))).filter((r) => r.punten.filter((p) => p.waarde != null).length >= 2);
  if (!reeksen.length) return null;
  // Per partner: nu, en het laatste kabinet waarin ze niet samen regeerden
  const zinnen = reeksen.map((r) => {
    const nu = r.punten.find((p) => p.kabinet === kabinet);
    const apart = [...r.punten].reverse().find((p) => p.waarde != null && !p.samen);
    return nu?.waarde != null && apart?.waarde != null
      ? `${r.naam}: ${Math.round(nu.waarde)}% onder ${kabinet}, ${Math.round(apart.waarde)}% onder ${apart.kabinet}, toen ze niet samen regeerden.`
      : null;
  }).filter(Boolean);
  return (
    <section className={s.lezing} aria-label="Twee lezingen">
      <Label>Twee lezingen · samen regeren</Label>
      <Tekst>Eens, of gewoon samen in het kabinet? {fractie} regeert onder {kabinet} met {partners.join(", ").replace(/, ([^,]*)$/, " en $1")}. Zo vaak stemden ze hetzelfde, kabinet na kabinet.</Tekst>
      {zinnen.length > 0 && <Data>{zinnen.join(" ")}</Data>}
      <LijnKabinetten kabinetten={kabinetten} reeksen={reeksen} label={`Hoe vaak ${fractie} en de kabinetspartners hetzelfde stemden, per kabinet`} />
      <Data>Een gouden stip: samen in het kabinet.</Data>
      <Lezingen
        links={{ titel: "Ze liggen dicht bij elkaar", tekst: "Partijen die vaak hetzelfde stemmen, delen veel standpunten. Daarom gingen ze ook samen regeren." }}
        rechts={{ titel: "Het regeerakkoord stemt mee", tekst: "Zodra partijen samen regeren, gaat hun overeenstemming omhoog; zodra ze uit elkaar gaan, daalt die weer. Het akkoord verklaart meer dan de standpunten." }}
      />
    </section>
  );
}
