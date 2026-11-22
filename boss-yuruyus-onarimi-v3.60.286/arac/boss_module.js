/* ===== v3.60.286 BOSS GAIT / GROUND / FACING REPAIR (YALNIZ GÖRSEL) =====
   Kök nedenler (v3.60.285):
   1) 9 koleksiyon/sefer/kule/gökyüzü/lonca bossu (AFArt boss.*) ve Örümcek Kraliçe TEK SABİT RESİM olarak çiziliyordu:
      bacak hareketi yoktu (resim zeminde kayıyordu), resmin altındaki şeffaf boşluk ayak sayılıyordu (Kadim Dev %10,
      Lav Ejderhası %5.5 havada), üstüne sinüs "bob" eklenip ayaklar zeminden koparılıyordu, yön hiç çevrilmiyordu.
   2) Karanlık Geçit bossları (AF263) bekleme/saldırı/ölüm atlasları hücre hücre farklı zemin çizgisine sahipti; tümü
      sabit y+h*.05 ile (görseli aşağı iterek) çiziliyordu, yürüme animasyonu yoktu, yön "düşmansa çevir" diye sabitti
      (sola bakan Küllerin Hükümdarı sağa dönüyordu).
   3) Ölen sabit-resim bossların yerine "golem" iskeleti düşüyordu (yanlış karakterin ölüm animasyonu).
   Çözüm: bosslar mevcut AF321 iskelet motoruna bağlanır (kendi görselinden kurulan deri-ağ, iki kemikli IK bacaklar,
   adım fazı GERÇEK yer değiştirmeyle ilerler -> basan ayak kaymaz). Dört ayaklılar için AF321'e ön bacak IK'sı eklendi.
   Ayak pivotu her görselin alfa ölçümünden gelir (K.anchor = gerçek taban). Atlas kareleri kare kare ölçülen
   zemin çizgisine hizalanır. Can, hasar, hız, yetenek, kayıt ve kurallar DEĞİŞMEZ. */
const AFP286_BOSS_RIGS=__AFP286_RIGS_JSON__;
const AFP286_BOSS_DEFS={
 'boss.ancient_giant':{rig:'ancient_giant',name:'Kadim Dev'},
 'boss.death_lord':{rig:'death_lord',name:'Ölüm Lordu'},
 'boss.forest_guardian':{rig:'forest_guardian',name:'Orman Koruyucusu'},
 'boss.infernal_behemoth':{rig:'infernal_behemoth',name:'Cehennem Behemotu'},
 'boss.shadow_stalker':{rig:'shadow_stalker',name:'Gölge Avcısı'},
 'boss.lava_dragon':{rig:'lava_dragon',name:'Lav Ejderhası'},
 'boss.storm_dragon':{rig:'storm_dragon',name:'Fırtına Ejderi'},
 'boss.venom_hydra':{rig:'venom_hydra',name:'Zehir Hidrası'},
 'boss.spider_queen':{rig:'spider_queen',name:'Örümcek Kraliçe'},
 'afp263:boss_kullerin_hukumdari':{rig:'kullerin',atlas:'boss_kullerin_hukumdari',name:'Küllerin Hükümdarı'},
 'afp263:boss_ucurum_ejderi':{rig:'ucurum',atlas:'boss_ucurum_ejderi',name:'Uçurum Ejderi'},
 /* Boşluk İmparatoru bacaksız, rün dairesi üzerinde süzülen bir büyücü olarak çizilmiş: iskelet yok, atlas zemine (rün dairesine) hizalanır */
 'afp263:boss_bosluk_imparatoru':{rig:null,atlas:'boss_bosluk_imparatoru',name:'Boşluk İmparatoru',f:1,hover:true}
};
const AFP286_QA={builds:{},errors:[],draws:{},fallbacks:{}};
function afp286Def(key){return AFP286_BOSS_DEFS[key]||null;}
function afp286KeyOf(u){
 if(!u||!(u.isBoss||u.enemyType==='boss'))return null;
 if(u._afp263Boss&&AFP286_BOSS_DEFS[u._afp263Boss])return u._afp263Boss;
 const k=String(u._afpBossArtKey||'');
 if(k==='colossus.stone_golem')return null;
 if(AFP286_BOSS_DEFS[k])return k;
 if(gameMode==='boss'&&!k)return 'boss.spider_queen';
 return k?null:'boss.ancient_giant';
}
/* alfa ölçümü: satır sayımlı gerçek taban (ince parıltılar/kıvılcımlar tabanı aşağı çekmez) */
function afp286AlphaBox(data,w,x0,y0,cw,ch,thr){
 let minX=1e9,minY=1e9,maxX=-1,maxY=-1,maxRow=0;const rc=new Uint16Array(ch);
 for(let y=0;y<ch;y++){let c=0;const row=(y0+y)*w;for(let x=0;x<cw;x++){if(data[(row+x0+x)*4+3]>thr){c++;if(x<minX)minX=x;if(x>maxX)maxX=x;}}rc[y]=c;if(c){if(y<minY)minY=y;maxY=y;}if(c>maxRow)maxRow=c;}
 if(maxX<0)return null;
 const baseThr=Math.max(3,maxRow*.05);let base=maxY;for(let y=maxY;y>=minY;y--)if(rc[y]>=baseThr){base=y;break;}
 return {x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,base};
}
function afp286SrcOf(key,d){
 if(d.atlas){const A=window.AFP263BossArt,a=A&&A[d.atlas];return a&&a.idle||'';}
 try{return window.AFArt&&typeof window.AFArt.get==='function'?window.AFArt.get(key):'';}catch(_){return '';}
}
/* gövde atlası: görselin (atlas ise bekleme karesi 0) alfa kutusu 244x244'e sığdırılır, ayak tabanı y=250'ye oturur.
   Rig noktaları bu normalize alanda yazıldı (araç: tools/boss_rig_overlay). */
