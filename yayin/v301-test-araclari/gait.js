const L=require('./lib.js');const S=process.argv[2];const START=process.argv[3];const NAME=process.argv[4];
(async()=>{const {b,c,p,errs}=await L.open(740,360,{storageState:S+'/t/after_ftue.json'});
const ev=s=>p.evaluate(s=>{try{return window.__T.ev(s)}catch(e){return 'EVERR '+e.message}},s);
console.log('start',await ev(START));for(let w=0;w<20&&!(await ev('playing'));w++)await p.waitForTimeout(500);
const samples=[];let bossSeen=0;
for(let i=0;i<(+process.env.N||100);i++){
 const s=JSON.parse(await ev(`JSON.stringify({t:+elapsed.toFixed(2),playing,bosses:units.filter(u=>u.isBoss||u._af205Boss||u._afpBossArtKey).map(u=>({k:u._afpBossArtKey||u.enemyType,x:u.x,lane:u.lane,hp:Math.round(u.hp),face:u.facingDir,ph:u.phase,wp:u._afColossusWalkPhase,am:u.animMove,st:(u.stunUntil||0)>elapsed,atk:!!u._afTgt||u.attackPulse>0,y:u.y,yo:u.yOff||u.flyY||0}))})`));
 samples.push(s);if(s.bosses.length)bossSeen++;
 if(i===(+process.env.SH1||20))await p.screenshot({path:S+'/shots/gait_'+NAME+'_1.png'});
 if(i===(+process.env.SH2||60))await p.screenshot({path:S+'/shots/gait_'+NAME+'_2.png'});
 if(!s.playing)break;
 if(process.env.PLAY&&i%4===0)await p.evaluate(()=>{const st=AFP.state('ally');for(const c of (st.sides.ally.hand||[])){const r=AFP.command({side:'ally',type:'playCard',cardId:c.id,lane:Math.floor(Math.random()*3)});if(r.ok)break;}});
 await p.waitForTimeout(250);
}
// analyse
const byKey={};let slides=0,faceWrong=0,moves=0,yAnom=0;const ex=[];
for(let i=1;i<samples.length;i++){const a=samples[i-1],b2=samples[i];for(const u of b2.bosses){const o=a.bosses.find(v=>v.k===u.k&&v.lane===u.lane);if(!o)continue;const dx=u.x-o.x;
 if(Math.abs(dx)>0.002){moves++;const animAdv=(u.wp!==undefined&&u.wp!==o.wp)||(u.ph!==o.ph);if(!animAdv){slides++;ex.push('slide '+u.k+' t='+b2.t);} if(u.face&&Math.sign(dx)!==Math.sign(u.face)&&!u.st){faceWrong++;ex.push('face '+u.k+' dx='+dx.toFixed(4)+' face='+u.face+' t='+b2.t);} }
 byKey[u.k]=(byKey[u.k]||0)+1;}}
console.log(NAME,'bossSamples',bossSeen,'keys',JSON.stringify(byKey),'moves',moves,'slides',slides,'faceWrong',faceWrong);
console.log(ex.slice(0,6).join('\n'));
console.log('end',await ev(`JSON.stringify({playing,res:af330Match&&af330Match.result,why:af330Match&&af330Match.reason,t:+elapsed.toFixed(0),e:Math.round(enemySharedHP),raid:JSON.stringify(afpBossRaidState()).slice(0,200)})`));
console.log('colossusDraw',await ev(`JSON.stringify(window.__AFPColossusLastDrawV360286||null).slice(0,400)`));
console.log(errs.slice(0,5).join('\n'));await b.close();})();
