/* GRUP 10 · Kızıl Düellocu, Kehribar Şövalye, Kırağı Dokuyucusu, Kırık Kuklacı, Kırık Saat Efendisi */

AF285_DEFS.af37_kizil_duellocu={
  group:10,role:'savaşçı',status:'dönüştürüldü',name:'Düello İmzası',icon:'⚔️',
  cd:7,first:1.18,wind:.28,cast:.16,rec:.24,retarget:true,sfx:['hit','slash'],
  desc:'Bir düşmana düello işareti koyar. Üç saniye boyunca bu rakibe daha hızlı ve daha güçlü vurur.',
  plan(u){const t=af285Front(u,.106).find(v=>!v.isBarrier);return t?{t}:null;},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.12))return;
    u._af285DuelTarget=t;u._af285DuelUntil=elapsed+3;
    u._afTgt=t;
    af285Dmg(u,t,u.atk*.58,true,'#ffc0a0');
    af285Effect(u,'ability_burst',t.x,.46,1,.80);
  }
};

function af285CoverDamage(att,tgt,d,kind){
  const guard=tgt._af285CoverBy;
  if(kind!=='hit'||!(tgt._af285CoverUntil>elapsed)||!(d>0)||!att||!guard||
     !af285Free(guard)||!af285Allies(guard,.11).includes(tgt)||att.team===guard.team)return d;
  const redirected=d*.58;
  af327DealDamage(guard,redirected,{source:att,team:att.team,key:att.heroType,kind:'af285Physical',color:'#ffdd92'});
  if(af285ValidTarget(guard,att,.072)&&elapsed>=(guard._af285CoverReady||0)){
    guard._af285CoverReady=elapsed+.85;
    af285Dmg(guard,att,guard.atk*.48,true,'#ffe1a0');
  }
  af285Effect(guard,'ability_burst',guard.x,.28,3,.55);
  return d-redirected;
}
AF285_DEFS.afn_kehribar_sovalye={
  group:10,role:'tank',status:'dönüştürüldü',name:'Kehribar Muhafaza',icon:'🛡️',
  cd:8,first:1.1,wind:.34,cast:.25,rec:.23,retarget:true,sfx:['hit','block'],
  desc:'Yakındaki dostun önüne geçer. 2,8 saniye gelen normal saldırı hasarının %58’ini üstlenir ve yakın saldırgana karşı vurur.',
  plan(u){
    const t=af285Allies(u,.13).filter(v=>!(v._af285CoverUntil>elapsed)).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    return t&&af285Front(u,.19).length?{t}:null;
  },
  impact(u,c){
    const t=c.t;
    if(!t||!af285Allies(u,.16).includes(t))return;
    const dir=af285Dir(u),next=t.x+dir*.036;
    u.x=Math.max(.035,Math.min(.965,next));
    t._af285CoverBy=u;t._af285CoverUntil=elapsed+2.8;
    af285Effect(u,'ability_burst',u.x,.5,3,.79);
  }
};

AF285_DEFS.afn_kiragi_dokuyucusu={
  group:10,role:'menzilli',status:'dönüştürüldü',name:'Kırağı Düğümü',icon:'❄️',
  cd:6.5,first:1.1,wind:.34,cast:.34,rec:.25,retarget:true,sfx:['spell','ice'],
  desc:'Buz ipliğini uzak hedefe gönderir. İsabet, hedefi kısa süre bulunduğu konuma bağlar.',
  plan(u){const t=af285Front(u,.27).find(v=>!v.isBarrier);return t?{t}:null;},
  onCast(u,c){af285Bolt(u,c,this.cast,0,.16);},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.31))return;
    if(af264Root(t,1.05))af285LibEmit(u,'fx_storm_bind',t.x,t.lane,.55,3,11,1.35);
  }
};

AF285_DEFS.afn_kirik_kuklaci={
  group:10,role:'kontrol',status:'dönüştürüldü',name:'Kırık İp',icon:'🧵',
  cd:7.5,first:1.15,wind:.35,cast:.32,rec:.40,retarget:true,sfx:['spell','dark'],
  desc:'Hedefin hareketine kısa süre el koyar. Büyülü ip hedefi bulunduğu koridorda sınırlı mesafe çeker.',
  plan(u){const t=af285Front(u,.27).find(v=>af285Pushable(v)&&Math.abs(v.x-u.x)>.075);return t?{t}:null;},
  onCast(u,c){af285Bolt(u,c,this.cast,5,.35);},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.30))return;
    const dir=Math.sign(t.x-u.x)||af285Dir(u),d=Math.min(.063,Math.max(0,Math.abs(t.x-u.x)-.041));
    if(d<.015)return;
    af285PullStart(u,t,.28,(a,b)=>{
      af285Delay(a,b,.32);
      af285Effect(a,'ability_burst',b.x,.32,5,.62);
    },t.x-dir*d);
  }
};

var AF285_CLOCKS=[];
function af285ClockStep(){
  for(let i=AF285_CLOCKS.length-1;i>=0;i--){
    const field=AF285_CLOCKS[i];
    if(field.until<=elapsed){AF285_CLOCKS.splice(i,1);continue;}
    if(field.next>elapsed)continue;
    field.next=elapsed+.18;
    for(const t of af285Foes(field.source,field.lane,field.x,.105).slice(0,6)){
      if(t.isBarrier||(t.immuneUntil||0)>elapsed)continue;
      const span=t.isBoss?.20:.38;
      t.slowUntil=Math.max(t.slowUntil||0,elapsed+span);
      af327Timed(t,'tslow','tslowUntil',t.isBoss?1.15:1.55,span);
    }
  }
}
AF285_VFX.clock_field=function(f,p){
  const at=af285At(f.lane,f.x0),r=at.px*1.16;
  ctx.save();ctx.translate(at.x,at.y);
  ctx.scale(1,.32);ctx.globalAlpha=Math.min(.87,p*9,(1-p)*5);
  ctx.fillStyle='#48351a';ctx.strokeStyle='#ffd67c';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.78,Math.sin(a)*r*.78);
    ctx.lineTo(Math.cos(a)*r*.95,Math.sin(a)*r*.95);ctx.stroke();
  }
  ctx.rotate(p*Math.PI*3);
  ctx.beginPath();ctx.moveTo(0,-r*.64);ctx.lineTo(0,0);ctx.lineTo(r*.41,0);ctx.stroke();
  ctx.restore();
};
AF285_DEFS.afn_kirik_saat_efendisi={
  group:10,role:'kontrol',status:'dönüştürüldü',name:'Kırık Saat Alanı',icon:'🕰️',
  cd:10,first:1.18,wind:.44,cast:.28,rec:.30,retarget:true,sfx:['spell','dark'],
  desc:'Zemine geçici altın saat alanı kurar. Alana giren düşmanların yürüyüşü yavaşlar ve saldırı aralığı uzar.',
  plan(u){const t=af285Front(u,.27)[0];return t?{t}:null;},
  onCast(u,c){af285Bolt(u,c,this.cast,3,.56);},
  impact(u,c){
    if(!af285ValidTarget(u,c.t,.31)||AF285_CLOCKS.length>=8)return;
    AF285_CLOCKS.push({source:u,lane:u.lane,x:c.x,until:elapsed+2.6,next:elapsed});
    af285Emit('clock_field',u,{x0:c.x,life:2.6});
  }
};

for(const [type,def] of Object.entries(AF285_DEFS)){
  if(def.group===10&&def.status==='dönüştürüldü')AF285_CONVERTED.add(type);
}
