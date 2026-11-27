#!/usr/bin/env bash
set -euo pipefail

input=${1:?İmzasız AAB yolu gerekli}
output=${2:?İmzalı AAB yolu gerekli}
: "${UPLOAD_KEYSTORE_PATH:?Yükleme anahtarı dosyası gerekli}"
: "${UPLOAD_KEYSTORE_PASSWORD:?Anahtar deposu parolası gerekli}"
: "${UPLOAD_KEY_ALIAS:?Yükleme anahtarı adı gerekli}"
: "${PLAY_UPLOAD_CERT_SHA256:?Play Console yükleme sertifikası SHA-256 değeri gerekli}"

expected=$(printf '%s' "$PLAY_UPLOAD_CERT_SHA256" | tr -d ':[:space:]' | tr '[:lower:]' '[:upper:]')
[[ "$expected" =~ ^[0-9A-F]{64}$ ]]
actual=$(keytool -exportcert -keystore "$UPLOAD_KEYSTORE_PATH" -storepass:env UPLOAD_KEYSTORE_PASSWORD \
    -alias "$UPLOAD_KEY_ALIAS" | sha256sum | cut -d' ' -f1 | tr '[:lower:]' '[:upper:]')
if [[ "$actual" != "$expected" ]]; then
    echo 'Yükleme anahtarı Play Console sertifikasıyla eşleşmiyor.' >&2
    exit 1
fi

temp=$(mktemp "$(dirname "$output")/.aab.XXXXXX")
trap 'rm -f "$temp"' EXIT
cp "$input" "$temp"
args=()
if [[ -n "${UPLOAD_KEY_PASSWORD:-}" ]]; then args+=("-keypass:env" "UPLOAD_KEY_PASSWORD"); fi
jarsigner -keystore "$UPLOAD_KEYSTORE_PATH" -storepass:env UPLOAD_KEYSTORE_PASSWORD \
    "${args[@]}" "$temp" "$UPLOAD_KEY_ALIAS"
jarsigner -verify "$temp"
signed_fingerprint=$(LC_ALL=C keytool -printcert -jarfile "$temp" | awk '/SHA256:/{print $2; exit}' | tr -d ':')
[[ "$signed_fingerprint" == "$expected" ]]
mv "$temp" "$output"
printf 'Play yükleme sertifikası SHA-256 %s\n' "$expected"
