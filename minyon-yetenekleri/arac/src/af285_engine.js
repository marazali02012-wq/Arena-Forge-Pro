/* ===== v3.60.285 · AF285 · MİNYON ÖZEL YETENEK MOTORU =====
   Her uygulanan minyonun gerçek bir özel yeteneği vardır. Döngü:
     1 HAZIRLIK   : birim durur, kendine özgü hazırlık hareketini yapar (gövde pozu + hazırlık efekti)
     2 KULLANIM   : yeteneğin animasyonu (mermi, alev, kalkan darbesi, ışık bağı ...)
     3 ETKİ       : seçilen hedefte gerçek hasar / kontrol / koruma / iyileştirme
     4 TOPARLANMA : kısa toparlanma, ardından normal yürüyüş ve saldırı
     5 BEKLEME    : bekleme süresi dolunca yeniden kullanılabilir
   Kurallar:
   - Benzetim yalnızca yetkili tarafta çalışır (çevrimdışı ya da çevrim içi ev sahibi). Seat 2 birim alanlarını ve
     görsel olayları ev sahibinin anlık görüntüsünden aynalar; kendi başına hasar üretmez.
   - Etkiler motorun mevcut yollarından geçer (af327DealDamage, af327HealUnit, af327Shield, af327Push, af327AddDot,
     af327Timed, af267DelayAttack); zırh, kalkan, bağışıklık ve maç istatistikleri tek kurala bağlı kalır.
   - Sersemletme azalan getirili (aynı hedef 2,5 sn kilitlenmez), kalkan üst üste toplanmaz, her yeteneğin bekleme süresi vardır.
   - Kart enerji bedelleri, nadirlik, deste, kayıt şeması değişmez. Rastgelelik kullanılmaz (tekrar oynatma ile uyumlu). */
/* var: motor kapanışı kurulurken erken bir çizim çağrısı gelse bile geçici ölü bölge (TDZ) hatası oluşmaz. */
var AF285_VER='3.60.285';
var AF285_IDLE=0,AF285_WIND=1,AF285_CAST=2,AF285_REC=3;
var AF285_DEFS=Object.create(null);   // tür -> yetenek tanımı
var AF285_CUE=Object.create(null);    // birime bağlı hazırlık/kullanım çizimleri (u,p,def)
var AF285_VFX=Object.create(null);    // konuma bağlı geçici efektler (f,p)
var AF285_CONVERTED=new Set();        // eski AF267 tetiklemesi bu aktif yeteneğe dönüştürüldü
var AF285_LATER=[];                   // ev sahibi tarafında kısa gecikmeli etkiler (ikinci ok vb.)
var af285Fx=[],af285FxSeq=0,af285Last=0,af285Scan=0;
var AF285_STATS=Object.create(null);

