#!/usr/bin/env python3
"""Bir 5'li grubun yetenek testleri (gerçek savaş döngüsü, gerçek kart yolu).

Kullanım: python3 tests/group_test.py QA.html GRUP_NO ÇIKTI_KLASÖRÜ [--orig ORIJINAL_QA.html]

Her minyon için denetlenenler:
  kart      : kart gerçek yoldan oynanıyor, enerji bedeli değişmemiş
  tetik     : yetenek gerçek savaşta başlıyor ve tamamlanıyor (hazırlık → kullanım → etki → toparlanma)
  hedef     : etki planlanan hedefe ve doğru takıma uygulanıyor; kendi takımına hasar yok
  hesap     : yetenek hasarı = round(saldırı × katsayı) (azaltma yoksa); durumlar (itme, yanma, kalkan...) uygulanıyor
  zamanlama : hasar hazırlık sırasında değil, animasyonun vuruş anında (hazırlık + kullanım × vuruş oranı)
  poz       : hazırlıkta gövde pozu ve silah geri çekilmesi, kullanımda vuruş karesi; ofsetler sınırlı
  bekleme   : ikinci kullanım bekleme süresinden önce başlamıyor, sonra yeniden kullanılıyor
  yenihedef : hedef hazırlıkta ölürse yeni hedef seçiliyor ya da yetenek temizce iptal ediliyor
  kesinti   : hazırlıkta sersemletilen birimin yeteneği bozuluyor (sınırsız değil), hata yok
  grup      : alan yeteneği birden çok grup üyesine, sınırı aşmadan uygulanıyor
  pvp       : ev sahibi anlık görüntüsü yetenek durumunu ve efektlerini taşıyor; ikinci sayfa (seat 2) aynalıyor,
              kendi başına yetenek benzetimi yapmıyor, can değerleri eşitleniyor
"""
import sys, asyncio, json, pathlib, math, time
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from harness import Game
from scenarios import GROUPS, CONTROL

POSE_DX_MAX, POSE_DY_MAX = .13, .07


def crop_for(x, lane=1):
    cx = .08 + .84 * x
    y0, y1 = {0: (.16, .52), 1: (.30, .68), 2: (.44, .82)}[lane]
    return (max(0, cx - .2), y0, min(1, cx + .2), y1)


async def setup(g, spec):
    await g.qa('window.__AF285QA.restart()')
    await g.qa('window.__AF285QA.healPortals()')
    placed = {'ally': [], 'enemy': []}
    for team in ('ally', 'enemy'):
        for (t, lane, x) in spec[team]:
            r = await g.play(team, t, lane, x)
            placed[team].append({'type': t, **r})
    for (t, ratio) in spec.get('hurt', []):
        for p in placed['ally']:
            if p['type'] == t:
                for uid in p.get('uids', []):
                    await g.ev('([u,r])=>window.__AF285QA.setHp(u,"ally",r)', [uid, ratio])
    return placed


async def step_until(g, sec, k, src, draw_every=4):
    await g.ev('(n)=>{window.__AF285QA.drawEvery=n}', draw_every)
    try:
        return await g.ev('([s,k,src])=>window.__AF285QA.stepUntil(s,k,src)', [sec, k, src])
    finally:
        await g.ev('(n)=>{window.__AF285QA.drawEvery=n}', 1)


