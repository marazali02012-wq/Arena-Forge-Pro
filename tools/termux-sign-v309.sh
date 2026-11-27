#!/usr/bin/env bash
set -euo pipefail

# Termux: pkg install openjdk-17 coreutils
# Kullanım: bash ArenaForgePro_v309_Termux_imzala.sh /yol/v309_IMZASIZ.aab /yol/mevcut-yukleme.jks
bundle=${1:?İmzasız v309 AAB dosyası gerekli.}
keystore=${2:?Mevcut Play yükleme anahtarının dosya yolu gerekli.}
output=${3:-"$(dirname "$bundle")/ArenaForgePro_v309_PLAY_IMZALI.aab"}

[[ -f "$bundle" && -f "$keystore" ]] || { echo 'AAB veya mevcut anahtar dosyası bulunamadı.' >&2; exit 1; }
[[ ! -e "$output" ]] || { echo 'Çıktı dosyası zaten var.' >&2; exit 1; }
command -v keytool >/dev/null && command -v jarsigner >/dev/null ||
    { echo 'Termux’ta önce pkg install openjdk-17 coreutils çalıştır.' >&2; exit 1; }

read -r -p 'Mevcut yükleme anahtarının alias adı: ' alias_name
read -r -p 'Play Console > Uygulama bütünlüğü > Yükleme sertifikası SHA-256: ' expected
read -r -s -p 'Anahtar deposu parolası: ' AFP_STORE_PASS
printf '\n'
read -r -s -p 'Anahtar parolası (depo parolasıyla aynıysa boş bırak): ' AFP_KEY_PASS
printf '\n'
export AFP_STORE_PASS AFP_KEY_PASS

expected=$(printf '%s' "$expected" | tr -d ':[:space:]' | tr '[:lower:]' '[:upper:]')
[[ "$expected" =~ ^[0-9A-F]{64}$ ]] || { echo 'SHA-256 biçimi geçersiz.' >&2; exit 1; }
actual=$(keytool -exportcert -keystore "$keystore" -storepass:env AFP_STORE_PASS -alias "$alias_name" |
    sha256sum | cut -d' ' -f1 | tr '[:lower:]' '[:upper:]')
[[ "$actual" == "$expected" ]] || { echo 'Mevcut anahtar, Play yükleme sertifikasıyla eşleşmiyor.' >&2; exit 1; }

temp=$(mktemp "$(dirname "$output")/.afp309-aab.XXXXXX")
trap 'rm -f "$temp"' EXIT
cp "$bundle" "$temp"
args=()
if [[ -n "$AFP_KEY_PASS" ]]; then args+=(-keypass:env AFP_KEY_PASS); fi
jarsigner -keystore "$keystore" -storepass:env AFP_STORE_PASS "${args[@]}" "$temp" "$alias_name"
jarsigner -verify "$temp"
signed=$(LC_ALL=C keytool -printcert -jarfile "$temp" | awk '/SHA256:/{print $2; exit}' | tr -d ':')
[[ "$signed" == "$expected" ]] || { echo 'Çıktı sertifikası doğrulanamadı.' >&2; exit 1; }
mv -n "$temp" "$output"
if [[ -e "$temp" ]]; then echo 'Çıktı yolu başka işlem tarafından kullanıldı.' >&2; exit 1; fi
printf 'İmzalı AAB: %s\n' "$output"
