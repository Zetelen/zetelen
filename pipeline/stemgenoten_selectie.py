#!/usr/bin/env python3
"""Selectie van stemmingen voor Stemgenoten (besluit Niels, 26 oktober 2026; onderzoek in
docs/plan/stemwijzer-onderzoek.md).

Leest via de Data API van Zetelen (alleen lezen, met de publieke sleutel) alle verdeelde stemmingen over
wetsvoorstellen en amendementen in de huidige Kamerperiode, en kiest er volgens vaste regels een set uit:

1. Alleen wetsvoorstellen (regering en initiatief) en amendementen, verdeeld gestemd, huidige Kamerperiode.
2. Geen stemming waarin bijna iedereen aan één kant stond: de kleinste kant heeft minstens 15% van de zetels.
3. Hooguit één stemming per dossier, per beleidsterrein hooguit een vast aantal, en minstens 5 wetsvoorstellen.
4. Elke fractie met minstens 5 zetels staat in de set minstens een paar keer aan elke kant (voor en tegen).
5. Begrijpelijk: stemmingen die procedureel of technisch zijn (evaluatietermijnen, procedures zoals een
   voorhang, de dekking van een ander amendement, de eigen begroting van de Kamer, bestuurlijke indeling) staan
   met reden in web/content/stemgenoten/uitgesloten.json en doen niet mee. Die uitsluiting gaat over of een
   bezoeker de vraag kan begrijpen, niet over de uitslag; daarna wordt opnieuw getrokken.
6. Representatief: het script trekt duizenden willekeurige sets die aan 1 tot en met 4 voldoen (met een vaste
   startwaarde, dus elke keer dezelfde uitkomst) en kiest de set waarin de overeenkomst tussen elk paar grote
   fracties het dichtst bij hun overeenkomst over alle verdeelde stemmingen in de periode ligt. Zo stuurt de
   selectie zo min mogelijk. Het gemiddelde verschil staat in de uitvoer en op de site.

Een fractie die verder ging onder een nieuwe naam (GroenLinks-PvdA als PRO) telt als dezelfde fractie.

Schrijft web/content/stemgenoten/kandidaten.json: de gekozen stemmingen plus reserves, met per stemming het
onderwerp (zonder namen van Kamerleden), de titel van het dossier, het beleidsterrein en de stem per fractie.
De stellingen zelf staan apart (web/content/stemgenoten/stellingen.json) en worden met de hand nagekeken.

Uitvoer naar het scherm: alleen aantallen en fractieafkortingen, geen namen.

Gebruik (sleutel en adres uit web/.env.local):
  set -a; . web/.env.local; set +a; python3 pipeline/stemgenoten_selectie.py            # nieuwe set trekken
  set -a; . web/.env.local; set +a; python3 pipeline/stemgenoten_selectie.py --houd     # set houden, alleen uitgesloten vervangen

Met --houd blijft de vorige set staan: een stemming die inmiddels is uitgesloten, wordt vervangen door de
kandidaat die de controle het minst verslechtert, het liefst op hetzelfde beleidsterrein. Zo gooit een
uitsluiting niet de hele set om.
"""
import argparse
import json
import os
import random
import re
import subprocess
import urllib.parse
from collections import Counter
from pathlib import Path

PERIODE = "2025-"
AANTAL = 25
RESERVE = 15
PER_TERREIN = 4
MIN_KANT = 3  # elke fractie met minstens 5 zetels minstens zo vaak voor en zo vaak tegen
MIN_WETTEN = 5
MIN_EVENWICHT = 0.15
TREKKINGEN = 4000
OPVOLGER = {"GroenLinks-PvdA": "PRO"}  # zelfde fractie onder een nieuwe naam (VOORGANGER in web/lib/verhaal.ts)
UITVOER = Path(__file__).resolve().parents[1] / "web" / "content" / "stemgenoten"


def api(pad: str) -> list:
    basis = os.environ["SUPABASE_URL"].rstrip("/").removesuffix("/rest/v1")
    sleutel = os.environ["SUPABASE_PUBLISHABLE_KEY"]
    uit = subprocess.run(["curl", "-sS", "--fail", f"{basis}/rest/v1/{pad}", "-H", f"apikey: {sleutel}", "-H", "Accept-Profile: api"],
                         capture_output=True, check=True)
    return json.loads(uit.stdout)


def alle(pad: str) -> list:
    rijen, vanaf = [], 0
    while True:
        deel = api(f"{pad}&limit=1000&offset={vanaf}")
        rijen.extend(deel)
        if len(deel) < 1000:
            return rijen
        vanaf += 1000


