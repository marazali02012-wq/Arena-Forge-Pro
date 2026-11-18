-- =====================================================================================================
-- ARENA FORGE PRO — KUPA OTORİTESİ (sunucu tarafı, Supabase/PostgreSQL)
-- Amaç: SIRALAMA/EŞLEŞME kupasını oyuncunun değiştirmesini TAMAMEN engellemek.
-- İlke:  * Sıralama kupası yalnızca bu şemadaki tabloda tutulur; oyuncu rolleri (anon/authenticated) bu tabloya
--          DOĞRUDAN YAZAMAZ, güncelleme fonksiyonunu ÇAĞIRAMAZ.
--        * Kupa yalnızca güvenilen sunucu süreci (WSS çevrim içi sunucusu, service_role anahtarıyla) tarafından,
--          İKİ CİHAZIN SONUCU UYUŞTUKTAN SONRA `afp_trophy_settle` ile değiştirilir; fark sunucuda hesaplanır.
--        * İstemcinin gönderdiği kupa değeri (afp_social_me.p_trophies, player_profiles.save_data->'trophies')
--          sıralamada/eşleşmede ASLA kullanılmaz (bkz. SUNUCU_KUPA_OTORITESI.md).
-- Bu dosya idempotenttir (tekrar çalıştırılabilir). Yerel PostgreSQL 16'da 02_kupa_otorite_test.sql ile doğrulandı.
-- =====================================================================================================

create table if not exists public.afp_trophy_config (
  key   text primary key,
  value numeric not null
);
insert into public.afp_trophy_config(key,value) values
  ('gain_base',25),('gain_min',10),('gain_max',40),
  ('loss_base',20),('loss_min',5),('loss_max',30),
  ('slope_div',10),                -- kupa farkının kaç puanı ±1 kupa ekler
  ('min_duration_s',45),           -- bundan kısa maç sayılmaz (anlaşmalı hızlı maç/çiftçilik)
  ('pair_cap_24h',3),              -- aynı iki oyuncu arasında 24 saatte en çok sayılan maç
  ('daily_gain_cap',250),          -- bir oyuncunun 24 saatte kazanabileceği en çok kupa
  ('seed_cap',300),                -- yerelden bir kerelik devir için üst sınır
  ('max_trophies',20000)
on conflict (key) do nothing;

create table if not exists public.afp_player_trophies (
  user_id    uuid primary key,
  trophies   integer not null default 0 check (trophies >= 0 and trophies <= 20000),
  wins       integer not null default 0,
  losses     integer not null default 0,
  draws      integer not null default 0,
  seeded     boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.afp_trophy_ledger (
  id              bigserial primary key,
  match_id        text    not null,
  user_id         uuid    not null,
  opponent_id     uuid    not null,
  outcome         text    not null check (outcome in ('win','loss','draw')),
  delta           integer not null,
  trophies_before integer not null,
  trophies_after  integer not null,
  note            text,
  created_at      timestamptz not null default now(),
  unique (match_id, user_id)
);
create index if not exists afp_trophy_ledger_user_time on public.afp_trophy_ledger (user_id, created_at desc);
create index if not exists afp_player_trophies_rank on public.afp_player_trophies (trophies desc);

-- Satır düzeyi güvenlik: politika YOK => anon/authenticated doğrudan hiçbir şey okuyamaz/yazamaz.
alter table public.afp_trophy_config   enable row level security;
alter table public.afp_player_trophies enable row level security;
alter table public.afp_trophy_ledger   enable row level security;
revoke all on public.afp_trophy_config, public.afp_player_trophies, public.afp_trophy_ledger from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname='anon') then
    revoke all on public.afp_trophy_config, public.afp_player_trophies, public.afp_trophy_ledger from anon;
    revoke all on sequence public.afp_trophy_ledger_id_seq from anon;
  end if;
  if exists (select 1 from pg_roles where rolname='authenticated') then
    revoke all on public.afp_trophy_config, public.afp_player_trophies, public.afp_trophy_ledger from authenticated;
    revoke all on sequence public.afp_trophy_ledger_id_seq from authenticated;
  end if;
