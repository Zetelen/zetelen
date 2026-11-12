"""Tests voor pipeline/akkoord_belastingplan.py (Actueel-stuk akkoord-belastingplan). Zonder netwerk."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import akkoord_belastingplan as ak  # noqa: E402


def b(stemmen, verdeeld=True, besluit="x", datum="2026-03-01", soort="Amendement", uitslag="Aangenomen.", titels=("Belastingplan 2027",), zaak="2026Z00001"):
    return {"besluit": besluit, "datum": datum, "zaak_nummer": zaak, "zaak_soort": soort, "onderwerp": "iets",
            "uitslag": uitslag, "verdeeld": verdeeld, "stemmen": stemmen, "titels": list(titels)}


IDS = {"A": ["a"], "B": ["b"], "C": ["c"], "X": ["x"], "Y": ["y"]}
DRIE = lambda d: ["A", "B", "C"]  # noqa: E731


def test_winnaar_volgt_de_uitslagtekst():
    assert ak.winnaar("Aangenomen.") == "Voor"
    assert ak.winnaar("Verworpen.") == "Tegen"
    assert ak.winnaar("Niet aangenomen.") == "Tegen"
    assert ak.winnaar("Aangehouden.") is None
    assert ak.winnaar(None) is None


def test_buiten_de_boot_telt_alleen_als_de_rest_eensgezind_is_en_x_stemde():
    besluiten = [
        b({"a": "Voor", "b": "Voor", "c": "Tegen"}, besluit="1"),                     # C buiten de boot, kant zonder C won
        b({"a": "Voor", "b": "Tegen", "c": "Tegen"}, besluit="2", uitslag="Verworpen."),  # A buiten de boot, rest won
        b({"a": "Voor", "b": "Voor"}, besluit="3"),                                    # C stemde niet: niemand buiten de boot
        b({"a": "Voor", "b": "Voor", "c": "Voor"}, besluit="4"),                       # eensgezind
        b({"a": "Voor", "b": "Voor", "c": "Tegen"}, besluit="5", verdeeld=False),      # niet verdeeld: telt niet
    ]
    r = ak.buiten_de_boot(besluiten, IDS, DRIE)
    assert r["verdeeld"] == 4
    assert r["per"]["C"] == {"basis": 4, "keer": 1, "won": 1}
    assert r["per"]["A"] == {"basis": 4, "keer": 1, "won": 1}
    assert r["per"]["B"]["keer"] == 0
    assert [g["buiten"] for g in r["gevallen"]] == ["C", "A"]


def test_buiten_de_boot_slaat_stemmingen_met_minder_dan_drie_coalitiepartijen_over():
    besluiten = [b({"a": "Voor", "b": "Tegen"}, datum="2012-05-01"), b({"a": "Voor", "b": "Voor", "c": "Tegen"}, datum="2012-03-01", besluit="y")]
    leden = lambda d: ["A", "B"] if d >= "2012-04-21" else ["A", "B", "C"]  # noqa: E731
    r = ak.buiten_de_boot(besluiten, IDS, leden)
    assert r["verdeeld"] == 1
    assert r["per"]["C"]["keer"] == 1


def test_coalitie_op_volgt_van_en_tot():
    co = [{"kabinet": "K", "afkorting": "A", "rol": "kabinet", "van": None, "tot": None},
          {"kabinet": "K", "afkorting": "P", "rol": "gedoogsteun", "van": None, "tot": "2012-04-21"},
          {"kabinet": "L", "afkorting": "Q", "rol": "kabinet", "van": None, "tot": None}]
    assert ak.coalitie_op(co, "K", "2012-04-20") == ["A", "P"]
    assert ak.coalitie_op(co, "K", "2012-04-21") == ["A"]


def test_eindstemmingen_alleen_wetgeving_over_een_belastingplan_en_coalitie_tegen():
    co = [{"kabinet": "K", "afkorting": "A", "rol": "kabinet", "van": None, "tot": None},
          {"kabinet": "K", "afkorting": "B", "rol": "kabinet", "van": None, "tot": None}]
    besluiten = {"K": [
        b({"a": "Voor", "b": "Voor", "x": "Tegen"}, soort="Wetgeving", besluit="1", zaak="Z1"),
        b({"a": "Voor", "b": "Tegen"}, soort="Wetgeving", besluit="2", zaak="Z2", datum="2026-04-01"),
        b({"a": "Voor", "b": "Voor"}, soort="Wetgeving", besluit="3", titels=("Overige fiscale maatregelen",), zaak="Z3"),
        b({"a": "Voor", "b": "Voor"}, soort="Amendement", besluit="4", zaak="Z4"),
        b({"a": "Voor", "b": "Tegen"}, soort="Wetgeving", besluit="5", zaak="NU"),
    ]}
    e = ak.eindstemmingen(besluiten, {"K": IDS}, co, {"NU"})
    assert [x["zaak"] for x in e] == ["Z1", "Z2"]
    assert [x["coalitieTegen"] for x in e] == [[], ["B"]]


def test_hechtste_meerderheid_alleen_minimaal_en_zonder_de_uitgesloten_partij():
    zetels = {"A": 40, "B": 30, "C": 10, "X": 10, "Y": 60}
    ids = {k: [k.lower()] for k in zetels}
    besluiten = [
        b({"a": "Voor", "c": "Voor", "x": "Voor", "y": "Tegen", "b": "Tegen"}, besluit="1"),
        b({"a": "Voor", "c": "Voor", "x": "Tegen", "y": "Voor", "b": "Voor"}, besluit="2"),
        b({"a": "Tegen", "c": "Tegen", "x": "Voor", "y": "Tegen", "b": "Voor"}, besluit="3"),
    ]
    h = ak.hechtste_meerderheid(besluiten, ids, zetels, ["A"], "B", 76)
    # Minimaal zonder B: A+Y (100) en A+C+X... (60, te weinig); A+Y+C is niet minimaal (C kan weg)
    assert h["extra"] == ["Y"]
    assert h["combinaties"] == 1
    assert (h["eensgezind"], h["gestemd"]) == (2, 3)


def test_stemming_telt_zetels_per_kant_en_weigert_onbekende_fracties():
    s = ak.stemming({"zaak": "Z", "datum": "2026-11-12", "uitslag": "Aangenomen.", "hoofdelijk": False,
                     "stemmen": {"pro": ("Voor", 20), "glpvda": ("Voor", None), "v": ("Tegen", 22)}},
                    "wet", {"pro": "PRO", "glpvda": "PRO", "v": "VVD"}, {"PRO": 20, "VVD": 22}, ["VVD"])
    assert s["aangenomen"] is True
    assert s["voor"] == 40 and s["tegen"] == 22
    assert [f["afkorting"] for f in s["fracties"]][0] == "VVD"
    assert next(f for f in s["fracties"] if f["afkorting"] == "VVD")["kabinet"] is True
    try:
        ak.stemming({"zaak": "Z", "datum": "", "uitslag": "", "hoofdelijk": False, "stemmen": {"?": ("Voor", 1)}}, "wet", {}, {}, [])
    except SystemExit:
        pass
    else:
        raise AssertionError("onbekende fractie had moeten stoppen")


def test_eerste_kamer_telt_op_tot_75():
    ek = ak.EERSTE_KAMER
    assert sum(ek["zetels"].values()) + ek["eenmansfracties"] == ak.EK_TOTAAL
    assert ak.ek_som(ak.VIER) == 29
    assert ak.ek_som(ak.VIER + ["VVD"]) == 38