async def run_main(g, typ, spec, defn, outdir):
    res = {'checks': {}, 'notes': []}
    ck = res['checks']
    placed = await setup(g, spec)
    mine = [p for p in placed['ally'] if p['type'] == typ][0]
    cost = await g.ev('(t)=>window.__AF285QA.cost(t)', typ)
    ck['kart'] = bool(mine['ok']) and mine['spawned'] >= 1 and mine['spent'] == cost
    res['card'] = {'ok': mine['ok'], 'spawned': mine['spawned'], 'spent': mine['spent'], 'cost': cost}
    caster_uids = mine.get('uids', [])
    t_start = (await g.qa('window.__AF285QA.state()'))['elapsed']
    res['cancelledBeforeCast'] = 0
    for attempt in range(3):
        w = await step_until(g, 14, 'ab-wind', typ)
        ck['tetik'] = bool(w['hit'])
        if not w['hit']:
            res['notes'].append('14 sn içinde yetenek başlamadı')
            return res
        e = w['e']
        res['wind'] = e
        t_w = e['t']
        caster, planned, planned_team = e['su'], e['tu'], e['tt']
        wind, cast, hit = e['wind'], e['cast'], e['hit']
        # hazırlık ortası: poz + görüntü
        await g.step(wind * .55)
        pose_w = await g.ev('([u])=>window.__AF285QA.pose(u,"ally")', [caster])
        snap = await g.qa('window.__AF285QA.snapshot()')
        await g.canvas_png(outdir / f'{typ}_1_hazirlik.png', crop_for(e['ux']))
        c = await step_until(g, 2, 'ab-cast', typ)
        if c['hit']:
            break
        # hedef hazırlıkta öldü ve menzilde yeni hedef yoksa yetenek iptal olur (doğru davranış); sonraki kullanımı ölç
        res['cancelledBeforeCast'] += 1
    await g.step(max(.04, cast * min(.5, hit * .8)))
    pose_c = await g.ev('([u])=>window.__AF285QA.pose(u,"ally")', [caster])
    await g.canvas_png(outdir / f'{typ}_2_kullanim.png', crop_for((e['ux'] + (e['tx'] or e['ux'])) / 2))
    i = await step_until(g, 2, 'ab-impact', typ)
    t_i = i['t'] if i['hit'] else None
    await g.step(.08)
    await g.canvas_png(outdir / f'{typ}_3_etki.png', crop_for(e['tx'] if e['tx'] is not None else e['ux']))
    await g.step(.5)
    await g.canvas_png(outdir / f'{typ}_3b_sonra.png', crop_for(e['tx'] if e['tx'] is not None else e['ux']))
    units_after = await g.units()
    evs = await g.events(t_w - .001)
    ab_dmg = [x for x in evs if x['k'] == 'dmg' and x.get('su') == caster and str(x.get('kind', '')).startswith('af285')]
    pre = [x for x in ab_dmg if t_i is not None and x['t'] < t_i - 1e-6]
    # zamanlama: etki = hazırlık + kullanım × vuruş oranı (± 1 kare)
    exp_impact = t_w + wind + cast * hit
    res['timing'] = {'wind_at': round(t_w, 3), 'impact_at': t_i and round(t_i, 3), 'expected': round(exp_impact, 3)}
    ck['zamanlama'] = t_i is not None and abs(t_i - exp_impact) <= .085 and not pre
    # poz
    pw_ok = bool(pose_w) and pose_w['s'] == 1 and (pose_w['tau'] is None or pose_w['tau'] < 0) and abs(pose_w['dx']) <= POSE_DX_MAX and abs(pose_w['dy']) <= POSE_DY_MAX
    pc_ok = bool(pose_c) and pose_c['s'] == 2 and (pose_c['tau'] is None or pose_c['tau'] >= 0) and abs(pose_c['dx']) <= POSE_DX_MAX and abs(pose_c['dy']) <= POSE_DY_MAX
    ck['poz'] = pw_ok and pc_ok
    res['pose'] = {'wind': pose_w, 'cast': pose_c}
    # hedef ve hesap
    eff_types = ('dmg', 'shield', 'heal', 'push', 'dot', 'delay', 'timed', 'root', 'slow', 'stun')
    win = spec.get('window', .3)
    if win > .3:
        await g.step(win - .3)
        units_after = await g.units()
        evs = await g.events(t_w - .001)
    eff = [x for x in evs if x['k'] in eff_types and (x.get('su') == caster or (x.get('su') is None and x.get('src') == typ and x.get('team') == 'ally')) and (t_i is None or x['t'] >= t_i - 1e-6) and x['t'] <= (t_i or 0) + win]
    caster_atk = next((u['atk'] for u in units_after if u['uid'] == caster), None)
    if caster_atk is None:
        caster_atk = (await g.ev('([u])=>{const v=window.__AF285QA.find(u,"ally");return v?v.atk:null}', [caster]))
    wrong = []
    hit_targets = set()
    for x in eff:
        if spec['kind'] == 'offense' and x['k'] in ('dmg', 'push', 'dot', 'delay', 'root', 'slow', 'stun') and x.get('tgTeam') == 'ally':
            wrong.append(x)
        if spec['kind'] == 'support' and x['k'] in ('shield', 'heal') and x.get('tgTeam') == 'enemy':
            wrong.append(x)
        if x['k'] in ('dmg', 'shield') or (x['k'] == 'heal' and spec['kind'] == 'support'):
            hit_targets.add(x.get('tu'))
        if x['k'] in ('root', 'slow', 'stun') and x.get('tu') is not None:
            hit_targets.add(x.get('tu'))
    planned_hit = planned in hit_targets
    planned_alive = i['e'].get('tAlive') if i.get('hit') else None
    ck['hedef'] = not wrong and (planned_hit or planned_alive is False) and len(hit_targets) >= 1
    res['targets'] = {'planned': planned, 'hit': sorted(t for t in hit_targets if t is not None), 'wrongTeam': len(wrong)}
    # hesap
    calc = []
    if spec['coef'] and caster_atk:
        # 1) yeteneğin hesapladığı ham hasar = saldırı × katsayı  2) uygulanan = min(can, round(motor azaltması sonrası))
        incs = [x for x in evs if x['k'] == 'inc' and x.get('su') == caster and (t_i is None or x['t'] >= t_i - 1e-6) and x['t'] <= (t_i or 0) + win]
        dmgs = [y for y in eff if y['k'] == 'dmg']
        for n_, x in enumerate(incs):
            raw_ok = any(abs(x['pre'] - caster_atk * c_) < 1e-6 or abs(x['pre'] - max(1, caster_atk * c_)) < 1e-6 for c_ in spec['coef'])
            d_ = next((y for y in dmgs if y.get('tu') == x['tu'] and abs(y['t'] - x['t']) < 1e-6), None)
            post = x['post']
            if post <= 0:
                app_ok = d_ is None
            else:
                want = min(max(1, round(post)), round(x['hb'])) if x['hb'] is not None else max(1, round(post))
                app_ok = d_ is not None and abs(d_['v'] - want) <= 1
            calc.append({'pre': x['pre'], 'post': post, 'dealt': d_ and d_['v'], 'hpBefore': x['hb'], 'raw_ok': raw_ok, 'applied_ok': app_ok,
                         'mitigated': round(1 - post / x['pre'], 3) if x['pre'] else None})
        ck['hesap'] = bool(calc) and all(c_['raw_ok'] and c_['applied_ok'] for c_ in calc)
    else:
        ck['hesap'] = any(x['k'] in ('shield', 'heal') for x in eff)
        shielded = {x.get('tu') for x in eff if x['k'] == 'shield'}
        domes = {u['uid']: u.get('dome') for u in units_after if u['uid'] in shielded}
        res['dome'] = domes
        if spec.get('vine'):
            healed = {x.get('tu') for x in eff if x['k'] == 'heal'}
            vines = {u['uid']: (u.get('vine'), u.get('hot')) for u in units_after if u['uid'] in healed}
            res['vine'] = vines
            ck['hesap'] = ck['hesap'] and bool(vines) and all(v_[0] is not None and v_[1] > 0 for v_ in vines.values())
        if spec.get('dome'):
            ck['hesap'] = ck['hesap'] and bool(domes) and all(d_ and d_['c'] == spec['dome'] for d_ in domes.values())
    st_seen = sorted({x['k'] for x in eff if x['k'] in ('push', 'dot', 'delay', 'shield', 'heal', 'timed', 'root', 'slow', 'stun')})
    res['calc'] = {'atk': caster_atk, 'hits': calc, 'statuses': st_seen}
    need = set(spec.get('statuses', []))
    if need - set(st_seen):
        ck['hesap'] = False
        res['notes'].append('eksik durum: ' + ','.join(sorted(need - set(st_seen))))
    if 'selfDome' in spec:
        me = next((u for u in units_after if u['uid'] == caster), None)
        res['calc']['selfDome'] = me and me.get('dome')
        ck['hesap'] = ck['hesap'] and bool(me and me.get('dome') and me['dome']['c'] == spec['selfDome'])
    if 'selfDr' in spec:
        me = next((u for u in units_after if u['uid'] == caster), None)
        ck['hesap'] = ck['hesap'] and me is not None and abs(me['dr'] - spec['selfDr']) < 1e-6
        res['calc']['selfDr'] = me and me['dr']
    # grup
    ck['grup'] = 1 <= len(hit_targets) <= spec['maxTargets']
    res['group'] = {'distinctTargets': len(hit_targets), 'max': spec['maxTargets']}
    # bekleme: ilk kullanım bitince yeni dalga gelir (koşul yeniden oluşsun); ikinci kullanım bekleme süresinden önce olamaz
    d = await step_until(g, 1.5, 'ab-done', typ)
    me_ = next((u for u in await g.units() if u['uid'] == caster), None)
    ready_in = me_['ab']['ready'] if me_ and me_.get('ab') else defn['cd']
    res['cooldownReadyIn'] = ready_in
    await g.ev('(n)=>{window.__AF285QA.drawEvery=n}', 4)
    await g.step(max(0, ready_in - 1.5))
    await g.ev('(n)=>{window.__AF285QA.drawEvery=n}', 1)
    # Test hazırlığı: ikinci dalga ölçümü için birim canlı ve kendi yarı sahasında olsun (suikastçılar ilk kullanımda düşman hattına atlar).
    me2 = next((u for u in await g.units() if u['uid'] == caster), None)
    if me2:
        await g.ev('([u])=>window.__AF285QA.setHp(u,"ally",1)', [caster])
        if me2['x'] > .42:
            await g.ev('([u])=>window.__AF285QA.move(u,"ally",.30)', [caster])
            res['notes'].append('ikinci dalga öncesi birim x=.30 konumuna alındı (test hazırlığı)')
    for (t_, lane_, x_) in spec.get('wave2', spec['enemy']):
        await g.play('enemy', t_, lane_, x_)
    if 'cooldownTarget' in spec and me2:
        await g.ev('''([id,x])=>{
          const q=window.__AF285QA, actor=q.find(id,'ally');
          const target=q.units().find(v=>v.team==='enemy'&&v.lane===actor.lane);
          if(!target)return;
          actor.x=.30;
          const unit=q.find(target.uid,'enemy');
          unit.x=x;
          unit.stunUntil=q.state().elapsed+6;
          unit.hp=unit.maxHp=2000;
        }''',[caster,spec['cooldownTarget']])
    for (t_, ratio) in spec.get('hurt', []):
        for u_ in await g.units():
            if u_['team'] == 'ally' and u_['type'] == t_:
                await g.ev('([u,r])=>window.__AF285QA.setHp(u,"ally",r)', [u_['uid'], ratio])
    w2 = await step_until(g, 12, 'ab-wind', typ)
    alive_ = any(u['uid'] == caster for u in await g.units())
    if w2['hit']:
        gap = w2['e']['t'] - t_w
        ck['bekleme'] = gap >= defn['cd'] - 1e-6
        res['cooldown'] = {'gap': round(gap, 3), 'cd': defn['cd'], 'reused': True}
    else:
        ck['bekleme'] = False
        res['cooldown'] = {'gap': None, 'cd': defn['cd'], 'reused': False}
        res['notes'].append('bekleme sonrası yeniden kullanım gözlenmedi' + ('' if alive_ else ' (birim bu sırada öldü)'))
    # pvp anlık görüntü (aynı sayfa: alanlar ve efektler)
    su = [u for u in snap['units'] if u.get('uid') == caster]
    ck_snap = bool(su) and su[0].get('_af285S') == 1 and isinstance(snap.get('af285Fx'), list) and any(f['k'] == 'label' for f in snap['af285Fx'])
    res['snapshot'] = {'unitFields': {k: su[0].get(k) for k in ('_af285S', '_af285A', '_af285B', '_af285X', '_af285N')} if su else None,
                       'fx': [f['k'] for f in snap.get('af285Fx', [])]}
    res['snapshot_ok'] = ck_snap
    res['caster'] = caster
    return res


