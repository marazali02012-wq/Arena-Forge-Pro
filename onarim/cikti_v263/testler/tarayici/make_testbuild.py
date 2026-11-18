#!/usr/bin/env python3
"""YALNIZ TEST: motor kapanışının içine window.__AFE (eval kancası) ekleyen kopya üretir.
Bu kopya teslim edilmez; oyunun iç durumunu Playwright'tan okumak/sürmek içindir."""
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
anchor = "\n})();\n})();\n\n/* v3.60.30: mode adapter factory"
assert s.count(anchor) == 1, s.count(anchor)
hook = "\n})();\nwindow.__AFE=function(__s){return eval(__s)};/*TEST-ONLY*/\n})();\n\n/* v3.60.30: mode adapter factory"
s = s.replace(anchor, hook)
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s.encode()))
