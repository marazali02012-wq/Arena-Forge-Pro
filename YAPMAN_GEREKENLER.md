# Arena Forge Pro — yapman gerekenler (sırayla, komutlarıyla)

Benim yapamadığım işler aşağıda; hepsi senin hesabın, anahtarın ya da görselin gerektiriyor. Her bölümde **neden**, **ne yapacağın** ve **komutlar** var.
Anahtar, parola ya da token'ı bu dosyaya, sohbete veya GitHub'a **yazma**.

| # | İş | Neden ben yapamadım | Süre |
|---|---|---|---|
| 1 | Supabase'e kupa güvenliğini kur | Supabase hesabına erişimim yok | ~15 dk |
| 2 | Render sunucusuna kupa bağlantısını ekle | Sunucunun kodu bu depoda yok, Render'a erişimim yok | ~30 dk |
| 3 | Android AAB'yi imzala | Yükleme anahtarı sende | ~10 dk |
| 4 | Eksik 3 boss + Çift Kılıçlı görselini ekle | Görsel çizme aracım yok | görseller hazır olunca ~2 dk |
| 5 | Kapalı test ve Play Console | Telefon ve Play hesabı sende | — |

---

## 1. Supabase — kupa güvenliği

**Neden:** Şu an sıralamadaki kupa oyuncunun telefonundan geliyor; kayıt dosyasını değiştiren biri sıralamaya istediği kupayı yazabilir. Bu kurulumdan sonra kupa yalnız sunucudaki bir "defter"de tutulur, oyuncu değiştiremez.

**Hazır dosyalar:** `sunucu/01_kupa_otorite.sql` (defter) ve `sunucu/06_canli_entegrasyon.sql` (mevcut işlevlere bağlama). Yerel testlerde 28/28 ve 15/15 geçti.

**Kolay yol (tarayıcıdan):**
1. supabase.com → projen → **Database → Backups** → yedek al.
2. **SQL Editor → New query** → `sunucu/01_kupa_otorite.sql` içeriğini yapıştır → **Run**.
3. Yeni sorgu → `sunucu/06_canli_entegrasyon.sql` içeriğini yapıştır → **Run**.
4. Yeni sorguda doğrula (üçü de `false` çıkmalı):
```sql
select has_table_privilege('authenticated','public.afp_player_trophies','UPDATE');
select has_table_privilege('anon','public.afp_player_trophies','SELECT');
select has_function_privilege('authenticated','public.afp_trophy_settle(text,uuid,uuid,boolean,timestamptz,timestamptz)','EXECUTE');
```

**Komut satırı yolu (bilgisayarında psql varsa):**
```bash
export PGURL='postgresql://...'   # Supabase → Project Settings → Database → Connection string (URI)
pg_dump "$PGURL" --schema=public --no-owner -f yedek_oncesi.sql
psql "$PGURL" -v ON_ERROR_STOP=1 -f sunucu/01_kupa_otorite.sql
psql "$PGURL" -v ON_ERROR_STOP=1 -f sunucu/06_canli_entegrasyon.sql
```

**Sorun çıkarsa geri al:** SQL Editor'de `sunucu/08_geri_alma.sql` çalıştır. İşlevler eski hâline döner, veri silinmez.

---

## 2. Render — çevrim içi sunucuya kupa bağlantısı

**Neden:** Çevrim içi maçta kupayı **sunucu** yazmalı; iki oyuncu aynı sonucu bildirince sunucu `afp_trophy_settle` çağırır. Oyun (istemci) çevrim içi maçta zaten kupa/ödül vermiyor; bu bağlantı kurulmadan çevrim içi maç kupa değiştirmez.