function af285Def(u){
  if(!AF285_DEFS||!u||u.isSummon||u.isEcho||u._afBattleGhost)return null;
  const t=af264Type(u);
  return t&&AF285_DEFS[t]||null;
}
function af285Sim(){return af267CanSim();}
function af285Dir(u){return u.team==='ally'?1:-1;}
function af285Phase(u,s,dur){u._af285S=s;u._af285A=elapsed;u._af285B=elapsed+Math.max(.01,dur);}
function af285Busy(u){if(!u)return false;const s=u._af285S|0;return s>0&&u.hp>0&&elapsed<(u._af285B||0)+.25;}
function af285Free(u){
  return u.hp>0&&!u._afp177CaptiveBy&&!afp179IsBuried(u)&&!af264Buried(u)&&(u.stunUntil||0)<=elapsed;
}
function af285Hittable(v){return !!v&&v.hp>0&&af264Targetable(v)&&!af264Buried(v)&&!af264Hidden(v);}
function af285Foes(u,lane,x,r){
  return units.filter(v=>v.team!==u.team&&v.lane===lane&&Math.abs(v.x-x)<=r&&af285Hittable(v));
}
function af285Front(u,reach){
  const dir=af285Dir(u);
  return af285Foes(u,u.lane,u.x,reach).filter(v=>dir*(v.x-u.x)>=-.006)
    .sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x));
}
function af285Allies(u,r){
  return units.filter(v=>v!==u&&v.team===u.team&&v.lane===u.lane&&v.hp>0&&!v.isBarrier&&!v.isCommander&&
    !v._afp177CaptiveBy&&!afp179IsBuried(v)&&Math.abs(v.x-u.x)<=r);
}
function af285Death(u){
  if(!af285Sim()||!u.killedBy||u._expired||u._af285DeathDone)return;
  u._af285DeathDone=true;
  if(!u.isBoss&&!u.isBarrier&&!u.isSummon&&!u.isCommander){
    if(AF285_SOULS.length>=16)AF285_SOULS.shift();
    AF285_SOULS.push({team:u.team,lane:u.lane,x:u.x,until:elapsed+3,claimed:false});
  }
  const def=af285Def(u);
  if(def?.onDeath)def.onDeath(u);
}
function af285Stat(type,key,n){const s=AF285_STATS[type]||(AF285_STATS[type]={});s[key]=(s[key]||0)+(n==null?1:n);}
function af285Dmg(u,v,amount,phys,color){
  if(!v||v.hp<=0)return 0;
  const d=af327DealDamage(v,Math.max(1,amount),{team:u.team,source:u,key:u.heroType,
    kind:phys?'af285Physical':'af285Magic',color:color||(phys?'#f4d6a6':'#ffc48c')});
  if(d>0)af285Stat(u.heroType,'damage',d);
  return d;
}
function af285Stun(u,v,dur){
  if(!v||v.hp<=0||v.isBarrier||(v.immuneUntil||0)>elapsed||(v._af285StunGate||0)>elapsed)return false;
  const d=dur*(v.isBoss?.4:1);
  v.stunUntil=Math.max(v.stunUntil||0,elapsed+d);
  v._af285StunGate=elapsed+d+2.5; // azalan getiri: aynı hedef art arda kilitlenmez
  af285Stat(u.heroType,'stun');
  return true;
}
function af285Knock(u,v,d){
  if(!v||v.hp<=0||v.isBarrier||v.isBoss||(v.immuneUntil||0)>elapsed)return;
  af327Push(v,d,u.team);
}
function af285Delay(u,v,s){if(v&&v.hp>0&&!v.isBarrier)af267DelayAttack(v,v.isBoss?s*.35:s);}
function af285Burn(u,v,dps,dur){if(v&&v.hp>0&&!v.isBarrier&&(v.immuneUntil||0)<=elapsed)af327AddDot(v,Math.max(1,dps),dur,'burn',u.team,u.heroType,u);}
function af285Later(delay,fn){if(AF285_LATER.length<48)AF285_LATER.push({t:elapsed+delay,fn});}

/* ---- görsel olay kuyruğu (çevrim içinde seat 2'ye aynalanır) ---- */
function af285Emit(k,u,o){
  if(af285Fx.length>=(LOW_POWER_DEVICE?20:40))af285Fx.shift();
  const f=Object.assign({id:++af285FxSeq,k,card:u?u.heroType||'':'',team:u?u.team:'ally',lane:u?u.lane:1,
    x0:u?u.x:.5,t0:elapsed,life:.5,a:0,b:0},o||{});
  af285Fx.push(f);
  return f;
}
function af285NetFx(){
  return af285Fx.filter(f=>f.t0+f.life>elapsed).slice(-24).map(f=>({k:f.k,card:f.card,team:f.team,lane:f.lane,
    x0:f.x0,x1:Number.isFinite(f.x1)?f.x1:null,t0:f.t0,life:f.life,a:+f.a||0,b:+f.b||0,id:f.id}));
}
function af285ApplyNetFx(list){
  if(!Array.isArray(list))return;
  const cl=(v,a,b,d)=>Number.isFinite(Number(v))?Math.max(a,Math.min(b,Number(v))):d;
  af285Fx=[];
  for(const f of list.slice(0,24)){
    if(!f||!Object.prototype.hasOwnProperty.call(AF285_VFX,f.k)||!AF285_DEFS[f.card])continue;
    af285Fx.push({id:cl(f.id,0,1e9,0),k:f.k,card:f.card,team:f.team==='ally'?'enemy':'ally',lane:Math.floor(cl(f.lane,0,2,1)),
      x0:1-cl(f.x0,0,1,.5),x1:f.x1==null?undefined:1-cl(f.x1,0,1,.5),t0:cl(f.t0,0,3600,elapsed),life:cl(f.life,.05,8,.5),
      a:cl(f.a,-1e6,1e6,0),b:cl(f.b,-1e6,1e6,0)});
  }
}

