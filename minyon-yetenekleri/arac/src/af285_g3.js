/* ======================================================================
   GRUP 3 · af37_orman_ruhu · af37_buz_sovalyesi · af37_cuce_savasci · af37_dovus_ustasi · af37_dovus_ustasi_ii
   (Orman Ruhu kullanıcının gönderdiği sarmaşık şifası görseli nedeniyle bu gruba alındı.)
   ====================================================================== */

/* ---------- 1. ORMAN RUHU · TAZE FİLİZ (destek: sarmaşıkla zamana yayılan iyileştirme) ---------- */
AF285_CONVERTED.add('af37_orman_ruhu');
AF285_DEFS.af37_orman_ruhu={
  group:3,role:'destek',status:'dönüştürüldü',name:'Taze Filiz',icon:'🌿',
  cd:8,first:1.5,wind:.5,cast:.22,hit:1,rec:.3,retarget:true,sfx:['spell','heal'],
  desc:'Canı %75’in altındaki en yaralı dostun ayağının dibinden sarmaşıklar çıkarır: dost hemen canının %4’ünü, sonra 3 sn içinde %16’sını geri kazanır. Her iyileştirme anında şifa işareti parlar. Sarmaşıklar dostun yanındaki düşmanları 1 sn yavaşlatır.',
  keep:'Eski “yaralı dostu zamana yayılarak iyileştir” kuralı korundu; artık görünür sarmaşıklarla, hazırlıklı ve bekleme süreli bir yetenek.',
  strong:'Uzun süren ön saf çatışmalarında yaralı tanka ve savaşçılara destek.',
  weak:'Ani büyük hasara yetişmez (iyileştirme 3 sn’ye yayılır); iyileştirmeyi azaltan zehir etkisini taşıyan hedefte daha az işe yarar.',
  plan(u){
    const list=[u,...af285Allies(u,.15)].filter(a=>a.hp>0&&!a.isBarrier&&a.hp<a.maxHp*.75&&!(a._af285VineEnd>elapsed))
      .sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
    const t=list[0];return t?{t,x:t.x}:null;
  },
  onWind(u,c){af285Emit('vine_sprout',u,{x0:c.x,life:this.wind+this.cast});},
  impact(u,c){
    const t=c.t&&c.t.hp>0&&units.includes(c.t)?c.t:null;if(!t)return;
    af327HealUnit(t,t.maxHp*.04,u);
    af327Timed(t,'hot','hotUntil',t.maxHp*.16/3,3);
    t._af285Vine=elapsed;t._af285VineEnd=elapsed+3;
    for(const v of af285Foes(u,t.lane,t.x,.05))af264Slow(v,1,2.5);
    af285Stat(u.heroType,'healTargets');
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:-.01*p,tau:-1+.6*p};
    if(s===AF285_CAST)return {dy:-.01,tau:.3*p};
    return {dy:-.01*(1-p),tau:.3+.7*p};
  },
  vis:{wind:'forest_call',cast:'forest_call',rec:null}
};
AF285_CUE.forest_call=function(u,p){
  const pos=af285Pos(u),px=pos.px,n=af285Lite()?5:9;
  for(let i=0;i<n;i++){
    const k=((elapsed*.9+i/n)%1),x=pos.x+Math.sin(i*2.3+elapsed*2)*px*.35,y=pos.y-k*px*1.1;
    ctx.globalAlpha=(1-k)*(.5+.5*p);ctx.fillStyle=i%2?'#b8ff6a':'#5fd35a';
    ctx.beginPath();ctx.ellipse(x,y,2.4,1.3,elapsed*3+i,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=.4*p;ctx.strokeStyle='#9cff6a';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(pos.x,pos.y+2,px*.42,px*.09,0,0,Math.PI*2);ctx.stroke();
};
function af285VineDraw(x,y,px,frame,alpha){
  const im=af285VineImg();if(!im)return false;
  const M=AF285_VINE_META,h=px*1.45,w=h;
  ctx.globalAlpha=alpha;
  ctx.drawImage(im,(frame%4)*M.fw,Math.floor(frame/4)*M.fh,M.fw,M.fh,x-w*M.center,y+2-h*M.ground,w,h);
  return true;
}
AF285_VFX.vine_sprout=function(f,p){
  const t=units.find(v=>v&&v.team===f.team&&v.lane===f.lane&&Math.abs(v.x-f.x0)<.02&&v.hp>0);
  const pos=t?af285Pos(t):af285At(f.lane,f.x0);
  af285VineDraw(pos.x,pos.y,pos.px||40,Math.min(3,Math.floor(p*4)),.95);
};
AF285_CUE.vine_heal=function(u){
  const t0=u._af285Vine,t1=u._af285VineEnd;if(!(t0>0))return;
  const pos=af285Pos(u),px=pos.px;
  let frame;
  if(elapsed>t1){const k=(elapsed-t1)/.45;if(k>=1||u.hp<=0){u._af285Vine=0;return;}frame=12+Math.min(3,Math.floor(k*4));}
  else{
    const healed=Number.isFinite(u._af285LastHp)&&u.hp>u._af285LastHp+.4;
    if(healed)u._af285HealFlash=elapsed;
    const flash=elapsed-(u._af285HealFlash||-9)<.32;
    frame=flash?8+Math.min(3,Math.floor((elapsed-u._af285HealFlash)/.08)):4+(Math.floor(elapsed*7+u.x*13)%4);
  }
  u._af285LastHp=u.hp;
  af285VineDraw(pos.x,pos.y,px,frame,.9);
};

/* ---------- 2. BUZ ŞÖVALYESİ · KAR HATTI (tank: koridor boyunca buz sırtı, yavaşlatma) ---------- */
AF285_CONVERTED.add('af37_buz_sovalyesi');
AF285_DEFS.af37_buz_sovalyesi={
  group:3,role:'tank',status:'dönüştürüldü',name:'Kar Hattı',icon:'🗡️',
  cd:10,first:2,wind:.48,cast:.34,hit:.55,rec:.3,sfx:['hit','ice'],
  desc:'Buz kılıcını yere sürter; önündeki koridor boyunca buz sırtı yükselir. Önündeki en çok 3 düşmana %40 fiziksel hasar verir, onları 1,8 sn yavaşlatır ve 2 sn saldırılarını %20 yavaşlatır.',
  keep:'Eski “canı azalınca koridordaki 3 düşmanı yavaşlat” kuralı korundu; artık tek seferlik değil, bekleme süreli ve görünür bir yetenek.',
  strong:'Ön safa yığılan yakın dövüşçüleri ve hızlı dalışçıları yavaşlatmada.',
  weak:'Yalnız öne etki eder; yavaşlatma aralığı (2,5 sn) aynı hedefi art arda kilitlemez; hazırlıkta sersemletilirse buz sırtı çıkmaz.',
  plan(u){
    const f=af285Front(u,.15);if(!f.length)return null;
    if(f.length>=2||Math.abs(f[0].x-u.x)<=unitAttackRange(u)+.03||u.hp<u.maxHp*.7)return {t:f[0],x:f[0].x};
    return null;
  },
  check(u){return af285Front(u,.16).length>0;},
  onCast(u){af285Emit('frost_ridge',u,{x1:u.x+af285Dir(u)*.15,life:this.cast+.35});af285LibEmit(u,'fx_ice_slash',u.x+af285Dir(u)*.035,u.lane,this.cast,0,2,1.5);},
  impact(u){
    const dir=af285Dir(u);
    const victims=units.filter(v=>v.team!==u.team&&v.lane===u.lane&&af285Hittable(v)&&dir*(v.x-u.x)>=-.01&&dir*(v.x-u.x)<=.155)
      .sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)).slice(0,3);
    for(const v of victims){af285Dmg(u,v,u.atk*.4,true,'#d6f3ff');af264Slow(v,1.8,2.5);if(!v.isBarrier)af327Timed(v,'tslow','tslowUntil',v.isBoss?1.08:1.2,2);
      af285LibEmit(u,'fx_ice_slash',v.x,v.lane,.8,3,11,1.45);}
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.035*af285Ease(p),dx:-.02*p,tau:-1+.9*p};
    if(s===AF285_CAST)return {dy:.04,dx:-.02+.05*p,tau:p*.5};
    return {dy:.04*(1-p),dx:.03*(1-p),tau:.5+.5*p};
  },
  vis:{wind:'frost_blade',cast:'frost_blade',rec:null}
};
AF285_VFX.frost_ridge=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px,q=af285Ease(Math.min(1,p*1.8)),fade=p>.75?1-(p-.75)/.25:1;
  const x=a.x+(b.x-a.x)*q,dir=b.x>=a.x?1:-1,n=Math.max(3,Math.round(Math.abs(x-a.x)/(px*.16)));
  ctx.globalAlpha=.4*fade;ctx.fillStyle='#d8f4ff';ctx.beginPath();ctx.ellipse((a.x+x)/2,a.y+2,Math.abs(x-a.x)/2+px*.08,px*.06,0,0,Math.PI*2);ctx.fill();
  for(let i=1;i<=n;i++){
    const k=i/n,cx=a.x+(x-a.x)*k,h=px*(.22+.2*Math.abs(Math.sin(i*2.1)))*(1-.35*k),w=px*.07;
    const g=ctx.createLinearGradient(cx,a.y-h,cx,a.y);g.addColorStop(0,'rgba(255,255,255,'+fade+')');g.addColorStop(1,'rgba(90,180,235,'+(.85*fade)+')');
    ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(cx-w,a.y+2);ctx.lineTo(cx+dir*w*.4,a.y-h);ctx.lineTo(cx+w,a.y+2);ctx.closePath();ctx.fill();
  }
  if(!af285Lite()){ctx.fillStyle='#ffffff';for(let i=0;i<6;i++){const k=((elapsed*1.3+i/6)%1);ctx.globalAlpha=(1-k)*fade*.8;ctx.beginPath();ctx.arc(a.x+(x-a.x)*((i+.5)/6),a.y-px*(.2+.6*k),1.4,0,Math.PI*2);ctx.fill();}}
};

