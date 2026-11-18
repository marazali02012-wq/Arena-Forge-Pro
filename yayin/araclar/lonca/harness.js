// Oyunu Android WebView'daki adresiyle (appassets) başsız Chromium'da açar.
// Dış ağ istekleri tamamen engellenir: canlı sunucuya hiçbir şey gitmez.
const { chromium } = require('playwright');
const fs = require('fs');
const START = 'https://appassets.androidplatform.net/assets/www/index.html';
const UA = 'Mozilla/5.0 (Linux; Android 14; RMX3710 Build/UKQ1.230924.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.107 Mobile Safari/537.36';
async function open(htmlPath, { width = 854, height = 393, dsf = 1, storage = null, init = null } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width, height }, deviceScaleFactor: dsf, isMobile: true, hasTouch: true,
    userAgent: UA, locale: 'tr-TR',
  });
  const log = { console: [], errors: [], blocked: new Set() };
  await context.route('**/*', (route) => {
    const url = route.request().url();
    if (url === START) return route.fulfill({ path: htmlPath, contentType: 'text/html; charset=UTF-8' });
    if (url.startsWith('data:') || url.startsWith('blob:')) return route.continue();
    try { log.blocked.add(new URL(url).host + ' ' + route.request().method()); } catch (e) {}
    return route.abort('internetdisconnected');
  });
  // WebSocket'ler de kesilir; canlı eşleşme sunucusuna bağlantı denenmez.
  await context.routeWebSocket(/.*/, (ws) => { try { log.blocked.add(new URL(ws.url()).host + ' WS'); } catch (e) {} ws.close(); });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.console.push(m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', (e) => log.errors.push(String(e && e.stack || e).slice(0, 500)));
  const envInit = process.env.CORES ? `Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>${+process.env.CORES}});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});` : null;
  if (envInit) await context.addInitScript(envInit);
  if (process.env.MUSIC_OFF) await context.addInitScript(`try{localStorage.setItem('arenaForgeProSettingsV274',JSON.stringify({sound:true,music:false,vibration:false,lowGraphics:false}))}catch(e){}`);
  if (!process.env.FTUE) await context.addInitScript(`try{localStorage.setItem('afpFtueOffV1','1')}catch(e){}`);
  if (init) await context.addInitScript(init);
  if (storage) await context.addInitScript((s) => { try { for (const k in s) localStorage.setItem(k, s[k]); } catch (e) {} }, storage);
  await page.goto(START, { waitUntil: 'load', timeout: 120000 });
  return { browser, context, page, log, START };
}
module.exports = { open, START, UA };
