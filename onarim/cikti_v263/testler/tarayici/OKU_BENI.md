# Tarayıcı test araçları (v3.60.263)

Yalnız test içindir; oyuna dahil edilmez. `AFP_TEST_DIR` çalışma klasörüdür (içinde `pw/` = bu klasör, `serve/`, `shots/`).

1. `make_testbuild.py v263.html t263.html`: savaş motoruna tek satırlık `window.__AFE` kancası ekleyen **test kopyası** üretir.
2. `serve/` içinde `python3 -m http.server 8765`; `node driver.js 740 360` (Playwright gerekir).
3. Betikler:

| Betik | İş |
|---|---|
| `sweep.sh`, `rerun.sh` | 9 mod × zafer/yenilgi/pes (rerun: her tur öncesi temiz sayfa, mod doğrulaması) |
| `surrender.sh` + `snap.js` | Pes öncesi/sonrası profil farkı |
| `battle_visual.sh` + `battleaudit.js` + `fps.js` | Savaş görsel denetimi: görünmeyen birim, koridor örtme, taşma, FPS |
| `profile.js` | Çizim alt fonksiyonlarının kare başı süresi |
| `guidegeo.js` | Rehber balonunun örttüğü öğeler |
| `screens.sh` + `clipscan.js` + `imgscan.js` | Menü ekranları × 3 ölçü |
| `rapor_tablolari.py` | Ham sonuçlardan rapor tabloları |

Ham sonuçlar: `../sonuclar/*.jsonl`.
