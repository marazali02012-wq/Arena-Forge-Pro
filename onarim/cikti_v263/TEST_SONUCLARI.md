# Test sonuçları — Arena Forge Pro v3.60.263

**Test edilen dosya:** `ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html`, 46.660.034 bayt, SHA-256 `ee82f7fbc166fe0dab2b8650689a42e5441f56535af228baa27eca222ce5c558`.

**Etiketler:**
- **DÜZELTİLDİ:** Kod değişikliği yapıldı ve doğrulandı.
- **TEST EDİLDİ:** Gerçek tarayıcı veya çalıştırılabilir test sonucu mevcut.
- **TAMAMLANMADI:** Düzeltilmeyen ya da doğrulanamayan sorun.

## Ortam ve yöntem (açıkça)

- **Tarayıcı:** Chromium (Playwright), mobil öykünme (dokunmatik, yatay), yerel HTTP sunucusu. **Gerçek telefon değil**, ekran kartı yok; WebGL ve tuval çizimi işlemcide taklit ediliyor.
- **Ekran ölçüleri:** 740×360, 667×375, 800×360. Savaş görsel denetimi cihaz piksel oranı 2 ile yapıldı.
- **Kart oynama:** Bir **test botu** oyuncunun kart komut kapısından (`AFP_LocalMatchAdapter.send`) kart oynadı; ilk savaşlarda kart parmakla sürüklendi. Bot ve durum okuma, test kopyasındaki tek satırlık `window.__AFE` kancasıyla çalışır; teslim edilen HTML'de bu kanca **yok**.
- **Test yardımları** (gerçek oyuncu böyle oynamaz, açıkça belirtiyorum):
  - **Zafer turları:** 6. saniyeden sonra rakip portal canı 2'ye indirildi. Bitişi bot yaptı.
  - **Yenilgi turları:** Bot durduruldu, dost portal canı 1'e indirildi. Bitişi rakibin vuruşu yaptı.
  - **Yankı zaferi:** Final boss çıkınca canı 1'e indirildi.
  - **Gizli Bölge ve Karanlık Geçit:** Kilit şartları profilden dolduruldu (kupa 400, en iyi kule katı 10, Karanlık Geçit zaferi 3).
- **İlk taramada 6 tur geçersiz sayıldı ve temiz başlangıçla yeniden oynatıldı:**
  - Kule ve Yankı yenilgi turlarında bot durdurulmadığı için bot maçı kazandı.
  - Yankı yenilgi turundan sonra açık kalan bir Yankı ekranı yüzünden Arena (3 tur) ve Karanlık Geçit zafer turu yanlış ekranda başladı.
  - Yeniden oynatmada her turdan önce sayfa yeniden açıldı ve başlayan modun doğru olduğu kontrol edildi. Gizli Bölge'nin 3 turu ve Karanlık Geçit'in yenilgi/pes turları ilk kez bu yöntemle oynandı.
  - Hiçbiri oyun hatası değildi.

## 1. Kod testleri — **TEST EDİLDİ**

`bash testler/testleri_calistir.sh ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html`

| Test | Sonuç |
|---|---|
| 106 çalıştırılabilir JS bloğu `node --check` | **0 hata** |
| Savaş motoru (`test_logic.js`) | **17/17** |
| Kart portreleri (`test_portraits261.js`) | **10/10** |
| v3.60.263 regresyon (`test_v263.js`): v262 düzeltmelerinin korunması + A–F | **15/15**. Aynı testler v3.60.262'de 9 yerde kalıyor; yani testler gerçekten değişikliği ölçüyor. |

## 2. Dokuz mod × zafer / yenilgi / pes — **TEST EDİLDİ** (27/27 tur)

Ekran 740×360. Ekran görüntüleri: `ekran_goruntuleri/maclar/<mod>_<akış>.webp`. "Sonrası", sonuç ekranındaki DEVAM / MODA DÖN / menü düğmesine basıldıktan sonra açılan ekrandır; siyah ekran hiçbir turda yoktu.

