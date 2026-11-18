# SOL 6.1 — ARENA FORGE PRO | BOSS GÖRSELLERİ v3

**Bu ZIP yalnızca ÜÇ BOSS'a aittir; suikastçı/Çift Kılıçlı minyonunun YENİ çizimleri bu ZIP'ten çıkarıldı.** Yeni bir suikastçı veya Çift Kılıçlı karakteri yaratma, oyuna ikinci kopya ekleme, mevcut minyonu değiştirme.

## ZORUNLU KONTROL — Çift Kılıçlı / suikastçı
- Mevcut oyundaki tüm Çift Kılıçlı/suikastçı kart portrelerini ve savaş atlaslarını denetle, aralarında zaten iki kılıçlı uygun ve çalışan çizim var mı karşılaştır.
- Varsa mevcut çizimi kullan; yeniden çizim, klon, fazladan minyon ve ikinci sprite katmanı EKLEME.
- Yalnız gerçek bir görsel tutarsızlığı varsa mevcut minyonun doğru kimliği `af37_cift_kilicli` ve çalışan kayıt/deste/savaş bağlantılarını koruyarak düzelt; ayrı bir karakter yaratma. Bu ZIP içinde Çift Kılıçlı görseli bulunmuyor.
- Görseli iyi olan diğer suikastçıları, PASS karakterlerini ve bütün mevcut minyonları olduğu gibi koru.

## ANA HEDEF — Yalnız eksik üç boss
Boss ID'leri (mevcut oyunda aynı kimlikleri kullan):
1. `boss_kullerin_hukumdari` — Küllerin Hükümdarı
2. `boss_ucurum_ejderi` — Uçurum Ejderi
3. `boss_bosluk_imparatoru` — Boşluk İmparatoru

### Aşama 1 — Mevcut kodu incele
- En güncel HTML/Android dalını esas al, eski v263 kopyasının üstüne körlemesine yazma.
- Mevcut koleksiyon, boss davranışı, animasyon motoru, `AFP36Col.setArt`, sprite atlas kimlikleri, `unit.atlas`/canvas çizim akışını doğrula.
- Var olan doğru görselleri değiştirme; eksik görselleri / bozuk bağlantıları onar.

### Aşama 2 — Üç boss portresini bağla
Proje kökünde (ZIP klasörü `AFP_Boss_Paketi_v3/` olacak), `onarim/araclar/gorsel_ekle.py` mevcutsa ve halen uyumluysa **güncel** giriş HTML dosyasına şu yöntemle uygula. `GUNCEL_GIRIS.html` ve `GUNCEL_CIKIS.html` değerlerini gerçek dosya yollarıyla değiştir:

```bash
python3 onarim/araclar/gorsel_ekle.py \
  GUNCEL_GIRIS.html GUNCEL_CIKIS.html \
  --boss boss_kullerin_hukumdari=AFP_Boss_Paketi_v3/boss/kullerin_hukumdari/portrait.png \
  --boss boss_ucurum_ejderi=AFP_Boss_Paketi_v3/boss/ucurum_ejderi/portrait.png \
  --boss boss_bosluk_imparatoru=AFP_Boss_Paketi_v3/boss/bosluk_imparatoru/portrait.png
```

**`--cift-kilicli` EKLEME, bu ZIP'te o dosya YOK.** Araç mevcut oyunla uyumsuzsa düzelterek doğru ID'lere bağla ve sonucu çalıştırarak doğrula.

### Aşama 3 — Savaş GIF ve PNG animasyonlarını bağla
Her boss için `idle`, `attack`, `death` altındaki `*_8kare.gif` veya `*_atlas_4x2_256.png` dosyalarını doğru animasyon durumuna bağla.
- GIF: 8 kare; atlas: 4 sütun × 2 satır, her kare 256×256.
- Doğru yüz yönü, animasyon kare sırası, sabit taban pivotu, saldırı anı, 0 HP ölüm animasyonu, bitiş ekranına geçiş ve alfa kenarlarını kontrol et.
- Boss'ların 3 farklı görsel kimliği korunsun; bir boss'un sprite'ını diğerine uygulama.
- Başka karakterin üzerine ikinci figür çizme.
- Boşluk İmparatoru dosyaları mor pelerinli ayrı imparator tasarımına aittir; istersen `alternatif_kart_illustrasyon.png` ile portre tutarlılığını kontrol et.

### Aşama 4 — Boss Sandığı
- Üç boss koleksiyonda görünür olsun; yalnız eksik görsel bağlantısı nedeniyle kilitliyse Boss Sandığı'nın açılabilirliğini düzelt.
- Mevcut 60 toz, %2 boss olasılığı, 50. açılış garantisi ve ödül kayıtları aynı kalsın.
- Tek ödül, çift açılış ve açılıştan sonra kayıt testlerini yap. Ekonomi/ödül sayısını keyfi değiştirme.

### Aşama 5 — Test ve teslim
- 740×360, 667×375 ve 800×360 ekranlarında animasyonları **oyun içinde** incele.
- Dokuz modun başlatma/bitiş, portal/HP/sonuç, kupa yolu, mağaza ve koleksiyon akışları bozulmasın.
- Uygulamadaki 3 boss'un portresinin, idle, saldırı ve ölüm animasyonunun gerçekten doğru bağlandığını kanıtla; yapılamayan testi BAŞARILI gösterme.
- Son HTML, test raporu, yeni test APK ve **imzasız** AAB hazırla; GitHub'a yalnız halka açık dosyaları ekle.
- Gerçek yükleme anahtarı `arena-yeni-upload.p12` ve şifresi kullanıcının telefonunda kalacak. Bunları isteme, GitHub'a koyma. İmza telefonda atılacak.

**Sıra şartı:** Önce görselleri bağla ve kontrol et, sonra derle. Mevcut çalışan sistemi bozma ve yeni minyon yaratma.
