#!/bin/bash
# YALNIZ TEST: ana üsten modun lobisine gidip savaşı başlatır (oynanış başlayana kadar bekler).
# kullanım: startmode.sh <tower|campaign|sky|flag|colossus|arena|dark|secret|echo>
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/pw/d.py"
M=$1
$D eval 'try{__AFE("AF324&&AF324.go(\"home\")")}catch(e){}const b=document.querySelector("#afxModeScreen:not([hidden]) [data-afx-ms=back]");if(b)b.click();const e=document.getElementById("end");if(e&&!e.classList.contains("hide")){const m=e.querySelector("[data-af39=menu]");if(m)m.click();}return 1' >/dev/null
$D wait 900 >/dev/null
gal(){ $D tap $($S/pw/findbtn.sh modes) >/dev/null; $D wait 900 >/dev/null; $D tap $($S/pw/findbtn.sh mode:$1) >/dev/null; $D wait 1500 >/dev/null; }
case $M in
  tower) gal tower; $D tap 122 293 >/dev/null;;
  campaign) gal campaign; $D tap 122 293 >/dev/null;;
  sky) gal sky; $D tap 136 331 >/dev/null;;
  flag) $D tap $($S/pw/findbtn.sh mode:flag) >/dev/null; $D wait 1500 >/dev/null; $D tap 116 280 >/dev/null;;
  secret) gal secret; $D eval 'const b=[...document.querySelectorAll("#afxModeScreen button")].find(x=>x.offsetParent&&/KİLİDİ AÇ/.test(x.innerText));if(b){b.click();}return 1' >/dev/null; $D wait 1200 >/dev/null; $D tap 72 290 >/dev/null;;
  dark) gal dark; $D eval 'const b=[...document.querySelectorAll("#afxModeScreen button")].find(x=>x.offsetParent&&/KİLİDİ AÇ/.test(x.innerText));if(b){b.click();}return 1' >/dev/null; $D wait 1200 >/dev/null; $D tap 68 280 >/dev/null;;
  colossus) $D tap $($S/pw/findbtn.sh mode:colossus) >/dev/null; $D wait 1800 >/dev/null; $D tap 655 275 >/dev/null;;
  echo) $D tap $($S/pw/findbtn.sh mode:boss) >/dev/null; $D wait 1500 >/dev/null; $D tap 536 256 >/dev/null;;
  arena) $D tap $($S/pw/findbtn.sh mode:arena) >/dev/null; $D wait 1500 >/dev/null; $D tap 586 331 >/dev/null; $D wait 1500 >/dev/null; $D tap 370 338 >/dev/null;;
esac
for i in $(seq 1 ${WAITS:-45}); do
  $D wait 1000 >/dev/null
  P=$($D eval 'if(__AFE("playing"))return "true";const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/^(ATLA|SAVAŞA BAŞLA)$/.test(x.innerText.trim())&&x.closest("[class*=story],[class*=Story],[id*=story],[id*=Story],.afp-story,[role=dialog]"));if(b){b.click();return "atla";}return "false"')
  [ "$P" = "true" ] && { echo "başladı $M t=${i}s"; exit 0; }
done
echo "BAŞLAMADI $M"; exit 1
