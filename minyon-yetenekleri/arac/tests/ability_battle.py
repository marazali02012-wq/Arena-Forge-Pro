"""Yeteneklerin gerçek kart, savaş döngüsü ve ikinci koltukla doğrulanması."""
import asyncio
import json
import pathlib
import sys

from group5_battle import prepare
from harness import Game

MATCHUPS={
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
    card,actor,target,_,foe=await prepare(host,typ,None,'mark',side)
    x=x if side=='ally' else 1-x
    await host.ev('([id,t,x])=>window.__AF285QA.move(id,t,x)',[target,foe,x])
    if effect=='bomb':
        second_card=await host.play(foe,'af37_cuce_savasci',1,x)
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
    impact=await host.ev('t=>window.__AF285QA.stepUntil(2,"ab-impact",t)',typ)
    checks['etki_ani']=impact['hit']
    if not impact['hit']: return checks
    effects=cast_fx+await host.qa(f'{q}.fxList()')
    if effect=='counter':
        counter=await host.ev('''([id,t,source,foe])=>{
          const q=window.__AF285QA,u=q.find(id,t),a=q.find(source,foe);
          q.move(source,foe,u.x+(t==='ally'?.037:-.037));
          const before=a.hp, damage=q.testDamage(u,a,28,'hit');
          return {before,after:a.hp,damage};
        }''',[actor,side,target,foe])
        checks['gercek_sonuc']=counter['damage']<=7 and counter['before']>counter['after']

    if effect=='crystal':
        absorb=await host.ev('''([id,t,source,foe])=>{
          const q=window.__AF285QA,u=q.find(id,t),a=q.find(source,foe),before=u.absorb;
          q.testDamage(u,a,before+10);return [before,u.absorb];
        }''',[actor,side,target,foe])
        checks['kalkan_kirildi']=absorb[0]>0 and absorb[1]==0
    beginning=await host.qa(f'{q}.snapshot().units.filter(u=>u.isSummon)') if effect in {'soul','summon'} else []
    await host.step(.08)
    effects.extend(await host.qa(f'{q}.fxList()'))
    await host.step(.70)
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
    elif effect=='ram':
        moved=await host.ev('([id,t])=>window.__AF285QA.find(id,t).x',[target,foe])
        checks['gercek_sonuc']=bool(damage) and (moved-x)*(1 if side=='ally' else -1)>.025
    elif effect=='slow':
        checks['gercek_sonuc']=bool(damage) and any(e['k']=='slow' and e.get('tu')==target for e in log)
    elif effect=='bomb':
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

async def main(html, number, report):
    out={}
    async with Game(html,740,360,mobile=True) as host, Game(html,667,375,mobile=True,browser=host.browser) as peer:
        await host.start_battle()
        await peer.start_battle()
        for typ,(effect,x) in MATCHUPS[int(number)].items():
            out[typ]={}
            for side in ('ally','enemy'):
                try:
                    checks=await check_case(host,peer,typ,effect,x,side)
                except Exception as exc:
                    print(typ,side,repr(exc),flush=True)
                    checks={'exception':False}
                out[typ][side]=checks
                print(typ,side,checks,flush=True)
    pathlib.Path(report).write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
    return all(all(all(checks.values()) for checks in sides.values()) for sides in out.values())

if __name__=='__main__':
    sys.exit(0 if asyncio.run(main(*sys.argv[1:])) else 1)
