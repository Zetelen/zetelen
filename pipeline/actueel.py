#!/usr/bin/env python3
"""Cijfers voor een stuk onder /actueel (besluit Niels, 30 oktober 2026).

Vergelijkt een groep fracties (bijvoorbeeld een blok dat samen eisen stelt) met een
andere groep (meestal het kabinet) binnen een kabinetsperiode, en schrijft een
JSON-bestand voor de site (web/content/actueel/<slug>.json). Het stuk heeft vier
vaste blokken, en dit script levert voor elk blok de getallen:

1. Hoe hecht is de groep: cohesie tussen alle paren uit api.cohesie (verdeelde
   stemmingen), met de plek van elk paar onder alle paren van fracties met minstens
   MIN_ZETELS zetels.
2. Gaat de groep mee: op verdeelde stemmingen waarop de andere groep eensgezind was,
   hoe vaak elke fractie dezelfde kant koos. Alleen stemmingen waarop die fractie zelf
   stemde tellen mee.
3. Waar wringt het: per thema (trefwoorden in het onderwerp) de verdeelde stemmingen
   waarop beide groepen eensgezind waren, en hoe vaak ze tegenover elkaar stonden.
4. Telt het op: zetels per fractie en de meerderheid.

Daarnaast per thema (en over alles, als vergelijking): hoe vaak de groep en de andere
groep elk eensgezind stemden, en per fractie uit de groep hoe vaak ze meeging met de
eensgezinde andere groep (toegevoegd 30 oktober 2026: bij abortus bleek het blok
geen blok).

Regels voor het tellen:
- Een fractie die onder een nieuwe naam doorgaat (naamswijziging in
  web/content/fractie-opvolgers.json, zoals GroenLinks-PvdA naar PRO) telt als één
  lijn: de stem onder het oude id geldt als de stem van de fractie. Zonder deze regel
  ontbreken bij PRO alle stemmingen van voor juni 2026.
- Een groep is eensgezind als elke fractie erin Voor of Tegen stemde, en allemaal
  hetzelfde. Een fractie die niet stemde maakt de groep niet eensgezind.
- De fractiestem is de stem van de meerderheid van de fractie (zoals in de bron). Een
  fractie die bij een hoofdelijke stemming verdeeld stemde, telt hier als één kant.

Uitvoer in de terminal: alleen aantallen, nooit namen. Het JSON-bestand bevat wel de
onderwerpen van de stemmingen; daar mogen namen van Kamerleden in staan.

Verbinding: de publieke Data API van Supabase via curl (schema api), met
SUPABASE_URL en SUPABASE_PUBLISHABLE_KEY uit de omgeving.

Gebruik:
  set -a; . web/.env.local; set +a
  python3 pipeline/actueel.py blok-kabinet --kabinet Jetten --groep JA21,BBB,SGP --tegen D66,VVD,CDA \\
    --vergelijk PRO,PVV --thema "Stikstof=stikstof|kritische depositie|natura 2000|..." ...
"""
import argparse
import json
import os
import re
import subprocess
import sys
from datetime import date
from itertools import combinations
from pathlib import Path

WORTEL = Path(__file__).resolve().parents[1]
UITVOER = WORTEL / "web" / "content" / "actueel"
OPVOLGERS = WORTEL / "web" / "content" / "fractie-opvolgers.json"
MIN_ZETELS = 3
ZETELS_TOTAAL = 150
STEMKANTEN = ("Voor", "Tegen")


# ---------- lezen ----------

def api(pad: str) -> list:
    basis = os.environ["SUPABASE_URL"].strip().rstrip("/").removesuffix("/rest/v1")
    sleutel = os.environ["SUPABASE_PUBLISHABLE_KEY"].strip()
    uit = subprocess.run(["curl", "-sS", "--fail", f"{basis}/rest/v1/{pad}", "-H", f"apikey: {sleutel}", "-H", "Accept-Profile: api"],
                         capture_output=True, check=True)
    return json.loads(uit.stdout)


def alle(pad: str, volgorde: str, lezer=api) -> list:
    """Alle rijen, per 1000. Zonder vaste volgorde levert de database elke pagina in een andere volgorde, en vallen er
    rijen weg of komen ze dubbel (de eerste versie van de blok-analyse miste zo 732 van de 4.138 besluiten); volgorde is
    daarom verplicht en moet de rij eenduidig vastleggen."""
    rijen, vanaf = [], 0
    while True:
        deel = lezer(f"{pad}&order={volgorde}&limit=1000&offset={vanaf}")
        rijen.extend(deel)
        if len(deel) < 1000:
            return rijen
        vanaf += 1000


