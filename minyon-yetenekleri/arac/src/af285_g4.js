/* ======================================================================
   GRUP 4 · af37_elit_kadin_savasci · af37_golge_avcisi · af37_golge_buyucusu · af37_golge_suikastci · af37_isik_sifacisi
   (Gölge Suikastçı ve Işık Şifacısı kullanıcının efekt kütüphanesindeki gölge X kesiği ve altın ışık görsellerini kullanır.)
   ====================================================================== */

/* ---------- 1. ELİT KADIN SAVAŞÇI · ORAK GEÇİDİ (savaşçı: önündeki gruba geniş savuruş) ---------- */
AF285_CONVERTED.add('af37_elit_kadin_savasci');
AF285_DEFS.af37_elit_kadin_savasci={
  group:4,role:'savaşçı',status:'dönüştürüldü',name:'Orak Geçidi',icon:'🪓',
  cd:7,first:1.4,wind:.38,cast:.16,hit:1,rec:.28,sfx:['hit','slash'],
  desc:'Baltasını omzunun arkasına çekip yay çizerek savurur: önündeki en çok 3 düşmana %65 fiziksel hasar verir ve onları hafifçe geri iter.',
  keep:'Eski “hedefin yanındakilere savurma hasarı” kuralı korundu; artık hazırlıklı, görünür ve tüm ön gruba uzanan bir savuruş.',
  strong:'Önüne yığılan sürülere ve yan yana gelen hafif birliklere karşı.',
  weak:'Yalnız yakın öne etki eder; menzilliler ve tek dayanıklı hedef karşısında zayıf kalır.',
  plan(u){const f=af285Front(u,unitAttackRange(u)+.03);if(!f.length)return null;return {t:f[0],x:f[0].x};},
  check(u){return af285Front(u,unitAttackRange(u)+.045).length>0;},
  impact(u){
    const dir=af285Dir(u);
    const victims=units.filter(v=>v.team!==u.team&&v.lane===u.lane&&af285Hittable(v)&&dir*(v.x-u.x)>=-.01&&dir*(v.x-u.x)<=.085)
      .sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)).slice(0,3);
    for(const v of victims){af285Dmg(u,v,u.atk*.65,true,'#ffe2b0');af285Knock(u,v,.016);}
    af285Emit('scythe_arc',u,{x1:u.x+dir*.07,life:.42});
  },
  pose(s,p){
    if(s===AF285_WIND)return {dx:-.025*af285Ease(p),dy:.02*p,tau:-1+.95*p};
    if(s===AF285_CAST)return {dx:-.025+.08*p,dy:.02,tau:p*.55};
    return {dx:.055*(1-p),dy:.02*(1-p),tau:.55+.45*p};
  },
  vis:{wind:'axe_wind',cast:null,rec:null}
};
AF285_CUE.axe_wind=function(u,p){
  const pos=af285Pos(u),px=pos.px,dir=af285Dir(u),cx=pos.x-dir*px*.1,cy=pos.y-pos.top*.62;
  ctx.globalAlpha=.25+.5*p;ctx.strokeStyle='#ffe7b5';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(cx,cy,px*(.32+.06*p),dir>0?Math.PI*.6:Math.PI*.4-Math.PI*.0,dir>0?Math.PI*1.35:-Math.PI*.35,dir<0);ctx.stroke();
  af327Glow(cx-dir*px*.25,cy-px*.18,px*.1*(.5+p),'#ffd27a',.6*p);
};
AF285_VFX.scythe_arc=function(f,p){
  const a=af285At(f.lane,f.x0),px=a.px,dir=f.team==='ally'?1:-1,cx=a.x+dir*px*.25,cy=a.y-px*.45,fade=1-p;
  const r=px*(.45+.2*p),s0=dir>0?-1.35:Math.PI+1.35,s1=dir>0?1.1:Math.PI-1.1;
  for(let k=0;k<3;k++){ctx.globalAlpha=fade*(.9-k*.25);ctx.strokeStyle=k?'#ffb84d':'#fff6dc';ctx.lineWidth=(5-k*1.5)*(1-p*.6);
    ctx.beginPath();ctx.ellipse(cx-dir*k*3,cy,r*(1-k*.08),r*.62,0,s0,s1,dir<0);ctx.stroke();}
};

