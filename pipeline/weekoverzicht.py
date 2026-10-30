#!/usr/bin/env python3
"""Weekoverzicht van de stemmingen, als aanleiding voor een stuk onder /actueel (besluit Niels, 30 oktober 2026).

Draait op woensdagochtend, na de stemmingen van dinsdag en de nachtelijke verversing. Kijkt naar de verdeelde
stemmingen van de afgelopen zeven dagen onder het huidige kabinet en zet vier lijstjes in een notitie:

1. Krapste uitslagen: het kleinste verschil tussen de zetels voor en tegen, gerekend met de zetels van de fracties.
   Bij een hoofdelijke stemming kan de echte uitslag iets afwijken; de uitslag uit de bron staat erbij.
2. Kabinet verdeeld: de kabinetsfracties stemden niet allemaal dezelfde kant.
3. Aangenomen tegen het kabinet in: aangenomen terwijl alle kabinetsfracties tegen stemden.
4. Ongewone paren: twee fracties die onder dit kabinet zelden samen stemmen (cohesie onder ONGEWOON), deze week
   wel, op minstens MIN_ONGEWOON stemmingen.

Het is een lijst om uit te kiezen, geen analyse: wat de moeite waard is, gaat via pipeline/actueel.py en een aparte
controle naar de site.

De notitie komt in de map die als argument wordt meegegeven (de vault), zodat dat pad niet in deze publieke repo
staat. Uitvoer in de terminal: alleen aantallen. De notitie bevat onderwerpen van stemmingen; daar mogen namen van
Kamerleden in staan.

Verbinding: de publieke Data API (SUPABASE_URL en SUPABASE_PUBLISHABLE_KEY), zoals pipeline/actueel.py.

Gebruik:
  set -a; . web/.env.local; set +a
  python3 pipeline/weekoverzicht.py <map> [--tot 2026-11-04]
"""
import argparse
import json
from collections import defaultdict
from datetime import date, timedelta
from itertools import combinations
from pathlib import Path

import actueel as ac

DAGEN = 7
KRAPSTE = 5
ONGEWOON = 50.0
MIN_ONGEWOON = 2
MAX_PAREN = 8  # meer is niet door te lezen; de proefrun van 28 oktober gaf er 30
LINK = "https://www.tweedekamer.nl/zoeken?qry="


# ---------- rekenen (zonder netwerk, getest) ----------

def zetels_per_kant(stemmen: dict, fracties: dict, zetels: dict) -> dict:
    """Zetels voor en tegen. fracties: afkorting naar id-lijst (met eerdere namen)."""
    uit = {"Voor": 0, "Tegen": 0}
    for afk, ids in fracties.items():
        s = ac.stem(stemmen, ids)
        if s in uit:
            uit[s] += zetels.get(afk, 0)
    return uit


def krapste(besluiten: list, fracties: dict, zetels: dict, n: int = KRAPSTE) -> list:
    rijen = []
    for b in besluiten:
        k = zetels_per_kant(b["stemmen"], fracties, zetels)
        rijen.append({**b, "voor": k["Voor"], "tegen": k["Tegen"], "verschil": abs(k["Voor"] - k["Tegen"])})
    return sorted(rijen, key=lambda r: (r["verschil"], r["datum"], r["besluit"]))[:n]


def kabinet_verdeeld(besluiten: list, kabinet: dict) -> list:
    """Stemmingen waarop de kabinetsfracties die stemden niet allemaal dezelfde kant kozen, met wie wat stemde."""
    uit = []
    for b in besluiten:
        st = {a: ac.stem(b["stemmen"], ids) for a, ids in kabinet.items()}
        kanten = {s for s in st.values() if s in ac.STEMKANTEN}
        if len(kanten) == 2:
            uit.append({**b, "kabinet": st})
    return uit


def tegen_kabinet_in(besluiten: list, kabinet: dict) -> list:
    return [b for b in besluiten
            if (b["uitslag"] or "").lower().startswith("aangenomen") and ac.kant(b["stemmen"], list(kabinet.values())) == "Tegen"]


def ongewone_paren(besluiten: list, fracties: dict, cohesie: dict, grens: float = ONGEWOON, minimum: int = MIN_ONGEWOON) -> list:
    """Paren met cohesie onder de grens die deze week op minstens `minimum` stemmingen dezelfde kant kozen.
    cohesie: frozenset({a, b}) naar percentage."""
    samen = defaultdict(list)
    for b in besluiten:
        st = {a: ac.stem(b["stemmen"], ids) for a, ids in fracties.items()}
        for x, y in combinations(sorted(st), 2):
            c = cohesie.get(frozenset((x, y)))
            if c is not None and c < grens and st[x] in ac.STEMKANTEN and st[x] == st[y]:
                samen[(x, y)].append(b)
    rijen = [{"a": x, "b": y, "cohesie": cohesie[frozenset((x, y))], "stemmingen": l} for (x, y), l in samen.items() if len(l) >= minimum]
    return sorted(rijen, key=lambda r: (-len(r["stemmingen"]), r["cohesie"]))


def regel(b: dict) -> str:
    nummer = f"[{b['zaak_nummer']}]({LINK}{b['zaak_nummer']})" if b.get("zaak_nummer") else "zonder nummer"
    return f"{b['datum']} · {b.get('zaak_soort') or ''} {nummer} · {b.get('uitslag') or ''} · {b.get('onderwerp') or ''}"


