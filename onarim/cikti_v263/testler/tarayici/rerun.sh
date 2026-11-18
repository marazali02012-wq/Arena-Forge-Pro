#!/bin/bash
# YALNIZ TEST: belirli tur listesini temiz başlangıçla (her tur öncesi sayfa yeniden yüklenir) oynatır.
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/pw/d.py"
OUT=$S/rerun_results.jsonl; : > $OUT
RUNS=${RUNS:-"tower:loss echo:loss arena:win arena:loss arena:forfeit dark:win dark:loss dark:forfeit secret:win secret:loss secret:forfeit"}
fresh(){
 $D goto http://127.0.0.1:8765/t263.html >/dev/null; $D wait 2000 >/dev/null
 $D eval 'localStorage.setItem("afpFtueOffV1","1");const h=document.getElementById("afqEntry");const sr=h&&h.shadowRoot;const b=sr&&[...sr.querySelectorAll("button.alt")].find(x=>/Misafir/.test(x.innerText)&&x.getBoundingClientRect().width);if(b)b.click();return 1' >/dev/null
 $D wait 2500 >/dev/null
 $D eval 'const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/^ATLA/.test(x.innerText.trim()));if(b)b.click();const f=document.getElementById("afpFtue");if(f)f.remove();return 1' >/dev/null
 $D wait 800 >/dev/null
 $D eval "$(cat $S/pw/bot.js)" >/dev/null
 $D eval 'const p=__AFE("profile");p.trophies=Math.max(400,+p.trophies||0);p.bestFloor=Math.max(10,+p.bestFloor||0);p.wins=Math.max(5,+p.wins||0);p.af35Secret=p.af35Secret||{};p.af35Secret.darkWins=Math.max(3,+p.af35Secret.darkWins||0);__AFE("saveProfile()");window.__TYPES=window.__TYPES||new Set();setInterval(()=>{try{for(const u of __AFE("units"))if(u&&u.heroType)window.__TYPES.add(u.heroType);localStorage.setItem("__types",JSON.stringify([...new Set([...JSON.parse(localStorage.getItem("__types")||"[]"),...window.__TYPES])]));}catch(_){}},1500);return 1' >/dev/null
}
for RM in $RUNS; do
 M=${RM%%:*}; R=${RM##*:}
 fresh
 W=60; [ "$M" = "arena" ] && W=150
 if ! WAITS=$W $S/pw/startmode.sh $M >/dev/null; then echo "{\"mode\":\"$M\",\"run\":\"$R\",\"start\":false}" >> $OUT; continue; fi
 GOT=$($D eval 'return __AFE("gameMode")+"/"+__AFE("af35MatchKind")')
 case "$M" in arena) EXP="duel|arena";; dark) EXP="duel/dark";; secret) EXP="duel/secret";; colossus) EXP="boss";; *) EXP="$M";; esac
 if ! echo "$GOT" | grep -Eq "^($EXP)"; then echo "{\"mode\":\"$M\",\"run\":\"$R\",\"start\":true,\"wrongMode\":\"$GOT\"}" >> $OUT; continue; fi
 $D eval '__bot(true,{speed:2});return 1' >/dev/null
 $D wait 6000 >/dev/null
 $D eval 'window.__startErr=window.__arenaForgeTickErrors||0;return 1' >/dev/null
 case $R in
  win)
   if [ "$M" = "echo" ]; then
     for i in $(seq 1 60); do $D wait 3000 >/dev/null; P=$($D eval 'const r=__AFE("af203Run")||{};if(!__AFE("playing"))return "end";if(r.pausedForChoice){const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/RÜN ZIRHI|GÖK AKINI|CAN DOKUSU/.test(x.innerText));if(b)b.click();return "choice";}if(r.bossUnit&&r.bossUnit.hp>1){r.bossUnit.hp=1;return "boss";}return "play"'); [ "$P" = "end" ] && break; done
   else $D eval 'try{__AFE("enemySharedHP=2")}catch(e){}return 1' >/dev/null; fi;;
  loss) $D eval '__bot(false);try{__AFE("allySharedHP=1")}catch(e){}return 1' >/dev/null;;
  forfeit) $D eval 'document.getElementById("exitBattle").click();return 1' >/dev/null; $D wait 500 >/dev/null; $D eval 'document.getElementById("af274ExitYes").click();return 1' >/dev/null;;
 esac
 for i in $(seq 1 60); do $D wait 2000 >/dev/null; P=$($D eval 'return String(__AFE("playing"))'); [ "$P" = "false" ] && break; done
 $D eval '__bot(false);return 1' >/dev/null
 $D wait 3500 >/dev/null
 $D shot sweep/${M}_${R}_v2 >/dev/null
 RES=$($D eval 'const t=document.getElementById("endTitle"),l=document.getElementById("rewardLine");const tiles=[...document.querySelectorAll(".afqv-tile")].map(x=>x.querySelector("small").textContent+"="+x.dataset.v+(x.querySelector("img").naturalWidth?"":"(GÖRSEL YOK)"));return JSON.stringify({playing:__AFE("playing"),gm:__AFE("gameMode"),title:t&&t.textContent,line:l&&l.textContent.slice(0,170),tiles,tickErr:(window.__arenaForgeTickErrors||0)-(window.__startErr||0)})')
 $D eval 'const b=[...document.querySelectorAll("button,[data-af39]")].find(x=>x.offsetParent&&/DEVAM|MODA DÖN|Moda Dön/.test(x.innerText));if(b){b.click();return b.innerText.trim();}const m=document.querySelector("#end [data-af39=menu]");if(m){m.click();return "menu";}return "düğme yok"' > $S/sweep_btn.txt
 $D wait 2000 >/dev/null
 AFTER=$($D eval 'const ms=document.getElementById("afxModeScreen");const hub=document.getElementById("af207Mount");const end=document.getElementById("end");return JSON.stringify({modeScreen:ms&&!ms.hidden?(ms.dataset.mode||"evet"):"",hub:!!(hub&&hub.getBoundingClientRect().width&&getComputedStyle(hub).display!=="none"),endOpen:!!(end&&!end.classList.contains("hide"))})')
 $D shot sweep/${M}_${R}_v2_sonra >/dev/null
 echo "{\"mode\":\"$M\",\"run\":\"$R\",\"start\":true,\"got\":\"$GOT\",\"res\":$RES,\"button\":\"$(cat $S/sweep_btn.txt | tr -d '\n"')\",\"after\":$AFTER}" >> $OUT
done
$D eval 'return localStorage.getItem("__types")' > $S/sweep_types.json
$D logs > $S/rerun_logs.json
echo BİTTİ >> $OUT
