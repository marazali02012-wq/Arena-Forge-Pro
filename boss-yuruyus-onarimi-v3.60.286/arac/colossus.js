function afpColossusDrawAtlasV36074(kind,frame,x,y,lane,alpha=1,flip=1){
 const im=afpColossusAtlasImageV36074(kind);if(!im)return false;
 const cellW=im.naturalWidth/4,cellH=im.naturalHeight/2,idx=Math.max(0,Math.min(7,Math.floor(frame)||0));
 const px=af320PxFor('boss',lane,1);let h=px*1.72,w=h;
 const maxW=Math.max(100,W*.30),maxH=Math.max(100,H*.55);
 if(w>maxW){h*=maxW/w;w=maxW;}if(h>maxH){w*=maxH/h;h=maxH;}
 /* v3.60.286: ayak pivotu her karenin ÖLÇÜLEN zemin çizgisi (eski sabit tablo: yürüme karelerinde 3-9 px havada) */
 const bases=afp286AtlasBases(im);
 const bottom=bases?bases[idx]+1:({idle:412,walk:409,attack:411,hurt:407,death:427}[kind]||412)/443*cellH;
 const anchor=bottom/cellH;
 // Keep the entire boss on the visible battle canvas, including the first spawn frame.
 const safeX=Math.max(w*.5+6,Math.min(W-w*.5-6,x));
 const C=AF320_CLASSES.boss||AF320_CLASSES.heavy;
 ctx.save();ctx.translate(safeX,y);ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
 ctx.fillStyle='rgba(2,4,10,.68)';ctx.beginPath();ctx.ellipse(0,1,w*.36,h*.072,0,0,Math.PI*2);ctx.fill();
 if(kind!=='death'){
  const aura=ctx.createRadialGradient(0,-h*.48,h*.03,0,-h*.48,Math.max(w,h)*.58);
  aura.addColorStop(0,'rgba(69,173,255,.20)');aura.addColorStop(.62,'rgba(41,125,219,.08)');aura.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=aura;ctx.beginPath();ctx.ellipse(0,-h*.46,w*.54,h*.54,0,0,Math.PI*2);ctx.fill();
 }
 if(flip<0)ctx.scale(-1,1); /* görsel sola bakar; yalnız karakter çizimi çevrilir */
 ctx.drawImage(im,(idx%4)*cellW,Math.floor(idx/4)*cellH,cellW,cellH,-w/2,-h*anchor,w,h);
 ctx.restore();
 uOrFVisV36074(safeX,y,h,C);
 try{window.__AFPColossusLastDrawV360286={kind,frame:idx,x:safeX,y,h,w,anchor,flip,im,cellH,base:bases?bases[idx]:null};}catch(_){}
 try{if(af321Band&&af321Band.length>1){af321Band[0]=Math.min(af321Band[0],y-h*anchor);af321Band[1]=Math.max(af321Band[1],y+h*.06);}}catch(_){ }
 return true;
}
