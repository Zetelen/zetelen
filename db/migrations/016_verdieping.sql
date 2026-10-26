-- Verdieping per dossier en stemming (component onderwerpen; verzoek Niels, 25 oktober 2026): in de vergelijking
-- van twee fracties per terrein de dossiers, en per dossier de stemmingen met wat beide fracties stemden.
-- Een API-functie mag niet (bezoekers voeren geen functies uit, component rechten); daarom een vooraf berekende
-- tabel, opgebouwd in analyses.herbouw_terrein(). Een rij per stemming en dossier: een stemming bij twee dossiers
-- staat er twee keer in, met in andere_dossiers de titel van het andere dossier.
--   stemmen   per fractie (id als tekst) 'Voor' of 'Tegen', zoals in analyses.fractie_besluit_stem
--   verdeeld  er stemden fracties voor en fracties tegen (voor de variant "alleen verdeelde stemmingen")

create unlogged table analyses.stemming_dossier (
    besluit_id uuid not null,
    dossier_id uuid not null,
    datum date not null,
    kabinet text,
    kamerperiode text,
    zaak_nummer text,
    zaak_soort text,
    onderwerp text,
    uitslag text,
    dossier_nummer integer,
    dossier_toevoeging text,
    dossier_titel text,
    beleidsterrein text not null,
    andere_dossiers text[] not null,
    verdeeld boolean not null,
    stemmen jsonb not null,
    primary key (besluit_id, dossier_id)
);

create index on analyses.stemming_dossier (beleidsterrein, kabinet);
create index on analyses.stemming_dossier (beleidsterrein, kamerperiode);

alter table analyses.stemming_dossier enable row level security;
create policy lezen on analyses.stemming_dossier for select to anon, authenticated using (true);
grant select on analyses.stemming_dossier to anon, authenticated;

create view api.stemming_dossier with (security_invoker = true) as
    select besluit_id as besluit, dossier_id as dossier, datum, kabinet, kamerperiode, zaak_nummer, zaak_soort, onderwerp,
           uitslag, dossier_nummer, dossier_toevoeging, dossier_titel, beleidsterrein, andere_dossiers, verdeeld, stemmen
    from analyses.stemming_dossier;
grant select on api.stemming_dossier to anon, authenticated;

-- De herbouw met de verdieping erbij (rest ongewijzigd uit 014_onderwerpen.sql)
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
    stemmen as (
        select besluit_id, jsonb_object_agg(fractie_id::text, stem) as stemmen,
               bool_or(stem = 'Voor') and bool_or(stem = 'Tegen') as verdeeld
        from analyses.fractie_besluit_stem
        group by besluit_id
    )
    select bd.besluit_id, bd.dossier_id, b.datum, b.kabinet, b.kamerperiode, zb.nummer, zb.soort, zb.onderwerp,
           b.besluittekst, d.nummer, d.toevoeging, d.titel, d.beleidsterrein,
           array(select d2.titel from besluit_dossier bd2 join core.dossier d2 on d2.id = bd2.dossier_id
                 where bd2.besluit_id = bd.besluit_id and bd2.dossier_id <> bd.dossier_id order by d2.titel),
           s.verdeeld, s.stemmen
    from besluit_dossier bd
    join core.besluit b on b.id = bd.besluit_id
    join core.dossier d on d.id = bd.dossier_id
    join stemmen s on s.besluit_id = bd.besluit_id
    left join zaak_per_besluit zb on zb.besluit_id = bd.besluit_id;

    return query
        select 'besluit_terrein', count(*) from analyses.besluit_terrein
        union all select 'cohesie_terrein', count(*) from analyses.cohesie_terrein
        union all select 'terrein_periode', count(*) from analyses.terrein_periode
        union all select 'stemming_dossier', count(*) from analyses.stemming_dossier;
end;
$$;

revoke execute on function analyses.herbouw_terrein() from public;
