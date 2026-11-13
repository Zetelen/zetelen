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


# ---------- opdracht plannen ----------

KABINETTEN = [{"naam": "Balkenende IV", "begin": "2007-02-22", "einde": "2010-10-14"}, {"naam": "Jetten", "begin": "2026-02-23", "einde": None}]
COALITIE = [{"kabinet": "Balkenende IV", "afkorting": a, "rol": "kabinet", "van": None, "tot": t}
            for a, t in [("CDA", None), ("PvdA", "2010-02-23"), ("ChristenUnie", None)]]


def besluit(titel="Wijziging van enkele belastingwetten (Belastingplan 2009)", datum="2008-11-25", soort="Met handopsteken",
            tekst="Aangenomen", stemmen=None):
    stemmen = stemmen if stemmen is not None else [("CDA", 41, "Voor"), ("PvdA", 33, "Voor"), ("ChristenUnie", 6, "Voor"), ("SP", 25, "Tegen"), ("VVD", 21, "Tegen")]
    return {"BesluitSoort": "Stemmen - aangenomen", "BesluitTekst": tekst, "StemmingsSoort": soort,
            "Zaak": [{"Nummer": "2008Z1", "Titel": titel, "Soort": "Wetgeving"}],
            "Agendapunt": {"Activiteit": {"Datum": f"{datum}T10:00:00+01:00"}},
            "Stemming": [{"ActorFractie": a, "FractieGrootte": g, "Soort": s, "Fractie_Id": a, "Persoon_Id": None} for a, g, s in stemmen]}


def test_plan_telt_zetels_en_coalitie_per_datum():
    p = ak.plan_van(besluit(), KABINETTEN, COALITIE)
    assert (p["plan"], p["kabinet"], p["voor"], p["tegen"]) == ("2009", "Balkenende IV", 80, 46)
    assert p["coalitieTegen"] == [] and [f["fractie"] for f in p["tegenFracties"]] == ["SP", "VVD"]


def test_plan_ziet_coalitie_tegen_en_stopt_als_een_coalitiepartij_ontbreekt():
    p = ak.plan_van(besluit(stemmen=[("CDA", 41, "Voor"), ("PvdA", 33, "Tegen"), ("ChristenUnie", 6, "Voor")]), KABINETTEN, COALITIE)
    assert p["coalitieTegen"] == ["PvdA"]
    import pytest
    with pytest.raises(ValueError):
        ak.plan_van(besluit(stemmen=[("CDA", 41, "Voor"), ("SP", 25, "Tegen")]), KABINETTEN, COALITIE)


def test_hoofdelijk_zonder_stemmen_neemt_de_telling_uit_de_besluittekst():
    p = ak.plan_van(besluit(titel="x (Belastingplan 2027)", datum="2026-11-12", soort="Hoofdelijk", tekst="Aangenomen (76-74).", stemmen=[]),
                    KABINETTEN, [])
    assert (p["voor"], p["tegen"], p["hoofdelijk"], p["tegenFracties"], p["coalitieTegen"]) == (76, 74, True, None, None)


def test_geen_stemming_of_geen_belastingplan_telt_niet():
    b = besluit(); b["StemmingsSoort"] = "Zonder stemming"; b["BesluitSoort"] = "Behandelen [geen Parlisproces]"
    assert ak.plan_van(b, KABINETTEN, COALITIE) is None
    assert ak.plan_van(besluit(titel="Overige fiscale maatregelen 2009"), KABINETTEN, COALITIE) is None


def test_fractiestem_bij_hoofdelijk_is_de_meerderheid_van_de_leden():
    r = lambda f, soort, p="p": {"Fractie_Id": f, "Persoon_Id": p, "Soort": soort, "FractieGrootte": 3}  # noqa: E731
    uit = ak.fractiestemmen([r("a", "Voor"), r("a", "Tegen"), r("a", "Voor"), r("b", "Tegen"), r("b", "Voor"),
                             {"Fractie_Id": "c", "Persoon_Id": None, "Soort": "Tegen", "FractieGrootte": 5}])
    assert uit == {"a": ("Voor", 3), "c": ("Tegen", 5)}  # b staat gelijk en telt niet mee


def test_fractiestem_bij_handopsteken_volgt_de_fractierij_ook_met_afwijkende_leden():
    uit = ak.fractiestemmen([{"Fractie_Id": "a", "Persoon_Id": None, "Soort": "Tegen", "FractieGrootte": 33},
                             {"Fractie_Id": "a", "Persoon_Id": "p1", "Soort": "Voor", "FractieGrootte": 33},
                             {"Fractie_Id": "a", "Persoon_Id": "p2", "Soort": "Voor", "FractieGrootte": 33}])
    assert uit == {"a": ("Tegen", 33)}


def test_stemming_stopt_als_de_som_per_fractie_afwijkt_van_de_besluittekst():
    import pytest
    b = {"zaak": "W", "datum": "2026-11-12", "uitslag": "Aangenomen (76-74).", "hoofdelijk": True,
         "stemmen": {"a": ("Voor", 80), "b": ("Tegen", 70)}}
    with pytest.raises(SystemExit):
        ak.stemming(b, "wet", {"a": "A", "b": "B"}, {}, [])
    b["stemmen"] = {"a": ("Voor", 76), "b": ("Tegen", 74)}
    assert ak.stemming(b, "wet", {"a": "A", "b": "B"}, {}, [])["voor"] == 76


def test_hoofdelijk_met_stemmen_telt_per_fractie_en_controleert_de_besluittekst():
    import pytest
    rij = lambda f, n, soort, g: {"ActorFractie": f, "FractieGrootte": g, "Soort": soort, "Fractie_Id": f, "Persoon_Id": n}  # noqa: E731
    stemmen = [rij("A", f"a{i}", "Voor", 3) for i in range(3)] + [rij("B", f"b{i}", "Tegen", 2) for i in range(2)]
    b = besluit(titel="x (Belastingplan 2027)", datum="2026-11-12", soort="Hoofdelijk", tekst="Aangenomen (3-2).", stemmen=[])
    b["Stemming"] = stemmen
    p = ak.plan_van(b, KABINETTEN, [])
    assert (p["voor"], p["tegen"], [f["fractie"] for f in p["tegenFracties"]]) == (3, 2, ["B"])
    b["BesluitTekst"] = "Aangenomen (4-1)."
    with pytest.raises(ValueError):
        ak.plan_van(b, KABINETTEN, [])


def test_hoofdelijk_stopt_als_een_fractie_verdeeld_stemde():
    import pytest
    rij = lambda f, n, soort: {"ActorFractie": f, "FractieGrootte": 3, "Soort": soort, "Fractie_Id": f, "Persoon_Id": n}  # noqa: E731
    b = besluit(titel="x (Belastingplan 2027)", datum="2026-11-12", soort="Hoofdelijk", tekst="Aangenomen (3-3).", stemmen=[])
    b["Stemming"] = [rij("A", "a1", "Voor"), rij("A", "a2", "Voor"), rij("A", "a3", "Tegen"),
                     rij("B", "b1", "Tegen"), rij("B", "b2", "Tegen"), rij("B", "b3", "Voor")]
    with pytest.raises(ValueError):
        ak.plan_van(b, KABINETTEN, [])
