#!/usr/bin/env python3
"""Een hoofdelijke stemming als casus voor /uitgelicht (besluit Niels B16, 26 oktober 2026).

Haalt voor een zaaknummer de hoofdelijke besluiten op uit de open OData API van de
Tweede Kamer, telt de stemmen per fractie en schrijft een JSON-bestand voor de site
(web/content/uitgelicht/<zaaknummer>.json). Zelfde gegevens als
web/content/verhaal-stemming.json (de motie-Eerdmans), maar per besluit, zodat een
herstemming bij gestaakte stemmen erbij kan.

Regels voor het tellen:
- Alleen stemmen van personen (Persoon_Id gevuld): bij een hoofdelijke stemming stemt
  elk Kamerlid apart.
- Verwijderd = true telt niet mee.
- Vergissing = true telt wel mee, zoals in de officiele uitslag (een uitslag ligt vast),
  maar wordt per stem en fractie apart vastgelegd, zodat de site het kan benoemen.
- De telling wordt vergeleken met de uitslag in BesluitTekst; elk verschil komt in het
  bestand en in de uitvoer.

Uitvoer: alleen aantallen, nooit namen (conventie: geen namen in logs of CI). Het
JSON-bestand voor de site bevat wel het onderwerp van de zaak; daar mogen namen in staan.

Verbinding: via curl, niet via urllib. Python van python.org op een Mac heeft zonder
extra stap geen certificaten (zie docs/plan/api-check-handmatig.md); curl gebruikt die
van het systeem. Alleen standaardbibliotheek plus curl.

Gebruik:
  python3 pipeline/stemming_casus.py 2008Z01504 2018Z19777
  python3 pipeline/stemming_casus.py 2025Z11623 --uitvoer /tmp/controle
"""
import argparse
import json
import re
import subprocess
import sys
import time
import urllib.parse
from pathlib import Path

BASE = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0"
STEMSOORTEN = ["Voor", "Tegen", "Niet deelgenomen"]
UITVOER = Path(__file__).resolve().parents[1] / "web" / "content" / "uitgelicht"
PAUZE = 0.2  # seconden tussen aanroepen


def haal(url: str) -> dict:
    """Een GET via curl; geeft de JSON terug. Faalt hard bij een HTTP-fout."""
    uit = subprocess.run(["curl", "-sS", "--fail", "--max-time", "60", url], capture_output=True, check=True)
    time.sleep(PAUZE)
    return json.loads(uit.stdout)


def url(entiteit: str, **params: str) -> str:
    return f"{BASE}/{entiteit}?" + urllib.parse.urlencode({f"${k}": v for k, v in params.items()}, quote_via=urllib.parse.quote)


def alle(eerste: str, haler=haal) -> list:
    """Alle records, ook over meer pagina's (@odata.nextLink)."""
    rijen, volgende = [], eerste
    while volgende:
        d = haler(volgende)
        rijen += d["value"]
        volgende = d.get("@odata.nextLink")
    return rijen


def lees_uitslag(tekst: str | None) -> dict | None:
    """Voor en tegen uit BesluitTekst, bijvoorbeeld 'Aangenomen. (74-72) (Hoofdelijk)'
    of 'Niet aangenomen (na Hoofdelijk 73-73)'. Geen getallen: None."""
    m = re.search(r"(\d+)\s*-\s*(\d+)", tekst or "")
    return {"voor": int(m.group(1)), "tegen": int(m.group(2))} if m else None


def fractie_van(rij: dict) -> str:
    # Afkorting van de gekoppelde fractie, zoals in verhaal-stemming.json; anders ActorFractie
    return (rij.get("Fractie") or {}).get("Afkorting") or rij.get("ActorFractie") or "onbekend"


def tel_stemmen(rijen: list) -> dict:
    """Telt stemmen per stem en fractie. Geeft stemmen, vergissingen en kengetallen."""
    stemmen = {s: {} for s in STEMSOORTEN}
    vergissingen = {s: {} for s in STEMSOORTEN}
    verwijderd = zonder_persoon = 0
    for r in rijen:
        if r.get("Verwijderd"):
            verwijderd += 1
            continue
        if not r.get("Persoon_Id"):
            zonder_persoon += 1
            continue
        s, f = r["Soort"], fractie_van(r)
        stemmen.setdefault(s, {})
        stemmen[s][f] = stemmen[s].get(f, 0) + 1
        if r.get("Vergissing"):
            vergissingen.setdefault(s, {})
            vergissingen[s][f] = vergissingen[s].get(f, 0) + 1
    orden = lambda d: dict(sorted(d.items(), key=lambda kv: (-kv[1], kv[0])))  # noqa: E731
    return {
        "stemmen": {s: orden(v) for s, v in stemmen.items()},
        "vergissingen": {s: orden(v) for s, v in vergissingen.items() if v},
        "telling": {s: sum(v.values()) for s, v in stemmen.items()},
        "verwijderd": verwijderd,
        "zonderPersoon": zonder_persoon,
    }


