const L=require('./lib.js');const S=process.argv[2];
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);
const ids=['__none__'].concat(JSON.parse(await ev('JSON.stringify(Object.keys(window.AF332_SPELLS))')));
const quiet=`units=units.filter(u=>u.team!=='enemy'||u._dummy);if(af327E)for(const a of af327E.abil)a.cd=99;allyTowerDamage=0;for(const u of units)if(u._dummy){u.atk=0;u.speed=0;}`;
const out=[];
for(const id of ids){
 const r0=await ev(`(()=>{units=[];fallenUnits=[];af327S.zones=[];if(af327E)af327E.zones=[];for(const u of units)u._pre=1;elapsed=30;gold=5;energyCap=12;battlePaused=false;enemySharedHP=TOWER_MAX_HP;allySharedHP=allyTowerMax*.6;allyLaneHP=[allySharedHP,allySharedHP,allySharedHP];enemyLaneHP=[enemySharedHP,enemySharedHP,enemySharedHP];
  const mk=(x,lane,hp)=>({team:'enemy',enemyType:'brute',lane,x,hp,maxHp:hp,speed:0,atk:0,cd:0,attackPeriod:3,phase:0,mass:200,power:5,_dummy:true});
  const sp0=window.AF332_SPELLS['${id}']||{aim:'lane'};const xs=sp0.aim==='portal'?[.10,.15,.20]:sp0.aim==='point'?[.37,.40,.43]:[.30,.40,.48];units.push(mk(xs[0],1,3000),mk(xs[1],1,3000),mk(xs[2],1,3000),mk(.40,0,3000));allyTowerDamage=0;if(af327E)for(const a of af327E.abil)a.cd=99;
  units.push({team:'ally',heroType:'af37_agir_zirhli',lane:1,x:.22,hp:80,maxHp:240,speed:0,atk:1,cd:0,attackPeriod:2,phase:0,mass:100,power:1,_friend:true,level:1});
  const sp=window.AF332_SPELLS['${id}'];if(!sp){window.__sp={n:units.length,before:JSON.stringify(units.map(u=>[u.team,u.lane,+u.x.toFixed(3),Math.round(u.hp)]))};return JSON.stringify({ok:'baseline'});}af327S.hero=sp.hero;af327S.abil=[{sp,cd:0,lv:1}];
  for(const u of units)u._pre=1;const before=JSON.stringify(units.map(u=>[u.team,u.lane,+u.x.toFixed(3),Math.round(u.hp)]));
  window.__sp={n:units.length,before,gold,ally:allySharedHP,friendAtk:units.find(u=>u._friend).atk};
  const r=AFP.command({side:'ally',type:'castAbility',slot:0,lane:1,x:.40});
  return JSON.stringify({ok:r.ok,code:r.code,msg:r.msg,cd:+af327S.abil[0].cd.toFixed(1),spcd:sp.cd,aim:sp.aim,hero:sp.hero,goldAfter:gold});})()`);
 const r=JSON.parse(r0);
 const fx={dmg:0,moved:0,stun:0,slow:0,frozen:0,vuln:0};
 for(let k=0;k<14;k++){await ev(quiet);await p.waitForTimeout(250);
  const s=JSON.parse(await ev(`JSON.stringify(units.filter(u=>u._dummy).map(u=>({x:u.x,hp:u.hp,lane:u.lane,st:(u.stunUntil||0)>elapsed,sl:(u.slowUntil||0)>elapsed,fr:(u.frozenUntil||u.freezeUntil||0)>elapsed,vu:(u.vulnUntil||0)>elapsed})))`));
  s.forEach(u=>{if(u.st)fx.stun++;if(u.sl)fx.slow++;if(u.fr)fx.frozen++;if(u.vu)fx.vuln++;});fx.last=s;}
 const post=JSON.parse(await ev(`JSON.stringify({units:units.map(u=>[u.team,u.lane,+u.x.toFixed(3),Math.round(u.hp),u.heroType||u.enemyType||u.kind||(u.isBarrier?'barrier':'')]),friend:(()=>{const f=units.find(u=>u._friend);return f?{hp:Math.round(f.hp),sh:Math.round(f.absorb||0),atk:f.atk,buff:Object.keys(f).filter(k=>/Until$/.test(k)&&f[k]>elapsed)}:null})(),zones:(af327S.zones||[]).length,added:units.filter(u=>!u._pre).map(u=>u.team+':'+(u.isBarrier?'BARIYER':'')+(u.heroType||u.enemyType||u.kind||'')+(u.summonedBy||u._af285SummonBy||u.isSummon?'(çağrı)':'')),ally:Math.round(allySharedHP),before:window.__sp.before,goldNow:gold,disc:typeof af327S.discount!=='undefined'?af327S.discount:null})`));
 const before=JSON.parse(post.before).filter(u=>u[0]==='enemy');const after=post.units.filter(u=>u[0]==='enemy');
 const dmg=before.reduce((a,u,i)=>a+(u[3]-((after[i]||[0,0,0,0])[3])),0);
 const moved=before.filter((u,i)=>after[i]&&Math.abs(after[i][2]-u[2])>.005).length;
 const newUnits=post.units.length-JSON.parse(post.before).length;
 const res={id,hero:r.hero,aim:r.aim,ok:r.ok,code:r.code,msg:r.msg,cdSet:r.cd,spcd:r.spcd,goldBefore:5,goldAfterCast:r.goldAfter,enemyDmg:dmg,enemyMoved:moved,stun:fx.stun,slow:fx.slow,frozen:fx.frozen,vuln:fx.vuln,friend:post.friend,allyPortal:post.ally,zones:post.zones,newUnits,newTypes:(post.added||[]).join(',')};
 out.push(res);console.log(JSON.stringify(res));
 if(!(await ev('playing'))){await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");await p.waitForTimeout(3000);}
}
require('fs').writeFileSync(S+'/t/spells.json',JSON.stringify(out,null,1));
console.log(errs.slice(0,8).join('\n'));await b.close();})();