function afp286Ensure(key){
 const d=AFP286_BOSS_DEFS[key];if(!d)return null;
 if(d.norm||d.building||d.failed)return d;
 const src=afp286SrcOf(key,d);if(!src)return d;
 d.building=true;const im=new Image();im.decoding='async';
 im.onload=()=>{try{
   const cell=!!d.atlas,cw=cell?Math.floor(im.naturalWidth/4):im.naturalWidth,ch=cell?Math.floor(im.naturalHeight/2):im.naturalHeight;
   const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
   const data=g.getImageData(0,0,cv.width,cv.height).data;
   const bb=afp286AlphaBox(data,cv.width,0,0,cw,ch,40);if(!bb)throw new Error('boş görsel');
   const bw=bb.w,bh=bb.h,s=Math.min(244/bw,244/bh,1.6),tw=Math.round(bw*s),th=Math.round(bh*s),ox=Math.round(128-tw/2),oy=250-th;
   d.norm={s,bx:bb.x,by:bb.y,bw,bh,ox,oy,srcW:cw,srcH:ch,base:bb.base};
   if(d.rig&&typeof AF321!=='undefined'){
     const rig=AFP286_BOSS_RIGS[d.rig];const name='afp286_'+d.rig;
     if(rig&&!AF321.RIGS[name]){AF321.RIGS[name]=rig;}
     const at=document.createElement('canvas');at.width=512;at.height=256;const ag=at.getContext('2d');ag.imageSmoothingEnabled=true;ag.imageSmoothingQuality='high';
     ag.drawImage(im,bb.x,bb.y,bw,bh,ox,oy,tw,th);
     d.kind=name;AF321.register(name,at.toDataURL('image/png'));
   }
   if(d.atlas){try{af263BossImg(d.atlas,'attack');af263BossImg(d.atlas,'death');}catch(_){}} /* saldırı/ölüm atlasları önceden çözülür */
   AFP286_QA.builds[key]={ok:true,s:+s.toFixed(3),src:[cw,ch],box:[bb.x,bb.y,bw,bh],base:bb.base};
 }catch(e){d.failed=true;AFP286_QA.errors.push(key+': '+(e&&e.message));}finally{d.building=false;}};
 im.onerror=()=>{d.building=false;d.failed=true;AFP286_QA.errors.push(key+': görsel yüklenemedi');};
 im.src=src;return d;
}
/* test ölçümü: karenin HERHANGİ bir opak pikselinin en alt satırı (satır sayım eşiğinden bağımsız) */
function afp286FrameLowestAny(im,f){try{const cw=Math.floor(im.naturalWidth/4),ch=Math.floor(im.naturalHeight/2),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,(f%4)*cw,Math.floor(f/4)*ch,cw,ch,0,0,cw,ch);const d=g.getImageData(0,0,cw,ch).data;for(let y=ch-1;y>=0;y--){let n=0;for(let x=0;x<cw;x++)if(d[(y*cw+x)*4+3]>40&&++n>=2)return y;}}catch(_){}return null;}
/* Yankı İstilası final bossu: kahraman iskeletinin ayrı kopyası (taban hizası/zemin sınırı yalnız bossa uygulanır) */
function afp286EchoKind(kind,K0){const name='afp286echo_'+kind;const K=AF321.get(name);if(K)return K;if(!AF321.kinds[name]&&K0&&K0.img&&K0.img.src&&AF321.RIGS[kind]){AF321.RIGS[name]=Object.assign({},AF321.RIGS[kind],AF321.RIGS[kind].wings?{}:{flat:1});AF321.register(name,K0.img.src);}return null;}
function afp286Prewarm(){for(const k in AFP286_BOSS_DEFS)afp286Ensure(k);}
/* atlas hücrelerinin kare kare zemin çizgisi (alfa satır sayımı) */
const AFP286_ATLAS_BASE=new WeakMap();
function afp286AtlasBases(im){
 let b=AFP286_ATLAS_BASE.get(im);if(b)return b;
 try{const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0);
  const data=g.getImageData(0,0,cv.width,cv.height).data,cw=Math.floor(cv.width/4),ch=Math.floor(cv.height/2);b=[];
  for(let f=0;f<8;f++){const r=afp286AlphaBox(data,cv.width,(f%4)*cw,Math.floor(f/4)*ch,cw,ch,40);b.push(r?r.base:ch-1);}
 }catch(e){b=null;}
 if(b)AFP286_ATLAS_BASE.set(im,b);return b;
}
/* ekran boyu: önceki sürümdeki boss boyutu birebir korunur (yalnız ayak pivotu düzeltilir) */
function afp286ScreenH(u,d,mode){
 const n=d.norm,maxW=Math.max(90,W*.255);
 if(mode==='queen'){const px=af320PxFor('boss',u.lane,1)*1.30;return px*1.14;}
 if(d.atlas){let h=af320PxFor('boss',u.lane,1)*1.75,w=h;if(w>maxW)h*=maxW/w;return h;}
 let h=af320PxFor('boss',u.lane,1)*1.72,w=h*(n.srcW/n.srcH);if(w>maxW)h*=maxW/w;return h;
}
/* yön kuralı: canlı hedef varsa ona döner; yoksa takım yönü (MAVİ sağ, KIRMIZI sol). Sapmayı önlemek için .12 sn tutma. */
function afp286Facing(u,st,x,dt){
 const teamDir=u.team==='ally'?1:-1;
 const tgt=u._afTgt&&u._afTgt.hp>0&&units.includes(u._afTgt)?u._afTgt:null;
 let want=teamDir;
 if(tgt){const dx=laneX(tgt.x)-x;want=Math.abs(dx)>3?(dx>0?1:-1):(st.fsv||teamDir);}
 if(st.fsv===undefined){st.fsv=want;st.fsHold=0;}
 if(want!==st.fsv){st.fsHold+=dt;if(st.fsHold>=.12||dt===0){st.fsv=want;st.fsHold=0;}}else st.fsHold=0;
 return st.fsv;
}
function afp286AtlasImg(d,state){const A=window.AFP263BossArt,a=A&&A[d.atlas];if(!a||!a[state])return null;return af263BossImg(d.atlas,state);}
/* atlas karesi: rig ile AYNI dönüşüm (normalize alan -> ayak pivotu), kareye özgü zemin farkı ile */
function afp286DrawAtlas(d,im,frame,x,y,k,flip,anchor,alpha){
 const n=d.norm,cw=Math.floor(im.naturalWidth/4),ch=Math.floor(im.naturalHeight/2),f=Math.max(0,Math.min(7,frame|0));
 const bases=afp286AtlasBases(im),bf=bases?bases[f]:n.base;
 const ks=k*n.s,dx0=-n.bx+(n.ox-anchor[0])/n.s,dy0=-n.by+(n.oy-anchor[1])/n.s+(n.base-bf);
 ctx.save();ctx.translate(x,y);ctx.scale(flip*ks,ks);if(alpha!==undefined)ctx.globalAlpha*=alpha;
 ctx.drawImage(im,(f%4)*cw,Math.floor(f/4)*ch,cw,ch,dx0,dy0,cw,ch);ctx.restore();
 return {lowY:y+ks*(dy0+bf+1),top:y+ks*dy0,bf,ks,im,f,y};
}
function afp286Shadow(x,y,wpx,a){ctx.save();ctx.fillStyle='rgba(2,4,10,'+(a==null?.6:a)+')';ctx.beginPath();ctx.ellipse(x,y+1,Math.max(8,wpx*.36),Math.max(3,wpx*.07),0,0,Math.PI*2);ctx.fill();ctx.restore();}
function afp286Anchor(d){
 if(d.kind){const K=AF321.get(d.kind);if(K)return K.anchor;}
 const n=d.norm;return [128,n?250:250];
}
/* zemin sınırı: yere değen kılıç/tırpan ucu ya da yumruk zemine GİREMEZ; ilgili kemik (önkol / silah) kendi ekleminin
   etrafında, en alt opak noktası zemin çizgisine değecek kadar döndürülür (ayakların IK hedefi değişmez). */
