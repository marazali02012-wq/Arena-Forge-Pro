-- GERİ ALMA: 06 uygulanmadan önceki canlı işlev tanımları (2026-11-16 alındı).
-- Uyarı: eski afp_social_me kupayı istemciden alır (güvensiz). Yalnızca acil geri dönüş içindir.
CREATE OR REPLACE FUNCTION public.afp_social_me(p_nickname text DEFAULT NULL::text, p_level integer DEFAULT NULL::integer, p_trophies integer DEFAULT NULL::integer, p_hero text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_uid uuid := auth.uid(); v public.afp_players; v_nick text;
begin
  if v_uid is null then raise exception 'AFP_AUTH'; end if;
  v_nick := nullif(public.afp__clean(p_nickname, 24), '');
  select * into v from public.afp_players where user_id = v_uid;
  if not found then
    insert into public.afp_players (user_id, nickname, friend_code, level, trophies, hero)
    values (v_uid, coalesce(v_nick, 'Komutan'), public.afp__new_code(),
            case when p_level    is null then 1 else greatest(1, least(999, p_level)) end,
            case when p_trophies is null then 0 else greatest(0, least(1000000, p_trophies)) end,
            nullif(public.afp__clean(p_hero, 40), ''))
    on conflict (user_id) do nothing;
    select * into v from public.afp_players where user_id = v_uid;
  else
    update public.afp_players set
      nickname  = coalesce(v_nick, nickname),
      level     = case when p_level    is null then level    else greatest(1, least(999, p_level)) end,
      trophies  = case when p_trophies is null then trophies else greatest(0, least(1000000, p_trophies)) end,
      hero      = coalesce(nullif(public.afp__clean(p_hero, 40), ''), hero),
      last_seen = now()
    where user_id = v_uid
    returning * into v;
  end if;
  return jsonb_build_object('user_id', v.user_id, 'nickname', v.nickname, 'friend_code', v.friend_code, 'level', v.level,
                            'trophies', v.trophies, 'hero', v.hero, 'banned', v.banned,
                            'muted_until', case when v.muted_until > now() then v.muted_until else null end);
end $function$;

CREATE OR REPLACE FUNCTION public.afp_leaderboard(p_scope text DEFAULT 'world'::text, p_limit integer DEFAULT 50)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare me public.afp_players; v_lim int := greatest(5, least(100, coalesce(p_limit, 50)));
        v_scope text := case when p_scope = 'friends' then 'friends' else 'world' end;
        v_rows jsonb; v_rank bigint; v_total bigint; v_ids uuid[] := '{}';
begin
  me := public.afp__require_player(false);
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
    from (select p.user_id, p.nickname, p.level, p.trophies, p.hero,
                 rank() over (order by p.trophies desc, p.level desc) as rk
            from public.afp_players p
           where not p.banned
             and (v_scope = 'world' or p.user_id = any(v_ids))
           order by p.trophies desc, p.level desc, p.nickname
           limit v_lim) t;

  select 1 + count(*) into v_rank from public.afp_players p
   where not p.banned and (v_scope = 'world' or p.user_id = any(v_ids))
     and (p.trophies > me.trophies or (p.trophies = me.trophies and p.level > me.level));
  select count(*) into v_total from public.afp_players p
   where not p.banned and (v_scope = 'world' or p.user_id = any(v_ids));

  return jsonb_build_object('scope', v_scope, 'rows', v_rows,
                            'me', jsonb_build_object('rank', v_rank, 'total', v_total, 'user_id', me.user_id, 'nickname', me.nickname,
                                                     'level', me.level, 'trophies', me.trophies, 'hero', me.hero));
end $function$;

-- İsteğe bağlı: yansıtma tetikleyicisini kaldır
-- drop trigger if exists afp_trophy_mirror_trg on public.afp_player_trophies;
