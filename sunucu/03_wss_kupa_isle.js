// Çevrim içi (WSS) sunucuda, iki koltuğun sonucu UYUŞTUKTAN sonra çağrılır. SERVICE ROLE anahtarı yalnızca bu sunucuda
// (ortam değişkeni) durur; APK'ya/istemciye ASLA konmaz.
//   SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...
// Kullanım (battle_result onayı sonrası):
//   const r = await settleTrophies(match);   // match: { id, startedAt, endedAt, seats:[{userId},{userId}], winnerSeat }
//   // r.winner / r.loser -> {delta, after}: istemcilere 'battle_result' içinde gönderilir (yalnızca GÖSTERİM içindir)
'use strict';
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function settleTrophies(match, rpc = (n, a) => sb.rpc(n, a)) {
  // Yalnızca İKİ KOLTUK DA aynı kazananı bildirdiyse ve sunucu kendi saatinden süreyi doğruladıysa çağır.
  if (!match || !match.confirmed || match.winnerSeat === undefined || match.winnerSeat === null) return { ok: false, reason: 'onaysiz' };
  const draw = match.winnerSeat === -1;
  const w = match.seats[draw ? 0 : match.winnerSeat].userId;
  const l = match.seats[draw ? 1 : 1 - match.winnerSeat].userId;
  const { data, error } = await rpc('afp_trophy_settle', {
    p_match_id: String(match.id), p_winner: w, p_loser: l, p_draw: draw,
    p_started_at: new Date(match.startedAt).toISOString(), p_ended_at: new Date(match.endedAt).toISOString(),
  });
  if (error) return { ok: false, reason: 'sunucu_hatasi', detail: error.message };
  return data; // { ok, applied, winner:{user_id,delta,after}, loser:{...} } | { ok:false, reason }
}
module.exports = { settleTrophies };
