/* GRUP 8 · Taş Devi, Zehirci, Alize Bıçaklı, Ayaz Kalkanlısı, Bulut Dalgıcı */

AF285_DEFS.af37_tas_devi={
  group:8,role:'alan',status:'dönüştürüldü',name:'Yer Sarsıntısı',icon:'🪨',
  cd:8.3,first:1.35,wind:.46,cast:.22,rec:.34,sfx:['hit','bash'],
  desc:'Zemine yumruk indirir. Yakındaki düşmanlar darbe alır ve geri savrulur. Sersemlik süreleri azalabilir.',
  plan(u){const t=af285Front(u,.13)[0];return t?{t}:null;},
  check(u){return af285Foes(u,u.lane,u.x,.12).length>0;},
  impact(u){
    for(const {v} of af285AreaHit(u,u.x,.12,.78,true,3)){
      af285Knock(u,v,.044);
      af285Stun(u,v,.42);
    }
    af285LibEmit(u,'fx_earth_burst',u.x,u.lane,.56,2,11,1.36);
  }
};

AF285_DEFS.af37_zehirci={
  group:8,role:'menzilli',status:'dönüştürüldü',name:'Zehir Şişesi',icon:'🧪',
  cd:6.4,first:1.0,wind:.31,cast:.40,rec:.25,retarget:true,sfx:['hit','shoot'],
  desc:'Düşmana zehirli şişe fırlatır. İsabet ettiği hedef 3 saniye boyunca aralıklarla can kaybeder.',
  plan(u){const t=af285Front(u,.26)[0];return t?{t}:null;},
  onCast(u,c){af285Bolt(u,c,this.cast,4,.75);},
  impact(u,c){
    const t=c.t;
    if(!af285ValidTarget(u,t,.31)||t.isBarrier||(t.immuneUntil||0)>elapsed)return;
    af285Dmg(u,t,u.atk*.46,false,'#b0f37b');
    if(t.hp<=0)return;
    af327AddDot(t,Math.min(u.atk*.34,Math.max(2,t.maxHp*.027)),t.isBoss?1.8:3,'poison',u.team,u.heroType,u);
    af285LibEmit(u,'fx_poison_flask',t.x,t.lane,.62,3,11,1.3);
  }
};

AF285_DEFS.afn_alize_bicakli={
  group:8,role:'suikastçı',status:'dönüştürüldü',name:'Rüzgâr Kesiği',icon:'⚔️',
  cd:6.4,first:1.3,wind:.29,cast:.20,rec:.26,retarget:true,sfx:['hit','slash'],
  desc:'Hızla düşmanın yanından geçerek saldırır. Hemen arkasında uygun ikinci hedef varsa onu da keser.',
  plan(u){const t=af285Front(u,.18).find(v=>!v.isBarrier);return t?{t}:null;},
  impact(u,c){
    const t=c.t;
    if(!af285ValidTarget(u,t,.20)||t.isBarrier)return;
    const dir=af285Dir(u),from=u.x;
    const next=af285Foes(u,u.lane,t.x,.088).filter(v=>v!==t&&dir*(v.x-t.x)>.012)
      .sort((a,b)=>Math.abs(a.x-t.x)-Math.abs(b.x-t.x))[0];
    const stop=next?Math.min(.042,Math.abs(next.x-t.x)*.5):.042;
    u.x=Math.max(.035,Math.min(.965,t.x+dir*stop));
    af285Dmg(u,t,u.atk*.95,true,'#d4f8ff');
    if(next&&Math.abs(next.x-u.x)<.08)af285Dmg(u,next,u.atk*.58,true,'#c0ecff');
    af285Emit('shadow_dash',u,{x0:from,x1:u.x,life:.36});
    af285LibEmit(u,'fx_ice_slash',t.x,t.lane,.42,3,10,1.22);
  }
};

AF285_DEFS.afn_ayaz_kalkanlisi={
  group:8,role:'tank',status:'dönüştürüldü',name:'Ayaz Kabuğu',icon:'🧊',
  cd:7,first:.75,wind:.30,cast:.18,rec:.25,sfx:['spell','ice'],
  desc:'Canının %20’si kadar buz kalkanı kurar. Hasarla kırılan kalkan yakındaki düşmanları yavaşlatır.',
  plan(u){return af285Front(u,.16).length&&((u.absorbUntil||0)<=elapsed||!(u.absorb>0))?{t:u}:null;},
  impact(u){
    af285BoneWall(u,Math.ceil(u.maxHp*.20),3.2);
    u._af285AyazUntil=elapsed+3.2;
    af285Effect(u,'ability_burst',u.x,.40,0,.58);
  },
  onTick(u){
    if(!(u._af285AyazUntil>0))return;
    if(u._af285AyazUntil<=elapsed){u._af285AyazUntil=0;return;}
    if(u.absorb>0)return;
    u._af285AyazUntil=0;
    for(const t of af285Foes(u,u.lane,u.x,.11).slice(0,4))af264Slow(t,1.45,2.6,'_af285ArrowSlow');
    af285LibEmit(u,'fx_ice_slash',u.x,u.lane,.53,3,11,1.3);
  }
};

AF285_DEFS.afn_bulut_dalgici={
  group:8,role:'suikastçı',status:'dönüştürüldü',name:'Bulut Dalışı',icon:'🪽',
  cd:8.4,first:1.12,wind:.32,cast:.58,rec:.30,retarget:true,sfx:['hit','slash'],
  desc:'Havaya çıkınca kısa süre hedef alınamaz. Dalış noktasına inip düşmana fiziksel hasar verir.',
  plan(u){const t=af285Front(u,.26).find(v=>!v.isBarrier);return t?{t}:null;},
  onCast(u){u._af285AirUntil=elapsed+this.cast+.07;af285Effect(u,'ability_burst',u.x,.43,0,.52);},
  impact(u,c){
    u._af285AirUntil=0;
    const t=c.t;
    if(!af285ValidTarget(u,t,.30))return;
    af285CastDash(u,t,.25,0);
    if(Math.abs(t.x-u.x)>.105)return;
    af285Dmg(u,t,u.atk*1.15,true,'#e0f9ff');
    af285Effect(u,'ability_burst',t.x,.54,0,1.12);
  },
  pose(s,p){
    if(s===AF285_WIND)return {dy:.035*p,tau:-1+.7*p};
    if(s===AF285_CAST)return {dy:-.55*Math.sin(Math.PI*p),tau:.10+.48*p};
    return {dy:.025*(1-p),tau:.58+.42*p};
  }
};

for(const [type,def] of Object.entries(AF285_DEFS)){
  if(def.group===8&&def.status==='dönüştürüldü')AF285_CONVERTED.add(type);
}
