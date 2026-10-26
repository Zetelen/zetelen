#!/usr/bin/env python3
"""Tegen het advies van het kabinet in: moties die het kabinet ontraadde en die de Kamer toch aannam (besluit Niels
B18, 26 oktober 2026; onderzoek in docs/plan/onderzoek-motie-opvolging.md).

Haalt uit de open OData API van de Tweede Kamer alle moties die vanaf 1 april 2019 zijn ingediend (sindsdien legt
de bron het oordeel van het kabinet vast, Zaak.Kabinetsappreciatie), met de uitslag van de laatste stemming en de
fractie(s) van de indiener(s). Schrijft web/content/ontraden/moties.json: per motie de datum van indiening, het
oordeel (verkort), aangenomen of niet, en de fracties van de indieners. Geen namen.

Verkort oordeel: O = ontraden (ook "ontraden, tenzij gewijzigd"), K = oordeel Kamer, V = overgenomen,
A = anders (ontijdig, overbodig, verzocht aan te houden, geen appreciatie, niet beschikbaar of nog niet bekend).
Uitslag: 1 = aangenomen, 0 = verworpen, null = geen stemming (aangehouden, ingetrokken).

Verbinding via curl, zoals pipeline/stemming_casus.py.

Gebruik:
  python3 pipeline/ontraden.py
"""
import json
import subprocess
import time
import urllib.parse
from datetime import date
from pathlib import Path

BASE = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0"
UITVOER = Path(__file__).resolve().parents[1] / "web" / "content" / "ontraden"
PAUZE = 0.2


def haal(url: str) -> dict:
    uit = subprocess.run(["curl", "-sS", "--fail", "--max-time", "120", url], capture_output=True, check=True)
    time.sleep(PAUZE)
    return json.loads(uit.stdout)


def alle(eerste: str, haler=haal) -> list:
    """Alle records over meer pagina's. Geen $top meegeven: met $top geeft de API geen link naar de volgende pagina."""
    rijen, volgende = [], eerste
    while volgende:
        d = haler(volgende)
        rijen.extend(d.get("value", []))
        volgende = d.get("@odata.nextLink")
    return rijen


def oordeel(waarde: str | None) -> str:
    w = (waarde or "").lower()
    if w.startswith("ontraden"):
        return "O"
    if w == "oordeel kamer":
        return "K"
    if w == "overgenomen":
        return "V"
    return "A"


def uitslag(besluiten: list) -> int | None:
    """De laatste stemming (op vergaderdatum): 1 aangenomen, 0 verworpen; anders None."""
    met = []
    for b in besluiten:
        act = ((b.get("Agendapunt") or {}).get("Activiteit") or {})
        soort = (b.get("BesluitSoort") or "").lower()
        if act.get("Datum") and ("aangenomen" in soort or "verworpen" in soort):
            met.append((act["Datum"][:10], 0 if ("niet aangenomen" in soort or "verworpen" in soort) else 1))
    return max(met)[1] if met else None


def maanden(van: date, tot: date):
    j, m = van.year, van.month
    while (j, m) <= (tot.year, tot.month):
        yield j, m
        j, m = (j + 1, 1) if m == 12 else (j, m + 1)


def moties(van: date, tot: date, haler=haal) -> list:
    uit = []
    for j, m in maanden(van, tot):
        volgende = f"{j + 1}-01-01" if m == 12 else f"{j}-{m + 1:02d}-01"
        filt = f"Soort eq 'Motie' and Verwijderd eq false and GestartOp ge {j}-{m:02d}-01 and GestartOp lt {volgende}"
        expand = ("Besluit($filter=Verwijderd eq false and StemmingsSoort ne null;$select=BesluitSoort;"
                  "$expand=Agendapunt($select=Id;$expand=Activiteit($select=Datum))),"
                  "ZaakActor($filter=Relatie eq 'Indiener';$select=ActorFractie)")
        url = f"{BASE}/Zaak?" + urllib.parse.urlencode({"$filter": filt, "$select": "Nummer,GestartOp,Kabinetsappreciatie", "$expand": expand},
                                                        quote_via=urllib.parse.quote)
        zaken = alle(url, haler)
        for z in zaken:
            fracties = sorted({a["ActorFractie"] for a in z.get("ZaakActor") or [] if a.get("ActorFractie")})
            uit.append({"n": z["Nummer"], "d": (z.get("GestartOp") or "")[:10], "o": oordeel(z.get("Kabinetsappreciatie")),
                        "u": uitslag(z.get("Besluit") or []), "f": fracties})
        print(f"{j}-{m:02d}: {len(zaken)} moties")
    return uit


def main() -> None:
    rijen = moties(date(2019, 4, 1), date.today())
    UITVOER.mkdir(parents=True, exist_ok=True)
    (UITVOER / "moties.json").write_text(json.dumps(rijen, ensure_ascii=False, separators=(",", ":")) + "\n")
    aangenomen = [r for r in rijen if r["u"] == 1]
    print(f"Geschreven: {len(rijen)} moties, {len(aangenomen)} aangenomen, waarvan {sum(1 for r in aangenomen if r['o'] == 'O')} ontraden")


if __name__ == "__main__":
    main()
