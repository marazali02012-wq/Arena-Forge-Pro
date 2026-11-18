// YALNIZ TEST: savaş sırasında görsel denetim (bir anlık örnek). window.__BA dizisine ekler.
const E = s => window.__AFE(s);
if (!E('playing')) return 'savaş yok';
const cv = document.getElementById('game'), cr = cv.getBoundingClientRect();
const sx = cr.width / E('W'), sy = cr.height / E('H');
// 1) koridor bölgesi (ekran px): üst koridor üstü .. alt koridor altı
const laneTop = cr.top + (E('laneY(0,W*.5)') - E('H') * .085) * sy, laneBot = cr.top + (E('laneY(2,W*.5)') + E('H') * .03) * sy;
const lanes = { l: cr.left + E('W') * .08 * sx, r: cr.left + E('W') * .92 * sx, t: laneTop, b: laneBot };
// 2) birimler: canlı birimlerin çizilip çizilmediği
const units = E('units').filter(u => u.hp > 0 && !u.isBarrier);
const hidden = [], offscreen = [];
for (const u of units) {
  const stealth = E('af3410HasSoleInvisibility')(u) && u.team === 'enemy' && E('elapsed') < (u.revealedUntil || 0) === false;
  if (!u._vis) { if (!stealth && !u._afp177CaptiveBy) hidden.push((u.heroType || u.enemyType || '?') + ':' + u.team); continue; }
  const x = cr.left + u._vis.x * sx, y = cr.top + u._vis.y * sy;
  if (x < cr.left - 5 || x > cr.right + 5 || y < cr.top - 5 || y > cr.bottom + 5) offscreen.push((u.heroType || u.enemyType) + ':' + u.team);
}
// 3) koridorların üstüne binen DOM öğeleri (canvas dışındaki görünür katmanlar)
const covers = [];
const walk = root => root.querySelectorAll('*').forEach(e => {
  if (e.shadowRoot) walk(e.shadowRoot);
  if (e === cv || e.contains(cv)) return;
  const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .15) return;
  const b = e.getBoundingClientRect(); if (b.width < 20 || b.height < 10) return;
  if (cs.position === 'static' && !e.closest('#hud')) return;
  const iw = Math.min(b.right, lanes.r) - Math.max(b.left, lanes.l), ih = Math.min(b.bottom, lanes.b) - Math.max(b.top, lanes.t);
  if (iw <= 0 || ih <= 0) return;
  // yalnız yaprak benzeri görünür kutular (arka planı ya da yazısı olan)
  const hasBg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || e.tagName === 'IMG';
  const txt = (e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  if (!hasBg && !txt) return;
  const frac = iw * ih / ((lanes.r - lanes.l) * (lanes.b - lanes.t));
  if (frac < .004) return;
  covers.push({ el: e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 30), pct: +(100 * frac).toFixed(1), pe: cs.pointerEvents, txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 30) });
});
walk(document);
// 4) taşma: ekran dışına taşan ya da yazısı kırpılan HUD öğeleri
const over = [];
document.querySelectorAll('#hud *, .bottom *, #battleProStrip *').forEach(e => {
  const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
  const b = e.getBoundingClientRect(); if (b.width < 4 || b.height < 4) return;
  if (b.right > innerWidth + 1 || b.left < -1 || b.bottom > innerHeight + 1 || b.top < -1) over.push('EKRAN DIŞI ' + e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 25));
  if (e.scrollWidth > e.clientWidth + 2 && /hidden|clip/.test(cs.overflowX) && e.innerText && e.children.length === 0 && cs.textOverflow !== 'ellipsis') over.push('YAZI KIRPIK ' + e.tagName + '.' + String(e.className).slice(0, 25) + ' "' + e.innerText.slice(0, 20) + '"');
});
const rec = { t: +E('elapsed').toFixed(1), mode: E('gameMode'), units: units.length, hidden, offscreen, covers, over: [...new Set(over)].slice(0, 12), doc: [document.documentElement.scrollWidth, document.documentElement.scrollHeight] };
(window.__BA = window.__BA || []).push(rec);
return JSON.stringify(rec);