async def run_retarget(g, typ, spec):
    await setup(g, spec)
    w = await step_until(g, 14, 'ab-wind', typ)
    if not w['hit']:
        return {'ok': False, 'why': 'başlamadı'}
    e = w['e']
    if e['tu'] is None or e['tu'] == e['su']:
        return {'ok': True, 'why': 'hedef birimin kendisi; yeniden hedef gerekmiyor'}
    killed = await g.ev('([u,t])=>window.__AF285QA.kill(u,t)', [e['tu'], e['tt']])
    r1 = await step_until(g, 2.5, 'ab-impact', typ)
    evs = await g.events(e['t'])
    cancel = [x for x in evs if x['k'] == 'ab-cancel' and x['su'] == e['su']]
    if r1['hit'] and r1['e']['su'] == e['su']:
        return {'ok': r1['e']['tu'] != e['tu'] or r1['e']['tu'] is None, 'result': 'yeni hedef', 'from': e['tu'], 'to': r1['e']['tu'], 'killed': killed}
    return {'ok': bool(cancel), 'result': 'iptal' if cancel else 'belirsiz', 'killed': killed}


async def run_interrupt(g, typ, spec, defn):
    await setup(g, spec)
    w = await step_until(g, 14, 'ab-wind', typ)
    if not w['hit']:
        return {'ok': False, 'why': 'başlamadı'}
    e = w['e']
    await g.ev('([u])=>window.__AF285QA.stun(u,"ally",1.0)', [e['su']])
    await g.step(.12)
    evs = await g.events(e['t'])
    cancel = [x for x in evs if x['k'] == 'ab-cancel' and x['su'] == e['su']]
    impact = [x for x in evs if x['k'] == 'ab-impact' and x['su'] == e['su']]
    us = await g.units()
    me = next((u for u in us if u['uid'] == e['su']), None)
    ready = me['ab']['ready'] if me and me.get('ab') else None
    exp_ready = min(3, defn['cd'] * .4)
    ok = bool(cancel) and not impact and ready is not None and abs(ready - (exp_ready - .12)) < .15
    # sersemlik bitince normal davranışa dönüyor mu (yürüme/saldırı) ve yetenek bekleme sonrası yine kullanılıyor mu
    w2 = await step_until(g, exp_ready + 6, 'ab-wind', typ)
    return {'ok': ok, 'cancelled': bool(cancel), 'impact': bool(impact), 'readyIn': ready, 'expected': round(exp_ready - .12, 2), 'reusedAfter': bool(w2['hit'])}


