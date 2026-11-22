"""v3.60.286 boss yürüyüş/zemin/yön onarımı yaması.
Kullanım: python3 yama_uygula.py <v3.60.285 HTML> <çıktı HTML> after
Her değişiklik benzersiz eşleşme ile uygulanır; eşleşme bulunmazsa yama durur (yanlış dosyaya uygulanmaz)."""
import sys, json, re
src, dst, mode = sys.argv[1], sys.argv[2], sys.argv[3]  # mode: before | after
import os
P = os.path.dirname(os.path.abspath(__file__)) + '/'
s = open(src, encoding='utf-8').read()

def rep(a, b, cnt=1):
    global s
    n = s.count(a)
    assert n == cnt, ('anchor count', n, a[:90])
    s = s.replace(a, b)

def between(start, end):
    i = s.index(start); j = s.index(end, i)
    assert s.count(start) == 1, start[:60]
    return i, j

if mode == 'before':
    stub = ("function afp286FallenInfo(){return null}function afp286Prewarm(){}const AFP286_BOSS_DEFS={};const AFP286_QA={};"
            "function afp286FrameLowestAny(){return null}function afp286DrawAtlas(){return {}}\n")
    qa = open(P + 'qa.js').read()
    rep("window.__afDeckAPI={", stub + qa + "\nwindow.__afDeckAPI={")
    open(dst, 'w', encoding='utf-8').write(s)
    sys.exit(0)

# ---------------- AF321 core: heavy cadence, quadruped front-leg IK, quad death ----------------
rep("const cadT=lerp(2.8,4.4,run)*(bt==='heavy'?.9:1);",
    "const cadT=lerp(2.8,4.4,run)*(bt==='heavy'?.9:1)*(R.cad||1); /* v3.60.286: büyük bosslar ağır, yavaş adım */")
rep("terr=sstep(kneeY-4,kneeY+14,y);",
    "terr=(R.quad||R.noTerr)?0:sstep(kneeY-4,kneeY+14,y); /* v3.60.286: boss rig'lerinde diz altındaki silah/pençe/kuyruk pikselleri bacağa yapıştırılmaz */")
rep("  K.groundY=Math.max(R.fL[1],R.fR[1]);",
    "  /* v3.60.286: dört ayaklı (R.quad) bosslarda kol zinciri ön bacaktır; ayak IK'sı için dinlenme boyları */\n"
    "  if(R.quad)K.restArm=[0,1].map(i=>{const S=i?'R':'L',h=R['s'+S],k=R['e'+S],f=R['h'+S];const L1=Math.max(1,Math.hypot(k[0]-h[0],k[1]-h[1])),L2=Math.max(1,Math.hypot(f[0]-k[0],f[1]-k[1]));"
    "const cr=(f[0]-h[0])*(k[1]-h[1])-(f[1]-h[1])*(k[0]-h[0]);const D0=Math.hypot(f[0]-h[0],f[1]-h[1]),off=Math.abs(cr)/Math.max(1,D0);const side=off>.12*(L1+L2)?Math.sign(cr):R.f;"
    "return {L1,L2,D0,side,reach:Math.min(D0,.965*(L1+L2)),a1:Math.atan2(k[1]-h[1],k[0]-h[0]),a2:Math.atan2(f[1]-k[1],f[0]-k[0])};});\n"
    "  K.groundY=Math.max(R.fL[1],R.fR[1],R.quad?Math.max(R.hL[0]>250?0:R.hL[1],R.hR[0]>250?0:R.hR[1]):0);")
