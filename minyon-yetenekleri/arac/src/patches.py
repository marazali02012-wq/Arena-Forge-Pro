# AF285 kancaları: (etiket, eski metin, yeni metin). Her eski metin kaynakta tam bir kez bulunmalıdır.
PATCHES = [
    # 1) Benzetim: her karede yetenek durum makinesi (af264Step'in hemen ardından, birim döngüsünden önce).
    ('tick-step',
     "afp177Step(dt);afp179Step(dt);af264Step();",
     "afp177Step(dt);afp179Step(dt);af264Step();af285Step(dt);"),
    # 2) Hazırlık/kullanım/toparlanma sırasında birim yürümez ve normal saldırı yapmaz.
    ('unit-busy',
     "if((u._af279SupportUntil||0)>elapsed){u._afTower=0;continue;}",
     "if(af285Busy(u)){u._afTower=0;u._afEng=1;continue;}if((u._af279SupportUntil||0)>elapsed){u._afTower=0;continue;}"),
    # 3) Çizim: yetenek efektleri birimlerin ve mermilerin üstünde, can çubuklarının altında.
    ('draw-pass',
     "try{AFX.draw(dt);}catch(_){}",
     "try{AFX.draw(dt);}catch(_){}try{af285Draw();}catch(_){}"),
    # 4-5) Gövde pozu: hamle / çömelme / sıçrama ofsetleri her iki çizim yoluna (AF321 ağ ve atlas) uygulanır.
    ('hero-x',
     "const x=laneX(u.x),px=af320PxFor(R.cls,u.lane,R.artBulk??R.bulk)*(u._af205Boss?1.32:1),k2=px/C.h;",
     "const px=af320PxFor(R.cls,u.lane,R.artBulk??R.bulk)*(u._af205Boss?1.32:1),x=laneX(u.x)+af285PoseDX(u,px),k2=px/C.h;"),
    ('hero-y',
     "    +(u._afSkeletonCloneSide||0)*px*.15+af34034MeleeFlankOffset(u,px);\n  if(afp177DrawHero",
     "    +(u._afSkeletonCloneSide||0)*px*.15+af34034MeleeFlankOffset(u,px)+af285PoseDY(u,px);\n  if(afp177DrawHero"),
    # 6) AF321 iskelet animasyonu: hazırlıkta silah geri çekilir, kullanımda vuruş karesi oynar.
    ('mesh-pose',
     "  const M=AF321.pose(K,st,env);",
     "  af285PoseEnv(u,env);const M=AF321.pose(K,st,env);"),
    # 7) Atlaslı yeni minyonlar: hazırlık/vuruş kareleri yetenek evresine göre seçilir.
    ('atlas-pose',
     "   const alpha = u._afBattleGhost ? (u._afBattleGhostValid ? .63 : .42) : (u.isEcho ? .67 : 1);",
     "   { const ab = (!u._afBattleGhost && typeof window.__AF285Pose === 'function') ? window.__AF285Pose(u) : null;\n"
     "     if (ab && geometry[type][ab.state]) { state = ab.state; frame = Math.max(0, Math.min(7, ab.frame | 0)); } }\n"
     "   const alpha = u._afBattleGhost ? (u._afBattleGhostValid ? .63 : .42) : (u.isEcho ? .67 : 1);"),
    # 8-11) Çevrim içi eşitleme: ev sahibi yetenek durumunu ve efektlerini gönderir, seat 2 aynalar.
    ('snap-fields',
     "'_afSkeletonCloneSide','_af214GroupMember'];",
     "'_afSkeletonCloneSide','_af214GroupMember','_af285S','_af285A','_af285B','_af285R','_af285X','_af285L','_af285N','_af285Ward','_af285Aegis','_af285Dome','_af285DomeM','_af285DomeC','_af285Dizzy','_af285Vine','_af285VineEnd'];"),
    ('snap-fx',
     "units:list,shellShots,abilityFx,",
     "units:list,shellShots,abilityFx,af285Fx:af285NetFx(),"),
    ('snap-mirror',
     "for(const k of ['_af264TunnelFrom','_af264TunnelTo'])if(Number.isFinite(raw[k]))u[k]=1-clamp(raw[k],0,1);",
     "for(const k of ['_af264TunnelFrom','_af264TunnelTo','_af285X'])if(Number.isFinite(raw[k]))u[k]=1-clamp(raw[k],0,1);"),
    ('snap-apply-fx',
     "    {const ah=clamp(snapshot.enemyPortalHp&&snapshot.enemyPortalHp[0],0,100000,allySharedHP)",
     "    try{af285ApplyNetFx(snapshot.af285Fx);}catch(_){}\n    {const ah=clamp(snapshot.enemyPortalHp&&snapshot.enemyPortalHp[0],0,100000,allySharedHP)"),
    ('ability-death',
     "if(u.hp<=0){af264CombatEvent('death',u,u._af264Killer);",
     "if(u.hp<=0){af285Death(u);af264CombatEvent('death',u,u._af264Killer);"),
    ('scout-mark-damage',
     " let d=af267Run('guard',tgt,att,dmg,kind);",
     " let d=af267Run('guard',tgt,att,dmg,kind);if(att&&att!==tgt._af285MarkBy&&att.team!==tgt.team&&tgt._af285MarkBy?.team===att.team&&(tgt._af285MarkUntil||0)>elapsed)d*=tgt.isBoss?1.06:1.15;"),
    ('ability-armor-pierce',
     "function af264Pierce(att,kind){\n  if(kind!=='hit')return 0;",
     "function af264Pierce(att,kind){\n  if(kind==='af285Pierce')return .65;\n  if(kind!=='hit')return 0;"),
    ('melee-counter',
     " dr=Math.max(dr,crackedArmor);",
     " d=af285CounterDamage(att,tgt,d,kind);dr=Math.max(dr,crackedArmor);"),
    ('ability-slow-gate',
     "function af264Slow(u,seconds,interval){\n  if(!af264Targetable(u)||u.isBarrier||u.immuneUntil>elapsed||!af264Ready(u,'_af264SlowGate',interval))return;",
     "function af264Slow(u,seconds,interval,gate='_af264SlowGate'){\n  if(!af264Targetable(u)||u.isBarrier||u.immuneUntil>elapsed||!af264Ready(u,gate,interval))return;"),
    # 0) Yapı adı: hangi dosyanın denendiği oyunda görülsün.
    ('title',
     "<title>Arena Forge Pro · v3.60.284 Minyon Geliştirme TEST</title>",
     "<title>Arena Forge Pro · v3.60.285 Minyon Yetenek TEST</title>"),
    # 12) Fiziksel yetenek hasarı zırh/koruma kurallarına girer (büyü hasarı girmez).
    ('physical-kind',
     "if(kind==='af264Shell'||kind==='af264Earth'||kind==='af267Physical'||kind==='reflectedArrow'||kind==='tower')return true;",
     "if(kind==='af264Shell'||kind==='af264Earth'||kind==='af267Physical'||kind==='af285Physical'||kind==='af285Pierce'||kind==='reflectedArrow'||kind==='tower')return true;"),
]
