/* ======================================================================
   GRUP 2 · afn_firtina_baglayici · af37_ates_buyucusu · af37_ates_elementali · af37_buz_elementali · af37_buz_muhafizi
   (Fırtına Bağlayıcı kullanıcının gönderdiği zincir yıldırım görseli nedeniyle öne alındı.)
   ====================================================================== */

/* ---------- 1. FIRTINA BAĞLAYICI · ZİNCİR YILDIRIM (büyücü: hedefler arasında sıçrayan şimşek) ---------- */
AF285_CONVERTED.add('afn_firtina_baglayici');
AF285_DEFS.afn_firtina_baglayici={
  group:2,role:'büyücü',status:'dönüştürüldü',name:'Zincir Yıldırım',icon:'⚡',
  cd:5.5,first:1.6,wind:.5,cast:.14,hit:1,rec:.3,retarget:true,track:true,sfx:['spell','storm'],
  hops:[1.30,.90,.60,.40],hopRange:.12,hopTime:.14,
  desc:'Elinde şimşek toplar, sonra şimşeği hedefe gönderir; şimşek aynı koridorda en yakın düşmana sıçrar. En çok 4 hedefe sırasıyla %130, %90, %60 ve %40 büyü hasarı verir; çarpmadan sağ çıkan ilk hedefi 0,6 sn yerinde tutar. Her sıçrama hedefe değdiği anda hasar verir; aynı hedefe iki kez sıçramaz.',
  keep:'Eski “her vuruşta zincir” tetiklemesi bu aktif zincire dönüştürüldü; şimşek artık bekleme süreli, daha güçlü ve görünür bir yetenek.',
  strong:'Aynı koridorda yan yana dizilmiş kalabalık gruplara ve çoklu çağrılan birliklere karşı.',
  weak:'Tek başına duran dayanıklı hedefte sıçrayacak birlik bulamaz; toplanma süresinde sersemletilirse şimşek çıkmaz; canı düşük.',
  plan(u){
    const list=af285Front(u,unitAttackRange(u)+.012);if(!list.length)return null;
    const near=v=>af285Foes(u,v.lane,v.x,.12).length;
    list.sort((a,b)=>near(b)-near(a)||Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
    const t=list[0];return {t,x:t.x};
  },
  onCast(u,c){af285Emit('chain_hop',u,{x0:u.x,x1:c.x,life:.42});},
  impact(u,c){
    const def=this,visited=new Set();let rooted=false;
    const strike=(v,i,from)=>{
      if(!v||v.hp<=0||!units.includes(v)||!af285Hittable(v)){return;}
      visited.add(v);
      af285Dmg(u,v,u.atk*def.hops[i],false,'#bfe3ff');
      if(!rooted&&v.hp>0&&!v.isBarrier){rooted=!!af264Root(v,.6);if(rooted)af285LibEmit(u,'fx_storm_bind',v.x,v.lane,.62,3,11,1.5);} // zincirde ayakta kalan ilk hedef şimşek zincirleriyle bağlanır
      af285Stat(u.heroType,'hops');
      const next=i+1<def.hops.length?units.filter(w=>w.team!==u.team&&w.lane===v.lane&&!visited.has(w)&&af285Hittable(w)&&Math.abs(w.x-v.x)<=def.hopRange)
        .sort((a,b)=>Math.abs(a.x-v.x)-Math.abs(b.x-v.x))[0]:null;
      if(!next)return;
      af285Emit('chain_hop',u,{x0:v.x,x1:next.x,lane:v.lane,life:.42});
      const at=next.x;
      af285Later(def.hopTime,()=>{if(next.hp>0&&units.includes(next)&&Math.abs(next.x-at)<=.14)strike(next,i+1,v);});
    };
    const t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:af285Foes(u,c.lane,c.x,.05).sort((a,b)=>Math.abs(a.x-c.x)-Math.abs(b.x-c.x))[0];
    strike(t,0,u);
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:-.02*af285Ease(p),state:'attack',frame:Math.min(2,Math.floor(p*3))};
    if(s===AF285_CAST)return {dy:-.02,dx:.015*p,state:'attack',frame:3+Math.min(2,Math.floor(p*3))};
    return {dy:-.02*(1-p),state:'attack',frame:6+Math.min(1,Math.floor(p*2))};
  },
  vis:{wind:'storm_charge',cast:'storm_charge',rec:null}
};
{ // eski AF264 zincir/kök tetiklemesi yalnız bu kart için kapanır (diğer AF264 kartları aynen çalışır)
  const base=af264OnHit;
  af264OnHit=function(u){if(af264Type(u)==='afn_firtina_baglayici'&&AF285_DEFS.afn_firtina_baglayici)return;return base.apply(this,arguments);};
}
AF285_CUE.storm_charge=function(u,p,def){
  const im=af285ChainImg(),pos=af285Pos(u),M=AF285_CHAIN_META;
  const s=(u._af285S|0)===AF285_CAST?1:p;
  if(im){
    const frame=Math.min(3,Math.floor(s*4)),h=pos.px*1.55,w=h;
    ctx.globalAlpha=.55+.45*s;
    ctx.drawImage(im,(frame%4)*M.fw,0,M.fw,M.fh,pos.x-w*M.center,pos.y+2-h*M.ground,w,h);
  }
  // ellerin arasında titreşen küçük kıvılcımlar
  const cx=pos.x+af285Dir(u)*pos.px*.12,cy=pos.y-pos.top*.62;
  ctx.globalAlpha=.6+.4*s;ctx.strokeStyle='#e9f6ff';ctx.lineWidth=1.3;
  for(let i=0;i<3;i++){const a=elapsed*31+i*2.1,r=pos.px*(.08+.1*s);ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(a)*r*.6,cy+Math.sin(a*1.3)*r*.5);ctx.lineTo(cx+Math.cos(a+.7)*r,cy+Math.sin(a+.9)*r*.7);ctx.stroke();}
};
AF285_VFX.chain_hop=function(f,p){
  const im=af285ChainImg();
  const A=af285At(f.lane,f.x0),B=af285At(f.lane,f.x1),M=AF285_CHAIN_META;
  const span=B.x-A.x;
  if(!im){ctx.globalAlpha=1-p;af327Zig(A.x,A.y-A.px*.4,B.x,B.y-B.px*.4,'#bfe3ff',1-p,f.id||1);return;}
  const frame=4+Math.min(11,Math.floor(p*12));
  const fw=Math.max(A.px*.6,Math.abs(span))/(M.right-M.left),fh=Math.max(A.px*1.45,Math.min(H*.19,fw*.45));
  ctx.translate(A.x,(A.y+B.y)/2+2);if(span<0)ctx.scale(-1,1);
  ctx.globalAlpha=p>.85?(1-p)/.15:1;
  ctx.drawImage(im,(frame%4)*M.fw,Math.floor(frame/4)*M.fh,M.fw,M.fh,-M.left*fw,-M.ground*fh,fw,fh);
};

