'use strict';

const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

async function main() {
  const before = path.resolve(process.argv[2]);
  const after = path.resolve(__dirname, '../app/src/main/assets/www/index.html');
  const url = 'https://appassets.androidplatform.net/assets/www/index.html';
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try {
    const page = await browser.newPage({ viewport: { width: 740, height: 360 } });
    let html = before;
    let errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.route('**/*', route =>
      route.request().url() === url
        ? route.fulfill({ path: html, contentType: 'text/html; charset=utf-8' })
        : route.abort());
    await page.goto(url);
    await page.locator('button[data-act="guest"]').click({ timeout: 30_000 });
    await page.waitForFunction(() => !!localStorage.getItem('arenaForgeProProfileV19'), { timeout: 20_000 });

    const original = await page.evaluate(() => JSON.parse(localStorage.getItem('arenaForgeProProfileV19')));
    assert.ok(original && typeof original === 'object');
    const guestKeys = await page.evaluate(() => Object.keys(localStorage).filter(key => /guest/i.test(key)).sort());
    assert.deepEqual(errors, []);

    html = after;
    errors = [];
    await page.reload();
    await page.waitForFunction(() => !!window.AFPModeNetworkV1);
    assert.equal(await page.title(), 'Arena Forge Pro v3.60.' + (process.argv[3] || 308));

    const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('arenaForgeProProfileV19')));
    const retainedGuestKeys = await page.evaluate(() => Object.keys(localStorage).filter(key => /guest/i.test(key)).sort());
    assert.deepEqual(retainedGuestKeys, guestKeys);
    for (const key of ['trophies', 'deck', 'gold', 'gems']) {
      if (key in original) assert.deepEqual(restored[key], original[key], key);
    }
    const common = Object.keys(original).filter(key => Object.hasOwn(restored, key));
    assert.ok(common.length > 0);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ preservedGuestKeys: retainedGuestKeys.length, sharedProfileFields: common.length }));
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
