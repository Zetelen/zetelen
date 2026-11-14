#!/usr/bin/env python3
"""Cijfers voor het Actueel-stuk "demissionair" (14 november 2026).

Aanleiding: na de stemming over het Belastingplan 2027 op 12 november 2026 is er sprake van een mogelijke
kabinetscrisis. Het stuk kijkt terug: wat gebeurde er in de Kamer met de kabinetspartijen van de zes kabinetten sinds
2010 die demissionair werden? Het script levert de getallen in web/content/actueel/demissionair.json; de zinnen staan
in web/lib/actueel.ts en lezen alles uit dat bestand.

Per kabinet drie periodes, geknipt op twee datums (constante KABINETTEN, met bron per datum):
  missionair  van het begin van de data (19 januari 2010) of van het kabinet tot de dag van demissionair worden
  demVoor     demissionair, met de oude Kamer: tot de installatie van de nieuwe Kamer (de oude Kamer stemt door tot dan)
  demNa       demissionair, met de nieuwe Kamer: tot de beëdiging van het volgende kabinet (api.kabinet)

  na de val   Per periode: hoe vaak de blijvende kabinetspartijen (die op de laatste dag nog in het kabinet zaten)
              eensgezind stemden (maat() uit akkoord_belastingplan.py), de cohesie per paar kabinetspartijen (cohesie(),
              alleen op stemmingen waarop beide die dag in het kabinet zaten),
              en hoe vaak één kabinetspartij alleen stond (buiten_de_boot(), alleen bij minstens drie partijen).
  campagne    (sleutel in het JSON-bestand; op de site heet het blok "oppositie") Missionair tegenover demissionair
              vóór de installatie van de nieuwe Kamer: per paar van een blijvende kabinetspartij en een
              oppositiepartij de verandering in cohesie, met als referentie voor de agenda de mediane verandering van
              alle paren (alle partijen, ook oppositie met oppositie). Ter controle dezelfde verandering op alleen moties.
  jetten      Ter vergelijking, zonder voorspelling: dezelfde maten voor kabinet-Jetten tot de stand van de data.

Regels: die van pipeline/actueel.py (stem, kant, voorgangers): alleen verdeelde stemmingen, de fractiestem is de stem
van de meerderheid van de fractie, een vergissing telt niet (zit al in de view), een naamswijziging telt als één lijn.
Fracties met een persoonsnaam (eenmansfracties en afsplitsingen) laat het stuk weg: alleen partijen uit PARTIJEN tellen.
Een paar telt alleen met minstens MIN_PAAR gezamenlijke verdeelde stemmingen in elke vergeleken periode. Een periode
met minder dan KLEIN verdeelde stemmingen heet klein: de site toont haar, maar gemarkeerd, en laat haar niet beslissen.

Waarom de publieke Data API (api.stemming_dossier, api.coalitie, api.kabinet): dezelfde telling als de andere
Actueel-stukken, na te rekenen zonder toegang tot de database.

Uitvoer in de terminal: alleen fracties en aantallen, geen namen van Kamerleden.

Verbinding: SUPABASE_URL en SUPABASE_PUBLISHABLE_KEY uit de omgeving (set -a; . web/.env.local; set +a).

Gebruik:
  python3 pipeline/demissionair.py [--cache /pad/naar/scratchpad/cache]
"""
import argparse
import json
import statistics
import sys
from datetime import date
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from actueel import OPVOLGERS, UITVOER, alle, voorgangers  # noqa: E402
from akkoord_belastingplan import buiten_de_boot, coalitie_op, cohesie, ids_van, lees_kabinet, maat  # noqa: E402

SLUG = "demissionair"
JETTEN = "Jetten"
PERIODES = ["missionair", "demVoor", "demNa"]
MIN_PAAR = 100  # minimaal aantal gezamenlijke verdeelde stemmingen per paar, in elke vergeleken periode
KLEIN = 300  # een periode met minder verdeelde stemmingen is klein: tonen, markeren, niet laten beslissen


# Partijen die meetellen. Alles wat hier niet in staat, is een fractie met een persoonsnaam (een eenmansfractie of een
# afsplitsing) en blijft buiten de tabellen; het script meldt hoeveel en stopt als een kabinetspartij ontbreekt.
PARTIJEN = {"CDA", "ChristenUnie", "D66", "PvdA", "VVD", "PVV", "SP", "GL", "SGP", "PvdD", "50PLUS", "DENK", "FVD",
            "BIJ1", "BBB", "Volt", "JA21", "Nieuw Sociaal Contract", "GroenLinks-PvdA", "PRO"}

