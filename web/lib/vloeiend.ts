// Vloeiende lijn door punten (verzoek Niels, 28 oktober 2026): een monotone kubische kromme (Fritsch en Carlson). Anders
// dan een gewone spline schiet hij tussen twee punten nooit boven het hoogste of onder het laagste van die twee uit, dus
// de afronding verzint geen pieken of dalen die niet in de data zitten. Gebruikt door de trendgrafiek en de video's.
export type Xy = [number, number];

export function vloeiendPad(p: Xy[]): string {
  if (p.length === 0) return "";
  if (p.length === 1) return `M${p[0][0]},${p[0][1]}`;
  if (p.length === 2) return `M${p[0][0]},${p[0][1]} L${p[1][0]},${p[1][1]}`;
  const n = p.length;
  const dx = p.slice(1).map((q, i) => q[0] - p[i][0]);
  const helling = p.slice(1).map((q, i) => (q[1] - p[i][1]) / dx[i]);
  // Raaklijn per punt: gemiddelde van de buren, nul bij een top of dal, en begrensd zodat de kromme monotoon blijft
  const m: number[] = new Array(n);
  m[0] = helling[0];
  m[n - 1] = helling[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = helling[i - 1] * helling[i] <= 0 ? 0 : (helling[i - 1] + helling[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (helling[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / helling[i], b = m[i + 1] / helling[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * helling[i]; m[i + 1] = t * b * helling[i]; }
  }
  const r = (x: number) => Math.round(x * 10) / 10;
  let d = `M${r(p[0][0])},${r(p[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${r(p[i][0] + h)},${r(p[i][1] + m[i] * h)} ${r(p[i + 1][0] - h)},${r(p[i + 1][1] - m[i + 1] * h)} ${r(p[i + 1][0])},${r(p[i + 1][1])}`;
  }
  return d;
}
