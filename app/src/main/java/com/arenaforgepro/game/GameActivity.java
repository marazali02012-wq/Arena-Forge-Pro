package com.arenaforgepro.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Handler;
import android.os.Looper;
import android.util.TypedValue;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JsResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.window.OnBackInvokedDispatcher;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public final class GameActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private static final String START = "https://" + HOST + "/assets/www/index.html";
    private WebView game;
    private TextView loading;
    private boolean waitingForBack;
    private AlertDialog exitDialog;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    public void onCreate(Bundle state) {
        super.onCreate(state);
        // Draw the game into the landscape display-cutout region instead of leaving a black stripe.
        // HTML viewport-fit=cover and safe-area CSS handle control spacing independently.
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams windowParams = getWindow().getAttributes();
            windowParams.layoutInDisplayCutoutMode = Build.VERSION.SDK_INT >= 30
                    ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                    : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(windowParams);
        }
        // KÖK NEDEN (sol şerit): Android 14 ve öncesinde DecorView varsayılan olarak "fitsSystemWindows"
        // davranır ve içerik alanını uyumluluk ekleri (systemBars | displayCutout) kadar içeri çeker.
        // İmmersive modda sistem çubukları gizli olduğu için onların payı 0 olur, ama yataydaki ön kamera
        // deliğinin (DisplayCutout) payı gizlenemez: içerik soldan ~110 px içeri itilir ve pencere arka
        // planı (#111827) şerit olarak görünür. layoutInDisplayCutoutMode tek başına bunu çözmez; pencere
        // çentiğe uzansa da DecorView içerik alanını yine kırpar. Bu yüzden DecorView'ın ekleri
        // uygulaması kapatılır; WebView tam ekranı kaplar, düğmeler CSS env(safe-area-inset-*) ile korunur.
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
        }
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(17, 24, 39));

        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(17, 24, 39));
        game.setOverScrollMode(View.OVER_SCROLL_NEVER);
        game.setWebViewClient(new LocalGameClient());
        game.setWebChromeClient(new GameChromeClient());
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        root.addView(game, new FrameLayout.LayoutParams(-1, -1));

        loading = new TextView(this);
        loading.setGravity(Gravity.CENTER);
        loading.setBackgroundColor(Color.rgb(17, 24, 39));
        loading.setTextColor(Color.rgb(249, 220, 166));
        loading.setTextSize(18);
        loading.setText("Arena Forge Pro yükleniyor…");
        root.addView(loading, new FrameLayout.LayoutParams(-1, -1));

        // Kök görünüme çentik/sistem çubuğu payı uygulanmaz (sola şerit bırakır). DecorView artık klavye
        // için de yer açmadığından, giriş ekranındaki adjustResize davranışı korunur: yalnız klavye
        // yüksekliği kadar alt boşluk verilir. Sol, sağ ve üst boşluk her zaman 0'dır.
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                int imeBottom = insets.getInsets(WindowInsets.Type.ime()).bottom;
                view.setPadding(0, 0, 0, imeBottom);
                return insets;
            });
        }
        setContentView(root);
        immersive();
        root.requestApplyInsets();
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        game.loadUrl(START);
        if (BuildConfig.DIAG) startLayoutDiagnostics(root);
    }

    // ---- Yalnız test APK (BuildConfig.DIAG): sol şeridin hangi katmanda oluştuğunu cihazda ölçer. ----
    // İlk 25 sn: pencere arka planı KIRMIZI, kök görünüm YEŞİL, WebView arka planı MAVİ. Şeridin rengi kaynağı gösterir.
    // Release AAB'de DIAG=false olduğundan bu kod hiç çalışmaz.
    private TextView diag;
    private final Handler diagHandler = new Handler(Looper.getMainLooper());
    private String diagJs = "";

    private void startLayoutDiagnostics(FrameLayout root) {
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.RED));
        root.setBackgroundColor(Color.GREEN);
        game.setBackgroundColor(Color.BLUE);
        diag = new TextView(this);
        diag.setTextColor(Color.WHITE);
        diag.setBackgroundColor(Color.argb(200, 0, 0, 0));
        diag.setTextSize(TypedValue.COMPLEX_UNIT_SP, 10);
        diag.setPadding(12, 6, 12, 6);
        root.addView(diag, new FrameLayout.LayoutParams(-2, -2, Gravity.TOP | Gravity.CENTER_HORIZONTAL));
        final long t0 = System.currentTimeMillis();
        diagHandler.post(new Runnable() {
            @Override public void run() {
                if (game == null || isFinishing()) return;
                long sec = (System.currentTimeMillis() - t0) / 1000;
                if (sec >= 25) {
                    getWindow().setBackgroundDrawable(new ColorDrawable(Color.rgb(17, 24, 39)));
                    root.setBackgroundColor(Color.rgb(17, 24, 39));
                    game.setBackgroundColor(Color.rgb(17, 24, 39));
                    root.removeView(diag);
                    return;
                }
                game.evaluateJavascript("(function(){var d=document.createElement('div');d.style.cssText='position:fixed;left:env(safe-area-inset-left,0px);right:env(safe-area-inset-right,0px);top:0;height:1px;pointer-events:none';document.documentElement.appendChild(d);var r=d.getBoundingClientRect();d.remove();return 'iw='+innerWidth+'x'+innerHeight+' dpr='+devicePixelRatio+' scr='+screen.width+'x'+screen.height+' safeL='+r.left+' safeR='+(innerWidth-r.right)+' vvL='+(window.visualViewport?visualViewport.offsetLeft:'-');})()",
                        v -> diagJs = v == null ? "" : v.replace("\"", ""));
                diag.setText(describeLayout(root) + "\nJS " + diagJs + "  [" + (25 - sec) + " sn]");
                diagHandler.postDelayed(this, 1000);
            }
        });
    }

    private static String box(View v) {
        int[] p = new int[2];
        v.getLocationOnScreen(p);
        return "x" + p[0] + " y" + p[1] + " w" + v.getWidth() + " h" + v.getHeight()
                + (v.getPaddingLeft() + v.getPaddingRight() + v.getPaddingTop() + v.getPaddingBottom() > 0
                ? " pad" + v.getPaddingLeft() + "," + v.getPaddingTop() + "," + v.getPaddingRight() + "," + v.getPaddingBottom() : "");
    }

    private String describeLayout(View root) {
        StringBuilder b = new StringBuilder();
        b.append("SDK ").append(Build.VERSION.SDK_INT).append(" ").append(Build.MANUFACTURER).append(" ").append(Build.MODEL);
        if (Build.VERSION.SDK_INT >= 30) {
            android.graphics.Rect m = getWindowManager().getCurrentWindowMetrics().getBounds();
            android.graphics.Rect mx = getWindowManager().getMaximumWindowMetrics().getBounds();
            b.append(" rot").append(getDisplay().getRotation()).append(" win ").append(m.toShortString()).append(" max ").append(mx.toShortString());
        }
        View decor = getWindow().getDecorView();
        View content = findViewById(android.R.id.content);
        b.append("\nDECOR ").append(box(decor)).append(" | CONTENT ").append(box(content));
        b.append("\nROOT ").append(box(root)).append(" | WEBVIEW ").append(box(game));
        WindowInsets in = decor.getRootWindowInsets();
        if (in != null) {
            if (Build.VERSION.SDK_INT >= 28 && in.getDisplayCutout() != null) {
                android.view.DisplayCutout c = in.getDisplayCutout();
                b.append("\nCUTOUT L").append(c.getSafeInsetLeft()).append(" T").append(c.getSafeInsetTop())
                        .append(" R").append(c.getSafeInsetRight()).append(" B").append(c.getSafeInsetBottom());
            } else b.append("\nCUTOUT yok");
            if (Build.VERSION.SDK_INT >= 30) {
                b.append(" | BARS ").append(in.getInsets(WindowInsets.Type.systemBars()))
                        .append(" | BARS(gizli dahil) ").append(in.getInsetsIgnoringVisibility(WindowInsets.Type.systemBars()));
            }
        }
        return b.toString();
    }

    @Override
    public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused) immersive();
    }

    @SuppressWarnings("deprecation")
    private void immersive() {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.systemBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            // LAYOUT_* bayrakları API 28-29'da DecorView'ın çentik/sistem çubuğu payını uygulamasını engeller.
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    private void handleBack() {
        if (game == null || waitingForBack || (exitDialog != null && exitDialog.isShowing())) return;
        waitingForBack = true;
        game.evaluateJavascript("window.AFPAndroidNavigation?.back() === true", handled -> {
            waitingForBack = false;
            if ("true".equals(handled) || isFinishing() || isDestroyed()) return;
            exitDialog = new AlertDialog.Builder(this)
                    .setMessage("Oyundan çıkılsın mı?")
                    .setNegativeButton("Oyunda kal", null)
                    .setPositiveButton("Çık", (dialog, which) -> finish())
                    .show();
        });
    }

    @Override
    protected void onPause() {
        if (game != null) game.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (game != null) game.onResume();
    }

    @Override
    protected void onDestroy() {
        if (game != null) {
            ((FrameLayout) game.getParent()).removeView(game);
            game.destroy();
            game = null;
        }
        super.onDestroy();
    }

    private static boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
                && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    /**
     * WebView, bir WebChromeClient olmadan JavaScript confirm()/alert() çağrılarını sessizce iptal eder.
     * Oyun buluta yedekleme/geri yükleme, hesaba bağlama, loncadan ayrılma ve misafir ilerlemesini
     * kopyalama için confirm() kullanıyor; bu pencereler artık gerçekten gösterilir.
     */
    private final class GameChromeClient extends WebChromeClient {
        private boolean usable() {
            return !isFinishing() && !isDestroyed();
        }

        @Override
        public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
            if (!usable()) {
                result.cancel();
                return true;
            }
            new AlertDialog.Builder(GameActivity.this)
                    .setMessage(message)
                    .setCancelable(true)
                    .setPositiveButton("Tamam", (dialog, which) -> result.confirm())
                    .setOnCancelListener(dialog -> result.cancel())
                    .show();
            return true;
        }

        @Override
        public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
            if (!usable()) {
                result.cancel();
                return true;
            }
            new AlertDialog.Builder(GameActivity.this)
                    .setMessage(message)
                    .setCancelable(true)
                    .setPositiveButton("Tamam", (dialog, which) -> result.confirm())
                    .setNegativeButton("İptal", (dialog, which) -> result.cancel())
                    .setOnCancelListener(dialog -> result.cancel())
                    .show();
            return true;
        }
    }

    private final class LocalGameClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (!isLocal(uri)) return null;
            try {
                if ("GET".equals(request.getMethod()) && "/assets/www/index.html".equals(uri.getPath())) {
                    return new WebResourceResponse("text/html", "UTF-8", getAssets().open("www/index.html"));
                }
            } catch (IOException ignored) {
                // Report the failed local load through onReceivedHttpError.
            }
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", Collections.emptyMap(),
                    new ByteArrayInputStream("Dosya bulunamadı.".getBytes(StandardCharsets.UTF_8)));
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri url = request.getUrl();
            if (isLocal(url)) return !"/assets/www/index.html".equals(url.getPath());
            if (request.isForMainFrame() && request.hasGesture() && "https".equals(url.getScheme())) {
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, url));
                } catch (ActivityNotFoundException ignored) {
                    // The game remains visible if there is no browser available.
                }
            }
            return true;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            if (START.equals(url) && !Boolean.TRUE.equals(loading.getTag())) {
                loading.setVisibility(View.GONE);
            }
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) showLoadError();
        }

        @Override
        public void onReceivedHttpError(WebView view, WebResourceRequest request, WebResourceResponse response) {
            if (request.isForMainFrame()) showLoadError();
        }

        private void showLoadError() {
            loading.setTag(true);
            loading.setText("Oyun açılamadı. Tekrar denemek için dokun.");
            loading.setVisibility(View.VISIBLE);
            loading.setOnClickListener(v -> {
                loading.setOnClickListener(null);
                loading.setTag(false);
                loading.setText("Arena Forge Pro yükleniyor…");
                game.loadUrl(START);
            });
        }
    }
}