# De datums per kabinet, elk met bron (geraadpleegd 14 november 2026). demissionair: de dag dat het ontslag werd
# aangeboden (eerste dag in de periode demVoor); kamer: de dag van de installatie van de nieuwe Kamer (eerste dag in
# demNa). twijfel: een datum die een andere bron noemt; het script controleert dat er tussen de twee datums geen
# stemming was, zodat de keuze de cijfers niet verandert.
RO = "https://www.rijksoverheid.nl/regering/over-de-regering/kabinetten-sinds-1945/"
KABINETTEN = {
    "Balkenende IV": {
        "demissionair": "2010-02-20", "verkiezing": "2010-06-09", "kamer": "2010-06-17",
        "bron": {"demissionair": RO + "kabinet-balkenende-iv",
                 "demissionair2": "https://www.parlement.com/id/vicvk0yn7izs/nieuws/kabinet_balkenende_iv_gevallen",
                 "verkiezing": "https://www.parlement.com/id/vib7f70ymd9f/tweede_kamerverkiezingen_2010",
                 "kamer": "https://www.parlement.com/id/vib7f70ymd9f/tweede_kamerverkiezingen_2010"},
        # Rijksoverheid: het ontslag van de PvdA-bewindslieden aangeboden op 20 februari, verleend op 23 februari
        "twijfel": [("2010-02-20", "2010-02-23")],
    },
    "Rutte I": {
        "demissionair": "2012-04-23", "verkiezing": "2012-09-12", "kamer": "2012-09-20",
        "bron": {"demissionair": RO + "kabinet-rutte-verhagen",
                 "demissionair2": "https://www.parlement.com/id/vj1ped4lzuz8/kabinetscrisis_2012_de_catshuiscrisis",
                 "verkiezing": "https://parlement.com/tweede-kamerverkiezingen-2012",
                 "kamer": "https://parlement.com/tweede-kamerverkiezingen-2012"},
        # parlement.com: ontslag aangeboden op zaterdagavond 21 april; Rijksoverheid: 23 april
        "twijfel": [("2012-04-21", "2012-04-23")],
    },
    "Rutte II": {
        "demissionair": "2017-03-14", "verkiezing": "2017-03-15", "kamer": "2017-03-23",
        "bron": {"demissionair": "https://www.tweedekamer.nl/debat_en_vergadering/uitgelicht/een-demissionair-kabinet",
                 "demissionair2": "https://www.parlement.com/id/vj47glycfix9/kabinet_rutte_ii_2012_2017",
                 "verkiezing": "https://parlement.com/tweede-kamerverkiezingen-2017",
                 "kamer": "https://parlement.com/tweede-kamerverkiezingen-2017"},
        # tweedekamer.nl: ontslag aangeboden op 14 maart, een dag voor de verkiezingen; de tijdlijn van parlement.com
        # noemt 15 maart. Tussen het ontslag en de installatie stemde de Kamer niet: Rutte II heeft geen periode demVoor.
        "twijfel": [("2017-03-14", "2017-03-16")],
    },
    "Rutte III": {
        "demissionair": "2021-01-15", "verkiezing": "2021-03-17", "kamer": "2021-03-31",
        "bron": {"demissionair": RO + "kabinet-rutte-iii",
                 "verkiezing": "https://parlement.com/tweede-kamerverkiezingen-2021",
                 "kamer": "https://parlement.com/tweede-kamerverkiezingen-2021",
                 "kamer2": "https://www.tweedekamer.nl/debat_en_vergadering/uitgelicht/verkiezingen-2021-volg-het-hier"},
        "twijfel": [],
    },
    "Rutte IV": {
        "demissionair": "2023-07-07", "verkiezing": "2023-11-22", "kamer": "2023-12-06",
        "bron": {"demissionair": RO + "kabinet-rutte-iv",
                 "demissionair2": "https://www.parlement.com/id/vlombyx8gxvd",
                 "verkiezing": "https://parlement.com/tweede-kamerverkiezingen-2023",
                 "kamer": "https://parlement.com/tweede-kamerverkiezingen-2023"},
        "twijfel": [],
    },
    "Schoof": {
        "demissionair": "2025-06-03", "verkiezing": "2025-10-29", "kamer": "2025-11-12",
        "bron": {"demissionair": RO + "kabinet-schoof",
                 "verkiezing": "https://parlement.com/tweede-kamerverkiezingen-2025",
                 "kamer": "https://parlement.com/tweede-kamerverkiezingen-2025"},
        "twijfel": [],
    },
}


