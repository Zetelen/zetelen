// Huisstijl van de video's: dezelfde kleuren en letters als de site (web/styles/tokens.css), formaat 9:16.
import { loadFont as laadSerif } from "@remotion/google-fonts/Newsreader";
import { loadFont as laadSans } from "@remotion/google-fonts/HankenGrotesk";
import { loadFont as laadMono } from "@remotion/google-fonts/DMMono";

export const LETTER = {
  serif: laadSerif("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
  sans: laadSans("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily,
  mono: laadMono("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily,
};

export const K = {
  nacht950: "#070b18",
  nacht900: "#0b1226",
  nacht800: "#111b36",
  lijn: "#2a3a63",
  lijnLicht: "#566aa6",
  tekst: "#e8ecf5",
  zacht: "#a9b4cc",
  koper: "#d08a55",
  goud: "#e3b76a",
  // Stemkleuren in de varianten waar de stem telt, niet de fractie: geen partijkleuren
  voor: "#d08a55",
  tegen: "#7fb7c9",
  niet: "#3a4566",
};

export const FPS = 30;
export const BREED = 1080;
export const HOOG = 1920;
// Veilige zone voor sociale media: bovenin en onderin komen knoppen en bijschriften van de app
export const VEILIG = { boven: 200, onder: 320, zij: 72 };
