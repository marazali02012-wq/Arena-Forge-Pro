// YALNIZ TEST: savaş alanına sabit (hareketsiz) birlikler koyup tek kare çizer.
// args: window.__GAL = {types:[...], page:n}
window.__bot(false);
const E = s => window.__AFE(s);
const types = window.__GAL.types;
E('battlePaused=true');
E('units.length=0');
const xs = [.14, .32, .56, .74]; // dost, düşman, dost, düşman
const placed = [];
let i = 0;
for (let lane = 0; lane < 3; lane++) {
  for (let pair = 0; pair < 2; pair++) {
    const t = types[i++]; if (!t) break;
    for (const team of ['ally', 'enemy']) {
      const x = xs[pair * 2 + (team === 'enemy' ? 1 : 0)];
      const u = { team, lane, x, hp: 100, maxHp: 100, speed: team === 'ally' ? .0001 : -.0001, mass: 1, power: 1, atk: 0, cd: 999, attackPeriod: 999, phase: 0, heroType: t, level: 1, isHero: false, isRoster: true, spawnedAt: -10, showLabelUntil: 0, facingDir: team === 'ally' ? 1 : -1 };
      E('units').push(u); placed.push([t, team, lane, x]);
    }
  }
}
// birkaç kare çiz ki görseller ve önbellek otursun
for (let k = 0; k < 4; k++) { try { E('draw(0.016)'); } catch (e) { return 'draw ERR ' + e.message; } }
return placed.length;
