"""Kanca uçuşu, zırh, tek kullanımlık kırılganlık ve ayrı mızrak darbeleri."""
import asyncio
import json
import pathlib
import sys

from group5_battle import prepare
from harness import Game


async def until(game, typ, stage):
    return await game.ev('([t,s])=>window.__AF285QA.stepUntil(5,s,t)', [typ,stage])


async def main(html, report):
    results={}
    async with Game(html,740,360,mobile=True) as game:
        await game.start_battle()
        q='window.__AF285QA'
        hook='afn_zincir_kiran'
        for failure in ('hat_degisimi','boss_bagisikligi','hedef_olumu'):
            _,u,t,_,foe=await prepare(game,hook,None,'mark','ally')
            await game.ev('([t,f])=>window.__AF285QA.move(t,f,.62)',[t,foe])
            if failure=='boss_bagisikligi':
                await game.ev('([t,f])=>{window.__AF285QA.find(t,f).isBoss=true;}',[t,foe])
                results[failure]=not (await until(game,hook,'ab-cast'))['hit']
                continue
            cast=await until(game,hook,'ab-cast')
            if failure=='hat_degisimi':
                await game.ev('([t,f])=>{window.__AF285QA.find(t,f).lane=2;}',[t,foe])
            else:
                await game.ev('([t,f])=>window.__AF285QA.kill(t,f)',[t,foe])
            await game.step(1.5)
            ev=await game.events(0)
            fx=await game.qa(f'{q}.fxList()')
            results[failure]=cast['hit'] and not any(e['k']=='dmg' and e.get('su')==u and e.get('tu')==t and e.get('kind')=='af285Physical' for e in ev) and not any(f['k']=='pull_line' for f in fx)
        for typ,case in [('af37_agir_zirhli','shield'),('af37_buz_elementali','brittle'),
                         ('af37_buz_muhafizi','chill'),('af37_dovus_ustasi_ii','double')]:
            helper='af37_orman_okcu' if case=='shield' else None
            _,u,t,f,foe=await prepare(game,typ,helper,'pair','ally')
            await game.ev('([t,f])=>window.__AF285QA.move(t,f,.37)',[t,foe])
            impact=await until(game,typ,'ab-impact')
            if not impact['hit']:
                results[case]=False
                continue
            if case=='shield':
                results[case]=await game.ev('''([u,t,f])=>{
                  const q=window.__AF285QA,a=q.find(u,'ally'),b=q.find(t,'enemy'),friend=q.find(f,'ally');
                  const own=a.absorb,hp=a.hp,dealt=q.testDamage(a,b,2);
                  return own>0&&friend.absorb>0&&a.absorb<own&&a.hp===hp&&dealt===0;
                }''',[u,t,f])
            elif case=='brittle':
                results[case]=await game.ev('''([u,t])=>{
                   const q=window.__AF285QA,a=q.find(u,'ally'),b=q.find(t,'enemy');
                   if(!(b._af285BrittleUntil>q.state().elapsed))return false;
                   const boosted=q.testDamage(b,a,40,'hit');
                   return b._af285BrittleUntil===0&&boosted>q.testDamage(b,a,40,'hit');
                }''',[u,t])
            elif case=='chill':
                results[case]=await game.ev('''([u,t])=>{
                   const q=window.__AF285QA,a=q.find(u,'ally'),b=q.find(t,'enemy');
                   const before=b.slowUntil||0;
                   q.testDamage(a,b,3,'hit');
                   return b.slowUntil>before&&b.slowUntil>q.state().elapsed;
                }''',[u,t])
            else:
                await game.step(.32)
                hits=[e for e in await game.events(impact['e']['t']) if e['k']=='dmg' and e.get('su')==u and e.get('tu')==t and e.get('kind')=='af285Physical']
                results[case]=len(hits)==2 and hits[1]['t']-hits[0]['t']>=.13
        state=await game.qa(f'{q}.state()')
        results['savas_hatasi']=state['tickErrors']==state['drawErrors']==0
    print(results,flush=True)
    pathlib.Path(report).write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    return all(results.values())

if __name__=='__main__':
    sys.exit(0 if asyncio.run(main(*sys.argv[1:])) else 1)
