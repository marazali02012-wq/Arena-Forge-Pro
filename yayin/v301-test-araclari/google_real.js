const {chromium}=require('playwright');const fs=require('fs');const S=process.argv[2],FILE=process.argv[3];
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:800,height:360},hasTouch:true,isMobile:true});
const html=fs.readFileSync(FILE);
await c.route('**/*',async r=>{const u=r.request().url();
 if(u.startsWith('https://appassets.androidplatform.net/assets/www/index.html'))return r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
 if(u.startsWith('https://lvjivtnnclaotayncavj.supabase.co/auth/v1/settings'))return r.continue(); // gerçek ayarlar
 return r.abort();});
await c.addInitScript(()=>{window.__opened=[];window.AFPAndroidAuth={redirectUri:()=>'com.arenaforgepro.game://auth-callback',openExternal:(u)=>{window.__opened.push(u);return true;}};});
const p=await c.newPage();await p.goto('https://appassets.androidplatform.net/assets/www/index.html');await p.waitForTimeout(3500);
await p.locator('[data-act=google] >> visible=true').first().click();await p.waitForTimeout(4000);
const msg=await p.evaluate(()=>{const m=document.querySelector('#afqEntry');const s=(m&&m.shadowRoot?m.shadowRoot:document).querySelector('.msg');return s?s.textContent:'';});
console.log(JSON.stringify({mesaj:msg,acilanSayfa:await p.evaluate(()=>window.__opened.length)}));
await p.screenshot({path:S+'/shots/google_real.png'});await b.close();})();