/* ---------- 2. ATEŞ BÜYÜCÜSÜ · KOR ÇEMBERİ (büyücü: ateş topu + gecikmeli alan patlaması) ---------- */
AF285_CONVERTED.add('af37_ates_buyucusu');
AF285_DEFS.af37_ates_buyucusu={
  group:2,role:'büyücü',status:'dönüştürüldü',name:'Kor Çemberi',icon:'☄️',
  cd:7,first:1.8,wind:.42,cast:.38,hit:1,rec:.26,retarget:true,track:true,sfx:['spell','fire'],
  ringDelay:.65,ringR:.065,
  desc:'Avucunda ateş topu büyütür ve hedefe fırlatır: hedefe %55 büyü hasarı verir, düştüğü yerde kor çemberi bırakır. Çember 0,65 sn sonra patlar; içindeki en çok 3 düşmana %45 hasar verir ve 2 sn yakar. Çemberden zamanında çıkan birim patlamadan kurtulur.',
  keep:'Eski “isabet noktasında gecikmeli çember” fikri korundu; artık ateş topuyla açıkça atılan, bekleme süreli bir yetenek.',
  strong:'Bir noktada sıkışan ve yavaş birliklerden oluşan gruplara karşı.',
  weak:'Hızlı birlikler çemberden çıkabilir; fırlatma öncesi sersemletilirse ateş topu çıkmaz; canı düşük.',
  plan(u){
    const list=af285Front(u,unitAttackRange(u)+.012);if(!list.length)return null;
    const near=v=>af285Foes(u,v.lane,v.x,.065).length;
    list.sort((a,b)=>near(b)-near(a)||Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
    const t=list[0];return {t,x:t.x};
  },
  onCast(u,c){af285Emit('fireball',u,{x1:c.x,life:this.cast});},
  impact(u,c){
    const def=this;
    const t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:null;
    if(t)af285Dmg(u,t,u.atk*.55,false,'#ffb36b');
    const x=t?t.x:c.x,lane=c.lane;
    af285Emit('ember_ring',u,{x0:x,lane,life:def.ringDelay,a:def.ringR});
    af285Later(def.ringDelay,()=>{
      const victims=units.filter(v=>v.team!==u.team&&v.lane===lane&&af285Hittable(v)&&Math.abs(v.x-x)<=def.ringR)
        .sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x)).slice(0,3);
      for(const v of victims){af285Dmg(u,v,u.atk*.45,false,'#ff9a4a');af285Burn(u,v,u.atk*.08,2);}
      af285Emit('fire_pillar',u,{x0:x,lane,life:.55,a:victims.length});
    });
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.015*p,dx:-.015*p,tau:-1+.9*p};
    if(s===AF285_CAST)return {dx:-.015+.03*p,tau:.02+.4*p};
    return {dx:.015*(1-p),tau:.42+.58*p};
  },
  vis:{wind:'fire_orb',cast:null,rec:null}
};
AF285_CUE.fire_orb=function(u,p){
  const m=af285Muzzle(u),r=m.px*(.06+.13*p);
  af327Glow(m.x,m.y-m.px*.05,r*2.4,'#ff7a1a',.55+.45*p);
  const g=ctx.createRadialGradient(m.x,m.y-m.px*.05,0,m.x,m.y-m.px*.05,r);
  g.addColorStop(0,'#fffbe0');g.addColorStop(.45,'#ffb347');g.addColorStop(1,'rgba(220,60,10,.2)');
  ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,m.y-m.px*.05,r,0,Math.PI*2);ctx.fill();
  for(let i=0;i<5;i++){const a=elapsed*7+i*1.26,rr=r*(1.6-.6*p);ctx.globalAlpha=.7*p;ctx.fillStyle=i%2?'#ffd27a':'#ff6a1a';
    ctx.beginPath();ctx.arc(m.x+Math.cos(a)*rr,m.y-m.px*.05+Math.sin(a)*rr*.6,1.6,0,Math.PI*2);ctx.fill();}
};
AF285_VFX.fireball=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px;
  const x=a.x+(b.x-a.x)*p,y=(a.y-px*.62)+((b.y-px*.5)-(a.y-px*.62))*p-Math.sin(p*Math.PI)*px*.55;
  const dir=b.x>=a.x?1:-1,r=px*.15;
  for(let i=1;i<=5;i++){const q=Math.max(0,p-i*.05),tx=a.x+(b.x-a.x)*q,ty=(a.y-px*.62)+((b.y-px*.5)-(a.y-px*.62))*q-Math.sin(q*Math.PI)*px*.55;
    ctx.globalAlpha=.5*(1-i/6);ctx.fillStyle=i<3?'#ffb347':'#c8401a';ctx.beginPath();ctx.arc(tx,ty,r*(1-i*.12),0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;af327Glow(x,y,r*2.2,'#ff8a2a',1);
  const g=ctx.createRadialGradient(x+dir*r*.2,y-r*.2,0,x,y,r);g.addColorStop(0,'#fffde8');g.addColorStop(.5,'#ffc04d');g.addColorStop(1,'#e2481a');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
};
AF285_VFX.ember_ring=function(f,p){
  const c=af285At(f.lane,f.x0),R=Math.abs(laneX(f.a||.065)-laneX(0)),blink=.6+.4*Math.sin(elapsed*(10+p*26));
  ctx.globalAlpha=.25+.35*p;ctx.fillStyle='#ff5a14';ctx.beginPath();ctx.ellipse(c.x,c.y+1,R,R*.24,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.6+.4*blink;ctx.strokeStyle='#ffd27a';ctx.lineWidth=2.2;ctx.setLineDash([7,5]);ctx.lineDashOffset=-elapsed*40;
  ctx.beginPath();ctx.ellipse(c.x,c.y+1,R,R*.24,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#ff3d0f';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(c.x,c.y+1,R*(1-p),R*.24*(1-p),0,0,Math.PI*2);ctx.stroke();
};
AF285_VFX.fire_pillar=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,R=Math.abs(laneX(.065)-laneX(0)),a=1-p,h=px*(1.1+1.4*af285Ease(Math.min(1,p*2)));
  const g=ctx.createLinearGradient(c.x,c.y-h,c.x,c.y);g.addColorStop(0,'rgba(255,90,20,0)');g.addColorStop(.45,'rgba(255,150,40,'+(.75*a)+')');g.addColorStop(1,'rgba(255,240,190,'+(.9*a)+')');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(c.x-R*.7,c.y+1);ctx.quadraticCurveTo(c.x-R*.25,c.y-h*.6,c.x,c.y-h);ctx.quadraticCurveTo(c.x+R*.25,c.y-h*.6,c.x+R*.7,c.y+1);ctx.closePath();ctx.fill();
  ctx.globalAlpha=a;ctx.strokeStyle='#ffcf6a';ctx.lineWidth=Math.max(1,4*a);ctx.beginPath();ctx.ellipse(c.x,c.y+1,R*(1+p*.4),R*.24*(1+p*.4),0,0,Math.PI*2);ctx.stroke();
  af266Fragment(c.x,c.y,Math.min(1,p*1.3),'ember',0,7,1.3);
};

/* ---------- 3. ATEŞ ELEMENTALİ · ALEV DALGASI (savaşçı: önüne yayılan alev duvarı) + Kül Yağmuru korunur ---------- */
AF285_DEFS.af37_ates_elementali={
  group:2,role:'savaşçı',status:'eklendi',name:'Alev Dalgası',icon:'🌋',
  cd:9,first:2,wind:.45,cast:.36,hit:.5,rec:.3,sfx:['spell','fire'],
  desc:'Gövdesindeki közleri parlatıp yere vurur; önüne doğru yürüyen bir alev duvarı çıkarır. Önündeki en çok 3 düşmana %50 büyü hasarı verir, 2 sn yakar ve hafifçe geri iter.',
  keep:'Pasif — Kül Yağmuru: savaşta düşerse yakınındaki en çok 3 düşmana %50 alan hasarı verir (korundu).',
  strong:'Önünde toplanan yakın dövüşçülere ve sürülere karşı.',
  weak:'Alev duvarı yalnız öne gider; arkadan ya da uzaktan saldıranlara etkisizdir.',
  plan(u){
    const f=af285Front(u,.11);
    if(!f.length)return null;
    if(f.length>=2||Math.abs(f[0].x-u.x)<=unitAttackRange(u)+.02)return {t:f[0],x:f[0].x};
    return null;
  },
  check(u){return af285Front(u,.12).length>0;},
  impact(u){
    const dir=af285Dir(u);
    const victims=units.filter(v=>v.team!==u.team&&v.lane===u.lane&&af285Hittable(v)&&dir*(v.x-u.x)>=-.01&&dir*(v.x-u.x)<=.115)
      .sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)).slice(0,3);
    for(const v of victims){af285Dmg(u,v,u.atk*.5,false,'#ffa35a');af285Burn(u,v,u.atk*.10,2);af285Knock(u,v,.012);}
  },
  onCast(u){af285Emit('flame_wall',u,{x1:u.x+af285Dir(u)*.115,life:this.cast+.25});},
  pose(s,p){
    if(s===AF285_WIND)return {dy:.04*af285Ease(p),tau:-1+.85*p};
    if(s===AF285_CAST)return {dy:.04-.05*p,dx:.03*p,tau:p*.5};
    return {dy:-.01*(1-p),dx:.03*(1-p),tau:.5+.5*p};
  },
  vis:{wind:'core_flare',cast:'core_flare',rec:null}
};
AF285_CUE.core_flare=function(u,p){
  const pos=af285Pos(u),px=pos.px,cx=pos.x,cy=pos.y-pos.top*.5,s=(u._af285S|0)===AF285_CAST?1:p;
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,px*(.35+.35*s));
  g.addColorStop(0,'rgba(255,240,180,'+(.7*s)+')');g.addColorStop(.4,'rgba(255,120,30,'+(.45*s)+')');g.addColorStop(1,'rgba(160,30,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,px*(.35+.35*s),0,Math.PI*2);ctx.fill();
  const n=af285Lite()?4:8;
  for(let i=0;i<n;i++){const k=((elapsed*1.7+i/n)%1),x=cx+Math.sin(i*2.7+elapsed*3)*px*.25,y=cy+px*.25-k*px*(.9+.4*s);
    ctx.globalAlpha=(1-k)*.9*s;ctx.fillStyle=i%2?'#ffcf6a':'#ff6a1a';ctx.beginPath();ctx.moveTo(x-2,y);ctx.quadraticCurveTo(x,y-6-4*s,x+2,y);ctx.fill();}
};
AF285_VFX.flame_wall=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px,q=af285Ease(Math.min(1,p*1.4));
  const x=a.x+(b.x-a.x)*q,y=a.y+(b.y-a.y)*q,fade=p>.7?1-(p-.7)/.3:1,h=px*(.55+.35*Math.sin(p*Math.PI));
  const n=af285Lite()?4:7;
  for(let i=0;i<n;i++){
    const ox=(i-(n-1)/2)*px*.07,hh=h*(.6+.4*Math.abs(Math.sin(i*1.9+elapsed*18)));
    const g=ctx.createLinearGradient(x+ox,y-hh,x+ox,y);g.addColorStop(0,'rgba(255,80,20,0)');g.addColorStop(.5,'rgba(255,140,40,.8)');g.addColorStop(1,'rgba(255,235,170,.95)');
    ctx.globalAlpha=fade;ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x+ox-px*.06,y+1);ctx.quadraticCurveTo(x+ox-px*.02,y-hh*.6,x+ox,y-hh);ctx.quadraticCurveTo(x+ox+px*.02,y-hh*.6,x+ox+px*.06,y+1);ctx.closePath();ctx.fill();
  }
  ctx.globalAlpha=.35*fade;ctx.fillStyle='#3a1206';ctx.beginPath();ctx.ellipse((a.x+x)/2,y+2,Math.abs(x-a.x)/2+px*.1,px*.05,0,0,Math.PI*2);ctx.fill();
};

