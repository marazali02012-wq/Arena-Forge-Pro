// YALNIZ TEST: boss açık/kapalı denge ölçümü. Aynı test botu, aynı başlangıç profili; oyun hızı ×2.
// Hazırlık: make_testbuild.py ile t263new.html üret, 127.0.0.1:8765'te sun. Dış ağ kapalı (DNS yalnız 127.0.0.1).
// kullanım: node boss_denge_olcumu.js <dark|secret> <on|off> <maç sayısı> <çıktı.jsonl> [guclu|zayif]
// 'off' koşulu boss tanımını kapatır (af263DuelBossDef → null); 'guclu' bot kart + komutan büyüsü kullanır.
const { chromium } = require('playwright');
const fs = require('fs');
const [MODE, COND, N, OUT, TIER] = [process.argv[2], process.argv[3], +process.argv[4] || 5, process.argv[5], process.argv[6] || 'guclu'];
const GAME = process.env.GAME_URL || 'http://127.0.0.1:8765/t263new.html';
const BOT = fs.readFileSync(require('path').join(__dirname, 'bot.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] });
  const ctx = await browser.newContext({ viewport: { width: 740, height: 360 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { localStorage.setItem('afpFtueOffV1', '1'); } catch (_) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 100)));
  await p.goto(GAME); await sleep(2200);
  await p.evaluate(() => { const h = document.getElementById('afqEntry'), sr = h && h.shadowRoot; const b = sr && [...sr.querySelectorAll('button.alt')].find(x => /Misafir/.test(x.innerText)); if (b) b.click(); });
  await sleep(2600);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^ATLA/.test(x.innerText.trim())); if (b) b.click(); const f = document.getElementById('afpFtue'); if (f) f.remove(); });
  await sleep(800);
  await p.evaluate(new Function(BOT));
  await p.evaluate(() => { const P = __AFE('profile'); P.battles = 10; P.afpGuide = P.afpGuide || {}; P.afpGuide.off = true; P.afpGuide.bt = { done: true, off: true, started: true, step: 5, ok: [], skip: [], snap: {} }; P.bestFloor = Math.max(10, +P.bestFloor || 0); P.trophies = Math.max(400, +P.trophies || 0); P.wins = Math.max(5, +P.wins || 0); P.af35Secret = P.af35Secret || {}; P.af35Secret.darkWins = Math.max(3, +P.af35Secret.darkWins || 0); __AFE('saveProfile()'); window.AFPDarkPass.unlock(); window.AFPSecret.unlock(); });
  if (COND === 'off') await p.evaluate(() => { __AFE('af263DuelBossDef=function(){return null}'); });
  for (let m = 0; m < N; m++) {
    await p.evaluate((mode) => { const P = __AFE('profile'); if (mode === 'secret') { P.af35Secret.stage = 2; } __AFE('saveProfile()'); const r = mode === 'dark' ? window.AFPDarkPass.start() : window.AFPSecret.start(); window.__startRes = r; }, MODE);
    let ok = false;
    for (let i = 0; i < 30; i++) { await sleep(1000); const s = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^(ATLA|SAVAŞA BAŞLA)$/.test(x.innerText.trim())); if (b) b.click(); const ms = document.getElementById('afxModeScreen'); if (ms && __AFE('playing')) ms.hidden = true; return __AFE('playing'); }); if (s) { ok = true; break; } }
    if (!ok) { fs.appendFileSync(OUT, JSON.stringify({ mode: MODE, cond: COND, m, err: 'başlamadı', start: await p.evaluate(() => window.__startRes) }) + '\n'); break; }
    const w0 = await p.evaluate(() => { const P = __AFE('profile'); return { w: +P.wins || 0, l: +P.losses || 0 }; });
    await p.evaluate(() => { window.__seenE = new WeakSet(); window.__eHp = 0; window.__eN = 0; });
    await p.evaluate((tier) => { window.__bot(true, { speed: 2, every: 700 });
      clearInterval(window.__spellT); if (tier !== 'guclu') return;
      window.__spellT = setInterval(() => { try { if (!__AFE('playing') || __AFE('battlePaused')) return;
        __AFE(`(()=>{const s=af327S;if(!s)return;const en=units.filter(u=>u.team==='enemy'&&u.hp>0&&!u.isBarrier);if(!en.length)return;
          const cnt=[0,1,2].map(l=>en.filter(u=>u.lane===l).length);const lane=cnt.indexOf(Math.max(...cnt));
          const front=en.filter(u=>u.lane===lane).sort((a,b)=>a.x-b.x)[0];
          for(let k=0;k<2;k++){if(!af327CastWhy(k,lane,s)){af327Cast(k,lane,front?front.x:.5,s);break;}}})()`);
        window.__spells = (window.__spells || 0) + 1; } catch (e) { window.__spellErr = String(e).slice(0, 120); } }, 900); }, TIER);
    let rec = { mode: MODE, cond: COND, m, kind: null, boss: null, bossAt: null, bossHpEnd: null, bossMax: null, bossKilled: false, t0: Date.now() };
    let last = null;
    for (let i = 0; i < 420; i++) {
      await sleep(1000);
      const s = await p.evaluate(() => { for (const u of __AFE('units')) { if (u.team === 'enemy' && !u.isBoss && !u.isBarrier && !u.isCommander && !window.__seenE.has(u)) { window.__seenE.add(u); window.__eHp += +u.maxHp || 0; window.__eN++; } } const B = __AFE('units').find(u => u.isBoss && u.team === 'enemy'); return { pl: __AFE('playing'), el: __AFE('elapsed'), a: __AFE('allySharedHP'), e: __AFE('enemySharedHP'), am: __AFE('allyTowerMax'), kind: __AFE('af35MatchKind'), boss: B ? { n: B._afpBossName, hp: Math.max(0, Math.round(B.hp)), max: B.maxHp, atk: B.atk } : null, spawned: __AFE('af36Run.bossSpawned'), killed: __AFE('af36Run.bossKilled') }; });
      rec.kind = s.kind;
      if (s.boss) { if (!rec.boss) { rec.boss = s.boss.n; rec.bossAt = Math.round(s.el); rec.bossMax = s.boss.max; rec.bossAtk = s.boss.atk; rec.allyAtBoss = Math.round(s.a); rec.enemyAtBoss = Math.round(s.e); } rec.bossHpEnd = s.boss.hp; }
      if (s.killed && rec.boss) rec.bossKilled = true;
      if (!s.pl) break; last = s;
    }
    const end = await p.evaluate(() => { const e = document.getElementById('end'); return e && !e.classList.contains('hide') ? (e.innerText || '').replace(/\s+/g, ' ').slice(0, 140) : ''; });
    rec.end = end; rec.dur = last ? Math.round(last.el) : null; rec.allyHp = last ? Math.max(0, Math.round(last.a)) : null; rec.allyMax = last ? last.am : null; rec.enemyHp = last ? Math.max(0, Math.round(last.e)) : null;
    const w1 = await p.evaluate(() => { const P = __AFE('profile'); return { w: +P.wins || 0, l: +P.losses || 0 }; }); rec.eUnits = await p.evaluate(() => window.__eN); rec.eHpDeployed = await p.evaluate(() => window.__eHp); rec.tier = TIER;
    rec.result = w1.w > w0.w ? 'win' : w1.l > w0.l ? 'loss' : /BERABER/.test(end) ? 'draw' : /ZAFER|KAZAND/.test(end) && !/MAĞLUP|YENİLGİ|DÜŞTÜ/.test(end) ? 'win' : /MAĞLUP|YENİLGİ|DÜŞTÜ/.test(end) ? 'loss' : 'bilinmiyor';
    rec.real = Math.round((Date.now() - rec.t0) / 1000); rec.errs = errs.length; rec.spellErr = await p.evaluate(() => window.__spellErr || null); rec.casts = await p.evaluate(() => { try { return __AFE('matchStats.spells'); } catch (_) { return null; } });
    fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
    await p.evaluate(() => { try { window.__bot(false); clearInterval(window.__spellT); } catch (_) {} const e = document.getElementById('end'); const m = e && e.querySelector('[data-af39=menu]'); if (m) m.click(); });
    await sleep(2500);
  }
  await browser.close();
})().catch(e => { fs.appendFileSync(OUT, JSON.stringify({ err: String(e).slice(0, 300) }) + '\n'); process.exit(1); });
