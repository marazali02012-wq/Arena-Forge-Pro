#!/usr/bin/env python3
"""Arena Forge Pro v303: portal hedef kilidi + kararlı HP çubukları (v302 üç onarımın üzerine).
Kullanım: python3 patch_v303.py girdi.html cikti.html
Her değiştirme beklenen sayıda eşleşmezse durur. Oyun değerleri (hasar, hız, can) değişmez."""
import sys

MARK = 'AFP_V303_PORTAL_LOCK_HUD_20261124'


def apply(html: str) -> str:
    if MARK in html:
        raise SystemExit('Zaten uygulanmış: ' + MARK)
    if 'AFP_V302_TRIPLE_FIX_20261123' not in html:
        raise SystemExit('Önce v302 yaması uygulanmalı')

    def patch(old, new, expected=1, tag=''):
        nonlocal html
        n = html.count(old)
        if n != expected:
            raise SystemExit(f'{tag}: {expected} eşleşme beklendi, {n} bulundu')
        html = html.replace(old, new)

    # ---- 1) PORTAL HEDEF KİLİDİ -------------------------------------------------------------
    # Kök neden: hedef her karede baştan seçiliyor ve ileri yöndeki düşman minyon portaldan önce
    # geliyor. Portala vuran birimin önüne yeni düşman konunca bir sonraki karede hedef değişiyordu.
    patch("    const previousTarget=u._afTgt;\n",
          "    /* v3.60.303 " + MARK + " PORTAL HEDEF KİLİDİ: portala vurmaya başlayan birim, portal ayakta ve hâlâ portal\n"
          "       menzilinde olduğu sürece önüne sonradan gelen düşman minyona dönmez. Portal yıkılınca, koridor değişince\n"
          "       ya da birim geri itilip portal menzilinden çıkınca kilit kalkar. İki takım için aynı; hasar/hız değişmez. */\n"
          "    if(u._afPortalLock&&(u.isCommander||u.lane!==u._afPortalLockLane||!af303PortalHoldAim(u,attackRange,af265IsSiege)))u._afPortalLock=0;\n"
          "    const af303PortalHold=!!u._afPortalLock;\n"
          "    const previousTarget=af303PortalHold?null:u._afTgt;\n",
          tag='portal kilidi kontrolü')
    patch("    for(const e of units){\n      const bossRaidQueenTarget",
          "    for(const e of units){\n      if(af303PortalHold)break; /* v3.60.303: kilitli birim yeni hedef aramaz */\n      const bossRaidQueenTarget",
          tag='hedef döngüsü')
    patch("u.facingDir=1;u._afEng=1;u._afTgt=null;u._afTower=1;af34055PortalSlot(u);",
          "u.facingDir=1;u._afEng=1;u._afTgt=null;u._afTower=1;if(!u.isCommander){u._afPortalLock=1;u._afPortalLockLane=u.lane;}af34055PortalSlot(u);",
          tag='mavi portal saldırısı kilit')
    patch("u.facingDir=-1;u._afEng=1;u._afTgt=null;u._afTower=1;af34055PortalSlot(u);",
          "u.facingDir=-1;u._afEng=1;u._afTgt=null;u._afTower=1;if(!u.isCommander){u._afPortalLock=1;u._afPortalLockLane=u.lane;}af34055PortalSlot(u);",
          tag='kırmızı portal saldırısı kilit')

    # ---- 2) KARARLI HP ÇUBUKLARI --------------------------------------------------------------
    # Kök neden: yerleşim her karede hafızasız yeniden kuruluyordu. Sıralama animasyonla oynayan sprite
    # tepesine (bottom) göre yapıldığı için komşu çubuklar her karede yer değiştiriyor; 12 denemede yer
    # bulunamayınca çubuk gizleniyor, küçük bir oynamayla geri geliyordu (aç/kapa); yoğun mod 12 birim
    # sınırında her karede açılıp kapanıyordu; çubuk y'si animasyon karesine göre zıplıyordu.
    patch("    items.push({u,x:v.x,bottom,w:af378HudNoText.has(u)?(barW+8)*1.17:Math.max(barW,lw)+8,h:af378HudNoText.has(u)?barH+5:barH+textH+3,hb:Math.max(barH,fs)+3});",
          "    items.push({u,x:v.x,bottom,w:af378HudNoText.has(u)?(barW+8)*1.17:Math.max(barW,lw)+8,h:af378HudNoText.has(u)?barH+5:barH+textH+3,hb:Math.max(barH,fs)+3,bw:barW,bh:barH,th:textH});",
          tag='hud öğe geometrisi')
    patch("let af382HudHidden=new WeakSet(),af382HudDense=false;",
          "let af382HudHidden=new WeakSet(),af382HudDense=false;\n"
          "/* v3.60.303 " + MARK + " kalıcı HP çubuğu durumu (yalnız çizim; can değerleri değişmez) */\n"
          "let af303HudState=new WeakMap(),af303HudX=new WeakMap(),af303HudBarY=new WeakMap(),af303HudSeq=0,af303HudLastT=0;",
          tag='hud durum değişkenleri')
    patch("  af320HudOffsets=new WeakMap();af378HudNoText=new WeakSet();af382HudHidden=new WeakSet();\n"
          "  af382HudDense=!!(playing&&order.length>=12);",
          "  af320HudOffsets=new WeakMap();af378HudNoText=new WeakSet();af382HudHidden=new WeakSet();af303HudX=new WeakMap();af303HudBarY=new WeakMap();\n"
          "  af382HudDense=!!(playing&&(af382HudDense?order.length>9:order.length>=12)); /* v3.60.303: histerezis (12'de gir, 9'da çık) */",
          tag='yoğun mod histerezisi')

    start = html.index("  items.sort((a,b)=>b.bottom-a.bottom);\n  const placed=[];")
    end_marker = "    af320HudOffsets.set(it.u,lift);\n  }\n}"
    end = html.index(end_marker, start) + len(end_marker)
    old_block = html[start:end]
    if html.count(old_block) != 1:
        raise SystemExit('hud yerleşim bloğu tekil değil')
    new_block = r"""  /* v3.60.303 kararlı yerleşim: (1) her birimin çubuk çapası zamanla yumuşatılır, gerçek sıçramada anında
     yerine oturur; (2) sıralama kalıcıdır: komutan/boss, sonra zaten görünen çubuklar, sonra geliş sırası;
     (3) çubuk önceki satırını korur (2 px yatay tolerans), en fazla 4 satır; boş alt satıra ancak 0,35 sn boş kalınca iner;
     (4) yer yoksa çakıştırmak yerine gizlenir; görünen çubuklar öncelikli olduğundan aç/kapa döngüsü oluşmaz. */
  const now303=performance.now(),dt303=Math.min(.1,Math.max(0,(now303-af303HudLastT)/1000));af303HudLastT=now303;
  const aY303=1-Math.exp(-dt303*14),aX303=1-Math.exp(-dt303*18),snapY303=Math.max(18,H*.06),snapX303=Math.max(24,W*.04);
  for(const it of items){
    let st=af303HudState.get(it.u);
    if(!st){st={sb:it.bottom,sx:it.x,row:0,vis:false,seq:++af303HudSeq,free:0,hb:[it.bottom,it.bottom,it.bottom],far:0};af303HudState.set(it.u,st);}
    else{
      /* tek karelik zikzak (animasyon tepe noktası, portal yuvası) 3'lü medyanla elenir; gerçek sıçrama 2 kare sürünce anında uygulanır */
      st.hb[0]=st.hb[1];st.hb[1]=st.hb[2];st.hb[2]=it.bottom;
      const med=Math.max(Math.min(st.hb[0],st.hb[1]),Math.min(Math.max(st.hb[0],st.hb[1]),st.hb[2]));
      if(Math.abs(it.bottom-st.sb)>snapY303){st.far++;if(st.far>=2){st.sb=it.bottom;st.hb=[it.bottom,it.bottom,it.bottom];}}
      else{st.far=0;st.sb+=(med-st.sb)*Math.min(.3,aY303);}
      if(Math.abs(it.x-st.sx)>snapX303)st.sx=it.x;else st.sx+=(it.x-st.sx)*Math.min(.4,aX303);
    }
    it.st=st;it.pr=(it.u.isCommander||it.u.isBoss)?0:1;
  }
  items.sort((a,b)=>(a.pr-b.pr)||((a.st.vis?0:1)-(b.st.vis?0:1))||(a.st.seq-b.st.seq));
  /* yerleşim kutusu = gerçekte çizilen alan: renkli çubuk + soldaki enerji rozeti (af320DrawHud ile aynı formüller) */
  const placed=[];
  for(const it of items){
    const st=it.st,u=it.u,always=!!(u.isHero||u.isCommander||u.isBoss);
    let rr=0;if(!always){const key=u.heroType||u.type||u.unitType,blue=!!(u._vis&&u._vis.blue);const cost=(key&&typeof af334CardCost==='function')?af334CardCost(key,blue?'ally':'enemy'):(key&&typeof energyCost==='function'?energyCost(key):null);if(Number.isFinite(cost)&&cost>0)rr=Math.max(7,it.bh*1.15);}
    const dOff=it.th+1-it.bh,half=Math.max(it.bh/2,rr)+1,step=half*2+1;
    const L=-it.bw/2-(rr?rr*1.82:0)-1,R=it.bw/2+1;
    const minTop303=Math.max(H*.135,(window.__afp263HudFloor?window.__afp263HudFloor(st.sx,it.bw):0));
    /* üst sınıra takılan çubuk, çizimin onu sabitleyeceği gerçek konumla (minTop) yerleştirilir ve denetlenir */
    const box=(r,tol)=>{const b0=st.sb-r*step,clamp=b0+dOff<minTop303,b=clamp?minTop303-dOff:b0,cy=b+dOff+it.bh/2;return {b,clamp,l:st.sx+L+tol,r:st.sx+R-tol,t:cy-half,bt:cy+half};};
    const fits=(r,tol)=>{const k=box(r,tol);if(r>0&&k.clamp)return false;for(const q of placed)if(k.l<q.r&&q.l<k.r&&k.t<q.bt&&q.t<k.bt)return false;return true;};
    let row=-1;
    if(st.vis&&st.row>=0&&st.row<=3&&fits(st.row,2)){
      row=st.row;
      if(row>0&&fits(row-1,0)){st.free+=dt303;if(st.free>=.35){row-=1;st.free=0;}}else st.free=0;
    }else{for(let r=0;r<=3;r++)if(fits(r,0)){row=r;break;}st.free=0;}
    if(row<0){st.vis=false;af382HudHidden.add(u);continue;}
    st.vis=true;st.row=row;
    const k=box(row,0);placed.push(k);
    af320HudOffsets.set(u,it.bottom-k.b);af303HudX.set(u,st.sx);af303HudBarY.set(u,k.b);
  }
}"""
    html = html[:start] + new_block + html[end:]
    patch("barW=C.hpW*kk*(u._af214GroupMember?.72:1),barH=Math.max(4,C.hpH*kk),bx=x-barW/2,",
          "barW=C.hpW*kk*(u._af214GroupMember?.72:1),barH=Math.max(4,C.hpH*kk),bx=(af303HudX.has(u)?af303HudX.get(u):x)-barW/2,",
          tag='hud yumuşatılmış x')
    # Kök neden (titreme): yerleşim gövdeler çizildikten sonra hesaplanıyor, ama karakter motoru (af321Flush)
    # ardından sprite tepesini güncelliyor; çubuk bu karenin farklı tepe değeriyle çiziliyordu (±8 px zıplama).
    # Artık çubuk y'si yerleşimin hesapladığı tek değerden gelir.
    patch("    let withText=false,barY=y-top-barH-C.gap*kk-crowdLift;",
          "    let withText=false,barY=af303HudBarY.has(u)?af303HudBarY.get(u)+textH+1-barH:y-top-barH-C.gap*kk-crowdLift; /* v3.60.303 */",
          tag='hud y tek kaynak')
    patch("if(barY<minTop){barY=Math.max(minTop,y-top-barH-C.gap*kk-crowdLift);}",
          "if(barY<minTop){barY=minTop;}",
          tag='hud üst sınır')
    # Yakın dövüşçü portal çizgisindeyken önüne konan düşmanın gövdesi onu ~0,015 geri itiyor ve 0,895 portal
    # çizgisinin dışına düşürüyordu. Kilitli birime 0,045 pay: küçük itme kilidi bozmaz, gerçek geri itme bozar.
    patch("const AF265_RAM='afn_sicrayan_kocbasi';",
          "/* v3.60.303 kilitli birim için portal menzili payı (yalnız hedef sürekliliği; menzil/hasar değişmez) */\n"
          "function af303PortalHoldAim(u,range,siege){\n"
          "  if(af268PortalAim(u,range,siege))return true;\n"
          "  const ally=u.team==='ally',portalX=ally?.965:.035,m=.045;\n"
          "  if((ally?enemyHP:allyTowerHP)[u.lane]<=0)return false;\n"
          "  const gun=af268Gun(u);\n"
          "  if(gun)return Math.abs(portalX-u.x)<=gun.portal+m;\n"
          "  if(af323IsShooter(u)&&!af34033IsCloseCombat(u))return Math.abs(portalX-u.x)<=range+m;\n"
          "  return ally?u.x>=.895-m:u.x<=.105+m;\n"
          "}\n"
          "const AF265_RAM='afn_sicrayan_kocbasi';",
          tag='portal kilidi payı')
    patch("    else if(u.team==='ally'&&af268PortalAim(u,attackRange,af265IsSiege)){",
          "    else if(u.team==='ally'&&(af303PortalHold?af303PortalHoldAim(u,attackRange,af265IsSiege):af268PortalAim(u,attackRange,af265IsSiege))){",
          tag='mavi portal dalı')
    patch("    }else if(u.team==='enemy'&&af268PortalAim(u,attackRange,af265IsSiege)){",
          "    }else if(u.team==='enemy'&&(af303PortalHold?af303PortalHoldAim(u,attackRange,af265IsSiege):af268PortalAim(u,attackRange,af265IsSiege))){",
          tag='kırmızı portal dalı')
    # Sunucu güvenliği tamamlama: v302 adresi kapalı değişkene sabitledi ama pencere değişkeni sonradan
    # değiştirilebiliyordu; tekrar oynatma yüklemesi oturum anahtarını o adrese gönderiyordu.
    patch("  let serverUrl=TRUSTED_WS_URL;\n  window.AFP_MODE_NET_WS_URL=TRUSTED_WS_URL;\n",
          "  let serverUrl=TRUSTED_WS_URL;\n"
          "  /* v3.60.303: pencere değişkeni salt okunur resmî adres; yazma denemeleri yok sayılır */\n"
          "  try{Object.defineProperty(window,'AFP_MODE_NET_WS_URL',{get:()=>TRUSTED_WS_URL,set:()=>{},enumerable:true,configurable:false});}catch(_){window.AFP_MODE_NET_WS_URL=TRUSTED_WS_URL;}\n",
          tag='salt okunur sunucu adresi')
    patch("const ws=String(window.AFP_MODE_NET_WS_URL||'');const base=ws?ws.replace(/^wss:/,'https:').replace(/^ws:/,'http:').replace(/\\/ws\\/?$/,''):'https://arena-forge-online-server.onrender.com';",
          "const base='https://arena-forge-online-server.onrender.com'; /* v3.60.303: oturum anahtarı yalnız resmî sunucuya */",
          tag='replay yükleme adresi')
    return html


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    h = open(src, encoding='utf-8').read()
    out = apply(h)
    open(dst, 'w', encoding='utf-8').write(out)
    print('v303 uygulandı', len(h.encode()), '->', len(out.encode()))
