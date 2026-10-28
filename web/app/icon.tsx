// Favicon: het merkteken van Zetelen (ontwerp A, besluit Niels 28 oktober 2026), vereenvoudigd tot twee rijen zetels
// zodat het op 16 tot 64 pixels leesbaar blijft. Koper op nacht, één gouden zetel in het midden. Het volledige teken
// staat in video/src/merk.tsx.
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const RIJEN: Array<[number, number]> = [[0.5, 5], [0.86, 9]];

export default function Icoon() {
  const zetels = RIJEN.flatMap(([r, n], ri) => Array.from({ length: n }, (_, i) => {
    const a = Math.PI - (Math.PI * i) / (n - 1);
    return { x: 32 + Math.cos(a) * r * 27, y: 44 - Math.sin(a) * r * 27, goud: ri === 1 && i === 4 };
  }));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#070B18", display: "flex", borderRadius: 12 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          {zetels.map((z, i) => <circle key={i} cx={z.x} cy={z.y} r={z.goud ? 3.6 : 3.1} fill={z.goud ? "#E3B76A" : "#D08A55"} />)}
        </svg>
      </div>
    ),
    size,
  );
}
