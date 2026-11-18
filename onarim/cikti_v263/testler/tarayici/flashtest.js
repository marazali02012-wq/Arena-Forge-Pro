// YALNIZ TEST: Playwright ile tıklama sonrası art arda ekran görüntüsü alıp parlaklık ölçer.
// node flashtest.js <url> <w> <h> <çıktı.jsonl>
const { chromium } = require('playwright');
const fs = require('fs');
const [, , url, W, H, out] = process.argv;
const lum = async (page) => {
  const buf = await page.screenshot({ type: 'jpeg', quality: 40, scale: 'css' });
  // parlaklığı tarayıcıda decode ederek ölç (dış kütüphane yok)
  return await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/jpeg;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = 64; c.height = 32; const g = c.getContext('2d'); g.drawImage(img, 0, 0, 64, 32);
    const d = g.getImageData(0, 0, 64, 32).data; let s = 0, black = 0;
    for (let i = 0; i < d.length; i += 4) { const l = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11); s += l; if (l < 12) black++; }
    return { mean: Math.round(s / (d.length / 4)), blackPct: Math.round(100 * black / (d.length / 4)) };
  }, buf.toString('base64'));
};
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: +W, height: +H }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack || e).slice(0, 300)));
  await page.goto(url, { waitUntil: 'load', timeout: 180000 }); await page.waitForTimeout(2000);
  await page.evaluate(() => { localStorage.setItem('afpFtueOffV1', '1'); const sr = document.getElementById('afqEntry').shadowRoot; [...sr.querySelectorAll('button.alt')].find(x => /Misafir/.test(x.innerText)).click(); });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.offsetParent && /^ATLA/.test(x.innerText.trim())); if (b) b.click(); const f = document.getElementById('afpFtue'); if (f) f.remove(); });
  await page.waitForTimeout(1200);
  const homeBase = await lum(page);
  const acts = await page.evaluate(() => { const sr = document.getElementById('af207Mount').shadowRoot; return [...new Set([...sr.querySelectorAll('[data-home-action]')].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.homeAction))].filter(a => a !== 'close'); });
  const rows = [];
  const goHome = async () => {
    await page.evaluate(() => {
      for (let k = 0; k < 6; k++) {
        const all = [...document.querySelectorAll('button,[role=button]')].filter(b => { const r = b.getBoundingClientRect(); const t = (b.innerText || b.getAttribute('aria-label') || '').trim(); return r.width > 8 && r.top < 100 && r.left > innerWidth * .55 && /^(×|✕|X|×\s*Kapat|Kapat)$/i.test(t); });
        const xc = [...document.querySelectorAll('.afx-x,.c-x,[data-af36close],[aria-label=Kapat]')].filter(b => b.getBoundingClientRect().width > 8);
        const z = [...new Set([...all, ...xc])]; if (!z.length) break; z.forEach(b => b.click());
      }
      const back = document.querySelector('#afxModeScreen:not([hidden]) [data-afx-ms=back]'); if (back) back.click();
      const sr = document.getElementById('af207Mount').shadowRoot; const geri = [...document.querySelectorAll('button')].find(b => b.offsetParent && /^GERİ$/.test(b.innerText.trim())); if (geri) geri.click();
    });
    await page.waitForTimeout(900);
  };
  for (const a of acts) {
    await goHome();
    const box = await page.evaluate((a) => { const sr = document.getElementById('af207Mount').shadowRoot; const e = [...sr.querySelectorAll('[data-home-action]')].find(x => x.dataset.homeAction === a && x.getBoundingClientRect().width > 0); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, a);
    if (!box) { rows.push({ a, found: false }); continue; }
    const before = await lum(page);
    const t0 = Date.now();
    await page.touchscreen.tap(box[0], box[1]);
    const seq = [];
    while (Date.now() - t0 < 1600) { const l = await lum(page); seq.push([Date.now() - t0, l.mean, l.blackPct]); }
    await page.screenshot({ path: out.replace('.jsonl', '_' + a.replace(':', '_') + '.png') });
    await goHome();
    const after = await lum(page);
    rows.push({ a, found: true, before, seq, after, minMean: Math.min(...seq.map(x => x[1])), maxBlack: Math.max(...seq.map(x => x[2])) });
  }
  fs.writeFileSync(out, rows.map(r => JSON.stringify(r)).join('\n') + '\n' + JSON.stringify({ homeBase, errs }) + '\n');
  await b.close();
})();
