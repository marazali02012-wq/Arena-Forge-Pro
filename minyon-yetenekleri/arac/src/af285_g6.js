/* GRUP 6 · Kristal Golem, Lav Golemi, Mavi Büyücü, Mühendis Nişancı, Nekromancı */

var AF285_COLORS=['#97e9ff','#ff853b','#67a8ff','#ffe2a1','#a4ed8f','#b990ff'];
function af285Effect(u,key,x,life,color,scale=1){
  return af285Emit(key,u,{x0:x,life,a:color,b:scale});
}
function af285Bolt(u,c,life,color,arc=0){
  return af285Emit('ability_bolt',u,{x1:c.x,life,a:color,b:arc});
}
AF285_VFX.ability_bolt=function(f,p){
  const a=af285At(f.lane,f.x0),b=af285At(f.lane,f.x1),col=AF285_COLORS[f.a|0]||'#fff';
  const x=a.x+(b.x-a.x)*p,y=a.y+(b.y-a.y)*p-a.px*(.53+Math.sin(Math.PI*p)*f.b);
  af327Glow(x,y,a.px*.20,col,.72);
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,Math.max(2,a.px*.065),0,Math.PI*2);ctx.fill();
};
AF285_VFX.ability_burst=function(f,p){
  const a=af285At(f.lane,f.x0),col=AF285_COLORS[f.a|0]||'#fff',r=a.px*f.b*(.25+.60*p);
  ctx.globalAlpha=.9*(1-p);ctx.strokeStyle=col;ctx.lineWidth=2.4;
  ctx.beginPath();ctx.ellipse(a.x,a.y-a.px*.15,r,Math.max(2,r*.27),0,0,Math.PI*2);ctx.stroke();
  af327Glow(a.x,a.y-a.px*.23,r,col,.45*(1-p));
};
function af285AreaHit(u,x,r,coef,phys,color,max=4){
  return af285Foes(u,u.lane,x,r).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x)).slice(0,max)
    .map(v=>({v,dealt:af285Dmg(u,v,u.atk*coef,phys,AF285_COLORS[color])}));
}

AF285_DEFS.af37_kristal_golem={
  group:6,role:'tank',status:'dönüştürüldü',name:'Kristal Kabuk',icon:'💎',
  cd:8,first:.75,wind:.36,cast:.18,rec:.24,sfx:['spell','ice'],
  desc:'%24 can değerinde kristal kabuk kurar. Kabuk hasarla kırılırsa, çevresine kristal parçaları savurur.',
  plan(u){return af285Front(u,.18).length&&(u.absorbUntil||0)<=elapsed?{t:u}:null;},
  impact(u){
    af285BoneWall(u,Math.ceil(u.maxHp*.24),3.5);
    u._af285CrystalUntil=elapsed+3.5;
    af285Effect(u,'ability_burst',u.x,.46,0,.6);
  },
  onTick(u){
    if(!(u._af285CrystalUntil>0))return;
    if(u._af285CrystalUntil<=elapsed){u._af285CrystalUntil=0;return;}
    if(u.absorb>0)return;
    u._af285CrystalUntil=0;
    af285AreaHit(u,u.x,.09,.75,false,0);
    af285Effect(u,'ability_burst',u.x,.55,0,1.18);
  }
};

