-- Kandidaten voor de opening van Onderwerpen (B16 in docs/plan/te-beoordelen.md): hoofdelijke stemmingen sinds
-- 2016 waarin fracties verdeeld stemden en de uitslag krap was. Alleen datum, zaaknummer, soort en aantallen,
-- geen namen. Draait via de workflow Controlequery.
with per_fractie as (
    select ps.besluit_id, ps.fractie_id,
           count(*) filter (where ps.soort = 'Voor') as voor, count(*) filter (where ps.soort = 'Tegen') as tegen
    from core.persoonsstem ps
    where not ps.vergissing and ps.fractie_id is not null
    group by 1, 2
), per_besluit as (
    select besluit_id, sum(voor) as voor, sum(tegen) as tegen,
           count(*) filter (where voor > 0 and tegen > 0) as verdeelde_fracties
    from per_fractie group by 1
)
select b.datum::text, (select string_agg(z.nummer || ' ' || coalesce(z.soort, ''), ' | ')
                        from core.besluit_zaak bz join core.zaak z on z.id = bz.zaak_id where bz.besluit_id = b.id) as zaak,
       p.voor, p.tegen, p.verdeelde_fracties
from per_besluit p join core.besluit b on b.id = p.besluit_id
where b.stemmingssoort = 'Hoofdelijk' and b.datum >= '2016-01-01' and p.verdeelde_fracties >= 2
order by p.verdeelde_fracties desc, abs(p.voor - p.tegen), b.datum desc
limit 25;
