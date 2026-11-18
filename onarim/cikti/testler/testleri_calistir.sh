#!/bin/bash
# Bütün kod testlerini verilen HTML üzerinde çalıştırır (Python 3 + Node.js gerekir).
# Kullanım: bash testleri_calistir.sh <oyun.html>
# 1) 105 çalıştırılabilir JS bloğunun sözdizimi  2) eski 17 savaş testi  3) eski 10 kart portresi testi
# 4) v3.60.262 regresyon testleri (9). Hiçbiri gerçek oynanış testi değildir; tarayıcı testleri tarayici/ klasöründe.
set -e
HTML=$(realpath "$1")
HERE=$(cd "$(dirname "$0")" && pwd)
ONARIM=$(cd "$HERE/../.." && pwd)
TMP=$(mktemp -d)
mkdir -p "$TMP/01_CALISMA_DOSYASI" "$TMP/04_TESTLER" "$TMP/06_ARACLAR"
cp "$HTML" "$TMP/01_CALISMA_DOSYASI/ARENA_FORGE_PRO_v3.60.261_CALISMA_KOPYASI.html"   # eski testlerin beklediği yol
cp "$ONARIM/testler/test_logic.js" "$ONARIM/testler/test_portraits261.js" "$TMP/04_TESTLER/"
cp "$ONARIM/araclar/html_scriptlerini_ayir.py" "$TMP/06_ARACLAR/"
cd "$TMP"
python3 06_ARACLAR/html_scriptlerini_ayir.py
cd 04_TESTLER/_uretilen_scriptler
n=0; bad=0
for f in $(python3 -c "
import json;idx=json.load(open('script_index.json'))
print(' '.join('script_%03d.js'%x['no'] for x in idx if 'application/json' not in x['attributes'] and 'text/plain' not in x['attributes']))"); do
  n=$((n+1)); node --check "$f" 2>/dev/null || { bad=$((bad+1)); echo "SÖZDİZİMİ HATASI $f"; }
done
echo "SÖZDİZİMİ: denetlenen=$n hata=$bad"
cd "$TMP"
node 04_TESTLER/test_logic.js | tail -1
node 04_TESTLER/test_portraits261.js | tail -1
node "$HERE/test_v262.js" "$HTML" | tail -1
rm -rf "$TMP"
[ "$bad" = "0" ]
