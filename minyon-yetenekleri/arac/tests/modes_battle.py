"""Run the nine local battle entries and exercise their objective resolution."""
import asyncio
import json
import sys
from pathlib import Path

from harness import Game

MODES = dict(arena=1, tower=1, campaign=1, echo=1, colossus=1, sky=1, flag=1, dark=1, secret=1)
QA = 'window.__AF285QA'


async def start(game, mode, level=1):
    await game.ev('([m,l])=>window.__AF285QA.modeStart(m,l)', [mode, level])
    await game.page.wait_for_function('window.__AF285QA.modeRead().playing', timeout=12000)
    await game.qa(f'{QA}.setManual(true)')
    await game.qa(f'{QA}.drawEvery=24')
    return await game.qa(f'{QA}.modeRead()')


async def event(game, name):
    await game.ev('e=>window.__AF285QA.modeEvent(e)', name)
    await game.step(1.25 if name=='boss-entry' else .12)
    return await game.qa(f'{QA}.modeRead()')


async def main(html, out, only=None, width=740, height=360):
    results = {}
    async with Game(html, int(width), int(height), mobile=True) as game:
        for mode, level in (MODES.items() if only is None else ()):
            mode_data = {}
            for action in ('natural', 'enemy', 'ally'):
                try:
                    mode_data[action] = {'start': await start(game, mode, level)}
                    if action == 'natural':
                        mode_data[action]['cards'] = []
                        for lane, card in enumerate(('af37_agir_zirhli','af37_orman_okcu','af37_alev_muhafizi')):
                            mode_data[action]['cards'].append(await game.play('ally',card,lane,.22))
                            await game.step(.8)
                        for _ in range(40):
                            state=await game.qa(f'{QA}.modeRead()')
                            if not state['playing']:
                                break
                            if state['wave'] and state['wave']['choice']:
                                await event(game,'echo-choice')
                            await game.step(5)
                        mode_data[action]['finish']=await game.qa(f'{QA}.modeRead()')
                    else:
                        mode_data[action]['card']=await game.play('ally','af37_agir_zirhli',1,.22)
                        mode_data[action]['finish']=await event(game,action)
                except Exception as exc:
                    mode_data.setdefault(action,{})['exception']=str(exc)
            results[mode]=mode_data
            print(mode,json.dumps({k:(v.get('finish') or v) for k,v in mode_data.items()},ensure_ascii=False),flush=True)
        for case,mode,level,events in (
            ('echo_timeout','echo',1,['half-enemy','before-echo-timeout','timeout']),
            ('campaign_defense','campaign',3,['enemy','timeout']),
            ('campaign_defense_both','campaign',3,['both']),
            ('flag_score','flag',1,['flag-lead','timeout']),
            ('flag_goal','flag',1,['flag-goal']),
            ('flag_tie','flag',1,['half-enemy','timeout']),
            ('flag_absent','flag',1,['flag-absent']),
            ('colossus_timeout','colossus',1,['half-enemy','timeout']),
            ('colossus_one_hp','colossus',1,['boss-entry','one-enemy','enemy']),
            ('colossus_equal_timeout','colossus',1,['boss-entry','timeout']),
            ('guardian_timeout','tower',5,['enemy','timeout']),
            ('tower_guardian','tower',5,['enemy','guardian-down','enemy']),
            ('sky_guardian','sky',5,['enemy','guardian-down','enemy']),
        ):
            try:
                data={'start':await start(game,mode,level),'card':await game.play('ally','af37_agir_zirhli',1,.22)}
                data['states']=[await event(game,e) for e in events]
                results[case]=data
                print(case,json.dumps(data['states'],ensure_ascii=False),flush=True)
            except Exception as exc:
                results[case]={'exception':str(exc)}
        await start(game,'echo')
        await game.play('ally','af37_agir_zirhli',1,.20)
        phases=[]
        seen=set()
        for _ in range(125):
            await game.step(1)
            state=await game.qa(f'{QA}.modeRead()')
            wave=state['wave']
            if wave and wave['wave'] not in seen:
                seen.add(wave['wave'])
                phases.append(wave['wave'])
            if not state['playing']:
                break
            if wave and wave['choice']:
                await event(game,'echo-choice')
            await event(game,'echo-clear')
        results['echo_full']={'waves':phases,'finish':await game.qa(f'{QA}.modeRead()')}
        for mode, target in (('colossus','colossus'),('echo','boss')):
            await start(game,mode)
            await game.play('ally','af37_agir_zirhli',1,.20)
            await event(game,'ally')
            try:
                await game.page.locator('[data-afqv-act="go"]:visible').click(timeout=5000)
                await game.page.locator(f'#afxModeScreen[data-mode="{target}"]').wait_for(state='visible',timeout=5000)
                results[f'{mode}_return']=True
            except Exception as exc:
                results[f'{mode}_return']=str(exc)
        results['browser_errors']=game.errors()
        await start(game,'arena')
        await event(game,'mark-pending')
        await start(game,'tower')
        await game.step(.36)
        results['stale_abilities']=await game.qa(f'{QA}.modeRead()')
        print('stale_abilities',json.dumps(results['stale_abilities'],ensure_ascii=False),flush=True)
    if only is None:
        closed=lambda r: not r['playing'] and r['resultVisible'] and r['tickErrors']==0 and r['drawErrors']==0
        checks={}
        for mode in MODES:
            d=results[mode]
            checks[mode]=all('exception' not in row and row['start']['playing'] for row in d.values()) and (
                closed(d['natural']['finish']) and all(c['ok'] for c in d['natural']['cards'])
                and closed(d['ally']['finish']) and d['ally']['finish']['outcome']=='loss'
                and (d['enemy']['finish']['playing'] if mode=='echo' else (
                    closed(d['enemy']['finish']) and d['enemy']['finish']['outcome']=='win')))
        def states(test):
            return results[test].get('states',[])
        checks.update(
            echo_timeout=states('echo_timeout')[-2]['playing'] and closed(states('echo_timeout')[-1]) and 'SÜRE DOLDU' in states('echo_timeout')[-1]['end'],
            campaign_defense=states('campaign_defense')[0]['playing'] and closed(states('campaign_defense')[-1]) and 'ZAFER' in states('campaign_defense')[-1]['end'],
            campaign_defense_both=closed(states('campaign_defense_both')[-1]) and 'DÜŞTÜ' in states('campaign_defense_both')[-1]['end'],
            flag_score=closed(states('flag_score')[-1]) and 'ZAFER' in states('flag_score')[-1]['end'],
            flag_goal=closed(states('flag_goal')[-1]) and 'ZAFER' in states('flag_goal')[-1]['end'],
            flag_tie=closed(states('flag_tie')[-1]) and 'BERABERLİK' in states('flag_tie')[-1]['end'],
            flag_absent=states('flag_absent')[-1]['flag']['cap']==[0,0,0],
            tower_guardian=states('tower_guardian')[0]['playing'] and states('tower_guardian')[0]['guardian'] and closed(states('tower_guardian')[-1]),
            sky_guardian=states('sky_guardian')[0]['playing'] and states('sky_guardian')[0]['guardian'] and closed(states('sky_guardian')[-1]),
            colossus_timeout=closed(states('colossus_timeout')[-1]) and 'BAŞARISIZ' in states('colossus_timeout')[-1]['end'],
            colossus_one_hp=states('colossus_one_hp')[0]['guardian'] and states('colossus_one_hp')[1]['playing'] and closed(states('colossus_one_hp')[-1]),
            colossus_equal_timeout=states('colossus_equal_timeout')[0]['guardian'] and closed(states('colossus_equal_timeout')[-1]) and states('colossus_equal_timeout')[-1]['outcome']=='loss',
            guardian_timeout=closed(states('guardian_timeout')[-1]) and 'MUHAFIZ YENİLEMEDİ'==states('guardian_timeout')[-1]['end'],
            stale_abilities=results['stale_abilities']['portal'][1]==430,
            echo_full=results['echo_full']['waves']==[1,2,3] and closed(results['echo_full']['finish']) and results['echo_full']['finish']['wave']['defeated'],
            colossus_return=results['colossus_return'] is True,
            echo_return=results['echo_return'] is True,
            browser_errors=not results['browser_errors'],
        )
        results['checks']=checks
        print('checks',json.dumps(checks),flush=True)
    Path(out).write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
    return all(results.get('checks',{}).values())


if __name__=='__main__':
    sys.exit(0 if asyncio.run(main(*sys.argv[1:])) else 1)
