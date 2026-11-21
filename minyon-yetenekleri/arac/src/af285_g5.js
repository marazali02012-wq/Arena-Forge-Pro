/* GRUP 5 · Kar Fenercisi, İskelet Kalkanlı, İskelet Savaşçı, Keşifçi, Kılıçlı Asker */

function af285Wounded(u, range, ratio){
  return af285Allies(u,range).filter(v=>v.hp<v.maxHp*ratio)
    .sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp);
}

function af285ValidTarget(u,v,range){
  return units.includes(v)&&af285Hittable(v)&&v.team!==u.team&&v.lane===u.lane&&
    Math.abs(v.x-u.x)<=range;
}

function af285BoneWall(u, amount, duration){
  af327Shield(u,amount,duration);
  u._af285Dome=elapsed;
  u._af285DomeM=u.absorb;
  u._af285DomeC=2;
  u._af285DomeB=0;
}

AF285_DEFS.afn_kar_fenercisi={
  group:5,role:'destek',status:'dönüştürüldü',name:'Kar Feneri',icon:'❄️',
  cd:5.5,first:1.05,wind:.42,cast:.24,rec:.26,retarget:true,sfx:['spell','holy'],
  desc:'Fenerini kaldırır. En yaralı dostunun eksilen canını %14, onun yakınındaki iki yaralı dostun canını %7 iyileştirir.',
  plan(u){const t=af285Wounded(u,.18,.9)[0];return t?{t}:null;},
  onWind(u){af285LibEmit(u,'fx_frost_heal',u.x,u.lane,this.wind,0,4,1.2);},
  impact(u,c){
    const t=c.t&&af285Allies(u,.20).includes(c.t)?c.t:af285Wounded(u,.18,.9)[0];
    if(!t)return;
    const others=af285Wounded(u,.20,1).filter(v=>v!==t&&Math.abs(v.x-t.x)<=.065).slice(0,2);
    for(const v of [t,...others]){
      if(af327HealUnit(v,v.maxHp*(v===t?.14:.07),u)>0)
        af285LibEmit(u,'fx_frost_heal',v.x,v.lane,.66,5,15,1.45);
    }
  },
  pose(s,p){return s===AF285_WIND?{dy:-.022*p,tau:-.94+.62*p}:{dy:-.022*(1-p),tau:.15+.7*p};}
};

AF285_DEFS.af37_iskelet_kalkanli={
  group:5,role:'tank',status:'dönüştürüldü',name:'Kemik Duvarı',icon:'🛡️',
  cd:6.4,first:.7,wind:.28,cast:.15,rec:.22,sfx:['hit','block'],
  desc:'Önünde düşman varken kemik siperini kaldırır. Siper 2,8 saniye boyunca canının %22’si kadar hasar emer.',
  plan(u){
    if(u.absorb>0&&u.absorbUntil>elapsed)return null;
    return af285Front(u,.15).length?{t:u,x:u.x}:null;
  },
  check(u){return af285Front(u,.18).length>0;},
  impact(u){af285BoneWall(u,Math.ceil(u.maxHp*.22),2.8);af285Emit('bone_wall',u,{life:.58});},
  pose(s,p){return s===AF285_WIND?{dy:.045*p,tau:-1+.78*p}:{dx:.035*(1-p),dy:.045*(1-p),tau:.14+.65*p};}
};

AF285_VFX.bone_wall=function(f,p){
  const at=af285At(f.lane,f.x0),dir=f.team==='ally'?1:-1;
  ctx.globalAlpha=.86*(1-p);ctx.lineCap='round';ctx.lineWidth=Math.max(1.5,at.px*.055);
  for(let i=0;i<4;i++){
    const x=at.x+dir*at.px*(.23+i*.08),y=at.y-at.px*(.52+.16*Math.sin(i));
    ctx.strokeStyle=i%2?'#f6e4bd':'#c8b08b';
    ctx.beginPath();ctx.moveTo(x-dir*at.px*.07,y+at.px*.30);ctx.lineTo(x,y-at.px*.14);ctx.stroke();
  }
};

