# Varlık (görsel) envanteri — v3.60.262

**Kaynaklar:** `araclar/varlik_tarama.py` (çıktı: `testler/varlik_tarama_v262.json`) ve tarayıcıda yapılan ekran ve savaş taramaları.

**Bu sürümde görsel eklenmedi, silinmedi, değiştirilmedi.** Dosya boyutu değişimi +1.407 bayt; tamamı kod/CSS.

## 1. Gömülü görseller (dosya düzeyi)

| Ölçü | Değer |
|---|---|
| HTML boyutu | 46.893.179 bayt |
| `data:image` geçişi | 1.142; hepsi WebP, başka biçim yok, GIF yok |
| Benzersiz görsel | 967 |
| Base64 görsel verisi | 41,7 MB (dosyanın **%89**'u) |
| Çözülemeyen (bozuk) görsel | **0** |
| 1×1 yer tutucu | 1 benzersiz (48 karakter), **169 geçiş** (atlas/slot yer tutucusu; v260 raporunda 168) |
| Birebir aynı verinin tekrar gömülmesi | 8 görsel, ikişer kez → **~253 KB fazlalık** |
| Uzun kenar dağılımı | ≤64: 13 · ≤256: 181 · ≤512: 601 · ≤1024: 153 · >1024: 18 |

**Tekrar eden 8 görsel:** 315×279, 468×310, dört adet 768×96 şerit, 256×256. Bunlar birleştirilebilir.

Görev kuralı "gerçek referans ve kullanım analizi yapmadan silme" diyor. Bu analiz ancak her kopyanın hangi kod yolundan okunduğu tek tek doğrulanarak yapılabilir. Kazanç dosyanın %0,5'i olduğu için **silinmedi**; `KALAN_EKSIKLER.md` dosyasında duruyor.

## 2. Ana görsel paketleri

| Paket (script) | İçerik | `data:image` |
|---|---|---|
| `afp_veri1.js` → `AF_ART_PACK` (#8, 6,3 MB) | `AFArt` anahtarlı paket: minyon tam boy, komutan portreleri vb. 245 anahtar, hepsi geçerli | 245 |
| `afp94-card-portait-data` (#14) + `AF_NEW_PORTRAIT_OVERRIDE` (#15) | 106 kart portresi (`AFP94_MINION_CARDS`) | 106 + 49 |
| `af_new_minions.js` (#29, 12,8 MB) | 49 yeni minyon × 5–6 durum (idle/walk/attack/hurt/death/skill) sprite şeridi | 247 |
| `afp_motor.js` (#30) | Motor içi görseller (örümcek, kolosus vb.) | 204 |
| `afxAssets` (#24, JSON) | Arayüz görselleri | 66 |

## 3. Birlikler — savaş alanı görünümü (152 tür)

`HERO_INFO` 152 tür içeriyor:
- **101 aktif** (`PREP_HERO_TYPES`): 49 yeni minyon (`afn_*`), 51 AF37 minyonu (2 Platin dahil, emekli Keşifçi hariç), 1 eski kart (`mage`, Büyücü).
- **51 emekli** (`AF3406_RETIRED_CARD_IDS`): eski kayıtlar bozulmasın diye tutuluyor.

Bütün 152 tür sahaya **dost ve düşman olarak** konup 2× çözünürlükte çizildi. Sayfalar: `ekran_goruntuleri/birlik_yonleri/sheet0–6.webp`; her hücrede solda dost, sağda düşman.

| Kontrol | Sonuç |
|---|---|
| **Yön:** mavi takım → sağa, kırmızı takım → sola | **152/152 doğru.** Dört yeni minyonun kaynak çizimi ters yönlü; kod bunları zaten ayrıca çeviriyor (`afn_alize_bicakli`, `afn_ayaz_kalkanlisi`, `afn_buzul_pencesi`, `afn_kaya_kaplumbagasi`), sonuç doğru. |
| Zemin teması / havada yüzme | Gözle bakıldı, belirgin yüzen birim yok. Ayak noktası her sprite için `anchor` değeriyle hizalanıyor. |
| **Boyut tutarlılığı** (49 yeni minyon) | Hepsi aynı savaş boyutunda çiziliyor: orta koridorda 49 px, ölçek sınıfı aynı, `bulk=1`. Sabit 100 px'te ölçülen yükseklik 106–111 px (gölge dahil). Galeride bazıları küçük görünüyordu; sebebi **koridor perspektifi** (üst koridor daha küçük çiziliyor). Hata değil. |
| Soluk görünenler | `afn_donuk_mizrakci`, `afn_firtina_baglayici`, `afn_kirik_kuklaci`, `afn_yel_makasi`, `afn_gok_geyigi`, `afn_is_tilkisi`, `afn_kirik_saat_efendisi`: ortalama opaklık 180–190/255 (diğerleri 200–245). Çizimlerin yumuşak/saydam kenarlı tasarımından geliyor; **kırık değil**. İstenirse sanatçı düzeltmesi gerekir. |
| **Eski emekli türlerin ~30'u** (Ork Savaş Lordu, Paladin, Ölüm Büyücüsü, Barbar, Buz Büyücüsü, Taş Golemi, Güneş Rahibi, Demir Dövüşçü ve Lav Devi'nden Anka Mürit'e kadar olanlar; sayfa 0–2, gözle sayım) | Ortak mavi/kırmızı şövalye **yer tutucusuyla** çiziliyor; kendi savaş çizimleri yok. Diğer eski türlerin (Okçu, Şövalye, Gölge Kılıcı, Kor Cadısı, Ay Okçusu, Rün Muhafızı vb.) kendi çizimi var. Bu türler aktif destelere, bot destelerine ve hikâye destelerine **girmiyor** (tarayıcıda doğrulandı). Oyuncu normal oynayışta görmez. Eski kayıtlarda kalmış olabilir; desteler v3.60.187'de bir kez temizleniyor. |

## 4. Kart portreleri — arayüz taraması (v262, tarayıcı)

Her ekranda bütün `<img>` öğeleri denetlendi: kaynağı boş mu, yüklenemedi mi, 1×1 mi. Ekran dışındakiler de sayıldı; tembel yükleme kapatılarak.

| Ekran | Denetlenen görsel | Sağlam | Boş kaynak | Yüklenemeyen | 1×1 |
|---|---|---|---|---|---|
| Koleksiyon (tamamı) | 74 | 74 | 0 | 0 | 0 |
| Minyonlar (tamamı) | 102 | 102 | 0 | 0 | 0 |
| Desteler | 23 | 23 | 0 | 0 | 0 |
| Mağaza | 8 | 8 | 0 | 0 | 0 |
| Kupa yolu | 10 | 10 | 0 | 0 | 0 |
| Kahramanlar | 17 | 17 | 0 | 0 | 0 |

TinyFish'in eski Netlify **v3.60.151**'de gördüğü boş kart portreleri bu sürümde **görülmedi**. Canlı Netlify sitesi hâlâ eski sürümse orada görülmeye devam eder.

## 5. Ödül simgeleri

- "Kart parçası" ödülü mor bir "?" kartıyla gösteriliyor. Bu, rastgele kart parçası için kullanılan tasarım; boş değil.
- "Kahraman parçası" ve "Kahraman eşyası" ödüllerinde genel gri dişli simgesi var. Çalışıyor ama zayıf. Yeni simge **çizilmedi**.

## 6. Sayılar (görevin istediği biçimde)

| | Adet |
|---|---|
| Bozuk görsel (çözülemeyen) | 0 |
| Arayüzde boş / kırık kart portresi | 0 / 234 denetlenen |
| Yanlış yönde çizilen birim | 0 / 152 |
| Kendi çizimi olmayan (yer tutucu) savaş görseli | ~30 eski emekli tür (aktif havuzda 0) |
| Bu sürümde kaldırılan görsel | 0 |
| Bu sürümde eklenen görsel | 0 |
| Dosya boyutu değişimi | +1.407 bayt (yalnız kod/CSS) |

**Yapılmadı:** yeni minyon/karakter çizimi, yeni animasyon kareleri, GIF. Bu ortamda görüntü üretme aracı yok. Var olan gömülü WebP sprite'lar sağlam ve hepsi kendi karakterine bağlı.
