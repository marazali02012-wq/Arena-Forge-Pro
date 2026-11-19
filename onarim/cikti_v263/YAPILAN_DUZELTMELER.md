# Yapılan düzeltmeler — v3.60.262 → v3.60.263

- **Kaynak:** `onarim/cikti/ARENA_FORGE_PRO_v3.60.262.html`. Dokunulmadı; SHA-256 `0112308a…b06bef`.
- **Çıktı:** `onarim/cikti_v263/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html`, 46.660.034 bayt. SHA-256 `ee82f7fbc166fe0dab2b8650689a42e5441f56535af228baa27eca222ce5c558`.
- **Nasıl üretildi:** `python3 onarim/araclar/patch_v263.py <v262.html> <çıktı.html>`. Yama 20 değişiklik uygular. Her değişiklik kaynakta tam bir kez geçen bir metne bağlıdır. Kaynak SHA'sı farklıysa yama hiçbir şey yazmadan durur.
- **Değişmeyenler:** Kayıt anahtarı (`arenaForgeProProfileV19`), savaş kuralları, hasar ve portal değerleri, ödül miktarları, sürükle-bırak sistemi ve çevrim içi kod.

Etiketler:
- **DÜZELTİLDİ:** Kod değişikliği yapıldı ve tarayıcıda ya da çalıştırılabilir testle doğrulandı.
- **İNCELENDİ:** Araştırıldı; kod değişikliği gerekmedi.

---

## A. Pes etme = mağlubiyet — **DÜZELTİLDİ**

**Önceki durum (ölçüldü):** "Savaştan çık → Evet, çık" sonrası profilde **hiçbir kayıt** değişmiyordu. Kule, Kampanya, Gökyüzü, Sancak, Kolosus, Arena, Karanlık Geçit ve Gizli Bölge'de durum aynıydı; pencere ise "mağlubiyet sayılacak" diyordu. Gizli Bölge'de kaybetmek üzere olan oyuncu pes ederek "Gölge Yolu" sıfırlamasından kaçabiliyordu. Yankı İstilası pes'i zaten kendi kaydında yenilgi sayıyordu.

**Kök neden:** `af274ExitBattle`, `endGame`'i `{suppressRewards, forfeit}` ile çağırıyor. Her kayıt katmanı bu iki işareti görünce yazmayı tamamen atlıyordu:
- genel istatistik (`grantProgression` / `af328RecordBattle`),
- mod defteri (`afpApplyModeSpecificRewardV37858`),
- kampanya, Gökyüzü/Sancak (`af36`), Kolosus/Örümcek (raid motoru),
- Gizli Bölge (`af35AfterMatch`).

**Düzeltme:**
1. `af274ExitBattle` maç bağlamını (mod, aşama, bayrak skoru vb.) `endGame`'den **önce** yakalıyor. Maç ödülsüz bitiyor. Ardından `af263ForfeitRef('record')` normal bir yenilginin yazdığı kayıtları yazıyor:
   - genel istatistik ve maç geçmişi (geçmiş girdisinde `forfeit:true`);
   - mod defteri (lobideki ZAFER/MAĞLUBİYET/SERİ sayaçları);
   - kampanya, Gökyüzü ve Sancak kayıtları, Kolosus/Örümcek kademesi;
   - **Gizli Bölge'de yolun sıfırlanması.**
2. **Yazılmayanlar:**
   - ödül (kredi, TP, sandık);
   - **günlük/haftalık görev ilerlemesi:** `af328RecordBattle(outcome, {noQuest:true})`;
   - `profile.battles`: meydan okuma ödülleri bu sayaçtan okunduğu için. Böylece "başlat-pes et" ile görev veya ödül toplanamaz.
3. **Hariç tutulanlar:**
   - eğitim / ilk açılış savaşı;
   - çevrim içi maç (sonucu sunucu belirler; hükmen mağlubiyet bildirimi mevcut `AFPOnlineSyncV68.endGate` yolunda, dokunulmadı);
   - Lonca baskını (sunucu doğrulamalı);
   - Yankı İstilası (kendi kaydı zaten yapıyor).
4. **Aynı maç iki kez yazılmaz:** `af330Match.id` her maç için tekildir; aynı kimlikle ikinci kayıt reddedilir.
5. Dereceli düelloda/Arena'da pes kupa cezası **değişmedi** (önceden de düşülüyordu).

**Test (Chromium, gerçek akış: lobi → savaş → X → Evet, çık):**
- **Kule, Kampanya, Gökyüzü, Sancak, Kolosus, Arena, Karanlık Geçit, Gizli Bölge:** her birinde yenilgi genel istatistiğe ve mod kaydına yazıldı. Ödül yok, görev ilerlemesi yok. Arena ve Karanlık Geçit'te −10 kupa (önceki kural).
- **Yankı:** değişmedi, kendi kaydında yenilgi.
- **Gizli Bölge aşama 2/3'te pes:** yol 1/3'e sıfırlandı. "Evet"e iki kez tıklayıp çıkışı üçüncü kez de tetikleyince yenilgi **bir kez** yazıldı.
- **Sayfa yenileme:** Kule savaşı ortasında yenileme sonuç yazmadı. Dereceli Arena ortasında yenileme yalnız var olan "terk" kupa cezasını (−10) uyguladı; sahte zafer ya da yenilgi yok.
- **Kod testi:** `test_v263.js` içinde 3 test.

**İstemci tarafı hile:** Kayıt elle değiştirildiğinde var olan kayıt mührü (`arenaForgeProSealV1`) durumu **algılıyor** (`af363.tamper` sayacı) ama değeri geri almıyor. Tam önleme bu tek dosyalık istemcide mümkün değil: mühür anahtarı istemci kodunda. Bkz. `KALAN_EKSIKLER.md`.

## B. Eski birimlerin ortak şövalye çizimi — **İNCELENDİ, kod değişikliği gerekmedi**

