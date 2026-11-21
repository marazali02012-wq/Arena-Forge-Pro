/* GRUP 9 · Buz Zurnacısı, Donuk Mızrakçı, El Arabalı Topçu, Gece Yırtıcısı, Kapı Ustası */

var AF285_PULLS=[];
function af285PullStart(u,t,seconds,finish,destination){
  if(!af285Pushable(t)||(t._af285DragEnd||0)>elapsed)return false;
  const dir=Math.sign(t.x-u.x)||af285Dir(u),gap=Math.min(.075,Math.max(.039,unitAttackRange(u)*.83));
  const to=Number.isFinite(destination)?destination:u.x+dir*gap;
  if(!Number.isFinite(destination)&&Math.abs(t.x-u.x)<=gap){finish(u,t);return true;}
  const hold=af285Def(t);
  if(hold&&[AF285_WIND,AF285_CAST].includes(t._af285S)&&!t._af285C?.done)af285Cancel(t,hold,'çekildi');
  const fx=af285Emit('pull_line',u,{x1:t.x,a:af330Uid(u),b:af330Uid(t),life:seconds+.025});
  t._af285DragEnd=elapsed+seconds;
  t._afTgt=null;
  AF285_PULLS.push({u,t,start:elapsed,end:elapsed+seconds,from:t.x,to:Math.max(.035,Math.min(.965,to)),finish,fx});
  return true;
}
function af285PullStep(){
  for(let i=AF285_PULLS.length-1;i>=0;i--){
    const p=AF285_PULLS[i],{u,t}=p;
    if(!units.includes(u)||!af285Free(u)||!af285ValidTarget(u,t,.39)||!af285Pushable(t)){
      t._af285DragEnd=0;
      p.fx.life=Math.max(.01,elapsed-p.fx.t0);
      AF285_PULLS.splice(i,1);
      continue;
    }
    const q=Math.min(1,(elapsed-p.start)/(p.end-p.start));
    t.x=p.from+(p.to-p.from)*af285Ease(q);
    t._afTgt=null;
    if(q>=1){
      t._af285DragEnd=0;
      AF285_PULLS.splice(i,1);
      p.finish(u,t);
    }
  }
}
AF285_VFX.pull_line=function(f,p){
  const source=af285Unit(f.a,f.team),target=af285Unit(f.b,f.team==='ally'?'enemy':'ally');
  if(!source||!target||source.hp<=0||target.hp<=0)return;
  const a=af285Pos(source),b=af285Pos(target),y0=a.y-a.px*.60,y1=b.y-b.px*.60;
  ctx.strokeStyle=f.card==='afn_gece_yirticisi'?'#c282eb':'#c8c4b2';
  ctx.lineWidth=2.4;ctx.setLineDash(f.card==='afn_gece_yirticisi'?[]:[4,2]);
  ctx.beginPath();ctx.moveTo(a.x,y0);ctx.lineTo(b.x,y1);ctx.stroke();
  ctx.setLineDash([]);
};
AF285_VFX.jaw=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),k=af285Ease(p);
  const x=a.x+(b.x-a.x)*k,y=a.y+(b.y-a.y)*k-a.px*.60,r=a.px*.31;
  ctx.strokeStyle='#c98aff';ctx.fillStyle='#1e0d30';ctx.lineWidth=Math.max(1,r*.16);
  const dir=b.x>=a.x?1:-1;
  for(const side of [-1,1]){
    ctx.beginPath();ctx.moveTo(x-dir*r*.8,y);
    ctx.quadraticCurveTo(x,y+side*r*.72,x+dir*r,y+side*r*(.58-.27*p));
    ctx.lineTo(x+dir*r*.65,y+side*r*.14);ctx.closePath();ctx.fill();ctx.stroke();
  }
};

AF285_DEFS.afn_buz_zurnacisi={
  group:9,role:'destek',status:'dönüştürüldü',name:'Ayaz Ezgisi',icon:'🎵',
  cd:7.8,first:1.2,wind:.42,cast:.29,rec:.25,sfx:['spell','ice'],
  desc:'Yakın dostların saldırılarını hızlandırır. Koridora yolladığı soğuk dalga düşmanları yavaşlatır.',
  plan(u){const t=af285Front(u,.22)[0];return t?{t}:null;},
  onCast(u,c){af285Bolt(u,c,this.cast,0,.23);},
  impact(u){
    for(const v of af285Allies(u,.16).slice(0,4))af327Timed(v,'_af267Tempo','_af267TempoUntil',.78,2.4,true);
    for(const t of af285Front(u,.20).slice(0,4))af264Slow(t,1.5,2.6,'_af285ArrowSlow');
    af285Effect(u,'ability_burst',u.x,.50,0,1.24);
  }
};

