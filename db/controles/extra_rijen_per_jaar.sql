-- Vervolg op extra_rijen.sql: aantallen agendapunten en besluiten per jaar van de activiteit, om naast
-- dezelfde telling in de API te leggen. Alleen aantallen, geen inhoud. Draait via de workflow Controlequery.
with ap as (
  select a."Id", extract(year from ac."Datum")::int as jaar
  from raw.agendapunt a left join raw.activiteit ac on ac."Id" = a."Activiteit_Id"
)
select 'agendapunt' as soort, coalesce(jaar::text, 'geen datum') as jaar, count(*) as aantal from ap group by 2
union all
select 'besluit', coalesce(ap.jaar::text, 'geen datum'), count(*)
from raw.besluit b left join ap on ap."Id" = b."Agendapunt_Id" group by 2
union all
select 'agendapunt', 'totaal', count(*) from raw.agendapunt
union all
select 'besluit', 'totaal', count(*) from raw.besluit
order by 1, 2;
