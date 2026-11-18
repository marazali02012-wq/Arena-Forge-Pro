# DEVİR DURUMU — Gerçekte ne yapıldı?

**Claude buradan devam etsin.** Bu paketin amacı yeni bir kod üretmiş gibi göstermek değil, mevcut değişiklikleri ve test kaynaklarını eksiksiz aktarmaktır.

- **Kaynak:** v3.60.261 HTML (46.891.772 bayt), v260 orijinali (46.887.092 bayt), v260 onarımlı test (46.887.843 bayt) ve v240 eski referans (40.475.834 bayt).
- **Düzeltilmiş olanlar:** v260'daki 7 hedefli savaş/mantık düzeltmesi ve v261'de kart portresi boşluk/geri dönüş düzenlemeleri.
- **Önceden test edilen:** 17/17 izole savaş testi, 10/10 kart portresi testi, JavaScript sözdizimi denetimi. Bu ZIP oluşturulurken aynı testler güncel v261 HTML'den yeniden çalıştırılır; logları `03_RAPORLAR/PAKET_OLUSTURMA_TESTLERI.json` içindedir.
- **Yapılmamış olanlar:** Tam 9 mod tarayıcıda oynanmadı; üç Android viewport görsel kanıtı yok; tüm minyonlar yeniden çizilmedi; GIF animasyonu üretilmedi; canlı v151 Netlify sitesi düzeltilmedi; Replit projesine yazılmadı.
- **Uyarı:** `05_KOD_INCELEME/` dosyaları büyük görsel verileri kısaltılmış inceleme kopyalarıdır, çalıştırılabilir oyun kaynağı değildir; gerçek görüntüler HTML içinde gömülüdür.
- **Güvenlik:** Canlı erişim tokenları / API anahtarlarını chat veya hata raporuna ham hâliyle kopyalama. Zaten oyuna gömülü bir public anon key varsa bunu gizli service_role anahtarıyla karıştırma.
- **Harici dosyalar:** Eğer HTML dış link veya API çağrısı kullanıyorsa bunlar internete bağlı olabilir; tek dosya arşivi harici sunucuyu içermez. Çevrim içi PvP için ayrı sunucu ve Supabase bağlantıları gerekebilir.