/* ---- yetenek akışı ---- */
function af285Begin(u,def,plan){
  const c={def,t:plan.t||null,x:Number.isFinite(plan.x)?plan.x:u.x,lane:Number.isInteger(plan.lane)?plan.lane:u.lane,
    data:plan.data||{},done:false,hitAt:Infinity,t0:elapsed};
  u._af285C=c;u._af285X=c.x;u._af285L=c.lane;u._af285N=(u._af285N|0)+1;
  if(plan.t)u.facingDir=plan.t.x>=u.x?1:-1;
  af285Phase(u,AF285_WIND,def.wind);
  af285Emit('label',u,{life:Math.max(1.1,def.wind+def.cast+def.rec+.35)});
  if(def.onWind)def.onWind(u,c);
  af285Stat(u.heroType,'start');
}
function af285Retarget(u,def,c){
  if(def.check){const ok=!!def.check(u,c);if(ok&&c.t&&!(c.t.hp>0&&units.includes(c.t)))c.t=null;return ok;} // alan yetenekleri: ilk hedef düşse de bölgede düşman varsa sürer
  const bad=v=>!v||v.hp<=0||!units.includes(v)||v.lane!==c.lane||!af285Hittable(v)&&v.team!==u.team;
  if(c.t&&!bad(c.t))return true;
  if(!def.retarget)return !c.t;
  const p=def.plan(u,true);
  if(!p)return false;
  c.t=p.t||null;c.x=Number.isFinite(p.x)?p.x:c.x;c.lane=Number.isInteger(p.lane)?p.lane:c.lane;if(p.data)c.data=p.data;
  af285Stat(u.heroType,'retarget');
  return true;
}
function af285BeginCast(u,def){
  const c=u._af285C;
  if(!c||!af285Retarget(u,def,c)){af285Cancel(u,def,'hedef yok');return;}
  if(c.t&&c.t.hp>0)c.x=c.t.x;
  u._af285X=c.x;u._af285L=c.lane;
  af285Phase(u,AF285_CAST,def.cast);
  c.hitAt=elapsed+def.cast*(def.hit==null?1:def.hit);
  if(def.onCast)def.onCast(u,c);
  try{if(def.sfx&&af222Ok('af285-'+u.heroType,180,1))af222Snd(def.sfx[0],def.sfx[1]);}catch(_){}
}
function af285Impact(u,def,c){
  if(c.done)return;c.done=true;
  if(c.t&&c.t.hp>0&&c.t.lane===c.lane)c.x=c.t.x;
  try{def.impact(u,c);}catch(e){console.warn('[AF285] etki hatası',u.heroType,e);}
  af285Stat(u.heroType,'cast');
}
function af285Cancel(u,def,why){
  const c=u._af285C;
  u._af285S=AF285_IDLE;u._af285C=null;
  u._af285R=elapsed+Math.min(3,def.cd*.4);
  af285Emit('fizzle',u,{life:.55});
  af285Stat(u.heroType,'interrupt');
}
function af285Drop(u,def){u._af285S=AF285_IDLE;u._af285C=null;af285Stat(u.heroType,'dropped');}
function af285Finish(u,def){
  const c=u._af285C;
  u._af285S=AF285_IDLE;u._af285C=null;
  u._af285R=Math.max(elapsed+.2,(c?c.t0:elapsed)+def.cd);
}
function af285Step(dt){
  if(!AF285_DEFS||!af285Fx)return;
  if(elapsed+.5<af285Last){af285Fx.length=0;AF285_LATER.length=0;AF285_POOLS.length=0;AF285_SOULS.length=0;}
  af285Last=elapsed;
  for(let i=af285Fx.length-1;i>=0;i--){const f=af285Fx[i];if(f.t0+f.life<elapsed-.05)af285Fx.splice(i,1);}
  if(!playing||!af285Sim())return;
  af285PoolStep();
  for(let i=0;i<AF285_LATER.length;){
    const p=AF285_LATER[i];
    if(elapsed<p.t){i++;continue;}
    AF285_LATER.splice(i,1);
    try{p.fn();}catch(e){console.warn('[AF285] gecikmeli etki',e);}
  }
  const scan=(af285Scan+=dt)>=.1;if(scan)af285Scan=0;
  for(const u of units){
    const def=af285Def(u);if(!def)continue;
    if(u._af285R===undefined){u._af285R=elapsed+def.first;u._af285S=AF285_IDLE;u._af285N=0;}
    const s=u._af285S|0;
    if(u.hp<=0){if(s)af285Drop(u,def);continue;}
    if(def.onTick)def.onTick(u);
    if(s===AF285_WIND){
      if(!af285Free(u)){af285Cancel(u,def,'kesildi');continue;}
      const c=u._af285C;
      if(c&&def.track&&c.t&&c.t.hp>0&&c.t.lane===c.lane){c.x=c.t.x;u._af285X=c.x;}
      if(elapsed>=u._af285B)af285BeginCast(u,def);
      continue;
    }
    if(s===AF285_CAST){
      const c=u._af285C;
      if(c&&!c.done&&elapsed>=c.hitAt)af285Impact(u,def,c);
      if(elapsed>=u._af285B){if(c&&!c.done)af285Impact(u,def,c);af285Phase(u,AF285_REC,def.rec);}
      continue;
    }
    if(s===AF285_REC){if(elapsed>=u._af285B)af285Finish(u,def);continue;}
    if(!scan||elapsed<u._af285R||!af285Free(u)||af264Hidden(u))continue;
    const plan=def.plan(u,false);
    if(plan)af285Begin(u,def,plan);
  }
}