# Technisch of procedureel (regel 5): dit soort amendementen kan een bezoeker niet als vraag beantwoorden
TECHNISCH = re.compile(r"evaluatie|evalueren|voorhang|dekking|nadere regels|amvb|algemene maatregel|verantwoording|reikwijdte|"
                       r"artikel \d|beslisregel|allocatiefunctie|inwerkingtreding|horizonbepaling|delegatie|grondslag|"
                       r"rapportage|jaarverslag|monitoring|verslaglegging|technische|redactione|verduidelijk|expliciteren|"
                       r"openbaredienstverplichting|uitvoeringstoets|invoeringstoets|onderzoek naar", re.I)

# Namen van Kamerleden uit onderwerpen halen: "Amendement van het lid X c.s. over ..." wordt "Amendement over ..."
NAAM = re.compile(r"\b(van (het lid|de leden) .+?)(?= (over|ter vervanging|tot|houdende|ter)\b)")


def zonder_namen(tekst: str | None) -> str:
    return re.sub(r"\s+", " ", NAAM.sub("", tekst or "")).strip()


def trek(stemmingen: list, rng: random.Random) -> list | None:
    """Eén willekeurige set die aan de regels voor spreiding voldoet (of None): eerst de wetsvoorstellen, dan
    aanvullen met alles."""
    gekozen, dossiers, terreinen = [], set(), Counter()

    def probeer(s):
        if s in gekozen or s["dossier"] in dossiers or terreinen[s["terrein"]] >= PER_TERREIN:
            return False
        gekozen.append(s)
        dossiers.add(s["dossier"])
        terreinen[s["terrein"]] += 1
        return True
    wetten = [s for s in stemmingen if s["soort"] != "Amendement"]
    n = 0
    for s in rng.sample(wetten, len(wetten)):
        if n >= MIN_WETTEN:
            break
        n += probeer(s)
    if n < MIN_WETTEN:
        return None
    for s in rng.sample(stemmingen, len(stemmingen)):
        if len(gekozen) >= AANTAL:
            break
        probeer(s)
    return gekozen if len(gekozen) == AANTAL else None


def verschil(set_: list, alles: list, grote: list) -> float:
    vs = []
    for i, a in enumerate(grote):
        for b in grote[i + 1:]:
            x, y = overeenkomst(set_, a, b), overeenkomst(alles, a, b)
            if x is not None and y is not None:
                vs.append(abs(x - y))
    return sum(vs) / len(vs) if vs else 0


def kies(stemmingen: list, zetels: dict, alles: list) -> tuple[list, list, float]:
    grote = sorted(f for f, z in zetels.items() if z >= 5)
    bruikbaar = [s for s in stemmingen if s["evenwicht"] >= MIN_EVENWICHT]
    rng = random.Random(2026)
    beste, score = None, float("inf")
    for _ in range(TREKKINGEN):
        set_ = trek(bruikbaar, rng)
        if not set_:
            continue
        if any(sum(1 for x in set_ if x["stemmen"].get(f) == kant) < MIN_KANT for f in grote for kant in ("Voor", "Tegen")):
            continue
        v = verschil(set_, alles, grote)
        if v < score:
            beste, score = set_, v
    if beste is None:
        wetten = sum(1 for s in bruikbaar if s["soort"] != "Amendement")
        raise SystemExit(f"Geen set gevonden die aan alle regels voldoet ({len(bruikbaar)} bruikbaar, waarvan {wetten} wetsvoorstellen)")
    dossiers = {s["dossier"] for s in beste}
    reserves = [s for s in sorted(bruikbaar, key=lambda s: s["besluit"]) if s not in beste and s["dossier"] not in dossiers]
    return sorted(beste, key=lambda s: s["datum"]), rng.sample(reserves, min(RESERVE, len(reserves))), score


def houden(vorig: list, stemmingen: list, zetels: dict, alles: list) -> tuple[list, list, float]:
    grote = sorted(f for f, z in zetels.items() if z >= 5)
    geldig = {s["besluit"]: s for s in stemmingen if s["evenwicht"] >= MIN_EVENWICHT}
    gekozen = [geldig[v["besluit"]] for v in vorig if v["besluit"] in geldig]
    weg = [v for v in vorig if v["besluit"] not in geldig]
    for v in weg:
        dossiers = {s["dossier"] for s in gekozen}
        kandidaten = [s for s in geldig.values() if s not in gekozen and s["dossier"] not in dossiers]
        zelfde = [s for s in kandidaten if s["terrein"] == v["terrein"]] or kandidaten
        beste = min(zelfde, key=lambda s: (verschil(gekozen + [s], alles, grote), s["besluit"]))
        print(f"Vervangen: {v['zaak']} door {beste['zaak']} ({beste['terrein']})")
        gekozen.append(beste)
    dossiers = {s["dossier"] for s in gekozen}
    reserves = [s for s in sorted(geldig.values(), key=lambda s: s["besluit"]) if s not in gekozen and s["dossier"] not in dossiers]
    return sorted(gekozen, key=lambda s: s["datum"]), random.Random(2026).sample(reserves, min(RESERVE, len(reserves))), verschil(gekozen, alles, grote)


