#!/usr/bin/env python3
"""Cijfers voor het Actueel-stuk "akkoord-belastingplan" (11 november 2026).

Aanleiding: D66 en CDA sloten op 11 november 2026 een akkoord met PRO en Volt over één amendement op het
Belastingplan 2027, zonder de VVD. Het stuk heeft vijf blokken; dit script levert de getallen in
web/content/actueel/akkoord-belastingplan.json. De zinnen staan in web/lib/actueel.ts en lezen alles uit dat bestand.

Twee opdrachten:

  cijfers   Blok 2 tot en met 5, uit de publieke Data API van Zetelen. Een bestaande uitslag in het bestand blijft staan.
            2. partners: cohesie per paar onder Jetten (verdeelde stemmingen, GroenLinks-PvdA en PRO als één lijn),
               en hoe vaak PRO, Volt en JA21 meegingen met het eensgezinde kabinet (meegaan() uit actueel.py).
            3. buiten: per kabinet sinds Rutte I hoe vaak één coalitiepartij de andere kant koos dan de eensgezinde
               rest van de coalitie, als aandeel van de verdeelde stemmingen; en de aangenomen amendementen op een
               belastingplan waarbij dat gebeurde (definitie: zie buiten_de_boot()).
            4. kamers: zetels in de Tweede Kamer (api.fractie_periode) en de Eerste Kamer (constante hieronder, met
               bron en datum), en per kabinetspartij de hechtste meerderheid in de Tweede Kamer zonder die partij.
            5. toen: het begrotingsakkoord van 2013 en het Lenteakkoord van 2012, meegaan voor en na.
            Plus het kader voor blok 1: eerdere eindstemmingen over een belastingplan sinds 2010, en of een
            coalitiefractie (of gedoogpartner) daar tegen stemde.

  plannen   Blok "plannen" (verzoek Niels, 13 november 2026): de eindstemming over elk Belastingplan sinds 2008, uit de
            open data van de Tweede Kamer (OData), omdat Zetelen pas bij 2010 begint. Per plan de uitslag in zetels, de
            fracties die tegen stemden en of een coalitiefractie (of gedoogpartner) tegen stemde, volgens api.coalitie
            en api.kabinet. Alleen de stemming over de wet zelf (zaaksoort Wetgeving, titel eindigt op
            "(Belastingplan JJJJ)"), geen amendementen. Schrijft alleen het onderdeel "plannen".

  uitslag   Blok 1: de stemming van 12 november over het amendement en het belastingplan, uit de open data van de
            Tweede Kamer (OData, enkele uren na de stemming) of uit Zetelen (na de nachtelijke verversing). Schrijft
            alleen het onderdeel "uitslag" in het bestaande bestand. Zolang dat ontbreekt, staat het stuk niet op de site.

Regels voor het tellen zijn die van pipeline/actueel.py (stem, kant, meegaan, voorgangers): een fractie die onder een
nieuwe naam doorgaat telt als één lijn; de fractiestem is de stem van de meerderheid van de fractie.

Uitvoer in de terminal: alleen fracties en aantallen, geen namen van Kamerleden.

Verbinding: SUPABASE_URL en SUPABASE_PUBLISHABLE_KEY uit de omgeving (set -a; . web/.env.local; set +a).

Gebruik:
  python3 pipeline/akkoord_belastingplan.py cijfers [--cache /pad/naar/scratchpad/cache]
  python3 pipeline/akkoord_belastingplan.py plannen
  python3 pipeline/akkoord_belastingplan.py uitslag --amendement 2026ZNNNNN --wet 2026Z18819 [--bron odata|zetelen]
"""
import argparse
import json
import re
import subprocess
import sys
import urllib.parse
from datetime import date
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from actueel import OPVOLGERS, STEMKANTEN, UITVOER, alle, api, kant, meegaan, pct, stem, voorgangers  # noqa: E402

SLUG = "akkoord-belastingplan"
KABINET = "Jetten"
VIER = ["D66", "CDA", "PRO", "Volt"]  # het akkoord: twee kabinetspartijen en de indieners van het amendement
BUITEN = "VVD"  # de kabinetspartij die niet bij het akkoord is
MIN_ZETELS = 3  # zoals de ranglijst van de site (pipeline/actueel.py)
TK_TOTAAL, EK_TOTAAL = 150, 75
# Blok 2: per kabinetspartij de partner in de oppositie zoals goedgekeurd (Niels, 11 november 2026); het script rekent
# de cohesie, en schrijft per kabinetspartij ook alle andere oppositiefracties weg, zodat de tekst kan zeggen wie hoger zit
PARTNERS = [("D66", "PRO"), ("CDA", "SGP"), ("VVD", "JA21")]
MEEGAAN = ["PRO", "Volt", "JA21"]
# Belastingplan 2027: de eindstemming hoort niet bij de eerdere eindstemmingen in het kader
WET_2027 = "2026Z18819"
# Precedent in blok 3, nagekeken tegen de OData API van de Tweede Kamer op 11 november 2026: aangenomen 15 november 2018,
# VVD tegen, CDA, ChristenUnie en D66 voor. Het script controleert dat het geval aan de definitie voldoet.
PRECEDENT = ("2018Z21124", "de differentiatie van de OZB-tarieven")

