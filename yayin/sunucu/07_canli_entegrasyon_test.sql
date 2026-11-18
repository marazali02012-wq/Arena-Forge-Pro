-- 06 dosyasının yerel doğrulaması: canlı şemanın gerekli parçalarını taklit eder (afp_players, afp_friendships, yardımcı işlevler,
-- ESKİ afp_social_me/afp_leaderboard), sonra 01 + 06'yı uygular ve hile denemelerini sınar. Boş bir veritabanında çalıştırın.
\set ON_ERROR_STOP on
create schema if not exists auth;
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
grant usage on schema auth, public to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

create table public.afp_players (user_id uuid primary key, nickname text, friend_code text, level integer not null default 1,
  trophies integer not null default 0, hero text, muted_until timestamptz, banned boolean not null default false,
  last_seen timestamptz, created_at timestamptz default now());
create table public.afp_friendships (user_lo uuid, user_hi uuid, status text);
create function public.afp__clean(p_text text, p_max integer) returns text language sql immutable as $$ select left(btrim(coalesce(p_text,'')), p_max) $$;
create function public.afp__new_code() returns text language sql volatile as $$ select upper(substr(md5(random()::text),1,8)) $$;
create function public.afp__require_player(p_need_write boolean) returns public.afp_players language plpgsql security definer set search_path=public as
$$ declare v public.afp_players; begin select * into v from public.afp_players where user_id = auth.uid(); if not found then raise exception 'AFP_NO_PROFILE'; end if; return v; end $$;
-- ESKİ (güvensiz) sürümler: kupayı istemciden alır
create function public.afp_social_me(p_nickname text default null, p_level integer default null, p_trophies integer default null, p_hero text default null)
returns jsonb language plpgsql security definer set search_path=public as
$$ declare v_uid uuid := auth.uid(); v public.afp_players; begin
  insert into public.afp_players(user_id,nickname,friend_code,level,trophies) values (v_uid, coalesce(p_nickname,'Komutan'), public.afp__new_code(), coalesce(p_level,1), coalesce(p_trophies,0))
  on conflict (user_id) do update set trophies = coalesce(p_trophies, public.afp_players.trophies);
  select * into v from public.afp_players where user_id = v_uid; return jsonb_build_object('trophies', v.trophies); end $$;
create function public.afp_leaderboard(p_scope text default 'world', p_limit integer default 50) returns jsonb language sql security definer set search_path=public as
$$ select jsonb_build_object('rows','[]'::jsonb) $$;
revoke all on public.afp_players, public.afp_friendships from public;
grant execute on function public.afp_social_me(text,integer,integer,text), public.afp_leaderboard(text,integer) to authenticated;

-- mevcut (eski) oyuncular: biri makul (25), biri sahte (999999)
insert into public.afp_players(user_id,nickname,level,trophies) values
 ('00000000-0000-0000-0000-0000000000a1','Dürüst',4,25),('00000000-0000-0000-0000-0000000000a2','Hileci',2,999999),
 ('00000000-0000-0000-0000-0000000000a3','Yasaklı',9,500);
update public.afp_players set banned = true where nickname='Yasaklı';

\i 01_kupa_otorite.sql
\i 06_canli_entegrasyon.sql
\i 06_canli_entegrasyon.sql

create temp table _t(name text, ok boolean, info text); grant all on _t to public;
create or replace function pg_temp.chk(n text, ok boolean, i text default '') returns void language plpgsql as $$ begin insert into _t values (n, ok, i); end $$;

select pg_temp.chk('eski oyuncu kupası deftere alındı (25)', (select trophies from public.afp_player_trophies where user_id='00000000-0000-0000-0000-0000000000a1') = 25);
select pg_temp.chk('sahte 999999 → seed_cap 300 ile sınırlandı', (select trophies from public.afp_player_trophies where user_id='00000000-0000-0000-0000-0000000000a2') = 300);
select pg_temp.chk('afp_players.trophies de 300’e yansıdı', (select trophies from public.afp_players where user_id='00000000-0000-0000-0000-0000000000a2') = 300);