/* ---------- 3. CÜCE SAVAŞÇI · KISA ÇEKİÇ (tank: tepe darbesi, kısa sersemletme) ---------- */
AF285_CONVERTED.add('af37_cuce_savasci');
AF285_DEFS.af37_cuce_savasci={
  group:3,role:'tank',status:'dönüştürüldü',name:'Kısa Çekiç',icon:'🔨',
  cd:7,first:1.5,wind:.42,cast:.12,hit:1,rec:.32,retarget:true,track:true,sfx:['hit','heavy'],
  desc:'Çekicini başının üstüne kaldırıp önündeki düşmana indirir: %70 fiziksel hasar verir ve 0,6 sn sersemletir (başında yıldızlar döner). Hızlı hedefleri önceler. Aynı hedef sersemlik bittikten sonra 2,5 sn yeniden sersemletilemez.',
  keep:'Eski “hızlı hedefin saldırısını geciktir” kuralı korundu; gecikme artık gerçek kısa bir sersemletmeye dönüştü.',
  strong:'Hızlı suikastçı ve dövüşçülerin saldırı ritmini bozmada.',
  weak:'Kısa menzilli ve yavaş; tek hedefe etki eder; boss’larda sersemletme süresi kısalır.',
  plan(u){
    const f=af285Front(u,unitAttackRange(u)+.02);if(!f.length)return null;
    f.sort((a,b)=>Math.abs(b.speed||0)-Math.abs(a.speed||0)||Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
    const t=f.find(v=>!((v._af285StunGate||0)>elapsed))||f[0];
    return {t,x:t.x};
  },
  impact(u,c){
    const t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:af285Front(u,unitAttackRange(u)+.03)[0];if(!t)return;
    af285Dmg(u,t,u.atk*.7,true,'#ffd9a0');
    if(af285Stun(u,t,.6))t._af285Dizzy=t.stunUntil;
    af285Emit('hammer_smash',u,{x0:t.x,life:.45});
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.02*p,dx:-.02*p,tau:-1+.95*p};
    if(s===AF285_CAST)return {dy:.03,dx:-.02+.06*p,tau:p*.4};
    return {dy:.03*(1-p),dx:.04*(1-p),tau:.4+.6*p};
  },
  vis:{wind:'hammer_raise',cast:null,rec:null}
};
AF285_CUE.hammer_raise=function(u,p){
  const pos=af285Pos(u),px=pos.px,x=pos.x-af285Dir(u)*px*.05,y=pos.y-pos.top-px*.12*p;
  ctx.globalAlpha=.5+.5*p;af327Glow(x,y,px*(.12+.12*p),'#ffcf6a',.8);
  ctx.strokeStyle='#ffe7a8';ctx.lineWidth=1.4;ctx.globalAlpha=.7*p;
  ctx.beginPath();ctx.arc(x,y,px*(.2+.06*Math.sin(elapsed*20)),Math.PI*1.1,Math.PI*1.9);ctx.stroke();
};
AF285_VFX.hammer_smash=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,a=1-p,y=c.y-px*.15;
  ctx.globalAlpha=a;ctx.strokeStyle='#ffe2a0';ctx.lineWidth=2.4;
  for(let i=0;i<8;i++){const an=-Math.PI*(.05+.9*i/7),r0=px*.1,r1=px*(.3+.45*p);ctx.beginPath();ctx.moveTo(c.x+Math.cos(an)*r0,y+Math.sin(an)*r0*.8);ctx.lineTo(c.x+Math.cos(an)*r1,y+Math.sin(an)*r1*.8);ctx.stroke();}
  ctx.globalAlpha=a*.6;ctx.fillStyle='#8c7a5c';ctx.beginPath();ctx.ellipse(c.x,c.y+2,px*(.2+.4*p),px*(.05+.04*p),0,0,Math.PI*2);ctx.fill();
  af266Fragment(c.x,c.y,Math.min(1,p*1.2),'earth',0,6,1.1);
};
AF285_CUE.dizzy=function(u){
  if(!(u._af285Dizzy>elapsed)||!((u.stunUntil||0)>elapsed))return;
  const pos=af285Pos(u),px=pos.px,cx=pos.x,cy=pos.y-pos.top-px*.08,n=3;
  for(let i=0;i<n;i++){const a=elapsed*7+i*Math.PI*2/n,x=cx+Math.cos(a)*px*.22,y=cy+Math.sin(a)*px*.06;
    ctx.globalAlpha=.95;ctx.fillStyle='#ffe066';ctx.strokeStyle='#7a5a00';ctx.lineWidth=.8;ctx.beginPath();
    for(let k=0;k<10;k++){const r=k%2?2:4.6,an=k*Math.PI/5-Math.PI/2;const X=x+Math.cos(an)*r,Y=y+Math.sin(an)*r;k?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}
    ctx.closePath();ctx.fill();ctx.stroke();}
};