# Eerste Kamer: Zetelen heeft geen stemmingen van de Eerste Kamer, dit is alleen een zetelstand voor een rekensom.
# Bron: eerstekamer.nl/fracties, geraadpleegd 11 november 2026 (de pagina noemt zelf geen peildatum).
EERSTE_KAMER = {
    "bron": "eerstekamer.nl/fracties", "geraadpleegd": "2026-11-11",
    "zetels": {"PRO": 14, "BBB": 11, "VVD": 9, "D66": 7, "CDA": 6, "PVV": 4, "SP": 3, "ChristenUnie": 3, "FVD": 3,
               "PvdD": 2, "JA21": 2, "Volt": 2, "SGP": 2, "50PLUS": 1, "OPNL": 1},
    "eenmansfracties": 5,
}

# Blok 5: twee eerdere akkoorden, met de bron van de datum
TOEN = {
    # Begrotingsakkoord 2014 van VVD en PvdA met D66, ChristenUnie en SGP, 11 oktober 2013 (Kamerstuk 33750, nr. 36)
    "2013": {"kabinet": "Rutte II", "ref": ["VVD", "PvdA"], "akkoord": "2013-10-11", "tot": "2014-10-10",
             "partners": ["D66", "ChristenUnie", "SGP"], "anderen": ["CDA", "GL", "SP", "PVV"]},
    # Lenteakkoord van VVD en CDA met D66, GroenLinks en ChristenUnie, 26 april 2012, na het einde van de gedoogsteun
    # van de PVV (api.coalitie: tot 21 april 2012; parlement.com, Kabinetscrisis 2012)
    "2012": {"kabinet": "Rutte I", "ref": ["VVD", "CDA"], "akkoord": "2012-04-26", "partij": "PVV",
             "partners": ["D66", "GroenLinks", "ChristenUnie"]},
}


# ---------- lezen ----------

def lees_kabinet(naam: str, cache: Path | None) -> dict:
    """Fracties en besluiten (één rij per besluit, met de dossiertitels erbij) van een kabinet."""
    pad = cache / f"akkoord-{naam}.json" if cache else None
    if pad and pad.exists():
        return json.loads(pad.read_text(encoding="utf-8"))
    q = urllib.parse.quote(naam)
    fr = alle(f"fractie_periode?periodesoort=eq.kabinet&periode=eq.{q}&select=fractie,afkorting,zetels,in_zaal", "fractie")
    rijen = alle(f"stemming_dossier?kabinet=eq.{q}&select=besluit,datum,zaak_nummer,zaak_soort,onderwerp,uitslag,"
                 "verdeeld,stemmen,dossier_titel", "besluit,dossier")
    besluiten = {}
    for r in rijen:  # een besluit staat er per dossier
        b = besluiten.setdefault(r["besluit"], {**{k: v for k, v in r.items() if k != "dossier_titel"}, "titels": []})
        if r["dossier_titel"]:
            b["titels"].append(r["dossier_titel"])
    uit = {"fracties": fr, "besluiten": list(besluiten.values())}
    if pad:
        pad.parent.mkdir(parents=True, exist_ok=True)
        pad.write_text(json.dumps(uit, ensure_ascii=False), encoding="utf-8")
    return uit


# ---------- rekenen (zonder netwerk, getest in pipeline/tests/test_akkoord_belastingplan.py) ----------

def winnaar(uitslag: str | None) -> str | None:
    """De kant die won volgens de uitslagtekst: Voor bij aangenomen, Tegen bij verworpen of niet aangenomen."""
    u = (uitslag or "").lower()
    if "niet aangenomen" in u or "verworpen" in u:
        return "Tegen"
    if "aangenomen" in u:
        return "Voor"
    return None


def ids_van(fracties: list, terug: dict, alleen_zaal: bool = False) -> dict:
    """Afkorting naar id-lijst (het eigen id en de ids van eerdere namen)."""
    return {r["afkorting"]: [r["fractie"]] + terug.get(r["fractie"], []) for r in fracties if r["in_zaal"] or not alleen_zaal}


def cohesie(besluiten: list, a: list, b: list) -> dict:
    """Cohesie van een paar op verdeelde stemmingen waarop beide Voor of Tegen stemden, zoals api.cohesie."""
    gez = gelijk = 0
    for x in besluiten:
        if not x["verdeeld"]:
            continue
        sa, sb = stem(x["stemmen"], a), stem(x["stemmen"], b)
        if sa in STEMKANTEN and sb in STEMKANTEN:
            gez += 1
            gelijk += sa == sb
    return {"cohesie": pct(gelijk, gez), "gezamenlijk": gez, "gelijk": gelijk}


def coalitie_op(coalitie: list, kabinet: str, datum: str) -> list:
    """Afkortingen van de coalitie (kabinet en gedoogsteun) op een datum, volgens api.coalitie."""
    return [r["afkorting"] for r in coalitie if r["kabinet"] == kabinet and r["rol"] in ("kabinet", "gedoogsteun")
            and (r["van"] is None or datum >= r["van"]) and (r["tot"] is None or datum < r["tot"])]


