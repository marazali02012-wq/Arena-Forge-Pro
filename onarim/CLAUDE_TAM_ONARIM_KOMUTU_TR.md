# CLAUDE İÇİN — ARENA FORGE PRO TAM ONARIM GÖREVİ

**Bu bir rapor yazma görevi değil; gerçek oyun kodunu onarma ve test paketi teslim etme görevidir.** Bütün yazışma, log ve raporlar Türkçe olsun.

## 0. Öncelik ve kaynak sürümü

1. Çalışılacak güncel kaynak: `01_CALISMA_DOSYASI/ARENA_FORGE_PRO_v3.60.261_CALISMA_KOPYASI.html` (tek dosyalık HTML5 oyun, gömülü görseller dahil).
2. Karşılaştırma için: `02_ORIJINAL_VE_REFERANSLAR/v3.60.260_ONARIM_ONCESI_ORIJINAL.html`, `v3.60.260_ILK_ONARIM_TEST.html`, `v240_ESKI_REFERANS.html`.
3. Replit içindeki dosyanın bu sürümle aynı olduğu **doğrulanmadı**. Replit erişimin varsa SHA-256 karşılaştır; güncel ve farklı bir kaynak varsa farkları kullanıcıya göster, kodu körlemesine ezme.
4. Orijinal kaynaklara ve canlı Replit/Netlify/GitHub/Render/Supabase projelerine kullanıcı onayı olmadan yazma, dağıtım yapma, ücretli API/servis çalıştırma.
5. En başta güncel dosyayı ayrı bir çalışma/test kopyasına al. Sıfırdan oyun yazma; eski sistemleri ve oyuncu kayıtlarını silme.

## 1. Mevcut mimariyi ayrıştır ve doğrula

- HTML, bütün `<style>` ve `<script>` bloklarını, görsel atlaslarını, `data:image/webp;base64` paketlerini, kaydet/yükle akışını, `afp_motor.js`, `afp_veri1.js`, `afp_veri2.js` gömülü parçalarını tespit et.
- `05_KOD_INCELEME/` klasöründeki numaralı metinler büyük base64 blokları kısaltılmış **yalnızca kod okuma kopyalarıdır**; çalıştırılabilir kaynak değillerdir. **Gerçek kaynak, tam HTML'dir.** `06_ARACLAR/html_scriptlerini_ayir.py` ile tam JS parçaları çıkarılabilir.
- Sabit içeriği çevrimdışı koru; yanlış `script` sırası, çift fonksiyon, çakışan event handler, `undefined` global, çakışan CSS ve 1×1 boş atlas kaynaklarını denetle.
- Önceki raporları oku; onların başarıları sadece kod/sözdizimi testlerinin sonucudur. Gerçek mobil oynanışın doğrulandığını varsayma.

## 2. Kaynak koddan belirlenen DOKUZ mod — hepsini çalıştır

| Oyunda görünen ad | Mevcut kimlik ve altyapı | Zorunlu test |
|---|---|---|
| Arena / normal kupa savaşı | `arena` | Eşleşme, deste, savaş, 430 HP portal, kupa ve sonuç, devam dönüşü |
| 100 Katlı Kule | `tower` | Kat açılışı, ilerleme ve bitiş |
| Yankı İstilası | Menü `boss`, savaş `echo` | Dalgalar, final boss, portal sıfırlandığında doğru bitiş |
| Hikâye Seferi | `campaign` | Giriş, aşama, ödül, dönüş |
| Gökyüzü Adaları | `sky` | Harita, görev, savaş ve dönüş |
| Sancak Hâkimiyeti | `flag` | Bayrak hedefi, sonuç, geri dönme |
| Gizli Bölge | `secret` | Açılma koşulu, düello/oynanış |
| Karanlık Geçit | `dark` | Giriş, düello/oynanış, sonuç |
| Kolosus Uyanışı | Ayrı `colossus` penceresi; `boss` PvE mekaniği | Kolosus ilerleyişi, hız, can, sonuç, ana üs geçişi |

**Her modda:** menü → bekleme odası → savaş → sürükle-bırak minyon → hasar/portal/boss → zafer/yenilgi/pes → devam/geri dönüş. Gerçek kod yollarını bağla; geçersiz sahte fonksiyon ve eksik mod bağlarını düzelt. 9 mod farklı görsel kimliğini korusun. Testler mümkünse Chromium/Playwright mobil görünümünde çalışsın.

## 3. Savaş motoru — öncelik 1