# ---------- rekenen (zonder netwerk, getest) ----------

def voorgangers(opvolgers: dict) -> dict:
    """Per id van een fractie de ids van eerdere namen (alleen naamswijzigingen, ook over meer stappen)."""
    terug = {o["naar"]["id"]: [v["id"] for v in o["van"]] for o in opvolgers.get("opvolgers", []) if o["soort"] == "naamswijziging"}
    uit = {}
    for naar in terug:
        rij, open_ = [], list(terug[naar])
        while open_:
            i = open_.pop(0)
            if i not in rij:
                rij.append(i)
                open_ += terug.get(i, [])
        uit[naar] = rij
    return uit


def stem(stemmen: dict, ids: list) -> str | None:
    """De stem van een fractie: onder het huidige id, anders onder een eerdere naam."""
    for i in ids:
        if stemmen.get(i):
            return stemmen[i]
    return None


def kant(stemmen: dict, groep: list) -> str | None:
    """Voor of Tegen als de hele groep die kant koos, anders None. groep is een lijst met id-lijsten."""
    s = [stem(stemmen, ids) for ids in groep]
    return s[0] if s and all(x in STEMKANTEN for x in s) and len(set(s)) == 1 else None


def pct(deel: int, geheel: int) -> float | None:
    return round(100 * deel / geheel, 1) if geheel else None


def hechtheid(cohesie: list, fracties: list, zetels: dict) -> dict:
    """Cohesie tussen de gevraagde fracties en de plek van elk paar onder alle paren met minstens MIN_ZETELS zetels.
    cohesie: rijen uit api.cohesie (variant verdeeld) met fractie_afkorting, andere_fractie_afkorting, cohesie, gezamenlijk."""
    groot = {a for a, z in zetels.items() if z >= MIN_ZETELS}
    paren = {}
    for r in cohesie:
        a, b = r["fractie_afkorting"], r["andere_fractie_afkorting"]
        if a in groot and b in groot and r["cohesie"] is not None:
            paren[frozenset((a, b))] = r
    rang = sorted(paren.items(), key=lambda kv: -kv[1]["cohesie"])
    plek = {k: i + 1 for i, (k, _) in enumerate(rang)}
    uit = []
    for a, b in combinations(fracties, 2):
        r = paren.get(frozenset((a, b)))
        if r:
            uit.append({"a": a, "b": b, "cohesie": round(r["cohesie"], 1), "gezamenlijk": r["gezamenlijk"], "plek": plek[frozenset((a, b))]})
    return {"paren": uit, "parenTotaal": len(rang)}


def meegaan(besluiten: list, ref: list, fracties: dict, groep: list) -> dict:
    """Op verdeelde stemmingen waarop ref eensgezind was: per fractie hoe vaak dezelfde kant (alleen als ze stemde),
    en hoe vaak de groep als geheel eensgezind meeging. fracties: afkorting naar id-lijst."""
    basis = [(b, kant(b["stemmen"], ref)) for b in besluiten if b["verdeeld"]]
    basis = [(b, k) for b, k in basis if k]
    per = []
    for afk, ids in fracties.items():
        gestemd = [(b, k) for b, k in basis if stem(b["stemmen"], ids) in STEMKANTEN]
        mee = sum(1 for b, k in gestemd if stem(b["stemmen"], ids) == k)
        per.append({"afkorting": afk, "gestemd": len(gestemd), "mee": mee, "pct": pct(mee, len(gestemd))})
    eens = [(b, k) for b, k in basis if kant(b["stemmen"], groep)]
    mee_groep = sum(1 for b, k in eens if kant(b["stemmen"], groep) == k)
    return {"basis": len(basis), "fracties": per, "groep": {"eensgezind": len(eens), "mee": mee_groep, "pct": pct(mee_groep, len(eens))}}


def samen(besluiten: list, combinaties: dict) -> list:
    """Per combinatie van fracties: op hoeveel verdeelde stemmingen (waarop ze allemaal stemden) ze allemaal dezelfde kant kozen."""
    uit = []
    for naam, groep in combinaties.items():
        gestemd = [b for b in besluiten if b["verdeeld"] and all(stem(b["stemmen"], ids) in STEMKANTEN for ids in groep)]
        n = sum(1 for b in gestemd if kant(b["stemmen"], groep))
        uit.append({"naam": naam, "gestemd": len(gestemd), "samen": n, "pct": pct(n, len(gestemd))})
    return uit


