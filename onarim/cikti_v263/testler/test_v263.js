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

fs.writeFileSync(__dirname + '/SONUC_V263_TEST.json', JSON.stringify(results, null, 2));
console.log('SONUÇ', results.filter(x => x.status === 'GEÇTİ').length + '/' + results.length);
