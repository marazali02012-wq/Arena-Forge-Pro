// YALNIZ TEST: çizim alt fonksiyonlarının kare başı süresini ölçer (4 sn).
const E = s => window.__AFE(s);
const names = ['drawBackground', 'drawAFPortalAnim', 'af360DrawDeploymentBoundaries', 'af332DrawZones', 'drawAmbientEffects', 'drawFallenUnits', 'drawHero', 'af321Flush', 'af321DrawTrails', 'af321DrawProjectiles', 'af327DrawFx', 'af332DrawFxExtra', 'af320DrawHud', 'drawShots', 'drawCombatTexts', 'drawParticles', 'draw', 'updateHUD'];
if (!window.__PROF) {
  window.__PROF = {};
  for (const n of names) {
    try {
      E(`${n}=(function(f,n){return function(){const t=performance.now();try{return f.apply(this,arguments);}finally{const P=window.__PROF;P[n]=(P[n]||0)+performance.now()-t;}}})(${n},'${n}')`);
    } catch (e) { window.__PROF['ERR_' + n] = String(e).slice(0, 60); }
  }
  try { const ax = E('AFX'); const f = ax.draw; ax.draw = function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { window.__PROF['AFX.draw'] = (window.__PROF['AFX.draw'] || 0) + performance.now() - t; } }; } catch (_) { }
}
for (const k in window.__PROF) if (typeof window.__PROF[k] === 'number') window.__PROF[k] = 0;
let frames = 0; const t0 = performance.now();
await new Promise(r => { const f = () => { frames++; if (performance.now() - t0 < 4000) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
const out = { frames, fps: +(frames / 4).toFixed(1), mode: E('gameMode'), arena: E('profile.arena'), canvas: document.getElementById('game').width + 'x' + document.getElementById('game').height, dpr: devicePixelRatio, units: E('units').length, msPerDraw: {} };
const dc = Math.max(1, frames);
for (const [k, v] of Object.entries(window.__PROF)) out.msPerDraw[k] = typeof v === 'number' ? +(v / dc).toFixed(2) : v;
return JSON.stringify(out);
