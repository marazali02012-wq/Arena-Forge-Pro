const L=require('./lib.js');const S=process.argv[2];
(async()=>{
 const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
 const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
 const stage=()=>p.evaluate(()=>JSON.stringify(window.AFPEchoEvent&&window.AFPEchoEvent.status&&window.AFPEchoEvent.status()));
 console.log('stage before',await stage(), await ev('profile.credits'));
 await p.evaluate(()=>window.AFPEchoEvent.open());await p.waitForTimeout(2500);
 await p.getByText('SAVAŞA BAŞLA').first().click();await p.waitForTimeout(3000);
 await p.evaluate(()=>{const st=AFP.state('ally');AFP.command({side:'ally',type:'playCard',cardId:st.sides.ally.hand[0].id,lane:1});});
 for(let i=0;i<120;i++){
  const s=await ev(`JSON.stringify({playing,paused:battlePaused,wave:af203Run&&af203Run.wave,ws:af203Run&&af203Run.waveSpawn,boss:af203Run&&af203Run.bossSpawned,bd:af203Run&&af203Run.bossDefeated,choice:af203Run&&af203Run.pausedForChoice,alive:af203Run?af203Run.tracked.filter(t=>!t.done).length:0,res:af330Match&&af330Match.result})`);
  if(i%5===0)console.log(i,s);
  const o=JSON.parse(s); if(!o.playing){console.log('ENDED',s);break;}
  if(o.choice){await p.screenshot({path:S+'/shots/echo_choice.png'});const cl=await p.evaluate(()=>{const els=[...document.querySelectorAll('button,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.disabled&&getComputedStyle(e).visibility!=='hidden'});const t=els.find(e=>/seç|al|güçlendir/i.test(e.innerText))||els.find(e=>e.closest('[id*=echo],[class*=echo],[id*=af203],[class*=af203]'));if(t){t.click();return t.innerText.slice(0,40)}return els.map(e=>e.innerText.slice(0,20)).join('|')});console.log('choice click',cl);}
  if(o.boss&&!o.bd&&i%5===2)await p.screenshot({path:S+'/shots/echo_boss.png'});
  await ev(`af203Run&&af203Run.tracked.filter(t=>!t.done&&t.unit.hp>0).forEach(t=>{t.unit.x=Math.min(t.unit.x,.8);af327DealDamage(t.unit,99999,{team:'ally',kind:'spell'})});0`);
  await p.waitForTimeout(1000);
 }
 const ui=await L.visibleTexts(p);await p.screenshot({path:S+'/shots/echo_end.png'});
 console.log('result',await ev(`JSON.stringify({playing,res:af330Match&&af330Match.result,reason:af330Match&&af330Match.reason,cr:profile.credits})`));
 console.log('stage after',await stage());
 console.log('ui',JSON.stringify(ui.slice(0,8)));
 console.log(errs.slice(0,8).join('\n'));await b.close();
})();
