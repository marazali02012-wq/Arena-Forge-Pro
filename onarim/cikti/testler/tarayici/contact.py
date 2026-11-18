#!/usr/bin/env python3
"""Galeri karelerinden her birlik için [dost | düşman] kırpıp etiketli temas sayfaları üretir."""
import sys, json, re
from PIL import Image, ImageDraw, ImageFont
import os
S = os.environ.get('AFP_TEST_DIR', os.getcwd())
info = json.load(open(S + '/hero_info.json')); info = json.loads(info) if isinstance(info, str) else info
names = {x.split('=')[0]: x.split('=')[1].split('|')[0] for x in info['all']}
pages = [l.split(' ', 1) for l in open(S + '/shots/gal/index.txt').read().strip().split('\n')]
XS = [143, 257, 410, 517]           # css x: dost1, düşman1, dost2, düşman2
LANES = [(38, 122), (106, 190), (170, 254)]
CW = 104; K = 2                       # hücre genişliği (css), dpr
cells = []
for pg, grp in pages:
    types = json.loads(grp); im = Image.open(f'{S}/shots/gal/p{int(pg):02d}.png').convert('RGB')
    i = 0
    for lane in range(3):
        for pair in range(2):
            if i >= len(types): break
            t = types[i]; i += 1
            y0, y1 = LANES[lane]
            crops = []
            for k in (0, 1):
                cx = XS[pair * 2 + k]
                crops.append(im.crop(((cx - CW // 2) * K, y0 * K, (cx + CW // 2) * K, y1 * K)))
            cells.append((t, crops))
try: font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 21)
except Exception: font = ImageFont.load_default()
cw, ch = CW * K, (LANES[0][1] - LANES[0][0]) * K
COLS, ROWS = 4, 6
per = COLS * ROWS
out = []
for s in range(0, len(cells), per):
    sheet = Image.new('RGB', (COLS * (2 * cw + 12), ROWS * (ch + 30)), (20, 20, 24))
    d = ImageDraw.Draw(sheet)
    for j, (t, crops) in enumerate(cells[s:s + per]):
        c, r = j % COLS, j // COLS
        x0, y0 = c * (2 * cw + 12), r * (ch + 30)
        sheet.paste(crops[0], (x0, y0)); sheet.paste(crops[1], (x0 + cw, y0))
        d.line([(x0 + cw, y0), (x0 + cw, y0 + ch)], fill=(255, 255, 0), width=2)
        d.text((x0 + 4, y0 + ch + 3), f'{s + j}. {t} · {names.get(t, "?")}', fill=(255, 255, 255), font=font)
    p = f'{S}/shots/gal/sheet{s // per}.png'; sheet.save(p); out.append(p)
print('\n'.join(out)); print('hücre', len(cells))
