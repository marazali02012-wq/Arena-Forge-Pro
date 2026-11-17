const { open } = require('./harness');
const ME = '00000000-0000-4000-8000-000000000001', R1 = '00000000-0000-4000-8000-0000000000a1', R2 = '00000000-0000-4000-8000-0000000000a2';
const INIT = (enabled, rewards) => `(()=>{
 window.__calls=[];window.__rw=${JSON.stringify(rewards)};
 const J=(x,st)=>new Response(JSON.stringify(x),{status:st||200,headers:{'Content-Type':'application/json'}});
 const of=window.fetch;window.fetch=async function(u,o){u=String(u);
  if(u.indexOf('arena-forge-online-server.onrender.com')>=0){const p=u.split('onrender.com')[1];const m=(o&&o.method)||'GET';let b=null;try{b=JSON.parse(o.body)}catch(e){}
   window.__calls.push({m,p,b});
   if(p.startsWith('/api/v1/events/season'))return J({seasonNo:1,day:1,week:1,daysRemaining:27,events:[]});
   if(p.startsWith('/api/v1/guild/chat'))return J({messages:[]});
   if(p==='/api/v1/guild/me')return J({userId:'${ME}',guild:{id:'g',name:'Arcanists',tag:'ARC',invite_code:'ABCDEF123456'},role:'member',members:[{user_id:'${ME}',role:'member',nickname:'Ben'}],
     raid:{season_no:1,level:3,boss_hp:100,boss_max_hp:200,total_damage:900,cleared:false},bossConfig:{boss_name:'B',archetype:'warden',special_rule:'x'},contributions:[],ranking:[],seasonDamage:0});
   if(p==='/api/v1/guild/boss/rewards')return J({rewardsEnabled:${enabled},rewards:window.__rw});
   if(p==='/api/v1/guild/boss/claim'){const r=window.__rw.find(x=>x.id===b.rewardId);if(!r)return J({error:'unknown_reward'},409);
     if(r.claimed)return J({ok:true,duplicate:true,gold:0,gems:0,chest:null});r.claimed=true;return J({ok:true,duplicate:false,gold:r.gold,gems:r.gems,chest:r.chest,level:r.level});}
   return J({});}
  return of.apply(this,arguments);};
 localStorage.setItem('afpSupabaseSessionV1',JSON.stringify({access_token:'x.y.z',refresh_token:'r',expires_at:Math.floor(Date.now()/1000)+86400,user:{id:'${ME}',email:'a@b.c'}}));
})();`;
const rw = (id, o = {}) => ({ id, season: 1, level: 2, boss: 'Kale Muhafızı · 2', damage: 2000, sharePct: 63.5, rank: 1, gold: 630, gems: 8, chest: 'boss_chest_gold', claimed: false, expired: false, at: 't', ...o });
(async () => {
  let fail = 0; const ok = (n, c, i = '') => { console.log((c ? 'GEÇTİ ' : 'KALDI ') + n + (c ? '' : ' ' + i)); if (!c) fail++; };
  const txt = (page) => page.evaluate(() => { const r = document.getElementById('afpce'); return r ? r.textContent : ''; });
  const prof = (page) => page.evaluate(() => { const p = window.__AFP171Bridge.getProfile(); return { c: +p.credits || 0, d: +p.relicDust || 0, ch: (p.battleChests || []).filter(Boolean).map((x) => x.type) }; });
  // 1) açık + iki ödül (biri alınmış, biri süresi dolmuş, biri alınabilir)
  let { browser, page, log } = await open(process.argv[2], { init: INIT(true, [rw(R1), rw(R2, { claimed: true }), rw('x3', { expired: true })]) });
  await page.waitForTimeout(3000); await page.evaluate(() => window.AFPCommunityEventCenterV36026.open('raid')); await page.waitForTimeout(2500);
  let t = await txt(page);
  ok('ödül kartı görünür: boss adı, sıra, pay, altın/toz, sandık', /BOSS ÖDÜLLERİ/.test(t) && /Kale Muhafızı · 2/.test(t) && /#1/.test(t) && /%63\.5/.test(t) && /630 altın/.test(t) && /8 yadigâr tozu/.test(t) && /destansı sandığı/.test(t));
  const nBtn = await page.evaluate(() => document.querySelectorAll('#afpce [data-act="boss-claim"]').length);
  ok('yalnız alınabilir ödülün düğmesi var (alınmış ve süresi dolmuş gizli)', nBtn === 1, String(nBtn));
  const p0 = await prof(page);
  await page.evaluate(() => document.querySelector('#afpce [data-act="boss-claim"]').click()); await page.waitForTimeout(1800);
  const p1 = await prof(page); const calls = await page.evaluate(() => window.__calls);
  ok('talep sunucuya doğru kimlikle gitti', calls.some((c) => c.p === '/api/v1/guild/boss/claim' && c.b.rewardId === R1));
  ok('altın +630, yadigâr tozu +8 yerel profile yazıldı', p1.c === p0.c + 630 && p1.d === p0.d + 8, JSON.stringify([p0, p1]));
  ok('destansı sandık yuvaya eklendi', p1.ch.length === p0.ch.length + 1 && p1.ch.includes('epic'), JSON.stringify([p0.ch, p1.ch]));
  t = await txt(page); ok('talep sonrası düğme kalktı, "Ödül alındı" mesajı', !(await page.evaluate(() => document.querySelector('#afpce [data-act="boss-claim"]'))) && /Alınacak ödül yok|Ödül alındı/.test(t));
  // 2) sayfa yenile: ikinci kez talep (yarış) → duplicate, ikinci kez YAZILMAZ
  const applied = await page.evaluate(() => JSON.parse(localStorage.getItem('afpGuildBossAppliedV1') || '[]'));
  ok('uygulanan ödül kimliği saklandı (yinelenen yazımı önler)', applied.includes(R1));
  const dup = await page.evaluate(async (id) => { const r = await fetch('https://arena-forge-online-server.onrender.com/api/v1/guild/boss/claim', { method: 'POST', body: JSON.stringify({ rewardId: id }) }); return r.json(); }, R1);
  ok('sunucu ikinci talepte duplicate ve 0 ödül döner (stub)', dup.duplicate === true && dup.gold === 0);
  ok('sayfa hatası yok', log.errors.length === 0, log.errors.join('|'));
  await browser.close();
  // 3) kapalı + ödül yok
  ({ browser, page, log } = await open(process.argv[2], { init: INIT(false, []) }));
  await page.waitForTimeout(3000); await page.evaluate(() => window.AFPCommunityEventCenterV36026.open('raid')); await page.waitForTimeout(2500);
  t = await txt(page); ok('kapalıyken "henüz açık değil" bilgisi, düğme yok', /henüz açık değil/.test(t) && !(await page.evaluate(() => document.querySelector('#afpce [data-act="boss-claim"]'))));
  await browser.close();
  // 4) sunucu hatası (409 unknown) hata mesajı gösterir, profil değişmez
  ({ browser, page, log } = await open(process.argv[2], { init: INIT(true, [rw(R1)]) }));
  await page.waitForTimeout(3000); await page.evaluate(() => window.AFPCommunityEventCenterV36026.open('raid')); await page.waitForTimeout(2500);
  await page.evaluate(() => { window.__rw.length = 0; }); const q0 = await prof(page);
  await page.evaluate(() => document.querySelector('#afpce [data-act="boss-claim"]').click()); await page.waitForTimeout(1500);
  const q1 = await prof(page); ok('sunucu reddederse profil DEĞİŞMEZ', q1.c === q0.c && q1.d === q0.d && q1.ch.length === q0.ch.length, JSON.stringify([q0, q1]));
  await browser.close();
  console.log(fail ? 'BAŞARISIZ ' + fail : 'TÜMÜ GEÇTİ'); process.exit(fail ? 1 : 0);
})();
