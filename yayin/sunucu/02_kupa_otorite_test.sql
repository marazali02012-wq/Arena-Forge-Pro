-- Yerel doğrulama: Supabase rollerini/auth.uid() yerine taklitçiler kurar, 01 dosyasını yükler ve saldırıları dener.
-- Çalıştırma: psql -v ON_ERROR_STOP=1 -f 02_kupa_otorite_test.sql  (boş bir veritabanında, süper kullanıcı ile)
\set ON_ERROR_STOP on
create schema if not exists auth;
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
create or replace function auth.uid() returns uuid language sql stable as
$$ select nullif(current_setting('test.uid', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create table if not exists public.player_profiles(user_id uuid primary key, nickname text, level int, save_data jsonb);

\i 01_kupa_otorite.sql
-- ikinci kez çalıştır: idempotent olmalı
\i 01_kupa_otorite.sql

create temp table _t(name text, ok boolean, info text);
grant all on _t to public;
create or replace function pg_temp.chk(n text, ok boolean, i text default '') returns void language plpgsql as
$$ begin insert into _t values (n, ok, i); end $$;

insert into public.player_profiles values
 ('00000000-0000-0000-0000-00000000000a','Ayse',5,'{}'),
 ('00000000-0000-0000-0000-00000000000b','Bora',5,'{}'),
 ('00000000-0000-0000-0000-00000000000c','Cem',5,'{}');

-- 1) service_role ile iki oyuncuyu 100/100 kupaya kur (test hazırlığı; gerçekte tohum + maçlardan gelir)
insert into public.afp_player_trophies(user_id,trophies,seeded) values
 ('00000000-0000-0000-0000-00000000000a',100,true),
 ('00000000-0000-0000-0000-00000000000b',100,true),
 ('00000000-0000-0000-0000-00000000000c',900,true);

-- 2) oyuncu (authenticated) doğrudan yazamaz/okuyamaz
set role authenticated; set test.uid = '00000000-0000-0000-0000-00000000000a';
do $$ begin
  begin update public.afp_player_trophies set trophies = 20000 where user_id = auth.uid();
    perform pg_temp.chk('oyuncu UPDATE reddedilir', false, 'izin verildi!');
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu UPDATE reddedilir', true); end;
  begin insert into public.afp_player_trophies(user_id,trophies) values (gen_random_uuid(), 19999);
    perform pg_temp.chk('oyuncu INSERT reddedilir', false, 'izin verildi!');
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu INSERT reddedilir', true); end;
  begin perform 1 from public.afp_player_trophies;
    perform pg_temp.chk('oyuncu SELECT reddedilir', false, 'izin verildi!');
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu SELECT reddedilir', true); end;
  begin delete from public.afp_trophy_ledger;
    perform pg_temp.chk('oyuncu ledger DELETE reddedilir', false, 'izin verildi!');
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu ledger DELETE reddedilir', true); end;
  begin perform public.afp_trophy_settle('m-evil-1', auth.uid(), '00000000-0000-0000-0000-00000000000b', false, now()-interval '2 min', now());
    perform pg_temp.chk('oyuncu settle çağıramaz', false, 'izin verildi!');
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu settle çağıramaz', true); end;
  begin update public.afp_trophy_config set value = 9999 where key='gain_max';
    perform pg_temp.chk('oyuncu config değiştiremez', false, 'izin verildi!');
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu config değiştiremez', true); end;
end $$;
reset role;
-- anon hiçbirini çağıramaz
set role anon;
do $$ begin
  begin perform public.afp_trophy_me(); perform pg_temp.chk('anon afp_trophy_me reddedilir', false);
  exception when insufficient_privilege then perform pg_temp.chk('anon afp_trophy_me reddedilir', true); end;
  begin perform public.afp_trophy_leaderboard(5); perform pg_temp.chk('anon sıralama reddedilir', false);
  exception when insufficient_privilege then perform pg_temp.chk('anon sıralama reddedilir', true); end;
end $$;
reset role;

