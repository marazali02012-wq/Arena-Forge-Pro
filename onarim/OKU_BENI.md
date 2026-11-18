# Arena Forge Pro — onarım çalışma klasörü

## Hızlı bakış

| | |
|---|---|
| **Oynanacak dosya** | `cikti/ARENA_FORGE_PRO_v3.60.262.html` (tek dosya, çevrimdışı açılır) |
| **Teslim ZIP'i** | `cikti/ARENA_FORGE_PRO_v3.60.262_TESLIM.zip` (HTML + raporlar + testler + ekran görüntüleri) |
| **Ne düzeldi** | `cikti/YAPILAN_DUZELTMELER.md` |
| **9 mod testi** | `cikti/9_MOD_TEST_MATRISI.md` |
| **Android ölçüleri** | `cikti/ANDROID_740_667_800.md` |
| **Görsel envanteri** | `cikti/VARLIK_ENVANTERI.md` |
| **Kalanlar / kararlar** | `cikti/KALAN_EKSIKLER.md` |
| **Bütün kod testleri** | `bash cikti/testler/testleri_calistir.sh cikti/ARENA_FORGE_PRO_v3.60.262.html` |
| **v261'den yeniden üretme** | `python3 araclar/patch_v262.py kaynak/ARENA_FORGE_PRO_v3.60.261_CALISMA_KOPYASI.html yeni.html` |

Bu klasör `Arena-Forge-Pro2` deposundaki onarım çalışmasının aynısıdır (orada da durur).
Android projesindeki `app/src/main/assets/www/index.html` (v3.60.220)
**değiştirilmedi**.

## Kaynak paket

Kullanıcının 5 parça hâlinde yüklediği `ARENA_FORGE_PRO_CLAUDE_EKSIKSIZ_ONARIM_PAKETI.zip`:
- parçalar birleştirildi;
- SHA-256 doğrulandı (`39b94cee62e498116931108a8fd841a676b9bea4905e81154be67cdfa2585985`, 129.058.762 bayt);
- 271 dosyanın tamamı `MANIFEST_SHA256.txt` ile eşleşti.

| Paket | Burada |
|---|---|
| `01_CALISMA_DOSYASI/` | `kaynak/`: v3.60.261 çalışma kopyası, **dokunulmadan** saklanır |
| `02_ORIJINAL_VE_REFERANSLAR/` | `referans/`: v3.60.260 orijinal, v3.60.260 ilk onarım, v240 eski referans |
| `03_RAPORLAR/` | `onceki_raporlar/` |
| `04_TESTLER/` | `testler/` (eski 17 + 10 test) |
| `06_ARACLAR/` | `araclar/` (+ yeni: `patch_v262.py`, `varlik_tarama.py`) |
| `05_KOD_INCELEME/` | Eklenmedi: base64'ü kısaltılmış okuma kopyaları; `araclar/html_scriptlerini_ayir.py` ile yeniden üretilebilir |

`MANIFEST_SHA256.txt` paketteki orijinal yolları kullanır. `BASLA_BURADAN.md` ve `CLAUDE_TAM_ONARIM_KOMUTU_TR.md`
paketle gelen görev tanımıdır.
