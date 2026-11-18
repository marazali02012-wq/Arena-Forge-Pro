// KULLANIM:  node belirlenimcilik_testi.js <test_kopyasi.html>      (MODE=same|cosmetic|gameseed|input)
// <test_kopyasi.html> = index.html'in, ana betik kapsamında iki satırı eklenmiş geçici kopyası. Hazırlamak için: node hazirla_test_kopyasi.js <index.html> <cikti.html>
// Gerekli: playwright.   Beklenen: MODE=same ve MODE=cosmetic → "BİREBİR AYNI"; MODE=gameseed ve MODE=input → "FARK" (testin farkı yakalayabildiğini gösterir).
// Gerçek oyun motorunun belirlenimciliğini ölçer: tohumlu Math.random + Playwright sanal saati + betikli girdi → durum özeti (digest) dizisi.
// İki çalıştırmanın özetleri birebir aynıysa motor, sabit girdiyle yeniden oynatılabilir demektir.
const { chromium } = require('playwright'); const fs = require('fs');
const START = 'https://appassets.androidplatform.net/assets/www/index.html';
const SEED = +process.env.SEED || 12345;
const PRNG = `(()=>{let s=${SEED}|0;Math.random=function(){s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__rndCalls=0;const o=Math.random;Math.random=function(){window.__rndCalls++;return o();};})();`;
async function run(html, maxGameSec = 60, { mathSeed = SEED, gameSeed = SEED, drops = true } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 854, height: 393 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'tr-TR' });
  await context.route('**/*', (r) => { const u = r.request().url(); if (u === START) return r.fulfill({ path: html, contentType: 'text/html; charset=UTF-8' }); if (u.startsWith('data:') || u.startsWith('blob:')) return r.continue(); return r.abort('internetdisconnected'); });
  await context.routeWebSocket(/.*/, (ws) => ws.close());
  await context.addInitScript(() => { try { localStorage.setItem('afpFtueOffV1', '1'); } catch (e) {} });
  await context.addInitScript(PRNG.replace('s=${SEED}|0','s=' + mathSeed + '|0'));
  await context.addInitScript(`window.__afSeed=${gameSeed};window.__fixedDt=1/60;`);
  await context.clock.install({ time: new Date('2026-11-17T12:00:00Z') });
  const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.clock.pauseAt(new Date('2026-11-17T12:00:05Z'));   // saati DURDUR: bundan sonra zaman yalnızca runFor ile ilerler (gerçek zamandan etkilenmez)
  await page.goto(START, { waitUntil: 'load' });
  const run = (ms) => page.clock.runFor(ms);
  const settle = async (ms) => { const steps = Math.ceil(ms / 250); for (let i = 0; i < steps; i++) { await run(250); await page.waitForTimeout(60); } };   // sanal saat + gerçek zamanlı küçük bekleme (görsel/asenkron yüklemeler için)
  const tapLoc = async (loc) => { const bb = await loc.first().boundingBox({ timeout: 4000 }); if (!bb) return false; await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); return true; };
  await settle(3000);
  const okG = await tapLoc(page.getByText('Misafir olarak oyna')); await settle(3500);
  const okA = await tapLoc(page.locator("button.footbtn:has-text('ARENA')")); await settle(1500);
  const okF = await tapLoc(page.locator('button.af220-ar-fight')); await settle(1500);
  const okS = await tapLoc(page.locator('#hmdStartBattle'));
  if (process.env.DEBUG) console.log('tıklamalar', okG, okA, okF, okS);
  // savaşın BAŞLADIĞI kareyi tam yakala (kare kare); bundan sonrası yalnızca kare sayısına bağlıdır
  for (let i = 0; i < 4000; i++) { if (await page.evaluate(() => !!(window.__afpPlaying && window.__afpPlaying()))) break; await page.clock.runFor(16); if (i % 6 === 0) await page.waitForTimeout(8); }
  const digests = []; const lanes = [115, 190, 265]; let li = 0; let ended = false; let nextDrop = 600; let lastEl = -1;
  const MAXF = Math.floor(maxGameSec * 1000 / 16) * 2;
  for (let f = 0; f < MAXF; f++) {
    await page.clock.runFor(16);
    const d = await page.evaluate(() => (window.__afpSim ? window.__afpSim() : null)); if (!d) continue;
    if (d.el !== lastEl) { digests.push(d); lastEl = d.el; }
    if (f % 60 === 0 && await page.evaluate(() => { const e = document.getElementById('end'); return !!e && !e.classList.contains('hide') && e.getBoundingClientRect().width > 0; })) { ended = true; break; }
    if (drops && d.el >= nextDrop) {                      // girdi OYUN SÜRESİNE bağlı (gerçek zamana/kare fazına değil) → belirlenimci
      nextDrop += 1500;
      const card = await page.evaluate(() => { const b = document.querySelector('#battleRoster .battlePick.energy-ready'); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      if (card) { const y = lanes[li++ % 3]; await page.mouse.move(card[0], card[1]); await page.mouse.down(); await page.mouse.move(card[0], card[1] - 40, { steps: 2 }); await page.mouse.move(230, y, { steps: 3 }); await page.mouse.up(); }
    }
    if (d.el > maxGameSec * 1000) break;
  }
  const rnd = await page.evaluate(() => window.__rndCalls); await browser.close();
  return { digests, ended, errors, rnd };
}
function firstDiff(a, b) {
  const mb = new Map(b.map((d) => [d.el, d])); let compared = 0;
  for (const x of a) { const y = mb.get(x.el); if (!y) continue; compared++;
    if (JSON.stringify(x) !== JSON.stringify(y)) { const keys = Object.keys(x).filter((k) => JSON.stringify(x[k]) !== JSON.stringify(y[k])); return { compared, el: x.el, keys, a: Object.fromEntries(keys.filter((k) => k !== 'u').map((k) => [k, x[k]])), b: Object.fromEntries(keys.filter((k) => k !== 'u').map((k) => [k, y[k]])), au: keys.includes('u') ? x.u.slice(0, 3) : undefined, bu: keys.includes('u') ? y.u.slice(0, 3) : undefined }; } }
  return { identical: true, compared };
}
(async () => {
  const html = process.argv[2]; const mode = process.env.MODE || 'same';
  const cfg = { same: [{}, {}], cosmetic: [{ mathSeed: 111 }, { mathSeed: 999 }], gameseed: [{ gameSeed: 12345 }, { gameSeed: 777 }], input: [{}, { drops: false }] }[mode];
  const A = await run(html, 40, cfg[0]), B = await run(html, 40, cfg[1]);
  const d = firstDiff(A.digests, B.digests);
  console.log(`[${mode}] kare A=${A.digests.length} B=${B.digests.length} Math.random A=${A.rnd} B=${B.rnd} →`, d.identical ? `BİREBİR AYNI (${d.compared} kare, son kule canı ${A.digests.at(-1).eHP}/${A.digests.at(-1).aHP})` : `FARK: ${d.keys.join(',')} @oyun_ms=${d.el} (${d.compared}. ortak kare) ${JSON.stringify(d.a)} ≠ ${JSON.stringify(d.b)}`);
})();
