window.audit288=function(){
 const rows=[];
 const qa=window.__AF285QA;
 for(const id of AF59_ACTIVE_SET){
  profile.unlocked[id]=true;
  if(afp182PassOnly(id))(profile.afp182PremiumMinionsOwned||={})[id]=true;
  battleHandSlots=['measure'];battleCardMap.measure={id:'measure',type:id};
  renderBattleRoster();
  const shown=Number(document.querySelector('#battleRoster .battleEnergyCost')?.textContent);
  for(const team of ['ally','enemy']){
   qa.clearUnits();
   const info=HERO_INFO[id],cost=energyCost(id),paid=af334CardCost(id,team);
   const play=qa.play(team,id,1,team==='ally'?.2:.8);
   if(!play.ok||play.spent!==paid||shown!==cost)throw Error(id+' '+team+' '+JSON.stringify({play,paid,shown,cost}));
   const members=units.filter(u=>u.heroType===id&&u.team===team);
   if(members.length!==af214MemberCount(id))throw Error(id+' formation');
   const u=members[0],r=af320Resolve(u);
   const size=af320PxFor(r.cls,1,r.artBulk);
   if(!(size>0&&size<H*.19&&u.atk>0&&u.hp>0))throw Error(id+' body/stats');
   const hp=members.reduce((v,m)=>v+m.maxHp,0),hit=members.reduce((v,m)=>v+m.atk,0);
   const stats=team==='ally'?heroStats(id):af329Stats(id,af329.pve?af329.lv:heroLevel(id));
   if(hp!==stats.hp||hit!==stats.atk)throw Error(id+' budget '+JSON.stringify({hp,hit,stats}));
   rows.push({id,name:info.name,team,cost,spent:play.spent,count:members.length,cardHP:hp,cardHit:hit,period:u.attackPeriod,height:size});
  }
 }
 const height=id=>rows.find(v=>v.id===id).height;
 if(!(height('af37_iskelet_savasci')<height('af37_orman_okcu')&&height('af37_orman_okcu')<height('af37_tas_devi')))throw Error('height order');
 return rows;
};
