#!/usr/bin/env python3
"""Tarama sonuçlarından TEST_SONUCLARI.md tablolarını üretir."""
import json, sys
S = __import__('os').environ.get('AFP_TEST_DIR', __import__('os').getcwd())
def load(p):
    out = []
    try:
        for l in open(p, encoding='utf-8'):
            l = l.strip()
            if l.startswith('{'): out.append(json.loads(l))
    except FileNotFoundError: pass
    return out
first = load(S + '/sweep_results.jsonl'); rerun = load(S + '/rerun_results.jsonl')
INVALID = {('tower', 'loss'), ('echo', 'loss'), ('arena', 'win'), ('arena', 'loss'), ('arena', 'forfeit'), ('dark', 'win')}
runs = {}
for d in first:
    if (d['mode'], d['run']) not in INVALID: runs[(d['mode'], d['run'])] = (d, 'ilk tarama')
for d in rerun: runs[(d['mode'], d['run'])] = (d, 'temiz yeniden oynatma')
AD = {'tower': '100 Katlı Kule', 'campaign': 'Hikâye Seferi', 'sky': 'Gökyüzü Adaları', 'flag': 'Sancak Hâkimiyeti', 'colossus': 'Kolosus', 'echo': 'Yankı İstilası', 'arena': 'Arena (kupa)', 'dark': 'Karanlık Geçit', 'secret': 'Gizli Bölge'}
RN = {'win': 'Zafer', 'loss': 'Yenilgi', 'forfeit': 'Pes'}
print('| Mod | Akış | Sonuç başlığı | Ödül satırı (ilk 70 karakter) | Ödül kutuları | Döngü hatası | Sonrası | Kaynak |')
print('|---|---|---|---|---|---|---|---|')
for m in AD:
    for r in RN:
        if (m, r) not in runs: print(f'| {AD[m]} | {RN[r]} | YAPILMADI | | | | | |'); continue
        d, src = runs[(m, r)]
        if not d.get('start'): print(f'| {AD[m]} | {RN[r]} | BAŞLAMADI | | | | | {src} |'); continue
        if d.get('wrongMode'): print(f'| {AD[m]} | {RN[r]} | YANLIŞ MOD ({d["wrongMode"]}) | | | | | {src} |'); continue
        res = d['res']; a = d.get('after') or {}
        after = ('mod lobisi: ' + a['modeScreen']) if a.get('modeScreen') else ('ana üs' if a.get('hub') else ('sonuç ekranı açık' if a.get('endOpen') else '?'))
        line = (res.get('line') or '').replace('|', '/')[:70]
        tiles = ', '.join(res.get('tiles') or []) or '—'
        print(f'| {AD[m]} | {RN[r]} | {res.get("title")} | {line} | {tiles} | {res.get("tickErr")} | {d.get("button")} → {after} | {src} |')
print()
bv = load(S + '/bv_results.jsonl')
print('| Ölçü | Mod | Örnek | Görünmeyen birim (örnek başına) | Ekran dışı birim | Koridoru örten en büyük öğe | Taşma / kırpık yazı | FPS* | En kötü %5 kare | Hata |')
print('|---|---|---|---|---|---|---|---|---|---|')
for d in bv:
    if not d.get('start'): print(f'| {d["size"]} | {AD.get(d["mode"], d["mode"])} | BAŞLAMADI |||||||'); continue
    a = d['audit']; f = d.get('fps') or {}
    hid = [len(x['hidden']) for x in a]; off = sum(len(x['offscreen']) for x in a)
    cov = {}
    for x in a:
        for c in x['covers']:
            k = c['el'].split('.')[0]; cov[k] = max(cov.get(k, 0), c['pct'])
    top = max(cov.items(), key=lambda kv: kv[1]) if cov else ('—', 0)
    over = len(set(o for x in a for o in x['over']))
    print(f'| {d["size"]} | {AD.get(d["mode"], d["mode"])} | {len(a)} | {hid} | {off} | {top[0]} %{top[1]} | {over} | {f.get("fps")} | {f.get("p95ms")} ms | {d["err"]["tick"]}/{len(d["err"]["perr"])} |')
