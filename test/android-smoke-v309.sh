#!/usr/bin/env bash
set -euo pipefail

apk=${1:?İmzalı test APK gerekli}
app=com.arenaforgepro.game.v309test
mkdir -p native-results
adb install "$apk" | tee native-results/install.txt
grep -q 'Success' native-results/install.txt
adb shell wm density 160
for size in 360x740 375x667; do
    adb shell am force-stop "$app"
    adb shell wm size "$size"
    adb logcat -c
    adb shell am start -W -n "$app/com.arenaforgepro.game.GameActivity" | tee "native-results/start-$size.txt"
    grep -q 'Status: ok' "native-results/start-$size.txt"
    ready=0
    for attempt in {1..24}; do
        if adb shell uiautomator dump /sdcard/arena-window.xml >/dev/null &&
            adb pull /sdcard/arena-window.xml "native-results/window-$size.xml" >/dev/null &&
            grep -Eiq 'Misafir|Google ile giriş|Şifremi unuttum|Hesap oluştur' "native-results/window-$size.xml" &&
            ! grep -Eq 'Oyun yükleme durumu|Oyun açılamadı' "native-results/window-$size.xml"; then
            ready=1
            break
        fi
        sleep 1
    done
    adb exec-out screencap -p > "native-results/arena-$size.png"
    adb logcat -d -s AndroidRuntime:F > "native-results/runtime-$size.txt"
    test "$ready" -eq 1
    adb shell pidof "$app"
    if grep -E 'FATAL EXCEPTION|Process: com\.arenaforgepro\.game' "native-results/runtime-$size.txt"; then
        exit 1
    fi
    printf 'Android açılışı geçti %s\n' "$size"
done