- `af327AttackMods`, `af323ApplyHit`, `af334PortalDmg`, `tick`, `af36ForceBoss` fonksiyonlarını ve tüm ilgili çağrılarını ayrıntılı izle. 0/1 aşırı düşük saldırı, saldırı aralığı, savunma/aura, hedef seçimi, saldırı menzili, savaş birimi çarpışması, ölme ve despawn hatalarını düzelt.
- Portal temel canı 430 HP. Modlar ve savunma yükseltmeleri temel değeri nasıl etkiliyor, ortaya koy. 0 HP'ye düşünce yıkılma animasyonu ve tek sonuç tetiklenmeli. İki tarafta eşzamanlı portal ölümü, pes, bağlantı kopması, tek ödül dağıtımı ve siyah ekran geri dönüşünü test et.
- Yankı İstilası: final boss yaşamaya devam ederken portal 0 oldu diye sahte zafer/beraberlik verme; boss öldüğü hâlde oyunun sonsuza dek kalmasını önle. Üç dalga ve final boss gerçek tamamlanma koşulunu kontrol et. Savunma portalı yıkılınca doğru yenilgi.
- Kolosus Uyanışı: aşırı yavaş hareket, hasar, can çubuğu, 1/82 seviyeleri, aşama sonucu ve devam düğmesi.
- Mavi takımın savaştaki minyonları **sağa (→)**, kırmızı takımın minyonları **sola (←)** bakacak. Deste portre yönünü savaş yönüyle karıştırma.
- Savaş içinde bildirimler HUD'u/koridorları veya dokunmatik kontrolleri kapatmayacak. Sürükle-bırak ve hayalet minyon yerleşimi bozulmayacak. Üç koridor ve altı geçit korunacak.

## 4. Görsel sanat / animasyon — öncelik 1

- **Bütün minyonları** savaş, deste (12 kart/6×2), mağaza, kupa yolu, sezona bağlı ödüller, karakter ve koleksiyon alanlarında ID bazında tara. Boş ikon, bozuk portre, 1×1 atlas, yanlış resme bağlama, küçüklük, bulanıklık, yüzün enerji/seviye ile kapanması, kenara taşma, arkası boş kalan/çok küçük heykel görseli, yanlış yön ve zeminde yüzme hatalarını tek tek düzelt.
- Pasif yetenek simgeleri ve büyü ikonlarını incele; yanlış/kötü görselleri düzelt. Görsel sözlüğünü başka karakterlerle karıştırma.
- Kırık görseli eskisinin üzerine yeni base64 kopya ekleyerek büyütme. Kullanılan varlığı doğru kaynağa bağla, kullanılmayan eski kopyayı **yalnızca referans haritasını doğruladıktan sonra** kaldır.
- Önce mevcut özgün yüksek kaliteli WebP/sprite görsellerini onar; çizim yeteneğin varsa yalnız gerçekten kullanılamaz olanları tutarlı, özgün karakterlerle değiştir. Yeteneğin/araç yoksa üretilmiş gibi gösterme. Yeni animasyonlar için yürüyüş, saldırı, hasar, bekleme, ölüm karelerini test et; sprite pivotu ve ayak zeminini tutarlı tut. GIF zorunluluğu olup olmadığı gerçek motorla uyumlu değerlendir; mevcut altyapı WebP ağırlıklı.
- Kolosus ve minyon portrelerinin görüntüsü savaştan sonra bütün ilgili ekranlara yansısın. Tasarım özgün kalmalı; başka oyunun varlıklarını birebir kopyalama.
- Kart portrelerinin boş görünmesi TinyFish'in Netlify üzerinde açtığı **v3.60.151 eski canlı sürümünde gözlendi**. Hazır v3.60.261 kodu için hedefli kaynak testleri geçti, fakat mobilde sonuç henüz gözlenmedi. Yanlış sürümü test edip yeni sürüm için karar verme.

## 5. Android mobil UI — üç ekranı ayrı ayrı kanıtla

