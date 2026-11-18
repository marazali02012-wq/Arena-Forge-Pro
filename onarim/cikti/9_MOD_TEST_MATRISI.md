# Dokuz mod — gerçek tarayıcı test matrisi

## Nasıl test edildi

- **Tarayıcı:** Chromium (Playwright, mobil öykünme: `isMobile`, dokunmatik, yatay). HTML yerel HTTP sunucusundan açıldı. Önceki ortamı engelleyen `ERR_BLOCKED_BY_ADMINISTRATOR` sorunu burada yok.
- **Sürüm:** Dokuz modun tamamı önce **v3.60.261** üzerinde oynandı, hatalar orada bulundu. Düzeltmeler **v3.60.262** üzerinde tekrar oynanarak doğrulandı.
- **Ekran:** Mod testleri 740×360'ta yapıldı. Üç ölçünün karşılaştırması `ANDROID_740_667_800.md` dosyasında.
- **Kart oynama:**
  - İlk savaşta kart **parmakla sürükle-bırak** ile oynandı (`touch drag`).
  - Uzun maçlarda bir **test botu** kullanıldı. Bot, oyuncunun kart komut kapısını (`AFP_LocalMatchAdapter.send`) çağırır, yani oyuncu girdisiyle aynı doğrulamadan geçer.
  - Bot, test kopyasındaki tek satırlık `window.__AFE` kancasıyla çalışır. Bu kanca teslim edilen HTML'de **yok**.
- **Hız:** Çoğu maç oyunun kendi 2× hızında oynandı.
- **Menü gezintisi:** Gerçek dokunuşlarla yapıldı (giriş, ana üs, mod galerisi, lobiler, DEVAM, GERİ).
- **Durum kaydı:** Maç boyunca portal canı, birlik sayısı ve boss durumu 2 sn'de bir kaydedildi.

**Test kolaylığı için yapılan profil değişiklikleri** (gerçek oyuncu böyle oynamaz, açıkça belirtiyorum):
1. Gizli Bölge ve Karanlık Geçit'in kilit şartları elle dolduruldu: kupa 400, en iyi kule katı 10, Karanlık Geçit zaferi 3.
2. Yankı İstilası'nın ikinci koşusunda final boss'un canı 1'e indirildi; zafer yolunu hızlı görmek içindi. Birinci koşu el değmeden oynandı.

## Matris

Gösterim: ✅ tarayıcıda gözlendi · ⚠️ gözlendi, sorun/not var · ⛔ yapılamadı · 🔧 v262'de düzeltildi