def buiten_de_boot(besluiten: list, ids: dict, leden_op, filt=lambda b: True) -> dict:
    """Twee tegen één (definitie van akkoord-7, 11 november 2026): op een verdeelde stemming waarop minstens drie
    coalitiepartijen in functie waren, stemden alle andere coalitiepartijen dezelfde kant en koos partij X de andere
    kant. Een partij die niet stemde telt niet als buiten de boot en maakt de rest niet eensgezind.
    Uit: het aantal meegetelde verdeelde stemmingen, en per partij de basis (verdeelde stemmingen waarop ze in de
    coalitie zat), het aantal keer buiten de boot, en hoe vaak de kant zonder haar won."""
    totaal, per, gevallen = 0, {}, []
    for b in besluiten:
        if not b["verdeeld"] or not filt(b):
            continue
        leden = leden_op(b["datum"])
        if len(leden) < 3:
            continue
        totaal += 1
        s = {a: stem(b["stemmen"], ids[a]) for a in leden}
        for x in leden:
            p = per.setdefault(x, {"basis": 0, "keer": 0, "won": 0})
            p["basis"] += 1
            rest = {s[a] for a in leden if a != x}
            if len(rest) == 1 and None not in rest and s[x] in STEMKANTEN and s[x] not in rest:
                k = rest.pop()
                p["keer"] += 1
                p["won"] += winnaar(b["uitslag"]) == k
                gevallen.append({"besluit": b["besluit"], "zaak": b["zaak_nummer"], "soort": b["zaak_soort"], "datum": b["datum"],
                                 "buiten": x, "rest": sorted(a for a in leden if a != x), "kantRest": k, "uitslag": b["uitslag"]})
    return {"verdeeld": totaal, "per": per, "gevallen": gevallen}


def is_belastingplan(b: dict) -> bool:
    return any("belastingplan" in t.lower() for t in b["titels"])


def eindstemmingen(besluiten_per_kabinet: dict, ids_per_kabinet: dict, coalitie: list, uitsluiten: set) -> list:
    """Eindstemmingen over een wetsvoorstel met Belastingplan in de dossiertitel (zaak_soort Wetgeving), met de
    coalitiefracties (en gedoogpartner) die tegen stemden."""
    uit = []
    for kab, besluiten in besluiten_per_kabinet.items():
        for b in besluiten:
            if b["zaak_soort"] != "Wetgeving" or not is_belastingplan(b) or b["zaak_nummer"] in uitsluiten:
                continue
            leden = coalitie_op(coalitie, kab, b["datum"])
            tegen = sorted(a for a in leden if a in ids_per_kabinet[kab] and stem(b["stemmen"], ids_per_kabinet[kab][a]) == "Tegen")
            uit.append({"zaak": b["zaak_nummer"], "datum": b["datum"], "kabinet": kab, "uitslag": b["uitslag"], "coalitieTegen": tegen})
    return sorted(uit, key=lambda x: (x["datum"], x["zaak"] or ""))


def maat(besluiten: list, groep: list) -> dict:
    """Hoe vaak een groep eensgezind stemde, op verdeelde stemmingen waarop alle fracties uit de groep stemden."""
    gestemd = [b for b in besluiten if b["verdeeld"] and all(stem(b["stemmen"], i) in STEMKANTEN for i in groep)]
    eens = sum(1 for b in gestemd if kant(b["stemmen"], groep))
    return {"gestemd": len(gestemd), "eensgezind": eens, "pct": pct(eens, len(gestemd))}


def hechtste_meerderheid(besluiten: list, ids: dict, zetels: dict, start: list, zonder: str, meerderheid: int) -> dict:
    """Alle minimale meerderheden in de Tweede Kamer die de startfracties bevatten en de fractie 'zonder' niet: minstens
    'meerderheid' zetels, en geen fractie buiten de start die gemist kan worden. Daarvan de hechtste (hoogste aandeel
    eensgezind; bij gelijke stand de meeste eensgezinde stemmingen, dan alfabetisch)."""
    rest = sorted(a for a in ids if a not in start and a != zonder)
    beste, n = None, 0
    for k in range(1, len(rest) + 1):
        for extra in combinations(rest, k):
            tk = sum(zetels[a] for a in start + list(extra))
            if tk < meerderheid or any(tk - zetels[a] >= meerderheid for a in extra):
                continue
            n += 1
            m = maat(besluiten, [ids[a] for a in start + list(extra)])
            sleutel = (-(m["pct"] or 0), -m["eensgezind"], list(extra))
            if beste is None or sleutel < beste[0]:
                beste = (sleutel, list(extra), m, tk)
    _, extra, m, tk = beste
    return {"zonder": zonder, "start": start, "extra": extra, "tk": tk, "combinaties": n, **m}


def meegaan_venster(besluiten: list, ref: list, fracties: dict, van: str, tot: str) -> dict:
    """meegaan() uit actueel.py, beperkt tot stemmingen van van tot en met tot."""
    sel = [b for b in besluiten if van <= b["datum"] <= tot]
    m = meegaan(sel, ref, fracties, [ref[0]])
    return {"van": van, "tot": tot, "basis": m["basis"], "fracties": m["fracties"]}


def ek_som(fracties: list) -> int:
    return sum(EERSTE_KAMER["zetels"].get(a, 0) for a in fracties)


# ---------- opdracht cijfers ----------

