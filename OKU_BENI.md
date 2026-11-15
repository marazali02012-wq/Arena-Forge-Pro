# Arena Forge Pro 220 Android test paketi

- `paketler/ArenaForgePro_220_Android_TEST.apk` Android 7.0 ve sonrası için test imzalı kurulum dosyasıdır.
- `paketler/ArenaForgePro_220_Play_IMZASIZ.aab` Play için derlenmiş imzasız pakettir. Yükleme anahtarınla imzalanması gerekir. Test APK’sının imzası yayın için kullanılmaz.
- `app/src/main/assets/www/index.html` Android sürümüne gömülü tam oyun HTML’sidir. Önceki kararlı HTML ve canlı Netlify yayınına müdahale edilmedi.
- `yayin/KALAN_ISLER_KOMUTU.txt` yayın hazırlığını devralacak kişiye veya kodlama aracına verilebilir.
- `play-store` Türkçe mağaza açıklaması, 512×512 simge ve 1024×500 kapak görselini içerir.

## Yapılan ve doğrulanan

Android sürümü 3.60.220, sürüm kodu 220, hedef API 36, en düşük API 24. Oyun paketten yüklenir. Açılış, hata ve yeniden deneme ekranı, yatay tam ekran ile Android geri tuşu bağlantısı eklendi. Önceki paketleyicinin filigranı ve aşağı çekerek yenileme davranışı yeni projede kullanılmıyor. Android WebView’da çalışmayan Google giriş düğmesi gizlendi. Misafir ve e-posta giriş yolları kaynakta korunuyor. APK ve AAB resmî Android araçlarıyla üretildi. AAB yapısı ve APK test imzası doğrulandı. Android Studio/Gradle derlemesi bu ortamda Android Gradle eklentisini çözümleyemedi. Telefonda giriş, savaş, geri dönüş ve çevrim içi işlemler henüz çalıştırılmadı.

## Kaynağı açma ve imzalama

1. ZIP’i çıkar. Android Studio’da bu klasörü aç. SDK Manager üzerinden Android SDK 36 ile Build-Tools 36.0.0 kur ve Gradle için JDK 17 veya uyumlu JDK kullan.
2. Play Console’da daha önce bir uygulama açıldıysa, paket adını ve en son sürüm kodunu kontrol et. Bu proje yeni paket adı olarak `com.arenaforgepro.game` kullanıyor. Önceki APK başka paket adı veya imza kullanıyorsa bu sürüm doğrudan güncelleme olarak kurulmaz. Eski APK’nın yerel kayıtları ayrı kalabilir.
3. Yayın paketini Android Studio’da **Build → Generate Signed Bundle / APK → Android App Bundle** ile kendi yükleme anahtarınla üret. Mevcut Play kaydında kayıtlı yükleme anahtarını kullan.
4. Yayına geçmeden önce ekteki komutta belirtilen cihaz testlerini, gizlilik ve hesap silme bağlantılarını ve Play Console bilgilerini tamamla.

[Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756) · [Hesap silme](https://support.google.com/googleplay/android-developer/answer/13327111) · [Kapalı test](https://support.google.com/googleplay/android-developer/answer/14151465)
