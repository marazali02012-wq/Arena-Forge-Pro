// YALNIZ TEST: en üstte görünen pencerenin kapatma (✕) düğmesini bulur (gölge kökleri dahil); "x y" döndürür.
const cands = [];
const walk = r => r.querySelectorAll('*').forEach(e => {
  if (e.shadowRoot) walk(e.shadowRoot);
  const t = ((e.innerText || '') + '').trim(), al = (e.getAttribute && (e.getAttribute('aria-label') || e.getAttribute('title')) || '');
  const isX = /^(×|✕|✖|X|×\s*Kapat)$/i.test(t) || /^(Kapat|Close|Pencereyi kapat)$/i.test(al) || /(^|[-_ ])(x|close|kapat)($|[-_ ])/i.test(String(e.className)) && t.length <= 2;
  if (!isX) return;
  const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
  if (b.width < 10 || b.height < 10 || b.width > 120 || cs.visibility === 'hidden' || cs.display === 'none') return;
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return;
  // gerçekten en üstte mi (dokunulabilir mi)?
  let top = document.elementFromPoint(cx, cy); while (top && top.shadowRoot) { const t2 = top.shadowRoot.elementFromPoint(cx, cy); if (!t2 || t2 === top) break; top = t2; }
  const ok = top && (top === e || e.contains(top) || top.contains(e));
  cands.push({ cx, cy, ok, area: b.width * b.height, t: t || al || String(e.className).slice(0, 20) });
});
walk(document);
const best = cands.filter(c => c.ok).sort((a, b) => a.cy - b.cy || b.cx - a.cx)[0];
return best ? Math.round(best.cx) + ' ' + Math.round(best.cy) + ' ' + best.t.replace(/\s+/g, '') : 'yok';