rep("function newChannels(){return {cx:0,", "function newChannels(){return {ha:[[0,0],[0,0]],cx:0,")
rep("function solve(K,P,out){",
    "/* v3.60.286: ön bacak IK'sı (göğüs kemiğine bağlı iki kemikli zincir; legIK ile aynı çözüm) */\n"
    "function armIK(K,M,i,T){\n"
    "  const R=K.rig,S=i?'R':'L',L=K.restArm[i],o=CHEST*6,sp=apply(M,o,R['s'+S][0],R['s'+S][1]),rho=Math.atan2(M[o+1],M[o]);\n"
    "  let vx=T[0]-sp[0],vy=T[1]-sp[1];let D=Math.hypot(vx,vy);\n"
    "  const Dmin=Math.abs(L.L1-L.L2)+.5,Dmax=(L.L1+L.L2)*.9985;D=clamp(D,Dmin,Dmax);\n"
    "  const base=Math.atan2(vy,vx),ca=clamp((L.L1*L.L1+D*D-L.L2*L.L2)/(2*L.L1*D),-1,1),a=Math.acos(ca);\n"
    "  const aTh=base+L.side*a,kx=sp[0]+Math.cos(aTh)*L.L1,ky=sp[1]+Math.sin(aTh)*L.L1;\n"
    "  const ex=sp[0]+Math.cos(base)*D,ey=sp[1]+Math.sin(base)*D,aSh=Math.atan2(ey-ky,ex-kx);\n"
    "  return [wrap(aTh-rho-L.a1),wrap(aSh-aTh-(L.a2-L.a1))];\n"
    "}\n"
    "function solve(K,P,out){")
rep("    mulRot(out,UA[i]*6,out,CHEST*6,R['s'+S][0],R['s'+S][1],P.ua[i]);\n    mulRot(out,FA[i]*6,out,UA[i]*6,R['e'+S][0],R['e'+S][1],P.fa[i]);",
    "    if(R.quad&&K.restArm){const ik=armIK(K,out,i,P.ha[i]);mulRot(out,UA[i]*6,out,CHEST*6,R['s'+S][0],R['s'+S][1],ik[0]);mulRot(out,FA[i]*6,out,UA[i]*6,R['e'+S][0],R['e'+S][1],ik[1]);}\n"
    "    else{mulRot(out,UA[i]*6,out,CHEST*6,R['s'+S][0],R['s'+S][1],P.ua[i]);\n    mulRot(out,FA[i]*6,out,UA[i]*6,R['e'+S][0],R['e'+S][1],P.fa[i]);}")
rep("  const feet=[[0,0],[0,0]];", "  const feet=[[0,0],[0,0]],feetA=[[0,0],[0,0]];")
rep("      feet[i][0]=(off+cx)*wW;feet[i][1]=(K.groundY-rest[1]-lift)*wW;}",
    "      feet[i][0]=(off+cx)*wW;feet[i][1]=((K.footSole?K.footSole.g-K.footSole.o[i]:K.groundY)-rest[1]-lift)*wW;} /* v3.60.286: yürürken TABANLAR aynı zemine iner (ayak noktaları değil) */\n"
    "    /* v3.60.286 dört ayaklı yürüyüş: arka-sol 0, ön-sol .25, arka-sağ .5, ön-sağ .75 (yanal dizilim); ön ayak da basarken sabit kalır */\n"
    "    if(R.quad)for(let i=0;i<2;i++){let q=st.p+(i?.75:.25);q-=Math.floor(q);let off,lift=0;\n"
    "      if(q<sf){off=Sx*sf-2*Sx*q;}else{const u=(q-sf)/(1-sf),e=u*u*(3-2*u);off=-Sx*sf+2*Sx*sf*e;lift=Hl*Math.pow(Math.sin(Math.PI*u),.85);}\n"
    "      const rest=R['h'+(i?'R':'L')];feetA[i][0]=off*wW;feetA[i][1]=((K.footSole?K.footSole.g-K.footSole.oa[i]:K.groundY)-rest[1]-lift)*wW;}")
rep("    arm[0]+=armL*g0*wW;arm[1]+=(two?armL:armR)*g1*wW;",
    "    if(!R.quad){arm[0]+=armL*g0*wW;arm[1]+=(two?armL:armR)*g1*wW;}")
