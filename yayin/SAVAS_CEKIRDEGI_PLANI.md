# Savaş çekirdeği — sunucuda doğrulama planı

**Soru:** "Sunucu savaş hasarını hesaplamıyor; savaş hesabı oyuncu cihazlarında." Bu belge durumu, neden kolay olmadığını, **şimdi yapılanı** ve gerçek çözümün yol haritasını açıkça anlatır.

## 1. Mevcut mimari (kodla doğrulandı)
- Savaş, `index.html` içinde tek bir `tick(ts)` döngüsüyle (~270 satır) çalışır ve **ekran çizimi, ses, bildirim ve DOM ile iç içedir** (`draw(dt)`, `showNotice`, `updateHUD`, `endGame` doğrudan çağrılır).
- Durum, ana betikte **480'den fazla küresel değişken** olarak tutulur (`gold`, `energyCap`, `units`, `enemySharedHP`, …).
- Zaman **gerçek kare süresine (dt)** bağlıdır (`requestAnimationFrame`, `performance.now`, `Date.now`); sabit adım yoktur. Çekirdekte ayrıca `Math.random` kullanılır.
- 152 minyonun yetenekleri onlarca "yama katmanı" (`af3xx`) olarak üst üste eklenmiştir.
- Çevrim içi maçta **koltuk 1 "ev sahibi"dir**: savaşı kendi cihazında oynatır ve anlık görüntü (snapshot) yayar; koltuk 2 yalnızca bu görüntüleri çizer. Sunucu hamleleri ve görüntüleri **aktarır**, sonuç iki cihazın uyuşmasıyla onaylanır.
- Sonuç: sunucunun savaşı bağımsız **yeniden oynatabilmesi için** (a) belirlenimci, sabit adımlı, ekrandan bağımsız bir çekirdek ve (b) hamlelerin oyun adımına (tick) sabitlenmesi gerekir. İkisi de bugün yok.

## 2. Seçenekler
| Seçenek | Ne sağlar | Maliyet / risk |
|---|---|---|
| **A. Hakem (yapıldı, 3.60.106)** | Kart/enerji kurallarını sunucuda denetler; ücretsiz kart, sonsuz enerji, desteden olmayan kart yakalanır | Küçük; hasar/yetenek hileleri yakalanmaz |
| **B. Belirlenimci çekirdek (lockstep)** | Her iki cihaz + sunucu aynı sonucu üretir; sunucu hasarı gerçekten doğrular | **Çok büyük**: çekirdeğin DOM'dan ayrılması, sabit adım (örn. 30 Hz), tohumlu rastgelelik, hamle→tick eşlemesi, 152 minyon yeteneğinin yeniden doğrulanması, tüm modların yeniden test edilmesi |
| **C. Sunucu tek otorite** | En güvenli | Sunucuda tam oyun motoru + akış; maliyet ve gecikme çok yüksek |

## 3. Önerilen yol haritası (B)
1. **Çekirdek ayrımı:** `tick` içindeki saf simülasyonu (birim hareketi, hedefleme, hasar, yetenekler, enerji) `simStep(state, inputs, dt)` olarak ayır; çizim/ses/HUD yalnızca olay dinleyicisi olsun.
2. **Belirlenimcilik:** sabit adım (1/30 sn), tohumlu rastgelelik (seed sunucudan zaten gelir), kare numarasıyla sıralama, kayan noktada ortak davranış (aynı JS motoru → Node/V8 ile aynı sonuç).
3. **Hamle sabitleme:** sunucu her hamleye hedef adım numarası atar ve iki istemciye aynı anda yayar (lockstep); iki taraf da aynı adımda uygular.
4. **Sunucu yeniden oynatma:** sunucu seed + hamle günlüğünü Node'da `simStep` ile oynatır; son durum (kule canları, kazanan) istemci iddiasıyla **birebir** uyuşmalı.
5. **Gölge modu:** önce yalnızca karşılaştır ve kaydet (ödül/kupa etkilenmez); fark oranı ~0'a inince "otorite" moduna geç.
6. Her modda (arena, gizli bölge, karanlık geçit, bayrak) ayrı ayrı doğrulama.
**Tahmini iş:** haftalar; ayrı bir proje olarak ele alınmalı ve tüm savaş testlerinin (152 minyon) yeniden koşulması gerekir.

## 4. Bu turda yapılan: Sunucu hakemi (3.60.106)
- `battle_referee.js` + `data/card_costs.json` (oyundan üretilen 152 kartın enerji maliyeti; üretici: `yayin/araclar/maliyet_tablosu_uret.js`).
- Denetim 1: kart, oyuncunun bildirdiği desteden olmalı. Denetim 2: **enerji bütçesi** — oynanan kartların toplam maliyeti, sunucu saatine göre kazanılabilecek en çok enerjiyi aşamaz (oyundaki tek enerji kaynakları: başlangıç 2, her 2,4 sn +1, 120. sn'den sonra ×2, en çok 10 "kilit" bonusu).
- İhlalde hamle **engellenmez** (yanlış alarm oyunu bozmasın); maç `suspect:*` işaretlenir: ödül/kupa yok, hesap sayacı artar (24 saatte 3 ihlalde hesap ödülsüz).
- **Yakalar:** ücretsiz/sonsuz enerji, saniyede onlarca kart, desteden olmayan kart. **Yakalamaz:** hasar/menzil/yetenek değiştirme, ~%25'e kadar fazla enerji kazanımı, sahte "kazandım" (iki cihaz anlaşırsa).
