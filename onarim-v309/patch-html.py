#!/usr/bin/env python3
from pathlib import Path
import base64
import hashlib

root = Path(__file__).resolve().parents[1]
path = root / "app/src/main/assets/www/index.html"
if b'<meta name="afp-build" content="v3.60.309">' in path.read_bytes()[:3_000_000]:
    raise SystemExit(0)
if hashlib.file_digest(path.open("rb"), "sha256").hexdigest() != "8edc9f610065d675c80cc767d3268c0335927dd0fbc94965a21f341f4242a10c":
    raise SystemExit("Önce v308 kurtarma tabanını oluştur.")
with path.open(encoding="utf-8", newline="") as file:
    html = file.read()

def replace(old, new):
    global html
    count = html.count(old)
    if count != 1:
        raise SystemExit(f"Beklenen tek eşleşme: {old[:90]!r}; bulunan: {count}")
    html = html.replace(old, new, 1)

# Preserve the original attack sheets and use the card's combat delivery for its basic effects.
replace("""function af323Style(u){
  const card=af290Unit(u);if(card)return card.delivery;""", """const AF309_MELEE_FX=Object.freeze({
  af37_alev_muhafizi:'punch',af37_ates_elementali:'punch',af37_buz_elementali:'punch',
  af37_dovus_ustasi_ii:'thrust',af37_agir_zirhli:'bash',
  af37_cuce_savasci:'smash',af37_lav_golemi:'smash',af37_kristal_golem:'smash',
  af37_tas_devi:'smash',afn_kok_titani:'smash',afn_kutup_kiricisi:'smash',
  afn_sicrayan_kocbasi:'bash',afn_toprak_yarici:'smash',afn_ocak_dovucusu:'smash',
  afn_mantar_davulcusu:'punch',afn_gece_yirticisi:'claw',afn_donuk_mizrakci:'thrust',
  afn_bulut_dalgici:'stab',afn_alize_bicakli:'stab',af37_golge_avcisi:'stab',
  af37_golge_suikastci:'stab',afn_zincir_kiran:'thrust'
});
function af309AttackStyle(u,artStyle){
  const card=af290Unit(u);
  if(!card)return artStyle;
  if(card.delivery==='melee')return AF309_MELEE_FX[card.id]||
    (['slash','stab','thrust','punch','bash','claw','smash'].includes(artStyle)?artStyle:'slash');
  return card.delivery==='shell'?'cast':card.delivery;
}
function af323Style(u){
  const card=af290Unit(u);if(card)return card.delivery==='melee'?
    af309AttackStyle(u,AF321_RIGS[af320Resolve(u).kind]?.atk):card.delivery;""")
replace("af37_alev_silahcisi: ['shooter',", "af37_alev_silahcisi: ['caster_shooter',")
replace("af37_muhendis_nisanci: ['archer',", "af37_muhendis_nisanci: ['gunner',")
replace("af37_zehirci: ['shooter',", "af37_zehirci: ['caster_shooter',")
replace("""  shooter:       ['bow',   .150, .01, .017, 0, 0, 1.31],""","""  caster_shooter:['cast',  .150, .01, .017, 0, 0, 1.31],
  gunner:        ['bullet',.155, .00, .016, 0, 0, 1.32],""")
replace("  const facing=st.fs>=0?1:-1,shooter=(rig.atk==='bow'||rig.atk==='cast')&&!shamanHeal;",
"""  const basicCard=af290Unit(u);
  const poseAttack=basicCard?.delivery==='melee'&& !['bow','cast'].includes(rig.atk)?rig.atk:af309AttackStyle(u,rig.atk);
  const facing=st.fs>=0?1:-1,shooter=(poseAttack==='bow'||poseAttack==='cast'||poseAttack==='bullet')&&!shamanHeal;
  const poseK=poseAttack===rig.atk?K:{...K,rig:{...rig,atk:poseAttack==='bullet'?'cast':poseAttack}};""")
