'use strict';
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const htmlPath = path.resolve(__dirname, '../app/src/main/assets/www/index.html');
const out = process.argv[2] || '.';

// Inject only into this test document, inside the private combat scope.
const probe = `
window.af309CombatTest = () => {
  const results=[];
  gameMode='arena';
  const make=(type,team,x)=>({
    heroType:type,team,x,lane:1,hp:1500,maxHp:1500,atk:20,attackPeriod:1.25,
    isHero:true,isRoster:true,speed:0,_afEng:1
  });
  for(const id of AF59_SELECTED_IDS){
    const card=AF290_CARDS[id], stats=heroStats(id);
    elapsed=2;
    af323Shots=[];af323Resolved=[];shots=[];particles=[];combatTexts=[];
    const a=make(id,'ally',.30), b=make('af37_kilicli_asker','enemy',.30+card.range+.01);
    a.atk=stats.atk;
    units=[a,b];
    const far=attack(a,b);
    b.x=.30+card.range*.65;
    const hp=b.hp;
    attack(a,b);
    const pending=af323Shots.map(p=>p.kind);
    const hpBeforeFlight=b.hp;
    elapsed=4;
    af323UpdateShots();
    const rig=AF321_RIGS[af320Resolve(a).kind]?.atk||null;
    results.push({id,name:HERO_INFO[id].name,role:card.role,delivery:card.delivery,
      expected:af268Gun(a)?'shell':card.delivery==='bow'?'arrow':card.delivery==='cast'?'bolt':
        card.delivery==='bullet'?'bullet':'melee',
      projectile:pending[0]||'melee',shotCount:pending.length,farBlocked:far===false,
      damage:hp-b.hp,damageBeforeFlight:hp-hpBeforeFlight,cardBaseDamage:card.hit,
      levelDamage:stats.atk,range:unitAttackRange(a),rig,
      attackPose:rig?af309AttackStyle(a,rig):'atlas attack frames',
      basicEffect:af323Style(a),atlas:AFNewMinions.has(id),ability:AF285_DEFS[id]?.name||AF285_DEFS[id]?.n||af327Pas(a)?.n||null});
  }
  units=[];af323Shots=[];af323Resolved=[];
  return results;
};
`;

async function main() {
  const marker = '})();\n\n\n\n</script>\n<script id="v246HeroicHomeLayout">';
  const base = readFileSync(htmlPath, 'utf8');
  assert.ok(base.includes(marker));
  const html = base.replace(marker, probe + marker);
  const separator = html.indexOf('<script data-bundled="afp_motor.js">');
  assert.ok(separator > 0);
  const waiting = new Map();
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.write(html.slice(0, separator));
    waiting.set(req.url, () => res.end(html.slice(separator)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
    for (const [width, height] of [[740,360],[667,375]]) {
      const page = await browser.newPage({ viewport:{width,height} });
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort());
      const route = '/'+width;
      await page.goto('http://127.0.0.1:'+server.address().port+route,{waitUntil:'commit'});
      const splash=page.locator('#af309-boot');
      await splash.waitFor({state:'visible'});
      await page.evaluate(async()=>{
        const css=getComputedStyle(document.getElementById('af309-boot')).backgroundImage;
        const source=css.match(/data:image\/webp;base64,[A-Za-z0-9+/=]+/)[0];
        const image=new Image();image.src=source;await image.decode();
      });
      assert.deepEqual(await splash.boundingBox(),{x:0,y:0,width,height});
      await page.screenshot({path:path.join(out,`v309-acilis-${width}x${height}.png`),timeout:12000});
      waiting.get(route)();
      await page.waitForFunction(()=>window.afp309BootReady===true,{},{timeout:35000});
      assert.equal(await splash.isVisible(),false);
      const layout=await page.evaluate(()=>({
        width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,
        modeIds:Object.keys(window.AFPModeNetworkV1.modes),
        version:document.querySelector('meta[name="afp-build"]').content,
        title:document.title,
      }));
      assert.equal(layout.width,width);
      assert.equal(layout.height,height);
      assert.equal(layout.version,'v3.60.309');
      assert.deepEqual(layout.modeIds.filter(id=>id!=='lhs').sort(),['arena','boss','campaign','colossus','dark','flag','secret','sky','tower']);
      await page.screenshot({path:path.join(out,`v309-ana-us-${width}x${height}.png`)});
      if(width===740){
        const rows=await page.evaluate(()=>window.af309CombatTest());
        writeFileSync(path.join(out,'v309-59-minyon.json'),JSON.stringify(rows,null,2));
        assert.equal(rows.length,59);
        assert.equal(new Set(rows.map(r=>r.id)).size,59);
        for(const r of rows){
          assert.equal(r.farBlocked,true,r.name+' menzil');
          assert.equal(r.projectile,r.expected,r.name+' mermi');
          assert.equal(r.shotCount,r.expected==='melee'?0:1,r.name+' mermi sayısı');
          if(r.shotCount)assert.equal(r.damageBeforeFlight,0,r.name+' erken hasar');
          assert.ok(r.damage>0,r.name+' hasar');
          assert.ok(r.ability,r.name+' yetenek tanımı');
        }
      }
      assert.deepEqual(errors,[]);
      console.log(JSON.stringify({viewport:[width,height],...layout}));
      await page.close();
    }
  } finally {
    for(const release of waiting.values())release();
    await browser?.close();
    server.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
