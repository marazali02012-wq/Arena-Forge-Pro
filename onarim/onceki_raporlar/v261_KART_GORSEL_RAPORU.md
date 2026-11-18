# Arena Forge Pro v3.60.261 — Kart görseli onarım raporu

Kaynak: v3.60.260 yerel HTML test kopyası. Daha önce yayımlanan Netlify v3.60.151 sürümü **değiştirilmedi**. Replit dosyasına erişim doğrulanmadı.

## Uygulanan kod düzeltmeleri

1. Eski koleksiyon kartlarının portre kaynağını zorla boş bırakan `visualPortrait=''` kaldırıldı. Her kartın yalnızca kendi ID'siyle eşleşen gömülü görsel aranıyor; resim yoksa eski simge yedeği korunuyor.
2. Yeni minyon kartlarında portre seçimi, `AFP94_MINION_CARDS`, `AFArt` ve karakterin kendi görsel kaynağını kullanacak şekilde düzeltildi. Başka minyonun resmi kopyalanmıyor.
3. `AFArt.get` bir eski slot boş olsa dahi kaynak paketindeki geçerli görüntüyü döndürüyor.
4. Koleksiyonun minyon portre çözümleyicisine yedek kaynak ve tembel yükleme (`loading=lazy`) eklendi.
5. Resmi yüklenemeyen veya 1×1 piksel gelen kartlarda aynı karakterin gömülü görselini deneyen koruma eklendi. Gerçek bir görsel bulunamazsa boş alan yerine açık bir sembol gösteriliyor.
6. HTML başlığı ve test sürümü meta etiketi v3.60.261 olarak düzenlendi.

## Yapılan doğrulamalar

- HTML içindeki 106 çalıştırılabilir JavaScript bloğu Node.js sözdizimi denetiminden geçti (0 sözdizimi hatası).
- 106 minyon kart portresinin WebP dosya bütünlüğü doğrulandı: 0 bozuk, 0 adet 1×1 görsel.
- Kart görseli kaynak bulma ve hata durumundaki yedekleme için 10/10 mantık testi geçti.
- Önceki savaş motoru regresyon mantık testleri 17/17 geçti. Bu testler gerçek maçın tamamını kanıtlamaz.
- Art paketindeki 245 gömülü görsel anahtarı ve iki örnek karakterin yükleme yolu doğrulandı.

## Test edilmemiş veya değiştirilmemiş bölümler

- Yeni HTML'nin Android/Chromium üzerinde gerçek oynanış/görsel görünümü **test edilemedi** (yerel Chromium erişim engeli).
- Dokuz savaş modunun tamamı gerçek tarayıcıda oynanmadı.
- Harici Netlify bağlantısında TinyFish'in gördüğü v3.60.151 eski sürümündeki boş ikonlar, bu dosya siteye yüklenene kadar değişmeyecek.
- Replit, Netlify canlı yayın, GitHub ve hesaplar değiştirilmedi.

**Durum:** Kart kaynak koduna düzeltme uygulandı. HTML'nin gerçek cihazda tamamen kusursuz göründüğü doğrulanmadı.
