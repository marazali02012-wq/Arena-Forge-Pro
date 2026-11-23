# v301 test betikleri (Playwright + Chromium)

Bu betikler oyunu yalnızca **test kopyası** üzerinde çalıştırır. Test kopyası, `afp_motor.js` IIFE'sinin başına
`window.__T={ev:(c)=>eval(c)};` eklenmiş HTML'dir. Bu kanca teslim edilen `index.html` içinde YOKTUR.

Kullanım (örnek):
1. Test kopyasını oluşturup bir klasöre `test.html` adıyla koy ve `python3 -m http.server 8765` ile sun.
2. `lib.js` içindeki adresi ve yolları kendi ortamına göre düzelt.
3. `node ftue.js <çıktı_klasörü>` → yeni profil oluşturur (`t/after_ftue.json`).
4. `node mode.js <çıktı> tower win`, `node minions.js <çıktı> 0 59`, `node spells.js <çıktı>`, `node drag.js <çıktı> 740 360` …

`minions_all.json` ve `spells_table.txt`, 23.11.2026 koşusunun ham sonuçlarıdır.