-- 3) authenticated meşru RPC'leri kullanabilir; kupa tohumu bir kerelik ve sınırlı
set role authenticated; set test.uid = '00000000-0000-0000-0000-0000000000dd';
select pg_temp.chk('yeni oyuncu me=0', (public.afp_trophy_me()->>'trophies')::int = 0);
select pg_temp.chk('seed 999999 -> 300 sınırı', (public.afp_trophy_seed_me(999999)->>'trophies')::int = 300);
select pg_temp.chk('ikinci seed etkisiz (50 gönderilse de 300)', (public.afp_trophy_seed_me(50)->>'trophies')::int = 300);
select pg_temp.chk('seed sonrası me=300', (public.afp_trophy_me()->>'trophies')::int = 300);
reset role;

-- 4) settle (service_role)
set role service_role;
select pg_temp.chk('settle: 100 vs 100 eşit -> +25/-20',
  (select (r->'winner'->>'delta')::int = 25 and (r->'loser'->>'delta')::int = -20 and (r->'winner'->>'after')::int=125 and (r->'loser'->>'after')::int=80
     from (select public.afp_trophy_settle('match-0001','00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000b',false, now()-interval '2 min', now()) r) q));
select pg_temp.chk('idempotent: aynı maç tekrar -> duplicate, kupa değişmez',
  (select (r->>'duplicate')::boolean and (r->'winner'->>'after')::int=125
     from (select public.afp_trophy_settle('match-0001','00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000b',false, now()-interval '2 min', now()) r) q));
select pg_temp.chk('ters taraflarla aynı match_id reddedilir',
  (select r->>'reason' = 'maç_taraflari_uyusmuyor'
     from (select public.afp_trophy_settle('match-0001','00000000-0000-0000-0000-00000000000b','00000000-0000-0000-0000-00000000000a',false, now()-interval '2 min', now()) r) q));
select pg_temp.chk('kupa aralığı dışı (900 vs 125) reddedilir',
  (select r->>'reason' = 'eslesme_araligi_disi'
     from (select public.afp_trophy_settle('match-0002','00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000c',false, now()-interval '2 min', now()) r) q));
select pg_temp.chk('çok kısa maç (10 sn) reddedilir',
  (select r->>'reason' = 'sure_gecersiz'
     from (select public.afp_trophy_settle('match-0003','00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000b',false, now()-interval '10 sec', now()) r) q));
select pg_temp.chk('kendine karşı maç reddedilir',
  (select r->>'reason' = 'gecersiz_istek'
     from (select public.afp_trophy_settle('match-0004','00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000a',false, now()-interval '2 min', now()) r) q));
-- aynı iki oyuncu: 24 saatte en çok 3 maç (91/92, 1000 kupa, aralık içinde kalırlar)
reset role;
insert into public.afp_player_trophies(user_id,trophies,seeded) values
 ('00000000-0000-0000-0000-000000000091',1000,true),('00000000-0000-0000-0000-000000000092',1000,true);
set role service_role;
select pg_temp.chk('çiftçilik: 1. maç sayılır', (public.afp_trophy_settle('farm-0001','00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000092',false, now()-interval '2 min', now())->>'applied')::boolean);
select pg_temp.chk('çiftçilik: 2. maç sayılır', (public.afp_trophy_settle('farm-0002','00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000092',false, now()-interval '2 min', now())->>'applied')::boolean);
select pg_temp.chk('çiftçilik: 3. maç sayılır', (public.afp_trophy_settle('farm-0003','00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000092',false, now()-interval '2 min', now())->>'applied')::boolean);
select pg_temp.chk('4. maç aynı rakiple 24 saatte reddedilir (çiftçilik koruması)',
  (select r->>'reason' = 'ayni_rakip_siniri'
     from (select public.afp_trophy_settle('farm-0004','00000000-0000-0000-0000-000000000091','00000000-0000-0000-0000-000000000092',false, now()-interval '2 min', now()) r) q));
reset role;
insert into public.afp_player_trophies(user_id,trophies,seeded) values
 ('00000000-0000-0000-0000-000000000093',500,true),('00000000-0000-0000-0000-000000000094',500,true);
