// YALNIZ TEST: __AFE kancasıyla durum okuma + otomatik kart oynayan bot.
if (!window.__T) {
  const E = s => window.__AFE(s);
  window.__T = function () {
    const st = E(`({playing,gameMode,elapsed:+elapsed.toFixed(1),dur:MATCH_DURATION,ally:allySharedHP,enemy:enemySharedHP,base:typeof baseHP!=='undefined'?baseHP:null,
      gold,energyCap,paused:battlePaused,speed:gameSpeed,
      units:units.length,
      ua:units.filter(u=>u.team==='ally'&&u.hp>0).length, ue:units.filter(u=>u.team==='enemy'&&u.hp>0).length,
      dead:units.filter(u=>u.hp<=0).length,
      boss:units.filter(u=>u.isBoss||u.enemyType==='boss').map(u=>({hp:Math.round(u.hp),max:u.maxHp,x:+u.x.toFixed(3),lane:u.lane,sp:u.speed})),
      hand:battleHandSlots.map(id=>battleCardMap[id]?battleCardMap[id].type+':'+energyCost(battleCardMap[id].type):null),
      echo:(typeof af203Run!=='undefined'&&af203Run)?{active:af203Run.active,wave:af203Run.wave,boss:af203Run.bossDefeated}:null,
      tickErr:window.__arenaForgeTickErrors||0})`);
    return st;
  };
  window.__BOTLOG = [];
  window.__bot = function (on, opts) {
    clearInterval(window.__botT);
    if (!on) return 'bot kapalı';
    opts = opts || {};
    let lane = 0;
    window.__botT = setInterval(() => {
      try {
        if (!E('playing') || E('battlePaused')) return;
        if (opts.speed) E('gameSpeed=' + opts.speed);
        const hand = E('battleHandSlots.slice()');
        const gold = E('gold');
        let best = null;
        for (const id of hand) {
          const c = E('battleCardMap[' + JSON.stringify(id) + ']'); if (!c) continue;
          const cost = E('energyCost(' + JSON.stringify(c.type) + ')');
          if (cost <= gold && (!best || cost > best.cost)) best = { id, cost, type: c.type };
        }
        if (!best) return;
        // düşmanın en kalabalık olduğu koridor, yoksa sırayla
        const counts = E(`[0,1,2].map(l=>units.filter(u=>u.team==='enemy'&&u.hp>0&&u.lane===l).length)`);
        let target = lane; const mx = Math.max(...counts); if (mx > 0) target = counts.indexOf(mx); else lane = (lane + 1) % 3;
        const r = E(`AFP_LocalMatchAdapter.send({side:'ally',type:'playCard',cardId:${JSON.stringify(best.id)},lane:${target},x:.12})`);
        window.__BOTLOG.push([+E('elapsed').toFixed(1), best.type, target, r && r.ok, r && r.msg]);
        if (r && r.ok) { try { E('renderBattleRoster();updateHUD()'); } catch (_) { } }
      } catch (e) { window.__BOTLOG.push(['ERR', String(e).slice(0, 120)]); }
    }, opts.every || 700);
    return 'bot açık';
  };
}
return 'ok';
