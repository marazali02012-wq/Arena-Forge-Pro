#!/bin/bash
# YALNIZ TEST: 9 mod × (zafer, yenilgi, pes) tarayıcı taraması. Sonuçlar JSON satırı olarak $OUT'a yazılır.
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/pw/d.py"
OUT=$S/sweep_results.jsonl; : > $OUT
mkdir -p $S/shots/sweep
$D viewport 740 360 1 fresh >/dev/null
$D goto http://127.0.0.1:8765/t263.html >/dev/null; $D wait 1500 >/dev/null
$D eval 'localStorage.setItem("afpFtueOffV1","1");const sr=document.getElementById("afqEntry").shadowRoot;[...sr.querySelectorAll("button.alt")].find(x=>/Misafir/.test(x.innerText)).click();return 1' >/dev/null
$D wait 2500 >/dev/null
$D eval 'const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/ATLA/.test(x.innerText));if(b)b.click();const f=document.getElementById("afpFtue");if(f)f.remove();return 1' >/dev/null
$D wait 1000 >/dev/null
$D eval "$(cat $S/pw/bot.js)" >/dev/null
# Kilitli modlar için test şartları (raporda belirtilir) ve sahadaki birlik türü kaydı
$D eval 'const p=__AFE("profile");p.trophies=400;p.bestFloor=10;p.wins=Math.max(5,+p.wins||0);p.af35Secret=p.af35Secret||{};p.af35Secret.darkWins=3;__AFE("saveProfile()");window.__TYPES=new Set();setInterval(()=>{try{for(const u of __AFE("units"))if(u&&u.heroType)window.__TYPES.add(u.heroType);}catch(_){}},1500);window.__PERR=[];addEventListener("error",e=>window.__PERR.push(String(e.message).slice(0,160)));return 1' >/dev/null
$D logs clear >/dev/null
for M in tower campaign sky flag colossus echo arena dark secret; do
 for R in win loss forfeit; do
  W=60; [ "$M" = "arena" ] || [ "$M" = "flag" ] && W=150
  if ! WAITS=$W $S/pw/startmode.sh $M >/dev/null; then echo "{\"mode\":\"$M\",\"run\":\"$R\",\"start\":false}" >> $OUT; continue; fi
  $D eval '__bot(true,{speed:2});return 1' >/dev/null
  $D wait 6000 >/dev/null
  $D eval 'window.__startErr=window.__arenaForgeTickErrors||0;return 1' >/dev/null
  case $R in
   win)
    if [ "$M" = "echo" ]; then
      for i in $(seq 1 60); do $D wait 3000 >/dev/null; P=$($D eval 'const r=__AFE("af203Run")||{};if(!__AFE("playing"))return "end";if(r.pausedForChoice){const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/RÜN ZIRHI|GÖK AKINI|CAN DOKUSU/.test(x.innerText));if(b)b.click();return "choice";}if(r.bossUnit&&r.bossUnit.hp>1){r.bossUnit.hp=1;return "boss";}if(!r.bossSpawned)__AFE("enemySharedHP=Math.min(enemySharedHP,999)");return "play"'); [ "$P" = "end" ] && break; done
    else
      $D eval 'try{__AFE("enemySharedHP=2")}catch(e){}return 1' >/dev/null
    fi;;
   loss) $D eval 'try{__AFE("allySharedHP=2")}catch(e){}return 1' >/dev/null;;
   forfeit) $D eval 'document.getElementById("exitBattle").click();return 1' >/dev/null; $D wait 500 >/dev/null; $D eval 'document.getElementById("af274ExitYes").click();return 1' >/dev/null;;
  esac
  for i in $(seq 1 40); do $D wait 2000 >/dev/null; P=$($D eval 'return String(__AFE("playing"))'); [ "$P" = "false" ] && break; done
  $D eval '__bot(false);return 1' >/dev/null
  $D wait 3500 >/dev/null
  $D shot sweep/${M}_${R} >/dev/null
  RES=$($D eval 'const t=document.getElementById("endTitle"),l=document.getElementById("rewardLine");const q=document.querySelector(".afqv-stage,[class*=afqv-title]");const tiles=[...document.querySelectorAll(".afqv-tile")].map(x=>x.querySelector("small").textContent+"="+x.dataset.v+(x.querySelector("img").naturalWidth?"":"(GÖRSEL YOK)"));return JSON.stringify({playing:__AFE("playing"),gm:__AFE("gameMode"),title:t&&t.textContent,line:l&&l.textContent.slice(0,170),tiles,tickErr:(window.__arenaForgeTickErrors||0)-(window.__startErr||0)})')
  # DEVAM / MODA DÖN / TEKRAR DENE'den sonra nereye dönüldüğü
  $D eval 'const b=[...document.querySelectorAll("button,[data-af39]")].find(x=>x.offsetParent&&/DEVAM|MODA DÖN|Moda Dön/.test(x.innerText));if(b){b.click();return b.innerText.trim();}const m=document.querySelector("#end [data-af39=menu]");if(m){m.click();return "menu";}return "düğme yok"' > $S/sweep_btn.txt
  $D wait 2000 >/dev/null
  AFTER=$($D eval 'const ms=document.getElementById("afxModeScreen");const hub=document.getElementById("af207Mount");const end=document.getElementById("end");const cs=document.getElementById("game");return JSON.stringify({modeScreen:ms&&!ms.hidden?(ms.dataset.mode||"evet"):"",hub:!!(hub&&hub.getBoundingClientRect().width&&getComputedStyle(hub).display!=="none"),endOpen:!!(end&&!end.classList.contains("hide")),black:(()=>{const e=document.elementFromPoint(370,180);return e?e.tagName+"#"+e.id:"yok"})()})')
  $D shot sweep/${M}_${R}_sonra >/dev/null
  echo "{\"mode\":\"$M\",\"run\":\"$R\",\"start\":true,\"res\":$RES,\"button\":\"$(cat $S/sweep_btn.txt | tr -d '\n"')\",\"after\":$AFTER}" >> $OUT
 done
done
$D eval 'return JSON.stringify({types:[...window.__TYPES],pageErrors:window.__PERR})' > $S/sweep_types.json
$D logs > $S/sweep_logs.json
echo BİTTİ >> $OUT
