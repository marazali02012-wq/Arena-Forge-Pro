// YALNIZ TEST: görünür ekranda içeriği kesilen kutuları bulur.
const out = [];
const walk = root => root.querySelectorAll('*').forEach(e => {
  if (e.shadowRoot) walk(e.shadowRoot);
  const r = e.getBoundingClientRect(); if (r.width < 20 || r.height < 12) return;
  const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return;
  const over = e.scrollHeight - e.clientHeight;
  if (over > 3 && /auto|scroll|hidden/.test(cs.overflowY)) {
    const centered = cs.display.includes('flex') && cs.flexDirection.startsWith('column') && /center|space-around|space-evenly/.test(cs.justifyContent);
    const gridCentered = cs.display.includes('grid') && /center/.test(cs.alignContent);
    out.push({ el: e.tagName + '.' + String(e.className).slice(0, 60), ov: cs.overflowY, jc: cs.justifyContent, ac: cs.alignContent, centered: centered || gridCentered, h: e.clientHeight, sh: e.scrollHeight, y: Math.round(r.y), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 50) });
  }
});
walk(document);
return JSON.stringify(out);
