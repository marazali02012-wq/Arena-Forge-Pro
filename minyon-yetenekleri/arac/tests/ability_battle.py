"""Yeteneklerin gerçek kart, savaş döngüsü ve ikinci koltukla doğrulanması."""
import asyncio
import json
import pathlib
import sys

from group5_battle import prepare
from harness import Game

MATCHUPS={
  12: {
    'afn_sicrayan_kocbasi': ('leap',.55),
    'afn_toprak_yarici': ('tunnel',.57),
    'afn_zincir_kiran': ('hook',.62),
    'mage': ('seal',.49),
  },
  11: {
    'afn_kok_titani': ('roots',.41),
    'afn_kutup_kiricisi': ('strip',.38),
    'afn_mantar_davulcusu': ('drum',.42),
    'afn_ocak_dovucusu': ('forge',.40),
    'afn_sedef_pervane': ('fan',.51),
  },
  10: {
    'af37_kizil_duellocu': ('duel',.383),
    'afn_kehribar_sovalye': ('cover',.40),
    'afn_kiragi_dokuyucusu': ('bind',.47),
    'afn_kirik_kuklaci': ('puppet',.55),
    'afn_kirik_saat_efendisi': ('clock',.49),
  },
  9: {
    'afn_buz_zurnacisi': ('horn',.40),
    'afn_donuk_mizrakci': ('spear',.49),
    'afn_el_arabali_topcu': ('artillery',.49),
    'afn_gece_yirticisi': ('bite',.62),
    'afn_kapi_ustasi': ('repair',.54),
  },
  8: {
    'af37_tas_devi': ('quake',.375),
    'af37_zehirci': ('poison',.49),
    'afn_alize_bicakli': ('dash',.425),
    'afn_ayaz_kalkanlisi': ('ice_shell',.37),
    'afn_bulut_dalgici': ('air',.48),
  },
  7: {
    'af37_ork_savasci': ('ram',.42),
    'af37_orman_okcu': ('slow',.48),
    'af37_ruh_cagirici': ('summon',.46),
    'af37_samuray': ('counter',.365),
    'af37_savas_muhendisi': ('bomb',.51),
  },
  6: {
    'af37_kristal_golem': ('crystal',.365),
    'af37_lav_golemi': ('lava',.39),
    'af37_mavi_buyucu': ('twin',.49),
    'af37_muhendis_nisanci': ('pierce',.51),
    'af37_nekromanci': ('soul',.43),
  },
}

