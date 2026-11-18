#!/usr/bin/env python3
"""Sürücüye komut gönderir. Kullanım:
  d.py eval 'return document.title'
  d.py shot ad            -> shots/ad.png
  d.py tap x y | click x y | drag x1 y1 x2 y2 | goto url | wait ms | logs [clear]
  d.py clicksel 'css'
  d.py viewport w h
"""
import sys, json, urllib.request, os
SH = os.path.join(os.environ.get('AFP_TEST_DIR', os.getcwd()), 'shots')
a = sys.argv[1:]
op = a[0]
c = {'op': op}
if op == 'eval':
    js = a[1]
    if js == '-': js = sys.stdin.read()
    elif os.path.isfile(js): js = open(js).read()
    c['js'] = js
elif op == 'shot': c['path'] = os.path.join(SH, a[1] + '.png'); c['device'] = len(a) > 2
elif op in ('tap', 'click'): c['x'], c['y'] = float(a[1]), float(a[2])
elif op == 'drag': c['x1'], c['y1'], c['x2'], c['y2'] = map(float, a[1:5]); c['steps'] = int(a[5]) if len(a) > 5 else 12
elif op == 'goto': c['url'] = a[1]
elif op == 'wait': c['ms'] = int(a[1])
elif op == 'logs': c['clear'] = len(a) > 1
elif op == 'clicksel': c['sel'] = a[1]; c['force'] = len(a) > 2
elif op in ('viewport', 'size'):
    c['w'], c['h'] = int(a[1]), int(a[2])
    if len(a) > 3: c['dpr'] = float(a[3])
    if len(a) > 4 and a[4] == 'fresh': c['keep'] = False
req = urllib.request.Request('http://127.0.0.1:9777', data=json.dumps(c).encode(), method='POST')
out = json.loads(urllib.request.urlopen(req, timeout=600).read())
if out['ok']:
    r = out['r']
    print(r if isinstance(r, str) else json.dumps(r, ensure_ascii=False, indent=1))
else:
    print('HATA:', out['e']); sys.exit(1)
