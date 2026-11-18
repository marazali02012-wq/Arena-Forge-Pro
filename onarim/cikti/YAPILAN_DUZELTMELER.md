# Yapılan düzeltmeler — v3.60.261 → v3.60.262

- **Kaynak:** `kaynak/ARENA_FORGE_PRO_v3.60.261_CALISMA_KOPYASI.html`. Dokunulmadı; SHA-256 `83ae2ecd…851def`.
- **Çıktı:** `cikti/ARENA_FORGE_PRO_v3.60.262.html`, 46.893.179 bayt (+1.407 bayt). SHA-256 `0112308a1e13b4a7a74bf5c0f029bdebb0c5c79fb127ba38546a0e0b9bb06bef`.
- **Nasıl üretildi:** `araclar/patch_v262.py v261.html v262.html`. Yama 10 değişiklik uygular. Her değişiklik kaynakta tam bir kez geçen bir metne bağlıdır. Kaynak SHA'sı farklıysa yama hiçbir şey yazmadan durur.
- **Değişmeyenler:** savaş kuralları, hasar/portal/ödül değerleri, kayıt anahtarı (`arenaForgeProProfileV19`), çevrim içi kod.

Hatalar, oyunu Chromium'da gerçekten oynatırken bulundu. Ayrıntılar `9_MOD_TEST_MATRISI.md` dosyasında. Kod incelemesiyle tahmin edilip düzeltilen bir şey yok.

---

## 1. Hikâye Seferi: aşama paneli kesiliyordu

| | |
|---|---|
| **Mod** | Hikâye Seferi (`campaign`) lobisi; aynı kural Gökyüzü/Sancak gibi `[data-mode]` pencerelerindeki sağ sayfaya da uygulanıyor |
| **Belirti** | Sağ paneldeki **"AŞAMA 1 / 10 · TOPLAM 1 / 250"** ve **"BÜYÜ / ÖNERİLEN KART SV"** satırları görünmüyordu. Aşama düğmelerinin üst yarısı da kesikti. Kaydırarak da ulaşılamıyordu. 740×360, 667×375 ve 800×360'ın üçünde de vardı. |
| **Kök neden** | `.afx-pageR` kutusunda `overflow:auto` ile `justify-content:center` birlikte kullanılıyordu. İçerik (114 px) kutudan (84 px) uzun olunca flex ortalama taşmayı iki yana böldü. Üste taşan kısım kaydırma alanının dışında kaldı. |
| **Düzeltme** | CSS satırı ~42365. `justify-content:flex-start`, ayrıca ilk çocuğa `margin-top:auto`, son çocuğa `margin-bottom:auto` ("güvenli ortalama"). Yer varsa içerik yine ortalı durur. Yer yoksa üstten başlar ve tamamı kaydırılabilir. Eski Android WebView'larda da çalışır (`safe center` gerekmez). |
| **Test** | Tarayıcı, üç ölçüde: ilk satırın üst kenarı kutunun içinde (`firstVisible:true`). Ekran görüntüsü: `ekran_goruntuleri/once_sonra/hikaye_paneli_ONCE_v261.webp` ve `…SONRA_v262.webp`. Kod testi: `test_v262.js` "güvenli ortalama". |

## 2. Sancak Hâkimiyeti: skor kutusu üst koridoru kapatıyordu

| | |
|---|---|
| **Mod** | Sancak Hâkimiyeti (`flag`) savaşı |
| **Belirti** | "SEN 26 ⚑⚑⚑ 5 RAKİP / 90" kutusu `top:96px` konumundaydı. 360 px yüksek ekranda bu nokta üst koridorun ortası, yani birliklerin savaştığı yer. Görev metni bunu açıkça yasaklıyor ("bildirimler koridorları kapatmayacak"). |
| **Kök neden** | Ayrı bir DOM kutusu (`#af36FlagHud`, CSS `.af36-flag-hud`) sabit piksel konumuna yerleştirilmişti. Aynı skor üst şeritte (`#battleProMode`) zaten yazıyordu. Bayrak sahipliği de her koridorda tuvalde renkli bayrakla çiziliyordu. |
| **Düzeltme** | (a) `.af36-flag-hud` `display:none`. (b) `af36ModeLabel()` şerit etiketine hedef puanı ekler: "⚑ BAYRAK · 26-5 / 90". (c) **İlk düzeltmeden sonra bulunan yan etki de giderildi:** Sancak modunda olay hapı CSS ile gizli olduğundan, her savaş olayında (~2 sn, `notice-active`) şerit tamamen boş kalıyor ve skor görünmüyordu. `af36FlagHud()` artık şeride `data-af262-flag` işareti koyuyor ve maç bitince kaldırıyor. Yeni CSS kuralı yalnız bu modda skor hapını olay sırasında da görünür tutuyor. |
| **Test** | Tarayıcı: 4 tam Sancak maçı UI'dan, çevrim içi kuyruk → yerel yedek. 12 örnekte skor her an görünür, `notice-active` sırasında dahil. Maç bitince işaret kalkıyor. Sonuçlar `af36Flag` kaydına yazılıyor. Ekran görüntüsü: `once_sonra/sancak_ONCE_v261.webp` ve `sancak_SONRA_v262.webp`. Kod testi: `test_v262.js` 3 Sancak testi. |

