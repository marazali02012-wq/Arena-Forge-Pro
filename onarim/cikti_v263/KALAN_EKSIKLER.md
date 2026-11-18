# Kalan eksikler — v3.60.263

Etiket: **TAMAMLANMADI** = düzeltilmedi ya da doğrulanamadı.

## TAMAMLANMADI

1. **Gerçek Android cihaz / WebView testi.**
   - Testler Chromium mobil öykünmesiyle yapıldı (740×360, 667×375, 800×360).
   - Çentik payı, gerçek dokunma gecikmesi, GPU belleği ve gerçek FPS ölçülmedi.
   - Bu ortamda cihaz yok.
2. **Çevrim içi maçlarda pes / bağlantı kopması.**
   - Oyun sunucusuna (`arena-forge-online-server.onrender.com`) bu ortamdan bağlanılamıyor; kuyruk her seferinde yerel bota düşüyor.
   - Çevrim içi pes kodda var olan `AFPOnlineSyncV68.endGate` yolundan "hükmen mağlubiyet" olarak bildiriliyor; sonucu sunucu belirliyor. Bu yol değiştirilmedi ve **test edilemedi**.
   - Bağlantı kopması senaryosu da sunucu olmadan denenemedi.
3. **İstemci tarafındaki kayıt hilesi tam olarak önlenemiyor.**
   - Kayıt (localStorage) elle değiştirildiğinde var olan mühür (`arenaForgeProSealV1`) bunu **algılıyor** (`af363.tamper` sayacı artıyor) ama değerleri geri almıyor.
   - Testte: zafer 5 → 105, kredi 625 → 50.625 kabul edildi; mühür "mismatch" verdi.
   - Mühür anahtarı istemci kodunun içinde olduğundan kararlı biri mührü de yeniden hesaplayabilir.
   - Otomatik geri alma, meşru kayıtları da silebilir (birden fazla sekme, yazma sırasında çökme).
   - Gerçek önlem: dereceli sonuçların ve ödüllerin sunucuda doğrulanması (Supabase/oyun sunucusu). Bu, sunucu tarafı iş.
4. **Zafer ve yenilgi akışları test yardımıyla gözlendi:** zaferde rakip portal canı ya da Yankı final boss canı düşürüldü, yenilgide dost portal canı. Bitişi oyunun kendi kuralları yaptı. Doğal (yardımsız) Arena/Karanlık Geçit zaferi ve Yankı boss öldürme bu sürümde gözlenmedi. Denge değiştirilmedi.
5. **Yoğun ekranlarda rehber balonu.** Kupa Yolu gibi her yerinde düğme olan ekranlarda balonun konabileceği tamamen boş yer yok; balon en az örttüğü yere geçiyor. Gövdesi dokunuşları geçirdiği için alttaki düğme çalışıyor, ama görsel olarak bir kısmını örtüyor.
6. **Yeni çizim yapılmadı.** Ödül simgeleri oyunun mevcut sanat paketinden bağlandı. ~30 emekli birimin ortak şövalye çizimi değiştirilmedi; aktif oyunda çağrılmadıkları doğrulandı.
7. **1×1 yer tutucu** (48 bayt, 169 geçiş) tekilleştirilmedi; atlas yuvalarının kasıtlı yer tutucusu ve kazancı önemsiz.
8. **Örümcek Akını, Son Kahraman Ayakta, Lonca Dev Avı, İki Oyunculu Kolosus** görev listesindeki 9 modun dışında; tam test edilmedi.
9. **Android paketine aktarma.** v3.60.263, Android projesindeki gömülü `app/src/main/assets/www/index.html` (v3.60.220, Android'e özel eklemeli) içine **aktarılmadı**. Canlı yayına (Netlify/Replit/Play) hiçbir şey gönderilmedi; kullanıcı onayı gerekiyor.

10. **Gerçek cihaz FPS'i.** Ekran kartı olmayan test ortamında Kule/Sancak/Yankı savaşları 15–18 FPS, Kolosus 53–58 FPS ölçüldü. Maliyetin tamamına yakını karakter motorunun WebGL çizimi ve 2D tuvale kopyalanmasında (`af321Flush`). Telefonda bu iş ekran kartında yapılır; oyunun otomatik çözünürlük düşürme koruması da çalışıyor. Telefon ölçümü olmadan performans değişikliği yapılmadı.
11. **Küçük görsel notlar** (işlev bozulmuyor):
    - Büyü detay penceresinin alt düğmesi ilk açılışta ~11 px kesik görünüyor; panel kaydırılabildiği için tamamına ulaşılıyor.
    - Kupa Yolu'nda iki satıra bölünen bir kart adı ("ATEŞ ELEMENTALİ") ve 667×375'te Minyonlar ekranındaki "Boş · dokun ve kuşan" alt yazısı satır sınırında kırpılıyor.
12. ~~Mesajlar ve Ayarlar ekranları test edilmedi~~ → sonraki turda açılıp kapatıldı (bkz. `TIKLAMA_VE_CENTIK_TESTI.md`).
13. **Tek örnekte görünmeyen minyon:** 94 savaş örneğinden birinde bir dost birim bir an çizilmemiş göründü, sonraki örnekte görünüyordu. Kalıcı değil; büyük olasılıkla iki kare arasında sahaya çıkma anı. Ayrıca doğrulanmadı.

## İçerik denetiminde bulunan, düzeltilemeyen ya da bilerek bırakılanlar — **TAMAMLANMADI**

14. **İki boss'un resmi yok.** Koleksiyon → Boss Koleksiyonu'nda "Uçurum Ejderi" ve "Boşluk İmparatoru" "GÖRSEL BEKLENİYOR" gösteriyor; Boss Sandığı da bu yüzden kapalı ("sandık görseller gelince açılır"). Oyun dosyasında bu iki boss için çizim yok; kurallar gereği yeni görsel eklenmedi.
15. **Ad / çizim uyuşmazlığı:** "Çift Kılıçlı" (ilk ücretsiz minyon) çiziminde karakter tek mızrak tutuyor. Oyunun kendi çizimi; değiştirilmedi.
16. **Kahramanlar ekranında iki tasarım:** Büyüler sekmesi yeni görünümde, Özet/Ekipman/Kıyafetler/İlerleme eski "Kahraman Dosyası" görünümünde açılıyor. İşlev bozulmuyor; birleştirmek ekranı yeniden yazmak demek, yapılmadı.
17. **Mağaza → Yadigârlar** alt bilgi satırı ilk görünümde yarım; alan 12 px kaydırılınca tamamı görünüyor.

## Bilinçli tasarım kararları (onay gerekirse değiştirilebilir)

- **Pes, görev/meydan okuma ilerlemesine sayılmıyor.** "N savaş oyna" görevleri ve meydan okuma ödülleri başlat-pes et ile toplanamasın diye. İstatistik, maç geçmişi ve mod kayıtlarında yenilgi olarak görünüyor.
- **Dereceli maç ortasında sayfa yenileme** eskisi gibi "terk" sayılıyor (−kupa, sonuç kaydı yok). Normal PvE maçında yenileme hiçbir sonuç yazmıyor.
