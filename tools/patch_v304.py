#!/usr/bin/env python3
"""Arena Forge Pro v304: minyonlar kendi koridorunun ortasında kalsın (yalnız çizim).
Kullanım: python3 patch_v304.py girdi.html cikti.html  (girdi v303 olmalı)
Kök neden: kalabalık dizilme kayması (af34034MeleeFlankOffset, ±4 yuva) ve grup içi yayılma
(_afSkeletonCloneSide*px*.15) koridor genişliğinden bağımsızdı. 740x360'ta koridorlar arası ~67 px iken
toplam kayma 39 px'e çıkıyor, minyonlar komşu koridora/çit hattına taşıp çapraz görünüyordu.
Düzeltme: toplam dikey kayma, koridorlar arası mesafenin %16'sı olan banda tanh ile yumuşakça sıkıştırılır.
Simülasyon, hedefleme, menzil, hasar ve koridor numaraları değişmez (oyun yalnız x ve lane kullanır)."""
import sys

MARK = 'AFP_V304_LANE_CENTER_20261124'


def apply(html: str) -> str:
    if MARK in html:
        raise SystemExit('Zaten uygulanmış: ' + MARK)
    if 'AFP_V303_PORTAL_LOCK_HUD_20261124' not in html:
        raise SystemExit('Önce v303 yaması uygulanmalı')

    def patch(old, new, expected=1, tag=''):
        nonlocal html
        n = html.count(old)
        if n != expected:
            raise SystemExit(f'{tag}: {expected} eşleşme beklendi, {n} bulundu')
        html = html.replace(old, new)

    patch("function af34034MeleeFlankOffset(u,px){",
          "/* v3.60.304 " + MARK + ": dikey kalabalık/grup kayması koridor bandında kalır (yalnız çizim). */\n"
          "let af304Band={w:0,h:0,b:0};\n"
          "function af304LaneDY(raw){\n"
          "  if(!raw||!Number.isFinite(raw))return 0;\n"
          "  if(af304Band.w!==W||af304Band.h!==H){const g=Math.abs(laneY(1,W*.5)-laneY(0,W*.5))||H*.18;af304Band={w:W,h:H,b:Math.max(5,g*.16)};}\n"
          "  const b=af304Band.b;return b*Math.tanh(raw/b);\n"
          "}\n"
          "function af34034MeleeFlankOffset(u,px){",
          tag='af304LaneDY')
    patch("laneY(u.lane,x))+(u._afSkeletonCloneSide||0)*px*.15+af34034MeleeFlankOffset(u,px),k2=px/C.h;",
          "laneY(u.lane,x))+af304LaneDY((u._afSkeletonCloneSide||0)*px*.15+af34034MeleeFlankOffset(u,px)),k2=px/C.h;",
          tag='ana çizim')
    patch("laneY(u.lane,x))\n    +(u._afSkeletonCloneSide||0)*px*.15+af34034MeleeFlankOffset(u,px)+af285PoseDY(u,px);",
          "laneY(u.lane,x))\n    +af304LaneDY((u._afSkeletonCloneSide||0)*px*.15+af34034MeleeFlankOffset(u,px))+af285PoseDY(u,px);",
          tag='karakter motoru çizimi')
    patch("laneY(u.lane,x))+(u._af214GroupMember?u._afSkeletonCloneSide*px*.15:0);",
          "laneY(u.lane,x))+af304LaneDY(u._af214GroupMember?u._afSkeletonCloneSide*px*.15:0);",
          tag='sürükleme hayaleti 1')
    patch("y=r.markerYs[i]+(u?._af214GroupMember?u._afSkeletonCloneSide*px*.15:0);",
          "y=r.markerYs[i]+af304LaneDY(u?._af214GroupMember?u._afSkeletonCloneSide*px*.15:0);",
          tag='sürükleme hayaleti 2')
    return html


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    h = open(src, encoding='utf-8').read()
    out = apply(h)
    open(dst, 'w', encoding='utf-8').write(out)
    print('v304 uygulandı', len(h.encode()), '->', len(out.encode()))
