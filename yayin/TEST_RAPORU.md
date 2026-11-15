# Arena Forge Pro 220 — test raporu

Bu rapor yalnızca bulut ortamında yapılan denemeleri anlatır. **Gerçek telefonda hiçbir deneme yapılmadı.**

## Nasıl denendi
Oyunun `index.html` dosyası, Android WebView'daki adresiyle (`appassets.androidplatform.net`) başsız Chromium'da, telefon kullanıcı kimliği ve dokunmatik girişle açıldı. Boyutlar 800×360, 854×393 ve 915×412 idi. Dış ağ tamamen kapalıydı; canlı sunucuya hiçbir istek gitmedi. Bu yöntem, düzen ve oyun mantığı için iyi bir ön kontrol sayılır. Gerçek WebView sürümünü, dokunma hissini, klavyeyi, performansı ve sistem geri hareketini **kanıtlamaz**.

## Doğrulananlar (ön kontrol)
- Açılışta hata yok; misafir girişi çevrim dışı çalışıyor.
- Ana üstteki 31 düğmenin hepsi her boyutta açıldı. Her birinde geri tuşu ana üsse döndürdü; tek istisna aşağıdaki **Sosyal** hatasıydı.
- Arena kupa savaşı başladı, pes etme ve sonuç ekranından ana üsse dönüş çalıştı.
- Doruk Kulesi, Yankı İstilası, Kristal Kolos, Hikâye Seferi, Gökyüzü Adaları ve Sancak Hâkimiyeti üç boyutta başladı, savaş ekranı ekran dışına taşmadı, geri tuşuyla çıkıldı.
- Hesap silme (sahte sunucuyla): başarıda sunucu çağrısı yapıldı, oturum ve silinen hesabın yerel kaydı temizlendi, misafir profiline dönüldü. Sunucu hatasında ve ağ kopmasında oturum korundu, yanıltıcı başarı mesajı çıkmadı. Yanlış onay metninde sunucuya istek gitmedi.

## Bulunup düzeltilenler
1. **Sosyal paneli**: geri tuşu paneli kapatmıyordu, çıkış sorusuna düşüyordu. Düzeltildi.
2. **Rakip arama penceresi**: geri tuşu aramayı iptal etmiyordu. Düzeltildi.
3. **Eşleşmeli maç**: duraklatma kapalı olduğu için geri tuşu yalnızca uyarı veriyor, maçtan çıkılamıyordu. Artık çıkış onayı açılıyor.
4. **Mağaza** (800×360, 854×393, 915×412): kart başlığı 0 piksele düşüp açıklamanın üstüne biniyordu, öne çıkan kartta açıklama düğmenin altında kalıyordu. Düzeltildi.
5. **Savaş eli**: uzun kart adları iki yandan kırpılıyordu. Artık baştan başlıyor, yalnızca sonu kırpılıyor.
6. **Hesap silme**: başarıdan sonra silinen hesabın yerel kopyası cihazda kalıyordu. Artık siliniyor.

## Bilinen, düzeltilmemiş
- Birçok ekranda 6–7 piksellik yazılar var (ör. Kahramanlar, Kristal Kolos). Küçük ekranda okunması zor olabilir. Gerçek telefonda bakılıp karar verilmeli; toptan büyütmek düzeni bozabilir.
- Bazı dokunma hedefleri 30 pikselin altında (ör. deste ön ayar rakamları, kahraman ok düğmeleri).
- Mağazadaki “Kredi kazanma yolları” bölümü bu ekranda yalnızca kaydırılarak görülebiliyor.

## Yapılamayanlar
- Gerçek cihaz testi: Realme C55, Android 16 cihaz, klavye, yeniden açınca kayıt, yatay tam ekran, sistem geri hareketi.
- İki cihazla çevrim içi eşleşme, 10 saniyelik arama, pes, bağlantı kopması, çifte ödül kontrolü.
- E-posta kaydı, giriş ve parola sıfırlama bağlantısının Android'de açılması (gerçek sunucu gerekir).
- Son Kahraman, Lonca Dev Avı ve İki Oyunculu Kolosus: hesap ve çevrim içi bağlantı gerektiriyor, denenmedi. Gizli Bölge ve Karanlık Geçit şartları karşılanmadığı için kilitliydi.
- Gradle ile APK/AAB derlemesi: bu ortam `dl.google.com` adresine erişemedi. **Yüklü APK ve AAB bu düzeltmeleri içermez**; yeniden derlenmeleri gerekir (`.github/workflows/android-build.yml`, derlenmemiş ve denenmemiş taslaktır).
- İmzalı yayın AAB'si, bundletool ve apksigner çıktıları, Play Console beyanları, kapalı test.
- Sunucudaki `afp_delete_account` işlevi bu pakette yok; gerçekten ne sildiği doğrulanamadı.
- Gerçek Android ekran görüntüleri alınmadı; elimizdekiler masaüstü Chromium görüntüsüdür ve mağaza için kullanılmamalı.

## Gizlilik ve hesap silme sayfaları
`yayin/web/gizlilik.html` ve `yayin/web/hesap-silme.html` taslaktır. İşleten adı, destek e-postası, saklama süreleri ve silinen veri listesi sarı alanlarda boş bırakıldı; bunları yalnızca sen doğrulayabilirsin. Herkese açık bir adrese yüklenmeleri ve oyundaki Gizlilik Politikası alanına ile Play Console'a bağlanmaları gerekir.
