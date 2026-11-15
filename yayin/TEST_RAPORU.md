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

## Oyun motoru kontrolü (dokuz mod, savaşlar sonuna kadar)
Yöntem: tarayıcı saati hızlandırılarak her savaş bitirildi. Kart oynayan basit bir bot kullanıldı; sonuç şansa bağlı olduğundan bazı modlar kazanıldı, bazıları kaybedildi. Ağ kapalıydı, rakipler yerel bot. Test profilleri yalnızca bu test tarayıcısında vardı.

| Mod | Savaş | Sonuç ekranı ve kayıt |
|---|---|---|
| Arena (kupa savaşı) | Başladı, bitti | Zafer: kupa +25, kredi +275, sandık, galibiyet sayacı. Yenilgi: +40 kredi, +35 TP. |
| Doruk Kulesi | Başladı, bitti | Yenilgi yolu doğru: +40 kredi, savaş sayacı arttı. |
| Yankı İstilası | Başladı, bitti | Zafer; kendi kaydında aşama 1→2, galibiyet 1, yankı özü +2, kredi +38. Dalga sonu "Bir güç seç" penceresi oyunu doğru biçimde durduruyor. |
| Kristal Kolos | Başladı, bitti | Taş Kolosus yenildi: +200 kredi, +1 Titan Çekirdeği, +1 sandık. |
| Hikâye Seferi | Başladı, bitti | Zafer: +282 kredi, +1 Hikâye Sayfası, +1 sandık. |
| Gökyüzü Adaları | Başladı, bitti | Zafer: +265 kredi, +2 Gök Kristali. |
| Sancak Hâkimiyeti | Başladı, bitti | Zafer: +260 kredi, +2 Sancak Madalyası (çevrim içi eşleşme kapalıyken yerel bota düşüyor). |
| Karanlık Geçit | Açıldı, başladı, bitti | Şartlar (400 kupa, kule katı 5, 5 zafer) sağlanınca açıldı. Zafer: kupa +31, +225 kredi, +2 Karanlık Mühür. |
| Gizli Bölge | Açıldı, başladı, bitti | Şartlar sağlanınca açıldı. Zafer: kupa +21, +225 kredi, +1 Gölge Mührü. |

- **Çifte ödül:** Sonuç ekranında "Devam"a üç kez basıp sayfayı yeniledikten sonra kupa, kredi, galibiyet, savaş sayacı ve sandık değişmedi.
- **Hata:** Bu savaşlar sırasında sayfa hatası (JavaScript) çıkmadı.
- **Not (düzeltilmedi):** Yankı İstilası sonuç ekranının üst etiketi "SAVAŞ ARENALARI" yazıyor, "Yankı İstilası" yazmıyor; kazanılan yankı özü de ekranda görünmüyor, yalnızca kredi görünüyor. Kayıt doğru, yalnızca ekran metni eksik.
- **Not:** Kristal Kolos sonuç başlığı "TAŞ KOLOSUS YENİLDİ" diyor. Bu, kolosun yenildiği (oyuncunun kazandığı) anlamına geliyor, ama kaybedilmiş gibi okunabilir.

### Bu kontrolde yapılamayanlar
- Gerçek çevrim içi eşleşme (iki oyuncu): Son Kahraman, Lonca Dev Avı, İki Oyunculu Kolosus ve Sancak'ın çevrim içi kolu.
- Her modun yenilgi yolu tek tek denenmedi (yalnızca Arena ve Doruk Kulesi).
- Kahraman büyüleri bot tarafından yalnızca zaman zaman denendi; her büyünün etkisi tek tek doğrulanmadı.