replace("af285PoseEnv(u,env);const M=AF321.pose(K,st,env);if(u._af205Boss", "af285PoseEnv(u,env);const M=AF321.pose(poseK,st,env);if(u._af205Boss")
replace("const m=AF321.muzzlePoint(K,M,V);s.x0=", "const m=AF321.muzzlePoint(poseK,M,V);s.x0=")
replace("const tp=AF321.tipPoint(K,M,V),atk=rig.atk||'slash';","const tp=AF321.tipPoint(poseK,M,V),atk=poseAttack||'slash';")
replace("kind:style==='bow'?'arrow':'bolt',t0:elapsed", "kind:style==='bow'?'arrow':style==='bullet'?'bullet':'bolt',t0:elapsed")
replace("""  }else{
    const sprite=AFX.shot(p),r=Math.max(2.4""","""  }else if(p.kind==='bullet'){
    const streak=ctx.createLinearGradient(-18,0,3,0);
    streak.addColorStop(0,'transparent');streak.addColorStop(.76,'#d69342');streak.addColorStop(1,'#fff4cf');
    ctx.strokeStyle=streak;ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(3,0);ctx.stroke();
  }else{
    const sprite=AFX.shot(p),r=Math.max(2.4""")
replace(" const MAGE_FX={};",""" const MAGE_FX={
   af37_zehirci:['curse_mark','energy_orb_arcane'],
   afn_firtina_baglayici:['electric_sparks','energy_orb_arcane'],
   afn_buz_zurnacisi:['ice_ground','ice_bolt'],
   afn_kirik_saat_efendisi:['gold_runes','energy_orb_arcane'],
   af37_isik_sifacisi:['heal_glow','energy_orb_arcane'],
   af37_mavi_buyucu:['crystal_burst','energy_orb_arcane'],
 };
""")
replace("let key=style==='bow'?'sparks_light':style==='cast'||ranged?element(u)[0]:MELEE[style]||'slash_arc';",
"""let key=['bow','bullet'].includes(style)?'sparks_light':style==='cast'||ranged?element(u)[0]:MELEE[style]||'slash_arc';""")
replace("   if(u.heroType==='af37_golge_suikastci')key='sparks_light';\n","")
replace("""function af222IsMagic(u){return /mage|witch|priest|oracle|caller|shaman|druid|sifaci|buyucu|rahip|cagirici|nekromanci|healer|necro|wizard/.test(String(u.heroType||u.enemyType||''));}""",
"""function af222IsMagic(u){const card=af290Unit(u);return card?card.delivery==='cast':/mage|witch|priest|oracle|caller|shaman|druid|sifaci|buyucu|rahip|cagirici|nekromanci|healer|necro|wizard/.test(String(u.heroType||u.enemyType||''));}""")

# Sancak victory text lacks the word Bayrak. This is an objective finish even if both portals stand.
replace("if(forfeitWin&&!finalSaysLoss){const rewarded=x.rewardsEnabled===true&&!c.suspect;finish('win','',rewarded?'rewarded':'confirmed',{reason:'forfeit',block:x.rewardBlock||null,note:rewarded?'':rewardNote(x.rewardBlock,c)});return true;}",
"if(forfeitWin&&!finalSaysLoss){finish('win','','confirmed',{reason:'forfeit',block:x.rewardBlock||null,note:rewardNote(x.rewardBlock||'unranked_forfeit',c)});return true;}")
replace("if(/bayrak/i.test(t))return 'flags';", "if(ctx()?.modeId==='flag'&&/bayrak|sancak/i.test(t))return 'flags';")
replace("const REWARD_NOTES={friendly:", """const REWARD_NOTES={
  unranked_guest:'Kupa ve ödül için iki oyuncunun da hesabına giriş yapması gerekiyor.',
  unranked_database_unavailable:'Maç kaydı veritabanına yazılamadı.',
  trophy_authority_disabled:'Sunucu kupa kaydını kapalı bildirdi.',
  rpc_error:'Kupa kaydı sırasında sunucu veritabanına ulaşamadı.',
  settle_unavailable:'Kupa işlemi zamanında doğrulanamadı. Güncel kupanı sıralamadan kontrol et.',
  unranked_forfeit:'Bu bağlantı kesilmesi kupa defterine işlenmedi.',
  same_pair_cap:'Aynı rakibe karşı günlük kupa sınırı doldu.',
  daily_gain_cap:'Günlük kupa kazanma sınırı doldu.',
  short_match:'Maç kupa için gereken süreyi tamamlamadı.',
  friendly:""")
