#!/usr/bin/env python3
"""Arena Forge Pro v3.60.262 -> v3.60.263 hedefli onarım yaması.

Kullanım:  python3 patch_v263.py <ARENA_FORGE_PRO_v3.60.262.html> <cikti.html>

Her değişiklik kaynakta TAM BİR KEZ geçen bir metne bağlanır; bulunamazsa ya da birden fazla
bulunursa yama durur ve hiçbir dosya yazılmaz. Kaynak dosya değiştirilmez.
"""
import sys, hashlib

SRC, DST = sys.argv[1], sys.argv[2]
s = open(SRC, encoding='utf-8').read()
src_sha = hashlib.sha256(s.encode('utf-8')).hexdigest()
EXPECTED_SRC_SHA = '0112308a1e13b4a7a74bf5c0f029bdebb0c5c79fb127ba38546a0e0b9bb06bef'
if src_sha != EXPECTED_SRC_SHA:
    sys.exit('Kaynak v3.60.262 değil (SHA-256 farklı): ' + src_sha)

changes = []

def sub(name, old, new):
    global s
    n = s.count(old)
    if n != 1:
        sys.exit(f'[{name}] bağlantı metni {n} kez bulundu (1 olmalı); yama durduruldu.')
    s = s.replace(old, new)
    changes.append(name)

# ================================================================ sürüm etiketi
sub('surum-meta',
    '<meta name="afp-build" content="v3.60.262" />\n<title>Arena Forge Pro v3.60.262 — Mod ve Savaş Onarım TEST</title>',
    '<meta name="afp-build" content="v3.60.263" />\n<title>Arena Forge Pro v3.60.263 — Tam Onarım TEST</title>')
sub('surum-yorum',
    '<!-- AFP v3.60.262 TEST: ',
    '<!-- AFP v3.60.263 TEST: Android: solda siyah şerit (çentik dolgusu) ve görünmeyen Materyal çantası düzeltildi; pes etme tek kez mağlubiyet olarak kaydedilir (ödülsüz, görev ilerlemesi yok); kupa yolu kredisi ödül satırında; kahraman parçası/eşyası ödül simgeleri; yeni oyuncu rehber balonu kart/başlık üstüne binmez; birebir tekrar gömülü görseller tekilleştirildi. -->\n<!-- AFP v3.60.262 TEST: ')

# ================================================================ A) PES ETME = MAĞLUBİYET
# Önce: af274ExitBattle -> endGame(false,…,{suppressRewards,forfeit}). Her katman (genel istatistik,
# mod defteri, kampanya, Gökyüzü, Sancak, Kolosus/Örümcek, Gizli Bölge yolu) forfeit'i görünce
# HİÇBİR şey yazmıyordu; pencere ise "mağlubiyet sayılacak" diyordu. Gizli Bölge'de kaybetmek
# üzere olan oyuncu pes ederek yol sıfırlamasından kaçabiliyordu.
# Şimdi: aynı maç için (af330Match.id) bir kez, normal bir yenilginin yazdığı kayıtlar yazılır.
# Ödül, günlük/haftalık görev ilerlemesi YOK. Eğitim/ilk savaş, çevrim içi (sonucu sunucu
# belirler) ve Lonca baskını hariç. Yankı İstilası pes kaydını zaten kendi yapıyor (değişmedi).

# 1) Genel istatistik: görev ilerlemesi isteğe bağlı atlanabilsin
sub('A-recordbattle-imza',
    "function af328RecordBattle(outcome){\n try{\n  const p=af328P(),st=p.stats,",
    "function af328RecordBattle(outcome,af263Opt){\n try{\n  const p=af328P(),st=p.stats,")
sub('A-recordbattle-gorev',
    "const wk=p.weekly.progress;wk.battles++;if(win)wk.wins++;wk.abilities+=+ms.spells||0;wk.portals+=destroyed;",
    "const wk=p.weekly.progress;if(!(af263Opt&&af263Opt.noQuest)){wk.battles++;if(win)wk.wins++;wk.abilities+=+ms.spells||0;wk.portals+=destroyed;} /* v3.60.263: pes etme görev ilerlemesi saymaz */")

# 2) Çıkış akışı: maç bağlamını endGame'den ÖNCE yakala, sonra kaydı bir kez yaz
sub('A-exit-ref',
    "function af274ExitBattle(){const forfeited=playing;",
    "let af263ForfeitRef=null,af263ForfeitLastId=''; /* v3.60.263: pes kaydı (mod defteri bölümünde atanır) */\n"
    "function af274ExitBattle(){const forfeited=playing;")
sub('A-exit-kayit',
    "if(forfeited)endGame(false,'Savaştan erken çıktın; kredi/TP ödülü verilmedi'+(af35Pen>0?' ve '+af35Pen+' kupa düşüldü.':'.'),{suppressRewards:true,forfeit:true});",
    "let af263Ctx=null;if(forfeited){try{af263Ctx=af263ForfeitRef&&af263ForfeitRef('capture');}catch(e){console.warn('[v3.60.263] pes bağlamı',e);}}\n"
    "  if(forfeited)endGame(false,'Savaştan erken çıktın; kredi/TP ödülü verilmedi'+(af35Pen>0?' ve '+af35Pen+' kupa düşüldü.':'.'),{suppressRewards:true,forfeit:true});\n"
    "  if(forfeited&&af263Ctx&&!playing){try{af263ForfeitRef('record',af263Ctx,af35Pen);}catch(e){console.warn('[v3.60.263] pes kaydı',e);}}")

# 3) Kaydedici: mod defteri fonksiyonlarının görünür olduğu yerde tanımlanır
sub('A-kaydedici',
    "// Public read-only bridge for the mode-entry reward panel and QA. It never grants rewards.\nwindow.__AFPModeRewardSystemV37858={",
    r"""/* v3.60.263: PES ETME = MAĞLUBİYET. Normal yenilginin yazdığı kayıtları, ödül ve görev ilerlemesi olmadan,
   aynı maç için yalnız bir kez yazar. 'capture' endGame'den önce, 'record' sonra çağrılır. */
af263ForfeitRef=function(step,ctx,pen){
 if(step==='capture'){
  const online=window.__AFPOnlineContext;
  if(online&&online.active&&!online.localBot)return null;                 // çevrim içi: sonucu sunucu belirler
  if(window.__AFPCommunityGuildRaidActive)return null;                      // Lonca baskını: sunucu doğrulamalı
  if(af35Training||window.__AFPTrainingBypass||window.__afpFtueBattle||tutorialActive||gameMode==='training'||(gameMode==='duel'&&af35MatchKind==='training'))return null; // eğitim/ilk savaş
  if(gameMode==='echo')return null;                                         // Yankı: kendi kaydı pes'i zaten yenilgi yazar
  const id=af330Match&&af330Match.id||'';
  if(!id||id===af263ForfeitLastId)return null;                              // aynı maç iki kez yazılmaz
  const mode=afpModeRewardModeV37858();
  const c={id,mode,stage:mode?afpModeRewardStageV37858(mode):0,gameMode,kind:af35MatchKind};
  if(gameMode==='sky'&&af36Run.mode==='sky')c.sky=Math.max(1,+af36Run.level||1);
  if(gameMode==='flag'&&af36Run.mode==='flag'){const f=af36Run.flags||{score:{ally:0,enemy:0}};c.flag={a:Math.floor(f.score.ally),e:Math.floor(f.score.enemy)};}
  return c;
 }
 if(step!=='record'||!ctx||ctx.id===af263ForfeitLastId)return;
 af263ForfeitLastId=ctx.id;
 const notes=[],now=Date.now();
 // profile.battles BİLEREK artırılmaz: af297 meydan okuma ödülleri onu "savaş sayısı" olarak okuyor (pes ile ödül toplanamasın).
 af328RecordBattle(false,{noQuest:true});                                   // genel istatistik + geçmiş, görev yok
 try{const p=af328P();if(af328Pending){af328AfterRewards();}const h=p.history&&p.history[0];if(h){h.forfeit=true;h.cups=-(+pen||0);}}catch(_){}
 if(ctx.mode){try{afpApplyModeSpecificRewardV37858(ctx.mode,false,false,ctx.stage);}catch(e){console.warn('[v3.60.263] mod defteri',e);}}
 if(ctx.mode==='campaign'){const c=afpCampaignBattleState(),st=Math.max(1,+ctx.stage||1);c.activeLevel=st;c.lastResult='loss';c.history.unshift({level:st,result:'loss',at:now,forfeit:true});if(c.history.length>20)c.history.length=20;c.bossSpawned=false;c.losses++;}
 if(ctx.mode==='colossus'||ctx.mode==='boss'){const c=ctx.mode==='colossus'?afpColossusRaidStateV36074():(afpBossRaidState(),profile.afpBossRaid);if(c){const st=Math.max(1,+ctx.stage||1);c.lastResult='loss';c.history.unshift({level:st,result:'loss',at:now,forfeit:true});if(c.history.length>40)c.history.length=40;c.losses++;c.bossSpawned=false;c.bossKilled=false;c.activeLevel=0;}}
 if(ctx.sky){const s=af36Sky();s.history.unshift({level:ctx.sky,result:'loss',at:now,forfeit:true});if(s.history.length>20)s.history.length=20;s.losses++;}
 if(ctx.flag){const s=af36Flag();s.matches++;s.best=Math.max(s.best,ctx.flag.a);s.history.unshift({result:'loss',ally:ctx.flag.a,enemy:ctx.flag.e,at:now,forfeit:true});if(s.history.length>20)s.history.length=20;s.losses++;}
 if(ctx.gameMode==='duel'&&(ctx.kind==='secret'||ctx.kind==='dark')){try{af35AfterMatchRef&&af35AfterMatchRef(false,false,notes);}catch(_){}} // Gizli Bölge: yenilgide yol sıfırlanır
 const saved=saveProfile();
 const msg=' · Pes edildi: mağlubiyet olarak kaydedildi'+notes.join('')+(saved===false?' · UYARI: kayıt başarısız.':'');
 const rl=$('rewardLine');if(rl)rl.textContent+=msg;
 try{updateProfileUI();}catch(_){}try{window.__AFPModeRewardPanelRefreshV37858&&window.__AFPModeRewardPanelRefreshV37858();}catch(_){}
};
// Public read-only bridge for the mode-entry reward panel and QA. It never grants rewards.
window.__AFPModeRewardSystemV37858={""")

