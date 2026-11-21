"""Son HTML için 59 bireysel senaryo ve birden fazla tam karma maç."""
import asyncio
import json
import pathlib
import sys

from ability_battle import MATCHUPS, check_case
from group5_battle import CASES, run_case
from group_test import setup
from harness import Game
from scenarios import GROUPS


async def early_case(game, typ, spec):
    placed = await setup(game, spec)
    card = next(p for p in placed['ally'] if p['type'] == typ)
    cost = await game.ev('t=>window.__AF285QA.cost(t)', typ)
    checks = {'kart': card.get('ok', False) and card.get('spent') == cost}
    await game.qa('window.__AF285QA.drawEvery=24')
    for _ in range(3):
        wind = await game.ev('t=>window.__AF285QA.stepUntil(12,"ab-wind",t)', typ)
        if not wind['hit']:
            break
        impact = await game.ev('t=>window.__AF285QA.stepUntil(2,"ab-impact",t)', typ)
        if not impact['hit']:
            continue
        actor = impact['e']['su']
        await game.step(spec.get('window', .55))
        log = await game.events(wind['t'])
        checks['hazirlik'] = wind['e']['su'] in card['uids']
        checks['kullanim'] = any(e['k'] == 'ab-cast' and e['su'] == actor for e in log)
        checks['gercek_sonuc'] = any(
            e.get('su') == actor and e['t'] >= impact['e']['t']
            and e['k'] in {'dmg', 'dot', 'stun', 'slow', 'root', 'shield', 'heal'}
            for e in log
        )
        return checks
    return {**checks, 'tetik': False}


async def mixed_battle(game, deck, rival):
    q = 'window.__AF285QA'
    await game.qa(f'{q}.restart()')
    await game.qa(f'{q}.drawEvery=120')
    await game.ev('d=>window.__AF285QA.enableBot(d)', rival)
    used = {}
    for i, typ in enumerate(deck):
        for lane in (i % 3, (i + 1) % 3, (i + 2) % 3):
            card = await game.play('ally', typ, lane, .22)
            if card.get('ok') and card.get('spawned', 0) > 0:
                used[typ] = card['spent']
                break
        await game.step(1.1)
        if not (await game.qa(f'{q}.state()'))['playing']:
            break
    for _ in range(15):
        state = await game.qa(f'{q}.state()')
        if not state['playing'] or state['paused']:
            break
        await game.step(15)
    stats = await game.qa(f'{q}.battleReport()')
    await game.qa(f'{q}.disableBot()')
    return {
        'deck': deck,
        'played': used,
        'stats': stats,
        'ok': set(used) == set(deck) and stats['botCards'] > 0 and stats['botAbilities'] > 0
              and not stats['playing'] and stats['tickErrors'] == stats['drawErrors'] == 0,
    }


async def main(html, result_file):
    result = {'minions': {}, 'matches': []}
    async with Game(html, 740, 360, mobile=True) as host, Game(html, 667, 375, mobile=True, browser=host.browser) as peer:
        for device in (host, peer):
            start = await device.start_battle()
            if not start['ok']:
                raise RuntimeError(start)
        defined = {d['id'] for d in await host.qa('window.__AF285QA.defs()')}
        roster = (await host.qa('window.__AF285QA.roster()'))['ids']
        result['coverage'] = len(defined) == len(roster) == 59 and defined == set(roster)
        for group in range(1, 13):
            plans = GROUPS[group] if group <= 4 else CASES if group == 5 else MATCHUPS[group]
            for typ, plan in plans.items():
                try:
                    if group <= 4:
                        checks = await early_case(host, typ, plan)
                    elif group == 5:
                        companion, effect = plan
                        checks = await run_case(host, peer, typ, companion, effect, 'ally')
                    else:
                        effect, x = plan
                        checks = await check_case(host, peer, typ, effect, x, 'ally')
                except Exception as exc:
                    checks = {'exception': str(exc), 'ok': False}
                result['minions'][typ] = checks
                print(group, typ, all(checks.values()), checks if not all(checks.values()) else '', flush=True)
        # Beş maçta 59 farklı kartı oynat. Son desteyi 12'ye tamamla.
        for start in range(0, len(roster), 12):
            deck = roster[start:start+12]
            deck.extend(roster[:12-len(deck)])
            rival = roster[(start+12)%len(roster):][:12]
            rival.extend(roster[:12-len(rival)])
            match = await mixed_battle(host, deck, rival)
            result['matches'].append(match)
            print('karma maç', len(result['matches']), match['ok'], match['stats'], flush=True)
        result['browser_errors'] = host.errors()+peer.errors()
    result['passed'] = sum(all(case.values()) for case in result['minions'].values())
    result['failed'] = 59 - result['passed']
    pathlib.Path(result_file).write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    return result['coverage'] and result['failed'] == 0 and all(m['ok'] for m in result['matches'])

if __name__ == '__main__':
    sys.exit(0 if asyncio.run(main(*sys.argv[1:])) else 1)
