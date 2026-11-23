// layout audit that pierces shadow roots
module.exports=()=>{
 const all=[];const walk=(root)=>{for(const e of root.querySelectorAll('*')){all.push(e);if(e.shadowRoot)walk(e.shadowRoot);}};walk(document);
 const VW=innerWidth,VH=innerHeight;
 const vis=e=>{const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return null;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity<0.05)return null;
   // occluded/hidden ancestor check via elementFromPoint at center (pierce shadow)
   return r;};
 const inter=all.filter(e=>{const t=e.tagName;if(t==='BUTTON'||e.getAttribute('role')==='button'||(t==='A'&&e.href))return true;const cs=getComputedStyle(e);return cs.cursor==='pointer'&&!e.closest('button');});
 const topAt=(x,y)=>{let el=document.elementFromPoint(x,y);while(el&&el.shadowRoot){const n=el.shadowRoot.elementFromPoint(x,y);if(!n||n===el)break;el=n;}return el;};
 const items=[];
 for(const e of inter){const r=vis(e);if(!r)continue;const cx=Math.min(VW-1,Math.max(0,r.left+r.width/2)),cy=Math.min(VH-1,Math.max(0,r.top+r.height/2));const top=topAt(cx,cy);const reach=top&&(top===e||e.contains(top)||(top.getRootNode&&top.getRootNode().host&&e.contains(top.getRootNode().host)));
  if(!reach)continue; // not actually on top (behind another layer) → ignore
  items.push({e,r,t:(e.innerText||e.getAttribute('aria-label')||e.id||e.className||'').toString().replace(/\s+/g,' ').trim().slice(0,28)});}
 const issues=[];
 for(const it of items){const r=it.r;
  if(r.right>VW+2||r.bottom>VH+2||r.left<-2||r.top<-2)issues.push({k:'ekran_disi',t:it.t,r:[r.left,r.top,r.right,r.bottom].map(Math.round)});}
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];if(a.e.contains(b.e)||b.e.contains(a.e))continue;
  const w=Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left),h=Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top);if(w<=2||h<=2)continue;
  const area=w*h,min=Math.min(a.r.width*a.r.height,b.r.width*b.r.height);if(area/min>0.2)issues.push({k:'cakisma',t:a.t+' ⟂ '+b.t,pct:Math.round(100*area/min)});}
 // text clipping
 for(const e of all){if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>2))continue;const r=vis(e);if(!r)continue;const cs=getComputedStyle(e);
  if((cs.overflow==='hidden'||cs.overflowX==='hidden'||cs.textOverflow==='ellipsis')&&e.scrollWidth>e.clientWidth+3&&cs.whiteSpace!=='normal'){const tp=topAt(Math.min(VW-1,r.left+r.width/2),Math.min(VH-1,r.top+r.height/2));if(tp&&(tp===e||e.contains(tp)||tp.contains(e)))issues.push({k:'yazi_kesik',t:e.textContent.replace(/\s+/g,' ').trim().slice(0,40),sw:e.scrollWidth,cw:e.clientWidth});}}
 return {n:items.length,issues:issues.slice(0,40)};
};
