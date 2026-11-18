// ÖRNEK — Render'daki çevrim içi oyun sunucusuna (arena-forge-online-server) eklenecek kupa bağlantısı.
// Sunucunun gerçek kaynak kodu bu depoda yok; aşağıdaki kod, maç sonucunu işleyen yere nasıl bağlanacağını gösterir.
// Değişken adları (room, seats, results) senin sunucundakilere göre değiştirilmelidir.
//
// Render → Service → Environment:
//   SUPABASE_URL                = Supabase → Project Settings → API → Project URL
//   SUPABASE_SERVICE_ROLE_KEY   = Supabase → Project Settings → API → service_role (GİZLİ; yalnız sunucuda)
//
// Kurulum (sunucu deposunda):  npm install @supabase/supabase-js
'use strict';
const { settleTrophies } = require('./03_wss_kupa_isle');   // bu depodaki sunucu/03_wss_kupa_isle.js dosyasını sunucuya kopyala

// İki koltuktan gelen 'battle_result' mesajları toplandığında çağrılır.
async function onBothResults(room) {
  const a = room.results[0], b = room.results[1];               // her koltuğun bildirdiği kazanan koltuk (0, 1 ya da -1 berabere)
  const agreed = a && b && a.winnerSeat === b.winnerSeat;       // iki taraf AYNI sonucu bildirmeli
  const match = {
    id: room.matchId,
    startedAt: room.startedAt,                                  // sunucunun KENDİ saatinden; istemciden alma
    endedAt: Date.now(),
    seats: room.seats.map(s => ({ userId: s.userId })),         // Supabase auth kullanıcı kimlikleri (uuid)
    winnerSeat: agreed ? a.winnerSeat : null,
    confirmed: agreed,
  };
  let trophy = { ok: false, reason: 'onaysiz' };
  if (agreed) trophy = await settleTrophies(match);             // kupa yalnız burada, sunucuda değişir
  for (let i = 0; i < 2; i++) {
    const res = !agreed ? 'unverified' : match.winnerSeat === -1 ? 'draw' : (match.winnerSeat === i ? 'win' : 'loss');
    const mine = trophy && trophy.ok ? (res === 'win' ? trophy.winner : res === 'loss' ? trophy.loser : null) : null;
    room.send(i, { type: 'battle_result', confirmed: agreed, result: res,
      trophyDelta: mine ? mine.delta : 0, trophiesAfter: mine ? mine.after : null });   // istemcide yalnız gösterim
  }
}

// Eşleşmede kupa, istemcinin 'hello' mesajından DEĞİL sunucu defterinden okunur:
//   const { data } = await sb.from('afp_player_trophies').select('trophies').eq('user_id', userId).maybeSingle();
//   const trophies = data ? data.trophies : 0;

module.exports = { onBothResults };
