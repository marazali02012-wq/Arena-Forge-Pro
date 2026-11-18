# Tıklama, kararma, geçiş ve sol kenar (çentik) testi

Ortam: Chromium (Playwright), mobil öykünme, 800×360. Gerçek telefon değil.

## 1. Sol kenarda daralma / siyah şerit (Google Play) — **DÜZELTİLDİ**

**Belirti (kullanıcı ekran görüntüleri):**
- Ana üste solda geniş koyu boşluk vardı, içerik sağa sıkışmıştı.
- Savaşta solda daha ince bir şerit vardı.

**Kök neden:** `GameActivity.java` uygulamanın kök görünümüne kamera çentiği kadar dolgu veriyordu. Bu yüzden WebView sağa itiliyor ve solda siyah şerit kalıyordu. HTML de `viewport-fit=cover` ile kendi `env(safe-area-inset-left)` payını uyguladığı için ana üste boşluk **iki kat** oluyordu.

**Yeniden üretme:** Chromium'da çentik payı (CDP `Emulation.setSafeAreaInsetsOverride`, sol 37 px) ile:
- **Play'deki durum:** Pencere 37 px dar ve solda siyah şerit var; ana üs çerçevesi ayrıca 37 px içeri itiliyor.
- **Düzeltilmiş durum:** Pencere tam genişlik (800). Ana üs düğmeleri çentikten 37 px uzakta; savaş tuvali tam genişlikte (x=0, 800 px).

Görüntüler: `ekran_goruntuleri/tiklama_ve_centik/`.

**Düzeltme:** Kök dolgu kaldırıldı. Pencere `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` ile çentiğin arkasına kadar çiziliyor; düğmeleri HTML'nin kendi güvenli alan payı koruyor. Aynı değişiklik daha önce `fix/afp-android-fullscreen-20261117` dalında (`ce48305`) yapılmıştı; bu dala da alındı (`bf88481`).

**TAMAMLANMADI:**
- Gerçek telefonda doğrulama: senin cihazında yeni APK/AAB ile denenmeli.
- Play'e yükleme: senin onayınla yapılır.

## 2. Her düğmeye tıklama, kararma ve 1 sn geçişler — **TEST EDİLDİ**

**Yöntem:** Ana üsteki 30 düğmenin her birine parmakla dokunuldu. Dokunuştan sonra 1,6 sn boyunca ~35 ms arayla ekran görüntüsü alınıp her karenin ortalama parlaklığı ve siyah piksel oranı ölçüldü. Ham veri: `testler/sonuclar/tiklama_parlaklik.jsonl`.

| Ölçüm | Sonuç |
|---|---|
| Tam siyah / kararmış kare | **Yok.** En karanlık kare ana üs parlaklığının ~1/3'ü (21/61); açılan pencerenin koyu arka planı. Siyah piksel oranı en çok %19. |
| Geçiş süresi | Çoğu ekran **0,1–0,3 sn**; en yavaşı Desteler **~0,6 sn**. |
| JavaScript hatası | Tıklama testi boyunca **0**. |
| Kapatınca ana üsse dönüş | Profil, Kupa Yolu, Mağaza, Etkinlik Mağazası, Desteler, Kahramanlar, Minyonlar, Büyüler, Envanter, Koleksiyon, Sezon Bileti, Sandıklar, Lonca, Yankı, Kolosus, Sancak, Son Kahraman, Diğer Modlar, Günlük/Haftalık Görevler, Başarımlar, Arena, Etkinlikler, Geliştirme: ✕ / Kapat / GERİ ile ana üs görünür ve dokunulabilir hâle geliyor. |

**Testte ortaya çıkıp araştırılanlar (oyun hatası değil):**
- **Desteler'de "Cannot set properties of null" hatası:** Test kodum, Desteler ekranı kapandıktan sonra sayfadan kalkmış deste sekmelerine basıyordu. Bir oyuncu sayfada olmayan düğmeye basamaz; deste sekmeleri açık ekranda 5/5 hatasız çalıştı.
- **Açık kalan pencereler:** Test kodum bazı ✕ düğmelerini tanımıyordu. Gerçek dokunuşla hepsi kapandı.

**TAMAMLANMADI:**
- **Ödül alma (sandık açma, kupa yolu ödülü, görev ödülü düğmeleri):** Bu turda tek tek parmakla alınıp bakiyeyle karşılaştırılmadı. Maç sonu ödülleri ve kupa yolu kredisi önceki taramada doğrulanmıştı (`TEST_SONUCLARI.md`).
- **Mesaj, Sosyal, Menü, Ayarlar, Materyaller:** Üst çubuktaki küçük düğmeleri test aracımın arama eşiği (60 px) atladığı için kapanışları bu turda otomatik doğrulanmadı. Parlaklık testinde açıldılar (Sosyal'de "Giriş gerekli" penceresi ve ✕ görüldü); kararma yok.
