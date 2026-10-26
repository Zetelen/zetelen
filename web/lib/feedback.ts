// Vragenlijst van de feedbackronde (besluit Niels B13, 26 oktober 2026). Opgesteld door Claude.
// De antwoorden gaan via app/api/feedback naar api.stuur_feedback (migratie 021); die controleert ze nog een keer.
export type Vraag = {
  id: string;
  vraag: string;
  soort: "tekst" | "keuze" | "schaal";
  opties?: string[];
  hulp?: string;
};

export const VRAGEN: Vraag[] = [
  { id: "indruk", vraag: "Wat is in één zin je eerste indruk?", soort: "tekst" },
  { id: "pagina", vraag: "Welk onderdeel bekeek je het langst?", soort: "keuze",
    opties: ["Voorpagina", "Verkenner", "Onderwerpen", "Coalitie", "Oppositie", "Fracties", "Kamerleden", "Methodiek"] },
  { id: "begrip", vraag: "Snap je wat je ziet?", soort: "schaal", hulp: "1 is helemaal niet, 5 is helemaal" },
  { id: "onduidelijk", vraag: "Wat was onduidelijk, of waar haakte je af?", soort: "tekst" },
  { id: "onpartijdig", vraag: "Hoe onpartijdig vind je de site?", soort: "schaal", hulp: "1 is helemaal niet, 5 is helemaal" },
  { id: "voorkeur", vraag: "Zag je ergens een voorkeur voor een partij? Waar?", soort: "tekst" },
  { id: "fout", vraag: "Zag je een cijfer of tekst die niet klopt? Op welke pagina?", soort: "tekst" },
  { id: "wens", vraag: "Wat zou je nog willen zien, of zelf willen uitzoeken?", soort: "tekst" },
  { id: "delen", vraag: "Zou je Zetelen aan iemand laten zien?", soort: "keuze", opties: ["Ja", "Misschien", "Nee"] },
  { id: "mail", vraag: "Mag ik je mailen over je antwoorden? Vul dan je e-mailadres in.", soort: "tekst",
    hulp: "Niet verplicht. Je adres gebruik ik alleen daarvoor, en het gaat na 12 maanden weg." },
];

export const MAX_TEKST = 2000;

// Houdt alleen bekende vragen met een geldig antwoord over; lege antwoorden vallen weg.
// Geeft null als er niets overblijft.
export function schoonAntwoorden(invoer: unknown): Record<string, string | number> | null {
  if (!invoer || typeof invoer !== "object" || Array.isArray(invoer)) return null;
  const uit: Record<string, string | number> = {};
  for (const v of VRAGEN) {
    const w = (invoer as Record<string, unknown>)[v.id];
    if (v.soort === "schaal") {
      const n = typeof w === "string" ? Number(w) : w;
      if (typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5) uit[v.id] = n;
    } else if (typeof w === "string") {
      const t = w.trim().slice(0, MAX_TEKST);
      if (!t) continue;
      if (v.soort === "keuze" && !v.opties!.includes(t)) continue;
      if (v.id === "mail" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) continue;
      uit[v.id] = t;
    }
  }
  return Object.keys(uit).length ? uit : null;
}
