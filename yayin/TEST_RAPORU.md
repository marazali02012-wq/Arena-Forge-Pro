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

## 222 (çevrim içi bekleme odaları) birleştirmesi ve müzik
**Yöntem:** ArenaForgePro_222 HTML'i, tabanı `ba077a3` olan üç yönlü birleştirmeyle (taban, GitHub'daki güncel `15046e1`, 222) birleştirildi. Çakışma çıkmadı; yinelenen `<script>/<style>` bloğu yok; tabandaki hiçbir blok kaybolmadı. 222'nin 172 satırlık değişikliği tamamen alındı: beş bekleme odası (Arena, Sancak, Gizli Bölge, Karanlık Geçit, İki Oyunculu Kolosus) ve arka plan görselleri, mağazada "Kredi Kazan" düğmesi, hesap silme metinleri ve sunucu onay denetimi, 221 denetim stilleri, sürüm etiketi v3.60.222. Aynı düzeltme iki kez uygulanmadı.

**İki bilinçli karar:**
- 222 bizim "Kartı At" parlama stilini (3 satır CSS) silmişti, ama JS'ini bırakmıştı. Özellik görünmez kalmasın diye o 3 satır tabandaki haliyle geri konuldu. 222'nin kart adı hizası değişikliği (`center`→`start`) olduğu gibi bırakıldı.
- "Oyunun ses efektlerini koru" isteğiyle, benim yeni ses efekti sentezleyicim oyuna **bağlanmadı**; oyunun kendi efektleri aynen çalıyor. Yalnızca müzik eklendi (ana üs/menü, bekleme odası, savaş). Efekt sentezleyici kodda hazır bekliyor.

**Test edilenler (tarayıcıda, ağ kapalı):** 97 betiğin söz dizimi geçti; müzik Ayarlar'dan kapatılınca susuyor, açılınca geri geliyor ve ayar kaydediliyor (yeni kurulumda varsayılan açık); bekleme odasında "Aramayı iptal et" pencereyi kapatıyor; 10 sn'lik arama 8,4. sn'de "rakip bulundu", ~13. sn'de savaşa geçiyor (yeni bekleme süresi eklenmedi); savaşta müzik sahne değiştiriyor; Kartı At çalışıyor; Arena savaşı sorunsuz bitiyor. Sayfa hatası çıkmadı.

**Yapılamayanlar:** gerçek hesapla çevrim içi bekleme odası (arka plan görselli odanın hesaplı hali) ve iki telefonla gerçek eşleşme; müziğin kulakla dinlenmesi ve telefonda ses dengesi; Android'de müzik ve onay penceresi; 222'nin hesap silme değişikliğinin gerçek sunucuyla doğrulanması.

**Dikkat:**
1. **222 hesap silme:** istemci artık sunucudan `ok:true` yanıtı bekliyor (`receipt?.ok!==true`). Sunucudaki `afp_delete_account` işlevi `{ok:true}` döndürmüyorsa, silme başarılı olsa bile oyun "Sunucu silmeyi onaylamadı" der ve oturumu temizlemez. Gerçek test hesabıyla doğrulanmalı.
2. **Telefon performansı:** önceki turda telefonların "düşük güç" sayılması kaldırıldı (tam efekt). Yazılım tabanlı çizimde bu savaşı yaklaşık 2,7 kat yavaşlattı (104 sn → 277 sn, aynı savaş). Gerçek telefon GPU'sunda etkisi ölçülmedi. Takılma olursa Ayarlar'dan Grafik kalitesini Orta/Düşük yap. Müzik motorunun ölçülebilir maliyeti yok (düşük güç yolunda müzik açıkken 91 sn, taban 104 sn).
3. **Bekleme odası görseli misafirde de çıkıyor:** 222'nin koşulu misafirde de doğru sayılıyor (misafir 10 sn aramaya girip bota düşüyor). 222'nin tasarımı olarak bırakıldı.

## Ses düzeltmesi (müzik hiç duyulmuyordu, efektler basitti)
**Kök neden 1 (müzik):** Önceki sürümlerde "Müzik" ayarı varsayılan KAPALIydı ve bu, oyuncuların kayıtlı ayarlarına işlenmişti. Ben yalnızca yeni kurulumlarda açık yaptığım için güncelleme sonrası müzik motoru hiç çalmıyordu. Düzeltme: oyun ayarları okunmadan önce çalışan küçük bir betik, kayıtlı "müzik kapalı"yı **bir kez** açık yapıyor (`afpMusicDefaultOnV1` bayrağı); sonra oyuncunun Ayarlar'daki seçimi geçerli. Android'de ayrıca WebView'ın ses otomatik başlatması açıldı, böylece giriş ekranından itibaren ilk dokunuşu beklemeden çalabilir.
**Kök neden 2 (efektler):** Bir önceki turda "oyunun ses efektlerini koru" isteği üzerine yeni efekt sentezleyicisini oyuna bağlamamıştım; oyun hâlâ eski tek notalı bipleri çalıyordu. Şimdi bağlandı (eski bip yalnızca yedek).
- **Vuruş:** yakın dövüş (metal çınlaması veya ten/darbe sesi rastgele), ağır birim (daha derin ve güçlü), ok atan birim (ok/ahşap sesi). Her vuruş hafifçe farklı.
- **Kahraman büyüleri (5 kahraman, 25 büyü):** Korvayn ateş (alev dalgası, lav yağmuru meteor düşüşü ve patlama, ateş duvarı çıtırtısı), Vaelor fırtına (yıldırım çatlaması ve gök gürültüsü, zincir şimşek, kasırga), Theryn doğa (şifa çanları, diken hışırtısı, kök/taş gümbürtüsü), Elyvara zaman ve buz (cam çınlamaları, kristal kalkan, mühür), Saelith gölge (bıçak savrulması, alçak uğultu, çağırma). Ses, büyünün görsel türüne göre seçiliyor.
- Kart oynama, ölüm, portal vuruşu, zafer, yenilgi, ödül, arayüz ve hata efektleri de yenilendi.
- Savaş müziğinde vuruş (kick) ve tomlara telefon hoparlöründe duyulacak orta frekanslar eklendi; müzik biraz yükseltildi.

**Testler:** eski "müzik kapalı" kayıtla açılışta ayar açık oluyor ve ana üste/savaşta ses seviyesi var; tam bir savaşta 80 yakın dövüş vuruşu, 6 ok vuruşu, 7 ölüm, 14 kart, portal, yenilgi ve her iki tarafın büyüleri yeni motora yönlendi; sayfa hatası yok; 98 betik söz dizimi geçti; müzik aç/kapa, bekleme odasında iptal ve savaşa geçiş çalışıyor.
**Yapılamayanlar:** sesleri kulakla dinleyemedim, yalnızca sayısal denetledim (her efekt sesli, taşma ve geçersiz değer yok). Gerçek Android'de WebView otomatik başlatmasını denemedim. Efektlerin "gerçekçilik" derecesi sentezleyici sınırındadır; örnek kayıt (sample) kullanılmadı.

## Minyon yetenekleri artık görünür ve duyulur (v3.60.223)
**İstek:** Basit yetenekler "gerçek" olsun; örn. okçunun yeteneği devreye girince 3 ok atsın; tüm minyonlar için.
**Ne yapıldı:** 137 minyonun (36 eski, 52 AF37, 49 yeni) pasif yeteneği ortak bir "yetenek efekti" katmanına bağlandı. **Sayısal değerler (hasar, ihtimal, süre) değişmedi.**
- **3 mermilik salvo (gerçek mekanik):** Menzilli birimlerin (okçu, nişancı, büyücü…) kritik, "son darbe", "ilk kan" ve çarpanlı her-N'inci vuruşu 3 mermi olarak atılıyor: hasar %40 + %30 + %30'a bölünüyor, **toplam hasar eskisiyle aynı**. Mermiler yelpaze gibi hafif sapmayla ve kısa aralıkla çıkıyor. Test: Orman Okçusu'nun kritiği 19 hasarı 8+6+5 olarak 3 oka böldü, 18'i 7+5+6.
- **Yetenek rozeti (büyük, çizimli):** tetiklenince birimin üstünde yuvarlak çizilmiş simge + yetenek adından oluşan renkli çerçeveli bir rozet çıkıyor (1,3 sn, yükselip sönüyor), birimin içinde ve altında aynı renkte parlama oluyor. 20 çizilmiş simge var: 3 ok yelpazesi, kılıç izi, yıldız, kuru kafa, hançer, şok dalgası, artı, kalkan, alev, zehir damlası, kar tanesi, lanet üçgeni, şimşek, delici ok, patlama, kalp, diken, rüzgâr, diriliş oku. Rozetler can çubuğunun üstünde duruyor, çakışanlar üst üste yığılıyor, üst paneli kapatmıyor. Sık tetiklenen etkiler 2,2 sn, nadir olanlar 1,1 sn'de bir gösteriliyor (ekran dolmasın).
- **Savunma tarafı da görünür:** kaçınma, hasar azaltma (kalkan), diken yansıtma ve ölümsüzlük/diriliş yetenekleri savunan birimin üstünde rozet çıkarıyor.
- **Salvo çizgileri:** 3'lü atışta hedefe 3 parlak çizgilik yelpaze de çiziliyor.
- **Türüne göre efekt:** kılıç darbesi (kesik/kritik), sersemletme yıldızları, itme dalgası, ilk kan ve son darbe patlamaları, delici vuruşta arkadaki düşmana çizgi, savurma/alan hasarında genişleyen halka, iyileştirme/kalkan yeteneklerinde dosta ışın, yanma/zehir/yavaşlatma/zayıflatma vuruşlarında renkli parçacık.
- **Ok rengi yeteneği gösteriyor:** zehirli ok yeşil, yanıcı ok turuncu, yavaşlatan ok buz mavisi, zayıflatan ok mor.
- **Aura yetenekleri** (ordu narası, can yenileme, yavaşlatma, kalkan) zeminde soluk halka olarak çiziliyor.
- **Ses:** yetenek anında türüne göre ses çalıyor (salvo için 3 ok teli, kılıç, sersemletme, itme, vb.).
### Işınlanma (gerçek mekanik) ve 3D'ye yakın görseller
- **Işınlanma artık gerçekten oluyor:** 9 minyona "başka koridora ışınlanma" yeteneği verildi. Her 5. vuruşta (Gölge Kılıcı, Alacakaranlık Haydudu, Gölge Suikastçı, her 6.'da Mor Suikastçı, her 4.'de Yarık Gezgini) ya da saldırıdan kaçınca (Sis Gezgini, Ruh Tilkisi, Karanlık Suikastçı, Gölge Avcısı) birim *gerçekten* başka koridora geçer: koridoru ve konumu değişir, düşman olan koridoru ve en yaralı hedefi seçer, hedefin hemen önünde boş yer arar (üst üste binmez), 3,2 sn bekleme süresi vardır. Hasar/ihtimal sayıları değişmedi. Kart açıklamaları metinle birlikte güncellendi.
- **Test:** gerçek savaşta birimler 0→1 ve 1→2 koridorlarına geçti, ışınlanan birimin hedefi yeni koridora ait, üst üste binme yok, sayfa hatası yok.
- **Görseller:** her yetenek türü için derinlikli, gölgeli, parlamalı parçacık efektleri çizildi: eğri kılıç izi, patlama + ışık hüzmeleri, yörüngede dönen gölgeli yıldızlar, şok dalgası + toz, enerji ışını, 3 ok yelpazesi (izli), alev dilleri + kıvılcım, zehir baloncukları, buz kristalleri, lanet rünü, şimşek, kan emme küreleri, yerden çıkan dikenler, iyileştirme artıları, kalkan kubbesi, diriliş ışık sütunu, kaçınma rüzgârı, ışınlanma kapısı (girdap). Efektlerin tohumu minyonun adından türetilir (aynı minyon hep aynı imzayı taşır). Rozet cam gibi parlak, simgeler gradyanlı ve gölgeli.
- **Sınır:** efektler yetenek *türüne* göre ortak çizilir; 137 minyonun her birine el çizimi ayrı animasyon yoktur (renk, boyut ve parçacık düzeni minyona göre değişir).

