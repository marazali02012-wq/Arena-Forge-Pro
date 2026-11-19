// YALNIZ TEST: iki oyun penceresini yerel sahte sunucu üzerinden eşleştirir. Dış ağ tamamen kapalı (DNS yalnız 127.0.0.1).
// Hazırlık: (1) python3 make_testbuild.py <oyun.html> t263new.html  (2) python3 -m http.server 8765 --bind 127.0.0.1
// (3) node cevrimici_sahte_sunucu.js 8790 8000
// kullanım: node cevrimici_iki_oyuncu.js normal pes kopma cift karanlik kalici
const { chromium } = require('playwright');
const http = require('http');
const GAME = process.env.GAME_URL || 'http://127.0.0.1:8765/t263new.html', CTL = 'http://127.0.0.1:8790/ctl';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ctl = q => new Promise((res) => http.get(CTL + '?' + q, r => { let b = ''; r.on('data', d => b += d); r.on('end', () => { try { res(JSON.parse(b)); } catch (_) { res(b); } }); }).on('error', e => res({ err: String(e) })));
const out = []; const P = (...a) => { const s = a.join(' '); out.push(s); console.log(s); };
(async () => {
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
  const ext = [];
  async function mk(name) {
    const ctx = await browser.newContext({ viewport: { width: 740, height: 360 }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('afpOnlineWsUrlV1', 'ws://127.0.0.1:8790/ws'); localStorage.setItem('afpFtueOffV1', '1'); } catch (_) {} });
    ctx.on('request', r => { const u = r.url(); if (!/^(http:\/\/127\.0\.0\.1|ws:\/\/127\.0\.0\.1|data:|blob:)/.test(u)) ext.push(name + ' ' + u.slice(0, 70)); });
    const p = await ctx.newPage(); p.__errs = []; p.on('pageerror', e => p.__errs.push(String(e.message).slice(0, 140)));
    await p.goto(GAME); await sleep(2200);
    await p.evaluate(() => { const h = document.getElementById('afqEntry'), sr = h && h.shadowRoot; const b = sr && [...sr.querySelectorAll('button.alt')].find(x => /Misafir/.test(x.innerText) && x.getBoundingClientRect().width); if (b) b.click(); });
    await sleep(2600);
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^ATLA/.test(x.innerText.trim())); if (b) b.click(); const f = document.getElementById('afpFtue'); if (f) f.remove(); });
    await sleep(800);
    await p.evaluate(() => { const p = __AFE('profile'); p.battles = Math.max(10, +p.battles || 0); p.afpGuide = p.afpGuide || {}; p.afpGuide.off = true; p.afpGuide.bt = { done: true, off: true, started: true, step: 5, ok: [], skip: [], snap: {} }; __AFE('saveProfile()'); });
    return { name, ctx, p };
  }
  const st = (c) => c.p.evaluate(() => {
    const P = __AFE('profile'), S = window.AFPOnlineSyncV68, e = document.getElementById('end');
    const endTxt = e && !e.classList.contains('hide') ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 160) : '';
    const q = document.getElementById('afpModeOnlineQueueOverlay');
    return { playing: __AFE('playing'), sync: S && S.status(), tro: +P.trophies || 0, cr: +P.credits || 0, w: +P.wins || 0, l: +P.losses || 0, b: +P.battles || 0, end: endTxt, queue: q && q.isConnected ? (q.innerText || '').replace(/\s+/g, ' ').slice(0, 120) : '' };
  });
  const jr = (c, n) => c.p.evaluate((n) => (window.AFPOnlineSyncV68 ? window.AFPOnlineSyncV68.journal() : []).slice(-n).map(x => x.ev + (x.winnerSeat !== undefined ? '(' + x.winnerSeat + ')' : '') + (x.outcome ? '(' + x.outcome + '/' + x.state + ')' : '')).join(' > '), n || 12);
  async function home(c) { await c.p.evaluate(() => { const e = document.getElementById('end'); const m = e && e.querySelector('[data-af39=menu]'); if (m && !e.classList.contains('hide')) m.click(); try { __AFE('AF324&&AF324.go("home")'); } catch (_) {} const x = document.querySelector('#afpModeOnlineQueueOverlay #afpMOQClose'); if (x) x.click(); }); await sleep(1500); }
  async function start(A, B, mode) {
    for (const c of [A, B]) await c.p.evaluate((m) => { if (m === 'arena') window.startGame(m); else { window.AFPModeQueueV2.startModeQueue(m, 'duel'); } }, mode);
    for (let i = 0; i < 40; i++) { await sleep(1000); const a = await st(A), b = await st(B); if (a.playing && b.playing && a.sync && b.sync && a.sync.active && b.sync.active) return [a, b]; if (i === 39) { P('  BAŞLAMADI: A=' + JSON.stringify(a).slice(0, 300)); P('  B=' + JSON.stringify(b).slice(0, 300)); } }
    return null;
  }
  async function waitEnd(A, B, sec) { for (let i = 0; i < sec; i++) { await sleep(1000); const a = await st(A), b = await st(B); if (a.sync && a.sync.resultApplied && b.sync && b.sync.resultApplied) return [a, b]; } return [await st(A), await st(B)]; }
  const fmt = (n, s0, s1) => `${n}: ekran="${s1.end.slice(0, 90)}" | kupa ${s0.tro}→${s1.tro} kredi ${s0.cr}→${s1.cr} zafer ${s0.w}→${s1.w} yenilgi ${s0.l}→${s1.l}`;
  let A = await mk('A'), B = await mk('B');
  const scen = process.argv.slice(2).length ? process.argv.slice(2) : ['normal'];
  for (const sc of scen) {
    P('\n=== SENARYO: ' + sc);
    await ctl('op=norejoin&on=0'); await ctl('op=dupresult&on=' + (sc === 'normal' ? '1' : '0'));
    if (sc === 'kalici' && !B) B = await mk('B');
    const a0 = await st(A), b0 = await st(B);
    const s = await start(A, B, sc === 'karanlik' ? 'dark' : 'arena');
    if (!s) { P('  maç başlamadı'); P('  A günlük: ' + await jr(A)); P('  B günlük: ' + await jr(B)); P('  sunucu: ' + JSON.stringify(await ctl('op=log&n=25')).slice(0, 1500)); break; }
    const auth = s[0].sync.authority ? A : B, foll = auth === A ? B : A;
    P(`  başladı: A koltuk ${s[0].sync.seat}${s[0].sync.authority ? ' (otorite)' : ''}, B koltuk ${s[1].sync.seat}${s[1].sync.authority ? ' (otorite)' : ''}, oda ${s[0].sync.matchId}`);
    await sleep(4000);
    if (sc === 'karanlik') {
      for (const c of [A, B]) await c.p.evaluate(() => { __AFE('elapsed=Math.max(elapsed,47)'); });
      await sleep(2500);
      const bs = []; for (const c of [A, B]) bs.push(await c.p.evaluate(() => __AFE('units').filter(u => u.isBoss).length + ' boss, tanım=' + JSON.stringify(__AFE('af263DuelBossDef()')) + ', tür=' + __AFE('af35MatchKind') + ', süre=' + Math.round(__AFE('elapsed'))));
      P('  çevrim içi Karanlık Geçit 47. sn: A ' + bs[0] + ' · B ' + bs[1]);
    }
    if (sc === 'normal' || sc === 'karanlik') {
      await auth.p.evaluate(() => { __AFE('enemySharedHP=0'); });   // otorite tarafında rakip portalı yıkılır → zafer kararı
    } else if (sc === 'pes') {
      await foll.p.evaluate(() => { document.getElementById('exitBattle').click(); }); await sleep(400);
      await foll.p.evaluate(() => { document.getElementById('af274ExitYes').click(); });
    } else if (sc === 'kopma') {
      P('  sunucu: B soketi sert kapatıldı ' + JSON.stringify(await ctl('op=kill&seat=' + (await st(B)).sync.seat)));
      for (let i = 0; i < 12; i++) { await sleep(1000); const j = await jr(B, 6); if (/rejoined/.test(j)) { P('  B geri bağlandı (' + (i + 1) + ' sn): ' + j); break; } if (i === 11) P('  B GERİ BAĞLANAMADI: ' + j); }
      P('  A günlük: ' + await jr(A, 6));
      await sleep(2000); const b1 = await st(B), a1 = await st(A); P(`  kopmadan sonra maç sürüyor mu: A oynuyor=${a1.playing} aktif=${a1.sync && a1.sync.active} · B oynuyor=${b1.playing} aktif=${b1.sync && b1.sync.active}`);
      await auth.p.evaluate(() => { __AFE('enemySharedHP=0'); });
    } else if (sc === 'kalici') {
      await ctl('op=norejoin&on=1'); P('  sunucu: B soketi kapatıldı, geri dönüş reddediliyor; B sayfası kapatılıyor');
      await ctl('op=kill&seat=' + (await st(B)).sync.seat); await B.ctx.close();
      for (let i = 0; i < 25; i++) { await sleep(1000); const a = await st(A); if (a.sync && a.sync.resultApplied) break; }
      const a1 = await st(A); P('  ' + fmt('A', a0, a1)); P('  A günlük: ' + await jr(A, 10)); P('  A JS hatası: ' + (A.p.__errs.join(' | ') || 'yok'));
      await home(A); B = null; continue;
    } else if (sc === 'cift') {
      // B kendi zaferini bildirir (hileli/uyumsuz istemci taklidi), A otorite olarak kendi zaferini bildirir → sunucu uyuşmazlık
      const bSeat = (await st(B)).sync.seat;
      await B.p.evaluate((seat) => { const k = window.__AFPOnlineMatchConnection, c = window.__AFPOnlineContext; k.sendBattleResult('win', '', { matchId: c.matchId, resultId: 'r1:' + c.matchId, seat, winnerSeat: seat }); c.resultReported = true; }, bSeat);
      await sleep(300);
      const aSeat = (await st(A)).sync.seat;
      await A.p.evaluate((seat) => { const k = window.__AFPOnlineMatchConnection, c = window.__AFPOnlineContext; if (!c.authority) { k.sendBattleResult('win', '', { matchId: c.matchId, resultId: 'r1:' + c.matchId, seat, winnerSeat: seat }); c.resultReported = true; } else __AFE('enemySharedHP=0'); }, aSeat);
    }
    const [a1, b1] = await waitEnd(A, B, 25);
    P('  ' + fmt('A', a0, a1)); P('  ' + fmt('B', b0, b1));
    P('  A günlük: ' + await jr(A, 9)); P('  B günlük: ' + await jr(B, 9));
    P('  JS hatası: A=' + (A.p.__errs.join(' | ') || 'yok') + ' · B=' + (B.p.__errs.join(' | ') || 'yok'));
    await A.p.screenshot({ path: require('path').join(__dirname, `online_${sc}_A.png`) });
    await B.p.screenshot({ path: require('path').join(__dirname, `online_${sc}_B.png`) });
    await home(A); await home(B);
  }
  P('\nSunucu odaları: ' + JSON.stringify(await ctl('op=rooms')));
  P('Dış ağ isteği (engellendi): ' + (ext.length ? [...new Set(ext)].slice(0, 8).join(' ; ') + ' … toplam ' + ext.length : 'yok'));
  await browser.close();
})().catch(e => { console.error('HATA', e); process.exit(1); });