**Render'da yapacakların:**
1. render.com → **arena-forge-online-server** servisi → **Environment** → iki değişken ekle:
   - `SUPABASE_URL` = Supabase → Project Settings → API → *Project URL*
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase → Project Settings → API → *service_role* anahtarı (**gizli**, yalnız burada; oyuna/APK'ya asla konmaz)
2. Sunucunun kod deposunda (bu depo değil):
```bash
npm install @supabase/supabase-js
cp <bu-depo>/sunucu/03_wss_kupa_isle.js ./
cp <bu-depo>/sunucu/render_ornek_entegrasyon.js ./
```
3. Sunucuda iki oyuncunun `battle_result` mesajlarını topladığın yerde `onBothResults(room)` çağır (`render_ornek_entegrasyon.js` içinde nasıl bağlanacağı yazıyor; değişken adlarını kendi koduna göre değiştir).
4. Eşleşmede kupayı oyuncunun gönderdiği değerden değil `afp_player_trophies` tablosundan oku (aynı dosyanın sonunda örnek var).
5. **Manual Deploy → Deploy latest commit**.
6. İki hesapla bir maç oyna, Supabase SQL Editor'de kontrol et (iki satır görmelisin):
```sql
select match_id, user_id, outcome, delta, trophies_after from public.afp_trophy_ledger order by created_at desc limit 4;
```

---

## 3. Android — AAB'yi imzala

**Neden:** `yayin/android/ArenaForgePro-release-IMZASIZ.aab` imzasız; Play imzasız paketi kabul etmez. `ArenaForgePro-test-debug.apk` ise yalnız telefonda denemek içindir, Play'e yüklenmez.

**Yol A — GitHub imzalasın:** Depo → **Settings → Secrets and variables → Actions → New repository secret**:
- `UPLOAD_KEYSTORE_BASE64`: anahtar dosyasının base64 hâli. Kendi bilgisayarında: `base64 -w0 upload-keystore.jks > ks.b64` (macOS: `base64 -i upload-keystore.jks -o ks.b64`), içeriğini yapıştır, sonra `ks.b64` dosyasını sil.
- `UPLOAD_KEYSTORE_PASSWORD`: anahtar parolası
- `UPLOAD_KEY_ALIAS`: anahtar adı

Sonra **Actions → Android derleme → Run workflow → "kaydet" işaretli → Run**. İmzalı paket `yayin/android/ArenaForgePro-release-imzali.aab` olarak gelir.

**Yol B — kendi bilgisayarında:**
```bash
jarsigner -keystore upload-keystore.jks -sigalg SHA256withRSA -digestalg SHA-256 ArenaForgePro-release-IMZASIZ.aab <anahtar-adı>
jarsigner -verify ArenaForgePro-release-IMZASIZ.aab
```
Daha önce Play'e yüklediysen aynı paket adı (`com.arenaforgepro.game`) ve **aynı** yükleme anahtarı kullanılmalı. Bu sürümün kodu 263.

---

## 4. Eksik görseller

**Neden:** Bu ortamda görsel çizme aracım yok; kurallar gereği kalitesiz ya da geçici görsel koymadım.

| Görsel | Durum | Etkisi |
|---|---|---|
| Küllerin Hükümdarı (boss) | Yalnız ön izleme var, asıl görsel yok | Boss Sandığı kapalı |
| Uçurum Ejderi (boss) | Yok | Boss Sandığı kapalı, koleksiyonda "GÖRSEL BEKLENİYOR" |
| Boşluk İmparatoru (boss) | Yok | Aynı |
| Çift Kılıçlı (minyon) | Çizimde tek mızrak var | Ad ile görsel uyuşmuyor |

**Boss Sandığı üç boss'un da görseli olunca açılır.** Görseller hazırsa (PNG/JPG/WebP, en az 512×512, şeffaf arka plan önerilir) tek komut:
```bash
python3 onarim/araclar/gorsel_ekle.py \
  onarim/cikti_v263/ArenaForgePro_v3.60.263_TAM_ONARIM_TEST.html  oyun_gorselli.html \
  --boss boss_kullerin_hukumdari=kullerin.png \
  --boss boss_ucurum_ejderi=ucurum.png \
  --boss boss_bosluk_imparatoru=bosluk.png \
  --cift-kilicli cift_kilicli.png
```
Bu araç test resimleriyle denendi: üç boss koleksiyonda görünür oldu, sandık açıldı (60 toz düştü, boss kartı ve parça çıktı), toz yetmeyince ödül vermedi.
Çift Kılıçlı'nın **savaş içi yürüyen figürü** (8 kareli atlas) ayrı çizim ister; araç yalnız kart/koleksiyon/ödül portresini değiştirir.
Görselleri bana gönderirsen eklemeyi, testleri ve Android derlemesini ben yaparım.

---

## 5. Kapalı test ve Play Console
- `yayin/android/ArenaForgePro-test-debug.apk` → telefona kurulup denenir (12 kişilik kapalı test).
- İmzalı AAB → Play Console → **Test → Kapalı test** → yeni sürüm.
- Kişisel Play hesabı 13 Kasım 2023'ten sonra açıldıysa üretime geçmek için 12 testçi ve 14 gün kesintisiz kapalı test şartı var.

## 6. Google Play'deki sol kenar siyah şerit düzeltmesini yayınla

**Sorun:** Play'deki sürümde ekranın solunda siyah şerit vardı, oyun daralıyordu.
**Sebep:** `GameActivity.java` kamera çentiği kadar boşluğu oyunun kenarına ekliyordu; oyun da aynı boşluğu kendi içinde bıraktığı için boşluk iki kat oluyordu.
**Düzeltme (yapıldı, commit `bf88481`):** Fazla boşluk kaldırıldı, oyun çentiğin arkasına kadar tam ekran çiziliyor; düğmeleri oyunun kendi güvenlik payı çentikten uzak tutuyor.
**Durum:** Düzeltme `yayin/android/` içindeki test APK'sında ve imzasız AAB'de var (sürüm kodu 263). Play'deki oyunda görünmesi için yeni paketin yüklenmesi gerekiyor.

**Adımlar:**
1. **Önce telefonda dene (isteğe bağlı):** `yayin/android/ArenaForgePro-test-debug.apk` dosyasını telefona indir ve kur ("bilinmeyen kaynaklara izin ver" istenebilir). Oyunu yatay aç; solda siyah şerit olmamalı, ana üs ve savaş ekranı tam genişlikte olmalı.
   - Play'den kurulu sürüm varsa test APK'sı farklı anahtarla imzalı olduğu için üstüne kurulmaz. Önce Play sürümünü kaldırman gerekir; bu, telefondaki yerel kaydı siler.
2. **AAB'yi imzala:** Bu dosyanın 3. bölümündeki A ya da B yolu.
3. **Play Console'a yükle:**
   - play.google.com/console → uygulaman → **Test → Kapalı test** (ya da kullandığın kanal) → **Yeni sürüm oluştur**.
   - İmzalı AAB'yi (`ArenaForgePro-release-imzali.aab`) yükle. Sürüm kodu 263 olmalı ve Play'deki son sürümden büyük olmalı. Değilse bana söyle, `app/build.gradle` içinde artırıp yeniden derleyeyim.
   - Sürüm notu örneği: "Yatay ekranda soldaki siyah şerit düzeltildi; arayüz ve savaş düzeltmeleri."
   - **İncelemeye gönder.**
4. **Kontrol:** Test edenler güncellemeyi aldıktan sonra, özellikle çentikli ya da kamera delikli telefonlarda solda şerit kalıp kalmadığına baksınlar.

Not: Bu düzeltme Chromium'da 37 px'lik sol çentik taklit edilerek doğrulandı; gerçek telefonda denenmedi.

## Bu klasörde neler var
| Yol | Ne |
|---|---|
| `sunucu/` | Supabase SQL'leri (01, 06, 08), testleri (02, 07), sunucu kodu (03), Render örneği, `KURULUM.md` |
| `onarim/araclar/gorsel_ekle.py` | Görselleri oyuna ekleme aracı |
| `yayin/android/` | Test APK'sı, imzasız AAB, doğrulama çıktıları |
| `onarim/cikti_v263/` | Oyun HTML'si ve bütün raporlar |
