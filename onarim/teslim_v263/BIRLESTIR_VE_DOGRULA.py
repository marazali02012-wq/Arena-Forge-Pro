#!/usr/bin/env python3
# Python 3 ile çalıştır: python BIRLESTIR_VE_DOGRULA.py   (bütün PARCA_xx.zip dosyaları bu dosyayla aynı klasörde olmalı)
from pathlib import Path
import hashlib, json, zipfile, sys
P = Path(__file__).resolve().parent
M = json.loads((P / 'PARCA_KONTROL.json').read_text(encoding='utf8'))
for part in M['parts']:
    if not (P / part['zip_name']).is_file():
        sys.exit('EKSİK PARÇA: ' + part['zip_name'])
out = P / M['source_file']
h = hashlib.sha256()
with out.open('wb') as target:
    for part in M['parts']:
        with zipfile.ZipFile(P / part['zip_name']) as z:
            data = z.read(part['member_name'])
        if len(data) != part['bytes'] or hashlib.sha256(data).hexdigest() != part['sha256']:
            sys.exit('HATALI PARÇA: ' + part['zip_name'])
        target.write(data); h.update(data)
if out.stat().st_size != M['original_size_bytes'] or h.hexdigest() != M['original_sha256']:
    out.unlink(missing_ok=True); sys.exit('BİRLEŞTİRME HATASI / SHA-256 UYUŞMUYOR')
with zipfile.ZipFile(out) as z:
    bad = z.testzip()
    if bad: sys.exit('ARŞİV HASARLI: ' + bad)
    n = len(z.namelist())
print('TAMAM:', out.name, '| toplam', n, 'dosya | SHA-256:', M['original_sha256'])
print('Sonraki adım: arşivi aç ve onarim/cikti_v263/OKU_BENI.md dosyasını oku.')