| Mod | Akış | Sonuç başlığı | Ödül satırı (ilk 70 karakter) | Ödül kutuları | Döngü hatası | Sonrası | Kaynak |
|---|---|---|---|---|---|---|---|
| 100 Katlı Kule | Zafer | KAT TEMİZLENDİ! | +100 TP · +244 KREDİ · KUPA DEĞİŞMEDİ · HESAP SEVİYESİ 2 (+100 KREDİ S | Kredi=244, Kule Mührü=1, Sandık=1 | 0 | DEVAM » → mod lobisi: tower | ilk tarama |
| 100 Katlı Kule | Yenilgi | PORTALLARIN DÜŞTÜ | +35 TP · +40 KREDİ · KUPA DEĞİŞMEDİ · KORVAYN +25 TP · KULE KAT 1/100  | Kredi=40 | 0 | Moda Dön → mod lobisi: tower | temiz yeniden oynatma |
| 100 Katlı Kule | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | ilk tarama |
| Hikâye Seferi | Zafer | ZAFER! | +100 TP · +250 KREDİ · KUPA DEĞİŞMEDİ · HESAP SEVİYESİ 3 (+150 KREDİ S | Kredi=332, Hikâye Sayfası=1, Sandık=1, Kahraman parçası=2, Kahraman eşyası=1 | 0 | DEVAM » → mod lobisi: campaign | ilk tarama |
| Hikâye Seferi | Yenilgi | PORTALLARIN DÜŞTÜ | +35 TP · +40 KREDİ · KUPA DEĞİŞMEDİ · KORVAYN +25 TP · +4 SIRADAN RÜNÜ | Kredi=40 | 0 | Moda Dön → mod lobisi: campaign | ilk tarama |
| Hikâye Seferi | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | ilk tarama |
| Gökyüzü Adaları | Zafer | ZAFER! | +100 TP · +100 KREDİ · KUPA DEĞİŞMEDİ · KORVAYN +60 TP · KAHRAMAN PARÇ | Kredi=165, Gök Kristali=2 | 0 | DEVAM » → mod lobisi: sky | ilk tarama |
| Gökyüzü Adaları | Yenilgi | PORTALLARIN DÜŞTÜ | +35 TP · +40 KREDİ · KUPA DEĞİŞMEDİ · KORVAYN +23 TP · +4 SIRADAN RÜNÜ | Kredi=40 | 0 | Moda Dön → mod lobisi: sky | ilk tarama |
| Gökyüzü Adaları | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | ilk tarama |
| Sancak Hâkimiyeti | Zafer | ZAFER! | +100 TP · +100 KREDİ · KUPA DEĞİŞMEDİ · KORVAYN +0 TP · KAHRAMAN PARÇA | Kredi=160, Sancak Madalyası=1 | 0 | DEVAM » → mod lobisi: flag | ilk tarama |
| Sancak Hâkimiyeti | Yenilgi | PORTALLARIN DÜŞTÜ | +35 TP · +240 KREDİ · KUPA DEĞİŞMEDİ · HESAP SEVİYESİ 4 (+200 KREDİ SE | Kredi=240 | 0 | Moda Dön → mod lobisi: flag | ilk tarama |
| Sancak Hâkimiyeti | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | ilk tarama |
| Kolosus | Zafer | ZAFER · TAŞ KOLOSUS DEVRİLDİ! | +100 TP · +100 KREDİ · KUPA DEĞİŞMEDİ · KORVAYN +0 TP · KAHRAMAN PARÇA | Kredi=100, Titan Çekirdeği=1, Sandık=1 | 0 | DEVAM » → mod lobisi: colossus | ilk tarama |
| Kolosus | Yenilgi | PORTALLARIN DÜŞTÜ | +35 TP · +40 KREDİ · KUPA DEĞİŞMEDİ · KORVAYN +0 TP · +4 SIRADAN RÜNÜ  | Kredi=40 | 0 | menu → ana üs | ilk tarama |
| Kolosus | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | ilk tarama |
| Yankı İstilası | Zafer | YANKI İSTİLASI · ZAFER | Yankı İstilası ödülü ayrı kaydedilir. Kupa ve normal sandık verilmez. | Kredi=38, Yankı Özü=2 | 0 | DEVAM » → ana üs | ilk tarama |
| Yankı İstilası | Yenilgi | PORTALLARIN DÜŞTÜ | Yankı İstilası ödülü ayrı kaydedilir. Kupa ve normal sandık verilmez. | — | 0 | MODA DÖN → ana üs | temiz yeniden oynatma |
| Yankı İstilası | Pes | MAĞLUBİYET | Yankı İstilası ödülü ayrı kaydedilir. Kupa ve normal sandık verilmez. | — | 0 | menu → ana üs | ilk tarama |
| Arena (kupa) | Zafer | ZAFER! | +100 TP · +200 KREDİ · +25 KUPA · HESAP SEVİYESİ 2 (+100 KREDİ SEVİYE  | Kredi=200, Arena Arması=2, Sandık=1 | 0 | DEVAM » → ? | temiz yeniden oynatma |
| Arena (kupa) | Yenilgi | PORTALLARIN DÜŞTÜ | +35 TP · +40 KREDİ · -10 KUPA · KORVAYN +25 TP · +4 SIRADAN RÜNÜ · +3  | Kredi=40 | 0 | DEVAM » → ? | temiz yeniden oynatma |
| Arena (kupa) | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | temiz yeniden oynatma |
| Karanlık Geçit | Zafer | ZAFER! | +125 TP · +125 KREDİ · +32 KUPA · KORVAYN +75 TP · KAHRAMAN PARÇALARI  | Kredi=125, Karanlık Mühür=2, Sandık=1 | 0 | DEVAM » → mod lobisi: dark | temiz yeniden oynatma |
| Karanlık Geçit | Yenilgi | PORTALLARIN DÜŞTÜ | +44 TP · +200 KREDİ · -10 KUPA · HESAP SEVİYESİ 3 (+150 KREDİ SEVİYE Ö | Kredi=200 | 0 | MODA DÖN → mod lobisi: dark | temiz yeniden oynatma |
| Karanlık Geçit | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | temiz yeniden oynatma |
| Gizli Bölge | Zafer | ZAFER! | +125 TP · +125 KREDİ · +32 KUPA · KORVAYN +75 TP · KAHRAMAN PARÇALARI  | Kredi=125, Gölge Mührü=1, Sandık=1 | 0 | DEVAM » → mod lobisi: secret | temiz yeniden oynatma |
| Gizli Bölge | Yenilgi | PORTALLARIN DÜŞTÜ | +44 TP · +50 KREDİ · -10 KUPA · KORVAYN +31 TP · GÖLGE YOLU SIFIRLANDI | Kredi=50 | 0 | MODA DÖN → mod lobisi: secret | temiz yeniden oynatma |
| Gizli Bölge | Pes | MAĞLUBİYET | ÖDÜL YOK · Pes edildi: mağlubiyet olarak kaydedildi | — | 0 | menu → ana üs | temiz yeniden oynatma |

**Özet:**
- **Bitiş başlıkları:** Bütün zaferler doğru zafer başlığıyla, bütün yenilgiler "PORTALLARIN DÜŞTÜ" ile, bütün pesler "MAĞLUBİYET" ile bitti.
- **Pes:** Hiçbir modda ödül yok. Yankı dışındaki modlarda satıra "Pes edildi: mağlubiyet olarak kaydedildi" ekleniyor.
- **Dereceli düellolar:** Zaferde +25/+32 kupa, yenilgide −10 kupa (Arena, Karanlık Geçit, Gizli Bölge).
- **Gizli Bölge yenilgisi:** "GÖLGE YOLU SIFIRLANDI".
- **Hata:** Savaş döngüsü hata sayacı 27 turun hepsinde **0**.

**Pes kaydı ayrıca profil farkıyla ölçüldü** (önce/sonra kayıt karşılaştırması):
- Kule, Kampanya, Gökyüzü, Sancak, Kolosus, Arena, Karanlık Geçit ve Gizli Bölge'de yenilgi genel istatistiğe ve mod kaydına **bir kez** yazıldı.
- Ödül ve görev ilerlemesi yazılmadı.
- Gizli Bölge'de "Evet, çık"a iki kez basılıp çıkış üçüncü kez tetiklendiğinde de yenilgi **tek** kayıt oldu.
- Savaş ortasında sayfa yenileme:
  - Kule'de sonuç yazmadı.
  - Dereceli Arena'da yalnız var olan "terk" kupa cezasını (−10) uyguladı.

**Sahaya çıkan birlik türleri:** Bütün turlarda kaydedildi; emekli (eski) birim **hiç çıkmadı**. Eski kayıt testinde desteye elle yazılan Ork Savaş Lordu ve Paladin yüklemede desteden çıkarıldı.

## 3. Savaş ekranı görsel denetimi — **TEST EDİLDİ**

- **Kapsam:** 3 ölçü × 4 mod (Kule, Sancak, Yankı, Kolosus). Her savaşta yaklaşık 3,5 sn arayla 8 örnek alındı; cihaz piksel oranı 2.
- **Her örnekte ölçülenler:**
  - Sahadaki her canlı birim çizildi mi (`_vis`) ve ekran içinde mi?
  - Koridorların üstüne binen yazı/kutu var mı?
  - Ekrandan taşan ya da yazısı kırpılan arayüz öğesi var mı?
  - Kare hızı (FPS), 5 sn ölçüm.
- **Ekran görüntüleri:** `ekran_goruntuleri/savas_denetimi/`.
- **Not:** Bu tablo rehber balonu düzeltmesinden **önceki** v3.60.263 ara sürümüyle alındı. Düzeltme sonrası ölçüm aşağıda.

| Ölçü | Mod | Örnek | Görünmeyen birim (örnek başına) | Ekran dışı birim | Koridoru örten en büyük öğe | Taşma / kırpık yazı | FPS* | En kötü %5 kare | Hata |
|---|---|---|---|---|---|---|---|---|---|
| 740x360 | 100 Katlı Kule | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | DIV#afpGuide %9.5 | 0 | 16.8 | 67 ms | 0/0 |
| 740x360 | Sancak Hâkimiyeti | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | DIV#afpGuide %4 | 0 | 14.8 | 100 ms | 0/0 |
| 740x360 | Yankı İstilası | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | SECTION#af203Choice %100 | 0 | 18.5 | 67 ms | 0/0 |
| 740x360 | Kolosus | 7 | [0, 0, 0, 0, 0, 0, 0] | 0 | DIV#afpGuide %4 | 0 | 56.4 | 33 ms | 0/0 |
| 667x375 | 100 Katlı Kule | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | DIV#afpGuide %10.2 | 0 | 16.7 | 83 ms | 0/0 |
| 667x375 | Sancak Hâkimiyeti | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | DIV#afpGuide %3.5 | 0 | 17.5 | 67 ms | 0/0 |
| 667x375 | Yankı İstilası | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | SECTION#af203Choice %100 | 0 | 16.7 | 67 ms | 0/0 |
| 667x375 | Kolosus | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | DIV#afpGuide %10.2 | 0 | 53 | 33 ms | 0/0 |
| 800x360 | 100 Katlı Kule | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | DIV#afpGuide %8 | 0 | 17.7 | 67 ms | 0/0 |
| 800x360 | Sancak Hâkimiyeti | 8 | [0, 0, 0, 0, 0, 1, 0, 0] | 0 | BUTTON#skill %0.8 | 0 | 16.9 | 83 ms | 0/0 |
| 800x360 | Yankı İstilası | 8 | [0, 0, 0, 0, 0, 0, 0, 0] | 0 | SECTION#af203Choice %100 | 0 | 16.6 | 83 ms | 0/0 |
| 800x360 | Kolosus | 7 | [0, 0, 0, 0, 0, 0, 0] | 0 | BUTTON#skill %1.3 | 0 | 58.2 | 17 ms | 0/0 |

\* FPS: ekran kartı olmayan headless Chromium'da, 2× çözünürlükte. **Telefon FPS'i değildir.**

**Bulgular:**
- **Minyonlar görünüyor mu?** Evet. 94 örnekten yalnız birinde (800×360 Sancak, 28,8. sn) bir dost "İskelet Kalkanlı" çizilmemiş görünüyor; bir sonraki örnekte (33,2. sn) çiziliyor. Tek örnekte kalan, kalıcı olmayan bir durum. En olası açıklama, birimin iki çizim karesi arasında sahaya çıkması. Kalıcı görünmezlik yok. Ekran dışına çizilen birim yok.
- **Bildirimler savaşı kapatıyor mu?**
  - **"YANKIYI PARÇALADIN! Bir güç seç" (%100):** Dalga arası güç seçim penceresi. Savaşı **duraklatıyor** (süre ilerlemiyor), yani tasarım gereği.
  - **Rehber balonu (%3,5–10,2):** **DÜZELTİLDİ**, aşağıya bakın.
  - **Büyü düğmeleri (%0,8–1,3):** Koridor alt kenarına değen oyunun kendi kontrolleri.
  - Bunların dışında koridoru örten bildirim, şerit ya da kutu **yok**.
- **Taşma / bozulma:** 12 savaşın hiçbirinde ekrandan taşan ya da kırpılan HUD öğesi yok. Sayfa taşması yok.
- **FPS:**
  - **Ölçüm:** Kule, Sancak ve Yankı 15–18 FPS, Kolosus 53–58 FPS.
  - **Kaynak:** Kare süresinin neredeyse tamamı karakter animasyon motorunun WebGL çizim + 2D tuvale kopyalama adımında (`af321Flush`). Kule'de 32 ms'lik karenin 31 ms'si. Arka plan, efektler ve can çubukları toplamda 1 ms'nin altında.
  - **Bu ortamda yanlış çıkan hipotez:** Tuvalin her karede yeniden boyutlanması. Ölçüldü; saniyede en fazla 1–1,5 kez, yuvarlama denemesi FPS'i değiştirmedi. Değişiklik yapılmadı.
  - **Oyunun kendi koruması:** Oyunun otomatik çözünürlük düşürme koruması çalışıyor (DPR 2 → 1,75 → 1,5).
  - **Sonuç:** Gerçek telefonda bu adım ekran kartında yapılır. **Telefon FPS'i bu ortamda ölçülemedi: TAMAMLANMADI.**

### Rehber balonu savaşta — **DÜZELTİLDİ** (son sürümle ölçüldü)

| Ölçü | Balon konumu (sol, üst, genişlik) | Örttüğü düğme/kart | Koridor örtmesi |
|---|---|---|---|
| 740×360 | 474, 254, 182 | yok | %0,6 |
| 667×375 | 434, 269, 149 | yok | yok |
| 800×360 | 505, 268, 211 | yok | yok |

Ara sürümde balon "KARTI AT" düğmesinin %44'ünü, 667×375'te ses/✕ düğmelerinin %53'ünü örtüyordu. Üç sebep bulunup giderildi:
- düğme geç beliriyordu;
- oyunun `min-width:172px` kuralı genişliği zorluyordu;
- 667 genişlikte boşluk eşiği dar kalıyordu.

Görüntüler: `ekran_goruntuleri/savas_denetimi/balon_*.webp`.

## 4. Menü ekranları — **TEST EDİLDİ**

**Kapsam:** Ana üs, desteler, kahramanlar, minyonlar, büyüler, geliştirme, envanter, koleksiyon, kupa yolu, sezon bileti, sandıklar, mağaza, günlük ve haftalık görevler, başarımlar, etkinlikler, profil, lonca. Her biri × 3 ölçü (63 açılış).

**Sonuç:**
- **Sayfa taşması, JavaScript hatası, boş/kırık/1×1 görsel:** hiçbirinde yok.
- **Kesik görünen yazılar incelendi:**
  - **Kahramanlar/Büyüler ekranındaki büyü açıklamaları** üç satırla sınırlı ve "…" ile bitiyor. **Bilinçli tasarım:** ÖNİZLE penceresi tam metni gösteriyor; tarayıcıda doğrulandı.
  - **Büyü detay penceresinin alt düğmesi** (GELİŞTİR) ilk açılışta alt kenardan ~11 px kesik görünüyor. Panel kaydırılabilir olduğu için düğmenin tamamına ulaşılıyor. Küçük görsel not; **TAMAMLANMADI** listesinde.
  - **Kupa Yolu'nda iki satıra bölünen kart adı** ("ATEŞ ELEMENTALİ") ve **667×375'te Minyonlar ekranındaki "Boş · dokun ve kuşan" alt yazısı** satır sınırında kırpılıyor. Küçük görsel not; **TAMAMLANMADI**.
- **Bu araçla açılamayanlar:**
  - **Mesajlar ve Ayarlar:** Düğmeleri test aracının arama eşiğinden küçük olduğu için açılamadı; bu sürümde **test edilmedi (TAMAMLANMADI)**.
  - **Hikâye Seferi:** Ana üste değil, mod galerisinde. Maç taramasında açılıp oynandı.

Görüntüler: `ekran_goruntuleri/ekranlar/`.

## 5. Düzeltmelerin tarayıcıda doğrulanması — **TEST EDİLDİ**

| Madde | Gözlenen |
|---|---|
| A Pes = mağlubiyet | 9 modda tek kayıt, ödülsüz, görev ilerlemesi yok; Gizli Bölge yolu sıfırlanıyor; Yankı değişmedi |
| C Tekrar görseller | Gölge görseli 256×256, mağaza = epik sandık 315×279, Yankı tanıtım 468×310 çözülüyor; 4 efekt şeridi gerçek `AFX.spell` ile yüklendi (`ready=true`) |
| D Ödül simgeleri | Hikâye zaferinde "Kahraman parçası +2" Korvayn portresi, "Kahraman eşyası +1" kılıç simgesi (`ekran_goruntuleri/duzeltmeler/`) |
| E Rehber balonu | Sonuç ekranında "ZAFER" başlığının örtülmesi %40 → %4; savaşta yukarıdaki tablo |
| F Kupa yolu kredisi | "+175 KREDİ · +25 KUPA · KUPA YOLU +75 KREDİ", bakiye 572 → 747 |

## 6. Dosya boyutu

| | Bayt |
|---|---|
| v3.60.262 | 46.893.179 |
| v3.60.263 | 46.660.034 |
| Fark | **−233.145** (tekrar görseller −234.115; yeni kod +970) |

- Yeni görsel gömülmedi, hiçbir görselin çözünürlüğü düşürülmedi.
- 1×1 yer tutucu dışında birebir tekrar eden görsel kalmadı (`test_v263.js` denetliyor).

---

## Kalan eksikler turu — test sonuçları

### Kod testleri
| Grup | Sonuç |
|---|---|
| JS sözdizimi (106 blok) | hata 0 |
| Eski savaş testleri | 17/17 |
| Kart portresi testleri | 10/10 |
| v263 regresyon testleri | 40/40 |

### Tarayıcı (Chromium, 667×375 · 740×360 · 800×360)
| Konu | Sonuç |
|---|---|
| Büyü penceresi düğmeleri | 3 ölçüde kaydırma payı 0, düğmeler tam görünür |
| Kupa Yolu | 92 kart 90 px, kırpık ad 0, küçük figürlü minyon kartı 0 |
| Minyon nadirlik sekmeleri | 3 ölçüde 6 sekme sığıyor |
| Ekipman yuvası yazısı | Taşma yok |
| Yadigârlar alt bilgisi | 3 ölçüde tam |
| Kahramanlar 5 sekme | Aynı kolon düzeni; 740/800'de liste taşmıyor |
| Savaş öğretici balonu (2 adım) | Koridora binme 0 px, ekran içinde, kart/düğme örtme yok |
| Üst koridor can çubuğu sınırı | Yalnız üst koridor (409/792); orta 0/138, alt 0/86 |
| Örümcek Akını zafer / yenilgi / pes | Etiket doğru; ödül ve sayaçlar doğru; çift ödül yok; JS hatası 0 |
| İki Oyunculu Kolosus (bot) | Doğal oynanışta kontrol puanıyla zafer; kupa/kredi değişmedi; etiket doğru |
| Son Kahraman / Lonca Dev Avı / Lonca (misafir) | Giriş uyarısı doğru; sunucu gerekli kısım denenemedi |
| Android geri tuşu köprüsü (Android adresi taklidi) | v3.60.220 ile birebir aynı davranış, JS hatası 0 |

### Android derlemesi (GitHub Actions "Android derleme", çalıştırma #55, commit 76db7f5)
| Adım | Sonuç |
|---|---|
| `assembleDebug` + `bundleRelease` | BUILD SUCCESSFUL (26 sn, 81 görev) |
| `bundletool validate` (1.18.1) | Geçti; base modülü: `assets/www/index.html`, `dex/classes.dex`, simge |
| `apksigner verify` (test APK'sı) | Doğrulandı: v2 imza; imzalayan "CN=Android Debug" (hata ayıklama anahtarı) |
| Yükleme anahtarıyla AAB imzası | **Yapılmadı:** depoda yükleme anahtarı gizli değişkenleri tanımlı değil; AAB imzasız |
| Çıktı | Actions dosyası "ArenaForgePro-android" (66,8 MB): test APK'sı + imzasız AAB + doğrulama metinleri |

Test APK'sı hata ayıklama anahtarıyla imzalı bir deneme paketidir, **yayın paketi değildir**. Play'e yüklenecek AAB, sahibinin kendi yükleme anahtarıyla imzalanmalıdır.

### Son regresyon taraması (bütün düzeltmelerden sonra, temiz sayfayla, 740×360)
| Mod · akış | Başlık | Ödüller | Motor hatası | DEVAM sonrası |
|---|---|---|---|---|
| Arena · zafer | ZAFER! | Kredi 525, Arena Arması 2, Sandık 1, Kart parçası 9 | 0 | Kupa Yolu |
| Doruk Kulesi · zafer | KAT TEMİZLENDİ! | Kredi 144, Kule Mührü 1, Sandık 1 | 0 | Kule ekranı |
| Hikâye Seferi · zafer | ZAFER! | Kredi 332, Hikâye Sayfası 1, Sandık 1, Kahraman parçası 2, Kahraman eşyası 1 | 0 | Sefer ekranı |
| Gökyüzü Adaları · zafer | ZAFER! | Kredi 165, Gök Kristali 2 | 0 | Ada ekranı |
| Sancak · zafer | ZAFER! | Kredi 160, Sancak Madalyası 2 | 0 | Sancak ekranı |
| Kolosus · zafer | ZAFER · TAŞ KOLOSUS DEVRİLDİ! | Kredi 300, Titan Çekirdeği 1, Sandık 1 | 0 | Kolosus ekranı |
| Yankı · zafer | YANKI İSTİLASI · ZAFER | Kredi 38, Yankı Özü 2 | 0 | Yankı girişi |
| Karanlık Geçit · zafer | ZAFER! | Kredi 125, Karanlık Mühür 2 | 0 | Geçit ekranı |
| Gizli Bölge · zafer | ZAFER! | Kredi 125, Gölge Mührü 1 | 0 | Bölge ekranı |
| Doruk Kulesi · yenilgi | PORTALLARIN DÜŞTÜ | Kredi 40 | 0 | Kule ekranı |
| Arena · pes | MAĞLUBİYET | yok | 0 | Ana üs |

Zafer/yenilgi bitişi test yardımıyla tetiklendi (rakip/dost portal canı düşürüldü, Yankı'da boss canı); bitişi ve ödülü oyunun kendi kuralları yaptı.

## FPS taraması — test sonuçları

Ortam: başsız Chromium, ekran kartı yok (SwiftShader, yazılımla WebGL), 800×360, bot oynuyor. FPS 5 sn, işlemci profili 8 sn (CDP Profiler).

| Mod | FPS | DPR | 2B kopyanın işlemci payı |
|---|---|---|---|
| Ana üs | 60 | 2 | – |
| Kolosus | 59 | 2 | %40 |
| Gökyüzü | 49 | 1,5 | %86 |
| Hikâye Seferi | 45 | 1,5 | %57 |
| Örümcek Akını | 23 | 1,5 | %82 |
| Arena | 21 | 1,5 | %85 |
| Gizli Bölge | 21 | 1,5 | %75 |
| Sancak | 20 | 1,5 | %80 |
| Yankı | 14 | 1,5 | %83 |
| Karanlık Geçit | 14 | 1,5 | %85 |
| Kule | 12 | 1,5 | %85 |

Eski ve yeni sürüm aynı modda arka arkaya ölçüldü (8 sn'lik profil, çizim döngüsündeki `getBoundingClientRect`):

| Mod | Eski | Yeni |
|---|---|---|
| Kule | 136,6 ms (%1,7) | çizimde 0 (sayfadaki tek çağrı 9 ms, başka kod) |
| Yankı | 99,6 ms (%1,2) | çizimde 0 |

FPS sayıları sahadaki birim sayısına göre çok oynadığı için (Kule eski 23 / yeni 18, Yankı eski 14 / yeni 20) iyileşme FPS'le değil, ölçülen işlev maliyetiyle gösterildi.

Düzeltmeden sonra yeniden denenenler (yeni sürüm):
- Büyü sürükle-bırak, 667×375 · 740×360 · 800×360: düğmenin altındaki düşmana atış, el kartına bırakınca iptal, kısa dokunuş, 2. büyü üst koridora; JS hatası 0.
- Yankı 800×360: üst koridor can çubukları görünüyor, mod şeridinin altında (taban 68 px).
- Boss Koleksiyonu: üç kart animasyonlu; pencere kapanınca kare durdu (6,6,6 → 6,6,6), yeniden açınca devam etti.
- Kod testleri: sözdizimi 107/107, 17/17, 10/10, v263 46/46 (yeni test AI: çizim içinde ölçüm yok, tüm sayfa gözlemcisi yok).

**Ölçülmedi:** telefonda FPS. Bu ortamda ekran kartı olmadığı için telefon sonucu tahmin edilemez.