## Görsel tarama (tüm ekranlar)
Oyunda dışarıdan yüklenen görsel yok (hepsi dosyaya gömülü). Ana üstteki tüm ekranlar, sekmeler, mağaza bölümleri, ayarlar, profil, harita ve mod ekranları gezilip kırık/boş görsel, var olmayan SVG simgesi ve gizlenmiş yazı arandı; 83 savaş sprite türünün hepsi hazır, yüklenemeyen yok. Bulunan gerçek hatalar aşağıda. Gerçek telefonda WebGL çizimi (bu ortamda kapalıydı) denenmedi.

## Kod taraması ve bekleme odaları (son tur)
**Kod:** 96 satır içi betiğin hepsi söz dizimi denetiminden geçti (Node). ESLint ile 2,5 MB betikte yalnızca iki gerçek uyarı çıktı, ikisi de zararsız: `unlocked` nesnesinde tekrar eden `archer/warrior` anahtarı ve çeviri tablosunda tekrar eden "ÖRÜMCEK AKINI" anahtarı. "Tanımsız değişken" uyarıları (42 ad) betikler birbirinin kapsamına eriştiği için çıkıyor; savaşlar ve tüm modlar hatasız çalıştığı için gerçek hata değil. Dokuz modun ve çok sayıda ekranın taramasında sayfa hatası (JavaScript) çıkmadı.

**Bekleme odaları:** Giriş, hesap oluşturma, şifre sıfırlama, gizlilik, sandık odası (boş ve dolu), Lonca & Etkinlik Merkezi (beş sekme), rakip arama penceresi (arama, bulundu, hazırlık, 3-2-1 geri sayım) ve savaş hazırlık ekranı tek tek çekilip incelendi; görsel eksik ya da bozuk bulunmadı.

**Görseller:** Koleksiyonlarda (101 minyon, 50 ek karakter, 5 kahraman) kırık görsel ve emoji yedeği yok. Savaş sprite'ı olmayan 31 tür var, ama bunların 30'u emekli edilmiş eski kartlar (kilitli, desteye giremiyor) ve sonuncusu `skeleton_clone` kendi iskeletine sahip. Oyuncunun göreceği canlı içerikte çizilecek eksik görsel bulunmadı, bu yüzden yeni görsel çizilmedi.

**Telefon efektleri doğrulaması:** Eski sürümde 8 çekirdekli/8 GB bir telefon "düşük güç" sayılıyordu; yeni sürümde sayılmıyor. Ayarlar'da Grafik kalitesi "Düşük" seçilince ve 4 çekirdek/2 GB gibi zayıf donanımda yine "düşük güç" açılıyor.

### Dikkat gerektiren bulgular (düzeltilmedi, karar sende)
1. **Sahte rakip:** Çevrim içi rakip bulunamazsa oyun 10 saniye sonra "Rakip bulundu" yazıp uydurma bir komutan adıyla (örn. "Komutan Q2AD") bot maçı başlatıyor; kodda "bot maçı bildirimi yok" diye yorum var ve maçta duraklatılamıyor, hız değiştirilemiyor. Kupa da veriliyor. Oyuncu gerçek biriyle oynadığını sanabilir. Eski sürüm notu ise "bot kendiliğinden açılmaz, Botla oyna / Tekrar ara / İptal sorulur" diyor; mevcut davranış bununla çelişiyor. Öneri: metni "Rakip bulunamadı, bot rakibe karşı oynuyorsun" yapmak.
2. **Mağaza → PLAY sekmesi** oyunculara "Google Play için hazırlanıyor. Bu test sürümünde gerçek para alınmaz" yazısını ve pasif "HAZIRLIK AŞAMASINDA" düğmelerini gösteriyor. Yayında ya gizlenmeli ya da ödeme gerçekten bağlanmalı.
3. **Sunucu kurulumu:** Sıralama, dostluk maçı ve hesap silme için sunucuda `AFP_SOSYAL_KURULUM.sql` çalıştırılmış olmalı. Çalıştırılmamışsa oyuncuya "SQL dosyasını Supabase'te çalıştırın" gibi geliştirici mesajı çıkıyor. Üretim sunucusunda kurulu olup olmadığını bu ortamdan doğrulayamadım.