replace("return 'Sunucu bu maç için ödül onayı vermedi.';}", "return b?'Ödül reddedildi ('+b.slice(0,70)+').':'Sunucu ödül onayı vermedi.';}")
replace("function grantProgression(outcome){", "function grantProgression(outcome,trophy=null){")
replace("""  const cupDelta=af35TrophyDelta(win,isDraw); // v3.35.0: duel is the offline ranked path; training gives no trophies
  profile.trophies=Math.max(0,cupsBefore+cupDelta);
  const cupActual=profile.trophies-cupsBefore;""",
"""  if(trophy)profile.trophies=trophy.after;
  else profile.trophies=Math.max(0,cupsBefore+af35TrophyDelta(win,isDraw));
  const cupActual=trophy?trophy.delta:profile.trophies-cupsBefore;""")
replace("const af263RoadBefore=Math.max(0,+profile.credits||0);\n  const milestoneGains=(gameMode==='tower'||gameMode==='campaign'||gameMode==='boss'||af36IsCustom(gameMode))?[]:settleTrophyRewards();","const af263RoadBefore=Math.max(0,+profile.credits||0);\n  const milestoneGains=(gameMode==='tower'||gameMode==='campaign'||gameMode==='boss'||af36IsCustom(gameMode)&&!trophy)?[]:settleTrophyRewards();")
replace(":grantProgression(isDraw?null:won);", ":grantProgression(isDraw?null:won,options.__serverTrophy||null);")
replace("if(!options.__afpGuildRaid)afpSeRecord", "if(!options.__afpGuildRaid&&(!options.__onlineAuthoritative||!options.suppressRewards))afpSeRecord")
replace("""      const opts={__onlineAuthoritative:true,__afpOnlineState:''};""",
"""      const opts={__onlineAuthoritative:true,__afpOnlineState:'',__serverTrophy:info?.trophy||null};
      if(st==='rewarded'&&ctx?.matchId){
        const settled=profile.afpSettledOnlineMatchesV1;
        if((Array.isArray(settled)&&settled.includes(ctx.matchId))||info?.duplicate){
          opts.suppressRewards=true;opts.__rewardNote='Bu maçın kupa ve ödül kararı daha önce işlendi.';
        }else profile.afpSettledOnlineMatchesV1=[...(Array.isArray(settled)?settled:[]).slice(-127),ctx.matchId];
      }""")
# Wait for the database receipt on v308 Render too, using the existing trophy_update frame.
start=html.index(" /* v3.60.241: sunucu kupa otoritesi")
stop=html.index(" const finishUnverified",start)
html=html[:start]+""" function acceptTrophy(c,x){
  if(!c||!x||x.authoritative!==true||String(x.roomId||x.matchId||'')!==String(c.matchId))return false;
  if(!c.confirmedOutcome){c.trophyStash=x;return true;}
  if(c.resultApplied)return false;
  const {out,extra,enabled}=c.confirmedOutcome;
  const after=x.after,delta=x.delta;
  const valid=x.ok===true&&Number.isInteger(after)&&after>=0&&after<=20000&&Number.isInteger(delta);
  if(valid&&x.duplicate===true){
    // A repeated receipt carries the historical balance, which may predate later matches.
    finish(out,'','confirmed',{...extra,note:'Bu maç kupa defterinde daha önce işlendi.'});
    window.dispatchEvent(new Event('afp:trophies-changed'));
    return true;
  }
  const paid=valid&&enabled&&!c.suspect;
  finish(out,'',paid?'rewarded':'confirmed',paid?{...extra,trophy:{after,delta}}:
    {...extra,note:rewardNote(x.reason||extra.block||'settle_unavailable',c)});
  if(valid)window.dispatchEvent(new Event('afp:trophies-changed'));
  return true;
 }
 function onTrophyUpdate(x){return acceptTrophy(ctx(),x);}
"""+html[stop:]
replace("clearMarker();leaveSoon(c.trophyPending?6500:400);\n  try{if(c.trophyStash){const t=c.trophyStash;c.trophyStash=null;applyTrophyUpdate(c,t);}}catch(_){}", "clearMarker();leaveSoon(400);")
replace("""  const rewarded=x.rewardsEnabled===true&&!c.suspect; /* v3.60.71: ödül yalnız sunucu bu koltuk için açtıysa ve bu cihaz şüphe görmediyse */
  finish(out,'',rewarded?'rewarded':'confirmed',{reason:String(fr.resultReason||x.resultReason||''),ot:/uzatma/i.test(String(fr.text||'')),ftext:String(fr.text||''),block:x.rewardBlock||null,note:rewarded?'':rewardNote(x.rewardBlock,c)});""",
"""  const extra={reason:String(fr.resultReason||x.resultReason||''),ot:/uzatma/i.test(String(fr.text||'')),ftext:String(fr.text||''),block:x.rewardBlock||null};
  c.confirmedOutcome={out,extra,enabled:x.rewardsEnabled===true};
  if(acceptTrophy(c,x.trophy||c.trophyStash))return;
  if(x.trophyPending===true){verifyingUI();armVerifyTimer(c);return;}
  finish(out,'','confirmed',{...extra,note:rewardNote(x.rewardBlock||(x.rewardsEnabled?'trophy_authority_disabled':''),c)});""")
