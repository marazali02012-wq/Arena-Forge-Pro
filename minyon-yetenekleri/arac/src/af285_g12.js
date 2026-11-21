/* GRUP 12 · Sıçrayan Koçbaşı, Toprak Yarıcı, Zincir Kıran, Büyücü */

function af285StartTravel(u,c,range,seconds){
  const t=c.t;
  if(!af285ValidTarget(u,t,range+.04))return;
  const dir=Math.sign(t.x-u.x)||af285Dir(u);
  const gap=Math.max(.032,Math.min(.067,(requiredUnitGap(u,t,u.lane)||.037)*.92));
  const step=Math.min(range,Math.max(0,Math.abs(t.x-u.x)-gap));
  c.data.travel={start:elapsed,end:elapsed+seconds,from:u.x,to:Math.max(.035,Math.min(.965,u.x+dir*step))};
}
function af285TravelStep(u){
  const travel=u._af285C?.data.travel;
  if(!travel||u._af285S!==AF285_CAST)return;
  const q=Math.max(0,Math.min(1,(elapsed-travel.start)/(travel.end-travel.start)));
  u.x=travel.from+(travel.to-travel.from)*af285Ease(q);
}
function af285FinishTravel(u,c){
  if(!c.data.travel)return false;
  u.x=c.data.travel.to;
  return true;
}

AF285_DEFS.afn_sicrayan_kocbasi={
  group:12,role:'alan',status:'dönüştürüldü',name:'Koçbaşı İnişi',icon:'💥',
  cd:8.5,first:1.2,wind:.35,cast:.52,rec:.33,retarget:true,sfx:['hit','bash'],
  desc:'Koridorda sıçrayıp önündeki uygun hedefe iner. Yeri çatlatır, düşmanlar iniş bölgesinde hasar alır.',
  plan(u){const t=af285Front(u,.31).find(v=>!v.isBarrier);return t?{t}:null;},
  onCast(u,c){af285StartTravel(u,c,.27,this.cast);},
  onTick:af285TravelStep,
  impact(u,c){
    if(!af285FinishTravel(u,c))return;
    for(const {v} of af285AreaHit(u,u.x,.091,1.02,true,1,5))af285Knock(u,v,.020);
    af285LibEmit(u,'fx_earth_burst',u.x,u.lane,.64,0,11,1.47);
    af285Effect(u,'ability_burst',u.x,.50,3,1.34);
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.052*p,tau:-1+.8*p};
    if(s===AF285_CAST)return {dy:-.59*Math.sin(Math.PI*p),tau:.08+.44*p};
    return {dy:.022*(1-p),tau:.55+.45*p};
  }
};

AF285_VFX.tunnel_dirt=function(f,p){
  const start=af285At(f.lane,f.x0),end=af285At(f.lane,f.x1),q=af285Ease(p);
  const x=start.x+(end.x-start.x)*q,y=start.y+(end.y-start.y)*q,r=start.px*.52;
  ctx.globalAlpha=.83;
  ctx.fillStyle='#795036';ctx.strokeStyle='#dea571';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(x,y,r,r*.24,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  for(let i=0;i<4;i++){
    const b=(p*3+i*.23)%1;
    ctx.globalAlpha=(1-b)*.74;ctx.fillStyle='#c68c5b';
    ctx.beginPath();ctx.arc(x+(i-1.5)*r*.32,y-r*b*.63,2.1,0,Math.PI*2);ctx.fill();
  }
};
AF285_DEFS.afn_toprak_yarici={
  group:12,role:'alan',status:'dönüştürüldü',name:'Toprak Çıkışı',icon:'⛰️',
  cd:8.8,first:1.1,wind:.36,cast:.63,rec:.29,retarget:true,sfx:['spell','earth'],
  desc:'Kendi koridorunda yeraltından ilerler. Düşmana yakın yerde çıkıp çevresindekilere gerçek alan hasarı verir.',
  plan(u){const t=af285Front(u,.30).find(v=>!v.isBarrier);return t?{t}:null;},
  onCast(u,c){
    af285StartTravel(u,c,.26,this.cast);
    const travel=c.data.travel;if(!travel)return;
    u._af285TunnelUntil=travel.end+.03;
    af285Emit('tunnel_dirt',u,{x1:travel.to,life:this.cast});
  },
  onTick:af285TravelStep,
  impact(u,c){
    u._af285TunnelUntil=0;
    if(!af285FinishTravel(u,c))return;
    af285AreaHit(u,u.x,.094,.97,true,3,5);
    af285LibEmit(u,'fx_earth_burst',u.x,u.lane,.68,1,11,1.38);
  },
};

AF285_VFX.hook_throw=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),q=af285Ease(p),dir=b.x>=a.x?1:-1;
  const x=a.x+(b.x-a.x)*q,y=a.y+(b.y-a.y)*q-a.px*.58,r=a.px*.15;
  ctx.lineWidth=2.7;ctx.strokeStyle='#d6c4a2';ctx.setLineDash([4,2]);
  ctx.beginPath();ctx.moveTo(a.x,a.y-a.px*.58);ctx.quadraticCurveTo((a.x+x)*.5,y+r*.73,x,y);ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle='#f1dfb7';ctx.lineWidth=3.2;
  ctx.beginPath();ctx.moveTo(x-dir*r,y);ctx.quadraticCurveTo(x+dir*r,y-r,x+dir*r*.68,y+r*.68);
  ctx.quadraticCurveTo(x-dir*r*.2,y+r*1.55,x-dir*r*.22,y+r*.26);ctx.stroke();
};

