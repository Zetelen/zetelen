-- Zaal tot de verkiezingen, verfijnd (feitencontrole 28 oktober 2026). De zaal eindigt nu bij de laatste stemming vóór
-- de verkiezingsdatum die de Kamerperiode afsloot (core.kamerperiode.verkiezingsdatum van de volgende periode), niet bij
-- de laatste stemming in de periode. Raakt Rutte IV en de Kamerperiode 2021-2023 (147 zetels werd 150). Alleen de CTE
-- einde verandert ten opzichte van 027_zaal_tot_verkiezingen.sql.

create or replace function analyses.herbouw()
returns table (tabel text, rijen bigint)
language plpgsql
as $$
begin
    truncate analyses.fractie_besluit_stem, analyses.cohesie, analyses.eensgezindheid, analyses.fractie_periode,
             analyses.overstap;

    -- 1. Fractiestem per besluit: eerst de stem uit de bron, dan de afgeleide bij hoofdelijk
    insert into analyses.fractie_besluit_stem (besluit_id, fractie_id, stem, afgeleid)
    select besluit_id, fractie_id, soort, false
    from core.fractiestem
    where soort in ('Voor', 'Tegen') and not vergissing;

    insert into analyses.fractie_besluit_stem (besluit_id, fractie_id, stem, afgeleid)
    select ps.besluit_id, ps.fractie_id,
           case when count(*) filter (where ps.soort = 'Voor') > count(*) filter (where ps.soort = 'Tegen')
                then 'Voor' else 'Tegen' end,
           true
    from core.persoonsstem ps
    join core.besluit b on b.id = ps.besluit_id and b.stemmingssoort = 'Hoofdelijk'
    where ps.soort in ('Voor', 'Tegen') and not ps.vergissing and ps.fractie_id is not null
      and not exists (select 1 from core.fractiestem f
                      where f.besluit_id = ps.besluit_id and f.fractie_id = ps.fractie_id)
    group by ps.besluit_id, ps.fractie_id
    having count(*) filter (where ps.soort = 'Voor') <> count(*) filter (where ps.soort = 'Tegen');

    -- 2. Cohesie per paar, periode en variant
    insert into analyses.cohesie (periodesoort, periode, variant, fractie_a, fractie_b,
                                 gezamenlijk, gelijk, cohesie, te_weinig_data)
    with verdeeld as (
        select besluit_id,
               bool_or(stem = 'Voor') and bool_or(stem = 'Tegen') as verdeeld
        from analyses.fractie_besluit_stem
        group by besluit_id
    ),
    besluit_periode as (
        select b.id as besluit_id, p.periodesoort, p.periode, v.verdeeld
        from core.besluit b
        join verdeeld v on v.besluit_id = b.id
        cross join lateral (values ('kabinet', b.kabinet), ('kamerperiode', b.kamerperiode)) p(periodesoort, periode)
        where p.periode is not null
    ),
    -- Elk paar telt in variant 'alle', en ook in 'verdeeld' als het besluit verdeeld was.
    -- In een doorgang (geen tussenresultaat dat twee keer gebruikt wordt): scheelt schijfruimte
    varianten as (
        select bp.periodesoort, bp.periode, v.variant,
               a.fractie_id as fractie_a, b.fractie_id as fractie_b, (a.stem = b.stem) as gelijk
        from besluit_periode bp
        join analyses.fractie_besluit_stem a on a.besluit_id = bp.besluit_id
        join analyses.fractie_besluit_stem b on b.besluit_id = bp.besluit_id and a.fractie_id < b.fractie_id
        cross join lateral (values ('alle', true), ('verdeeld', bp.verdeeld)) v(variant, telt_mee)
        where v.telt_mee
    )
    select periodesoort, periode, variant, fractie_a, fractie_b,
           count(*), count(*) filter (where gelijk),
           case when count(*) >= 25
                then round(100.0 * count(*) filter (where gelijk) / count(*), 1) end,
           count(*) < 25
    from varianten
    group by periodesoort, periode, variant, fractie_a, fractie_b;

    -- 3. Eensgezindheid per fractie en periode
    insert into analyses.eensgezindheid (periodesoort, periode, fractie_id,
                                        hoofdelijk, hoofdelijk_verdeeld, afwijkers_handopsteken)
    with leden as (
        select ps.besluit_id, ps.fractie_id, b.stemmingssoort, b.kabinet, b.kamerperiode,
               count(*) filter (where ps.soort = 'Voor') as voor,
               count(*) filter (where ps.soort = 'Tegen') as tegen,
               bool_or(f.soort in ('Voor', 'Tegen') and ps.soort in ('Voor', 'Tegen') and ps.soort <> f.soort) as afwijker
        from core.persoonsstem ps
        join core.besluit b on b.id = ps.besluit_id
        left join core.fractiestem f on f.besluit_id = ps.besluit_id and f.fractie_id = ps.fractie_id
        where ps.fractie_id is not null and not ps.vergissing
        group by ps.besluit_id, ps.fractie_id, b.stemmingssoort, b.kabinet, b.kamerperiode
    ),
    per_periode as (
        select p.periodesoort, p.periode, l.*
        from leden l
        cross join lateral (values ('kabinet', l.kabinet), ('kamerperiode', l.kamerperiode)) p(periodesoort, periode)
        where p.periode is not null
    )
    select periodesoort, periode, fractie_id,
           count(*) filter (where stemmingssoort = 'Hoofdelijk' and voor + tegen > 0),
           count(*) filter (where stemmingssoort = 'Hoofdelijk' and voor > 0 and tegen > 0),
           count(*) filter (where stemmingssoort <> 'Hoofdelijk' and afwijker)
    from per_periode
    group by periodesoort, periode, fractie_id;


    -- 4. Fracties per periode, voor de zaal en de fractiepagina's (component cohesie-pagina)
    insert into analyses.fractie_periode (periodesoort, periode, fractie_id, afkorting, naam, zetels,
                                          stemmingen, eerste_stemming, laatste_stemming, in_zaal,
                                          zetels_begin, bij_begin)
    with stem_periode as (
        select p.periodesoort, p.periode, s.fractie_id, b.datum, b.id as besluit_id, b.kamerperiode
        from analyses.fractie_besluit_stem s
        join core.besluit b on b.id = s.besluit_id
        cross join lateral (values ('kabinet', b.kabinet), ('kamerperiode', b.kamerperiode)) p(periodesoort, periode)
        where p.periode is not null
    ),
    -- De Kamerperiode waarin de periode begon (bij een Kamerperiode: zichzelf)
    eerste_kamer as (
        select distinct on (periodesoort, periode) periodesoort, periode, kamerperiode
        from stem_periode order by periodesoort, periode, datum
    ),
    -- zaal_einde: de laatste stemming in de Kamer waarin de periode begon. Loopt een kabinet demissionair door
    -- na verkiezingen, dan is de zaal die van voor de verkiezingen (besluit Niels, 28 oktober 2026: anders viel
    -- NSC als coalitiepartij weg uit de zaal van kabinet-Schoof)
    -- Sinds 028: alleen stemmingen vóór de verkiezingen die die Kamerperiode beëindigden. Na de verkiezingen van
    -- november 2023 stemde de oude Kamer nog één keer (2 december, over hertellingen); daardoor bestond de zaal van
    -- Rutte IV uit die ene stemming en vielen fracties weg (feitencontrole 28 oktober 2026)
    volgende as (
        select k.naam, v.verkiezingsdatum
        from core.kamerperiode k
        left join core.kamerperiode v on v.begin = k.einde
    ),
    einde as (
        select sp.periodesoort, sp.periode, min(sp.datum) as eerste, max(sp.datum) as laatste,
               max(sp.datum) filter (where sp.kamerperiode is not distinct from ek.kamerperiode
                                     and (vk.verkiezingsdatum is null or sp.datum < vk.verkiezingsdatum)) as zaal_einde
        from stem_periode sp
        join eerste_kamer ek on ek.periodesoort = sp.periodesoort and ek.periode = sp.periode
        left join volgende vk on vk.naam = ek.kamerperiode
        group by sp.periodesoort, sp.periode
    ),
    per_fractie as (
        select sp.periodesoort, sp.periode, sp.fractie_id, count(*) as stemmingen,
               min(sp.datum) as eerste, max(sp.datum) as laatste,
               bool_or(sp.datum between e.zaal_einde - 14 and e.zaal_einde) as in_zaal
        from stem_periode sp
        join einde e on e.periodesoort = sp.periodesoort and e.periode = sp.periode
        group by sp.periodesoort, sp.periode, sp.fractie_id
    ),
    -- Zetels: de fractiegrootte bij de laatste stemming met handopsteken van die fractie tot het einde van de zaal;
    -- voor een fractie die pas daarna begon, de laatste stemming in de periode
    grootte as (
        select distinct on (p.periodesoort, p.periode, f.fractie_id)
               p.periodesoort, p.periode, f.fractie_id, f.fractiegrootte
        from core.fractiestem f
        join core.besluit b on b.id = f.besluit_id
        cross join lateral (values ('kabinet', b.kabinet), ('kamerperiode', b.kamerperiode)) p(periodesoort, periode)
        join einde e on e.periodesoort = p.periodesoort and e.periode = p.periode
        where p.periode is not null and f.fractiegrootte is not null
        order by p.periodesoort, p.periode, f.fractie_id, (b.datum <= e.zaal_einde) desc, b.datum desc
    ),
    -- Zetels bij het begin: de fractiegrootte bij de eerste stemming met handopsteken vanaf 30 dagen na
    -- het begin van de periode. Bij de eerste stemmingen zijn zetels soms tijdelijk leeg, omdat
    -- Kamerleden minister werden en hun opvolgers nog niet beëdigd waren (Rutte IV, januari 2022).
    -- Stemde de fractie niet meer na die 30 dagen, dan de eerste stemming.
    grootte_begin as (
        select distinct on (p.periodesoort, p.periode, f.fractie_id)
               p.periodesoort, p.periode, f.fractie_id, f.fractiegrootte
        from core.fractiestem f
        join core.besluit b on b.id = f.besluit_id
        cross join lateral (values ('kabinet', b.kabinet), ('kamerperiode', b.kamerperiode)) p(periodesoort, periode)
        join einde e on e.periodesoort = p.periodesoort and e.periode = p.periode
        where p.periode is not null and f.fractiegrootte is not null
        order by p.periodesoort, p.periode, f.fractie_id, (b.datum < e.eerste + 30), b.datum
    )
    select pf.periodesoort, pf.periode, pf.fractie_id, fr.afkorting, fr.naam, coalesce(g.fractiegrootte, 0),
           pf.stemmingen, pf.eerste, pf.laatste,
           -- In de zaal: stemde mee in de laatste twee weken voor het einde van de zaal
           pf.in_zaal,
           coalesce(gb.fractiegrootte, 0),
           -- Bij het begin: stemde al mee in de eerste twee weken van de periode
           pf.eerste <= e.eerste + 14
    from per_fractie pf
    join einde e on e.periodesoort = pf.periodesoort and e.periode = pf.periode
    join core.fractie fr on fr.id = pf.fractie_id
    left join grootte g on g.periodesoort = pf.periodesoort and g.periode = pf.periode and g.fractie_id = pf.fractie_id
    left join grootte_begin gb on gb.periodesoort = pf.periodesoort and gb.periode = pf.periode and gb.fractie_id = pf.fractie_id;

    -- 5. Overstappers per periode: Kamerleden die bij het begin van de periode in de ene fractie zaten
    -- en later in de periode in een andere. Uit de zetels per persoon in de bron (fractiezetelpersoon).
    -- Wie na verkiezingen niet terugkeert, stapt niet over en telt dus niet mee.
    insert into analyses.overstap (periodesoort, periode, van_fractie, naar_fractie, leden)
    with zetel as (
        select p."Persoon_Id" as persoon, z."Fractie_Id" as fractie, p."Van"::date as van, p."TotEnMet"::date as tot
        from raw.fractiezetelpersoon p
        join raw.fractiezetel z on z."Id" = p."FractieZetel_Id"
        where not coalesce(p."Verwijderd", false) and not coalesce(z."Verwijderd", false)
          and p."Persoon_Id" is not null and z."Fractie_Id" is not null
    ),
    periode as (
        select periodesoort, periode, min(eerste_stemming) + 14 as peildatum, max(laatste_stemming) as einde
        from analyses.fractie_periode
        group by periodesoort, periode
    )
    select pe.periodesoort, pe.periode, a.fractie, b.fractie, count(distinct a.persoon)
    from periode pe
    join zetel a on a.van <= pe.peildatum and (a.tot is null or a.tot >= pe.peildatum)
    join zetel b on b.persoon = a.persoon and b.fractie <> a.fractie
                and b.van > pe.peildatum and b.van <= pe.einde
    group by pe.periodesoort, pe.periode, a.fractie, b.fractie;

    return query
        select 'fractie_besluit_stem', count(*) from analyses.fractie_besluit_stem
        union all select 'cohesie', count(*) from analyses.cohesie
        union all select 'eensgezindheid', count(*) from analyses.eensgezindheid
        union all select 'fractie_periode', count(*) from analyses.fractie_periode
        union all select 'overstap', count(*) from analyses.overstap;
end;
$$;

revoke execute on function analyses.herbouw() from public;
