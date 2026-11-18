// Uzun ömürlü tarayıcı sürücüsü: 127.0.0.1:9777 üzerinden komut alır.
// POST /cmd  {op:'goto'|'eval'|'shot'|'tap'|'drag'|'viewport'|'logs'|'reset'|'wait', ...}
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
let browser, ctx, page, logs = [];
const W0 = +(process.argv[2] || 740), H0 = +(process.argv[3] || 360);
async function newCtx(w, h, keepStorage, dpr) {
  let state;
  if (ctx && keepStorage) state = await ctx.storageState();
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: dpr || 1, locale: 'tr-TR', storageState: state });
  page = await ctx.newPage();
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) logs.push({ t: Date.now(), k: m.type(), s: m.text().slice(0, 400) }); });
  page.on('pageerror', e => logs.push({ t: Date.now(), k: 'pageerror', s: String(e.stack || e).slice(0, 800) }));
  page.on('requestfailed', r => { const u = r.url(); if (!u.startsWith('data:')) logs.push({ t: Date.now(), k: 'reqfail', s: u.slice(0, 200) + ' ' + ((r.failure() || {}).errorText) }); });
  page.on('request', r => { const u = r.url(); if (!u.startsWith('data:') && !u.startsWith('blob:') && !u.includes('127.0.0.1')) logs.push({ t: Date.now(), k: 'extreq', s: r.method() + ' ' + u.slice(0, 200) }); });
}
async function handle(c) {
  switch (c.op) {
    case 'goto': await page.goto(c.url, { waitUntil: 'load', timeout: 180000 }); return 'ok';
    case 'eval': { const fn = new Function('return (async()=>{' + c.js + '})()'); return await page.evaluate(`(async()=>{${c.js}})()`); }
    case 'shot': await page.screenshot({ path: c.path, fullPage: false, scale: c.device ? 'device' : 'css' }); return c.path;
    case 'tap': await page.touchscreen.tap(c.x, c.y); return 'ok';
    case 'click': await page.mouse.click(c.x, c.y); return 'ok';
    case 'clicksel': await page.click(c.sel, { timeout: c.timeout || 5000, force: !!c.force }); return 'ok';
    case 'drag': {
      await page.mouse.move(c.x1, c.y1); await page.mouse.down();
      const n = c.steps || 12; for (let i = 1; i <= n; i++) { await page.mouse.move(c.x1 + (c.x2 - c.x1) * i / n, c.y1 + (c.y2 - c.y1) * i / n); await page.waitForTimeout(16); }
      await page.mouse.up(); return 'ok';
    }
    case 'viewport': await newCtx(c.w, c.h, c.keep !== false, c.dpr); return 'ok';
    case 'size': await page.setViewportSize({ width: c.w, height: c.h }); return 'ok';
    case 'logs': { const out = logs.slice(); if (c.clear) logs = []; return out; }
    case 'wait': await page.waitForTimeout(c.ms); return 'ok';
    default: throw new Error('bilinmeyen op ' + c.op);
  }
}
(async () => {
  browser = await chromium.launch();
  await newCtx(W0, H0, false);
  http.createServer((req, res) => {
    let b = ''; req.on('data', d => b += d); req.on('end', async () => {
      try { const r = await handle(JSON.parse(b)); res.end(JSON.stringify({ ok: true, r })); }
      catch (e) { res.end(JSON.stringify({ ok: false, e: String(e.stack || e).slice(0, 1500) })); }
    });
  }).listen(9777, '127.0.0.1', () => console.log('driver hazır'));
})();
