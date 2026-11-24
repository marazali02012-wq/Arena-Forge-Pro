# Arena Forge Pro v303: 3 onarım, portal hedef kilidi ve HP çubukları

- **Temel:** v301. v301'e ek olarak yalnızca Minyonlar panelinin 360 px düzeltmesi (CSS) var.
- **Üç eski onarım:** `claude/v302-uc-hata-onarimi` dalındaki `tools/patch_v302.py` yamasından geliyor.
- **Bu sürümün değişiklikleri:** `tools/patch_v303.py`.
- **Başka sürümle birleştirme:** yok. Arayüz tasarımı, oyun dengesi, can/hasar/hız değerleri değişmedi.

**HTML:** `app/src/main/assets/www/index.html`, SHA-256 `6fdda2d4e02f6f65ed6d179bde1f8d7e980eec063b88ef6e5cfb501d02b4eb91`, 68.633.654 bayt.

## Değiştirilen fonksiyonlar

| # | Konu | Fonksiyon / yer | Değişiklik |
|---|---|---|---|
| 1 | Sunucu | `AFP_MULTIMODE_ONLINE_FOUNDATION_V1`: `serverUrl`, `normalizeServerUrl`, `configure`, `connect` (v302) | Adres resmî `wss://arena-forge-online-server.onrender.com/ws` adresine sabitlendi. Cihazda kayıtlı eski adres siliniyor. Başka adresler reddediliyor. Sunucu düzenleme ekranı kaldırıldı. |
| 1 | Sunucu | Aynı script: `window.AFP_MODE_NET_WS_URL` (v303) | Salt okunur özellik oldu; sonradan yazılan adres yok sayılıyor. |
| 1 | Sunucu | `AFPReplay.upload` (v303) | Oturum anahtarı yalnızca resmî sunucuya gönderiliyor. Eskiden değiştirilebilen pencere değişkeninden okunuyordu. |
| 2 | Kilitli kart | Kart ızgarası `meta` / `frag` metinleri ve profil arayüzündeki `fragEl` (v302) | Parça gerektirmeyen kilitli kartta "0/0 parça" yerine "KİLİTLİ · SANDIK" ve "Sandıktan kazanarak açılır" yazıyor. |
| 3 | Efekt | `AF285_FXLIB` (beş yeni atlas), `afn_kutup_kiricisi`, `afn_ocak_dovucusu`, `afn_sicrayan_kocbasi`, `afn_toprak_yarici`, `afn_zincir_kiran` çağrıları (v302) | 4×4, 160 px karelik, saydam WebP atlaslar 0–15 karelerini oynatıyor. Bu minyonlarda eski efekt çağrısının yerini aldılar. |
| 4 | Portal kilidi | Savaş döngüsünde hedef seçimi (`previousTarget`, `for(const e of units)`), mavi ve kırmızı portal saldırı dalları, yeni `af303PortalHoldAim` (v303) | Portala vurmaya başlayan birime `_afPortalLock` yazılıyor. Portal ayakta ve birim portal menzilindeyse (gövde itmesi için 0,045 pay) yeni düşman aranmıyor. Portal yıkılınca, koridor değişince veya birim gerçekten geri itilince kilit kalkıyor. |
| 5 | HP çubuğu | `af320PrepareHudOffsets`, `af320DrawHud` (v303) | Kalıcı birim durumu. 3'lü medyan ve sınırlı hızla yumuşatma. Kalıcı sıralama (komutan/boss, sonra görünenler, sonra geliş sırası). Satır hafızası (en fazla 4 satır). Yoğun mod histerezisi (12'de gir, 9'da çık). Yerleşim kutusu = gerçek çizim alanı (çubuk + enerji rozeti). Üst HUD sınırına takılan çubuk gerçek konumuyla denetleniyor. Çubuk y'si tek kaynaktan geliyor. |

## Kök nedenler

- **HP çubuğu titremesi:** çubuk yerleşimi gövdeler çizildikten sonra hesaplanıyor, ama karakter motoru (`af321Flush`) ardından sprite tepesini güncelliyordu. Çubuk bu farklı tepe değeriyle çizildiği için saldırı animasyonunda her karede ±8 px zıplıyordu. Önceki düzeltme bu yüzden yetmedi.
- **HP çubuğu sıçraması ve aç/kapa:** yerleşim her karede hafızasız kuruluyordu. Sıralama animasyonla oynayan y değerine göre yapılıyor, yer bulunamayınca çubuk gizleniyor, yoğun mod tam 12 birimde açılıp kapanıyordu.
- **HP çubuğu çakışması:** yerleşim kutusu çizilen alanla aynı değildi; rozet ve boya göre değişen kayma hesaba katılmıyordu. Üst sınıra takılan çubuklar aynı y'ye yığılıyordu.
- **Portal kilidi:** hedef her karede sıfırdan seçiliyor ve ileri yöndeki düşman minyon portaldan önce geliyordu.
- **Sunucu:** adres kaydedilebilir bir değerden ve değiştirilebilir bir pencere değişkeninden okunuyordu.
- **0/0 kartları:** parça gerektirmeyen kartlarda `UNLOCK_SHARDS[type]||0` değeri 0 oluyordu.

