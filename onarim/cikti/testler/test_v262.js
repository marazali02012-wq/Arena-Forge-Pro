'use strict';
// v3.60.262 regresyon testleri. Kullanım: node test_v262.js <ARENA_FORGE_PRO_v3.60.262.html>
// Gerçek HTML'den ilgili kodu çıkarıp vm içinde çalıştırır; tarayıcı/oynanış testi değildir.
const fs = require('fs'), vm = require('vm'), assert = require('node:assert/strict');
const file = process.argv[2];
if (!file) { console.error('Kullanım: node test_v262.js <html>'); process.exit(2); }
const html = fs.readFileSync(file, 'utf8');
const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, status: 'GEÇTİ' }); console.log('GEÇTİ', name); }
  catch (err) { results.push({ name, status: 'KALDI', err: String(err) }); console.log('KALDI', name, String(err)); process.exitCode = 1; }
}
const once = (needle) => { const n = html.split(needle).length - 1; assert.equal(n, 1, needle.slice(0, 60) + ' -> ' + n + ' kez'); };

test('Sürüm etiketi v3.60.262', () => {
  once('<meta name="afp-build" content="v3.60.262" />');
  assert.ok(html.includes('<title>Arena Forge Pro v3.60.262'));
});

test('Hikâye Seferi paneli: güvenli ortalama (üst satır kesilmez)', () => {
  const sel = 'html.afx369:not(#_1):not(#_2):not(#_3) #afxModeScreen.af219-mode[data-mode]:not([data-mode="colossus"]) .afx-pageR';
  once(sel + ' {justify-content:flex-start;');
  once(sel + '>:first-child{margin-top:auto!important;}');
  once(sel + '>:last-child{margin-bottom:auto!important;}');
  assert.ok(!html.includes(sel + ' {justify-content:center;'), 'eski center kuralı kalmış');
});

test('Sancak: koridoru kapatan skor kutusu gizli', () => {
  once('.af36-flag-hud{display:none!important;');
});

// af36ModeLabel'i gerçek kaynaktan alıp çalıştır
const lab = html.match(/function af36ModeLabel\(\)\{if\(gameMode==='sky'\)[\s\S]*?return '';\}/g).find(x => x.includes('⚑'));
test('Sancak: şerit etiketi skor + hedef puanı gösterir', () => {
  assert.ok(lab, 'af36ModeLabel bulunamadı');
  const ctx = { gameMode: 'flag', af36Run: { flags: { score: { ally: 26.7, enemy: 5.2 } }, level: 1 }, AF36_FLAG_TARGET: 90 };
  vm.createContext(ctx); vm.runInContext(lab, ctx);
  assert.equal(ctx.af36ModeLabel(), '⚑ BAYRAK · 26-5 / 90');
  ctx.gameMode = 'sky'; ctx.af36Run.level = 5;
  assert.equal(ctx.af36ModeLabel(), '☁ GÖKYÜZÜ · ADA 5 · MUHAFIZ');
});

test('Sancak: olay bildirimi sırasında skor hapı gizlenmez', () => {
  once('#battleProStrip.notice-active[data-af262-flag]>#battleProMode{display:block!important}');
  once("if(af262S)af262S.toggleAttribute('data-af262-flag',!!(playing&&gameMode==='flag'&&af36Run.flags));");
});

// drawHero'nun gizlilik dalını gerçek kaynaktan çıkarıp sahte ctx ile çalıştır
const dh = html.match(/function drawHero\(u\)\{[\s\S]*?\n  const R=af320Resolve\(u\)/);
test('Gizlilik: kendi suikastçın %42 saydam çizilir, rakibinki çizilmez', () => {
  assert.ok(dh, 'drawHero başlangıcı bulunamadı');
  const head = dh[0].replace(/\n  const R=af320Resolve\(u\)$/, '\n  DRAWN.push({team:u.team,alpha:ctx.globalAlpha});\n}');
  const env = {
    gameMode: 'arena', playing: true, elapsed: 10, DRAWN: [], window: {},
    ctx: { globalAlpha: 1, _st: [], save() { this._st.push(this.globalAlpha); }, restore() { this.globalAlpha = this._st.pop(); } },
    af3410HasSoleInvisibility: u => u.heroType === 'af37_golge_suikastci',
    af36DrawBossArtwork: () => false,
  };
  vm.createContext(env); vm.runInContext(head, env);
  const mk = team => ({ team, heroType: 'af37_golge_suikastci', isRoster: true, revealedUntil: 0 });
  env.drawHero(mk('ally')); env.drawHero(mk('enemy'));
  assert.equal(env.DRAWN.length, 1, 'yalnız dost suikastçı çizilmeli');
  assert.equal(env.DRAWN[0].team, 'ally');
  assert.ok(Math.abs(env.DRAWN[0].alpha - 0.42) < 1e-9, 'saydamlık ' + env.DRAWN[0].alpha);
  assert.equal(env.ctx.globalAlpha, 1, 'ctx.restore sonrası alfa 1 olmalı');
  const vis = mk('ally'); vis.revealedUntil = 99; env.DRAWN.length = 0; env.drawHero(vis);
  assert.equal(env.DRAWN[0].alpha, 1, 'açığa çıkmış suikastçı tam opak');
});

test('Gizlilik: hedefleme kuralı değişmedi (iki taraf için aynı)', () => {
  once("if(af3410HasSoleInvisibility(e)&&!e.enemyType&&(e.isHero||e.isRoster)&&elapsed>=(e.revealedUntil||0))continue;");
});

test('Koleksiyon: Yeni Karakterler sekmesi 49 (Keşifçi emekli)', () => {
  once("['normal','YENİ KARAKTERLER (49)']");
  assert.ok(html.includes("'af37_kesifci'") && html.includes('AF3406_RETIRED_CARD_IDS'));
});

test('Savaş motoru sonuç bloğu (v260) korunuyor', () => {
  once('{const enemyDown=enemySharedHP<=0,portalsDown=allySharedHP<=0,castleDown=baseHP<=0,allyDown=castleDown||portalsDown;');
  once("const echoBossPending=gameMode==='echo'&&af203Run?.active&&!af203Run.bossDefeated;");
});

fs.writeFileSync(__dirname + '/SONUC_V262_TEST.json', JSON.stringify(results, null, 2));
console.log('SONUÇ', results.filter(x => x.status === 'GEÇTİ').length + '/' + results.length);
