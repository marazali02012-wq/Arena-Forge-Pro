#!/usr/bin/env python3
# Arena Forge Pro v3.60.263 WebGL canvas resize fix.
# Run from repository root: python onarim/araclar/gpu_canvas_resize_v263.py
# Writes a NEW playable HTML; never modifies the original.
from pathlib import Path

source = Path("onarim/cikti_v263/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html")
target = Path("onarim/cikti_v263/ArenaForgePro_v3.60.263_GPU_OPTIMIZE_TEST.html")
text = source.read_text(encoding="utf-8")

def replace_once(before, after):
    global text
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f"Patch anchor count {count}, expected 1: {before[:80]!r}")
    text = text.replace(before, after, 1)

replace_once(
    "const diag={gl:false,glError:'',lost:false,kinds:0,failed:[],drawCalls:0,frames:0,fallback2d:0,lastFlushMs:0,verts:0};",
    "const diag={gl:false,glError:'',lost:false,kinds:0,failed:[],drawCalls:0,frames:0,fallback2d:0,lastFlushMs:0,verts:0,glResizes:0,scissoredFrames:0};"
)
replace_once("preserveDrawingBuffer:false,powerPreference:'default'",
             "preserveDrawingBuffer:false,powerPreference:'high-performance'")
replace_once(
    "  if(glCanvas.width!==cw||glCanvas.height!==bh){glCanvas.width=cw;glCanvas.height=bh;}\n  gl.viewport(0,0,cw,bh);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);",
    """  /* GPU fix v263: the animated unit band changes height on almost every frame.
     Resizing the WebGL canvas recreates its backing store and can stall the GPU.
     Allocate the full battle canvas only when the main canvas changes dimensions;
     draw/clear only the top strip corresponding to the current unit band. */
  if(glCanvas.width!==cw||glCanvas.height!==ch){glCanvas.width=cw;glCanvas.height=ch;diag.glResizes++;}
  const glY=ch-bh;
  gl.viewport(0,glY,cw,bh);
  gl.enable(gl.SCISSOR_TEST);gl.scissor(0,glY,cw,bh);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);diag.scissoredFrames++;"""
)
replace_once(
    "  diag.drawCalls=calls;\n  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.drawImage(glCanvas,0,y0);ctx.restore();",
    """  diag.drawCalls=calls;
  gl.disable(gl.SCISSOR_TEST);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  // Crop to the rendered top strip (1:1 pixels); do not composite the unused GPU surface.
  ctx.drawImage(glCanvas,0,0,cw,bh,0,y0,cw,bh);ctx.restore();"""
)
target.write_text(text, encoding="utf-8")
print(target, target.stat().st_size)
