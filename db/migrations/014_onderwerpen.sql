-- Onderwerpen: beleidsterrein en dossier per stemming (component onderwerpen, docs/plan/08-componenten/onderwerpen.md).
-- Besluit Niels, 25 oktober 2026: beleidsterrein via het Kamerstukdossier, een stemming telt mee bij elk
-- terrein van haar dossiers, in R1.
--
-- Bron: een motie heeft als voortouwcommissie altijd 'TK'. Daarom loopt het via het dossier: per
-- Kamerstukdossier de vaste commissie die het vaakst voortouwcommissie is van de zaken in dat dossier.
-- Een handmatige koppeltabel zet die commissie om in een van vijftien beleidsterreinen.

-- Raw: dossiers en de koppeling zaak en dossier (geladen door pipeline/dossiers.py)
create table raw.kamerstukdossier (
    "Id" uuid primary key,
    "Titel" text,
    "Citeertitel" text,
    "Alias" text,
    "Nummer" integer,
    "Toevoeging" text,
    "HoogsteVolgnummer" integer,
    "Afgesloten" boolean,
    "Kamer" text,
    "GewijzigdOp" timestamptz,
    "ApiGewijzigdOp" timestamptz,
    "Verwijderd" boolean,
    _geladen_op timestamptz not null default now()
);

create table raw.zaak_kamerstukdossier (
    "Zaak_Id" uuid not null,
    "Kamerstukdossier_Id" uuid not null,
    primary key ("Zaak_Id", "Kamerstukdossier_Id")
);

alter table raw.kamerstukdossier enable row level security;
alter table raw.zaak_kamerstukdossier enable row level security;

-- Handmatig: commissie (naam zoals in raw.commissie, in kleine letters) naar beleidsterrein.
-- Opgesteld door Claude op 25 oktober 2026 uit de commissielijst van de API; Niels kijkt elke rij na.
-- Een commissie die hier niet staat, telt als 'Overig'.
create table core.beleidsterrein_commissie (
    commissie text primary key,
    beleidsterrein text not null,
    gecontroleerd_op date
);

insert into core.beleidsterrein_commissie (commissie, beleidsterrein) values
    ('vaste commissie voor financiën', 'Financiën'),
    ('commissie voor de rijksuitgaven', 'Financiën'),
    ('vaste commissie voor economische zaken', 'Economie en klimaat'),
    ('vaste commissie voor economische zaken en klimaat', 'Economie en klimaat'),
    ('vaste commissie voor economische zaken, landbouw en innovatie', 'Economie en klimaat'),
    ('vaste commissie voor klimaat en groene groei', 'Economie en klimaat'),
    ('vaste commissie voor landbouw, natuur en voedselkwaliteit', 'Landbouw en natuur'),
    ('vaste commissie voor landbouw, visserij, voedselzekerheid en natuur', 'Landbouw en natuur'),
    ('vaste commissie voor infrastructuur en milieu', 'Infrastructuur en milieu'),
    ('vaste commissie voor infrastructuur en waterstaat', 'Infrastructuur en milieu'),
    ('vaste commissie voor verkeer en waterstaat', 'Infrastructuur en milieu'),
    ('vaste commissie voor volkshuisvesting en ruimtelijke ordening', 'Wonen en ruimte'),
    ('vaste commissie voor volkshuisvesting, ruimtelijke ordening en milieubeheer', 'Wonen en ruimte'),
    ('algemene commissie voor wonen en rijksdienst', 'Wonen en ruimte'),
    ('algemene commissie voor wonen, wijken en integratie', 'Wonen en ruimte'),
    ('vaste commissie voor binnenlandse zaken', 'Binnenlands bestuur'),
    ('vaste commissie voor binnenlandse zaken en koninkrijksrelaties', 'Binnenlands bestuur'),
    ('vaste commissie voor digitale zaken', 'Binnenlands bestuur'),
    ('vaste commissie voor koninkrijksrelaties', 'Koninkrijk'),
    ('vaste commissie voor nederlands-antilliaanse en arubaanse zaken', 'Koninkrijk'),
    ('vaste commissie voor justitie', 'Justitie en veiligheid'),
    ('vaste commissie voor justitie en veiligheid', 'Justitie en veiligheid'),
    ('vaste commissie voor veiligheid en justitie', 'Justitie en veiligheid'),
    ('vaste commissie voor asiel en migratie', 'Asiel en migratie'),
    ('algemene commissie voor immigratie, integratie en asiel', 'Asiel en migratie'),
    ('algemene commissie voor integratiebeleid', 'Asiel en migratie'),
    ('vaste commissie voor buitenlandse zaken', 'Buitenland en handel'),
    ('vaste commissie voor buitenlandse handel en ontwikkelingshulp', 'Buitenland en handel'),
    ('vaste commissie voor buitenlandse handel en ontwikkelingssamenwerking', 'Buitenland en handel'),
    ('algemene commissie voor buitenlandse handel en ontwikkelingssamenwerking', 'Buitenland en handel'),
    ('vaste commissie voor europese zaken', 'Europa'),
    ('vaste commissie voor defensie', 'Defensie'),
    ('vaste commissie voor volksgezondheid, welzijn en sport', 'Zorg'),
    ('vaste commissie voor welzijn, volksgezondheid en cultuur', 'Zorg'),
    ('algemene commissie voor jeugd en gezin', 'Zorg'),
    ('algemene commissie voor jeugdzorg', 'Zorg'),
    ('vaste commissie voor sociale zaken en werkgelegenheid', 'Werk en inkomen'),
    ('vaste commissie voor onderwijs, cultuur en wetenschap', 'Onderwijs en cultuur'),
    ('vaste commissie voor onderwijs en wetenschappen', 'Onderwijs en cultuur');

