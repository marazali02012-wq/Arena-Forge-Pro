#!/usr/bin/env python3
"""Diğer sistemler bozuldu mu? Hızlı denetim: eski kural kontrol kartı, eski QA testleri, 59 minyon/nadirlik/enerji, hata sayaçları,
9 oyun modunun motorda tanımlı olması ve kayıt anahtarı. Kullanım: system_check.py QA.html ORIJINAL_QA.html ÇIKTI.json"""
import sys, asyncio, json, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from harness import Game
from group_test import run_control

MODES_JS = '''() => { const ids = ['arena','duel','tower','campaign','boss','echo','sky','flag','secret'];
  const src = document.documentElement.innerHTML; return ids.map(id => [id, src.split("'"+id+"'").length - 1]); }'''

async def main(html, orig, out):
    res = {}
    async with Game(html) as g:
        await g.start_battle()
        res['control'] = await run_control(g)
        res['legacy'] = await g.qa('window.__AF285QA.legacyTests()')
        res['roster'] = await g.qa('window.__AF285QA.roster()')
        res['modes'] = await g.ev(MODES_JS)
        res['saveKey'] = await g.ev("() => Object.keys(localStorage).filter(k => /arenaForgePro/i.test(k))")
        res['state'] = await g.qa('window.__AF285QA.state()')
        res['abilities'] = await g.qa('window.AF285Abilities.list()')
        res['errors'] = g.errors()
    async with Game(orig) as o:
        await o.start_battle()
        res['legacyOrig'] = await o.qa('window.__AF285QA.legacyTests()')
        res['rosterOrig'] = await o.qa('window.__AF285QA.roster()')
        res['modesOrig'] = await o.ev(MODES_JS)
    ro, rn = res['rosterOrig'], res['roster']
    strip = lambda d: {k: v for k, v in d.items() if k != 'hands'}
    res['unchanged'] = {'count59': rn['count'] == 59 == ro['count'], 'ids': ro['ids'] == rn['ids'], 'rarity': ro['rarity'] == rn['rarity'],
                        'costs': ro['costs'] == rn['costs'], 'deck12': rn['deckSize'] == 12,
                        'legacySame': json.dumps(strip(res['legacy']), sort_keys=True) == json.dumps(strip(res['legacyOrig']), sort_keys=True),
                        'openingHandsOk': bool(res['legacy'].get('hands', {}).get('passed')),
                        'modesPresent': all(n > 0 for _, n in res['modes']), 'noErrors': not res['errors'] and res['state']['tickErrors'] == 0 and res['state']['drawErrors'] == 0,
                        'controlLegacyRule': res['control']['ok']}
    pathlib.Path(out).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(res['unchanged'], ensure_ascii=False))
    print('control', res['control'], 'rarity', rn['rarity'])

asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3]))
