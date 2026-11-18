# Testleri çalıştırma (Python 3 ve Node.js)

Paketi çıkardıktan sonra ana klasörde:

```bash
python3 06_ARACLAR/html_scriptlerini_ayir.py
node 04_TESTLER/test_logic.js
node 04_TESTLER/test_portraits261.js
```

- `html_scriptlerini_ayir.py` yalnız çalışma HTML'sini okur, `_uretilen_scriptler` klasörünü oluşturur; orijinal HTML'yi değiştirmez.
- `test_logic.js` 17 izole kod davranışı kontrol eder.
- `test_portraits261.js` 10 kart portre çözümleme kontrolü yapar.
- Testler **gerçek oyun oynanış testi değildir**.
- 3 farklı ekran ölçüsünü test etmek için ayrıca gerçek Chromium/Android gerekir.
