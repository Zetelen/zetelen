-- Vaste steekproef voor de nacontrole van cohesie (E2-S2), voor de kliktabel in docs/plan/controles-stappenplan.md.
-- Paar VVD en CDA onder Schoof, zoals steekproef_cohesie.sql, maar vast (volgorde op md5 van het id).
-- Eerst 10 besluiten met beide stemmen, daarna de berekende cohesie. Fracties en zaaknummers, geen namen.
with paar as (
    select (select id from core.fractie where afkorting = 'VVD' and actief_tot is null) as a,
           (select id from core.fractie where afkorting = 'CDA' and actief_tot is null) as b,
           'Schoof'::text as kabinet
), rijen as (
    select b.datum, b.id as besluit_id,
           (select string_agg(z.nummer || ' ' || coalesce(z.soort, ''), ' | ')
            from core.besluit_zaak bz join core.zaak z on z.id = bz.zaak_id where bz.besluit_id = b.id) as zaak,
           sa.stem as stem_vvd, sb.stem as stem_cda,
           (sa.afgeleid or sb.afgeleid)::text as afgeleid_uit_leden
    from paar
    join core.besluit b on b.kabinet = paar.kabinet
    join analyses.fractie_besluit_stem sa on sa.besluit_id = b.id and sa.fractie_id = paar.a
    join analyses.fractie_besluit_stem sb on sb.besluit_id = b.id and sb.fractie_id = paar.b
    order by md5(b.id::text) limit 10
)
select datum::text, besluit_id::text, zaak, stem_vvd, stem_cda, afgeleid_uit_leden from rijen
union all
select 'cohesie ' || variant, gezamenlijk::text, gelijk::text, cohesie::text, null, null
from api.cohesie
where periodesoort = 'kabinet' and periode = 'Schoof'
  and fractie_afkorting = 'VVD' and andere_fractie_afkorting = 'CDA'
union all
select 'cohesie ' || variant || ' (omgekeerd)', gezamenlijk::text, gelijk::text, cohesie::text, null, null
from api.cohesie
where periodesoort = 'kabinet' and periode = 'Schoof'
  and fractie_afkorting = 'CDA' and andere_fractie_afkorting = 'VVD';