# ---------- rekenen (zonder netwerk, getest in pipeline/tests/test_demissionair.py) ----------

def periode_van(datum: str, k: dict) -> str:
    """De periode van een stemming: missionair, demissionair voor de installatie, of erna."""
    return "missionair" if datum < k["demissionair"] else "demVoor" if datum < k["kamer"] else "demNa"


def controleer_datums(k: dict, einde: str):
    """De datums staan in de goede volgorde: demissionair, verkiezing, installatie, volgend kabinet."""
    assert k["demissionair"] <= k["verkiezing"] < k["kamer"] < einde, k


def is_motie(b: dict) -> bool:
    return b["zaak_soort"] == "Motie"


# Precisie in het JSON-bestand: de site rondt één keer af, bij het tonen (feitencontrole 14 november 2026: eerst op één
# decimaal en dan op een heel procent afronden gaf 73 waar 72 hoort)
PRECISIE = 4


def mediaan(lijst: list) -> float | None:
    return round(statistics.median(lijst), PRECISIE) if lijst else None


def ruw(c: dict) -> float | None:
    """De cohesie als ruwe breuk, niet de op één decimaal afgeronde waarde uit cohesie()."""
    return 100 * c["gelijk"] / c["gezamenlijk"] if c["gezamenlijk"] else None


def periode_cijfers(besluiten: list, ids: dict, blijvend: list, groep: list, leden_op) -> dict:
    """Voor de verdeelde stemmingen in één periode: hoe vaak de blijvende kabinetspartijen eensgezind stemden, de
    cohesie per paar uit de groep, en hoe vaak één kabinetspartij alleen stond (op elke datum de coalitie van die
    dag, alleen bij minstens drie partijen)."""
    V = [b for b in besluiten if b["verdeeld"]]
    if not V:
        return None
    bb = buiten_de_boot(V, ids, leden_op)
    alleen = [{"afkorting": a, **p, "pct": round(100 * p["keer"] / p["basis"], 1) if p["basis"] else None}
              for a, p in sorted(bb["per"].items(), key=lambda kv: (-kv[1]["keer"], kv[0]))]
    # Een paar kabinetspartijen telt alleen op stemmingen waarop beide op die dag in het kabinet zaten (NSC na 22
    # augustus 2025 niet meer)
    paren = []
    for a, b in combinations(groep, 2):
        c = cohesie([x for x in V if a in leden_op(x["datum"]) and b in leden_op(x["datum"])], ids[a], ids[b])
        paren.append({"a": a, "b": b, **c})
    # Het grootste aantal partijen uit de groep dat in deze periode tegelijk in het kabinet zat
    meeste = max(len([a for a in groep if a in leden_op(x["datum"])]) for x in V)
    return {
        "van": min(b["datum"] for b in V), "tot": max(b["datum"] for b in V), "verdeeld": len(V), "klein": len(V) < KLEIN,
        "moties": sum(1 for b in V if is_motie(b)), "partijen": meeste,
        "eensgezind": maat(V, [ids[a] for a in blijvend]),
        "paren": paren,
        "alleen": {"verdeeld": bb["verdeeld"], "partijen": alleen},
    }


