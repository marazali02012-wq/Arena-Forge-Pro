-- Keep the existing RPC, execute privileges and table policies.
CREATE OR REPLACE FUNCTION public.afp_trophy_leaderboard(p_limit integer DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AFP_AUTH' USING ERRCODE = '28000';
  END IF;

  WITH ranked AS MATERIALIZED (
    SELECT rank() OVER (ORDER BY t.trophies DESC, p.level DESC) AS rank,
           count(*) OVER () AS total,
           t.user_id, t.user_id = v_uid AS me, t.trophies, p.nickname, p.level, p.hero
    FROM public.afp_player_trophies AS t
    JOIN public.afp_players AS p ON p.user_id = t.user_id
    WHERE NOT p.banned
  ), top_players AS (
    SELECT rank, user_id, me, trophies, nickname, level, hero
    FROM ranked
    ORDER BY rank, nickname, user_id
    LIMIT v_limit
  )
  SELECT jsonb_build_object(
    'rows', coalesce((SELECT jsonb_agg(to_jsonb(t) ORDER BY t.rank, t.nickname, t.user_id) FROM top_players AS t), '[]'::jsonb),
    'me', (SELECT jsonb_build_object('rank', r.rank, 'total', r.total, 'trophies', r.trophies) FROM ranked AS r WHERE r.me),
    'authoritative', true
  ) INTO v_result;

  RETURN v_result;
END;
$function$;