/* ---------- 2. GÖLGE AVCI · YARANIN PEŞİNDE (suikastçı: yaralı hedefe atılma, infaz + can çalma) ---------- */
AF285_CONVERTED.add('af37_golge_avcisi');
AF285_DEFS.af37_golge_avcisi={
  group:4,role:'suikastçı',status:'dönüştürüldü',name:'Yaranın Peşinde',icon:'🗡️',
  cd:8,first:1.6,wind:.34,cast:.18,hit:1,rec:.26,retarget:true,track:true,sfx:['hit','stab'],
  desc:'Menzilindeki en yaralı düşmanı seçer, gölgeye çömelip ona atılır: %110 fiziksel hasar verir. Hedefin canı %40’ın altındaysa hasar %60 artar ve verdiği hasarın %45’i kadar iyileşir.',
  keep:'Eski “canı azalan rakibe vurunca can çal” kuralı korundu; artık hazırlıklı bir atılma ve görünür infaz.',
  strong:'Yaralı destek ve menzilli birlikleri bitirmede; savaşın ortasında kalan zayıf hedeflerde.',
  weak:'Canı düşük; dayanıklı tam canlı hedefte infaz bonusu yoktur; atılma mesafesi kısadır (en çok ~0,14).',
  plan(u){
    const list=af285Front(u,Math.max(.14,unitAttackRange(u)+.02));if(!list.length)return null;
    list.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp)||Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
    const t=list[0];return {t,x:t.x};
  },
  impact(u,c){
    const dir=af285Dir(u),t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:null;if(!t)return;
    const from=u.x,gap=Math.max(.03,(requiredUnitGap(u,t,u.lane)||.03)*.9);
    u.x=Math.max(.035,Math.min(.965,t.x-dir*gap));
    const exec=t.hp<t.maxHp*.4,d=af285Dmg(u,t,u.atk*(exec?1.76:1.1),true,exec?'#ff9db0':'#e8d2ff');
    if(exec&&d>0)af327HealUnit(u,d*.45,u);
    af285Emit('shadow_dash',u,{x0:from,x1:u.x,life:.35,a:exec?1:0});
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.05*af285Ease(p),tau:-1+.95*p};
    if(s===AF285_CAST)return {dy:.03,tau:p*.4};
    return {dy:.03*(1-p),tau:.4+.6*p};
  },
  vis:{wind:'shadow_crouch',cast:null,rec:null}
};
AF285_CUE.shadow_crouch=function(u,p){
  const pos=af285Pos(u),px=pos.px,n=af285Lite()?4:7;
  ctx.globalAlpha=.35*p;ctx.fillStyle='#2a1440';ctx.beginPath();ctx.ellipse(pos.x,pos.y+2,px*(.3+.2*p),px*.08,0,0,Math.PI*2);ctx.fill();
  for(let i=0;i<n;i++){const k=((elapsed*1.6+i/n)%1),x=pos.x+Math.sin(i*2.9)*px*.3,y=pos.y-k*px*.8;
    ctx.globalAlpha=(1-k)*.7*p;ctx.fillStyle='#8a5cff';ctx.beginPath();ctx.arc(x,y,1.8,0,Math.PI*2);ctx.fill();}
};
AF285_VFX.shadow_dash=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px,fade=1-p;
  const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,'rgba(80,30,140,0)');g.addColorStop(1,'rgba(170,120,255,'+(.7*fade)+')');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse((a.x+b.x)/2,a.y-px*.4,Math.abs(b.x-a.x)/2+px*.15,px*.28,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=fade;ctx.strokeStyle=f.a?'#ff8fa8':'#e6d4ff';ctx.lineWidth=2.4;
  for(let i=0;i<3;i++){const y=b.y-px*(.3+.15*i),x=b.x+(f.team==='ally'?1:-1)*px*.15;ctx.beginPath();ctx.moveTo(x-px*.18,y-px*.12);ctx.lineTo(x+px*.18,y+px*.12);ctx.stroke();}
};

