// Rendert de merkbeelden naar out/merk/ en zet het deelplaatje en het favicon in de site (web/app). Transparant voor het
// woordmerk en het favicon (afgeronde hoeken). Gebruik: node scripts/merk.mjs
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";

mkdirSync("out/merk", { recursive: true });
const BEELDEN = ["Merk-profiel", "Merk-banner-linkedin", "Merk-banner-reddit", "Merk-woordmerk", "Merk-deel", "Merk-icoon"];
for (const id of BEELDEN) {
  const transparant = id === "Merk-woordmerk" || id === "Merk-icoon";
  execFileSync("npx", ["remotion", "still", "src/index.ts", id, `out/merk/${id}.png`, "--log=error", ...(transparant ? ["--image-format=png"] : [])], { stdio: "inherit" });
  console.log(`Gerenderd: ${id}`);
}
copyFileSync("out/merk/Merk-deel.png", "../web/app/opengraph-image.png");
copyFileSync("out/merk/Merk-icoon.png", "../web/app/icon.png");
copyFileSync("out/merk/Merk-icoon.png", "../web/app/apple-icon.png");
console.log("Deelplaatje en favicon staan in web/app");
