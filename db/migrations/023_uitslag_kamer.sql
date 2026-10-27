-- Zetelwerk telt "aangenomen" voortaan uit de uitslag van de Kamer (besluit Niels C4, optie A, 27 oktober 2026).
-- Bij 8 besluiten past de uitslag niet bij de stemmen in de bron: twee telfouten waarbij de uitslag formeel bleef
-- staan, stemmen die een dag later zijn gecorrigeerd zonder dat de uitslag veranderde, een grondwetswijziging die
-- twee derde nodig had, en een onverklaard geval (zie beheer.afwijkende_uitslag en /methodiek). Formeel geldt de
-- uitslag van de Kamer. Noemt de besluitsoort geen uitslag, dan tellen de stemmen, zoals voorheen.
-- De functie is die uit 022, met twee wijzigingen: besluitsoort in "laatste", en de berekening van aangenomen.

create or replace function analyses.herbouw_zetelwerk()
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
        select distinct on (z.id) z.id as zaak_id, case when z.soort = 'Initiatiefwetgeving' then 'Wetsvoorstel' else z.soort end as soort,
               z.nummer, coalesce(z.onderwerp, z.titel) as onderwerp,
               b.id as besluit_id, b.datum, b.kabinet, b.kamerperiode, b.stemmingssoort, b.besluitsoort
        from core.zaak z
        join core.besluit_zaak bz on bz.zaak_id = z.id
        join core.besluit b on b.id = bz.besluit_id
        where z.soort in ('Motie', 'Amendement')
           -- Initiatiefwetten: alleen met een Kamerlid met fractie als indiener (regeringswetten heten Wetgeving)
           or (z.soort = 'Initiatiefwetgeving' and exists (
               select 1 from raw.zaakactor za where za."Zaak_Id" = z.id and za."Relatie" = 'Indiener'
                 and za."Fractie_Id" is not null and not coalesce(za."Verwijderd", false)))
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
           coalesce(t.voor, 0), coalesce(t.tegen, 0),
           -- C4: de uitslag van de Kamer; de stemmen alleen als de besluitsoort geen uitslag noemt
           case when l.besluitsoort = 'Stemmen - aangenomen' then true
                when l.besluitsoort in ('Stemmen - verworpen', 'Stemmen - niet aangenomen', 'Stemmen - gestaakt') then false
                else coalesce(t.voor, 0) > coalesce(t.tegen, 0) end,
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
      and (u.soort <> 'Wetsvoorstel' or za."Fractie_Id" is not null)
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
