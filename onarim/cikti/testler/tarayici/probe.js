// İlk açılış sondası: konsol/sayfa hataları, dış istekler, zamanlı ekran görüntüleri
const { chromium } = require('playwright');
const fs = require('fs');
const [,, url, outDir, w, h, tag] = process.argv;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'tr-TR' });
  const page = await ctx.newPage();
  const log = { console: [], pageerror: [], requests: [], failed: [] };
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) log.console.push(m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', e => log.pageerror.push(String(e.stack || e).slice(0, 600)));
  page.on('request', r => { const u = r.url(); if (!u.startsWith('data:') && !u.startsWith('blob:')) log.requests.push(r.method() + ' ' + u.slice(0, 160)); });
  page.on('requestfailed', r => log.failed.push(r.url().slice(0, 160) + ' ' + (r.failure() || {}).errorText));
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'commit', timeout: 120000 });
  for (const ms of [500, 1000, 2000, 4000, 8000, 15000]) {
    const wait = ms - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: `${outDir}/${tag}_${ms}ms.png` });
  }
  log.loadMs = Date.now() - t0;
  log.title = await page.title();
  log.scroll = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight }));
  fs.writeFileSync(`${outDir}/${tag}_log.json`, JSON.stringify(log, null, 2));
  console.log(JSON.stringify({ tag, pageerror: log.pageerror.length, console: log.console.length, failed: log.failed.length, requests: log.requests.length, scroll: log.scroll }));
  await browser.close();
})();
