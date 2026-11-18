// Oyundaki kart enerji maliyetlerini (energyCost) ve kart türlerini oyunun KENDİSİNDEN çıkarıp JSON üretir.
// Sunucu hakemi (arena-forge-online-server/data/card_costs.json) bu tabloyu kullanır; oyun güncellenince yeniden üretilmelidir.
// Kullanım: node maliyet_tablosu_uret.js <index.html yolu> <çıktı.json>     (gerekli: playwright)
const { chromium } = require('playwright');
const fs = require('fs');
const [html, out] = process.argv.slice(2);
const START = 'https://appassets.androidplatform.net/assets/www/index.html';
(async () => {
  let src = fs.readFileSync(html, 'utf8');
  const build = (/<meta name="afp-build" content="([^"]+)"/.exec(src) || [])[1] || 'bilinmiyor';
  // Yalnızca bu geçici kopyada: ana betiğin kapsamındaki energyCost/HERO_INFO'yu dışarı aç.
  const anchor = 'window.AFPGuideHost={';
  if (src.split(anchor).length !== 2) throw new Error('çıkarma noktası bulunamadı');
  src = src.replace(anchor, 'window.__afpCostProbe={types:()=>Object.keys(HERO_INFO),cost:(t)=>energyCost(t),spell:(t)=>{try{const s=HERO_SPELLS[t]||HERO_SPELLS[SPELL_ARCHETYPE[t]];return s?{cost:s.cost,cooldown:s.cooldown}:null;}catch(e){return null;}}};' + anchor);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 854, height: 393 } });
  await ctx.route('**/*', (r) => { const u = r.request().url(); if (u === START) return r.fulfill({ body: src, contentType: 'text/html; charset=UTF-8' }); if (u.startsWith('data:') || u.startsWith('blob:')) return r.continue(); return r.abort(); });
  await ctx.routeWebSocket(/.*/, (ws) => ws.close());
  await ctx.addInitScript(() => { try { localStorage.setItem('afpFtueOffV1', '1'); } catch (e) {} });
  const page = await ctx.newPage();
  await page.goto(START, { waitUntil: 'load', timeout: 120000 }); await page.waitForTimeout(3500);
  const data = await page.evaluate(() => { const P = window.__afpCostProbe; const costs = {}; for (const t of P.types()) { const c = P.cost(t); if (Number.isFinite(c)) costs[t] = c; } return costs; });
  await browser.close();
  const keys = Object.keys(data).sort(); const sorted = {}; for (const k of keys) sorted[k] = data[k];
  fs.writeFileSync(out, JSON.stringify({ generatedFrom: build, count: keys.length, costs: sorted }, null, 1) + '\n');
  console.log('kart türü:', keys.length, '· yapı:', build, '· min/maks maliyet:', Math.min(...Object.values(sorted)), Math.max(...Object.values(sorted)));
})();
