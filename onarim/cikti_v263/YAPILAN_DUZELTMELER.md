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
