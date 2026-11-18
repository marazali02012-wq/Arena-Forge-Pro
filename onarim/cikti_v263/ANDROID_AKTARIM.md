# Android'e aktarım — v3.60.220 → v3.60.263

## Ne yapıldı
- `app/src/main/assets/www/index.html` dosyası, testleri geçen `ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html` ile değiştirildi.
- `app/build.gradle`: `versionCode 220 → 263`, `versionName '3.60.220' → '3.60.263'`. Paket adı (`com.arenaforgepro.game`), `minSdk 24` ve `targetSdk 36` değişmedi.
- `GameActivity.java`: çentik düzeltmesi (`LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES`, kök dolgusu yok) önceki turda yapılmıştı; başka değişiklik yok.
- `onarim/araclar/teslim_gonder.sh` her gönderimde, kod testleri geçtikten sonra aynı HTML'yi Android varlığına kopyalıyor. Böylece web sürümü ile Android sürümü ayrışmıyor.

## Körlemesine kopyalama değil — karşılaştırma
v3.60.220 Android dosyasında, içe aktarmadan sonra yapılmış 9 Android'e özel commit var (geri tuşu, onay pencereleri, hesap silme, Kartı At, sandık ekranı, düşük güç modu, ses motoru…).

| Denetim | Sonuç |
|---|---|
| Bu 9 committe eklenen satırların 263'te bulunması | 8 commit tamamen; ses motoru commit'inin 196 satırından 160'ı birebir var. Kalan 36 satırın karşılığı 263'te yeniden yazılmış hâlde (`sfxPlay`, `_renderSfx`, `AFPAudioV1` mevcut; 263 ayrıca `AFP_AUDIO_SAMPLES` ve `AFP_MUSIC_DEFAULT_V1` içeriyor). |
| Android HTML'sindeki her `<script id>` 263'te var mı | Evet, hepsi var. 263'te 8 yeni betik daha var (rehber, hikâye, rütbe amblemleri, ses örnekleri, v263 çalışma anı…). |
| Android köprüleri | `AFPAndroidNavigation`, `afpAndroid` işaretleri ve `appassets.androidplatform.net` adresi 263'te mevcut. |
| `<head>` | viewport (`viewport-fit=cover`, yakınlaştırma kapalı) aynı. |
| Kayıt anahtarı | `arenaForgeProProfileV19` aynı; mevcut oyuncu kayıtları korunur. |

## Android adresinde davranış testi (Chromium, Android WebView adresi taklit edilerek)
Sayfa `https://appassets.androidplatform.net/assets/www/index.html` adresinden sunuldu ve `AFPAndroidNavigation.back()` denendi. Aynı test eski v3.60.220 Android HTML'sine de uygulandı.

| Durum | v3.60.220 | v3.60.263 |
|---|---|---|
| Köprü kuruluyor | evet | evet |
| Ana üste geri | `false` (uygulama çıkış sorusunu gösterir) | `false` |
| Mağazadan geri | ana üsse döner | ana üsse döner |
| Savaşta geri | duraklatma açılır | duraklatma açılır |
| Duraklatmada geri | oyun sürer | oyun sürer |
| JS hatası | yok | yok |

Bu test gerçek WebView değildir. Gerçek cihaz denemesi 12 kişilik kapalı testte yapılacak.

## Derleme
Bu ortamda Android SDK yok. Derleme depodaki GitHub Actions iş akışında (`.github/workflows/android-build.yml`, "Android derleme") yapılıyor:
- **Test APK'sı:** `assembleDebug`, **hata ayıklama anahtarıyla** imzalı, yalnızca telefonda deneme içindir. Yayın paketi değildir.
- **AAB:** `bundleRelease`, **imzasız**. `bundletool validate` ile doğrulanıyor.
- **Yükleme anahtarıyla imza:** yalnız depo gizli anahtarları (`UPLOAD_KEYSTORE_BASE64`, `UPLOAD_KEYSTORE_PASSWORD`, `UPLOAD_KEY_ALIAS`) tanımlıysa yapılıyor. Tanımlı değilse imzasız AAB üretiliyor; Play'e yüklemeden önce sahibinin kendi anahtarıyla imzalaması gerekir.

Derleme sonucu ve doğrulama çıktıları `TEST_SONUCLARI.md` dosyasına yazılır.