function afp286Silh(K){let S=K.__afp286silh;if(S)return S;S=K.__afp286silh=[];
 try{const cv=document.createElement('canvas');cv.width=512;cv.height=256;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(K.img,0,0);
  const d=g.getImageData(0,0,512,256).data,A=(x,y)=>(x<0||y<0||x>255||y>255)?0:d[(y*512+x)*4+3],D=K.mesh.data,nb=K.mesh.nv-(K.items?K.items.length*4:0);
  for(let i=0;i<nb;i++){const o=i*13,vx=D[o],vy=D[o+1];let op=0;for(let yy=-1;yy<=0&&!op;yy++)for(let xx=-1;xx<=0;xx++)if(A(Math.round(vx)+xx,Math.round(vy)+yy)>60){op=1;break;}
   if(op)S.push([vx,vy,D[o+4],D[o+5],D[o+6],D[o+7],D[o+8],D[o+9],D[o+10],D[o+11]]);}}catch(_){}
 return S;}
/* uzuv tabanı (gerçek ayak pivotu): bacak/düz taban/ön bacak kemiklerine ait opak köşelerin dinlenme pozundaki en alt y'si.
   Görselin en alt pikseli öne uzanan bir kılıç/kuyruk ucu olabilir (Ölüm Lordu): pivot ayak tabanıdır, alfa tabanı değil. */
