import Link from "next/link";
import { Inhoud, LegeStaat, knopKlasse } from "@/components/Kader";

export default function NietGevonden() {
  return (
    <Inhoud>
      <LegeStaat label="Niet gevonden" titel="Deze pagina bestaat niet" uitleg="Hier is nooit gezeteld. Misschien is het adres veranderd, of zit er een tikfout in." />
      <Link href="/" className={knopKlasse}>
        Terug naar de voorpagina
      </Link>
    </Inhoud>
  );
}