replace("""c.verifyTimer=setTimeout(()=>finishUnverified('Sunucu sonucu '+(VERIFY_MS/1000)+' saniye içinde doğrulamadı. Sonuç geçersiz; kupa/ödül yok.'),VERIFY_MS);""",
"""c.verifyTimer=setTimeout(()=>{
  if(c.confirmedOutcome){const {out,extra}=c.confirmedOutcome;finish(out,'','confirmed',{...extra,note:rewardNote('settle_unavailable',c)});}
  else finishUnverified('Sunucu sonucu '+(VERIFY_MS/1000)+' saniye içinde doğrulamadı. Kupa/ödül onayı alınamadı.');
 },VERIFY_MS);""")
# Retain the reconnect budget while waiting for the final report. Retransmission is idempotent on the server.
replace("c.reconnecting=true;note('reconnecting',{});", "c.reconnecting=true;if(c.verifyTimer){clearTimeout(c.verifyTimer);c.verifyTimer=null;}note('reconnecting',{});")
replace("if(c.final&&!c.resultApplied&&!c.resultReported)reportResult(c.final);", "if(c.final&&!c.resultApplied){c.resultReported=false;reportResult(c.final);armVerifyTimer(c);}")
replace("if(snap&&c.authority&&k){try{snap.final=final;", "if(snap&&c.authority&&k){c.finalSnapshot=snap;try{snap.final=final;")
replace("c.resultReported=false;reportResult(c.final);armVerifyTimer(c);", """if(c.authority&&c.finalSnapshot&&!c.confirmedOutcome){
   try{conn()?.sendBattleState(c.finalSnapshot);}catch(_){}
  }
  c.resultReported=false;reportResult(c.final);armVerifyTimer(c);""")

replace("  let c;\n  try{c=API.connect(id,", '''  if(queueOptions.__fresh&&API.sessionNeedsRefresh?.()&&API.isGuest?.()){
   terminal=true;endSession();stopClock();
   setStatus('Hesap oturumu yenilenemedi. Hesabına yeniden giriş yap ve tekrar dene.','OTURUM YENİLENEMEDİ','done');
   offerChoices(id,requestedEngine,['retry','cancel'],'OTURUM YENİLENEMEDİ');return true;
  }
  let c;
  try{c=API.connect(id,''')
# Social RPC uses existing authenticated routes. Reject late responses after an account switch.
social_start=html.index("async function rpc(name,args,retried){")
social_end=html.index("/* ---------- oyundan okunan",social_start)
social_rpc=html[social_start:social_end].replace(" if(res.ok)return data;"," if(readSession()?.user.id!==s.user.id)throw fail('STALE');\n if(res.ok)return data;")
html=html[:social_start]+social_rpc+html[social_end:]
replace("function showErr(e){", "function showErr(e){if(e?.code==='STALE')return;") 
replace(" me=r;meUid=String(s.user.id);trophySeed(meUid);return me;", " me=r;meUid=String(s.user.id);await trophySeed(meUid);return me;")
replace("await rpc('afp_trophy_seed_me',{p_claimed:t});localStorage.setItem(k,'1');",
"""const row=await rpc('afp_trophy_seed_me',{p_claimed:t});localStorage.setItem(k,'1');
  if(meUid===uid&&Number.isInteger(row?.trophies))me.trophies=row.trophies;""")
