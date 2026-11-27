#!/usr/bin/env python3
import argparse
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("code", type=int)
parser.add_argument("--check", action="store_true")
args = parser.parse_args()
if not 1 <= args.code <= 2_100_000_000:
    parser.error("Google Play sürüm kodu aralık dışında")

path = root / "app/src/main/assets/www/index.html"
source = path.read_bytes()
version = f"3.60.{args.code}".encode()
for pattern, replacement in (
    (rb'(<meta name="afp-build" content=")v3\.60\.\d+(")', rb"\g<1>v" + version + rb"\2"),
    (rb'<title>Arena Forge Pro v3\.60\.\d+[^<]*</title>',
     b'<title>Arena Forge Pro v' + version + b'</title>'),
):
    modified, count = re.subn(pattern, replacement, source, count=1)
    if count != 1:
        raise SystemExit("HTML sürüm alanı bulunamadı")
    if args.check and modified != source:
        raise SystemExit("HTML ve Android sürümleri eşleşmiyor")
    source = modified

version_file = root / "version.properties"
expected = f"versionCode={args.code}\n"
if args.check:
    if version_file.read_text() != expected:
        raise SystemExit("version.properties eşleşmiyor")
else:
    path.write_bytes(source)
    version_file.write_text(expected)
