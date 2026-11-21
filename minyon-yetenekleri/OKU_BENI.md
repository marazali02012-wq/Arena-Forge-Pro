# Arena Forge Pro · 59 minyon özel yetenek onarımı (v3.60.285 TEST)

Bu klasör, yüklenen `ArenaForgePro_v3_60_284_Minyon_Gelistirme_TEST.html` dosyası üzerine yapılan
gerçek, oynanabilir minyon yeteneklerini içerir. Ana dal ve `app/` içindeki kararlı Android HTML'si değiştirilmedi.

## Oyun dosyası

`ArenaForgePro_v3_60_285_Minyon_Yetenek_TEST.html`. Tarayıcıda ya da Android'de doğrudan açılır.
Sekme başlığı **v3.60.285 Minyon Yetenek TEST** olarak görünür.

## Yetenek döngüsü (her minyonda aynı kurallar)

1. **Hazırlık:** Birim durur ve kendine özgü hazırlık hareketini yapar. Gövdesi çömelir, silahını geri çeker
   ya da nişan alır. Başının üstünde yeteneğin adı ve simgesi çıkar, yeteneğe özel hazırlık efekti görünür.
   Bu sırada sersemletilirse yetenek bozulur (KESİLDİ) ve kısa bir bekleme süresine girer.
2. **Kullanım:** Yeteneğin animasyonu oynar: mermi, alev konisi, şimşek zinciri, kalkan darbesi, buz dikenleri…
3. **Etki:** Hasar, kontrol, kalkan ya da iyileştirme, animasyonun vuruş anında uygulanır.
   Etkiler oyunun mevcut hasar, zırh, kalkan ve bağışıklık kurallarından geçer.
4. **Toparlanma:** Kısa toparlanmanın ardından birim normal yürüyüşüne ve saldırısına döner.
5. **Bekleme:** Bekleme süresi dolmadan yetenek yeniden kullanılmaz.

Hedef hazırlık sırasında ölürse birim yeni hedef seçer. Uygun hedef yoksa yetenek temizce iptal olur.

Sınırsız etki yoktur:

- Sersemletmenin azalan getirisi vardır: aynı hedef, sersemlik bittikten sonra 2,5 sn yeniden sersemletilemez.
- Kökleme ve yavaşlatmanın da kendi aralıkları vardır.
- Kalkanlar üst üste binmez.
- İyileştirme bekleme süresine ve oranlara bağlıdır.

## Durum

Grup sırası, kalan işler ve test sonuçları `ILERLEME.json` dosyasında; 59 minyonun eski ve yeni durumu `ENVANTER.md` dosyasında.
Her grubun ayrıntılı test raporu ve savaş görüntüleri `test-sonuclari/grupN/` klasöründe.

## Kullanıcı görselleri

Gönderilen görsel sayfaları saydamlığı korunarak kesildi, sıkıştırıldı ve oyuna gömüldü.
Görsellerin kaynak dosyaları `arac/assets/kaynak_*.png` adıyla duruyor.

| Görsel | Kullanıldığı yer |
|---|---|
| Kalkan kubbesi (16 kare) | Altın Muhafız: altın tonunda. Buz Muhafızı: mavi. Kalkan verildiğinde oluşur, hasar emdikçe çatlar, bitince kırılır. |
| Zincir yıldırım (16 kare) | Fırtına Bağlayıcı. Her sıçrama, hasar alan iki birimin arasına gerçek mesafeye göre uzatılarak çizilir. |
| Sarmaşık şifası (16 kare) | Orman Ruhu. İyileştirme her uygulandığında artı işareti parlar. |
| Efekt kütüphanesi (10 × 12 kare) | Alev Bekçisi: ateş kalkanı. Fırtına Bağlayıcı: zincirle bağlama. Buz Şövalyesi: buz kesiği ve dikenler. Gölge Suikastçı ve Gece Büyücüsü: gölge kesiği. Işık Şifacısı: altın ışık. Zehir, toprak, zincir ve sarmaşık görselleri sıradaki gruplarda kullanılacak; eşleştirme `ILERLEME.json` içinde. |
| Buz şifası (16 kare) | Oyuna gömüldü (`fx_frost_heal`). 5. grubun ilk minyonu Kar Fenercisi'nde kullanılacak. |