# ================================================================ F) KUPA YOLU KREDİSİ ÖDÜL SATIRINDA
# settleTrophyRewards kupa yolu kilometre taşı kredisini sessizce ekliyordu; sonuç ekranındaki toplam
# kredi doğruydu ama satırda kaynağı yazmıyordu. Hesap değişmedi; yalnız gerçekten eklenen miktar
# (cüzdan tavanı sonrası) satıra yazılır. Talep listesi (trophyRewardsClaimed) iki kez ödemeyi zaten önlüyor.
sub('F-kupa-yolu-kredi',
    "recordDailyProgress('battles',1);if(win)recordDailyProgress('wins',1);\n  const milestoneGains=(gameMode==='tower'||gameMode==='campaign'||gameMode==='boss'||af36IsCustom(gameMode))?[]:settleTrophyRewards();",
    "recordDailyProgress('battles',1);if(win)recordDailyProgress('wins',1);\n  const af263RoadBefore=Math.max(0,+profile.credits||0);\n"
    "  const milestoneGains=(gameMode==='tower'||gameMode==='campaign'||gameMode==='boss'||af36IsCustom(gameMode))?[]:settleTrophyRewards();\n"
    "  {const af263Road=Math.max(0,+profile.credits||0)-af263RoadBefore;if(af263Road>0)milestoneGains.unshift('KUPA YOLU +'+af263Road+' KREDİ');} /* v3.60.263 */")

# ================================================================ D) KAHRAMAN PARÇASI / EŞYASI SİMGELERİ
# Sonuç ekranı ikisini de genel gri dişli (ART.gear) ile gösteriyordu. Yeni görsel gömülmedi: oyunun
# kendi sanat paketindeki görseller kullanılır — parça için parçayı alan kahramanın portresi
# (commander.portrait.<id>), eşya için kazanılan eşyanın yuvasına uygun ekipman simgesi (equipment.*).
sub('D-parca-kayit',
    "if(hs>0)T.push(['gear','Kahraman parçası',hs]);",
    "if(hs>0)T.push(['hshard:'+af263ShardHero(a,b),'Kahraman parçası',hs]);")
sub('D-esya-kayit',
    "if(it>0)T.push(['gear','Kahraman eşyası',it]);",
    "if(it>0)T.push(['hitem:'+af263NewItemSlot(a,b),'Kahraman eşyası',it]);")
sub('D-simge',
    "function tileArt(k){if(String(k).indexOf('chest:')===0&&typeof window.AFQChestArt==='function')return window.AFQChestArt(k.slice(6));return ART[k]||ART.card;}",
    "/* v3.60.263: kahraman parçası = o kahramanın portresi, kahraman eşyası = yuvasının ekipman simgesi (mevcut sanat paketi) */\n"
    "function af263ShardHero(a,b){let best='',d=0;try{const ha=(a.af332&&a.af332.heroes)||{},hb=(b.af332&&b.af332.heroes)||{};for(const k of Object.keys(hb)){const x=num(hb[k]&&hb[k].shards)-num(ha[k]&&ha[k].shards);if(x>d){d=x;best=k;}}}catch(_){}return best;}\n"
    "function af263NewItemSlot(a,b){try{const ids=new Set(((a.af332&&a.af332.items)||[]).map(i=>i&&i.id));const n=((b.af332&&b.af332.items)||[]).filter(i=>i&&!ids.has(i.id));return n.length?String(n[n.length-1].slot||''):'';}catch(_){return '';}}\n"
    "const AF263_SLOT_ART={main:'sword',off:'shield',head:'helmet',chest:'heavy_armor',belt:'belt',feet:'boots'};\n"
    "function af263PackArt(key){try{const v=window.AFArt&&window.AFArt.get(key);return v&&String(v).length>200?v:'';}catch(_){return '';}}\n"
    "function tileArt(k){k=String(k);\n"
    " if(k.indexOf('hshard:')===0)return af263PackArt('commander.portrait.'+k.slice(7))||(typeof AFP224_ART==='object'&&AFP224_ART.shard)||ART.gear;\n"
    " if(k.indexOf('hitem:')===0)return af263PackArt('equipment.'+(AF263_SLOT_ART[k.slice(6)]||'sword'))||ART.gear;\n"
    " if(k.indexOf('chest:')===0&&typeof window.AFQChestArt==='function')return window.AFQChestArt(k.slice(6));return ART[k]||ART.card;}")

# Q) Minyon kart parçası ve yeni kart da aynı sorunu taşıyordu: sonuç ekranında her zaman soru işaretli genel kart
# simgesi (ART.card). Parçalar TEK bir karta gittiyse / tek yeni kart açıldıysa o minyonun kendi kart resmi gösterilir;
# birden fazla karta dağıldıysa genel simge kalır (toplam sayı tek bir minyona aitmiş gibi görünmesin diye).
sub('Q-kart-parcasi-kayit',
    "if(cs>0)T.push(['card','Kart parçası',cs]);",
    "if(cs>0)T.push(['mcard:'+af263OnlyChanged(a.shards,b.shards),'Kart parçası',cs]); /* v3.60.263 Q */")
sub('Q-yeni-kart-kayit',
    "if(nu>0)T.push(['card',nu>1?'Yeni kart':'Yeni kart',nu]);",
    "if(nu>0)T.push(['mcard:'+(nu===1?unlockedSet(b).filter(k=>!ua.has(k))[0]:''),nu>1?'Yeni kart':'Yeni kart',nu]); /* v3.60.263 Q */")
sub('Q-simge',
    " if(k.indexOf('hitem:')===0)return af263PackArt('equipment.'+(AF263_SLOT_ART[k.slice(6)]||'sword'))||ART.gear;\n",
    " if(k.indexOf('hitem:')===0)return af263PackArt('equipment.'+(AF263_SLOT_ART[k.slice(6)]||'sword'))||ART.gear;\n"
    " if(k.indexOf('mcard:')===0){const t=k.slice(6);if(!t)return ART.card;const c=window.AFP94_MINION_CARDS&&window.AFP94_MINION_CARDS[t];return (typeof c==='string'&&c.length>200?c:'')||af263PackArt('minion.portrait.'+t)||af263PackArt('minion.full.'+t)||ART.card;}\n")
sub('Q-yardimci',
    "function af263NewItemSlot(a,b){",
    "function af263OnlyChanged(oa,ob){try{oa=oa||{};ob=ob||{};const up=Object.keys(ob).filter(k=>num(ob[k])>num(oa[k]));return up.length===1?up[0]:'';}catch(_){return '';}}\nfunction af263NewItemSlot(a,b){")

