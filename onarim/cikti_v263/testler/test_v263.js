'use strict';
// v3.60.263 regresyon testleri. Kullanım: node test_v263.js <ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html>
// Gerçek HTML'den ilgili kodu çıkarıp vm içinde çalıştırır. Tarayıcı/oynanış testi DEĞİLDİR.
const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict');
const file = process.argv[2];
if (!file) { console.error('Kullanım: node test_v263.js <html>'); process.exit(2); }
const html = fs.readFileSync(file, 'utf8');
const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, status: 'GEÇTİ' }); console.log('GEÇTİ', name); }
  catch (err) { results.push({ name, status: 'KALDI', err: String(err) }); console.log('KALDI', name, String(err)); process.exitCode = 1; }
}
const count = n => html.split(n).length - 1;
const once = n => assert.equal(count(n), 1, n.slice(0, 70) + ' -> ' + count(n) + ' kez');

// ---------- sürüm
test('Sürüm etiketi v3.60.263', () => { once('<meta name="afp-build" content="v3.60.263" />'); assert.ok(html.includes('<title>Arena Forge Pro v3.60.263')); });

// ---------- v3.60.262 düzeltmeleri korunuyor
const SEL = 'html.afx369:not(#_1):not(#_2):not(#_3) #afxModeScreen.af219-mode[data-mode]:not([data-mode="colossus"]) .afx-pageR';
test('[262] Hikâye Seferi paneli güvenli ortalama', () => { once(SEL + ' {justify-content:flex-start;'); once(SEL + '>:first-child{margin-top:auto!important;}'); });
test('[262] Sancak skor kutusu gizli + olayda skor görünür', () => { once('.af36-flag-hud{display:none!important;'); once('#battleProStrip.notice-active[data-af262-flag]>#battleProMode{display:block!important}'); });
const lab = html.match(/function af36ModeLabel\(\)\{if\(gameMode==='sky'\)[\s\S]*?return '';\}/g).find(x => x.includes('⚑'));
test('[262] Sancak şerit etiketi skor + hedef', () => { const c = { gameMode: 'flag', af36Run: { flags: { score: { ally: 26.7, enemy: 5.2 } } }, AF36_FLAG_TARGET: 90 }; vm.createContext(c); vm.runInContext(lab, c); assert.equal(c.af36ModeLabel(), '⚑ BAYRAK · 26-5 / 90'); });
test('[262] Gizli suikastçı: yalnız dost %42 saydam', () => {
  const dh = html.match(/function drawHero\(u\)\{[\s\S]*?\n  const R=af320Resolve\(u\)/)[0].replace(/\n  const R=af320Resolve\(u\)$/, '\n  DRAWN.push({team:u.team,alpha:ctx.globalAlpha});\n}');
  const env = { gameMode: 'arena', playing: true, elapsed: 10, DRAWN: [], window: {}, ctx: { globalAlpha: 1, _s: [], save() { this._s.push(this.globalAlpha); }, restore() { this.globalAlpha = this._s.pop(); } }, af3410HasSoleInvisibility: u => u.heroType === 'af37_golge_suikastci', af36DrawBossArtwork: () => false };
  vm.createContext(env); vm.runInContext(dh, env);
  env.drawHero({ team: 'ally', heroType: 'af37_golge_suikastci', isRoster: true }); env.drawHero({ team: 'enemy', heroType: 'af37_golge_suikastci', isRoster: true });
  assert.equal(env.DRAWN.length, 1); assert.equal(env.DRAWN[0].team, 'ally'); assert.ok(Math.abs(env.DRAWN[0].alpha - .42) < 1e-9); assert.equal(env.ctx.globalAlpha, 1);
});
test('[262] Koleksiyon sekmesi 49', () => once("['normal','YENİ KARAKTERLER (49)']"));
test('[260] Savaş sonu bloğu ve Yankı boss kuralı korunuyor', () => {
  once('{const enemyDown=enemySharedHP<=0,portalsDown=allySharedHP<=0,castleDown=baseHP<=0,allyDown=castleDown||portalsDown;');
  once("const echoBossPending=gameMode==='echo'&&af203Run?.active&&!af203Run.bossDefeated;");
});

// ---------- A) pes = mağlubiyet
const rb = html.match(/function af328RecordBattle\(outcome,af263Opt\)\{\n[\s\S]*?\n\}\n/);
test('A: af328RecordBattle — pes kaydı istatistiğe yazar, görev ilerlemesine yazmaz', () => {
  assert.ok(rb, 'af328RecordBattle bulunamadı');
  const mk = () => ({ stats: { battles: 0, wins: 0, losses: 0, draws: 0, kills: 0, damage: 0, towerDamage: 0, portalsDestroyed: 0, abilities: 0, cards: 0, seconds: 0, cmdDowns: 0, enemyCmdDowns: 0, flawless: 0, heroes: {} }, weekly: { progress: { battles: 0, wins: 0, abilities: 0, portals: 0 } }, history: [] });
  const P = mk();
  const env = { P, af328P: () => P, matchStats: { kills: 2, spells: 1, deployed: 3, unitDamage: {} }, enemySharedHP: 100, allySharedHP: 50, allyTowerMax: 430, elapsed: 30, MATCH_DURATION: 180, gameMode: 'tower', profile: { trophies: 0, towerFloor: 3 }, HERO_INFO: {}, af327S: null, af327E: null, af328Pending: null, console };
  vm.createContext(env); vm.runInContext(rb[0], env);
  env.af328RecordBattle(false, { noQuest: true });
  assert.equal(P.stats.battles, 1); assert.equal(P.stats.losses, 1); assert.equal(P.history[0].res, 'L');
  assert.deepEqual(P.weekly.progress, { battles: 0, wins: 0, abilities: 0, portals: 0 }, 'pes görev ilerlemesine yazıldı');
  env.af328RecordBattle(false);   // normal yenilgi görev ilerlemesine yazar (eski davranış)
  assert.equal(P.weekly.progress.battles, 1); assert.equal(P.stats.losses, 2);
});
const fr = (html.match(/af263ForfeitRef=function\(step,ctx,pen\)\{[\s\S]*?\n\};\n/) || [''])[0];
test('A: pes kaydedici — çevrim içi, eğitim, Yankı ve Lonca hariç; maç başına bir kez', () => {
  assert.ok(fr.length > 500, 'kaydedici bulunamadı');
  for (const k of ["online&&online.active&&!online.localBot", "window.__AFPCommunityGuildRaidActive", "window.__afpFtueBattle", "af35MatchKind==='training'", "gameMode==='echo'", "id===af263ForfeitLastId", "ctx.id===af263ForfeitLastId"]) assert.ok(fr.includes(k), 'eksik koşul: ' + k);
  assert.ok(!/profile\.battles\s*=|profile\.battles\+\+/.test(fr), 'profile.battles artırılmamalı (meydan okuma ödülü sömürüsü)');
  assert.ok(fr.includes("af328RecordBattle(false,{noQuest:true})"));
  assert.ok(fr.includes("afpApplyModeSpecificRewardV37858(ctx.mode,false,false,ctx.stage)"));
  assert.ok(fr.includes("af35AfterMatchRef(false,false,notes)"), 'Gizli Bölge yol sıfırlaması eksik');
});
test('A: çıkış akışı bağlamı endGame öncesi yakalar, ödülsüz bitirir, sonra kaydeder', () => {
  once("let af263Ctx=null;if(forfeited){try{af263Ctx=af263ForfeitRef&&af263ForfeitRef('capture');}");
  once("{suppressRewards:true,forfeit:true});\n  if(forfeited&&af263Ctx&&!playing){try{af263ForfeitRef('record',af263Ctx,af35Pen);}");
});

// ---------- F) kupa yolu kredisi
test('F: kupa yolu kredisi ödül satırına yazılır (gerçek eklenen miktar)', () => {
  once("const af263RoadBefore=Math.max(0,+profile.credits||0);");
  once("{const af263Road=Math.max(0,+profile.credits||0)-af263RoadBefore;if(af263Road>0)milestoneGains.unshift('KUPA YOLU +'+af263Road+' KREDİ');}");
});

// ---------- D) ödül simgeleri
const d = html.match(/function af263ShardHero\(a,b\)\{[\s\S]*?\nfunction tileArt\(k\)\{[\s\S]*?return ART\[k\]\|\|ART\.card;\}/);
test('D: kahraman parçası = o kahramanın portresi, eşya = yuva simgesi, yedekler', () => {
  assert.ok(d, 'simge kodu bulunamadı');
  const pack = { 'commander.portrait.valen': 'P'.repeat(300), 'equipment.helmet': 'H'.repeat(300), 'equipment.sword': 'S'.repeat(300) };
  const env = { window: { AFArt: { get: k => pack[k] || '' }, AFQChestArt: t => 'CHEST:' + t }, AFP224_ART: { shard: 'SHARD' }, ART: { gear: 'GEAR', card: 'CARD', coins: 'COINS' }, num: v => Number(v) || 0 };
  vm.createContext(env); vm.runInContext(d[0] + '\nthis.f={tileArt,af263ShardHero,af263NewItemSlot};', env);
  const { tileArt, af263ShardHero, af263NewItemSlot } = env.f;
  const a = { af332: { heroes: { ruul: { shards: 1 }, valen: { shards: 0 } }, items: [{ id: 'H1', slot: 'main' }] } };
  const b = { af332: { heroes: { ruul: { shards: 1 }, valen: { shards: 4 } }, items: [{ id: 'H1', slot: 'main' }, { id: 'H2', slot: 'head' }] } };
  assert.equal(af263ShardHero(a, b), 'valen'); assert.equal(af263NewItemSlot(a, b), 'head');
  assert.equal(tileArt('hshard:valen'), pack['commander.portrait.valen']);
  assert.equal(tileArt('hitem:head'), pack['equipment.helmet']);
  assert.equal(tileArt('hitem:'), pack['equipment.sword'], 'yuva bilinmiyorsa kılıç');
  assert.equal(tileArt('hshard:yok'), 'SHARD', 'portre yoksa parça simgesi');
  assert.equal(tileArt('coins'), 'COINS'); assert.equal(tileArt('chest:epic'), 'CHEST:epic');
  assert.ok(!html.includes("T.push(['gear','Kahraman parçası'") && !html.includes("T.push(['gear','Kahraman eşyası'"));
});

// ---------- C) tekrar gömülü görseller
test('C: 7 tekrar görsel tek kopya; yer tutucu dışında birebir tekrar yok', () => {
  const rx = /data:image\/webp;base64,([A-Za-z0-9+/=]{100,})/g; const seen = new Map(); let m;
  while ((m = rx.exec(html))) seen.set(m[1], (seen.get(m[1]) || 0) + 1);
  const dups = [...seen.values()].filter(v => v > 1);
  assert.equal(dups.length, 0, 'birebir tekrar eden görsel kaldı: ' + dups.length);
  once('var af263GolgeArt="data:image/webp;base64,');
  once('"minion.portrait.af37_golge_suikastci":af263GolgeArt');
  once(',"shop":((window.AFQ_CHEST_ART&&window.AFQ_CHEST_ART.epic)||"")');
  once("#af203Intro .af203-introArt{background:var(--af263-echo-art,none) right center/cover}");
});
test('C: efekt şeritleri — her @başvuru gerçek bir şeride çözülür', () => {
  const j = html.match(/<script id="afxAssets" type="application\/json">([\s\S]*?)<\/script>/);
  const sheets = JSON.parse(j[1]).sheets; const refs = Object.entries(sheets).filter(([, v]) => typeof v.src === 'string' && v.src[0] === '@');
  assert.equal(refs.length, 4);
  for (const [k, v] of refs) { const r = sheets[v.src.slice(1)]; assert.ok(r && r.src.startsWith('data:image/webp;base64,'), k + ' çözülemedi'); }
  once("if(d&&typeof d.src==='string'&&d.src.charAt(0)==='@'){const r=data[d.src.slice(1)];");
});

// ---------- E) rehber balonu
test('E: rehber balonu dokunuşları geçirir; yerleştirici yüklü', () => {
  once('#afpGuide{pointer-events:none}#afpGuide button{pointer-events:auto}');
  once('<script id="AFP263_RUNTIME">');
  assert.ok(html.indexOf('<script id="AFP263_RUNTIME">') > html.indexOf('const AF213HomeArt='), 'çalışma anı betiği AF213HomeArt sonrasında olmalı');
});

// ---------- G) Materyal çantası görünür
test('G: Materyal çantası (afxMats) ana üsün tanıdığı pencereler arasında', () => {
  once("const utilityOpen=['afxWeek','afxHist','afxBadges','af328Profile','afxMats'].some(");
});
// ---------- H) Sandık / günlük ödül kartı
test('H: ödül kartı resmi ad etiketinin üstünde (esnek düzen), kart portresi önce', () => {
  assert.ok(html.includes("#chestRevealBackdrop .chestRevealCard>img{position:relative !important;inset:auto !important;flex:1 1 0 !important;"));
  assert.ok(html.includes("#chestRevealBackdrop .chestRevealCard{display:flex !important;flex-direction:column !important;justify-content:flex-end !important;}"));
  once("const hq=((typeof afpResolvedMinionPortrait==='function')&&afpResolvedMinionPortrait(type))||(AF324?AF324.portrait(type):'');");
});
// ---------- I) Rehber balonu alt ekranlarda tek satırlık şerit
test('I: "GERİ ile ana ekrana dön" balonu mini şerit olur, üst çubuktaki boşluğa oturur', () => {
  once("mini=!card.classList.contains('btl')&&!!pEl&&/^GERİ ile ana ekrana dön/.test(pEl.textContent||'')");
  once("#afpGuide.af263-mini{display:flex;");
  once("card.dataset.af263Score='ust-cubuk '");
  once("#afpGuide.af263-short .af263-rest{display:none}");
});
// ---------- C1b) Gölge Suikastçı portresi büyük kare
test('C1b: Gölge Suikastçı kart resmi tek kopya, AFP94 kartı paketteki resme bağlı', () => {
  once('window.AFP94_MINION_CARDS.af37_golge_suikastci=(window.AF_ART_PACK_DATA||{})["minion.full.af37_golge_suikastci"]||"";');
  const m = html.match(/var af263GolgeArt="(data:image\/webp;base64,[A-Za-z0-9+/=]+)"/);
  assert.ok(m && m[1].length > 12000, 'büyük portre yok');
  assert.equal(html.split(m[1]).length - 1, 1, 'portre tekrar ediyor');
});
// ---------- J) Kilitli minyon ayrıntısı
test('J: kilitli minyon ayrıntısında kilit sağ altta, "Nasıl açılır?" kutusu opak', () => {
  once(".afp134-miCard .afp134-lock{top:auto!important;bottom:6px!important;right:6px!important}");
  once(".afp134-how{background:#0b111e!important}");
});
// ---------- K) Koleksiyon çift etiket
test('K: koleksiyon kartında aynı etiket iki kez yazılmaz', () => {
  once("(String(t3)===String(t2)||String(t3)===r?'':'<span class=\"c-tag\">'+esc(t3)+'</span>')");
  once("(String(t2)===r?'':'<span class=\"c-tag\">'+esc(t2)+'</span>')");
});
// ---------- L) Kilitli kahraman dosyası
test('L: kilitli kahraman kutusu iki satır, KUPA YOLU düğmesi sekmelere binmez', () => {
  once("' .af332-lockBox>small{white-space:normal!important;");
  once(":has(.af332-lockBox) .af332-profBtns{top:1px!important}");
  once(":has(.af332-lockBox) .af332-profBtns .af4-btn{min-height:0!important;height:26px!important}");
});
// ---------- M) İlk açılış girişi giriş ekranını bekler
test('M: hikâye girişi, hesap/misafir giriş ekranı açıkken başlamaz', () => {
  once("&&!(document.getElementById('afqEntry')&&vis(document.getElementById('afqEntry')))){ftueIntro();return;} /* v3.60.263 M */");
});
// ---------- N) Görünüm kartı İNCELE düğmesi
test('N: Görünümler kartında İNCELE köşede, kural doğru katmanda', () => {
  once("sn.textContent='@layer af172Commerce{html'+':not(#_n)'.repeat(11)+' .af4-cosArt>.af173-inspect,html'+':not(#_n)'.repeat(11)+' .af4-eitem>.af4-eArt>.af173-inspect{left:6px!important;");
  assert.ok(html.includes('@layer af172Commerce'), 'kaynak katman adı değişmiş');
});
// ---------- O, P) Etkinlik mağazası
test('O: fiyat etiketindeki mühür simgesi 16 px ile sınırlı', () => {
  once("' .af4-price>img{width:16px!important;height:16px!important;");
});
test('P: etkinlik mağazasında oyunun çizdiği hedef minyon büstü silinmez', () => {
  once("{const hero=art.querySelector('.af4-eHero');if(hero&&!hero.querySelector('img,canvas,svg,.af-minion-art,[style*=");
});
// ---------- Savaş içi görsel denetim (Q, R, S, T, U)
test('Q: sonuç ekranında kart parçası / yeni kart tek minyonsa o minyonun resmi', () => {
  once("if(cs>0)T.push(['mcard:'+af263OnlyChanged(a.shards,b.shards),'Kart parçası',cs]);");
  once("if(k.indexOf('mcard:')===0){const t=k.slice(6);if(!t)return ART.card;");
  once("function af263OnlyChanged(oa,ob){");
});
test('R: savaş üst bilgi yazılarında koyu kontur gölgesi', () => { once("sr2.id='afp263HudCss'"); });
test('S: alt koridor büyü düğmelerinin arkasında kalınca düğme saydamlaşır', () => {
  once("try{if(window.__afp263SkillFade)window.__afp263SkillFade(order,W,H);}catch(_){} /* v3.60.263 S */");
  once("window.__afp263SkillFade=function(order,W,H){");
});
test('T: duraklatılamayan maçta düğme soluk ve açıklama gösteriyor', () => {
  once("Çevrim içi / dereceli maçta duraklatma yok: rakip beklemez. Çıkmak için ✕.");
});
test('U: sonuç ekranı alt başlığı ödül kutularına binmez', () => { once("c.dataset.af263Shift=String(need)"); });
test('V: üst koridor can çubuğu mod şeridinin altına itilmez', () => {
  once("minTop=Math.max(H*.135,(window.__afp263HudFloor?window.__afp263HudFloor(x,barW):0)); /* v3.60.263 V */");
  once("window.__afp263HudFloor=function(x,w){");
});
// ---------- Kalan eksikler turu: arayüz (W, X, Y, Z, AA)
test('W: büyü penceresinde düğme satırı alçak ekranda sabit, bakiye tekrarı gizli', () => {
  once("sw.id='afp263SpellWinCss'"); once("' .afx-hrSpellPanel>.afp-spend-bar{display:none!important}'");
});
test('X: Kupa Yolu minyon kartı oyunun kart portresini kullanır; kartlar eşit, ad iki satır', () => {
  once("art:(((c=>typeof c==='string'&&c.length>200?c:'')(window.AFP94_MINION_CARDS&&window.AFP94_MINION_CARDS[e.id]))||");
  once("sx2.id='afp263RoadCss'");
});
test('Y: Minyonlar nadirlik sekmeleri dar ekranda sığar', () => { once("sy2.id='afp263MinTabsCss'"); });
test('Z: ekipman yuvası yazısı kesilmez', () => { once("sz.id='afp263GearSlotCss'"); });
test('AA: Yadigârlar alt bilgisi alanın içinde (doğru katmanda)', () => { once("saa.textContent='@layer af172Commerce{@media (max-height:370px){'"); });
test('AB: Kahramanlar sekmeleri aynı kolon düzeni ve panel stili', () => {
  once("sab.id='afp263HeroUnifyCss'"); once("' .af332-heroes{grid-template-columns:minmax(100px,23%) minmax(0,1fr)!important;");
});
test('E2: savaş öğretici balonu sıkı düzen, dar boşlukta da alt boşluğa yerleşir', () => {
  once("+'#afpGuide.btl.af263-placed .g-p{font-size:9.5px!important;line-height:1.2!important}'");
  once("if(L>0&&fw>=108){card.classList.add('af263-placed');");
});
test('AC: Örümcek Akını / Lonca Dev Avı sonucu kendi adıyla etiketlenir', () => {
  once("const MODE_LABEL={raid:'ÖRÜMCEK AKINI',guildraid:'LONCA DEV AVI',duocolossus:'İKİ OYUNCULU KOLOSUS',echo:'YANKI İSTİLASI',");
  once("af263RaidKind=window.__AFPCommunityGuildRaidActive?'guildraid':(st&&st.active?'raid':'');");
});
test('AD: üç boss görseli bağlı; portre + idle/attack/death atlası; sandık kuralı değişmedi', () => {
  once('<script id="AFP263_BOSS_ART">');
  const m=html.match(/<script id="AFP263_BOSS_ART">[\s\S]*?const ART=(\{[\s\S]*?\});\n/); assert.ok(m,'veri yok');
  const A=JSON.parse(m[1]);
  for (const id of ['boss_kullerin_hukumdari','boss_ucurum_ejderi','boss_bosluk_imparatoru'])
    for (const k of ['p','idle','attack','death']) assert.ok(A[id]&&String(A[id][k]).startsWith('data:image/webp;base64,')&&A[id][k].length>5000, id+' '+k);
  once('const CHEST={cost:60,pity:50,');
});
test('AE: büyüler sürükle-bırak (oyunun kendi atış yolu), resim sürüklemesi kapalı', () => {
  once("window.__afp263SpellDrop=function(slot,cx,cy){");
  once("const ok=af327HandleTap(x,y);");
  once("#hud #skill img,#hud #skill2 img{-webkit-user-drag:none!important;");
  once("+'html'+':not(#_ae)'.repeat(13)+' #hud .af263-dragging{opacity:.35!important}';");
});
test('AF: minyon kartı figürü baştan ayağa çerçevede', () => {
  once("  const fit = true; /* v3.60.263 AF:");
  once("const [x,y,maxW,maxH] = [50,50,104,104];");
});
test('AG: sandık açılış penceresi tek sütun, ortada (doğru katmanda)', () => {
  once("sag.textContent='@layer af172Commerce{'+HG+'{grid-template-columns:minmax(0,1fr)!important;");
});
test('AH: Yankı portalı boss yenilmeden 0 olmaz (kalkan), gösterge KALKANLI; boss kuralı korunur', () => {
  once("if(enemyDown&&echoBossPending){enemySharedHP=1;");
  once("if(enemyDown&&!echoBossPending){draw(dt);endGame(true);updateHUD();return}");
  once("?'KALKANLI':Math.max(0,Math.min(100,Math.round(enemySharedHP/Math.max(1,TOWER_MAX_HP)*100)))+'%'; /* v3.60.263 AH */");
});
test('AI: FPS — büyü düğmesi/şerit ölçümü çizim döngüsünde yapılmaz; boss koleksiyonu tüm sayfayı izlemez', () => {
  once("const geo={cr:null,btn:{},strips:[]};");
  once("setInterval(()=>{const h=document.getElementById('hud');if(h&&h.classList.contains('battle-live'))measure();},400);");
  once("hudFloors=geo.strips.map(q=>[(q.left-cr.left)/sx,(q.right-cr.left)/sx,(q.bottom-cr.top)/sy+2]);");
  const m=html.match(/window\.__afp263SkillFade=function\(order,W,H\)\{([\s\S]*?)\n \};/); assert.ok(m,'SkillFade yok');
  assert.ok(!/getBoundingClientRect|getComputedStyle/.test(m[1].replace('if(!geo.cr)measure();','')), 'çizim içinde ölçüm kaldı');
  const b=html.match(/<script id="AFP263_BOSS_ART">[\s\S]*?<\/script>/); assert.ok(b);
  assert.ok(!/new MutationObserver\(scan\)/.test(b[0]), 'tüm sayfa gözlemcisi duruyor');
  assert.ok(b[0].includes("if(c&&!c.hidden&&c.getClientRects().length)scan();"));
  assert.ok(b[0].includes("if(!live.size)return;const col=document.getElementById('af36Col');if(col&&col.hidden)return;"));
});
test('AJ: Android geri tuşu savaşı sürdürmez (duraklat → çıkış onayı → duraklatma menüsü)', () => {
  once("const open=id=>{const e=document.getElementById(id);return !!(e&&!e.hidden);}; /* v3.60.263 AJ: geri tuşu savaşı sürdürmez */");
  once("if(open('af274Exit')){if(noPause)click('af274ExitNo');else{document.getElementById('af274Exit').hidden=true;const pz=document.getElementById('af274Pause');if(pz)pz.hidden=false;}}");
  once("else if(open('af274Settings'))click('af274Close');else if(open('af274Pause'))click('af274Quit');");
  assert.ok(!html.includes("if(isVis('af274ExitYes'))click('af274ExitNo');else if(isVis('af274Resume'))click('af274Quit');"), 'eski görünürlük denetimi duruyor');
});
test('AK: Örümcek Akını ana üs SAVAŞ MODLARI penceresinden açılır', () => {
  once('<button type="button" data-home-action="raid">ÖRÜMCEK AKINI</button>');
  once("raid:()=>{if(typeof window.__afpBossRaidOpenScreenV34065!=='function')throw new Error('Örümcek Akını ekranı yüklenmedi');window.__afpBossRaidOpenScreenV34065();},");
  once('.mode-extras {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));');
});
test('AL: Lonca / Son Kahraman misafir uyarısı belirgin kutu + GİRİŞ YAP', () => {
  once("e.innerHTML='<b>🔒 GİRİŞ GEREKLİ</b><span>'+esc(t)+'</span><button type=\"button\" class=\"afpce-action\" data-afp263-login=\"1\">GİRİŞ YAP</button>';");
  once("css.id='afp263LoginWarnCss'");
  once("const nav=document.querySelector('#af274Settings [data-sec=\"af39Sec5\"]')");
});
test('AM: Çift Kılıçlı görseli Karanlık Suikastçı (iki bıçak); veri kopyalanmaz, eklem noktaları da aynı görselden', () => {
  once("try{const S='af37_karanlik_suikastci',T='af37_cift_kilicli',AR=window.AFArt,ok=v=>v&&!(AR.isPlaceholder&&AR.isPlaceholder(v)); /* v3.60.263 AM */");
  once(" if(AF321_RIGS[S])AF321_RIGS[T]=JSON.parse(JSON.stringify(AF321_RIGS[S]));");
  once(" const C=window.AFP94_MINION_CARDS;if(C&&C[S])C[T]=C[S];window.__afp263CiftKilicliKaynak=S;");
  assert.ok(html.includes('"af37_cift_kilicli":{"name":"Çift Kılıçlı","rarity":"Sıradan"'), 'ad/nadirlik değişmemeli');
});
test('AN: üç boss boss\'u olmayan çevrim dışı modlarda (Karanlık Geçit, Gizli Bölge 3/3); diğer modlar aynı', () => {
  once("var AF36_BOSS_HP_MUL={campaign:1,sky:1,tower:1,duel:1};\nvar AF36_BOSS_ENTRY={campaign:40,sky:30,tower:35,duel:45};");
  once(" try{if(window.__AFPDisguisedMatchActive||(window.__AFPOnlineContext&&window.__AFPOnlineContext.active)||window.__afpFtueBattle)return null;}catch(_){return null;}");
  once(" if(af35MatchKind==='dark')key=(Math.floor(+s.darkWins||0)%2===0)?'afp263:boss_kullerin_hukumdari':'afp263:boss_ucurum_ejderi';");
  once(" else if(af35MatchKind==='secret'&&Math.floor(+s.stage||0)>=AF35_SECRET_REWARD.stages-1)key='afp263:boss_bosluk_imparatoru';");
  once(" if(gameMode==='duel')return !af36Run.bossSpawned&&!!af263DuelBossDef(); /* v3.60.263 AN */");
  once("  if(u._afp263Boss)return af263DrawBossAnim(u); /* v3.60.263 AN */");
  once("function drawCombatTexts(dt){try{af263DrawBossDeaths();}catch(_){} /* v3.60.263 AN */");
  once("if((String(mode)==='tower'||String(mode)==='duel')&&!playing){af36Run.bossSpawned=false;af36Run.bossKilled=false;}");
  // Kule / Gökyüzü / Sefer / Örümcek Akını boss seçimi değişmedi
  once("if(gameMode==='tower')return af36TowerFloor()%5===0&&!af36Run.bossSpawned;");
  once("level=af36TowerFloor();seq=[all[1],all[0],all[3],all[2],all[4],all[5],all[6],all[7]];");
});

fs.writeFileSync(__dirname + '/SONUC_V263_TEST.json', JSON.stringify(results, null, 2));
console.log('SONUÇ', results.filter(x => x.status === 'GEÇTİ').length + '/' + results.length);