var AF285_POOLS=[];
AF285_VFX.lava_pool=function(f,p){
  const a=af285At(f.lane,f.x0),r=a.px*.88;
  ctx.globalAlpha=Math.min(.85,p*7,(1-p)*5);
  ctx.fillStyle='#53281d';ctx.strokeStyle='#ff8a36';ctx.lineWidth=2.2;
  ctx.beginPath();ctx.ellipse(a.x,a.y,r,r*.30,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  for(let j=0;j<4;j++){
    const q=(p*4+j*.24)%1,x=a.x+Math.sin(j*3.7)*r*.69;
    ctx.globalAlpha=(1-q)*.8;ctx.fillStyle='#ffb54d';
    ctx.beginPath();ctx.arc(x,a.y-q*r*.42,1+r*.08*q,0,Math.PI*2);ctx.fill();
  }
};
function af285PoolStep(){
  for(let i=AF285_POOLS.length-1;i>=0;i--){
    const pool=AF285_POOLS[i];
    if(pool.end<=elapsed){AF285_POOLS.splice(i,1);continue;}
    if(pool.next>elapsed)continue;
    pool.next+=.5;
    for(const v of af285Foes(pool.source,pool.lane,pool.x,.073).slice(0,5))
      af285Dmg(pool.source,v,pool.atk*.19,false,'#ff8d40');
  }
}
AF285_DEFS.af37_lav_golemi={
  group:6,role:'alan',status:'dönüştürüldü',name:'Lav Havuzu',icon:'🌋',
  cd:8.5,first:1.15,wind:.46,cast:.29,rec:.35,retarget:true,sfx:['spell','fire'],
  desc:'Düşmanın altında 3 saniyelik lav havuzu açar. Havuzda kalan düşmanlar her yarım saniyede yanma hasarı alır.',
  plan(u){const t=af285Front(u,.16)[0];return t?{t}:null;},
  onCast(u,c){af285Bolt(u,c,this.cast,1,.7);},
  impact(u,c){
    if(!af285ValidTarget(u,c.t,.20)||AF285_POOLS.length>=8)return;
    const x=c.t.x;
    AF285_POOLS.push({source:u,lane:u.lane,x,atk:u.atk,next:elapsed+.2,end:elapsed+3});
    af285Effect(u,'lava_pool',x,3,1);
  }
};

AF285_DEFS.af37_mavi_buyucu={
  group:6,role:'menzilli',status:'dönüştürüldü',name:'İkiz Kıvılcım',icon:'🔹',
  cd:6,first:1.1,wind:.38,cast:.36,hit:.72,rec:.23,retarget:true,sfx:['spell','ice'],
  desc:'İki ayrı büyü mermisi gönderir. İkinci mermi yakındaki ikinci düşmana, yalnız bir düşman varsa aynı hedefe yönelir.',
  plan(u){const t=af285Front(u,.25)[0];return t?{t}:null;},
  onCast(u,c){
    c.data.second=af285Foes(u,u.lane,c.x,.095).find(v=>v!==c.t&&Math.abs(v.x-u.x)<=.29)||c.t;
    const second=c.data.second;
    af285Bolt(u,c,this.cast*this.hit,2);
    if(second)af285Bolt(u,{x:second.x},this.cast*this.hit+.12,0,.18);
  },
  impact(u,c){
    if(af285ValidTarget(u,c.t,.31))af285Dmg(u,c.t,u.atk*.72,false,'#62b1ff');
    const second=c.data.second;
    af285Later(.12,()=>{if(af285ValidTarget(u,second,.31))af285Dmg(u,second,u.atk*.57,false,'#9be9ff');});
  }
};

AF285_DEFS.af37_muhendis_nisanci={
  group:6,role:'menzilli',status:'eklendi',name:'Zırh Delen Mermi',icon:'🎯',
  cd:6.4,first:1.25,wind:.36,cast:.31,rec:.30,retarget:true,sfx:['hit','shoot'],
  desc:'Öncelikle ağır zırhlı hedefi nişan alır. Mermisi fiziksel zırhın %65’ini aşar.',
  plan(u){
    const foes=af285Front(u,.32);
    const t=foes.find(v=>af267Armored(v))||foes[0];
    return t?{t}:null;
  },
  onCast(u,c){af285Bolt(u,c,this.cast,3);},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.36))return;
    af327DealDamage(t,u.atk*1.05,{team:u.team,source:u,key:u.heroType,kind:'af285Pierce',color:'#ffe2a1'});
    af285Effect(u,'ability_burst',t.x,.28,3,.45);
  }
};

var AF285_SOULS=[];
function af285Spirit(u,life=7,hpMul=.3,atkMul=.40){
  if(units.filter(v=>v.isSummon&&v.hp>0&&v._af285SummonBy===u).length>=2||
     units.filter(v=>v.isSummon&&v.hp>0&&v.team===u.team&&v._af285SummonBy).length>=6)return null;
  const count=units.filter(v=>v.hp>0&&v._af285SummonBy===u).length;
  const at=Math.max(.055,Math.min(.945,u.x-af285Dir(u)*(.034+count*.034)));
  const side={team:u.team};
  const spirit=af332Summon(side,'af37_iskelet_savasci',u.lane,life,hpMul,atkMul,0,at);
  if(spirit){
    spirit.x=at;
    spirit._af285SummonBy=u;
    af285Effect(u,'ability_burst',spirit.x,.55,4,.9);
  }
  return spirit;
}
AF285_DEFS.af37_nekromanci={
  group:6,role:'destek',status:'dönüştürüldü',name:'Ruh Payı',icon:'👻',
  cd:6,first:.4,wind:.43,cast:.34,rec:.23,sfx:['spell','dark'],
  desc:'Yakındaki düşmüş düşmandan ruh çeker. Yaralı dostuna %16 can verir veya 7 saniye savaşan bir ruh çağırır.',
  plan(u){
    const soul=AF285_SOULS.find(s=>!s.claimed&&s.until>elapsed&&s.team!==u.team&&s.lane===u.lane&&Math.abs(s.x-u.x)<=.21);
    return soul?{x:soul.x,data:{soul}}:null;
  },
  check(u,c){const s=c.data.soul;return !s.claimed&&s.until>elapsed&&Math.abs(s.x-u.x)<=.24;},
  onCast(u,c){af285Emit('ability_bolt',u,{x0:c.x,x1:u.x,life:this.cast,a:4,b:.4});},
  impact(u,c){
    const soul=c.data.soul;if(!this.check(u,c))return;
    const friend=af285Wounded(u,.17,.86)[0];
    if(friend){if(!(af327HealUnit(friend,friend.maxHp*.16,u)>0))return;
      af285Effect(u,'ability_burst',friend.x,.54,4,.75);
    }else if(!af285Spirit(u))return;
    soul.claimed=true;
  }
};
for(const [type,def] of Object.entries(AF285_DEFS)){
  if(def.group===6&&def.status==='dönüştürüldü')AF285_CONVERTED.add(type);
}