/* ---------- 4. BUZ ELEMENTALİ · KIRILGAN BUZ (kontrol: yavaşlatan buz dalgası, yavaşlamış hedefi kökler) ---------- */
AF285_CONVERTED.add('af37_buz_elementali');
AF285_DEFS.af37_buz_elementali={
  group:2,role:'kontrol',status:'dönüştürüldü',name:'Kırılgan Buz',icon:'❄️',
  cd:8,first:2,wind:.45,cast:.32,hit:.5,rec:.3,sfx:['spell','ice'],
  desc:'Yumruklarında buz kristali toplar ve önüne buz dalgası gönderir: en çok 3 düşmana %40 büyü hasarı verir ve 1,6 sn yavaşlatır. Zaten yavaşlamış ya da kökü tutulmuş en çok 2 düşmanı buz kırar: %60 hasar alır ve 0,7 sn yerinde kalır.',
  keep:'Eski “yavaşlamış hedefi kökle” kuralı korundu; artık önce buz dalgası yavaşlatır, ikinci kullanımda kırar.',
  strong:'Başka buz/yavaşlatma birlikleriyle birlikte; yavaş ön safı durdurmada.',
  weak:'Yalnız önündeki düşmanları etkiler; bağışıklık ve köklenme aralığı (2,5 sn) art arda kilitlemeyi engeller.',
  plan(u){
    const f=af285Front(u,.11);if(!f.length)return null;
    f.sort((a,b)=>((b.slowUntil>elapsed)-(a.slowUntil>elapsed))||Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
    return {t:f[0],x:f[0].x};
  },
  check(u){return af285Front(u,.12).length>0;},
  onCast(u){af285Emit('frost_wave',u,{x1:u.x+af285Dir(u)*.115,life:this.cast+.2});},
  impact(u){
    const dir=af285Dir(u);
    const victims=units.filter(v=>v.team!==u.team&&v.lane===u.lane&&af285Hittable(v)&&dir*(v.x-u.x)>=-.01&&dir*(v.x-u.x)<=.115)
      .sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)).slice(0,3);
    let shattered=0;
    for(const v of victims){
      const brittle=(v.slowUntil||0)>elapsed||af264Rooted(v);
      if(brittle&&shattered<2&&!v.isBarrier){
        af285Dmg(u,v,u.atk*.6,false,'#cdefff');
        if(af264Root(v,.7)){shattered++;af285Emit('ice_shatter',u,{x0:v.x,life:.7});}
      }else af285Dmg(u,v,u.atk*.4,false,'#cdefff');
      af264Slow(v,1.6,2.5);
    }
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.03*af285Ease(p),tau:-1+.85*p};
    if(s===AF285_CAST)return {dy:.03,dx:.025*p,tau:p*.45};
    return {dy:.03*(1-p),dx:.025*(1-p),tau:.45+.55*p};
  },
  vis:{wind:'frost_gather',cast:null,rec:null}
};
AF285_CUE.frost_gather=function(u,p){
  const pos=af285Pos(u),px=pos.px,cx=pos.x+af285Dir(u)*px*.1,cy=pos.y-pos.top*.45,n=af285Lite()?4:7;
  af327Glow(cx,cy,px*(.2+.3*p),'#9fe4ff',.4+.5*p);
  for(let i=0;i<n;i++){
    const a=elapsed*4+i/n*Math.PI*2,r=px*(.45-.25*p);
    const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.55;
    ctx.globalAlpha=.6+.4*p;ctx.fillStyle=i%2?'#e8fbff':'#8fd8ff';ctx.strokeStyle='#ffffff';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+2.2,y);ctx.lineTo(x,y+4);ctx.lineTo(x-2.2,y);ctx.closePath();ctx.fill();ctx.stroke();
  }
  ctx.globalAlpha=.35*p;ctx.fillStyle='#cfefff';ctx.beginPath();ctx.ellipse(pos.x,pos.y+2,px*.45,px*.08,0,0,Math.PI*2);ctx.fill();
};
AF285_VFX.frost_wave=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px,dir=b.x>=a.x?1:-1,q=af285Ease(Math.min(1,p*1.3));
  const x=a.x+(b.x-a.x)*q,y=a.y,fade=p>.7?1-(p-.7)/.3:1;
  const g=ctx.createLinearGradient(a.x,y,x,y);g.addColorStop(0,'rgba(160,220,255,0)');g.addColorStop(.8,'rgba(190,235,255,'+(.55*fade)+')');g.addColorStop(1,'rgba(255,255,255,'+(.9*fade)+')');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(a.x,y+2);ctx.lineTo(x,y+2);ctx.lineTo(x+dir*px*.05,y-px*.45);ctx.lineTo(a.x+dir*px*.2,y-px*.18);ctx.closePath();ctx.fill();
  const n=af285Lite()?4:8;ctx.strokeStyle='#ffffff';ctx.lineWidth=1;
  for(let i=0;i<n;i++){const k=(i+.5)/n,sx=a.x+(x-a.x)*k,sy=y-px*(.1+.3*((i*7)%5)/5),r=2+((i*3)%3);
    ctx.globalAlpha=fade*.9;ctx.beginPath();for(let j=0;j<3;j++){const an=j*Math.PI/3+elapsed*2;ctx.moveTo(sx-Math.cos(an)*r,sy-Math.sin(an)*r);ctx.lineTo(sx+Math.cos(an)*r,sy+Math.sin(an)*r);}ctx.stroke();}
};
AF285_VFX.ice_shatter=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,a=p<.75?1:1-(p-.75)/.25;
  ctx.globalAlpha=.9*a;
  for(let i=0;i<5;i++){
    const ox=(i-2)*px*.08,h=px*(.25+.18*((i*5)%3))*(p<.15?p/.15:1);
    const g=ctx.createLinearGradient(c.x+ox,c.y-h,c.x+ox,c.y);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#5cc4ff');
    ctx.fillStyle=g;ctx.strokeStyle='#e9fbff';ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(c.x+ox-px*.04,c.y+1);ctx.lineTo(c.x+ox+(i-2)*px*.015,c.y-h);ctx.lineTo(c.x+ox+px*.04,c.y+1);ctx.closePath();ctx.fill();ctx.stroke();
  }
};

