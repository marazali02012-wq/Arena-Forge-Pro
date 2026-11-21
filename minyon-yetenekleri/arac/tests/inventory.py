#!/usr/bin/env python3
"""59 minyonun MEVCUT yetenek davranışını gerçek savaş döngüsünde ölçer.

Her minyon için iki sahne koşulur (S1 saldırı, S2 destek). Olaylar QA kancasından okunur:
  rule   : AF267 kuralı çözüldü (gerçek etki uygulandı)
  guard  : AF267 savunma kuralı gelen hasarı azalttı
  signal : AF273 görsel sinyali çizildi
  dmg/heal/shield/root/slow/push/dot/delay/devour : savaş durumuna yazılan etkiler
Çıktı: JSON + Markdown özet.
"""
import sys, asyncio, json, pathlib, collections
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from harness import Game

SCENES = {
    'S1': {'enemy': [('af37_agir_zirhli', 1, .60), ('af37_kilicli_asker', 1, .66), ('af37_orman_okcu', 1, .74)],
           'ally_extra': []},
    'S2': {'enemy': [('af37_ork_savasci', 1, .62), ('af37_samuray', 1, .68), ('af37_arbaletci', 1, .74)],
           'ally_extra': [('af37_kilicli_asker', 1, .38)]},
}
DUR = 14.0


async def run_scene(g, typ, scene):
    await g.qa('window.__AF285QA.restart()') if await g.qa('window.__AF285QA.state().elapsed') > 120 else None
    await g.qa('window.__AF285QA.clearUnits()')
    await g.qa('window.__AF285QA.healPortals()')
    t0 = (await g.qa('window.__AF285QA.state()'))['elapsed']
    await g.qa('window.__AF285QA.resetLog()')
    placed = []
    for (et, lane, x) in SCENES[scene]['ally_extra']:
        placed.append(('ally', et, await g.play('ally', et, lane, x)))
    placed.append(('ally', typ, await g.play('ally', typ, 1, .30)))
    for (et, lane, x) in SCENES[scene]['enemy']:
        placed.append(('enemy', et, await g.play('enemy', et, lane, x)))
    await g.step(DUR)
    ev = await g.events(t0)
    mine = [e for e in ev if e.get('src') == typ and e.get('team') in ('ally', None)]
    c = collections.Counter(e['k'] for e in mine)
    kinds = collections.Counter(e.get('kind') for e in mine if e['k'] == 'dmg')
    stages = collections.Counter(e.get('stage') for e in mine if e['k'] == 'signal')
    effects = collections.Counter(e.get('effect') for e in mine if e['k'] == 'rule')
    abil_dmg = sum(e['v'] for e in mine if e['k'] == 'dmg' and str(e.get('kind', '')).startswith(('af267', 'af264')))
    basic_dmg = sum(e['v'] for e in mine if e['k'] == 'dmg' and not str(e.get('kind', '')).startswith(('af267', 'af264')))
    heal = sum(e['v'] for e in mine if e['k'] == 'heal')
    return {'counts': dict(c), 'dmgKinds': dict(kinds), 'stages': dict(stages), 'ruleEffects': dict(effects),
            'abilityDamage': round(abil_dmg, 1), 'otherDamage': round(basic_dmg, 1), 'heal': round(heal, 1),
            'placed': [(t, ty, r.get('ok'), r.get('spawned')) for (t, ty, r) in placed]}


def classify(rec):
    s = [rec['S1'], rec['S2']]
    trig = sum(x['counts'].get('rule', 0) + x['counts'].get('guard', 0) for x in s)
    sig = sum(x['counts'].get('signal', 0) for x in s)
    eff = sum(sum(x['counts'].get(k, 0) for k in ('heal', 'shield', 'root', 'slow', 'push', 'dot', 'delay', 'devour', 'armor', 'ice', 'pierce', 'timed')) for x in s)
    abil = sum(x['abilityDamage'] for x in s)
    has_def = rec['rule'] is not None or rec['af264']
    real = trig > 0 or eff > 0 or abil > 0
    if not has_def:
        return 'eksik'
    if real and sig > 0:
        return 'çalışıyor'
    if real and sig == 0:
        return 'görünmez (etki var, görsel yok)'
    if sig > 0 and not real:
        return 'yalnızca görsel'
    return 'tetiklenmedi'


async def main(html, out_json, out_md, only=None):
    async with Game(html) as g:
        await g.start_battle()
        ids = await g.qa('window.AF59Roster.ids()')
        af264 = await g.qa('window.__AF285QA.af264()')
        af264_types = set(af264.values()) if isinstance(af264, dict) else set()
        results = {}
        for typ in ids:
            if only and typ not in only:
                continue
            rec = {'type': typ, 'info': await g.ev('(t)=>window.__AF285QA.info(t)', typ),
                   'cost': await g.ev('(t)=>window.__AF285QA.cost(t)', typ),
                   'rule': await g.ev('(t)=>window.__AF285QA.rule(t)', typ),
                   'af264': typ in af264_types,
                   'profile': await g.ev('(t)=>window.__AF285QA.profile(t)', typ)}
            for sc in ('S1', 'S2'):
                rec[sc] = await run_scene(g, typ, sc)
            rec['status'] = classify(rec)
            results[typ] = rec
            print(f"{typ:28s} {rec['status']:32s} S1={rec['S1']['counts']} S2={rec['S2']['counts']}", flush=True)
        errs = g.errors()
    pathlib.Path(out_json).write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding='utf-8')
    lines = ['| # | Minyon | ID | Nadirlik | Enerji | Mevcut yetenek | Durum | Kanıt (S1+S2) |', '|---|---|---|---|---|---|---|---|']
    for i, (typ, r) in enumerate(results.items(), 1):
        info = r['info'] or {}
        ab = (r['rule'] or {}).get('n') or (info.get('ability') or '').split(':')[0] or '-'
        ev = {k: r['S1']['counts'].get(k, 0) + r['S2']['counts'].get(k, 0) for k in set(r['S1']['counts']) | set(r['S2']['counts'])}
        lines.append(f"| {i} | {info.get('name','?')} | `{typ}` | {info.get('rarity','?')} | {r['cost']} | {ab} | {r['status']} | {ev} |")
    pathlib.Path(out_md).write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print('console errors:', errs[:10])


if __name__ == '__main__':
    only = set(sys.argv[4].split(',')) if len(sys.argv) > 4 else None
    asyncio.run(main(sys.argv[1], sys.argv[2], sys.argv[3], only))