function af285HookStrike(u,t){
  if(!af285ValidTarget(u,t,Math.max(.048,unitAttackRange(u)+.014)))return;
  u.attackPulse=Math.max(u.attackPulse||0,.34);
  u.cd=Math.max(u.cd||0,.32);
  af285Dmg(u,t,u.atk*1.14,true,'#ffe2a4');
  af285Delay(u,t,.22);
  af285Effect(u,'ability_burst',t.x,.40,3,.73);
}
function af285HookStep(u){
  const c=u._af285C,hook=c?.data.hook;
  if(!hook||c.done||u._af285S!==AF285_CAST)return;
  const p=Math.max(0,Math.min(1,(elapsed-hook.at)/(hook.end-hook.at)));
  const next=hook.from+(hook.to-hook.from)*af285Ease(p);
  let target=null,shortest=Infinity;
  for(const v of units){
    if(v.team===u.team||v.lane!==u.lane||!af285Hittable(v))continue;
    if(v.x<Math.min(hook.x,next)-.011||v.x>Math.max(hook.x,next)+.011)continue;
    const d=Math.abs(v.x-hook.x);
    if(d<shortest){target=v;shortest=d;}
  }
  hook.x=next;
  if(!target)return;
  c.data.contact=target;
  c.t=target;
  const visual=hook.visual;
  visual.x1=target.x;
  visual.life=Math.min(visual.life,Math.max(.05,elapsed-visual.t0));
  af285Impact(u,c.def,c);
}
AF285_DEFS.afn_zincir_kiran={
  group:12,role:'kontrol',status:'dönüştürüldü',name:'Zincir Kancası',icon:'⛓️',
  cd:9.4,first:1.2,wind:.33,cast:.49,rec:.52,retarget:true,sfx:['hit','throw'],
  desc:'Uzaktaki rakibe fiziksel kanca fırlatır. Kanca çarparsa zincir rakibi yanına çeker, ardından yakın saldırı yapar.',
  plan(u){const t=af285Front(u,.33).find(v=>af285Pushable(v)&&Math.abs(v.x-u.x)>=.095);return t?{t}:null;},
  onCast(u,c){
    if(!af285ValidTarget(u,c.t,.35))return;
    const dir=Math.sign(c.x-u.x)||af285Dir(u);
    const to=Math.max(.035,Math.min(.965,c.x+dir*.024)),life=this.cast;
    const visual=af285Emit('hook_throw',u,{x1:to,life});
    c.data.hook={from:u.x,to,x:u.x,at:elapsed,end:elapsed+life,visual};
  },
  onTick:af285HookStep,
  impact(u,c){
    const t=c.data.contact;
    if(!af285ValidTarget(u,t,.36)||!af285Pushable(t))return;
    af285PullStart(u,t,.39,af285HookStrike);
  }
};

AF285_VFX.arcane_seal=function(f,p){
  const a=af285At(f.lane,f.x0),r=a.px*(.53+p*.24);
  ctx.save();ctx.translate(a.x,a.y-2);ctx.scale(1,.32);ctx.rotate(p*Math.PI*1.5);
  ctx.globalAlpha=Math.min(.92,p*10,(1-p)*4);
  ctx.strokeStyle='#c9a2ff';ctx.lineWidth=2.3;
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<6;i++){
    const angle=i*Math.PI/3;
    ctx.beginPath();ctx.moveTo(Math.cos(angle)*r,Math.sin(angle)*r);
    ctx.lineTo(Math.cos(angle+Math.PI*2/3)*r,Math.sin(angle+Math.PI*2/3)*r);ctx.stroke();
  }
  ctx.restore();
};
AF285_DEFS.mage={
  group:12,role:'menzilli',status:'dönüştürüldü',name:'Büyü Mührü',icon:'✦',
  cd:6.9,first:1.33,wind:.40,cast:.34,hit:.76,rec:.25,retarget:true,sfx:['spell','dark'],
  desc:'Düşmana geçici büyü mührü atar. Mühür savunmasını zayıflatır ve hemen ardından büyü darbesi iner.',
  plan(u){const t=af285Front(u,.245).find(v=>!v.isBarrier);return t?{t}:null;},
  onCast(u,c){af285Bolt(u,c,this.cast*this.hit,5,.42);},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.28))return;
    if((t.immuneUntil||0)>elapsed)return;
    af327Timed(t,'vuln','vulnUntil',t.isBoss?.065:.18,2.25);
    af285Emit('arcane_seal',u,{x0:t.x,life:.68});
    af285Later(.13,()=>{
      if(!af285ValidTarget(u,t,.29))return;
      af285Dmg(u,t,u.atk*.87,false,'#d2b1ff');
      af285Effect(u,'ability_burst',t.x,.36,5,.77);
    });
  }
};

for(const [type,def] of Object.entries(AF285_DEFS)){
  if(def.group===12&&def.status==='dönüştürüldü')AF285_CONVERTED.add(type);
}
