// Deelplaatje van Stemgenoten (feedback Niels, 27 oktober 2026): de ingeklapte uitslag als PNG, getekend in de
// browser. Zo gaan de antwoorden nergens heen; alleen wie zelf deelt, deelt het plaatje. Fracties die je vooraf
// verwachtte krijgen dezelfde goudkleur als op de pagina.
import type { Rollen, Uitslag } from "./Stemgenoten";

type Invoer = { rijen: Uitslag[]; verwacht: string[]; rollen: Rollen | null; beantwoord: number; n: number; zin: string | null };

const B = 1080, MARGE = 72, RIJ = 58;

function css(naam: string, terug: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(naam).trim() || terug;
}

// Tekst die te breed is, regel voor regel afbreken
function regels(ctx: CanvasRenderingContext2D, tekst: string, breed: number): string[] {
  const uit: string[] = [];
  let regel = "";
  for (const woord of tekst.split(" ")) {
    const proef = regel ? `${regel} ${woord}` : woord;
    if (ctx.measureText(proef).width > breed && regel) { uit.push(regel); regel = woord; } else regel = proef;
  }
  if (regel) uit.push(regel);
  return uit;
}

export async function deelPlaatje({ rijen, verwacht, rollen, beantwoord, n, zin }: Invoer): Promise<Blob> {
  await document.fonts?.ready;
  const k = {
    bodem: css("--nacht-950", "#070b18"), vlak: css("--nacht-900", "#0b1226"), baan: css("--nacht-700", "#1a2748"),
    lijn: css("--lijn", "#2a3a63"), tekst: css("--tekst", "#e8ecf5"), zacht: css("--tekst-zacht", "#a9b4cc"),
    koper: css("--koper", "#d08a55"), goud: css("--goud", "#e3b76a"),
  };
  const sans = css("--sans", "system-ui, sans-serif"), serif = css("--serif", "Georgia, serif"), mono = css("--mono", "monospace");

  const meet = document.createElement("canvas").getContext("2d")!;
  meet.font = `400 28px ${sans}`;
  const zinRegels = zin ? regels(meet, zin, B - 2 * MARGE - 28) : [];
  const kop = 250 + zinRegels.length * 38 + (zin ? 20 : 0);
  const H = kop + rijen.length * RIJ + 130;

  const doek = document.createElement("canvas");
  doek.width = B; doek.height = H;
  const ctx = doek.getContext("2d")!;
  ctx.fillStyle = k.bodem; ctx.fillRect(0, 0, B, H);
  ctx.fillStyle = k.vlak; ctx.strokeStyle = k.lijn; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(32, 32, B - 64, H - 64, 20); ctx.fill(); ctx.stroke();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = k.koper; ctx.font = `600 24px ${sans}`;
  ctx.fillText("STEMGENOTEN · ZETELEN", MARGE, 110);
  ctx.fillStyle = k.tekst; ctx.font = `400 64px ${serif}`;
  ctx.fillText("Stem jij zoals zij?", MARGE, 182);
  ctx.fillStyle = k.zacht; ctx.font = `400 28px ${sans}`;
  ctx.fillText(`Zo vaak stemde elke fractie net als ik, op ${beantwoord} van ${n} echte stemmingen.`, MARGE, 226);
  zinRegels.forEach((r, i) => {
    if (i === 0) { ctx.fillStyle = k.goud; ctx.beginPath(); ctx.arc(MARGE + 8, 270 - 9, 8, 0, 2 * Math.PI); ctx.fill(); }
    ctx.fillStyle = k.tekst; ctx.fillText(r, MARGE + 28, 270 + i * 38);
  });

  const naamB = 300, getalB = 110, baanX = MARGE + naamB, baanB = B - 2 * MARGE - naamB - getalB;
  rijen.forEach((u, i) => {
    const y = kop + i * RIJ, midden = y + RIJ / 2;
    const isVerwacht = verwacht.includes(u.fractie);
    if (isVerwacht) {
      ctx.fillStyle = "rgba(227, 183, 106, 0.12)";
      ctx.beginPath(); ctx.roundRect(MARGE - 16, y + 4, B - 2 * MARGE + 32, RIJ - 8, 10); ctx.fill();
    }
    ctx.fillStyle = isVerwacht ? k.goud : k.tekst; ctx.font = `600 28px ${sans}`;
    ctx.fillText(u.fractie, MARGE, midden + 10, naamB - 20);
    if (rollen?.[u.fractie] === "kabinet") {
      const x = MARGE + Math.min(ctx.measureText(u.fractie).width, naamB - 20) + 12;
      ctx.font = `600 16px ${sans}`;
      const w = ctx.measureText("KABINET").width + 16;
      if (x + w < baanX - 8) {
        ctx.strokeStyle = k.koper; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.roundRect(x, midden - 12, w, 24, 12); ctx.stroke();
        ctx.fillStyle = k.koper; ctx.fillText("KABINET", x + 8, midden + 6);
      }
    }
    ctx.fillStyle = k.baan; ctx.beginPath(); ctx.roundRect(baanX, midden - 11, baanB, 22, 11); ctx.fill();
    ctx.fillStyle = isVerwacht ? k.goud : k.koper;
    ctx.beginPath(); ctx.roundRect(baanX, midden - 11, Math.max(22, (baanB * (u.aandeel ?? 0)) / 100), 22, 11); ctx.fill();
    ctx.fillStyle = k.tekst; ctx.font = `500 28px ${mono}`; ctx.textAlign = "right";
    ctx.fillText(`${Math.round(u.aandeel ?? 0)}%`, B - MARGE, midden + 10);
    ctx.textAlign = "left";
  });

  const voet = kop + rijen.length * RIJ + 60;
  ctx.fillStyle = k.zacht; ctx.font = `400 24px ${sans}`;
  ctx.fillText(verwacht.length ? "Goud: wie ik vooraf verwachtte." : "Echte stemmingen uit de Tweede Kamer.", MARGE, voet);
  ctx.fillStyle = k.koper; ctx.font = `600 28px ${sans}`; ctx.textAlign = "right";
  ctx.fillText("zetelen.nl/stemgenoten", B - MARGE, voet);

  return new Promise((ok, mis) => doek.toBlob((b) => (b ? ok(b) : mis(new Error("geen plaatje"))), "image/png"));
}
