const {chromium}=require('playwright');
const FILE='/tmp/claude-0/-home-user/c3d7bd62-d831-544f-9b94-909b6e94cdc6/scratchpad/afp/test.html';
exports.FILE=FILE;
exports.open=async(w=740,h=360,opts={})=>{
 const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--disable-gpu-vsync']});
 const c=await b.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true,deviceScaleFactor:1,...(opts.storageState?{storageState:opts.storageState}:{})});
 // offline: block network to supabase/render so tests are deterministic
 if(opts.offline!==false) await c.route(u=>!u.href.startsWith('http://127.0.0.1:8765/'),r=>r.abort());
 const p=await c.newPage(); const errs=[];
 p.on('console',m=>{if(m.type()==='error')errs.push('console.error: '+m.text().slice(0,400))});
 p.on('pageerror',e=>errs.push('PAGEERROR: '+(e.stack||e.message).slice(0,600)));
 await p.goto((opts.url||'http://127.0.0.1:8765/test.html'),{waitUntil:'load',timeout:120000});
 await p.waitForTimeout(3000);
 if(opts.storageState){const g=p.getByText('Misafir olarak oyna');if(await g.count()&&await g.first().isVisible()){await g.first().click();await p.waitForTimeout(3000);} await p.evaluate(()=>{for(const e of document.querySelectorAll('button')){if(/^KAPAT$/.test(e.innerText.trim())&&e.offsetParent){e.click();}}});await p.waitForTimeout(500);}
 return {b,c,p,errs};
};
exports.visibleTexts=p=>p.evaluate(()=>[...document.querySelectorAll('button,[role=button],.btn,a')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'}).map(e=>(e.id?'#'+e.id+' ':'')+e.innerText.replace(/\s+/g,' ').trim().slice(0,40)).filter(x=>x.trim()).slice(0,50));