/* ---- gövde pozu (her iki çizim yolu için) ---- */
function af285PoseOf(u){
  const s=u&&u._af285S|0;if(!s||!(u.hp>0)||!AF285_DEFS)return null;
  const def=AF285_DEFS[u.heroType];if(!def)return null;
  const a=u._af285A||0,b=u._af285B||0;if(elapsed>b+.25)return null;
  const p=Math.max(0,Math.min(1,(elapsed-a)/Math.max(.01,b-a)));
  const pose=def.pose?def.pose(s,p,u)||{}:{};
  return {s,p,def,pose};
}
function af285PoseDX(u,px){const P=af285PoseOf(u);return P&&P.pose.dx?P.pose.dx*px*af285Dir(u):0;}
function af285PoseDY(u,px){const P=af285PoseOf(u);return P&&P.pose.dy?P.pose.dy*px:0;}
function af285PoseEnv(u,env){
  const P=af285PoseOf(u);if(!P)return;
  env.X=laneX(u.x);
  let tau=P.pose.tau;
  if(tau===undefined)tau=P.s===AF285_WIND?-1+.92*P.p:P.s===AF285_CAST?.08+P.p*.42:.5+P.p*.5;
  env.dbg={tau};env.eng=true;env.stun=false;
  env.lunge=0; // yakın dövüş adımı yeteneğin kendi hamlesiyle (dx) yönetilir; gövde hedefe doğru uzamaz
}
window.__AF285Pose=function(u){
  const P=af285PoseOf(u);if(!P)return null;
  if(P.pose.state)return {state:P.pose.state,frame:P.pose.frame|0};
  if(P.s===AF285_WIND)return {state:'attack',frame:Math.min(2,Math.floor(P.p*3))};
  if(P.s===AF285_CAST)return {state:'attack',frame:3+Math.min(2,Math.floor(P.p*3))};
  return {state:'attack',frame:6+Math.min(1,Math.floor(P.p*2))};
};

/* ---- çizim ---- */
function af285Pos(u){
  const v=u&&u._vis;
  if(v&&Number.isFinite(v.x))return {x:v.x,y:v.y,top:v.top||v.px,px:v.px||40};
  const x=laneX(u.x),px=af320PxFor('hero',u.lane,1)||40;
  return {x,y:laneY(u.lane,x),top:px*.92,px};
}
function af285At(lane,x){const X=laneX(x);return {x:X,y:laneY(lane,X),px:af320PxFor('hero',lane,1)||40};}
function af285Unit(uid,team){return units.find(v=>v&&v.uid===uid&&v.team===team)||null;}
function af285Lite(){return LOW_POWER_DEVICE||af222Lite();}
function af285Ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function af285Draw(){
  if(!af285Fx||!AF285_DEFS)return;
  if(!af285Fx.length&&!units.some(u=>u&&((u._af285S|0)>0||u._af285Ward>elapsed||u._af285Dome>0||u._af285Vine>0||u._af285Dizzy>elapsed)))return;
  for(const u of units){
    if(!u||u.hp<=0)continue;
    const def=AF285_DEFS[u.heroType];
    if(def&&def.aura){try{ctx.save();def.aura(u);}catch(_){}finally{ctx.restore();}}
    const P=af285Busy(u)?af285PoseOf(u):null;if(!P||!def.vis)continue;
    const key=P.s===AF285_WIND?def.vis.wind:P.s===AF285_CAST?def.vis.cast:def.vis.rec;
    const fn=key&&AF285_CUE[key];if(!fn)continue;
    ctx.save();try{fn(u,P.p,def);}catch(e){}finally{ctx.restore();}
  }
  for(const u of units){
    if(!u)continue;
    if(u._af285Vine>0&&AF285_CUE.vine_heal){ctx.save();try{AF285_CUE.vine_heal(u);}catch(_){}finally{ctx.restore();}}
    if(u._af285Dome>0){ctx.save();try{AF285_CUE.dome(u);}catch(_){}finally{ctx.restore();}}
    if(u._af285Dizzy>elapsed&&AF285_CUE.dizzy){ctx.save();try{AF285_CUE.dizzy(u);}catch(_){}finally{ctx.restore();}}
  }
  for(const f of af285Fx){
    const p=(elapsed-f.t0)/f.life;if(!(p>=0&&p<=1))continue;
    const fn=AF285_VFX[f.k];if(!fn)continue;
    ctx.save();try{fn(f,p);}catch(e){}finally{ctx.restore();}
  }
}

