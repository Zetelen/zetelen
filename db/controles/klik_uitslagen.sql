-- Vaste steekproef van 10 besluiten voor de kliktabel in docs/plan/controles-stappenplan.md (E7-S5).
-- Vast in plaats van willekeurig (volgorde op md5 van het id), zodat iedereen dezelfde 10 krijgt.
-- Alleen besluiten met een stemming per fractie en een zaak. Fracties en zaaknummers, geen namen.
with steekproef as (
    select b.id from core.besluit b
    where b.stemmingssoort = 'Met handopsteken'
      and exists (select 1 from core.besluit_zaak bz where bz.besluit_id = b.id)
      and exists (select 1 from core.fractiestem s where s.besluit_id = b.id)
    order by md5(b.id::text) limit 10
)
select b.datum, b.id as besluit_id,
       (select string_agg(z.nummer || ' ' || coalesce(z.soort, ''), ' | ')
        from core.besluit_zaak bz join core.zaak z on z.id = bz.zaak_id where bz.besluit_id = b.id) as zaak,
       (select string_agg(f.afkorting, ', ' order by f.afkorting)
        from core.fractiestem s join core.fractie f on f.id = s.fractie_id
        where s.besluit_id = b.id and s.soort = 'Voor') as voor,
       (select string_agg(f.afkorting, ', ' order by f.afkorting)
        from core.fractiestem s join core.fractie f on f.id = s.fractie_id
        where s.besluit_id = b.id and s.soort = 'Tegen') as tegen,
       (select sum(fractiegrootte) from core.fractiestem s where s.besluit_id = b.id and s.soort = 'Voor') as zetels_voor,
       (select sum(fractiegrootte) from core.fractiestem s where s.besluit_id = b.id and s.soort = 'Tegen') as zetels_tegen
from steekproef st join core.besluit b on b.id = st.id
order by b.datum;
