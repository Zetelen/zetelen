#!/usr/bin/env python3
"""Rechtencontrole van de database (component rechten, story E1-S6).

Leest alleen: elke controle is een query die de overtredingen opsomt. Geen
overtredingen = geslaagd. Draait in CI tegen de testdatabase en op Supabase na
elke migratie (workflow Migreer).

Gebruik:
  DATABASE_URL=... python3 pipeline/controleer_rechten.py
"""
import os
import sys

import psycopg

from verbindingstest import uitleg

# De schema's van dit project; de schema's die Supabase zelf beheert (auth, storage, ...) vallen erbuiten
EIGEN = "('public', 'api', 'core', 'raw', 'beheer', 'analyses')"
BEZOEKERS = "('anon', 'authenticated')"
# De enige functie die bezoekers mogen uitvoeren: het feedbackformulier (migratie 021, besluit Niels B13).
# Ze moet security definer zijn met een vast search_path; anders is het alsnog een overtreding.
TOEGESTANE_FUNCTIES = "('api.stuur_feedback')"

CONTROLES = [
    (
        "Elke tabel in de eigen schema's heeft Row Level Security aan",
        f"""select n.nspname || '.' || c.relname
            from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname in {EIGEN} and c.relkind in ('r', 'p') and not c.relrowsecurity""",
    ),
    (
        "Bezoekers kunnen nergens schrijven",
        f"""select r.rolname || ': ' || p.privilege_type || ' op ' || n.nspname || '.' || c.relname
            from pg_class c join pg_namespace n on n.oid = c.relnamespace
            cross join pg_roles r
            cross join (values ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE')) p(privilege_type)
            where n.nspname in {EIGEN} and c.relkind in ('r', 'p', 'v', 'm')
              and r.rolname in {BEZOEKERS}
              and has_table_privilege(r.oid, c.oid, p.privilege_type)""",
    ),
    (
        "Bezoekers kunnen raw niet lezen",
        f"""select r.rolname || ': ' || n.nspname || '.' || c.relname
            from pg_class c join pg_namespace n on n.oid = c.relnamespace
            cross join pg_roles r
            where n.nspname = 'raw' and r.rolname in {BEZOEKERS}
              and (has_schema_privilege(r.oid, n.oid, 'USAGE')
                   or has_table_privilege(r.oid, c.oid, 'SELECT'))""",
    ),
    (
        "Bezoekers lezen in beheer alleen klaar_op en status van verversing",
        f"""select r.rolname || ': ' || n.nspname || '.' || c.relname || '.' || a.attname
            from pg_class c join pg_namespace n on n.oid = c.relnamespace
            join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
            cross join pg_roles r
            where n.nspname = 'beheer' and r.rolname in {BEZOEKERS}
              and has_column_privilege(r.oid, c.oid, a.attnum, 'SELECT')
              and not (c.relname = 'verversing' and a.attname in ('klaar_op', 'status'))""",
    ),
    (
        "Elke view in de eigen schema's leest met de rechten van de bezoeker (security_invoker)",
        f"""select n.nspname || '.' || c.relname
            from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname in {EIGEN} and c.relkind = 'v'
              and not coalesce('security_invoker=true' = any(c.reloptions), false)""",
    ),
    (
        "Bezoekers kunnen geen functies in de eigen schema's uitvoeren",
        f"""select r.rolname || ': ' || n.nspname || '.' || p.proname
            from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            cross join pg_roles r
            where n.nspname in {EIGEN} and r.rolname in {BEZOEKERS}
              and has_function_privilege(r.oid, p.oid, 'EXECUTE')
              and n.nspname || '.' || p.proname not in {TOEGESTANE_FUNCTIES}""",
    ),
    (
        "De toegestane functie draait als eigenaar met een vast search_path",
        f"""select n.nspname || '.' || p.proname
            from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname || '.' || p.proname in {TOEGESTANE_FUNCTIES}
              and not (p.prosecdef and coalesce(array_to_string(p.proconfig, ',') like '%search_path=%', false))""",
    ),
]


def controleer(conn):
    """Geeft per controle de lijst met overtredingen terug."""
    return [(naam, [r[0] for r in conn.execute(sql).fetchall()]) for naam, sql in CONTROLES]


def main():
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("DATABASE_URL ontbreekt.")
    try:
        with psycopg.connect(url, autocommit=True) as conn:
            conn.execute("set default_transaction_read_only = on")
            uitkomst = controleer(conn)
    except psycopg.Error as fout:
        sys.exit(f"Rechtencontrole niet uitgevoerd. {uitleg(fout)}")
    fout = False
    for naam, overtredingen in uitkomst:
        print(("GOED  " if not overtredingen else "FOUT  ") + naam)
        for o in overtredingen:
            print(f"      {o}")
        fout = fout or bool(overtredingen)
    if fout:
        sys.exit("Rechtencontrole mislukt.")
    print("Rechtencontrole geslaagd.")


if __name__ == "__main__":
    main()