replace("let dmWith=null,dmRows=[],dmLast=0,dmLoading=false;", "let dmWith=null,dmRows=[],dmLast=0,dmGeneration=0,dmFlight=null;")
replace("worldLast=0,worldLoaded=false;","worldLast=0,worldLoaded=false,worldGeneration=0,worldFlight=null;")
a=html.index("async function openDm(uid){")
b=html.index("/* ---- dünya sohbeti ---- */",a)
html=html[:a]+"""async function openDm(uid){
 const f=state&&state.friends.find(x=>x.user_id===uid);if(!f)return;
 dmWith=f;dmGeneration++;tab='dm';renderShell();renderConvs();
 const box=$('#dmMsgs');clear(box);box.appendChild(el('div','empty',T.loading));dmRows=[];dmLast=0;
 await pollDm(true);
 schedule();
 try{if(matchMedia('(pointer:fine)').matches)$('#dmForm input').focus();}catch(_){}
}
async function pollDm(reset=false){
 const f=dmWith;if(!f)return;
 const generation=dmGeneration;
 if(dmFlight?.generation===generation)return dmFlight.promise;
 const request={generation};
 request.promise=(async()=>{
  try{
   const rows=await rpc('afp_dm_fetch',{p_with:f.user_id,p_after:dmLast,p_limit:60});
   if(dmGeneration!==generation||dmWith?.user_id!==f.user_id)return;
   appendDm(Array.isArray(rows)?rows:[],reset);
   const current=state?.friends.find(x=>x.user_id===f.user_id);
   if(current&&+current.unread>0){state.unread=Math.max(0,(+state.unread||0)-(+current.unread||0));current.unread=0;renderShell();renderConvs();updateBadge();}
  }catch(e){if(dmGeneration===generation&&dmWith?.user_id===f.user_id){if(reset)clear($('#dmMsgs'));if(reset||e.code!=='NET')showErr(e);}}
  finally{if(dmFlight===request)dmFlight=null;}
 })();
 dmFlight=request;return request.promise;
}
async function onSendDm(ev){
 ev.preventDefault();if(!dmWith||busy)return;
 const generation=dmGeneration,uid=dmWith.user_id,inp=$('#dmForm input'),body=inp.value.trim();
 if(!body)return;
 busy=true;const btn=$('#dmForm button');btn.disabled=true;
 try{
  await rpc('afp_dm_send',{p_to:uid,p_body:body});
  if(dmGeneration!==generation||dmWith?.user_id!==uid)return;
  if(inp.value.trim()===body)inp.value='';
  // Keep the cursor on the ordered read path. A send response can jump over unread messages.
  await pollDm();await pollDm();
 }catch(e){if(dmGeneration===generation&&dmWith?.user_id===uid)showErr(e);}
 finally{busy=false;btn.disabled=!dmWith;}
}

"""+html[b:]
a=html.index("async function loadWorld(reset){")
b=html.index("/* ---- oyuncu işlemleri penceresi ---- */",a)
html=html[:a]+"""async function loadWorld(reset){
 const ch=worldCh;
 if(reset){
  worldGeneration++;worldLoaded=false;const box=$('#wMsgs');clear(box);
  box.appendChild(el('div','empty',T.loading));worldRows=[];worldLast=0;
 }
 const generation=worldGeneration;
 if(worldFlight?.generation===generation)return worldFlight.promise;
 const request={generation};
 request.promise=(async()=>{
  try{
   const rows=await rpc('afp_world_fetch',{p_channel:ch,p_after:worldLast,p_limit:reset?50:40});
   if(generation!==worldGeneration||ch!==worldCh)return;
   appendWorld(Array.isArray(rows)?rows:[],reset);worldLoaded=true;
  }catch(e){
   if(generation===worldGeneration&&ch===worldCh){
    if(reset)clear($('#wMsgs'));
    if(reset||e.code!=='NET')showErr(e);
   }
  }finally{if(worldFlight===request)worldFlight=null;}
 })();
 worldFlight=request;return request.promise;
}
async function onSendWorld(ev){
 ev.preventDefault();if(busy)return;
 const ch=worldCh,generation=worldGeneration,inp=$('#wForm input'),body=inp.value.trim();
 if(!body)return;
 busy=true;const btn=$('#wForm button');btn.disabled=true;
 try{
  await rpc('afp_world_send',{p_channel:ch,p_body:body});
  if(ch!==worldCh||generation!==worldGeneration)return;
  if(inp.value.trim()===body)inp.value='';
  await loadWorld(false);await loadWorld(false);
 }catch(e){if(ch===worldCh&&generation===worldGeneration)showErr(e);}
 finally{busy=false;btn.disabled=false;}
}

"""+html[b:]
replace("&&openFlag&&!gate&&worldLoaded)loadWorld(false)", "&&openFlag&&!gate)loadWorld(false)")
replace("baseline=null;dmWith=null;worldLoaded=false;rankCache.world", "baseline=null;dmWith=null;dmGeneration++;worldGeneration++;worldRows=[];worldLast=0;worldLoaded=false;rankSeq++;rankCache.world")
replace(""" try{let d=null;
  if(scope==='world'){try{d=await rpc('afp_trophy_leaderboard',{p_limit:50});}catch(e0){if(!(e0&&e0.code==='SETUP'))throw e0;}}
  if(!d)d=await rpc('afp_leaderboard',{p_scope:scope,p_limit:50});if(seq!==rankSeq&&scope!==rankScope)return;rankCache[scope]=d||{rows:[]};rankAt[scope]=Date.now();}
 catch(e){
  if(e&&e.code==='SETUP')""",
""" try{
  const d=scope==='world'?await rpc('afp_trophy_leaderboard',{p_limit:50}):
   await rpc('afp_leaderboard',{p_scope:scope,p_limit:50});
  if(seq!==rankSeq)return;
  if(!d||!Array.isArray(d.rows))throw fail('SERVER');
  rankCache[scope]=d;rankAt[scope]=Date.now();
 }catch(e){
  if(seq!==rankSeq||e?.code==='STALE')return;
  if(e&&e.code==='SETUP')""")
