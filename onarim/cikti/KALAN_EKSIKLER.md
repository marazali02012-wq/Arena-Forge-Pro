# Kalan eksikler

## A. Yapılmadı (bu ortamda yapılamaz ya da kapsam dışı kaldı)

1. **Gerçek Android cihaz / WebView testi.**
   - Testler Chromium mobil öykünmesiyle yapıldı.
   - Çentik/kamera deliği (`safe-area`), gerçek dokunma gecikmesi, GPU belleği ve gerçek FPS ölçülmedi.
   - APK içindeki sürüm (`Arena-Forge-Pro` deposu, v3.60.220) hiç açılmadı.
2. **Çevrim içi PvP / eşleşme / Supabase.** Oyun sunucusuna (`arena-forge-online-server.onrender.com`) bu ortamdan bağlanılamadı. Kuyruk her seferinde yerel bota düştü.
3. **Arena ve Karanlık Geçit'in zafer yolu** tarayıcıda gözlenmedi (bot kaybetti). Kod testleri bu koşulları kapsıyor (17/17).
4. **Gizli Bölge aşama 2 ve 3** oynanmadı. Aşama 1 zaferi ve yolun 2/3'e geçişi gözlendi.
5. **Örümcek Akını, Son Kahraman Ayakta, Lonca Dev Avı, İki Oyunculu Kolosus** test edilmedi. Görev listesindeki 9 modun dışındalar.
6. **Yeni sanat:** minyon/komutan yeniden çizimi, yeni animasyon kareleri, GIF üretilmedi. Bu ortamda görüntü üretme aracı yok. Mevcut görseller sağlam (bkz. `VARLIK_ENVANTERI.md`).
7. **~30 emekli türün** kendine ait savaş çizimi yok (ortak şövalye yer tutucusu). Aktif havuzda olmadıkları için dokunulmadı.
8. **Tekrar gömülmüş 8 görsel** (~253 KB) birleştirilmedi. Kullanım yolları tek tek doğrulanmadan silmek kuralı ihlal ederdi.
9. **Replit / Netlify / canlı sürüm** karşılaştırılmadı, yazılmadı. Erişim yok; görev de onaysız yazmayı yasaklıyor.

## B. Başarısız olan

- Yok. Bu sürümdeki bütün kod testleri ve tarayıcı doğrulamaları geçti:
  - sözdizimi 105/0
  - kod testleri 17/17, 10/10, 9/9
  - v262 tarayıcı regresyonu, savaş döngüsü hata sayacı 0.
- **Not:** Sancak düzeltmesinin ilk hâli olay bildirimleri sırasında skoru gizliyordu. Bu, tarayıcı testinde yakalandı ve aynı sürümde düzeltildi.

## C. Senin kararını / onayını gerektiren

1. **Pes etme mağlubiyet sayılsın mı?**
   - Pencere "Maç sonlandırılacak ve mağlubiyet sayılacak" diyor. Kod ise pes edilen maçı istatistiğe hiç yazmıyor (yalnız dereceli düelloda kupa düşüyor).
   - Bunun bilinçli olması olası: başlat-pes et ile "N savaş oyna" görevlerinin doldurulmasını engelliyor.
   - Seçenekler: (a) metni koda uydur ("ödül verilmez; dereceli düelloda kupa düşülür"), (b) pes etmeyi yenilgi olarak yaz ama görev ilerlemesine sayma.
2. **Android paketine aktarma:**
   - v3.60.262, Android projesindeki gömülü `index.html` dosyasına (v3.60.220, Android'e özel eklemeler var) **aktarılmadı**.
   - Ayrıca `Arena-Forge-Pro` deposuna bu oturumdan **yazma izni yok** (push 403). Bu yüzden her şey `Arena-Forge-Pro2` deposunda, `claude/new-session-b8xsc0` dalında.
3. **Yankı İstilası final boss dengesi.** Düşük seviyeli destede bot, boss'u 100 sn içinde bitiremedi (518 can). Zorluk kasıtlı olabilir; değiştirilmedi.
4. **Canlı Netlify'nin güncellenmesi.** TinyFish'in gördüğü boş portreler eski v3.60.151 içindi. Yeni dosya yüklenmeden canlı sitede düzelmez.