async def check_case(host, peer, typ, effect, x, side):
    q='window.__AF285QA'
    companion='af37_cuce_savasci' if effect in {'horn','cover','drum','forge'} else None
    card,actor,target,friend,foe=await prepare(host,typ,companion,'mark',side)
    x=x if side=='ally' else 1-x
    await host.ev('([id,t,x])=>window.__AF285QA.move(id,t,x)',[target,foe,x])
    if effect=='repair':
        await host.ev('t=>window.__AF285QA.setPortal(t,300)',side)
    if effect=='bite':
        await host.ev('([id,t])=>{const u=window.__AF285QA.find(id,t);u.hp=u.maxHp=200;}',[target,foe])
    if effect=='strip':
        await host.ev('([id,t])=>{const u=window.__AF285QA.find(id,t);u.absorb=180;u.absorbUntil=30;}',[target,foe])
    if effect=='fan':
        deployed=await host.play(foe,'af37_orman_okcu',1,.59 if foe=='enemy' else .41)
        shooter=deployed['uids'][0]
        await host.ev('([id,t,x])=>{const q=window.__AF285QA;q.move(id,t,x);q.stun(id,t,10);}',[shooter,foe,x])
    if effect in {'bomb','spear','artillery','roots'}:
        second_card=await host.play(foe,'af37_cuce_savasci',1,max(.49,x) if foe=='enemy' else min(.47,x))
        second=second_card['uids'][0]
        await host.ev('([id,t,x])=>{const q=window.__AF285QA;q.move(id,t,x);q.stun(id,t,8);}',[second,foe,x+(.055 if side=='ally' else -.055)])
    if effect=='soul':
        await host.ev('([id,t])=>window.__AF285QA.kill(id,t)',[target,foe])
    await host.qa(f'{q}.drawEvery=14')
    wind=await host.ev('t=>window.__AF285QA.stepUntil(6,"ab-wind",t)',typ)
    checks={'kart':card['spent']==await host.ev('t=>window.__AF285QA.cost(t)',typ),
            'hazirlik':wind['hit'] and wind['e']['su']==actor and wind['e']['team']==side}
    if not wind['hit']: return checks
    cast=await host.ev('t=>window.__AF285QA.stepUntil(2,"ab-cast",t)',typ)
    checks['kullanim']=cast['hit']
    cast_fx=await host.qa(f'{q}.fxList()')
    if effect in {'leap','tunnel'}:
        await host.step(.18)
        moving=await host.ev('''([id,t])=>{
          const q=window.__AF285QA,u=q.find(id,t);
          return {x:u.x,lane:u.lane,buried:u._af285TunnelUntil>q.state().elapsed};
        }''',[actor,side])
        checks['hareket']=abs(moving['x']-cast['e']['ux'])>.008 and moving['lane']==1
        if effect=='tunnel': checks['yeralti']=moving['buried']
    if effect=='hook':
        checks['kanca_ucusta']=any(f['card']==typ and f['k']=='hook_throw' for f in cast_fx)

    if effect=='air':
        checks['havada_korunuyor']=await host.ev('''([id,side,a,foe])=>{
          const q=window.__AF285QA,u=q.find(id,side),s=q.find(a,foe),hp=u.hp;
          return u._af285AirUntil>q.state().elapsed&&q.testDamage(u,s,12)===0&&u.hp===hp;
        }''',[actor,side,target,foe])
    impact=await host.ev('t=>window.__AF285QA.stepUntil(2,"ab-impact",t)',typ)
    checks['etki_ani']=impact['hit']
    if not impact['hit']: return checks
    effects=cast_fx+await host.qa(f'{q}.fxList()')
    if effect=='hook':
        await host.step(.15)
        tether=await host.ev('''([id,t])=>{
          const q=window.__AF285QA,u=q.find(id,t);
          return {x:u.x,lane:u.lane,attached:u._af285DragEnd>q.state().elapsed};
        }''',[target,foe])
        checks['zincir_bagli']=tether['attached'] and tether['lane']==1
        checks['cekis_sirasinda_konum']=abs(tether['x']-x)>.007 and abs(tether['x']-x)<.21
        effects.extend(await host.qa(f'{q}.fxList()'))

    if effect=='fan':
        await host.ev('''([actor,side,shooter,foe])=>{
          const q=window.__AF285QA,u=q.find(actor,side),s=q.find(shooter,foe);
          q.testProjectile(s,u,20);
        }''',[actor,side,shooter,foe])
    if effect=='duel':
        checks['gercek_sonuc']=await host.ev('''([id,side,t,foe])=>{
          const q=window.__AF285QA,u=q.find(id,side),v=q.find(t,foe);
          u._afTgt=v;
          const fast=q.period(u),hit=q.testDamage(v,u,20);
          u._af285DuelUntil=0;
          return fast<q.period(u)&&hit>q.testDamage(v,u,20);
        }''',[actor,side,target,foe])
    if effect=='cover':
        checks['gercek_sonuc']=await host.ev('''([id,side,friend,t,foe])=>{
          const q=window.__AF285QA,u=q.find(id,side),v=q.find(t,foe),a=q.find(friend,side);
          q.move(t,foe,u.x+(side==='ally'?.045:-.045));
          const h=u.hp,enemy=v.hp,dealt=q.testDamage(a,v,40,'hit');
          return dealt<40&&u.hp<h&&v.hp<enemy;
        }''',[actor,side,friend,target,foe])
    if effect=='counter':
        counter=await host.ev('''([id,t,source,foe])=>{
          const q=window.__AF285QA,u=q.find(id,t),a=q.find(source,foe);
          q.move(source,foe,u.x+(t==='ally'?.037:-.037));
          const before=a.hp, damage=q.testDamage(u,a,28,'hit');
          return {before,after:a.hp,damage};
        }''',[actor,side,target,foe])
        checks['gercek_sonuc']=counter['damage']<=7 and counter['before']>counter['after']

    if effect in {'crystal','ice_shell'}:
        absorb=await host.ev('''([id,t,source,foe])=>{
          const q=window.__AF285QA,u=q.find(id,t),a=q.find(source,foe),before=u.absorb;
          for(let i=0;i<30&&u.hp>0&&u.absorb>0;i++)q.testDamage(u,a,12);
          return [before,u.absorb];
        }''',[actor,side,target,foe])
        checks['kalkan_kirildi']=absorb[0]>0 and absorb[1]==0
    beginning=await host.qa(f'{q}.snapshot().units.filter(u=>u.isSummon)') if effect in {'soul','summon'} else []
    await host.step(.08)
    effects.extend(await host.qa(f'{q}.fxList()'))
    await host.step(.87 if effect=='bite' else .70)
    log=await host.events(wind['t'])
    damage=[e for e in log if e['k']=='dmg' and e.get('su')==actor and e.get('tu')==target and str(e.get('kind','')).startswith('af285')]
    if effect=='crystal':
        checks['gercek_sonuc']=bool(damage)
    elif effect=='lava':
        checks['gercek_sonuc']=len(damage)>=2 and damage[-1]['t']-damage[0]['t']>.3
        await host.ev('([id,t,x])=>window.__AF285QA.move(id,t,x)',[target,foe,1-x])
        await host.step(.7)
        later=await host.events(damage[-1]['t']+.06) if damage else []
        checks['alan_disi_guvenli']=not any(e['k']=='dmg' and e.get('su')==actor and e.get('kind')=='af285Magic' for e in later)
    elif effect=='twin':
        checks['gercek_sonuc']=len(damage)==2 and damage[1]['t']>damage[0]['t']
    elif effect=='pierce':
        values=[e for e in log if e['k']=='inc' and e.get('su')==actor and e.get('kind')=='af285Pierce']
        checks['gercek_sonuc']=bool(damage) and bool(values) and .86<values[0]['post']/values[0]['pre']<.95
    elif effect=='ice_shell':
        checks['gercek_sonuc']=any(e['k']=='slow' and e.get('tu')==target for e in log)
    elif effect=='poison':
        checks['gercek_sonuc']=any(e['k']=='dot' and e.get('su')==actor and e.get('tu')==target for e in log)
        ticks=[e for e in log if e['k']=='dmg' and e.get('tu')==target and e.get('kind')=='dot']
        checks['can_azaldi']=bool(ticks) or any(e['k']=='dmg' and e.get('tu')==target and 'poison' in str(e.get('kind')) for e in log)
    elif effect in {'dash','air'}:
        position=await host.ev('([id,t])=>window.__AF285QA.find(id,t).x',[actor,side])
        checks['gercek_sonuc']=bool(damage) and (position-(.32 if side=='ally' else .68))*(1 if side=='ally' else -1)>.05
    elif effect in {'ram','quake'}:
        moved=await host.ev('([id,t])=>window.__AF285QA.find(id,t).x',[target,foe])
        checks['gercek_sonuc']=bool(damage) and (moved-x)*(1 if side=='ally' else -1)>.025
    elif effect=='slow':
        checks['gercek_sonuc']=bool(damage) and any(e['k']=='slow' and e.get('tu')==target for e in log)
    elif effect in {'leap','tunnel'}:
        checks['gercek_sonuc']=bool(damage)
    elif effect=='hook':
        contact=await host.ev('''([id,t,source,s])=>{
          const q=window.__AF285QA,u=q.find(id,t),v=q.find(source,s);
          return {x:u.x,distance:Math.abs(u.x-v.x),free:!(u._af285DragEnd>q.state().elapsed)};
        }''',[target,foe,actor,side])
        checks['gercek_sonuc']=bool(damage) and abs(contact['x']-x)>.075 and contact['distance']<.09
        checks['cekis_bitti']=contact['free']
    elif effect=='seal':
        checks['gercek_sonuc']=bool(damage) and damage[0]['t']>impact['e']['t']+.08
        checks['savunma_zayifladi']=await host.ev('''([id,t])=>{
          const q=window.__AF285QA,v=q.find(id,t);return v.vuln>.16&&v.vulnUntil>q.state().elapsed;
        }''',[target,foe])
    elif effect=='roots':
        bound={e.get('tu') for e in log if e['k']=='root' and e.get('su')==actor}
        checks['gercek_sonuc']={target,second}<=bound
    elif effect=='strip':
        checks['gercek_sonuc']=await host.ev('''([t,foe])=>{
           const q=window.__AF285QA,v=q.find(t,foe);
           return v.absorb<180&&v._af264CrackUntil>q.state().elapsed;
        }''',[target,foe])
    elif effect=='drum':
        record=await host.ev('''([t,side])=>{
           const q=window.__AF285QA,v=q.find(t,side);return {now:q.period(v),base:v.attackPeriod};
        }''',[friend,side])
        checks['gercek_sonuc']=record['now']<record['base']*.8
        await host.step(2.1)
        checks['hiz_normale_dondu']=await host.ev('''([t,side])=>{
           const q=window.__AF285QA,v=q.find(t,side);return v._af267TempoUntil<=q.state().elapsed;
        }''',[friend,side])
    elif effect=='forge':
        checks['gercek_sonuc']=await host.ev('''([t,side,i,foe])=>{
           const q=window.__AF285QA,u=q.find(t,side),v=q.find(i,foe);
           const hit=q.attackStrength(u,v,40);u._af285ForgeUntil=0;
           return hit>q.attackStrength(u,v,40);
        }''',[friend,side,target,foe])
        checks['yanma']=any(e['k']=='dot' and e.get('su')==actor and e.get('tu')==target for e in log)
    elif effect=='fan':
        ready=await host.ev('([id,t])=>window.__AF285QA.find(id,t)._af285FanReady',[actor,side])
        checks['gercek_sonuc']=bool(ready) and not any(e['k']=='dmg' and e.get('su')==shooter and e.get('tu')==actor for e in log)
    elif effect=='bind':
        checks['gercek_sonuc']=any(e['k']=='root' and e.get('tu')==target for e in log)
    elif effect=='puppet':
        moved=await host.ev('([t,foe])=>window.__AF285QA.find(t,foe).x',[target,foe])
        checks['gercek_sonuc']=(x-moved)*(1 if side=='ally' else -1)>.035
    elif effect=='clock':
        slowed=await host.ev('''([t,foe])=>{
          const q=window.__AF285QA,u=q.find(t,foe);
          return u.slowUntil>q.state().elapsed&&q.period(u)>u.attackPeriod*1.45;
        }''',[target,foe])
        checks['gercek_sonuc']=slowed
    elif effect=='horn':
        buffed=await host.ev('([id,t])=>window.__AF285QA.find(id,t)._af267Tempo',[friend,side])
        checks['gercek_sonuc']=buffed==.78 and any(e['k']=='slow' and e.get('tu')==target for e in log)
    elif effect=='repair':
        health=await host.qa(f'{q}.portal()')
        checks['gercek_sonuc']=health[side]==312
    elif effect=='bite':
        status=await host.ev('''([id,t])=>{
          const q=window.__AF285QA,u=q.find(id,t);
          return {x:u.x,captive:!!u._afp177CaptiveBy};
        }''',[target,foe])
        checks['gercek_sonuc']=bool(damage) and status['captive'] and abs(status['x']-x)>.05
        if not checks['gercek_sonuc']: print(typ,side,{'cast':cast['e'],'targetAfter':status,'damage':damage},flush=True)
        checks['isirik']=any(e['k']=='dmg' and e.get('tu')==target and e.get('kind')=='afp177_stomach' for e in log)
    elif effect in {'bomb','spear','artillery'}:
        victims={e.get('tu') for e in log if e['k']=='dmg' and e.get('su')==actor and e.get('kind')=='af285Physical'}
        checks['gercek_sonuc']={target,second}<=victims
    elif effect in {'summon','soul'}:
        summoned=await host.qa(f'{q}.snapshot().units.filter(u=>u.isSummon)')
        checks['gercek_sonuc']=len(summoned)==(2 if effect=='summon' else 1) and summoned[0]['team']==side and summoned[0]['summonUntil']>impact['t']+5
        if summoned:
            await host.step(.5)
            advanced=await host.qa(f'{q}.snapshot().units.filter(u=>u.isSummon)')
            history=await host.events(impact['t'])
            checks['ruh_yurudu_veya_vurdu']=any(
                b['uid']==a['uid'] and abs(b['x']-a['x'])>.008
                for a in beginning for b in advanced) or any(
                e['k']=='dmg' and any(s['uid']==e.get('su') for s in summoned)
                for e in history)
    fx=effects+await host.qa(f'{q}.fxList()')
    checks['gorsel']=any(f['card']==typ and f['k'] not in {'fizzle','label'} for f in fx) or (
        effect in {'twin','pierce'} and cast['hit'] and bool(damage))
    own=await host.ev('([id,t])=>window.__AF285QA.units().find(v=>v.uid===id&&v.team===t)',[actor,side])
    checks['toparlanma']=own and not own['busy'] and own['ab']['ready']>0
    snap=await host.qa(f'{q}.snapshot()')
    await peer.qa(f'{q}.restart()')
    await peer.qa(f'{q}.becomePeer()')
    await peer.ev('s=>window.__AF285QA.applySnapshot(s)',snap)
    await peer.step(.12)
    remote=await peer.units()
    checks['esitleme']=all(any(
        v['uid']==u['uid'] and v['team']!=u['team'] and abs(v['x']-(1-u['x']))<.002 and abs(v['hp']-u['hp'])<1
        for v in remote) for u in snap['units'] if not u.get('isBarrier') and not u.get('isCommander'))
    clock=await peer.qa(f'{q}.state().elapsed')
    checks['tek_yetkili']=clock==snap['elapsed'] and not await peer.events(0)
    report=await host.qa(f'{q}.state()')
    checks['savas_hatasi']=report['tickErrors']==report['drawErrors']==0
    return checks

async def main(html, number, report, only=None):
    output=pathlib.Path(report)
    out=json.loads(output.read_text()) if only and output.exists() else {}
    async with Game(html,740,360,mobile=True) as host, Game(html,667,375,mobile=True,browser=host.browser) as peer:
        await host.start_battle()
        await peer.start_battle()
        for typ,(effect,x) in MATCHUPS[int(number)].items():
            if only and typ not in only.split(','): continue
            out[typ]={}
            for side in ('ally','enemy'):
                try:
                    checks=await check_case(host,peer,typ,effect,x,side)
                except Exception as exc:
                    print(typ,side,repr(exc),flush=True)
                    checks={'exception':False}
                out[typ][side]=checks
                print(typ,side,checks,flush=True)
    output.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    return all(all(all(checks.values()) for checks in sides.values()) for sides in out.values())

if __name__=='__main__':
    sys.exit(0 if asyncio.run(main(*sys.argv[1:])) else 1)