rep("g=-f*(84*k2-6*bounce)*D2R;", "g=-f*((R.quad?14:84)*k2-6*bounce)*D2R; /* v3.60.286: dört ayaklı devrilmez, çöker */")
rep("  for(let i=0;i<2;i++){const S2=i?'R':'L';const fr=R['f'+S2];P.ft[i][0]=fr[0]+f*feet[i][0];P.ft[i][1]=fr[1]+feet[i][1];}",
    "  for(let i=0;i<2;i++){const S2=i?'R':'L';const fr=R['f'+S2];P.ft[i][0]=fr[0]+f*feet[i][0];P.ft[i][1]=fr[1]+feet[i][1];}\n"
    "  if(R.quad){for(let i=0;i<2;i++){const hr=R['h'+(i?'R':'L')];P.ha[i][0]=hr[0]+f*feetA[i][0];P.ha[i][1]=hr[1]+feetA[i][1];}\n"
    "    if(env.dead){const k1=sstep(0,.3,env.deathT);for(let i=0;i<2;i++){P.ha[i][0]+=f*.05*Hs*k1*(i?1:-1);}}\n"
    "    else if(tau!==null&&wA>.001){let up,fw;if(tau<0){const a=sstep(-1,-.2,tau);up=.16*a;fw=.02*a+.10*sstep(-.25,0,tau);}else{const a=1-sstep(.1,.9,tau);up=.05*a;fw=.12*a;}\n"
    "      P.ha[W_][0]+=f*fw*Hs*wA;P.ha[W_][1]-=up*Hs*wA;}}")


# v3.60.286 AF321: düz taban ayak kemiği (kanatsız rig'lerde WG kemikleri ayak olur) + yere yakın sahipsiz pikselleri en yakın ayağa bağlama
rep("  for(let i=0;i<2;i++){if(leg[i]<=0)continue;const a=Math.min(rem,leg[i]);give(SH[i],a*shin[i]);const u=a*(1-shin[i]);give(TH[i],u*hip[i]);give(ROOT,u*(1-hip[i]));}",
    "  const flat=!!(R.flat&&!R.wings);\n"
    "  for(let i=0;i<2;i++){if(leg[i]<=0)continue;const a=Math.min(rem,leg[i]);"
    "if(flat){const fp=R['f'+(i?'R':'L')],ank=fp[1]-R.lr*.55,sh=sstep(ank-3,ank+3,y)*(Math.hypot(x-fp[0],y-fp[1])<R.lr*2.2?1:0);give(WG[i],a*shin[i]*sh);give(SH[i],a*shin[i]*(1-sh));}else "
    "give(SH[i],a*shin[i]);const u=a*(1-shin[i]);give(TH[i],u*hip[i]);give(ROOT,u*(1-hip[i]));}\n"
    "  if(R.snapY&&y>=R.snapY&&rem>.05){let bb=-1,bd=1e9;for(let i=0;i<2;i++){const S=i?'R':'L',fp=R['f'+S],d=Math.hypot(x-fp[0],y-fp[1]);if(d<bd){bd=d;bb=flat?WG[i]:SH[i];}"
    "if(R.quad){const hp=R['h'+S];if(hp[0]<250){const d2=Math.hypot(x-hp[0],y-hp[1]);if(d2<bd){bd=d2;bb=(R.w&&R.w.length)?FA[i]:WP[i];}}}}if(bb>=0)give(bb,rem);} /* v3.60.286: yere değen pençe/tırnak gövdeyle birlikte zemine batmaz */")
rep("    if(wg)mulRot(out,WG[i]*6,out,CHEST*6,wg.at[0],wg.at[1],P.wg*(i?-1:1)*R.f);else for(let j=0;j<6;j++)out[WG[i]*6+j]=out[CHEST*6+j];",
    "    if(wg)mulRot(out,WG[i]*6,out,CHEST*6,wg.at[0],wg.at[1],P.wg*(i?-1:1)*R.f);\n"
    "    else if(R.flat){const fp=R['f'+S],q=apply(out,SH[i]*6,fp[0],fp[1]),o=WG[i]*6;out[o]=1;out[o+1]=0;out[o+2]=0;out[o+3]=1;out[o+4]=q[0]-fp[0];out[o+5]=q[1]-fp[1];} /* düz taban: bilek konumunu izler, dönmez */\n"
    "    else for(let j=0;j<6;j++)out[WG[i]*6+j]=out[CHEST*6+j];")