set role authenticated; set test.uid = '00000000-0000-0000-0000-0000000000a2';
select pg_temp.chk('afp_social_me(p_trophies=1000000) kupayı DEĞİŞTİRMEZ (300 kalır)', (public.afp_social_me('Hileci',2,1000000,null)->>'trophies')::int = 300);
select pg_temp.chk('tekrar çağrı da değişmez', (public.afp_social_me('Hileci',2,777777,null)->>'trophies')::int = 300);
reset role;
select pg_temp.chk('afp_players.trophies sahte değere yazılmadı', (select trophies from public.afp_players where user_id='00000000-0000-0000-0000-0000000000a2') = 300);

-- yeni oyuncu kupa göndererek kayıt olur → 0
set role authenticated; set test.uid = '00000000-0000-0000-0000-0000000000b9';
select pg_temp.chk('yeni oyuncu p_trophies=5000 ile kayıt → 0', (public.afp_social_me('Yeni',1,5000,null)->>'trophies')::int = 0);
reset role;
select pg_temp.chk('yeni oyuncu için defter satırı 0', (select trophies from public.afp_player_trophies where user_id='00000000-0000-0000-0000-0000000000b9') = 0);

-- sıralama sunucu defterinden; yasaklı görünmez; me doğru
set role authenticated; set test.uid = '00000000-0000-0000-0000-0000000000a1';
select set_config('test.lb', public.afp_leaderboard('world', 50)::text, false);
reset role;
select pg_temp.chk('afp_leaderboard authoritative, 1. Hileci 300 (defterden), yasaklı yok',
  (current_setting('test.lb')::jsonb->'rows'->0->>'nickname') = 'Hileci' and (current_setting('test.lb')::jsonb->'rows'->0->>'trophies')::int = 300
  and not (current_setting('test.lb')::jsonb::text like '%Yasak%') and (current_setting('test.lb')::jsonb->>'authoritative')::boolean);
select pg_temp.chk('me: Dürüst 2. sırada (Hileci 300 > Dürüst 25 > Yeni 0), 25 kupa, toplam 3 (yasaklı sayılmaz)',
  (current_setting('test.lb')::jsonb->'me'->>'rank')::int = 2 and (current_setting('test.lb')::jsonb->'me'->>'trophies')::int = 25 and (current_setting('test.lb')::jsonb->'me'->>'total')::int = 3);

-- oyuncu rolleri yeni nesnelere erişemez
set role authenticated; set test.uid = '00000000-0000-0000-0000-0000000000a2';
do $$ begin begin update public.afp_player_trophies set trophies = 20000; perform pg_temp.chk('oyuncu defteri güncelleyemez', false);
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu defteri güncelleyemez', true); end;
  begin perform public.afp_trophy_mirror(); perform pg_temp.chk('oyuncu mirror işlevini çağıramaz', false);
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu mirror işlevini çağıramaz', true); end;
  begin update public.afp_players set trophies = 5; perform pg_temp.chk('oyuncu afp_players’e doğrudan yazamaz', false);
  exception when insufficient_privilege then perform pg_temp.chk('oyuncu afp_players’e doğrudan yazamaz', true); end;
end $$;
reset role;

-- settle → afp_players.trophies yansır
insert into public.afp_players(user_id,nickname,level,trophies) values ('00000000-0000-0000-0000-0000000000a4','Rakip',3,0);
insert into public.afp_player_trophies(user_id,trophies,seeded) values ('00000000-0000-0000-0000-0000000000a4',300,true) on conflict (user_id) do update set trophies=300;
set role service_role;
select public.afp_trophy_settle('canli-0001','00000000-0000-0000-0000-0000000000a2','00000000-0000-0000-0000-0000000000a4',false, now()-interval '2 min', now()) is not null;
reset role;
select pg_temp.chk('settle sonrası afp_players.trophies defterle aynı', 
  (select p.trophies = g.trophies from public.afp_players p join public.afp_player_trophies g using (user_id) where p.user_id='00000000-0000-0000-0000-0000000000a2'));
select pg_temp.chk('settle uygulandı (300 → 325) ve rakip 280', (select trophies from public.afp_player_trophies where user_id='00000000-0000-0000-0000-0000000000a2') = 325 and (select trophies from public.afp_players where user_id='00000000-0000-0000-0000-0000000000a4') = 280);

select name, case when ok then 'GEÇTİ' else 'KALDI' end sonuc, info from _t order by 2 desc, 1;
select count(*) filter (where ok) gecen, count(*) filter (where not ok) kalan from _t;
