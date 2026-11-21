/* ======================================================================
   GRUP 1 · af37_agir_zirhli · af37_alev_muhafizi · af37_alev_silahcisi · af37_altin_muhafiz · af37_arbaletci
   ====================================================================== */

/* ---------- 1. AĞIR ZIRHLI · ÇELİK SİPER (tank: koruma + kısa kontrol) ---------- */
AF285_DEFS.af37_agir_zirhli={
  group:1,role:'tank',status:'eklendi',name:'Çelik Siper',icon:'🛡️',
  cd:11,first:2,wind:.48,cast:.14,hit:1,rec:.32,sfx:['hit','heavy'],
  desc:'Kalkanını yere çakar: önündeki en çok 3 düşmana %55 fiziksel hasar verir, onları geri iter ve saldırılarını geciktirir. Ardından 4 sn çelik siper kurar: kendisi %40, arkasındaki dostlar %22 daha az hasar alır. Ayrıca çelik kalkan ilk darbeleri emer.',
  keep:'Pasif — Çelik Ön Saf: fiziksel hasarı %28 azaltır, arkasındaki menzilli/destek dostlarını önden gelen fiziksel hasara karşı %12 korur.',
  strong:'Yakın dövüşçü sürülerine ve arka hattı sıkıştıran saldırılara karşı.',
  weak:'Büyü hasarı zırhı aşar; hazırlık sırasında sersemletilirse siper kurulamaz; yavaş olduğu için menzilliler uzaktan aşındırır.',
  plan(u){
    const reach=unitAttackRange(u)+.03,front=af285Front(u,.2);
    const t=front[0];if(!t)return null;
    const d=Math.abs(t.x-u.x),dir=af285Dir(u);
    const backlineHurt=af285Allies(u,.14).some(a=>dir*(u.x-a.x)>0&&a.hp<a.maxHp*.85);
    if(d<=reach||(backlineHurt&&d<=.16))return {t,x:t.x};
    return null;
  },
  check(u){const dir=af285Dir(u);return units.some(v=>v.team!==u.team&&v.lane===u.lane&&af285Hittable(v)&&dir*(v.x-u.x)>=-.012&&dir*(v.x-u.x)<=.12);},
  impact(u,c){
    const dir=af285Dir(u);
    const victims=units.filter(v=>v.team!==u.team&&v.lane===u.lane&&af285Hittable(v)&&dir*(v.x-u.x)>=-.012&&dir*(v.x-u.x)<=.088)
      .sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)).slice(0,3);
    for(const v of victims){af285Dmg(u,v,u.atk*.55,true,'#d9e6f2');af285Knock(u,v,.026);af285Delay(u,v,.35);}
    af327Timed(u,'dr','drUntil',.40,4);
    af327Shield(u,Math.max(1,Math.round(u.maxHp*.12)),4);
    for(const a of af285Allies(u,.13).filter(v=>dir*(u.x-v.x)>=-.004).slice(0,3)){
      af327Timed(a,'dr','drUntil',.22,4);
      af327Shield(a,Math.max(1,Math.round(a.maxHp*.08)),4);
    }
    u._af285Ward=elapsed+4;
    af285Emit('steel_slam',u,{x1:u.x+dir*.085,life:.6,a:victims.length});
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.05*af285Ease(p),dx:-.025*p,tau:-1+.9*p};
    if(s===AF285_CAST)return {dy:.02,dx:-.025+.11*p,tau:p*.35};
    return {dy:.02*(1-p),dx:.085*(1-p),tau:.35+.65*p};
  },
  vis:{wind:'steel_brace',cast:'steel_brace',rec:null},
  aura(u){if(u._af285Ward>elapsed)AF285_CUE.steel_wall(u);}
};
AF285_CUE.steel_brace=function(u,p){
  const pos=af285Pos(u),dir=af285Dir(u),px=pos.px;
  const x=pos.x+dir*px*(.34+.05*p),yb=pos.y+2,h=px*(.55+.45*af285Ease(Math.min(1,p*1.2))),w=px*.2;
  ctx.globalAlpha=.35+.45*p;
  const g=ctx.createLinearGradient(x-w,yb-h,x+w,yb);g.addColorStop(0,'#e8f2fb');g.addColorStop(.45,'#9fb7cf');g.addColorStop(1,'#4d6683');
  ctx.fillStyle=g;ctx.strokeStyle='#f4f8ff';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(x-w,yb);ctx.lineTo(x-w,yb-h*.82);ctx.quadraticCurveTo(x,yb-h*1.06,x+w,yb-h*.82);ctx.lineTo(x+w,yb);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.globalAlpha=(.35+.45*p)*.9;ctx.fillStyle='#e0b75c';ctx.beginPath();ctx.arc(x,yb-h*.55,w*.32,0,Math.PI*2);ctx.fill();
  const gl=(p*1.6)%1;ctx.globalAlpha=.55*(1-Math.abs(gl-.5)*2);ctx.strokeStyle='#ffffff';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x-w,yb-h*gl);ctx.lineTo(x+w,yb-h*(gl+.18));ctx.stroke();
  ctx.globalAlpha=.25*p;ctx.fillStyle='#8a98a8';ctx.beginPath();ctx.ellipse(pos.x,yb,px*.42,px*.07,0,0,Math.PI*2);ctx.fill();
};
AF285_CUE.steel_wall=function(u){
  const left=u._af285Ward-elapsed;if(left<=0)return;
  const pos=af285Pos(u),dir=af285Dir(u),px=pos.px;
  const fade=Math.min(1,left/.45)*Math.min(1,(4-left)/.18+.2);
  const x=pos.x+dir*px*.48,yb=pos.y+3,h=px*.95,w=px*.13;
  ctx.globalAlpha=.30*fade;
  const g=ctx.createLinearGradient(x,yb-h,x,yb);g.addColorStop(0,'rgba(220,236,255,.95)');g.addColorStop(1,'rgba(70,110,160,.95)');
  ctx.fillStyle=g;ctx.fillRect(x-w,yb-h,w*2,h);
  ctx.globalAlpha=.75*fade;ctx.strokeStyle='#cfe4ff';ctx.lineWidth=1.6;ctx.strokeRect(x-w,yb-h,w*2,h);
  ctx.fillStyle='#f2f7ff';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(x-w*.5+(i%2)*w,yb-h*(.2+.2*Math.floor(i/2)*2),1.3,0,Math.PI*2);ctx.fill();}
  const flick=.5+.5*Math.sin(elapsed*9+u.x*40);
  ctx.globalAlpha=.22*fade*flick;ctx.fillStyle='#9fd0ff';ctx.beginPath();ctx.ellipse(x-dir*w*.6,yb-h*.5,w*1.4,h*.58,0,0,Math.PI*2);ctx.fill();
};
AF285_VFX.steel_slam=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),dir=f.team==='ally'?1:-1,px=a.px;
  const x=a.x+(b.x-a.x)*af285Ease(Math.min(1,p*1.3)),y=a.y+(b.y-a.y)*p;
  ctx.globalAlpha=Math.max(0,1-p)*.9;ctx.strokeStyle='#e9f2ff';ctx.lineWidth=Math.max(1.5,5*(1-p));
  for(let k=0;k<2;k++){const r=px*(.35+k*.16+p*.25);ctx.beginPath();ctx.ellipse(x-dir*k*px*.1,y-px*.12,r*.45,r,0,dir>0?-1.2:Math.PI-1.2+0,dir>0?1.2:Math.PI+1.2);ctx.stroke();}
  ctx.globalAlpha=Math.max(0,1-p)*.45;ctx.fillStyle='#9aa7b6';ctx.beginPath();ctx.ellipse(a.x+dir*px*.4,a.y+2,px*(.3+p*.6),px*(.06+p*.05),0,0,Math.PI*2);ctx.fill();
  af266Fragment(a.x+dir*px*.45,a.y,Math.min(1,p*1.2),'steel',dir,6,1.2);
  if(p<.25){ctx.globalAlpha=(.25-p)*3;af327Glow(a.x+dir*px*.42,a.y-px*.3,px*.45,'#dfefff',1);}
};

