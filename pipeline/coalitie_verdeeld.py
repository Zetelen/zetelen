#!/usr/bin/env python3
"""Cijfers voor het Actueel-stuk "coalitie-verdeeld" (13 november 2026).

Aanleiding: het Belastingplan 2027 ging op 12 november 2026 met 76 tegen 74 door de Tweede Kamer, met de VVD tegen.
Het stuk bouwt voort op /actueel/akkoord-belastingplan en heeft twee blokken; dit script levert de getallen in
web/content/actueel/coalitie-verdeeld.json. De zinnen staan in web/lib/actueel.ts en lezen alles uit dat bestand.

  maanden   Per kalendermaand sinds de start van kabinet-Jetten: hoe vaak één kabinetspartij de andere kant koos dan de
            twee andere, die allebei voor of tegen stemden en dezelfde kant kozen. Met de noemer: de verdeelde
            stemmingen in die maand. Dit is buiten_de_boot() uit akkoord_belastingplan.py, per maand gefilterd, zodat de
            som over de maanden gelijk is aan "alleen staan" in blok "buiten" van dat stuk (bij dezelfde stand).
  zonder    Groepen zonder de VVD: D66 en CDA, met de partijen uit het stuk kabinet-cu-50plus (ChristenUnie, 50PLUS en de
            Groep Markuszower) en met de partners van het akkoord (PRO en Volt). Per groep de zetels in de Tweede Kamer, de
            zetels in de Eerste Kamer (alleen een rekensom: Zetelen heeft geen stemmingen van de Eerste Kamer), hoe vaak de
            groep eensgezind stemde (maat() uit akkoord_belastingplan.py) en het paar in de groep dat het minst vaak
            dezelfde kant koos.

Waarom de publieke Data API (api.stemming_dossier, api.coalitie, api.kabinet) en niet core.coalitie met
analyses.fractie_besluit_stem: het stuk moet dezelfde telling hebben als akkoord-belastingplan, en dat script leest via
de Data API. Zo gelden dezelfde regels (fractiestem, vergissingen, naamswijzigingen) en is alles na te rekenen zonder
toegang tot de database.

Uitvoer in de terminal: alleen fracties en aantallen, geen namen van Kamerleden.

Verbinding: SUPABASE_URL en SUPABASE_PUBLISHABLE_KEY uit de omgeving (set -a; . web/.env.local; set +a).

Gebruik:
  python3 pipeline/coalitie_verdeeld.py [--cache /pad/naar/scratchpad/cache]
"""
import argparse
import json
import sys
from datetime import date
from itertools import combinations
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from actueel import OPVOLGERS, UITVOER, alle, kant, voorgangers  # noqa: E402
from akkoord_belastingplan import (  # noqa: E402
    EERSTE_KAMER, EK_TOTAAL, TK_TOTAAL, buiten_de_boot, cohesie, coalitie_op, ek_som, ids_van, lees_kabinet, maat,
)

SLUG = "coalitie-verdeeld"
KABINET = "Jetten"
BUITEN = "VVD"  # de kabinetspartij waar het stuk om draait: tegen het Belastingplan 2027
# De twee andere stukken waar dit stuk op voortbouwt; de partijen komen uit hun JSON, niet uit dit script
STUK_STEUN = "kabinet-cu-50plus"  # groep: ChristenUnie, 50PLUS en de Groep Markuszower
STUK_AKKOORD = "akkoord-belastingplan"  # kamers.vier: D66, CDA, PRO en Volt


# ---------- rekenen (zonder netwerk, getest in pipeline/tests/test_coalitie_verdeeld.py) ----------

def maanden_tussen(van: str, tot: str) -> list:
    """Alle kalendermaanden van van tot en met tot, als 'JJJJ-MM'."""
    j, m = int(van[:4]), int(van[5:7])
    uit = []
    while f"{j:04d}-{m:02d}" <= tot[:7]:
        uit.append(f"{j:04d}-{m:02d}")
        j, m = (j + 1, 1) if m == 12 else (j, m + 1)
    return uit