- Gerçek öncelikler: **740×360, 667×375, 800×360**, yatay tam ekran Android.
- Açılışta 1 saniyelik eski arena/görüntü sızması, siyah kenar şeridi, alt/üst çentik alanları, `overflow`, yanlış z-index, kapatamayan panel, dokunmayan buton, geçişte siyah ekran/kararma ve çakışan sohbet/duraklat düğmeleri.
- Ana üs, 9 mod ekranı, deste, kupa yolu, mağaza, sezon bileti/PASS, sandık açılışı (ortada), ödüller ve bekleme odaları tek tek dolaşılacak. Kupa yolunda yanlış sırada/çift ödül gösterme ve sezon biletinde donan kaydırma kontrol edilecek.
- Yatay ekranda menü ve savaş etkileşimleri görünür olsun, yazı taşmasın, zorunlu kaydırma ortaya çıkmasın. Enerji simgesi yüzleri kapatmasın.
- Android'de kaliteyi düşürmeden ölçekleme/netlik, GPU belleği, decode, animasyon frame yükleri, FPS ve dokunma gecikmesini ölçerek iyileştir.

## 6. Boyut ve performans

- v240 yaklaşık 40,48 MB; v260 yaklaşık 46,89 MB; v261 yaklaşık 46,89 MB. Büyük artışların çoğu gömülü görsel verisinden geldi. v260→v261 yaklaşık 3,9 KB.
- Yeni onarımda dosyayı gereksiz megabaytlarla şişirme. Kullanılmayan/tekrarlı base64 kaynaklarını tespit edip **gerçek referans ve kullanım analizi** yapmadan silme. Android'in tek HTML açılışının CPU, GPU ve bellek sınırını gözle.
- Çevrimdışı tek dosya oynanış, çevrim içi fonksiyonlar ve mevcut hesap/oyuncu kayıt akışı korunacak.

## 7. Test kuralları, doğrulanmışlar ve kalan işler

- v260 üzerinde 7 hedefli kod değişikliği var: minyon pozitif hasar yuvarlama, negatif can koruma, portal büyü hasar yuvarlama, boş atlas eleme, Kolosus hız `.075→.65`, Yankı sahte beraberlik/erken zafer blokları.
- v261'de kart kaynak çözümleme ve hata durumunda aynı karakterin gömülü portresine dönme eklendi; 106 kart portresi WebP dosya bütünlüğü ve 10 mantık testi geçmişti. Bunlar **mobil görüntü testi değildir**.
- Önceki 17/17 savaş ve 10/10 kart testini çalıştır, sonuçları belgeleyerek koru. Yeni mantık, savaş simülasyonu ve tarayıcı/Android testlerini ayrıca ekle. 106 yürütülebilir JS blok sözdizimi kontrolünden geçmişti; 261'de bu sonuç tekrar doğrulanmalı.
- Önceki tarayıcı ortamı yerel HTML'yi engelledi; eski Netlify v3.60.151'de boş minyon ve komutan ikonları TinyFish ile tespit edildi; 9 mod ve 3 mobil çözünürlük test edilemedi. **Test edilmeyeni test edildi gibi yazma.**
- İzole testler kaynak değişkenleri üzerinde çalışır, gerçek 2 dakikalık maç simülasyonu değildir. Kullanılan test/araç/viewport/sürüm ve görülmüş sonuç raporda açık olsun.

## 8. Çıkış teslimi (zorunlu)

1. Orijinale dokunulmamış ayrı tam, açılabilir **tek dosya HTML**.
2. **ZIP**: HTML + gerekli bütün kaynaklar/varlıklar (gömülü olanları iki kez koyma) + test kodları + Türkçe rapor + varsa ekran görüntüleri.
3. `YAPILAN_DUZELTMELER.md`: her sorun, kök neden, düzenlenen fonksiyon/satır, test sonucu, ilgili mod.
4. `9_MOD_TEST_MATRISI.md`: dokuz modun her biri için giriş, bekleme, minyon, hasar, portal/boss, bitiş, dönüş ve test durumu.
5. `ANDROID_740_667_800.md`: üç ölçüden ekran görüntüsü ya da neden yapılamadığının kaydı.
6. `VARLIK_ENVANTERI.md`: minyon/komutan görselleri, kullanım konumları, bozuk/kaldırılan/yeni eklenen sayısı, dosya boyutu değişimi.
7. `KALAN_EKSIKLER.md`: yapılmadı/başarısız/kullanıcı onayı gerektiriyor ayrımı.
8. Son yanıtta kısa Türkçe özet: **Düzeltildi / Test edildi / Hâlâ eksik**. Oyun açılmadan ve test edilmeden 'tamamı bitti' deme.

### Önemli sınır

Bu ZIP bir **devir ve kapsamlı onarım çalışma paketidir**. İçinde v3.60.261 hedefli düzeltmeler bulunur, fakat oyun dokuz modda gerçek Android tarayıcısında tamamen test edilmiş değildir. Bu eksikleri gerçek çalışma olarak tamamlaman bekleniyor.
