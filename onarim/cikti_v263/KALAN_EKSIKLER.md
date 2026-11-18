# Kalan eksikler — v3.60.263 (kalan eksikler turundan sonra)

Etiket: **TAMAMLANMADI** = yapılmadı ya da bu ortamda doğrulanamadı. Gerçek cihaz testleri bu listede yok; 12 kişilik kapalı testte yapılacak.

## TAMAMLANMADI — görseller (yeni çizim yapılmadı)

Bu çalışma ortamında görsel üretme aracı yok. Kurallar gereği kalitesiz ya da geçici görsel eklenmedi.

1. **Uçurum Ejderi** ve **Boşluk İmparatoru** boss görselleri yok. Koleksiyonda "GÖRSEL BEKLENİYOR" yazıyor.
2. **Boss Sandığı kapalı.** Sebep yalnız bu iki görselin eksikliği: kodda sandık, bütün boss'ların görseli hazırsa açılıyor (`ready`). Görseller eklendiği anda oyunun kendi açılış sistemi (60 toz, %2 boss, 50. açılışta garanti) devreye girer. Görsel olmadığı için sandık içeriği, ödül kaydı ve çift ödül kontrolü **denenemedi**.
3. **Çift Kılıçlı** (ilk ücretsiz minyon) çiziminde karakter tek mızrak tutuyor. İki kılıçlı yeni çizim yapılmadı.

Görseller hazırlandığında eklenecek yerler: boss'lar için `af36Collection` içindeki `DB[...].art` (koleksiyon ve sandık buradan okur); Çift Kılıçlı için `AFP94_MINION_CARDS.af37_cift_kilicli`, `minion.portrait/full.af37_cift_kilicli` ve savaş atlası `unit.atlas.af37_cift_kilicli`.

## TAMAMLANMADI — sunucu ve güvenlik (sahibinin canlı sistemde yapması gereken)

4. **Kupa otoritesi canlıda değil.** Kurulum adımları: `sunucu/KURULUM.md`. `sunucu/01_kupa_otorite.sql` (RLS, yalnız sunucunun çağırabildiği `afp_trophy_settle`, maç başına tek kayıt, günlük sınırlar) yerel PostgreSQL'de 28/28 testle doğrulanmıştı. Supabase'de çalıştırılması ve WSS sunucusuna (Render) `settleTrophies` çağrısının eklenmesi gerekiyor. Bu ortamda Supabase/Render erişimi ve anahtarı yok; **canlıda doğrulanmadı.** Yapılana kadar sıralama kupası istemciden gelir.
5. **Yerel kayıt hilesi.** Çevrim dışı ilerleme (kredi, kupa yolu, tek kişilik modlar) cihazda düzenlenebilir. Mühür bunu algılıyor ama geri almıyor. Tam önlem için ödüllerin sunucuda tutulması gerekir; bu, mimari değişiklik.
6. **Çevrim içi pes, bağlantı kopması, çift zafer.** Kodda bu üçü için önlem var: çevrim içi maçta istemci kupa/ödül vermiyor; sonuç sunucu "onaylandı" demeden yazılmıyor; ikinci bitiş çağrısı ödül vermiyor. Ancak oyun sunucusuna (`arena-forge-online-server.onrender.com`) bu ortamdan bağlanılamadığı için iki gerçek oyuncuyla **denenmedi**.
7. **Son Kahraman Ayakta, Lonca Dev Avı, Lonca:** hesap girişi ve lonca sunucusu gerekiyor. Misafir olarak giriş uyarısı doğru görünüyor; turnuva, lonca avı ve ödül akışı **denenemedi**. Son Kahraman'da misafirken "KUYRUĞA KATIL"a basınca aynı giriş uyarısı tekrar yazılıyor; uyarı zaten ekranda olduğu için basış fark edilmiyor.

## TAMAMLANMADI — Android imza

8. **Yayın imzası.** Derlemeden çıkan AAB **imzasız**. Yükleme anahtarı depoya gizli değişken olarak tanımlanmadıkça imzalanmaz. Test APK'sı hata ayıklama anahtarıyla imzalı; **yayın paketi değildir**.

## Bilinen ama dokunulmayanlar

9. **Örümcek Akını'na ana üsten giden düğme yok.** Mod ve ekranı çalışıyor; yalnız eski dünya haritası kodundan açılabiliyor. Yeni bir giriş düğmesi tasarım kararı olduğu için eklenmedi.
10. **Örümcek Akını 1. kademe kolay.** 38 saniyede kazanıldı. Kademeler gerçekten zorlaşıyor (82. kademede can ×3, saldırı ×2,1); denge değiştirilmedi.
11. **Lonca formu**, boş davet koduyla basılınca tarayıcının kendi dil uyarısını gösteriyor (test tarayıcısında İngilizce). Türkçe telefonda Türkçe çıkar.
12. **Savaşta duraklatma açıkken Android geri tuşu oyunu sürdürüyor** (çıkış onayına gitmiyor). v3.60.220'de de aynı; değiştirilmedi.
13. **Telefon FPS'i.** Ekran kartı olmayan test ortamında 15–18 FPS ölçüldü; telefonda çizim ekran kartında yapılır. Ölçüm olmadan performans değişikliği yapılmadı.
14. **1×1 yer tutucu** (48 bayt, 169 geçiş) tekilleştirilmedi; atlasın kasıtlı yer tutucusu.

## Bilinçli tasarım kararları

- Pes, görev/meydan okuma ilerlemesine sayılmıyor; istatistikte ve maç geçmişinde yenilgi olarak görünüyor.
- Dereceli maç ortasında sayfa yenileme "terk" sayılıyor.
- Çevrim dışı bot maçında (İki Oyunculu Kolosus "BOTLA OYNA") kupa ve kredi verilmiyor.