def cijfers(cache: Path | None) -> dict:
    terug = voorgangers(json.loads(OPVOLGERS.read_text(encoding="utf-8")))
    coalitie = alle("coalitie?select=kabinet,afkorting,rol,van,tot", "kabinet,afkorting")
    kabinetten = sorted(alle("kabinet?select=naam,begin,einde", "naam"), key=lambda k: k["begin"])
    data = {k["naam"]: lees_kabinet(k["naam"], cache) for k in kabinetten}
    ids_alle = {k: ids_van(d["fracties"], terug) for k, d in data.items()}

    # Jetten: de zaal (GroenLinks-PvdA staat er nog in, niet in de zaal, en telt als PRO)
    J = data[KABINET]
    ids = ids_van(J["fracties"], terug, alleen_zaal=True)
    zetels = {r["afkorting"]: r["zetels"] for r in J["fracties"] if r["in_zaal"]}
    assert sum(zetels.values()) == TK_TOTAAL, sum(zetels.values())
    B = J["besluiten"]
    kab = sorted(coalitie_op(coalitie, KABINET, max(b["datum"] for b in B)), key=lambda a: -zetels[a])  # D66, VVD, CDA
    stand = max(b["datum"] for b in B)

    # Blok 2: partners
    oppositie = [a for a in ids if a not in kab and zetels[a] >= MIN_ZETELS]
    per_partij = {c: sorted(({"afkorting": o, **cohesie(B, ids[c], ids[o])} for o in oppositie), key=lambda x: -x["cohesie"]) for c in kab}
    binnen = sorted(({"a": a, "b": b, **cohesie(B, ids[a], ids[b])} for a, b in combinations(kab, 2)), key=lambda x: x["cohesie"])
    paren = [{"kabinetspartij": c, "partner": o, **next(x for x in per_partij[c] if x["afkorting"] == o)} for c, o in PARTNERS]
    mee = meegaan(B, [ids[a] for a in kab], {a: ids[a] for a in MEEGAAN}, [ids[MEEGAAN[0]]])
    partners = {"paren": paren, "perKabinetspartij": per_partij, "binnen": binnen,
                "meegaan": {"basis": mee["basis"], "fracties": mee["fracties"]}, "minZetels": MIN_ZETELS}

    # Blok 3: twee tegen één, per kabinet dat helemaal in de data valt (vanaf Rutte I)
    buiten = []
    precedent = None
    gevallen_bp = []
    for k in kabinetten:
        if k["begin"] < "2010-01-01":
            continue
        n = k["naam"]
        leden_op = lambda d, n=n: [a for a in coalitie_op(coalitie, n, d) if a in ids_alle[n]]  # noqa: E731
        r = buiten_de_boot(data[n]["besluiten"], ids_alle[n], leden_op)
        if r["verdeeld"] == 0:
            continue  # twee partijen zonder gedoogpartner: twee tegen één kan niet
        rollen = {c["afkorting"]: c["rol"] for c in coalitie if c["kabinet"] == n}
        eind = max((c["tot"] for c in coalitie if c["kabinet"] == n and c["tot"]), default=None)
        datums = [b["datum"] for b in data[n]["besluiten"] if b["verdeeld"] and len(leden_op(b["datum"])) >= 3]
        buiten.append({"kabinet": n, "van": min(datums), "tot": max(datums), "verdeeld": r["verdeeld"],
                       "keer": sum(p["keer"] for p in r["per"].values()),
                       "pct": pct(sum(p["keer"] for p in r["per"].values()), r["verdeeld"]),
                       "partijen": [{"afkorting": a, "rol": rollen[a], **p, "pct": pct(p["keer"], p["basis"])}
                                    for a, p in sorted(r["per"].items(), key=lambda kv: -kv[1]["keer"])],
                       "gedoog": any(v == "gedoogsteun" for v in rollen.values()), "eindeLaatstePartij": eind})
        for g in r["gevallen"]:
            b = next(x for x in data[n]["besluiten"] if x["besluit"] == g["besluit"])
            if g["soort"] == "Amendement" and is_belastingplan(b) and g["kantRest"] == "Voor" and winnaar(g["uitslag"]) == "Voor":
                gevallen_bp.append({**{k_: g[k_] for k_ in ("zaak", "datum", "buiten", "rest")}, "kabinet": n})
                if g["zaak"] == PRECEDENT[0]:
                    precedent = {**gevallen_bp[-1], "onderwerp": PRECEDENT[1], "uitslag": g["uitslag"]}
    if precedent is None:
        sys.exit(f"Precedent {PRECEDENT[0]} voldoet niet aan de definitie; controleer")
    gevallen_bp.sort(key=lambda x: (x["datum"], x["zaak"]))

    # Kader blok 1: eerdere eindstemmingen over een belastingplan
    eind = eindstemmingen({k: d["besluiten"] for k, d in data.items()}, ids_alle, coalitie, {WET_2027})

    # Blok 4: zetels en de hechtste meerderheid zonder elk van de drie kabinetspartijen
    meerderheid = TK_TOTAAL // 2 + 1
    ek_meerderheid = EK_TOTAAL // 2 + 1
    assert sum(EERSTE_KAMER["zetels"].values()) + EERSTE_KAMER["eenmansfracties"] == EK_TOTAAL
    kab_maat = maat(B, [ids[a] for a in kab])
    routes = []
    for zonder in kab:
        start = [a for a in kab if a != zonder]
        h = hechtste_meerderheid(B, ids, zetels, start, zonder, meerderheid)
        routes.append({**h, "ek": ek_som(start + h["extra"])})
    vier_maat = maat(B, [ids[a] for a in VIER])
    kamers = {
        "tk": {"meerderheid": meerderheid, "zetels": zetels},
        "ek": {**EERSTE_KAMER, "meerderheid": ek_meerderheid, "totaal": EK_TOTAAL},
        "vier": VIER, "buiten": BUITEN,
        "kabinet": {"fracties": kab, "tk": sum(zetels[a] for a in kab), "ek": ek_som(kab), **kab_maat},
        "vierMaat": vier_maat,
        "routes": routes,
    }

    # Blok 5: toen en nu
    t13, t12 = TOEN["2013"], TOEN["2012"]
    R2 = data[t13["kabinet"]]
    ids2 = ids_alle[t13["kabinet"]]
    begin2 = next(k["begin"] for k in kabinetten if k["naam"] == t13["kabinet"])
    dag_voor = (date.fromisoformat(t13["akkoord"]).toordinal() - 1)
    fr13 = {a: ids2[a] for a in t13["partners"] + t13["anderen"]}
    voor13 = meegaan_venster(R2["besluiten"], [ids2[a] for a in t13["ref"]], fr13, begin2, date.fromordinal(dag_voor).isoformat())
    na13 = meegaan_venster(R2["besluiten"], [ids2[a] for a in t13["ref"]], fr13, t13["akkoord"], t13["tot"])
    R1 = data[t12["kabinet"]]
    ids1 = ids_alle[t12["kabinet"]]
    k1 = next(k for k in kabinetten if k["naam"] == t12["kabinet"])
    einde_gedoog = next(c["tot"] for c in coalitie if c["kabinet"] == t12["kabinet"] and c["afkorting"] == t12["partij"])
    laatste_voor = date.fromordinal(date.fromisoformat(einde_gedoog).toordinal() - 1).isoformat()
    voor12 = meegaan_venster(R1["besluiten"], [ids1[a] for a in t12["ref"]], {t12["partij"]: ids1[t12["partij"]]}, k1["begin"], laatste_voor)
    na12 = meegaan_venster(R1["besluiten"], [ids1[a] for a in t12["ref"]], {t12["partij"]: ids1[t12["partij"]]}, t12["akkoord"], k1["einde"])
    toen = {
        "2013": {**t13, "voor": voor13, "na": na13},
        "2012": {**t12, "eindeGedoog": einde_gedoog, "voor": voor12, "na": na12},
        "nu": {"kabinet": KABINET, "ref": kab, "fracties": [f for f in mee["fracties"] if f["afkorting"] in ("PRO", "Volt")], "basis": mee["basis"]},
    }

    return {
        "slug": SLUG, "soort": "akkoord", "kabinet": KABINET, "groep": VIER, "tegen": kab,
        "stand": stand, "gemaakt": date.today().isoformat(),
        "besluiten": len(B), "verdeeld": sum(1 for b in B if b["verdeeld"]),
        "partners": partners,
        "buiten": {"kabinetten": buiten, "belastingplan": gevallen_bp, "precedent": precedent},
        "kader": {"eindstemmingen": len(eind), "metCoalitieTegen": sum(1 for e in eind if e["coalitieTegen"]),
                  "eerste": eind[0]["datum"], "laatste": eind[-1]["datum"], "lijst": eind},
        "kamers": kamers,
        "toen": toen,
    }


