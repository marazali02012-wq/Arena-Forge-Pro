from pathlib import Path
import re
src=Path('/mnt/data/afp_work/ORIJINAL_v3.60.260.html')
out=Path('/mnt/data/ARENA_FORGE_PRO_v3.60.260_ONARIM_TEST.html')
s=src.read_text(encoding='utf-8')
start=s.index('<script data-bundled="afp_motor.js">')
body_start=s.index('>',start)+1
body_end=s.index('</script>',body_start)
engine=s[body_start:body_end]
changes=[]
def once(a,b,label):
 global engine
 count=engine.count(a)
 if count!=1: raise RuntimeError(f'{label}: wanted one matching location; found {count}')
 engine=engine.replace(a,b,1)
 changes.append(label)
once('return Math.round(d);\n}\nfunction af327PeriodMul(u)', 'return d>0?Math.max(1,Math.round(d)):0; // tiny positive passive hit must not round to zero\n}\nfunction af327PeriodMul(u)', 'Pozitif minyon hasarı sıfıra düşmüyor')
once('target.hp-=damage;target.hitFlash=.13;', 'target.hp=Math.max(0,target.hp-damage);target.hitFlash=.13;', 'Minyon canı negatif olmuyor')
once("function af334PortalDmg(side,lane,amount){const me=side.team==='ally',fp=af327FoePortal(side);if(!(fp[lane]>0))return 0;const f=me?af327EnemyPortalFactor(lane):af327PortalFactor(lane);const pb=fp[lane];fp[lane]=Math.max(0,pb-Math.round(amount*f));const real=pb-fp[lane];if(me)matchStats.towerDamage+=real;side.portalDmg=(side.portalDmg||0)+real;return real;}",
"function af334PortalDmg(side,lane,amount){const me=side.team==='ally',fp=af327FoePortal(side);if(!(fp[lane]>0))return 0;const f=me?af327EnemyPortalFactor(lane):af327PortalFactor(lane);const pb=fp[lane];const raw=Number(amount)*Number(f);const hit=Number.isFinite(raw)&&raw>0?Math.max(1,Math.round(raw)):0;fp[lane]=Math.max(0,pb-hit);const real=pb-fp[lane];if(me)matchStats.towerDamage+=real;side.portalDmg=(side.portalDmg||0)+real;return real;}", 'Pozitif büyü portal hasarı sıfıra yuvarlanmıyor')
once("try{if(typeof AF321!=='undefined'&&typeof AF321_ATLAS!=='undefined')Object.keys(AF321_ATLAS).forEach(k=>AF321.register(k,AF321_ATLAS[k]));}catch(e)",
"try{if(typeof AF321!=='undefined'&&typeof AF321_ATLAS!=='undefined'){const emptyAtlas='data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';Object.keys(AF321_ATLAS).forEach(k=>{const src=AF321_ATLAS[k];if(src&&src!==emptyAtlas)AF321.register(k,src);});}}catch(e)", '1x1 boş animasyon atlasları artık yüklenmiyor, mevcut karakter çizim yedeği korunuyor')
once('speed:colGolem?-(sp*.075):-sp,atk,cd:.4,attackPeriod:mult.period',
'speed:colGolem?-(sp*.65):-sp,atk,cd:.4,attackPeriod:mult.period', 'Taş Kolosus aşırı yavaş ilerlemiyor')
once("{const enemyDown=enemySharedHP<=0,portalsDown=allySharedHP<=0,castleDown=baseHP<=0,allyDown=castleDown||portalsDown;\n   if(enemyDown&&allyDown){",
"{const enemyDown=enemySharedHP<=0,portalsDown=allySharedHP<=0,castleDown=baseHP<=0,allyDown=castleDown||portalsDown;\n   // Yankı İstilası has its own three-wave + final-boss victory condition.\n   // A destroyed enemy portal must not bypass that objective.\n   const echoBossPending=gameMode==='echo'&&af203Run?.active&&!af203Run.bossDefeated;\n   if(enemyDown&&allyDown&&!echoBossPending){", 'Yankı final boss ölmeden portal kaynaklı beraberlik engellendi')
once("   if(enemyDown){draw(dt);endGame(true);updateHUD();return}\n   if(allyDown){draw(dt);endGame(false,", 
"   if(enemyDown&&!echoBossPending){draw(dt);endGame(true);updateHUD();return}\n   if(allyDown){draw(dt);endGame(false,", 'Yankı final boss ölmeden portal kaynaklı sahte zafer engellendi')
new=s[:body_start]+engine+s[body_end:]
new='<!-- AFP yerel test onarımı: minyon sıfır hasar, portal büyü hasarı, Kolosus hızı, Yankı final boss ve boş atlas yükleme; Replit ana dosyası değiştirilmedi. -->\n'+new
out.write_text(new,encoding='utf-8')
Path('/mnt/data/afp_work/patch_list.txt').write_text('\n'.join(changes))
Path('/mnt/data/afp_work/script_030_modified.js').write_text(engine)
print('WRITTEN',out,len(new),len(changes),'\n'.join(changes),sep='\n')