AF285_DEFS.af37_iskelet_savasci={
  group:5,role:'savaşçı',status:'dönüştürüldü',name:'Son Kemik',icon:'☠️',
  cd:0,first:0,wind:0,cast:0,rec:0,plan(){return null;},
  desc:'Ölüm aldığı karede en yakın düşmana son kemik darbesi indirir. Aynı iskelet bu darbeyi bir kez yapabilir.',
  onDeath(u){
    const t=af285Foes(u,u.lane,u.x,Math.max(.045,unitAttackRange(u)+.01))
      .sort((a,b)=>Math.abs(a.x-u.x)-Math.abs(b.x-u.x))[0];
    if(!t)return;
    af285Dmg(u,t,u.atk*.65,true,'#f6e4bd');
    af285Emit('bone_wall',u,{x0:t.x,life:.44});
  }
};

AF285_DEFS.af37_kesifci={
  group:5,role:'menzilli',status:'dönüştürüldü',name:'İz Oku',icon:'🏹',
  cd:5.2,first:1.05,wind:.28,cast:.36,rec:.22,retarget:true,sfx:['hit','shoot'],
  desc:'Öndeki düşmana işaret oku atar. Ok isabet ederse diğer dost saldırganlar 3 saniye boyunca bu hedefe %15 ek hasar verir.',
  plan(u){const t=af285Front(u,.30).find(v=>!v.isBarrier&&Math.abs(v.x-u.x)>.07);return t?{t}:null;},
  onCast(u,c){af285Emit('scout_arrow',u,{x1:c.x,life:this.cast});},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,.34))return;
    if(af285Dmg(u,t,u.atk*.6,true,'#ebee95')>0&&t.hp>0){
      t._af285MarkBy=u;
      t._af285MarkUntil=elapsed+3;
      af285Emit('scout_mark',u,{x0:t.x,a:t.uid,life:3});
    }
  }
};

AF285_VFX.scout_arrow=function(f,p){
  const a=af285At(f.lane,f.x0),target=af285At(f.lane,f.x1);
  const x=a.x+(target.x-a.x)*p,y=a.y+(target.y-a.y)*p-a.px*.55;
  ctx.strokeStyle='#f7eb8d';ctx.lineWidth=2;ctx.beginPath();
  ctx.moveTo(x-(target.x-a.x)*.17,y+2);ctx.lineTo(x,y);ctx.stroke();
};
AF285_VFX.scout_mark=function(f,p){
  const target=af285Unit(f.a,f.team==='ally'?'enemy':'ally');
  if(!target||target.hp<=0)return;
  const at=af285Pos(target),r=at.px*.12;
  ctx.globalAlpha=(1-p)*.75;
  ctx.strokeStyle='#fff189';ctx.lineWidth=1.6;ctx.beginPath();
  ctx.arc(at.x,at.y-at.px*.70,r,0,Math.PI*2);ctx.stroke();
};

function af285Partner(u,t){
  return af285Allies(u,.08).filter(v=>!v.isSummon&&(v.stunUntil||0)<=elapsed&&
    !af285Busy(v)&&Math.abs(v.x-t.x)<=unitAttackRange(v)+.012)
    .sort((a,b)=>Math.abs(a.x-t.x)-Math.abs(b.x-t.x))[0];
}
AF285_DEFS.af37_kilicli_asker={
  group:5,role:'savaşçı',status:'dönüştürüldü',name:'Yan Yana',icon:'⚔️',
  cd:4.7,first:.8,wind:.24,cast:.23,hit:.85,rec:.24,retarget:true,sfx:['hit','slash'],
  desc:'Yakındaki dost aynı hedefe yetişebiliyorsa ikisi ardışık olarak gerçek kılıç darbesi indirir.',
  plan(u){const t=af285Front(u,unitAttackRange(u)+.015)[0];return t&&af285Partner(u,t)?{t}:null;},
  impact(u,c){
    const t=c.t;if(!af285ValidTarget(u,t,unitAttackRange(u)+.017))return;
    const p=af285Partner(u,t);if(!p)return;
    af285Dmg(u,t,u.atk*.65,true,'#ffcc97');
    af285Emit('bone_wall',u,{x0:t.x,life:.28});
    af285Later(.10,()=>{
      if(!playing||!units.includes(p)||!af285Free(p)||!af285ValidTarget(p,t,unitAttackRange(p)+.012))return;
      p.attackAnim=.2;
      af285Dmg(p,t,p.atk*.48,true,'#ffdfad');
      af285Emit('bone_wall',u,{x0:t.x,life:.30});
    });
  }
};

for(const type of Object.keys(AF285_DEFS)){
  if(AF285_DEFS[type].group===5)AF285_CONVERTED.add(type);
}