# ---------- opdracht uitslag ----------

def curl_json(url: str) -> dict:
    uit = subprocess.run(["curl", "-sS", "--fail", "--max-time", "120", url], capture_output=True, check=True)
    return json.loads(uit.stdout)


ODATA = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0"


def fractiestemmen(rijen: list) -> dict:
    """Per fractie-id (stem, zetels). Bij handopsteken is er één rij per fractie. Bij een hoofdelijke stemming is er één
    rij per lid: dan telt de kant van de meerderheid van de leden, met de hele fractiegrootte; bij gelijke stand telt de
    fractie niet mee (feitencontrole 13 november 2026: eerder won de laatste rij)."""
    per = {}
    for s in rijen:
        if s["Soort"] in STEMKANTEN and not s.get("Vergissing"):
            per.setdefault(s["Fractie_Id"], []).append(s)
    uit = {}
    for fid, rs in per.items():
        fractierij = [r for r in rs if not r.get("Persoon_Id")]
        if fractierij:
            # Handopsteken: de rij van de fractie telt; rijen van afwijkende leden veranderen de fractiestem niet
            uit[fid] = (fractierij[0]["Soort"], fractierij[0].get("FractieGrootte"))
            continue
        voor = sum(1 for r in rs if r["Soort"] == "Voor")
        tegen = len(rs) - voor
        if voor != tegen:
            uit[fid] = ("Voor" if voor > tegen else "Tegen", rs[0].get("FractieGrootte"))
    return uit


