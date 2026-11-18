#!/usr/bin/env python3
"""Arena Forge Pro v3.60.261 -> v3.60.262 hedefli onarım yaması.

Kullanım:  python3 patch_v262.py <v3.60.261.html> <cikti_v3.60.262.html>

Her değişiklik kaynakta TAM BİR KEZ geçen bir metne bağlanır; bulunamazsa ya da birden
fazla bulunursa yama durur ve hiçbir dosya yazılmaz. Orijinal dosya değiştirilmez.
"""
import sys, hashlib

SRC, DST = sys.argv[1], sys.argv[2]
s = open(SRC, encoding='utf-8').read()
src_sha = hashlib.sha256(s.encode('utf-8')).hexdigest()
EXPECTED_SRC_SHA = '83ae2ecdca79fabda8955ffeb22b72aeb6b252383960d2180611ecbd6a851def'
if src_sha != EXPECTED_SRC_SHA:
    sys.exit('Kaynak v3.60.261 çalışma kopyası değil (SHA-256 farklı): ' + src_sha)

changes = []

def sub(name, old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f'[{name}] bağlantı metni {n} kez bulundu (1 olmalı); yama durduruldu.')
    s = s.replace(old, new)
    changes.append(name)

# ---------------------------------------------------------------- sürüm etiketi
sub('surum-meta',
    '<meta name="afp-build" content="v3.60.261" />\n<title>Arena Forge Pro v3.60.261 — Kart Görselleri Onarım TEST</title>',
    '<meta name="afp-build" content="v3.60.262" />\n<title>Arena Forge Pro v3.60.262 — Mod ve Savaş Onarım TEST</title>')
sub('surum-yorum',
    '<!-- AFP v3.60.261 TEST: ',
    '<!-- AFP v3.60.262 TEST: Hikâye Seferi aşama paneli kesilmesi, Sancak skor kutusunun üst koridoru kapatması ve oyuncunun kendi görünmez suikastçısını görememesi düzeltildi; 9 mod Chromium 740x360 / 667x375 / 800x360 üzerinde oynatıldı. Savaş kuralları, kayıt anahtarı ve ödüller değişmedi. -->\n<!-- AFP v3.60.261 TEST: ')

# ---------------------------------------------------------------- 1) Hikâye Seferi aşama paneli
# .afx-pageR hem overflow:auto hem justify-content:center; içerik panelden uzun olunca
# ÜST satırlar (AŞAMA x/10, BÜYÜ, aşama düğmelerinin yarısı) kesiliyor ve kaydırmayla da
# ulaşılamıyordu. Otomatik kenar boşluğuyla "güvenli ortalama": yer varsa ortalı, yoksa üstten başlar.
sub('kampanya-panel-css',
    'html.afx369:not(#_1):not(#_2):not(#_3) #afxModeScreen.af219-mode[data-mode]:not([data-mode="colossus"]) .afx-pageR {justify-content:center;gap:clamp(5px,1.8dvh,12px)!important;padding:clamp(6px,2dvh,15px)!important;}',
    'html.afx369:not(#_1):not(#_2):not(#_3) #afxModeScreen.af219-mode[data-mode]:not([data-mode="colossus"]) .afx-pageR {justify-content:flex-start;gap:clamp(5px,1.8dvh,12px)!important;padding:clamp(6px,2dvh,15px)!important;}\n'
    '/* v3.60.262: güvenli ortalama — içerik sığmazsa üst satırlar kesilmez, kaydırılabilir. */\n'
    'html.afx369:not(#_1):not(#_2):not(#_3) #afxModeScreen.af219-mode[data-mode]:not([data-mode="colossus"]) .afx-pageR>:first-child{margin-top:auto!important;}\n'
    'html.afx369:not(#_1):not(#_2):not(#_3) #afxModeScreen.af219-mode[data-mode]:not([data-mode="colossus"]) .afx-pageR>:last-child{margin-bottom:auto!important;}')

# ---------------------------------------------------------------- 2) Sancak skor kutusu
# Ayrı skor kutusu (top:96px) 360 px yüksek ekranda üst koridorun ortasına, birliklerin
# üstüne biniyordu. Aynı skor zaten üst şeritte (battleProMode) yazıyor; bayrak sahibi
# renkleri de her koridorda tuvalde çiziliyor. Kutu gizlendi, hedef puan şeride eklendi.
sub('sancak-kutu-css',
    '.af36-flag-hud{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 96px);',
    '.af36-flag-hud{display:none!important;position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 96px);')
