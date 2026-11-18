#!/usr/bin/env python3
"""Source-of-truth HTML'den script_NNN.js çıkarır. Çıkanlar test amacıyla ve kaynak inceleme içindir."""
import re, pathlib, sys, json
source=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else pathlib.Path(__file__).resolve().parents[1]/'01_CALISMA_DOSYASI'/'ARENA_FORGE_PRO_v3.60.261_CALISMA_KOPYASI.html'
dest=pathlib.Path(sys.argv[2]) if len(sys.argv)>2 else pathlib.Path(__file__).resolve().parents[1]/'04_TESTLER'/'_uretilen_scriptler'
dest.mkdir(parents=True,exist_ok=True)
s=source.read_text(encoding='utf-8')
found=list(re.finditer(r'<script\b([^>]*)>(.*?)</script\s*>',s,re.I|re.S))
idx=[]
for i,m in enumerate(found):
  (dest/f'script_{i:03d}.js').write_text(m.group(2),encoding='utf-8')
  idx.append({'no':i,'attributes':m.group(1).strip(),'size':len(m.group(2).encode('utf-8'))})
(dest/'script_index.json').write_text(json.dumps(idx,ensure_ascii=False,indent=2),encoding='utf-8')
print('Çıkarılan toplam script:',len(found))