function afp286Sole(K){let o=K.__afp286sole;if(o)return o;const S=afp286Silh(K),B=AF321.BONES,R=K.rig;
 const limb=new Set([B.SH[0],B.SH[1]]); /* taban: baldır/düz taban/ön bacak/pati (uyluk değil) */if(R.flat&&!R.wings){limb.add(B.WG[0]);limb.add(B.WG[1]);}if(R.quad){limb.add(B.FA[0]);limb.add(B.FA[1]);limb.add(B.WP[0]);limb.add(B.WP[1]);}
 let sole=-1e9,all=-1e9;const restLow={};
 for(const v of S){let bb=-1,bw=0;for(let j=0;j<4;j++)if(v[6+j]>bw){bw=v[6+j];bb=v[2+j];}
  if(limb.has(bb)&&bw>=.5&&v[1]>sole)sole=v[1];if(v[1]>all)all=v[1];if(!(restLow[bb]>=v[1]))restLow[bb]=v[1];}
 if(!(sole>0))sole=K.anchor[1];
 return K.__afp286sole={y:sole,alphaLow:all,limb,restLow};}
/* uzuv başına taban derinliği: 3/4 çizimde iki ayağın tabanı farklı yükseklikte olabilir; yürürken her uzuv kendi tabanıyla zemine basar */
function afp286FootSole(K){if(K.footSole)return K.footSole;const S=afp286Silh(K),B=AF321.BONES,R=K.rig,flat=!!(R.flat&&!R.wings);
 const grp=[[B.SH[0]].concat(flat?[B.WG[0]]:[]),[B.SH[1]].concat(flat?[B.WG[1]]:[]),[B.FA[0],B.WP[0]],[B.FA[1],B.WP[1]]],low=[-1e9,-1e9,-1e9,-1e9];
 for(const v of S){let bb=-1,bw=0;for(let j=0;j<4;j++)if(v[6+j]>bw){bw=v[6+j];bb=v[2+j];}if(bw<.5)continue;for(let g=0;g<4;g++)if(grp[g].includes(bb)&&v[1]>low[g])low[g]=v[1];}
 const o=[0,1].map(i=>low[i]>0?low[i]-R['f'+(i?'R':'L')][1]:K.groundY-R['f'+(i?'R':'L')][1]);
 const oa=[0,1].map(i=>{const h=R['h'+(i?'R':'L')];return R.quad&&h[0]<=250&&low[2+i]>0?low[2+i]-h[1]:K.groundY-h[1];});
 const g=Math.max(...[0,1].map(i=>R['f'+(i?'R':'L')][1]+o[i]),...(R.quad?[0,1].filter(i=>R['h'+(i?'R':'L')][0]<=250).map(i=>R['h'+(i?'R':'L')][1]+oa[i]):[]));
 return K.footSole={g,o,oa};}
