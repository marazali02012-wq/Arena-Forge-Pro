package com.arenaforgepro.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
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

        // Full-bleed landscape game: drawing the whole root with display cutout
        // padding created an obvious blank strip on notch/punch-hole phones.
        // HTML has viewport-fit=cover; don't shrink its canvas here.
        if (Build.VERSION.SDK_INT >= 28) {
            android.view.WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.layoutInDisplayCutoutMode =
                    android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attributes);
        }
        root.setPadding(0, 0, 0, 0);
        setContentView(root);
        immersive();
        root.requestApplyInsets();
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        game.loadUrl(START);
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
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
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