def uit_odata(zaken: list) -> list:
    """Per besluit met een stemming: zaak, soort, datum, uitslag, hoofdelijk, en per fractie-id (stem, zetels)."""
    filt = "Verwijderd eq false and (" + " or ".join(f"Nummer eq '{z}'" for z in zaken) + ")"
    expand = ("Besluit($filter=Verwijderd eq false and StemmingsSoort ne null;$select=BesluitTekst,StemmingsSoort;"
              "$expand=Agendapunt($select=Id;$expand=Activiteit($select=Datum)),"
              "Stemming($filter=Verwijderd eq false;$select=Fractie_Id,Persoon_Id,Soort,FractieGrootte,Vergissing))")
    url = f"{ODATA}/Zaak?" + urllib.parse.urlencode({"$filter": filt, "$select": "Nummer,Soort", "$expand": expand},
                                                     quote_via=urllib.parse.quote)
    uit = []
    while url:
        d = curl_json(url)
        for z in d.get("value", []):
            for b in z["Besluit"]:
                act = (b.get("Agendapunt") or {}).get("Activiteit") or {}
                uit.append({"zaak": z["Nummer"], "soort": z["Soort"], "datum": (act.get("Datum") or "")[:10],
                            "uitslag": b["BesluitTekst"], "hoofdelijk": b["StemmingsSoort"] != "Met handopsteken",
                            "stemmen": fractiestemmen(b["Stemming"])})
        url = d.get("@odata.nextLink")
    return uit


def uit_zetelen(zaken: list) -> list:
    rijen = alle(f"stemming_dossier?zaak_nummer=in.({','.join(zaken)})&select=besluit,datum,zaak_nummer,zaak_soort,uitslag,stemmen", "besluit,dossier")
    besluiten = {r["besluit"]: r for r in rijen}.values()
    return [{"zaak": r["zaak_nummer"], "soort": r["zaak_soort"], "datum": r["datum"], "uitslag": r["uitslag"], "hoofdelijk": None,
             "stemmen": {k: (v, None) for k, v in r["stemmen"].items() if v in STEMKANTEN}} for r in besluiten]


def stemming(b: dict, rol: str, afk_van_id: dict, zetels: dict, kab: list) -> dict:
    """Een stemming in de vorm van het JSON-bestand. Zetels uit de bron (OData: FractieGrootte), anders uit de zaal."""
    fracties = []
    for fid, (s, grootte) in b["stemmen"].items():
        if fid not in afk_van_id:
            sys.exit(f"Onbekende fractie-id {fid} in de stemming over {b['zaak']}: controleer api.fractie_periode")
        a = afk_van_id[fid]
        fracties.append({"afkorting": a, "stem": s, "zetels": grootte if grootte is not None else zetels[a], "kabinet": a in kab})
    fracties.sort(key=lambda f: (-f["zetels"], f["afkorting"]))
    voor = sum(f["zetels"] for f in fracties if f["stem"] == "Voor")
    tegen = sum(f["zetels"] for f in fracties if f["stem"] == "Tegen")
    # Een telling in de besluittekst (bij een hoofdelijke stemming, bijvoorbeeld "(76-74)") moet kloppen met de som per
    # fractie; anders stemde een fractie verdeeld en noemt de pagina twee verschillende uitslagen
    m = TELLING.search(b["uitslag"] or "")
    if m and (voor, tegen) != (int(m.group(1)), int(m.group(2))):
        sys.exit(f"{b['zaak']}: per fractie {voor}-{tegen}, besluit {m.group(1)}-{m.group(2)}. De telling wijkt af (een fractie stemde verdeeld of er waren leden afwezig): tel per lid na")
    return {"rol": rol, "zaak": b["zaak"], "datum": b["datum"], "uitslag": b["uitslag"], "aangenomen": winnaar(b["uitslag"]) == "Voor",
            "hoofdelijk": b["hoofdelijk"], "voor": voor, "tegen": tegen, "fracties": fracties}


def uitslag(amendement: str, wet: str, bron: str) -> dict:
    terug = voorgangers(json.loads(OPVOLGERS.read_text(encoding="utf-8")))
    fr = alle(f"fractie_periode?periodesoort=eq.kabinet&periode=eq.{KABINET}&select=fractie,afkorting,zetels,in_zaal", "fractie")
    zaal = [r for r in fr if r["in_zaal"]]
    afk_van_id = {i: r["afkorting"] for r in zaal for i in [r["fractie"]] + terug.get(r["fractie"], [])}
    zetels = {r["afkorting"]: r["zetels"] for r in zaal}
    coalitie = alle("coalitie?select=kabinet,afkorting,rol,van,tot", "kabinet,afkorting")
    besluiten = (uit_odata if bron == "odata" else uit_zetelen)([amendement, wet])
    uit = []
    for zaak, rol in [(amendement, "amendement"), (wet, "wet")]:
        bs = [b for b in besluiten if b["zaak"] == zaak]
        if not bs:
            sys.exit(f"Nog geen stemming over {zaak} in de bron ({bron}). Probeer later opnieuw.")
        if len(bs) > 1:
            sys.exit(f"Meer dan één stemming over {zaak} (bijvoorbeeld een herstemming): kies met de hand")
        kab = coalitie_op(coalitie, KABINET, bs[0]["datum"])
        uit.append(stemming(bs[0], rol, afk_van_id, zetels, kab))
    return {"bron": "open data van de Tweede Kamer (OData)" if bron == "odata" else "Zetelen (api.stemming_dossier)",
            "opgehaald": date.today().isoformat(), "stemmingen": uit}


