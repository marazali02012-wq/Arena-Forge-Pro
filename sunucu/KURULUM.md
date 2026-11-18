# Arena Forge Pro — kurulum komutları (sunucu + Android imza)

Bu adımları **hesap sahibi** yapar. Anahtar, parola ya da token bu dosyaya, sohbete veya depoya yazılmaz.
Sıra önemlidir. Her SQL dosyası tekrar çalıştırılabilir (idempotent).

## 0. Bu depoda doğrulananlar (yerel PostgreSQL 16, 2026-11-18)
| Dosya | Ne yapar | Yerel sonuç |
|---|---|---|
| `01_kupa_otorite.sql` | Sunucu kupa defteri: tablolar, RLS, yalnız sunucunun çağırdığı `afp_trophy_settle`, oyuncu için `afp_trophy_me` / `afp_trophy_leaderboard` / `afp_trophy_seed_me` | `02` ile **28/28 geçti** |
| `06_canli_entegrasyon.sql` | Canlı şemaya bağlar: `afp_social_me` istemci kupasını yok sayar, `afp_leaderboard` defterden sıralar, `afp_players.trophies` defterle eşlenir, mevcut oyuncular en çok 300 kupayla deftere alınır | `07` ile **15/15 geçti** |
| `08_geri_alma.sql` | 06 öncesi canlı işlevleri geri yükler (acil durum) | Hatasız uygulandı; ardından 06 yeniden uygulanabildi |
| `03_wss_kupa_isle.js` | Çevrim içi (Render) sunucusunda maç sonucu onaylanınca `afp_trophy_settle` çağırır | Söz dizimi tamam; canlı sunucuda **denenmedi** |
| `04_eski_islevleri_kilitle.sql` | Genel şablon; canlı şemaya özel karşılığı 06'dır | Çalıştırılmaz, başvuru içindir |

Canlı Supabase ve Render'da **hiçbiri çalıştırılmadı**; bu ortamın erişimi yok.

## 1. Yedek al (Supabase)
Supabase Panosu → Database → Backups bölümünden anlık yedek al. Ya da bilgisayarında:
```bash
# Bağlantı adresi: Supabase → Project Settings → Database → Connection string (URI). Parolayı ekrana yazdırma.
export PGURL='postgresql://...'        # kendi bilgisayarında, geçici
pg_dump "$PGURL" --schema=public --no-owner -f yedek_oncesi.sql
```

## 2. Önce yerelde dene (önerilir)
```bash
cd sunucu
createdb afp_kupa_test && psql -d afp_kupa_test -v ON_ERROR_STOP=1 -f 02_kupa_otorite_test.sql | tail -4   # beklenen: 28 | 0
createdb afp_canli_test && psql -d afp_canli_test -v ON_ERROR_STOP=1 -f 07_canli_entegrasyon_test.sql | tail -4  # beklenen: 15 | 0
```

## 3. Supabase'e uygula
SQL Editor'de dosyaların içeriğini sırayla yapıştırıp çalıştır, ya da:
```bash
cd sunucu
psql "$PGURL" -v ON_ERROR_STOP=1 -f 01_kupa_otorite.sql
psql "$PGURL" -v ON_ERROR_STOP=1 -f 06_canli_entegrasyon.sql
```

## 4. Uygulandığını doğrula
```sql
-- oyuncu rolleri defteri değiştiremez / settle çağıramaz (hepsi false olmalı)
select has_table_privilege('authenticated','public.afp_player_trophies','UPDATE');
select has_table_privilege('anon','public.afp_player_trophies','SELECT');
select has_function_privilege('authenticated','public.afp_trophy_settle(text,uuid,uuid,boolean,timestamptz,timestamptz)','EXECUTE');
-- defter dolu mu
select count(*), max(trophies) from public.afp_player_trophies;
```

## 5. Çevrim içi sunucu (Render)
Oyun sunucusunun kaynak kodu bu depoda değil. O depoda:
```bash
npm install @supabase/supabase-js
```
- `03_wss_kupa_isle.js` dosyasını sunucu koduna ekle. **İki koltuk aynı sonucu bildirip sunucu onayladıktan sonra** `settleTrophies(match)` çağrılsın; dönen `delta/after` istemciye yalnız gösterim için gönderilsin.
- Eşleşme kupayı istemcinin `hello` mesajından değil `afp_player_trophies` tablosundan okusun (`SUNUCU_KUPA_ESLESME.md`).
- Render → Service → Environment kısmına iki değişken ekle: `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY`. Service role anahtarı **yalnız sunucuda** durur; APK'ya ya da oyuna asla konmaz.
- Yeniden dağıt, sonra iki hesapla bir maç oynayıp `afp_trophy_ledger` tablosunda iki satır oluştuğunu kontrol et:
```sql
select match_id, user_id, outcome, delta, trophies_after from public.afp_trophy_ledger order by created_at desc limit 4;
```

## 6. Sorun olursa geri al
```bash
psql "$PGURL" -v ON_ERROR_STOP=1 -f sunucu/08_geri_alma.sql
```
Bu yalnız işlevleri eski hâline döndürür. Defter tabloları kalır, veri silinmez. Eski `afp_social_me` kupayı yeniden istemciden alır (güvensiz); yalnız acil durum içindir.

## 7. Android yayın imzası (Play'e AAB yüklemek için)
Depodaki AAB (`yayin/android/ArenaForgePro-release-IMZASIZ.aab`) imzasızdır. İki yol var.

**a) GitHub'ın imzalaması.** Depo → Settings → Secrets and variables → Actions'a üç gizli değişken ekle:
`UPLOAD_KEYSTORE_BASE64`, `UPLOAD_KEYSTORE_PASSWORD`, `UPLOAD_KEY_ALIAS`. Anahtar dosyasını base64'e kendi bilgisayarında çevir:
```bash
base64 -w0 upload-keystore.jks > ks.b64     # içeriğini UPLOAD_KEYSTORE_BASE64'e yapıştır, sonra ks.b64'ü sil
```
Ardından Actions → "Android derleme" → Run workflow → "kaydet" işaretli. İmzalı AAB `yayin/android/ArenaForgePro-release-imzali.aab` olarak gelir.

**b) Kendi bilgisayarında imzalamak:**
```bash
jarsigner -keystore upload-keystore.jks -sigalg SHA256withRSA -digestalg SHA-256 \
  ArenaForgePro-release-IMZASIZ.aab <anahtar-adı>
jarsigner -verify ArenaForgePro-release-IMZASIZ.aab
```
Play Console'da daha önce bir sürüm yüklendiyse aynı paket adı (`com.arenaforgepro.game`) ve aynı yükleme anahtarı kullanılmalı. Bu sürümün kodu 263'tür; Play'deki son sürümden büyük olmalı.

## Not
`SUNUCU_KUPA_OTORITESI.md`, `05_antihile_kayit.sql` dosyasından söz ediyor. Bu dosya hiçbir dalda bulunamadı; o satır başka bir sunucu sürümüne (3.60.103) ait.
