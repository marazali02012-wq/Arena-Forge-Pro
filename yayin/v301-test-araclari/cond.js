const L=require('./lib.js');const S=process.argv[2];
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message+' '+e.stack.slice(0,200)}},s);
await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);
const reset=`units=[];fallenUnits=[];elapsed=20;gold=12;energyCap=12;battlePaused=false;`;
const play=T=>`(()=>{const id=Math.floor(Math.random()*1e6)+100000;battleCardMap[id]={id,slotIndex:0,type:'${T}'};battleHandSlots[0]=id;return AFP.command({side:'ally',type:'playCard',cardId:id,lane:1}).ok})()`;
const keep=`units=units.filter(u=>u.team!=='enemy'||u._dummy);`;
const stat=T=>`JSON.stringify((AF285Abilities.stats()||{})['${T}']||{})`;
// 1) İskelet Savaşçı: death strike
console.log('--- iskelet');
await ev(reset+`units.push({team:'enemy',enemyType:'brute',lane:1,x:.5,hp:4000,maxHp:4000,speed:0,atk:1,cd:0,attackPeriod:3,phase:0,mass:200,power:5,_dummy:true});0`);
console.log('play',await ev(play('af37_iskelet_savasci')));
for(let k=0;k<24;k++){await ev(keep);await p.waitForTimeout(250);}
const hpB=await ev(`units.find(u=>u._dummy).hp`);
await ev(`for(const u of units.filter(u=>u.heroType==='af37_iskelet_savasci'))af327DealDamage(u,999999,{team:'enemy',kind:'melee',src:units.find(v=>v._dummy)});0`);
await p.waitForTimeout(1500);
const hpA=await ev(`units.find(u=>u._dummy).hp`);
console.log('dummy hp before death',hpB,'after',hpA,'stat',await ev(stat('af37_iskelet_savasci')));
// 2) Nekromancı: a fallen enemy nearby + wounded ally
console.log('--- nekromanci');
await ev(reset+`units.push({team:'enemy',enemyType:'brute',lane:1,x:.45,hp:4000,maxHp:4000,speed:0,atk:1,cd:0,attackPeriod:3,phase:0,mass:200,power:5,_dummy:true});0`);
console.log('play',await ev(play('af37_nekromanci')));
await ev(`units.push({team:'ally',heroType:'af37_agir_zirhli',lane:1,x:.2,hp:50,maxHp:220,speed:0,atk:1,cd:0,attackPeriod:2,phase:0,mass:100,power:1,_friend:true,level:1});0`);
for(let k=0;k<8;k++){await ev(keep);await p.waitForTimeout(250);}
for(let n=0;n<3;n++){await ev(`(()=>{const nk=units.find(u=>u.heroType==='af37_nekromanci');const v={team:'enemy',enemyType:'grunt',lane:1,x:Math.min(.95,nk.x+.06),hp:5,maxHp:60,speed:0,atk:1,cd:0,attackPeriod:3,phase:0,mass:60,power:1,_dummy:true};units.push(v);af327DealDamage(v,999,{team:'ally',kind:'melee',src:nk});})();0`);
 for(let k=0;k<12;k++){await ev(keep);await p.waitForTimeout(250);}}
console.log('friend hp',await ev(`(units.find(u=>u._friend)||{}).hp`),'allyCount',await ev(`units.filter(u=>u.team==='ally').map(u=>u.heroType||u.type||u.kind).join(',')`),'stat',await ev(stat('af37_nekromanci')));
// 3) Sedef Pervane: ranged enemy shooting it
console.log('--- sedef');
await ev(reset+`0`);
console.log('play',await ev(play('afn_sedef_pervane')));
await ev(`units.push({team:'enemy',heroType:'af37_orman_okcu',lane:1,x:.62,hp:4000,maxHp:4000,speed:0,atk:12,cd:0,attackPeriod:1.0,phase:0,mass:80,power:5,level:1,_dummy:true,isRoster:true});0`);
const h0=await ev(`units.find(u=>u.heroType==='afn_sedef_pervane').hp`);
for(let k=0;k<48;k++){await ev(keep+`for(const d of units)if(d._dummy)d.speed=0;`);await p.waitForTimeout(250);}
console.log('pervane hp',h0,'->',await ev(`(units.find(u=>u.heroType==='afn_sedef_pervane')||{}).hp`),'x',await ev(`(units.find(u=>u.heroType==='afn_sedef_pervane')||{}).x`),'stat',await ev(stat('afn_sedef_pervane')),'shots',await ev('shots.length'));
console.log(errs.slice(0,5).join('\n'));await b.close();})();
