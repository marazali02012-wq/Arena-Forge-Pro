const L=require('./lib.js');const S=process.argv[2];const VW=+(process.argv[3]||740),VH=+(process.argv[4]||360);
(async()=>{const {b,c,p,errs}=await L.open(VW,VH,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
const cdp=await c.newCDPSession(p);
await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);
await p.waitForTimeout(1500);
const quiet=`units=units.filter(u=>u.team!=='enemy');if(af327E)for(const a of af327E.abil)a.cd=99;`;
await ev(quiet+'gold=12;energyCap=12;0');
const geo=async(lane,x)=>JSON.parse(await ev(`(()=>{const cv=document.querySelector('canvas#game')||document.querySelector('canvas');const r=cv.getBoundingClientRect();const sx=r.width/W,sy=r.height/H;const px=laneX(${x});return JSON.stringify({x:r.left+px*sx,y:r.top+laneY(${lane},px)*sy-6})})()`));
const cardPos=async(i)=>JSON.parse(await p.evaluate(i=>{const bs=[...document.querySelectorAll('#battleRoster .battlePick[data-card-id]')];const e=bs[i];if(!e)return 'null';const r=e.getBoundingClientRect();return JSON.stringify({x:r.left+r.width/2,y:r.top+r.height/2,id:e.dataset.cardId,type:e.dataset.heroType})},i));
const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
const state=async()=>JSON.parse(await ev(`JSON.stringify({drag:!!afBattleDragState,gold:+gold.toFixed(2),ally:units.filter(u=>u.team==='ally'&&!u.isCommander).map(u=>u.lane+':'+(u.heroType||'').slice(0,12)),ghostDom:document.querySelectorAll('.af-battle-dragging,.afBattleGhost,[class*=ghost i]:not(script)').length,aborts:window.__afBattleDragAborts||0})`));
const drag=async(from,to,steps=8,end='touchEnd',mid)=>{await T('touchStart',[{x:from.x,y:from.y,id:1}]);for(let k=1;k<=steps;k++){await T('touchMove',[{x:from.x+(to.x-from.x)*k/steps,y:from.y+(to.y-from.y)*k/steps,id:1}]);await p.waitForTimeout(30);if(mid&&k===Math.floor(steps/2))await mid();}
 await p.waitForTimeout(60);const during=await state();await T(end,end==='touchCancel'?[]:[]);await p.waitForTimeout(400);return during;};
const results=[];const rec=(name,pass,info)=>{results.push({name,pass,info});console.log((pass?'PASS ':'FAIL ')+name+' '+JSON.stringify(info));};
const clean=async()=>{await ev("units=units.filter(u=>u.team!=='ally'||u.isCommander);gold=12;"+quiet+"0");await p.waitForTimeout(200);};
// 1 valid drop own half lane 1
await clean();let card=await cardPos(0),dst=await geo(1,.25);let s0=await state();let during=await drag(card,dst);let s1=await state();
await p.screenshot({path:S+`/shots/drag_${VW}_1.png`});
rec('gecerli_birakma',s1.ally.length>s0.ally.length&&!s1.drag&&s1.gold<s0.gold&&during.drag,{card:card.type,dst,before:s0,during:during.drag,after:s1});
// 2 drop back on hand
await clean();card=await cardPos(1);s0=await state();during=await drag(card,{x:card.x+5,y:card.y-4},4);s1=await state();
rec('ele_geri_birakma',s1.ally.length===s0.ally.length&&!s1.drag&&s1.gold===s0.gold,{s0,s1});
// 3 enemy half (x .70 no enemies)
await clean();card=await cardPos(0);dst=await geo(1,.72);s0=await state();during=await drag(card,dst);s1=await state();
rec('rakip_bolge_bos',!s1.drag,{spawned:s1.ally.length-s0.ally.length,goldDiff:s0.gold-s1.gold,s1});
// 4 insufficient energy
await clean();await ev('gold=0;0');card=await cardPos(0);dst=await geo(1,.25);s0=await state();during=await drag(card,dst);s1=await state();
rec('yetersiz_enerji',s1.ally.length===s0.ally.length&&!s1.drag,{s0,s1});
// 5 two fingers at once
await clean();const c1=await cardPos(0),c2=await cardPos(1);const d1=await geo(0,.25),d2=await geo(2,.25);s0=await state();
await T('touchStart',[{x:c1.x,y:c1.y,id:1},{x:c2.x,y:c2.y,id:2}]);for(let k=1;k<=8;k++){await T('touchMove',[{x:c1.x+(d1.x-c1.x)*k/8,y:c1.y+(d1.y-c1.y)*k/8,id:1},{x:c2.x+(d2.x-c2.x)*k/8,y:c2.y+(d2.y-c2.y)*k/8,id:2}]);await p.waitForTimeout(30);}
await T('touchEnd',[]);await p.waitForTimeout(500);s1=await state();
rec('iki_parmak',!s1.drag&&s1.ally.length-s0.ally.length<=2,{spawned:s1.ally.length-s0.ally.length,s1});
// 6 touchcancel mid drag
await clean();card=await cardPos(0);dst=await geo(1,.25);s0=await state();
await T('touchStart',[{x:card.x,y:card.y,id:1}]);for(let k=1;k<=5;k++){await T('touchMove',[{x:card.x+(dst.x-card.x)*k/8,y:card.y+(dst.y-card.y)*k/8,id:1}]);await p.waitForTimeout(30);}
const mid6=await state();await T('touchCancel',[]);await p.waitForTimeout(400);s1=await state();
rec('touchcancel',mid6.drag&&!s1.drag&&s1.ally.length===s0.ally.length,{mid:mid6.drag,s1});
// 7 hand rebuild mid-drag
await clean();card=await cardPos(0);dst=await geo(1,.25);s0=await state();
during=await drag(card,dst,8,'touchEnd',async()=>{await ev('try{renderBattleRoster()}catch(e){};0');});s1=await state();
rec('surukleme_sirasinda_el_yenilenmesi',!s1.drag&&s1.ally.length>s0.ally.length,{s1});
// 8 rapid 5 drags
await clean();await ev('gold=12;energyCap=12;0');s0=await state();let ok=0;
for(let r=0;r<5;r++){await ev('gold=12;0');const cc=await cardPos(0);const dd=await geo(r%3,.22);await drag(cc,dd,5);const st=await state();if(!st.drag)ok++;}
s1=await state();
rec('hizli_5_surukleme',ok===5&&!s1.drag,{spawned:s1.ally.length-s0.ally.length,clearStates:ok});
await p.screenshot({path:S+`/shots/drag_${VW}_end.png`});
// ghost check: any preview drawn after all
rec('hayalet_kalmadi',!(await ev('!!afBattleDragState'))&&(await ev('String(window.__afBattleGhostRenderErrors||0)'))==='0',{ghostErr:await ev('String(window.__afBattleGhostRenderErrors||0)')});
require('fs').writeFileSync(S+`/t/drag_${VW}.json`,JSON.stringify(results,null,1));
console.log(errs.slice(0,5).join('\n'));await b.close();})();