## Derleme ve test

```bash
cd minyon-yetenekleri/arac
# Yayın dosyası (daha önce derlenmiş dosya da girdi olabilir; önceki AF285 eklemesi önce geri alınır):
python3 build.py ../ArenaForgePro_v3_60_285_Minyon_Yetenek_TEST.html cikti.html
# Orijinal v3.60.284 dosyasını geri üretmek için:
python3 build.py ../ArenaForgePro_v3_60_285_Minyon_Yetenek_TEST.html v284.html --strip
# Test yapısı (QA kancasıyla; yayın dosyasına girmez):
python3 build.py ../ArenaForgePro_v3_60_285_Minyon_Yetenek_TEST.html qa.html --qa
python3 build.py v284.html orijinal_qa.html --qa --no-abilities
python3 tests/group_test.py qa.html 1 sonuc/grup1 --orig orijinal_qa.html
python3 tests/system_check.py qa.html orijinal_qa.html sonuc/sistem.json
```

Testler Playwright ve Google Chrome ile başsız tarayıcıda gerçek savaş döngüsünü kare kare ilerletir.
Kartlar gerçek oynama yolundan oynanır.

Her minyon için şunlar denetlenir:

- Kart oynama ve enerji bedeli
- Tetiklenme
- Doğru hedef
- Hasar hesabı: ham değer ve motorun azaltmasından sonraki değer
- Animasyonla eş zamanlılık: etki vuruş anında mı
- Hazırlık pozu
- Bekleme süresi ve yeniden kullanım
- Hedefin ölümü ve yeni hedef seçme
- Sersemletmeyle kesinti
- Grup etkileşimi
- PvP eşitlemesi: ikinci sayfa seat 2 olarak ev sahibinin anlık görüntüsünü aynalar

`system_check.py` şunları orijinalle karşılaştırır:

- 59 minyon, nadirlik dağılımı ve enerji bedelleri
- 12 kartlık deste ve açılış eli
- Eski QA testleri
- Dokuz oyun modu
- Dönüştürülmemiş bir minyonun eski yeteneğinin hâlâ çalışması
- Hata sayaçları

## Sonraki çalışmada devam

`ILERLEME.json` içindeki `siradaki_grup` değerinden başla. Aynı yöntemle ilerle:

1. Grubun 5 minyonunun mevcut kodunu incele.
2. Yetenekleri `arac/src/af285_gN.js` dosyasına yaz.
3. Sahnelerini `arac/tests/scenarios.py` dosyasına ekle.
4. `group_test.py` ve `system_check.py` testlerini çalıştır.
5. `make_reports.py` ile raporları üret.
6. Yayın dosyasını yeniden derleyip bu dala kaydet.

## Test edilemeyenler (açıkça)

- **Gerçek Android cihaz:** Başsız masaüstü Chrome ile denendi. Realme C55 gibi gerçek cihazda kare hızı ölçülmedi.
  Düşük güçlü cihazda efekt sayıları kendiliğinden azalıyor ve görseller ilk kullanımda çözülüyor.
- **İki gerçek cihazla çevrim içi maç:** Aynı tarayıcıda iki sayfa ile denendi. Ev sahibi anlık görüntü üretti,
  ikinci sayfa bunu seat 2 olarak uyguladı. Supabase üzerinden gerçek ağ gecikmesiyle denenmedi.
- **Ses:** Yetenek seslerinde oyunun mevcut ses motoru çağrılıyor. Başsız tarayıcıda dinlenmedi.