# ---------- opdracht plannen ----------

# Fractienamen in de OData die anders heten in api.coalitie
ODATA_NAAM = {"NSC": "Nieuw Sociaal Contract"}
PLAN_TITEL = re.compile(r"\(Belastingplan (20\d\d)\)\s*$")
TELLING = re.compile(r"\((\d+)-(\d+)\)")


def odata_plannen() -> list:
    """Alle besluiten met een stemming over een wetsvoorstel Belastingplan, met de stemmen per fractie (of per lid)."""
    filt = ("Verwijderd eq false and StemmingsSoort ne null and "
            "Zaak/any(z:z/Soort eq 'Wetgeving' and contains(z/Titel,'(Belastingplan 20'))")
    expand = ("Zaak($select=Nummer,Titel,Soort),Agendapunt($select=Id;$expand=Activiteit($select=Datum)),"
              "Stemming($filter=Verwijderd eq false;$select=Soort,ActorFractie,FractieGrootte,Fractie_Id,Persoon_Id)")
    url = f"{ODATA}/Besluit?" + urllib.parse.urlencode({"$filter": filt, "$select": "Id,BesluitSoort,BesluitTekst,StemmingsSoort",
                                                       "$expand": expand}, quote_via=urllib.parse.quote)
    uit = []
    while url:
        d = curl_json(url)
        uit.extend(d.get("value", []))
        url = d.get("@odata.nextLink")
    return uit


def kabinet_op(kabinetten: list, datum: str) -> str:
    for k in kabinetten:
        if k["begin"] <= datum and (k["einde"] is None or datum < k["einde"]):
            return k["naam"]
    raise ValueError(f"Geen kabinet op {datum}")


def plan_van(b: dict, kabinetten: list, coalitie: list) -> dict | None:
    """Eén eindstemming over een Belastingplan in de vorm van het JSON-bestand; None voor een besluit zonder stemming."""
    if b.get("StemmingsSoort") in (None, "Zonder stemming") or not str(b.get("BesluitSoort", "")).startswith("Stemmen"):
        return None
    zaken = [z for z in b["Zaak"] if z["Soort"] == "Wetgeving" and PLAN_TITEL.search(z["Titel"] or "")]
    if len(zaken) != 1:
        return None
    z = zaken[0]
    datum = (((b.get("Agendapunt") or {}).get("Activiteit") or {}).get("Datum") or "")[:10]
    kab = kabinet_op(kabinetten, datum)
    leden = coalitie_op(coalitie, kab, datum)
    hoofdelijk = b["StemmingsSoort"] != "Met handopsteken"
    stemmen = [s for s in b["Stemming"] if s["Soort"] in STEMKANTEN]
    plan = {"plan": PLAN_TITEL.search(z["Titel"]).group(1), "zaak": z["Nummer"], "datum": datum, "kabinet": kab,
            "coalitie": leden, "uitslag": b["BesluitTekst"], "aangenomen": winnaar(b["BesluitTekst"]) == "Voor",
            "hoofdelijk": hoofdelijk}
    if hoofdelijk or not stemmen:
        # Stemmen per lid: zonder telling per fractie. De uitslag komt dan uit de besluittekst, bijvoorbeeld "(76-74)".
        m = TELLING.search(b["BesluitTekst"] or "")
        if not m:
            raise ValueError(f"Geen telling in de besluittekst van {z['Nummer']}: {b['BesluitTekst']!r}")
        return {**plan, "voor": int(m.group(1)), "tegen": int(m.group(2)), "tegenFracties": None, "coalitieTegen": None}
    if any(s["Persoon_Id"] for s in stemmen):
        raise ValueError(f"Stemming per lid bij handopsteken in {z['Nummer']}: kijk met de hand")
    naam = lambda s: ODATA_NAAM.get(s["ActorFractie"], s["ActorFractie"])  # noqa: E731
    gevonden = {naam(s) for s in stemmen}
    mist = [a for a in leden if a not in gevonden]
    if mist:
        raise ValueError(f"Coalitiefractie {mist} niet gevonden in de stemming over {z['Nummer']}")
    tegen = sorted((s for s in stemmen if s["Soort"] == "Tegen"), key=lambda s: (-s["FractieGrootte"], s["ActorFractie"]))
    return {**plan, "voor": sum(s["FractieGrootte"] for s in stemmen if s["Soort"] == "Voor"),
            "tegen": sum(s["FractieGrootte"] for s in tegen),
            "tegenFracties": [{"fractie": s["ActorFractie"], "zetels": s["FractieGrootte"]} for s in tegen],
            "coalitieTegen": sorted(a for a in leden if a in {naam(s) for s in tegen})}


def plannen() -> dict:
    kabinetten = alle("kabinet?select=naam,begin,einde", "begin")
    coalitie = alle("coalitie?select=kabinet,afkorting,rol,van,tot", "kabinet,afkorting")
    rijen = [p for p in (plan_van(b, kabinetten, coalitie) for b in odata_plannen()) if p]
    per_plan = {}
    for p in rijen:
        if p["plan"] in per_plan:
            sys.exit(f"Twee eindstemmingen over Belastingplan {p['plan']}: kies met de hand")
        per_plan[p["plan"]] = p
    lijst = sorted(per_plan.values(), key=lambda p: p["plan"])
    jaren = [int(p["plan"]) for p in lijst]
    if jaren != list(range(jaren[0], jaren[-1] + 1)):
        sys.exit(f"Niet elk jaar een Belastingplan: {jaren}")
    return {"bron": "open data van de Tweede Kamer (OData)", "opgehaald": date.today().isoformat(), "lijst": lijst}


