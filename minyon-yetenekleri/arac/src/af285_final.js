/* ---- eski tetiklemeyi devre dışı bırak (yalnız dönüştürülen kartlar; enerji bedeli AF267_RULES'tan okunmaya devam eder) ---- */
{
  const base=af267Rule;
  af267Rule=function(u){const r=base(u);return r&&AF285_CONVERTED.has(af264Type(u))?null:r;};
}
/* ---- kart bilgi metinleri ---- */
for(const [type,def] of Object.entries(AF285_DEFS)){
  const text=def.name+' (özel yetenek · '+String(def.cd).replace('.',',')+' sn bekleme): '+def.desc+(def.keep&&def.status==='eklendi'?' · '+def.keep:'');
  HERO_ABILITIES[type]=text;
  AF327_PASSIVES[type]=Object.assign({},AF327_PASSIVES[type]||{},{n:def.name,d:def.desc});
}
function af285Snapshot(u){
  if(!u||!AF285_DEFS[u.heroType])return null;
  return {s:u._af285S|0,a:+(u._af285A||0).toFixed(3),b:+(u._af285B||0).toFixed(3),ready:+((u._af285R||0)-elapsed).toFixed(2),n:u._af285N|0,
    x:Number.isFinite(u._af285X)?+u._af285X.toFixed(4):null,ward:Math.max(0,(u._af285Ward||0)-elapsed),aegis:Math.max(0,(u._af285Aegis||0)-elapsed)};
}
window.AF285Abilities=Object.freeze({
  version:AF285_VER,
  list:()=>Object.entries(AF285_DEFS).map(([id,d])=>({id,group:d.group,name:d.name,role:d.role,status:d.status,cd:d.cd,wind:d.wind,cast:d.cast,rec:d.rec,desc:d.desc})),
  stats:()=>JSON.parse(JSON.stringify(AF285_STATS)),
  has:t=>!!AF285_DEFS[t]
});

/* Ağda ikinci koltuk, ev sahibinin aldığı kararları ve savaş saatini çizer. */
{
  const simulate=tick;
  tick=function(ts){
    if(!playing||af285Sim())return simulate.call(this,ts);
    const dt=Math.max(0,Math.min(.1,(ts-last)/1000||0));
    last=lastPresentedFrame=ts;
    try{if(!battlePaused)draw(dt);}
    finally{
      if(af316Raf)cancelAnimationFrame(af316Raf);
      if(playing)af316Raf=requestAnimationFrame(tick);
    }
  };
}
