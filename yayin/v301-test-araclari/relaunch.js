const L=require('./lib.js');const S=process.argv[2];
(async()=>{
 const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
 const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
 await p.screenshot({path:S+'/shots/r_0.png'});
 console.log('texts0',JSON.stringify(await L.visibleTexts(p)));
 console.log('ls keys', await p.evaluate(()=>Object.keys(localStorage).filter(k=>/profile|Profile|afp|arena/i.test(k)).map(k=>k+':'+localStorage.getItem(k).length).join(' ')));
 console.log('profile(before entry)',await ev(`JSON.stringify({cr:profile.credits,tro:profile.trophies,deck:(profile.deck||[]).length,ftue:!!profile.afpFtueDone})`));
 const g=p.getByText('Misafir olarak oyna');if(await g.count()){await g.first().click();}
 await p.waitForTimeout(4000);await p.screenshot({path:S+'/shots/r_1.png'});
 console.log('profile(after entry)',await ev(`JSON.stringify({cr:profile.credits,tro:profile.trophies})`));
 console.log('texts1',JSON.stringify(await L.visibleTexts(p)));
 console.log(errs.slice(0,8).join('\n'));await b.close();
})();
