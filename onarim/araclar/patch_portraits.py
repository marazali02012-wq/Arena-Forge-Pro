from pathlib import Path
from datetime import datetime
import re

source=Path('/mnt/data/ARENA_FORGE_PRO_v3.60.260_ONARIM_TEST.html')
target=Path('/mnt/data/ARENA_FORGE_PRO_v3.60.261_KART_GORSEL_ONARIM_TEST.html')
s=source.read_text()
changes=[]

def replace_once(old,new,label):
 global s
 n=s.count(old)
 if n!=1: raise RuntimeError(f'{label}: expected one occurrence found {n}')
 s=s.replace(old,new,1)
 changes.append(label)

# A retrieved art slot may still contain a legacy empty marker; use its embedded pack key instead.
replace_once(
 "var s=slots[key],v=s&&s.holder?s.holder[s.prop]:(valid(pack[key])?pack[key]:''),p=keyParts(key);",
 "var s=slots[key],v=s&&s.holder?s.holder[s.prop]:'',p=keyParts(key);\n   if(!valid(v)&&valid(pack[key]))v=pack[key]; /* v3.60.261: boş eski slot gömülü aslı maskelemesin */",
 'AFArt.get: legacy empty slot uses valid embedded portrait')

# Keep existing custom group art, but prefer exact IDs rather than category stock images.
helper='''
/* v3.60.261 — yalnız kart görseli kaynağı. Kart yetenekleri/deste/savaş korunur. */
function afpResolvedMinionPortrait(type){
  if(!type)return '';
  const A=window.AFArt;
  const own=window.AFP94_MINION_CARDS?.[type]||'';
  const embedded=A?.get('minion.portrait.'+type)||'';
  const artType=afHeroArtSource(type);
  const core=HERO_PORTRAITS[type]||'';
  const artAlias=artType&&artType!==type?HERO_PORTRAITS[artType]||'':'';
  const full=A?.get('minion.full.'+type)||'';
  return [own,embedded,core,artAlias,full].find(src=>typeof src==='string'&&src.length>64&&!(A?.isPlaceholder?.(src)))||'';
}
'''
replace_once('function af215GroupCardArt(type){',helper+'function af215GroupCardArt(type){', 'exact-ID minion portrait resolver')
replace_once('''  const src = window.AFP253AtlasPortraits[type] !== undefined
    ? window.AFArt.get('minion.portrait.'+type)
    : HERO_PORTRAITS[type];''', '''  const src = afpResolvedMinionPortrait(type);''','minion card renderer uses real embedded portrait')
replace_once("const visualType=afHeroArtSource(type),visualPortrait=''; /* v3.41.70: legacy hidden #menu grid uses lightweight emoji; shared portraits remain for battle and AF324. */",
             "const visualPortrait=afpResolvedMinionPortrait(type); /* v3.60.261: gerçek görseli varsa kartı boş/emoji bırakma. */",
             'legacy collection explicitly blank art restored')
replace_once("portrait.src=visualPortrait;portrait.style.display='block';portrait.alt=info.name+' kahraman portresi';",
             "portrait.src=visualPortrait;portrait.loading='lazy';portrait.decoding='async';portrait.style.display='block';portrait.alt=info.name+' kahraman portresi';",
             'lazy-load restored legacy portraits')
replace_once('''  if(HERO_PORTRAITS[t]&&!failed.has('p:'+t))return HERO_PORTRAITS[t];
  return '';
 };''', '''  if(HERO_PORTRAITS[t]&&!failed.has('p:'+t))return HERO_PORTRAITS[t];
  // Önce yalnızca karakterin kendi anahtarı: yanlış karakter resmini kullanma.
  const packed=window.AFArt?.get('minion.portrait.'+t)||window.AFArt?.get('minion.full.'+t)||'';
  if(packed&&!window.AFArt?.isPlaceholder(packed)&&!failed.has('p:'+t))return blobUrl('p:'+t,packed);
  return '';
 };''','AF324 portrait fallback uses only same-character assets')

