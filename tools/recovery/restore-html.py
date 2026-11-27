#!/usr/bin/env python3
import gzip
import hashlib
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here.parents[1] / "app/src/main/assets/www/index.html"
spec = json.loads((here / "html-edits.json").read_text())
baseline = path.read_bytes()

def digest(data):
    return hashlib.sha256(data).hexdigest()

if digest(baseline) == spec["targetSha256"]:
    raise SystemExit(0)
if digest(baseline) != spec["baselineSha256"]:
    raise SystemExit("Kurtarma tabanı beklenen GitHub dosyasıyla eşleşmiyor")

payload = gzip.decompress((here / "html-insertions.gz").read_bytes())
parts = []
old_offset = new_offset = 0
for start, end, length in spec["edits"]:
    parts.append(baseline[old_offset:start])
    parts.append(payload[new_offset:new_offset + length])
    old_offset, new_offset = end, new_offset + length
parts.append(baseline[old_offset:])
restored = b"".join(parts)
if new_offset != len(payload) or digest(restored) != spec["targetSha256"]:
    raise SystemExit("Kurtarılan HTML'nin sağlama toplamı uyuşmuyor")
path.write_bytes(restored)
