# Arena Forge Pro v3.60.290

Bu dal, v289 teslim HTML'si üzerinden yapılan 59 minyonluk denge çalışmasını içerir. Yama, depodaki v288'den başlayarak v289 düzeltmelerini ve v290 dengesini tek adımda üretir.

Depo kökünde aşağıdakileri çalıştır:

```sh
cp denge-v288/ArenaForgePro_v288.html ArenaForgePro_v290.html
patch --batch --forward ArenaForgePro_v290.html denge-v290/v288-v290.patch
sha256sum ArenaForgePro_v290.html
```

- Git v288 SHA-256 `11d70feeea6d1edc6e23e9975ff1176d479c3924ff24050af078295fba24e503`
- Çalışmada kullanılan v289 SHA-256 `aa60fea4153798839c1684f525335a709dd27b567e71327cd3ad239761ba8a12`
- Test edilen v290 SHA-256 `310865f53ab1a9f5d2912cf90c167c58cf4a88f76845abb3b91907cedcb5861f`

59 kartın temel savaş verileri aynı tablodan okunur. Saha çizim ölçeği, fiziksel yarıçap ve saldırı menzili ayrı alanlardır. Keşifçi altı, Kalkanlı İskelet dokuz üyeyi üç koridora dağıtır. Bölüm, ilerleme ve boss çarpanları kendi motor yollarından uygulanır.
