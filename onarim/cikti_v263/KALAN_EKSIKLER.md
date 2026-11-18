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
4. **Yankı İstilası final boss'u ve Arena/Karanlık Geçit zaferleri** test botuyla doğal yoldan kazanılamadı (düşük seviyeli deste). Zafer akışları test yardımıyla (portal/boss canı düşürülerek) gözlendi. Denge değiştirilmedi.
5. **Yoğun ekranlarda rehber balonu.** Kupa Yolu gibi her yerinde düğme olan ekranlarda balonun konabileceği tamamen boş yer yok; balon en az örttüğü yere geçiyor. Gövdesi dokunuşları geçirdiği için alttaki düğme çalışıyor, ama görsel olarak bir kısmını örtüyor.
6. **Yeni çizim yapılmadı.** Ödül simgeleri oyunun mevcut sanat paketinden bağlandı. ~30 emekli birimin ortak şövalye çizimi değiştirilmedi; aktif oyunda çağrılmadıkları doğrulandı.
7. **1×1 yer tutucu** (48 bayt, 169 geçiş) tekilleştirilmedi; atlas yuvalarının kasıtlı yer tutucusu ve kazancı önemsiz.
8. **Örümcek Akını, Son Kahraman Ayakta, Lonca Dev Avı, İki Oyunculu Kolosus** görev listesindeki 9 modun dışında; tam test edilmedi.
9. **Android paketine aktarma.** v3.60.263, Android projesindeki gömülü `app/src/main/assets/www/index.html` (v3.60.220, Android'e özel eklemeli) içine **aktarılmadı**. Canlı yayına (Netlify/Replit/Play) hiçbir şey gönderilmedi; kullanıcı onayı gerekiyor.

## Bilinçli tasarım kararları (onay gerekirse değiştirilebilir)

- **Pes, görev/meydan okuma ilerlemesine sayılmıyor.** "N savaş oyna" görevleri ve meydan okuma ödülleri başlat-pes et ile toplanamasın diye. İstatistik, maç geçmişi ve mod kayıtlarında yenilgi olarak görünüyor.
- **Dereceli maç ortasında sayfa yenileme** eskisi gibi "terk" sayılıyor (−kupa, sonuç kaydı yok). Normal PvE maçında yenileme hiçbir sonuç yazmıyor.