/* ---------- 4. DÖVÜŞ USTASI · ASA KARŞILIĞI (hızlı savaşçı: savuşturup karşı vuruş) ---------- */
AF285_CONVERTED.add('af37_dovus_ustasi');
AF285_DEFS.af37_dovus_ustasi={
  group:3,role:'hızlı savaşçı',status:'dönüştürüldü',name:'Asa Karşılığı',icon:'🥋',
  cd:6,first:1.2,wind:.3,cast:.12,hit:1,rec:.25,retarget:true,track:true,sfx:['hit','punch'],
  desc:'Kendisine yakın dövüşle saldıran düşmanı bekler: savunma duruşunda 0,3 sn gelen hasarın %40’ını savuşturur, sonra karşı vuruşla %90 fiziksel hasar verir, geri iter ve sıradaki saldırısını 0,3 sn geciktirir.',
  keep:'Eski “yakın darbe aldıktan sonra güçlü vuruş” kuralı korundu; artık gerçek savuşturma duruşu ve görünür karşı vuruş.',
  strong:'Yakın dövüşçülere karşı birebirde; hızlı ritmiyle sık kullanır.',
  weak:'Menzilli ve büyü saldırılarına karşı tetiklenmez; canı düşük.',
  plan(u){
    const f=af285Front(u,unitAttackRange(u)+.02).filter(v=>v._afTgt===u&&!af323IsShooter(v));
    const t=f[0];return t?{t,x:t.x}:null;
  },
  onWind(u){af327Timed(u,'dr','drUntil',.40,this.wind+this.cast);},
  impact(u,c){
    const t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:af285Front(u,unitAttackRange(u)+.03)[0];if(!t)return;
    af285Dmg(u,t,u.atk*.9,true,'#ffe0b0');af285Knock(u,t,.022);af285Delay(u,t,.3);
    af285Emit('counter_strike',u,{x0:t.x,life:.4});
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.03,dx:-.03*af285Ease(p),tau:-1+.5*p};
    if(s===AF285_CAST)return {dy:.02,dx:-.03+.09*p,tau:p*.5};
    return {dy:.02*(1-p),dx:.06*(1-p),tau:.5+.5*p};
  },
  vis:{wind:'parry_stance',cast:null,rec:null}
};
AF285_CUE.parry_stance=function(u,p){
  const pos=af285Pos(u),px=pos.px,dir=af285Dir(u),cx=pos.x+dir*px*.22,cy=pos.y-pos.top*.55;
  ctx.globalAlpha=.75;ctx.strokeStyle='#fff3c4';ctx.lineWidth=2.2;
  ctx.beginPath();ctx.arc(cx,cy,px*.3,dir>0?-1.2:Math.PI-1.2+2.4*0,dir>0?1.2:Math.PI+1.2);ctx.stroke();
  ctx.globalAlpha=.35;ctx.fillStyle='#ffe9a8';ctx.beginPath();ctx.arc(cx,cy,px*.3,dir>0?-1.2:Math.PI-1.2,dir>0?1.2:Math.PI+1.2);ctx.fill();
  const flick=(elapsed*12)%1;ctx.globalAlpha=.9*(1-flick);ctx.beginPath();ctx.arc(cx,cy,px*(.3+.1*flick),dir>0?-1.2:Math.PI-1.2,dir>0?1.2:Math.PI+1.2);ctx.stroke();
};
AF285_VFX.counter_strike=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,y=c.y-px*.55,dir=f.team==='ally'?1:-1,a=1-p;
  ctx.globalAlpha=a;ctx.strokeStyle='#fff6d6';ctx.lineWidth=3*(1-p)+1;
  ctx.beginPath();ctx.arc(c.x-dir*px*.1,y,px*(.2+.25*p),-0.9,0.9);ctx.stroke();
  af327Glow(c.x,y,px*(.15+.25*(1-p)),'#ffd27a',a);
  ctx.globalAlpha=a*.8;ctx.strokeStyle='#ff9f43';ctx.lineWidth=1.5;
  for(let i=0;i<4;i++){const an=(i-1.5)*.45+(dir>0?0:Math.PI);ctx.beginPath();ctx.moveTo(c.x+Math.cos(an)*px*.12,y+Math.sin(an)*px*.12);ctx.lineTo(c.x+Math.cos(an)*px*(.3+.3*p),y+Math.sin(an)*px*(.3+.3*p));ctx.stroke();}
};

