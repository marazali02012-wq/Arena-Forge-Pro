/* ===== AF285 QA KANCASI (yalnızca *_QA.html test yapısında bulunur; yayın dosyasına girmez) =====
   Motor kapanışının içindedir: units/elapsed gibi iç değişkenlere erişir. Savaş kurallarını değiştirmez;
   yalnızca (1) kare kare elle ilerletme, (2) gerçek kart yolundan birlik çıkarma, (3) olay günlüğü sağlar. */
(function(){
 'use strict';
 const QA={log:[],seq:0,manual:false,ts:0,stepping:false,lockEnemyEnergy:true,ctx:null};
 const push=(e)=>{if(QA.log.length<20000)QA.log.push(e);};
 const tname=u=>u?(u.heroType||u.enemyType||(u.isBarrier?'barrier':'?')):null;
 const realTick=tick;
 tick=function(ts){if(QA.manual&&!QA.stepping)return;return realTick(ts);};
 /* Hızlı test: çizim yalnızca simülasyon dışı (görsel) işlerdir; uzun adımlarda her N karede bir çizilir. Ekran görüntüsünden önce redraw() çağrılır. */
 let qaFrame=0;QA.drawEvery=1;
 const realDraw=draw;
 draw=function(dt){if(QA.stepping&&QA.drawEvery>1&&((qaFrame++)%QA.drawEvery)!==0)return;return realDraw(dt);};
 QA.redraw=function(){try{realDraw(0);return true;}catch(e){return String(e);}};
 QA.setManual=function(on){
  QA.manual=!!on;
  if(QA.manual){QA.ts=Number.isFinite(last)?last:performance.now();}
  else if(playing){last=performance.now();lastPresentedFrame=last;requestAnimationFrame(tick);}
  return QA.manual;
 };
 QA.step=function(sec,fps){
  fps=fps||25;const n=Math.max(1,Math.round(sec*fps));QA.stepping=true;
  try{for(let i=0;i<n&&playing;i++){if(QA.lockEnemyEnergy){enemyEnergy=0;}QA.ts+=1000/fps;realTick(QA.ts);}}
  finally{QA.stepping=false;}
  return elapsed;
 };
 QA.start=function(){
  window.__afNoVs=true;window.__afVsPass=true;window.__AFPTrainingBypass=true;
  try{if(!playing)startGame('duel');}finally{window.__afVsPass=false;}
  if(!playing)return {ok:false,reason:'not playing'};
  gameSpeed=1;
  if(af329){af329.think=1e12;af329.hand=[];af329.queue=[];}
  units.length=0;
  try{tutorialActive=false;tutorialStep=0;window.__afpGuideHold=false;}catch(_){}
  QA.log.length=0;
  return {ok:true,mode:gameMode,elapsed};
 };
 QA.clearUnits=function(){units.length=0;try{af323Shots.length=0;}catch(_){}return true;};
 QA.restart=function(){
  const wasManual=QA.manual;QA.manual=false;
  try{if(playing)endGame(null,'QA yeniden başlatma',{suppressRewards:true,title:'QA'});}catch(e){console.warn('[AF285 QA] endGame',e);}
  try{const end=document.getElementById('end');if(end)end.style.display='none';}catch(_){}
  const r=QA.start();QA.setManual(wasManual);QA.clearUnits();QA.log.length=0;return r;
 };
 QA.portal=function(){return {ally:allyTowerHP[0],enemy:enemyHP[0]};};
 QA.healPortals=function(){try{allySharedHP=allyTowerMax;allyLaneHP=[allySharedHP,allySharedHP,allySharedHP];enemySharedHP=TOWER_MAX_HP;enemyLaneHP=[enemySharedHP,enemySharedHP,enemySharedHP];}catch(e){}return QA.portal();};
 QA.play=function(team,type,lane,x){
  if(!HERO_INFO[type])return {ok:false,reason:'no type '+type};
  if(team==='ally'){
   const id='qa-a-'+(++QA.seq);
   battleCardMap[id]={id,type};battleHandSlots.push(id);
   gold=Math.max(gold,30);energyCap=Math.max(energyCap,12);
   const before=units.length,g0=gold;
   const r=af330Command({type:'playCard',side:'ally',cardId:id,lane,x});
   return {ok:!!r.ok,code:r.code,msg:r.msg,spawned:units.length-before,spent:g0-gold,uids:units.slice(before).map(v=>af330Uid(v))};
  }
  const id='qa-e-'+(++QA.seq);
  af329.hand.push({id,type});enemyEnergy=30;enemyEnergyCap=12;delete af329.cd[type];
  const before=units.length;
  const r=af329Command({type:'playCard',cardId:id,lane,x});
  const spent=30-enemyEnergy;enemyEnergy=0;
  return {ok:!!r.ok,reason:r.reason,spawned:units.length-before,spent,uids:units.slice(before).map(v=>af330Uid(v))};
 };
 QA.units=function(){
  return units.filter(u=>u&&!u.isBarrier).map(u=>({uid:af330Uid(u),team:u.team,type:tname(u),lane:u.lane,x:+u.x.toFixed(4),hp:+(+u.hp).toFixed(1),maxHp:u.maxHp,
   stun:Math.max(0,(u.stunUntil||0)-elapsed),slow:Math.max(0,(u.slowUntil||0)-elapsed),root:Math.max(0,(u._af264RootUntil||0)-elapsed),
   absorb:(u.absorbUntil||0)>elapsed?+(+u.absorb||0).toFixed(1):0,cd:+(+u.cd||0).toFixed(3),
   cap:!!u._afp177CaptiveBy,atk:u.atk,dr:(u.drUntil||0)>elapsed?+(+u.dr||0).toFixed(3):0,burn:u.dots&&u.dots.burn&&u.dots.burn.until>elapsed?+(u.dots.burn.until-elapsed).toFixed(2):0,
   busy:(typeof af285Busy==='function')?af285Busy(u):false,dome:u._af285Dome>0?{c:u._af285DomeC|0,m:+(+u._af285DomeM||0).toFixed(1),b:+(+u._af285DomeB||0).toFixed(2)}:null,vine:u._af285Vine>0?+((u._af285VineEnd||0)-elapsed).toFixed(2):null,dizzy:u._af285Dizzy>elapsed?+(u._af285Dizzy-elapsed).toFixed(2):null,hot:(u.hotUntil||0)>elapsed?+(+u.hot).toFixed(2):0,ab:(typeof af285Snapshot==='function')?af285Snapshot(u):null}));
 };
 QA.state=function(){return {playing,elapsed,gold,enemyEnergy,units:QA.units().length,mode:gameMode,paused:battlePaused,tickErrors:window.__arenaForgeTickErrors||0,drawErrors:window.__afDrawErrors||0};};
 QA.cost=function(type){return energyCost(type);};
 QA.rule=function(type){const r=Object.prototype.hasOwnProperty.call(AF267_RULES,type)?AF267_RULES[type]:null;return r?JSON.parse(JSON.stringify(r)):null;};
 QA.af264=function(){return JSON.parse(JSON.stringify(AF264));};
 QA.profile=function(type){return Object.prototype.hasOwnProperty.call(AF273_PROFILES,type)?AF273_PROFILES[type]:null;};
 QA.info=function(type){const i=HERO_INFO[type];return i?{name:i.name,rarity:i.rarity,hp:i.hp,atk:i.atk,period:i.period,speed:i.speed,role:i.combatRole,squad:(AF214_SQUADS[type]||[]).length||1,shooter:af323IsShooter({heroType:type,team:'ally',isRoster:true}),range:unitAttackRange({heroType:type,team:'ally',isRoster:true}),arch:SPELL_ARCHETYPE[type]||null,ability:HERO_ABILITIES[type]||null}:null;};
 QA.events=function(since){since=since||0;return QA.log.filter(e=>e.t>=since);};
 QA.resetLog=function(){QA.log.length=0;return true;};

 /* ---- Eski (AF264/AF267/AF273) sistemin gözlemi ---- */
 const wrap=(name,get,set,fn)=>{try{const o=get();if(typeof o!=='function')return;set(fn(o));}catch(e){console.warn('[AF285 QA] wrap',name,e);}};
 wrap('af274ResolvePower',()=>af274ResolvePower,v=>{af274ResolvePower=v;},o=>function(rule,u,targets){
  push({t:elapsed,k:'rule',src:tname(u),team:u&&u.team,effect:rule&&rule.effect,n:(targets||[]).length,tg:(targets||[]).map(tname)});
  const prev=QA.ctx;QA.ctx={src:tname(u),team:u&&u.team,via:'rule'};
  try{return o.apply(this,arguments);}finally{QA.ctx=prev;}
 });
 wrap('af267Run',()=>af267Run,v=>{af267Run=v;},o=>function(event,u,other,amount){
  const r=o.apply(this,arguments);
  if(event==='guard'&&Number.isFinite(amount)&&Number.isFinite(r)&&r<amount-1e-9)push({t:elapsed,k:'guard',src:tname(u),team:u&&u.team,from:amount,to:r});
  return r;
 });
 wrap('af273Signal',()=>af273Signal,v=>{af273Signal=v;},o=>function(u,target,stage){push({t:elapsed,k:'signal',src:tname(u),team:u&&u.team,stage:stage||'result',tg:tname(target)});return o.apply(this,arguments);});
 wrap('af264OnHit',()=>af264OnHit,v=>{af264OnHit=v;},o=>function(u){const prev=QA.ctx;QA.ctx={src:tname(u),team:u&&u.team,via:'af264hit'};try{return o.apply(this,arguments);}finally{QA.ctx=prev;}});
 wrap('af327DealDamage',()=>af327DealDamage,v=>{af327DealDamage=v;},o=>function(tgt,amount,opt){
  const hb=tgt?+tgt.hp:0;const d=o.apply(this,arguments);
  if(d>0){const src=opt&&opt.source?tname(opt.source):(QA.ctx&&QA.ctx.src)||null;push({t:elapsed,k:'dmg',kind:opt&&opt.kind||'spell',src,su:opt&&opt.source?af330Uid(opt.source):(QA.ctx&&QA.ctx.uid)||null,tu:af330Uid(tgt),hb:+hb.toFixed(2),team:opt&&opt.source?opt.source.team:(opt&&opt.team)||(QA.ctx&&QA.ctx.team)||null,key:opt&&opt.key||null,tg:tname(tgt),tgTeam:tgt.team,v:d});}
  return d;
 });
 wrap('af327HealUnit',()=>af327HealUnit,v=>{af327HealUnit=v;},o=>function(u,amount,by){const h=o.apply(this,arguments);if(h>0)push({t:elapsed,k:'heal',su:by?af330Uid(by):(QA.ctx&&QA.ctx.uid)||null,tu:af330Uid(u),tgTeam:u.team,src:by?tname(by):(QA.ctx&&QA.ctx.src)||null,team:by?by.team:(QA.ctx&&QA.ctx.team)||null,tg:tname(u),v:h});return h;});
 wrap('af327Shield',()=>af327Shield,v=>{af327Shield=v;},o=>function(u,a,dur){push({t:elapsed,k:'shield',su:(QA.ctx&&QA.ctx.uid)||null,tu:af330Uid(u),tgTeam:u.team,src:(QA.ctx&&QA.ctx.src)||null,team:(QA.ctx&&QA.ctx.team)||null,tg:tname(u),v:a,dur});return o.apply(this,arguments);});
 wrap('af264Root',()=>af264Root,v=>{af264Root=v;},o=>function(u,t){const r=o.apply(this,arguments);if(r)push({t:elapsed,k:'root',su:(QA.ctx&&QA.ctx.uid)||null,tu:u?af330Uid(u):null,tgTeam:u&&u.team,src:(QA.ctx&&QA.ctx.src)||null,team:(QA.ctx&&QA.ctx.team)||null,tg:tname(u),dur:t});return r;});
 wrap('af264Slow',()=>af264Slow,v=>{af264Slow=v;},o=>function(u,t){const r=o.apply(this,arguments);if(r)push({t:elapsed,k:'slow',su:(QA.ctx&&QA.ctx.uid)||null,tu:u?af330Uid(u):null,tgTeam:u&&u.team,src:(QA.ctx&&QA.ctx.src)||null,team:(QA.ctx&&QA.ctx.team)||null,tg:tname(u),dur:t});return r;});
 wrap('af327Push',()=>af327Push,v=>{af327Push=v;},o=>function(e,d,team){push({t:elapsed,k:'push',su:(QA.ctx&&QA.ctx.uid)||null,tu:af330Uid(e),tgTeam:e.team,src:(QA.ctx&&QA.ctx.src)||null,team:(QA.ctx&&QA.ctx.team)||null,tg:tname(e),v:d});return o.apply(this,arguments);});
 wrap('af327AddDot',()=>af327AddDot,v=>{af327AddDot=v;},o=>function(t,dps,dur,kind,team,key,source){push({t:elapsed,k:'dot',kind,su:source?af330Uid(source):(QA.ctx&&QA.ctx.uid)||null,tu:af330Uid(t),tgTeam:t.team,src:source?tname(source):(key||(QA.ctx&&QA.ctx.src)||null),team:source?source.team:(team||(QA.ctx&&QA.ctx.team)||null),tg:tname(t),dps,dur});return o.apply(this,arguments);});
 wrap('af267DelayAttack',()=>af267DelayAttack,v=>{af267DelayAttack=v;},o=>function(v,s){push({t:elapsed,k:'delay',su:(QA.ctx&&QA.ctx.uid)||null,tu:af330Uid(v),tgTeam:v.team,src:(QA.ctx&&QA.ctx.src)||null,team:(QA.ctx&&QA.ctx.team)||null,tg:tname(v),v:s});return o.apply(this,arguments);});
 wrap('afp177Devour',()=>afp177Devour,v=>{afp177Devour=v;},o=>function(u,t){const r=o.apply(this,arguments);if(r)push({t:elapsed,k:'devour',src:tname(u),team:u&&u.team,tg:tname(t)});return r;});
 wrap('af264Armor',()=>af264Armor,v=>{af264Armor=v;},o=>function(att,target,kind){const r=o.apply(this,arguments);if(r>0&&target)push({t:elapsed,k:'armor',src:'af37_agir_zirhli',team:target.team,tg:tname(target),v:r});return r;});
 wrap('af264IceHit',()=>af264IceHit,v=>{af264IceHit=v;},o=>function(att,tgt,d){const r=o.apply(this,arguments);if(tgt&&d-r>1e-6)push({t:elapsed,k:'ice',src:tname(tgt),team:tgt.team,v:d-r});return r;});
 wrap('af264Pierce',()=>af264Pierce,v=>{af264Pierce=v;},o=>function(att){const r=o.apply(this,arguments);if(r>0&&att)push({t:elapsed,k:'pierce',src:tname(att),team:att.team,v:r});return r;});
 wrap('af327Timed',()=>af327Timed,v=>{af327Timed=v;},o=>function(u,vk){const r=o.apply(this,arguments);if(r&&QA.ctx)push({t:elapsed,k:'timed',key:vk,su:QA.ctx.uid||null,tu:af330Uid(u),tgTeam:u.team,src:QA.ctx.src,team:QA.ctx.team,tg:tname(u)});return r;});
 wrap('af264Start',()=>af264Start,v=>{af264Start=v;},o=>function(u){const was=!!(u&&u._af264Born);const r=o.apply(this,arguments);if(u&&!was&&u._af264Born)push({t:elapsed,k:'start',src:tname(u),team:u.team,ice:u._af264Ice||0,stealth:Math.max(0,(u._af264Stealth||0)-elapsed),tunnel:Math.max(0,(u._af264TunnelEnd||0)-elapsed)});return r;});
 /* Yetenek hasar hattı: giren miktar (yeteneğin hesapladığı) ve motorun azaltma sonrası değeri */
 wrap('af327Incoming',()=>af327Incoming,v=>{af327Incoming=v;},o=>function(att,tgt,dmg,kind){
  const r=o.apply(this,arguments);
  if(typeof kind==='string'&&kind.indexOf('af285')===0)push({t:elapsed,k:'inc',kind,su:att?af330Uid(att):null,tu:tgt?af330Uid(tgt):null,pre:+(+dmg).toFixed(3),post:+(+r).toFixed(3),hb:tgt?+(+tgt.hp).toFixed(2):null});
  return r;
 });
 /* ---- AF285 yetenek akışı gözlemi ---- */
 const abEv=(k,u,c,extra)=>push(Object.assign({t:elapsed,k,src:tname(u),team:u&&u.team,su:u?af330Uid(u):null,
   tu:c&&c.t?af330Uid(c.t):null,tt:c&&c.t?c.t.team:null,tx:c?+(+c.x).toFixed(4):null,ux:u?+u.x.toFixed(4):null},extra||{}));
 wrap('af285Begin',()=>af285Begin,v=>{af285Begin=v;},o=>function(u,def,plan){const r=o.apply(this,arguments);abEv('ab-wind',u,u._af285C,{wind:def.wind,cast:def.cast,hit:def.hit==null?1:def.hit});return r;});
 wrap('af285BeginCast',()=>af285BeginCast,v=>{af285BeginCast=v;},o=>function(u,def){const r=o.apply(this,arguments);if((u._af285S|0)===2)abEv('ab-cast',u,u._af285C);return r;});
 wrap('af285Impact',()=>af285Impact,v=>{af285Impact=v;},o=>function(u,def,c){const done=c&&c.done;abEv('ab-impact',u,c,{tAlive:!!(c&&c.t&&c.t.hp>0)});const prev=QA.ctx;QA.ctx={src:tname(u),team:u.team,uid:af330Uid(u),via:'af285'};try{return o.apply(this,arguments);}finally{QA.ctx=prev;}});
 wrap('af285Cancel',()=>af285Cancel,v=>{af285Cancel=v;},o=>function(u,def,why){abEv('ab-cancel',u,u._af285C,{why});return o.apply(this,arguments);});
 wrap('af285Stun',()=>af285Stun,v=>{af285Stun=v;},o=>function(u,v,dur){const r=o.apply(this,arguments);if(r)push({t:elapsed,k:'stun',su:u?af330Uid(u):null,tu:v?af330Uid(v):null,tgTeam:v&&v.team,src:tname(u),team:u&&u.team,tg:tname(v),dur});return r;});
 wrap('af285Drop',()=>af285Drop,v=>{af285Drop=v;},o=>function(u,def){abEv('ab-drop',u,u._af285C);return o.apply(this,arguments);});
 wrap('af285Finish',()=>af285Finish,v=>{af285Finish=v;},o=>function(u,def){abEv('ab-done',u,u._af285C);return o.apply(this,arguments);});
 /* AF285 gecikmeli etkiler de kaynağa atfedilir */
 wrap('af285Later',()=>af285Later,v=>{af285Later=v;},o=>function(delay,fn){const ctx=QA.ctx;return o.call(this,delay,function(){const prev=QA.ctx;QA.ctx=ctx;try{return fn();}finally{QA.ctx=prev;}});});
 QA.find=function(uid,team){return units.find(v=>v&&af330Uid(v)===uid&&(!team||v.team===team))||null;};
 QA.testDamage=function(target,source,amount,kind="af285Physical"){return af327DealDamage(target,amount,{source,team:source.team,kind});};
 QA.kill=function(uid,team){const u=QA.find(uid,team);if(!u)return false;u.hp=0;u.killedBy=u.team==='ally'?'enemy':'ally';return true;};
 QA.setHp=function(uid,team,ratio){const u=QA.find(uid,team);if(!u)return false;u.hp=Math.max(1,Math.round(u.maxHp*ratio));return u.hp;};
 QA.stun=function(uid,team,dur){const u=QA.find(uid,team);if(!u)return false;u.stunUntil=elapsed+dur;return true;};
 QA.move=function(uid,team,x){const u=QA.find(uid,team);if(!u)return false;u.x=x;return true;};
 QA.defs=function(){return window.AF285Abilities?window.AF285Abilities.list():[];};
 QA.abStats=function(){return window.AF285Abilities?window.AF285Abilities.stats():{};};
 QA.fxCount=function(){return typeof af285Fx!=='undefined'?af285Fx.length:0;};
 QA.fxList=function(){return typeof af285Fx!=='undefined'?af285Fx.map(f=>({k:f.k,card:f.card,team:f.team,lane:f.lane,x0:f.x0,x1:f.x1,t0:f.t0,life:f.life})):[];};
 QA.pose=function(uid,team){const u=QA.find(uid,team);if(!u||typeof af285PoseOf!=='function')return null;const P=af285PoseOf(u);if(!P)return null;const px=40;return {s:P.s,p:+P.p.toFixed(3),dx:af285PoseDX(u,px)/px,dy:af285PoseDY(u,px)/px,tau:P.pose.tau,atlas:window.__AF285Pose?window.__AF285Pose(u):null};};
 QA.snapshot=function(){return window.AFPOnlineBattleInternal.createOnlineSnapshot();};
 QA.becomePeer=function(){window.__AFPUseModeNetworkV1=true;window.__AFPOnlineContext={active:true,authority:false,seat:2,matchId:'',lastAppliedSnapshot:0,role:'peer'};return true;};
 QA.applySnapshot=function(snap){return window.AFPOnlineBattleInternal.applyOnlineSnapshot(snap,0);};
 QA.legacyTests=function(){const out={};
   try{out.afp177=window.AFP177QA.test();}catch(e){out.afp177=String(e);}
   try{out.afp179=window.AFP179QA.test();}catch(e){out.afp179=String(e);}
   try{out.skeleton=window.__skeletonCloneQA.test();}catch(e){out.skeleton=String(e);}
   try{out.melee=window.__afpMeleeRangeQA.rangeGateTest();}catch(e){out.melee=String(e);}
   try{out.hands=window.__arenaForgeV275QA.openingHands(200);}catch(e){out.hands=String(e);}
   return out;};
 QA.roster=function(){const ids=window.AF59Roster.ids();const rar={};for(const t of ids){const r=HERO_INFO[t].rarity;rar[r]=(rar[r]||0)+1;}
   return {count:ids.length,ids,rarity:rar,costs:Object.fromEntries(ids.map(t=>[t,energyCost(t)])),saveKey:(typeof SAVE_KEY!=='undefined'?SAVE_KEY:null),deckSize:(typeof preparedDeckTypes!=='undefined'?preparedDeckTypes.length:null)};};
 QA.stepUntil=function(maxSec,k,src,fps){
  fps=fps||25;let idx=QA.log.length;const tEnd=elapsed+maxSec;QA.stepping=true;
  try{for(let n=0;playing&&elapsed<tEnd&&n<Math.ceil(maxSec*fps)+8;n++){if(QA.lockEnemyEnergy)enemyEnergy=0;QA.ts+=1000/fps;realTick(QA.ts);
    for(;idx<QA.log.length;idx++){const e=QA.log[idx];if(e.k===k&&(!src||e.src===src))return {hit:true,t:elapsed,e};}}}
  finally{QA.stepping=false;}
  return {hit:false,t:elapsed};
 };
 window.__AF285QA=QA;
})();