# Unlike a failed network fetch, an image with an unusable 1x1 placeholder may load without errors.
# Only card images receive this guard, and it does not retry sources indefinitely.
recovery='''
<!-- v3.60.261: Kart görselleri yüklenemediğinde yalnızca aynı karakterin gömülü portresine dön. -->
<style id="afp261-card-art-fallback-style">
.afp261-broken-card-emblem{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
 color:#e7ca8e;font:800 24px/1 system-ui;pointer-events:none;z-index:1}
</style>
<script id="AFP261_CARD_PORTRAIT_RECOVERY">
(function(){'use strict';
 const tried=new WeakMap();
 function cardImg(img){return img&&img.tagName==='IMG'&&!!img.closest('.heroCard,.afp134-card,.af4-bust,.af4-figure,.afx-hrTileArt,.hubicHeroPortrait');}
 function cardType(img){
  const attr=img.getAttribute('data-af4p');if(attr)return attr;
  const tile=img.closest('[data-hero],[data-act^="hero:"],[data-act^="h:view|"]');if(!tile)return '';
  const act=tile.getAttribute('data-act')||'';
  return tile.getAttribute('data-hero')||(act.startsWith('hero:')?act.slice(5):act.startsWith('h:view|')?act.slice(7):'');
 }
 function choices(type){
  const A=window.AFArt;if(!A||!type)return [];
  const command=['ruul','valen','terrin','noella','alayna','stormknight','shadowblade'].includes(type);
  const keys=command?['commander.portrait.'+type,'commander.full.'+type]:['minion.portrait.'+type,'minion.full.'+type];
  let list=[];
  if(!command&&window.AFP94_MINION_CARDS?.[type])list.push(window.AFP94_MINION_CARDS[type]);
  for(const k of keys){const src=A.get(k);if(src)list.push(src);}
  if(!command){let deck=window.__afDeckAPI;const src=deck?.getPortrait?.(type);if(src)list.push(src);}
  return [...new Set(list.filter(src=>typeof src==='string'&&src.length>64&&!A.isPlaceholder(src)))];
 }
 function markFallback(img){
  if(img.dataset.afp261Fallback==='1')return;
  img.dataset.afp261Fallback='1';img.style.visibility='hidden';
  let parent=img.parentElement;if(!parent)return;
  if(getComputedStyle(parent).position==='static')parent.style.position='relative';
  if(!parent.querySelector(':scope > .afp261-broken-card-emblem')){
   const sym=document.createElement('span');sym.className='afp261-broken-card-emblem';
   sym.textContent='⚔';sym.setAttribute('aria-label','Görsel yüklenemedi');parent.appendChild(sym);
  }
  console.warn('[AFP261] Kart portresi kullanılamıyor:',cardType(img));
 }
 function recover(img){
  if(!cardImg(img)||img.dataset.afp261Fallback==='1')return;
  const type=cardType(img);if(!type)return;
  const seen=tried.get(img)||new Set();seen.add(img.getAttribute('src')||'');tried.set(img,seen);
  const next=choices(type).find(src=>!seen.has(src));
  if(next){seen.add(next);tried.set(img,seen);img.src=next;img.style.visibility='visible';return;}
  markFallback(img);
 }
 document.addEventListener('error',function(e){if(cardImg(e.target))recover(e.target);},true);
 document.addEventListener('load',function(e){const img=e.target;if(cardImg(img)&&img.naturalWidth<=2&&img.naturalHeight<=2)recover(img);},true);
})();
</script>
'''
if 'AFP261_CARD_PORTRAIT_RECOVERY' in s: raise RuntimeError('already patched')
s=s.replace('</body>',recovery+'</body>',1)
changes.append('card image error and 1x1 placeholder fallback for same character')
replace_once('<meta name="afp-build" content="v3.60.251" />','<meta name="afp-build" content="v3.60.261" />','test build meta matches output')
replace_once('<title>Arena Forge Pro v3.60.253 — Beş Büyücünün Hikâye Kitapları</title>','<title>Arena Forge Pro v3.60.261 — Kart Görselleri Onarım TEST</title>','test HTML title matches output')
s='<!-- AFP v3.60.261 TEST: boş koleksiyon kart portreleri ve hatalı görsel yedeklemeleri düzeltildi; canlı sürüm değiştirilmedi. -->\n'+s

target.write_text(s)
print('SOURCE',source.name,source.stat().st_size)
print('OUTPUT',target.name,target.stat().st_size)
for i,c in enumerate(changes,1):print(f'{i}. {c}')