/* ---------- 5. MIZRAK USTASI · İKİNCİ BASIŞ (savaşçı: iki ayrı mızrak hamlesi) ---------- */
AF285_CONVERTED.add('af37_dovus_ustasi_ii');
AF285_DEFS.af37_dovus_ustasi_ii={
  group:3,role:'savaşçı',status:'dönüştürüldü',name:'İkinci Basış',icon:'🔱',
  cd:7,first:1.6,wind:.38,cast:.14,hit:1,rec:.28,retarget:true,track:true,sfx:['hit','thrust'],
  desc:'Mızrağını art arda iki kez saplar. Ayrı hesaplanan iki darbe %75 ve %65 fiziksel hasar verir. İkinci darbe yakın hedefi geri iter.',
  keep:'Eski “üçüncü vuruşta geri it” kuralı korundu; itme iki ayrı, hazırlıklı mızrak darbesinin ikincisinde gelir.',
  strong:'Düşmanı seri iki darbeyle geri itmede.',
  weak:'Menzili kısadır, hedef ikinci hamleden önce kaçabilir.',
  plan(u){const t=af285Front(u,unitAttackRange(u)+.015)[0];return t?{t,x:t.x}:null;},
  impact(u,c){
    const reach=unitAttackRange(u)+.03,dir=af285Dir(u);
    const t=af285ValidTarget(u,c.t,reach)?c.t:af285Front(u,reach)[0];
    if(!t)return;
    af285Dmg(u,t,u.atk*.75,true,'#f4e0c0');
    af285Emit('spear_pierce',u,{x1:t.x+dir*.012,life:.22});
    af285Later(.14,()=>{
      if(!units.includes(u)||!af285Free(u))return;
      const second=af285ValidTarget(u,t,reach)?t:af285Front(u,reach)[0];
      if(!second)return;
      u.attackPulse=Math.max(u.attackPulse||0,.24);
      af285Dmg(u,second,u.atk*.65,true,'#ffe9c7');
      af285Knock(u,second,.03);
      af285Emit('spear_pierce',u,{x1:second.x+dir*.014,life:.26});
    });
  },
  pose(s,p){
    if(s===AF285_WIND)return {dx:-.04*af285Ease(p),dy:.015*p,tau:-1+.95*p};
    if(s===AF285_CAST)return {dx:-.04+.13*p,dy:.015,tau:p*.45};
    return {dx:.09*(1-p),dy:.015*(1-p),tau:.45+.55*p};
  },
  vis:{wind:'spear_draw',cast:null,rec:null}
};
AF285_CUE.spear_draw=function(u,p){
  const pos=af285Pos(u),px=pos.px,dir=af285Dir(u),y=pos.y-pos.top*.52;
  ctx.globalAlpha=.6*p;ctx.strokeStyle='#fff0cc';ctx.lineWidth=1.2;
  for(let i=0;i<3;i++){const yy=y+(i-1)*px*.06;ctx.beginPath();ctx.moveTo(pos.x+dir*px*(.2+.1*p),yy);ctx.lineTo(pos.x+dir*px*(.55+.25*p),yy);ctx.stroke();}
  af327Glow(pos.x+dir*px*.55,y,px*.1*(.5+p),'#ffe2a0',.7*p);
};
AF285_VFX.spear_pierce=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px,y=a.y-px*.5,dir=b.x>=a.x?1:-1;
  const q=Math.min(1,p*3),x=a.x+(b.x-a.x)*q,fade=p<.4?1:1-(p-.4)/.6;
  const g=ctx.createLinearGradient(a.x,y,x,y);g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(.7,'rgba(255,240,200,'+(.7*fade)+')');g.addColorStop(1,'rgba(255,255,255,'+fade+')');
  ctx.strokeStyle=g;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x+dir*px*.25,y);ctx.lineTo(x,y);ctx.stroke();
  ctx.globalAlpha=fade;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.moveTo(x+dir*8,y);ctx.lineTo(x-dir*2,y-4);ctx.lineTo(x-dir*2,y+4);ctx.closePath();ctx.fill();
};
