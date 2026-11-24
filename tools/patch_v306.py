#!/usr/bin/env python3
"""Arena Forge Pro v306: APK'da "Google ile devam et".
Kullanım: python3 patch_v306.py girdi.html cikti.html  (girdi v305 olmalı)
Google, uygulama içi WebView'da OAuth girişini engeller. APK'da giriş sayfası telefonun tarayıcısında
(Chrome Custom Tab) açılır; Supabase, PKCE kodunu <paket adı>://auth-callback adresine geri yollar;
GameActivity bu bağlantıyı yakalayıp oyuna verir; oturum mevcut PKCE doğrulamasıyla açılır.
Google erişim anahtarı saklanmaz (yalnız Supabase oturumu). Web sürümünün akışı değişmez."""
import sys

MARK = 'AFP_V306_ANDROID_GOOGLE_20261124'


def apply(html: str) -> str:
    if MARK in html:
        raise SystemExit('Zaten uygulanmış: ' + MARK)
    if 'AFP_V305_PORTAL_LINE_20261124' not in html:
        raise SystemExit('Önce v305 yaması uygulanmalı')

    def patch(old, new, expected=1, tag=''):
        nonlocal html
        n = html.count(old)
        if n != expected:
            raise SystemExit(f'{tag}: {expected} eşleşme beklendi, {n} bulundu')
        html = html.replace(old, new)

    # 1) Giriş ekranı: APK'da Google düğmesi yalnız yerel köprü yoksa gizlenir; gizlilik düğmesi kalır.
    patch("if(location.hostname==='appassets.androidplatform.net'&&bGoogle){\n"
          "  bGoogle.style.setProperty('display','none','important');\n",
          "if(location.hostname==='appassets.androidplatform.net'&&bGoogle){\n"
          "  /* v3.60.306 " + MARK + ": yerel güvenli giriş köprüsü varsa Google düğmesi görünür */\n"
          "  if(!(window.AFPAndroidAuth&&typeof window.AFPAndroidAuth.openExternal==='function'))bGoogle.style.setProperty('display','none','important');\n",
          tag='giriş ekranı Google düğmesi')

    # 2) OAuth modülü: yerel köprü yolu
    patch("  const getPending=()=>{try{return JSON.parse(sessionStorage.getItem(PENDING)||'null');}catch(_){return null;}};",
          "  const getPending=()=>{try{return JSON.parse(sessionStorage.getItem(PENDING)||'null');}catch(_){return null;}};\n"
          "  /* v3.60.306: APK yolu. Bekleyen giriş localStorage'da tutulur (tarayıcıdan dönüşte WebView yeniden kurulmuş olabilir). */\n"
          "  const NATIVE_PENDING='afpGooglePKCENativeV1';\n"
          "  const bridge=()=>{const b=window.AFPAndroidAuth;return location.hostname==='appassets.androidplatform.net'&&b&&typeof b.openExternal==='function'&&typeof b.redirectUri==='function'?b:null;};\n"
          "  const getNativePending=()=>{try{return JSON.parse(localStorage.getItem(NATIVE_PENDING)||'null');}catch(_){return null;}};",
          tag='yerel bekleyen giriş')
    patch("  function runtimeOK(){\n",
          "  function runtimeOK(){\n"
          "    if(bridge()){if(!crypto||!crypto.subtle||!crypto.getRandomValues)throw new Error('Cihaz güvenli Google girişi için gereken şifreleme özelliğini desteklemiyor.');return;}\n",
          tag='APK çalışma kontrolü')
    patch("    const redirect=new URL(location.pathname,location.origin);redirect.searchParams.set('afp_google','1');redirect.searchParams.set('afp_tx',tx);\n"
          "    sessionStorage.setItem(PENDING,JSON.stringify({verifier,tx,created:Date.now(),origin:location.origin}));\n"
          "    const u=new URL('/auth/v1/authorize',BASE);u.searchParams.set('provider','google');u.searchParams.set('redirect_to',redirect.toString());u.searchParams.set('code_challenge',challenge);u.searchParams.set('code_challenge_method','s256');\n"
          "    location.assign(u.toString());\n",
          "    const nb=bridge();\n"
          "    if(nb){\n"
          "      const back=String(nb.redirectUri()||'');if(!/^[a-z][a-z0-9.+-]*:\\/\\/auth-callback$/.test(back))throw new Error('Uygulama dönüş adresi geçersiz.');\n"
          "      const redirectTo=back+'?afp_google=1&afp_tx='+encodeURIComponent(tx);\n"
          "      localStorage.setItem(NATIVE_PENDING,JSON.stringify({verifier,tx,created:Date.now(),origin:back}));\n"
          "      const au=new URL('/auth/v1/authorize',BASE);au.searchParams.set('provider','google');au.searchParams.set('redirect_to',redirectTo);au.searchParams.set('code_challenge',challenge);au.searchParams.set('code_challenge_method','s256');\n"
          "      if(!nb.openExternal(au.toString())){try{localStorage.removeItem(NATIVE_PENDING);}catch(_){}throw new Error('Güvenli Google giriş sayfası açılamadı. Cihazda bir tarayıcı (Chrome) olmalı.');}\n"
          "      return;\n"
          "    }\n"
          "    const redirect=new URL(location.pathname,location.origin);redirect.searchParams.set('afp_google','1');redirect.searchParams.set('afp_tx',tx);\n"
          "    sessionStorage.setItem(PENDING,JSON.stringify({verifier,tx,created:Date.now(),origin:location.origin}));\n"
          "    const u=new URL('/auth/v1/authorize',BASE);u.searchParams.set('provider','google');u.searchParams.set('redirect_to',redirect.toString());u.searchParams.set('code_challenge',challenge);u.searchParams.set('code_challenge_method','s256');\n"
          "    location.assign(u.toString());\n",
          tag='giriş başlatma')
    patch("  window.AFPGoogleOAuth=Object.freeze({start,complete});",
          "  /* v3.60.306: tarayıcıdan dönen <paket>://auth-callback?... bağlantısı GameActivity tarafından verilir.\n"
          "     Yalnız bu cihazda başlatılmış, 10 dakikadan eski olmayan ve aynı işlem kimliğini taşıyan kod kabul edilir. */\n"
          "  let nativeBusy=false;\n"
          "  async function completeFromApp(link){\n"
          "    const nb=bridge();if(!nb||nativeBusy)return false;\n"
          "    let u;try{u=new URL(String(link||''));}catch(_){return false;}\n"
          "    const back=String(nb.redirectUri()||'');\n"
          "    if(u.protocol+'//'+u.host!==back||u.searchParams.get('afp_google')!=='1')return false;\n"
          "    nativeBusy=true;const pending=getNativePending();\n"
          "    const code=u.searchParams.get('code'),err=u.searchParams.get('error')||u.searchParams.get('error_code'),tx=u.searchParams.get('afp_tx');\n"
          "    try{\n"
          "      if(!pending||!pending.tx||pending.tx!==tx||pending.origin!==back||Date.now()-pending.created>600000||Date.now()<pending.created-60000)throw new Error('Google oturum güvenliği doğrulanamadı. Girişi yeniden başlat.');\n"
          "      if(err)throw new Error(err==='access_denied'?'Google girişi iptal edildi.':'Google giriş hatası: '+String(u.searchParams.get('error_description')||err).slice(0,120));\n"
          "      if(!code)throw new Error('Google girişinden doğrulama kodu dönmedi.');\n"
          "      const api=window.AFPCloudAuth; if(!api||!api.beginExternal||!api.completeExternal)throw new Error('Oturum modülü yüklenemedi.');\n"
          "      const attempt=api.beginExternal();\n"
          "      const r=await request('/auth/v1/token?grant_type=pkce',{method:'POST',body:JSON.stringify({auth_code:code,code_verifier:pending.verifier})});\n"
          "      if(!r.ok)throw new Error('Google oturumu açılmadı (HTTP '+r.status+'). Yeniden dene.');\n"
          "      const session=api.completeExternal(r.data,attempt);\n"
          "      if(session.cancelled)return true;\n"
          "      if(window.AFQEntry&&window.AFQEntry.googleSignedIn)window.AFQEntry.googleSignedIn(session);\n"
          "    }catch(e){if(window.AFQEntry&&window.AFQEntry.googleError)window.AFQEntry.googleError(String(e&&e.message||e));}\n"
          "    finally{nativeBusy=false;try{localStorage.removeItem(NATIVE_PENDING);}catch(_){}}\n"
          "    return true;\n"
          "  }\n"
          "  window.AFPGoogleOAuth=Object.freeze({start,complete,completeFromApp}); /* " + MARK + " */",
          tag='uygulamadan dönüş')
    return html


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    h = open(src, encoding='utf-8').read()
    out = apply(h)
    open(dst, 'w', encoding='utf-8').write(out)
    print('v306 uygulandı', len(h.encode()), '->', len(out.encode()))
