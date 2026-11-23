const L=require('./lib.js');const A=require('./audit.js');const S=process.argv[2];const VW=+process.argv[3],VH=+process.argv[4];
const SCREENS=process.argv[5].split('|');
(async()=>{const out={};
for(const name of SCREENS){const {b,c,p,errs}=await L.open(VW,VH,{storageState:S+'/t/after_ftue.json'});
 const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
 await p.waitForTimeout(1200);
 let how='';
 try{
  if(name==='ANA_US'){how='home';}
  else if(name==='SAVAS'){await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);await p.waitForTimeout(2500);how='battle';}
  else if(name==='SONUC'){await ev("window.__AFPQueueFallbackBypass=true;startGame('duel');0");for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);await p.waitForTimeout(1500);await ev('enemySharedHP=0;0');await p.waitForTimeout(3500);how='result';}
  else if(name==='GIRIS'){await c.clearCookies();await p.evaluate(()=>{sessionStorage.clear();});await p.reload();await p.waitForTimeout(3500);how='login';}
  else {const loc=p.locator('text="'+name+'" >> visible=true').first();await loc.click({timeout:4000});await p.waitForTimeout(2000);how='click';}
 }catch(e){how='ERR '+e.message.split('\n')[0].slice(0,100);}
 const f=S+'/shots/res_'+VW+'x'+VH+'_'+name.replace(/[^A-Za-z0-9ÇĞİÖŞÜçğıöşü]/g,'_')+'.png';await p.screenshot({path:f});
 const a=await p.evaluate(`(${A.toString()})()`);
 out[name]={how,n:a.n,issues:a.issues,errs:errs.slice(0,3)};
 console.log(name,how,'interactive='+a.n,'issues='+a.issues.length,JSON.stringify(a.issues.slice(0,6)).slice(0,700));
 await b.close();}
require('fs').writeFileSync(S+'/t/res_'+VW+'x'+VH+'_'+process.argv[6]+'.json',JSON.stringify(out,null,1));})();
