package com.arenaforgepro.game;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import com.google.android.play.core.appupdate.AppUpdateInfo;
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.appupdate.AppUpdateOptions;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;

final class PlayUpdateGate {
    private static final int REQUEST_UPDATE = 3081;
    private static final long CHECK_TIMEOUT_MS = 5_000;
    private static final int DARK = Color.rgb(17, 24, 39);
    private static final int GOLD = Color.rgb(249, 220, 166);

    private final Activity activity;
    private final AppUpdateManager manager;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final View game;
    private final Runnable onLock;
    private final ScrollView screen;
    private final TextView title;
    private final TextView message;
    private final Button action;
    private final Button store;

    private int checkId;
    private boolean resumed;
    private boolean required;
    private boolean firstCheck = true;
    private boolean checking;
    private boolean flowOpen;
    private boolean cancelled;

    PlayUpdateGate(Activity activity, FrameLayout root, View game, Runnable onLock) {
        this.activity = activity;
        this.game = game;
        this.onLock = onLock;
        manager = AppUpdateManagerFactory.create(activity);
        screen = new ScrollView(activity);
        screen.setFillViewport(true);
        screen.setBackgroundColor(DARK);
        screen.setClickable(true);

        LinearLayout column = new LinearLayout(activity);
        column.setOrientation(LinearLayout.VERTICAL);
        column.setGravity(Gravity.CENTER);
        int inset = Math.round(24 * activity.getResources().getDisplayMetrics().density);
        column.setPadding(inset, inset, inset, inset);
        screen.addView(column, new ScrollView.LayoutParams(-1, -2));

        title = new TextView(activity);
        title.setTextColor(GOLD);
        title.setTextSize(24);
        title.setGravity(Gravity.CENTER);
        if (android.os.Build.VERSION.SDK_INT >= 28) title.setAccessibilityHeading(true);
        column.addView(title);

        message = new TextView(activity);
        message.setTextColor(Color.WHITE);
        message.setTextSize(16);
        message.setGravity(Gravity.CENTER);
        message.setPadding(0, inset / 2, 0, inset / 2);
        column.addView(message);

        action = new Button(activity);
        action.setText("Güncelle");
        action.setOnClickListener(view -> check(true));
        column.addView(action);

        store = new Button(activity);
        store.setText("Google Play’i aç");
        store.setOnClickListener(view -> openStore());
        column.addView(store);

        root.addView(screen, new FrameLayout.LayoutParams(-1, -1));
        render("Google Play güncellemesi kontrol ediliyor…");
    }

    boolean blocksGame() {
        return firstCheck || required;
    }

    void onResume() {
        resumed = true;
        if (!flowOpen) check(false);
    }

    void onPause() {
        resumed = false;
        checking = false;
        checkId++;
        handler.removeCallbacksAndMessages(null);
    }

    void destroy() {
        onPause();
    }

    void onActivityResult(int requestCode, int resultCode) {
        if (requestCode != REQUEST_UPDATE) return;
        flowOpen = false;
        cancelled = resultCode != Activity.RESULT_OK;
        render(cancelled ? "Güncelleme tamamlanmadı. Yeniden deneyin." : "Kurulum doğrulanıyor…");
        if (resumed) check(false);
    }

    private void check(boolean requestedByPlayer) {
        if (!resumed || checking || flowOpen || activity.isFinishing()) return;
        checking = true;
        int id = ++checkId;
        render("Google Play güncellemesi kontrol ediliyor…");
        handler.postDelayed(() -> failed(id), CHECK_TIMEOUT_MS);
        manager.getAppUpdateInfo()
                .addOnSuccessListener(info -> checked(id, info, requestedByPlayer))
                .addOnFailureListener(error -> failed(id));
    }

    private boolean finishCheck(int id) {
        if (id != checkId || !checking || !resumed || activity.isFinishing()) return false;
        checking = false;
        firstCheck = false;
        handler.removeCallbacksAndMessages(null);
        return true;
    }

    private void failed(int id) {
        if (finishCheck(id)) {
            render("Google Play’e ulaşılamadı. Bağlantınızı kontrol edip yeniden deneyin.");
        }
    }

    private void checked(int id, AppUpdateInfo info, boolean requestedByPlayer) {
        if (!finishCheck(id)) return;
        int availability = info.updateAvailability();
        boolean inProgress = availability == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS;
        if (availability == UpdateAvailability.UPDATE_NOT_AVAILABLE) {
            required = false;
            cancelled = false;
        } else if (availability == UpdateAvailability.UPDATE_AVAILABLE || inProgress) {
            if (!required) onLock.run();
            required = true;
        }
        render("Devam etmek için Arena Forge Pro’yu güncelleyin.");
        if (required && (requestedByPlayer || (inProgress && !cancelled))) {
            if (inProgress || info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
                startImmediate(info);
            } else {
                openStore();
            }
        }
    }

    private void startImmediate(AppUpdateInfo info) {
        try {
            flowOpen = manager.startUpdateFlowForResult(
                    info, activity, AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build(),
                    REQUEST_UPDATE);
            if (flowOpen) return;
        } catch (android.content.IntentSender.SendIntentException ignored) {
            // The retry and Google Play buttons remain available.
        }
        render("Güncelleme başlatılamadı. Yeniden deneyin veya Google Play’i açın.");
    }

    private void openStore() {
        Intent intent = new Intent(Intent.ACTION_VIEW,
                Uri.parse("market://details?id=" + activity.getPackageName()));
        intent.setPackage("com.android.vending");
        try {
            activity.startActivity(intent);
        } catch (ActivityNotFoundException error) {
            render("Google Play Store açılamadı. Store’u etkinleştirip yeniden deneyin.");
        }
    }

    private void render(String detail) {
        boolean blocked = blocksGame();
        screen.setVisibility(blocked ? View.VISIBLE : View.GONE);
        game.setVisibility(blocked ? View.INVISIBLE : View.VISIBLE);
        game.setImportantForAccessibility(blocked
                ? View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
                : View.IMPORTANT_FOR_ACCESSIBILITY_AUTO);
        if (!blocked) return;
        game.clearFocus();
        title.setText(required ? "Güncelleme gerekli" : "Arena Forge Pro");
        message.setText(detail);
        action.setVisibility(required ? View.VISIBLE : View.GONE);
        action.setEnabled(!checking && !flowOpen);
        store.setVisibility(required ? View.VISIBLE : View.GONE);
    }
}
