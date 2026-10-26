-- Zetelwerk: moties en amendementen met indieners, uitslag, steun en rol (component zetelwerk,
-- docs/plan/08-componenten/zetelwerk.md; definities goedgekeurd door Niels op 25 oktober 2026).
--   uitslag    uit de stemmen: aangenomen als de zetels voor meer zijn dan de zetels tegen. Bij handopsteken de
--              fractiegrootte, bij hoofdelijk het aantal leden dat voor of tegen stemde; vergissingen tellen niet
--   laatste    is er vaker over een zaak gestemd, dan telt de laatste stemming
--   rol        kabinet of oppositie op de datum van de stemming, uit core.coalitie; gedoogsteun telt als kabinet
--   indieners  elke indiener telt volledig; medeindieners apart
--   brede steun  aangenomen met stemmen voor van minstens een kabinets- en een oppositiefractie die geen indiener is
-- Moties en amendementen worden nooit opgeteld. Namen van Kamerleden alleen op de site, nooit in logs.

create unlogged table analyses.zaak_uitslag (
    zaak_id uuid primary key,
    soort text not null check (soort in ('Motie', 'Amendement')),
    nummer text,
    onderwerp text,
    besluit_id uuid not null,
    datum date not null,
    kabinet text,
    kamerperiode text,
    zetels_voor integer not null,
    zetels_tegen integer not null,
    aangenomen boolean not null,
    fracties_voor uuid[] not null,
    indiener_rol text,          -- kabinet, oppositie of gemengd (indieners uit beide)
    brede_steun boolean not null default false
);

create unlogged table analyses.indiening (
    zaak_id uuid not null,
    persoon_id uuid not null,
    naam text not null,
    relatie text not null check (relatie in ('Indiener', 'Medeindiener')),
    fractie_id uuid,
    fractie_afkorting text,
    rol text not null check (rol in ('kabinet', 'oppositie')),
    primary key (zaak_id, persoon_id, relatie)
);

create unlogged table analyses.zetelwerk_fractie (
    periodesoort text not null check (periodesoort in ('kabinet', 'kamerperiode')),
    periode text not null,
    fractie_id uuid not null,
    afkorting text,
    soort text not null,
    rol text not null,                 -- de rol bij de meeste eigen stukken in de periode
    ingediend integer not null,        -- stukken met een indiener uit deze fractie
    mede integer not null,             -- stukken met een medeindiener uit deze fractie, zonder eigen indiener
    aangenomen integer not null,       -- van de ingediende
    brede_steun integer not null,      -- van de ingediende
    mediaan_zetels_voor numeric,       -- van de ingediende
    tegen_aandeel numeric(4, 1),       -- aandeel tegenstemmen over alle stemmingen in de periode (los van soort)
    primary key (periodesoort, periode, fractie_id, soort)
);

create unlogged table analyses.zetelwerk_persoon (
    periodesoort text not null check (periodesoort in ('kabinet', 'kamerperiode')),
    periode text not null,
    persoon_id uuid not null,
    naam text not null,
    fractie_afkorting text,            -- de fractie bij het laatste eigen stuk in de periode
    soort text not null,
    ingediend integer not null,
    mede integer not null,
    aangenomen integer not null,
    brede_steun integer not null,
    primary key (periodesoort, periode, persoon_id, soort)
);

create unlogged table analyses.zetelwerk_jaar (
    jaar integer not null,
    soort text not null,
    indiener_rol text not null,
    ingediend integer not null,
    aangenomen integer not null,
    primary key (jaar, soort, indiener_rol)
);

create unlogged table analyses.indiening_netwerk (
    periodesoort text not null check (periodesoort in ('kabinet', 'kamerperiode')),
    periode text not null,
    soort text not null,
    fractie_a text not null,
    fractie_b text not null,
    stukken integer not null,          -- stukken met indieners of medeindieners uit allebei
    primary key (periodesoort, periode, soort, fractie_a, fractie_b)
);

