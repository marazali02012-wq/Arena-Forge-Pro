const L=require('./lib.js');const S=process.argv[2];const MODE=process.argv[3];const OUTCOME=process.argv[4]||'win';
const STARTS={
 arena:`window.__AFPQueueFallbackBypass=true;startGame('arena')`,
 arena_queue:`startGame('arena')`,
 tower:`(window.__AFP171Bridge.startGame||startGame)('tower')`,
 campaign:`startGame('campaign')`,
 sky:`JSON.stringify(window.AFP36.start('sky'))`,
 flag:`JSON.stringify(window.AFP36.start('flag'))`,
 echo:`window.AFPEchoEvent&&window.AFPEchoEvent.open()`,
 secret:`JSON.stringify(window.AFPSecret.start())`,
 dark:`JSON.stringify(window.AFPDarkPass.start())`,
 colossus:`window.__AFPSStartColossusBattleV36074()`,
 bossraid:`startGame('boss')`,
};
(async()=>{
 const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/'+(process.env.STATE||'after_ftue.json')});
 const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
 const prof=`JSON.stringify({tro:profile.trophies,cr:profile.credits,xp:profile.xp,tower:profile.towerFloor,camp:(profile.afpCampaignBattle||{}).level,chests:(profile.chests||[]).length})`;
 const before=await ev(prof);
 if(process.env.UNLOCK)await ev(process.env.UNLOCK);
 console.log('start ->',await ev(STARTS[MODE]));
 await p.waitForTimeout(3500);
 // some modes open a pre-screen: click a start-like button if not playing
 for(let i=0;i<4&&!(await ev('playing'));i++){const cl=await p.evaluate(()=>{const want=/^(savaşa? ?başla|başla|savaş|meydan oku|gir|oyna|saldır|hazır)/i;const els=[...document.querySelectorAll('button,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.disabled&&getComputedStyle(e).visibility!=='hidden'});const t=els.find(e=>want.test(e.innerText.trim()));if(t){const s=t.innerText.trim().slice(0,30);t.click();return s;}return null;});console.log('prescreen click',cl);await p.waitForTimeout(3000);}
 await p.screenshot({path:S+'/shots/m_'+MODE+'_start.png'});
 const st=await ev(`JSON.stringify({playing,gameMode,enemy:enemySharedHP,ally:allySharedHP,dur:MATCH_DURATION,units:units.length,boss:units.filter(u=>u.isBoss).map(u=>u.enemyType||u.heroType)})`);
 console.log('state',st);
 if(!(await ev('playing'))){console.log('NOT_STARTED',JSON.stringify(await L.visibleTexts(p)));console.log(errs.join('\n'));await b.close();return;}
 let plays=0,rej={};const anomalies=[];
 for(let s=0;s<22;s++){
  const r=await p.evaluate(()=>{const st=AFP.state('ally');const h=(st.sides.ally.hand||[]);const out=[];for(const c of h){const r=AFP.command({side:'ally',type:'playCard',cardId:c.id,lane:Math.floor(Math.random()*3)});out.push(r.ok?'ok':r.code);if(r.ok)break;}return out;});
  r.forEach(x=>{if(x==='ok')plays++;else rej[x]=(rej[x]||0)+1;});
  const a=await ev(`JSON.stringify(units.filter(u=>!Number.isFinite(u.x)||!Number.isFinite(u.hp)||u.x<-0.3||u.x>1.3||(u.hp<=0&&!u.dead&&!u.dying&&!u._deathT&&!u.deathT)).map(u=>[u.team,u.heroType||u.enemyType,u.x,u.hp]))`);
  if(a!=='[]')anomalies.push(s+':'+a);
  await p.waitForTimeout(1000);
  if(!(await ev('playing')))break;
 }
 await p.screenshot({path:S+'/shots/m_'+MODE+'_mid.png'});
 console.log('mid',await ev(`JSON.stringify({playing,elapsed:+elapsed.toFixed(1),enemy:Math.round(enemySharedHP),ally:Math.round(allySharedHP),units:units.length,live:units.filter(u=>u.hp>0).length})`),'plays',plays,'rej',JSON.stringify(rej));
 if(anomalies.length)console.log('ANOMALIES',anomalies.slice(0,5).join(' | '));
 if(await ev('playing')){
  if(OUTCOME==='win')await ev(`enemySharedHP=0;enemyLaneHP=[0,0,0];0`);else await ev(`allySharedHP=0;allyLaneHP=[0,0,0];0`);
  for(let i=0;i<8&&(await ev('playing'));i++)await p.waitForTimeout(1000);
 }
 const endState=await ev(`JSON.stringify({playing,result:af330Match&&af330Match.result,reason:af330Match&&af330Match.reason,units:units.length})`);
 const after1=await ev(prof);
 // idempotency: call endGame again
 await ev(`try{endGame(true)}catch(e){}; try{endGame(false)}catch(e){};0`);
 await p.waitForTimeout(1500);
 const after2=await ev(prof);
 console.log('end',endState);console.log('profile before',before);console.log('profile after ',after1);console.log('after re-end ',after2, after1===after2?'IDEMPOTENT':'CHANGED!');
 await p.screenshot({path:S+'/shots/m_'+MODE+'_'+OUTCOME+'_end.png'});
 console.log('ui',JSON.stringify((await L.visibleTexts(p)).slice(0,12)));
 console.log('tickErr',await ev(`JSON.stringify((window.__arenaForgeTickErrors||[]).slice(0,3)).slice(0,600)`),'drawErr',await ev(`JSON.stringify((window.__afDrawErrors||[]).slice(0,3)).slice(0,600)`));
 console.log(errs.slice(0,10).join('\n'));
 await b.close();
})();
