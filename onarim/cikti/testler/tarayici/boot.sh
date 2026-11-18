#!/bin/bash
# YALNIZ TEST: sayfayı aç, misafir girişi yap, botu kur. Kullanım: boot.sh <html> [w h dpr]
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/tarayici/d.py"
HTML=${1:-t261.html}
if [ -n "$2" ]; then $D viewport $2 $3 ${4:-1} >/dev/null; fi
$D goto http://127.0.0.1:8765/$HTML >/dev/null
$D wait 1500 >/dev/null
# giriş ekranı açıksa misafir düğmesine bas
$D eval 'const h=document.getElementById("afqEntry");const sr=h&&h.shadowRoot;if(!sr)return "giriş yok";const b=[...sr.querySelectorAll("button.alt")].find(x=>/Misafir/.test(x.innerText));if(b&&b.getBoundingClientRect().width){b.click();return "misafir"}return "giriş görünmüyor"'
$D wait 2500 >/dev/null
$D eval $S/tarayici/bot.js >/dev/null
$D eval 'return JSON.stringify({b:__AFE("profile.battles"),w:__AFE("profile.wins"),playing:__AFE("playing")})'
