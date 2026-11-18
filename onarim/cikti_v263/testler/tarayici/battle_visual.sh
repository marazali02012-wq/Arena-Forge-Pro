#!/bin/bash
# YALNIZ TEST: savaş görsel denetimi. 3 ölçü × 4 mod. Sonuç: $S/bv_results.jsonl, ekran görüntüleri shots/bv/
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/pw/d.py"
OUT=$S/bv_results.jsonl; : > $OUT; mkdir -p $S/shots/bv
for SZ in "740 360" "667 375" "800 360"; do
 set -- $SZ; W=$1; H=$2
 $D viewport $W $H 2 fresh >/dev/null
 for M in tower flag echo colossus; do
  $D goto http://127.0.0.1:8765/t263.html >/dev/null; $D wait 2000 >/dev/null
  $D eval 'localStorage.setItem("afpFtueOffV1","1");const h=document.getElementById("afqEntry");const sr=h&&h.shadowRoot;const b=sr&&[...sr.querySelectorAll("button.alt")].find(x=>/Misafir/.test(x.innerText)&&x.getBoundingClientRect().width);if(b)b.click();return 1' >/dev/null
  $D wait 2500 >/dev/null
  $D eval 'const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/^ATLA/.test(x.innerText.trim()));if(b)b.click();const f=document.getElementById("afpFtue");if(f)f.remove();return 1' >/dev/null
  $D wait 800 >/dev/null
  $D eval "$(cat $S/pw/bot.js)" >/dev/null
  if ! WAITS=150 $S/pw/startmode.sh $M >/dev/null; then echo "{\"size\":\"${W}x${H}\",\"mode\":\"$M\",\"start\":false}" >> $OUT; continue; fi
  $D eval '__bot(true,{speed:1,every:500});window.__BA=[];window.__PERR=[];addEventListener("error",e=>window.__PERR.push(String(e.message).slice(0,160)));return 1' >/dev/null
  $D logs clear >/dev/null
  for k in 1 2 3 4 5 6 7 8; do
   $D wait 3500 >/dev/null
   P=$($D eval 'return String(__AFE("playing"))'); [ "$P" = "false" ] && break
   $D eval "$(cat $S/pw/battleaudit.js)" >/dev/null
   [ $k = 3 ] && $D shot bv/${W}x${H}_${M}_a dev >/dev/null
   [ $k = 6 ] && $D shot bv/${W}x${H}_${M}_b dev >/dev/null
   if [ $k = 4 ]; then FPS=$($D eval "$(cat $S/pw/fps.js)"); fi
  done
  BA=$($D eval 'return JSON.stringify(window.__BA||[])')
  ERR=$($D eval 'return JSON.stringify({tick:window.__arenaForgeTickErrors||0,perr:window.__PERR||[]})')
  echo "{\"size\":\"${W}x${H}\",\"mode\":\"$M\",\"start\":true,\"fps\":${FPS:-null},\"audit\":$BA,\"err\":$ERR}" >> $OUT
  $D eval '__bot(false);return 1' >/dev/null
 done
done
echo BİTTİ >> $OUT
