# Arena Forge Pro v301 — Kapalı Test Öncesi Rapor (23.11.2026)

Ayrıntılı satır satır sonuç: `TEST_SONUCLARI.csv`. Kanıt görüntüleri: `v301-kanitlar/`. Test betikleri: `v301-test-araclari/`.

## Karar

**12 kişilik kapalı teste "hazır" etiketi henüz verilmemeli.** Tarayıcıda test edilen oyun akışlarında kritik hata (çökme, siyah ekran, kaybolan sürükleme, çift zafer, yanlış sonuç) bulunmadı. Ancak şu üç koşul doğrulanmadı:

1. İmzalı release AAB üretilemedi (yükleme anahtarı yok).
2. Gerçek Android cihaz testi (Realme C55 sınıfı) yapılmadı.
3. İki cihazlı gerçek PvP testi yapılmadı.

## Teslim edilenler

| Dosya | Durum |
|---|---|
| `app/src/main/assets/www/index.html` | v301 + 1 CSS düzeltmesi (SHA-256 `183c97f2…f535f713`, 67.705.858 bayt) |
| `app/build.gradle` | versionCode 220 → **301**, versionName **3.60.301**, targetSdk 36, minSdk 24, applicationId aynı (`com.arenaforgepro.game`) |
| Gradle | `./gradlew :app:bundleRelease` Android SDK 36 + Build-Tools 36.0.0 + JDK 21 ile sorunsuz derlendi (depodaki wrapper değişmedi) |
| `app-release.aab` | Derlendi, **İMZASIZ** (48,7 MB). Depoya konmadı (`*.aab` gitignore) |
| `app-debug.apk` | Derlendi, yalnızca Android Debug anahtarıyla imzalı. Yayın için kullanılamaz |

Orijinal v301 HTML, düzeltmeden önce ayrı commit olarak birebir (SHA `20e62617…2f4d`) yerleştirildi. Bu commit'e geri dönülebilir.

## Bulunan ve düzeltilen hata

**Minyonlar ekranı 360 px yükseklikte taşıyordu (740×360, 800×360).**
- Kök neden: `.af4-heroes{min-height:290px}`. Panel 82. pikselden başladığı için 372'de bitiyor, ekran 360'ta bitiyordu.
- Etkisi: alttaki *Tümü / Açık / Kilitli / Hazır* filtreleri ekran dışında kalıyordu ve tüm ekran 20 px kayıyordu.
- Düzeltme: yalnızca `(orientation:landscape) and (max-height:370px)` için `min-height:0` uygulandı. Tek `<style>` bloğu eklendi; görsel ve mantık değişmedi.
- Doğrulama: düzeltme sonrası panel 82–352 aralığında, sayfa taşması 0. 667×375 ekran değişmedi.
- Gerileme testi: ana üs, savaş, sonuç, sürükle-bırak (9/9) ve Kule maçı yeniden geçti.

## Test edilen ve geçenler (özet)

- **Yeni hesap:** misafir → hikâye → ilk minyon → ilk savaş → zafer → DEVAM. **Kayıtlı profil** ikinci açılışta korunuyor.
- **Modlar:** Arena (bot), Kule, Hikâye Seferi, Gökyüzü, Sancak, Yankı İstilası (3 dalga + Ayna Celladı), Örümcek Akını (kademe 1 ve Kraliçe'li kademe 5), Kristal Kolos, Karanlık Geçit, Gizli Bölge.
  - Hepsinde portal 0 → **tek** sonuç.
  - Ödül ikinci `endGame` çağrısında tekrar verilmiyor.
  - Maç sonunda birimler temizleniyor.
- **59 minyon:** hepsi oynandı, ilerledi, doğru yöne baktı, hasar verdi ve öldüğünde temizlendi. Yeteneklerin tamamı gerçek etkiyle tetiklendi; üçü (İskelet Savaşçı, Nekromancı, Sedef Pervane) kendi koşulu kurularak doğrulandı.
- **25 büyü:** doğru kahraman, tanımlı bekleme süresi ve nişan tipiyle çalışıyor; etki ölçüldü.
- **Sürükle-bırak:** 3 çözünürlükte 9 senaryo geçti. Hayalet kalmadı.
- **Bellek:** 6 maç sonunda sızıntı yok. **Arka plan** dönüşünde maç duruyor, DEVAM ET ile sürüyor.
- **PvP (ağ kapalı):** rakipsizken saha açılmıyor, bot yedeğine geçiliyor.

## Tasarım soruları (hata sayılmadı, karar sizin)

1. **Gizli Bölge +32 kupa veriyor.** Zor düello kupa tablosundan (+32/−10) geliyor; mod açıklamasında kupa yazmıyor.
2. **Bot rakip gerçek oyuncu adıyla gösteriliyor** ("RAKİP · KOMUTAN T6WW"). Kodda bilinçli olarak *disguised arena* deniyor. Oyunculara açıkça belirtilip belirtilmeyeceğine karar verin.
3. **Ağ yokken arena kuyruğu yaklaşık 20 saniyede bota düşüyor.** Sunucu erişilebilir olduğunda 60 saniyelik arama ayrıca iki cihazla ölçülmeli.
4. **Örümcek Kraliçe portal önünde sabit duruyor** (yürümüyor). Kod bunu bilerek yapıyor (`x=.94, speed=0`).

## Doğrulanamayanlar (DOĞRULANAMADI)

- **İmzalı AAB:** yükleme anahtarı yok. Android Studio → *Generate Signed Bundle* veya `signingConfig` + gizli ortam değişkenleri ile imzalanmalı.
- **Gerçek cihaz:** FPS, soğuk açılış, ses ve WebView davranışı denenmedi. Başsız tarayıcı GPU'suz çalıştığı için FPS değerleri kanıt sayılmaz.
- **İki cihazlı PvP:** eşleşme, kopma/yeniden giriş, pes, tek ödül ve kupa farkı denenmedi.
- **Son Kahraman Ayakta (8 oyunculu turnuva):** giriş ve 8 gerçek oyuncu gerektiriyor.
- **Animasyon kareleri:** 59 minyonun Walk/Idle/Attack/Hurt/Death karelerinin gözle tek tek onayı yapılmadı; durum makinesi ve örnek görüntüler kontrol edildi.
- **Play Console:** 12 kullanıcı / 14 gün. Play'e yükleme yapılmadı.

## Test yöntemi

Testler Playwright + Chromium (başsız) üzerinde, `127.0.0.1` HTTP sunucusundan yürütüldü. Dış ağ engellendi; PvP ve sunucu satırları bu yüzden ayrı tutuldu.

Motor bir IIFE içinde kapalı olduğu için **yalnızca test kopyasına** tek satırlık değerlendirme kancası (`window.__T`) eklendi. Teslim edilen HTML'de bu kanca yok.

Kartlar ve büyüler oyunun kendi komut yolundan (`AFP.command`) oynatıldı, dokunma testleri ise CDP `Input.dispatchTouchEvent` ile yapıldı.