def overeenkomst(set_: list, a: str, b: str) -> float | None:
    beide = [s for s in set_ if s["stemmen"].get(a) in ("Voor", "Tegen") and s["stemmen"].get(b) in ("Voor", "Tegen")]
    return 100 * sum(1 for s in beide if s["stemmen"][a] == s["stemmen"][b]) / len(beide) if beide else None


def main() -> None:
    fr = api(f"fractie_periode?select=fractie,afkorting,zetels,in_zaal&periodesoort=eq.kamerperiode&periode=eq.{urllib.parse.quote(PERIODE)}")
    id_naar = {f["fractie"]: OPVOLGER.get(f["afkorting"], f["afkorting"]) for f in fr}
    zetels = {}
    for f in fr:
        a = OPVOLGER.get(f["afkorting"], f["afkorting"])
        zetels[a] = max(zetels.get(a, 0), f["zetels"] or 0)
    rijen = alle(f"stemming_dossier?select=besluit,dossier,datum,zaak_nummer,zaak_soort,onderwerp,dossier_titel,beleidsterrein,stemmen"
                 f"&kamerperiode=eq.{urllib.parse.quote(PERIODE)}&verdeeld=is.true&zaak_soort=in.(Amendement,Wetgeving,Initiatiefwetgeving)&order=besluit")
    per_besluit = {}
    for r in rijen:
        if r["besluit"] in per_besluit:
            continue  # een stemming bij meer dossiers: de eerste telt
        stemmen = {id_naar[f]: s for f, s in (r["stemmen"] or {}).items() if f in id_naar}
        voor = sum(zetels[f] for f, s in stemmen.items() if s == "Voor")
        tegen = sum(zetels[f] for f, s in stemmen.items() if s == "Tegen")
        if not voor or not tegen:
            continue
        per_besluit[r["besluit"]] = {
            "besluit": r["besluit"], "datum": r["datum"], "zaak": r["zaak_nummer"], "soort": r["zaak_soort"], "dossier": r["dossier"],
            "terrein": r["beleidsterrein"], "onderwerp": zonder_namen(r["onderwerp"]), "dossier_titel": zonder_namen(r["dossier_titel"]),
            "stemmen": stemmen, "voor": voor, "tegen": tegen, "evenwicht": round(min(voor, tegen) / (voor + tegen), 3),
            "uitslag": "aangenomen" if voor > tegen else "verworpen",
        }
    uitgesloten = {u["besluit"] for u in json.loads((UITVOER / "uitgesloten.json").read_text())} if (UITVOER / "uitgesloten.json").exists() else set()
    stemmingen = list(per_besluit.values())
    alles = stemmingen  # de controle vergelijkt met alle verdeelde stemmingen, ook de uitgesloten
    technisch = [s for s in stemmingen if s["soort"] == "Amendement" and TECHNISCH.search(s["onderwerp"])]
    stemmingen = [s for s in stemmingen if s["besluit"] not in uitgesloten and s not in technisch]
    print(f"Technisch of procedureel volgens de vaste lijst: {len(technisch)}")
    p = argparse.ArgumentParser(); p.add_argument("--houd", action="store_true"); a = p.parse_args()
    vorige = UITVOER / "kandidaten.json"
    if a.houd and vorige.exists():
        gekozen, reserves, gem = houden(json.loads(vorige.read_text())["gekozen"], stemmingen, zetels, alles)
    else:
        gekozen, reserves, gem = kies(stemmingen, zetels, alles)
    print(f"Uitgesloten als technisch of procedureel: {len(uitgesloten)}")
    print(f"{len(stemmingen)} verdeelde stemmingen over wetten en amendementen in {PERIODE}; gekozen {len(gekozen)}, reserve {len(reserves)}")
    print("Per terrein:", dict(Counter(s["terrein"] for s in gekozen)))
    print("Per soort:", dict(Counter(s["soort"] for s in gekozen)), "uitslag:", dict(Counter(s["uitslag"] for s in gekozen)))
    for f in sorted(z for z in zetels if zetels[z] >= 5):
        print(f"  {f}: {sum(1 for s in gekozen if s['stemmen'].get(f) == 'Voor')} voor, {sum(1 for s in gekozen if s['stemmen'].get(f) == 'Tegen')} tegen")
    print(f"Controle: gemiddeld verschil tussen overeenkomst in de set en in alle verdeelde stemmingen: {gem:.1f} procentpunt")
    UITVOER.mkdir(parents=True, exist_ok=True)
    (UITVOER / "kandidaten.json").write_text(json.dumps({"periode": PERIODE, "controle_verschil": round(gem, 1), "aantal_verdeeld": len(alles),
                                                        "fracties": {f: z for f, z in sorted(zetels.items()) if z}, "gekozen": gekozen, "reserve": reserves},
                                                        ensure_ascii=False, indent=1) + "\n")


if __name__ == "__main__":
    main()
