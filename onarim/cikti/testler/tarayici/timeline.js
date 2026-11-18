// YALNIZ TEST: savaşın zaman çizelgesini kaydeder (window.__TL)
clearInterval(window.__tlT); window.__TL = [];
window.__tlT = setInterval(() => {
  try {
    const t = window.__T(); if (!t.playing && window.__TL.length && !window.__TL[window.__TL.length - 1].playing) return;
    window.__TL.push({ playing: t.playing, m: t.gameMode, e: t.elapsed, a: t.ally, en: t.enemy, base: t.base, ua: t.ua, ue: t.ue, g: t.gold, cap: t.energyCap, boss: t.boss, echo: t.echo, err: t.tickErr });
  } catch (e) { window.__TL.push({ err: String(e).slice(0, 100) }); }
}, 2000);
return 'tl';