rep("    dx+=L_(1)*wA;dy+=L_(2)*wA;lean+=L_(3)*wA;head+=L_(4)*wA;",
    "    const qk=R.quad?.45:1; /* v3.60.286: dört ayaklı boss saldırıda burnunu/kanadını yere gömmez */\n    dx+=L_(1)*wA;dy+=L_(2)*wA*qk;lean+=L_(3)*wA*qk;head+=L_(4)*wA*qk;")
rep("    dy+=(.014+bnc)*wE;lean+=3*wE;","    dy+=(.014+bnc)*wE*(R.quad?.3:1);lean+=3*wE*(R.quad?.4:1);")
# Yankı İstilası final bossu (Ayna Celladı) kahraman iskeletiyle çizilir: aynı zemin sınırı ve temas çözümü
rep("  af285PoseEnv(u,env);const M=AF321.pose(K,st,env);",
    "  af285PoseEnv(u,env);const M=AF321.pose(K,st,env);if(u._af205Boss&&typeof afp286Contact==='function'){afp286GroundClamp(K,M);afp286Contact(K,M,false,K.anchor[1]);} /* v3.60.286 */")
rep("// knees bend forward unless the art clearly says otherwise\n    return {L1,L2,D0,side,reach:Math.max(D0,.965*(L1+L2)),",
    "// knees bend forward unless the art clearly says otherwise\n    /* v3.60.286: boss rig'lerinde dümdüz çizilmiş bacakta pelvis indirme hesabı zincir boyunu aşan erişim varsaymaz (basan ayak havada kalmaz) */\n    return {L1,L2,D0,side,reach:R.noTerr?Math.min(D0,.965*(L1+L2)):Math.max(D0,.965*(L1+L2)),")
rep("  for(let i=0;i<2;i++){if(arm[i]<=0)continue;const a=Math.min(rem,arm[i]);give(FA[i],a*fore[i]);const u=a*(1-fore[i]);give(UA[i],u*sh[i]);give(CHEST,u*(1-sh[i]));}",
    "  for(let i=0;i<2;i++){if(arm[i]<=0)continue;const a=Math.min(rem,arm[i]);"
    "if(R.quad&&!(R.w&&R.w.length)){const hp=R['h'+(i?'R':'L')],wr=hp[1]-R.ar*.6,pw=sstep(wr-3,wr+3,y)*(Math.hypot(x-hp[0],y-hp[1])<R.ar*2.6?1:0);give(WP[i],a*fore[i]*pw);give(FA[i],a*fore[i]*(1-pw));}else "
    "give(FA[i],a*fore[i]);const u=a*(1-fore[i]);give(UA[i],u*sh[i]);give(CHEST,u*(1-sh[i]));} /* v3.60.286: dört ayaklıda pati (bilek altı) düz pati kemiğine */")
rep("    if(P.wt[i]&&ax){",
    "    if(R.quad&&!(R.w&&R.w.length)){const hp=R['h'+S],q=apply(out,FA[i]*6,hp[0],hp[1]),o=WP[i]*6;out[o]=1;out[o+1]=0;out[o+2]=0;out[o+3]=1;out[o+4]=q[0]-hp[0];out[o+5]=q[1]-hp[1];} /* düz pati: bileği izler, dönmez */\n"
    "    if(P.wt[i]&&ax){")