alter table core.beleidsterrein_commissie enable row level security;

-- Afgeleid (unlogged, zoals de rest van core): dossiers met commissie en beleidsterrein
create unlogged table core.dossier (
    id uuid primary key,
    nummer integer,
    toevoeging text,
    titel text,
    commissie text,              -- meest voorkomende vaste commissie (kleine letters), leeg als er geen is
    beleidsterrein text not null -- 'Overig' als er geen commissie is of de commissie niet in de koppeltabel staat
);

create unlogged table core.zaak_dossier (
    zaak_id uuid not null,
    dossier_id uuid not null,
    primary key (zaak_id, dossier_id)
);

alter table core.dossier enable row level security;
alter table core.zaak_dossier enable row level security;

create function core.herbouw_dossiers()
returns table (tabel text, rijen bigint)
language plpgsql
as $$
begin
    truncate core.dossier, core.zaak_dossier;

    insert into core.dossier (id, nummer, toevoeging, titel, commissie, beleidsterrein)
    with voortouw as (
        -- Per dossier en vaste commissie: van hoeveel zaken die commissie voortouwcommissie is ('TK' telt niet)
        select zk."Kamerstukdossier_Id" as dossier_id, lower(trim(c."NaamNL")) as commissie, count(*) as zaken
        from raw.zaakactor za
        join raw.zaak_kamerstukdossier zk on zk."Zaak_Id" = za."Zaak_Id"
        join raw.commissie c on c."Id" = za."Commissie_Id"
        where za."Relatie" = 'Voortouwcommissie' and not coalesce(za."Verwijderd", false)
          and za."ActorNaam" <> 'TK'
        group by 1, 2
    ),
    meeste as (
        select distinct on (dossier_id) dossier_id, commissie
        from voortouw
        order by dossier_id, zaken desc, commissie
    )
    select k."Id", k."Nummer", k."Toevoeging", k."Titel", m.commissie, coalesce(bc.beleidsterrein, 'Overig')
    from raw.kamerstukdossier k
    left join meeste m on m.dossier_id = k."Id"
    left join core.beleidsterrein_commissie bc on bc.commissie = m.commissie
    where not coalesce(k."Verwijderd", false);

    -- Alleen zaken waarover gestemd is (core.zaak)
    insert into core.zaak_dossier (zaak_id, dossier_id)
    select zk."Zaak_Id", zk."Kamerstukdossier_Id"
    from raw.zaak_kamerstukdossier zk
    join core.zaak z on z.id = zk."Zaak_Id"
    join core.dossier d on d.id = zk."Kamerstukdossier_Id";

    return query
        select 'dossier', count(*) from core.dossier
        union all select 'zaak_dossier', count(*) from core.zaak_dossier;
end;
$$;

revoke execute on function core.herbouw_dossiers() from public;

-- Analyse: cohesie per beleidsterrein (zelfde definitie als analyses.cohesie, drempel 25)
create unlogged table analyses.besluit_terrein (
    besluit_id uuid not null,
    beleidsterrein text not null,
    primary key (besluit_id, beleidsterrein)
);

create unlogged table analyses.cohesie_terrein (
    periodesoort text not null check (periodesoort in ('kabinet', 'kamerperiode')),
    periode text not null,
    beleidsterrein text not null,
    variant text not null check (variant in ('alle', 'verdeeld')),
    fractie_a uuid not null,
    fractie_b uuid not null,
    gezamenlijk integer not null,
    gelijk integer not null,
    cohesie numeric(4, 1),
    te_weinig_data boolean not null,
    primary key (periodesoort, periode, beleidsterrein, variant, fractie_a, fractie_b)
);

-- Stemmingen per beleidsterrein en periode (voor de site: hoeveel stemmingen er onder een terrein vallen)
create unlogged table analyses.terrein_periode (
    periodesoort text not null check (periodesoort in ('kabinet', 'kamerperiode')),
    periode text not null,
    beleidsterrein text not null,
    stemmingen integer not null,
    primary key (periodesoort, periode, beleidsterrein)
);

alter table analyses.besluit_terrein enable row level security;
alter table analyses.cohesie_terrein enable row level security;
alter table analyses.terrein_periode enable row level security;
create policy lezen on analyses.cohesie_terrein for select to anon, authenticated using (true);
create policy lezen on analyses.terrein_periode for select to anon, authenticated using (true);
grant select on analyses.cohesie_terrein, analyses.terrein_periode to anon, authenticated;

create function analyses.herbouw_terrein()
returns table (tabel text, rijen bigint)
language plpgsql
as $$
begin
    truncate analyses.besluit_terrein, analyses.cohesie_terrein, analyses.terrein_periode;

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

    return query
        select 'besluit_terrein', count(*) from analyses.besluit_terrein
        union all select 'cohesie_terrein', count(*) from analyses.cohesie_terrein
        union all select 'terrein_periode', count(*) from analyses.terrein_periode;
end;
$$;

revoke execute on function analyses.herbouw_terrein() from public;

-- API: cohesie per beleidsterrein in beide richtingen (zoals api.cohesie), en stemmingen per terrein
create view api.cohesie_terrein with (security_invoker = true) as
    select periodesoort, periode, beleidsterrein, variant, fractie_a as fractie, fractie_b as andere_fractie,
           cohesie, gezamenlijk, te_weinig_data
    from analyses.cohesie_terrein
    union all
    select periodesoort, periode, beleidsterrein, variant, fractie_b, fractie_a, cohesie, gezamenlijk, te_weinig_data
    from analyses.cohesie_terrein;

create view api.beleidsterrein_periode with (security_invoker = true) as
    select periodesoort, periode, beleidsterrein, stemmingen from analyses.terrein_periode;

grant select on api.cohesie_terrein, api.beleidsterrein_periode to anon, authenticated;
