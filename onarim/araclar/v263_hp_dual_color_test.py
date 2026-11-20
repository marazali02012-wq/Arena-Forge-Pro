#!/usr/bin/env python3
"""v263 isolated HP text cache, mild WebGL vibrance and lossless dual-blade art.
Run after v263_vfx_readability_test.py; never changes production sources.
"""
from pathlib import Path
from PIL import Image
import json, re, base64, io, colorsys

src=Path("onarim/cikti_v263/ArenaForgePro_v3.60.263_EFEKT_DENGE_TEST.html")
dst=Path("onarim/cikti_v263/ArenaForgePro_v3.60.263_CAN_CUBUGU_CIFT_KILIC_RENK_TEST.html")
s=src.read_text(encoding="utf-8")
original=s
def rep(needle,replacement):
    global s
    assert s.count(needle)==1,(needle[:70],s.count(needle))
    s=s.replace(needle,replacement,1)

rep("    const lw=(String(Math.max(0,Math.ceil(u.hp)))+'/'+Math.ceil(u.maxHp)).length*fs*.62;",
    "    const lw=af378HudNoText.has(u)?0:(String(Math.max(0,Math.ceil(u.hp)))+'/'+Math.ceil(u.maxHp)).length*fs*.62;")
rep("    const shownHp=Math.max(0,Math.ceil(u.hp)),maxHp=Math.ceil(u.maxHp);\n    ctx.save();",
    "    ctx.save();")
rep("""    ctx.font='800 '+Math.round(Math.max(8,9*kk))+'px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.lineJoin='round';ctx.lineWidth=2.4;ctx.strokeStyle='rgba(2,6,12,.95)';
    if(withText){const label=shownHp+'/'+maxHp;ctx.strokeText(label,x,barY-1);ctx.fillStyle='#fff';ctx.fillText(label,x,barY-1);}else if(af367OnBar){const label=shownHp+'/'+maxHp;ctx.textBaseline='middle';ctx.strokeText(label,x,barY+barH/2+.5);ctx.fillStyle='#fff';ctx.fillText(label,x,barY+barH/2+.5);} /* v3.60.67 AFQA-14: yer yoksa rakam çubuğun üstünde */""",
"""    if(withText||af367OnBar){const label=Math.max(0,Math.ceil(u.hp))+'/'+Math.ceil(u.maxHp);
      const sprite=af263HpLabelSprite(label,Math.round(Math.max(8,9*kk)),!!af367OnBar);
      const ty=withText?barY-1:barY+barH/2+.5;
      ctx.drawImage(sprite.c,x-sprite.w/2,ty-sprite.base,sprite.w,sprite.h);
    } /* v263: cache HP glyph raster; never draw text twice every video frame */""")
rep("const af382GradCache=new Map();",
"""/* v263 HUD: cached glyph bitmaps. HP labels only change when damage/heal changes value.
   Re-stroking each number on every frame is expensive on Canvas 2D mobile browsers. */
const af263HpLabelCache=new Map();
function af263HpLabelSprite(label,fs,onBar){
 const key=fs+'|'+(+onBar)+'|'+label;
 let obj=af263HpLabelCache.get(key);
 if(obj){af263HpLabelCache.delete(key);af263HpLabelCache.set(key,obj);return obj;}
 const scale=2, h=Math.ceil(fs+10), g0=document.createElement('canvas');
 const fnt='800 '+fs+'px system-ui,sans-serif', measure=g0.getContext('2d');measure.font=fnt;
 const w=Math.max(18,Math.ceil(measure.measureText(label).width+8));
 g0.width=w*scale;g0.height=h*scale;
 const g=g0.getContext('2d');g.scale(scale,scale);g.font=fnt;g.textAlign='center';g.textBaseline=onBar?'middle':'bottom';
 g.lineJoin='round';g.lineWidth=2.4;g.strokeStyle='rgba(2,6,12,.95)';
 const base=onBar?h/2:h-3;
 g.strokeText(label,w/2,base);g.fillStyle='#fff';g.fillText(label,w/2,base);
 obj={c:g0,w,h,base};af263HpLabelCache.set(key,obj);
 if(af263HpLabelCache.size>72){const k=af263HpLabelCache.keys().next().value;af263HpLabelCache.delete(k);}
 return obj;
}
const af382GradCache=new Map();""")
rep("const arenaVibrance=(window.__AFP_TROPHY_ARENA_VIBRANCE===true)?1.18:1;gl.uniform3f(loc.uTone,tone[0],tone[1]*arenaVibrance,-.25);",
    "const arenaVibrance=(window.__AFP_TROPHY_ARENA_VIBRANCE===true)?1.18:1.10;gl.uniform3f(loc.uTone,tone[0],Math.min(1.24,tone[1]*arenaVibrance),-.25);")
