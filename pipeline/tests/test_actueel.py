"""Tests voor pipeline/actueel.py (cijfers voor /actueel). Zonder netwerk."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import actueel as ac  # noqa: E402

OPV = {"opvolgers": [
    {"soort": "fusie", "van": [{"id": "gl"}, {"id": "pvda"}], "naar": {"id": "glpvda"}},
    {"soort": "naamswijziging", "van": [{"id": "glpvda"}], "naar": {"id": "pro"}},
    {"soort": "naamswijziging", "van": [{"id": "oud"}], "naar": {"id": "midden"}},
    {"soort": "naamswijziging", "van": [{"id": "midden"}], "naar": {"id": "nieuw"}},
]}


def b(stemmen, verdeeld=True, onderwerp="iets", besluit="x", datum="2026-03-01"):
    return {"besluit": besluit, "datum": datum, "zaak_nummer": "2026Z00001", "zaak_soort": "Motie",
            "onderwerp": onderwerp, "uitslag": "Aangenomen", "verdeeld": verdeeld, "stemmen": stemmen}


def test_voorgangers_alleen_naamswijziging_ook_over_meer_stappen():
    v = ac.voorgangers(OPV)
    assert v["pro"] == ["glpvda"]  # de fusie van GL en PvdA telt niet als dezelfde fractie
    assert v["nieuw"] == ["midden", "oud"]
    assert "glpvda" not in v


def test_stem_onder_oude_naam_telt_als_stem_van_de_fractie():
    # De valkuil van de eerste analyse: PRO zonder stem onder het nieuwe id
    assert ac.stem({"glpvda": "Voor"}, ["pro", "glpvda"]) == "Voor"
    assert ac.stem({"pro": "Tegen", "glpvda": "Voor"}, ["pro", "glpvda"]) == "Tegen"
    assert ac.stem({}, ["pro", "glpvda"]) is None


def test_groep_is_alleen_eensgezind_als_iedereen_dezelfde_kant_stemde():
    g = [["a"], ["b"]]
    assert ac.kant({"a": "Voor", "b": "Voor"}, g) == "Voor"
    assert ac.kant({"a": "Voor", "b": "Tegen"}, g) is None
    assert ac.kant({"a": "Voor"}, g) is None  # b stemde niet
    assert ac.kant({"a": "Niet deelgenomen", "b": "Niet deelgenomen"}, g) is None


def test_meegaan_telt_alleen_stemmingen_waarop_de_fractie_stemde():
    ref = [["k1"], ["k2"]]
    besluiten = [
        b({"k1": "Voor", "k2": "Voor", "p": "Voor", "g": "Voor"}),
        b({"k1": "Tegen", "k2": "Tegen", "p": "Voor", "g": "Tegen"}),
        b({"k1": "Voor", "k2": "Voor", "g": "Tegen"}),  # p stemde niet: telt niet als niet mee
        b({"k1": "Voor", "k2": "Tegen", "p": "Voor", "g": "Voor"}),  # ref niet eensgezind
        b({"k1": "Voor", "k2": "Voor", "p": "Voor", "g": "Voor"}, verdeeld=False),  # niet verdeeld
    ]
    m = ac.meegaan(besluiten, ref, {"P": ["p"], "G": ["g"]}, [["g"]])
    assert m["basis"] == 3
    per = {f["afkorting"]: f for f in m["fracties"]}
    assert (per["P"]["gestemd"], per["P"]["mee"], per["P"]["pct"]) == (2, 1, 50.0)
    assert (per["G"]["gestemd"], per["G"]["mee"]) == (3, 2)
    assert m["groep"] == {"eensgezind": 3, "mee": 2, "pct": 66.7}


def test_samen_alleen_over_stemmingen_waarop_iedereen_stemde():
    besluiten = [b({"a": "Voor", "b": "Voor"}), b({"a": "Voor", "b": "Tegen"}), b({"a": "Voor"})]
    assert ac.samen(besluiten, {"ab": [["a"], ["b"]]}) == [{"naam": "ab", "gestemd": 2, "samen": 1, "pct": 50.0}]


def test_botspunten_per_thema_tegenover_samen_of_verdeeld():
    G, R = [["g1"], ["g2"]], [["k"]]
    besluiten = [
        b({"g1": "Voor", "g2": "Voor", "k": "Tegen"}, onderwerp="Motie over stikstof", besluit="1"),
        b({"g1": "Voor", "g2": "Voor", "k": "Voor"}, onderwerp="Motie over de Kritische Depositiewaarde", besluit="2"),
        b({"g1": "Voor", "g2": "Tegen", "k": "Tegen"}, onderwerp="Stikstofbank", besluit="3"),
        b({"g1": "Voor", "g2": "Voor", "k": "Tegen"}, onderwerp="Over iets anders", besluit="4"),
    ]
    uit = ac.botspunten(besluiten, {"Stikstof": "stikstof|kritische depositie"}, G, R)
    t = uit["themas"][0]
    assert (t["verdeeld"], t["beide"], t["tegenover"]) == (3, 2, 1)
    assert [x["stand"] for x in t["stemmingen"]] == ["tegen", "samen", "verdeeld"]
    assert uit["alles"] == {"beide": 3, "tegenover": 2, "pct": 66.7}


def test_per_thema_eensgezind_en_meegaan_per_fractie_met_alles_eerst():
    besluiten = [
        b({"g1": "Voor", "g2": "Voor", "k": "Tegen"}, onderwerp="Motie over abortus", besluit="1"),
        b({"g1": "Tegen", "g2": "Voor", "k": "Tegen"}, onderwerp="Motie over abortuszorg", besluit="2"),
        b({"g1": "Tegen", "g2": "Voor", "k": "Tegen"}, onderwerp="Motie over abortus", besluit="3", verdeeld=False),
        b({"g1": "Voor", "g2": "Voor", "k": "Voor"}, onderwerp="Over iets anders", besluit="4"),
    ]
    uit = ac.per_thema(besluiten, {"Abortus": "abortus"}, {"G1": ["g1"], "G2": ["g2"]}, [["g1"], ["g2"]], [["k"]])
    assert [t["thema"] for t in uit] == ["Alles", "Abortus"]
    alles, ab = uit
    assert (alles["verdeeld"], alles["groepEensgezind"], alles["refEensgezind"]) == (3, 2, 3)
    assert (ab["verdeeld"], ab["groepEensgezind"], ab["refEensgezind"]) == (2, 1, 2)
    per = {f["afkorting"]: (f["mee"], f["gestemd"]) for f in ab["fracties"]}
    assert per == {"G1": (1, 2), "G2": (0, 2)}


def test_hechtheid_plek_onder_paren_van_fracties_met_genoeg_zetels():
    coh = [
        {"fractie_afkorting": "A", "andere_fractie_afkorting": "B", "cohesie": 90.0, "gezamenlijk": 10},
        {"fractie_afkorting": "A", "andere_fractie_afkorting": "C", "cohesie": 70.0, "gezamenlijk": 10},
        {"fractie_afkorting": "B", "andere_fractie_afkorting": "C", "cohesie": 80.0, "gezamenlijk": 10},
        {"fractie_afkorting": "A", "andere_fractie_afkorting": "Klein", "cohesie": 99.0, "gezamenlijk": 10},
    ]
    h = ac.hechtheid(coh, ["A", "C"], {"A": 20, "B": 10, "C": 5, "Klein": 1})
    assert h["parenTotaal"] == 3  # het paar met de eenmansfractie telt niet mee
    assert h["paren"] == [{"a": "A", "b": "C", "cohesie": 70.0, "gezamenlijk": 10, "plek": 3}]


def test_zetelsom_vindt_kleinste_aanvulling_tot_meerderheid():
    # De casus: kabinet 66, met JA21 (9) en SGP (3) is het 78; BBB (3) is niet nodig
    z = ac.zetelsom({"D66": 26, "VVD": 22, "CDA": 18, "JA21": 9, "BBB": 3, "SGP": 3}, ["JA21", "BBB", "SGP"], ["D66", "VVD", "CDA"])
    assert z["meerderheid"] == 76 and z["ref"] == 66 and z["samen"] == 81
    # Kabinet + JA21 is 75: JA21 is nodig plus een van de twee kleine fracties, welke maakt niet uit
    assert z["kleinsteMeerderheid"] == [["JA21", "BBB"], ["JA21", "SGP"]]


def test_alle_vraagt_een_vaste_volgorde_en_leest_door_tot_de_laatste_pagina():
    gevraagd = []

    def lezer(pad):
        gevraagd.append(pad)
        return [{}] * (1000 if len(gevraagd) < 3 else 5)
    assert len(ac.alle("stemming_dossier?kabinet=eq.Jetten", "besluit,dossier", lezer)) == 2005
    assert all("&order=besluit,dossier&" in p for p in gevraagd)
    assert [p.split("offset=")[1] for p in gevraagd] == ["0", "1000", "2000"]
