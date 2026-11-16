# Kupa sıralaması güvenliği — sunucu otoritesi

**Sorun:** Sıralama kupası istemciden geliyordu (`afp_social_me(p_trophies)` ve bulut yedeği `save_data`). Oyuncu yerel kaydı düzenleyip
sıralamaya istediği kupayı yazabilirdi. İstemci tarafında bunu "tamamen" engellemek **mümkün değildir** (yerel kayıt cihazdadır);
tek çözüm, kupanın **sunucuda, oyuncunun yazamayacağı bir defterde** tutulmasıdır.

## Tasarım
| Parça | Dosya | Durum |
|---|---|---|
| Otorite tabloları + RLS + yetkiler + `afp_trophy_settle` | `sunucu/01_kupa_otorite.sql` | Yerelde PostgreSQL 16'da doğrulandı |
| 28 maddelik saldırı/doğruluk testi | `sunucu/02_kupa_otorite_test.sql` | 28/28 geçti |
| WSS sunucusu için settle çağrısı | `sunucu/03_wss_kupa_isle.js` | Sahte (mock) ile test edildi; canlı sunucuda denenmedi |
| Eski RPC/tablo kilitleme şablonu | `sunucu/04_eski_islevleri_kilitle.sql` | **Doğrulanmadı** (canlı şema bu depoda yok) |
| İstemci: kupa göndermez, sıralamayı sunucudan alır | `index.html` v3.60.240 | Sahte Supabase ile test edildi |

### Güvenlik kuralları (SQL'de uygulanır)
- `afp_player_trophies`, `afp_trophy_ledger`, `afp_trophy_config`: RLS açık, **politika yok**, `anon`/`authenticated` yetkisi **geri alındı** → oyuncu okuyamaz/yazamaz.
- `afp_trophy_settle` yalnızca `service_role` (güvenilen WSS sunucusu). Oyuncu çağıramaz (testle doğrulandı).
- Kupa farkı **sunucuda**, sunucudaki iki kupadan hesaplanır; istemciden hiçbir sayı alınmaz.
- Aynı `match_id` ikinci kez işlenmez (idempotent); ters taraflı aynı maç reddedilir.
- Eşleşme aralığı (±%20, en az 5), en kısa süre (45 sn), aynı rakiple 24 saatte en çok 3 maç, günlük +250 kazanç sınırı, 0 altı/20000 üstü yok.
- Tüm değişiklikler `afp_trophy_ledger` defterine yazılır (denetim).
- Yerelden bir kerelik devir (`afp_trophy_seed_me`) **en çok 300** kupa taşır; sonra kapanır. Böylece "yerel kupayı sunucuya yaz" hilesi kapanır.

## Yapılması gerekenler (**sahibi** — bu ortamdan yapılamaz)
1. Supabase SQL düzenleyicisinde `01_kupa_otorite.sql` çalıştırın.
2. `04_eski_islevleri_kilitle.sql` şablonunu canlı şemaya göre uyarlayıp çalıştırın: `afp_social_me` içinde `p_trophies` yok sayılsın;
   `afp_leaderboard` ve eşleşme **`afp_player_trophies`**'ten okusun; profil tablosunda varsa kupa sütununun istemci yazma yetkisi kaldırılsın.
3. WSS sunucusunda (`arena-forge-online-server`) `battle_result` iki koltukta uyuştuktan sonra `03_wss_kupa_isle.js` içindeki
   `settleTrophies` çağrılsın; dönen `after/delta` istemciye **gösterim** için gönderilsin. `SUPABASE_SERVICE_ROLE_KEY` yalnız sunucuda.
4. Eşleşme (WSS), kupayı `hello` mesajından değil `afp_player_trophies`'ten okusun (bkz. `SUNUCU_KUPA_ESLESME.md`).

Bunlar yapılana kadar istemci **geriye uyumlu** çalışır: sunucu fonksiyonu yoksa eski sıralamaya düşer (🔒 işareti görünmez = doğrulanmamış).

## Dürüst sınırlar
- Çevrimdışı/yerel kupa (kupa yolu, tek kişilik oyun) cihazda düzenlenebilir; bu **sıralamayı etkilemez** ama yerel göstergeyi değiştirir.
- Sıralamaya **yalnızca sunucu onaylı çevrim içi maçlar** kupa yazar; iki cihazın işbirliğiyle yapılan anlaşmalı maçlar (çiftçilik) oran/günlük sınırlarla yavaşlatılır, tamamen yok edilemez.
- Sunucu tarafı canlıya alınmadıkça sıralama güvenliği **fiilen sağlanmış olmaz**; bu depo yalnızca doğrulanmış çözümü ve istemci hazırlığını sağlar.