alter table analyses.zaak_uitslag enable row level security;
alter table analyses.indiening enable row level security;
alter table analyses.zetelwerk_fractie enable row level security;
alter table analyses.zetelwerk_persoon enable row level security;
alter table analyses.zetelwerk_jaar enable row level security;
alter table analyses.indiening_netwerk enable row level security;
create policy lezen on analyses.zaak_uitslag for select to anon, authenticated using (true);
create policy lezen on analyses.indiening for select to anon, authenticated using (true);
create policy lezen on analyses.zetelwerk_fractie for select to anon, authenticated using (true);
create policy lezen on analyses.zetelwerk_persoon for select to anon, authenticated using (true);
create policy lezen on analyses.zetelwerk_jaar for select to anon, authenticated using (true);
create policy lezen on analyses.indiening_netwerk for select to anon, authenticated using (true);
grant select on analyses.zaak_uitslag, analyses.indiening, analyses.zetelwerk_fractie, analyses.zetelwerk_persoon,
    analyses.zetelwerk_jaar, analyses.indiening_netwerk to anon, authenticated;

create function analyses.herbouw_zetelwerk()
returns table (tabel text, rijen bigint)
language plpgsql
as $$
begin
    truncate analyses.zaak_uitslag, analyses.indiening, analyses.zetelwerk_fractie, analyses.zetelwerk_persoon,
             analyses.zetelwerk_jaar, analyses.indiening_netwerk;

    -- 1. Per motie en amendement de laatste stemming, met zetels voor en tegen uit de stemmen
    insert into analyses.zaak_uitslag (zaak_id, soort, nummer, onderwerp, besluit_id, datum, kabinet, kamerperiode,
                                       zetels_voor, zetels_tegen, aangenomen, fracties_voor)
    with laatste as (
        select distinct on (z.id) z.id as zaak_id, z.soort, z.nummer, coalesce(z.onderwerp, z.titel) as onderwerp,
               b.id as besluit_id, b.datum, b.kabinet, b.kamerperiode, b.stemmingssoort
        from core.zaak z
        join core.besluit_zaak bz on bz.zaak_id = z.id
        join core.besluit b on b.id = bz.besluit_id
        where z.soort in ('Motie', 'Amendement')
        order by z.id, b.datum desc, b.id desc
    ),
    zetels as (
        select l.zaak_id, f.soort, sum(f.fractiegrootte) as n
        from laatste l
        join core.fractiestem f on f.besluit_id = l.besluit_id
        where l.stemmingssoort is distinct from 'Hoofdelijk' and not f.vergissing and f.soort in ('Voor', 'Tegen')
        group by l.zaak_id, f.soort
        union all
        select l.zaak_id, ps.soort, count(*)
        from laatste l
        join core.persoonsstem ps on ps.besluit_id = l.besluit_id
        where l.stemmingssoort = 'Hoofdelijk' and not ps.vergissing and ps.soort in ('Voor', 'Tegen')
        group by l.zaak_id, ps.soort
    ),
    totaal as (
        select zaak_id, coalesce(sum(n) filter (where soort = 'Voor'), 0) as voor, coalesce(sum(n) filter (where soort = 'Tegen'), 0) as tegen
        from zetels group by zaak_id
    )
    select l.zaak_id, l.soort, l.nummer, l.onderwerp, l.besluit_id, l.datum, l.kabinet, l.kamerperiode,
           coalesce(t.voor, 0), coalesce(t.tegen, 0), coalesce(t.voor, 0) > coalesce(t.tegen, 0),
           coalesce((select array_agg(s.fractie_id order by s.fractie_id) from analyses.fractie_besluit_stem s
                     where s.besluit_id = l.besluit_id and s.stem = 'Voor'), '{}')
    from laatste l
    left join totaal t on t.zaak_id = l.zaak_id;

    -- 2. Indieners en medeindieners, met hun rol op de datum van de stemming (gedoogsteun telt als kabinet)
    insert into analyses.indiening (zaak_id, persoon_id, naam, relatie, fractie_id, fractie_afkorting, rol)
    select distinct on (u.zaak_id, za."Persoon_Id", za."Relatie")
           u.zaak_id, za."Persoon_Id", p.naam, za."Relatie", za."Fractie_Id", coalesce(f.afkorting, za."ActorFractie"),
           case when exists (select 1 from core.coalitie c
                             where c.kabinet = u.kabinet and c.fractie_afkorting = coalesce(f.afkorting, za."ActorFractie")
                               and (c.tot is null or u.datum < c.tot)) then 'kabinet' else 'oppositie' end
    from analyses.zaak_uitslag u
    join raw.zaakactor za on za."Zaak_Id" = u.zaak_id
    join core.persoon p on p.id = za."Persoon_Id"
    left join core.fractie f on f.id = za."Fractie_Id"
    where za."Relatie" in ('Indiener', 'Medeindiener') and not coalesce(za."Verwijderd", false)
    order by u.zaak_id, za."Persoon_Id", za."Relatie";

    -- 3. Rol van de indieners per stuk, en brede steun: aangenomen met stemmen voor van een kabinets- en een
    --    oppositiefractie die zelf geen indiener is
    update analyses.zaak_uitslag u
    set indiener_rol = r.rol
    from (
        select zaak_id, case when bool_and(rol = 'kabinet') then 'kabinet' when bool_and(rol = 'oppositie') then 'oppositie' else 'gemengd' end as rol
        from analyses.indiening where relatie = 'Indiener' group by zaak_id
    ) r
    where r.zaak_id = u.zaak_id;

    update analyses.zaak_uitslag u
    set brede_steun = true
    where u.aangenomen
      and exists (
          select 1 from unnest(u.fracties_voor) fv(id)
          join core.fractie f on f.id = fv.id
          where not exists (select 1 from analyses.indiening i where i.zaak_id = u.zaak_id and i.fractie_id = fv.id)
            and exists (select 1 from core.coalitie c where c.kabinet = u.kabinet and c.fractie_afkorting = f.afkorting
                        and (c.tot is null or u.datum < c.tot)))
      and exists (
          select 1 from unnest(u.fracties_voor) fv(id)
          join core.fractie f on f.id = fv.id
          where not exists (select 1 from analyses.indiening i where i.zaak_id = u.zaak_id and i.fractie_id = fv.id)
            and not exists (select 1 from core.coalitie c where c.kabinet = u.kabinet and c.fractie_afkorting = f.afkorting
                            and (c.tot is null or u.datum < c.tot)));

    -- 4. Per fractie, periode en soort
    insert into analyses.zetelwerk_fractie (periodesoort, periode, fractie_id, afkorting, soort, rol, ingediend, mede,
                                            aangenomen, brede_steun, mediaan_zetels_voor, tegen_aandeel)
    with stuk as (
        select p.periodesoort, p.periode, i.fractie_id, u.soort, u.zaak_id, u.aangenomen, u.brede_steun, u.zetels_voor,
               bool_or(i.relatie = 'Indiener') as eigen, mode() within group (order by i.rol) as rol
        from analyses.indiening i
        join analyses.zaak_uitslag u on u.zaak_id = i.zaak_id
        cross join lateral (values ('kabinet', u.kabinet), ('kamerperiode', u.kamerperiode)) p(periodesoort, periode)
        where p.periode is not null and i.fractie_id is not null
        group by 1, 2, 3, 4, 5, 6, 7, 8
    ),
    tegen as (
        select p.periodesoort, p.periode, s.fractie_id,
               round(100.0 * count(*) filter (where s.stem = 'Tegen') / count(*), 1) as aandeel
        from analyses.fractie_besluit_stem s
        join core.besluit b on b.id = s.besluit_id
        cross join lateral (values ('kabinet', b.kabinet), ('kamerperiode', b.kamerperiode)) p(periodesoort, periode)
        where p.periode is not null
        group by 1, 2, 3
    )
    select s.periodesoort, s.periode, s.fractie_id, f.afkorting, s.soort, mode() within group (order by s.rol),
           count(*) filter (where s.eigen), count(*) filter (where not s.eigen),
           count(*) filter (where s.eigen and s.aangenomen), count(*) filter (where s.eigen and s.brede_steun),
           percentile_cont(0.5) within group (order by s.zetels_voor) filter (where s.eigen),
           t.aandeel
    from stuk s
    join core.fractie f on f.id = s.fractie_id
    left join tegen t on t.periodesoort = s.periodesoort and t.periode = s.periode and t.fractie_id = s.fractie_id
    group by s.periodesoort, s.periode, s.fractie_id, f.afkorting, s.soort, t.aandeel;

    -- 5. Per Kamerlid, periode en soort
    insert into analyses.zetelwerk_persoon (periodesoort, periode, persoon_id, naam, fractie_afkorting, soort, ingediend,
                                            mede, aangenomen, brede_steun)
    select p.periodesoort, p.periode, i.persoon_id, min(i.naam),
           (array_agg(i.fractie_afkorting order by u.datum desc))[1], u.soort,
           count(*) filter (where i.relatie = 'Indiener'), count(*) filter (where i.relatie = 'Medeindiener'),
           count(*) filter (where i.relatie = 'Indiener' and u.aangenomen),
           count(*) filter (where i.relatie = 'Indiener' and u.brede_steun)
    from analyses.indiening i
    join analyses.zaak_uitslag u on u.zaak_id = i.zaak_id
    cross join lateral (values ('kabinet', u.kabinet), ('kamerperiode', u.kamerperiode)) p(periodesoort, periode)
    where p.periode is not null
    group by p.periodesoort, p.periode, i.persoon_id, u.soort;

    -- 6. Per jaar, soort en rol van de indieners (hoofdstuk 1 van Oppositiewerk)
    insert into analyses.zetelwerk_jaar (jaar, soort, indiener_rol, ingediend, aangenomen)
    select extract(year from datum)::integer, soort, coalesce(indiener_rol, 'onbekend'), count(*), count(*) filter (where aangenomen)
    from analyses.zaak_uitslag
    group by 1, 2, 3;

    -- 7. Samen ingediend: per paar fracties het aantal stukken met indieners of medeindieners uit allebei
    insert into analyses.indiening_netwerk (periodesoort, periode, soort, fractie_a, fractie_b, stukken)
    with per_stuk as (
        select distinct i.zaak_id, i.fractie_afkorting from analyses.indiening i where i.fractie_afkorting is not null
    )
    select p.periodesoort, p.periode, u.soort, a.fractie_afkorting, b.fractie_afkorting, count(*)
    from per_stuk a
    join per_stuk b on b.zaak_id = a.zaak_id and a.fractie_afkorting < b.fractie_afkorting
    join analyses.zaak_uitslag u on u.zaak_id = a.zaak_id
    cross join lateral (values ('kabinet', u.kabinet), ('kamerperiode', u.kamerperiode)) p(periodesoort, periode)
    where p.periode is not null
    group by 1, 2, 3, 4, 5;

    return query
        select 'zaak_uitslag', count(*) from analyses.zaak_uitslag
        union all select 'indiening', count(*) from analyses.indiening
        union all select 'zetelwerk_fractie', count(*) from analyses.zetelwerk_fractie
        union all select 'zetelwerk_persoon', count(*) from analyses.zetelwerk_persoon
        union all select 'zetelwerk_jaar', count(*) from analyses.zetelwerk_jaar
        union all select 'indiening_netwerk', count(*) from analyses.indiening_netwerk;