S="af37_karanlik_suikastci"
def packed(key):
    m=re.search(r'"'+re.escape(key)+r'":"data:image/([a-z]+);base64,([A-Za-z0-9+/=]+)"',original)
    assert m,key
    return Image.open(io.BytesIO(base64.b64decode(m.group(2)))).convert("RGBA")
j=original.index("window.AFP94_MINION_CARDS=")+len("window.AFP94_MINION_CARDS=")
cards,_=json.JSONDecoder().raw_decode(original[j:])
assert S in cards
card=Image.open(io.BytesIO(base64.b64decode(cards[S].split(",",1)[1]))).convert("RGBA")
art={"card":card,"full":packed("minion.full."+S),"atlas":packed("unit.atlas."+S)}
assert art["atlas"].size==(512,256)
def recolor(img):
    im=img.copy()
    px=im.load()
    for y in range(im.height):
        for x in range(im.width):
            r,g,b,a=px[x,y]
            if not a:
                px[x,y]=(0,0,0,0)
                continue
            h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
            deg=h*360
            if 245<=deg<=335 and s>.18:
                h2=(200+(deg-285)*.6)%360
                rr,gg,bb=colorsys.hsv_to_rgb(h2/360,min(1,s*1.13),v)
                px[x,y]=(round(rr*255),round(gg*255),round(bb*255),a)
    f=io.BytesIO()
    im.save(f,format="PNG",optimize=True)
    return "data:image/png;base64,"+base64.b64encode(f.getvalue()).decode()
urls={k:recolor(v) for k,v in art.items()}
start=s.index("try{const S='af37_karanlik_suikastci',T='af37_cift_kilicli'")
end=s.index("/* v3.41.58: all original unit portraits",start)
new="""/* v263 test: Çift Kılıçlı uses a prebuilt lossless blue dual-blade asset; no boot-time canvas repaint / WebP re-encode. */
try{const S='af37_karanlik_suikastci',T='af37_cift_kilicli',AR=window.AFArt,C=window.AFP94_MINION_CARDS;
  if(AF321_RIGS[S])AF321_RIGS[T]=JSON.parse(JSON.stringify(AF321_RIGS[S]));
  const P_CARD=__CARD__,P_FULL=__FULL__,P_ATLAS=__ATLAS__;
  if(C)C[T]=P_CARD;
  if(AR){AR.register('minion.portrait.'+T,P_FULL);AR.register('minion.full.'+T,P_FULL);AR.register('unit.atlas.'+T,P_ATLAS);}
  HERO_PORTRAITS[T]=P_FULL;AF321_ATLAS[T]=P_ATLAS;
  // The rig has two dagger/sword bones. Register once with the correct texture at startup.
  try{AF321.register(T,P_ATLAS);}catch(e){console.warn('[v263] çift kılıç atlası',e);}
  window.__afp263CiftKilicliTurev={card:true,portrait:true,full:true,atlas:true,lossless:true};
}catch(e){console.warn('[v263] çift kılıçlı önhazır görsel',e);}
"""
for token,name in (("__CARD__","card"),("__FULL__","full"),("__ATLAS__","atlas")):
    new=new.replace(token,repr(urls[name]))
s=s[:start]+new+s[end:]
assert "gl.scissor(0,glY,cw,bh)" not in s
assert "powerPreference:'high-performance'" not in s
assert "const ice=src=>new Promise" not in s
assert "arenaForgeProProfileV19" in s
assert s.count("function af320DrawHud(u)")==1
dst.write_text(s,encoding="utf-8")
print("PASS: visual-only v263 test HTML",dst,dst.stat().st_size)
