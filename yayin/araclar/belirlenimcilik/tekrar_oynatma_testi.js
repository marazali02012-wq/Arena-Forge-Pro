// TEKRAR OYNATMA GİDİŞ-DÖNÜŞ TESTİ (üretim kodu, ek test kopyası GEREKMEZ):
//  1) Gerçek zamanlı bir çevrim içi-ev sahibi savaşı üretim kancalarıyla KAYDEDER (yerel kart bırakmalar + betikli rakip komutları),
//  2) AYRI bir tarayıcıda, yalnızca kayıttan (tohum + kare süreleri + hamleler + profil + ekran boyutu) AYNI oyunu yeniden oynatır,
//  3) son durum özetinin ve 5 sn'lik kontrol noktalarının birebir aynı olduğunu doğrular. Çıkış kodu 0 = uyuştu.
// Kullanım: [RECORD_VP=915x412 RECORD_DSF=2.625 REPLAY_DSF=1 PLAY_SEC=30] node tekrar_oynatma_testi.js <index.html> [kayit.json]
// Gerekli: playwright. Not: sonuç EKRAN BOYUTUNA bağlıdır (mermi uçuşu piksel uzayında); bu yüzden kayıt ekran boyutunu içerir ve aynı boyutta oynatılır.
// Kayıt (gerçek zamanlı, üretim kancaları) → ayrı tarayıcıda tekrar oynatma → son durum özeti birebir aynı mı?
const { chromium } = require('playwright'); const fs = require('fs');
const START = 'https://appassets.androidplatform.net/assets/www/index.html';
const SEED = 4242, PLAY_SEC = +process.env.PLAY_SEC || 30;
async function mkPage(html, initScripts = [], vp = { width: 854, height: 393 }, dsf = 1) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: vp, deviceScaleFactor: dsf, isMobile: true, hasTouch: true, locale: 'tr-TR' });
  await context.route('**/*', (r) => { const u = r.request().url(); if (u === START) return r.fulfill({ path: html, contentType: 'text/html; charset=UTF-8' }); if (u.startsWith('data:') || u.startsWith('blob:')) return r.continue(); return r.abort('internetdisconnected'); });
  await context.routeWebSocket(/.*/, (ws) => ws.close());
  await context.addInitScript(() => { try { localStorage.setItem('afpFtueOffV1', '1'); } catch (e) {} });
  for (const s of initScripts) await context.addInitScript(s);
  const page = await context.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  return { browser, context, page, errs };
}
async function record(html) {
  const [rw, rh] = (process.env.RECORD_VP || '854x393').split('x').map(Number);
  const { browser, page, errs } = await mkPage(html, [], { width: rw, height: rh }, +process.env.RECORD_DSF || 1);
  await page.goto(START, { waitUntil: 'load' }); await page.waitForTimeout(3000);
  const bb = await page.getByText('Misafir olarak oyna').first().boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(3500);
  const started = await page.evaluate((seed) => {
    const E = window.AFPOnlineBattleInternal, snap = E.commanderSnapshot(); const opp = JSON.parse(JSON.stringify(snap)); opp.userId = '99999999-9999-4999-8999-999999999999'; opp.name = 'Rakip';
    window.__opp = opp; E.startOnlineBattle('arena', seed, opp, 'roundtrip-match-1', 1); return { deck: opp.deck };
  }, SEED);
  await page.waitForTimeout(1500);
  const lanes = [115, 190, 265]; let li = 0, seq = 0; const t0 = Date.now(); let drops = 0, remotes = 0;
  while ((Date.now() - t0) / 1000 < PLAY_SEC) {
    await page.waitForTimeout(700);
    if (!await page.evaluate(() => window.AFPReplay.active())) break;
    const card = await page.evaluate(() => { const b = document.querySelector('#battleRoster .battlePick.energy-ready'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    if (card && Math.random() < 0.6) { const y = lanes[li++ % 3]; await page.mouse.move(card[0], card[1]); await page.mouse.down(); await page.mouse.move(card[0], card[1] - 40, { steps: 2 }); await page.mouse.move(230, y, { steps: 3 }); await page.mouse.up(); drops++; }
    if (Math.random() < 0.35) {        // rakip (koltuk 2) hamlesi: gerçek istemcinin gönderdiği biçimde
      const type = started.deck[Math.floor(Math.random() * started.deck.length)]; seq++;
      const r = await page.evaluate(([type, seq, lane]) => window.AFPOnlineBattleInternal.applyRemoteCommand({ type: 'playCard', seq, payload: { cardId: 'c' + seq, heroType: type, lane, x: 0.3, level: 5, energyAfter: 5, energyCapAfter: 6 } }), [type, seq, seq % 3]);
      if (r && r.ok) remotes++;
    }
    if (Math.random() < 0.15) { seq++; await page.evaluate(([seq]) => window.AFPOnlineBattleInternal.applyRemoteCommand({ type: 'castAbility', seq, payload: { slot: 0, lane: 1, x: 0.5, energyAfter: 4, energyCapAfter: 6 } }), [seq]); }
  }
  const ended = !(await page.evaluate(() => window.AFPReplay.active()));
  if (!ended) await page.evaluate(() => window.AFPOnlineBattleInternal.finishAuthoritativeResult('draw', 'test', { state: 'unverified' }));
  await page.waitForTimeout(500);
  const exp = await page.evaluate(() => window.AFPReplay.export());
  await browser.close();
  return { exp, drops, remotes, ended, errs };
}
async function replay(html, exp) {
  // 1) profili yerleştir + mühürle + sayfayı yeniden yükle (motor profili açılışta okur)
  const vpR = exp.vp ? { width: exp.vp.iw, height: exp.vp.ih } : { width: 854, height: 393 };
  const { browser, page, errs } = await mkPage(html, [], vpR, (+process.env.REPLAY_DSF || (exp.vp ? exp.vp.dpr : 1)));
  await page.goto(START, { waitUntil: 'load' }); await page.waitForTimeout(3000);
  const bb = await page.getByText('Misafir olarak oyna').first().boundingBox(); await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(3500);
  await page.evaluate((p) => { localStorage.setItem('arenaForgeProProfileV19', p); try { window.AFPSealProfile && window.AFPSealProfile(p); } catch (e) {} }, exp.profile);
  await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(3000);
  const bb2 = await page.getByText('Misafir olarak oyna').first().boundingBox().catch(() => null); if (bb2) { await page.mouse.click(bb2.x + bb2.width / 2, bb2.y + bb2.height / 2); await page.waitForTimeout(3500); }
  const t0 = Date.now();
  const out = await page.evaluate((e) => window.AFPReplay.run(e), exp);
  out.ms = Date.now() - t0; console.log('  durma:', JSON.stringify(out.stop)); out.errs = errs; await browser.close(); return out;
}
(async () => {
  const html = process.argv[2];
  const R = await record(html);
  console.log('  kayıtlı ekran:', JSON.stringify(R.exp.vp));
  console.log('KAYIT: kare', R.exp.n, 'kayıtlı hamle', R.exp.cmds.length, '(yerel L:', R.exp.cmds.filter((c) => c[1] === 'L').length, ' uzak R:', R.exp.cmds.filter((c) => c[1] === 'R').length, ') profil', R.exp.profile.length, 'B · dt', R.exp.dt.length, 'B · maç doğal bitti:', R.ended, '· bad:', R.exp.bad, '· sayfa hatası', R.errs.length);
  console.log('  maç sonu:', JSON.stringify(R.exp.fin));
  fs.writeFileSync(process.argv[3] || '/dev/null', JSON.stringify(R.exp));
  const P = await replay(html, R.exp);
  console.log('TEKRAR OYNATMA:', P.frames, 'kare,', P.ms, 'ms · kontrol noktası uyuşmazlığı:', P.ckMismatch.length, '· son özet uyuştu:', P.matchedFinal, '· sayfa hatası', P.errs.length);
  console.log('  tekrar oynatma sonu:', JSON.stringify(P.fin)); if (P.ckMismatch.length) console.log('  ilk sapmalar:', JSON.stringify(P.ckMismatch.slice(0, 3)));
  process.exit(P.matchedFinal && !P.ckMismatch.length ? 0 : 1);
})();