## Bulunup düzeltilenler
1. **Sosyal paneli**: geri tuşu paneli kapatmıyordu, çıkış sorusuna düşüyordu. Düzeltildi.
2. **Rakip arama penceresi**: geri tuşu aramayı iptal etmiyordu. Düzeltildi.
3. **Eşleşmeli maç**: duraklatma kapalı olduğu için geri tuşu yalnızca uyarı veriyor, maçtan çıkılamıyordu. Artık çıkış onayı açılıyor.
4. **Mağaza** (800×360, 854×393, 915×412): kart başlığı 0 piksele düşüp açıklamanın üstüne biniyordu, öne çıkan kartta açıklama düğmenin altında kalıyordu. Düzeltildi.
5. **Savaş eli**: uzun kart adları iki yandan kırpılıyordu. Artık baştan başlıyor, yalnızca sonu kırpılıyor.
6. **Sandık açılış ekranı**: sandık ve kartlar sola yaslanıyor, soldaki kart ekran kenarından kırpılıyordu. Mağaza stilleri açılış penceresini iki sütuna bölüyordu. Artık sandık üstte ortada, kartlar altında ortada (800×360, 854×393, 915×412; Basit, Usta ve Delüks sandık denendi). Efsanevi sandık denenmedi.
7. **Kartı At düğmesi**: önceden seçili kart istiyordu, savaş kartları dokunmayla seçilmediği için hiç çalışmıyordu. Artık önce düğmeye, sonra atılacak karta dokunuluyor.
8. **Telefonda efektlerin kısılması**: oyun, dokunmatik ekranı olan her cihazı "düşük güç" sayıyordu (parıltılar kapalı, parçacıklar 180→56, vuruş izleri ince, 30 FPS, düşük çözünürlük) ve Ayarlar'daki Grafik kalitesi bunu etkilemiyordu. Artık yalnızca Grafik kalitesi "Düşük" ise ya da zayıf donanımda (≤4 çekirdek veya ≤2 GB bellek) düşük güç açılıyor. Telefonda akıcılığı denenmedi; takılırsa Ayarlar'dan Grafik kalitesini Orta/Düşük yap ve oyunu yeniden aç.
9. **Etkinlikler satır simgeleri** görünmüyordu (emoji gizleniyor, yerine konacak simge hiç eklenmiyordu); simgeler eklendi.
10. **Meydan Okumalar** düğmesi "DEVA M ET" diye bölünüp ödül sayısı alt alta diziliyordu; tek satıra alındı.
11. **Minyon kartlarında** "SV 1" rozeti "S…" diye kırpılıyordu; düzeltildi.
12. **Ayarlar → Hakkında** sürümü v3.60.132 gösteriyordu; v3.60.220 yapıldı.
13. **Android onay pencereleri**: uygulamada `WebChromeClient` yoktu; bu yüzden oyundaki tüm `confirm()` pencereleri (buluta yedekle/geri yükle, hesaba bağla, loncadan ayrıl, misafir ilerlemesini kopyala) sessizce "İptal" dönüyordu. Artık Android onay penceresi gösteriliyor. Misafir kopyalama sorusunda görünen `\n` karakterleri de düzeltildi. (GitHub derlemesinde doğrulanmalı, telefonda denenmedi.)
14. **Şifre sıfırlama penceresi** geri tuşuyla kapanıyor.
15. **Yankı İstilası sonucu**: mod adı "Savaş Arenaları" yerine "Yankı İstilası" yazıyor ve kazanılan Yankı Özü ödül olarak görünüyor. **Kristal Kolos** zafer başlığı "yenildi" yerine "ZAFER · TAŞ KOLOSUS DEVRİLDİ" oldu.
16. **Hesap silme**: başarıdan sonra silinen hesabın yerel kopyası cihazda kalıyordu. Artık siliniyor.

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