def botspunten(besluiten: list, themas: dict, groep: list, ref: list) -> dict:
    """Per thema de verdeelde stemmingen met een trefwoord in het onderwerp. Waar beide groepen eensgezind waren:
    stonden ze tegenover elkaar (tegen) of aan dezelfde kant (samen)."""
    def rij(b):
        g, r = kant(b["stemmen"], groep), kant(b["stemmen"], ref)
        stand = "tegen" if g and r and g != r else "samen" if g and r else "verdeeld"
        return {"besluit": b["besluit"], "datum": b["datum"], "zaakNummer": b["zaak_nummer"], "soort": b["zaak_soort"],
                "onderwerp": b["onderwerp"], "uitslag": b["uitslag"], "groep": g, "ref": r, "stand": stand}
    uit = []
    for naam, patroon in themas.items():
        p = re.compile(patroon, re.I)
        sel = sorted((rij(b) for b in besluiten if b["verdeeld"] and p.search(b["onderwerp"] or "")), key=lambda x: (x["datum"], x["besluit"]))
        beide = [x for x in sel if x["stand"] != "verdeeld"]
        uit.append({"thema": naam, "patroon": patroon, "verdeeld": len(sel), "beide": len(beide),
                    "tegenover": sum(1 for x in beide if x["stand"] == "tegen"), "stemmingen": sel})
    alles = [rij(b) for b in besluiten if b["verdeeld"]]
    beide = [x for x in alles if x["stand"] != "verdeeld"]
    t = sum(1 for x in beide if x["stand"] == "tegen")
    return {"themas": uit, "alles": {"beide": len(beide), "tegenover": t, "pct": pct(t, len(beide))}}


def per_thema(besluiten: list, themas: dict, fracties: dict, groep: list, ref: list) -> list:
    """Per thema, en eerst over alle verdeelde stemmingen: hoe vaak groep en ref elk eensgezind waren, en per fractie
    uit de groep hoe vaak ze meeging met de eensgezinde ref (zoals meegaan). fracties: afkorting naar id-lijst."""
    uit = []
    for naam, patroon in {"Alles": None, **themas}.items():
        p = re.compile(patroon, re.I) if patroon else None
        sel = [b for b in besluiten if b["verdeeld"] and (p is None or p.search(b["onderwerp"] or ""))]
        uit.append({"thema": naam, "verdeeld": len(sel),
                    "groepEensgezind": sum(1 for b in sel if kant(b["stemmen"], groep)),
                    "refEensgezind": sum(1 for b in sel if kant(b["stemmen"], ref)),
                    "fracties": meegaan(sel, ref, fracties, groep)["fracties"]})
    return uit


def zetelsom(zetels: dict, groep: list, ref: list) -> dict:
    meerderheid = ZETELS_TOTAAL // 2 + 1
    som = lambda fr: sum(zetels.get(a, 0) for a in fr)  # noqa: E731
    # Alle kleinste deelverzamelingen van de groep die met ref een meerderheid halen (bij gelijke zetels kan dat er meer zijn)
    nodig = []
    for n in range(len(groep) + 1):
        nodig = [list(deel) for deel in combinations(groep, n) if som(ref) + som(deel) >= meerderheid]
        if nodig:
            break
    return {"meerderheid": meerderheid, "zetels": {a: zetels.get(a, 0) for a in ref + groep},
            "ref": som(ref), "groep": som(groep), "samen": som(ref) + som(groep), "kleinsteMeerderheid": nodig}


# ---------- hoofdprogramma ----------

