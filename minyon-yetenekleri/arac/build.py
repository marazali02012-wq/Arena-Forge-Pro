#!/usr/bin/env python3
"""AF285 derleyici: oyun HTML'sine minyon yetenek motorunu ve kancaları uygular.

Kullanım:
  python3 build.py GİRDİ.html ÇIKTI.html [--qa] [--no-abilities] [--strip]

- GİRDİ daha önce bu betikle derlenmiş bir dosya olabilir: önceki AF285 eklemesi ve kancaları önce
  geri alınır (dosyanın sonundaki AF285-PATCHES kaydına göre), sonra güncel kaynak uygulanır.
  Böylece depoda tek bir oyun dosyası tutmak yeter; her grup aynı dosyanın üzerine derlenir.
- --strip: yalnızca geri alır (orijinal oyun dosyasını üretir).
- Her kanca tam olarak BİR kez eşleşmek zorundadır; eşleşmezse derleme durur.
"""
import sys, pathlib, json, hashlib, base64

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
ENGINE_TAIL = " window.__AFP_BOSS_RAID_ENGINE_V1=api;\n return api;\n};\n})();\n"
BEGIN, END = '/* <AF285-BLOK> */', '/* </AF285-BLOK> */'
REC_OPEN, REC_CLOSE = '\n<!-- AF285-PATCHES:', ' -->\n'


def once(data, old, new, label):
    n = data.count(old)
    if n != 1:
        raise SystemExit(f'[build] "{label}" için çapa {n} kez bulundu (1 olmalı)')
    return data.replace(old, new, 1)


def load_patches():
    ns = {}
    exec((SRC / 'patches.py').read_text(encoding='utf-8'), ns)
    return ns['PATCHES']


def strip(data):
    """Önceki AF285 derlemesini geri alır. Kayıt yoksa dosya zaten temizdir."""
    at = data.rfind(REC_OPEN)
    if at < 0:
        if BEGIN in data:
            raise SystemExit('[build] AF285 bloğu var ama kanca kaydı yok; dosya elle değiştirilmiş olabilir')
        return data, False
    end = data.find(REC_CLOSE, at)
    rec = json.loads(base64.b64decode(data[at + len(REC_OPEN):end]).decode('utf-8'))
    data = data[:at] + data[end + len(REC_CLOSE):]
    b, e = data.find(BEGIN), data.find(END)
    if b < 0 or e < b:
        raise SystemExit('[build] AF285 blok işaretleri bulunamadı')
    data = data[:b] + data[e + len(END):]
    for label, old, new in reversed(rec['patches']):
        data = once(data, new, old, 'geri al: ' + label)
    if hashlib.sha256(data.encode('utf-8')).hexdigest() != rec['base_sha256']:
        raise SystemExit('[build] geri alınan dosya özgün temel dosyayla aynı değil')
    return data, True


def build(base, qa=False, abilities=True):
    base_sha = hashlib.sha256(base.encode('utf-8')).hexdigest()
    data, applied = base, []
    inject = ''
    if abilities:
        for label, old, new in load_patches():
            data = once(data, old, new, label)
            applied.append([label, old, new])
        parts = ['af285_engine.js', 'af285_assets.js'] + sorted(p.name for p in SRC.glob('af285_g*.js')) + ['af285_final.js']
        for name in parts:
            inject += '\n' + (SRC / name).read_text(encoding='utf-8') + '\n'
    if qa:
        inject += '\n' + (SRC / 'af285_qa.js').read_text(encoding='utf-8') + '\n'
    if inject:
        if data.count(ENGINE_TAIL) != 1:
            raise SystemExit('[build] motor sonu bulunamadı')
        cut = data.find(ENGINE_TAIL) + len(ENGINE_TAIL) - len('})();\n')
        data = data[:cut] + BEGIN + inject + END + data[cut:]
        rec = {'version': '3.60.285', 'base_sha256': base_sha, 'patches': applied, 'qa': qa}
        data += REC_OPEN + base64.b64encode(json.dumps(rec, ensure_ascii=False).encode('utf-8')).decode('ascii') + REC_CLOSE
    return data, base_sha


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = {a for a in sys.argv[1:] if a.startswith('--')}
    src, out = pathlib.Path(args[0]), pathlib.Path(args[1])
    data = src.read_text(encoding='utf-8')
    base, was_built = strip(data)
    if '--strip' in flags:
        out.write_text(base, encoding='utf-8')
        print(f'[build] temel dosya geri üretildi: {out} · sha256 {hashlib.sha256(base.encode()).hexdigest()[:16]}')
        return
    data, base_sha = build(base, qa='--qa' in flags, abilities='--no-abilities' not in flags)
    out.write_text(data, encoding='utf-8')
    h = hashlib.sha256(data.encode('utf-8')).hexdigest()
    print(f'[build] {out} · {len(data):,} karakter · sha256 {h[:16]} · temel {base_sha[:16]}' + (' (önceki derleme geri alındı)' if was_built else ''))


if __name__ == '__main__':
    main()
