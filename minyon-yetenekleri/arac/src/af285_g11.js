/* GRUP 11 · Kök Titanı, Kutup Kırıcısı, Mantar Davulcusu, Ocak Dövücüsü, Sedef Pervane */

AF285_DEFS.afn_kok_titani={
  group:11,role:'alan',status:'dönüştürüldü',name:'Kök Kuşatması',icon:'🌿',
  cd:8.5,first:1.15,wind:.46,cast:.25,rec:.32,sfx:['spell','earth'],
  desc:'Koridorda dev kökler çıkarır. Yakındaki en çok dört rakibi yakalayıp oldukları yerde tutar.',
  plan(u){const t=af285Front(u,.19)[0];return t?{t}:null;},
  onCast(u,c){af285LibEmit(u,'fx_vines12',c.x,u.lane,this.cast,0,3,1.28);},
  impact(u,c){
    for(const t of af285Foes(u,u.lane,c.x,.11).slice(0,4))
      if(af264Root(t,1.2))af285LibEmit(u,'fx_vines12',t.x,u.lane,.60,4,11,1.42);
  }
};

AF285_DEFS.afn_kutup_kiricisi={
  group:11,role:'savaşçı',status:'dönüştürüldü',name:'Kutup Çatlağı',icon:'🧊',
  cd:7.6,first:1.15,wind:.39,cast:.22,rec:.29,sfx:['hit','bash'],
  desc:'Öne doğru buz zeminini kırar. Etki alanı hasarından önce uygun kalkanı aşındırır ve zırhı zayıflatır.',
  plan(u){const t=af285Front(u,.151)[0];return t?{t}:null;},
  impact(u,c){
    const dir=af285Dir(u);
    for(const t of af285Front(u,.155).slice(0,4)){
      if((t.immuneUntil||0)>elapsed)continue;
      let loss=u.atk*.52;
      for(const [key,timer] of [['absorb','absorbUntil'],['_af264Ice','_af264IceUntil']]){
        if((t[timer]||0)<=elapsed||!(t[key]>0))continue;
        const taken=Math.min(loss,t[key]);t[key]-=taken;loss-=taken;
      }
      if(!t.isBarrier)af327Timed(t,'_af264Crack','_af264CrackUntil',t.isBoss?.06:.16,2.3);
      af285Dmg(u,t,u.atk*.83,true,'#d4f7ff');
    }
    af285LibEmit(u,'fx_ice_slash',u.x+dir*.045,u.lane,.56,2,11,1.48);
  }
};

AF285_DEFS.afn_mantar_davulcusu={
  group:11,role:'destek',status:'dönüştürüldü',name:'Spor Ritmi',icon:'🥁',
  cd:7.1,first:1.05,wind:.39,cast:.24,rec:.25,sfx:['spell','nature'],
  desc:'Davul çalar. En çok dört yakın dost, 2,7 saniye boyunca daha sık saldırır.',
  plan(u){const t=af285Allies(u,.15)[0];return t&&af285Front(u,.23).length?{t}:null;},
  onWind(u){af285Effect(u,'ability_burst',u.x,this.wind,5,.78);},
  impact(u){
    const allies=af285Allies(u,.16).slice(0,4);
    for(const t of allies){
      af327Timed(t,'_af267Tempo','_af267TempoUntil',.73,2.7,true);
      af285Effect(u,'ability_burst',t.x,.57,4,.65);
    }
  }
};

AF285_DEFS.afn_ocak_dovucusu={
  group:11,role:'destek',status:'dönüştürüldü',name:'Ocak Kıvılcımı',icon:'🔥',
  cd:8,first:1.15,wind:.40,cast:.22,rec:.26,sfx:['hit','fire'],
  desc:'Yakın dostların bir sonraki saldırılarını üç saniye güçlendirir. Kendi yakındaki darbesi düşmanı yakar.',
  plan(u){const t=af285Front(u,.14)[0];return t?{t}:null;},
  impact(u,c){
    for(const t of af285Allies(u,.145).slice(0,4))af327Timed(t,'_af285Forge','_af285ForgeUntil',1.18,3);
    const t=c.t;
    if(af285ValidTarget(u,t,.145)){
      af285Dmg(u,t,u.atk*.56,true,'#ffb36a');
      af285Burn(u,t,u.atk*.17,2.25);
    }
    af285LibEmit(u,'fx_fire_shield',u.x,u.lane,.56,4,11,1.37);
  }
};

function af285Deflect(att,t){
  if(!att||!t||!(t._af285FanUntil>elapsed)||!af285Free(t)||att.team===t.team||
     !af323IsShooter(att)||(t._af285FanReady||0)>elapsed)return false;
  t._af285FanReady=elapsed+1.8;
  af285Effect(t,'ability_burst',t.x,.46,5,.84);
  af285Stat(t.heroType,'deflected');
  return true;
}
AF285_DEFS.afn_sedef_pervane={
  group:11,role:'tank',status:'dönüştürüldü',name:'Sedef Saptırması',icon:'🌀',
  cd:7.7,first:.9,wind:.30,cast:.18,rec:.22,sfx:['hit','block'],
  desc:'Pervanesini açar. Duruşu sürerken ilk uygun menzilli mermiyi boşa çıkarır. Saptırmalar arasında en az 1,8 saniye vardır.',
  plan(u){const t=af285Front(u,.32).find(v=>af323IsShooter(v));return t?{t:u}:null;},
  impact(u){u._af285FanUntil=elapsed+3;af285Effect(u,'ability_burst',u.x,.50,5,.84);}
};

for(const [type,def] of Object.entries(AF285_DEFS)){
  if(def.group===11&&def.status==='dönüştürüldü')AF285_CONVERTED.add(type);
}
