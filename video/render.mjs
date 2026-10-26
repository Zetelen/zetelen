// Rendert alle video's naar out/ (of alleen de namen die je meegeeft): node render.mjs [id ...]
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

// Met --quiet geeft Remotion de namen van alle composities, gescheiden door spaties
const lijst = execFileSync("npx", ["remotion", "compositions", "src/index.ts", "--quiet"], { encoding: "utf8" }).trim().split(/\s+/);
const kies = process.argv.slice(2);
mkdirSync("out", { recursive: true });
for (const id of kies.length ? kies : lijst) {
  console.log(`Render ${id}`);
  execFileSync("npx", ["remotion", "render", "src/index.ts", id, `out/${id}.mp4`, "--log=error"], { stdio: "inherit" });
}