| Mod (kimlik) | Giriş | Bekleme/lobi | Minyon yerleşimi | Hasar | Portal / boss | Bitiş | Devam / geri | 740×360 görsel |
|---|---|---|---|---|---|---|---|---|
| **Arena / kupa** (`arena` → yerel yedekte `duel`) | ✅ Ana üs ARENA | ✅ Lobi → deste ekranı (12 kart, 6×2) → çevrim içi kuyruk "Rakip aranıyor" | ✅ sürükle-bırak + bot | ✅ | ✅ Dost portal 430→0 | ✅ KAYBETTİN (71 sn) | ✅ "Tekrar Oyna" yeni maçı hemen açtı | ✅ |
| **100 Katlı Kule** (`tower`) | ✅ Galeri | ✅ Kat 1 lobisi, kat ödülü, harita | ✅ | ✅ | ✅ Rakip portal 0 | ✅ ZAFER (48 sn): +244 kredi, +1 Kule Mührü, +1 sandık | ✅ DEVAM → lobi **Kat 2** açık, zafer 1 | ✅ |
| **Yankı İstilası** (menü `boss`, savaş `echo`) | ✅ Ana üs | ✅ "Aşama 1/30" | ✅ | ✅ | ✅ 3 dalga + güç seçimi (Rün Zırhı / Gök Akını / Can Dokusu) + final boss **Ayna Celladı** (76. sn). Rakip portal 44. sn'de 0 oldu ama **erken zafer olmadı** (v260 düzeltmesi gerçek oyunda doğrulandı) | ✅ 1. koşu: süre bitti, boss 104/518 → KAYBETTİN · 2. koşu: boss öldü → ZAFER, +2 Yankı Özü | ✅ MODA DÖN → lobi, aşama 2 | ✅ |
| **Hikâye Seferi** (`campaign`) | ✅ Galeri | 🔧 Aşama paneli üstten kesikti → v262'de düzeldi · ✅ Prolog (3 sayfa) + bölüm konuşması | ✅ | ✅ | ✅ Rakip portal 0 | ✅ ZAFER: +332 kredi, Hikâye Sayfası, sandık, kahraman parçası/eşyası | ✅ DEVAM → **Aşama 2** açık | ⚠️ kahraman parçası/eşyası ödülünde genel dişli simgesi |
| **Gökyüzü Adaları** (`sky`) | ✅ Galeri | ✅ Ada 1, ödül kutusu | ✅ | ✅ | ✅ | ✅ ZAFER (43 sn): +165 kredi, +2 Gök Kristali | ✅ DEVAM → **Ada 2** açık | ✅ |
| **Sancak Hâkimiyeti** (`flag`) | ✅ Ana üs / galeri | ✅ Kurallar paneli (kaydırılabilir) → çevrim içi kuyruk → ~10 sn'de yerel yedek | ✅ | ✅ | ✅ 3 bayrak, puan 90'a | ✅ v261: ZAFER 63–12 · v262: zafer 67–16, zafer 48–16, yenilgi 41–42 (süre) | ✅ kayıt `af36Flag` doğru | 🔧 skor kutusu üst koridoru kapatıyordu → v262'de düzeldi |
| **Gizli Bölge** (`secret`, düello) | ✅ Galeri; kilitliyken 3 şart doğru gösteriliyor | ✅ Şartlar (test için doldurulmuş) → KİLİDİ AÇ → "GÖLGE YOLU 1/3" | ✅ | ✅ | ✅ | ✅ Aşama 1 ZAFER: +32 kupa, +1 Gölge Mührü, yol 2/3 | ✅ | ✅ · Aşama 2–3 **oynanmadı** |
| **Karanlık Geçit** (`dark`, zor düello) | ✅ Galeri; kilitliyken şartlar doğru | ✅ (test için doldurulmuş) KİLİDİ AÇ → GEÇİDE GİR | ✅ | ✅ | ✅ Dost portal 0 | ✅ KAYBETTİN: −10 kupa (doğru) | ✅ TEKRAR DENE / Moda Dön | ⚠️ +375 kredi; bkz. not 4 · **zafer yolu gözlenmedi** |
| **Kolosus** (ayrı `colossus` penceresi, `boss` PvE) | ✅ Ana üs | ✅ Kademe 1/82, zorluk kuşakları | ✅ | ✅ | ✅ Taş Kolosus 336 can, hız −0,047→−0,0725, 19. sn'de dost tarafa ulaştı (**aşırı yavaşlık yok**) | ✅ ZAFER "TAŞ KOLOSUS DEVRİLDİ" (38 sn): +100 kredi, +1 Titan Çekirdeği | ✅ DEVAM → **Kademe 2**, zafer 1 | ✅ |

**İlk açılış (eğitim savaşı)** ayrıca test edildi:
- Akış: misafir girişi → hikâye girişi (ATLA) → ücretsiz minyon → eğitim savaşı (rakip portalı 110) → zafer.
- Savaş ortasında sayfa yenilenirse sahte zafer **yazılmıyor**.

## Gözlemler ve notlar

1. **Arena çevrim içi kuyruk:** Sunucu (`wss://arena-forge-online-server.onrender.com`) bu test ortamının ağından **erişilemedi**. Kuyruk bu yüzden ~20 sn'de yerel bota düştü. Çevrim içi eşleşme ve PvP **test edilmedi**.
2. **Arena zafer yolu** tarayıcıda gözlenmedi: bot iki maçı da kaybetti. Zafer, yenilgi ve beraberlik koşulları kod testinde (17/17) doğrulanmış durumda.
3. **Pes etme:** Kule'de X → "Evet, çık" → ana üs. Pencere "mağlubiyet sayılacak" diyor ama mod istatistiğine **yenilgi yazılmıyor**. Bkz. `KALAN_EKSIKLER.md`, karar gerekiyor.
4. **Karanlık Geçit +375 kredi:** Taban yenilgi ödülü 40 × 1,25 = 50. Kalan 325, kupa yolu kilometre taşlarından geldi; benim kupayı elle 400 yapmam yüzünden hepsi aynı anda ödendi. **Hata değil**, test yan etkisi. Küçük arayüz eksiği: ödül satırı bu kredinin kaynağını yazmıyor.
5. **Rehber balonları** ("SAVAŞ 2/4… ANLADIM", "1/4 SANDIK AÇ"):
   - Yeni oyuncuda savaşta sağ altta kart atma bölgesinin üstüne, sonuç ekranında da başlığın üstüne biniyor.
   - KAPAT / ATLA ile kapanıyor ve yalnız ilk maçlarda çıkıyor; dokunulmadı.
6. **Yankı final boss** ilk koşuda süre içinde öldürülemedi (bot, düşük seviye deste). Denge kararı olduğu için değiştirilmedi.

## Kanıt

- Ekran görüntüleri: `ekran_goruntuleri/once_sonra/` (mod sonuçları ve önce/sonra) ve `ekran_goruntuleri/android/`.
- Test araçları: `testler/tarayici/`.
