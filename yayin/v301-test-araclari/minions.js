const L=require('./lib.js');const S=process.argv[2];const FROM=+(process.argv[3]||0),TO=+(process.argv[4]||59);
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);
const types=JSON.parse(await ev('JSON.stringify(PREP_HERO_TYPES)'));
const vis=JSON.parse(await ev('JSON.stringify(window.__arenaForgeDeckQA.testVisualFallbacks())'));
console.log('VISUAL_FALLBACK',JSON.stringify(vis).slice(0,300));
const results=[];
for(let i=FROM;i<Math.min(TO,types.length);i++){const T=types[i];
 const setup=await ev(`(()=>{
  units=[];fallenUnits=[];elapsed=20;matchTimeoutResolved=false;enemySharedHP=TOWER_MAX_HP;allySharedHP=allyTowerMax;enemyLaneHP=[enemySharedHP,enemySharedHP,enemySharedHP];allyLaneHP=[allySharedHP,allySharedHP,allySharedHP];baseHP=baseMax;
  gold=12;energyCap=12;battlePaused=false;
  const mk=(x,lane,hp)=>({team:'enemy',enemyType:'brute',lane,x,hp,maxHp:hp,speed:0,atk:1,cd:0,attackPeriod:3,phase:0,mass:200,power:5,_dummy:true});
  units.push(mk(.50,1,4000),mk(.56,1,4000),mk(.62,1,4000),mk(.52,0,4000),mk(.52,2,4000));
  const id=90000+${i};battleCardMap[id]={id,slotIndex:0,type:'${T}'};battleHandSlots[0]=id;
  const r=AFP.command({side:'ally',type:'playCard',cardId:id,lane:1});
  const mine=units.filter(u=>u.team==='ally'&&u.heroType==='${T}');
  // wounded friend for healers/support
  units.push({team:'ally',heroType:'af37_agir_zirhli',lane:1,x:.08,hp:60,maxHp:200,speed:.02,atk:1,cd:0,attackPeriod:2,phase:0,mass:100,power:1,_friend:true,level:1});
  window.__mt={T:'${T}',stat0:JSON.stringify((AF285Abilities.stats()||{})['${T}']||{})};
  return JSON.stringify({r:r.ok?'ok':r.code+':'+r.msg,count:mine.length,x0:mine.map(u=>+u.x.toFixed(3))});})()`);
 const st=JSON.parse(setup);
 const track={xs:[],face:new Set(),states:new Set(),dmgDummy:0,enemyMoved:0,enemyStun:0,enemySlow:0,allyHeal:0,allyShield:0,summons:0,maxUnits:0};
 let prevDummy=null,prevFriend=null;
 for(let k=0;k<56;k++){
  const s=JSON.parse(await ev(`(()=>{units=units.filter(u=>u.team!=='enemy'||u._dummy||u._af285SummonBy||u.summonedBy);for(const d of units)if(d._dummy){d.speed=0;}
   const mine=units.filter(u=>u.team==='ally'&&u.heroType==='${T}'&&!u._friend);const d=units.filter(u=>u._dummy);const f=units.find(u=>u._friend);
   return JSON.stringify({t:elapsed,mine:mine.map(u=>({x:u.x,f:u.facingDir,s:u._af285S,hp:u.hp})),d:d.map(u=>({x:u.x,hp:u.hp,lane:u.lane,st:(u.stunUntil||0)>elapsed,sl:(u.slowUntil||0)>elapsed})),f:f?{hp:f.hp,sh:(f.absorb||0)}:null,n:units.length,allyN:units.filter(u=>u.team==='ally').length})})()`));
  if(s.mine[0]){track.xs.push(s.mine[0].x);if(s.mine[0].f)track.face.add(s.mine[0].f);if(s.mine[0].s!==undefined&&s.mine[0].s!==null)track.states.add(String(s.mine[0].s));}
  track.maxUnits=Math.max(track.maxUnits,s.allyN);
  if(prevDummy){for(let j=0;j<Math.min(prevDummy.length,s.d.length);j++){const a=prevDummy[j],b2=s.d[j];if(b2.hp<a.hp)track.dmgDummy+=a.hp-b2.hp;if(Math.abs(b2.x-a.x)>.003||b2.lane!==a.lane)track.enemyMoved++;if(b2.st)track.enemyStun++;if(b2.sl)track.enemySlow++;}}
  if(prevFriend&&s.f){if(s.f.hp>prevFriend.hp)track.allyHeal+=s.f.hp-prevFriend.hp;if(s.f.sh>0)track.allyShield++;}
  prevDummy=s.d;prevFriend=s.f;
  if(k===16)await p.screenshot({path:S+'/shots/minion_'+String(i).padStart(2,'0')+'_'+T+'.png'});
  await p.waitForTimeout(250);
 }
 const stat1=await ev(`JSON.stringify((AF285Abilities.stats()||{})['${T}']||{})`);
 // death & cleanup
 const death=await ev(`(()=>{const mine=units.filter(u=>u.team==='ally'&&u.heroType==='${T}'&&!u._friend);for(const u of mine)af327DealDamage(u,999999,{team:'enemy',kind:'spell'});return mine.length})()`);
 await p.waitForTimeout(3000);
 const left=JSON.parse(await ev(`JSON.stringify({alive:units.filter(u=>u.team==='ally'&&u.heroType==='${T}'&&!u._friend).map(u=>({hp:u.hp,x:u.x})),fallen:fallenUnits.length})`));
 const xs=track.xs;const moved=xs.length>1?+(Math.max(...xs)-xs[0]).toFixed(3):0;
 const res={i,T,play:st.r,count:st.count,x0:st.x0,moved,face:[...track.face],states:[...track.states],dmg:Math.round(track.dmgDummy),enemyMoved:track.enemyMoved,stun:track.enemyStun,slow:track.enemySlow,heal:Math.round(track.allyHeal),shield:track.allyShield,maxAlly:track.maxUnits,stat0:JSON.parse(await ev('window.__mt.stat0')),stat1:JSON.parse(stat1),killed:death,aliveAfterDeath:left.alive.length,stillPlaying:await ev('playing')};
 results.push(res);console.log(JSON.stringify(res));
 if(!res.stillPlaying){await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");await p.waitForTimeout(3000);}
}
require('fs').writeFileSync(S+'/t/minions_'+FROM+'_'+TO+'.json',JSON.stringify(results,null,1));
console.log('drawErr',await ev(`JSON.stringify(window.__afDrawErrors||[]).slice(0,800)`),'tickErr',await ev('String(window.__arenaForgeTickErrors||0)+" "+String(window.__arenaForgeLastTickError||"").slice(0,500)'));
console.log(errs.slice(0,10).join('\n'));await b.close();})();