# ================================================================ C) BİREBİR TEKRAR GÖMÜLMÜŞ GÖRSELLER
# 8 görselin 7'si iki kez gömülüydü (8.'si 48 baytlık 1×1 yer tutucu, dokunulmadı). Her biri için
# bütün kullanım yolu bulundu; ikinci kopya, birinci kopyaya bağlanan bir referansla değiştirildi.
# Görsel verisi değişmez, kalite düşmez. Yankı tanıtım görseli: script #103 aynı görseli
# AF213HomeArt.css içinden metin ayrıştırarak okuduğu için O kopya korunur; CSS'teki kopya kaldırılıp
# çalışma anında aynı kaynaktan CSS değişkeniyle bağlanır.
import re as _re
def b64_after(prefix_pos):
    m = _re.compile(r'data:image/webp;base64,([A-Za-z0-9+/=]+)').match(s, prefix_pos)
    assert m, 'base64 bulunamadı'
    return m
def must_once(data, name):
    n = s.count(data)
    if n != 2:
        sys.exit(f'[{name}] tekrar sayısı {n} (2 olmalı); yama durduruldu.')

# C1) Gölge Suikastçı: tam boy ve portre aynı nesnede iki kez
i = s.find('"minion.portrait.af37_golge_suikastci":"') + len('"minion.portrait.af37_golge_suikastci":"')
m2 = b64_after(i); j = s.find('Object.assign(out,{"minion.full.af37_golge_suikastci":"') + len('Object.assign(out,{"minion.full.af37_golge_suikastci":"')
m1 = b64_after(j)
assert m1.group(0) == m2.group(0), 'Gölge görselleri aynı değil'
must_once(m1.group(0), 'C1')
# Nesne değişmezi içinde kardeş anahtara başvurulamaz: değeri önce değişkene alıp iki anahtara veriyoruz.
data1 = m1.group(0)
s = s.replace('"minion.portrait.af37_golge_suikastci":"' + data1 + '"', '"minion.portrait.af37_golge_suikastci":af263GolgeArt', 1)
s = s.replace('Object.assign(out,{"minion.full.af37_golge_suikastci":"' + data1 + '"', 'var af263GolgeArt="' + data1 + '"; /* v3.60.263: tam boy = portre, tek kopya */\n Object.assign(out,{"minion.full.af37_golge_suikastci":af263GolgeArt', 1)
assert s.count(data1) == 1; changes.append('C1-golge-tek-kopya')

# C1b) Gölge Suikastçı kart/portre resmi: eski resimde figür 256 px tuvalin yalnız %9'unu kaplıyordu (Sezon Bileti ve
# koleksiyonda minik görünüyordu). Oyunda zaten bulunan aynı karakterin savaş çiziminin (unit.atlas, 512x256) ilk karesi
# 256x256 kırpılıp portre olarak kullanılır. Yeni çizim eklenmez; iki küçük kopya (paket + AFP94 kart) tek kırpıma iner.
import base64 as _b64, io as _io
from PIL import Image as _Img
ia = s.find('"unit.atlas.af37_golge_suikastci":"data:image/webp;base64,', s.find('var af263GolgeArt="')) + len('"unit.atlas.af37_golge_suikastci":"data:image/webp;base64,')
assert ia > 100, 'Gölge atlası bulunamadı'
_atl = _Img.open(_io.BytesIO(_b64.b64decode(s[ia:s.index('"', ia)]))).convert('RGBA')
assert _atl.size == (512, 256), _atl.size
_fr = _atl.crop((0, 0, 256, 256)); _bb = _fr.getbbox(); assert _bb and (_bb[2]-_bb[0])*(_bb[3]-_bb[1]) > 256*256*0.5, _bb
_buf = _io.BytesIO(); _fr.save(_buf, 'WEBP', quality=88, method=6)
golge_new = 'data:image/webp;base64,' + _b64.b64encode(_buf.getvalue()).decode()
s = s.replace('var af263GolgeArt="' + data1 + '"', 'var af263GolgeArt="' + golge_new + '"', 1)
ic = s.find('window.AFP94_MINION_CARDS={'); kc = s.find('"af37_golge_suikastci":"data:image/', ic)
assert ic > 0 and kc > ic and kc < s.find('</script>', ic)
ec = s.index('"', kc + len('"af37_golge_suikastci":"'))
# AFP94 nesnesi saf JSON kalmalı (eski portre testi JSON olarak okur): değer 1x1 yer tutucu olur, nesnenin hemen
# ardından paketteki tek büyük portreye bağlanır. Yer tutucu oyunun kendi isPlaceholder denetimine takılır.
PH = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
s = s[:kc] + '"af37_golge_suikastci":"' + PH + '"' + s[ec+1:]
endc = s.index('};', ic) + 2
s = s[:endc] + 'window.AFP94_MINION_CARDS.af37_golge_suikastci=(window.AF_ART_PACK_DATA||{})["minion.full.af37_golge_suikastci"]||""; /* v3.60.263 C1b */' + s[endc:]
assert s.count(golge_new) == 1; changes.append('C1b-golge-buyuk-portre')

# C2) Ana üs mağaza simgesi = epik sandık görseli (script #10 window.AFQ_CHEST_ART.epic olarak yayımlıyor, #102'den önce çalışır)
k = s.find(',"shop":"data:image/webp;base64,') + len(',"shop":')
m = _re.compile(r'"(data:image/webp;base64,[A-Za-z0-9+/=]+)"').match(s, k)
must_once(m.group(1), 'C2')
e = s.find('"epic": "' + m.group(1) + '"')
assert e > 0 and e < k, 'epik sandık kopyası mağaza simgesinden önce değil'
s = s[:m.start()] + '((window.AFQ_CHEST_ART&&window.AFQ_CHEST_ART.epic)||"")' + s[m.end():]
assert s.count(m.group(1)) == 1; changes.append('C2-magaza-simgesi')

# C3) afxAssets efekt şeritleri: 4 çift aynı src. JSON içinde başvuru "@anahtar"; yükleyici çözer.
pairs = [('quake_wave', 'afnew_te_fury'), ('fire_ring', 'afnew_ru_spirit'), ('grow_aura', 'afnew_al_dark'), ('gold_runes', 'afnew_te_bond')]
for src_key, dup_key in pairs:
    a = s.find('"' + src_key + '":{"src":"') + len('"' + src_key + '":{"src":"')
    ma = b64_after(a)
    b = s.find('"' + dup_key + '":{"src":"') + len('"' + dup_key + '":{"src":"')
    mb = b64_after(b)
    assert ma.group(0) == mb.group(0), f'{src_key}/{dup_key} aynı değil'
    must_once(ma.group(0), 'C3 ' + dup_key)
    s = s[:mb.start()] + '@' + src_key + s[mb.end():]
    changes.append('C3-' + dup_key)
sub('C3-yukleyici',
    "try{data=JSON.parse(document.getElementById('afxAssets').textContent).sheets;state=data?2:3;}",
    "try{data=JSON.parse(document.getElementById('afxAssets').textContent).sheets;state=data?2:3;"
    "if(data)for(const k in data){const d=data[k];if(d&&typeof d.src==='string'&&d.src.charAt(0)==='@'){const r=data[d.src.slice(1)];d.src=r&&typeof r.src==='string'&&r.src.charAt(0)!=='@'?r.src:'';}} /* v3.60.263: tekrar gömülü şerit başvurusu */}")

# C4) Yankı tanıtım arka planı (CSS) = mod kartı görseli (AF213HomeArt.css içinde, #103 tarafından okunuyor)
c = s.find("#af203Intro .af203-introArt{background:url('") + len("#af203Intro .af203-introArt{background:url('")
mc = b64_after(c)
must_once(mc.group(0), 'C4')
hc = s.find('--mode-art:url(' + mc.group(0) + ')')
assert hc > 0, 'Yankı mod kartı kopyası bulunamadı'
assert s[mc.end():mc.end()+2] == "')"
s = s[:c - len("url('")] + 'var(--af263-echo-art,none)' + s[mc.end()+2:]
assert s.count(mc.group(0)) == 1; changes.append('C4-yanki-tanitim-css')

# ================================================================ G) MATERYAL ÇANTASI GÖRÜNMÜYORDU
# Ana üsteki "YADİGÂR TOZU" düğmesi Materyal çantasını (#afxMats) açıyor ama pencere ana üs katmanının
# ARKASINDA kalıyordu: .afx-win konumlandırma kuralı yalnız html.afx-pwopen/afx369 varken geçerli ve ana üs
# afx-pwopen'ı yalnız tanıdığı pencereler için açıyordu (afxWeek, afxHist, afxBadges, af328Profile).
sub('G-materyal-penceresi',
    "const utilityOpen=['afxWeek','afxHist','afxBadges','af328Profile'].some(",
    "const utilityOpen=['afxWeek','afxHist','afxBadges','af328Profile','afxMats'].some(")

