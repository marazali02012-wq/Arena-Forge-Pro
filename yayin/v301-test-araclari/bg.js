const L=require('./lib.js');const S=process.argv[2];
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
await ev("window.__AFPQueueFallbackBypass=true;startGame('tower');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);await p.waitForTimeout(3000);
const before=JSON.parse(await ev(`JSON.stringify({t:+elapsed.toFixed(2),paused:battlePaused,saved:localStorage.getItem('arenaForgeProProfileV19').length})`));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
await p.waitForTimeout(5000);
const hidden=JSON.parse(await ev(`JSON.stringify({t:+elapsed.toFixed(2),paused:battlePaused,playing})`));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});document.dispatchEvent(new Event('visibilitychange'));});
await p.waitForTimeout(1500);await p.screenshot({path:S+'/shots/bg_return.png'});
const back=JSON.parse(await ev(`JSON.stringify({t:+elapsed.toFixed(2),paused:battlePaused,playing,overlay:!document.getElementById('af274Pause').hidden})`));
// resume via the pause overlay's continue button
const txt=await p.evaluate(()=>{const o=document.getElementById('af274Pause');return o?[...o.querySelectorAll('button')].map(b=>b.innerText.trim()).join('|'):''});
await p.evaluate(()=>{const o=document.getElementById('af274Pause');const bt=[...o.querySelectorAll('button')].find(b=>/devam|sürdür/i.test(b.innerText));bt&&bt.click();});
await p.waitForTimeout(2000);
const resumed=JSON.parse(await ev(`JSON.stringify({t:+elapsed.toFixed(2),paused:battlePaused,playing})`));
console.log('before',JSON.stringify(before),'\nhidden 5s',JSON.stringify(hidden),'\nback',JSON.stringify(back),'buttons:',txt,'\nresumed',JSON.stringify(resumed));
console.log(errs.slice(0,5).join('\n'));await b.close();})();