/* ---------- 5. BUZ MUHAFIZI · BUZ SİPERİ (tank: kök + kendine buz kalkanı) ---------- */
AF285_CONVERTED.add('af37_buz_muhafizi');
AF285_DEFS.af37_buz_muhafizi={
  group:2,role:'tank',status:'dönüştürüldü',name:'Buz Siperi',icon:'🧊',
  cd:9,first:1.5,wind:.4,cast:.14,hit:1,rec:.3,sfx:['hit','ice'],
  desc:'Buz kılıcını yere saplar: önündeki en hızlı düşmanı 0,9 sn yerinde tutar ve %55 fiziksel hasar verir, yanındaki düşmanları 1,2 sn yavaşlatır. Kendini 4 sn boyunca canının %14’ü kadar mavi buz kubbesiyle korur; kubbe hasar aldıkça çatlar, bitince kırılır.',
  keep:'Eski “hızlı düşmanı yerinde tut” kuralı korundu; kökleme artık görünür buz dikenleriyle ve kendi buz kalkanıyla birlikte gelir.',
  strong:'Hızlı dalış yapan suikastçı ve hafif birliklere karşı; ön safta zaman kazandırır.',
  weak:'Kök sadece tek hedefe; büyü hasarı kubbeyi hızlı kırar; köklenme aralığı 2,5 sn.',
  plan(u){
    const reach=unitAttackRange(u)+.03,f=af285Front(u,reach);if(!f.length)return null;
    f.sort((a,b)=>Math.abs(b.speed||0)-Math.abs(a.speed||0)||Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
    return {t:f[0],x:f[0].x};
  },
  check(u){return af285Front(u,unitAttackRange(u)+.05).length>0;},
  impact(u,c){
    const t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:af285Front(u,unitAttackRange(u)+.05)[0];
    if(t){
      af285Dmg(u,t,u.atk*.55,true,'#d6f3ff');af264Root(t,.9);
      for(const v of af285Foes(u,t.lane,t.x,.06))if(v!==t)af264Slow(v,1.2,2.5);
      af285Emit('ice_spikes',u,{x0:t.x,life:.95});
    }
    af327Shield(u,Math.max(1,Math.round(u.maxHp*.14)),4);af285DomeOn(u,'blue');
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.03*af285Ease(p),dx:-.015*p,tau:-1+.9*p};
    if(s===AF285_CAST)return {dy:.035,dx:-.015+.06*p,tau:p*.4};
    return {dy:.035*(1-p),dx:.045*(1-p),tau:.4+.6*p};
  },
  vis:{wind:'frost_blade',cast:'frost_blade',rec:null}
};
AF285_CUE.frost_blade=function(u,p){
  const m=af285Muzzle(u),s=(u._af285S|0)===AF285_CAST?1:p;
  af327Glow(m.x,m.y,m.px*(.14+.22*s),'#8fdcff',.5+.5*s);
  ctx.globalAlpha=.8*s;ctx.strokeStyle='#e8fbff';ctx.lineWidth=1.2;
  for(let i=0;i<4;i++){const a=elapsed*6+i*Math.PI/2,r=m.px*(.25-.12*s);ctx.beginPath();ctx.moveTo(m.x+Math.cos(a)*r,m.y+Math.sin(a)*r*.6);ctx.lineTo(m.x+Math.cos(a)*r*.4,m.y+Math.sin(a)*r*.25);ctx.stroke();}
};
AF285_VFX.ice_spikes=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,grow=Math.min(1,p/.18),a=p<.8?1:1-(p-.8)/.2;
  ctx.globalAlpha=.35*a;ctx.fillStyle='#bfeaff';ctx.beginPath();ctx.ellipse(c.x,c.y+2,px*.42,px*.09,0,0,Math.PI*2);ctx.fill();
  const spikes=[[-.3,.42],[-.16,.62],[0,.8],[.15,.58],[.3,.4],[-.06,.36],[.08,.3]];
  for(const [ox,hh] of spikes){
    const h=px*hh*grow,x=c.x+ox*px;
    const g=ctx.createLinearGradient(x,c.y-h,x,c.y);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(1,'rgba(70,170,235,'+(.9*a)+')');
    ctx.globalAlpha=1;ctx.fillStyle=g;ctx.strokeStyle='rgba(235,250,255,'+a+')';ctx.lineWidth=.9;
    ctx.beginPath();ctx.moveTo(x-px*.055,c.y+2);ctx.lineTo(x+ox*px*.12,c.y-h);ctx.lineTo(x+px*.055,c.y+2);ctx.closePath();ctx.fill();ctx.stroke();
  }
};
