#!/bin/bash
# YALNIZ TEST: verilen start ifadesiyle maçı başlat, N sn sonra X → Evet ile pes et, profil farkını yazdır.
# kullanım: surrender.sh '<başlatma js>' [bekleme_ms]
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/pw/d.py"
[ -z "$NOSNAP" ] && $D eval '__snap("once");return 1' >/dev/null
$D eval "$1" >/dev/null
for i in $(seq 1 40); do $D wait 1000 >/dev/null; P=$($D eval 'return String(__AFE("playing"))'); [ "$P" = "true" ] && break; done
$D wait ${2:-4000} >/dev/null
$D eval 'return "oynuyor="+__AFE("playing")+" mod="+__AFE("gameMode")+" t="+__AFE("elapsed").toFixed(1)'
$D eval 'document.getElementById("exitBattle").click();return 1' >/dev/null
$D wait 500 >/dev/null
$D eval 'document.getElementById("af274ExitYes").click();return 1' >/dev/null
$D wait 2500 >/dev/null
$D eval '__snap("sonra");return JSON.stringify({playing:__AFE("playing"),title:(document.getElementById("endTitle")||{}).textContent,line:(document.getElementById("rewardLine")||{}).textContent,diff:__diff("once","sonra")})'