# ================================================================ K) KOLEKSİYON KARTINDA ÇİFT ETİKET
# Grup etiketi ile rol etiketi aynı olduğunda (ör. Orman Okçusu, Mühendis Nişancı, Savaş Mühendisi: "Menzilli · Menzilli")
# aynı etiket iki kez yazılıyordu; Platin karakterlerde nadirlik de tekrar ediyordu ("Platin · Platin").
# Bir etiket, kendinden önceki etiketlerden biriyle aynıysa yazılmaz.
sub('K-koleksiyon-cift-etiket',
    """(e.kind==='normal'?'<span class="c-tag">'+esc(g?g[1]:'')+'</span>':'<span class="c-tag">'+esc(e.title||'')+'</span>')+'<span class="c-tag">'+esc(e.kind==='boss'?'Boss':(ROLE[e.role]||{}).label||e.role)+'</span>'""",
    """((t2,t3,r)=>(String(t2)===r?'':'<span class="c-tag">'+esc(t2)+'</span>')+(String(t3)===String(t2)||String(t3)===r?'':'<span class="c-tag">'+esc(t3)+'</span>'))(e.kind==='normal'?(g?g[1]:''):(e.title||''),e.kind==='boss'?'Boss':(ROLE[e.role]||{}).label||e.role,String(e.rarity)) /* v3.60.263 K */""")

# ================================================================ M) İLK AÇILIŞ GİRİŞİ GİRİŞ EKRANININ ARKASINDA OYNUYORDU
# Yeni oyuncuda hikâye girişi (#afpFtue, ~20 sn slayt + ücretsiz minyon kartı) sayfa açılır açılmaz başlıyordu; o anda
# hesap/misafir giriş ekranı (#afqEntry) en üstte olduğu için slaytlar görünmeden arkada akıyor, oyuncu giriş yaptığında
# girişin çoğunu kaçırıyor ya da doğrudan ücretsiz minyon kartına düşüyordu. Giriş ekranı açıkken giriş başlatılmaz.
sub('M-ftue-giris-ekrani-bekler',
    "if(!ftueEl&&ftueEligible(p)&&document.documentElement.classList.contains('afx-hub')&&screenId()==='home'&&!document.querySelector('.afp-story')){ftueIntro();return;}",
    "if(!ftueEl&&ftueEligible(p)&&document.documentElement.classList.contains('afx-hub')&&screenId()==='home'&&!document.querySelector('.afp-story')&&!(document.getElementById('afqEntry')&&vis(document.getElementById('afqEntry')))){ftueIntro();return;} /* v3.60.263 M */")

# ================================================================ P) ETKİNLİK MAĞAZASI MİNYON PARÇASI YANLIŞ RESİM
# "3 minyon parçası — <minyon> için +3 parça" ürününde oyun hedef minyonun büstünü çiziyor (bust(target)); sonradan çalışan
# görsel katman başlığında "minyon" geçen her kartın resmini silip sabit bir komutan görünümü (mor büyücü) koyuyordu.
# Katman yalnız kartta resim yoksa yedek resim koyar.
sub('P-etkinlik-minyon-resmi',
    "{const hero=art.querySelector('.af4-eHero');if(hero){hero.innerHTML='';addImg(hero,A.sorceress,'afp-ref-event-hero','Komutan görünümü');}}",
    "{const hero=art.querySelector('.af4-eHero');if(hero&&!hero.querySelector('img,canvas,svg,.af-minion-art,[style*=\"url(\"]')){hero.innerHTML='';addImg(hero,A.sorceress,'afp-ref-event-hero','Komutan görünümü');}} /* v3.60.263 P */")

# ================================================================ S) ALT KORİDOR BÜYÜ DÜĞMELERİNİN ARKASINDA KALIYORDU
# Komutan büyü düğmeleri (Kızıl Kuyruk / Kor Yemini) kasıtlı olarak elin üstünde, ortada duruyor; bu konum 3. (alt)
# koridorun yürüme çizgisinin tam üstü. Alt koridordaki birimlerin %11–32'si bu düğmelerin altından geçiyor, gövdeleri
# ve can çubukları kayboluyordu (oyuncu: "Yankı'da 3. koridordaki minyonun canı gözükmüyor"). Konum değişmez; çizim
# döngüsü birimlerin ekrandaki yerini yardımcıya verir, arkasında birim/can çubuğu olan düğme yarı saydam olur.
sub('S-buyu-dugmesi-kanca',
    "af382HudDense=!!(playing&&order.length>=12);",
    "af382HudDense=!!(playing&&order.length>=12);try{if(window.__afp263SkillFade)window.__afp263SkillFade(order,W,H);}catch(_){} /* v3.60.263 S */")

# ================================================================ V) ÜST KORİDOR CAN ÇUBUĞU ŞERİDİN ALTINDA KALIYORDU
# Kullanıcı bildirimi: "Yankı'da (üst) koridordaki minyonun canı gözükmüyor". Üst bilgi altındaki mod şeridi (Yankı:
# "YANKI 1/3 · GÖLGE · BOSS SONDA", y≈42–63; diğer modlarda "KULE · 1", "⚑ BAYRAK", "☁ GÖKYÜZÜ", y≈48–60) çok yüksek
# katmanda ve üst koridor can çubuklarının çizildiği bandın üstünde. Birimler sıkışınca çubuklar yukarı itilip bu şeridin
# arkasında kayboluyordu. Çubuğun çıkabileceği en üst sınır, o x konumunda şerit varsa şeridin altına çekilir.
sub('V-ust-koridor-can-cubugu',
    "textH=Math.max(9,9*kk),minTop=H*.135;",
    "textH=Math.max(9,9*kk),minTop=Math.max(H*.135,(window.__afp263HudFloor?window.__afp263HudFloor(x,barW):0)); /* v3.60.263 V */")

# ================================================================ X) KUPA YOLU MİNYON KARTI KÜÇÜK FİGÜR
# Kupa Yolu'ndaki "MİNYON KARTI" kilometre taşları (af36Character.art = 256 px savaş figürü) kartta minik görünüyordu;
# aynı yoldaki parça ödülleri ve koleksiyon/deste ise oyunun kart portresini kullanıyor. Aynı minyon her yerde aynı
# görünsün diye önce oyunun kart portresi (window.AFP94_MINION_CARDS) alınır; yoksa eski resim.
# Ayrıca kartlar eşit genişlikte (90 px) ve ad alanı sabit iki satır: uzun ad resmi küçültmez, kartlar hizalı kalır.
sub('X-kupa-yolu-minyon-karti',
    "credits:0,char:e.id,art:typeof e.art==='string'&&e.art.length>200?e.art:'',st,",
    "credits:0,char:e.id,art:(((c=>typeof c==='string'&&c.length>200?c:'')(window.AFP94_MINION_CARDS&&window.AFP94_MINION_CARDS[e.id]))||(typeof e.art==='string'&&e.art.length>200?e.art:'')),st, /* v3.60.263 X */")

# ================================================================ AC) ÖRÜMCEK AKINI SONUCU "YANKI İSTİLASI" YAZIYORDU
# Örümcek Akını ve Lonca Dev Avı da motorun 'boss' modunu kullanıyor; sonuç ekranı 'boss'u her zaman YANKI İSTİLASI diye
# etiketliyordu; İki Oyunculu Kolosus (düello motoru + kontrol noktası) da 'SAVAŞ ARENALARI' yazıyordu. Maç başı kaydında Örümcek motorunun etkin olup olmadığı (ve lonca avı bağlamı) not edilir; yalnız ETİKET
# değişir, dönüş hedefi (Örümcek ekranına dönüş) aynı kalır.
sub('AC-sonuc-kaydi',
    "let start=null,wasPlaying=false,live=false;\nfunction takeStart(){start=readProfile();hide();}",
    "let start=null,wasPlaying=false,live=false,af263RaidKind='';\nfunction takeStart(){start=readProfile();hide();try{const R=window.AFPBossRaidEngineV1,st=R&&typeof R.status==='function'?R.status():null;af263RaidKind=window.__AFPCommunityGuildRaidActive?'guildraid':(st&&st.active?'raid':'');}catch(_){af263RaidKind='';}} /* v3.60.263 AC */")
sub('AC-etiketler',
    "const MODE_LABEL={echo:'YANKI İSTİLASI',",
    "const MODE_LABEL={raid:'ÖRÜMCEK AKINI',guildraid:'LONCA DEV AVI',duocolossus:'İKİ OYUNCULU KOLOSUS',echo:'YANKI İSTİLASI',")
