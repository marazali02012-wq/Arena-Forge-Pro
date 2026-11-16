# Eksik özellik listesi — doğrulanmış durum (3.60.241)

Dış kaynaklı 25+5 maddelik listeyi hem oyun deposunda hem `arena-forge-online-server` deposunda kodla kontrol ettim.
**Yapıldı** = kodda var ve test edildi · **Hazır, canlıya alınmadı** = kod/SQL var, sahibi uygulayacak · **Yok** = kodda bulunamadı · **Sahibi** = bu ortamdan yapılamaz.

| # | Madde | Durum |
|---|---|---|
| 1–2 | Sunucunun savaş hasarını hesaplaması / tam güvenli PvP | **Yok.** Sunucu savaşı oynatmıyor (`server.js` kendi başlığında "does NOT simulate combat" diyor). Var olanlar: iki koltuğun uyuşması + saat/portal/bayrak/son durum tutarlılık kontrolleri. Gerçek çözüm savaş çekirdeğinin deterministik sunucu sürümü; ayrı büyük iş. |
| 3–5 | Lonca sunucusu, Dev Avı hasar doğrulaması, boss ödülü | **Lonca sunucusu canlı** (PR #5 ile, #3'ün içeriğini kapsar; oyunun kullandığı `/api/v1/guild/*` + sizin `/api/guild` işleyiciniz yan yana). Katkılar `verified:false`, ödül kapalı; hasar doğrulaması (1–2'ye bağlı) yok. |
| 6 | Güvenli kupa sıralamasının etkinleştirilmesi | **Hazır.** SQL (28/28 test), sunucu `afp_trophy_settle` çağrısı, istemci sıralaması ve **yeni: `trophy_update` işleme (3.60.241)**. Açmak için sahibi: SQL'i uygula + `AFP_TROPHY_AUTHORITY_ENABLED=1`. |
| 7 | Eski kupa yollarının kapatılması | **Sahibi.** `sunucu/04_eski_islevleri_kilitle.sql` şablon; canlı şema gerekir. İstemci artık kupa göndermiyor. |
| 8 | Kupa eşleştirmesinin sunucuya bağlanması | **Yapıldı** (sunucu bayrak açılınca `afp_player_trophies`'ten okur; uçtan uca testli, sahte Supabase). |
| 9–12 | Google Play ödeme, Sezon Bileti doğrulaması, teslim, geri yükleme | **Yok / Sahibi.** Projede Billing kütüphanesi yok; Play Console ürünleri ve sunucu doğrulaması gerekir. |
| 13 | Hile/ödül kayıtlarının kalıcılığı | **Yapıldı (3.60.103 sunucu).** `afp_anticheat_log` + yeniden başlamada geri yükleme; 4 birim + uçtan uca test. Canlıda `05_antihile_kayit.sql` çalıştırılmalı. |
| 14 | Güncel Android paketi | Gradle 3.60.241 / 241. İmzalı APK/AAB **Sahibi** (yükleme anahtarı). |
| 15–17 | Yardımcı lider, üye çıkarma, lider devri, lonca sohbeti, katkı sıralaması | **Yapıldı (3.60.242, sunucu dalı `claude/guild-management`)**: sunucu API + SQL (yerelde 29/29) + oyun içi ekran (14/14). **Canlı (2026-11-17)**: migration canlı Supabase'de (sizin uyguladığınız `09_lonca_yonetimi_v11.sql`, aynı işlev; canlıda geri alınan işlevsel testle doğrulandı), sunucu PR #5 main'e birleşti, Render 2f075f3 yayında. Katkı ödülü dağıtımı kapalı (hasar doğrulanamıyor). |
| 18–19 | 8 kişilik Son Kahraman Ayakta, 2 kişilik Kolosus | Sunucu yalnız 1v1 (`ALLOWED_PARTY_SIZES={2}`, PvE modlar `battleEnabled:false`). **Yok.** |
| 20 | Maça geri katılma | **Yapıldı (oyun 3.60.243 + sunucu 3.60.104, dal `claude/match-rejoin`)**: kopan oyuncu 25 sn içinde aynı koltukla döner, kaçırdığı hamleler yeniden oynatılır, rakip bekler. Sunucu tarafı **Render'a yayınlanmadı** (PR birleştirilmedi); 4 PvP kuyruğunu kapsar. Gerçek iki cihazla ağ kopma testi yapılmadı. |
| 21 | Sohbet güvenliği | **Kısmen var:** engelleme ve şikâyet kodu mevcut; moderasyon paneli yok. |
| 22 | Arkadaşlık maçı | Yerel/mock akış var (`friendly`); gerçek davet/özel oda sunucusu yok. |
| 23 | Hesap değişince ilerleme | Bulut birleştirme kodu var (`mergeProfile`); canlı iki hesapla test **edilmedi**. |
| 24 | Sezon sonu işlemleri | İstemci tarafı sezon etkinliği var; **sunucu tarafı sezon sonu dağıtımı yok.** |
| 25 | Ekonomi güvenliği | Yerel mühür (`arenaForgeProSealV1`) var; sunucu otoriteli ekonomi **yok** (kredi/sandık cihazda). |
| Play | Gizlilik/hesap silme sayfaları | `yayin/web/*.html` içinde `[DESTEK E-POSTASI]` vb. yer tutucular var — **Sahibi** doldurmalı; yayımlama ve geliştirici kimlik doğrulaması da sahibi. |
