// YALNIZ TEST: görünür ekrandaki (gölge kökleri dahil) img ve arka plan görsellerini denetler.
const imgs = [];
const walk = r => r.querySelectorAll('*').forEach(e => { if (e.shadowRoot) walk(e.shadowRoot); if (e.tagName === 'IMG') imgs.push(e); });
walk(document);
const vis = imgs.filter(i => { const b = i.getBoundingClientRect(); const cs = getComputedStyle(i); return b.width > 4 && b.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none' && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth; });
await Promise.all(vis.map(i => i.complete ? 0 : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 3000); })));
const bad = [];
let ok = 0, empty = 0, broken = 0, one = 0;
for (const i of vis) {
  const src = i.getAttribute('src') || '';
  const hero = (i.closest('[data-hero],[data-type],[data-id]') || {}).dataset || {};
  const id = hero.hero || hero.type || hero.id || i.alt || '';
  if (!src) { empty++; bad.push(['boş-src', id]); continue; }
  if (!i.naturalWidth) { broken++; bad.push(['yüklenemedi', id, src.slice(0, 40)]); continue; }
  if (i.naturalWidth <= 2 && i.naturalHeight <= 2) { one++; bad.push(['1x1', id]); continue; }
  ok++;
}
return JSON.stringify({ görünür: vis.length, sağlam: ok, boşSrc: empty, yüklenemedi: broken, birBir: one, örnek: bad.slice(0, 12) });
