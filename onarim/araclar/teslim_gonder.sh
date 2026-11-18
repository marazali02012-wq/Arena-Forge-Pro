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
bash onarim/cikti_v263/testler/testleri_calistir.sh "$O" | tail -4
Z="$TMP/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.zip"
zip -q -r -9 "$Z" onarim/cikti_v263 onarim/araclar/patch_v263.py onarim/araclar/html_scriptlerini_ayir.py \
  onarim/araclar/varlik_tarama.py onarim/araclar/zip_parcala.py onarim/araclar/teslim_gonder.sh \
  onarim/testler/test_logic.js onarim/testler/test_portraits261.js app/src/main/java/com/arenaforgepro/game/GameActivity.java
rm -rf onarim/teslim_v263
python3 -I onarim/araclar/zip_parcala.py "$Z" onarim/teslim_v263 27 | tail -1
# birleştirme denemesi (boş klasörde)
mkdir "$TMP/b" && cp onarim/teslim_v263/*_PARCA_*.zip "$TMP/b/" && (cd "$TMP/b" && unzip -q -o *_PARCA_01.zip BIRLESTIR_VE_DOGRULA.py PARCA_KONTROL.json && python3 -I BIRLESTIR_VE_DOGRULA.py | head -1)
rm -rf "$TMP"
git add -A onarim app/src/main/java/com/arenaforgepro/game/GameActivity.java
git commit -q -m "$MSG

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01FuzneiTiwc5H1mRNSJtH4Q"
for i in 1 2 3 4; do git push -q origin HEAD 2>&1 | tail -1 && break || sleep $((2**i)); done
git log --oneline -1
