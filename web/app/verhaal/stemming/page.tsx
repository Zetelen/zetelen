// Graphic 2 staat sinds 25 oktober 2026 op /onderwerpen (besluit Niels). Oude links komen daar uit.
import { redirect } from "next/navigation";

export default function StemmingPagina() {
  redirect("/onderwerpen#een-stemming");
}
