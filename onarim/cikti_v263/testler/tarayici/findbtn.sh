#!/bin/bash
# kullanım: findbtn.sh <homeAction>  -> "x y" (gölge köklerinde arar)
S=${AFP_TEST_DIR:-$PWD}
python3 -I $S/pw/d.py eval "let hit=null;const w=r=>r.querySelectorAll('*').forEach(e=>{if(e.shadowRoot)w(e.shadowRoot);if(!hit&&e.dataset&&e.dataset.homeAction==='$1'){const b=e.getBoundingClientRect();if(b.width>60)hit=b;}});w(document);return hit?Math.round(hit.x+hit.width/2)+' '+Math.round(hit.y+hit.height/2):'yok'"
