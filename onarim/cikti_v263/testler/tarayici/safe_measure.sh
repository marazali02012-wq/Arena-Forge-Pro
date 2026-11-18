#!/bin/bash
# YALNIZ TEST: çentik payı (safe-area) senaryosunda ana üs ve savaş yerleşimini ölçer.
# kullanım: safe_measure.sh <html> <genişlik> <sol_pay> <etiket>
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/pw/d.py"
HTML=$1; W=$2; L=$3; TAG=$4
$D viewport $W 360 2.5 fresh >/dev/null
$D safearea $L 0 >/dev/null
$D goto http://127.0.0.1:8765/$HTML >/dev/null; $D wait 2000 >/dev/null
$D eval 'localStorage.setItem("afpFtueOffV1","1");const sr=document.getElementById("afqEntry").shadowRoot;[...sr.querySelectorAll("button.alt")].find(x=>/Misafir/.test(x.innerText)).click();return 1' >/dev/null
$D wait 2500 >/dev/null
$D eval 'const b=[...document.querySelectorAll("button")].find(x=>x.offsetParent&&/^ATLA/.test(x.innerText.trim()));if(b)b.click();const f=document.getElementById("afpFtue");if(f)f.remove();return 1' >/dev/null
$D wait 1000 >/dev/null
$D shot safe/${TAG}_hub dev >/dev/null
$D eval 'const sr=document.getElementById("af207Mount").shadowRoot;let minL=1e9,bg=null;sr.querySelectorAll("button").forEach(b=>{const r=b.getBoundingClientRect();if(r.width>20)minL=Math.min(minL,r.left)});const fr=sr.querySelector(".frame");const fl=fr?fr.getBoundingClientRect():null;const env=getComputedStyle(fr).paddingLeft;return "ANA ÜS: en soldaki düğme x="+Math.round(minL)+" | çerçeve x="+(fl?Math.round(fl.left):"?")+" padding-left="+env+" | pencere="+innerWidth'
$D eval "$(cat $S/pw/bot.js)" >/dev/null
$D eval 'window.__afVsPass=true;__AFE("startGame(\"tower\")");return 1' >/dev/null
$D wait 3000 >/dev/null
$D shot safe/${TAG}_battle dev >/dev/null
$D eval 'const cv=document.getElementById("game").getBoundingClientRect();const L=+getComputedStyle(document.documentElement).getPropertyValue("--t")||0;const items=[];document.querySelectorAll("#hud *,.bottom *, .battlePick").forEach(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width<12||r.height<12||cs.display==="none"||cs.visibility==="hidden")return;if(e.children.length>3)return;if(r.left<40)items.push((e.id||String(e.className).slice(0,18))+"@"+Math.round(r.left))});return "SAVAŞ: tuval x="+Math.round(cv.left)+" genişlik="+Math.round(cv.width)+" | x<40 olan arayüz öğeleri: "+JSON.stringify([...new Set(items)].slice(0,10))'
