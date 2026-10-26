-- Vervolg op extra_rijen_ids.sql: verwijderingen waarbij de bron de koppeling leegmaakt, vallen buiten het
-- datumfilter van de verversing. Speelt dat ook bij Stemming? Aantallen om naast de API te leggen.
select 'stemming' as soort, count(*) as aantal from raw.stemming
union all
select 'stemming verwijderd', count(*) from raw.stemming where "Verwijderd"
union all
select 'besluit', count(*) from raw.besluit
union all
select 'besluit verwijderd', count(*) from raw.besluit where "Verwijderd"
union all
select 'agendapunt verwijderd', count(*) from raw.agendapunt where "Verwijderd";
