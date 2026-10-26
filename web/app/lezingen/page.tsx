// De proefpagina met lezingen is op 26 oktober 2026 opgeheven (besluit Niels B4): de lezingen staan nu bij de tool
// waar ze over gaan (verkenner, coalitiebouwer en Onderwerpen bij asiel). Oude links komen op de voorpagina uit.
import { redirect } from "next/navigation";

export default function LezingenPagina() {
  redirect("/");
}