/* ---- ortak çizim parçaları ---- */
function af285Text(x,y,txt,fill,size){
  ctx.font='900 '+size+'px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.lineWidth=Math.max(2.5,size*.28);ctx.strokeStyle='rgba(6,8,14,.9)';ctx.strokeText(txt,x,y);
  ctx.fillStyle=fill;ctx.fillText(txt,x,y);
}
AF285_VFX.label=function(f,p){
  const def=AF285_DEFS[f.card];if(!def)return;
  const u=units.find(v=>v&&v.heroType===f.card&&v.team===f.team&&v.lane===f.lane&&Math.abs(v.x-f.x0)<.03);
  const pos=u?af285Pos(u):af285At(f.lane,f.x0);
  const rise=Math.min(1,p*6),fade=p>.78?1-(p-.78)/.22:1;
  const size=Math.max(10,Math.min(15,H*.021));
  const y=pos.y-(pos.top||pos.px)-size*.9-rise*4;
  ctx.globalAlpha=fade*Math.min(1,p*8);
  const col=f.team==='ally'?'#bfe4ff':'#ffc4b8';
  af285Text(pos.x,y,(def.icon?def.icon+' ':'')+def.name.toLocaleUpperCase('tr-TR'),col,size);
};
AF285_VFX.fizzle=function(f,p){
  const pos=af285At(f.lane,f.x0),a=1-p;
  ctx.globalAlpha=a*.75;ctx.fillStyle='#d9dde8';
  for(let i=0;i<5;i++){const ang=i*1.26+p*2,r=pos.px*(.12+p*.28);ctx.beginPath();ctx.arc(pos.x+Math.cos(ang)*r,pos.y-pos.px*.55+Math.sin(ang)*r*.6-p*8,2.2*(1-p)+.6,0,Math.PI*2);ctx.fill();}
  const size=Math.max(9,Math.min(12,H*.017));
  ctx.globalAlpha=a;af285Text(pos.x,pos.y-pos.px*1.05-p*6,'KESİLDİ','#d7dbe6',size);
};

/* Kalkan kubbesi ve zincir yıldırım görselleri: af285_assets.js (kullanıcının gönderdiği 16 karelik sayfalar). */
AF285_CUE.dome=function(u){
  const t0=u._af285Dome;if(!(t0>0))return;
  const live=(u.absorb||0)>0&&(u.absorbUntil||0)>elapsed&&u.hp>0;
  if(!live&&!(u._af285DomeB>0))u._af285DomeB=elapsed;
  let frame;
  if(u._af285DomeB>0){const k=(elapsed-u._af285DomeB)/.42;if(k>=1){u._af285Dome=0;u._af285DomeB=0;return;}frame=12+Math.min(3,Math.floor(k*4));}
  else{
    const age=elapsed-t0;
    if(age<.3)frame=Math.min(3,Math.floor(age/.3*4));
    else{const r=(u.absorb||0)/Math.max(1,u._af285DomeM||1),cyc=Math.floor(elapsed*8+u.x*31)&1;
      frame=r>.66?4+(Math.floor(elapsed*8+u.x*31)%4):r>.33?8+cyc:10+cyc;}
  }
  const im=af285DomeImg(u._af285DomeC|0);if(!im)return;
  const M=AF285_DOME_META,pos=af285Pos(u),top=Math.max(pos.top||0,pos.px*.8);
  const Hf=top*1.39,Wf=Hf*2*.66;
  const sx=(frame%M.cols)*M.fw,sy=Math.floor(frame/M.cols)*M.fh;
  ctx.globalAlpha=u.hp>0?.72:.5; // birim kubbenin içinden görünür kalsın
  ctx.drawImage(im,sx,sy,M.fw,M.fh,pos.x-Wf/2,pos.y+2-Hf*M.ground,Wf,Hf);
};
