/* Arena Forge Pro v3.60.286 — tüm bosslar için yürüyüş / zemin / yön / animasyon geçiş testi.
   Kullanım: node boss_gait_test.js <html> <çıktı_klasörü> [genişlikxyükseklik,...]
   Oyunu başsız Chromium'da açar, misafir girişi yapar, bir savaş başlatır, sonra window.__AFPBossGaitQA.lab ile
   savaş döngüsünü duraklatıp her bossu gerçek draw() ile kare kare çizer ve ölçer. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const file=process.argv[2],outDir=process.argv[3]||'out';
const sizes=(process.argv[4]||'740x360,667x375,800x360').split(',').map(s=>s.split('x').map(Number));
const BOSSES0=[
 ['boss.ancient_giant','Kadim Dev','Sefer/Kule/Gökyüzü/Lonca (warden)'],
 ['boss.death_lord','Ölüm Lordu','Sefer/Kule/Gökyüzü/Lonca (executioner)'],
 ['boss.forest_guardian','Orman Koruyucusu','Sefer/Kule/Gökyüzü/Lonca (mender)'],
 ['boss.infernal_behemoth','Cehennem Behemotu','Sefer/Kule/Gökyüzü/Lonca (berserker)'],
 ['boss.shadow_stalker','Gölge Avcısı','Sefer/Kule/Gökyüzü/Lonca (stalker)'],
 ['boss.lava_dragon','Lav Ejderhası','Sefer/Kule/Gökyüzü/Lonca (siege)'],
 ['boss.storm_dragon','Fırtına Ejderi','Sefer/Kule/Gökyüzü/Lonca (storm)'],
 ['boss.venom_hydra','Zehir Hidrası','Sefer/Kule/Gökyüzü/Lonca (venom)'],
 ['boss.spider_queen','Örümcek Kraliçe','Örümcek Akını'],
 ['afp263:boss_kullerin_hukumdari','Küllerin Hükümdarı','Karanlık Geçit'],
 ['afp263:boss_ucurum_ejderi','Uçurum Ejderi','Karanlık Geçit'],
 ['afp263:boss_bosluk_imparatoru','Boşluk İmparatoru','Karanlık Geçit'],
 ['colossus.stone_golem','Taş Kolosus','Kristal Kolos'],
 ['echo.mirror_executioner','Ayna Celladı','Yankı İstilası']
];
const BOSSES=process.env.BOSSES?BOSSES0.filter(b=>process.env.BOSSES.split(',').includes(b[0])):BOSSES0;
const GROUND_TOL=3.0;
async function bootPage(b,w,h){
 const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,300)));
 await p.goto('file://'+path.resolve(file));await p.waitForTimeout(6000);
 const g=p.getByText('Misafir olarak',{exact:false});if(await g.count())await g.first().click().catch(()=>{});
 await p.waitForTimeout(2500);
 await p.evaluate(()=>window.startGame('sky'));await p.waitForTimeout(2500);
 for(let i=0;i<30;i++){const ok=await p.evaluate(()=>Object.values(__AFPBossGaitQA.ready()).every(Boolean));if(ok)break;await p.waitForTimeout(500);}
 return {p,ctx,errs};
}
async function grab(p,key,tag,dir,boxW){
 const d=await p.evaluate(([w])=>{const L=__AFPBossGaitQA.lab,u=L.unit(0),c=document.getElementById('game');
   const s=c.width/__AFPBossGaitQA.status().W;const v=u&&u._vis;const cx=v?v.x:c.width/s/2,cy=v?v.y:c.height/s/2;
   const o=document.createElement('canvas');o.width=Math.round(w*s);o.height=Math.round(w*.8*s);const g=o.getContext('2d');
   g.drawImage(c,Math.round((cx-w/2)*s),Math.round((cy-w*.68)*s),o.width,o.height,0,0,o.width,o.height);
   g.strokeStyle='rgba(0,255,90,.9)';g.lineWidth=1;g.beginPath();g.moveTo(0,Math.round(w*.68*s)+.5);g.lineTo(o.width,Math.round(w*.68*s)+.5);g.stroke();
   return o.toDataURL('image/png');},[boxW]);
 const f=path.join(dir,key.replace(/[:.]/g,'_')+'__'+tag+'.png');fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));return f;
}
function feetLift(r,base){return (r.feet||[]).map((f,j)=>base[j]-f[1]);}
(async()=>{
 fs.mkdirSync(outDir,{recursive:true});const shotDir=path.join(outDir,'shots');fs.mkdirSync(shotDir,{recursive:true});
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 const results=[];
 for(const [w,h] of sizes){
  const {p,ctx,errs}=await bootPage(b,w,h);
  for(const [key,name,modes] of BOSSES){
   for(const team of ['enemy','ally']){
    const res={key,name,modes,team,res:w+'x'+h,checks:{},notes:[]};
    try{
     const teamDir=team==='ally'?1:-1;
     await p.evaluate(([key,team])=>{const L=__AFPBossGaitQA.lab;L.begin();L.clear();L.mode(key==='boss.spider_queen'?'boss':'sky');L.spawn({key,team,lane:1,x:team==='enemy'?.70:.30});L.step(2,1/60);},[key,team]);
     await p.waitForTimeout(600);
     // 1) doğma ve zemine yerleşme
     const spawn=await p.evaluate(()=>__AFPBossGaitQA.lab.step(30,1/60,{i:0}));
     if(team==='enemy'&&w===740)res.shots={spawn:await grab(p,key,'1_spawn',shotDir,170)};
     // 2) yürüme (KIRMIZI sola, MAVİ sağa)
     await p.evaluate(()=>__AFPBossGaitQA.lab.set(0,{__walk:true}));
     const walk=await p.evaluate(()=>__AFPBossGaitQA.lab.step(100,1/60,{i:0}));
     if(team==='enemy'&&w===740)res.shots.walk=await grab(p,key,'2_walk',shotDir,170);
     // 3) durma
     await p.evaluate(()=>__AFPBossGaitQA.lab.set(0,{__walk:false}));
     const stop=await p.evaluate(()=>__AFPBossGaitQA.lab.step(70,1/60,{i:0}));
     if(team==='enemy'&&w===740)res.shots.stop=await grab(p,key,'3_stop',shotDir,170);
     // 4) arkadaki hedefe dönme ve saldırma
     const behind=await p.evaluate(([team])=>{const L=__AFPBossGaitQA.lab,u=L.unit(0);const j=L.dummy({team:team==='enemy'?'ally':'enemy',lane:1,x:u.x+(team==='enemy'?.12:-.12)});L.set(0,{_afTgt:j,_afEng:1});return j;},[team]);
     const turn=await p.evaluate(()=>__AFPBossGaitQA.lab.step(20,1/60,{i:0}));
     const atk=[];for(let k=0;k<3;k++){await p.evaluate(([j])=>__AFPBossGaitQA.lab.attack(0,j),[behind]);atk.push(...await p.evaluate(()=>__AFPBossGaitQA.lab.step(14,1/60,{i:0})));
       if(k===0&&team==='enemy'&&w===740)res.shots.attack=await grab(p,key,'4_attack',shotDir,170);}
     // hedef kalkınca takım yönüne geri dönüş
     await p.evaluate(()=>{const L=__AFPBossGaitQA.lab;L.set(0,{_afTgt:null,_afEng:0});});
     const back=await p.evaluate(()=>__AFPBossGaitQA.lab.step(24,1/60,{i:0}));
     await p.evaluate(()=>__AFPBossGaitQA.lab.step(50,1/60));
     // 5) hasar
     await p.evaluate(()=>__AFPBossGaitQA.lab.hurt(0));
     const hurt=await p.evaluate(()=>__AFPBossGaitQA.lab.step(8,1/60,{i:0}));
     if(team==='enemy'&&w===740)res.shots.hurt=await grab(p,key,'5_hurt',shotDir,170);
     await p.evaluate(()=>__AFPBossGaitQA.lab.step(30,1/60));
     // 6) ölüm ve sahneden kaybolma
     await p.evaluate(()=>{const L=__AFPBossGaitQA.lab;for(let i=L._r.length-1;i>0;i--)L.remove(i);L.step(1,1/60);});
     const kill=await p.evaluate(()=>{const L=__AFPBossGaitQA.lab;L.mode('sky'); /* ölüm çizimi nötr modda: sahte 'boss' modunda oyunun zafer akışı sahneyi temizliyor */return L.kill(0);});
     const deathSeq=[];for(let k=0;k<14;k++){deathSeq.push(await p.evaluate(()=>{const L=__AFPBossGaitQA.lab;L.step(10,1/60);return {fallen:L.fallen(),af263:L.af263Deaths()};}));
       if(k===2&&team==='enemy'&&w===740)res.shots.death=await grab(p,key,'6_death',shotDir,170);}
     // ---------- değerlendirme ----------
     const all=[...spawn,...walk,...stop,...turn,...atk,...back,...hurt].filter(Boolean);
     const types=new Set(all.map(r=>r.type).filter(Boolean));const kind=types.has('mesh')?'mesh':types.has('hero-mesh')?'hero-mesh':types.has('colossus')?'colossus':types.has('atlas')?'atlas':'none';res.render=[...types].join('+');
     const ph={spawn,walk,stop,turn,atk,back,hurt};res.groundByPhase=Object.fromEntries(Object.entries(ph).map(([k,a])=>{const e=a.filter(r=>r&&r.low!=null).map(r=>r.low-r.ground);return [k,e.length?[+Math.min(...e).toFixed(2),+Math.max(...e).toFixed(2)]:null];}));
     // en alt opak nokta: zeminin altına, görselin kendi çizimindeki ön-uzantı payından (r.overhang: ör. öne uzanan kılıç ucu) fazla inemez
     const gErr=all.filter(r=>r.low!=null&&r.ground!=null).map(r=>{const e=r.low-r.ground,oh=r.overhang||0;return e>0?Math.max(0,e-oh):e;});
     const gmax=gErr.length?Math.max(...gErr.map(Math.abs)):null;
     // uzuv tabanı teması: her karede en az bir ayak/pati tabanı zemine değmeli (baş/kanat/silah yere değip ayaklar havada kalamaz)
     const soleGap=all.filter(r=>r.soles&&r.soles.some(v=>v!=null)).map(r=>Math.min(...r.soles.filter(v=>v!=null).map(v=>Math.abs(r.ground-v))));
     const smax=soleGap.length?Math.max(...soleGap):null;res.checks.feetContact={pass:smax===null||smax<=1.5,maxGapPx:smax==null?null:+smax.toFixed(2),samples:soleGap.length};
     res.checks.ground={pass:gErr.length>20&&gmax<=GROUND_TOL,maxErrPx:gmax==null?null:+gmax.toFixed(2),above:gErr.length?+(-Math.min(...gErr)).toFixed(2):null,below:gErr.length?+Math.max(...gErr).toFixed(2):null,samples:gErr.length};
     // yön
     const facingWalk=walk.slice(10).every(r=>r.fsv===teamDir&&(r.natF==null||r.flip===r.fsv*r.natF||kind==='colossus'&&r.flip===-r.fsv));
     const turnOk=turn.slice(-5).every(r=>r.fsv===-teamDir);
     const atkFace=atk.every(r=>r.fsv===-teamDir);
     const backOk=back.slice(-5).every(r=>r.fsv===teamDir);
     res.checks.facing={pass:facingWalk&&turnOk&&atkFace&&backOk,walk:facingWalk,turnToTarget:turnOk,attackFacesTarget:atkFace,returnsToTeamDir:backOk};
     // yürüyüş
     const dx=(walk[walk.length-1].x-walk[0].x);const movedOk=Math.sign(dx)===teamDir&&Math.abs(dx)>.02;
     let gait={};
     if(kind==='mesh'||kind==='hero-mesh'){
      const late=walk.slice(25).filter(r=>r.type==='mesh'||r.type==='hero-mesh');const wWok=late.length>40&&late.every(r=>r.wW>.5);
      // faz: AF321 adım fazından her uzvun basma/salınım durumu. Salınımda taban 1.5 px'ten fazla kalkmalı; basarken
      // taban zeminde (<.75 px) ve ekran x'i sabit kalmalı (kayma yok). Hiçbir karede tüm uzuvlar havada olmamalı.
      const nl=late.length?late[0].soles.length:0;
      const st=late.map(r=>r.soles.map(v=>v==null?null:r.ground-v));
      const lifted=[...Array(nl)].map((_,j)=>late.filter((r,i)=>!r.stance[j]&&st[i][j]!=null&&st[i][j]>1.5).length);
      const allUp=st.filter(a=>a.every(v=>v==null||v>.75)).length;
      const alt=lifted.filter(n=>n>=3).length>=Math.min(nl,nl===2?2:3)&&late.every(r=>r.stance.some(Boolean));
      let slide=0,ns=0;for(let i=1;i<late.length;i++)for(let j=0;j<nl;j++){if(late[i-1].stance[j]&&late[i].stance[j]){slide=Math.max(slide,Math.abs(late[i].limbX[j]-late[i-1].limbX[j]));ns++;}}
      const ph=new Set(late.map(r=>Math.round(r.p*20))).size;
      gait={pass:movedOk&&wWok&&alt&&allUp===0&&slide<1.0&&ph>5,moved:movedOk,walkWeight:wWok,alternatingFeet:alt,liftedFramesPerLimb:lifted,framesAllLimbsUp:allUp,plantedSlideMaxPx:+slide.toFixed(2),plantedSamples:ns,phaseSteps:ph};
      if(key.startsWith('afp263:'))gait.walkState=[...new Set(walk.slice(25).map(r=>r.type))].join('/');
     }else if(kind==='colossus'){
      const late=walk.slice(10);const ws=late.filter(r=>r.state==='walk').length,fr=new Set(late.map(r=>r.frame)).size;
      gait={pass:movedOk&&ws>=late.length*.9&&fr>=4,moved:movedOk,walkStateFrames:ws+'/'+late.length,distinctFrames:fr};
     }else if(kind==='atlas'){
      gait={pass:movedOk,moved:movedOk,hover:true,note:'Bacaksız, rün dairesi üzerinde süzülen büyücü: adım animasyonu yok (çizim böyle tasarlanmış)'};
     }else gait={pass:false,note:'çizim yolu ölçülemedi'};
     res.checks.walk=gait;
     // durma -> bekleme
     const s=stop.slice(-10);
     const idleOk=kind==='colossus'?s.every(r=>r.state==='idle'):kind==='atlas'?s.every(r=>r.state==='idle'):s.every(r=>(r.wW??0)<.12&&(r.type!=='atlas'||r.state==='idle'));
     const idleStill=Math.abs(stop[stop.length-1].x-stop[0].x)<1e-9;
     res.checks.idle={pass:idleOk&&idleStill,idle:idleOk,still:idleStill};
     // saldırı
     const atkOk=kind==='colossus'?atk.some(r=>r.state==='attack'):atk.some(r=>r.tau!=null||r.state==='attack');
     res.checks.attack={pass:atkOk,seen:atkOk};
     const hurtOk=hurt.some(r=>r.state==='hurt'||(r.hurt||0)>0);
     res.checks.hurt={pass:hurtOk,seen:hurtOk};
     // ölüm
     const first=deathSeq[0],last=deathSeq[deathSeq.length-1];
     let deathOk,dn={};
     if(kind==='colossus'){deathOk=first.fallen.some(f=>f.colossus)&&last.fallen.length===0;dn={own:'colossus death atlas'};}
     else if(key.startsWith('afp263:')){deathOk=first.af263>0&&first.fallen.every(f=>f.bossRig)&&last.af263===0&&last.fallen.length===0;dn={own:'kendi ölüm atlası',stand_in:first.fallen.filter(f=>!f.bossRig).map(f=>f.refKind)};}
     else if(key==='echo.mirror_executioner'){deathOk=first.fallen.length>0&&last.fallen.length===0;dn={own:'kahraman iskeleti'};}
     else{deathOk=first.fallen.length>0&&first.fallen.every(f=>f.bossRig&&f.kind)&&last.fallen.length===0;dn={own:first.fallen.map(f=>f.kind).join(','),stand_in:first.fallen.filter(f=>!f.bossRig).map(f=>f.refKind)};}
     res.checks.death=Object.assign({pass:!!deathOk,killed:kill,gone:last.fallen.length===0,first:first.fallen,firstAf263:first.af263},dn);
     res.result=Object.values(res.checks).every(c=>c.pass)?'GEÇTİ':'KALDI';
    }catch(e){res.result='TEST EDİLEMEDİ';res.error=String(e).slice(0,300);}
    await p.evaluate(()=>{try{__AFPBossGaitQA.lab.clear();}catch(_){}});
    results.push(res);process.stdout.write(`${res.res} ${team.padEnd(5)} ${key.padEnd(34)} ${res.result} ${JSON.stringify(res.groundByPhase)} ${res.result!=='GEÇTİ'?JSON.stringify(Object.fromEntries(Object.entries(res.checks).filter(([k,v])=>!v.pass))).slice(0,400):''}\n`);
   }
  }
  await p.evaluate(()=>__AFPBossGaitQA.lab.end());
  results.push({res:w+'x'+h,pageErrors:errs.slice(0,20)});
  await ctx.close();
 }
 fs.writeFileSync(path.join(outDir,'boss_gait_results.json'),JSON.stringify(results,null,1));
 const runs=results.filter(r=>r.key);console.log('TOPLAM',runs.length,'GEÇTİ',runs.filter(r=>r.result==='GEÇTİ').length,'KALDI',runs.filter(r=>r.result==='KALDI').length,'TEST EDİLEMEDİ',runs.filter(r=>r.result==='TEST EDİLEMEDİ').length);
 await b.close();
})();