replace(""" window.addEventListener('afp:mode-battle-start',()=>{if(openFlag)close();});""",
""" window.addEventListener('afp:mode-battle-start',()=>{if(openFlag)close();});
 window.addEventListener('afp:trophies-changed',()=>{
  rankAt.world=rankAt.friends=0;
  if(openFlag&&tab==='rank'&&!gate)void loadRank(true);
 });
 window.addEventListener('online',()=>{if(openFlag&&!gate)void onTab();});""")

# Inline the existing artwork for a standalone web build.
art = base64.b64encode((root / "app/src/main/assets/launch/war-arena.webp").read_bytes()).decode()
style = """<style id="af309-boot-css">
#af309-boot{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:end center;
  background:linear-gradient(0deg,#090c17 0%,#090c17b8 24%,transparent 65%),#101621 url(DATA) center/cover no-repeat;
  color:#fff1d8;text-align:center;font:600 14px system-ui,sans-serif}
#af309-boot[hidden]{display:none}
#af309-boot > div{width:min(350px,78vw);padding-bottom:max(22px,env(safe-area-inset-bottom))}
#af309-boot strong{display:block;font-size:clamp(18px,4vw,29px);letter-spacing:.11em;color:#ffe3a5;text-shadow:0 2px 6px #030407}
#af309-boot p{margin:6px 0 8px}
#af309-boot progress{display:block;width:100%;height:7px;accent-color:#f2be64}
</style>""".replace("DATA","data:image/webp;base64,"+art)
replace('<head>\n<meta charset="utf-8">','<head>\n<meta charset="utf-8">\n'+style)
replace("<body>", """<body>
<section id="af309-boot" role="status" aria-live="polite">
 <div><strong>ARENA FORGE PRO</strong><p>Oyun dosyaları yükleniyor…</p><progress aria-label="Oyun yükleme durumu" max="3"></progress></div>
</section>
<script>
document.addEventListener('DOMContentLoaded',()=>{
 const boot=document.getElementById('af309-boot'),bar=boot.querySelector('progress'),label=boot.querySelector('p');
 bar.value=2;label.textContent='Ana üs hazırlanıyor…';
 requestAnimationFrame(()=>{
  requestAnimationFrame(()=>{
   if(!window.AFPModeNetworkV1||!window.__AF39){
    label.textContent='Oyun açılamadı. Yeniden denemek için dokun.';
    boot.tabIndex=0;boot.setAttribute('role','button');boot.onclick=()=>location.reload();
    boot.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')location.reload();};
    bar.hidden=true;return;
   }
   bar.value=3;boot.hidden=true;window.afp309BootReady=true;
  });
 });
},{once:true});
</script>""")
# Normalize only actual application version fields, keeping the WebSocket wire build.
with path.open("w", encoding="utf-8", newline="") as file:
    file.write(html)
