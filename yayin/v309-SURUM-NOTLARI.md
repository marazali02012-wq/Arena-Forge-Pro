# Arena Forge Pro v3.60.309

- Play paket kimliği `com.arenaforgepro.game`, sürüm kodu `309`.
- GitHub kopyası için gerekirse sırayla `python3 tools/recovery/restore-html.py`, `python3 onarim-v309/patch-html.py` ve `python3 tools/set-version.py 309` çalıştırılır. Kaynak ZIP’inde oyun HTML’si hazırdır.
- APK ve AAB derleme komutu `./gradlew :app:assembleDebug :app:bundleRelease`. JDK 17 ve Android SDK 36 gerekir. Test APK’sı mevcut Play kurulumuyla aynı telefonda yan yana açılır.
- İmzasız AAB’yi mevcut Play yükleme anahtarıyla imzalamak için `bash tools/termux-sign-v309.sh DOSYA.aab MEVCUT_ANAHTAR.jks` kullanılır.
- Render değişikliği ayrı sunucu deposunun `repair/v309` dalında. `sunucu/render-server-v309.js` aynı değişikliğin kaynak kopyası.
- Supabase sıralama düzeltmesi `sunucu/supabase/v309_trophy_leaderboard.sql` dosyasında. Var olan hesap ve kupa tablolarını kullanır.
- WebSocket protokol kimliği `v3.60.26`. Play güncelleme kontrolü mevcut Android kodunu kullanır. v309 oyunculara ulaşana kadar Render minimum istemci sürümü `308` tutulur.