def maak_besluit(besluit: dict, rijen: list) -> dict:
    """Een besluit met de telling, de uitslag uit de bron en de vergelijking."""
    t = tel_stemmen(rijen)
    bron = lees_uitslag(besluit.get("BesluitTekst"))
    voor, tegen = t["telling"].get("Voor", 0), t["telling"].get("Tegen", 0)
    verschillen = []
    if bron is None:
        verschillen.append("geen uitslag in BesluitTekst")
    else:
        if bron["voor"] != voor:
            verschillen.append(f"voor: bron {bron['voor']}, geteld {voor}")
        if bron["tegen"] != tegen:
            verschillen.append(f"tegen: bron {bron['tegen']}, geteld {tegen}")
    activiteit = ((besluit.get("Agendapunt") or {}).get("Activiteit") or {})
    return {
        "datum": (activiteit.get("Datum") or "")[:10],
        "besluitSoort": besluit.get("BesluitSoort"),
        "besluitTekst": besluit.get("BesluitTekst"),
        **t,
        "bron": bron,
        "verschillen": verschillen,
    }


def indieners(actoren: list) -> list:
    """Fracties van indiener en medeindieners, indiener eerst, zonder dubbelen."""
    rang = {"Indiener": 0, "Medeindiener": 1}
    uit = []
    for a in sorted((a for a in actoren if a.get("Relatie") in rang and not a.get("Verwijderd")), key=lambda a: rang[a["Relatie"]]):
        f = (a.get("Fractie") or {}).get("Afkorting") or a.get("ActorFractie")
        if f and f not in uit:
            uit.append(f)
    return uit


def haal_casus(zaaknummer: str, haler=haal) -> dict:
    zaken = haler(url(
        "Zaak",
        filter=f"Nummer eq '{zaaknummer}' and Verwijderd eq false",
        select="Id,Nummer,Soort,Onderwerp",
        expand="Besluit($select=Id,StemmingsSoort,BesluitSoort,BesluitTekst,Verwijderd;"
               "$expand=Agendapunt($select=Id;$expand=Activiteit($select=Datum))),"
               "ZaakActor($select=Relatie,ActorFractie,Verwijderd;$expand=Fractie($select=Afkorting))",
    ))["value"]
    if len(zaken) != 1:
        raise SystemExit(f"{zaaknummer}: {len(zaken)} zaken gevonden, verwacht 1")
    zaak = zaken[0]
    besluiten = [b for b in zaak.get("Besluit", []) if b.get("StemmingsSoort") == "Hoofdelijk" and not b.get("Verwijderd")]
    if not besluiten:
        raise SystemExit(f"{zaaknummer}: geen hoofdelijk besluit")
    uit = []
    for b in besluiten:
        rijen = alle(url(
            "Stemming",
            filter=f"Besluit_Id eq {b['Id']}",
            select="Soort,ActorFractie,Vergissing,Verwijderd,Persoon_Id",
            expand="Fractie($select=Afkorting)",
        ), haler)
        uit.append(maak_besluit(b, rijen))
    uit.sort(key=lambda b: b["datum"])
    return {
        "_bron": f"Tweede Kamer, open data: Besluit met StemmingsSoort 'Hoofdelijk' bij zaak {zaaknummer}, "
                 "stemmen per fractie geteld uit Stemming (alleen personen, zonder Verwijderd; Vergissing telt mee). "
                 "Gemaakt met pipeline/stemming_casus.py.",
        "zaak": zaak["Nummer"],
        "soort": zaak.get("Soort"),
        "onderwerp": zaak.get("Onderwerp"),
        "indieners": indieners(zaak.get("ZaakActor", [])),
        "besluiten": uit,
    }


def samenvatting(casus: dict) -> list:
    """Regels voor de uitvoer: alleen aantallen, geen namen of onderwerp."""
    regels = []
    for i, b in enumerate(casus["besluiten"], 1):
        t = b["telling"]
        verg = sum(n for v in b["vergissingen"].values() for n in v.values())
        bron = f"{b['bron']['voor']}-{b['bron']['tegen']}" if b["bron"] else "geen"
        regels.append(
            f"{casus['zaak']} besluit {i} ({b['datum']}): voor {t.get('Voor', 0)}, tegen {t.get('Tegen', 0)}, "
            f"niet deelgenomen {t.get('Niet deelgenomen', 0)}, vergissing {verg}, verwijderd {b['verwijderd']}; "
            f"bron {bron}: {'gelijk' if not b['verschillen'] else 'VERSCHIL: ' + '; '.join(b['verschillen'])}"
        )
    return regels


def main(argv=None, haler=haal) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("zaken", nargs="+", help="zaaknummers, bijvoorbeeld 2018Z19777")
    p.add_argument("--uitvoer", type=Path, default=UITVOER, help="map voor de JSON-bestanden")
    a = p.parse_args(argv)
    a.uitvoer.mkdir(parents=True, exist_ok=True)
    verschil = False
    for z in a.zaken:
        casus = haal_casus(z, haler)
        (a.uitvoer / f"{z}.json").write_text(json.dumps(casus, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        for regel in samenvatting(casus):
            print(regel)
        verschil |= any(b["verschillen"] for b in casus["besluiten"])
    return 1 if verschil else 0


if __name__ == "__main__":
    sys.exit(main())
