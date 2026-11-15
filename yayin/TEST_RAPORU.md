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
