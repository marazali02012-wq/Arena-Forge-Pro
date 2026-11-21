#!/usr/bin/env python3
"""Ortak Playwright düzeneği: oyunu açar, misafir girişini yapar, QA kancasıyla savaş kurar."""
import asyncio, json, time, pathlib
from playwright.async_api import async_playwright

import shutil

CHROME = shutil.which('google-chrome') or shutil.which('chromium')


class Game:
    def __init__(self, html, width=1280, height=640, mobile=False, browser=None):
        self.html = str(pathlib.Path(html).resolve())
        self.width, self.height, self.mobile = width, height, mobile
        self.logs = []
        self.browser = browser
        self.pw = None

    async def __aenter__(self):
        if self.browser is None:
            self.pw = await async_playwright().start()
            self.browser = await self.pw.chromium.launch(
                executable_path=CHROME, headless=True,
                args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist',
                      '--autoplay-policy=no-user-gesture-required'])
        self.ctx = await self.browser.new_context(
            viewport={'width': self.width, 'height': self.height}, device_scale_factor=1,
            is_mobile=self.mobile, has_touch=self.mobile)
        await self.ctx.add_init_script("localStorage.setItem('afpFtueOffV1','1')")
        self.page = await self.ctx.new_page()
        self.page.on('console', lambda m: self.logs.append((m.type, m.text[:400])))
        self.page.on('pageerror', lambda e: self.logs.append(('pageerror', str(e)[:800])))
        url = 'http://arena-forge.test/game.html'
        await self.page.route(url, lambda route: route.fulfill(path=self.html, content_type='text/html; charset=utf-8'))
        await self.page.goto(url, wait_until='domcontentloaded', timeout=180000)
        await self.page.wait_for_timeout(2500)
        await self.guest_login()
        return self

    async def guest_login(self):
        try:
            btn = self.page.get_by_text('Misafir olarak oyna', exact=False).first
            await btn.click(timeout=8000)
        except Exception as e:
            self.logs.append(('harness', 'guest click failed: ' + str(e)[:200]))
        await self.page.wait_for_timeout(3500)
        # Hikâye girişi ve olası açılış pencerelerini kapat.
        for _ in range(4):
            try:
                skip = self.page.get_by_text('ATLA', exact=False).first
                if await skip.is_visible(timeout=500):
                    await skip.click(timeout=1500)
                    await self.page.wait_for_timeout(700)
            except Exception:
                pass
            try:
                await self.page.keyboard.press('Escape')
            except Exception:
                pass
            await self.page.wait_for_timeout(250)

    async def __aexit__(self, *exc):
        await self.ctx.close()
        if self.pw is not None:
            await self.browser.close()
            await self.pw.stop()

    async def ev(self, js, arg=None):
        if arg is None:
            return await self.page.evaluate(js)
        return await self.page.evaluate(js, arg)

    async def qa(self, expr):
        return await self.page.evaluate('() => ' + expr)

    async def start_battle(self):
        r = await self.qa('window.__AF285QA.start()')
        await self.page.wait_for_timeout(600)
        await self.qa('window.__AF285QA.setManual(true)')
        await self.qa('window.__AF285QA.clearUnits()')
        await self.qa('window.__AF285QA.resetLog()')
        return r

    async def play(self, team, typ, lane, x):
        return await self.ev('([t,ty,l,x]) => window.__AF285QA.play(t,ty,l,x)', [team, typ, lane, x])

    async def step(self, sec, fps=25):
        return await self.ev('([s,f]) => window.__AF285QA.step(s,f)', [sec, fps])

    async def units(self):
        return await self.qa('window.__AF285QA.units()')

    async def events(self, since=0):
        return await self.ev('(s) => window.__AF285QA.events(s)', since)

    async def shot(self, path):
        await self.page.screenshot(path=str(path))

    async def canvas_png(self, path, crop=None, scale=1.0):
        """Savaş tuvalini (DOM katmanları olmadan) PNG olarak kaydeder. crop=(x0,y0,x1,y1) 0..1 oranı."""
        import base64
        await self.qa('window.__AF285QA && window.__AF285QA.redraw ? window.__AF285QA.redraw() : null')
        url = await self.ev('''(c) => {
            const cv = document.getElementById('game'); if (!cv) return null;
            let sx=0, sy=0, sw=cv.width, sh=cv.height;
            if (c) { sx=Math.round(c[0]*cv.width); sy=Math.round(c[1]*cv.height); sw=Math.round((c[2]-c[0])*cv.width); sh=Math.round((c[3]-c[1])*cv.height); }
            const k = c ? c[4] : 1;
            const o = document.createElement('canvas'); o.width=Math.round(sw*k); o.height=Math.round(sh*k);
            const g = o.getContext('2d'); g.imageSmoothingQuality='high'; g.drawImage(cv, sx, sy, sw, sh, 0, 0, o.width, o.height);
            return o.toDataURL('image/png');
        }''', list(crop) + [scale] if crop else None)
        if not url:
            return False
        pathlib.Path(path).write_bytes(base64.b64decode(url.split(',', 1)[1]))
        return True

    def errors(self):
        return [l for l in self.logs if l[0] in ('error', 'pageerror')]