def verschuivingen(voor: list, na: list, ids: dict, partijen: list, kab: list, opp: list) -> dict:
    """Per paar de verandering in cohesie van de ene periode naar de andere, op alle verdeelde stemmingen en op alleen
    moties. Referentie: de mediane verandering van alle paren met minstens MIN_PAAR gezamenlijke stemmingen in beide
    periodes. Uit: die mediaan, en per paar van een kabinetspartij en een oppositiepartij de cijfers."""
    Vv, Vn = [b for b in voor if b["verdeeld"]], [b for b in na if b["verdeeld"]]
    Mv, Mn = [b for b in Vv if is_motie(b)], [b for b in Vn if is_motie(b)]
    alle_paren, kab_opp = [], []
    for a, b in combinations(sorted(partijen), 2):
        cv, cn = cohesie(Vv, ids[a], ids[b]), cohesie(Vn, ids[a], ids[b])
        if cv["gezamenlijk"] < MIN_PAAR or cn["gezamenlijk"] < MIN_PAAR:
            continue
        # Uit de ruwe breuken, niet uit afgeronde cohesies (feitencontrole 14 november 2026)
        verschil = round(ruw(cn) - ruw(cv), PRECISIE)
        mv, mn = cohesie(Mv, ids[a], ids[b]), cohesie(Mn, ids[a], ids[b])
        motie = round(ruw(mn) - ruw(mv), PRECISIE) if mv["gezamenlijk"] >= MIN_PAAR and mn["gezamenlijk"] >= MIN_PAAR else None
        alle_paren.append({"verschil": verschil, "motie": motie})
        if (a in kab) != (b in kab) and (a in opp or b in opp):
            k, o = (a, b) if a in kab else (b, a)
            kab_opp.append({"kabinetspartij": k, "oppositie": o, "voor": round(ruw(cv), PRECISIE), "na": round(ruw(cn), PRECISIE),
                            "gelijkVoor": cv["gelijk"], "gelijkNa": cn["gelijk"], "nVoor": cv["gezamenlijk"], "nNa": cn["gezamenlijk"], "verschil": verschil, "motie": motie})
    kab_opp.sort(key=lambda x: (-x["verschil"], x["kabinetspartij"], x["oppositie"]))
    met_motie = [x for x in kab_opp if x["motie"] is not None]
    return {
        "paren": len(alle_paren),
        "mediaan": mediaan([x["verschil"] for x in alle_paren]),
        "mediaanMotie": mediaan([x["motie"] for x in alle_paren if x["motie"] is not None]),
        "kabOpp": kab_opp,
        "mediaanKabOpp": mediaan([x["verschil"] for x in kab_opp]),
        # Controle op de mix van moties en wetten: hoeveel de verandering op alleen moties afwijkt van die op alles
        "motieAfwijking": mediaan([abs(x["motie"] - x["verschil"]) for x in met_motie]),
        "motieParen": len(met_motie),
        # Per kabinetspartij het paar dat het sterkst steeg en het sterkst daalde (alleen echte stijgers en dalers)
        "perPartij": [{"kabinetspartij": k,
                       "stijger": next((x for x in kab_opp if x["kabinetspartij"] == k and x["verschil"] > 0), None),
                       "daler": next((x for x in reversed(kab_opp) if x["kabinetspartij"] == k and x["verschil"] < 0), None)}
                      for k in sorted(kab)],
    }


def partijen_van(fracties: list, ids: dict) -> tuple:
    """Afkortingen die meetellen, en het aantal fracties met een persoonsnaam dat wegvalt."""
    mee = [a for a in ids if a in PARTIJEN]
    return mee, len([a for a in ids if a not in PARTIJEN])


# ---------- opdracht ----------

def kabinet_cijfers(naam: str, k: dict, kab_rij: dict, data: dict, coalitie: list, terug: dict) -> dict:
    einde = kab_rij["einde"]
    controleer_datums(k, einde)
    ids = ids_van(data["fracties"], terug)
    B = data["besluiten"]
    # De datums waar bronnen verschillen: er mag daar geen stemming zijn
    for van, tot in k["twijfel"]:
        assert not [b for b in B if van <= b["datum"] < tot], f"{naam}: stemming tussen {van} en {tot}"
    leden_op = lambda d: [a for a in coalitie_op(coalitie, naam, d) if a in ids]  # noqa: E731
    laatste = max(b["datum"] for b in B)
    blijvend = sorted(leden_op(laatste))
    eerste_dem = min(b["datum"] for b in B if b["datum"] >= k["demissionair"])
    groep = sorted(set(blijvend) | set(leden_op(eerste_dem)))
    ooit = sorted({c["afkorting"] for c in coalitie if c["kabinet"] == naam})
    assert all(a in PARTIJEN for a in ooit), ooit
    partijen, weg = partijen_van(data["fracties"], ids)
    opp = [a for a in partijen if a not in ooit]
    per = {p: [b for b in B if periode_van(b["datum"], k) == p] for p in PERIODES}
    periodes = {p: periode_cijfers(per[p], ids, blijvend, groep, leden_op) for p in PERIODES}
    campagne = verschuivingen(per["missionair"], per["demVoor"], ids, partijen, blijvend, opp) if periodes["demVoor"] else None
    return {
        "kabinet": naam, "begin": kab_rij["begin"], "einde": einde, "dataVanaf": min(b["datum"] for b in B),
        "demissionair": k["demissionair"], "verkiezing": k["verkiezing"], "kamer": k["kamer"], "bron": k["bron"],
        "partijen": ooit, "blijvend": blijvend, "groep": groep, "vertrokken": [a for a in ooit if a not in blijvend],
        # Wanneer een vertrokken partij uit het kabinet ging (api.coalitie, eerste dag zonder haar)
        "vertrek": {c["afkorting"]: c["tot"] for c in coalitie if c["kabinet"] == naam and c["tot"]},
        "persoonsnaam": weg,
        "periodes": periodes, "campagne": campagne,
    }


