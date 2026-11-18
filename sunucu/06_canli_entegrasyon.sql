-- =====================================================================================================
-- CANLI ŞEMA ENTEGRASYONU (01 uygulandıktan sonra). Canlı Supabase'de (Arena Forge Pro) mevcut tablo/işlevlere bakılarak yazıldı:
--   public.afp_players (user_id, nickname, friend_code, level, trophies, hero, muted_until, banned, last_seen, created_at)
--   afp_social_me(p_nickname,p_level,p_trophies,p_hero), afp_leaderboard(p_scope,p_limit), afp__require_player(boolean)
-- Etki:
--   1) afp_social_me artık p_trophies'i YOK SAYAR; döndürdüğü kupa sunucu defterinden gelir.
--   2) afp_leaderboard (dünya + arkadaşlar) sıralamayı sunucu defterinden yapar; çıktı biçimi AYNI (istemci değişmeden çalışır).
--   3) afp_player_trophies değişince afp_players.trophies otomatik yansıtılır (eski okuyucular tutarlı kalır).
--   4) Mevcut oyuncular, en çok seed_cap (300) kupa ile deftere alınır (istemci kaynaklı eski değerlere güvenilmez).
-- =====================================================================================================

-- 3) Yansıtma tetikleyicisi
create or replace function public.afp_trophy_mirror() returns trigger
language plpgsql security definer set search_path = public, pg_temp as
$$ begin
  update public.afp_players set trophies = new.trophies where user_id = new.user_id and trophies is distinct from new.trophies;
  return null;
end $$;
revoke all on function public.afp_trophy_mirror() from public;
drop trigger if exists afp_trophy_mirror_trg on public.afp_player_trophies;
create trigger afp_trophy_mirror_trg after insert or update of trophies on public.afp_player_trophies
  for each row execute function public.afp_trophy_mirror();

-- 4) Mevcut oyuncuları deftere al (tek seferlik, idempotent)
insert into public.afp_player_trophies (user_id, trophies, seeded)
select p.user_id, least(greatest(coalesce(p.trophies,0),0), public.afp_trophy_cfg('seed_cap')::integer), true
  from public.afp_players p
on conflict (user_id) do nothing;

-- 1) afp_social_me: kupa istemciden alınmaz
create or replace function public.afp_social_me(p_nickname text default null, p_level integer default null,
                                                p_trophies integer default null, p_hero text default null)
returns jsonb language plpgsql security definer set search_path = public as
$function$
declare v_uid uuid := auth.uid(); v public.afp_players; v_nick text; v_tro integer;
begin
  if v_uid is null then raise exception 'AFP_AUTH'; end if;
  v_nick := nullif(public.afp__clean(p_nickname, 24), '');
  select * into v from public.afp_players where user_id = v_uid;
  if not found then
    insert into public.afp_players (user_id, nickname, friend_code, level, trophies, hero)
    values (v_uid, coalesce(v_nick, 'Komutan'), public.afp__new_code(),
            case when p_level is null then 1 else greatest(1, least(999, p_level)) end,
            0, nullif(public.afp__clean(p_hero, 40), ''))
    on conflict (user_id) do nothing;
  else
    update public.afp_players set
      nickname  = coalesce(v_nick, nickname),
      level     = case when p_level is null then level else greatest(1, least(999, p_level)) end,
      hero      = coalesce(nullif(public.afp__clean(p_hero, 40), ''), hero),
      last_seen = now()
    where user_id = v_uid;   -- trophies: bilerek DEĞİŞTİRİLMEZ
  end if;
  insert into public.afp_player_trophies (user_id) values (v_uid) on conflict (user_id) do nothing;
  select * into v from public.afp_players where user_id = v_uid;
  select trophies into v_tro from public.afp_player_trophies where user_id = v_uid;
  return jsonb_build_object('user_id', v.user_id, 'nickname', v.nickname, 'friend_code', v.friend_code, 'level', v.level,
                            'trophies', coalesce(v_tro, 0), 'hero', v.hero, 'banned', v.banned,
                            'muted_until', case when v.muted_until > now() then v.muted_until else null end);
end $function$;

-- 2) afp_leaderboard: kupa kaynağı sunucu defteri (çıktı biçimi değişmedi)
create or replace function public.afp_leaderboard(p_scope text default 'world', p_limit integer default 50)
returns jsonb language plpgsql stable security definer set search_path = public as
$function$
declare me public.afp_players; v_lim int := greatest(5, least(100, coalesce(p_limit, 50)));
        v_scope text := case when p_scope = 'friends' then 'friends' else 'world' end;
        v_rows jsonb; v_rank bigint; v_total bigint; v_ids uuid[] := '{}'; v_me_t integer;
begin
  me := public.afp__require_player(false);
  select coalesce((select trophies from public.afp_player_trophies where user_id = me.user_id), 0) into v_me_t;
  if v_scope = 'friends' then
    select coalesce(array_agg(case when f.user_lo = me.user_id then f.user_hi else f.user_lo end), '{}') into v_ids
      from public.afp_friendships f
     where f.status = 'accepted' and (f.user_lo = me.user_id or f.user_hi = me.user_id);
    v_ids := v_ids || me.user_id;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('rank', t.rk, 'user_id', t.user_id, 'nickname', t.nickname, 'level', t.level,
                                               'trophies', t.trophies, 'hero', t.hero, 'me', t.user_id = me.user_id)
                            order by t.rk, t.nickname), '[]'::jsonb)
    into v_rows
    from (select p.user_id, p.nickname, p.level, coalesce(g.trophies,0) as trophies, p.hero,
                 rank() over (order by coalesce(g.trophies,0) desc, p.level desc) as rk
            from public.afp_players p left join public.afp_player_trophies g on g.user_id = p.user_id
           where not p.banned and (v_scope = 'world' or p.user_id = any(v_ids))
           order by coalesce(g.trophies,0) desc, p.level desc, p.nickname
           limit v_lim) t;
  select 1 + count(*) into v_rank from public.afp_players p left join public.afp_player_trophies g on g.user_id = p.user_id
   where not p.banned and (v_scope = 'world' or p.user_id = any(v_ids))
     and (coalesce(g.trophies,0) > v_me_t or (coalesce(g.trophies,0) = v_me_t and p.level > me.level));
  select count(*) into v_total from public.afp_players p
   where not p.banned and (v_scope = 'world' or p.user_id = any(v_ids));
  return jsonb_build_object('scope', v_scope, 'rows', v_rows, 'authoritative', true,
                            'me', jsonb_build_object('rank', v_rank, 'total', v_total, 'user_id', me.user_id, 'nickname', me.nickname,
                                                     'level', me.level, 'trophies', v_me_t, 'hero', me.hero));
end $function$;
