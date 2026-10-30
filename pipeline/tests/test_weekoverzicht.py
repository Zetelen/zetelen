"""Tests voor pipeline/weekoverzicht.py (woensdagoverzicht). Zonder netwerk."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import weekoverzicht as wo  # noqa: E402

KAB = {"D66": ["d"], "VVD": ["v"], "CDA": ["c"]}
ALLE = {**KAB, "PVV": ["p"], "PRO": ["pro", "glpvda"]}
ZETELS = {"D66": 26, "VVD": 22, "CDA": 18, "PVV": 19, "PRO": 20}


def b(stemmen, uitslag="Aangenomen", besluit="x", datum="2026-11-03", onderwerp="Motie over iets"):
    return {"besluit": besluit, "datum": datum, "zaak_nummer": "2026Z00001", "zaak_soort": "Motie", "onderwerp": onderwerp,
            "uitslag": uitslag, "stemmen": stemmen}


def test_zetels_per_kant_telt_ook_de_oude_naam():
    k = wo.zetels_per_kant({"d": "Voor", "glpvda": "Voor", "p": "Tegen"}, ALLE, ZETELS)
    assert k == {"Voor": 46, "Tegen": 19}


def test_krapste_eerst():
    besluiten = [b({"d": "Voor", "p": "Tegen"}, besluit="ruim"), b({"v": "Voor", "p": "Tegen"}, besluit="krap")]
    assert [r["besluit"] for r in wo.krapste(besluiten, ALLE, ZETELS)] == ["krap", "ruim"]
    assert wo.krapste(besluiten, ALLE, ZETELS)[0]["verschil"] == 3


def test_kabinet_verdeeld_alleen_als_twee_kanten_gestemd():
    besluiten = [b({"d": "Voor", "v": "Tegen", "c": "Voor"}, besluit="1"), b({"d": "Voor", "v": "Voor"}, besluit="2")]
    uit = wo.kabinet_verdeeld(besluiten, KAB)
    assert [r["besluit"] for r in uit] == ["1"]
    assert uit[0]["kabinet"] == {"D66": "Voor", "VVD": "Tegen", "CDA": "Voor"}


def test_tegen_kabinet_in_alleen_aangenomen_en_kabinet_eensgezind_tegen():
    besluiten = [b({"d": "Tegen", "v": "Tegen", "c": "Tegen"}, besluit="1"),
                 b({"d": "Tegen", "v": "Tegen", "c": "Tegen"}, uitslag="Verworpen", besluit="2"),
                 b({"d": "Tegen", "v": "Voor", "c": "Tegen"}, besluit="3")]
    assert [r["besluit"] for r in wo.tegen_kabinet_in(besluiten, KAB)] == ["1"]


def test_ongewone_paren_onder_de_grens_en_vaak_genoeg():
    coh = {frozenset(("PVV", "PRO")): 34.0, frozenset(("D66", "PRO")): 72.0}
    besluiten = [b({"p": "Voor", "pro": "Voor", "d": "Voor"}, besluit="1"), b({"p": "Tegen", "glpvda": "Tegen", "d": "Tegen"}, besluit="2"),
                 b({"p": "Voor", "pro": "Tegen"}, besluit="3")]
    uit = wo.ongewone_paren(besluiten, ALLE, coh)
    assert [(r["a"], r["b"], len(r["stemmingen"])) for r in uit] == [("PRO", "PVV", 2)]
    assert wo.ongewone_paren(besluiten, ALLE, coh, minimum=3) == []


def test_notitie_zonder_vondsten_zegt_geen():
    t = wo.notitie("2026-11-04", "Jetten", 0, [], [], [], [])
    assert t.startswith("---\ntype: weekoverzicht")
    assert t.count("- Geen.") == 4
