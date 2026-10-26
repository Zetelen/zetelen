-- Vervolg op extra_rijen_2026.sql: het verschil zit op vier dagen. Ids van de agendapunten op die dagen,
-- om naast de ids in de API te leggen. Ids en tijdstippen, geen inhoud. Draait via de workflow Controlequery.
select ac."Datum"::date::text as dag, a."Id"::text as agendapunt_id, a."Verwijderd"::text as verwijderd,
       a."ApiGewijzigdOp"::text as api_gewijzigd_op, a._geladen_op::text as geladen_op,
       (select count(*) from raw.besluit b where b."Agendapunt_Id" = a."Id") as besluiten
from raw.agendapunt a join raw.activiteit ac on ac."Id" = a."Activiteit_Id"
where ac."Datum"::date in ('2026-10-27', '2026-10-29', '2026-11-02', '2026-12-09')
order by 1, 2;