end;
$$;

revoke execute on function analyses.herbouw_zetelwerk() from public;

-- API voor de site
create view api.zetelwerk_fractie with (security_invoker = true) as
    select periodesoort, periode, fractie_id as fractie, afkorting, soort, rol, ingediend, mede, aangenomen, brede_steun,
           mediaan_zetels_voor, tegen_aandeel
    from analyses.zetelwerk_fractie;

create view api.zetelwerk_persoon with (security_invoker = true) as
    select periodesoort, periode, persoon_id as persoon, naam, fractie_afkorting, soort, ingediend, mede, aangenomen, brede_steun
    from analyses.zetelwerk_persoon;

create view api.zetelwerk_jaar with (security_invoker = true) as
    select jaar, soort, indiener_rol, ingediend, aangenomen from analyses.zetelwerk_jaar;

create view api.indiening_netwerk with (security_invoker = true) as
    select periodesoort, periode, soort, fractie_a, fractie_b, stukken from analyses.indiening_netwerk;

-- De stukken van een Kamerlid (pagina Kamerleden)
create view api.indiening_stuk with (security_invoker = true) as
    select i.persoon_id as persoon, i.relatie, i.fractie_afkorting, i.rol, u.zaak_id as zaak, u.soort, u.nummer, u.onderwerp,
           u.datum, u.kabinet, u.kamerperiode, u.zetels_voor, u.zetels_tegen, u.aangenomen, u.brede_steun
    from analyses.indiening i
    join analyses.zaak_uitslag u on u.zaak_id = i.zaak_id;

grant select on api.zetelwerk_fractie, api.zetelwerk_persoon, api.zetelwerk_jaar, api.indiening_netwerk, api.indiening_stuk
    to anon, authenticated;
