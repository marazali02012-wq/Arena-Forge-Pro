#!/usr/bin/env python3
"""Büyük bir ZIP'i, her biri tek başına geçerli ZIP olan, 30 MB altı parçalara böler.

Kullanım: python3 zip_parcala.py <kaynak.zip> <çıktı_klasörü> [parça_MB=27]
Her parça ZIP'in içinde: parcalar/bolum_NN.bin, BIRLESTIR_VE_DOGRULA.py, PARCA_KONTROL.json, OKU_ONCE.txt
"""
import sys, os, hashlib, json, zipfile

src, out = sys.argv[1], sys.argv[2]
mb = float(sys.argv[3]) if len(sys.argv) > 3 else 27
os.makedirs(out, exist_ok=True)
data = open(src, 'rb').read()
name = os.path.basename(src)
size = int(mb * 1024 * 1024)
chunks = [data[i:i + size] for i in range(0, len(data), size)]
stem = name[:-4]
parts = []
for i, c in enumerate(chunks, 1):
    parts.append({'index': i, 'zip_name': f'{stem}_PARCA_{i:02d}.zip', 'member_name': f'parcalar/bolum_{i:02d}.bin',
                  'bytes': len(c), 'sha256': hashlib.sha256(c).hexdigest()})
manifest = {'source_file': name, 'original_size_bytes': len(data), 'original_sha256': hashlib.sha256(data).hexdigest(),
            'part_count': len(parts), 'parts': parts}

MERGE = r'''#!/usr/bin/env python3
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
'''
README = f'''ARENA FORGE PRO v3.60.263 — TESLİM PAKETİ ({len(parts)} PARÇA, her biri 30 MB altı)

Bu parçalar tek tek oyun değildir. HEPSİNİ indirip aynı klasöre koyun.

BİRLEŞTİRME
1) {", ".join(p["zip_name"] for p in parts)} dosyalarının tamamını aynı klasöre koyun.
2) Herhangi bir parçanın içinden BIRLESTIR_VE_DOGRULA.py ve PARCA_KONTROL.json dosyalarını aynı klasöre çıkarın.
3) Terminalde:  python BIRLESTIR_VE_DOGRULA.py
4) Araç her parçanın SHA-256 değerini ve arşiv bütünlüğünü kontrol edip {name} dosyasını oluşturur.
5) {name} arşivini açın; oyun dosyası onarim/cikti_v263/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html

Python yoksa (yalnız birleştirme, doğrulama olmadan):
 - Her parçadan parcalar/bolum_NN.bin dosyasını çıkarın.
 - Windows:  copy /b bolum_01.bin+bolum_02.bin{"+..." if len(parts) > 2 else ""} {name}
 - Linux/Mac: cat bolum_*.bin > {name}

Asıl arşiv: {len(data)} bayt
Asıl SHA-256: {manifest["original_sha256"]}
'''
for p, c in zip(parts, chunks):
    with zipfile.ZipFile(os.path.join(out, p['zip_name']), 'w', zipfile.ZIP_STORED) as z:
        z.writestr(p['member_name'], c)
        z.writestr('BIRLESTIR_VE_DOGRULA.py', MERGE)
        z.writestr('PARCA_KONTROL.json', json.dumps(manifest, ensure_ascii=False, indent=2))
        z.writestr('OKU_ONCE.txt', README)
open(os.path.join(out, 'OKU_ONCE.txt'), 'w', encoding='utf-8').write(README)
open(os.path.join(out, 'PARCA_KONTROL.json'), 'w', encoding='utf-8').write(json.dumps(manifest, ensure_ascii=False, indent=2))
open(os.path.join(out, 'BIRLESTIR_VE_DOGRULA.py'), 'w', encoding='utf-8').write(MERGE)
for p in parts:
    print(p['zip_name'], os.path.getsize(os.path.join(out, p['zip_name'])), 'bayt')
print('asıl', len(data), manifest['original_sha256'])
