#!/usr/bin/env python3
"""Tek dosya HTML içindeki gömülü görselleri tarar (salt okunur).

Kullanım: python3 varlik_tarama.py <oyun.html> [cikti.json]
Çıktı: tür/boyut dağılımı, birebir tekrarlanan veriler (boşa giden bayt), 1x1 yer tutucular,
çözülemeyen (bozuk) görseller.
"""
import sys, re, base64, hashlib, json, io, collections
from PIL import Image

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else None
s = open(src, encoding='utf-8').read()
total_bytes = len(s.encode('utf-8'))
rx = re.compile(r'data:image/(webp|png|jpeg|jpg|gif|svg\+xml);base64,([A-Za-z0-9+/=]+)')

by_hash = {}
kinds = collections.Counter()
b64_bytes = 0
broken = []
for m in rx.finditer(s):
    kind, b64 = m.group(1), m.group(2)
    b64_bytes += len(b64)
    kinds[kind] += 1
    h = hashlib.sha256(b64.encode()).hexdigest()
    rec = by_hash.get(h)
    if rec:
        rec['count'] += 1
        continue
    rec = {'kind': kind, 'b64len': len(b64), 'count': 1, 'first_offset': m.start()}
    try:
        raw = base64.b64decode(b64 + '=' * (-len(b64) % 4))
        rec['bytes'] = len(raw)
        if kind != 'svg+xml':
            im = Image.open(io.BytesIO(raw)); im.load()
            rec['w'], rec['h'] = im.size
    except Exception as e:
        rec['error'] = str(e)[:120]
        broken.append(m.start())
    by_hash[h] = rec

uniq = list(by_hash.values())
dups = [r for r in uniq if r['count'] > 1]
wasted = sum(r['b64len'] * (r['count'] - 1) for r in dups)
ones = [r for r in uniq if r.get('w') == 1 and r.get('h') == 1]
ones_refs = sum(r['count'] for r in ones)
size_buckets = collections.Counter()
for r in uniq:
    w = max(r.get('w', 0), r.get('h', 0))
    size_buckets['1x1' if w == 1 else '<=64' if w <= 64 else '<=256' if w <= 256 else '<=512' if w <= 512 else '<=1024' if w <= 1024 else '>1024'] += 1

report = {
    'dosya_bayt': total_bytes,
    'gomulu_gorsel_gecis': sum(kinds.values()),
    'tur_dagilimi': dict(kinds),
    'benzersiz_gorsel': len(uniq),
    'base64_toplam_bayt': b64_bytes,
    'base64_orani_yuzde': round(100 * b64_bytes / total_bytes, 1),
    'birebir_tekrar_eden_benzersiz': len(dups),
    'tekrar_nedeniyle_fazladan_bayt': wasted,
    'en_buyuk_tekrarlar': sorted(({'kind': r['kind'], 'w': r.get('w'), 'h': r.get('h'), 'b64len': r['b64len'], 'adet': r['count']} for r in dups), key=lambda x: -x['b64len'] * (x['adet'] - 1))[:12],
    'bir_bir_yer_tutucu_benzersiz': len(ones),
    'bir_bir_yer_tutucu_gecis': ones_refs,
    'cozulemeyen_gorsel': len(broken),
    'boyut_dagilimi_uzun_kenar': dict(size_buckets),
}
txt = json.dumps(report, ensure_ascii=False, indent=2)
print(txt)
if out:
    open(out, 'w', encoding='utf-8').write(txt)
