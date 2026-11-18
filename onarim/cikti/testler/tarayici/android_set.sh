#!/bin/bash
# YALNIZ TEST: bir ekran ölçüsünde rapor için ekran görüntüsü seti alır.  android_set.sh W H
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/tarayici/d.py"
W=$1; H=$2; T=${W}x${H}; OUT=android
mkdir -p $S/shots/$OUT
$D viewport $W $H 2 fresh >/dev/null
$D goto http://127.0.0.1:8765/t262.html >/dev/null
$D wait 1200 >/dev/null
$D shot $OUT/${T}_01_giris dev >/dev/null
$D eval 'const sr=document.getElementById("afqEntry").shadowRoot;[...sr.querySelectorAll("button.alt")].find(x=>/Misafir/.test(x.innerText)).click();return 1' >/dev/null
$D wait 2000 >/dev/null
# hikâye girişi varsa atla
$D eval 'const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/ATLA/.test(x.innerText));if(b)b.click();return !!b' >/dev/null
$D wait 1500 >/dev/null
$D shot $OUT/${T}_02_ilk_minyon dev >/dev/null
$D eval 'localStorage.setItem("afpFtueOffV1","1");const f=document.getElementById("afpFtue");if(f)f.remove();try{__AFE("AF324&&AF324.go(\"home\")")}catch(e){}return 1' >/dev/null
$D eval "$(cat $S/tarayici/bot.js)" >/dev/null
$D wait 1200 >/dev/null
# rehber balonunu kapat
$D eval 'const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/^KAPAT$/.test(x.innerText.trim()));if(b)b.click();return !!b' >/dev/null
$D wait 500 >/dev/null
$D shot $OUT/${T}_03_ana_us dev >/dev/null
$D tap $($S/tarayici/findbtn.sh modes) >/dev/null; $D wait 1000 >/dev/null
$D shot $OUT/${T}_04_mod_galerisi dev >/dev/null
$D tap $($S/tarayici/findbtn.sh mode:campaign) >/dev/null; $D wait 1500 >/dev/null
$D shot $OUT/${T}_05_hikaye_seferi dev >/dev/null
$D tap 45 22 >/dev/null; $D wait 1000 >/dev/null
$D eval 'try{__AFE("AF324&&AF324.go(\"home\")")}catch(e){}window.__afVsPass=true;__AFE("startGame(\"tower\")");return 1' >/dev/null
$D eval 'return __bot(true,{speed:2})' >/dev/null
$D wait 9000 >/dev/null
$D shot $OUT/${T}_06_savas_kule dev >/dev/null
for i in $(seq 1 14); do $D wait 6000 >/dev/null; P=$($D eval 'return String(__AFE("playing"))'); [ "$P" = "false" ] && break; done
$D wait 2500 >/dev/null
$D shot $OUT/${T}_07_sonuc dev >/dev/null
$D eval 'return JSON.stringify({size:innerWidth+"x"+innerHeight,dpr:devicePixelRatio,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,err:window.__arenaForgeTickErrors||0})'