async def run_caster_death(g, typ, spec):
    await setup(g, spec)
    w = await step_until(g, 14, 'ab-wind', typ)
    if not w['hit']:
        return {'ok': False, 'why': 'başlamadı'}
    e = w['e']
    await g.ev('([u])=>window.__AF285QA.kill(u,"ally")', [e['su']])
    await g.step(1.5)
    evs = await g.events(e['t'])
    impact = [x for x in evs if x['k'] == 'ab-impact' and x['su'] == e['su']]
    drop = [x for x in evs if x['k'] == 'ab-drop' and x['su'] == e['su']]
    dmg = [x for x in evs if x['k'] == 'dmg' and x.get('su') == e['su'] and str(x.get('kind', '')).startswith('af285')]
    st = await g.qa('window.__AF285QA.state()')
    return {'ok': not impact and not dmg and bool(drop) and st['tickErrors'] == 0, 'impact': bool(impact), 'dropped': bool(drop), 'damage': len(dmg)}


async def run_peer(host, peer, typ, spec, outdir):
    """İki sayfa: host (seat 1, benzetim) → anlık görüntü → peer (seat 2, aynalama)."""
    await setup(host, spec)
    await peer.qa('window.__AF285QA.restart()')
    await peer.qa('window.__AF285QA.becomePeer()')
    await peer.qa('window.__AF285QA.resetLog()')
    seen_busy = False
    seen_fx = set()
    shot_done = False
    hp_sync = None
    mirrored_x_ok = None
    w_t = None
    for k in range(int(14 / .1)):
        await host.step(.1)
        snap = await host.qa('window.__AF285QA.snapshot()')
        await peer.ev('(s)=>window.__AF285QA.applySnapshot(s)', snap)
        await peer.step(.04)
        pu = await peer.units()
        mine = [u for u in pu if u['type'] == typ and u['team'] == 'enemy']
        if mine and mine[0].get('busy'):
            seen_busy = True
            hu = [u for u in snap['units'] if u.get('type') == typ]
            if hu and hu[0].get('_af285X') is not None and mine[0]['ab'] and mine[0]['ab']['x'] is not None:
                mirrored_x_ok = abs((1 - hu[0]['_af285X']) - mine[0]['ab']['x']) < 1e-3
            if not shot_done and mine[0]['ab']['s'] in (1, 2):
                await peer.canvas_png(outdir / f'{typ}_4_pvp_seat2.png', crop_for(1 - hu[0]['x'] if hu else .5))
                shot_done = True
        fx = await peer.qa('window.__AF285QA.fxList()')
        for f in fx:
            seen_fx.add(f['k'])
        ev = await host.events(0)
        if w_t is None and any(x['k'] == 'ab-impact' and x['src'] == typ for x in ev):
            w_t = k
        if w_t is not None and k >= w_t + 6:
            break
    # can eşitlemesi: son anlık görüntüden sonra iki tarafın canları aynı mı (aynalı)
    snap = await host.qa('window.__AF285QA.snapshot()')
    await peer.ev('(s)=>window.__AF285QA.applySnapshot(s)', snap)
    pu = await peer.units()
    hu = snap['units']
    hp_sync = all(any(abs(p['hp'] - h['hp']) < .6 and p['type'] == h['type'] for p in pu) for h in hu if h.get('type'))
    peer_ab = [x for x in await peer.events(0) if x['k'].startswith('ab-')]
    pst = await peer.qa('window.__AF285QA.state()')
    return {'ok': seen_busy and 'label' in seen_fx and hp_sync and not peer_ab and pst['tickErrors'] == 0 and pst['drawErrors'] == 0 and mirrored_x_ok is not False,
            'peerSawCast': seen_busy, 'peerFx': sorted(seen_fx), 'hpSync': hp_sync, 'peerSimulatedAbilities': len(peer_ab),
            'mirroredTargetX': mirrored_x_ok, 'peerErrors': [pst['tickErrors'], pst['drawErrors']]}