function afp286RotBone(M,b,cx,cy,th){const c=Math.cos(th),s=Math.sin(th),o=b*6,a=M[o],bb=M[o+1],cc=M[o+2],d=M[o+3],e=M[o+4]-cx,f=M[o+5]-cy;
 M[o]=c*a-s*bb;M[o+1]=s*a+c*bb;M[o+2]=c*cc-s*d;M[o+3]=s*cc+c*d;M[o+4]=c*e-s*f+cx;M[o+5]=s*e+c*f+cy;}
/* kemik başına baskın (≥%50) opak köşe dizinleri — bir kez hesaplanır */
function afp286ByBone(K){let o=K.__afp286byBone;if(o)return o;const S=afp286Silh(K);o=K.__afp286byBone={};
 for(let n=0;n<S.length;n++){const v=S[n],acc={};for(let j=0;j<4;j++){const w=v[6+j];if(w>0)acc[v[2+j]]=(acc[v[2+j]]||0)+w;}for(const b in acc)if(acc[b]>=.5)(o[b]||(o[b]=[])).push(n);}
 return o;}
function afp286PosY(M,v){let py=0;for(let j=0;j<4;j++){const w=v[6+j];if(w>0){const o=v[2+j]*6;py+=w*(M[o+1]*v[0]+M[o+3]*v[1]+M[o+5]);}}return py;}
function afp286PosX(M,v){let px=0;for(let j=0;j<4;j++){const w=v[6+j];if(w>0){const o=v[2+j]*6;px+=w*(M[o]*v[0]+M[o+2]*v[1]+M[o+4]);}}return px;}
function afp286GroundClamp(K,M){
 const R=K.rig,B=AF321.BONES,SO=afp286Sole(K),S=afp286Silh(K),BY=afp286ByBone(K);if(!S.length)return 0;let n=0;
 /* [kemik, taraf, eklem]. Önkol: bipedde dirsek (yumruk/pençe savrulması), dört ayaklıda pati noktası (basan pati yerinde kalır).
    Baldır (düz taban kemiği olmayan rig): ayak noktası etrafında = bilek gibi; parmak ucu zemine girmez. Kanat: kanat kökü. */
 const list=[];
 for(let i=0;i<2;i++){const S2=i?'R':'L';if(R['h'+S2][0]<=250){list.push([B.FA[i],i,R.quad?'h':'e']);if(!R.quad)list.push([B.WP[i],i,'h']);}}
 if(!(R.flat&&!R.wings))for(let i=0;i<2;i++)list.push([B.SH[i],i,'f']);
 if(R.wings)for(const g of R.wings)list.push([B.WG[g.s==='L'?0:1],g.s==='L'?0:1,'w']);
 for(const [b,i,piv] of list){
  const idx=BY[b];if(!idx||!idx.length)continue;
  const S2=i?'R':'L',gy=Math.max(SO.y,SO.restLow[b]||-1e9)+.3; /* kendi çizimindeki derinlikten aşağı inemez */
  for(let it=0;it<3;it++){
   let lv=null,ly=-1e9;for(const q of idx){const v=S[q],py=afp286PosY(M,v);if(py>ly){ly=py;lv=v;}}
   if(!lv||ly<=gy)break;
   const lx=afp286PosX(M,lv);let C;
   if(piv==='h'){const pp=R['h'+S2];C=AF321.apply(M,B.FA[i]*6,pp[0],pp[1]);}
   else if(piv==='e'){const pp=R['e'+S2];C=AF321.apply(M,B.UA[i]*6,pp[0],pp[1]);}
   else if(piv==='f'){const pp=R['f'+S2];C=AF321.apply(M,B.SH[i]*6,pp[0],pp[1]);}
   else{const g=R.wings.find(q=>q.s===S2);C=AF321.apply(M,B.CHEST*6,g.at[0],g.at[1]);}
   const rx=lx-C[0],ry=ly-C[1],r=Math.hypot(rx,ry);
   if(r<4||gy-C[1]<-r)break; /* eklem noktası zaten zeminde: ucu dönerek kalkamıyorsa yerinde bırak */
   const need=Math.min(gy-C[1],r-1e-3);
   const a0=Math.atan2(ry,rx),a1=Math.asin(Math.max(-1,need/r));let best=null;
   for(const a of [a1,Math.PI-a1]){const dd=Math.atan2(Math.sin(a-a0),Math.cos(a-a0));if(best===null||Math.abs(dd)<Math.abs(best))best=dd;}
   best=Math.max(-.6,Math.min(.6,best));if(Math.abs(best)<1e-4)break;
   afp286RotBone(M,b,C[0],C[1],best);
   if(b===B.FA[i])afp286RotBone(M,B.WP[i],C[0],C[1],best);
   n++;
  }
 }
 return n;
}
/* temas çözümü (IK pelvis yüksekliği): basan ayak/pati tabanı tam zemin çizgisine oturur.
   Kök nedenler (pivot, şeffaf boşluk, ağırlıklar, kemik sınırları) ayrıca düzeltildi; bu son adım kemik zincirinin
   kalan alt-piksel / birkaç piksellik erişim farkını kapatır. lift=true: yalnız yukarı (ölüm düşüşü gömülmesin). */