end $$;
revoke all on sequence public.afp_trophy_ledger_id_seq from public;

create or replace function public.afp_trophy_cfg(p_key text) returns numeric
language sql stable security definer set search_path = public, pg_temp as
$$ select value from public.afp_trophy_config where key = p_key $$;

-- Eşleşme kuralı (bkz. SUNUCU_KUPA_ESLESME.md): |A-B| <= max(5, floor(min(A,B)*0.2))
create or replace function public.afp_trophy_pair_ok(a integer, b integer) returns boolean
language sql immutable as
$$ select abs(a - b) <= greatest(5, floor(least(a, b) * 0.2)::integer) $$;

-- Oyuncu kendi SUNUCU kupasını okur (satır yoksa 0 ile oluşturur). Yazma yetkisi yok.
create or replace function public.afp_trophy_me() returns jsonb
language plpgsql security definer set search_path = public, pg_temp as
$$
declare uid uuid := auth.uid(); r public.afp_player_trophies;
begin
  if uid is null then raise exception 'oturum yok' using errcode = '28000'; end if;
  insert into public.afp_player_trophies(user_id) values (uid) on conflict (user_id) do nothing;
  select * into r from public.afp_player_trophies where user_id = uid;
  return jsonb_build_object('trophies', r.trophies, 'wins', r.wins, 'losses', r.losses, 'draws', r.draws,
                            'seeded', r.seeded, 'authoritative', true);
end $$;

-- Bir kerelik devir: yerel kupayı, küçük bir üst sınırla (seed_cap) sunucuya taşır. Tekrar çağrılamaz.
create or replace function public.afp_trophy_seed_me(p_claimed integer) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as
$$
declare uid uuid := auth.uid(); r public.afp_player_trophies; cap integer := public.afp_trophy_cfg('seed_cap')::integer;
begin
  if uid is null then raise exception 'oturum yok' using errcode = '28000'; end if;
  insert into public.afp_player_trophies(user_id) values (uid) on conflict (user_id) do nothing;
  select * into r from public.afp_player_trophies where user_id = uid for update;
  if not r.seeded then
    update public.afp_player_trophies
       set trophies = least(greatest(coalesce(p_claimed,0),0), cap), seeded = true, updated_at = now()
     where user_id = uid returning * into r;
    insert into public.afp_trophy_ledger(match_id,user_id,opponent_id,outcome,delta,trophies_before,trophies_after,note)
    values ('seed:'||uid::text, uid, uid, 'draw', r.trophies, 0, r.trophies, 'devir');
  end if;
  return jsonb_build_object('trophies', r.trophies, 'seeded', r.seeded, 'authoritative', true);
end $$;

-- Sıralama tablosu: yalnızca sunucu kupası. Takma ad/seviye/kahraman için afp_players (canlı şema) okunur; yoksa varsayılanlar.
create or replace function public.afp_trophy_leaderboard(p_limit integer default 50) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as
$$
declare uid uuid := auth.uid(); rows jsonb; me jsonb; total bigint;
begin
  if uid is null then raise exception 'oturum yok' using errcode = '28000'; end if;
  p_limit := least(greatest(coalesce(p_limit,50),1),100);
  select count(*) into total from public.afp_player_trophies;
  if to_regclass('public.afp_players') is not null then
    execute $q$
      select coalesce(jsonb_agg(x order by x.rank, x.nickname),'[]'::jsonb) from (
        select rank() over (order by t.trophies desc, coalesce(p.level,1) desc) as rank, t.user_id as user_id, t.user_id = $1 as me,
               t.trophies, coalesce(p.nickname,'Oyuncu') as nickname, coalesce(p.level,1) as level, p.hero as hero
          from public.afp_player_trophies t left join public.afp_players p on p.user_id = t.user_id
         where coalesce(p.banned,false) = false
         order by t.trophies desc, coalesce(p.level,1) desc, coalesce(p.nickname,'') limit $2) x $q$ into rows using uid, p_limit;
  else
    select coalesce(jsonb_agg(x order by x.rank),'[]'::jsonb) into rows from (
      select rank() over (order by t.trophies desc) as rank, t.user_id as user_id, t.user_id = uid as me, t.trophies,
             'Oyuncu'::text as nickname, 1 as level, null::text as hero
        from public.afp_player_trophies t order by t.trophies desc, t.user_id limit p_limit) x;
  end if;
  select jsonb_build_object('rank', 1 + (select count(*) from public.afp_player_trophies o where o.trophies > m.trophies),
                            'total', total, 'trophies', m.trophies)
    into me from public.afp_player_trophies m where m.user_id = uid;
  return jsonb_build_object('rows', rows, 'me', me, 'authoritative', true);