- Aktif havuzda (`PREP_HERO_TYPES`, 101 kart) emekli birim yok; tek eski kart **Büyücü**, onun da kendi çizimi var.
- Bot destesi, hikâye destesi ve Yankı kopyaları oyuncunun destesinden ya da aktif havuzdan geliyor.
- **Eski kayıt testi:** Kayıtlı desteye elle "Ork Savaş Lordu" ve "Paladin" yazıldı, oyun yeniden açıldı. Yükleme sırasında ikisi de desteden çıkarılıp başlangıç kartlarıyla değiştirildi; savaş destesine girmediler.
- Tarama sırasında sahaya çıkan bütün birlik türleri kaydedildi; sonuç `TEST_SONUCLARI.md` dosyasında.
- Aktif içerikte yanlış çizim kullanan birim bulunmadığı için **yeni görsel üretilmedi**.

## C. Tekrar gömülü görseller — **DÜZELTİLDİ**

8 tekrarın 7'si gerçek görseldi; 8.'si 48 baytlık 1×1 yer tutucu olduğu için dokunulmadı. Her birinin bütün kullanım yolu bulundu; ikinci kopya, tek kaynağa bağlanan bir referansla değiştirildi. **Görsel verisi ve çözünürlük aynı.**

| Görsel | Kullanım yerleri | Nasıl tek kopya yapıldı | Doğrulama |
|---|---|---|---|
| Gölge Suikastçı tam boy = portre (256×256) | script #9 `AF_ART_PACK_DATA` | Değer önce `af263GolgeArt` değişkenine alındı, iki anahtar ona bağlandı | İki anahtar aynı ve görsel çözülüyor. `AFArt.get` sonucu v262 ile aynı |
| Ana üs "Mağaza" simgesi = epik sandık (315×279) | #10 `AFQ_CHEST_ART.epic`, #102 `AF213HomeArt` | #102, #10'un yayımladığı `window.AFQ_CHEST_ART.epic` değerini kullanıyor (#10 daha önce çalışıyor) | Aynı veri, çözülüyor |
| 4 efekt şeridi (768×96) `afnew_te_fury`, `afnew_ru_spirit`, `afnew_al_dark`, `afnew_te_bond` | `#afxAssets` JSON | JSON'da `"@quake_wave"` gibi başvuru; tek okuyucu olan AFX yükleyicisi bunu çözüyor | Dört efekt gerçek `AFX.spell` ile yüklendi: `ready=true` |
| Yankı tanıtım arka planı = Yankı mod kartı (468×310) | CSS `#af203Intro`, #102 `AF213HomeArt.css` (#103 bunu **metin ayrıştırarak** okuyor) | #103'ün okuduğu kopya korundu; CSS'teki kopya kaldırıldı. Açılışta aynı kaynaktan `--af263-echo-art` CSS değişkenine bağlanıyor | Değişken dolu ve görsel çözülüyor |

