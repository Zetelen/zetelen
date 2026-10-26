-- Vervolg op extra_rijen_per_jaar.sql: het verschil met de API zit in 2026. Aantallen per dag van de
-- activiteit, om naast de API te leggen. Alleen aantallen, geen inhoud. Draait via de workflow Controlequery.
with ap as (
  select a."Id", ac."Datum"::date as dag
  from raw.agendapunt a join raw.activiteit ac on ac."Id" = a."Activiteit_Id"
  where ac."Datum" >= '2026-01-01' and ac."Datum" < '2027-01-01'
)
select ap.dag::text, count(distinct ap."Id") as agendapunten, count(b."Id") as besluiten
from ap left join raw.besluit b on b."Agendapunt_Id" = ap."Id"
group by ap.dag order by ap.dag;