end $$;

-- MAÇ SONUCU İŞLEME — yalnızca service_role (güvenilen çevrim içi sunucu) çağırabilir.
-- Sunucu, İKİ koltuğun sonucu UYUŞTUKTAN sonra çağırır. Fark sunucuda, sunucudaki iki kupadan hesaplanır.
create or replace function public.afp_trophy_settle(
  p_match_id text, p_winner uuid, p_loser uuid, p_draw boolean,
  p_started_at timestamptz, p_ended_at timestamptz) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as
$$
declare
  wr public.afp_player_trophies; lr public.afp_player_trophies; first_id uuid; second_id uuid;
  dur numeric; div numeric := public.afp_trophy_cfg('slope_div'); diff integer;
  gain integer; loss integer; wgain integer; day_sum integer; pairs integer;
  w_after integer; l_after integer; prior jsonb;
begin
  if p_match_id is null or length(p_match_id) < 6 or p_winner is null or p_loser is null or p_winner = p_loser then
    return jsonb_build_object('ok', false, 'reason', 'gecersiz_istek');
  end if;
  -- idempotent: aynı maç ikinci kez işlenmez
  select jsonb_build_object('ok', true, 'applied', false, 'duplicate', true,
           'winner', jsonb_build_object('user_id', w.user_id, 'delta', w.delta, 'after', w.trophies_after),
           'loser',  jsonb_build_object('user_id', l.user_id, 'delta', l.delta, 'after', l.trophies_after))
    into prior
    from public.afp_trophy_ledger w join public.afp_trophy_ledger l on l.match_id = w.match_id
   where w.match_id = p_match_id and w.user_id = p_winner and l.user_id = p_loser
     and w.outcome in ('win','draw') and l.outcome in ('loss','draw');
  if prior is not null then return prior; end if;
  if exists (select 1 from public.afp_trophy_ledger where match_id = p_match_id) then
    return jsonb_build_object('ok', false, 'reason', 'maç_taraflari_uyusmuyor');
  end if;
  dur := extract(epoch from (p_ended_at - p_started_at));
  if dur is null or dur < public.afp_trophy_cfg('min_duration_s') or dur > 3600 then
    return jsonb_build_object('ok', false, 'reason', 'sure_gecersiz');
  end if;
  -- satırları sabit sırayla kilitle (kilitlenme önleme)
  insert into public.afp_player_trophies(user_id) values (p_winner), (p_loser) on conflict (user_id) do nothing;
  first_id := least(p_winner, p_loser); second_id := greatest(p_winner, p_loser);
  perform 1 from public.afp_player_trophies where user_id = first_id for update;
  perform 1 from public.afp_player_trophies where user_id = second_id for update;
  select * into wr from public.afp_player_trophies where user_id = p_winner;
  select * into lr from public.afp_player_trophies where user_id = p_loser;
  if not public.afp_trophy_pair_ok(wr.trophies, lr.trophies) then
    return jsonb_build_object('ok', false, 'reason', 'eslesme_araligi_disi');
  end if;
  select count(*) into pairs from public.afp_trophy_ledger
   where created_at > now() - interval '24 hours' and user_id = p_winner and opponent_id = p_loser;
  if pairs >= public.afp_trophy_cfg('pair_cap_24h') then
    return jsonb_build_object('ok', false, 'reason', 'ayni_rakip_siniri');
  end if;

  if coalesce(p_draw, false) then
    insert into public.afp_trophy_ledger(match_id,user_id,opponent_id,outcome,delta,trophies_before,trophies_after,note) values
      (p_match_id, p_winner, p_loser, 'draw', 0, wr.trophies, wr.trophies, 'beraberlik'),
      (p_match_id, p_loser,  p_winner,'draw', 0, lr.trophies, lr.trophies, 'beraberlik');
    update public.afp_player_trophies set draws = draws + 1, updated_at = now() where user_id in (p_winner, p_loser);
    return jsonb_build_object('ok', true, 'applied', true, 'draw', true,
      'winner', jsonb_build_object('user_id', p_winner, 'delta', 0, 'after', wr.trophies),
      'loser',  jsonb_build_object('user_id', p_loser,  'delta', 0, 'after', lr.trophies));
  end if;

  diff := lr.trophies - wr.trophies;   -- zayıf kazanırsa daha çok, güçlü kazanırsa daha az
  gain := least(public.afp_trophy_cfg('gain_max')::integer, greatest(public.afp_trophy_cfg('gain_min')::integer,
            public.afp_trophy_cfg('gain_base')::integer + trunc(diff / div)::integer));
  loss := least(public.afp_trophy_cfg('loss_max')::integer, greatest(public.afp_trophy_cfg('loss_min')::integer,
            public.afp_trophy_cfg('loss_base')::integer + trunc(diff / div)::integer));
  select coalesce(sum(delta),0) into day_sum from public.afp_trophy_ledger
   where user_id = p_winner and delta > 0 and created_at > now() - interval '24 hours' and match_id not like 'seed:%';
  wgain := least(gain, greatest(0, public.afp_trophy_cfg('daily_gain_cap')::integer - day_sum));
  wgain := least(wgain, public.afp_trophy_cfg('max_trophies')::integer - wr.trophies);
  loss  := least(loss, lr.trophies);
  w_after := wr.trophies + wgain; l_after := lr.trophies - loss;

  update public.afp_player_trophies set trophies = w_after, wins = wins + 1, updated_at = now() where user_id = p_winner;
  update public.afp_player_trophies set trophies = l_after, losses = losses + 1, updated_at = now() where user_id = p_loser;
  insert into public.afp_trophy_ledger(match_id,user_id,opponent_id,outcome,delta,trophies_before,trophies_after,note) values
    (p_match_id, p_winner, p_loser,  'win',  wgain,  wr.trophies, w_after, case when wgain < gain then 'günlük sınır' end),
    (p_match_id, p_loser,  p_winner, 'loss', -loss,  lr.trophies, l_after, null);
  return jsonb_build_object('ok', true, 'applied', true,
    'winner', jsonb_build_object('user_id', p_winner, 'delta', wgain,  'after', w_after),
    'loser',  jsonb_build_object('user_id', p_loser,  'delta', -loss,  'after', l_after));
