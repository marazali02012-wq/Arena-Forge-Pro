// YALNIZ TEST: Arena Forge Pro çevrim içi sunucusunun YEREL taklidi. Canlı Render/Supabase'e dokunmaz.
// Protokol oyunun kendi dostluk maçı oda sunucusundan (AFP_FRIEND_MATCH_V1 makeServer) ve istemci kodundan alındı:
// hello → queue_waiting / match_found → ready → player_ready / room_ready → battle_setup → battle_start →
// action ↔ battle_action, battle_state ↔ battle_state → battle_result (iki taraf) → battle_result{confirmed} / battle_disputed.
// Kopma: peer_reconnecting → (rejoin → rejoin_ok + peer_rejoined) ya da süre dolunca peer_left{forfeit}.
// Kontrol: http://127.0.0.1:PORT/ctl?op=kill&seat=2   (o koltuğun soketini sert kapatır)
//          http://127.0.0.1:PORT/ctl?op=norejoin&on=1 (geri katılmayı reddet)   /ctl?op=dupresult&on=1 (sonucu iki kez yolla)
//          http://127.0.0.1:PORT/ctl?op=log           (olay günlüğü)
'use strict';
const http = require('http');
const { wsServer: WebSocketServer } = require(process.env.PW_CORE_UTILS || require.resolve('playwright-core/lib/utilsBundle', { paths: [require.resolve('playwright')] }));
const PORT = +(process.argv[2] || 8790), GRACE = +(process.argv[3] || 8000);
const log = []; const L = (ev, d) => { const e = Object.assign({ t: Date.now(), ev }, d || {}); log.push(e); if (log.length > 2000) log.shift(); };
const opts = { norejoin: false, dupresult: false };
const queue = new Map();           // modeId -> [client]
const rooms = new Map();           // roomId -> room
let roomSeq = 0;
function frame(c, o) { return JSON.stringify(Object.assign({ protocolVersion: 1, modeId: c && c.modeId }, o)); }
function tx(c, o) { if (c && c.ws && c.ws.readyState === 1) { try { c.ws.send(frame(c, o)); } catch (_) {} } L('tx', { seat: c && c.seat, type: o.type }); }
function uidOf(tok) { return String(tok || '').slice(0, 48); }
function pair(modeId) {
  const q = queue.get(modeId) || [];
  while (q.length >= 2) {
    const a = q.shift(), b = q.shift();
    if (uidOf(a.token) === uidOf(b.token)) { q.unshift(a); break; }   // aynı hesap kendisiyle eşleşmez
    const room = { id: 'test-room-' + (++roomSeq) + '-' + Math.random().toString(36).slice(2, 7), modeId, seats: { 1: a, 2: b }, ready: 0, setup: 0, started: false, done: false, closed: false, results: {}, aseq: 0, sseq: 0, timers: {} };
    a.room = room; a.seat = 1; b.room = room; b.seat = 2; rooms.set(room.id, room);
    for (const c of [a, b]) tx(c, { type: 'match_found', roomId: room.id, seat: c.seat, partySize: 2 });
    L('paired', { room: room.id, modeId });
  }
  queue.set(modeId, q);
  for (const c of q) tx(c, { type: 'queue_waiting', queueSize: q.length, partySize: 2, distinctUsers: q.length });
}
function other(room, seat) { return room.seats[seat === 1 ? 2 : 1]; }
function finishResults(room) {
  const r1 = room.results[1], r2 = room.results[2];
  if (!r1 || !r2 || room.done) return;
  room.done = true;
  const ok = Number(r1.winnerSeat) === Number(r2.winnerSeat);
  for (const s of [1, 2]) {
    const c = room.seats[s];
    const msg = ok ? { type: 'battle_result', roomId: room.id, confirmed: true, winnerSeat: Number(r1.winnerSeat), rewardsEnabled: false, rewardBlock: 'test_server' } : { type: 'battle_disputed', roomId: room.id, reason: 'mismatch' };
    tx(c, msg); if (ok && opts.dupresult) tx(c, msg);
  }
  L(ok ? 'confirmed' : 'disputed', { room: room.id, w1: r1.winnerSeat, w2: r2.winnerSeat });
}
function seatGone(room, seat, why) {
  if (room.done || room.closed) return;
  const o = other(room, seat);
  if (!room.started) { room.closed = true; tx(o, { type: 'peer_left', roomId: room.id }); return; }
  if (why === 'leave') { room.closed = true; tx(o, { type: 'peer_left', roomId: room.id, forfeit: true, winnerSeat: o.seat, rewardsEnabled: false, reason: 'left' }); L('peer_left', { room: room.id, seat, why }); return; }
  tx(o, { type: 'peer_reconnecting', roomId: room.id, seat, graceMs: GRACE });
  clearTimeout(room.timers[seat]);
  room.timers[seat] = setTimeout(() => {
    if (room.done || room.closed) return; const c = room.seats[seat]; if (c.ws && c.ws.readyState === 1) return;
    room.closed = true; tx(o, { type: 'peer_left', roomId: room.id, forfeit: true, winnerSeat: o.seat, rewardsEnabled: false, reason: 'disconnect' }); L('peer_left', { room: room.id, seat, why: 'grace-over' });
  }, GRACE);
}
function onMsg(c, raw) {
  let x; try { x = JSON.parse(String(raw)); } catch (_) { return; }
  if (x.type !== 'ping' && x.type !== 'battle_state') L('rx', { seat: c.seat, type: x.type, at: x.actionType });
  if (x.type === 'ping') { tx(c, { type: 'pong', clientTime: x.clientTime, serverTime: Date.now() }); return; }
  if (x.type === 'hello') {
    if (Number(x.protocolVersion) !== 1) { tx(c, { type: 'server_error', code: 'protocol_mismatch' }); return; }
    c.modeId = String(x.modeId || ''); c.token = String(x.accessToken || ''); c.hello = x;
    const q = queue.get(c.modeId) || []; q.push(c); queue.set(c.modeId, q); pair(c.modeId); return;
  }
  if (x.type === 'rejoin') {
    const room = rooms.get(String(x.roomId || ''));
    const seat = room && [1, 2].find(s => uidOf(room.seats[s].token) === uidOf(x.accessToken));
    if (opts.norejoin || !room || !seat || room.done || room.closed) { c.modeId = room ? room.modeId : ''; tx(c, { type: 'server_error', code: 'rejoin_not_available' }); L('rejoin-refused', { room: x.roomId }); return; }
    const old = room.seats[seat]; c.modeId = room.modeId; c.token = old.token; c.room = room; c.seat = seat; room.seats[seat] = c; clearTimeout(room.timers[seat]);
    tx(c, { type: 'rejoin_ok', roomId: room.id, seat }); tx(other(room, seat), { type: 'peer_rejoined', roomId: room.id, seat }); L('rejoined', { room: room.id, seat }); return;
  }
  if (x.type === 'cancel_queue' || x.type === 'leave') {
    const q = queue.get(c.modeId) || []; const i = q.indexOf(c); if (i >= 0) q.splice(i, 1);
    if (c.room) seatGone(c.room, c.seat, 'leave'); c.left = true; return;
  }
  const room = c.room; if (!room) return; const o = other(room, c.seat);
  if (x.type === 'ready') { if (!c.ready) { c.ready = true; room.ready++; } for (const s of [1, 2]) tx(room.seats[s], { type: 'player_ready', roomId: room.id, readyCount: room.ready, partySize: 2 }); if (room.ready === 2) for (const s of [1, 2]) tx(room.seats[s], { type: 'room_ready', roomId: room.id }); return; }
  if (x.type === 'battle_setup') {
    c.cmd = x.commander || {}; if (!c.setup) { c.setup = true; room.setup++; } tx(o, { type: 'battle_setup_received', roomId: room.id });
    if (room.setup === 2 && !room.started) { room.started = true; room.startedAt = Date.now(); const seed = 1 + Math.floor(Math.random() * 2147483000), startAt = Date.now() + 2500;
      for (const s of [1, 2]) { const me = room.seats[s], op = other(room, s); tx(me, { type: 'battle_start', roomId: room.id, matchId: room.id, seat: s, seed, startAt, opponentCommander: op.cmd, opponentUserId: uidOf(op.token) }); } L('started', { room: room.id }); }
    return;
  }
  if (x.type === 'action') { room.aseq++; tx(o, { type: 'battle_action', roomId: room.id, seat: c.seat, actionType: x.actionType, payload: x.payload, seq: room.aseq }); return; }
  if (x.type === 'battle_state') { room.sseq++; tx(o, { type: 'battle_state', roomId: room.id, seat: c.seat, state: x.state, snapshotSeq: room.sseq }); return; }
  if (x.type === 'battle_result') { if (room.results[c.seat]) { L('result-dup-from-client', { seat: c.seat }); return; } room.results[c.seat] = x; L('result', { seat: c.seat, winnerSeat: x.winnerSeat, result: x.result }); finishResults(room); return; }
}
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/ctl') {
    const op = u.searchParams.get('op'); let out = { ok: true };
    if (op === 'kill') { const seat = +u.searchParams.get('seat'); const room = [...rooms.values()].pop(); const c = room && room.seats[seat]; if (c && c.ws) { c.ws.terminate(); out.killed = seat; } else out.ok = false; }
    else if (op === 'norejoin') opts.norejoin = u.searchParams.get('on') === '1';
    else if (op === 'dupresult') opts.dupresult = u.searchParams.get('on') === '1';
    else if (op === 'log') out = log.slice(-(+u.searchParams.get('n') || 80));
    else if (op === 'rooms') out = [...rooms.values()].map(r => ({ id: r.id, mode: r.modeId, started: r.started, done: r.done, closed: r.closed, results: Object.keys(r.results) }));
    res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(out)); return;
  }
  res.writeHead(404); res.end();
});
const wss = new WebSocketServer({ server: srv, path: '/ws' });
wss.on('connection', ws => {
  const c = { ws, seat: 0, room: null, modeId: '', token: '' };
  ws.on('message', d => onMsg(c, d));
  ws.on('close', () => { L('close', { seat: c.seat }); const q = queue.get(c.modeId) || []; const i = q.indexOf(c); if (i >= 0) q.splice(i, 1); if (c.room && c.room.seats[c.seat] === c && !c.left) seatGone(c.room, c.seat, 'close'); });
});
srv.listen(PORT, '127.0.0.1', () => console.log('sahte sunucu hazır ' + PORT + ' (geri dönüş süresi ' + GRACE + ' ms)'));
