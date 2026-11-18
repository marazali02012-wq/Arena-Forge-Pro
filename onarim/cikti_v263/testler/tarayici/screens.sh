#!/bin/bash
# YALNIZ TEST: ana üs ekranlarını üç ölçüde açar; taşma (clipscan), görsel (imgscan), hata ve ekran görüntüsü kaydeder.
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/pw/d.py"
OUT=$S/screens_results.jsonl; : > $OUT
mkdir -p $S/shots/screens
for SZ in "740 360" "667 375" "800 360"; do
 set -- $SZ; W=$1; H=$2
 $D viewport $W $H 1 fresh >/dev/null
 $D goto http://127.0.0.1:8765/t263.html >/dev/null; $D wait 1500 >/dev/null
 $D eval 'localStorage.setItem("afpFtueOffV1","1");const sr=document.getElementById("afqEntry").shadowRoot;[...sr.querySelectorAll("button.alt")].find(x=>/Misafir/.test(x.innerText)).click();return 1' >/dev/null
 $D wait 2500 >/dev/null
 $D eval 'const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/ATLA/.test(x.innerText));if(b)b.click();const f=document.getElementById("afpFtue");if(f)f.remove();window.__PERR=[];addEventListener("error",e=>window.__PERR.push(String(e.message).slice(0,160)));return 1' >/dev/null
 $D wait 1200 >/dev/null
 $D logs clear >/dev/null
 for A in home deck heroes minions spells upgrade inventory collection road pass packs shop daily weekly achievements events inbox profile settings guild mode:campaign; do
  $D eval 'try{__AFE("AF324&&AF324.go(\"home\")")}catch(e){}const b=document.querySelector("#afxModeScreen:not([hidden]) [data-afx-ms=back]");if(b)b.click();document.querySelectorAll(".c-x,[data-af36close]").forEach(x=>{if(x.offsetParent)x.click()});return 1' >/dev/null
  $D wait 900 >/dev/null
  if [ "$A" != "home" ]; then P=$($S/pw/findbtn.sh $A); if [ "$P" = "yok" ]; then echo "{\"size\":\"${W}x${H}\",\"screen\":\"$A\",\"open\":false}" >> $OUT; continue; fi; $D tap $P >/dev/null; $D wait 1800 >/dev/null; fi
  $D shot screens/${W}x${H}_$(echo $A | tr ':' '_') >/dev/null
  CLIP=$($D eval "$(cat $S/pw/clipscan.js)")
  IMG=$($D eval "$(cat $S/pw/imgscan.js)")
  PG=$($D eval 'return JSON.stringify({sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,perr:window.__PERR.length})')
  echo "{\"size\":\"${W}x${H}\",\"screen\":\"$A\",\"open\":true,\"clip\":$CLIP,\"img\":$IMG,\"page\":$PG}" >> $OUT
 done
 $D logs > $S/screens_logs_${W}x${H}.json
done
echo BİTTİ >> $OUT