set role service_role;
select pg_temp.chk('beraberlik kupa değiştirmez',
  (select (r->>'draw')::boolean and (r->'winner'->>'delta')::int=0 and (r->'winner'->>'after')::int=500
     from (select public.afp_trophy_settle('draw-0001','00000000-0000-0000-0000-000000000093','00000000-0000-0000-0000-000000000094',true, now()-interval '2 min', now()) r) q));
reset role;

-- 5) kupa negatife düşmez, üst sınır aşılmaz, günlük sınır çalışır
insert into public.afp_player_trophies(user_id,trophies,seeded) values
 ('00000000-0000-0000-0000-0000000000e1',3,true),('00000000-0000-0000-0000-0000000000e2',5,true)
 on conflict (user_id) do update set trophies = excluded.trophies;
set role service_role;
select pg_temp.chk('kaybeden 3 kupa -> 0 altına inmez',
  (select (r->'loser'->>'after')::int = 0
     from (select public.afp_trophy_settle('match-0010','00000000-0000-0000-0000-0000000000e2','00000000-0000-0000-0000-0000000000e1',false, now()-interval '2 min', now()) r) q));
reset role;
-- günlük kazanç sınırı: 250
insert into public.afp_player_trophies(user_id,trophies,seeded) values
 ('00000000-0000-0000-0000-0000000000f1',1000,true) on conflict (user_id) do update set trophies=1000;
insert into public.afp_trophy_ledger(match_id,user_id,opponent_id,outcome,delta,trophies_before,trophies_after)
 values ('fake-day','00000000-0000-0000-0000-0000000000f1','00000000-0000-0000-0000-0000000000f9','win',245,755,1000);
insert into public.afp_player_trophies(user_id,trophies,seeded) values
 ('00000000-0000-0000-0000-0000000000f2',1000,true) on conflict (user_id) do update set trophies=1000;
set role service_role;
select pg_temp.chk('günlük 250 sınırı: 245 kazanılmışken en çok +5',
  (select (r->'winner'->>'delta')::int = 5
     from (select public.afp_trophy_settle('match-0011','00000000-0000-0000-0000-0000000000f1','00000000-0000-0000-0000-0000000000f2',false, now()-interval '2 min', now()) r) q));
reset role;

-- 6) sıralama yalnızca sunucu kupasından
select set_config('test.exp_rank', (1 + (select count(*) from public.afp_player_trophies where trophies > 900))::text, false);
set role authenticated; set test.uid = '00000000-0000-0000-0000-00000000000c';
select pg_temp.chk('sıralama: sunucu kupası, azalan sırada, authoritative, sıram doğru',
  (select (r->>'authoritative')::boolean and (r->'me'->>'trophies')::int = 900
          and (r->'rows'->0->>'trophies')::int >= (r->'rows'->1->>'trophies')::int
          and (r->'me'->>'rank')::int = current_setting('test.exp_rank')::int
     from (select public.afp_trophy_leaderboard(10) r) q));
reset role;

-- 7) değişmezler: ledger toplamı = kupa farkı (tohum dahil), hiç negatif yok
select pg_temp.chk('defter tutarlılığı: oyuncu başına ledger delta toplamı = kupa (tohumlu oyuncular için)',
  not exists (select 1 from public.afp_player_trophies t
               join (select user_id, sum(delta) s from public.afp_trophy_ledger where match_id not like 'fake-%' group by 1) l using (user_id)
              where t.user_id in ('00000000-0000-0000-0000-00000000000a','00000000-0000-0000-0000-00000000000b')
                and t.trophies <> 100 + l.s));
select pg_temp.chk('hiç negatif/20000 üstü kupa yok', not exists (select 1 from public.afp_player_trophies where trophies<0 or trophies>20000));

select name, case when ok then 'GEÇTİ' else 'KALDI' end as sonuc, info from _t order by 1;
select count(*) filter (where ok) as gecen, count(*) filter (where not ok) as kalan from _t;