## Test sonuçları

Testler Chromium (başsız, GPU'suz) ve oyunun kendi komut yolu (`AFP.command`) ile yapıldı. FPS değerleri GPU'suz ölçüldü; yalnızca karşılaştırma içindir.

### HP çubukları (v302 → v303, 740×360, portal önünde, 5 sn)

| Senaryo | Aç/kapa (birim/sn) | Ort. titreme | Büyük sıçrama/sn | Çakışan çift/kare | Görünen çubuk |
|---|---|---|---|---|---|
| 1 minyon | 0 → 0 | 0 → 0 px | 0 → 0 | 0 → 0 | %100 → %100 |
| 4 minyon | 0,26 → 0,15 | 1,2 → 0,4 | 8,1 → 0,9 | 0 → 0 | %94 → %78–88 |
| 12 minyon | 1,09 → 0,11 | 2,5 → 0,4 | 14,7 → 0,3 | 0 → 0 | %63 → %48–59 |
| 20 minyon | 0,87 → 0,07 | 3,0 → 0,8 | 15,5 → 1,1 | 0,04 → 0 | %50 → %35 |
| 40 minyon | 0,70 → 0,05 | 1,6 → 0,1 | 5,5 → 0 | 1,0 → 0 | %35 → %19–27 |
| 40 karışık (mavi + kırmızı, 3 koridor) ×3 | 0,22 → 0,01–0,02 | 1,4 → 0,2–0,3 | 11 → 0,3–0,6 | 7,9 → 0 / 0 / 0 | %85 → %40–42 |
| 20 / 40 minyon, 667×375 | 0,81 / 0,73 → 0,02 / 0,03 | 3,1 / 0,7 → 1,0 / 0,2 | 13,9 / 1,8 → 0,3 / 0,1 | 1 / 2,2 → 0 / 0 | %53 / %35 → %29 / %19 |

Diğer HP çubuğu testleri:
- **Hasar ve iyileştirme:** %30 → %80 → %42; çubuk genişlik oranı 2,67 (beklenen 2,67). Geçti.
- **Ölüm:** çubuk ölüm karesinden sonra çizilmiyor. Geçti.
- **Performans:** yerleşim 40 birimde ortanca 0,2 ms (v302 ile aynı), en fazla 0,5 ms (v302: 0,6 ms). FPS v302 ile aynı.

### Portal kilidi

8 motor modunda (düello, arena, kule, hikâye, gökyüzü, sancak, örümcek akını, yankı) her biri 6 senaryo: **48/48 geçti**.
- Senaryolar: yakın dövüş ve menzilli minyon, mavi ve kırmızı takım, portala vururken önüne yeni düşman konması.
- Gizli Bölge, Karanlık Geçit ve Kristal Kolos düello ve boss motorlarını kullanıyor; bu motorlar kapsandı.
- v302'de aynı senaryolarda minyon hedef değiştiriyordu.
- **Not:** yeni düşmana minyonun **yeteneğinden** küçük hasar gidebiliyor. Yetenekler değiştirilmedi; kilit yalnızca temel saldırının hedefini koruyor.

### Üç eski onarım

- **Sunucu:** cihazda kayıtlı eski adres, sayfa yüklenmeden önce yazılan adres ve sonradan yazılan adres yok sayıldı. `configure` ile girilen kötü adres ve benzer görünen tuzak adres reddedildi. Açılan tek WebSocket resmî sunucuya gitti. Geçti.
- **Kilitli kartlar:** v301'de 47 "0/0" ve 51 "Açmak için 0 parça" vardı, v303'te 0 ve 0. 51 kartta "KİLİTLİ · SANDIK" yazıyor. Ork'un 4 parçalık koşulu değişmedi. Geçti.
- **Beş efekt:** oyun içinde her tetiklemede 0–15 kareleri oynatılıyor. Yaklaşık 0,7 sn sonra temizleniyor. Aynı anda başka kütüphane efekti çizilmiyor. Zincir kancası hedefte, diğerleri yetenek sahibinde çiziliyor. Geçti.

### Gerileme

- **10 mod:** Arena, Kule, Hikâye, Gökyüzü, Sancak, Örümcek Akını, Kristal Kolos, Gizli Bölge, Karanlık Geçit, Yankı İstilası. Tek zafer, ödül tutarları v301 ile aynı, ödül tekrar verilmiyor. Geçti.
- **59 minyon:** oynama, ilerleme, yön, hasar, yetenek ve ölüm temizliği; grup sayıları 2/2/3/6/9. Geçti.
- **25 büyü:** komut kabulü, tanımlı bekleme süresi, enerji kuralı ve etki. Geçti.
- **Sürükle-bırak:** 740×360 ve 667×375'te 9/9. Geçti.
- **6 maç art arda girip çıkma:** bellek 48 → 45 MB, motor ve çizim hatası 0. Geçti.
- **JavaScript:** sayfa hatası, konsol hatası, motor ve çizim hatası tüm koşularda 0.
- **Ekranlar (740×360 ve 667×375):** yeni sorun yok.

### Android

- **APK (test):** `com.arenaforgepro.game.v303test`, versionCode 303, apksigner v2 imzası doğrulandı (yalnızca debug anahtarı). Asıl oyunu silmeden kurulur.
- **AAB (yayın):** imzasız; yükleme anahtarı yok.

## Düzeltilmeyen veya doğrulanamayan sorunlar

1. **Efekt atlaslarında 0. ve 15. kare boş.** Bunlar başlangıç ve bitiş kareleri; görünen farklı kare sayısı 14. "16 farklı kare" isteniyorsa bu iki karenin yeniden çizilmesi gerekir. Yeni görsel çizmek tasarım kararı olduğu için yapılmadı.
2. **Kalkan değeri HP çubuğunda gösterilmiyor.** Mevcut HUD'da kalkan göstergesi hiç yok (v3.78.24'te kaldırılmış). Eklemek yeni özellik olacağı için yapılmadı. Kalkanın kendisi doğru çalışıyor; Gök Zırhı testinde kalkan 45.
3. **Kalabalıkta görünen çubuk oranı düştü.** 20 minyonda %50'den %35'e, 40 minyonda %35'ten %19–27'ye indi. Bunun nedeni enerji rozetinin de yerleşim kutusuna dahil edilmesi. Çubuklar artık üst üste binmiyor ve yanıp sönmüyor; yer kalmayan birimin çubuğu kararlı biçimde gizli kalıyor. Gruplama göstergesi ("+N") eklenmedi.
4. **40 minyon senaryosu stres testidir.** Oyunda saha sınırı `MAX_UNITS = 36`; test birimleri doğrudan ekledi.
5. **Gerçek Android cihazda bu sürüm denenmedi.** FPS ve bellek GPU'suz tarayıcıda ölçüldü. Realme C55'te kontrol edilmeli.
6. **Çevrim içi PvP iki cihazla denenmedi.** Yalnızca bağlantı adresi doğrulandı.

