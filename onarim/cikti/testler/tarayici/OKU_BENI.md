# Tarayıcı testleri (Chromium + Playwright)

Bu klasördeki araçlarla oyun **gerçek Chromium'da** açılıp oynatıldı. Hepsi yalnız test içindir; oyuna
dahil edilmez.

## Kurulum

```bash
export AFP_TEST_DIR=~/afp_test            # çalışma klasörü (içinde tarayici/, serve/, shots/)
mkdir -p $AFP_TEST_DIR/serve $AFP_TEST_DIR/shots
cp -r tarayici $AFP_TEST_DIR/
cp ../../ARENA_FORGE_PRO_v3.60.262.html $AFP_TEST_DIR/serve/v262.html
# test kopyası: savaş motorunun kapanışına tek satırlık eval kancası (window.__AFE) ekler
python3 $AFP_TEST_DIR/tarayici/make_testbuild.py $AFP_TEST_DIR/serve/v262.html $AFP_TEST_DIR/serve/t262.html
(cd $AFP_TEST_DIR/serve && python3 -m http.server 8765 --bind 127.0.0.1 &)
(cd $AFP_TEST_DIR && node tarayici/driver.js 740 360 &)   # Playwright gerekir
```

## Araçlar

| Dosya | Ne yapar |
|---|---|
| `driver.js` + `d.py` | Uzun ömürlü Chromium oturumu; `d.py goto/tap/drag/eval/shot/viewport/logs` komutları |
| `boot.sh` | Sayfayı açar, misafir girişi yapar, botu kurar |
| `bot.js` | **Test botu**: elindeki en pahalı oynanabilir kartı düşmanın en kalabalık koridoruna oynar; `__T()` savaş durumunu okur |
| `timeline.js` | 2 sn'de bir portal canı, birlik sayısı, boss durumunu kaydeder |
| `android_set.sh W H` | Bir ekran ölçüsünde giriş → ana üs → mod galerisi → Hikâye Seferi → savaş → sonuç ekran görüntüsü seti |
| `gallery.js`, `gallery_all.sh`, `contact.py` | 152 birlik türünü dost/düşman olarak sahaya koyup yön/görsel kontrol sayfaları üretir |
| `measure_afn.js` | 49 yeni minyonun çizim yüksekliğini/opaklığını ölçer |
| `clipscan.js` | Ekranda içeriği kesilen (taşan) kutuları bulur |
| `imgscan.js` | Görünür görsellerde boş/yüklenemeyen/1×1 olanları sayar |
| `probe.js` | Açılışta konsol hatası, dış istek ve zamanlı ekran görüntüsü |

`t262.html` yalnız testte kullanılır; teslim edilen dosya `ARENA_FORGE_PRO_v3.60.262.html`'dir.