**Test:** bot oynayan gerçek savaşlarda rozetler çıktı (örn. Et Yiyici, Kalkan Duvarı, Kemik Dirilişi, İsabetli Atış ×3, Asa Savuruşu, Çekiç Sarsıntısı, Kemik Diken); rozetlerin çakışma/kesilme sorunları ekran görüntüsüyle bulunup düzeltildi; 20 simgenin hepsi ayrıca tek tabloda çizdirilip kontrol edildi; sayfa hatası yok; 98 betiğin söz dizimi geçti.
**Yapılamayanlar / sınırlar:** 137 minyonun her biri tek tek sahada denenmedi; efektler yetenek *türüne* göre ortak olduğu için bir tür doğruysa o türdeki tüm minyonlar çalışır. Gerçek telefonda görünürlük ve performans (özellikle büyük savaşlarda) ölçülmedi. Sürekli açık yetenekler (zırh/hasar azaltma, kaçınma, diken) yeni efekt almadı; kaçınma ve diken yazıları zaten oyunda vardı. Hasar bölüşümü (%40/30/30) değiştirilebilir; toplamı artırmak denge kararıdır, yapılmadı.

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
13. **Müzik ve ses efektleri**: oyunda gerçek müzik yoktu (yalnızca iki sabit uğultu, varsayılan kapalı; vuruş sesi tek bir bip). Özgün bir müzik ve ses motoru eklendi (`AFP_AUDIO_V1`): ana üs/menü, rakip bekleme odası ve savaş için ayrı besteler; vuruş, portal, kart, büyü, arayüz, ölüm, ödül, zafer ve yenilgi efektleri. Hepsi nota olarak yazılıp çalma anında üretiliyor; hazır dosya, örnek ya da dış kaynak yok, bu yüzden telif sorunu ve boyut artışı yok. Sahne ekrandan otomatik seçiliyor, Ayarlar'daki Müzik/Ses/Efekt seviyeleri geçerli, yeni kurulumlarda müzik açık. Kulakla dinlenmedi (yalnızca ölçüldü: taşma yok, her sahnede ses var, müzik kapatılınca susuyor); telefonda dinleyip dengeyi değerlendirmek gerekir.
14. **Android onay pencereleri**: uygulamada `WebChromeClient` yoktu; bu yüzden oyundaki tüm `confirm()` pencereleri (buluta yedekle/geri yükle, hesaba bağla, loncadan ayrıl, misafir ilerlemesini kopyala) sessizce "İptal" dönüyordu. Artık Android onay penceresi gösteriliyor. Misafir kopyalama sorusunda görünen `\n` karakterleri de düzeltildi. (GitHub derlemesinde doğrulanmalı, telefonda denenmedi.)
15. **Şifre sıfırlama penceresi** geri tuşuyla kapanıyor.
16. **Yankı İstilası sonucu**: mod adı "Savaş Arenaları" yerine "Yankı İstilası" yazıyor ve kazanılan Yankı Özü ödül olarak görünüyor. **Kristal Kolos** zafer başlığı "yenildi" yerine "ZAFER · TAŞ KOLOSUS DEVRİLDİ" oldu.
17. **Hesap silme**: başarıdan sonra silinen hesabın yerel kopyası cihazda kalıyordu. Artık siliniyor.

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

## Savaş sesi ve rozetler (son istek)
- **Savaşta müzik kapalı:** savaş başlayınca müzik kesiliyor (menüde, bekleme odasında ve sonuç ekranında çalmaya devam eder); yalnızca efekt sesleri var. Vuruş sesi seviyesi müzik kalktığı için 0,62'den 0,9'a çıkarıldı. Test: savaşta sahne boş, ses seviyesi ~0 (efekt çalmadığı anlarda), sayfa hatası yok. Ayarlardan müzik/ses düğmeleri aynen çalışıyor.
- **Rozetler kaldırıldı:** yetenek adı rozeti artık çizilmiyor. Yetenek efektleri (kılıç izi, alev, buz, ışınlanma kapısı vb.), parlama ve yetenek sesleri duruyor.

## Gerçekçi patlama sesleri ("küm") — son istek
**İstek:** Efekt sesleri gerçek seslerden alınsın; örn. ateş topu atılınca, çarpınca "küm" diye ses çıksın.
**Gerçek kayıt konusu (yapılamadı):** Bu ortamdan ses sitelerine (Freesound, OpenGameArt, Kenney, Archive.org) erişim yok; yalnızca npm/PyPI paket depoları açık. Orada bulunan ses paketleri yalnızca arayüz sesi (tık, bildirim) içeriyor, savaş/patlama kaydı yok; başka yerden kaydı lisansı doğrulanmadan oyuna koymadım. Bu yüzden gerçek kayıt yerine, gerçek bir patlamanın katmanlarını taklit eden sentez yazıldı (aşağıda). Gerçek kayıt eklemek istersen: telefondan indirdiğin lisansı serbest (CC0) .ogg/.wav dosyalarını gönder, oyuna gömerim.
**Yapılan:**
- Yeni patlama sesi: ilk çatlama + alçalan gürültü gövdesi + 105→30 Hz alçalan "küm" + gümbürtülü kuyruk + yankı + kıvılcım çıtırtısı.
- **Büyülerde fırlatma ve çarpma ayrıldı:** fırlatınca kahramanın sesi, mermi/büyü gerçekten çarptığı anda patlama sesi çalıyor (Alev Dalgası: orta patlama, Lav Yağmuru: büyük patlama + moloz, alanlar: alçak patlama, Yıldırım/Zincir/Fırtına: gök gürültüsü, kaya: çatlama). Daha önce Lav Yağmuru'nun çarpma sesi fırlatmayla birlikte yanlış anda çalıyordu.
- **Ateş atan minyonlar** (yanma yeteneği olan okçu/büyücüler): atarken alev fışkırması, çarpınca küçük "küm". Diğer birimlerin vuruş sesleri değişmedi.
- Test: 10 büyü atıldı, 10 çarpma sesi çaldı; ateş atan birimlerle 22 fırlatma / 26 çarpma sesi; vuruş sesleri çift çalmıyor; kırpma yok; sayfa hatası yok.

## Minyonlar birbirine vururken savaş sesleri (son istek)
**Bulgu (kök neden):** Birim-birim savaşında vuruş sesi çalan hiçbir çağrı yoktu; duyulan "vuruş" sesleri aslında yalnızca kule/portal vuruşlarınındı. Ölçüm: 62 sn'lik bir savaşta birim saldırılarında 0 ses.
**Yapılan:** (gerçek kayıt indirilemediği için sentezle; yukarıdaki notla aynı gerekçe)
- **Savurma:** kılıç/balta savururken "vııt" (hafif birimler), ağır birimlerde (saldırı ≥30) alçak ve güçlü savurma.
- **Ok:** ok atarken yay teli sesi + ok vınlaması; **büyü atan** birimlerde (büyücü, rahip, şifacı, çağırıcı vb.) yükselen büyü fırlatma sesi; çarpınca ok için "tak", büyü için parlak çarpma sesi, ateş atanlarda "küm".
- **Savaşçı sesleri (insan sesi sentezi):** saldırırken "hah!/heh!", darbe alırken "uhh/ohh", ölürken uzun "ohh". Ses, minyonun adından türetilen bir kimliğe sahip: erkek, tiz ve yaratık/ork/iskelet (alçak, hırıltılı) sesleri var; aynı minyon hep aynı sesle bağırır.
- **Aşırı gürültü olmasın diye:** saldırı sesleri en fazla ~16/sn, bağırma sesi saldırıların yarısında ve en fazla ~6/sn, acı sesi darbelerin ~%40'ında; hepsi ses sınırlayıcıdan geçer (kırpma yok).
- **Test (62 sn savaş):** 60 kılıç savurma, 11 ok teli, 3 büyü fırlatma, 95 vuruş, 34 ok çarpma, 2 büyü çarpma, çok sayıda saldırı/acı/ölüm sesi; sayfa hatası yok.
**Sınır:** Sesler gerçek kayıt değil, sentezdir; özellikle insan sesi gerçek bir kayda göre yapaydır. Gerçek kayıt için CC0 .ogg/.wav dosyalarını gönderirsen gömebilirim. Telefonda dinleme yapılmadı.

