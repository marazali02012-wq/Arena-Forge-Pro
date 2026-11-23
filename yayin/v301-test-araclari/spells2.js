const L=require('./lib.js');const S=process.argv[2];
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);
const quiet=`units=units.filter(u=>u.team!=='enemy'||u._dummy);if(af327E)for(const a of af327E.abil)a.cd=99;allyTowerDamage=0;`;
const reset=`units=[];fallenUnits=[];af327S.zones=[];elapsed=30;gold=12;energyCap=12;battlePaused=false;allySharedHP=allyTowerMax;allyLaneHP=[allySharedHP,allySharedHP,allySharedHP];`;
const friend=`units.push({team:'ally',heroType:'af37_agir_zirhli',lane:1,x:.40,hp:80,maxHp:240,speed:0,atk:10,cd:0,attackPeriod:2,phase:0,mass:100,power:1,_friend:true,level:1});`;
const cast=(id,x)=>`(()=>{const sp=AF332_SPELLS['${id}'];af327S.hero=sp.hero;af327S.abil=[{sp,cd:0,lv:1}];const r=AFP.command({side:'ally',type:'castAbility',slot:0,lane:1,x:${x}});return r.ok+' '+(r.msg||'')})()`;
const wait=async n=>{for(let k=0;k<n;k++){await ev(quiet);await p.waitForTimeout(250);}};
// va_wind
await ev(reset+friend+'0');console.log('va_wind',await ev(cast('va_wind',.40)));await wait(4);
console.log('  friend absorb',await ev(`JSON.stringify((u=>({absorb:u.absorb,until:+((u.absorbUntil||0)-elapsed).toFixed(1)}))(units.find(u=>u._friend)))`));
// al_dark
await ev(reset+friend+'0');const a0=await ev(`JSON.stringify((u=>({atk:u.atk,hp:u.hp,maxHp:u.maxHp,abs:u.absorb||0}))(units.find(u=>u._friend)))`);
console.log('al_dark',await ev(cast('al_dark',.40)));await wait(4);
console.log('  friend before',a0,'after',await ev(`JSON.stringify((u=>({atk:u.atk,hp:u.hp,maxHp:u.maxHp,abs:u.absorb||0,keys:Object.keys(u).filter(k=>/grow|Grow|dmgMul|_af327/.test(k)).map(k=>k+'='+JSON.stringify(u[k]).slice(0,30))}))(units.find(u=>u._friend)))`));
// va_cyclone: enemy hitting ally portal with / without
const hitTest=async(withSpell)=>{await ev(reset+`units.push({team:'enemy',enemyType:'brute',lane:1,x:.03,hp:9000,maxHp:9000,speed:0,atk:30,cd:0,attackPeriod:.5,phase:0,mass:200,power:30,_dummy:true});0`);
 if(withSpell)console.log('va_cyclone',await ev(cast('va_cyclone',.1)));const h0=await ev('allySharedHP');await wait(16);const h1=await ev('allySharedHP');return Math.round(h0-h1);};
const lossNo=await hitTest(false),lossYes=await hitTest(true);
console.log('  portal loss 4s without',lossNo,'with Fırtına Siperi',lossYes);
// te_bond
await ev(reset+'0');const T='af37_ork_savasci';const c0=await ev(`af334CardCost('${T}','ally')`);
console.log('te_bond',await ev(cast('te_bond',.4)));await wait(2);const c1=await ev(`af334CardCost('${T}','ally')`);
const g0=await ev('gold');const pr=await ev(`(()=>{const id=777001;battleCardMap[id]={id,slotIndex:0,type:'${T}'};battleHandSlots[0]=id;const r=AFP.command({side:'ally',type:'playCard',cardId:id,lane:1});return r.ok+':'+r.cost})()`);const g1=await ev('gold');
const c2=await ev(`af334CardCost('${T}','ally')`);
console.log('  ork cost before',c0,'after spell',c1,'play',pr,'gold',g0,'->',g1,'next card cost',c2);
// al_death
await ev(reset+'0');console.log('al_death',await ev(cast('al_death',.4)));await wait(2);
const pr2=await ev(`(()=>{const id=777002;battleCardMap[id]={id,slotIndex:0,type:'af37_ork_savasci'};battleHandSlots[0]=id;return AFP.command({side:'ally',type:'playCard',cardId:id,lane:1}).ok})()`);await wait(3);
console.log('  played',pr2,'ally units',await ev(`JSON.stringify(units.filter(u=>u.team==='ally').map(u=>[u.heroType,u.lane,Math.round(u.hp)+'/'+Math.round(u.maxHp),u.atk,!!(u.isEcho||u._af327Echo||u.echo||u.ghost)]))`));
console.log(errs.slice(0,5).join('\n'));await b.close();})();
