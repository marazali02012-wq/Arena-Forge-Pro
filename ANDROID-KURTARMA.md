# Arena Forge Pro Android kurtarma ve sürüm alma

Android paket kimliği **com.arenaforgepro.game**. Oyun dosyası eski uygulamadaki `https://appassets.androidplatform.net/assets/www/index.html` adresinden açılır. Android uygulama verisini ve WebView kaynak adresini korumak için Google Play’de aynı uygulama üzerinden güncelleme yapılır. Test APK’sı yan yana kurulabilmesi için `.v<kod>test` uzantılı paket kullanır.

## Derleme

JDK 17, Android SDK 36, Build Tools 36.0.0 ve Python 3 gerekir.

```sh
python3 tools/set-version.py 308 --check
node --test test/client-version-gate.test.cjs
./gradlew --no-daemon :app:assembleDebug :app:bundleRelease
```

İleride yeni sürümü oluşturmak için önce Play Console’daki en yüksek sürüm koduna bakın ve `python3 tools/set-version.py YENI_KOD` komutunu çalıştırın. Komut Android ve HTML sürüm numarasını birlikte günceller. Ağdaki `buildId` alanı mevcut protokolün uyumluluk kimliğidir. Uygulama sürümü aynı pakette ayrı bir sayı olarak `clientVersionCode` ile taşınır.

Android dosyaları için v306 kaynak dalı, gönderilen AAB’nin manifesti, SDK bağımlılık metadatası ve derlenmiş Activity karşılaştırıldı. İkon ve oyun, gönderilen arşivden alındı. `tools/recovery/restore-html.py` önceki Git içeriği ile kurtarılan HTML’yi sağlama toplamına göre doğrular. ZIP’in içindeki HTML dosyası derlemeye hazırdır.

## İmzalama ve kapalı test

GitHub Actions, Android paketlerini derler ve bundletool ile doğrular. İmza adımı yalnızca mevcut yükleme anahtarının depo gizli değişkenleri ve Play Console’daki yükleme sertifikasının `PLAY_UPLOAD_CERT_SHA256` depo değişkeni mevcutsa çalışır. İmza aracı doğrulanan sertifikadan farklı bir anahtarı reddeder. Test APK’sı Android SDK hata ayıklama sertifikası kullanır. Play’e yalnızca `PLAY_IMZALI.aab` çıktısı yüklenir.

Kapalı testte, güncelleme testçiye Play Store’dan gerçekten sunulana kadar canlı çevrim içi minimum sürümü yükseltmeyin. Play’in kendi onay penceresi kullanıcı tarafından iptal edilebilir. Uygulamanın yerel ekranı iptalden sonra oyunu kapalı tutar ve yeniden deneme sunar. Google Play ilk kontrolde yanıt vermezse 5 saniye içinde açılış sürer. Bu oturumda güncelleme daha önce Play tarafından doğrulanmışsa kilit ekranda hata ve tekrar deneme görünür.

## Çevrim içi savaş sürümü

`sunucu/client-version-gate.cjs` mevcut WebSocket sunucusunun paket işleyicisinde, `hello` ve `rejoin` işlemlerinin başında, kimlik, kuyruk ve oda işlemlerinden önce çağrılır.

```js
const { createClientVersionGate } = require('./client-version-gate.cjs');
const admitClient = createClientVersionGate();

// Mevcut paket işleyicisinde, hello ve rejoin kollarından önce.
if ((frame.type === 'hello' || frame.type === 'rejoin') && !admitClient(ws, frame)) return;
```

`AFP_MIN_ONLINE_VERSION_CODE=0` geçiş durumudur. Kapalı test dağıtımı tamamlanıp ilgili oyuncular güncellemeyi alabildiğinde canlı ortam değişkeni uygun minimuma yükseltilir. Bu denetim istemcinin bildirdiği sürümü kontrol eder. İstemci sürümünün kriptografik doğrulaması bu protokolde bulunmaz.
