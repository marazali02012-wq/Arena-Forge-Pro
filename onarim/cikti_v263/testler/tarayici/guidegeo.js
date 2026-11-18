// YALNIZ TEST: rehber kartının konumu ve üstüne bindiği etkileşimli öğeler
const g = document.getElementById('afpGuide');
const R = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
const out = { guide: g && !g.hidden ? R(g) : null, cls: g && g.className, text: g && !g.hidden ? g.innerText.replace(/\s+/g, ' ').slice(0, 60) : '', hits: [] };
if (g && !g.hidden) {
  const gr = g.getBoundingClientRect();
  const walk = r => r.querySelectorAll('button,[role=button],.battlePick,img,h1,h2,.afqv-tile').forEach(e => {
    if (g.contains(e)) return; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (b.width < 8 || b.height < 8 || cs.visibility === 'hidden' || cs.display === 'none') return;
    const a = inter(gr, b); if (a > 40) out.hits.push(e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 30) + ' ' + Math.round(100 * a / (b.width * b.height)) + '% ' + (e.innerText || e.alt || '').replace(/\s+/g, ' ').slice(0, 18));
  });
  walk(document);
}
return JSON.stringify(out);
