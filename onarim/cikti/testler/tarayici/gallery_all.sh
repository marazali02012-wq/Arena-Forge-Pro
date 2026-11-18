#!/bin/bash
# YALNIZ TEST: bütün birlik türlerini 6'lı kareler hâlinde çizip ekran görüntüsü alır.
S=${AFP_TEST_DIR:-$PWD}
D="python3 -I $S/tarayici/d.py"
mkdir -p $S/shots/gal
TYPES=$(python3 -I -c "
import json;d=json.load(open('$S/hero_info.json'));d=json.loads(d) if isinstance(d,str) else d
print(' '.join(x.split('=')[0] for x in d['all']))")
arr=($TYPES); n=${#arr[@]}; page=0
for ((i=0;i<n;i+=6)); do
  grp=$(printf '"%s",' "${arr[@]:i:6}"); grp="[${grp%,}]"
  $D eval "window.__GAL={types:$grp};return 1" >/dev/null
  $D eval $S/tarayici/gallery.js >/dev/null
  $D wait 350 >/dev/null
  $D eval $S/tarayici/gallery.js >/dev/null
  $D shot gal/p$(printf %02d $page) dev >/dev/null
  echo "$page $grp" >> $S/shots/gal/index.txt
  page=$((page+1))
done
echo "sayfa=$page tür=$n"
