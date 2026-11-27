'use strict';

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { createReadStream } = require('node:fs');
const path = require('node:path');

const html = path.resolve(__dirname, '../app/src/main/assets/www/index.html');
const out = path.resolve(process.argv[2] || '.');
const expectedCode = Number(process.argv[3] || 308);

async function main() {
  const server = createServer((req, res) => {
    if (req.url === '/') {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      createReadStream(html).pipe(res);
    } else {
      res.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ['--no-sandbox']
    });
    for (const [width, height] of [[740, 360], [667, 375]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
      const start = Date.now();
      await page.goto('http://127.0.0.1:' + server.address().port, { timeout: 60_000 });
      await page.waitForFunction(() => !!window.AFPModeNetworkV1, { timeout: 20_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => document.body.innerText.trim().length > 0, { timeout: 25_000 });
      const facts = await page.evaluate(() => ({
        title: document.title,
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        text: document.body.innerText.trim().slice(0, 180),
        modes: Object.keys(window.AFPModeNetworkV1.modes).length,
        version: document.querySelector('meta[name="afp-build"]').content,
        keys: Object.keys(localStorage).length
      }));
      assert.equal(facts.version, 'v3.60.' + expectedCode);
      assert.equal(facts.width, width);
      assert.equal(facts.height, height);
      assert.ok(facts.text.length > 0);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(out, 'ArenaForgePro_' + width + 'x' + height + '.png') });
      console.log(JSON.stringify({ width, height, elapsedMs: Date.now() - start, ...facts }));
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
