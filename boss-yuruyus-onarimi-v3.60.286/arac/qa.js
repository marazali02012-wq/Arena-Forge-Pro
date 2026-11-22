/* v3.60.286 boss yürüyüş/zemin/yön test kancası (yalnız test; oyunu etkilemez). Laboratuvar modu savaş döngüsünü
   duraklatır, gerçek çizim fonksiyonunu (draw) kare kare çağırır ve sonunda savaş durumunu geri yükler. */
window.__AFPBossGaitQA={
 version:'v3.60.286',
 defs:()=>Object.keys(AFP286_BOSS_DEFS).concat(['colossus.stone_golem','echo.mirror_executioner']),
 builds:()=>JSON.parse(JSON.stringify(AFP286_QA)),
 ready:()=>{afp286Prewarm();const o={};for(const k in AFP286_BOSS_DEFS){const d=AFP286_BOSS_DEFS[k];o[k]=!!(d.norm&&(!d.rig||(d.kind&&AF321.get(d.kind))));}o['colossus.stone_golem']=!!afpColossusAtlasImageV36074('walk');return o;},
 status:()=>({playing,gameMode,paused:battlePaused,units:units.length,W,H,elapsed}),
 lab:{
  _s:null,
  begin(){if(this._s)return true;this._s={units,fallen:fallenUnits,paused:battlePaused,elapsed,mode:gameMode,colCtx:window.__AFPColossusPvEContext};battlePaused=true;units=[];fallenUnits=[];return true;},
  end(){const s=this._s;if(!s)return false;gameMode=s.mode;units=s.units;fallenUnits=s.fallen;battlePaused=s.paused;window.__AFPColossusPvEContext=s.colCtx;this._s=null;return true;},
  _r:[],
  _u(i){return this._r[i]||null;},
  clear(){units=[];fallenUnits=[];this._r=[];return true;},
  mode(m){gameMode=m;return gameMode;},
  spawn(spec){
   const key=spec.key,team=spec.team||'enemy',lane=spec.lane??1;
   const u={team,lane,enemyType:'boss',x:spec.x??(team==='enemy'?.7:.3),hp:1e6,maxHp:1e6,speed:(team==='enemy'?-1:1)*(spec.speed??.07),atk:1,cd:.9,attackPeriod:1.3,phase:0,isBoss:true};
   if(key==='echo.mirror_executioner'){delete u.enemyType;u.isBoss=false;u.heroType=spec.heroType||'warrior';u.isRoster=true;u._af203Echo=true;u._af205Boss=true;u.level=1;u.attackPeriod=1;}
   else if(key==='colossus.stone_golem'){u._afpBossArtKey=key;if(team==='enemy')gameMode='boss';window.__AFPColossusPvEContext=Object.assign({},window.__AFPColossusPvEContext||{},{active:true});}
   else if(key.startsWith('afp263:')){u._afpBossArtKey=key;u._afp263Boss=key;}
   else u._afpBossArtKey=key;
   u.__lab=1;units.push(u);this._r.push(u);return this._r.length-1;
  },
  dummy(spec){const u={team:spec.team||'ally',lane:spec.lane??1,x:spec.x??.3,hp:1e6,maxHp:1e6,speed:0,atk:1,cd:9,attackPeriod:9,phase:0,heroType:'warrior',isRoster:true,level:1,__lab:1};units.push(u);this._r.push(u);return this._r.length-1;},
  unit(i){return this._u(i);},
  remove(i){const u=this._u(i);const k=units.indexOf(u);if(k>=0)units.splice(k,1);return k>=0;},
  set(i,o){if(o&&o._afTgt!==undefined&&typeof o._afTgt==='number')o._afTgt=this._u(o._afTgt);Object.assign(this._u(i),o);return true;},
  /* n kare: hareket eden birimler gerçek hız ve tempo ile ilerletilir, sonra gerçek draw() çağrılır */
  step(n,dt,move){const out=[];for(let s=0;s<n;s++){elapsed+=dt;
    for(const u of units){if(u.__walk){u.x+=Math.sign(u.speed)*Math.abs(u.speed)*dt*UNIT_MOVE_PACING;}u.hitFlash=Math.max(0,(u.hitFlash||0)-dt);u.attackPulse=Math.max(0,(u.attackPulse||0)-dt);}
    draw(dt);if(units.some(u=>!u.__lab))units=units.filter(u=>u.__lab); /* sahte modda oyunun kendi doğurduğu birimler testten çıkarılır */
    if(move)out.push(this.probe(move.i));}
   return out;},
  attack(i,tgt){const u=this._u(i);u.attackPulse=.22;u._afEng=1;u.cd=u.attackPeriod;af321MarkHit(u,tgt==null?null:this._u(tgt));return true;},
  hurt(i){const u=this._u(i);u.hitFlash=.18;u.hp-=1000;return true;},
  kill(i){const u=this._u(i);u.hp=0;
   try{draw(0);}catch(_){}
   const afpColBoss=(u.isBoss||u.enemyType==='boss')&&u._afpBossArtKey==='colossus.stone_golem';const fb=afp286FallenInfo(u);
   fallenUnits.push({team:u.team,lane:u.lane,x:u.x,life:afpColBoss?1.85:fb&&!fb.atlasDeath?1.6:.95,max:afpColBoss?1.85:fb&&!fb.atlasDeath?1.6:.95,colossusBoss:afpColBoss,colossusFlip:u._afp286c?u._afp286c.flip:1,colossusMinionKind:null,heroType:u.heroType||null,ref:af320Resolve(u),st:u._af321||null,bossRig:fb});
   {const k=units.indexOf(u);if(k>=0)units.splice(k,1);}return {fallen:fallenUnits.length,bossRig:fb?{atlasDeath:!!fb.atlasDeath,kind:fb.kind||null}:null};},
  fallen:()=>fallenUnits.map(f=>({life:+f.life.toFixed(3),bossRig:!!f.bossRig,colossus:!!f.colossusBoss,kind:f.bossRig&&f.bossRig.kind||null,refKind:f.ref&&f.ref.kind})),
  af263Deaths:()=>AF263_BOSS_DEATHS.length,
  /* ölçüm: son çizilen pozu saydam ekran dışı tuvale yeniden çizer; en alt opak satır = gerçek zemin teması */
  probe(i){const u=this._u(i);if(!u||!units.includes(u))return null;const g=laneY(u.lane,laneX(u.x));const r={x:u.x,ground:g};
   const st=u._afp286;
   if(st&&st.last){const L=st.last;r.type=L.type;r.state=L.state||'walk';r.flip=L.flip;r.fsv=L.fsv;r.natF=L.natF;r.key=L.key;r.ground=L.y;
    if(L.type==='mesh'&&st.a&&st.a.K){const A=st.a,K=A.K,M=A.M,V=A.V;r.wW=+A.wW.toFixed(3);r.p=+A.p.toFixed(4);r.tau=A.tau;r.hurt=+A.hurt.toFixed(3);
     const feet=[0,1].map(j=>{const S=j?'R':'L',fp=K.rig['f'+S],q=AF321.apply(M,AF321.BONES.SH[j]*6,fp[0],fp[1]);return [V[0]*q[0]+V[4],V[3]*q[1]+V[5]];});r.feet=feet;
     if(K.rig.quad){r.paws=[0,1].filter(j=>K.rig['h'+(j?'R':'L')][0]<250).map(j=>{const S=j?'R':'L',hp=K.rig['h'+S],q=AF321.apply(M,AF321.BONES.FA[j]*6,hp[0],hp[1]);return [V[0]*q[0]+V[4],V[3]*q[1]+V[5]];});}
     r.low=this._skinLow(K,M,V);r.soles=this._soles(K,M,V);{const SO=afp286Sole(K);r.overhang=Math.max(0,(SO.alphaLow-SO.y)*V[3]);}
     {const R=K.rig,sf=A.sf||.58,q=o=>{let v=A.p+o;v-=Math.floor(v);return v;};const lim=[[0,'f',0],[.5,'f',1]];if(R.quad)lim.push([.25,'h',0],[.75,'h',1]);
      r.stance=lim.map(([o])=>{const v=q(o);return v>.03&&v<sf-.03;});
      r.limbX=lim.map(([o,t,j])=>{const S=j?'R':'L',pt=R[t+S],b=t==='f'?AF321.BONES.SH[j]:AF321.BONES.FA[j],qq=AF321.apply(M,b*6,pt[0],pt[1]);return V[0]*qq[0]+V[4];});}}
    else if(L.type==='atlas'){r.frame=L.frame;const any=afp286FrameLowestAny(L.im,L.frame);r.low=any==null?null:L.y+L.ks*(any-L.bf);}
   }else if(u._afp286c&&u._afp286c.last){const L=u._afp286c.last,D=window.__AFPColossusLastDrawV360286;r.type='colossus';r.state=L.kind;r.frame=L.frame;r.flip=L.flip;r.fsv=L.fsv;if(D&&D.im){const any=afp286FrameLowestAny(D.im,D.frame);r.low=any==null?null:D.y+D.h*(any-(D.base==null?any:D.base))/D.cellH;}r.ground=L.y;r.phase=u._afColossusWalkPhase||0;}
   else if(u._af321&&u._af321.V){const A=u._af321,K=A.K,M=A.M,V=A.V;r.type='hero-mesh';r.wW=+A.wW.toFixed(3);r.p=+A.p.toFixed(4);r.flip=Math.sign(V[0]);r.fsv=Math.sign(V[0])*K.rig.f;r.natF=K.rig.f;
     r.feet=[0,1].map(j=>{const S=j?'R':'L',fp=K.rig['f'+S],q=AF321.apply(M,AF321.BONES.SH[j]*6,fp[0],fp[1]);return [V[0]*q[0]+V[4],V[3]*q[1]+V[5]];});
     r.low=this._skinLow(K,M,V);r.soles=this._soles(K,M,V);r.tau=A.tau;{const sf=A.sf||.58,q=o=>{let v=A.p+o;v-=Math.floor(v);return v;};r.stance=[0,.5].map(o=>{const v=q(o);return v>.03&&v<sf-.03;});r.limbX=r.feet.map(f=>f[0]);}r.hurt=+A.hurt.toFixed(3);}
   return r;},
  /* GPU deri ağıyla birebir aynı hesap: opak piksele düşen ağ köşeleri, ağırlıklı kemik dönüşümleri, görünüm dönüşümü */
  _skinLow(K,M,V){let S=K.__afp286silh||(typeof afp286Silh==='function'?afp286Silh(K):null);
   if(!S){S=K.__afp286silh=[];const cv=document.createElement('canvas');cv.width=512;cv.height=256;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(K.img,0,0);
    const d=g.getImageData(0,0,512,256).data,A=(x,y)=>(x<0||y<0||x>255||y>255)?0:d[(y*512+x)*4+3],D=K.mesh.data,nb=K.mesh.nv-(K.items?K.items.length*4:0);
    for(let i=0;i<nb;i++){const o=i*13,vx=D[o],vy=D[o+1];let op=0;for(let yy=-1;yy<=0&&!op;yy++)for(let xx=-1;xx<=0;xx++)if(A(Math.round(vx)+xx,Math.round(vy)+yy)>60){op=1;break;}
     if(op)S.push([vx,vy,D[o+4],D[o+5],D[o+6],D[o+7],D[o+8],D[o+9],D[o+10],D[o+11]]);}}
   let low=-1e9;for(const q of S){let py=0;for(let j=0;j<4;j++){const w=q[6+j];if(w>0)py+=w*AF321.apply(M,q[2+j]*6,q[0],q[1])[1];}const sy=V[3]*py+V[5];if(sy>low)low=sy;}
   return low;},
  /* uzuv tabanları: her bacak/pati kemiğine (baldır, düz taban, ön bacak önkolu) ağırlıklı opak köşelerin en alt ekran y'si */
  _soles(K,M,V){const S=afp286Silh(K),B=AF321.BONES,R=K.rig,groups=[[B.SH[0],B.WG[0]],[B.SH[1],B.WG[1]]];if(R.quad){groups.push([B.FA[0],B.WP[0]],[B.FA[1],B.WP[1]]);}
   if(R.wings)for(const g of groups)for(let i=g.length-1;i>=0;i--)if(g[i]===B.WG[0]||g[i]===B.WG[1])g.splice(i,1);
   return groups.map(g=>{let low=null;for(const v of S){let w=0;for(let j=0;j<4;j++)if(g.includes(v[2+j]))w+=v[6+j];if(w<.5)continue;let py=0;for(let j=0;j<4;j++){const ww=v[6+j];if(ww>0)py+=ww*AF321.apply(M,v[2+j]*6,v[0],v[1])[1];}const sy=V[3]*py+V[5];if(low===null||sy>low)low=sy;}return low;});},
  _low(c2,cx,u){const half=Math.round(W*.2),x0=Math.max(0,cx-half),w=Math.min(W,cx+half)-x0;const d=c2.getImageData(x0,0,w,H).data;
   for(let y=H-1;y>=0;y--){let n=0;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>40){n++;if(n>=3)return y+1;}}return null;},
  canvasDPR:()=>DPR,
  /* boss başına CPU maliyeti (zemin sınırı + temas çözümü), ms/kare */
  perfBoss(i,n){const u=this._u(i),A=u&&u._afp286&&u._afp286.a;if(!A||!A.K)return null;const K=A.K,M=A.M.slice();const t=performance.now();for(let k=0;k<(n||200);k++){const m=M.slice();afp286GroundClamp(K,m);afp286Contact(K,m);}return (performance.now()-t)/(n||200);}
 }
};