---

# v304 ekleri: minyonlar koridorun ortasında

**Şikâyet:** savaşta minyonlar koridorun ortasında değil, yamuk geliyor.

## Ölçüm

**Duran minyonlar:** 59 minyonun hepsi tek tek ölçüldü. Ayak tabanı, koridor çizgisinin yaklaşık −1 ile +7 px arasında. Eski minyonlardaki birkaç piksellik fark kontur parlamasından geliyor. Kırık Saat Efendisi bilerek süzülüyor. Duran minyonlarda hizalama hatası yok.

**Gerçek savaşta (v303):**
- Ayak konumlarının %70'i koridor çizgisinden 4 px'ten fazla sapıyor.
- Ortanca sapma 7,9 px, %90'lık dilim 24 px, en fazla 39 px.
- 740×360'ta koridorlar arası mesafe yaklaşık 67 px; gruplar komşu koridora ve çit hattına taşıyordu.

## Kök neden

İki dikey kayma koridor genişliğinden bağımsız olarak uygulanıyordu:
- `af34034MeleeFlankOffset`: kalabalık dizilmede 8 yuva, ±4 kat.
- Grup üyelerinin yayılması: `_afSkeletonCloneSide × px × 0,15` (2'li, 3'lü, 6'lı, 9'lu gruplar).

İkisi toplanınca minyon kendi taş yolundan çıkıyordu.

## Düzeltme

Yeni fonksiyon `af304LaneDY` (`tools/patch_v304.py`). Toplam dikey kayma, koridorlar arası mesafenin %16'sı olan banda `tanh` ile yumuşakça sıkıştırılıyor; 740×360'ta bu yaklaşık ±10,7 px. Ön/arka sırası korunuyor.

Dört çizim noktasında uygulandı:
- Ana çizim.
- Karakter motoru.
- İki sürükleme önizlemesi.

Yalnızca çizim değişti. Simülasyon, hedefleme, menzil, hasar ve koridor numaraları x ve koridor bilgisini kullanmaya devam ediyor. HP çubukları ve efektler minyonun çizilen konumunu izliyor.

## Sonuç (aynı savaş testi)

| | v303 | v304 |
|---|---|---|
| Ortanca sapma | 7,9 px | 6,2 px |
| %90'lık dilim | 24,1 px | 9,9 px |
| En fazla | 39 px | 10,6 px |

Hiçbir minyon koridor bandının dışına çıkmıyor. Önce/sonra görüntüsü: `yayin/v304-kanitlar/koridor_once_sonra.png`.

## Gerileme (v304)

- **Modlar:** Arena, Kule, Hikâye, Örümcek Akını tek zaferle bitiyor; ödül aynı ve tekrarlanmıyor.
- **Sürükle-bırak:** 740×360 ve 667×375'te 9/9.
- **HP çubukları (40 minyon):** çakışma 0, aç/kapa 0,01, titreme 0,4–0,6 px.
- **JS, motor ve çizim hatası:** 0.

**Bilinen etki:** gruplar artık dikeyde daha sıkı duruyor. 9'lu İskelet Kalkanlı grubunda üyeler daha çok üst üste görünebilir; ön/arka sırası korunuyor.

**Doğrulanmadı:** gerçek Android cihazda görünüm.