rep("  const K=(af321Mode==='legacy'||(u._afBattleGhost&&af321Mode==='gl'&&!AF321.hasGL()))?null:af321Ready(R.kind);",
    "  let K=(af321Mode==='legacy'||(u._afBattleGhost&&af321Mode==='gl'&&!AF321.hasGL()))?null:af321Ready(R.kind);\n"
    "  if(K&&u._af205Boss&&typeof afp286EchoKind==='function'){const K2=afp286EchoKind(R.kind,K);if(K2){K=K2;afp286FootSole(K);}} /* v3.60.286: final bossunun kendi iskelet kopyası; aynı türdeki minyonlar etkilenmez */")
rep("      const need=ty-hy-Math.sqrt(L.reach*L.reach-ddx*ddx);if(need>drop)drop=need;}\n    if(drop>0)dy+=drop/Hs;}",
    "      const need=ty-hy-Math.sqrt(L.reach*L.reach-ddx*ddx);if(need>drop)drop=need;}\n"
    "    if(R.quad&&K.restArm)for(let i=0;i<2;i++){const S2=i?'R':'L',sp=R['s'+S2];if(R['h'+S2][0]>250)continue;const L=K.restArm[i],tx=P.ha[i][0],ty=P.ha[i][1]; /* v3.60.286: ön bacaklar da erişimde */\n"
    "      const hx=sp[0]+rx,hy=sp[1]+ry,ddx=Math.min(Math.abs(tx-hx),L.reach*.94),need=ty-hy-Math.sqrt(L.reach*L.reach-ddx*ddx);if(need>drop)drop=need;}\n"
    "    if(drop>0)dy+=drop/Hs;}")
# ---------------- boss module (after af36DrawBossArtwork) ----------------
rigs = json.load(open(P + 'boss_rigs.json'))
mod = open(P + 'boss_module.js').read().replace('__AFP286_RIGS_JSON__', json.dumps(rigs, separators=(',', ':')))
rep("/* v3.60.52 — Örümcek Akını-only left-facing 8-frame spider locomotion atlas.", mod + "\n/* v3.60.52 — Örümcek Akını-only left-facing 8-frame spider locomotion atlas.")

# static boss path: rig first; fallback keeps measured foot line and no bob
rep("  if(u._afp263Boss)return af263DrawBossAnim(u); /* v3.60.263 AN */",
    "  if(u._afp263Boss)return af263DrawBossAnim(u); /* v3.60.263 AN */\n  if(afp286DrawBossRig(u))return true; /* v3.60.286: iskeletli yürüyüş, gerçek ayak pivotu, yön */")
rep("  const bob=Math.sin(t*1.25)*Math.min(1.8,h*.012);\n  ctx.save();ctx.translate(x,y+bob);", "  const bob=0; /* v3.60.286: yedek çizimde ayaklar zeminden koparılmaz */\n  ctx.save();ctx.translate(x,y+bob);if(u.team==='ally')ctx.scale(-1,1);")
rep("  ctx.drawImage(img,-w/2,-h,w,h);ctx.restore();",
    "  if(!img.__afp286Foot){try{const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const b=afp286AlphaBox(g.getImageData(0,0,c.width,c.height).data,c.width,0,0,c.width,c.height,40);img.__afp286Foot=b?(b.base+1)/c.height:1;}catch(_){img.__afp286Foot=1;}}\n"
    "  ctx.drawImage(img,-w/2,-h*img.__afp286Foot,w,h);ctx.restore(); /* v3.60.286: alttaki şeffaf boşluk ayak sayılmaz */")

# Örümcek Kraliçe
rep("  if(queen&&u._afpBossArtKey&&u._afpBossArtKey!=='boss.spider_queen'&&af36DrawBossArtwork(u))return;\n  if(queen){\n",
    "  if(queen&&u._afpBossArtKey&&u._afpBossArtKey!=='boss.spider_queen'&&af36DrawBossArtwork(u))return;\n  if(queen){\n"
    "    if(afp286DrawBossRig(u,'queen')){try{af367SpiderBiteFx(u,(u._vis&&u._vis.px||60)*.56);}catch(_){}return;} /* v3.60.286: sekiz bacaklı yürüyüş, sola bakar */\n")

