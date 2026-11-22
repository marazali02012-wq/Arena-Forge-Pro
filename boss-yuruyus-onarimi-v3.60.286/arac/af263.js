function af263DrawBossAnim(u){
  /* v3.60.286: AF263 bossları ortak boss yürüyüş/zemin/yön modülünden çizilir (afp286DrawBossRig) */
  if(afp286DrawBossRig(u))return true;
  const id=String(u._afp263Boss).slice(7),def=AF263_NEW_BOSSES[u._afp263Boss]||{};
  const atk=Math.max(0,Math.min(1,(u.attackPulse||0)/.30));
  let st=atk>.02?'attack':'idle',im=af263BossImg(id,st);if(!im&&st!=='idle'){st='idle';im=af263BossImg(id,'idle');}
  if(!im)return false;
  const t=(typeof elapsed==='number'?elapsed:0)+(u.phase||0),f=st==='attack'?Math.min(7,Math.floor((1-atk)*8)):Math.floor(t*8)%8;
  let h=af320PxFor('boss',u.lane,1)*1.75,w=h;const maxW=Math.max(90,W*.255);if(w>maxW){h*=maxW/w;w=maxW;}
  const x=laneX(u.x),y=laneY(u.lane,x),d=AFP286_BOSS_DEFS[u._afp263Boss],nat=d&&d.rig&&AFP286_BOSS_RIGS[d.rig]?AFP286_BOSS_RIGS[d.rig].f:1,flip=(u.team==='ally'?1:-1)*nat<0;
  ctx.save();ctx.fillStyle='rgba(2,4,10,.66)';ctx.beginPath();ctx.ellipse(x,y+1,w*.32,h*.065,0,0,Math.PI*2);ctx.fill();ctx.restore();
  /* yedek yol (gövde atlası henüz hazır değil): kareye özgü ölçülen taban zemine oturur */
  const b=afp286AtlasBases(im),fh=im.naturalHeight/2,foot=b?(b[f]+1)/fh:.95;
  af263BossFrame(im,f,x,y+h*(1-foot),w,h,flip);
  const C=AF320_CLASSES.boss||AF320_CLASSES.heavy;
  u._vis={x,y,top:h*.82,px:h,cls:'boss',C,k2:h/Math.max(1,C.h),blue:u.team!=='enemy'};u._afp263Last={id,x,y,w,h,flip};AF263_BOSS_LIVE.add(u);
  try{if(af321Band&&af321Band.length>1){af321Band[0]=Math.min(af321Band[0],y-h);af321Band[1]=Math.max(af321Band[1],y+h*.08);}}catch(_){}
  return true;}
function af263DrawBossDeaths(){
  for(const u of AF263_BOSS_LIVE){const dead=!(u.hp>0);if(dead&&playing&&u._afp263Last)AF263_BOSS_DEATHS.push(Object.assign({at:elapsed},u._afp263Last));if(dead||!units.includes(u))AF263_BOSS_LIVE.delete(u);}
  for(let i=AF263_BOSS_DEATHS.length-1;i>=0;i--){const d=AF263_BOSS_DEATHS[i],f=Math.floor((elapsed-d.at)*8);if(f>7||f<0){AF263_BOSS_DEATHS.splice(i,1);continue;}
   const im=af263BossImg(d.id,'death');if(!im)continue;const al=f>=6?Math.max(0,1-(f-5)*.3):1;
   const dd=d.key&&AFP286_BOSS_DEFS[d.key];
   if(dd&&dd.norm&&d.anchor){afp286Shadow(d.x,d.y,dd.norm.bw*dd.norm.s*d.k,.5*al);ctx.save();ctx.globalAlpha=al;afp286DrawAtlas(dd,im,f,d.x,d.y,d.k,d.flip?-1:1,d.anchor);ctx.restore();}
   else{const b=afp286AtlasBases(im),fh=im.naturalHeight/2,foot=b?(b[f]+1)/fh:.95;ctx.save();ctx.globalAlpha=al;af263BossFrame(im,f,d.x,d.y+d.h*(1-foot),d.w,d.h,d.flip);ctx.restore();}}}
