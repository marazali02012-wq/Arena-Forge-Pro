#!/usr/bin/env python3
"""Arena Forge Pro — hazırlanan görselleri oyuna ekler (boss görselleri + Çift Kılıçlı kart portresi).

Kullanım (proje kök klasöründe):
  python3 onarim/araclar/gorsel_ekle.py GIRIS.html CIKIS.html \
      --boss boss_kullerin_hukumdari=kullerin.png \
      --boss boss_ucurum_ejderi=ucurum.png \
      --boss boss_bosluk_imparatoru=bosluk.png \
      --cift-kilicli cift_kilicli_portre.png

- Resimler PNG/JPG/WebP olabilir; 512 px'e sığdırılıp WebP'ye çevrilir (şeffaflık korunur).
- Boss görselleri oyunun kendi AFP36Col.setArt arayüzüyle bağlanır: koleksiyonda görünür, üçü de varsa Boss Sandığı açılır.
- Çift Kılıçlı resmi kart/koleksiyon/ödül portresi olur. Savaş içindeki yürüyen figür (8 kareli atlas) ayrı çizim ister;
  bu araç onu değiştirmez.
- Görselin kendisi denetlenmez: kalitesiz ya da yanlış resim vermeyin.
"""
import argparse, base64, io, sys
from PIL import Image

BOSS_IDS = {'boss_kullerin_hukumdari', 'boss_ucurum_ejderi', 'boss_bosluk_imparatoru'}
MARK = '<script id="AFP_GORSEL_EKLE">'


def webp(path, side=512):
    im = Image.open(path).convert('RGBA')
    if im.width < 128 or im.height < 128:
        sys.exit(f'{path}: çok küçük ({im.width}x{im.height}); en az 128 px olmalı.')
    im.thumbnail((side, side), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=90, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('giris'); ap.add_argument('cikis')
    ap.add_argument('--boss', action='append', default=[], help='boss_kimligi=resim_dosyasi')
    ap.add_argument('--cift-kilicli', help='Çift Kılıçlı kart portresi')
    a = ap.parse_args()
    html = open(a.giris, encoding='utf-8').read()
    if MARK in html:
        sys.exit('Bu HTML\'ye daha önce görsel eklenmiş; orijinal HTML üzerinden yeniden çalıştırın.')
    lines = []
    for item in a.boss:
        bid, _, f = item.partition('=')
        if bid not in BOSS_IDS or not f:
            sys.exit(f'Geçersiz --boss: {item}. Kimlikler: {", ".join(sorted(BOSS_IDS))}')
        lines.append(f' set({bid!r},{webp(f)!r});')
    if a.cift_kilicli:
        lines.append(f' card("af37_cift_kilicli",{webp(a.cift_kilicli)!r});')
    if not lines:
        sys.exit('Eklenecek görsel verilmedi.')
    script = (MARK + '\n/* gorsel_ekle.py ile eklendi: oyunun kendi arayüzleri kullanılır, kural/kayıt değişmez */\n(function(){\n'
              ' function set(id,src){let n=0;const t=setInterval(()=>{if(window.AFP36Col&&window.AFP36Col.setArt){window.AFP36Col.setArt(id,src);clearInterval(t);}else if(++n>100)clearInterval(t);},100);}\n'
              ' function card(id,src){window.AFP94_MINION_CARDS=window.AFP94_MINION_CARDS||{};window.AFP94_MINION_CARDS[id]=src;}\n'
              + '\n'.join(lines) + '\n})();\n</script>\n')
    i = html.rfind('</body>')
    if i < 0:
        sys.exit('</body> bulunamadı.')
    open(a.cikis, 'w', encoding='utf-8').write(html[:i] + script + html[i:])
    print(f'Tamam: {len(lines)} görsel eklendi -> {a.cikis}')


if __name__ == '__main__':
    main()
