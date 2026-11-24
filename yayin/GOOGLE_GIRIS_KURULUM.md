# "Google ile devam et": kurulum (v306)

Uygulama tarafı hazır. **Supabase projenizde Google sağlayıcısı şu an kapalı** (`/auth/v1/settings` yanıtında `"google": false`). Aşağıdaki ayarlar yapılmadan düğme yalnızca "Google girişi Supabase projesinde henüz etkin değil." mesajını gösterir. Bu ayarları yalnızca hesap sahibi yapabilir.

## 1. Google Cloud Console

Adres: https://console.cloud.google.com

1. Bir proje seçin veya yeni proje oluşturun.
2. **APIs & Services → OAuth consent screen** bölümünde:
   - Kullanıcı türü: **External**.
   - Uygulama adı: Arena Forge Pro. Destek e-postanızı ve geliştirici e-postanızı girin.
   - Kapsamlar: `openid`, `email`, `profile` (varsayılanlar yeterli).
   - Yayınlanmadan önce yalnızca **Test users** listesindeki hesaplar giriş yapabilir. 12 kişilik kapalı test için testçilerin Google hesaplarını buraya ekleyin ya da uygulamayı yayınlayın.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** bölümünde:
   - Uygulama türü: **Web application**. Android değil; giriş tarayıcıda yapılıyor.
   - **Authorized redirect URIs** alanına şunu ekleyin:
     `https://lvjivtnnclaotayncavj.supabase.co/auth/v1/callback`
   - Oluşan **Client ID** ve **Client secret** değerlerini kopyalayın.

## 2. Supabase

Adres: https://supabase.com/dashboard, proje `lvjivtnnclaotayncavj`.

1. **Authentication → Sign In / Providers → Google**:
   - **Enable Sign in with Google** seçeneğini açın.
   - Client ID ve Client Secret değerlerini yapıştırıp kaydedin.
2. **Authentication → URL Configuration → Redirect URLs** listesine şunları ekleyin:
   - `com.arenaforgepro.game://auth-callback**` (yayın sürümü)
   - `com.arenaforgepro.game.v306test://auth-callback**` (test APK'sı)
   - Web sürümünde de Google girişi istiyorsanız Netlify adresiniz, örneğin `https://SİTENİZ.netlify.app/**`.

Bir adres bu listede yoksa Supabase girişten sonra oyuna değil, "Site URL" adresine döner.

## 3. Telefonda deneme

1. **AFP v306 Test** APK'sını kurun. Asıl oyunu silmez.
2. Giriş ekranında **Google ile giriş** düğmesine basın. Chrome içinde güvenli giriş sayfası açılır.
3. Hesabınızı seçin. Tarayıcı sizi otomatik olarak oyuna geri döndürür ve oturum açılır. İlk açılışta Android "AFP v306 Test ile aç" diye sorabilir.

## Güvenlik

- **Uygulamada saklanan:** yalnızca Supabase oturumu. Google erişim anahtarı saklanmaz.
- **PKCE:** her giriş tek kullanımlık doğrulayıcı ve işlem kimliğiyle yapılır; 10 dakika geçerlidir. Başka şemadan gelen, yanlış kimlikli ya da tekrar kullanılan dönüş bağlantıları reddedilir.
- **Android köprüsü** (`AFPAndroidAuth`): yalnızca yerel oyun sayfasına açıktır ve yalnızca Supabase projenizin `/auth/v1/authorize?provider=google` adresini, uygulamanın kendi dönüş adresiyle açabilir.
