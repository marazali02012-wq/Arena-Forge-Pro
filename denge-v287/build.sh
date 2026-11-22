#!/bin/sh
set -eu
cd "$(dirname "$0")"
cp ../minyon-yetenekleri/ArenaForgePro_v3_60_285_Minyon_Yetenek_TEST.html ArenaForgePro_v287.html
patch --batch --fuzz=0 ArenaForgePro_v287.html < v287.patch
sha256sum -c SHA256SUMS