def eensgezind_drie(besluiten: list, ids: dict, leden: list, filt) -> int:
    """Verdeelde stemmingen waarop alle leden voor of tegen stemden en dezelfde kant kozen."""
    return sum(1 for b in besluiten if b["verdeeld"] and filt(b) and kant(b["stemmen"], [ids[a] for a in leden]))


def per_maand(besluiten: list, ids: dict, leden: list, begin: str, stand: str) -> list:
    """Per maand: de verdeelde stemmingen (noemer), per partij hoe vaak ze alleen stond, en hoe vaak alle drie dezelfde
    kant kozen. Bij drie partijen die alle drie stemden, staat er precies één alleen of zijn ze eensgezind; wat overblijft
    (verdeeld min alleen min eensgezind) zijn dus de stemmingen waarop minstens één van de drie niet stemde.
    van en tot: de eerste en laatste dag met een stemming in die maand (leeg in een maand zonder stemmingen, zoals het
    zomerreces)."""
    uit = []
    for mnd in maanden_tussen(begin, stand):
        filt = lambda b, mnd=mnd: b["datum"][:7] == mnd  # noqa: E731
        r = buiten_de_boot(besluiten, ids, lambda d: leden, filt)
        datums = [b["datum"] for b in besluiten if filt(b)]
        uit.append({
            "maand": mnd, "van": min(datums, default=None), "tot": max(datums, default=None),
            "verdeeld": r["verdeeld"],
            "alleen": {a: r["per"].get(a, {"keer": 0})["keer"] for a in leden},
            "eensgezind": eensgezind_drie(besluiten, ids, leden, filt),
        })
    return uit


def groep_maat(besluiten: list, ids: dict, zetels: dict, fracties: list) -> dict:
    """Zetels in beide Kamers, hoe vaak eensgezind, en het paar dat het minst vaak dezelfde kant koos."""
    m = maat(besluiten, [ids[a] for a in fracties])
    paren = sorted(({"a": a, "b": b, **cohesie(besluiten, ids[a], ids[b])} for a, b in combinations(fracties, 2)),
                   key=lambda x: (x["cohesie"], x["a"], x["b"]))
    return {"fracties": fracties, "tk": sum(zetels[a] for a in fracties), "ek": ek_som(fracties), **m,
            "laagstePaar": paren[0] if paren else None}


# ---------- opdracht ----------

