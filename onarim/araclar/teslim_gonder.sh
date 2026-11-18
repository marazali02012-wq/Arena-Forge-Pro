#!/bin/bash
# Her düzeltmeden sonra: v3.60.263'ü yamadan yeniden üret, kod testlerini çalıştır, teslim ZIP'ini
# 27 MB parçalara böl, birleştirmeyi doğrula, commit et ve GitHub'a gönder.
# Kullanım: bash onarim/araclar/teslim_gonder.sh "commit mesajı"
set -e
REPO=$(cd "$(dirname "$0")/../.." && pwd)
cd "$REPO"
MSG="$1"; [ -n "$MSG" ] || { echo "commit mesajı gerekli"; exit 2; }
TMP=$(mktemp -d)
O=onarim/cikti_v263/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html
python3 -I onarim/araclar/patch_v263.py onarim/cikti/ARENA_FORGE_PRO_v3.60.262.html "$O" | tail -1
T=$(bash onarim/cikti_v263/testler/testleri_calistir.sh "$O" 2>&1 | grep -E "^(SONUÇ|SÖZDİZİMİ)")
echo "$T"
# 4 sonuç satırı olmalı ve hepsi tam geçmeli; aksi hâlde gönderme.
[ "$(echo "$T" | grep -c '^SONUÇ')" = 3 ] && echo "$T" | grep -q "hata=0" && echo "$T" | awk '/^SONUÇ/{split($2,a,"/"); if(a[1]!=a[2]) bad=1} END{exit bad}' || { echo "TEST BAŞARISIZ: gönderilmedi"; exit 3; }
# Android: testleri geçen HTML, uygulamanın gömülü oyunu olur (Android'e özel köprüler 263'te zaten var; bkz. ANDROID_AKTARIM.md)
cp "$O" app/src/main/assets/www/index.html
cmp -s "$O" app/src/main/assets/www/index.html && echo "Android varlığı eşitlendi: $(sha256sum app/src/main/assets/www/index.html | cut -c1-16)"
Z="$TMP/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.zip"
zip -q -r -9 "$Z" onarim/cikti_v263 onarim/araclar/patch_v263.py onarim/araclar/html_scriptlerini_ayir.py \
  onarim/araclar/varlik_tarama.py onarim/araclar/zip_parcala.py onarim/araclar/teslim_gonder.sh \
  onarim/testler/test_logic.js onarim/testler/test_portraits261.js app/src/main/java/com/arenaforgepro/game/GameActivity.java sunucu YAPMAN_GEREKENLER.md
rm -rf onarim/teslim_v263
python3 -I onarim/araclar/zip_parcala.py "$Z" onarim/teslim_v263 27 | tail -1
# birleştirme denemesi (boş klasörde)
mkdir "$TMP/b" && cp onarim/teslim_v263/*_PARCA_*.zip "$TMP/b/" && (cd "$TMP/b" && unzip -q -o *_PARCA_01.zip BIRLESTIR_VE_DOGRULA.py PARCA_KONTROL.json && python3 -I BIRLESTIR_VE_DOGRULA.py | head -1)
rm -rf "$TMP"
git add -A onarim sunucu varliklar YAPMAN_GEREKENLER.md yayin/eksikler app/src/main/java/com/arenaforgepro/game/GameActivity.java app/src/main/assets/www/index.html app/build.gradle
git commit -q -m "$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FuzneiTiwc5H1mRNSJtH4Q"
for i in 1 2 3 4; do git push -q origin HEAD 2>&1 | tail -1 && break || sleep $((2**i)); done
git log --oneline -1
