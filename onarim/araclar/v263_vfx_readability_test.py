#!/usr/bin/env python3
"""Arena Forge Pro v3.60.263: isolated decorative weapon-trail de-bloom test.
Source game remains unchanged. NO rejected GPU optimization.
Usage from repo root: python onarim/araclar/v263_vfx_readability_test.py
"""
from pathlib import Path
src=Path("onarim/cikti_v263/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html")
dst=Path("onarim/cikti_v263/ArenaForgePro_v3.60.263_EFEKT_DENGE_TEST.html")
s=src.read_text(encoding="utf-8")
assert 'content="v3.60.263"' in s or "v3.60.263" in s
a=s.index("function af321DrawTrails(){")
b=s.index("function af321DrawHeals()",a)
section=s[a:b]
changes=[
 ("ctx.globalAlpha=fade*.22*taper;","ctx.globalAlpha=fade*.11*taper;"),
 ("if(!LOW_POWER_DEVICE){ctx.shadowColor=glow;ctx.shadowBlur=10;}","/* v263: remove decorative blur cost; hits unchanged */ctx.shadowBlur=0;"),
 ("ctx.globalAlpha=fade*.62*taper;","ctx.globalAlpha=fade*.46*taper;"),
 ("if(!LOW_POWER_DEVICE){ctx.globalAlpha=fade*.82*taper;","if(!LOW_POWER_DEVICE&&units.length<14){ctx.globalAlpha=fade*.55*taper;"),
 ("if(ta>.02){const r=LOW_POWER_DEVICE?2.1:3.2;ctx.globalAlpha=ta*.72;","if(ta>.02&&units.length<14){const r=LOW_POWER_DEVICE?2.1:3.2;ctx.globalAlpha=ta*.43;"),
]
for old,new in changes:
    assert section.count(old)==1,(old,section.count(old))
    section=section.replace(old,new,1)
out=s[:a]+section+s[b:]
assert "gl.scissor(0,glY,cw,bh)" not in out
assert "powerPreference:'high-performance'" not in out
check=out
for old,new in changes:check=check.replace(new,old,1)
assert check==s,"Unexpected change to gameplay or other code"
dst.write_text(out,encoding="utf-8")
print("VFX test HTML generated",dst, dst.stat().st_size,"only decorative weapon trail changes",len(changes))
