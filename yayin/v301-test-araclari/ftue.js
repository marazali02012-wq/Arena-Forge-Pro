const L=require('./lib.js');const S=process.argv[2];
(async()=>{
 const {b,c,p,errs}=await L.open(740,360);
 const ev=s=>p.evaluate(s=>window.__T.ev(s),s);
 const shot=async n=>{await p.screenshot({path:S+'/shots/f_'+n+'.png'});};
 await p.getByText('Misafir olarak oyna').first().click();
 for(let i=0;i<20;i++){await p.waitForTimeout(1500);const t=await p.getByText('AL VE SAVAŞA BAŞLA').count();if(t){await p.getByText('AL VE SAVAŞA BAŞLA').click();break;}const sk=p.getByText('ATLA ›');if(await sk.count()&&i>3){await sk.first().click().catch(()=>{});}}
 await p.waitForTimeout(4000);
 console.log('battle', await ev(`JSON.stringify({playing,gameMode,enemy:enemySharedHP,ally:allySharedHP,elapsed:+elapsed.toFixed(1),units:units.length, prof:{tro:profile.trophies,cr:profile.credits,gold:profile.gold}})`));
 // play first card through real command path
 console.log('cmd', JSON.stringify(await p.evaluate(()=>{const st=AFP.state('ally');const h=st.sides.ally.hand[0];return AFP.command({side:'ally',type:'playCard',cardId:h&&h.id,lane:1});})));
 await p.waitForTimeout(5000);
 console.log('after', await ev(`JSON.stringify({units:units.map(u=>[u.team,u.heroType||u.enemyType,u.lane,+u.x.toFixed(3),Math.round(u.hp)]),enemy:enemySharedHP})`));
 await shot('1');
 await ev(`enemySharedHP=0;enemyLaneHP=[0,0,0];enemyHP&&enemyHP.fill&&enemyHP.fill(0);0`);
 await p.waitForTimeout(3000);
 console.log('end', await ev(`JSON.stringify({playing,result:af330Match&&af330Match.result,reason:af330Match&&af330Match.reason,prof:{tro:profile.trophies,cr:profile.credits,gold:profile.gold}})`));
 await shot('2');
 console.log(JSON.stringify(await L.visibleTexts(p)));
 for(let i=0;i<6;i++){const clicked=await p.evaluate(()=>{const want=/(devam|tamam|ana üs|topla|al|kapat|geri)/i;const els=[...document.querySelectorAll('button,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.disabled&&getComputedStyle(e).visibility!=='hidden'});const t=els.find(e=>want.test(e.innerText.trim()));if(t){const s=t.innerText.trim().slice(0,30);t.click();return s;}return null;});console.log('click',clicked);await p.waitForTimeout(2500);await shot('3_'+i);if(!clicked)break;}
 console.log(JSON.stringify(await L.visibleTexts(p)));
 console.log('tickErr', await ev(`JSON.stringify(window.__arenaForgeTickErrors||[]).slice(0,800)`));
 console.log(errs.join('\n'));
 await c.storageState({path:S+'/t/after_ftue.json'});
 await b.close();
})();
