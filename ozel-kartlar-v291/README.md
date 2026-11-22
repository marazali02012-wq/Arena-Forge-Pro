# Arena Forge Pro v3.60.291

59 aktif minyon aynı koleksiyonda kalır. Oynanabilir Boss sınıfı kart nadirliğinden ve etkinlik bossundan bağımsızdır. Kaynak yama, denge/v290 dalının ürettiği HTML üzerine uygulanır.

Depo kökünde çalıştır:

```sh
cp denge-v288/ArenaForgePro_v288.html ArenaForgePro_v291.html
patch --batch --forward ArenaForgePro_v291.html denge-v290/v288-v290.patch
patch --batch --forward ArenaForgePro_v291.html ozel-kartlar-v291/v290-v291.patch
sha256sum ArenaForgePro_v291.html
```

- v290 SHA-256 `310865f53ab1a9f5d2912cf90c167c58cf4a88f76845abb3b91907cedcb5861f`
- v291 SHA-256 `d2041c909a103ae203290e1fda412fd873dc8a08cd793728653c8276487794da`

Hazırlık ve gerçekleşen etki ayrı görsel olaylardır. Konuk istemci yutma durumunu ev sahibinin gönderdiği kimliklerden kurar. Geçerli kısmi destelerde kart sırası ve boş yuvalar korunur.