sub('AC-boya',
    " const mk=afqvResultMode(info,d.modeKey);\n",
    " const mk=(m=>(m==='boss'&&af263RaidKind)?af263RaidKind:(m==='arena'&&/^KOLOSUS KONTROLÜ/.test((($('endTitle')||{}).textContent||'').trim()))?'duocolossus':m)(afqvResultMode(info,d.modeKey)); /* v3.60.263 AC: yalnız etiket */\n")

# ================================================================ H) SANDIK / GÜNLÜK ÖDÜL KARTINDA MİNYON ADIN ALTINDA KALIYORDU
# Ödül kartında resim kartın tamamına yerleştiriliyor (inset:0, contain, üstten %15), ad ve "+1 PARÇA" etiketi
# kartın alt ~40 px'ini kaplıyordu. Figürü resmin alt yarısında duran minyonlarda (ör. İskelet Kalkanlı) yalnız
# kafa/kask ucu görünüyordu. Resim yalnız etiketlerin ÜSTÜNDEKİ alana, alttan hizalı yerleştirilir.
sub('H-odul-karti-resmi',
    "#chestRevealBackdrop .chestRevealCard>img{position:absolute !important;inset:0 !important;width:100% !important;height:100% !important;object-fit:contain !important;object-position:50% 15% !important;}",
    "html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .chestRevealCard{display:flex !important;flex-direction:column !important;justify-content:flex-end !important;} html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .chestRevealCard>img{position:relative !important;inset:auto !important;flex:1 1 0 !important;min-height:0 !important;width:100% !important;height:auto !important;object-fit:contain !important;object-position:50% 100% !important;} html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .chestRevealCard>strong,html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .chestRevealCard>small{flex:0 0 auto !important;} html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .chestRevealCard{width:min(108px,22vw) !important;height:min(128px,34vh) !important;} html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .chestRevealCards{height:min(128px,34vh) !important;min-height:0 !important;max-height:none !important;} html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .af190-reveal-stage{height:calc(min(128px,34vh) + min(52px,14vh) + 24px) !important;min-height:0 !important;max-height:none !important;} html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .chestRevealIcon,html:not(#_1):not(#_2):not(#_3):not(#_4) #chestRevealBackdrop .af40-reveal-chest-image{width:min(52px,14vh) !important;height:min(52px,14vh) !important;} /* v3.60.263: resim ad etiketinin üstündeki kalan alanda, figür tam görünür; kart büyütüldü, sandık simgesi küçültüldü */")

# H2) Aynı ödül kartı resmi AF324.portrait(type) ile alınıyordu; yeni minyonlarda (afn_*) bu, çevresi boş küçük bir
# görsel döndürüyor (kartta figür birkaç piksel). Önce oyunun kart portresi (afpResolvedMinionPortrait), yoksa eski kaynak.
sub('H2-odul-karti-kaynak',
    "const hq=AF324?AF324.portrait(type):'';",
    "const hq=((typeof afpResolvedMinionPortrait==='function')&&afpResolvedMinionPortrait(type))||(AF324?AF324.portrait(type):''); /* v3.60.263 */")