def thema(tekst: str) -> tuple:
    naam, _, patroon = tekst.partition("=")
    if not naam or not patroon:
        raise argparse.ArgumentTypeError("thema als Naam=patroon")
    re.compile(patroon)
    return naam.strip(), patroon.strip()


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("slug")
    ap.add_argument("--kabinet", required=True)
    ap.add_argument("--groep", required=True, help="afkortingen, komma-gescheiden")
    ap.add_argument("--tegen", required=True, help="afkortingen van de andere groep, meestal het kabinet")
    ap.add_argument("--vergelijk", default="", help="extra fracties in blok 2")
    ap.add_argument("--thema", type=thema, action="append", default=[])
    ap.add_argument("--uitvoer", type=Path, default=UITVOER)
    a = ap.parse_args(argv)
    groep, ref = a.groep.split(","), a.tegen.split(",")
    vergelijk = [x for x in a.vergelijk.split(",") if x]

    fr = alle(f"fractie_periode?periodesoort=eq.kabinet&periode=eq.{a.kabinet}&select=fractie,afkorting,zetels,in_zaal", "fractie")
    zaal = {r["afkorting"]: r for r in fr if r["in_zaal"]}
    ontbreekt = [x for x in groep + ref + vergelijk if x not in zaal]
    if ontbreekt:
        sys.exit(f"Niet in de zaal onder {a.kabinet}: {', '.join(ontbreekt)}")
    terug = voorgangers(json.loads(OPVOLGERS.read_text(encoding="utf-8")))
    ids = {x: [zaal[x]["fractie"]] + terug.get(zaal[x]["fractie"], []) for x in zaal}
    zetels = {x: zaal[x]["zetels"] for x in zaal}

    coh = alle(f"cohesie?periodesoort=eq.kabinet&periode=eq.{a.kabinet}&variant=eq.verdeeld"
               "&select=fractie_afkorting,andere_fractie_afkorting,gezamenlijk,cohesie", "fractie,andere_fractie")
    rijen = alle(f"stemming_dossier?kabinet=eq.{a.kabinet}&select=besluit,datum,zaak_nummer,zaak_soort,onderwerp,uitslag,verdeeld,stemmen",
                 "besluit,dossier")
    besluiten = list({r["besluit"]: r for r in rijen}.values())  # een besluit staat er per dossier
    G, R = [ids[x] for x in groep], [ids[x] for x in ref]

    uit = {
        "slug": a.slug, "kabinet": a.kabinet, "groep": groep, "tegen": ref,
        "stand": max(b["datum"] for b in besluiten), "gemaakt": date.today().isoformat(),
        "besluiten": len(besluiten), "verdeeld": sum(1 for b in besluiten if b["verdeeld"]),
        "hechtheid": hechtheid(coh, groep + ref, zetels),
        "meegaan": meegaan(besluiten, R, {x: ids[x] for x in groep + vergelijk}, G),
        "samen": samen(besluiten, {"tegen+groep": R + G, **{f"tegen+{x}": R + [ids[x]] for x in groep + vergelijk}}),
        "botspunten": botspunten(besluiten, dict(a.thema), G, R),
        "perThema": per_thema(besluiten, dict(a.thema), {x: ids[x] for x in groep}, G, R),
        "zetelsom": zetelsom(zetels, groep, ref),
    }
    a.uitvoer.mkdir(parents=True, exist_ok=True)
    pad = a.uitvoer / f"{a.slug}.json"
    pad.write_text(json.dumps(uit, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"{uit['besluiten']} besluiten, {uit['verdeeld']} verdeeld, stand {uit['stand']}")
    for p in uit["hechtheid"]["paren"]:
        print(f"  cohesie {p['a']}-{p['b']}: {p['cohesie']} (plek {p['plek']} van {uit['hechtheid']['parenTotaal']})")
    m = uit["meegaan"]
    print(f"  {'+'.join(ref)} eensgezind op {m['basis']}")
    for f in m["fracties"]:
        print(f"    {f['afkorting']}: mee {f['mee']} van {f['gestemd']} ({f['pct']}%)")
    print(f"    groep eensgezind {m['groep']['eensgezind']}, mee {m['groep']['pct']}%")
    for s in uit["samen"]:
        print(f"  samen {s['naam']}: {s['samen']} van {s['gestemd']} ({s['pct']}%)")
    for t in uit["botspunten"]["themas"]:
        print(f"  {t['thema']}: {t['verdeeld']} verdeeld, beide eensgezind {t['beide']}, tegenover {t['tegenover']}")
    al = uit["botspunten"]["alles"]
    print(f"  alles: beide eensgezind {al['beide']}, tegenover {al['tegenover']} ({al['pct']}%)")
    for t in uit["perThema"]:
        mee_tekst = ", ".join(f"{f['afkorting']} {f['mee']}/{f['gestemd']}" for f in t["fracties"])
        print(f"  {t['thema']}: groep eensgezind {t['groepEensgezind']}, {'+'.join(ref)} eensgezind {t['refEensgezind']} van {t['verdeeld']}; mee {mee_tekst}")
    z = uit["zetelsom"]
    print(f"  zetels {'+'.join(ref)} {z['ref']}, groep {z['groep']}, kleinste meerderheid met {z['kleinsteMeerderheid']}")
    print(f"Geschreven: {pad.relative_to(WORTEL) if pad.is_relative_to(WORTEL) else pad}")


if __name__ == "__main__":
    main()