AF285_DEFS.afn_donuk_mizrakci={
  group:9,role:'menzilli',status:'dönüştürüldü',name:'Delen Buz Mızrağı',icon:'🔱',
  cd:6.3,first:1.25,wind:.36,cast:.38,hit:.76,rec:.24,retarget:true,sfx:['hit','throw'],
  desc:'İleri fırlattığı buz mızrağı ilk düşmana ve aynı hattaki uygun ikinci düşmana hasar verir.',
  plan(u){const t=af285Front(u,.27)[0];return t?{t}:null;},
  onCast(u,c){
    const dir=af285Dir(u);
    c.data.next=af285Front(u,.35).find(v=>v!==c.t&&dir*(v.x-c.x)>.02&&Math.abs(v.x-c.x)<.12);
    af285Emit('scout_arrow',u,{x1:c.data.next?.x??c.x,life:this.cast});
  },
  impact(u,c){
    const t=c.t;
    if(af285ValidTarget(u,t,.31))af285Dmg(u,t,u.atk*.95,true,'#b8efff');
    const next=c.data.next;
    af285Later(.10,()=>{
      if(af285ValidTarget(u,next,.37)&&af285Dir(u)*(next.x-u.x)>0)
        af285Dmg(u,next,u.atk*.63,true,'#9ae6ff');
    });
    af285Effect(u,'ability_burst',c.x,.35,0,.62);
  }
};

AF285_DEFS.afn_el_arabali_topcu={
  group:9,role:'alan',status:'dönüştürüldü',name:'Ağır Top Atışı',icon:'💣',
  cd:8.4,first:1.32,wind:.43,cast:.55,rec:.33,retarget:true,sfx:['hit','shoot'],
  desc:'Ağır top mermisi havada yay çizip hedeflenen yere düşer. Darbe yakın düşmanların gerçek canını azaltır.',
  plan(u){const t=af285Front(u,.35)[0];return t?{t}:null;},
  onCast(u,c){c.data.land=c.x;af285Bolt(u,c,this.cast,1,1.4);},
  impact(u,c){
    const x=c.data.land;
    af285AreaHit(u,x,.093,.95,true,1,5);
    af285Effect(u,'ability_burst',x,.65,1,1.75);
  }
};

function af285Bite(u,t){
  if(!af285ValidTarget(u,t,.081)||!af285Pushable(t))return;
  af285Dmg(u,t,u.atk*.62,true,'#dc9fff');
  if(t.hp<=0||u._afp177Held||t._afp177ImmuneUntil>elapsed||t.maxHp>Math.max(245,u.maxHp*1.55))return;
  u._afp177Held=t;
  t._afp177CaptiveBy=u;t._afp177CaptiveUntil=elapsed+1.58;t._afp177CaptiveDamageClock=0;
  t._afTgt=null;t._vis=null;
  af285LibEmit(u,'fx_shadow_strike',u.x,u.lane,.66,3,11,1.52);
}
AF285_DEFS.afn_gece_yirticisi={
  group:9,role:'suikastçı',status:'dönüştürüldü',name:'Gölge Çenesi',icon:'🌑',
  cd:10.4,first:1.5,wind:.39,cast:.33,rec:.50,retarget:true,sfx:['spell','dark'],
  desc:'Uygun hedefi gölge çenesiyle yakalayıp çeker. Hafif birlik kısa süre tutulur ve ısırık hasarı alır.',
  plan(u){const t=af285Front(u,.26).find(v=>af285Pushable(v)&&!(v._afp177ImmuneUntil>elapsed));return t?{t}:null;},
  onCast(u,c){af285Emit('jaw',u,{x1:c.x,life:this.cast});},
  impact(u,c){
    if(af285ValidTarget(u,c.t,.29))af285PullStart(u,c.t,.33,af285Bite);
  }
};

function af285Portal(u){
  return u.team==='ally'?{hp:allySharedHP,max:allyTowerMax}:{hp:enemySharedHP,max:TOWER_MAX_HP};
}
function af285PortalRepair(u,amount){
  const p=af285Portal(u);
  if(p.hp<=0||p.hp>=p.max)return false;
  const hp=Math.min(p.max,p.hp+amount);
  if(u.team==='ally'){allySharedHP=hp;allyLaneHP.fill(hp);}
  else{enemySharedHP=hp;enemyLaneHP.fill(hp);}
  return true;
}
AF285_DEFS.afn_kapi_ustasi={
  group:9,role:'destek',status:'dönüştürüldü',name:'Kapı Tamiri',icon:'🛠️',
  cd:8.7,first:1.05,wind:.47,cast:.22,rec:.28,sfx:['spell','holy'],
  desc:'Hasarlı dost portalını onarır. Portal sağlamsa yakın dosta hasarı emen koruyucu yapı kurar.',
  plan(u){
    const p=af285Portal(u);
    if(p.hp>0&&p.hp<p.max)return {x:u.team==='ally'?.055:.945,data:{portal:true}};
    const t=af285Allies(u,.14).find(v=>!(v.absorb>0&&v.absorbUntil>elapsed));
    return t?{t}:null;
  },
  onCast(u,c){af285Bolt(u,c,this.cast,3,.5);},
  impact(u,c){
    if(c.data.portal&&af285PortalRepair(u,12)){af285Effect(u,'ability_burst',c.x,.7,3,1.25);return;}
    const t=c.t;
    if(!t||!af285Allies(u,.17).includes(t))return;
    af285BoneWall(t,Math.ceil(t.maxHp*.17),3);
    af285Effect(u,'ability_burst',t.x,.59,3,1);
  }
};

for(const [type,def] of Object.entries(AF285_DEFS)){
  if(def.group===9&&def.status==='dönüştürüldü')AF285_CONVERTED.add(type);
}