def kabinet_stemmen(st: dict) -> str:
    return ", ".join(f"{a} {s or 'niet gestemd'}" for a, s in st.items())


def notitie(tot: str, kabinet_naam: str, aantal: int, kr: list, verdeeld: list, tegen: list, paren: list) -> str:
    d = ["---", "type: weekoverzicht", 'project: "[[Zetelen]]"', f"datum: {tot}", "---",
         f"# Stemmingen van de week tot {tot}", "",
         f"{aantal} verdeelde stemmingen in de zeven dagen tot {tot}, kabinet-{kabinet_naam}. Een lijst om uit te kiezen: "
         "wat de moeite waard is, gaat via `pipeline/actueel.py` en een aparte controle naar de site.", ""]
    d += ["## Krapste uitslagen", "", "Verschil in zetels van de fracties; bij een hoofdelijke stemming kan de echte uitslag afwijken.", ""]
    d += [f"- {r['voor']} tegen {r['tegen']} · {regel(r)}" for r in kr] or ["- Geen."]
    d += ["", "## Kabinet verdeeld", ""]
    d += [f"- {kabinet_stemmen(r['kabinet'])} · {regel(r)}" for r in verdeeld] or ["- Geen."]
    d += ["", "## Aangenomen tegen het kabinet in", ""]
    d += [f"- {regel(r)}" for r in tegen] or ["- Geen."]
    d += ["", f"## Ongewone paren (cohesie onder {ONGEWOON:.0f}%, deze week samen)", ""]
    if len(paren) > MAX_PAREN:
        d += [f"De {MAX_PAREN} paren met de meeste stemmingen, van {len(paren)}.", ""]
    for p in paren[:MAX_PAREN]:
        d.append(f"- **{p['a']} en {p['b']}** (cohesie {p['cohesie']:.0f}%): {len(p['stemmingen'])} keer dezelfde kant")
        d += [f"  - {regel(b)}" for b in p["stemmingen"][:5]]
    if not paren:
        d.append("- Geen.")
    return "\n".join(d) + "\n"


# ---------- hoofdprogramma ----------

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("map", type=Path)
    ap.add_argument("--tot", default=date.today().isoformat(), help="laatste dag, standaard vandaag (die telt niet mee)")
    a = ap.parse_args(argv)
    tot = date.fromisoformat(a.tot)
    van = tot - timedelta(days=DAGEN)

    kab = next(k for k in ac.alle("kabinet?select=naam,begin,einde", "begin") if k["einde"] is None)["naam"]
    fr = ac.alle(f"fractie_periode?periodesoort=eq.kabinet&periode=eq.{kab}&select=fractie,afkorting,zetels,in_zaal", "fractie")
    zaal = {r["afkorting"]: r for r in fr if r["in_zaal"]}
    terug = ac.voorgangers(json.loads(ac.OPVOLGERS.read_text(encoding="utf-8")))
    ids = {x: [zaal[x]["fractie"]] + terug.get(zaal[x]["fractie"], []) for x in zaal}
    zetels = {x: zaal[x]["zetels"] for x in zaal}
    # Gedoogsteun telt als kabinet, zoals elders op de site
    kabinet_afk = [r["afkorting"] for r in ac.alle(f"coalitie?kabinet=eq.{kab}&select=afkorting,rol", "afkorting")]
    kabinet = {x: ids[x] for x in kabinet_afk if x in ids}
    coh = {frozenset((r["fractie_afkorting"], r["andere_fractie_afkorting"])): r["cohesie"]
           for r in ac.alle(f"cohesie?periodesoort=eq.kabinet&periode=eq.{kab}&variant=eq.verdeeld&te_weinig_data=is.false"
                            "&select=fractie_afkorting,andere_fractie_afkorting,cohesie", "fractie,andere_fractie")}
    rijen = ac.alle(f"stemming_dossier?kabinet=eq.{kab}&verdeeld=is.true&datum=gte.{van}&datum=lt.{tot}"
                    "&select=besluit,datum,zaak_nummer,zaak_soort,onderwerp,uitslag,stemmen", "besluit,dossier")
    besluiten = sorted({r["besluit"]: r for r in rijen}.values(), key=lambda b: (b["datum"], b["besluit"]))

    kr, verdeeld, tegen = krapste(besluiten, ids, zetels), kabinet_verdeeld(besluiten, kabinet), tegen_kabinet_in(besluiten, kabinet)
    paren = ongewone_paren(besluiten, {x: ids[x] for x in zaal if zetels[x] >= ac.MIN_ZETELS}, coh)
    a.map.mkdir(parents=True, exist_ok=True)
    pad = a.map / f"Stemmingen {tot.isoformat()}.md"
    pad.write_text(notitie(tot.isoformat(), kab, len(besluiten), kr, verdeeld, tegen, paren), encoding="utf-8")
    print(f"{len(besluiten)} verdeelde stemmingen, kabinet verdeeld {len(verdeeld)}, tegen kabinet in {len(tegen)}, "
          f"ongewone paren {len(paren)}; notitie geschreven")


if __name__ == "__main__":
    main()
