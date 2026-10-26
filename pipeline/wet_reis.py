#!/usr/bin/env python3
"""Hoe lang duurt een wet? Gegevens voor /uitgelicht/hoe-lang-duurt-een-wet (feedback Niels, 26 oktober 2026).

Twee soorten uitvoer, allebei uit de open OData API van de Tweede Kamer:

1. --alle: alle wetsvoorstellen (Zaak.Soort 'Wetgeving' en 'Initiatiefwetgeving') die vanaf 2010 zijn
   ingediend, met de datum van indiening (Zaak.GestartOp) en de datum van het laatste besluit in de plenaire
   zaal (de vergaderdatum van de activiteit bij het besluit) met de uitslag. Een hamerstuk (aangenomen zonder
   stemming) telt als besluit. Voorstellen zonder besluit (nog in behandeling, ingetrokken of vervallen) staan er
   ook in, zonder datum: de site telt ze apart, zodat de doorlooptijd niet alleen over de snelle wetten gaat. Schrijft web/content/wetten/doorlooptijd.json.

2. --reis NUMMER: de haltes van één wet, uit de documenten bij de zaak (Document.Soort en Document.Datum):
   ingediend, advies van de Raad van State, verslag (vragen van de Kamer), nota naar aanleiding van het verslag
   (antwoord), nota's van wijziging, en de stemming. Schrijft web/content/wetten/<NUMMER>.json.

Uitvoer naar het scherm: alleen aantallen. Geen namen: de titel van een initiatiefwet bevat de naam van de
indiener, dus die komt niet in de bestanden; de site gebruikt een eigen, met de hand geschreven titel.

Verbinding via curl, zoals pipeline/stemming_casus.py.

Gebruik:
  python3 pipeline/wet_reis.py --alle
  python3 pipeline/wet_reis.py --reis 2012Z22373 2020Z17945
"""
import argparse
import json
import subprocess
import sys
import time
import urllib.parse
from pathlib import Path

BASE = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0"
UITVOER = Path(__file__).resolve().parents[1] / "web" / "content" / "wetten"
PAUZE = 0.2
SOORTEN = ("Wetgeving", "Initiatiefwetgeving")
# Een hamerstuk wordt aangenomen zonder stemming; de bron legt dat vast als besluit met deze soort
HAMER = "Stemmen - zonder stemming aannemen"


def haal(url: str) -> dict:
    uit = subprocess.run(["curl", "-sS", "--fail", "--max-time", "120", url], capture_output=True, check=True)
    time.sleep(PAUZE)
    return json.loads(uit.stdout)


def url(entiteit: str, **params: str) -> str:
    return f"{BASE}/{entiteit}?" + urllib.parse.urlencode({f"${k}": v for k, v in params.items()}, quote_via=urllib.parse.quote)


def alle(eerste: str, haler=haal) -> list:
    rijen, volgende = [], eerste
    while volgende:
        d = haler(volgende)
        rijen.extend(d.get("value", []))
        volgende = d.get("@odata.nextLink")
    return rijen


def uitslag(besluitsoort: str | None) -> str:
    s = (besluitsoort or "").lower()
    if "zonder stemming" in s:
        return "hamerstuk"
    if "gestaakt" in s:
        return "gestaakt"
    if "niet aangenomen" in s or "verworpen" in s:
        return "verworpen"
    if "aangenomen" in s:
        return "aangenomen"
    return "anders"


def stemming(besluiten: list) -> tuple[str | None, str | None]:
    """De laatste stemming over de zaak: vergaderdatum en uitslag. Besluiten zonder datum tellen niet."""
    met_datum = []
    for b in besluiten:
        act = ((b.get("Agendapunt") or {}).get("Activiteit") or {})
        if act.get("Datum"):
            met_datum.append((act["Datum"][:10], b.get("BesluitSoort")))
    if not met_datum:
        return None, None
    datum, soort = max(met_datum)
    return datum, uitslag(soort)


