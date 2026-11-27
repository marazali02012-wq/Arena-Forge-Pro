'use strict';
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { createReadStream } = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const html = path.resolve(__dirname, '../app/src/main/assets/www/index.html');
const players = ['A','B'].map((id,index)=>({
  user_id:id,nickname:'Test '+id,level:index+1,trophies:100+10*index,
  friend_code:'AF309AA'+id,online:true,banned:false,unread:0,
}));
const world=[],direct=[];
let friends=false,requested=false;
const posted = [];

async function main() {
  const server=createServer((_,res)=>{
    res.setHeader('Content-Type','text/html; charset=utf-8');
    createReadStream(html).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  try{
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
    const pages=[];
    for(const [i,player] of players.entries()){
      const page=await browser.newPage({viewport:{width:740,height:360},locale:'tr-TR'});
      pages.push(page);
      page.setDefaultTimeout(12000);
      await page.addInitScript(()=>localStorage.setItem('afpFtueOffV1','1'));
      const other=players[1-i];
      await page.route(/https?:\/\/(?!127\.0\.0\.1)/,async route=>{
        const url=new URL(route.request().url()), name=url.pathname.split('/').at(-1);
        if(!url.pathname.includes('/rest/v1/rpc/'))return route.abort();
        const args=route.request().postDataJSON()||{};
        const response=body=>route.fulfill({json:body});
        switch(name){
          case 'afp_social_me':return response(player);
          case 'afp_trophy_seed_me':return response({trophies:player.trophies});
          case 'afp_social_state':return response({
            me:player,friends:friends?[other]:[],incoming:!friends&&requested&&i===1?[{...other}]:[],
            outgoing:!friends&&requested&&i===0?[{...other}]:[],blocked:[],unread:0,
          });
          case 'afp_friend_request':assert.equal(args.p_code,other.friend_code);requested=true;return response({status:'sent',nickname:other.nickname});
          case 'afp_friend_respond':friends=args.p_accept===true;return response({ok:true});
          case 'afp_world_fetch':
            return response(world.filter(m=>m.channel===args.p_channel&&m.id>args.p_after)
              .map(m=>({...m,mine:m.user_id===player.user_id})));
          case 'afp_world_send':{
            const row={...player,id:world.length+1,channel:args.p_channel,body:args.p_body,created_at:new Date().toISOString()};
            world.push(row);posted.push([player.user_id,name]);return response({...row,mine:true});
          }
          case 'afp_dm_fetch':
            return response(direct.filter(m=>m.id>args.p_after&&
              ((m.sender===player.user_id&&m.recipient===args.p_with)||(m.recipient===player.user_id&&m.sender===args.p_with)))
              .map(m=>({...m,mine:m.sender===player.user_id})));
          case 'afp_dm_send':{
            assert.equal(friends,true);
            assert.equal(args.p_to,other.user_id);
            const row={id:direct.length+1,body:args.p_body,sender:player.user_id,recipient:args.p_to,created_at:new Date().toISOString()};
            direct.push(row);posted.push([player.user_id,name]);return response({...row,mine:true});
          }
          case 'afp_trophy_leaderboard':{
            const sorted=[...players].sort((a,b)=>b.trophies-a.trophies);
            return response({authoritative:true,
              rows:sorted.map((p,j)=>({...p,rank:j+1,me:p.user_id===player.user_id})),
              me:{rank:sorted.indexOf(player)+1,total:sorted.length,trophies:player.trophies}});
          }
          default:return response({});
        }
      });
      await page.goto('http://127.0.0.1:'+server.address().port);
      await page.waitForFunction(()=>window.afp309BootReady);
      await page.locator('button[data-act="guest"]').click();
      await page.evaluate(id=>{
        localStorage.setItem('afpSupabaseSessionV1',JSON.stringify({
          access_token:'mock-token-'+id,expires_at:Math.floor(Date.now()/1000)+3600,user:{id}
        }));
        window.AFPSocialV1.open('world');
      },player.user_id);
      await page.locator('#wForm input').waitFor();
    }
    const [a,b]=pages;
    const send=async(page,form,body)=>{
      await page.locator(form+' input').fill(body);
      await page.locator(form+' button').click();
    };
    await send(a,'#wForm','A dünya testi');
    await b.locator('#wMsgs').getByText('A dünya testi').waitFor();
    await send(b,'#wForm','B dünya testi');
    await a.locator('#wMsgs').getByText('B dünya testi').waitFor();

    await a.locator('[data-tab="friends"]').click();
    await a.locator('#frAdd input').fill('AF309AAB');
    await a.locator('#frAdd button').click();
    await b.evaluate(()=>window.AFPSocialV1.open('friends'));
    await b.locator('[data-act="accept"]').click();
    await b.locator('[data-tab="dm"]').click();
    await b.locator('#dmList [data-act="open-dm"]').click();
    await a.evaluate(()=>window.AFPSocialV1.open('dm'));
    await a.locator('#dmList [data-act="open-dm"]').click();
    await send(a,'#dmForm','A özel test');
    await b.locator('#dmMsgs').getByText('A özel test').waitFor();
    await send(b,'#dmForm','B özel test');
    await a.locator('#dmMsgs').getByText('B özel test').waitFor();
    assert.equal(posted.length,4);
    assert.equal(world.length,2);assert.equal(direct.length,2);

    await a.locator('[data-tab="rank"]').click();
    await a.locator('#rkMe').getByText('#2 / 2').waitFor();
    players[0].trophies=125;
    await a.evaluate(()=>window.dispatchEvent(new Event('afp:trophies-changed')));
    await a.locator('#rkMe').getByText('#1 / 2').waitFor();
    await a.locator('#rkMe').getByText('🏆 125').waitFor();

    const online=await b.evaluate(()=>{
      const S=window.AFPOnlineSyncV68,trace=[];
      window.__AFPOnlineContext={active:true,authority:true,seat:1,modeId:'flag',matchId:'flag-309'};
      window.AFPOnlineBattleInternal={
        freezeForResult(){},
        createOnlineSnapshot(){return {snapshotSeq:1,elapsed:90,allyPortalHp:[430],enemyPortalHp:[430],units:[],flags:{done:true,score:{ally:90,enemy:10}}};},
        finishAuthoritativeResult(out,_text,info){trace.push({out,...info});},
      };
      window.__AFPOnlineMatchConnection={
        sendBattleState(){},sendBattleResult(_r,_t,data){trace.push(data.resultReason);}
      };
      S.endGate(true,'SANCAK HÂKİMİYETİ KAZANILDI · 90 puana önce ulaştın.');
      S.onServerResult({matchId:'flag-309',confirmed:true,winnerSeat:1,rewardsEnabled:true,trophyPending:true});
      const before=trace.length;
      const receipt={matchId:'flag-309',authoritative:true,ok:true,after:125,delta:25};
      S.onTrophyUpdate(receipt);S.onTrophyUpdate(receipt);
      return {before,trace};
    });
    assert.equal(online.before,1);
    assert.equal(online.trace[0],'flags');
    assert.equal(online.trace.length,2);
    assert.equal(online.trace[1].out,'win');
    assert.equal(online.trace[1].state,'rewarded');
    assert.deepEqual(online.trace[1].trophy,{after:125,delta:25});
    console.log('Mock RPC + iki Chromium oturumu: arkadaşlık, dünya sohbeti, özel mesaj, sıralama ve tek kupa makbuzu geçti.');
  }finally{
    await browser?.close();
    server.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