## Grup kartları düşman portala gelince çıkmıyordu (son istek)
**Şikâyet:** İskelet / okçu / kılıççı kartları, düşman portala gelince sahaya çıkmıyor.
**Kök neden:** Üç grup kartı (İskelet Savaşçı 3'lü, Orman Okçusu 2'li, Kılıçlı Asker 2'li) `af214SquadPlacement` ile yerleştiriliyor. Düşman koridorda x≤0,15'e gelince hesaplanan yer penceresi boşalıyor (başlangıç > bitiş) ve fonksiyon `null` dönüyor; kart "Grubun tamamı için boş alan yok" diye reddediliyordu. Eski 3'lü klon kartında "acil diziliş" yedeği vardı, bu üç karta eklenmemişti.
**Test (düzeltmeden önce):** düşman x=0,15 / 0,10 / 0,06 / 0,03 → üç kart için de `NULL` (yerleştirilemiyor).
**Düzeltme:** normal yer bulunamazsa grup, kendi portalının önünde, düşmana göre en az çakışan tabana acil dizilişle çıkıyor (üyeler x=0,005–0,12 arasında, kendi aralarındaki dizilişi koruyarak). Hasar, enerji, kart sırası aynı; yalnızca "çıkamama" giderildi.
**Test (düzeltmeden sonra):** aynı koşullarda üç kart da geçerli yer buldu; gerçek savaşta düşman portala dayalıyken Kılıçlı Asker +2, Orman Okçusu +2, İskelet Savaşçı +3 birim sahaya çıktı; sayfa hatası yok. Rakip tarafın grup kartları da aynı fonksiyonu kullandığı için aynı şekilde düzeldi.
**Sınır:** Düşman tam portalın üstündeyken grup düşmanla iç içe geçebilir (eski klon kartıyla aynı davranış). Aynı koridorda saha dolu (36 birim) ise yine "Saha dolu" diye reddedilir; bu bilinçli sınırdır.

## Gerçek ses kayıtları oyuna gömüldü (kullanıcının yüklediği 17 Pixabay dosyası)
- 17 dosyadan **15 parça** kesilip normalleştirildi (toplam ~155 KB, `index.html` içinde `AFP_AUDIO_SAMPLES`), her biri oyunda ilgili yere bağlandı: yumruk → yakın dövüş isabeti, yer çarpması/gümleme → ağır vuruş, metal çarpma katmanı, 2 kısa uğultu → kılıç savurma ve ok vınlaması, sinematik uğultu → ağır savurma ve büyü/ateş topu fırlatma, sinematik boom → "küm" (Alev Dalgası, Lav Yağmuru, ateş topu isabeti, alan büyüleri, gök gürültüsü), araba çarpması + boom → portal yıkılışı, ezme vuruşu → sersemletme/kaya/çağırma, buz büyüsü çarpması → Zaman Yavaşlatma, nefes → saldırı sesine katman.
- **Kullanılmayanlar:** makineli tüfek, tabanca, koridor ayak sesi (fantezi oyununa uymuyor).
- Parçalar her seferinde hafif farklı perdede çalınır (±%5) ve sentez "küm"/ses katmanlarıyla birlikte çalar; örnek yüklenemezse eski sentez sesler yedek olarak çalar.
- **Test:** 15/15 parça çözüldü; kırpma yok; 58 sn'lik savaşta yeni sesler çaldı; Arena, Yanki, Kolos, Gizli, kart silme, bekleme odası testleri hatasız.
- Kaynak ve lisans notu: `yayin/SES_LISANS_NOTU.md` (Play yayını öncesi her dosyanın lisansını kontrol et).
- **Sınır:** kılıç-kılıç çarpışması, gerçek ok teli ve insan "hah/uhh/ohh" savaşçı sesi için uygun kayıt yoktu; bunlar sentez olarak kaldı (savurma/vuruş artık gerçek kayıt, savaşçı sesleri sentez, yalnızca nefes katmanı gerçek).

## Çan/para sesi kaldırıldı + savaş altında kısık davul döngüsü
- **Çan/para sesi neydi:** Benim yazdığım sentez efektlerdi: iyileştirme yeteneğinin üç notalı "ting-ting-ting" çanı (Işık Şifacısı vb. her vuruşta), genel yetenek bildiriminin çan sesi, sersemletme/ışınlanma/büyü çarpmasındaki çan sesleri ve Terrin/Noella/koruma/iyileştirme/buz/lanet büyülerindeki zil benzeri tonlar. Hepsi savaş efektlerinden çıkarıldı; yerine çansız (uğultu, nefes, hafif tok vuruş) sesler kondu. Sonuç ekranı, sandık, ödül ve zafer/yenilgi melodileri değişmedi.
- **Savaş altı müzik:** yüklenen ezme/davul parçasından (audiocopper) 8,6 sn'lik, kesintisiz döngü yapıldı (10 vuruş, 0,3 sn eşit güçlü çapraz geçiş, ~100 KB). Savaş başlayınca 1,2 sn'de yumuşakça başlar, kısık çalar (tepe ses seviyesi ~0,10; efektler 0,5-0,8), savaş/sonuç ekranı bitince yumuşakça söner. Ayarlardan "Müzik" kapatılırsa veya ses kapalıysa çalmaz; duraklatınca daha da kısılır. Melodik savaş müziği kapalı kalmaya devam ediyor.
- **Test:** 16 örnek yüklendi; savaşta sahne "battle", ses tepesi ~0,10; çansız efektler kırpmasız; Arena, Yanki, Kolos, Gizli, kart silme ve bekleme odası testleri hatasız.
- **Not:** Parça bas ağırlıklı (enerjinin %88'i 200 Hz altında); telefon hoparlörlerinde çoğunlukla vuruş ucu duyulur, kulaklıkta tam duyulur.

## Vuruşlardaki ince tiz "para düşer gibi" ses kaldırıldı
- **Kaynak:** (1) benim sentez "clang" metal-çan katmanım (650-1300 Hz tabanında 4-8 kHz'e uzanan kısmi tonlar, ~0,16 sn tınlıyor), (2) yüklenen plaka sesinden yaptığım "clang" parçası (5 kHz üstünde uzun süre tınlayan metal tonlar), (3) ok vuruşundaki ince 500-560 Hz üçgen ton ve hızlandırılmış (x1,5) yumruk, (4) yakın dövüşteki 2,5 kHz üstü "tık" gürültüsü, (5) kritik "slash" yeteneğindeki 5-6 kHz çift uğultu.
- **Düzeltme:** tüm bu katmanlar çıkarıldı; vuruş parçalarına 3-3,6 kHz alçak geçiren filtre eklendi; kullanılmayan "clang" kaydı oyundan çıkarıldı (~16 KB azaldı).
- **Ölçüm (3 kHz üstü enerji oranı, önce→sonra):** ok vuruşu 0,334→0,016; yakın dövüş 0,142→0,063; ağır vuruş 0,024→0,005; kritik slash 0,477→0,171. Kırpma yok.
- **Test:** savaşta 15 örnek yüklendi, vuruş/savurma sesleri çalıyor; Arena, Yanki, Kolos, Gizli, kart silme, bekleme odası hatasız.

## FPS / ağırlık incelemesi
- **Yöntem:** aynı bot savaşı 6 farklı sürümde (eklemelerden önce → şimdiki) çalıştırıldı; CDP profilleyicisiyle oyun JS süresi, GC ve WebGL→2B aktarım süresi sanal saniye başına ölçüldü.
- **Bulgu 1 (regresyon yok):** oyun JS maliyeti sürümler arasında aynı bandın içinde (≈30–47 ms/sn, ölçüm gürültüsü ±%30; tekrar ölçümde şimdiki sürüm ≈36 ms/sn). Yani son eklenen efekt, ses ve ışınlanma değişiklikleri ölçülebilir bir yavaşlatma yapmıyor.
- **Bulgu 2 (ses):** 58 sn'lik savaşta 180 ses çağrısı toplam 11,5 ms sürdü (en uzun tek çağrı 1 ms); saniyede ~42 ses düğümü yaratılıyor. Ana iş parçacığını yormuyor.
- **Bulgu 3 (efektler):** aynı karede 20 farklı yetenek efektinin çizimi <1 ms.
- **Bulgu 4 (asıl yük):** süre çoğunlukla oyunun kendi WebGL sprite çiziminin 2B tuvale aktarımında (`flush`→`drawImage`, test ortamında yazılımla çizildiği için abartılı) ve birim can çubuğu/yazı çiziminde (`af320DrawHud`, ~15 ms/sn). Bunlar bu çalışmadan önce de vardı. Gerçek telefondaki GPU davranışı burada ölçülemedi.
- **Yapılanlar:** (1) Can çubuğu gradyanları önbelleğe alındı (görüntü aynı); (2) efekt parlama/diskleri önceden çizilmiş sprite'lardan çiziliyor; (3) **hız koruyucu:** kare süresi uzun süre 38 ms'nin üstünde (≈26 FPS altı) kalırsa yetenek efektleri otomatik sadeleşir (parçacık sayısı yarıya, gölge/parlama blur'ü kapanır, 2. seviyede yalnızca temel efektler çizilir), 28 ms altına dönünce geri gelir. Yavaş test ortamında birkaç saniyede devreye girdi.
- **Sınır:** Gerçek telefonda FPS ölçülmedi. Hâlâ ağır hissedilirse Ayarlar'dan kaliteyi "Düşük" yapmak oyunun kendi düşük-güç modunu açar (en etkili yol).

## Takılma (kasma) için ek önlemler
- **Teşhis:** Gerçek zamanlı savaşta uzun görevler (>120 ms) yakalandı; süre oyunun kendi WebGL→2B tuval aktarımında (`drawImage`), ses/efekt koduna ait değil. Bu yapı (her kare GL tuvalini 2B tuvale kopyalama) gerçek Android WebView'da da cihazdan bağımsız takılma üretebilir; yüksek donanımlı cihazlarda render hedefi 60 FPS olduğu için iş iki katına çıkar.
- **Uyarlanır 30 FPS sınırı:** her sunulan karenin iş süresi (JS + çizim) ölçülür; 60 FPS bütçesi (≈17 ms) uzun süre aşılırsa çizim otomatik 30 FPS'e sabitlenir (aktarım yarıya iner, kare aralığı dengeli olur), bol pay kalınca (<9 ms) geri döner. Oyun hızı/ simülasyon zamana bağlı olduğu için değişmez. Düşük güç cihazlar zaten 30 FPS'te.
- **FPS göstergesi:** Ayarlar → Görüntü ve erişilebilirlik → "FPS göstergesi". Savaşta sol üstte FPS, iş süresi (ms), en uzun kare (ms), düşük güç / 30 FPS sınırı / efekt seviyesi görünür. Telefondaki gerçek değerleri görmek için.
- **Test:** göstergenin ve ayar satırının çalıştığı, yavaş test ortamında sınırın devreye girdiği doğrulandı; Arena, Yanki, Kolos, Gizli, kart silme, bekleme odası testleri hatasız. Gerçek telefonda ölçülmedi.

## Kupa dengeli eşleşme (bot) ve çevrim içi kuralı
- **Kural:** pay = max(5, ⌊kupa × %20⌋); 100 kupa ↔ en fazla 120 (en az 80); 0 kupa ↔ 0–5; 1000 kupa ↔ 800–1200.
- **Bot (istemci, yapıldı):** süre dolunca rakip gibi görünen bot artık oyuncunun kupasına göre kurulur: rastgele bir "rakip kupası" seçilir (band içinde), rakip kademesi/zorluğu (`enemyDifficulty`), rakip kahraman kademesi (`af327EnemyTier`) ve rakip kart havuzunun nadirlik kapıları (Epik ≥150, Efsanevi ≥600, Platin ≥1500) bu değere göre belirlenir. Önceden bunlar oyuncunun kendi kupasına bakıyordu ve kademeler arasında geçiş sertti.
- **Test:** 0/3/50/100/250/500/1000/5000 kupada 4000'er seçim hep band içinde; 100 kupalı oyuncuda gerçek kuyruk→bot akışında 3 denemede rakip kupası 83, 88, 85 (hepsi 80–120); sayfa hatası yok.
- **Gerçek çevrim içi rakipler (YAPILAMADI):** eşleşme kararı sunucuda (`arena-forge-online-server`); sunucu kodu bu repoda yok ve istemciden kupa göndermek hileye açık + protokolü bozabilir. Sunucu geliştiricisi için kural ve notlar: `yayin/SUNUCU_KUPA_ESLESME.md`.

## 228 "Resimli Kupa Yolu" birleştirmesi ve 12 lig rozeti
- **228 sürümü:** gönderilen `ArenaForgePro_228_HEROIC_RESIMLI_KUPA_YOLU_TEST.html`, benim en son sürümümün (07313e2) üzerine kurulu çıktı (kupa dengeli bot, hız koruyucu, FPS göstergesi, sesler, ışınlanma vb. hepsi içinde). Bu yüzden 228 doğrudan temel alındı; onun ek değişiklikleri (sezon bileti düzeltmeleri, ödül görselleri, günlük ödül/etkinlik mağazası kayıt geri alma, "Resimli Kupa Yolu" sahne kartları) korunarak rozetler üstüne eklendi. Bu ek değişiklikler ayrıca tek tek test edilmedi; genel regresyon ve ana ekran taraması hatasız geçti.
- **Rozet görseli:** gönderilen 12'li tablo, görünmez kirli piksellerden (alfa 1–2 değerinde renkli artıklar) arındırıldı, kenarlar komşu opak renklerle temizlendi (halo yok), her rozet ayrı kesildi, ortak ölçekte 320×320 saydam WebP yapıldı (toplam ~280 KB, kaynak: `yayin/lig-rozetleri/`). 12. rozetin sağ kanadı kaynak tabloda kenara 1 px değiyordu; kayıp ihmal edilebilir.
- **Eşleştirme:** 12 rozet, oyundaki 12 lige (`TROPHY_RANKS`) sırayla bağlandı: Bronz, Gümüş, Altın, Kristal, Usta, Efsane, Şampiyon, Kadim, Titan, Mistik, Zirve, Sonsuz Şampiyon.
- **Yerleştirilen ekranlar:** (1) Ana ekran üst çubuğu ve "Kupa Yolu" kartı, (2) diğer ekranlardaki üst kupa çipi, (3) Kupa Yolu başlığı (büyük rozet + lig çipi), (4) her lig eşiği kartı (ulaşılanlar canlı, kilitliler soluk, şu anki lig parlıyor ve altın çerçeveli), (5) etap önizleme penceresi, (6) "Ligler ve Arenalar" listesi.
- **Test:** 12 kupa değerinde (0…10.000) Kupa Yolu ekran görüntüsüyle her rozetin doğru ligde olduğu doğrulandı; 854×393, 800×360, 915×412 boyutlarında taşma yok; Arena, Yanki, Kolos, Gizli, kart silme, bekleme odası ve tam ekran taraması (31 ekran) hatasız.
- **Yapılmadı:** savaş sonucu ekranındaki kupa satırı ve profil penceresi metin tabanlı olduğu için değiştirilmedi.

## Kupa Yolu önizleme pencerelerinde kesilme ve taşma düzeltmeleri
- **Referans araştırması:** "Heroic - Magic Duel" için web araması yapıldı; yalnızca fandom wiki sayfalarının (Battle Arenas, Badges and Titles vb.) varlığı ve kupa/arena kuralları göründü. Sayfaların kendisine bu oturumun ağ izni olmadığı için ekran düzenine bakılamadı (heroic-magic-duel.fandom.com erişilemedi). Düzen, bilinen mobil lig/kupa yolu pratiklerine göre kuruldu: ekrana sığan pencere, kaydırılan içerik, hep görünür düğmeler, kayan listede kenar solması.
- **Ölçüm:** 854×393, 800×360, 915×412 ve 740×360'ta Kupa Yolu ve pencereler otomatik tarandı (kesik metin, dikey/yatay taşma, ekran dışına çıkan öğe).
- **Bulunan ve düzeltilenler:**
  1. **Etap önizlemesi ekranı aşıyordu:** pencere 373 px, içerik 380 px, alttaki KAPAT / SONRAKİ LİG düğmeleri ekranın dışında (y=452–488, ekran 393) ve alt ödül kartları kesikti. Pencere artık ekrana sığıyor, içerik kendi içinde kayıyor, düğmeler hep görünür. Yatay telefonda geniş iki sütunlu düzen: solda "bu eşikte alınanlar", sağda "etaptaki sonraki ödüller" (kayan listede sağ kenar solarak devam ettiğini gösteriyor).
  2. **Pencere kurdelesi (başlık) üstten kesiliyordu:** düzeltildi.
  3. **Önizleme ödül görselleri kırpılıyordu:** görsel kutusu 44 px, görsel 125 px; artık sığdırılıyor (contain).
  4. **Yol kartlarında yazılar "…" ile kesiliyordu** (ORMAN R…, KIZIL DÜELL…, +3 GELİŞTİRM…, MİNYON KARTI · E…): adlar 2 satıra iniyor, alt yazılar kısaltıldı (minyon: yalnızca nadirlik; ana kahraman: yalnızca element; parça: "+3 PARÇA"; ayrıntı pencerelerde tam yazı).
  5. **Ö, Ü, Ğ, İ noktaları kesiliyordu** ("ÖDÜLÜ AL" → "ODULU AL"): satır yüksekliği düzeltildi.
  6. **Üst kupa çipi küçük ekranda "1.00…" diye kesiliyordu:** çip içeriğe göre genişliyor.
  7. **Kural, Geçmiş ve Ödül pencereleri** de aynı sığdırma kuralından yararlanıyor (kurdele ve düğmeler her boyutta görünür).
- **Son tarama:** kesik metin ve satır kesilmesi kalmadı; geriye yalnızca kayan zaman çizgisinin bilinçli olarak ekran dışına uzanan parçaları kaldı. Arena, Yanki, Kolos, Gizli, kart silme ve bekleme odası testleri hatasız.

## 7 maddelik değerlendirme listesi — durum (yapılabilenler yapıldı)
1. **Ücretli sezon bileti — YAPILAMADI.** Premium bilet 5.000 oyun kredisiyle açılıyor. Gerçek para için Google Play Faturalandırma (native Android kodu), Play Console'da ürün tanımı ve sunucu tarafı satın alma doğrulaması gerekir; bunlar için Play Console erişimi ve gizli anahtarlar yok. (Ekonomi notu: Premium yolu 30 seviyede 7.920 kredi + 14 toz + 3 sandık + 12 parça + 3 minyon + 3 görünüm verir; 5.000 kredilik bedelin üzerinde getiri sağlıyor. Gerçek para fiyatı belirlenirken bu oran yeniden ayarlanmalı.)
2. **Yadigâr Tozu — kısmen yanlış tespit, metin düzeltildi.** Toz aslında harcanıyor: ekipman satın alma/yükseltme, büyü yükseltme ve tozla açılan sandıkta. Yanlış olan, ekranda kalan eski "şimdilik harcanacak yeri yok" yazılarıydı (3 yer, 1'i İngilizce çeviri). Hepsi "Kahramanlar → Ekipman ve Büyüler ekranlarında harcanır" olarak güncellendi.
3. **Çevrim içi savaşın son doğrulaması — YAPILAMADI** (iki gerçek cihaz gerekir). 10 saniyelik arama süresindeki "TEST" işareti kaldırıldı (`AUTO_SEARCH_TEST_MS` → `AUTO_SEARCH_MS`, yorumlar "kalıcı tasarım kararı"); davranış değişmedi.
4. **Savaş modlarının bitiş kuralları — test edildi.** Dokuz modda oyuncu hiçbir şey yapmadan beklediğinde: Arena 65 sn, Kolos 71, Doruk Kulesi 56, Hikâye 63, Gökyüzü 49, Sancak 64, Karanlık Geçit 40, Gizli Bölge 50 sn'de "PORTALLARIN DÜŞTÜ" (mağlubiyet) ile bitti, kimse takılı kalmadı. Aktif oynayan bot ile Arena/Yankı/Kolos/Gizli sonuçları ödülle bitiyor (Kolos: "TAŞ KOLOSUS DEVRİLDİ" zaferi). Zaman aşımı kuralı (3:00'te portal can payı, eşitlikte 30 sn uzatma) kodda okundu; zamanlayıcı yoluyla ayrıca tetiklenmedi. **Bulgular:** (a) Yankı İstilası'nda oyuncu kart oynamadan yalnız komutanla 120 sn'de ZAFER ve ödül (+38 kredi, +2 Yankı Özü) alabiliyor; denge sorunu olarak not edildi, değiştirilmedi. (b) Aşağıdaki AFK ödül açığı.
5. **Telefon performansı ve görsel kalite — kısmen.** Dosya ~39,5 MB ve çok sayıda stil bloğu içeriyor; yeniden yapılandırma bu turda yapılmadı (risk yüksek). Önceki turlarda FPS ölçümü, otomatik 30 FPS sınırı ve FPS göstergesi eklendi. Bu turda 854×393 ve 740×360'ta Sezon Bileti, Desteler, Minyonlar, Kahramanlar, Büyüler ve Mağaza ekranları taşma/kesilme için tarandı: Sezon Bileti, Desteler, Minyonlar, Mağaza temiz; Kahramanlar/Büyüler ekranında yalnızca uzun büyü açıklamaları "…" ile kısalıyor (ÖNİZLE ile tam okunuyor). Gerçek cihaz ölçümü yapılmadı.
6. **Oyuncu ilerlemesi ve ekonomi — denetlendi, 1 açık kapatıldı.** Ödül tabloları otomatik tarandı: tanımsız minyon yok, ücretsiz yolda yalnız-bilet minyonu yok, Kupa Yolu'nda tekrarlanan parça yok. İki kaynak çakışması var (bilgi): Ana Büyücü ve Orman Okçusu parçaları hem Kupa Yolu'ndan hem ücretsiz sezon yolundan geliyor. Kupa Yolu 10.000 kupaya kadar 8.525 kredi, ücretsiz sezon yolu 7.600 kredi + 6 toz + 3 sandık veriyor. **Düzeltilen açık:** savaşı başlatıp hiçbir kart oynamadan/büyü kullanmadan bekleyen oyuncu, kaybettiği hâlde her maçta +40 kredi, +35 TP ve +45 sezon XP alıyordu (ödül çiftçiliği). Artık hareketsiz mağlubiyette kredi/TP/sezon XP verilmiyor ("Bu maçta ödül yok"); kupa kaybı aynen sürer. Aktif oynanan maçlarda ödüller değişmedi (test edildi).
7. **Google Play hazırlığı — kısmen.** (a) Android sürüm kodu 220'de kalmıştı; 228'e (3.60.228) eşitlendi. (b) GitHub Actions son 6 derleme (APK + imzasız AAB) başarılı. (c) **Yapılamayanlar:** imzalı AAB için yükleme anahtarı (UPLOAD_KEYSTORE_BASE64/PASSWORD, UPLOAD_KEY_ALIAS gizli anahtarları) yok; herkese açık gizlilik politikası ve hesap silme sayfaları taslak olarak `yayin/web/` içinde, sarı alanlar (işletici adı, destek e-postası, saklama süresi) doldurulup bir adreste yayınlanmalı; Play Console beyanları; ödeme doğrulaması (madde 1).

## Sürüm 3.60.229 — açık bırakılan bulguların düzeltilmesi
- **Sürüm:** HTML `v3.60.229` (meta + başlık), Android `versionCode 229 / versionName 3.60.229` (önceki: 228). Ayarlar → Hakkında → Sürüm "v3.60.229" gösterir.
- **Yankı İstilası ödül açığı kapatıldı:** oyuncu hiç kart oynamadan ve büyü kullanmadan yalnız komutanla 120 sn'de "ZAFER" ve ödül (+38 kredi, +2 Yankı Özü, aşama ilerlemesi) alabiliyordu. Artık böyle bir maç "YANKI İSTİLASI · HAREKETSİZ" olarak biter, ödül ve aşama ilerlemesi verilmez. Kart oynanan/büyü kullanılan maçlarda zafer ve ödül aynen sürer (test: oynayan botla +38 kredi, +2 Yankı Özü).
- **Zaman aşımı kuralı gerçekten tetiklenerek doğrulandı** (Arena, 180 sn sınırı; portal canı kontrollü ayarlanarak): öndeyken "SÜRE BİTTİ · ZAFER" (+25 kupa, +275 kredi), gerideyken "SÜRE BİTTİ · MAĞLUBİYET", eşitlikte 30 sn "UZATMA" başlıyor ve ilk portal hasarı sonucu belirliyor (testte "UZATMA · MAĞLUBİYET"). Sayfa hatası yok.
- **Kahramanlar/Büyüler ekranındaki kısalan büyü açıklamaları:** kartlar sabit yükseklikte olduğundan 3 satırda "…" ile kısalıyor; tam metin her büyünün ÖNİZLE penceresinde okunuyor. Bilerek değiştirilmedi.
- **Test:** Arena, Kolos, Gizli, Doruk Kulesi (aktif oynanan, ödüllü), Yankı (oynanan: ödüllü, boş: ödülsüz), kart silme ve bekleme odası testleri hatasız.

## Sürüm 3.60.230 — Görsel hata tarama ve toplu onarım
**Kaynak:** 229 + kullanıcının LONCA_MAGAZA_DENGE paketi (mağaza fiyatları, sezon kredi ödülleri, lonca hata mesajları; commit e64eca4). Netlify sitesine sandbox'tan erişilemedi, karşılaştırma yapılmadı; onarım güncel kaynakta yapıldı, hiçbir özellik silinmedi.

### Düzeltilenler
1. **Kupa Yolu komutan portreleri yoktu** (Vaelor 150, Theryn 400, Elyvara 700, Saelith 1.000 kupa): `af332Svg` ana betikte kapalıydı, `rdArt` bulamayınca portresiz kalıyordu. Kök neden: `af332Svg/af332DataUrl` pencereye açıldı.
2. **Minyon bulanıklığı:** 57 çekirdek minyon görseli yalnız 256 px, 6'sı 208 px idi; 209 css px'lik kartta (2× ekranda) 1,6–1,8× büyütülüyordu. Hepsi Lanczos + hafif keskinleştirmeyle 512/416 px'e çıkarıldı (HTML +~0,8 MB). Orijinal yüksek çözünürlüklü dosya depoda yok; gerçek detay eklenemez, yalnız kenar keskinliği artar. Tarama: bulanıklık uyarısı kalmadı.
3. **Kahramanlar > Ekipman (740×360 ve 667×375):** sekme çubuğu 2 satıra sarıp "Ekipman yüklemesi" başlığının üstüne biniyordu (kök neden: `afx369` kuralı `flex-wrap:wrap` + 13 px yazı). Tek satır, küçülen yazı. 667'de yuva adları "ANA…/BOŞ…" diye kesiliyordu; dar ekranda simge gizlenip ad tam yazılıyor.
4. **Netlify rozeti:** oyunun kendi kodunda yok (barındırma sitesi ekliyor). Bu tür rozet/çekmece öğelerini gizleyen CSS eklendi.

### Doğrulanan (hata bulunmayan) alanlar
- **Kupa Yolu:** 0 kupada 92 ödül + 13 kapı = 105 düğüm (106 sayısını bulamadım; 106. düğüm bu sürümde yok). Hepsi kilitli, alınmış ödül listesi boş; 150/350 "alındı" hatası bu sürümde üretilemedi. 1.100 kupada alma +925 kredi (beklenen 925), 10.300'de toplam kredi ödülü beklenenle birebir; ikinci alma değişiklik yapmıyor, kupa 300'e düşünce alınmışlar korunuyor, çift kayıt yok. Minyon kartı alma tekil. Son düğümler: 10.000 (+200) ve 10.200 (+50 sonsuz).
- **Sezon Bileti:** 30 seviye × (ücretsiz + premium), adlar Türkçe (teknik ad yok), kilitli seviye ve premiumsuz alma reddediliyor, çift/toplu alma tekil, 5.000 kredi fiyatı değişmedi, premium minyonlar yalnız seviye 5/15/25'te.
- **Mağaza:** Öne çıkan, Görünümler, Yadigârlar, Etkinlik, Sandıklar sekmeleri; her satın almada düşüş = etiket fiyatı, tek teslim; yetersiz bakiye/mühür uyarısı çıkıyor ve profil değişmiyor. Sandık süre başlat/aç ve ödül ekranı çalışıyor (4 sandıkta tek teslim).
- **Dokuz mod (bot oynadı, 854×393):** Arena, Doruk Kulesi, Yankı İstilası, Kristal Kolos, Hikâye, Gökyüzü, Sancak, Karanlık Geçit, Gizli Bölge hepsi açıldı, savaş bitti, sonuç/ödül ekranı geldi, sayfa hatası yok. DEVAM/Moda Dön sonrası siyah ekran yok (mod ekranı/menü görünüyor). Yankı İstilası adı doğru. Kolay/Normal/Zor geri eklenmedi.
- **3 boyut taraması (800×360, 740×360, 667×375):** kırık görsel yok, "GÖRSEL YOK" yok, teknik isim sızıntısı yok.

### Kalan küçük kesilmeler (667×375)
Büyü açıklaması 3 satırda "…" (tam metin ayrıntıda), Günlük görev başlığı "Savaş meydanın…", Kolos ekranında "Korvayn · SV 1" kısalıyor.

### Yapılamayanlar
Gerçek para/Play Faturalandırma, iki cihazlı çevrim içi test, imzalı AAB, Netlify karşılaştırması, gerçek telefonda performans, sunucu taraflı kupa eşleşmesi.

## Tüm minyonların savaşta tek tek sınanması (3.60.230)
**Yöntem:** Arena savaşında (başsız Chromium, 854×393) `HERO_INFO` içindeki 152 birim türünün hepsi (aktif 101 koleksiyon minyonu + 51 emekli/eski kayıt) tek tek sınandı: müttefik olarak sahaya çıkarma, ilerleme, hedefe saldırı (hasar ölçümü), canı sıfırlanınca ölüm/kalkış, düşman olarak (`af329Command`) sahaya çıkma, NaN/sayfa hatası denetimi. Gruplu kartlar (Kılıçlı Asker 2, Orman Okçusu 2, İskelet Savaşçı 3) gerçek grup yolundan (`af214SpawnSquad`) sınandı. Şifacı/özel yetenekli birimler ayrıca elle sınandı.

**Sonuç:** 152/152 birim sahaya çıktı, hareket etti ve ölüm yolunda hata vermedi; sayfa hatası ve NaN yok; 152/152 düşman olarak çıktı. İlk turda 27 birim "işaretli" çıktı, hepsi ölçüm sınırı ya da tasarım gereği olduğu için yeniden, adil koşullarla (taze savaş, yakın hedef, 22 sn) sınandı:
- 24 birim yeniden sınamada hasar verdi (yavaş birimler 9 sn'de hedefe ulaşamıyordu; Ay Okçusu ve Orman Okçusu menzilden vurduğu için ilerlemiyor).
- **Lav Kıskacı:** "yer altına dalıp rakip portalının önünde çıkar" yeteneği gereği hedefi geçip x≈0,90'a ışınlanıyor (tasarım).
- **Platinyum Işık İmparatoru, Kemik Şövalye, İskelet Savaşçı:** canı sıfırlanınca tek seferlik diriliş (tasarım); ikinci ölümde kalkıyor.
- **Gruplu kartlar:** ilk ölçüm tek birimlik yolu kullandığı için 1/2 ve 1/3 gösterdi; gerçek yoldan 2/2, 2/2 ve 3/3 çıkıyor.
- **Kristal Şifacı:** emekli kayıt (aktif koleksiyonda yok), iyileştirme yeteneği tanımlı değil, dengeli saldırgan; adı yanıltıcı.
- **Işık Şifacısı:** yaralı dosta can veriyor (doğrulandı).
- **Özel yetenekler:** Alize Bıçaklı geri itme (düşman her vuruşta ilerisine itiliyor), Kül Mandası yutma (içerideki düşmanın canı sürekli azalıyor), Ayaz Kalkanlısı siperde yerinden oynamıyor ve hasar almıyor, Lav Kıskacı ışınlanma: çalışıyor.
- **Görseller:** koleksiyon listesinde 100 görsel, hepsi yüklendi (bozuk 0, teknik ad yok); 152 birimin savaş çizimi alındı. 51 eski kayıt türünün 19'unda özel savaş çizimi yok ve genel mavi şövalye çizimiyle sahaya çıkıyor; bu türler `AF3406_RETIRED_CARD_IDS` ile oyuncu destesinden/koleksiyondan çıkarılmış, yalnızca eski kayıt uyumluluğu için duruyor.

**Sınırlar:** her yeteneğin görsel/ses efekti ayrı ayrı gözle incelenmedi (önceki turlarda yapıldı); testler bot/komut tabanlıdır, gerçek dokunmatik oyun değildir.

## Sürüm 3.60.231 — Kupa Yolu komutan portreleri Kahramanlar ekranıyla aynı boyalı görsel
**Sorun (kullanıcı ekran görüntüsü):** Kupa Yolu'ndaki Vaelor/Theryn kartı ve "Kilitli ödül" penceresi eski düz vektör çizimi gösteriyordu; Kahramanlar ekranı ise boyalı yeni portreyi (`commander.portrait.<id>`) kullanıyor. 3.60.230'daki "portre yok" onarımı `af332Svg` (eski vektör) fonksiyonunu açmıştı.
**Kök neden/düzeltme:** `rdArt` artık önce Kahramanlar ekranıyla aynı kaynaktan (`AFArt.get('commander.portrait.'+id)`) boyalı görseli alıyor; yalnız bulunamazsa vektör çizime düşüyor. Kart ve önizleme penceresinde doğrulandı (IMG). Kupa Yolu alma/çift teslim testi, 105 düğüm, Arena ve Kolos savaşı yeniden koşuldu: sorun yok.

## Sürüm 3.60.232 — Sezon etkinlikleri: haftalık gerçek hedefler + sezon rütbe ödülleri
**Eksik (kullanıcı bildirimi):** "28 günlük takvim var, ancak haftalara bağlı gerçek etkinlik hedefleri ve sıralama ödülleri eksik." Lonca & Etkinlik Merkezi'ndeki takvim sunucudan gelen salt-okunur etiketlerdi.
**Yapılan (yerel, sunucusuz, `arenaForgeProProfileV19` anahtarı aynı; profilde ek `afpSeasonEv` alanı):**
- **Görev ve Etkinlik → SEZON ETKİNLİĞİ sekmesi:** 4 hafta × 3 hedef + hafta bonusu. H1 Arena Isınması (5 savaş, 3 zafer, 25 birlik), H2 Mod Gezgini (3 farklı mod, 5 zafer, 30 yok etme), H3 Büyü Ustası (15 büyü, tek kişilik modlarda 2 zafer, 8 savaş), H4 Sezon Finali (8 zafer, 60 birlik, 4 farklı mod). Ödüller: kredi, etkinlik mührü, minyon parçası, Yadigâr Tozu, sandık (Basit/Usta/Delüks).
- **Takvime bağlı:** hafta, sezon başlangıcından (28 gün) hesaplanır; gelecek hafta kilitli ("N gün sonra açılır"); haftalık sayaçlar yalnız o haftanın günlerinde artar; geçen haftanın ödülleri sezon sonuna kadar alınabilir; sezon dönünce her şey sıfırlanır.
- **Gerçek ilerleme:** savaş sonunda mevcut ödül akışına bağlı kanca (`afpSeRecord`); hareketsiz kayıp, pes ve antrenman SAYILMAZ (AFK sömürüsü yok).
- **Sıralama ödülleri = yerel rütbe:** Sezon Etkinlik Puanı (SEP, alınan hedeflerden türetilir, en çok 2.000) → Bronz/Gümüş 250/Altın 600/Kristal 1.000/Usta 1.500/Efsane 2.000 rütbeleri, her birinin tek seferlik ödülü.
- **Güvenlik:** her ödül sezon başına bir kez; kayıt başarısızsa geri alınır; sandık yuvaları doluysa +175 kredi telafisi (Sezon Bileti ile aynı kural).
- **Lonca & Etkinlik Merkezi** sezon sekmesindeki yanıltıcı metin düzeltildi ve "SEZON ETKİNLİĞİNİ AÇ" düğmesi eklendi.
**Test:** erken/gelecek hafta alma reddi; çift alma reddi; hafta bonusu 3 hedef alınmadan reddi; 2.000 SEP'e kadar tüm hedef+rütbe alma (kredi/toz/sandık/mühür/parça doğru, sandık taşması telafili); yeniden yüklemede kalıcılık; sezon dönüşünde sıfırlanma; gerçek bot savaşı sayaçları artırdı (savaş 1, birlik 6, yok etme 3, büyü 4, mod "arena"); hareketsiz savaş sayaç artırmadı; AL düğmesine gerçek dokunuş (+150 kredi, +100 SEP); 800×360 ve 667×375 ekran görüntüleri; dokuz mod yeniden koşuldu, hata yok.
**Yapılamayan (açıkça):** oyuncular arası gerçek sıralama (liderlik tablosu) ve onun ödülleri sunucu doğrulamalı sonuç sistemi gerektirir; sunucu kodu depoda yok. Bu yüzden rütbe yerel SEP'e dayanır, "sıralamadaki yerin" diye gösterilmez. Ekonomi: sezon başına en çok ~1.650 kredi + 5 sandık + 6 toz + 3 parça türü + 100 mühür ek kazanç (Sezon Bileti ücretsiz yolu 7.600 kredi); gerekirse dengelenebilir.

## Sürüm 3.60.233 — Ana hikâye: «Altıncı Mühür» (savaşın nedeni ve büyücülerin geçmişi)
**Eksik (kullanıcı bildirimi):** 5 kitap / 250 aşama vardı ama büyücülerin geçmişini ve savaşın nedenini anlatan bütünlüklü hikâye yoktu (yalnız kitap/bölüm adları ve kahraman adı).
**Eklenen (yalnız metin/arayüz; savaş kuralı, ödül ve kayıt şeması değişmedi, kayıtta ek `afpStory` alanı):**
- **Hikâye:** Kadim Ocak'ın kalbi çatladığında beş büyücü beş mühürle kapattı; altıncı büyücü Mirael çatlağı kendi canıyla kapatmayı önerdi, Meclis korkuyla onu Kadim Kapı'ya mühürleyip adını sildi; yarım kalan büyü ve silinen ad Yankıları doğurdu. Kitap 1 Korvayn (suçluluk ve altıncının keşfi), 2 Elyvara (adı silen el), 3 Vaelor (Kapı ve yemin), 4 Saelith (Yankı'nın doğası ve tam gerçek), 5 Theryn (uzlaşma, adın geri söylenmesi, Altı Mühür). Prolog + 25 bölüm × 4 sayfa (giriş, 2 yol notu, bölüm sonu) + epilog = 102 sayfa; 5 büyücü geçmişi; 5 «Savaşın Nedeni» kaydı. Büyücü adları/rolleri oyundaki kahraman verisiyle uyumlu. Tam metin: `yayin/ANA_HIKAYE.md`.
- **Gösterim:** savaştan önce (aşama 1, 4, 7 + ilk açılışta prolog) ve boss savaşı kazanıldıktan sonra (aşama 10; 250'de epilog) bir kez; tüm sefer başlatma yolları (dünya paneli, mod ekranı, Tekrar Oyna) kapsanır.
- **Hikâye Defteri:** sefer kartında ve mod ekranında; sekmeler: Savaşın Nedeni, Büyücülerin Geçmişi (ilerlemeye göre açılır, spoiler korumalı), Bölümler (ulaşılan sayfalar yeniden okunur). «Hikâye pencereleri: AÇIK/KAPALI» anahtarı.
**Test:** ilk başlatmada prolog+giriş sonra savaş başlıyor; aşama 4/7/11 doğru sayfayı gösteriyor, ikinci kez göstermiyor, yeniden yüklemede kalıcı; boss zaferinden sonra bölüm sonu, 250'de bölüm sonu + epilog; hikâye penceresi gerçek UI yolundan (HİKÂYE SEFERİ → savaş) savaşı bozmadan çalıştı; 800×360 ve 667×375'te okuyucu/defter ekran görüntüleri; dokuz mod yeniden koşuldu, hata yok.
**Sınır:** hikâye metnini ben yazdım; ton/isim tercihlerin varsa metin tek dosyada (`AFP_STORY` betik bloğu / `yayin/ANA_HIKAYE.md`) kolayca değiştirilebilir. Aşama başına ayrı (250) hikâye satırı yok; her bölümde 4 sayfa var. Oyun içi sinematik/seslendirme yok.

## Sürüm 3.60.234 — Hikâye konuşmaları ve büyük final
**Eksik (kullanıcı bildirimi):** bölüm başlangıcı, boss karşılaşması ve bölüm sonu konuşmaları ile beş kitabı birbirine bağlayan büyük final/kapanış anlatımı yoktu (3.60.233'te yalnız anlatım sayfaları vardı).
**Eklenen (yalnız metin/arayüz; savaş kuralı, ödül, kayıt şeması aynı):**
- **Konuşma sahneleri:** 25 bölümün her birinde konuşmacılı 3 sahne = 75 sahne, 310 konuşma satırı: bölüm başlangıcı (aşama 1, girişten sonra), **boss karşılaşması (10. aşama, boss savaşından ÖNCE; 250'de Yankı Hükümdarı)** ve bölüm sonu (boss zaferinden sonra). Konuşmacılar: Korvayn, Elyvara, Vaelor, Saelith, Theryn, Mirael, Sen (Çırak) ve her bölümün boss'u (kırmızı ad). Sol panelde konuşanın boyalı portresi; boss/Mirael için simge.
- **Büyük Final (250. aşama sonrası, 10 sayfa):** beş hatıra parçası (Kor Mührü, Zaman Mekiği, Gök Zırhı, Ses Kabuğu, Kök Tohumu) birleşir; Mirael ve Beşler konuşur; **«Beş Kitap, Tek Yemin»** sayfası kitapları bağlar (hatırla–onar–dinle–kabul et–söyle; altıncı adım: paylaş); Altı Mühür kurulur, Ocak yanar, vedalar, kapanış anlatımı ve «Son Söz».
- **Bağlantı iplikleri:** her kitapta büyücünün verdiği parça (bölüm sonu konuşmalarında) finalde birleşir; 5. kitapta Beşler yeniden bir araya gelir.
- **Hikâye Defteri:** her bölüm için Giriş / Konuşma / Yol 1 / Yol 2 / Boss / Sonuç / Son konuşma düğmeleri, Büyük Final düğmesi (toplam 177 sayfa). Ulaşılan sayfalar yeniden okunur.
**Test:** ilk başlatma (prolog → giriş → başlangıç konuşması → savaş); 10. aşama öncesi boss konuşması (2 sayfa) sonra savaş; zafer sonrası bölüm sonu + son konuşma; 250: boss konuşması → zafer → bölüm sonu → konuşma → 10 sayfalık final; hiçbir sayfa 667×375'te kaydırma gerektirmiyor; defterden boss/final okuma ve geri dönüş çalışıyor; hikâye penceresi gerçek UI yolundan savaşı bozmadı; Arena, Kolos, Yankı, Doruk Kulesi ve Hikâye modları hatasız bitti.
**Sınır:** metinleri ben yazdım; ton/isim değişikliği için tek kaynak `AFP_STORY` betik bloğu ve `yayin/ANA_HIKAYE.md`. Konuşmalar yazılı sahnedir (sesli/animasyonlu değil); savaş sırasında oyun içi konuşma balonu yok, boss konuşması savaştan hemen önce gösterilir.

## Sürüm 3.60.235 — Yeni oyuncu rehberi (ilk savaştan sonra sandık → deste → kart geliştirme → Kupa Yolu)
**Eksik (kullanıcı bildirimi):** ilk savaştan sonra sandık açma, deste kurma, kart geliştirme ve Kupa Yolu'nu sırayla öğreten bütünleşik ilerleme rehberi yoktu (savaş içi eğitim kapalıydı, ilk savaş sonrası yönlendirme yoktu).
**Eklenen (yalnız arayüz/yönlendirme; savaş kuralı ve ödül tabloları aynı, profilde ek `afpGuide` alanı):**
- **Sıralı 4 adım, gerçek ilerleme izlenir:** (1) SANDIK AÇ: sandık gerçekten açılınca ilerler; hazır sandık yoksa eldeki sandık hazır yapılır, hiç sandık yoksa tek bir başlangıç sandığı verilir (bekleme yok). (2) DESTE KUR: deste gerçekten değişince ya da DESTEM HAZIR ile ilerler. (3) KART GELİŞTİR: bir kart gerçekten güçlenince (rün/seviye değişimi) ilerler. (4) KUPA YOLU: bir ödül alınınca ya da ANLADIM ile biter.
- **Yönlendirme:** üstte kompakt kart (adım noktaları, ne yapılacağı) + dokunulacak düğmenin etrafında altın halka (ana ekrandaki SANDIKLAR/DESTELER/MİNYONLAR/KUPA YOLU, sandık odasında SANDIĞI AÇ, minyonlarda GÜÇLENDİR, Kupa Yolu'nda alınabilir ödül). Yanlış ekranda «GERİ ile ana ekrana dön» der. Savaşta, hikâye penceresinde ve sandık/ödül pencerelerinde gizlenir.
- **Başlatma:** yalnız yeni hesap (1–5 savaş) ilk savaştan sonra ana menüye dönünce otomatik başlar; eski hesaplarda başlamaz. Kalıcıdır (yeniden yüklemede kalınan adımdan sürer). ADIMI ATLA / KAPAT her an var; Menü → BAŞLANGIÇ REHBERİ ile yeniden başlatılır.
- **Bitirme ödülü:** dört adım gerçekten tamamlanırsa tek seferlik +300 kredi (hepsi atlanırsa ödül yok; yeniden başlatınca tekrar verilmez).
**Test:** yeni hesapta ilk savaş (bot) → kart çıktı; sandık adımı (açılışta gizlendi, açınca ilerledi), deste (DESTEM HAZIR), kart geliştirme (gerçek GÜÇLENDİR dokunuşu algılandı), Kupa Yolu (ANLADIM) → bitiş kartı +300 kredi (250→...→bonus doğru, ikinci kez yok); kıdemli hesapta otomatik başlamadı; Menü'den yeniden başlatma; ADIMI ATLA ve KAPAT yeniden yüklemede kalıcı; 800×360 ve 667×375 ekran görüntüleri; Arena, Yankı, Kolos, Doruk Kulesi, Gökyüzü ve Hikâye hatasız bitti.
**Sınır:** deste adımında kart sürükleme/seçimi yönlendirilir ama hangi kartı seçeceğini oyuncu belirler; halka bazı ekranlarda hedef düğme yoksa gösterilmez (yalnız kart metni kalır). Gerçek telefon dokunuş denemesi yapılmadı; testler başsız tarayıcıda.

## Sürüm 3.60.236 — Savaş içi öğretici (halka + kart, ana ekran rehberiyle aynı sistem)
**İstek:** savaş içi öğretici de yapılsın; dokunulacak düğmeye halka konsun, aynı rehber sistemi kurulsun. (Eski savaş eğitimi 3.40.61'den beri kapalıydı.)
**Eklenen (arayüz/yönlendirme; savaş kuralı ve ödüller aynı):**
- **4 adım, gerçek eylem algılanır:** (1) BİRLİK ÇIKAR: hazır (mavi) kartın etrafında altın halka + soldaki koridorda mavi kesikli bırakma kutusu; kart gerçekten sahaya çıkınca ilerler. (2) ENERJİ: enerji göstergesi halkalı, ANLADIM ile. (3) BÜYÜ: komutan büyüsü düğmesi halkalı (bekleme bitince); büyü gerçekten kullanılınca ilerler. (4) AMAÇ: düşman portal çubuğu halkalı, ANLADIM ile. Bitince «Savaş öğreticisi tamam» kartı 5 sn görünür.
- **Düşman bekler:** adım 1'de (ilk kart çıkana kadar, en çok 25 sn) rakip birim çıkarmaz (eski `af35TutorialHold` mekanizması). Doğrulandı: öğreticide ilk ~24 sn düşman 0, kontrol savaşında 3+.
- **Kart sağ altta**, ses/duraklat/çıkış düğmelerini ve kart-at alanını örtmeyecek genişlikte; savaşı kapatmaz (dokunuşlar geçer).
- **Başlatma:** yalnız yeni hesabın İLK savaşında otomatik (çevrim içi eşleşmelerde değil, rehber bekleyen hesapta hariç); atla/kapat her an; **ayar penceresindeki «Eğitimi tekrar aç»** artık bu öğreticiyi başlatır (eski gizli panel yerine) ve **Menü → SAVAŞ ÖĞRETİCİSİ** bir sonraki savaşa öğreticiyi ayarlar. Durum kalıcı (`afpGuide.bt`).
- Güç seçimi (RÜN ZIRHI), duraklatma/ayar, bitiş ekranı, hikâye ve sandık pencereleri açıkken gizlenir.
**Test:** ilk savaşta gerçek sürükle-bırak ile kart çıkarma → enerji → büyü (bekleme bitince dokunma) → amaç → tamam; 800×360 ve 667×375 ekran görüntüleri; kıdemli hesapta savaşta öğretici yok; ayar penceresi tekrar düğmesi (eski öğretici panel gizli kaldı); ATLA/KAPAT; Menü düğmesi bir sonraki savaşta öğreticiyi başlattı; ana ekran rehberi testi aynen geçti; Arena, Yankı, Kolos, Doruk Kulesi, Karanlık Geçit, Gizli Bölge ve Hikâye hatasız bitti.
**Sınır:** arena eşleşmesi çevrim içi gibi davrandığından orada duraklatma kapalı (oyunun kuralı); bu yüzden ayar penceresindeki tekrar düğmesi PvE modlarında pause menüsünden erişilir. Test ortamında savaş benzetimi ilk ~30 sn gecikmeli başlıyor (gerçek telefonda anında). Gerçek telefon dokunuşu denenmedi.

## Sürüm 3.60.237 — Sandık sayaçları "çok erken açılıyor" hatası
**Bildirim:** sandık süreleri çok erken açılıyor.
**Kök neden:** sandık sayacı «güvenilir saat» (`trustedNow`, geri alınmaya karşı korumalı; uygulama kapalıyken gelen her kapanma aralığında en çok 5 dk ilerler) ile tutuluyor, ama ana ekran sandık düğmesi/«AÇ!» yazısı, hazır rozeti, ana ekran modülü ve bildirim planı gerçek saatle (`Date.now`) karşılaştırıyordu. Uygulama bir süre kapalı kalınca iki saat birbirinden uzaklaşıyor: örn. 3 saat kapalı kaldıktan sonra güvenilir saat yalnız +5 dk ilerliyor; o andan sonra başlatılan 2 saatlik sandık, gerçek saatle karşılaştırıldığı için ana ekranda HEMEN hazır görünüyor (rozet yanıyor, bildirim erken planlanıyor), sandık odasında ise 2 sa 00 dk kalıyor.
**Düzeltme:** ana ekran sandık düğmeleri, «hazır» rozeti, yeni ana ekran modülü (rozet ve üstteki sandık) ve bildirim planı artık aynı güvenilir saati kullanıyor (`window.__afpTrustedNow`); yeni oyuncu rehberinin sandığı da aynı saatte hazırlanıyor. Sandık sürelerinin kendisi (Basit 10 dk, Usta 30 dk, Delüks 2 sa) değişmedi.
**Test:** 3 saat kapalı kalma simülasyonu — önce: yeni 2 saatlik sandık ana ekranda hazır rozetli; sonra: rozet gizli, ana ekran ve sandık odası aynı süreyi gösteriyor (1 sa 49 dk); sandık açma akışı, rehber ve Arena/Kolos/Doruk Kulesi regresyonu temiz.
**Açık karar:** güvenilir saat (kurcalama koruması) uygulama kapalıyken geçen süreyi ~5 dk ile sınırlıyor; yani sandık süresi yalnız uygulama AÇIKKEN ilerliyor. Gerçek saatle (kapalıyken de) işlemesi için bu koruma gevşetilmeli (kurcalama riski artar); karar bekliyor. Süreleri uzatmak da ayrı karar.

## Sürüm 3.60.238 — Sandık süreleri uzatıldı + kapalıyken de işler
**Karar (kullanıcı «uygun olanı yap» dedi):** (1) süreler uzatıldı, (2) sayaç uygulama kapalıyken de gerçek saatle işler.
- **Yeni süreler:** Basit Sandık 10 dk → **30 dk**, Usta Sandık 30 dk → **2 saat**, Delüks Sandık 2 sa → **6 saat** (`CHEST_TYPES`). Zaten başlamış sandıklar kendi bitiş zamanını korur; başlamamışlar yeni süreyi kullanır. Sandık odası bilgi metni güncellendi.
- **Kapalıyken işleme:** güvenilir saat (`trustedNow`) artık uygulama kapalıyken geçen gerçek süreyi sayar (tek gözlemde en çok 12 saat); saat GERİ alınırsa yine ilerlemez (doğrulandı: 5 sa geri alma süreyi değiştirmedi). **Bilinen risk:** cihaz saatini ileri almak sandığı bitirebilir (tek gözlemde en çok 12 saat; ≤6 saatlik sandıkları tamamen bitirir). Tek kişilik çevrim dışı oyunda bu risk bilinçli kabul edildi; kupa/ödül doğrulaması sunucu tarafında yapılacaksa orada ele alınmalı.
- **Tek seferlik geçiş:** eski sürümlerde güvenilir saat geride kalmıştı; ilk açılışta başlamış sandıkların zamanları aynı farkla kaydırılıp saat gerçek saate eşitlenir — kalan süre değişmez (doğrulandı: 30 dk kalan → 30 dk).
**Test:** süreler 30/120/360 dk; Delüks başlatınca oda «6 sa 00 dk»; 3 sa kapalı → «2 sa 59 dk»; 7 sa sonra rozet yanar, «SANDIĞI AÇ» çalışır, sandık açılır; geri alma ve ileri alma davranışı; geçiş testi; sandık açma akışı (30 dk/2 sa/6 sa sayaçları), rehber, Arena/Yankı/Kolos/Doruk Kulesi/Hikâye hatasız.

## Sürüm 3.60.239 — İlk açılış akışı (FTUE): hikâye girişi → ücretsiz minyon → sürükle-bırak savaşı → portal → sandık → deste → ana üs
**İstek:** 15–20 sn geçilebilir hikâye girişi; ücretsiz minyon; sürükle-bırak öğretimi; portal yıkılır, ilk sandık açılır; deste düzenleme gösterilir, oyuncu ana üsse geçer.
**Akış (yalnız hiç savaşmamış yeni hesapta, ilk açılışta ana ekrana gelince):**
1. **Giriş sahnesi (≈17,8 sn, ATLA › her an):** 4 tam ekran sahne (Ana Üs, sefer, karanlık geçit, arena görselleri; yavaş yakınlaşma, alt yazı, ilerleme çubuğu): Kadim Ocak → çatlak ve beş mühür → mühürler çatlıyor, «Mirael» fısıltısı → «Sen Ocak Çırağısın». Dokununca sahne atlanır.
2. **Ücretsiz minyon:** Çift Kılıçlı (2 enerji, başlangıç destesinde yok) hediye ekranı; «AL VE SAVAŞA BAŞLA» ile koleksiyona eklenir ve destenin ilk kartı olur.
3. **Kontrollü ilk savaş:** yerel bot düellosu (eşleşme/VS yok, çevrim içi değil). Hediye minyon elde ilk kart; rakip birim çıkarmaz; düşman portalı 110/430 canla başlar. Halka + mavi bırakma kutusu: «kartı basılı tut, koridora sürükle-bırak». Kart çıkınca 2. adım: «portalı yıkmasını izle». Portal ~10–12 sn'de yıkılır, zafer ekranı.
4. **İlk sandık:** zaferden sonra ana ekrandaki rehber sandığı hazır verir (bekleme yok), SANDIKLAR halkalı; açılınca ödül.
5. **Deste:** «Ücretsiz Çift Kılıçlı destenin ilk kartı; kartları değiştir, DESTEM HAZIR» → GERİ ile **ana üs** → rehber kart geliştirme ve Kupa Yolu adımlarıyla sürer (önceki sürümlerdeki rehber).
**Güvenlik/uç durumlar:** eski hesaplarda (≥1 savaş) hiç çıkmaz; savaş başlamadan uygulama kapanırsa giriş baştan; KAPAT ile akış bırakılabilir (düşman beklemesi kalkar); QA için `localStorage afpFtueOffV1=1` akışı kapatır (test araçları varsayılan olarak kapatır).
**Test:** giriş sahneleri sırayla (≈19,5 sn saat dahil) ve ATLA; hediye ekranı; hediye destenin ilk kartı ve el'in ilk kartı; sürükle-bırak ile kart çıkarma; portal 110→20→0 ve zafer; DEVAM → ana üs → sandık (hazır, açıldı) → deste adımı → ana üs; 800×360 ekran görüntüleri; yarıda kapanma; ana ekran rehberi, savaş içi öğretici, Arena/Kolos/Yankı/Doruk Kulesi/Hikâye hatasız.
**Sınır:** giriş yalnız görsel+yazı (ses/animasyonlu karakter yok); ilk savaş eşleşmesiz yerel bot düellosu olduğu için kupa/sezon ödülü vermez (sandığı rehber verir); gerçek telefon dokunuşu denenmedi.

## 3.60.240 — Kupa sıralaması güvenliği (sunucu otoritesi)

**İstek:** Oyuncunun sıralama kupasını değiştirmesini tamamen engelleyen sunucu kontrolü eksikti.

**Kök neden:** Sıralamadaki kupa istemciden geliyordu (`afp_social_me(p_trophies)`, bulut `save_data`). Yerel kayıt düzenlenerek sıralama sahtelenebilirdi.

**Yapılan:**
- `yayin/sunucu/01_kupa_otorite.sql` — yazılamaz sunucu defteri (`afp_player_trophies`, `afp_trophy_ledger`), RLS + yetki geri alma, `afp_trophy_me/seed_me/leaderboard`, yalnız `service_role` çağırabilen `afp_trophy_settle` (idempotent, eşleşme aralığı, en kısa süre, aynı rakip 24 sa/3, günlük +250, 0..20000).
- `yayin/sunucu/03_wss_kupa_isle.js` — WSS sunucusunun iki koltuk uyuşunca çağıracağı settle; `04_…kilitle.sql` — canlı şema için şablon; `yayin/SUNUCU_KUPA_OTORITESI.md` — tasarım + kurulum adımları + sınırlar.
- İstemci: `afp_social_me`'ye kupa artık **gönderilmez**; dünya sıralaması önce `afp_trophy_leaderboard` (sunucu defteri, 🔒), yoksa eski sıralamaya düşer; bir kerelik, sunucuda en çok 300 ile sınırlı devir (`afp_trophy_seed_me`).

**Test:**
- Yerel PostgreSQL 16, Supabase rolleri taklit: `02_kupa_otorite_test.sql` **28/28 GEÇTİ** (oyuncu UPDATE/INSERT/SELECT/DELETE ve settle çağrısı reddedilir, anon reddedilir, tohum 300 sınırı ve tek kullanım, idempotency, ters taraf reddi, aralık/süre/öz-maç/çiftçilik/günlük sınır, negatife düşmeme, sıralama sunucu kupasından, defter tutarlılığı; dosya iki kez çalıştırıldı = idempotent).
- WSS parçası: sahte (mock) ile 3/3 (kazanan/kaybeden eşlemesi, onaysız reddi, beraberlik).
- İstemci (sahte Supabase, headless): `p_trophies` null; profil kupası 9999 iken sunucuya kupa gitmez; sıralamada sunucu değeri (777) görünür, hileli 55555 görünmez; fonksiyon yokken eski sıralamaya düşer; tohum yalnız 1 kez; sayfa hatası yok. Açılış testi hatasız; FTUE giriş→hediye aşaması çalışıyor.

**TEST EDİLEMEYEN / YAPILAMAYAN (dürüst not):**
- Canlı Supabase ve `arena-forge-online-server` bu depoda/ortamda yok → SQL'in **canlıya uygulanması, `afp_social_me`/`afp_leaderboard`/profil tablosunun kilitlenmesi ve WSS'e settle bağlanması sahibi tarafından yapılmalı**. Yapılana kadar sıralama güvenliği fiilen sağlanmış sayılmaz.
- `04_…kilitle.sql` canlı şemaya bakılmadan yazılmış şablondur, doğrulanmadı.
- Çevrimdışı/yerel kupa cihazda düzenlenebilir (sıralamayı etkilemez). Anlaşmalı çevrim içi maçlar yalnızca yavaşlatılır, tamamen yok edilemez.

## 3.60.241 — Sunucu kupa kararını istemciye işleme + kalıcı hile kaydı (sunucu 3.60.103)

**Oyun (bu depo):** çevrim içi maç sonunda sunucudan gelen `trophy_update` işlenir. Sunucu kupa yazdıysa yerel tahmin yerine sunucunun `after` değeri (0–20000) yazılır; sunucu yazmadıysa (`ok:false`) yerel tahmin geri alınır; başka odanın, `authoritative` işaretsiz veya geçersiz mesajlar yok sayılır; sonuç ekranı yazılmadan gelen karar bekletilir. `battle_result.trophyPending` true ise bağlantı karar gelene kadar (en çok 6,5 sn) açık tutulur.
- Test (headless, 9/9): sunucu kupası yereli ezer (520→480), ret → geri al (520→500), yabancı oda/işaretsiz/geçersiz yok sayılır, erken gelen bekletilir, üst/alt sınır, sayfa hatası yok. Açılış hatasız; v240 kupa-güvenliği testi (18/18) yine geçti.

**Sunucu (`arena-forge-online-server`, dal `claude/trophy-client-and-persistent-anticheat`, commit 61a688e, PR açılmadı):** `anticheat_store.js` + `sunucu/05_antihile_kayit.sql` (ödül/şüpheli kaydı kalıcı, açılışta 24 sa geri yükleme, DB yoksa bellek moduna düşer), `battle_result.trophyPending`, CI güncellendi.
- Test: `npm test` 8 birim (eşleşme 4 + kalıcı kayıt 4) + gerçek WebSocket + sahte Supabase uçtan uca (yetki AÇIK: iki oyuncu eşleşir, rakip pes eder, sonuçlar uyuşur → `trophyPending:true`, `trophy_update` +25/125 ve −20/80, tek `afp_trophy_settle` çağrısı, ödül kaydı yazıldı; yetki KAPALI: `trophyPending:false`, settle çağrılmaz). Mutasyon denemesi: `trophyPending` bozulunca test **kaldı**.

**Test edilemeyen:** canlı Supabase/Render (SQL uygulanmadı, bayrak kapalı), iki gerçek cihaz, gerçek ağ gecikmesinde 6,5 sn bekleme penceresi. Savaş hasarının sunucuda hesaplanması yapılmadı. Ayrıntılı madde durumu: `yayin/EKSIK_OZELLIK_DURUMU.md`.

## Kupa otoritesi — canlı şema entegrasyonu (SQL/dokümantasyon, oyun HTML'i değişmedi, sürüm 3.60.241 kaldı)
- Canlı Supabase salt-okunur incelendi: `afp_players.trophies` istemciden yazılabiliyor, `afp_leaderboard` ondan sıralıyor; yeni kupa nesneleri yok.
- `sunucu/06_canli_entegrasyon.sql` (afp_social_me kupayı yok sayar, afp_leaderboard defterden sıralar, tetikleyici ile yansıtma, mevcut oyuncuları 300 sınırıyla deftere alma) + `08_geri_alma.sql` yedeği.
- Yerel PostgreSQL 16, canlı şemayı taklit eden test: **15/15** (07) + 01 testi **28/28** (02). Sahte 999999 kupa 300'e sınırlandı, `afp_social_me(p_trophies=1000000)` kupayı değiştirmedi, yasaklı oyuncu sıralamada yok, settle sonrası `afp_players.trophies` yansıdı.
- **CANLIYA UYGULANAMADI:** verilen anahtar salt-okunur (`cannot execute CREATE TABLE in a read-only transaction`). Canlı veritabanında hiçbir değişiklik yapılmadı.
