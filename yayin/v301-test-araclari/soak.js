const L=require('./lib.js');const S=process.argv[2];
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
const cdp=await c.newCDPSession(p);await cdp.send('HeapProfiler.enable');
const heap=async()=>{await cdp.send('HeapProfiler.collectGarbage');const m=await cdp.send('Runtime.getHeapUsage');return Math.round(m.usedSize/1048576)};
const fps=async()=>p.evaluate(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r(Math.round(n/2))};requestAnimationFrame(f);}));
console.log('heap start MB',await heap());
const modes=['arena','tower','campaign','sky','duel','arena'];
for(let m=0;m<modes.length;m++){
 await ev(`window.__AFPQueueFallbackBypass=true;startGame('${modes[m]}');0`);for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);
 let f=0;for(let s=0;s<20;s++){await p.evaluate(()=>{const st=AFP.state('ally');for(const c of (st.sides.ally.hand||[])){const r=AFP.command({side:'ally',type:'playCard',cardId:c.id,lane:Math.floor(Math.random()*3)});if(r.ok)break;}});if(s===10)f=await fps();else await p.waitForTimeout(1000);}
 if(m===2){ // background / foreground mid-battle
   const t0=await ev('elapsed');await cdp.send('Page.setWebLifecycleState',{state:'frozen'});await new Promise(r=>setTimeout(r,4000));await cdp.send('Page.setWebLifecycleState',{state:'active'});await p.waitForTimeout(2000);
   console.log('  bg/fg: elapsed',(+t0).toFixed(1),'->',(+await ev('elapsed')).toFixed(1),'playing',await ev('playing'),'units',await ev('units.length'));}
 const st=await ev(`JSON.stringify({units:units.length,particles:particles.length,shots:shots.length,texts:combatTexts.length,fallen:fallenUnits.length})`);
 await ev('enemySharedHP=0;0');for(let w=0;w<8&&(await ev('playing'));w++)await p.waitForTimeout(700);
 // go back to home via DEVAM
 await p.evaluate(()=>{for(const e of document.querySelectorAll('button')){if(/DEVAM/.test(e.innerText)&&e.offsetParent){e.click();break;}}});await p.waitForTimeout(1500);
 console.log('match',m+1,modes[m],'fps',f,'state',st,'heap MB',await heap(),'result',await ev('af330Match&&af330Match.result'));
}
console.log('tickErr',await ev('String(window.__arenaForgeTickErrors||0)'),'drawErr',await ev('JSON.stringify((window.__afDrawErrors||[]).length||0)'));
console.log(errs.slice(0,6).join('\n'));await b.close();})();
