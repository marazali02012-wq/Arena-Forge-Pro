# Arena Forge Pro v3.60.286 — Boss Yürüyüş, Zemin ve Yön Onarımı (TEST)

Kaynak: kullanıcının gönderdiği `ArenaForgePro_v3_60_285_Mod_Motoru_Onarim_TEST.html`. Bu klasör yalnız bossların görsel
yön, animasyon, konum ve zemin temasını düzeltir. Oyun kuralları, can/hasar/hız, yetenekler, kart/enerji/deste, 430 portal canı,
çevrim içi eşleşme, ödül/kayıt ve `arenaForgeProProfileV19` değişmez. Android paketindeki `app/src/main/assets/www/index.html`
(v3.60.220) ve ana dal bu çalışmada değiştirilmedi.

## İçerik

| Yol | Açıklama |
|---|---|
| `ArenaForgePro_v3_60_286_Boss_Yuruyus_Onarimi_TEST.html` | Çalıştırılabilir tek dosyalık oyun (tarayıcıda açılır). |
| `rapor/BOSS_YURUYUS_RAPORU.md` | Boss başına hata, kök neden, düzeltme ve test sonuçları. |
| `rapor/boss_gait_results.json` | Otomatik testin ham sonuçları (84 koşu). |
| `rapor/gorseller/` | Önce/sonra yürüyüş karşılaştırmaları, faz görüntüleri, gerçek savaş görüntüsü. |
| `test/boss_gait_test.js` | Bütün bossları kapsayan otomatik test (Playwright + Chromium). |
| `arac/yama_uygula.py` | v3.60.285 HTML'ine yamayı uygulayan araç (her değişiklik benzersiz eşleşmeyle). |
| `arac/*.js`, `arac/boss_rigs.json` | Yamanın parçaları: boss modülü, Kolos atlası, Karanlık Geçit çizimi, test kancası, boss iskelet noktaları. |

## Yeniden üretme ve test

```
python3 arac/yama_uygula.py ArenaForgePro_v3_60_285_Mod_Motoru_Onarim_TEST.html ArenaForgePro_v3_60_286_Boss_Yuruyus_Onarimi_TEST.html after
npm i playwright   # Chromium kurulu değilse: npx playwright install chromium
node test/boss_gait_test.js ArenaForgePro_v3_60_286_Boss_Yuruyus_Onarimi_TEST.html test_cikti 740x360,667x375,800x360
```

Test, oyunu açar, misafir girişi yapar, bir savaş başlatır; sonra `window.__AFPBossGaitQA.lab` ile savaş döngüsünü duraklatıp her
bossu oyunun gerçek `draw()` fonksiyonuyla kare kare çizer ve ölçer. Test kancası oyunda yalnız çağrılırsa çalışır.