end $$;

-- Yetkiler: settle yalnızca service_role; oyuncu yalnızca okuma/devir/sıralama RPC'lerini çağırabilir.
revoke all on function public.afp_trophy_cfg(text), public.afp_trophy_pair_ok(integer,integer),
  public.afp_trophy_me(), public.afp_trophy_seed_me(integer), public.afp_trophy_leaderboard(integer),
  public.afp_trophy_settle(text,uuid,uuid,boolean,timestamptz,timestamptz) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname='anon') then
    revoke all on function public.afp_trophy_cfg(text), public.afp_trophy_pair_ok(integer,integer),
      public.afp_trophy_me(), public.afp_trophy_seed_me(integer), public.afp_trophy_leaderboard(integer),
      public.afp_trophy_settle(text,uuid,uuid,boolean,timestamptz,timestamptz) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname='authenticated') then
    revoke all on function public.afp_trophy_cfg(text), public.afp_trophy_settle(text,uuid,uuid,boolean,timestamptz,timestamptz) from authenticated;
    grant execute on function public.afp_trophy_me(), public.afp_trophy_seed_me(integer),
      public.afp_trophy_leaderboard(integer), public.afp_trophy_pair_ok(integer,integer) to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname='service_role') then
    grant execute on function public.afp_trophy_cfg(text), public.afp_trophy_pair_ok(integer,integer),
      public.afp_trophy_settle(text,uuid,uuid,boolean,timestamptz,timestamptz) to service_role;
  end if;
end $$;