def cijfers(cache: Path | None, uitvoer: Path) -> dict:
    terug = voorgangers(json.loads(OPVOLGERS.read_text(encoding="utf-8")))
    coalitie = alle("coalitie?select=kabinet,afkorting,rol,van,tot", "kabinet,afkorting")
    kab_rij = next(k for k in alle("kabinet?select=naam,begin,einde", "naam") if k["naam"] == KABINET)
    J = lees_kabinet(KABINET, cache)
    ids = ids_van(J["fracties"], terug, alleen_zaal=True)
    zetels = {r["afkorting"]: r["zetels"] for r in J["fracties"] if r["in_zaal"]}
    assert sum(zetels.values()) == TK_TOTAAL, sum(zetels.values())
    B = J["besluiten"]
    stand = max(b["datum"] for b in B)
    kab = sorted(coalitie_op(coalitie, KABINET, stand), key=lambda a: -zetels[a])  # D66, VVD, CDA
    assert BUITEN in kab and len(kab) == 3, kab
    rest = [a for a in kab if a != BUITEN]

    steun = json.loads((uitvoer / f"{STUK_STEUN}.json").read_text(encoding="utf-8"))
    akkoord = json.loads((uitvoer / f"{STUK_AKKOORD}.json").read_text(encoding="utf-8"))
    assert steun["kabinet"] == KABINET and akkoord["kabinet"] == KABINET
    steunpartijen = steun["groep"]
    partners = [a for a in akkoord["kamers"]["vier"] if a not in kab]  # PRO en Volt

    # Blok maanden. Leden: de drie kabinetspartijen op elke datum (api.coalitie); er stapte niemand in of uit.
    for b in B:
        assert sorted(coalitie_op(coalitie, KABINET, b["datum"])) == sorted(kab), b["datum"]
    maanden = per_maand(B, ids, kab, kab_rij["begin"], stand)
    totaal = buiten_de_boot(B, ids, lambda d: kab)
    # Controle tegen blok "buiten" van akkoord-belastingplan: dezelfde telling tot en met de stand van dat stuk
    tot_akkoord = buiten_de_boot(B, ids, lambda d: kab, lambda b: b["datum"] <= akkoord["stand"])

    groepen = {
        "kabinet": kab,
        "kabinetSteun": kab + steunpartijen,
        "zonder": rest,
        "zonderSteun": rest + steunpartijen,
        "zonderAkkoord": rest + partners,
        "zonderBeide": rest + partners + steunpartijen,
    }
    return {
        "slug": SLUG, "soort": "verdeeld", "kabinet": KABINET, "begin": kab_rij["begin"], "buiten": BUITEN,
        "groep": rest, "tegen": kab, "steun": steunpartijen, "partners": partners,
        "stand": stand, "gemaakt": date.today().isoformat(),
        "besluiten": len(B), "verdeeld": sum(1 for b in B if b["verdeeld"]),
        "maanden": maanden,
        "totaal": {"verdeeld": totaal["verdeeld"], "alleen": {a: totaal["per"][a]["keer"] for a in kab},
                   "won": {a: totaal["per"][a]["won"] for a in kab}},
        "controle": {"stuk": STUK_AKKOORD, "stand": akkoord["stand"], "verdeeld": tot_akkoord["verdeeld"],
                     "alleen": {a: tot_akkoord["per"][a]["keer"] for a in kab}},
        "zonder": {
            "tk": {"meerderheid": TK_TOTAAL // 2 + 1, "zetels": zetels},
            "ek": {**EERSTE_KAMER, "meerderheid": EK_TOTAAL // 2 + 1, "totaal": EK_TOTAAL},
            "groepen": {k: groep_maat(B, ids, zetels, v) for k, v in groepen.items()},
        },
    }


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--cache", type=Path, default=None, help="map om de opgehaalde stemmingen te bewaren (buiten de repo)")
    ap.add_argument("--uitvoer", type=Path, default=UITVOER)
    a = ap.parse_args(argv)
    uit = cijfers(a.cache, a.uitvoer)
    pad = a.uitvoer / f"{SLUG}.json"
    pad.write_text(json.dumps(uit, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{uit['besluiten']} besluiten, {uit['verdeeld']} verdeeld, stand {uit['stand']}")
    for m in uit["maanden"]:
        print(f"  {m['maand']} ({m['van']} tot {m['tot']}): {m['verdeeld']:>4} verdeeld | "
              + ", ".join(f"{a} alleen {n}" for a, n in m["alleen"].items()) + f" | eensgezind {m['eensgezind']}")
    t, c = uit["totaal"], uit["controle"]
    print(f"  totaal: {t['verdeeld']} verdeeld, " + ", ".join(f"{a} {n}" for a, n in t["alleen"].items()))
    print(f"  tot en met {c['stand']} (stand van {c['stuk']}): {c['verdeeld']} verdeeld, " + ", ".join(f"{a} {n}" for a, n in c["alleen"].items()))
    for k, g in uit["zonder"]["groepen"].items():
        lp = g["laagstePaar"]
        print(f"  {k:14} {'+'.join(g['fracties'])}: TK {g['tk']} EK {g['ek']} | eensgezind {g['eensgezind']} van {g['gestemd']} ({g['pct']})"
              + (f" | laagste paar {lp['a']}-{lp['b']} {lp['cohesie']}" if lp else ""))
    print(f"Geschreven: {pad}")


if __name__ == "__main__":
    main()