/* ---------- 3. GECE BÜYÜCÜSÜ · KESİLEN SOLUK (büyücü: gölge küresi, saldırı yavaşlatma + kırılganlık) ---------- */
AF285_CONVERTED.add('af37_golge_buyucusu');
AF285_DEFS.af37_golge_buyucusu={
  group:4,role:'büyücü',status:'dönüştürüldü',name:'Kesilen Soluk',icon:'🔮',
  cd:8,first:1.8,wind:.45,cast:.36,hit:1,rec:.26,retarget:true,track:true,sfx:['spell','shadow'],
  desc:'Küresine gölge toplar ve hedefe gönderir: %70 büyü hasarı verir; hedefin saldırıları 3 sn %30 yavaşlar ve 3 sn %12 fazla hasar alır.',
  keep:'Eski “hedefin saldırı aralığını uzat” kuralı korundu; artık güçlü, hazırlıklı ve görünür bir gölge küresi.',
  strong:'Yüksek hasarlı ön saf dövüşçülerini ve tek büyük tehdidi zayıflatmada.',
  weak:'Tek hedeflidir; hazırlıkta sersemletilirse küre çıkmaz; canı orta.',
  plan(u){
    const list=af285Front(u,unitAttackRange(u)+.012);if(!list.length)return null;
    list.sort((a,b)=>(b.atk||0)/(b.attackPeriod||1)-(a.atk||0)/(a.attackPeriod||1));
    const t=list[0];return {t,x:t.x};
  },
  onCast(u,c){af285Emit('shadow_orb',u,{x1:c.x,life:this.cast});},
  impact(u,c){
    const t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:null;if(!t)return;
    af285Dmg(u,t,u.atk*.7,false,'#d9b8ff');
    if(!t.isBarrier){af327Timed(t,'tslow','tslowUntil',t.isBoss?1.12:1.3,3);af327Timed(t,'vuln','vulnUntil',.12,3);}
    af285LibEmit(u,'fx_shadow_strike',t.x,t.lane,.5,9,11,1.3);
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:-.012*p,tau:-1+.85*p};
    if(s===AF285_CAST)return {dy:-.012,tau:.1+.35*p};
    return {dy:-.012*(1-p),tau:.45+.55*p};
  },
  vis:{wind:'void_gather',cast:null,rec:null}
};
AF285_CUE.void_gather=function(u,p){
  const m=af285Muzzle(u),r=m.px*(.07+.12*p);
  af327Glow(m.x,m.y,r*2.3,'#7a3cff',.5+.4*p);
  ctx.globalAlpha=1;ctx.fillStyle='#1a0830';ctx.beginPath();ctx.arc(m.x,m.y,r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c9a3ff';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(m.x,m.y,r,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<4;i++){const a=-elapsed*6+i*Math.PI/2,rr=r*(2.4-1.2*p);ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(m.x+Math.cos(a)*rr,m.y+Math.sin(a)*rr*.6);ctx.lineTo(m.x+Math.cos(a+.5)*r*1.1,m.y+Math.sin(a+.5)*r*.7);ctx.stroke();}
};
AF285_VFX.shadow_orb=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px;
  const x=a.x+(b.x-a.x)*p,y=(a.y-px*.6)+((b.y-px*.5)-(a.y-px*.6))*p-Math.sin(p*Math.PI)*px*.2,r=px*.13;
  for(let i=1;i<=4;i++){const q=Math.max(0,p-i*.06),tx=a.x+(b.x-a.x)*q,ty=(a.y-px*.6)+((b.y-px*.5)-(a.y-px*.6))*q-Math.sin(q*Math.PI)*px*.2;
    ctx.globalAlpha=.45*(1-i/5);ctx.fillStyle='#7a3cff';ctx.beginPath();ctx.arc(tx,ty,r*(1-i*.15),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;af327Glow(x,y,r*2.2,'#9b6bff',1);ctx.fillStyle='#120420';ctx.beginPath();ctx.arc(x,y,r*.75,0,Math.PI*2);ctx.fill();
};

/* ---------- 4. GÖLGE SUİKASTÇI · GÖLGE KESİĞİ (suikastçı: gölgeden atlayıp X kesiği; görünmezlik pasifi korunur) ---------- */
AF285_DEFS.af37_golge_suikastci={
  group:4,role:'suikastçı',status:'eklendi',name:'Gölge Kesiği',icon:'⚔️',
  cd:9,first:2.4,wind:.3,cast:.16,hit:1,rec:.26,retarget:true,track:true,sfx:['hit','stab'],
  desc:'Gölgeye karışıp menzilindeki en zayıf destek ya da menzilli düşmanın önüne atlar ve çapraz X kesiği atar: %120 fiziksel hasar; hedef menzilli ya da destekse %25 fazlası. Atlama en çok 0,22 uzaklığa yapılır.',
  keep:'Pasif — Gölge Pususu korundu: sahaya en çok 2,2 sn görünmez çıkar, ilk birlik vuruşu %45 güçlüdür.',
  strong:'Ön safın arkasındaki okçu, büyücü ve şifacıları avlamada.',
  weak:'Canı çok düşük; atladığı yerde düşman grubunun ortasında kalabilir; tank hedeflerde etkisi sınırlı.',
  plan(u){
    const dir=af285Dir(u),list=af285Foes(u,u.lane,u.x,.22).filter(v=>dir*(v.x-u.x)>=-.005&&!v.isBarrier);
    if(!list.length)return null;
    const soft=v=>af323IsShooter(v)||af329Role(v.heroType)==='support';
    list.sort((a,b)=>(soft(b)-soft(a))||(a.hp/a.maxHp)-(b.hp/b.maxHp));
    const t=list[0];return {t,x:t.x};
  },
  onWind(u,c){af285LibEmit(u,'fx_shadow_strike',u.x,u.lane,this.wind,0,2,1.3);},
  impact(u,c){
    const dir=af285Dir(u),t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:null;if(!t)return;
    const from=u.x,gap=Math.max(.03,(requiredUnitGap(u,t,u.lane)||.03)*.9);
    u.x=Math.max(.035,Math.min(.965,t.x-dir*gap));
    const soft=af323IsShooter(t)||af329Role(t.heroType)==='support';
    af285Dmg(u,t,u.atk*(soft?1.5:1.2),true,'#e6c8ff');
    af285Emit('shadow_dash',u,{x0:from,x1:u.x,life:.3,a:0});
    af285LibEmit(u,'fx_shadow_strike',t.x,t.lane,.55,3,8,1.45);
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.05*af285Ease(p),tau:-1+.95*p};
    if(s===AF285_CAST)return {dy:.02,tau:p*.5};
    return {dy:.02*(1-p),tau:.5+.5*p};
  },
  vis:{wind:'shadow_crouch',cast:null,rec:null}
};

/* ---------- 5. IŞIK ŞİFACISI · İLK IŞIK (destek: altın ışıkla iyileştirme + arındırma) ---------- */
AF285_CONVERTED.add('af37_isik_sifacisi');
AF285_DEFS.af37_isik_sifacisi={
  group:4,role:'destek',status:'dönüştürüldü',name:'İlk Işık',icon:'✨',
  cd:8,first:1.5,wind:.45,cast:.25,hit:1,rec:.28,retarget:true,sfx:['spell','holy'],
  desc:'Güneş asasını kaldırır; canı %70’in altındaki en yaralı dostun üstüne altın ışık iner: dost canının %18’ini geri kazanır ve üzerindeki bir zehir ya da yanma temizlenir. Yanındaki dostlar %6 iyileşir.',
  keep:'Eski “yaralı dostu iyileştir ve zehri temizle” kuralı korundu; artık güçlü, hazırlıklı ve görünür bir ışık yağmuru.',
  strong:'Zehir ve yanma kullanan rakiplere karşı; ön saftaki dayanıklı dostu ayakta tutmada.',
  weak:'Kendisi zayıf ve yavaş; bekleme süresi uzun olduğu için ani patlama hasarına yetişmeyebilir.',
  plan(u){
    const list=[u,...af285Allies(u,.16)].filter(a=>a.hp>0&&!a.isBarrier&&a.hp<a.maxHp*.7).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
    const t=list[0];return t?{t,x:t.x}:null;
  },
  onWind(u,c){af285LibEmit(u,'fx_holy_light',c.x,c.lane,this.wind+this.cast,0,3,1.55);},
  impact(u,c){
    const t=c.t&&c.t.hp>0&&units.includes(c.t)?c.t:null;if(!t)return;
    const dot=Object.keys(t.dots||{}).find(k=>t.dots[k].until>elapsed&&/poison|burn|venom/.test(k));
    if(dot)delete t.dots[dot];
    af327HealUnit(t,t.maxHp*.18,u);
    for(const a of af285Allies(t,.06))if(a!==t)af327HealUnit(a,a.maxHp*.06,u);
    af285LibEmit(u,'fx_holy_light',t.x,t.lane,.75,4,11,1.55);
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:-.015*p,tau:-1+.7*p};
    if(s===AF285_CAST)return {dy:-.015,tau:.3*p};
    return {dy:-.015*(1-p),tau:.3+.7*p};
  },
  vis:{wind:'sun_staff',cast:null,rec:null}
};
AF285_CUE.sun_staff=function(u,p){
  const m=af285Muzzle(u),r=m.px*(.08+.1*p);
  af327Glow(m.x,m.y-m.px*.25,r*2.6,'#ffd45e',.6+.4*p);
  ctx.globalAlpha=.8*p;ctx.strokeStyle='#fff2b0';ctx.lineWidth=1.5;
  for(let i=0;i<8;i++){const a=elapsed*2+i*Math.PI/4;ctx.beginPath();ctx.moveTo(m.x+Math.cos(a)*r*1.3,m.y-m.px*.25+Math.sin(a)*r*1.3);ctx.lineTo(m.x+Math.cos(a)*r*2.4,m.y-m.px*.25+Math.sin(a)*r*2.4);ctx.stroke();}
};
