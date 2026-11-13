-- Bron per rij van core.coalitie (13 november 2026, bij het Actueel-stuk coalitie-verdeeld).
--
-- Aanleiding: een melding dat van bijna overal leeg is en de bron nog "na te kijken" zegt. Leeg van betekent volgens
-- 011_coalitie.sql "vanaf het begin van het kabinet", leeg tot "tot het einde": dat is een ontwerpkeuze, geen fout.
-- Na te kijken stond er sinds 025_controle_c5.sql al niet meer, maar die migratie gaf alle rijen dezelfde bron
-- (Wikipedia over vier kabinetten), ook Rutte II, III en IV, die daar niet in stonden.
--
-- Nagekeken door Claude op 13 november 2026 tegen de Nederlandstalige Wikipedia, artikel per kabinet (zelf geopend):
-- de partijen, de gedoogpartner en de datums van uittreden kloppen. Geen partij stapte na het begin van een kabinet in,
-- dus van blijft overal leeg. Er verandert geen datum; alleen de kolom bron. gecontroleerd_op blijft leeg: dat is de
-- controle door Niels.
--
-- Bevindingen per artikel:
--   Balkenende IV  CDA, PvdA en ChristenUnie; "Op 23 februari verleende de Koningin de PvdA-bewindslieden daadwerkelijk
--                  hun ontslag" (tot 2010-02-23 klopt)
--   Rutte I        VVD en CDA met gedoogsteun van de PVV; op 21 april 2012 meldde de PVV per direct geen gedoogpartner
--                  meer te zijn (tot 2012-04-21 klopt)
--   Rutte II       VVD en PvdA; geen partij in of uit
--   Rutte III      VVD, CDA, D66 en ChristenUnie; geen partij in of uit
--   Rutte IV       VVD, D66, CDA en ChristenUnie; geen partij in of uit
--   Schoof         PVV, VVD, NSC en BBB; "Op 3 juni 2025 trok de PVV zich terug uit het kabinet" en op 22 augustus 2025
--                  verlieten alle NSC-bewindslieden het kabinet (beide tot-datums kloppen)
--   Jetten         D66, VVD en CDA, beëdigd op 23 februari 2026; geen gedoog- of steunakkoord met andere partijen, geen
--                  partij in of uit (stand van het artikel op 13 november 2026)

update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Balkenende IV, geraadpleegd 13 november 2026'
where kabinet = 'Balkenende IV' and fractie_afkorting in ('CDA', 'ChristenUnie');
update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Balkenende IV, geraadpleegd 13 november 2026: ontslag PvdA-bewindslieden verleend op 23 februari 2010'
where kabinet = 'Balkenende IV' and fractie_afkorting = 'PvdA';

update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Rutte I, geraadpleegd 13 november 2026'
where kabinet = 'Rutte I' and fractie_afkorting in ('VVD', 'CDA');
update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Rutte I, geraadpleegd 13 november 2026: gedoogsteun beëindigd op 21 april 2012 (Catshuisoverleg)'
where kabinet = 'Rutte I' and fractie_afkorting = 'PVV';

update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Rutte II, geraadpleegd 13 november 2026'
where kabinet = 'Rutte II';
update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Rutte III, geraadpleegd 13 november 2026'
where kabinet = 'Rutte III';
update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Rutte IV, geraadpleegd 13 november 2026'
where kabinet = 'Rutte IV';

update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Schoof, geraadpleegd 13 november 2026'
where kabinet = 'Schoof' and fractie_afkorting in ('VVD', 'BBB');
update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Schoof, geraadpleegd 13 november 2026: PVV trok zich terug op 3 juni 2025'
where kabinet = 'Schoof' and fractie_afkorting = 'PVV';
update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Schoof, geraadpleegd 13 november 2026: NSC-bewindslieden verlieten het kabinet op 22 augustus 2025'
where kabinet = 'Schoof' and fractie_afkorting = 'Nieuw Sociaal Contract';

update core.coalitie set bron = 'Wikipedia (nl), artikel Kabinet-Jetten, geraadpleegd 13 november 2026'
where kabinet = 'Jetten';

-- Controle: elke rij heeft nu een bron uit een artikel, en er staat nergens meer "na te kijken"
do $$
begin
    if exists (select 1 from core.coalitie where bron not like 'Wikipedia (nl), artikel Kabinet-%' or bron like '%na te kijken%') then
        raise exception 'core.coalitie: niet elke rij heeft een bron uit een Wikipedia-artikel';
    end if;
end $$;