def doorlooptijd(van: int, tot: int, haler=haal) -> list:
    """Per wetsvoorstel: nummer, soort (W of I), ingediend, gestemd (of null) en uitslag."""
    uit = []
    for jaar in range(van, tot + 1):
        filt = (f"(Soort eq 'Wetgeving' or Soort eq 'Initiatiefwetgeving') and Verwijderd eq false "
                f"and GestartOp ge {jaar}-01-01 and GestartOp lt {jaar + 1}-01-01")
        expand = f"Besluit($filter=Verwijderd eq false and (StemmingsSoort ne null or BesluitSoort eq '{HAMER}');$select=BesluitSoort;$expand=Agendapunt($select=Id;$expand=Activiteit($select=Datum)))"
        zaken = alle(url("Zaak", filter=filt, select="Nummer,Soort,GestartOp", expand=expand, top="250"), haler)
        for z in zaken:
            if not z.get("GestartOp"):
                continue
            gestemd, u = stemming(z.get("Besluit") or [])
            uit.append({"nummer": z["Nummer"], "soort": "I" if z["Soort"] == "Initiatiefwetgeving" else "W",
                        "ingediend": z["GestartOp"][:10], "gestemd": gestemd, "uitslag": u})
        print(f"{jaar}: {len(zaken)} wetsvoorstellen, waarvan {sum(1 for z in zaken if (z.get('Besluit') or []))} met een besluit")
    return uit


# Haltes uit de soorten documenten; de eerste van elke soort telt (bij nota's van wijziging: elke)
HALTES = [
    ("ingediend", ("Voorstel van wet",)),
    ("advies", ("Advies Afdeling advisering Raad van State",)),
    ("vragen", ("Verslag",)),
    ("antwoord", ("Nota n.a.v. het", "Memorie van antwoord")),
    ("aangepast", ("Nota van wijziging",)),
]


def halte(soort: str) -> str | None:
    for naam, begin in HALTES:
        if any(soort.startswith(b) for b in begin):
            return naam
    return None


def reis(nummer: str, haler=haal) -> dict:
    expand = ("Document($filter=Verwijderd eq false;$select=Soort,Datum),"
              f"Besluit($filter=Verwijderd eq false and (StemmingsSoort ne null or BesluitSoort eq '{HAMER}');$select=BesluitSoort;$expand=Agendapunt($select=Id;$expand=Activiteit($select=Datum))),"
              "ZaakActor($filter=Relatie eq 'Indiener';$select=ActorFractie,Functie)")
    zaken = alle(url("Zaak", filter=f"Nummer eq '{nummer}' and Verwijderd eq false", select="Nummer,Soort,GestartOp", expand=expand), haler)
    if not zaken:
        raise SystemExit(f"{nummer}: niet gevonden")
    z = zaken[0]
    haltes, gezien = [], set()
    for d in sorted(z.get("Document") or [], key=lambda d: d.get("Datum") or ""):
        h = halte(d.get("Soort") or "")
        if not h or not d.get("Datum") or (h in gezien and h != "aangepast"):
            continue
        gezien.add(h)
        haltes.append({"halte": h, "datum": d["Datum"][:10]})
    gestemd, u = stemming(z.get("Besluit") or [])
    if gestemd:
        haltes.append({"halte": "gestemd", "datum": gestemd})
    # Indiener: bij een initiatiefwet de fractie(s), bij een regeringswet de functie (bijv. minister van Financiën)
    actoren = z.get("ZaakActor") or []
    indiener = sorted({a["ActorFractie"] for a in actoren if a.get("ActorFractie")}) or sorted({a["Functie"] for a in actoren if a.get("Functie")})
    return {"nummer": z["Nummer"], "soort": z["Soort"], "ingediend": (z.get("GestartOp") or "")[:10], "indiener": indiener,
            "uitslag": u, "haltes": haltes}


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--alle", action="store_true")
    p.add_argument("--van", type=int, default=2010)
    p.add_argument("--tot", type=int, default=2026)
    p.add_argument("--reis", nargs="*", default=[])
    a = p.parse_args()
    UITVOER.mkdir(parents=True, exist_ok=True)
    if a.alle:
        rijen = doorlooptijd(a.van, a.tot)
        (UITVOER / "doorlooptijd.json").write_text(json.dumps(rijen, ensure_ascii=False, separators=(",", ":")) + "\n")
        print(f"Geschreven: {len(rijen)} wetsvoorstellen, {sum(1 for r in rijen if r['gestemd'])} met een besluit, waarvan {sum(1 for r in rijen if r['uitslag'] == 'hamerstuk')} hamerstuk")
    for nummer in a.reis:
        r = reis(nummer)
        (UITVOER / f"{nummer}.json").write_text(json.dumps(r, ensure_ascii=False, indent=1) + "\n")
        print(f"{nummer}: {len(r['haltes'])} haltes, uitslag {r['uitslag']}")
    if not a.alle and not a.reis:
        p.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