async def run_control(g):
    from scenarios import control_for
    defs = {d['id'] for d in await g.qa('window.__AF285QA.defs()')}
    ctl = control_for(defs)
    if not ctl:
        return {'ok': True, 'note': 'dönüştürülmemiş kart kalmadı'}
    await setup(g, ctl)
    await g.step(12)
    evs = await g.events(0)
    rules = [x for x in evs if x['k'] in ('rule', 'signal') and x.get('src') == ctl['type'] and x.get('team') == 'ally']
    return {'ok': len(rules) > 0, 'type': ctl['type'], 'legacyEvents': len(rules)}


async def main(html, group, outdir, orig=None):
    outdir = pathlib.Path(outdir); outdir.mkdir(parents=True, exist_ok=True)
    report = {'group': group, 'minions': {}, 'system': {}}
    t0 = time.time()
    async with Game(html) as g, Game(html,browser=g.browser) as peer:
        await g.start_battle()
        await peer.start_battle()
        defs = {d['id']: d for d in await g.qa('window.__AF285QA.defs()')}
        for typ, spec in GROUPS[group].items():
            if ONLY and typ not in ONLY:
                continue
            defn = defs.get(typ)
            if not defn:
                report['minions'][typ] = {'error': 'tanım yok'}
                continue
            r = await run_main(g, typ, spec, defn, outdir)
            r['retarget'] = await run_retarget(g, typ, spec)
            r['interrupt'] = await run_interrupt(g, typ, spec, defn)
            r['casterDeath'] = await run_caster_death(g, typ, spec)
            r['pvp'] = await run_peer(g, peer, typ, spec, outdir)
            ck = r['checks']
            ck['yenihedef'] = r['retarget']['ok']
            ck['kesinti'] = r['interrupt']['ok'] and r['casterDeath']['ok']
            ck['pvp'] = r['snapshot_ok'] and r['pvp']['ok']
            r['passed'] = all(ck.values())
            report['minions'][typ] = r
            print(f"{typ:24s} {'GEÇTİ' if r['passed'] else 'KALDI'} {ck}", flush=True)
        report['system']['control'] = await run_control(g)
        report['system']['legacy'] = await g.qa('window.__AF285QA.legacyTests()')
        report['system']['abilityStats'] = await g.qa('window.__AF285QA.abStats()')
        report['system']['roster'] = await g.qa('window.__AF285QA.roster()')
        report['system']['state'] = await g.qa('window.__AF285QA.state()')
        report['system']['errors'] = g.errors() + peer.errors()
    if orig:
        try:
            async with Game(orig) as o:
                await o.start_battle()
                report['system']['rosterOrig'] = await o.qa('window.__AF285QA.roster()')
                report['system']['legacyOrig'] = await o.qa('window.__AF285QA.legacyTests()')
        except Exception as ex:
            report['system']['rosterOrigError'] = str(ex)[:300]
    ro, rn = report['system'].get('rosterOrig'), report['system']['roster']
    if ro:
        report['system']['unchanged'] = {'count': ro['count'] == rn['count'] == 59, 'ids': ro['ids'] == rn['ids'],
                                         'rarity': ro['rarity'] == rn['rarity'], 'costs': ro['costs'] == rn['costs']}
    report['seconds'] = round(time.time() - t0, 1)
    if ONLY and (outdir / 'report.json').exists():
        old = json.loads((outdir / 'report.json').read_text(encoding='utf-8'))
        old['minions'].update(report['minions'])
        old['system'].update(report['system'])
        report = old
    (outdir / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps(report['system'], ensure_ascii=False)[:3000])


ONLY = None
if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--only' in sys.argv:
        ONLY = set(sys.argv[sys.argv.index('--only') + 1].split(','))
        args = [a for a in args if a != sys.argv[sys.argv.index('--only') + 1]]
    orig = None
    if '--orig' in sys.argv:
        orig = sys.argv[sys.argv.index('--orig') + 1]
        args = [a for a in args if a != orig]
    asyncio.run(main(args[0], int(args[1]), args[2], orig))
