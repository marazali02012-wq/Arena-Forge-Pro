function afpDrawColossusBossV36074(u){
 const now=typeof elapsed==='number'?elapsed:0;
 const st=u._afp286c||(u._afp286c={});
 const dt=st.lastT==null?0:Math.max(0,Math.min(.1,now-st.lastT));st.lastT=now;
 if(u.hp<=0){if(!Number.isFinite(u._afColossusDeathAtV36074))u._afColossusDeathAtV36074=now;const f=Math.min(7,Math.floor((now-u._afColossusDeathAtV36074)/.22));return afpColossusDrawAtlasV36074('death',f,laneX(u.x),laneY(u.lane,laneX(u.x)),u.lane,1,st.flip||1);}
 const px=af320PxFor('boss',u.lane,1);let h=px*1.72,w=h;const maxW=Math.max(100,W*.30),maxH=Math.max(100,H*.55);
 if(w>maxW){h*=maxW/w;w=maxW;}if(h>maxH){w*=maxH/h;h=maxH;}
 const x=laneX(u.x),y=laneY(u.lane,x),drawX=Math.max(w*.5+6,Math.min(W-w*.5-6,x));
 /* v3.60.286 yön: görsel doğal olarak SOLA bakar. Hedef varsa hedefe, yoksa takım yönüne (KIRMIZI sol / MAVİ sağ). */
 const fsv=afp286Facing(u,st,x,dt),flip=-fsv;st.flip=flip;
 /* v3.60.286 yürüme fazı EKRANDA çizilen yer değiştirmeden ilerler: ekran kenarında tutulan (kıpırdamayan) boss yerinde
    yürüyüp ayak kaydırmaz; yalnız sola hareket sayan eski kod sağa giden/itilen bossu donduruyordu. */
 const lastX=Number.isFinite(st.lastDrawX)?st.lastDrawX:drawX,moved=(drawX-lastX)*fsv;st.lastDrawX=drawX;
 if(Math.abs(moved)>.01){u._afColossusWalkPhase=(((u._afColossusWalkPhase||0)+moved/Math.max(30,h*.78)*8)%8+8)%8;st.walkAt=now;}
 u._afColossusLastXv36074=u.x;
 const atkOn=(u.attackPulse||0)>.025;
 if(atkOn&&!u._afColossusAttackOnV36074)u._afColossusAttackAtV36074=now;
 u._afColossusAttackOnV36074=atkOn;
 const hitOn=(u.hitFlash||0)>.025;
 if(hitOn&&!u._afColossusHitOnV36074)u._afColossusHurtAtV36074=now;
 u._afColossusHitOnV36074=hitOn;
 /* v3.60.286 öncelik: saldırı > yürüme > hasar > bekleme. Eskiden her darbe 1.2 sn "hasar" karesi açıyor ve yürürken de
    oynuyordu: sürekli vurulan boss yürüme yerine sarsılma kareleriyle zeminde kayıyordu. Hasar artık .6 sn ve yürüyüşü kesmez. */
 let kind='idle',frame=0;const walking=Number.isFinite(st.walkAt)&&now-st.walkAt<.2;
 if(Number.isFinite(u._afColossusAttackAtV36074)&&now-u._afColossusAttackAtV36074<1.20){kind='attack';frame=Math.min(7,Math.floor((now-u._afColossusAttackAtV36074)/.15));}
 else if(walking){kind='walk';frame=Math.floor(u._afColossusWalkPhase||0)%8;}
 else if(Number.isFinite(u._afColossusHurtAtV36074)&&now-u._afColossusHurtAtV36074<.60){kind='hurt';frame=Math.min(7,Math.floor((now-u._afColossusHurtAtV36074)/.075));}
 else {kind='idle';frame=Math.floor(now/.24)%8;}
 const ok=afpColossusDrawAtlasV36074(kind,frame,x,y,u.lane,1,flip);
 if(ok){const C=AF320_CLASSES.boss||AF320_CLASSES.heavy;u._vis={x:drawX,y,top:h,px:h,cls:'boss',C,k2:h/Math.max(1,C.h),blue:u.team==='ally'};st.last={kind,frame,flip,fsv,x:drawX,y,t:now};}
 if(hitOn&&kind!=='hurt'){try{ctx.save();ctx.globalAlpha=Math.min(.18,(u.hitFlash||0)*1.1);ctx.fillStyle='#fff0da';ctx.beginPath();ctx.ellipse(drawX,y-h*.46,w*.24,h*.26,0,0,Math.PI*2);ctx.fill();ctx.restore();}catch(_){}}
 return ok;
}
function afpDrawColossusFallenV36074(f,t){
 /* v3.60.286: t=1-kalan/maks. Eski formül KALAN süreyi kullanıyordu: ölüm kareleri tersten (yerde yatan → ayağa kalkan) oynuyordu. */
 const elapsedClip=Math.max(0,Math.max(0,Math.min(1,t))*(f.max||1.85));
 const frame=Math.min(7,Math.floor(elapsedClip/.22));
 const fade=elapsedClip>1.55?Math.max(0,(1.85-elapsedClip)/.30):1;
 /* v3.60.286: zemine +1 px gömülme kaldırıldı; ölüm karesi kendi ölçülen tabanına oturur */
 return afpColossusDrawAtlasV36074('death',frame,laneX(f.x),laneY(f.lane,laneX(f.x)),f.lane,fade,f.colossusFlip||1);
}
