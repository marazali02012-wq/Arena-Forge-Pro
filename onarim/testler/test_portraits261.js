'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=__dirname+'/../04_TESTLER/_uretilen_scriptler';
const sc11=fs.readFileSync(root+'/script_011.js','utf8');
const sc30=fs.readFileSync(root+'/script_030.js','utf8');
const recovery=fs.readFileSync(root+'/script_107.js','utf8');
const sc8=fs.readFileSync(root+'/script_008.js','utf8');
const packText=sc8.slice(sc8.indexOf("s.text='")+8,sc8.lastIndexOf("';c.parentNode"));
const silent={warn:()=>{}, log:()=>{}};
let results=[];function test(name,fn){fn();results.push({name,pass:true});process.stdout.write('GEÇTİ '+name+'\n');}
const env={window:{},console:silent, document:{getElementById:id=>id==='AF_ART_PACK'?{firstChild:{nodeType:3,data:packText}}:null}};
vm.runInNewContext(sc11,env);
const art=env.window.AFArt;
test('Art paketi: 245 ofset kaydı geçerli',()=>assert.strictEqual(Object.keys(art.pack).length,245));
test('Minyon gömülü görseli erişilebilir',()=>assert.ok(art.get('minion.full.af37_tas_devi').startsWith('data:image/webp;base64,')));
test('Komutan gömülü portresi erişilebilir',()=>assert.ok(art.get('commander.portrait.ruul').startsWith('data:image/webp;base64,')));
test('Boş eski slot orijinal gömülü görseli perdeleyemez',()=>{
 const slot={af37_tas_devi:''};art.patch('minion.full',slot);assert.ok(slot.af37_tas_devi.length>100);
 slot.af37_tas_devi='';assert.ok(art.get('minion.full.af37_tas_devi').length>100);
});
const m=sc30.match(/function afpResolvedMinionPortrait\(type\)\{[\s\S]*?\n\}\nfunction af215GroupCardArt/);
assert.ok(m,'Resolver function must be present');
const resolverSource=m[0].replace(/\nfunction af215GroupCardArt$/,'');
const helperEnv={window:{AFArt:art,AFP94_MINION_CARDS:{afn_test_hero:'data:image/webp;base64,'+'Z'.repeat(100)}},HERO_PORTRAITS:{},afHeroArtSource:()=>null};
const resolve=vm.runInNewContext(resolverSource+'\n afpResolvedMinionPortrait',helperEnv);
test('Kart görseli aynı karakterin kendi varlığını tercih eder',()=>assert.strictEqual(resolve('afn_test_hero'),helperEnv.window.AFP94_MINION_CARDS.afn_test_hero));
test('Kart görseli AFArt içindeki minyona döner',()=>assert.ok(resolve('af37_tas_devi').length>100));
test('Bilinmeyen minyona başka kartın görseli atanmaz',()=>assert.strictEqual(resolve('olmayan_kart_261'),''));
test('Eski koleksiyonda sabit boş portre ataması kaldırılmış',()=>assert.ok(!sc30.includes("visualPortrait=''; /* v3.41.70")));
test('106 portreden kaçak dış adres kullanılmıyor',()=>{
 const a14=fs.readFileSync(root+'/script_014.js','utf8');const a15=fs.readFileSync(root+'/script_015.js','utf8');
 const first=a14.match(/^window\.AFP94_MINION_CARDS=(\{.*?\});/s);const next=a15.match(/^Object\.assign\(window\.AFP94_MINION_CARDS\|\|\{\},(\{.*?\})\);/s);
 assert.ok(first&&next);const all={...JSON.parse(first[1]),...JSON.parse(next[1])};
 assert.strictEqual(Object.keys(all).length,106);assert.ok(Object.values(all).every(x=>x.startsWith('data:image/webp;base64,')));
});
const handlers={};
const doc={addEventListener:(n,f)=>{handlers[n]=f}};
const mockEnv={window:{AFArt:art,AFP94_MINION_CARDS:{afn_test_hero:helperEnv.window.AFP94_MINION_CARDS.afn_test_hero}},document:doc,console:silent};
vm.runInNewContext(recovery,mockEnv);
test('Bozuk kart kaynağı aynı minyon görseline yönlendiriliyor',()=>{
 let src='broken', type='afn_test_hero';const tile={getAttribute:name=>name==='data-hero'?type:''};
 const img={tagName:'IMG',dataset:{},style:{},getAttribute:n=>n==='src'?src:'',set src(s){src=s},get src(){return src},closest:sel=>sel.includes('.heroCard')?tile:(sel.includes('[data-hero]')?tile:null)};
 handlers.error({target:img});
 assert.ok(src.startsWith('data:image/webp;base64,'));
});
fs.writeFileSync(__dirname+'/SONUC_10_TEST.json',JSON.stringify({total:results.length,passed:results.length,results},null,2));
console.log('SONUÇ '+results.length+'/'+results.length);
