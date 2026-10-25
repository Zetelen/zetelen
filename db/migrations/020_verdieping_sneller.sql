-- Verdieping sneller en vollediger (25 oktober 2026):
--   1. "hoort ook bij" wordt per besluit een keer uitgerekend in plaats van per rij (herbouw ruim 6 minuten)
--   2. stemmingen zonder dossier staan er ook in, onder Overig als "Zonder dossier", zodat ze een titel hebben
--      (bij de coalitiebouwer ontbrak bij JA21 onder Jetten bij 23 van de 59 beslissende stemmingen het terrein)
-- De rest van analyses.herbouw_terrein() is ongewijzigd uit 016_verdieping.sql.

create or replace function analyses.herbouw_terrein()
returns table (tabel text, rijen bigint)
language plpgsql
as $$
begin
    truncate analyses.besluit_terrein, analyses.cohesie_terrein, analyses.terrein_periode, analyses.stemming_dossier;

    -- Elk beleidsterrein van de dossiers van de zaken van een besluit telt (besluit Niels: overal meetellen)
    insert into analyses.besluit_terrein (besluit_id, beleidsterrein)
    select distinct bz.besluit_id, d.beleidsterrein
    from core.besluit_zaak bz
    join core.zaak_dossier zd on zd.zaak_id = bz.zaak_id
    join core.dossier d on d.id = zd.dossier_id
    where exists (select 1 from analyses.fractie_besluit_stem s where s.besluit_id = bz.besluit_id);

    insert into analyses.cohesie_terrein (periodesoort, periode, beleidsterrein, variant, fractie_a, fractie_b,
                                          gezamenlijk, gelijk, cohesie, te_weinig_data)
    with verdeeld as (
        select besluit_id, bool_or(stem = 'Voor') and bool_or(stem = 'Tegen') as verdeeld
        from analyses.fractie_besluit_stem
        group by besluit_id
    ),
    besluit_periode as (
        select b.id as besluit_id, p.periodesoort, p.periode, t.beleidsterrein, v.verdeeld
        from core.besluit b
        join verdeeld v on v.besluit_id = b.id
        join analyses.besluit_terrein t on t.besluit_id = b.id
        cross join lateral (values ('kabinet', b.kabinet), ('kamerperiode', b.kamerperiode)) p(periodesoort, periode)
        where p.periode is not null
    ),
    varianten as (
        select bp.periodesoort, bp.periode, bp.beleidsterrein, v.variant,
               a.fractie_id as fractie_a, b.fractie_id as fractie_b, (a.stem = b.stem) as gelijk
        from besluit_periode bp
        join analyses.fractie_besluit_stem a on a.besluit_id = bp.besluit_id
        join analyses.fractie_besluit_stem b on b.besluit_id = bp.besluit_id and a.fractie_id < b.fractie_id
        cross join lateral (values ('alle', true), ('verdeeld', bp.verdeeld)) v(variant, telt_mee)
        where v.telt_mee
    )
    select periodesoort, periode, beleidsterrein, variant, fractie_a, fractie_b,
           count(*), count(*) filter (where gelijk),
           case when count(*) >= 25 then round(100.0 * count(*) filter (where gelijk) / count(*), 1) end,
           count(*) < 25
    from varianten
    group by periodesoort, periode, beleidsterrein, variant, fractie_a, fractie_b;

    insert into analyses.terrein_periode (periodesoort, periode, beleidsterrein, stemmingen)
    select p.periodesoort, p.periode, t.beleidsterrein, count(*)
    from analyses.besluit_terrein t
    join core.besluit b on b.id = t.besluit_id
    cross join lateral (values ('kabinet', b.kabinet), ('kamerperiode', b.kamerperiode)) p(periodesoort, periode)
    where p.periode is not null
    group by 1, 2, 3;

    -- Verdieping: per stemming en dossier wat de site toont, met de stem van elke fractie
    insert into analyses.stemming_dossier (besluit_id, dossier_id, datum, kabinet, kamerperiode, zaak_nummer, zaak_soort,
                                           onderwerp, uitslag, dossier_nummer, dossier_toevoeging, dossier_titel,
                                           beleidsterrein, andere_dossiers, verdeeld, stemmen)
    with zaak_per_besluit as (
        -- Een besluit gaat vrijwel altijd over een zaak; bij meer zaken de eerste op nummer
        select distinct on (bz.besluit_id) bz.besluit_id, z.id as zaak_id, z.nummer, z.soort, coalesce(z.onderwerp, z.titel) as onderwerp
        from core.besluit_zaak bz
        join core.zaak z on z.id = bz.zaak_id
        order by bz.besluit_id, z.nummer
    ),
    besluit_dossier as (
        select distinct bz.besluit_id, zd.dossier_id
        from core.besluit_zaak bz
        join core.zaak_dossier zd on zd.zaak_id = bz.zaak_id
    ),
    -- Per besluit alle dossiers in een keer (was: per rij opnieuw zoeken, ruim 6 minuten)
    per_besluit as (
        select bd.besluit_id, array_agg(bd.dossier_id order by d.titel) as ids, array_agg(d.titel order by d.titel) as titels
        from besluit_dossier bd join core.dossier d on d.id = bd.dossier_id
        group by bd.besluit_id
    ),
    stemmen as (
        select besluit_id, jsonb_object_agg(fractie_id::text, stem) as stemmen,
               bool_or(stem = 'Voor') and bool_or(stem = 'Tegen') as verdeeld
        from analyses.fractie_besluit_stem
        group by besluit_id
    )
    select bd.besluit_id, bd.dossier_id, b.datum, b.kabinet, b.kamerperiode, zb.nummer, zb.soort, zb.onderwerp,
           b.besluittekst, d.nummer, d.toevoeging, d.titel, d.beleidsterrein,
           array(select u.titel from unnest(pb.ids, pb.titels) u(id, titel) where u.id <> bd.dossier_id),
           s.verdeeld, s.stemmen
    from besluit_dossier bd
    join core.besluit b on b.id = bd.besluit_id
    join core.dossier d on d.id = bd.dossier_id
    join stemmen s on s.besluit_id = bd.besluit_id
    join per_besluit pb on pb.besluit_id = bd.besluit_id
    left join zaak_per_besluit zb on zb.besluit_id = bd.besluit_id
    union all
    -- Stemmingen zonder dossier (bijvoorbeeld over een verzoek of een procedure): onder Overig, met een vaste
    -- dossiersleutel, zodat ze in de verdieping en bij de coalitiebouwer ook een titel hebben
    select b.id, '00000000-0000-0000-0000-000000000000'::uuid, b.datum, b.kabinet, b.kamerperiode, zb.nummer, zb.soort, zb.onderwerp,
           b.besluittekst, null, null, 'Zonder dossier', 'Overig', '{}'::text[], s.verdeeld, s.stemmen
    from core.besluit b
    join stemmen s on s.besluit_id = b.id
    left join zaak_per_besluit zb on zb.besluit_id = b.id
    where not exists (select 1 from besluit_dossier bd where bd.besluit_id = b.id);

    return query
        select 'besluit_terrein', count(*) from analyses.besluit_terrein
        union all select 'cohesie_terrein', count(*) from analyses.cohesie_terrein
        union all select 'terrein_periode', count(*) from analyses.terrein_periode
        union all select 'stemming_dossier', count(*) from analyses.stemming_dossier;
end;
$$;

revoke execute on function analyses.herbouw_terrein() from public;