# AF263 bosses
i, j = between("function af263DrawBossAnim(u){", "const AF36_MODE_BOSS_IMAGE_CACHE")
s = s[:i] + open(P + 'af263.js').read() + "\n" + s[j:]

# Kristal Kolos stone golem
i, j = between("function afpColossusDrawAtlasV36074(kind,frame,x,y,lane,alpha=1){", "function uOrFVisV36074(x,y,h,C){")
s = s[:i] + open(P + 'colossus.js').read() + s[j:]
i, j = between("function afpDrawColossusBossV36074(u){", "\n\n\n// v3.60.78 ART")
s = s[:i] + open(P + 'colossus_boss.js').read().rstrip('\n') + s[j:]

# death: boss falls with ITS OWN rig / atlas (no golem stand-in)
rep("const afpColBoss=u.team==='enemy'&&u._afpBossArtKey==='colossus.stone_golem';","const afpColBoss=(u.isBoss||u.enemyType==='boss')&&u._afpBossArtKey==='colossus.stone_golem'; /* v3.60.286: takım fark etmeksizin kendi ölüm atlası */")
rep("const afpFallLife=afpColBoss?1.85:afpColMinion?1.16:.95;",
    "const afp286Fb=afp286FallenInfo(u);const afpFallLife=afpColBoss?1.85:afpColMinion?1.16:afp286Fb&&!afp286Fb.atlasDeath?1.6:.95;")
rep("fallenUnits.push({team:u.team,lane:u.lane,x:Math.max(-.05,Math.min(1.05,u.x)),life:afpFallLife,max:afpFallLife,colossusBoss:afpColBoss,colossusMinionKind:afpColMinion,heroType:u.heroType||null,ref:af320Resolve(u),st:u._af321||null});",
    "fallenUnits.push({team:u.team,lane:u.lane,x:Math.max(-.05,Math.min(1.05,u.x)),life:afpFallLife,max:afpFallLife,colossusBoss:afpColBoss,colossusFlip:u._afp286c?u._afp286c.flip:1,colossusMinionKind:afpColMinion,heroType:u.heroType||null,ref:af320Resolve(u),st:u._af321||null,bossRig:afp286Fb});")
rep("    if(afp177DrawDeath(f,x,y))continue;",
    "    if(f.bossRig&&afp286DrawFallen(f,t,x,y))continue; /* v3.60.286 */\n    if(afp177DrawDeath(f,x,y))continue;")

# drawHero: boss art for bosses of either team (mavi takım bossu da kendi görseliyle, sağa bakarak çizilir); Kolos her modda kendi atlası
rep("  if(u.team==='enemy'&&(u.isBoss||u.enemyType==='boss')&&af36DrawBossArtwork(u))return;",
    "  if((u.isBoss||u.enemyType==='boss')&&u._afpBossArtKey==='colossus.stone_golem'&&afpDrawColossusBossV36074(u))return; /* v3.60.286 */\n  if((u.isBoss||u.enemyType==='boss')&&af36DrawBossArtwork(u))return; /* v3.60.286: yalnız kırmızı değil, iki takım */")
# Ayna Celladı (Yankı İstilası final bossu): hedefine döner
rep("  if(u.isCommander&&!u._afTower&&liveTgt)want=liveTgt.x>=u.x?1:-1;",
    "  if((u.isCommander||u._af205Boss)&&!u._afTower&&liveTgt)want=liveTgt.x>=u.x?1:-1; /* v3.60.286: final bossu saldırırken hedefe döner */")
# QA hook
rep("window.__afDeckAPI={", open(P + 'qa.js').read() + "\nwindow.__afDeckAPI={")

# version stamp in title (visible build id)
s = s.replace('<title>Arena Forge Pro · v3.60.285 Mod Motoru TEST</title>', '<title>Arena Forge Pro · v3.60.286 Boss Yürüyüş Onarımı TEST</title>', 1)
m = re.search(r'<title>([^<]*)</title>', s)
print('title:', m.group(1) if m else None)
open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