# ---------- hoofdprogramma ----------

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="opdracht", required=True)
    c = sub.add_parser("cijfers")
    c.add_argument("--cache", type=Path, default=None, help="map om de opgehaalde stemmingen te bewaren (buiten de repo)")
    pl = sub.add_parser("plannen")
    u = sub.add_parser("uitslag")
    u.add_argument("--amendement", required=True)
    u.add_argument("--wet", default=WET_2027)
    u.add_argument("--bron", choices=("odata", "zetelen"), default="odata")
    for p in (c, pl, u):
        p.add_argument("--uitvoer", type=Path, default=UITVOER)
    a = ap.parse_args(argv)
    pad = a.uitvoer / f"{SLUG}.json"
    oud = json.loads(pad.read_text(encoding="utf-8")) if pad.exists() else {}

    if a.opdracht == "cijfers":
        uit = cijfers(a.cache)
        uit["uitslag"] = oud.get("uitslag")
        uit["plannen"] = oud.get("plannen")
    elif a.opdracht == "plannen":
        if not oud:
            sys.exit(f"{pad} bestaat nog niet: draai eerst 'cijfers'")
        uit = {**oud, "plannen": plannen()}
    else:
        if not oud:
            sys.exit(f"{pad} bestaat nog niet: draai eerst 'cijfers'")
        uit = {**oud, "uitslag": uitslag(a.amendement, a.wet, a.bron)}
    a.uitvoer.mkdir(parents=True, exist_ok=True)
    pad.write_text(json.dumps(uit, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    if a.opdracht == "cijfers":
        print(f"{uit['besluiten']} besluiten, {uit['verdeeld']} verdeeld, stand {uit['stand']}")
        for p in uit["partners"]["paren"]:
            print(f"  {p['kabinetspartij']}-{p['partner']}: {p['cohesie']} ({p['gezamenlijk']})")
        for p in uit["partners"]["binnen"]:
            print(f"  binnen {p['a']}-{p['b']}: {p['cohesie']} ({p['gezamenlijk']})")
        for f in uit["partners"]["meegaan"]["fracties"]:
            print(f"  mee met kabinet {f['afkorting']}: {f['mee']} van {f['gestemd']} ({f['pct']})")
        for k in uit["buiten"]["kabinetten"]:
            print(f"  {k['kabinet']} {k['van']} tot {k['tot']}: {k['keer']} van {k['verdeeld']} ({k['pct']}) | "
                  + ", ".join(f"{p['afkorting']} {p['keer']}/{p['basis']} ({p['pct']})" for p in k["partijen"]))
        print(f"  amendementen belastingplan tegen één coalitiepartij in: {len(uit['buiten']['belastingplan'])}")
        for g in uit["buiten"]["belastingplan"]:
            print(f"    {g['datum']} {g['zaak']} {g['kabinet']} zonder {g['buiten']}")
        kd = uit["kader"]
        print(f"  eindstemmingen belastingplan: {kd['eindstemmingen']} ({kd['eerste']} tot {kd['laatste']}), met coalitie tegen {kd['metCoalitieTegen']}")
        km = uit["kamers"]
        print(f"  kabinet eensgezind {km['kabinet']['eensgezind']} van {km['kabinet']['gestemd']} ({km['kabinet']['pct']}), vier {km['vierMaat']['pct']}")
        for r in km["routes"]:
            print(f"  zonder {r['zonder']}: {'+'.join(r['start'] + r['extra'])} TK {r['tk']} EK {r['ek']}: "
                  f"{r['eensgezind']} van {r['gestemd']} ({r['pct']}), {r['combinaties']} combinaties")
        for j in ("2013", "2012"):
            t = uit["toen"][j]
            for f in t["voor"]["fracties"]:
                n = next(x for x in t["na"]["fracties"] if x["afkorting"] == f["afkorting"])
                print(f"  {j} {f['afkorting']}: {f['pct']} -> {n['pct']}")
    elif a.opdracht == "plannen":
        for p in uit["plannen"]["lijst"]:
            tegen = "per lid, nog niet per fractie" if p["tegenFracties"] is None else ", ".join(f["fractie"] for f in p["tegenFracties"])
            print(f"  {p['plan']} {p['datum']} {p['kabinet']:14} {p['voor']}-{p['tegen']} coalitie tegen: {p['coalitieTegen']} | tegen: {tegen}")
    else:
        for s in uit["uitslag"]["stemmingen"]:
            print(f"{s['rol']} {s['zaak']} {s['datum']}: {s['uitslag']} {s['voor']} voor, {s['tegen']} tegen"
                  + (" (hoofdelijk: tel per lid na)" if s["hoofdelijk"] else ""))
            for f in s["fracties"]:
                print(f"  {f['stem']:5} {f['afkorting']:20} {f['zetels']:>3}{' kabinet' if f['kabinet'] else ''}")
    print(f"Geschreven: {pad}")


if __name__ == "__main__":
    main()
