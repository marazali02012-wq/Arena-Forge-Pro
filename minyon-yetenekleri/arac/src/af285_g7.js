/* GRUP 7 · Ork Savaşçı, Orman Okçusu, Ruh Çağırıcı, Samuray, Savaş Mühendisi */

function af285Advance(u,t,dist,space=null){
  const dir=Math.sign(t.x-u.x)||af285Dir(u),gap=space??Math.max(.028,(requiredUnitGap(u,t,u.lane)||.028)*.94);
  const from=u.x,limit=Math.max(0,Math.abs(t.x-u.x)-gap);
  u.x=Math.max(.035,Math.min(.965,u.x+dir*Math.min(dist,limit)));
  return from;
}
function af285CastDash(u,t,dist,color){
  const from=af285Advance(u,t,dist);
  if(from!==u.x)af285Emit('shadow_dash',u,{x0:from,x1:u.x,life:.28,a:color});
}
function af285Pushable(v){
  return af285Hittable(v)&&!v.isBoss&&!v.isBarrier&&!v.isCommander&&(v.immuneUntil||0)<=elapsed;
}

AF285_DEFS.af37_ork_savasci={
  group:7,role:'savaşçı',status:'dönüştürüldü',name:'Omuz Darbesi',icon:'💥',
  cd:6.8,first:1.25,wind:.31,cast:.29,rec:.26,retarget:true,sfx:['hit','bash'],
  desc:'Önündeki düşmana omuzla atılır. Fiziksel hasarla birlikte hedefi koridor boyunca geriye iter.',
  plan(u){const t=af285Front(u,.17)[0];return t?{t}:null;},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.2))return;
    af285CastDash(u,t,.10,1);
    if(Math.abs(t.x-u.x)>.075)return;
    af285Dmg(u,t,u.atk*.9,true,'#ffc584');
    af285Knock(u,t,.048);
    af285Effect(u,'ability_burst',t.x,.42,1,.82);
  }
};

AF285_DEFS.af37_orman_okcu={
  group:7,role:'menzilli',status:'eklendi',name:'Donduran Ok',icon:'🏹',
  cd:5.2,first:1.3,wind:.27,cast:.35,rec:.20,retarget:true,sfx:['hit','bow'],
  desc:'Düşmana uzaktan buzlu ok gönderir. İsabet hedefin canını düşürür ve hareketini yavaşlatır.',
  plan(u){const t=af285Front(u,.28)[0];return t?{t}:null;},
  onCast(u,c){af285Emit('scout_arrow',u,{x1:c.x,life:this.cast});},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.31))return;
    if(af285Dmg(u,t,u.atk*.70,true,'#b3efff')>0)af264Slow(t,1.7,2.8,'_af285ArrowSlow');
    af285Effect(u,'ability_burst',t.x,.45,0,.54);
  }
};

AF285_DEFS.af37_ruh_cagirici={
  group:7,role:'destek',status:'dönüştürüldü',name:'Ruh Askerleri',icon:'👻',
  cd:10,first:1.1,wind:.50,cast:.28,rec:.30,sfx:['spell','dark'],
  desc:'Aynı koridorda en çok iki ruh askeri çağırır. Ruhlar 8 saniye yürür, hedef seçer ve gerçekten saldırır.',
  plan(u){
    return af285Front(u,.22).length&&!units.some(v=>v.hp>0&&v._af285SummonBy===u)?{t:u}:null;
  },
  onWind(u){af285Effect(u,'ability_burst',u.x,this.wind,4,.88);},
  impact(u){for(let i=0;i<2;i++)af285Spirit(u,8,.49,.49);}
};

AF285_DEFS.af37_samuray={
  group:7,role:'savaşçı',status:'dönüştürüldü',name:'Karşı Kesik',icon:'⚔️',
  cd:5.8,first:.85,wind:.25,cast:.16,rec:.21,sfx:['hit','slash'],
  desc:'Yakın saldırıya karşı duruş alır. 1,25 saniye içinde gelen yakın darbeyi %75 azaltır, karşı kesik atar.',
  plan(u){const t=af285Front(u,.107).find(v=>!af323IsShooter(v)&&!v.isBarrier);return t?{t}:null;},
  impact(u){u._af285CounterUntil=elapsed+1.25;af285Effect(u,'ability_burst',u.x,.48,3,.56);}
};
function af285CounterDamage(att,tgt,d,kind){
  if(kind!=='hit'||!(d>0)||!(tgt._af285CounterUntil>elapsed)||!af285Free(tgt)||!att||
     !af285ValidTarget(tgt,att,unitAttackRange(att)+.025)||af323IsShooter(att))return d;
  tgt._af285CounterUntil=0;
  af285CastDash(tgt,att,.015,3);
  af285Dmg(tgt,att,tgt.atk*.82,true,'#ffe0a2');
  af285LibEmit(tgt,'fx_ice_slash',att.x,tgt.lane,.44,3,9,1.1);
  return d*.25;
}

AF285_DEFS.af37_savas_muhendisi={
  group:7,role:'alan',status:'dönüştürüldü',name:'Patlayıcı Mermi',icon:'💣',
  cd:7.2,first:1.1,wind:.39,cast:.46,rec:.28,retarget:true,sfx:['hit','shoot'],
  desc:'Patlayıcı mermiyi bir düşmanın önüne yollar. Mermi düştüğünde isabet noktasındaki düşmanlara alan hasarı verir.',
  plan(u){const t=af285Front(u,.31)[0];return t?{t}:null;},
  onCast(u,c){c.data.land=c.x;af285Bolt(u,c,this.cast,1,.87);},
  impact(u,c){
    const x=c.data.land;
    af285AreaHit(u,x,.078,.87,true,1);
    af285Effect(u,'ability_burst',x,.59,1,1.3);
  }
};

for(const [type,def] of Object.entries(AF285_DEFS)){
  if(def.group===7&&def.status==='dönüştürüldü')AF285_CONVERTED.add(type);
}
