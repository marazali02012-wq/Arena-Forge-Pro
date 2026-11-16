# Çevrim içi eşleşme: kupa dengesi (sunucu tarafı kuralı)

Oyun istemcisi, gerçek çevrim içi rakipleri **WSS sunucusunda** (`arena-forge-online-server`) eşleştirir. Eşleşme kararı sunucudadır; bu repoda sunucu kodu yoktur, bu yüzden aşağıdaki kuralı sunucu geliştiricisinin uygulaması gerekir.

## Kural
İki oyuncu yalnızca kupaları birbirine **en fazla %20** yakınsa eşleşir:

```
pay(T)  = max(5, floor(T * 0.2))
eşleşir = |A - B| <= pay(min(A, B))
```

Örnekler: 100 kupalı oyuncu ↔ en fazla **120** kupalı (veya en az 80) ile eşleşir; 0 kupalı yeni oyuncu ↔ 0–5 kupalı; 1000 kupalı ↔ 800–1200.

## Uygulama notları
- **Kupa değerini istemciden alma.** İstemci kupayı kendisi bildirirse hile yapılabilir. Sunucu, `hello` mesajındaki Supabase `accessToken` ile oyuncunun profilini/kupasını **kendi veritabanından** okumalı.
- Kuyruk, mod başına (`modeId`) ve kupa sırasına göre tutulmalı; yeni gelen oyuncu, bekleyenler arasında kurala uyan **kupası en yakın** olanla eşleştirilmeli. Uyan yoksa kuyrukta beklemeli (istemci zaten ~10 sn sonra rakip gibi görünen bota geçer).
- Süre geçtikçe aralığı **genişletme** (istemci 10 sn sonra bota geçtiği için genişletmeye gerek yok); kural sabit kalmalı.
- `match_found` / `room_ready` mesajlarına rakibin **kupası** eklenirse istemci ekranda gösterebilir (şu an göstermiyor); eklenirse protokol sürümünü artır.
- Dostluk/turnuva (`lhs`) maçları bu kuraldan muaf tutulabilir.

## İstemci tarafı (bu repoda yapıldı)
Bot (otomatik rakip) aynı kurala göre kurulur: rakibin gücü, oyuncunun kupasının ±%20 aralığındaki rastgele bir kupaya göre seçilir (`afpBotCupBand`, `afpPickBotCups`, `afEffCups`).
