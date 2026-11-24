// APK Google akışı: sayfa https://appassets.androidplatform.net'ten, Android köprüsü ve Supabase taklit
const {chromium}=require('playwright');const crypto=require('crypto');const fs=require('fs');
const S=process.argv[2],FILE=process.argv[3];
const BACK='com.arenaforgepro.game://auth-callback';
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:800,height:360},hasTouch:true,isMobile:true});
const html=fs.readFileSync(FILE);const tokenReqs=[];const results={};
await c.route('**/*',async r=>{const u=r.request().url();
 if(u.startsWith('https://appassets.androidplatform.net/assets/www/index.html'))return r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
 if(u.includes('/auth/v1/settings'))return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({external:{google:true,email:true}})});
 if(u.includes('/auth/v1/token?grant_type=pkce')){const body=JSON.parse(r.request().postData()||'{}');tokenReqs.push(body);
   const exp=Math.floor(Date.now()/1000)+3600;const jwt='e30.'+Buffer.from(JSON.stringify({exp,sub:'11111111-2222-3333-4444-555555555555'})).toString('base64url')+'.sig';
   return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:jwt,refresh_token:'rt-test',expires_in:3600,expires_at:exp,token_type:'bearer',user:{id:'11111111-2222-3333-4444-555555555555',email:'test.oyuncu@example.com'}})});}
 return r.abort();});
await c.addInitScript(BACK=>{window.__opened=[];window.AFPAndroidAuth={redirectUri:()=>BACK,openExternal:(u)=>{window.__opened.push(u);return true;}};},BACK);
const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('https://appassets.androidplatform.net/assets/www/index.html');await p.waitForTimeout(3500);
const gBtn=p.locator('[data-act=google] >> visible=true');
results.googleButtonVisible=await gBtn.count()>0;
await p.screenshot({path:S+'/shots/google_login.png'});
await gBtn.first().click();await p.waitForTimeout(1500);
const opened=await p.evaluate(()=>window.__opened);results.openedCount=opened.length;
const au=new URL(opened[0]);results.authorize={host:au.host,path:au.pathname,provider:au.searchParams.get('provider'),method:au.searchParams.get('code_challenge_method'),redirect_to:au.searchParams.get('redirect_to')};
const challenge=au.searchParams.get('code_challenge');const tx=new URL(au.searchParams.get('redirect_to').replace(BACK,'https://x/cb')).searchParams.get('afp_tx');
// negative 1: wrong tx
await p.evaluate(u=>window.AFPGoogleOAuth.completeFromApp(u),BACK+'?afp_google=1&afp_tx=WRONG&code=abc');await p.waitForTimeout(800);
results.wrongTxMsg=await p.evaluate(()=>{const all=[];const walk=r=>{for(const e of r.querySelectorAll('*')){if(e.shadowRoot)walk(e.shadowRoot);}};const m=document.querySelector('#afqEntry');const s=(m&&m.shadowRoot?m.shadowRoot:document).querySelector('.msg');return s?s.textContent:'';});
results.tokenCallsAfterWrong=tokenReqs.length;
// pending was cleared by failed attempt -> restart the flow
await gBtn.first().click();await p.waitForTimeout(1500);
const opened2=await p.evaluate(()=>window.__opened);const au2=new URL(opened2[opened2.length-1]);const ch2=au2.searchParams.get('code_challenge');const tx2=new URL(au2.searchParams.get('redirect_to').replace(BACK,'https://x/cb')).searchParams.get('afp_tx');
// negative 2: other scheme
results.otherSchemeAccepted=await p.evaluate(u=>window.AFPGoogleOAuth.completeFromApp(u),'evil://auth-callback?afp_google=1&afp_tx='+tx2+'&code=abc');
// positive
await p.evaluate(u=>window.AFPGoogleOAuth.completeFromApp(u),BACK+'?afp_google=1&afp_tx='+encodeURIComponent(tx2)+'&code=AUTHCODE123');await p.waitForTimeout(3000);
const tr=tokenReqs[tokenReqs.length-1];results.tokenRequest=tr?{auth_code:tr.auth_code,verifierLen:(tr.code_verifier||'').length,pkceMatches:crypto.createHash('sha256').update(tr.code_verifier).digest('base64url')===ch2}:null;
results.session=await p.evaluate(()=>{try{const s=JSON.parse(localStorage.getItem('afpSupabaseSessionV1')||'null');return s?{email:s.user&&s.user.email,hasAccess:!!s.access_token}:null}catch(e){return 'err'}});
await p.waitForTimeout(12000);results.entryClosed=await p.evaluate(()=>window.AFQEntry?!window.AFQEntry.isOpen():null);
await p.screenshot({path:S+'/shots/google_after.png'});
// replay same link again
const before=tokenReqs.length;await p.evaluate(u=>window.AFPGoogleOAuth.completeFromApp(u),BACK+'?afp_google=1&afp_tx='+encodeURIComponent(tx2)+'&code=AUTHCODE123');await p.waitForTimeout(800);
results.replayTokenCalls=tokenReqs.length-before;
results.pendingCleared=await p.evaluate(()=>localStorage.getItem('afpGooglePKCENativeV1')===null);
results.errors=errs.slice(0,3);
console.log(JSON.stringify(results,null,1));await b.close();})();