**Kazanç:** 234.115 bayt görsel verisi (dosyanın %0,5'i). Eklenen kod +970 bayt; net −233.145 bayt. `test_v263.js` artık dosyada 1×1 dışında birebir tekrar eden görsel kalmadığını da denetliyor.

## D. Kahraman parçası / eşyası simgeleri — **DÜZELTİLDİ**

- **Önce:** Sonuç ekranında ikisi de aynı genel gri dişli (`ART.gear`).
- **Şimdi:** Oyunun **mevcut** sanat paketinden; yeni görsel gömülmedi.
  - **Kahraman parçası:** Parçayı alan kahramanın portresi (`commander.portrait.<id>`). Yoksa paketteki parça kristali, o da yoksa eski simge.
  - **Kahraman eşyası:** Kazanılan eşyanın yuvasına göre ekipman simgesi (`equipment.*`): ana el → kılıç, yardımcı el → kalkan, başlık → miğfer, göğüslük → ağır zırh, bel → kemer, ayak → çizme.
- Ödül miktarları ve verileri değişmedi.
- **Test:** Hikâye Seferi zaferinde "Kahraman parçası +2" Korvayn portresiyle (335×335), "Kahraman eşyası +1" kılıçla (280×280) görüldü. Kod testi: `test_v263.js`, 7 durum.

## E. Yeni oyuncu rehber balonu — **DÜZELTİLDİ**

- **Önce (ölçüldü):**
  - sonuç ekranında "ZAFER" başlığının %40'ını örtüyordu;
  - sonraki ekranda KUPA YOLU / LİG SIRALAMASI / SEZON BİLETİ sekmelerinin %83'ünü örtüyordu;
  - savaşta sabit olarak sağ altta, kart atma düğmesinin üstündeydi.
- **Düzeltme** (`AFP263_RUNTIME` betiği):
  1. Balonun gövdesi dokunuşları **geçirir** (`pointer-events:none`); yalnız kendi ATLA / KAPAT / ANLADIM düğmeleri tıklanır. Altında kalan kart, düğme ya da koridor sürükle-bırakı engellenmez.
  2. Her ekran değişiminde birkaç aday konum denenir. Düğmeleri, savaş kartlarını, sonuç başlığını ve **rehberin işaret ettiği hedefi** en az örten konum seçilir. Varsayılan konum zaten temizse oynatılmaz.
- **Test:**
  - **Sonuç ekranı:** "ZAFER" başlığının örtülmesi %40'tan **%4'e** indi; balon sol taraftaki süs kahraman görseline taşındı.
  - **Kupa Yolu ekranı (yoğun):** Bütün konumlar bir şeyi örtüyor. Balon sağ alta geçti ve hedef (GERİ) açıkta. Altındaki düğme dokunuşla çalışıyor.
  - **Savaş (son sürüm):** Balon kart sırasının sağı ile sağ kenar düğmeleri arasındaki boşluğa yerleşiyor. 740×360, 667×375 ve 800×360'ta hiçbir kartı ya da düğmeyi örtmüyor; koridor örtmesi en çok %0,6.
  - **Savaştaki ara sürümde bulunup giderilenler:**
    - "KARTI AT" düğmesi balon yerleştikten sonra beliriyordu → savaşta yerleşim saniyede bir yeniden denetleniyor.
    - Oyunun `min-width:172px` kuralı balonu düğmelerin üstüne taşırıyordu → yerleştirilmiş balonda kaldırıldı.
    - 667 genişlikte boşluk eşiği dar kalıyordu → 140 piksele indirildi.
  - KAPAT / ATLA düğmeleri çalışıyor.

## F. Kupa yolu kredisi ödül satırında — **DÜZELTİLDİ**

- **Önce:** Kupa yolu kilometre taşı kredisi bakiyeye sessizce ekleniyordu; satırda kaynağı yazmıyordu.
- **Şimdi:** `grantProgression` kupa yolu kredisini, cüzdan tavanından sonra **gerçekten eklenen** miktar olarak ölçüyor ve satırın başına "KUPA YOLU +X KREDİ" ekliyor. Hesap ve talep listesi (`trophyRewardsClaimed`) değişmedi; aynı ödül iki kez verilmiyor.
- **Test:** Kupa 20'deyken 25 kupa eşiğini geçen Arena zaferinde satır "+175 KREDİ · +25 KUPA · **KUPA YOLU +75 KREDİ**" oldu. Bakiye 572 → 747 (+175 = 100 maç + 75 kupa yolu); gösterim ile gerçek bakiye tutarlı.

---

## v3.60.262 düzeltmeleri korundu

Hikâye paneli, Sancak skoru, olay sırasında skorun görünmesi, %42 saydam suikastçı, 49 sayısı ve Yankı boss kuralı `test_v263.js` içinde yeniden denetleniyor (6 test, hepsi geçti). Tarayıcı taraması sonuçları `TEST_SONUCLARI.md` dosyasında.

---

## İçerik denetimi turu (ekranların içi, kaydırılarak) — **DÜZELTİLDİ**

Yöntem: 106 minyon kart resmi tek tek ölçüldü (kırık / boş / küçük figür / tekrar). Minyonlar listesi, Koleksiyon'un 5 sekmesi, 5 kahraman × 5 sekme, Mağaza'nın 5 sekmesi (yatay kaydırmayla), Etkinlik Mağazası, Sezon Bileti kaydırılarak fotoğraflandı. Ardından 30 ekranda otomatik resim taraması (kırık, düğme içinde dev resim, kartından taşan resim): **hepsi temiz**.

| # | Nerede | Hata | Düzeltme | Test |
|---|---|---|---|---|
| 1 | Alt ekranlar (Deste, Kahramanlar, Minyonlar, Envanter, Kupa Yolu, Görevler) | Rehber balonu ("GERİ ile ana ekrana dön") içeriğin üstüne biniyordu | Bu adımda balon tek satırlık şeride küçülüp üst çubuktaki boş aralığa oturuyor; dar ekranda ";" sonrası açıklama gizleniyor | 740×360, 667×375, 800×360'ta 7 ekranın hepsinde üst çubukta, örtme 0 |
| 2 | Gölge Suikastçı (Sezon Bileti, Koleksiyon, Minyonlar) | Kart resminde figür tuvalin yalnız %9'u; minik görünüyordu | Oyunda zaten olan aynı karakterin savaş çiziminin ilk karesi portre yapıldı; iki küçük kopya tek resme indi | Kart, koleksiyon ve sezon bileti ekranında büyük; 106 portrede en küçük figür artık %34 |
| 3 | Minyonlar → kilitli minyon ayrıntısı | Kilit simgesi "SV 1" etiketinin üstüne biniyordu; "Nasıl açılır?" kutusu yarı saydam, altındaki istatistikler içinden okunuyordu | Kilit sağ alta alındı; kutu opak | Görüntüyle doğrulandı |
| 4 | Koleksiyon kartları | Aynı etiket iki kez: "Menzilli · Menzilli" (4 minyon), "Platin · Platin" (2 platin karakter) | Bir etiket önceki etiketlerden biriyle aynıysa yazılmıyor | 49 + 3 boss + 2 platin kartta tekrar: 0 |
| 5 | Kahramanlar → kilitli kahraman (Vaelor, Theryn, Elyvara, Saelith) | Açıklama "ya da 20 Vael…" diye kesiliyor, "0 / 20 parça" sekmelerin arkasına taşıyor, KUPA YOLU düğmesi İLERLEME sekmesine biniyordu | Kutu düğmeye kadar genişledi, açıklama 2 satır, düğme kutunun yanında | 3 ölçüde metin kesik değil, düğme sekmeye binmiyor |
| 6 | İlk açılış (yeni oyuncu) | Hikâye girişi (~20 sn) giriş ekranının **arkasında** oynuyordu; oyuncu girişi kaçırıyor ya da doğrudan ücretsiz minyon kartına düşüyordu | Giriş ekranı açıkken hikâye başlamıyor | 6 sn bekleme: başlamadı; "Misafir olarak oyna" sonrası 1. slayttan başladı |
| 7 | Mağaza → Görünümler | "İNCELE" düğmesi kostüm figürünün gövdesini örtüyordu | Düğme küçülüp resmin sol alt köşesine alındı (kaynak kural `@layer af172Commerce` içinde olduğu için düzeltme aynı katmanda) | Görüntüyle doğrulandı |
| 8 | Etkinlik Mağazası | SATIN AL düğmesindeki mühür simgesi 324 px çiziliyor, kartları ve ekranın yarısını kaplıyordu; fiyat görünmüyordu | Fiyat simgesi 16 px | "SATIN AL ● 10 / 15" okunuyor |
| 9 | Etkinlik Mağazası → "3 minyon parçası" | Görsel katman oyunun çizdiği hedef minyonu (Alize Bıçaklı) silip sabit bir komutan resmi (mor büyücü) koyuyordu | Katman yalnız resim yoksa yedek koyuyor; İNCELE köşede | Kartta `afn_alize_bicakli` resmi |

Testler: `test_v263.js` 26/26 (I, C1b, J, K, L, M, N, O, P eklendi).

---

## Savaş içi görsel denetim — **DÜZELTİLDİ**

Yöntem: 9 modun her birinde (Arena, Doruk Kulesi, Hikâye Seferi, Gökyüzü Adaları, Sancak, Kolosus, Yankı, Karanlık Geçit, Gizli Bölge) savaş başı, 5. ve 14. saniye, büyü kullanımı, 25. saniye, duraklatma, çıkış onayı, zafer ekranı (2 an) ve sonrası fotoğraflandı (740×360). Her anda otomatik denetim: çizilmeyen / ekran dışı birim, koridorları örten katman, ekran dışına taşan ya da kırpılan HUD öğesi. JS hatası: 9 modda 0.

| # | Nerede | Hata | Düzeltme | Test |
|---|---|---|---|---|
| 1 | Bütün modlar, 3. (alt) koridor — **kullanıcı bildirimi: "Yankı'da 3. koridordaki minyonun canı gözükmüyor"** | Komutan büyü düğmeleri (Kızıl Kuyruk / Kor Yemini) elin üstünde, alt koridorun yürüme çizgisinin tam üstünde duruyor. Alt koridordaki birimlerin %11–32'si bu düğmelerin altından geçerken gövdesi ve can çubuğu düğmenin arkasında kalıyordu (ölçüm: Yankı'da 1 dakikada dost 112 örnekten 12'si, düşman 57'den 18'i). | Düğmelerin yeri değişmedi. Çizim döngüsü her karede birimlerin ekrandaki yerini kontrol ediyor; arkasında birim ya da can çubuğu olan düğme yarı saydam (%32) oluyor, basılabilir kalıyor. | Alt koridorda düğmenin altına giren birim yakalanıp durduruldu: düğme saydam, birim ve "58/58" can çubuğu görünüyor. |
| 1b | Bütün modlar, 1. (üst) koridor — **kullanıcı düzeltmesi: "Üst lane'miş"** | Üst bilginin altındaki mod şeridi (Yankı'da "YANKI 1/3 · GÖLGE · BOSS SONDA" y≈42–63; diğer modlarda "KULE · 1", "⚑ BAYRAK", "☁ GÖKYÜZÜ" y≈48–60) en üst katmanda ve üst koridor can çubuklarının çizildiği bantta. Birimler sıkışınca çubuklar yukarı itilip şeridin arkasında kayboluyordu. | Can çubuğunun çıkabileceği en üst sınır, o x konumunda şerit varsa şeridin 2 px altına çekiliyor. | Yankı'da üst koridorda 11 birim yığıldı: bütün can çubukları şeridin altında, görünür. |
| 2 | Bütün modlar, üst bilgi | "SEN · kupa", "KORVAYN · SV 1", "KULE KAT · ⚡ 1/3", "RAKİP · …" yazıları gölgesizdi; açık renkli arenalarda (Hikâye Seferi, Gökyüzü, Kolosus) gökyüzünün/mermerin üstünde okunmuyordu. | Renkler aynı; koyu kontur gölgesi eklendi. | Görüntüyle doğrulandı. |
| 3 | Arena (dereceli), Sancak | Duraklatma düğmesine basınca hiçbir şey olmuyordu. Oyunun "Çevrim içi maçta duraklatma yok" mesajı bu modlarda gizli olan bir şeride yazılıyordu; düğme bozuk görünüyordu. | Kural aynı (duraklatma yok). Düğme bu maçlarda soluk; basınca yanında "Çevrim içi / dereceli maçta duraklatma yok: rakip beklemez. Çıkmak için ✕." yazıyor. | Arena'da doğrulandı; diğer modlarda duraklatma penceresi eskisi gibi açılıyor. |
| 4 | Sonuç ekranı, "Kart parçası" / "Yeni kart" | Her zaman soru işaretli genel kart simgesi. | Parçalar tek bir minyona gittiyse o minyonun kart resmi; birden fazla minyona dağıldıysa genel simge kalıyor. | Doruk Kulesi zaferi: "Kart parçası +3" kutusunda Orman Okçusu. |
| 5 | Kolosus sonuç ekranı | Sağ paneldeki "ZAFER · TAŞ KOLOSUS DEVRİLDİ!" iki satıra bölünüp "Kupa" kutusunun çerçevesine biniyordu. | Kutular başlığın bittiği yerin altına kaydırılıyor (yalnız gerektiğinde). | Kolosus: başlık 66 px'te bitiyor, kutular 70 px'te başlıyor. Gökyüzü'nde kaydırma gerekmedi, uygulanmadı. |

Gözlenen, sorun olmayanlar: zafer/duraklatma/çıkış pencereleri, Yankı dalga arası güç seçimi, Kolosus boss can çubukları, büyü efektleri, hasar sayıları 9 modda düzgün.

Testler: `test_v263.js` 32/32 (Q, R, S, T, U, V eklendi).

---

## Kalan eksikler turu — **DÜZELTİLDİ / TEST EDİLDİ**

Ölçüler: 667×375, 740×360, 800×360 (Chromium, mobil öykünme). Görüntüler: `ekran_goruntuleri/kalan_eksikler/`, `ekran_goruntuleri/ek_modlar/`.

### Arayüz — DÜZELTİLDİ
| # | Nerede | Kök neden | Düzeltme | Test |
|---|---|---|---|---|
| W | Büyü ayrıntı penceresi | Pencere 250 px, içerik 266 px; düğme satırı kaydırma alanının sonunda ~11 px kesiliyordu | Alçak ekranda simge 64→50 px, düğme satırı pencerenin altına sabit, üst çubukta zaten yazan bakiye satırı penceredeki tekrarından kaldırıldı | 3 ölçüde kaydırma payı 0, düğmeler tam |
| X | Kupa Yolu | "MİNYON KARTI" ödülleri 256 px'lik küçük savaş figürünü kullanıyordu (aynı minyon parça ödülünde ve koleksiyonda tam portre); kart genişliği ada göre 67–90 px değişiyor, uzun ad resmi küçültüyordu | Minyon kartında oyunun kart portresi; kartlar 90 px, ad alanı sabit iki satır | 92 kartın hepsi 90 px, kırpık ad 0, küçük figürlü kart 0 |
| Y | Minyonlar → nadirlik sekmeleri | 6 sekme 374 px istiyor, alan 289 px; EFSANEVİ yarım, PLATİN görünmüyordu | Dar ekranda boşluk/yazı küçültüldü (mevcut kuraldan güçlü seçiciyle) | 667/740/800'de 6 sekme sığıyor |
| Z | Minyon ayrıntısı → EKİPMAN yuvaları (667) | Simge + boşluk yazıya 49 px bırakıyordu: "Boş · dokun ve…" | Simge yuvanın köşesine; yazı tam genişlikte, iki satır | Yazı 70–90 px, taşma yok |
| AA | Mağaza → Yadigârlar alt bilgisi | Alan 12 px yetersiz; kaynak kural `@layer af172Commerce` içinde olduğu için önceki denemeler uygulanmıyordu | Aynı katmanda boşluklar kısıldı; ürün kartlarına dokunulmadı | 3 ölçüde tam görünüyor |
| AB | Kahramanlar ekranı | Yeni Heroic görünüm yalnız BÜYÜLER için; diğer sekmeler eski "Kahraman Dosyası"nı farklı kolon, çerçeve ve renkle gösteriyordu | Eski ekran aynı kolon oranlarına (%23·%22·%55) ve aynı panel/sekme stiline getirildi; düğmeler ve işlevler aynı | 4 sekmede kolonlar ve çerçeveler aynı; 740/800'de liste taşmıyor |
| E2 | Savaş öğretici balonu | 2. adımda ATLA/KAPAT/ANLADIM iki satıra bölünüp balon 136 px'e çıkıyor, alt koridora ve ekran dışına taşıyordu; 667'de üst koridora biniyordu | Savaşta sıkı yazı düzeni; dar boşluk eşiği 140→108 px | 3 ölçüde iki adımda da koridora binme 0 px, ekran içinde, düğme/kart örtme yok |
| V-kontrol | Üst koridor can çubuğu düzeltmesi | — | — | Yankı'da ölçüldü: yalnız üst koridorda devreye giriyor (409/792 örnek); orta 0/138, alt 0/86 |

### Ek modlar — DÜZELTİLDİ / TEST EDİLDİ
| Mod | Bulgu | Durum |
|---|---|---|
| **Örümcek Akını** | Sonuç ekranı "YANKI İSTİLASI" yazıyordu (motor ikisini de `boss` modunda çalıştırıyor) | **DÜZELTİLDİ:** maç başında Örümcek motorunun etkin olup olmadığı kaydediliyor; etiket "ÖRÜMCEK AKINI". Dönüş hedefi değişmedi |
| Örümcek Akını akışları | Zafer (portal 0): +356 kredi +1 sandık, raid zafer 0→1, kademe 1→2. Yenilgi: +40 kredi, yenilgi sayacı +1. Pes: ödülsüz, yenilgi +1. Meşale her girişte −1. Zafer sonrası yeniden yükleme: kredi aynı (çift ödül yok). JS/motor hatası 0 | **TEST EDİLDİ** |
| **İki Oyunculu Kolosus** | Sunucuya ulaşılamayınca "Bağlantı hatası" + TEKRAR ARA / BOTLA OYNA / İPTAL doğru. Bot maçı düello motoru + "KOLOSUS" kontrol noktası; doğal oynanışta 100 puanla "KOLOSUS KONTROLÜ · ZAFER". Kupa/kredi değişmedi (bot maçı ödülsüz). Sonuç etiketi "SAVAŞ ARENALARI" yazıyordu | **DÜZELTİLDİ:** etiket "İKİ OYUNCULU KOLOSUS" |
| Lonca Dev Avı | Lonca yoksa "önce bir loncaya katıl" | Misafir akışı **TEST EDİLDİ**; avın kendisi sunucu gerektiriyor (bkz. KALAN_EKSIKLER) |
| Son Kahraman Ayakta | Misafirde giriş uyarısı | Misafir akışı **TEST EDİLDİ**; turnuva sunucu gerektiriyor |

### Android — aktarıldı
`ANDROID_AKTARIM.md`: 263, Android'deki v3.60.220'nin bütün Android'e özel değişikliklerini kapsıyor (karşılaştırma tablosu orada). HTML uygulamaya kondu, `versionCode 263`. Android adresi taklit edilerek geri tuşu köprüsü denendi; davranış 220 ile birebir aynı.

Testler: `test_v263.js` 40/40.

---

## Üç boss görseli (kullanıcı paketi `AFP_Boss_Paketi_v3`) — **DÜZELTİLDİ / TEST EDİLDİ**

Dosyalar: `varliklar/boss_v3/` (portre, idle/attack/death atlası ve GIF'ler). Bağlama yaması: `patch_v263.py` → AD.

| Konu | Sonuç |
|---|---|
| Portreler | `AFP36Col.setArt` ile bağlandı. Koleksiyon → Boss Koleksiyonu'nda üçü görünüyor (önce 2'si "GÖRSEL BEKLENİYOR", Küllerin Hükümdarı yalnız ön izleme) |
| Boss Sandığı | Üç görsel hazır olunca kendi kuralıyla açıldı: 60 toz, %2 boss, 50. açılış garantisi değişmedi. Test: 130 toz → 1. açılış 300 kredi (toz 70), 2. açılış 4 kahraman parçası (toz 10), 3. basış "Yetersiz yadigâr tozu", ödül yok; yeniden yüklemede kayıt aynı |
| Animasyonlar | Boss Koleksiyonu kartında bekleme (idle) döngüsü, karta dokununca saldırı (attack) bir kez oynayıp beklemeye dönüyor. 667×375, 740×360, 800×360'ta üç kart da animasyonlu |
| Küllerin Hükümdarı · saldırı | Pakette atlasın saydam alanı yoktu (yarı saydam gri sis; GIF'te beyaz lekeler). Üretim sırasında gri sis temizleniyor, figür ve ateş efektleri korunuyor. Görüntüyle doğrulandı |
| Ölüm (death) animasyonu | Bağlandı (veri HTML'de) ama **gösterildiği yer yok**: bu üç boss savaş motorunda hiçbir modda sahaya çıkmıyor |
| Çift Kılıçlı | Pakette yok; dokunulmadı |

---

## Kullanıcı ekran görüntüleriyle bildirilenler — **DÜZELTİLDİ / TEST EDİLDİ**

| Konu | Önce | Şimdi | Test |
|---|---|---|---|
| Büyüler | Alt koridordaki minyon büyü düğmesinin altındayken o noktaya büyü atılamıyordu (dokunuş düğmeye gidiyordu) | Büyüler kartlar gibi **sürükle-bırak**: simge parmağı takip eder, bırakılan noktaya atılır, simge yerine döner, bekleme süresi başlar. Düğmenin altındaki minyona da atılabilir. Koridor dışına (el kartları, üst bilgi) bırakmak iptal. Kısa dokunuş eskisi gibi çalışır. Düğmelerin yeri değişmedi. Atış oyunun kendi yolundan geçer (çevrim içi senkron dahil) | 667×375, 740×360, 800×360: düğmenin altındaki düşmana bırakınca büyü atıldı (can 137→89 ve 44→0, bekleme ~15 sn); el kartına bırakınca iptal; kısa dokunuşla seç/bırak; 2. büyü üst koridora atıldı; JS hatası 0 |
| Kök neden (sürükleme) | Düğmedeki simge resim olduğu için tarayıcının kendi resim sürüklemesi dokunuş olaylarını kesiyordu | Simgede resim sürükleme kapatıldı | — |
| Minyon kartları | Resimler yüze yakın plan (%222 büyütme), kafa ve gövde kesik | Kart portresinin tamamı çerçevede; figür baştan ayağa (resimde ne varsa) | Minyonlar, deste ve savaş elinde görüntüyle doğrulandı |
| Sandık açılış penceresi | Sandık ve kartlar solda dar bir sütunda, ödül yazısı sağda (mağaza katmanındaki iki sütunlu kural, Android'in tek sütun kuralını eziyordu) | Tek sütun, her şey ortada | 667×375, 740×360, 800×360; 1 ve 3 kartlı sandık: başlık, sandık, kartlar, ödül yazısı ve DEVAM ET merkezden 0 px sapma, taşma yok |
| Portal canı 0 ama maç bitmiyor (Yankı İstilası) | Rakip portal 0/430 "CAN %0" olup maç sürüyordu; test: 9. saniyede 0 oldu, maç 132. saniyede oyuncunun **yenilgisiyle** bitti | Yankı'nın zafer şartı (3 dalga + Ayna Celladı) korundu; Hikâye Seferi savunma görevindeki gibi portal 1 canda kalkanlanır, göstergede "CAN KALKANLI", şeritte "🛡 Yankı portalı kalkanlı…" | Portal 0'a çekildi → 1/430'da kaldı, maç sürdü; dalgalar + boss sonrası "YANKI İSTİLASI · ZAFER". **Bütün modlar tarandı** (Arena, Kule, Sefer, Gökyüzü, Sancak, Kolosus, Karanlık Geçit, Gizli Bölge, Örümcek Akını, Yankı): rakip portal 0 → zafer, dost portal 0 → yenilgi hemen; sorun yalnız Yankı'daydı |

---

## FPS taraması (bütün modlar) — **DÜZELTİLDİ / TEST EDİLDİ** (telefonda ölçülmedi)

Her modda bot oynarken 15. saniyeden sonra 5 sn FPS, 8 sn işlemci profili (Chromium, 800×360) alındı. Hangi işlevin ne kadar işlemci harcadığı ölçüldü.

| Bulgu | Durum |
|---|---|
| **Benim eklediğim büyü düğmesi saydamlığı (S) ve üst şerit can çubuğu tabanı (V)** her 120 ms'de çizim döngüsünün içinde ekran ölçümü yapıyordu (`getBoundingClientRect` / `getComputedStyle`). Bu, tarayıcıyı karenin ortasında yerleşimi yeniden hesaplamaya zorluyordu: saniyede 8–17 ms | **DÜZELTİLDİ.** Ölçümler çizimden çıkarıldı; savaş açıkken 400 ms'de bir ve ekran boyutu değişince yapılıyor, çizim hazır değeri kullanıyor. Profilde bu maliyet çizim döngüsünden tamamen kalktı (Kule: 137 ms → 0, Yankı: 100 ms → 0; 8 sn'lik profilde). Saydamlaşma ve can çubuğu tabanı aynı çalışıyor |
| **Boss koleksiyonu animasyonu (AD)** bütün sayfayı izleyen bir `MutationObserver` kullanıyordu; savaşta üst bilgi saniyede onlarca kez değiştiği için boşuna çalışıyordu. Koleksiyon kapalıyken de kareler çevriliyordu | **DÜZELTİLDİ.** Yalnız koleksiyon ekranı açıkken 400 ms'de bir bakılıyor; ekran kapalıyken kare çevrilmiyor. Açınca animasyon devam ediyor (görüntüyle doğrulandı) |
| İşlemcinin **%73–86'sı** WebGL'de çizilen birimlerin 2B tuvale kopyalanması (`flush` içindeki `drawImage`) | **Değiştirilmedi.** Bu ortamda ekran kartı yok; kopya yazılımla yapılıyor ve her şeyi yavaşlatıyor. Telefonda bu kopya ekran kartında yapılır ve çok daha ucuzdur. Kaldırmak çizim mimarisini değiştirmek demek; ölçüm yapılmadan risk alınmadı. Oyunun kendi uyarlanır çözünürlük düşürmesi (DPR 2 → 1,5) zaten devrede |
| Geri kalan oyun kodu (can çubukları, iyileştirme efektleri, kupa sayaçları, eski arayüz gözlemcileri) | Toplam işlemcinin yaklaşık %3'ü; her biri saniyede 2–20 ms. Eski sürümlere ait, çalışan kod; dokunulmadı |

**Mod başına FPS (bu ortamda, yazılımla çizim):** Ana üs 60 · Kolosus 59 · Gökyüzü 49 · Hikâye Seferi 45 · Örümcek Akını 23 · Arena 21 · Gizli Bölge 21 · Sancak 20 · Yankı 14 · Karanlık Geçit 14 · Kule 12.
Bu sayılar sahadaki birim sayısına göre çok oynuyor (aynı modda 13 ile 36 arası görüldü) ve **telefon FPS'ini göstermez**. Telefonda ölçüm kapalı testte yapılacak.

---

## Kalan eksikler listesi (kullanıcının 6 maddesi) — ilk üçü **DÜZELTİLDİ / TEST EDİLDİ**

| Madde | Önce | Şimdi | Test |
|---|---|---|---|
| Android geri tuşu | Duraklatma penceresi açılırken (geçiş animasyonu sırasında) gelen ikinci basış Ⅱ düğmesine gidip oyunu **sürdürüyordu**; çıkış onayında geri = "Hayır" (oyunu sürdürür); duraklatmadan açılan Ayarlar'da geri de oyunu sürdürüyordu | Pencere durumu animasyondan bağımsız okunuyor. Geri tuşu savaşı **hiçbir zaman sürdürmez**: savaş → duraklat → çıkış onayı → (geri) duraklatma menüsü; Ayarlar'da geri → duraklatma menüsü. Oyun yalnız "Devam et" ile sürer. Çevrim içi (duraklatılamayan) maçta eski davranış korundu | Android adresi (`appassets.androidplatform.net`) taklit edilerek, basışlar arası 0 / 300 / 1200 ms: 4 basışın hiçbirinde savaş sürmedi; duraklatmada savaş süresi 1,4 → 1,4 (durdu); Ayarlar'da geri → duraklatma; "Devam et" → süre aktı; ✕ → çıkış onayı → geri → duraklatma; Evet → savaştan çıkış. JS hatası 0. **Telefonda denenmedi** |
| Örümcek Akını girişi | Ana üsten açılamıyordu (yalnız eski dünya haritası kodundan) | Ana üs → SAVAŞ MODLARI → alt sırada **ÖRÜMCEK AKINI** (Son Kahraman / Lonca Dev Avı / İki Oyunculu Kolosus ile aynı biçim, 4 sütun). Oyunun kendi Örümcek Akını ekranını açar; mod kuralları değişmedi | 667×375, 740×360, 800×360: 4 düğme tek sırada, taşma yok; düğme → Örümcek Akını ekranı (1/82); SAVAŞA GİR → savaş başladı ("ÖRÜMCEK AKINI · 1/82"); savaştan çıkış → ana üs; GERİ ve Esc → ana üs; JS hatası 0 |
| Son Kahraman / Lonca misafir uyarısı | Misafir "KUYRUĞA KATIL"a basınca aynı küçük satır (10–11 px) aynı yazıyla yeniden yazılıyordu; basış fark edilmiyordu | Turuncu çerçeveli **🔒 GİRİŞ GEREKLİ** kutusu; her basışta yanıp söner; yanındaki **GİRİŞ YAP** düğmesi Ayarlar → Hesap ve kayıt'taki oyunun kendi giriş formunu açar (e-posta kutusu ekranda, bölüm vurgulu). Diğer durum yazıları aynı | 3 ölçüde kutu panelin içinde (667×375: 319×63 px), KATIL'a basınca yanıp sönme başladı, GİRİŞ YAP → merkez kapandı, Ayarlar açıldı, e-posta kutusu görünür. Lonca sekmesinde de aynı kutu |
| Boss animasyonları savaşta | Üç boss yalnız Koleksiyon'da oynuyordu | Kullanıcı kararı: boss'u olmayan yerlerde. **Karanlık Geçit** → Küllerin Hükümdarı / Uçurum Ejderi (Karanlık Geçit zafer sayısına göre sırayla), **Gizli Bölge son aşama (3/3)** → Boşluk İmparatoru. 45. saniyede, motorun var olan mod-boss yolundan doğar (Kule/Gökyüzü boss'larıyla aynı güç çarpanları; özel saldırı: ateş / yıldırım / ruh emme). Bekleme ve saldırı animasyonu kare kare, rakip tarafta aynalı; ölünce ölüm animasyonu. Yalnız çevrim dışı maçta (çevrim içi maçta iki ekran uyuşmayacağı için çıkmaz). Boss'u olan modlar ve Arena/Sancak değişmedi | Karanlık Geçit: Uçurum Ejderi 45. sn'de üst/orta koridorda doğdu (151 can), sola dönük; özel saldırıda saldırı kareleri; öldürülünce ölüm kareleri (ejder yığılıp kayboldu), "BOSS YENİLDİ!". Küllerin Hükümdarı: "KÜLLERİN HÜKÜMDARI SAHADA! Rakip boss çağırdı; portalını koru." ve "KÜLLERİN HÜKÜMDARI · ATEŞİN EFENDİSİ!" duyuruları. Gizli Bölge 3/3: Boşluk İmparatoru. Seçim kuralı: Gizli 1/3 ve 2/3 yok, dereceli düello ve eğitim yok, çevrim içi bağlamda yok. Kule 5. kat boss'u hâlâ Kadim Dev. JS hatası 0 |
| Çift Kılıçlı görseli | Kart, koleksiyon ve savaşta tek mızraklı figür | Kullanıcı kararı: mevcut iki kılıçlı görsellerden biri. **Karanlık Suikastçı** seçildi (iki bıçak savaş boyutunda da açık; Samuray'da ikinci kılıç küçük ve şapka öne çıkıyor). Veri kopyalanmadı: kart, tam boy, portre, savaş eli portresi ve savaş atlası oyunun görsel kaydından aynı kaynağa bağlandı; savaş animasyonunun eklem noktaları da aynı görselinkiyle değiştirildi. Ad, nadirlik, enerji, can, saldırı, sınıf değişmedi | 7 kaynak eşitliği doğrulandı (portre, tam boy, atlas, AF321 atlas, eklem, el portresi, kart); minyon ekranında kart iki bıçaklı; savaşta dost ve rakip figür iki mor bıçakla yürüyor. JS hatası 0. Not: iki minyon artık aynı görünüyor |
| Çevrim içi iki oyuncu | Hiç denenmemişti | Kod değişikliği gerekmedi. Kullanıcı kararıyla **yerel sahte sunucu** ile test edildi (canlı sunucuya ve Supabase'e dokunulmadı; test tarayıcısında dış ağ tamamen kapalıydı). Araçlar: `testler/tarayici/cevrimici_sahte_sunucu.js`, `cevrimici_iki_oyuncu.js` | 6 senaryo geçti (bkz. TEST_SONUCLARI → Çevrim içi). Canlı sunucu doğrulanmadı |

---

## Görsel kimlik ve boss dengesi (kullanıcı geri bildirimi) — **DÜZELTİLDİ / TEST EDİLDİ**

| Konu | Önce | Şimdi | Test |
|---|---|---|---|
| Çift Kılıçlı ↔ Karanlık Suikastçı aynı görünüyordu | Çift Kılıçlı, Karanlık Suikastçı görselinin birebir aynısıydı | Kullanıcı kararı: **buz mavisi türev**. Oyun açılırken Karanlık Suikastçı görselindeki yalnız mor tonlar (bıçaklar, kıyafet) buz mavisine çevrilir; ten, metal ve arka plan aynı kalır. Kart, tam boy, savaş eli ve savaş atlası türevi kullanır; veri kopyalanmaz. Savaş atlası, motorun türü bir kez kaydetmesi nedeniyle türev hazır olunca kaydediliyor (mızraklı ya da mor görsel savaşta hiç çıkmaz). Yeni çizim değildir; siluet aynı | Kart, tam boy, atlas, motor atlası ve el portresi türevde, Karanlık Suikastçı'dan farklı; eklemler aynı; ad/nadirlik/değerler aynı. Minyon ekranında Çift Kılıçlı buz mavisi, Karanlık Suikastçı mor; savaşta yan yana: mavi ve mor bıçaklar. JS hatası 0. Seçenek önizlemesi: `ekran_goruntuleri/cift_kilicli_secenekler.png` |
| Boss'ların oynanışa etkisi | Karanlık Geçit (2 boss sırayla) ve Gizli Bölge son aşaması (Boşluk İmparatoru) | Denge ölçümü yapıldı (aşağıda). Kullanıcı kararı: **Gizli Bölge'den kaldırıldı** (eski dengesi geri geldi). **Karanlık Geçit'te kalır, üç boss sırayla** (Küllerin Hükümdarı → Uçurum Ejderi → Boşluk İmparatoru; Karanlık Geçit zafer sayısına göre). Güç, giriş zamanı (45. sn), ödül ve çevrim içi kuralı değişmedi | Karanlık 3/4/5/6 zafer → Küllerin / Uçurum / Boşluk / Küllerin; Gizli Bölge 1/3, 2/3, 3/3 → boss yok; Karanlık Geçit maçında 46. sn'de Küllerin Hükümdarı doğdu. JS hatası 0 |

### Boss denge ölçümü

Aynı test botu (kart + iki komutan büyüsü kullanır), aynı başlangıç profili, oyun hızı ×2, koşul başına 12 maç. "Kapalı" koşulunda yalnız boss tanımı kapatıldı. Ham veri: `testler/sonuclar/boss_denge_olcumu.jsonl`, araç: `testler/tarayici/boss_denge_olcumu.js`.

| Mod | Boss | Zafer / Yenilgi | Zafer oranı | Ort. süre | Ort. kalan dost portalı |
|---|---|---|---|---|---|
| Karanlık Geçit | açık | 10 / 2 | %83 (±21) | 60 sn | 286 / 430 |
| Karanlık Geçit | kapalı | 9 / 3 | %75 (±24) | 58 sn | 278 / 430 |
| Gizli Bölge 3/3 | açık | 8 / 4 | %67 (±27) | 66 sn | 256 / 430 |
| Gizli Bölge 3/3 | kapalı | 11 / 1 | %92 (±16) | 58 sn | 325 / 430 |

- Boss canı 151–182, saldırı 18; rakibin maçta sahaya sürdüğü toplam birim canının %12–15'i kadar, enerjisiz gelir.
- Karanlık Geçit: ölçülebilir fark yok. Gizli Bölge son aşaması: zafer oranı yaklaşık 25 puan düştü; Boşluk İmparatoru çıktığı 10 maçın hepsinde sona kadar yaşadı, dost portalını ortalama 403'ten 262'ye indirdi. Bu aşamada yenilgi yolu başa döndürdüğü ve ödül artmadığı için kaldırıldı.
- Sınırlar: bot gerçek oyuncu değil; maçlar kısa (~60 sn); 12 maçta belirsizlik ±16–27 puan. Gerçek oyuncu dengesi kapalı testte izlenmeli.
