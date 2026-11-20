#!/usr/bin/env python3
"""v263: damage-only HP bar plus Heroic-video top-left blue energy icon.
Run after v263_vfx_readability_test.py and v263_hp_dual_color_test.py.
Only creates test output; original remains untouched.
"""
from pathlib import Path
p=Path('onarim/cikti_v263/ArenaForgePro_v3.60.263_CAN_CUBUGU_CIFT_KILIC_RENK_TEST.html')
out=Path('onarim/cikti_v263/ArenaForgePro_v3.60.263_HEROIC_ENERJI_KART_TEST.html')
s=p.read_text(encoding='utf8')
def swap(old,new):
 global s
 assert s.count(old)==1,('Anchor count incorrect',old[:80],s.count(old))
 s=s.replace(old,new,1)
swap('  const showHealth=u.hp>0&&!u.isBarrier; // v3.60.108: all living minions have a visible HP bar, including full-health soldiers.',
'''  const alwaysHud=!!(u.isHero||u.isCommander||u.isBoss);
  const showHealth=u.hp>0&&!u.isBarrier&&(alwaysHud||u.hp<u.maxHp-.01); // v3.60.263 Heroic-style: normal minions show HP bar only after taking damage.''')
swap('    // Keep the gauge under the top HUD: if the numbers would not fit, only the bar is drawn (no overlap with HUD).\n','')
swap("    let withText=!af378HudNoText.has(u),barY=y-top-barH-C.gap*kk-textH-1-crowdLift;\n    let af367OnBar=!withText&&!af382HudDense&&!u._af214GroupMember;if(barY-textH<minTop){withText=false;af367OnBar=!af382HudDense&&!u._af214GroupMember;barY=Math.max(minTop+textH*.5,y-top-barH-C.gap*kk-crowdLift);} /* v3.60.67 AFQA-14: rakam üst HUD'a girmesin */",
'''    let withText=false,barY=y-top-barH-C.gap*kk-crowdLift;
    let af367OnBar=false;if(barY<minTop){barY=Math.max(minTop,y-top-barH-C.gap*kk-crowdLift);} /* Heroic-style: minion HP numbers hidden; compact bar only. */''')
swap('''    if(withText||af367OnBar){const label=Math.max(0,Math.ceil(u.hp))+'/'+Math.ceil(u.maxHp);
      const sprite=af263HpLabelSprite(label,Math.round(Math.max(8,9*kk)),!!af367OnBar);
      const ty=withText?barY-1:barY+barH/2+.5;
      ctx.drawImage(sprite.c,x-sprite.w/2,ty-sprite.base,sprite.w,sprite.h);
    } /* v263: cache HP glyph raster; never draw text twice every video frame */''',
'''    /* Heroic-style: minion HP numbers hidden intentionally. Boss/portal HUD remains elsewhere. */''')
swap("    const badge=button.querySelector('.battleCooldownBadge');if(badge)badge.remove();",
"    const energyBadge=button.querySelector('.battleEnergyCost');if(energyBadge&&energyBadge.textContent!==String(cost))energyBadge.textContent=String(cost);\n    const badge=button.querySelector('.battleCooldownBadge');if(badge)badge.remove();")
css='''
<style id="AFP263_HEROIC_ENERGY_BADGE_TEST">
/* Reference video: cost at upper left of each hand card. No gameplay adjustment. */
html.afx369:not(#_1):not(#_2):not(#_3) #hud #battleRoster .battlePick .battleEnergyCost,
#hud #battleRoster .battlePick .battleEnergyCost {
  position:absolute!important;left:-2px!important;top:-3px!important;right:auto!important;bottom:auto!important;
  z-index:7!important;min-width:18px!important;width:18px!important;height:18px!important;
  display:grid!important;place-items:center!important;padding:0!important;box-sizing:border-box!important;
  border:1px solid #86c6fa!important;border-radius:50%!important;
  background:linear-gradient(155deg,#267ec0 0%,#0e467e 50%,#081b3e 100%)!important;
  box-shadow:0 1px 3px rgba(0,0,0,.85)!important;
  color:#fff!important;font:900 11px/1 system-ui,sans-serif!important;
  text-align:center!important;text-shadow:0 1px 2px #001023!important;pointer-events:none!important;
}
@media (max-height:375px) and (orientation:landscape) {
  html.afx369:not(#_1):not(#_2):not(#_3) #hud #battleRoster .battlePick .battleEnergyCost,
  #hud #battleRoster .battlePick .battleEnergyCost{width:17px!important;min-width:17px!important;height:17px!important;font-size:10px!important;}
}
</style>
'''
swap('</body>',css+'</body>')
assert 'u.hp<u.maxHp-.01' in s and 'lossless:true' in s
assert "powerPreference:'high-performance'" not in s
assert 'gl.scissor(0,glY,cw,bh)' not in s
out.write_text(s,encoding='utf8')
print('PASS',out,out.stat().st_size)
