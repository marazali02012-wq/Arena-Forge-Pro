"""Gerçek kart ve savaş döngüsüyle Grup 5'in özel durum testleri."""
import asyncio
import json
import pathlib
import sys

from harness import Game

CASES = {
    'afn_kar_fenercisi': ('af37_agir_zirhli', 'heal'),
    'af37_iskelet_kalkanli': (None, 'shield'),
    'af37_iskelet_savasci': (None, 'death'),
    'af37_kesifci': ('af37_agir_zirhli', 'mark'),
    'af37_kilicli_asker': ('af37_cuce_savasci', 'pair'),
}

async def prepare(g, typ, companion, style, side):
    flip = lambda x: x if side == 'ally' else 1 - x
    foe = 'enemy' if side == 'ally' else 'ally'
    await g.qa('window.__AF285QA.restart()')
    await g.qa('window.__AF285QA.healPortals()')
    caster = await g.play(side, typ, 1, flip(.30))
    enemy = await g.play(foe, 'af37_agir_zirhli', 1, flip(.62))
    ally = await g.play(side, companion, 1, flip(.24)) if companion else None
    for record in (caster, enemy, ally):
        if record is not None:
            assert record.get('ok'), record
    state = await g.units()
    active = next(u['uid'] for u in state if u['type'] == typ and u['team'] == side and u['lane'] == 1)
    target = enemy['uids'][0]
    helper = ally['uids'][0] if ally else None
    await g.ev('''([active,target,helper,side,foe,style])=>{
      const q=window.__AF285QA, f=x=>side==='ally'?x:1-x;
      for(const v of q.units()){
        const u=q.find(v.uid,v.team);
        if(v.uid!==active&&v.uid!==target&&v.uid!==helper){u.lane=0;q.stun(v.uid,v.team,45);}
      }
      q.move(active,side,f(.32));
      q.move(target,foe,f(style==='mark'?.54:.365));
      const t=q.find(target,foe);
      t.hp=t.maxHp=800;
      t.stunUntil=100;
      if(helper){
        q.move(helper,side,f(style==='pair'?.315:.28));
        if(style==='heal')q.setHp(helper,side,.36);
      }
    }''', [active,target,helper,side,foe,style])
    return caster, active, target, helper, foe