sub('sancak-serit-etiket',
    "return '⚑ BAYRAK · '+(f?Math.floor(f.score.ally)+'-'+Math.floor(f.score.enemy):'0-0');",
    "return '⚑ BAYRAK · '+(f?Math.floor(f.score.ally)+'-'+Math.floor(f.score.enemy):'0-0')+' / '+AF36_FLAG_TARGET;")
# Sancak modunda olay hapı CSS ile gizli; savaş olayı geldiğinde (notice-active, ~2 sn) şerit
# skoru da gizleyip tamamen boş kalıyordu. Yalnız Sancak modunda skor hapı görünür tutulur.
sub('sancak-serit-isaret',
    "function af36FlagHud(){\n const hud=$('hud');let el=document.getElementById('af36FlagHud');\n",
    "function af36FlagHud(){\n const hud=$('hud');let el=document.getElementById('af36FlagHud');\n"
    " {const af262S=$('battleProStrip');if(af262S)af262S.toggleAttribute('data-af262-flag',!!(playing&&gameMode==='flag'&&af36Run.flags));} /* v3.60.262 */\n")
sub('sancak-serit-css',
    '#battleProStrip.notice-active>.battleProPill:not(#battleProEvent){display:none}',
    '#battleProStrip.notice-active>.battleProPill:not(#battleProEvent){display:none}\n'
    '#battleProStrip.notice-active[data-af262-flag]>#battleProMode{display:block!important} /* v3.60.262: Sancak skoru olay sırasında da görünür */')

# ---------------------------------------------------------------- 3) Kendi gizli suikastçın
# Gölge Suikastçı gizliyken iki takım için de hiç çizilmiyordu; oyuncu kendi kartını
# oynayınca birlik ve can çubuğu kayboluyordu (kart çalışmamış gibi). Rakibin suikastçısı
# görünmez kalır; oyuncunun kendi suikastçısı %42 saydamlıkla çizilir. Hedefleme kuralı değişmedi.
sub('gizlilik-drawHero',
    "if(af3410HasSoleInvisibility(u)&&!u.enemyType&&(u.isHero||u.isRoster)&&playing&&elapsed>=(u.revealedUntil||0)){\n    if(u._af321){u._af321.lastX=null;u._af321.lastT=null;}\n    return;\n  }",
    "if(af3410HasSoleInvisibility(u)&&!u.enemyType&&(u.isHero||u.isRoster)&&playing&&elapsed>=(u.revealedUntil||0)&&!u._af262StealthPass){\n"
    "    /* v3.60.262: oyuncunun kendi gizli suikastçısı yarı saydam görünür; rakibinki görünmez kalır. Yalnız görsel. */\n"
    "    if(u.team==='ally'){u._af262StealthPass=true;ctx.save();ctx.globalAlpha*=.42;try{return drawHero(u);}finally{ctx.restore();u._af262StealthPass=false;}}\n"
    "    if(u._af321){u._af321.lastX=null;u._af321.lastT=null;}\n    return;\n  }")
sub('gizlilik-legacy',
    "if(af3410HasSoleInvisibility(u)&&!u.enemyType&&(u.isHero||u.isRoster)&&playing&&elapsed>=(u.revealedUntil||0))return;",
    "if(af3410HasSoleInvisibility(u)&&!u.enemyType&&(u.isHero||u.isRoster)&&playing&&elapsed>=(u.revealedUntil||0)&&!u._af262StealthPass)return;")

# ---------------------------------------------------------------- 4) Koleksiyon sekme sayısı
# Keşifçi (af37_kesifci) v3.60.186'da emekli edildi; "Yeni Karakterler" listesi 49 kart gösteriyor
# ("sahip olunan x/49", "Tümü (49)") ama sekme etiketi elle yazılmış 50 olarak kalmıştı.
sub('koleksiyon-sekme-sayisi',
    "['normal','YENİ KARAKTERLER (50)']",
    "['normal','YENİ KARAKTERLER (49)']")

open(DST, 'w', encoding='utf-8').write(s)
out_sha = hashlib.sha256(s.encode('utf-8')).hexdigest()
print('Uygulanan değişiklik:', len(changes), '·', ', '.join(changes))
print('Kaynak SHA-256:', src_sha)
print('Çıktı  SHA-256:', out_sha, '·', len(s.encode('utf-8')), 'bayt')