function afp286SkinLow(K,M){const S=afp286Silh(K);let low=-1e9;for(const q of S){let py=0;for(let j=0;j<4;j++){const w=q[6+j];if(w>0){const o=q[2+j]*6;py+=w*(M[o+1]*q[0]+M[o+3]*q[1]+M[o+5]);}}if(py>low)low=py;}return low;}
function afp286SoleLow(K,M){const SO=afp286Sole(K),S=afp286Silh(K);let L=SO.idx;if(!L){L=SO.idx=[];for(let n=0;n<S.length;n++){const q=S[n];let bb=-1,bw=0;for(let j=0;j<4;j++)if(q[6+j]>bw){bw=q[6+j];bb=q[2+j];}if(bw>=.5&&SO.limb.has(bb))L.push(n);}}
 let low=-1e9;for(const n of L){const py=afp286PosY(M,S[n]);if(py>low)low=py;}return low;}
function afp286Contact(K,M,liftOnly,target){const low=afp286SoleLow(K,M);if(!(low>-1e8))return 0;let d=(target==null?afp286Sole(K).y:target)-low;if(liftOnly&&d>0)d=0;if(Math.abs(d)<.02)return 0;for(let b=0;b<AF321.NB;b++)M[b*6+5]+=d;return d;}
/* yatay pivot = gövde kutusunun ortası (önceki sürümde resim x'e ortalanıyordu; boss mantıksal konumundan kaymaz, dönüşte sıçramaz) */
function afp286AX(K){return K.meta.b.x+K.meta.b.w/2;}
function afp286View(K,x,y,k,flip){const ax=afp286AX(K),ay=afp286Sole(K).y;return [flip*k,0,0,k,x-flip*k*ax,y-k*ay];}
/* ana çizim: true dönerse boss çizilmiştir */
function afp286DrawBossRig(u,mode){
 const key=afp286KeyOf(u);if(!key)return false;
 const d=afp286Ensure(key);if(!d||!d.norm)return false;
 const K=d.kind?AF321.get(d.kind):null;
 if(d.rig&&!K)return false;
 const st=u._afp286||(u._afp286={a:K?AF321.newState():null,key});
 if(K&&!K.footSole)afp286FootSole(K);
 const t=typeof elapsed==='number'?elapsed:0,dt=st.lastT==null?0:Math.max(0,Math.min(.1,t-st.lastT));st.lastT=t;
 const x=laneX(u.x),y=laneY(u.lane,x);
 const Hs=afp286ScreenH(u,d,mode),k=Hs/(d.norm.srcH*d.norm.s);
 const fsv=afp286Facing(u,st,x,dt);
 const natF=K?K.rig.f:(d.f||1),flip=fsv*natF;
 const anchor=K?[afp286AX(K),afp286Sole(K).y]:[128,250];
 /* gerçek saldırı olayları: attack() (_afHits) + boss yeteneği darbeleri (attackPulse yükselen kenarı) */
 const pulse=+u.attackPulse||0;if(pulse>(st.lastPulse||0)+.05){st.xHits=(st.xHits||0)+1;st.xHitAt=t;}st.lastPulse=pulse;
 const hits=(u._afHits||0)+(st.xHits||0),hitAt=Math.max(Number.isFinite(u._afHitAt)?u._afHitAt:-9,st.xHitAt||-9);
 const stun=(u.stunUntil||0)>t;
 const blue=u.team==='ally';
 let M=null,V=null,A=st.a;
 if(K){
  const vCss=Math.abs(u.speed||0)*UNIT_MOVE_PACING*W*.84;
  const env={t,dt,X:x,facing:fsv,vCss,pxCss:K.Hs*k,k,eng:!!u._afEng||(t-hitAt<.5),cd:u.cd||0,period:typeof af327Period==='function'?af327Period(u):(u.attackPeriod||1.2),
   hits,hitAt,flash:u.hitFlash||0,hp:u.hp,stun,ranged:false,flight:.12,dead:false,deathT:0,cls:'boss',lunge:0};
  if(st.dbg)env.dbg=st.dbg;
  M=AF321.pose(K,A,env);A.clamped=afp286GroundClamp(K,M);A.contact=afp286Contact(K,M);V=afp286View(K,x,y,k,flip);A.V=V;A.K=K;
 }
 /* durum seçimi */
 const moving=!!(A&&A.wW>.08),hurt=!!(A&&A.hurt>.02)||(u.hitFlash||0)>.03;
 const atk=Math.max(0,Math.min(1,pulse/.30));
 let state='rig';
 if(d.atlas){
  if(atk>.02&&afp286AtlasImg(d,'attack'))state='attack';
  else if(!K||(!moving&&!hurt))state='idle';
 }
 const bodyW=(K?K.meta.b.w:d.norm.bw*d.norm.s)*k;
 afp286Shadow(x,y,bodyW,.55);
 if(def263Aura(d))try{const g=ctx.createRadialGradient(x,y-Hs*.42,Hs*.04,x,y-Hs*.42,Hs*.6);g.addColorStop(0,def263Aura(d));g.addColorStop(1,'rgba(0,0,0,0)');ctx.save();ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y-Hs*.42,bodyW*.55,Hs*.52,0,0,Math.PI*2);ctx.fill();ctx.restore();}catch(_){}
 let last;
 if(state==='rig'){
  const fl=(u.hitFlash||0)>0?Math.min(.42,(u.hitFlash||0)/.18*.42):A.hurt*.18;
  const flash=fl>0?[1,.96,.9,fl]:null,outline=blue?[.25,.63,1,.28,Math.max(.4,Hs*.004)]:[1,.25,.24,.28,Math.max(.4,Hs*.004)];
  if(AF321.hasGL()&&af321Mode==='gl')AF321.push(K,M,V,1,flash,[A.P.cx,A.P.cy],outline);else AF321.draw2D(ctx,K,M,V,1,flash,outline);
  last={type:'mesh'};
 }else{
  const im=afp286AtlasImg(d,state)||afp286AtlasImg(d,'idle');if(!im){return false;}
  const fr=state==='attack'?Math.min(7,Math.floor((1-atk)*8)):Math.floor((t+(u.phase||0))*8)%8;
  const hu=Math.max(0,Math.min(1,(u.hitFlash||0)/.16));
  /* iskeletsiz (süzülen) bossun hasar tepkisi: geri sarsılma; zemin teması (rün dairesi) bozulmaz */
  if(!K&&hu>.03&&state==='idle')state='hurt';
  const rx=state==='hurt'?-fsv*Hs*.035*hu:0;
  const r=afp286DrawAtlas(d,im,fr,x+rx,y,k,flip,anchor);
  if(hu>.03){ctx.save();ctx.globalAlpha=Math.min(.2,hu*.22);ctx.fillStyle='#fff0da';ctx.beginPath();ctx.ellipse(x,y-Hs*.46,bodyW*.24,Hs*.26,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  last={type:'atlas',state,frame:fr,lowY:r.lowY,ks:r.ks,bf:r.bf,im};
 }
 const topY=K?y-(afp286Sole(K).y-K.meta.b.y)*k:y-d.norm.bh*d.norm.s*k;
 const C=AF320_CLASSES.boss||AF320_CLASSES.heavy;
 u._vis={x,y,top:y-topY,px:Hs,cls:'boss',C,k2:Hs/Math.max(1,C.h),blue};
 st.last=Object.assign(last,{key,x,y,k,flip,fsv,natF,anchor,Hs,mode:mode||'',t});
 if(d.atlas)u._afp263Last={id:d.atlas,x,y,w:Hs,h:Hs,flip:flip<0,k,anchor,key};
 if(d.atlas)AF263_BOSS_LIVE.add(u);
 AFP286_QA.draws[key]=(AFP286_QA.draws[key]||0)+1;
 try{if(af321Band&&af321Band.length>1){af321Band[0]=Math.min(af321Band[0],topY-Hs*.1);af321Band[1]=Math.max(af321Band[1],y+Hs*.12);}}catch(_){}
 return true;
}
function def263Aura(d){const a=d.atlas?(AF263_NEW_BOSSES['afp263:'+d.atlas]||{}).aura:null;return a||null;}
/* ölüm: boss kendi iskeletiyle (veya kendi ölüm atlasıyla) düşer; başka karakterin (golem) ölümü çizilmez */
function afp286FallenInfo(u){
 const st=u&&u._afp286;if(!st||!st.last)return null;const d=AFP286_BOSS_DEFS[st.key];if(!d)return null;
 if(d.atlas){afp286AtlasImg(d,'death');return {key:st.key,atlasDeath:true};} /* görsel henüz çözülmemiş olsa da başka karakter düşürülmez */
 if(!d.kind)return null;
 return {key:st.key,kind:d.kind,k:st.last.k,flip:st.last.flip,fsv:st.last.fsv,Hs:st.last.Hs,st:st.a};
}
function afp286DrawFallen(f,t,x,y){
 const b=f.bossRig;if(!b)return false;
 if(b.atlasDeath)return true; /* af263DrawBossDeaths kendi ölüm atlasını çiziyor */
 const K=AF321.get(b.kind);if(!K)return false;
 const st=b.st||(b.st=AF321.newState());const tt=elapsed,ddt=st.lastT===null?0:Math.max(0,Math.min(.1,tt-st.lastT));st.lastT=tt;
 const fade=t<.7?1:Math.max(0,1-(t-.7)/.3),k=b.k;
 afp286Shadow(x,y-1,K.meta.b.w*k*(1+.2*Math.min(1,t*2)),.5*fade);
 const M=AF321.pose(K,st,{t:tt,dt:ddt,X:x,facing:b.fsv,vCss:0,pxCss:K.Hs*k,k,eng:false,cd:1,period:1,hits:st.seenHits===undefined?0:st.seenHits,hitAt:-9,flash:0,stun:false,ranged:false,flight:.1,dead:true,deathT:Math.min(1,t*1.25),cls:'boss'});
 afp286Contact(K,M,true); /* düşen gövde zemine gömülmez */
 const V=afp286View(K,x,y-1,k,b.flip); /* drawFallenUnits y=zemin+1 */
 if(af321Mode==='gl'&&!window.__AF321_FORCE_2D&&AF321.hasGL())AF321.push(K,M,V,fade,null,[st.P.cx,st.P.cy]);else AF321.draw2D(ctx,K,M,V,fade,null);
 b.lastV=V;b.lastM=M;
 try{af321Band[0]=Math.min(af321Band[0],y-b.Hs*1.2);af321Band[1]=Math.max(af321Band[1],y+b.Hs*.3);}catch(_){}
 return true;
}
setTimeout(()=>{try{afp286Prewarm();}catch(e){AFP286_QA.errors.push('prewarm: '+e);}},1200);
