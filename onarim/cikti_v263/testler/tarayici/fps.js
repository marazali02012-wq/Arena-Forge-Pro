// YALNIZ TEST: 5 sn boyunca kare aralıkları ve uzun görevler (>50 ms)
const iv = []; let last = performance.now(); const long = [];
let po = null; try { po = new PerformanceObserver(l => { for (const e of l.getEntries()) long.push(Math.round(e.duration)); }); po.observe({ entryTypes: ['longtask'] }); } catch (_) { }
await new Promise(r => { const t0 = performance.now(); const f = n => { iv.push(n - last); last = n; if (n - t0 < 5000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
try { po && po.disconnect(); } catch (_) { }
iv.shift(); iv.sort((a, b) => a - b);
const avg = iv.reduce((a, b) => a + b, 0) / iv.length;
const p95 = iv[Math.floor(iv.length * .95)] || 0, worst = iv[iv.length - 1] || 0;
let units = 0; try { units = window.__AFE('units').length; } catch (_) { }
return JSON.stringify({ fps: +(1000 / avg).toFixed(1), p95ms: Math.round(p95), worstMs: Math.round(worst), over50ms: iv.filter(x => x > 50).length, longTasks: long.length, longMax: long.length ? Math.max(...long) : 0, units, lowPower: (() => { try { return window.__AFE('LOW_POWER_DEVICE'); } catch (_) { return null; } })() });
