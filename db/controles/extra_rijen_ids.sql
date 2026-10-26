-- Vervolg op extra_rijen_2026.sql: het verschil zit op vier dagen. Ids van de agendapunten op die dagen,
-- om naast de ids in de API te leggen. Ids en tijdstippen, geen inhoud. Draait via de workflow Controlequery.
with ap as (
  select ac."Datum"::date as dag, a."Id", a."Verwijderd", a."ApiGewijzigdOp", a._geladen_op
  from raw.agendapunt a join raw.activiteit ac on ac."Id" = a."Activiteit_Id"
  where ac."Datum" >= '2026-10-27' and ac."Datum" < '2026-12-10'
)
select ap.dag::text, ap."Id"::text as agendapunt_id, ap."Verwijderd"::text as verwijderd,
       ap."ApiGewijzigdOp"::text as api_gewijzigd_op, ap._geladen_op::text as geladen_op,
       count(b."Id") as besluiten
from ap left join raw.besluit b on b."Agendapunt_Id" = ap."Id"
where ap.dag in ('2026-10-27', '2026-10-29', '2026-11-02', '2026-12-09')
group by 1, 2, 3, 4, 5
order by 1, 2;
