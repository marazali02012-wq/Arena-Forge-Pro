/* Ortak portal kararı verilmeden önce zorunlu mod hedeflerini koru. */
function af285CampaignDefense(){
  if(gameMode!=='campaign')return false;
  const stage=afpCampaignBattleState();
  return afpStoryEncounter(stage.activeLevel||stage.level).kind==='defense';
}

function af285GuardianPending(){
  const level=gameMode==='tower'?af36TowerFloor():gameMode==='sky'?af36Run.level:0;
  return level>0&&level%5===0&&!af36Run.bossKilled;
}

function af285PrepareModeResult(){
  const echo=gameMode==='echo'&&af203Run?.active;
  if(echo&&(allySharedHP<=0||baseHP<=0)){
    endGame(false,'Savunma portalın düştü.',{title:'YANKI İSTİLASI · SAVUNMA DÜŞTÜ'});
    return true;
  }
  const guardian=af285GuardianPending();
  if(guardian&&enemySharedHP<=0&&af36BossPending())af36ForceBoss();
  if(enemySharedHP<=0&&(echo||af285CampaignDefense()||guardian)){
    enemySharedHP=1;
    enemyLaneHP.fill(1);
    if(elapsed-af36ShieldNoticeAt>4){
      af36ShieldNoticeAt=elapsed;
      showNotice(echo?'Yankı portalı kalkanlı: üç dalgayı ve Ayna Celladı’nı yen.':
        guardian?'Rakip portalı kalkanlı. Önce muhafızı yen.':
        'Rakip portalı kalkanlı. Süre dolana kadar savunmanı koru.');
    }
  }
  return false;
}

{
  const resolve=resolveMatchTimeout;
  resolveMatchTimeout=function(){
    if(playing&&af285GuardianPending()){
      endGame(false,'Süre doldu. Muhafız hâlâ ayakta.',{title:'MUHAFIZ YENİLEMEDİ'});
      return;
    }
    return resolve.apply(this,arguments);
  };

  const timeUp=af327TimeUp;
  af327TimeUp=function(){
    if(playing&&af285GuardianPending())return true;
    if(playing&&gameMode==='boss'){
      const raid=window.AFPBossRaidEngineV1;
      if(window.__AFPColossusPvEContext?.active||raid&&raid.stage()%5===0)return true;
    }
    return timeUp.apply(this,arguments);
  };
}
