#!/usr/bin/env python3
"""Arena Forge Pro v305: üç koridorda portal önü tek düz (eğik, perspektife uygun) çizgi.
Kullanım: python3 patch_v305.py girdi.html cikti.html  (girdi v304 olmalı)
İstek: portala varan minyonlar portal platformunun ön kenarında, üç koridor boyunca tek çizgide dursun;
menzilliler dahil herkes o çizgiye gelsin (oyuncu seçimi: denge değişebilir).
Çizgi, oyuncunun ekran görüntüsünde çizdiği kırmızı doğrudan ölçüldü: mavi portal önü
x = 0,1207 / 0,0925 / 0,0646 (üst/orta/alt), kırmızı portal önü bunun aynası."""
import sys

MARK = 'AFP_V305_PORTAL_LINE_20261124'


def apply(html: str) -> str:
    if MARK in html:
        raise SystemExit('Zaten uygulanmış: ' + MARK)
    if 'AFP_V304_LANE_CENTER_20261124' not in html:
        raise SystemExit('Önce v304 yaması uygulanmalı')

    def patch(old, new, expected=1, tag=''):
        nonlocal html
        n = html.count(old)
        if n != expected:
            raise SystemExit(f'{tag}: {expected} eşleşme beklendi, {n} bulundu')
        html = html.replace(old, new)

    # 1) Koridora göre portal çizgisi + tüm türler için portal menzili = çizgi
    patch("function af268PortalAim(u,range,siege){\n"
          "  const ally=u.team==='ally',portalX=ally?.965:.035;\n"
          "  if((ally?enemyHP:allyTowerHP)[u.lane]<=0)return false;\n"
          "  if(siege&&af265RamInRange(u))return true;\n"
          "  const gun=af268Gun(u);\n"
          "  if(gun)return Math.abs(portalX-u.x)<=gun.portal+1e-6;\n"
          "  if(af323IsShooter(u)&&!af34033IsCloseCombat(u))return Math.abs(portalX-u.x)<=range+1e-6;\n"
          "  return ally?u.x>=.895:u.x<=.105;\n"
          "}",
          "/* v3.60.305 " + MARK + ": portal önü çizgisi koridora göre (portal platformunun ön kenarı, perspektif).\n"
          "   Mavi portal önü (kırmızı takımın durduğu yer) üst/orta/alt; kırmızı portal önü bunun aynası. */\n"
          "const AF305_PORTAL_LINE=[.1207,.0925,.0646];\n"
          "function af305Line(u){const l=Math.max(0,Math.min(2,u&&Number.isInteger(u.lane)?u.lane:1));return u&&u.team==='ally'?1-AF305_PORTAL_LINE[l]:AF305_PORTAL_LINE[l];}\n"
          "function af268PortalAim(u,range,siege){\n"
          "  const ally=u.team==='ally';\n"
          "  if((ally?enemyHP:allyTowerHP)[u.lane]<=0)return false;\n"
          "  if(siege&&af265RamInRange(u))return true;\n"
          "  /* v3.60.305: menzilli ve top dahil herkes portala çizgiden vurur (eskiden menzilliler uzaktan vuruyordu) */\n"
          "  const line=af305Line(u);\n"
          "  return ally?u.x>=line-1e-6:u.x<=line+1e-6;\n"
          "}",
          tag='portal menzili')
    patch("  const ally=u.team==='ally',portalX=ally?.965:.035,m=.045;\n"
          "  if((ally?enemyHP:allyTowerHP)[u.lane]<=0)return false;\n"
          "  const gun=af268Gun(u);\n"
          "  if(gun)return Math.abs(portalX-u.x)<=gun.portal+m;\n"
          "  if(af323IsShooter(u)&&!af34033IsCloseCombat(u))return Math.abs(portalX-u.x)<=range+m;\n"
          "  return ally?u.x>=.895-m:u.x<=.105+m;\n",
          "  const ally=u.team==='ally',m=.045;\n"
          "  if((ally?enemyHP:allyTowerHP)[u.lane]<=0)return false;\n"
          "  const line=af305Line(u);\n"
          "  return ally?u.x>=line-m:u.x<=line+m;\n",
          tag='kilit payı')

    # 2) Portal çizgisinde dur: çizgiye normal hızla yürü, çizgiye varınca tam çizgide kal (ışınlanma yok)
    patch("u.facingDir=1;u._afEng=1;u._afTgt=null;u._afTower=1;if(!u.isCommander){u._afPortalLock=1;u._afPortalLockLane=u.lane;}af34055PortalSlot(u);",
          "u.facingDir=1;u._afEng=1;u._afTgt=null;u._afTower=1;if(!u.isCommander){u._afPortalLock=1;u._afPortalLockLane=u.lane;}af34055PortalSlot(u);if(!af265IsSiege)af305HoldLine(u,dt);",
          tag='mavi çizgide dur')
    patch("u.facingDir=-1;u._afEng=1;u._afTgt=null;u._afTower=1;if(!u.isCommander){u._afPortalLock=1;u._afPortalLockLane=u.lane;}af34055PortalSlot(u);",
          "u.facingDir=-1;u._afEng=1;u._afTgt=null;u._afTower=1;if(!u.isCommander){u._afPortalLock=1;u._afPortalLockLane=u.lane;}af34055PortalSlot(u);if(!af265IsSiege)af305HoldLine(u,dt);",
          tag='kırmızı çizgide dur')

    # 3) Kalabalık: portal çizgisini tüm türler paylaşır (8'e kadar), yuvalar 8, üst/alt sırayla
    patch("function af34055PortalSlot(u){const g=af34055PortalAttackers(u),used=new Set(g.map(v=>v._afPortalSlot));let k=Number.isFinite(u._afPortalSlot)&&!used.has(u._afPortalSlot)?u._afPortalSlot:0;while(used.has(k)&&k<2)k++;u._afPortalSlot=k;}",
          "function af34055PortalSlot(u){const g=af34055PortalAttackers(u),used=new Set(g.map(v=>v._afPortalSlot));let k=Number.isFinite(u._afPortalSlot)&&!used.has(u._afPortalSlot)?u._afPortalSlot:0;while(used.has(k)&&k<7)k++;u._afPortalSlot=k;} /* v3.60.305: 8 yuva */\n"
          "function af305HoldLine(u,dt){\n"
          "  const line=af305Line(u),d=line-u.x;if(Math.abs(d)<.0008){u.x=line;return;}\n"
          "  const step=Math.abs(u.speed||.06)*Math.max(0,dt||0)*UNIT_MOVE_PACING;\n"
          "  u.x+=Math.sign(d)*Math.min(Math.abs(d),Math.max(step,.0008));u.animMove=1;\n"
          "}",
          tag='portal yuvaları')
    patch("  if(!u||!other||other.team!==u.team||other._afTower!==1||other._afEng!==1||!af34033IsCloseCombat(u))return false;\n"
          "  const zone=u.team==='ally'?(u.x>=.78&&other.x>=.88):(u.x<=.22&&other.x<=.12);\n"
          "  return zone&&af34055PortalAttackers(u).length<3;",
          "  if(!u||!other||other.team!==u.team||other._afTower!==1||other._afEng!==1)return false; /* v3.60.305: tüm türler */\n"
          "  const line=af305Line(u),zone=u.team==='ally'?(u.x>=line-.12&&other.x>=line-.02):(u.x<=line+.12&&other.x<=line+.02);\n"
          "  return zone&&af34055PortalAttackers(u).length<8;",
          tag='portal kalabalığı')
    patch("    offset+=(u._afPortalSlot===1?-1:1)*Math.min(px*.3,H*.03); // v3.40.55",
          "    offset+=((u._afPortalSlot%2)?-Math.ceil(u._afPortalSlot/2):u._afPortalSlot/2)*Math.min(px*.3,H*.03); // v3.60.305: 8 yuva üst/alt sırayla (v304 bandına sıkışır)",
          tag='yuva kayması')
    # 4) Kök neden (bir birim hep 0,004 geride): v3.60.67 üst üste binme önleme adımı aynı banttaki iki birimden
    #    sonra geleni her karede 0,004 geri itiyordu. Portal çizgisinde (yuvalarla dikeyde ayrılmış) uygulanmaz.
    patch("if(A._afSkeletonPack&&A._afSkeletonPack===B._afSkeletonPack)continue;if(Math.abs(band(A)-band(B))>=.5)continue;",
          "if(A._afSkeletonPack&&A._afSkeletonPack===B._afSkeletonPack)continue;if((A._afTower===1||B._afTower===1)&&Math.abs(A.x-af305Line(A))<.02&&Math.abs(B.x-af305Line(B))<.02)continue; /* v3.60.305 portal çizgisi */if(Math.abs(band(A)-band(B))>=.5)continue;",
          tag='portal çizgisinde geri itme yok')
    return html


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    h = open(src, encoding='utf-8').read()
    out = apply(h)
    open(dst, 'w', encoding='utf-8').write(out)
    print('v305 uygulandı', len(h.encode()), '->', len(out.encode()))