def jetten_cijfers(kab_rij: dict, data: dict, coalitie: list, terug: dict) -> dict:
    ids = ids_van(data["fracties"], terug)
    B = data["besluiten"]
    stand = max(b["datum"] for b in B)
    kab = sorted(coalitie_op(coalitie, JETTEN, stand))
    leden_op = lambda d: [a for a in coalitie_op(coalitie, JETTEN, d) if a in ids]  # noqa: E731
    return {"kabinet": JETTEN, "begin": kab_rij["begin"], "stand": stand, "partijen": kab,
            "missionair": periode_cijfers(B, ids, kab, kab, leden_op)}


def cijfers(cache: Path | None) -> dict:
    terug = voorgangers(json.loads(OPVOLGERS.read_text(encoding="utf-8")))
    coalitie = alle("coalitie?select=kabinet,afkorting,rol,van,tot", "kabinet,afkorting")
    kabinetten = {k["naam"]: k for k in alle("kabinet?select=naam,begin,einde", "naam")}
    uit = []
    for naam, k in KABINETTEN.items():
        uit.append(kabinet_cijfers(naam, k, kabinetten[naam], lees_kabinet(naam, cache), coalitie, terug))
    j = jetten_cijfers(kabinetten[JETTEN], lees_kabinet(JETTEN, cache), coalitie, terug)
    return {
        "slug": SLUG, "soort": "demissionair", "kabinet": JETTEN, "stand": j["stand"], "gemaakt": date.today().isoformat(),
        "grenzen": {"minPaar": MIN_PAAR, "klein": KLEIN},
        "verdeeld": sum(p["verdeeld"] for k in uit for p in k["periodes"].values() if p),
        "kabinetten": uit, "jetten": j,
    }


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--cache", type=Path, default=None, help="map om de opgehaalde stemmingen te bewaren (buiten de repo)")
    ap.add_argument("--uitvoer", type=Path, default=UITVOER)
    a = ap.parse_args(argv)
    uit = cijfers(a.cache)
    pad = a.uitvoer / f"{SLUG}.json"
    a.uitvoer.mkdir(parents=True, exist_ok=True)
    pad.write_text(json.dumps(uit, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    k = lambda x: "-" if x is None else f"{x:.1f}".replace(".", ",")  # noqa: E731
    for kb in uit["kabinetten"] + [{**uit["jetten"], "periodes": {"missionair": uit["jetten"]["missionair"]}, "blijvend": uit["jetten"]["partijen"], "campagne": None, "persoonsnaam": 0}]:
        print(f"{kb['kabinet']}: blijvend {', '.join(kb['blijvend'])} ({kb['persoonsnaam']} fracties met een persoonsnaam weggelaten)")
        for p, r in kb["periodes"].items():
            if not r:
                print(f"  {p}: geen stemmingen")
                continue
            e = r["eensgezind"]
            print(f"  {p} {r['van']} tot {r['tot']}: {r['verdeeld']} verdeeld{' (klein)' if r['klein'] else ''}, eensgezind {e['eensgezind']}/{e['gestemd']} = {k(e['pct'])} | "
                  + "; ".join(f"{x['a']}-{x['b']} {k(x['cohesie'])} ({x['gezamenlijk']})" for x in r["paren"])
                  + (" | alleen: " + ", ".join(f"{x['afkorting']} {x['keer']}/{x['basis']}" for x in r["alleen"]["partijen"]) if r["alleen"]["verdeeld"] else ""))
        c = kb["campagne"]
        if c:
            print(f"  campagne: {c['paren']} paren, mediaan {k(c['mediaan'])} (moties {k(c['mediaanMotie'])}), kabinet-oppositie {len(c['kabOpp'])} paren mediaan {k(c['mediaanKabOpp'])}, motie-afwijking {k(c['motieAfwijking'])}")
            for x in [y for p in c["perPartij"] for y in (p["stijger"], p["daler"]) if y]:
                print(f"    {x['kabinetspartij']}-{x['oppositie']}: {k(x['voor'])} -> {k(x['na'])} ({k(x['verschil'])}; moties {k(x['motie'])}; n {x['nVoor']}/{x['nNa']})")
    print(f"Geschreven: {pad}")


if __name__ == "__main__":
    main()
