// index.html'in YALNIZCA test için geçici kopyasını üretir (oyunun kendisi değişmez):
//  1) __afpSim: savaş durum özeti (birim konum/can, enerji, kule canı) okuyucusu, __afpPlaying: savaş sürüyor mu
//  2) __fixedDt: tanımlıysa her karenin süresi sabit (yayın sürümünde bu satır YOKTUR; üretimde kare süresi gerçek rAF farkıdır)
// Kullanım: node hazirla_test_kopyasi.js <index.html> <cikti.html>
const fs = require('fs');
const [inp, out] = process.argv.slice(2);
let src = fs.readFileSync(inp, 'utf8');
const anchor = 'window.AFPGuideHost={';
if (src.split(anchor).length !== 2) throw new Error('bağlantı noktası bulunamadı: ' + anchor);
const probe = "window.__afpSim=()=>{const r=(v,k)=>Math.round((+v||0)*k);return {el:r(elapsed,1000),gold:gold,cap:energyCap,eg:enemyEnergy,eHP:r(enemySharedHP,1),aHP:r(allySharedHP,1),base:r(baseHP,1),n:units.length,u:units.map(u=>[u.team==='ally'?'a':'e',String(u.heroType||u.type||''),r(u.x,100),r(u.hp,1),u.lane]).sort((a,b)=>(a[0]+a[1]+a[4]+a[2]).localeCompare(b[0]+b[1]+b[4]+b[2]))};};window.__afpPlaying=()=>!!playing;\n";
src = src.replace(anchor, probe + anchor);
const dtOld = 'const rawDt=Math.max(0,(ts-last)/1000||1/60);last=ts;lastPresentedFrame=ts;';
if (src.split(dtOld).length !== 2) throw new Error('kare süresi satırı bulunamadı');
src = src.replace(dtOld, 'const rawDt=(window.__fixedDt>0?window.__fixedDt:Math.max(0,(ts-last)/1000||1/60));last=ts;lastPresentedFrame=ts;');
fs.writeFileSync(out, src);
console.log('test kopyası yazıldı:', out);
