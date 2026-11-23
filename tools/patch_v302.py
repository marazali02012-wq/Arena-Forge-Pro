#!/usr/bin/env python3
"""Arena Forge Pro v302: only WSS trust, locked-card labels, five 16-frame VFX.
Use: python tools/patch_v302.py app/src/main/assets/www/index.html
Idempotent: the v302 marker prevents applying twice. Exits on any unexpected source drift.
"""
import base64, json, sys
from pathlib import Path

MARK='AFP_V302_TRIPLE_FIX_20261123'
TRUSTED='wss://arena-forge-online-server.onrender.com/ws'

def apply(html:str, assets:dict)->str:
    if MARK in html:
        print('Already patched:',MARK)
        return html
    def patch(old,new,expected=1,tag=''):
        nonlocal html
        n=html.count(old)
        if n!=expected:raise RuntimeError(f"{tag or 'patch'}: expected {expected} matches, got {n}")
        html=html.replace(old,new)
    # 1) Network: hard-code the sole current production Render endpoint. Saved URLs can no longer override it.
    patch("  let serverUrl=String(window.AFP_MODE_NET_WS_URL||'').trim();\n  if(!serverUrl){try{serverUrl=String(localStorage.getItem('afpOnlineWsUrlV1')||'').trim();}catch(_){}}\n  if(!serverUrl)serverUrl='wss://arena-forge-online-server.onrender.com/ws';\n  if(serverUrl)window.AFP_MODE_NET_WS_URL=serverUrl;",
      "  const TRUSTED_WS_URL='wss://arena-forge-online-server.onrender.com/ws'; // "+MARK+"\n  let serverUrl=TRUSTED_WS_URL;\n  window.AFP_MODE_NET_WS_URL=TRUSTED_WS_URL;\n  try{localStorage.removeItem('afpOnlineWsUrlV1');}catch(_){}",
      tag='trusted server init')
    old="""  function normalizeServerUrl(value){
    let u;
    try{u=new URL(String(value||''));}catch(_){throw new Error('Render adresini https://... biçiminde gir.');}
    if(u.protocol==='https:')u.protocol='wss:';
    else if(u.protocol==='http:')u.protocol='ws:';
    if(!['ws:','wss:'].includes(u.protocol))throw new Error('Sunucu adresi https:// veya wss:// olmalı.');
    const local=['localhost','127.0.0.1','::1'].includes(u.hostname);
    if(u.protocol==='ws:'&&!local)throw new Error('İnternet sunucusu wss:// kullanmalı.');
    u.pathname='/ws';u.hash='';u.search='';
    return u.toString();
  }
  function configure(url){serverUrl=normalizeServerUrl(url);window.AFP_MODE_NET_WS_URL=serverUrl;try{localStorage.setItem('afpOnlineWsUrlV1',serverUrl);}catch(_){}return serverUrl;}"""
    new="""  function normalizeServerUrl(value){
    let u;
    try{u=new URL(String(value||''));}catch(_){throw new Error('Çevrim içi sunucu adresi geçersiz.');}
    if(u.protocol==='https:')u.protocol='wss:';
    if(u.protocol!=='wss:'||u.hostname!=='arena-forge-online-server.onrender.com'||
       u.port||u.username||u.password||u.search||u.hash||!['/ws','/ws/','/'].includes(u.pathname))
      throw new Error('Güvenlik: yalnızca resmi Arena Forge sunucusuna bağlanılabilir.');
    return TRUSTED_WS_URL;
  }
  function configure(url){serverUrl=normalizeServerUrl(url);window.AFP_MODE_NET_WS_URL=TRUSTED_WS_URL;return serverUrl;}"""
    patch(old,new,tag='server URL allowlist')
    patch("  function connect(modeId,options={}){\n    if(!serverUrl)throw new Error('Çevrim içi sunucu adresi henüz yapılandırılmadı.');",
          "  function connect(modeId,options={}){\n    if(serverUrl!==TRUSTED_WS_URL)throw new Error('Güvenilmeyen çevrim içi sunucu engellendi.');",
          tag='handshake destination guard')
    # 2) Remove both user-facing server editors. Preserve queue, matchmaking, and local bot fallback exactly as is.
    start=html.index(' function showServerEditor(){')
    end=html.index('\n let session=null',start)
    to_remove=html[start:end]
    patch(to_remove,' /* '+MARK+': production server editor removed; connection is pinned in network layer. */\n',tag='server editor')
    patch('<button id="afpMOQServerEdit" type="button">SUNUCU</button>','',tag='server editor button')
    patch("  overlay.querySelector('#afpMOQServerEdit').addEventListener('click',showServerEditor);\n",'',tag='server editor listener')
    start=html.index('  if(!url){\n   setStatus(\'Render sunucu adresini gir.')
    end=html.index('\n  if(!hasSession){',start)
    old=html[start:end]
    patch(old,"  if(!url){\n   terminal=true;stopClock();\n   setStatus('Resmî çevrim içi sunucuya erişilemiyor. Daha sonra tekrar dene.','Sunucu bağlantısı yok','done');\n   return true;\n  }",tag='missing server editor')
    # 3) Locked minions: required==0 means first chest drop unlocks, not 0 shards.
    patch("meta.textContent=unlocked?'SV '+level+' · AÇIK':'SV '+level+' · '+shards+'/'+required+' parça';",
          "meta.textContent=unlocked?'SV '+level+' · AÇIK':required>0?'SV '+level+' · '+shards+'/'+required+' parça':'KİLİTLİ · SANDIK';",tag='locked meta')
    patch("frag.textContent=unlocked?'Parça: '+shards:'Açmak için '+Math.max(0,required-shards)+' parça';",
          "frag.textContent=unlocked?'Parça: '+shards:required>0?'Açmak için '+Math.max(0,required-shards)+' parça':'Sandıktan kazanarak açılır';",tag='locked card detail')
    patch("fragEl.textContent=opened?'Parça: '+frags:'Açmak için '+Math.max(0,required-frags)+' parça';",
          "fragEl.textContent=opened?'Parça: '+frags:required>0?'Açmak için '+Math.max(0,required-frags)+' parça':'Sandıktan kazanarak açılır';",tag='profile UI locked detail')
    # 4) VFX registered BEFORE AF285_LIBKEYS snapshot, not after it. 4x4 160x160 transparent WebP atlases.
    maps=[('fx_302_ice','ice_crack'),('fx_302_forge','forge_spark'),('fx_302_ram','ram_impact'),('fx_302_earth','earth_rise'),('fx_302_hook','chain_hook')]
    registrations='/* AFP v302: five distinct 16-frame effect atlases. No minion or combat-stat changes. */\n'
    for key,kind in maps:
        if kind not in assets:raise RuntimeError('Missing atlas '+kind)
        registrations+=f"AF285_FXLIB.{key}={{meta:{{cols:4,rows:4,fw:160,fh:160,ground:0.8,center:0.5}},src:'data:image/webp;base64,{assets[kind]}',img:null}};\n"
    patch('var AF285_LIBKEYS=Object.keys(AF285_FXLIB);',registrations+'var AF285_LIBKEYS=Object.keys(AF285_FXLIB);',tag='sprite registration')
    patch("af285LibEmit(u,'fx_ice_slash',u.x+dir*.045,u.lane,.56,2,11,1.48);",
          "af285LibEmit(u,'fx_302_ice',u.x+dir*.045,u.lane,.72,0,15,1.55);",tag='ice cast')
    patch("af285LibEmit(u,'fx_fire_shield',u.x,u.lane,.56,4,11,1.37);",
          "af285LibEmit(u,'fx_302_forge',u.x,u.lane,.72,0,15,1.37);",tag='forge cast')
    patch("af285LibEmit(u,'fx_earth_burst',u.x,u.lane,.64,0,11,1.47);",
          "af285LibEmit(u,'fx_302_ram',u.x,u.lane,.72,0,15,1.47);",tag='ram impact')
    patch("af285LibEmit(u,'fx_earth_burst',u.x,u.lane,.68,1,11,1.38);",
          "af285LibEmit(u,'fx_302_earth',u.x,u.lane,.80,0,15,1.44);",tag='earth impact')
    patch("    af285PullStart(u,t,.32,af285HookStrike);",
          "    af285LibEmit(u,'fx_302_hook',t.x,t.lane,.65,0,15,1.40);\n    af285PullStart(u,t,.32,af285HookStrike);",tag='hook contact')
    return html

if __name__=='__main__':
    p=Path(sys.argv[1] if len(sys.argv)>1 else 'app/src/main/assets/www/index.html')
    assets_file=Path(__file__).with_name('v302_vfx.json')
    assets=json.loads(assets_file.read_text())
    original=p.read_text(encoding='utf-8')
    edited=apply(original,assets)
    p.write_text(edited,encoding='utf-8')
    print('Patched',p,'bytes',len(original.encode()),'->',len(edited.encode()))