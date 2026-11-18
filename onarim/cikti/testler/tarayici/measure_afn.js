// YALNIZ TEST: her yeni minyonun idle karesini sabit px=100 ile çizip görünen yüksekliği/opaklığı ölçer.
const A = window.AFNewMinions;
const types = Object.keys(A.manifest || {}).concat(['af37_golge_suikastci']);
for (const t of types) { try { A.preload(t, true); } catch (e) { } }
await new Promise(r => setTimeout(r, 2500));
const out = [];
for (const t of types) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 320;
  const g = c.getContext('2d');
  const u = { heroType: t, team: 'ally', x: .5, lane: 0, hp: 10, maxHp: 10, phase: 0, attackPeriod: 1, cd: 1 };
  let r = null; try { r = A.draw(u, g, 0, 160, 260, 100); } catch (e) { out.push({ t, err: String(e) }); continue; }
  const d = g.getImageData(0, 0, 320, 320).data;
  let minY = 999, maxY = -1, minX = 999, maxX = -1, n = 0, aSum = 0, solid = 0;
  for (let y = 0; y < 320; y++) for (let x = 0; x < 320; x++) {
    const a = d[(y * 320 + x) * 4 + 3];
    if (a > 60) { // gölge elipsini (alfa ~.31*255=79) ayırmak için gövdeyi ayrıca ölçeceğiz
      if (y < minY) minY = y; if (y > maxY) maxY = y; if (x < minX) minX = x; if (x > maxX) maxX = x;
    }
    if (a > 10 && y < 252) { n++; aSum += a; if (a > 200) solid++; }
  }
  out.push({ t, h: maxY - minY + 1, w: maxX - minX + 1, top: minY, meanA: n ? Math.round(aSum / n) : 0, solidPct: n ? Math.round(100 * solid / n) : 0, px: n, ok: !!r });
}
return JSON.stringify(out);