async def run_case(g, peer, typ, companion, style, side):
    q = 'window.__AF285QA'
    card, actor, target, helper, foe = await prepare(g, typ, companion, style, side)
    cost=await g.ev('(t)=>window.__AF285QA.cost(t)',typ)
    checks={'kart':card['spent']==cost and card['spawned']>0}
    async def state(uid,team):
        return await g.ev('([id,t])=>window.__AF285QA.units().find(u=>u.uid===id&&u.team===t)',[uid,team])
    async def events():
        return await g.events(0)
    if style=='death':
        await g.step(.08)
        before=await state(target,foe)
        await g.ev('([id,t])=>window.__AF285QA.kill(id,t)',[actor,side])
        await g.step(.08)
        hits=[e for e in await events() if e['k']=='dmg' and e.get('su')==actor and e.get('kind')=='af285Physical']
        after=await state(target,foe)
        checks['son_darbe']=len(hits)==1 and hits[0]['tu']==target and after['hp']<before['hp']
        checks['gorsel']=any(f['k']=='bone_wall' for f in await g.qa(f'{q}.fxList()'))
        await g.step(.8)
        checks['tek_darbe']=len([e for e in await events() if e['k']=='dmg' and e.get('su')==actor and e.get('kind')=='af285Physical'])==1
    else:
        wind=await g.ev('t=>window.__AF285QA.stepUntil(5,"ab-wind",t)',typ)
        checks['hazirlik']=wind['hit'] and wind['e']['su']==actor and wind['e']['team']==side
        before=await state(helper,side) if style=='heal' else await state(target,foe)
        impact=await g.ev('t=>window.__AF285QA.stepUntil(2,"ab-impact",t)',typ)
        checks['tetik']=impact['hit'] and impact['e']['su']==actor
        await g.step(.18)
        log=await events()
        checks['kullanim']=any(e['k']=='ab-cast' and e.get('su')==actor for e in log)
        if style=='heal':
            healed=await state(helper,side)
            checks['sonuc']=healed['hp']>before['hp'] and healed['hp']<=healed['maxHp']
            checks['gorsel']=any(f['k']=='lib' and f['card']==typ for f in await g.qa(f'{q}.fxList()'))
        elif style=='shield':
            ready=await state(actor,side)
            applied=await g.ev('''([actor,target,side,foe])=>{
              const q=window.__AF285QA,u=q.find(actor,side),a=q.find(target,foe);
              const hp=u.hp, before=u.absorb;
              /* A normal simulated ranged impact is unnecessary here. Feed an incoming strike to the shared damage sink. */
              const dealt=q.testDamage(u,a,3);
              return {dealt,before,after:u.absorb,hp,final:u.hp};
            }''',[actor,target,side,foe])
            checks['sonuc']=ready['absorb']>0 and applied['after']<applied['before'] and applied['hp']==applied['final']
            checks['gorsel']=ready['dome'] is not None
        elif style=='mark':
            marked=await g.ev('''([id,helper,t,side])=>{
              const q=window.__AF285QA,v=q.find(id,t),a=q.find(helper,side);
              const marked=v._af285MarkUntil;
              q.testDamage(v,a,20);
              const enhanced=q.events(0).at(-1)?.v;
              if(marked===undefined)return {marked:false};
              v._af285MarkUntil=0;
              q.testDamage(v,a,20);
              const plain=q.events(0).at(-1)?.v;
              return {marked:true,enhanced,plain};
            }''',[target,helper,foe,side])
            checks['sonuc']=marked['marked'] and marked.get('enhanced',0)>marked.get('plain',0)
            checks['gorsel']=any(f['k']=='scout_mark' for f in await g.qa(f'{q}.fxList()'))
        else:
            hits=[e for e in log if e['k']=='dmg' and e.get('tu')==target and e.get('kind')=='af285Physical']
            checks['sonuc']=any(e.get('su')==actor for e in hits) and any(e.get('su')==helper for e in hits)
            checks['gorsel']=any(f['k']=='bone_wall' for f in await g.qa(f'{q}.fxList()'))
        recovered=await g.ev('t=>window.__AF285QA.stepUntil(1.5,"ab-done",t)',typ)
        checks['toparlanma']=recovered['hit'] and not (await state(actor,side))['busy']
        checks['bekleme']=(await state(actor,side))['ab']['ready']>1
    await peer.qa(f'{q}.restart()')
    await peer.qa(f'{q}.becomePeer()')
    snapshot=await g.qa(f'{q}.snapshot()')
    await peer.ev('s=>window.__AF285QA.applySnapshot(s)',snapshot)
    await peer.step(.1)
    remote=await peer.units()
    checks['esitleme']=all(any(
        v['uid']==u['uid'] and v['team']!=u['team'] and abs(v['x']-(1-u['x']))<.002 and abs(v['hp']-u['hp'])<1
        for v in remote) for u in snapshot['units'] if u.get('type') and not u.get('isBarrier') and not u.get('isCommander'))
    clock=await peer.qa(f'{q}.state().elapsed')
    checks['tek_yetkili']=clock==snapshot['elapsed'] and not any(e['k'].startswith('ab-') for e in await peer.events(0))
    checks['savas_hatasi']=not (
        (await g.qa(f'{q}.state()'))['tickErrors'] or (await peer.qa(f'{q}.state()'))['tickErrors'])
    if typ=='afn_kar_fenercisi' and side=='ally':
        outdir=pathlib.Path(sys.argv[2]).parent
        await g.shot(outdir/'arena-740x360.png')
        await peer.shot(outdir/'arena-667x375.png')
    return checks

async def main(html, report):
    output={}
    async with Game(html,740,360,mobile=True) as host, Game(html,667,375,mobile=True) as peer:
        print('host:',await host.start_battle(),await host.qa('window.__AF285QA.state()'),flush=True)
        print('peer:',await peer.start_battle(),await peer.qa('window.__AF285QA.state()'),flush=True)
        for typ,(companion,style) in CASES.items():
            output[typ]={}
            for side in ('ally','enemy'):
                try:
                    checks=await run_case(host,peer,typ,companion,style,side)
                except Exception as exc:
                    checks={'exception':False}
                    print(typ,side,repr(exc),flush=True)
                output[typ][side]=checks
                print(typ,side,checks,flush=True)
    pathlib.Path(report).write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    return all(all(all(checks.values()) for checks in sides.values()) for sides in output.values())

if __name__=='__main__':
    sys.exit(0 if asyncio.run(main(*sys.argv[1:])) else 1)
