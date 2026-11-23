const L=require('./lib.js');const S=process.argv[2];
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
const t0=Date.now();
await p.locator('text="ARENA" >> visible=true').first().click();await p.waitForTimeout(2000);
await p.screenshot({path:S+'/shots/q_0_arena.png'});
console.log('after ARENA click',JSON.stringify((await L.visibleTexts(p)).slice(0,10)));
// press SAVAŞ if present
const sv=p.locator('text="SAVAŞ" >> visible=true');if(await sv.count()){await sv.first().click().catch(e=>console.log('savaş click err',e.message.slice(0,80)));}
await p.waitForTimeout(1500);{const sb=p.locator('text=SAVAŞA BAŞLA >> visible=true');console.log('savasa basla count',await sb.count());if(await sb.count())await sb.first().click();}
let shot=0;
for(let i=0;i<28;i++){await p.waitForTimeout(5000);
 const st=await ev(`JSON.stringify({sec:Math.round(${'(Date.now()-'+t0+')/1000'}),playing,mode:gameMode,ctx:window.__AFPOnlineContext?{active:window.__AFPOnlineContext.active,localBot:window.__AFPOnlineContext.localBot,role:window.__AFPOnlineContext.role}:null,opp:window.__AFPMatchOpponent?String(window.__AFPMatchOpponent).slice(0,40):null,disg:!!window.__AFPDisguisedArena})`);
 const q=await p.evaluate(()=>{const out=[];const walk=r=>{for(const e of r.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);if(/rakip|eşleş|aranıyor|bot|bekle/i.test(e.textContent||'')&&e.children.length===0&&e.getBoundingClientRect().width>0)out.push(e.textContent.trim().slice(0,60));}};walk(document);return [...new Set(out)].slice(0,4).join(' / ');});
 console.log(st,'| queueUI:',q);
 if((i===2||i===12||JSON.parse(st).playing)&&shot<4){await p.screenshot({path:S+'/shots/q_'+(++shot)+'.png'});}
 if(JSON.parse(st).playing){await p.waitForTimeout(3000);console.log('battle state',await ev(`JSON.stringify({enemyName:(document.getElementById('enemyPlayerName')||{}).textContent,units:units.length,res:af330Match&&af330Match.result})`));break;}
}
console.log(errs.slice(0,6).join('\n'));await b.close();})();