## 3. Gölge Suikastçı: oyuncu kendi birimini göremiyordu

| | |
|---|---|
| **Mod** | Bütün savaş modları (kart: `af37_golge_suikastci`) |
| **Belirti** | Oyuncu kartı oynadığında sahada ne birim ne can çubuğu çıkıyordu; kart çalışmamış gibi görünüyordu. Gizlilik iki takıma da uygulanıyordu. |
| **Kök neden** | `drawHero()` (≈ satır 4165) ve `af320DrawHeroLegacy()` (≈ satır 3395), gizli suikastçıyı takımına bakmadan çizmeden döndürüyordu. Can çubuğu da `u._vis` boş kaldığı için çıkmıyordu. |
| **Düzeltme** | Dost takımın gizli suikastçısı aynı çizim yolundan bir kez daha geçirilir, `ctx.globalAlpha` 0,42 ile (`ctx.save/restore` korumalı). Rakibin suikastçısı görünmez kalır. **Hedefleme kuralı değişmedi** (iki taraf için hâlâ aynı, satır ~6439). Yalnız görsel. |
| **Test** | Tarayıcı: sahada bir dost ve bir düşman suikastçı. Dost `_vis` dolu, can çubuğu 150/209, yarı saydam. Düşman `_vis` boş. Ekran görüntüsü: `once_sonra/gizli_suikastci_*.webp`. Kod testi: `test_v262.js`, gerçek `drawHero` başı sahte `ctx` ile çalıştırıldı; dost 0,42, düşman çizilmedi, açığa çıkınca tam opak, `restore` sonrası alfa 1. |

## 4. Koleksiyon: "Yeni Karakterler (50)" etiketi yanlıştı

| | |
|---|---|
| **Ekran** | KOLEKSİYON → YENİ KARAKTERLER sekmesi |
| **Belirti** | Sekme 50 diyor; liste "Tümü (49)" ve "sahip olunan x/49" gösteriyordu. |
| **Kök neden** | Keşifçi (`af37_kesifci`) v3.60.186'da emekli edildi (Orman Okçusu ile aynı görünüm; `AF3406_RETIRED_CARD_IDS`). Sekme etiketi ise elle yazılmış ve güncellenmemişti (script #55). |
| **Düzeltme** | Etiket "YENİ KARAKTERLER (49)". İngilizce çeviri regex'i sayıdan bağımsız olduğu için etkilenmez. |
| **Test** | Tarayıcı: listede 49 af37 kartı. Eksik olanlar Keşifçi ve iki Platin kart; Platin kartlar kendi sekmesinde. Kod testi: `test_v262.js`. |

## 5. Sürüm etiketi

`<meta name="afp-build">`, `<title>` ve dosya başındaki açıklama yorumu v3.60.262 yapıldı. Eski sürüm yorumları korundu.

---

## Doğrulama özeti (v3.60.262)

| Test | Sonuç |
|---|---|
| 105 çalıştırılabilir JS bloğu `node --check` | **0 hata** |
| Eski savaş motoru testleri (`test_logic.js`) | **17/17** |
| Eski kart portresi testleri (`test_portraits261.js`) | **10/10** |
| Yeni regresyon testleri (`test_v262.js`) | **9/9** (aynı testler v261'de 7 yerde **kalıyor**; yani gerçekten değişikliği ölçüyor) |
| Tarayıcı regresyonu v262 | İlk açılış eğitim savaşı (zafer), 4 Sancak maçı, Kule kat 1 (zafer → kat 2), Yankı İstilası final boss (zafer → aşama 2). Savaş döngüsü hata sayacı (`__arenaForgeTickErrors`) **0**, sayfa hatası **0** |

Hepsi tek komutla: `bash cikti/testler/testleri_calistir.sh cikti/ARENA_FORGE_PRO_v3.60.262.html`

## Bilerek değiştirilmeyenler

- **Pes etme sayılmıyor:** "Savaştan çık" penceresi "mağlubiyet sayılacak" diyor. Kod ise `suppressRewards:true` ile maçı **hiç** istatistiğe yazmıyor (kule/mod kaybı 0 kalıyor). Bu, "N savaş oyna" görevlerinin başlat-pes et ile doldurulmasını engelliyor olabilir. Hangisinin doğru olduğu **senin kararın**; bkz. `KALAN_EKSIKLER.md`.
- Savaş dengesi (Kolosus hızı, Yankı boss canı, Arena yapay zekâsı) ölçüldü ama değiştirilmedi. Gözlemler `9_MOD_TEST_MATRISI.md` dosyasında.
