from pathlib import Path
import asyncio,json
from harness import Game
p=Path(__file__).resolve().parent
s=(p/'ArenaForgePro_v288.html').read_text()
test="""
window.audit287=function(){
 const rows=[];
 for(const [id,answer] of Object.entries(AF287_ANSWERS)){
  for(const team of ['ally','enemy']){
   const unit=(type,side,x)=>({heroType:type,isRoster:true,team:side,lane:1,x,hp:500,maxHp:500,cd:1,atk:20,level:1,attackPeriod:1});
   const a=unit(answer,team,.5),t=unit(id,team==='ally'?'enemy':'ally',.54);
   units=[a,t];
   af285Begin(t,AF285_DEFS[id],{t:a});
   if(counterDamageMultiplier(a,t)!==1.10)throw Error(id+' multiplier');
   const d=af285Dmg(a,t,100,false);
   if(!d||t._af285S!==AF285_IDLE)throw Error(id+' '+team+' interrupt '+d);
   af285Begin(t,AF285_DEFS[id],{t:a});af285Dmg(a,t,100,false);
   if(t._af285S!==AF285_WIND)throw Error(id+' guard');
   for(const k of ['hp','atk','period','speed'])if(!(heroStats(id)[k]>0&&af329Stats(id,1)[k]>0))throw Error(id+k);
   rows.push([id,answer,team,d]);
  }
 }
 units=[];return rows;
};
window.hook287=function(guard){
 const unit=(heroType,team,x)=>({heroType,isRoster:true,team,lane:1,x,hp:500,maxHp:500,atk:16,level:1,cd:1,attackPeriod:1});
 const hook=unit('afn_zincir_kiran','ally',.35),archer=unit('af37_orman_okcu','enemy',.60),shield=unit('af37_agir_zirhli','enemy',.51);
 hook._af285R=elapsed+9;shield._af285Ward=elapsed+4;
 units=guard?[hook,shield,archer]:[hook,archer];
 const def=AF285_DEFS[hook.heroType];af285Begin(hook,def,def.plan(hook));
 for(const other of units.slice(1))other._af285R=elapsed+9;
 for(let i=0;i<40;i++){elapsed+=.04;af285Step(.04);}
 const r={x:archer.x,shield:shield.x,hp:archer.hp};
 units=[];return r;
};
"""
(p/'qa.html').write_text(s.replace('/* </AF285-BLOK> */',test+(p/'audit.js').read_text()+(p/'qa.js').read_text()+'\n/* </AF285-BLOK> */'))
async def run(w,h):
 async with Game(p/'qa.html',w,h,True) as g:
  assert await g.qa('AF285Abilities.list().length')==59
  await g.start_battle()
  cards=await g.qa('audit288()')
  await g.qa('__AF285QA.clearUnits()')
  for card, x in [('af37_iskelet_savasci',.18),('af37_orman_okcu',.46),('af37_tas_devi',.73)]:
   play=await g.play('ally',card,1,.2)
   assert play['ok'],play
   for i,uid in enumerate(play['uids']):
    await g.ev('([id,x])=>__AF285QA.move(id,"ally",x)',[uid,x+i*.065])
  await g.page.wait_for_timeout(600)
  await g.canvas_png(p/f'saha-{w}.png')
  rows=await g.qa('audit287()')
  modes={}
  for m in 'arena campaign tower sky flag dark secret echo colossus'.split():
   await g.ev('m=>__AF285QA.modeStart(m,1)',m)
   await g.page.wait_for_function('__AF285QA.modeRead().playing')
   await g.qa('__AF285QA.setManual(true)')
   start=await g.qa('__AF285QA.modeRead()')
   a=await g.qa('hook287(false)');b=await g.qa('hook287(true)')
   assert a['x']<.45 and a['hp']<500 and b['x']==.6 and b['shield']==.51,(m,a,b)
   modes[m]=[start['mode'],start['kind'],a,b]
  errors=[x for x in g.logs if x[0]=='pageerror' or 'etki hatası' in x[1]]
  assert not errors,errors
  print(w,len(rows),list(modes),errors,flush=True)
  (p/f'qa-{w}.json').write_text(json.dumps(dict(cards=cards,tests=rows,modes=modes,errors=errors),ensure_ascii=False))
asyncio.run(run(740,360))
asyncio.run(run(667,375))
