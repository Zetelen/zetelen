// Standaard deelafbeelding (E3-S4), in het eigen palet. Per pagina volgt die van component deelplaatjes.
import { ImageResponse } from "next/og";

export const alt = "Zetelen: wie stemt met wie in de Tweede Kamer?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Deelafbeelding() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#070B18",
          color: "#E8ECF5",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          gap: 24,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#D08A55" }}>ZETELEN</div>
        <div style={{ fontSize: 72, lineHeight: 1.05 }}>Wie stemt met wie in de Kamer?</div>
        <div style={{ fontSize: 28, color: "#A9B4CC" }}>Geteld uit de open data van de Tweede Kamer</div>
      </div>
    ),
    size,
  );
}