# ================================================================ E) + C4 çalışma anı: rehber balonu yerleşimi
RUNTIME = r"""<script id="AFP263_RUNTIME">
/* v3.60.263 çalışma anı yardımcıları (yalnız görsel/yerleşim; oyun kuralı, kayıt veya ödül değiştirmez) */
(function(){'use strict';
 /* C4: Yankı tanıtım arka planı, mod kartı görselinin TEK kopyasından (AF213HomeArt.css) bağlanır. */
 try{const css=typeof AF213HomeArt==='object'?String(AF213HomeArt.css||''):'';const st=css.indexOf('.mode[data-art="echo"] {');
  const m=st>=0?/url\((data:image\/webp;base64,[A-Za-z0-9+/=]+)\)/.exec(css.slice(st,css.indexOf('}',st))):null;
  if(m)document.documentElement.style.setProperty('--af263-echo-art','url("'+m[1]+'")');}catch(e){console.warn('[v3.60.263] Yankı görseli',e);}

 /* E: Yeni oyuncu rehber balonu (#afpGuide). Gövdesi dokunuşları geçirir (yalnız kendi düğmeleri tıklanır),
    böylece altında kalan kart, düğme veya koridor sürükle-bırakı engellenmez. Ayrıca her ekranda birkaç aday
    konum denenir; düğmelerin, savaş kartlarının, sonuç başlığının ve rehberin işaret ettiği hedefin en az
    örtüldüğü konum seçilir. Varsayılan konum zaten temizse yerinden oynatılmaz. */
 const st=document.createElement('style');st.id='afp263GuideCss';
 st.textContent='#afpGuide{pointer-events:none}#afpGuide button{pointer-events:auto}#afpGuide.af263-placed{transform:none!important;right:auto!important;bottom:auto!important;min-width:0!important}'
  +'#afpGuide.af263-placed .g-x{padding:3px 5px;font-size:9px}'
  /* Savaşta alt boşluğa yerleşen balon sıkı düzen: dar boşlukta (≈150 px) ATLA/KAPAT/ANLADIM tek satırda kalır, balon
     alt koridorun ayak çizgisinin altında ve ekranın içinde biter (önce 136 px yükseklikle alt koridora ve ekran dışına taşıyordu). */
  +'#afpGuide.btl.af263-placed{padding:3px 6px 4px!important;border-width:1px!important}'
  +'#afpGuide.btl.af263-placed .g-top{margin-bottom:1px!important}#afpGuide.btl.af263-placed .g-dots{display:none!important}'
  +'#afpGuide.btl.af263-placed .g-t{font-size:8.5px!important;letter-spacing:.03em!important}'
  +'#afpGuide.btl.af263-placed .g-p{font-size:9.5px!important;line-height:1.2!important}'
  +'#afpGuide.btl.af263-placed .g-b{margin-top:2px!important;flex-wrap:wrap!important;gap:3px!important;row-gap:2px!important}'
  +'#afpGuide.btl.af263-placed .g-x{padding:2px 4px!important;font-size:8px!important}'
  +'#afpGuide.btl.af263-placed .g-btn{padding:3px 6px!important;font-size:9px!important;white-space:nowrap!important}'
  /* Mini kip: hedef ekranın dışındayken (yalnız "GERİ ile ana ekrana dön") balon tek satırlık şeride küçülür. */
  +'#afpGuide.af263-mini{display:flex;align-items:center;gap:6px;padding:3px 6px 3px 8px;border-width:1px;border-radius:9px}'
  +'#afpGuide.af263-mini .g-top{order:2;margin:0;flex:0 0 auto}#afpGuide.af263-mini .g-dots,#afpGuide.af263-mini .g-t{display:none}'
  +'#afpGuide.af263-short .af263-rest{display:none}#afpGuide.af263-mini .g-p{order:1;flex:1 1 auto;min-width:0;font-size:11px;line-height:1.2}#afpGuide.af263-mini .g-b{order:3;margin:0}';
 document.head.appendChild(st);
 /* J: Kilitli minyon ayrıntısı. (1) Kilit simgesi portrenin sağ üstünde "SV 1" etiketinin üstüne biniyordu: sağ alta alınır.
    (2) "Nasıl açılır?" kutusu yarı saydamdı (%45); kaydırılan istatistik satırları içinden okunup karışıyordu: opak yapılır. */
 const sj=document.createElement('style');sj.id='afp263MinionCss';const HX='html'+':not(#_j)'.repeat(11)+' #af4Screen[data-screen="minions"] ';
 sj.textContent=HX+'.afp134-miCard .afp134-lock{top:auto!important;bottom:6px!important;right:6px!important}'
  +HX+'.afp134-how{background:#0b111e!important}'
  +HX+'.afp134-act.afp134-unlock{background:linear-gradient(rgba(9,14,27,0),#090e1b 12px)!important}';
 document.head.appendChild(sj);
 /* L: Kilitli kahraman dosyası (Vaelor, Theryn, Elyvara, Saelith). Kilit kutusu 28 px'e sıkışıyordu: açıklama tek satırda
    kesiliyor ("ya da 20 Vael..."), "0 / 20 parça" yazısı 4 px'lik çubuğa sığmayıp sekmelerin arkasına taşıyor,
    KUPA YOLU düğmesi (40 px) İLERLEME sekmesinin üstüne biniyordu. Kutu düğmeye kadar genişler, açıklama iki
    satıra iner, çubukta tekrar eden "0 / 20 parça" yazısı gizlenir (açıklamada "(0/20)" var), düğme kutunun yanına alınır. */
 const sl=document.createElement('style');sl.id='afp263HeroLockCss';const HL='html'+':not(#_l)'.repeat(11)+' .af332-prof';
 sl.textContent=HL+' .af332-lockBox{width:calc(100% - 78px)!important;max-width:none!important;box-sizing:border-box!important;padding:2px 6px!important;row-gap:2px!important}'
  +HL+' .af332-lockBox>small{white-space:normal!important;height:auto!important;line-height:1.1!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'
  /* "(0/20)" açıklamada zaten yazıyor; 4 px'lik çubuğa sığmayan tekrar etiketi gizlenir, çubuk ilerleme çizgisi olarak kalır */
  +HL+' .af332-lockBox>.af4-bar>span{display:none!important}'
  +HL+':has(.af332-lockBox) .af332-profBtns{top:1px!important}'
  +HL+':has(.af332-lockBox) .af332-profBtns .af4-btn{min-height:0!important;height:26px!important}';
 document.head.appendChild(sl);
 /* N: Mağaza → Görünümler kartı. "İNCELE" düğmesi (58x32) 68 px'lik resim alanının tam ortasındaydı; kostüm figürünün
    gövdesini örtüyor, yalnız başı görünüyordu (Etkinlik Mağazası kartlarında da aynı). Düğme küçültülüp resim alanının
    sol alt köşesine alınır. */
 const sn=document.createElement('style');sn.id='afp263CosCss';
 /* Kaynak kural @layer af172Commerce içinde; katmanlı !important katmansızı yendiği için düzeltme aynı katmana yazılır. */
 sn.textContent='@layer af172Commerce{html'+':not(#_n)'.repeat(11)+' .af4-cosArt>.af173-inspect,html'+':not(#_n)'.repeat(11)+' .af4-eitem>.af4-eArt>.af173-inspect{left:6px!important;right:auto!important;top:auto!important;bottom:5px!important;transform:none!important;padding:5px 8px!important;font-size:9px!important;min-height:0!important;min-width:0!important;height:auto!important}}';
 document.head.appendChild(sn);
 /* O: Etkinlik Mağazası SATIN AL düğmesi. Fiyat etiketine konan etkinlik mührü resmi (img.af224-item-art, 324 px) için
    boyut kuralı yoktu; mühür doğal boyutunda çizilip kartın ve ekranın yarısını kaplıyor, fiyat/düğme yazısı görünmüyordu.
    Fiyat simgesi yazı boyutunda tutulur. */
 const so=document.createElement('style');so.id='afp263PriceCss';
 so.textContent='html'+':not(#_o)'.repeat(11)+' .af4-price>img{width:16px!important;height:16px!important;max-width:16px!important;max-height:16px!important;object-fit:contain!important;flex:0 0 16px!important;margin:0 3px 0 0!important;vertical-align:-3px!important;position:static!important}';
 document.head.appendChild(so);
 /* R: Savaş üst bilgisi. Açık renkli arenalarda (Hikâye Seferi, Gökyüzü vb.) "SEN · kupa", "KORVAYN · SV 1",
    "SEFER AŞAMA 1 · ⚡ 0/3", "RAKİP · …" yazıları gölgesiz olduğu için gökyüzü/mermer üstünde kayboluyordu.
    Renkler aynı kalır; yalnız koyu bir kontur gölgesi eklenir. */
 const sr2=document.createElement('style');sr2.id='afp263HudCss';const HR='html'+':not(#_r)'.repeat(11)+' #duelHeader ';
 sr2.textContent=[HR+'.duelMeta',HR+'.duelMeta *',HR+'.af327CmdName',HR+'.afMeta',HR+'.afMeta *',HR+'.duelProfile .duelInfo>*:not(.duelBar)'].join(',')
  +'{text-shadow:0 0 2px #000,0 1px 2px #000,0 0 5px rgba(0,0,0,.9)!important}';
 document.head.appendChild(sr2);
 /* S: büyü düğmesinin arkasında birim varken düğme yarı saydam (basılabilir kalır). */
 const ss=document.createElement('style');ss.id='afp263SkillFadeCss';
 ss.textContent='html'+':not(#_s)'.repeat(11)+' #hud .af263-thru{opacity:.32!important;transition:opacity .15s ease!important}';
 document.head.appendChild(ss);
 let fadeT=0;
 window.__afp263SkillFade=function(order,W,H){
  const now=performance.now();if(now-fadeT<120)return;fadeT=now;
  const cv=document.getElementById('game'),hud=document.getElementById('hud');if(!cv||!hud)return;
  const cr=cv.getBoundingClientRect();if(!cr.width||!W||!H)return;const sx=cr.width/W,sy=cr.height/H;
  for(const id of ['skill','skill2']){const b=document.getElementById(id);if(!b)continue;
   const r=b.getBoundingClientRect();let hit=false;
   if(r.width>0&&hud.classList.contains('battle-live')){
    for(const u of order){const v=u&&u._vis;if(!v||!(u.hp>0)||u.isBarrier)continue;
     const x=cr.left+v.x*sx,foot=cr.top+v.y*sy,head=cr.top+(v.y-(v.top||0))*sy-24,hw=16;
     if(x+hw>r.left&&x-hw<r.right&&foot>r.top&&head<r.bottom){hit=true;break;}}}
   if(b.classList.contains('af263-thru')!==hit)b.classList.toggle('af263-thru',hit);}
  /* V: üst şeritlerin kapladığı alan (tuval koordinatında) */
  const fl=[];for(const id of ['af203BattleBar','battleProStrip']){const e=document.getElementById(id);if(!e)continue;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.1)continue;
   const q=e.getBoundingClientRect();if(q.width<4||q.height<4||q.top>cr.top+cr.height*.4)continue;fl.push([(q.left-cr.left)/sx,(q.right-cr.left)/sx,(q.bottom-cr.top)/sy+2]);}
  hudFloors=fl;
 };
 let hudFloors=[];
 window.__afp263HudFloor=function(x,w){let f=0;const h=(w||0)/2+20;for(const r of hudFloors)if(x+h>r[0]&&x-h<r[1])f=Math.max(f,r[2]);return f;};
 /* T: Duraklatılamayan maç (dereceli Arena, Sancak, çevrim içi). Oyun "Çevrim içi maçta duraklatma yok" mesajını savaş
    şeridine yazıyordu; bu modlarda şerit gizli olduğu için hiçbir şey görünmüyor, düğme bozuk sanılıyordu. Düğme soluk
    gösterilir; basınca yanında kısa bir açıklama çıkar. Duraklatma kuralı değişmez. */
 const st2=document.createElement('style');st2.id='afp263NoPauseCss';
 st2.textContent='html'+':not(#_t)'.repeat(11)+' #af274PauseBtn.af263-nopause{opacity:.45!important;filter:grayscale(.6)!important}'
  +'#afp263NoPauseTip{position:fixed;z-index:2147483100;max-width:200px;padding:6px 10px;border:1px solid #d9b45a;border-radius:9px;background:#120f0cf2;color:#ffe8b8;font:700 11px/1.3 system-ui,sans-serif;box-shadow:0 4px 14px #000a;pointer-events:none;transition:opacity .2s}';
 document.head.appendChild(st2);
 const noPause=()=>!!(window.__AFPDisguisedMatchActive||(window.__AFPUseModeNetworkV1&&window.__AFPOnlineContext&&window.__AFPOnlineContext.active));
 setInterval(()=>{const b=document.getElementById('af274PauseBtn'),hud=document.getElementById('hud');if(!b)return;const on=!!(hud&&hud.classList.contains('battle-live')&&noPause());if(b.classList.contains('af263-nopause')!==on)b.classList.toggle('af263-nopause',on);},500);
 let tipT=0;
 document.addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('#af274PauseBtn');if(!b||!noPause())return;
  let t=document.getElementById('afp263NoPauseTip');if(!t){t=document.createElement('div');t.id='afp263NoPauseTip';t.setAttribute('role','status');document.body.appendChild(t);}
  t.textContent='Çevrim içi / dereceli maçta duraklatma yok: rakip beklemez. Çıkmak için ✕.';
  const r=b.getBoundingClientRect();t.style.opacity='1';t.style.left=Math.max(6,Math.round(r.right-200))+'px';t.style.top='0px';
  const h=t.getBoundingClientRect().height;t.style.top=Math.max(6,Math.round(r.top-h-6))+'px';
  clearTimeout(tipT);tipT=setTimeout(()=>{t.style.opacity='0';},2200);},true);
 /* U: Sonuç ekranı sağ panel. Uzun alt başlık ("ZAFER · TAŞ KOLOSUS DEVRİLDİ!") iki satıra bölününce altındaki ödül
    kutularının (Kupa/TP/Sezon XP) çerçevesine biniyordu. Kutular, başlığın bittiği yerin altına kaydırılır. */
 setInterval(()=>{try{const m=document.querySelector('.afqv-mode'),c=m&&m.nextElementSibling;if(!m||!c||!c.classList.contains('afqv-chips'))return;
  const mb=m.getBoundingClientRect(),cb=c.getBoundingClientRect();if(!mb.height||!cb.height)return;
  /* katman ölçekli çiziliyor: ekran pikselini öğe pikseline çevir, kararlı bir değere otursun */
  const k=(c.offsetHeight&&cb.height)?cb.height/c.offsetHeight:1,cur=parseFloat(c.dataset.af263Shift||'0')||0;
  const need=Math.max(0,Math.ceil((mb.bottom+3-(cb.top-cur*k))/k));
  if(need!==cur){c.dataset.af263Shift=String(need);c.style.marginTop=need?need+'px':'';}}catch(_){}},400);
 /* W: Büyü ayrıntı penceresi. Pencere alçak ekranda 250 px, içerik 266 px; ÖNİZLE / YUVA / GELİŞTİR satırı kaydırma
    alanının en altında kalıp ~11 px kesiliyordu (740×360, 800×360). Alçak ekranda büyük simge 64→50 px küçülür ve
    düğme satırı pencerenin altına sabitlenir (açıklama uzasa da düğmeler hep görünür). */
 const sw=document.createElement('style');sw.id='afp263SpellWinCss';const HW='html'+':not(#_w)'.repeat(11);
 sw.textContent='@media (max-height:430px){'+HW+' .afx-hrSpellPanel .afx-hrSpHead .afx-hrHex.is-big{width:50px!important;height:61px!important;flex:0 0 50px!important}'
  +HW+' .afx-hrSpellPanel .afx-hrSpHead .afx-hrHex.is-big canvas{width:46px!important;height:57px!important}'
  /* bakiye satırı üst çubuktakinin birebir tekrarı; alçak ekranda yer açmak için pencerede gizlenir */
  +HW+' .afx-hrSpellPanel>.afp-spend-bar{display:none!important}'
  +HW+' .afx-hrSpellPanel>.afx-hrSpActs{position:sticky!important;bottom:-8px!important;z-index:3!important;margin-top:auto!important;margin-bottom:-8px!important;padding:5px 0 8px!important;background:linear-gradient(rgba(11,14,23,0),#0b0e17 7px)!important}}';
 document.head.appendChild(sw);
 /* X: Kupa Yolu ödül kartları eşit genişlik, ad alanı sabit iki satır (uzun ad resmi küçültmez). */
 const sx2=document.createElement('style');sx2.id='afp263RoadCss';const HX2='html'+':not(#_x)'.repeat(11)+' .af228-reward';
 sx2.textContent=HX2+'{min-width:90px!important}'
  +HX2+'>b{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;overflow:hidden!important;line-height:1.12!important;min-height:2.24em!important;max-height:2.24em!important;text-align:center!important;align-content:center!important;overflow-wrap:normal!important;word-break:normal!important}';
 document.head.appendChild(sx2);
 /* Y: Minyonlar ekranı nadirlik sekmeleri (TÜMÜ … PLATİN) 667/740 genişlikte 289 px'lik alana sığmıyor, EFSANEVİ yarım
    ve PLATİN görünmüyordu (kaydırma işareti yok). Dar ekranda boşluk/yazı küçültülür, altı sekme de sığar. */
 const sy2=document.createElement('style');sy2.id='afp263MinTabsCss';const HY='html'+':not(#_y)'.repeat(13)+' .afp132-tabs';
 sy2.textContent='@media (max-width:860px){'+HY+'{column-gap:3px!important;gap:3px!important}'+HY+'>.afp132-tab{padding:4px 4px!important;min-width:0!important}'
  +HY+'>.afp132-tab>b{font-size:9.5px!important;letter-spacing:0!important}'+HY+'>.afp132-tab>small{font-size:9px!important}}';
 document.head.appendChild(sy2);
 /* Z: Minyon ayrıntısı → EKİPMAN yuvaları (SİLAH / ZIRH / TILSIM). 84 px'lik yuvada simge + boşluk yazıya 49 px
    bırakıyordu; "Boş · dokun ve kuşan (1)" ve "Boş · kulede kazanılır" "dokun ve…" diye kesiliyordu. Simge yuvanın
    sağ üst köşesine küçük alınır, yazı yuvanın tam genişliğini kullanır (iki satır, kesilmeden). */
 const sz=document.createElement('style');sz.id='afp263GearSlotCss';const HZ='html'+':not(#_z)'.repeat(13)+' .afp134-gearRow>.af4-gslot';
 sz.textContent=HZ+'{position:relative!important;padding:5px 6px!important;gap:0!important}'
  +HZ+'>svg{position:absolute!important;top:5px!important;right:5px!important;width:12px!important;height:12px!important;opacity:.85}'
  +HZ+'>span{width:100%!important;min-width:0!important}'
  +HZ+'>span>small{display:block!important;-webkit-line-clamp:unset!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important;line-height:1.15!important;height:auto!important;max-height:none!important}';
 document.head.appendChild(sz);
 /* AA: Mağaza → Yadigârlar. Alt bilgi satırı ("En fazla 4 yadigâr kuşanılır…") 740×360/800×360'ta alanın 12 px altında
    kalıp yarım görünüyordu. Ürün kartlarına dokunmadan ızgara alt boşluğu, not iç boşluğu ve aralık kısılır. */
 const saa=document.createElement('style');saa.id='afp263RelicNoteCss';const HA='html'+':not(#_aa)'.repeat(13)+' .af4-shopSectionBody';
 /* kaynak kurallar @layer af172Commerce içinde (katmanlı !important katmansızı yener) → düzeltme aynı katmanda */
 saa.textContent='@layer af172Commerce{@media (max-height:370px){'+HA+':has(>.af4-slots){row-gap:3px!important;gap:3px!important}'+HA+'>.af4-slots~.af171-products{padding-bottom:0!important}'+HA+'>.af4-slots~.af4-note{padding:0 2px!important}}}';
 document.head.appendChild(saa);
 /* AB: Kahramanlar ekranı iki tasarım. Yeni Heroic görünüm (#afxHero) yalnız BÜYÜLER sekmesi için; ÖZET / EKİPMAN /
    KIYAFETLER / İLERLEME sekmelerinde altındaki eski "Kahraman Dosyası" ekranı görünüyor ve kolonlar, çerçeveler, renkler
    farklıydı. İşlev aynı kalır (aynı data-act düğmeleri); eski ekran yeni görünümün kolon oranlarına (%23 · %22 · %55)
    ve panel stiline (lacivert degrade, 2 px altın çerçeve, 15 px köşe; sekmeler aynı düğme stili) getirilir. */
 const sab=document.createElement('style');sab.id='afp263HeroUnifyCss';const HS='html'+':not(#_ab)'.repeat(13)+' #af4Screen[data-screen="heroes"]';
 sab.textContent=HS+'{padding-left:0!important;padding-right:0!important;padding-bottom:0!important}'
  +HS+' .af332-heroes{grid-template-columns:minmax(100px,23%) minmax(0,1fr)!important;gap:0!important;height:100%!important}'
  +HS+' .af332-rail{background:linear-gradient(160deg,#111d32,#050b19)!important;border:2px solid #bd924b!important;border-radius:15px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.133)!important}'
  +HS+' .af332-prof{grid-template-columns:minmax(94px,28.6%) minmax(0,1fr)!important;background:linear-gradient(#13263f,#071325)!important;border:2px solid #bb914f!important;border-radius:15px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.133)!important}'
  +HS+' .af332-profArt{background:linear-gradient(#1b344d 0%,#0b192b 55%,#040b15 100%)!important;border:2px solid #b78a48!important;border-radius:14px!important;margin:-2px 0 -2px -2px!important}'
  +HS+' .af332-tabBtn:not(.is-active){background:linear-gradient(#223d5c,#0a182b)!important;border:1px solid #a78c5d!important;border-radius:5px!important;color:#e9dcc0!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important}'
  +HS+' .af332-tabBtn{border-radius:5px!important}'
  +HS+' .af332-hcard{background:linear-gradient(160deg,#16243b,#08111f)!important;border:1px solid rgba(189,146,75,.55)!important;box-shadow:none!important}'
  +HS+' .af332-hcard.is-focus{border-color:#7fb4ff!important;box-shadow:0 0 0 1px #7fb4ff inset!important}'
  /* dar liste: başlık ve kart alt yazısı sığsın (KAHRAMANLAR 83/59 px, "SAVUNMA · 150 KUPA" 80/78 px taşıyordu) */
  +'@media (max-width:760px){'+HS+' .af332-rail h1{letter-spacing:0!important;font-size:9px!important;white-space:nowrap!important}'
  +HS+' .af332-hcard small{letter-spacing:0!important;font-size:6.6px!important}'+HS+' .af332-hcard{grid-template-columns:36px minmax(0,1fr)!important}}';
 document.head.appendChild(sab);
 const SEL='button,[role=button],.battlePick,.afqv-tile,input,select,a[href]';
 function vis(e){const r=e.getBoundingClientRect();if(r.width<6||r.height<6)return null;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return null;if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth)return null;return r;}
 function collect(card){
  const out=[];const add=(r,w)=>{if(r)out.push({l:r.left,t:r.top,r:r.right,b:r.bottom,a:Math.max(1,r.width*r.height),w});};
  const walk=root=>{root.querySelectorAll('*').forEach(e=>{if(e.shadowRoot)walk(e.shadowRoot);if(card.contains(e))return;
    if(e.matches&&e.matches(SEL)){add(vis(e),e.classList&&e.classList.contains('battlePick')?6:3);}
    else if(e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1)){const r=vis(e);if(r&&r.width*r.height<innerWidth*innerHeight*.3)add(r,1);}
    if(e.tagName==='IMG'&&e.closest&&e.closest('.afqv-stage,.afqv-root,#afqvRoot,[class^="afqv"]')&&!e.classList.contains('afqv-hero')&&!e.classList.contains('afqv-bg')){const r=vis(e);if(r&&r.width*r.height>1500)add(r,4);}
  });};
  walk(document);
  const ring=document.getElementById('afpGuideRing');if(ring&&ring.style.display!=='none')add(vis(ring),12);
  const ring2=document.getElementById('afpGuideRing2');if(ring2&&ring2.style.display!=='none')add(vis(ring2),2);
  return out;}
 function score(x,y,w,h,P){let s=0;const l=x,t=y,r=x+w,b=y+h;for(const p of P){const iw=Math.min(r,p.r)-Math.max(l,p.l),ih=Math.min(b,p.b)-Math.max(t,p.t);if(iw>0&&ih>0)s+=p.w*(iw*ih)/p.a;}
  if(x<0||y<0||r>innerWidth||b>innerHeight)s+=50;return s;}
 let busy=false,lastSig='';
 function place(){
  const card=document.getElementById('afpGuide');if(!card||card.hidden||busy)return;busy=true;
  try{
   card.classList.remove('af263-placed');card.style.left='';card.style.top='';card.style.width='';
   const pEl=card.querySelector('.g-p'),mini=!card.classList.contains('btl')&&!!pEl&&/^GERİ ile ana ekrana dön/.test(pEl.textContent||'');
   card.classList.toggle('af263-mini',mini);card.classList.remove('af263-short');
   /* Dar ekranda şerit sığmazsa ";" sonrası açıklama gizlenir; ana komut ("GERİ ile ana ekrana dön") her zaman görünür. */
   if(mini&&!pEl.querySelector('.af263-rest')){const t=pEl.textContent,k=t.indexOf(';');if(k>0){pEl.textContent=t.slice(0,k);const sp=document.createElement('span');sp.className='af263-rest';sp.textContent=t.slice(k);pEl.appendChild(sp);}}
   const d=card.getBoundingClientRect(),P=collect(card),W=innerWidth,H=innerHeight,m=6;
   /* Savaşta: alt kontrol sırasındaki boşluk = son el/kart düğmesinin sağı ile sağ kenar düğmelerinin solu arası (koridorların altında). */
   if(card.classList.contains('btl')){
    let L=0,R=W;const hud=document.querySelectorAll('button,.battlePick,[role=button]');
    hud.forEach(e=>{if(card.contains(e))return;const r=vis(e);if(!r)return;const cx=(r.left+r.right)/2;if(r.top>H*.62&&cx<W*.78)L=Math.max(L,r.right);if(r.left>W*.80&&r.bottom>H*.55)R=Math.min(R,r.left);});
    const fw=Math.floor(R-L-2*m);
    if(L>0&&fw>=108){card.classList.add('af263-placed');card.style.width=fw+'px';const fh=card.getBoundingClientRect().height;card.style.width='';card.classList.remove('af263-placed');
     const y=H-fh-m,sc=score(L+m,y,fw,fh,P);
     card.classList.add('af263-placed');card.style.left=Math.round(L+m)+'px';card.style.top=Math.round(y)+'px';card.style.width=fw+'px';card.dataset.af263Score='alt-bosluk '+sc.toFixed(2);return;}
   }
   if(mini){
    /* Üst çubuktaki en geniş boş aralık (kupa ile kaynak/ayar düğmeleri arası). Sığarsa şerit oraya oturur. */
    let barB=0;const items=[];P.forEach(q=>{if(q.t>=0&&q.t<14&&q.b<H*.2){barB=Math.max(barB,q.b);}});
    /* üst çubuğun altına kaymış (tepesi ekran dışında) içerik sayılmaz */
    if(barB>20){P.forEach(q=>{if(q.t>=0&&q.t<barB-4)items.push([q.l,q.r]);});items.sort((a,b)=>a[0]-b[0]);
     let gx=m,best=null;for(const [l,r] of items){if(l-gx>(best?best[1]-best[0]:0))best=[gx,l];gx=Math.max(gx,r);}if(W-m-gx>(best?best[1]-best[0]:0))best=[gx,W-m];
     if(best){const gw=Math.floor(Math.min(best[1]-best[0]-2*m,420));if(gw>=220){card.style.width=gw+'px';let gh=card.getBoundingClientRect().height;if(gh>barB+2){card.classList.add('af263-short');gh=card.getBoundingClientRect().height;if(gh>barB+2)card.classList.remove('af263-short');}card.style.width='';
      if(gh<=barB+2){const y=Math.max(2,Math.round((barB-gh)/2));card.classList.add('af263-placed');card.style.left=Math.round(best[0]+m+(best[1]-best[0]-2*m-gw)/2)+'px';card.style.top=y+'px';card.style.width=gw+'px';card.dataset.af263Score='ust-cubuk '+score(best[0]+m,y,gw,gh,P).toFixed(2);return;}}}}
   }
   const cands=[[d.left,d.top,d.width,d.height,0]];
   const w2=Math.min(d.width,Math.max(mini?240:280,Math.round(W*(mini?.34:.38))));
   card.style.width=w2+'px';const h2=card.getBoundingClientRect().height;card.style.width='';
   const top=Math.min(48,H*.14);
   for(const [x,y] of [[m,top],[W-w2-m,top],[m,H-h2-m],[W-w2-m,H-h2-m],[m,(H-h2)/2],[W-w2-m,(H-h2)/2],[(W-w2)/2,m],[(W-w2)/2,H-h2-m],[(W-w2)/2,(H-h2)/2]])cands.push([x,y,w2,h2,.15]);
   let best=null;for(const c of cands){const sc=score(c[0],c[1],c[2],c[3],P)+c[4];if(!best||sc<best.sc-1e-6)best={c,sc};}
   const base=score(d.left,d.top,d.width,d.height,P);
   if(best.c[4]>0&&best.sc<base-.05){card.classList.add('af263-placed');card.style.left=Math.round(best.c[0])+'px';card.style.top=Math.round(best.c[1])+'px';card.style.width=Math.round(best.c[2])+'px';card.dataset.af263Score=best.sc.toFixed(2)+'<'+base.toFixed(2);}
   else card.dataset.af263Score=base.toFixed(2);
  }catch(e){console.warn('[v3.60.263] rehber yerleşimi',e);}finally{busy=false;}}
 function sig(){const c=document.getElementById('afpGuide');if(!c||c.hidden)return '';const e=document.getElementById('end');return c.className.replace(' af263-placed','')+'|'+(c.classList.contains('btl')?Math.floor(Date.now()/1000):'')+'|'+c.textContent.length+'|'+innerWidth+'x'+innerHeight+'|'+(e&&e.className)+'|'+(document.getElementById('hud')||{}).className+'|'+((document.getElementById('afxModeScreen')||{}).hidden)+'|'+document.querySelectorAll('.battlePick').length;}
 setInterval(()=>{const s=sig();if(s&&s!==lastSig){lastSig=s;place();}else if(!s)lastSig='';},350);
 addEventListener('resize',()=>{lastSig='';});
 window.__AFP263GuidePlace=place;
})();
</script>
</body>"""
sub('E-C4-calisma-ani', '</body>', RUNTIME)

open(DST, 'w', encoding='utf-8').write(s)
out_sha = hashlib.sha256(s.encode('utf-8')).hexdigest()
print('Uygulanan değişiklik:', len(changes), '·', ', '.join(changes))
print('Kaynak SHA-256:', src_sha)
print('Çıktı  SHA-256:', out_sha, '·', len(s.encode('utf-8')), 'bayt')