/* ---------- 2. ALEV BEKÇİSİ · KÖZ ZIRHI (tank: yakın alan yakma) ---------- */
AF285_CONVERTED.add('af37_alev_muhafizi');
AF285_DEFS.af37_alev_muhafizi={
  group:1,role:'tank',status:'dönüştürüldü',name:'Köz Zırhı',icon:'🔥',
  cd:8,first:1.5,wind:.42,cast:.12,hit:1,rec:.34,sfx:['spell','fire'],
  desc:'Yakın dövüşe girince zırhındaki közleri toplar ve patlatır: çevresindeki en çok 4 düşmana %35 büyü hasarı verir, 3 sn yakar (saniyede saldırısının %14’ü) ve hafifçe iter.',
  keep:'Eski “saldırganı yak” tetiklemesi bu aktif patlamaya dönüştürüldü; yanma süresi ve hedef seçimi korunup alana yayıldı.',
  strong:'Etrafını saran yakın dövüş gruplarına ve kalabalık koridorlara karşı.',
  weak:'Menzilli birimler patlamanın dışında kalır; hazırlıkta sersemletilirse patlama olmaz.',
  plan(u){
    const near=af285Foes(u,u.lane,u.x,.085);if(!near.length)return null;
    const engaged=near.some(v=>v._afTgt===u&&!af323IsShooter(v));
    if(near.length>=2||engaged)return {t:near.sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x))[0],x:u.x};
    return null;
  },
  check(u){return af285Foes(u,u.lane,u.x,.1).length>0;},
  impact(u){
    const victims=af285Foes(u,u.lane,u.x,.092).sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x)).slice(0,4);
    for(const v of victims){
      af285Dmg(u,v,u.atk*.35,false,'#ffb065');
      af285Burn(u,v,u.atk*.14,3);
      if(!v.isBarrier){const d=af285Dir(u)*(v.x-u.x)>=0?.014:-.014;af327Push(v,v.isBoss?0:d*af285Dir(u),u.team);}
    }
    af285Emit('ember_nova',u,{life:.65,a:victims.length});
    af285LibEmit(u,'fx_fire_shield',u.x,u.lane,.7,6,11,1.55);
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.045*af285Ease(p),tau:-1+.75*p};
    if(s===AF285_CAST)return {dy:.045-.08*p,tau:.05+.2*p};
    return {dy:-.035*(1-p),tau:.25+.75*p};
  },
  vis:{wind:'ember_gather',cast:'ember_gather',rec:null}
};
AF285_CUE.ember_gather=function(u,p){
  const pos=af285Pos(u),px=pos.px,cx=pos.x,cy=pos.y-pos.top*.5,n=af285Lite()?6:11;
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,px*.55);g.addColorStop(0,'rgba(255,210,120,'+(.55*p)+')');g.addColorStop(.5,'rgba(255,110,30,'+(.35*p)+')');g.addColorStop(1,'rgba(120,20,0,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,px*.55,0,Math.PI*2);ctx.fill();
  for(let i=0;i<n;i++){
    const ph=i/n*Math.PI*2+elapsed*5.5,r=px*(.62-.48*p)*(.75+.25*Math.sin(i*2.3));
    const x=cx+Math.cos(ph)*r,y=cy+Math.sin(ph)*r*.55-(i%3)*2;
    ctx.globalAlpha=.55+.4*p;ctx.fillStyle=i%3?'#ffb347':'#ff6a1a';
    ctx.beginPath();ctx.arc(x,y,1.4+1.6*p,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=.6*p;ctx.strokeStyle='#ff7b2e';ctx.lineWidth=1.3;
  ctx.beginPath();ctx.ellipse(cx,pos.y+2,px*(.5-.15*p),px*.09,0,0,Math.PI*2);ctx.stroke();
  // kullanıcı görseli: ateş kalkanı hazırlıkta oluşur (0-2), kullanımda tam parlar (3-5)
  const casting=(u._af285S|0)===AF285_CAST;
  ctx.globalAlpha=1;af285FxFrame('fx_fire_shield',casting?3+Math.min(2,Math.floor(p*3)):Math.min(2,Math.floor(p*3)),pos.x,pos.y+2,px*1.55,.9,u.team==='enemy');
};
AF285_VFX.ember_nova=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,R=Math.abs(laneX(.092)-laneX(0))*(.25+.85*af285Ease(Math.min(1,p*1.25)));
  const a=Math.max(0,1-p);
  ctx.globalAlpha=a*.55;ctx.fillStyle='#ff9a3c';ctx.beginPath();ctx.ellipse(c.x,c.y+1,R,R*.24,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=a;ctx.lineWidth=Math.max(1.4,6*(1-p));ctx.strokeStyle='#ffd27a';ctx.beginPath();ctx.ellipse(c.x,c.y+1,R,R*.24,0,0,Math.PI*2);ctx.stroke();
  ctx.lineWidth=Math.max(1,3*(1-p));ctx.strokeStyle='#ff4a12';ctx.beginPath();ctx.ellipse(c.x,c.y+1,R*.86,R*.2,0,0,Math.PI*2);ctx.stroke();
  const n=af285Lite()?8:14;
  for(let i=0;i<n;i++){
    const ang=i/n*Math.PI*2,fx=c.x+Math.cos(ang)*R,fy=c.y+1+Math.sin(ang)*R*.24,hh=px*(.18+.22*Math.abs(Math.sin(i*1.7+p*9)))*(1-p);
    ctx.globalAlpha=a*.85;ctx.fillStyle=i%2?'#ffb347':'#ff5a1f';
    ctx.beginPath();ctx.moveTo(fx-3,fy);ctx.quadraticCurveTo(fx-1,fy-hh*.6,fx,fy-hh);ctx.quadraticCurveTo(fx+1,fy-hh*.6,fx+3,fy);ctx.closePath();ctx.fill();
  }
  if(p<.22){ctx.globalAlpha=(.22-p)*2.2;af327Glow(c.x,c.y-px*.15,px*.45,'#ff8a2a',1);}
};

/* ---------- 3. ALEV SİLAHÇISI · KÖZ YELPAZESİ (menzilli: koni alev) ---------- */
AF285_CONVERTED.add('af37_alev_silahcisi');
AF285_DEFS.af37_alev_silahcisi={
  group:1,role:'menzilli',status:'dönüştürüldü',name:'Köz Yelpazesi',icon:'🧨',
  cd:8,first:2,wind:.38,cast:.52,hit:.38,rec:.28,retarget:true,track:true,sfx:['spell','fire'],
  desc:'Ayaklarını sabitleyip silahını ısıtır, ardından yelpaze biçiminde alev püskürtür: hedefe ve arkasındaki en çok 2 düşmana %45 büyü hasarı verir ve 2,5 sn yakar (saniyede saldırısının %10’u).',
  keep:'Eski “isabetin arkasını yak” tetiklemesi bu aktif alev püskürtmesine dönüştürüldü; hedefin arkasındaki iki birimi yakma kuralı korundu.',
  strong:'Aynı koridorda sıralanmış gruplara ve destek birimlerine karşı.',
  weak:'Canı az; hazırlıkta sersemletilirse alev çıkmaz; tek ve dayanıklı hedefe karşı ek etkisi az.',
  plan(u){const t=af285Front(u,unitAttackRange(u)+.012)[0];return t?{t,x:t.x}:null;},
  impact(u,c){
    const dir=af285Dir(u),t=c.t&&c.t.hp>0&&af285Hittable(c.t)?c.t:af285Front(u,unitAttackRange(u)+.03)[0];
    if(!t)return;
    const behind=af285Foes(u,u.lane,t.x,.10).filter(v=>v!==t&&dir*(v.x-t.x)>0).sort((a,b)=>Math.abs(a.x-t.x)-Math.abs(b.x-t.x)).slice(0,2);
    for(const v of [t,...behind]){af285Dmg(u,v,u.atk*.45,false,'#ffb36b');af285Burn(u,v,u.atk*.10,2.5);af285Emit('scorch',u,{x0:v.x,life:1.3});}
  },
  pose(s,p){
    if(s===AF285_WIND)return {dx:-.022*af285Ease(p),dy:.02*p,tau:-1+.95*p};
    if(s===AF285_CAST)return {dx:-.022-.01*Math.abs(Math.sin(p*40)),dy:.02,tau:.02};
    return {dx:-.03*(1-p),dy:.02*(1-p),tau:.02+.98*p};
  },
  vis:{wind:'blaster_charge',cast:'flame_cone',rec:null}
};
function af285Muzzle(u){
  const pos=af285Pos(u),v=u._vis,dir=af285Dir(u);
  if(v&&Number.isFinite(v.muzzleX))return {x:v.muzzleX,y:v.muzzleY,px:pos.px};
  return {x:pos.x+dir*pos.px*.36,y:pos.y-pos.top*.52,px:pos.px};
}
AF285_CUE.blaster_charge=function(u,p){
  const m=af285Muzzle(u),dir=af285Dir(u),r=m.px*(.08+.16*p);
  af327Glow(m.x,m.y,r*2.2,'#ff8c2a',.6+.4*p);
  ctx.globalAlpha=.9;ctx.fillStyle='#fff6d0';ctx.beginPath();ctx.arc(m.x,m.y,r*.45,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.35*p;ctx.strokeStyle='#ffd9a0';ctx.lineWidth=1;
  for(let i=0;i<3;i++){const yy=m.y-m.px*(.15+i*.09),ph=elapsed*14+i;ctx.beginPath();ctx.moveTo(m.x-dir*m.px*.25,yy);
    for(let k=1;k<=6;k++)ctx.lineTo(m.x-dir*m.px*.25+dir*k*m.px*.08,yy+Math.sin(ph+k)*2);ctx.stroke();}
};
AF285_CUE.flame_cone=function(u,p){
  const m=af285Muzzle(u),dir=af285Dir(u),lite=af285Lite();
  const tx=Number.isFinite(u._af285X)?u._af285X:u.x+dir*.15,end=laneX(tx+dir*.11),len=Math.max(m.px*.9,Math.abs(end-m.x));
  const grow=af285Ease(Math.min(1,p*2.6)),fade=p>.78?1-(p-.78)/.22:1,L=len*grow,foot=laneY(u.lane,m.x+dir*L);
  const spread=m.px*.55,yEnd=Math.min(foot-m.px*.12,m.y+m.px*.32);
  // 1) alev konisi: ağızdan yere doğru genişleyen dolu yelpaze
  const g=ctx.createLinearGradient(m.x,m.y,m.x+dir*L,yEnd);
  g.addColorStop(0,'rgba(255,252,220,'+(.95*fade)+')');g.addColorStop(.25,'rgba(255,196,80,'+(.85*fade)+')');
  g.addColorStop(.7,'rgba(255,96,24,'+(.6*fade)+')');g.addColorStop(1,'rgba(150,30,6,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(m.x,m.y-m.px*.03);
  const wob=Math.sin(elapsed*26)*m.px*.04;
  ctx.quadraticCurveTo(m.x+dir*L*.55,m.y-spread*.55+wob,m.x+dir*L,yEnd-spread*.62);
  ctx.lineTo(m.x+dir*L,yEnd+spread*.18);
  ctx.quadraticCurveTo(m.x+dir*L*.5,m.y+spread*.35-wob,m.x,m.y+m.px*.03);ctx.closePath();ctx.fill();
  // 2) dalgalanan alev topakları
  const n=lite?8:15;
  for(let i=0;i<n;i++){
    const k=((i/n)+elapsed*2.8)%1,d=L*k;
    const off=Math.sin(i*7.3+elapsed*22)*m.px*(.05+.22*k);
    const x=m.x+dir*d,y=m.y+(yEnd-m.y)*k+off*.6,r=m.px*(.06+.2*k);
    const q=ctx.createRadialGradient(x,y,0,x,y,r);
    q.addColorStop(0,'rgba(255,250,210,.95)');q.addColorStop(.4,'rgba(255,150,40,.8)');q.addColorStop(1,'rgba(190,40,8,0)');
    ctx.globalAlpha=fade*(1-k*.5);ctx.fillStyle=q;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  // 3) beyaz sıcak çekirdek ve ağız parlaması
  ctx.globalAlpha=.85*fade;ctx.strokeStyle='#fff7d6';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(m.x+dir*L*.35,m.y+(yEnd-m.y)*.3);ctx.stroke();
  ctx.globalAlpha=1;af327Glow(m.x,m.y,m.px*.26,'#ffb347',fade);
};
AF285_VFX.scorch=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,a=p<.15?p/.15:1-(p-.15)/.85;
  ctx.globalAlpha=a*.5;ctx.fillStyle='#2b1206';ctx.beginPath();ctx.ellipse(c.x,c.y+1,px*.32,px*.07,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=a*.8;ctx.fillStyle='#ff7a24';
  for(let i=0;i<4;i++){const x=c.x+(i-1.5)*px*.13,hh=px*(.12+.1*Math.abs(Math.sin(elapsed*11+i*2)))*a;ctx.beginPath();ctx.moveTo(x-2.5,c.y+1);ctx.quadraticCurveTo(x,c.y-hh,x+2.5,c.y+1);ctx.fill();}
};

/* ---------- 4. ALTIN MUHAFIZ · ALTIN NÖBET (tank/destek: kalkan) ---------- */
AF285_CONVERTED.add('af37_altin_muhafiz');
AF285_DEFS.af37_altin_muhafiz={
  group:1,role:'destek',status:'dönüştürüldü',name:'Altın Nöbet',icon:'✨',
  cd:10,first:1.5,wind:.46,cast:.24,hit:1,rec:.3,retarget:true,sfx:['spell','holy'],
  desc:'Canı %60’ın altına düşen en yaralı dostu (kendisi için %50) altın kubbeyle korur: kendi canının %8’i kadar kalkan (dostun canının en az %12’si, en çok %60’ı) ve %5 can verir; yanındaki dostlara bunun yarısı kadar kalkan verir. Kalkan 4 sn sürer, üst üste binmez; hasar aldıkça kubbe çatlar, bitince kırılır.',
  keep:'Eski “yaralı dosta kalkan” tetiklemesi bu aktif korumaya dönüştürüldü; kalkan oranı ve süre sınırlı tutuldu.',
  strong:'Ön safta dövüşen yaralı dostları korurken; kalabalık dost gruplarında.',
  weak:'Kendisi hasar vermez; ani tek vuruşlu büyük hasara ve kalkanın süresinin bitmesini bekleyen rakiplere karşı.',
  plan(u){
    const list=[u,...af285Allies(u,.15)].filter(a=>a.hp>0&&!a.isBarrier&&a.hp<a.maxHp*(a===u?.5:.6)&&!(a._af285Aegis>elapsed))
      .sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
    const t=list[0];return t?{t,x:t.x}:null;
  },
  impact(u,c){
    const t=c.t&&c.t.hp>0&&units.includes(c.t)?c.t:null;if(!t)return;
    // Kalkan, muhafızın gücüne bağlıdır; kırılgan birlikte canının %60'ını, dayanıklı birlikte en az %12'sini geçmez/altında kalmaz.
    const main=Math.max(1,Math.round(Math.min(t.maxHp*.6,Math.max(u.maxHp*.08,t.maxHp*.12))));
    af327Shield(t,main,4);af327HealUnit(t,t.maxHp*.05,u);t._af285Aegis=elapsed+4;af285DomeOn(t,'gold');
    let n=1;
    for(const a of af285Allies(t,.08)){if(a===t)continue;
      af327Shield(a,Math.max(1,Math.round(Math.min(a.maxHp*.35,Math.max(u.maxHp*.04,a.maxHp*.06)))),4);a._af285Aegis=elapsed+4;af285DomeOn(a,'gold');n++;}
    if(t!==u&&Math.abs(t.x-u.x)>.06){}
    af285Stat(u.heroType,'shielded',n);
    af285Emit('gold_burst',u,{x0:t.x,life:.7,a:n});
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:-.012*p,tau:-1+.7*p};
    if(s===AF285_CAST)return {dy:-.012,dx:.02*p,tau:.3*p};
    return {dy:-.012*(1-p),dx:.02*(1-p),tau:.3+.7*p};
  },
  vis:{wind:'gold_pillar',cast:'gold_link',rec:null}
};
AF285_CUE.gold_pillar=function(u,p){
  const pos=af285Pos(u),px=pos.px,x=pos.x,top=Math.max(0,pos.y-px*3.2);
  const g=ctx.createLinearGradient(x,top,x,pos.y);g.addColorStop(0,'rgba(255,236,160,0)');g.addColorStop(.6,'rgba(255,220,120,'+(.38*p)+')');g.addColorStop(1,'rgba(255,248,210,'+(.6*p)+')');
  ctx.fillStyle=g;ctx.fillRect(x-px*.2*(.4+p),top,px*.4*(.4+p),pos.y-top);
  ctx.globalAlpha=.75*p;ctx.strokeStyle='#ffd766';ctx.lineWidth=1.5;
  const rot=elapsed*3;ctx.beginPath();ctx.ellipse(x,pos.y+2,px*.46,px*.1,0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#fff0b0';
  for(let i=0;i<6;i++){const a=rot+i*Math.PI/3;ctx.beginPath();ctx.arc(x+Math.cos(a)*px*.46,pos.y+2+Math.sin(a)*px*.1,1.6,0,Math.PI*2);ctx.fill();}
};
AF285_CUE.gold_link=function(u,p){
  const a=af285Pos(u),b=af285At(u._af285L??u.lane,Number.isFinite(u._af285X)?u._af285X:u.x);
  const t=units.find(v=>v!==u&&v.team===u.team&&v.lane===u.lane&&Math.abs(v.x-u._af285X)<.004);
  const bp=t?af285Pos(t):{x:b.x,y:b.y,top:b.px*.9};
  const x0=a.x,y0=a.y-a.top*.75,x1=bp.x,y1=bp.y-bp.top*.55,mx=(x0+x1)/2,my=Math.min(y0,y1)-a.px*.6;
  const q=Math.min(1,p*1.6);
  ctx.globalAlpha=.9;ctx.strokeStyle='#ffe08a';ctx.lineWidth=3;ctx.shadowColor='#ffd24a';ctx.shadowBlur=af285Lite()?0:10;
  ctx.beginPath();ctx.moveTo(x0,y0);
  for(let i=1;i<=12;i++){const t2=i/12*q,xx=(1-t2)*(1-t2)*x0+2*(1-t2)*t2*mx+t2*t2*x1,yy=(1-t2)*(1-t2)*y0+2*(1-t2)*t2*my+t2*t2*y1;ctx.lineTo(xx,yy);}
  ctx.stroke();ctx.shadowBlur=0;
};
AF285_VFX.gold_burst=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,a=1-p;
  ctx.globalAlpha=a;ctx.strokeStyle='#ffe28a';ctx.lineWidth=2;
  for(let i=0;i<8;i++){const ang=i*Math.PI/4+p,r0=px*.2,r1=px*(.35+.55*p);ctx.beginPath();ctx.moveTo(c.x+Math.cos(ang)*r0,c.y-px*.55+Math.sin(ang)*r0);ctx.lineTo(c.x+Math.cos(ang)*r1,c.y-px*.55+Math.sin(ang)*r1);ctx.stroke();}
  if(p<.35){ctx.globalAlpha=(.35-p)*2.6;af327Glow(c.x,c.y-px*.55,px*.6,'#ffd85e',1);}
};

/* ---------- 5. ARBALETÇİ · ÇİFTE NİŞAN (okçu: nişanlı çift atış) ---------- */
AF285_CONVERTED.add('af37_arbaletci');
AF285_DEFS.af37_arbaletci={
  group:1,role:'okçu',status:'dönüştürüldü',name:'Çifte Nişan',icon:'🎯',
  cd:7,first:1.6,wind:.56,cast:.17,hit:1,rec:.26,retarget:true,track:true,sfx:['hit','bow'],
  desc:'Diz çöküp nişan alır (kırmızı nişan çizgisi görünür), sonra menzildeki en yaralı düşmana art arda iki ağır ok atar: %85 ve %70 fiziksel hasar. İkinci ok hedefi geri iter ve sıradaki saldırısını geciktirir.',
  keep:'Eski “aynı hedefe ikinci isabet” tetiklemesi bu aktif çift atışa dönüştürüldü; ek fiziksel hasar fikri korundu.',
  strong:'Arkada kalan yaralı destek ve menzilli birimleri bitirmede.',
  weak:'Nişan süresi uzun: bu sırada sersemletilir ya da öldürülürse atış olmaz; canı düşük.',
  plan(u){
    const list=af285Front(u,unitAttackRange(u)+.012);if(!list.length)return null;
    list.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp)||Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
    const t=list[0];return {t,x:t.x};
  },
  impact(u,c){
    const pick=()=>{const t=c.t&&c.t.hp>0&&units.includes(c.t)&&af285Hittable(c.t)?c.t:null;if(t)return t;
      return af285Foes(u,c.lane,c.x,.06).sort((a,b)=>Math.abs(a.x-c.x)-Math.abs(b.x-c.x))[0]||null;};
    const t1=pick();
    if(t1){af285Dmg(u,t1,u.atk*.85,true,'#f7e3b5');af285Emit('bolt_hit',u,{x0:t1.x,life:.4});}
    af285Later(.09,()=>{
      if(u.hp<=0)return;
      const t2=pick();if(!t2)return;
      af285Dmg(u,t2,u.atk*.70,true,'#f7e3b5');af285Knock(u,t2,.014);af285Delay(u,t2,.22);
      af285Emit('bolt_hit',u,{x0:t2.x,life:.45,a:1});
    });
  },
  onCast(u,c){
    af285Emit('bolt',u,{x1:c.x,life:this.cast});
    af285Emit('bolt',u,{x1:c.x,life:this.cast+.09,a:1});
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.05*af285Ease(Math.min(1,p*1.6)),tau:-1+.96*p};
    if(s===AF285_CAST)return {dy:.05,dx:-.03*Math.sin(p*Math.PI),tau:.02+.3*p};
    return {dy:.05*(1-p),tau:.32+.68*p};
  },
  vis:{wind:'aim_line',cast:null,rec:null}
};
AF285_CUE.aim_line=function(u,p){
  const m=af285Muzzle(u),tx=Number.isFinite(u._af285X)?u._af285X:u.x;
  const t=units.find(v=>v.team!==u.team&&v.lane===u.lane&&Math.abs(v.x-tx)<.003&&v.hp>0);
  const tp=t?af285Pos(t):af285At(u.lane,tx),ty=tp.y-(tp.top||tp.px)*.55;
  ctx.globalAlpha=.35+.45*p;ctx.strokeStyle='#ff3b30';ctx.lineWidth=1.2+1.4*p;ctx.setLineDash([6,4]);ctx.lineDashOffset=-elapsed*30;
  ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(tp.x,ty);ctx.stroke();ctx.setLineDash([]);
  const r=tp.px*(.42-.26*p);
  ctx.globalAlpha=.55+.45*p;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(tp.x,ty,r,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ctx.moveTo(tp.x+dx*r*.55,ty+dy*r*.55);ctx.lineTo(tp.x+dx*r*1.35,ty+dy*r*1.35);}ctx.stroke();
  ctx.fillStyle='#ff3b30';ctx.beginPath();ctx.arc(tp.x,ty,1.8+p,0,Math.PI*2);ctx.fill();
};
AF285_VFX.bolt=function(f,p){
  const delay=f.a?.09:0,life=f.life-delay,q=(p*f.life-delay)/Math.max(.01,life);if(q<0||q>1)return;
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),px=a.px,dir=f.team==='ally'?1:-1;
  const y0=a.y-px*.5,y1=b.y-px*.5,x=a.x+(b.x-a.x)*q,y=y0+(y1-y0)*q-Math.sin(q*Math.PI)*px*.06+(f.a?-3:2);
  ctx.globalAlpha=.55;ctx.strokeStyle='#fff4d8';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(x-dir*px*.9,y+1);ctx.lineTo(x,y);ctx.stroke();
  ctx.globalAlpha=1;ctx.strokeStyle='#3a2a1c';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(x-dir*px*.32,y);ctx.lineTo(x,y);ctx.stroke();
  ctx.fillStyle='#d9e2ec';ctx.beginPath();ctx.moveTo(x+dir*6,y);ctx.lineTo(x-dir*2,y-3.2);ctx.lineTo(x-dir*2,y+3.2);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#c9302c';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x-dir*px*.32,y-3);ctx.lineTo(x-dir*px*.26,y);ctx.lineTo(x-dir*px*.32,y+3);ctx.stroke();
};
AF285_VFX.bolt_hit=function(f,p){
  const c=af285At(f.lane,f.x0),px=c.px,y=c.y-px*.5,dir=f.team==='ally'?1:-1,a=1-p;
  ctx.globalAlpha=a;ctx.strokeStyle='#fff1c9';ctx.lineWidth=1.8;
  for(let i=0;i<7;i++){const ang=(dir>0?Math.PI:0)+(i-3)*.35,r0=px*.06,r1=px*(.18+.3*p);ctx.beginPath();ctx.moveTo(c.x+Math.cos(ang)*r0,y+Math.sin(ang)*r0);ctx.lineTo(c.x+Math.cos(ang)*r1,y+Math.sin(ang)*r1);ctx.stroke();}
  ctx.globalAlpha=a*.8;ctx.strokeStyle='#c9302c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(c.x,y,px*(.1+.3*p),0,Math.PI*2);ctx.stroke();
};

