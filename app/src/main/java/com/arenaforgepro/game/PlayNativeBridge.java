package com.arenaforgepro.game;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Google Play Billing köprüsü (oyundaki AFPPlayBillingV175 iskeletiyle uyumlu).
 *
 * GÜVENLİK: Bu sınıf HİÇBİR hak/ödül vermez. Yalnızca Play penceresini açar ve satın alım
 * belirtecini (token) oyuna bildirir; oyun belirteci sunucuya yollar, sunucu Google API ile doğrular.
 * Satın alım, hesaba `obfuscatedAccountId = sha256("afp-play:" + kullanıcıId)` ile bağlanır
 * (sunucudaki accountIdFor ile birebir aynı).
 */
final class PlayNativeBridge implements PurchasesUpdatedListener {
    /** Play Console'daki ürün kimlikleriyle (tek seferlik, tüketilmeyen) birebir aynı olmalı. */
    static final String[] PRODUCT_IDS = {
            "afp_hero_skin_ember_v1",
            "afp_minion_skin_shadow_v1",
            "afp_portal_theme_gold_v1"
    };

    private final Activity activity;
    private final WebView web;
    private final BillingClient client;
    private final Map<String, ProductDetails> details = new HashMap<>();
    private volatile boolean unavailable;

    PlayNativeBridge(Activity activity, WebView web) {
        this.activity = activity;
        this.web = web;
        this.client = BillingClient.newBuilder(activity)
                .setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                .build();
        activity.runOnUiThread(() -> connect(null));
    }

    void destroy() {
        try {
            client.endConnection();
        } catch (RuntimeException ignored) {
            // Kapanışta bağlantı zaten kopmuş olabilir.
        }
    }

    // ---------------------------------------------------------------- JavaScript tarafı

    /** Köprü kullanılabilir mi? (Play Hizmetleri/Billing kurulumu başarısız olduysa false.) */
    @JavascriptInterface
    public boolean isReady() {
        return !unavailable;
    }

    @JavascriptInterface
    public void getProducts() {
        activity.runOnUiThread(() -> connect(this::queryProducts));
    }

    @JavascriptInterface
    public void buy(String productId, String accountId) {
        if (!isKnown(productId) || accountId == null || accountId.length() < 8 || accountId.length() > 128) {
            emitType("error", "bad_request");
            return;
        }
        final String obfuscated = sha256Hex("afp-play:" + accountId);
        if (obfuscated == null) {
            emitType("error", "hash_unavailable");
            return;
        }
        activity.runOnUiThread(() -> connect(() -> {
            ProductDetails d = details.get(productId);
            if (d == null) {
                emitType("error", "product_unavailable");
                return;
            }
            BillingFlowParams.ProductDetailsParams item = BillingFlowParams.ProductDetailsParams.newBuilder()
                    .setProductDetails(d).build();
            BillingFlowParams params = BillingFlowParams.newBuilder()
                    .setProductDetailsParamsList(Collections.singletonList(item))
                    .setObfuscatedAccountId(obfuscated)
                    .build();
            BillingResult result = client.launchBillingFlow(activity, params);
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                emitType("error", "launch_" + result.getResponseCode());
            }
        }));
    }

    /** Sahip olunan (tüketilmeyen) satın alımları listeler; her biri `purchase` olayı olarak sunucuda yeniden doğrulanır. */
    @JavascriptInterface
    public void restore() {
        activity.runOnUiThread(() -> connect(() -> client.queryPurchasesAsync(
                QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
                (result, purchases) -> {
                    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        emitType("error", "restore_" + result.getResponseCode());
                        return;
                    }
                    for (Purchase p : purchases) emitPurchase(p);
                    emitType("restore_complete", null);
                })));
    }

    // ---------------------------------------------------------------- Play Billing

    private void connect(Runnable onReady) {
        if (client.isReady()) {
            if (onReady != null) onReady.run();
            return;
        }
        client.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    unavailable = false;
                    if (onReady != null) onReady.run();
                } else {
                    unavailable = result.getResponseCode() == BillingClient.BillingResponseCode.BILLING_UNAVAILABLE;
                    if (onReady != null) emitType("error", "setup_" + result.getResponseCode());
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Sonraki çağrı bağlantıyı yeniden kurar.
            }
        });
    }

    private void queryProducts() {
        List<QueryProductDetailsParams.Product> list = new ArrayList<>();
        for (String id : PRODUCT_IDS) {
            list.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(id).setProductType(BillingClient.ProductType.INAPP).build());
        }
        client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(list).build(),
                (result, productDetails) -> {
                    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        emitType("error", "products_" + result.getResponseCode());
                        return;
                    }
                    JSONArray array = new JSONArray();
                    for (ProductDetails d : productDetails) {
                        ProductDetails.OneTimePurchaseOfferDetails offer = d.getOneTimePurchaseOfferDetails();
                        if (offer == null || !isKnown(d.getProductId())) continue;
                        details.put(d.getProductId(), d);
                        JSONObject item = new JSONObject();
                        put(item, "id", d.getProductId());
                        put(item, "price", offer.getFormattedPrice());
                        array.put(item);
                    }
                    JSONObject event = new JSONObject();
                    put(event, "type", "products");
                    put(event, "products", array);
                    emit(event);
                });
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        int code = result.getResponseCode();
        if (code == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase p : purchases) emitPurchase(p);
        } else if (code == BillingClient.BillingResponseCode.USER_CANCELED) {
            emitType("cancelled", null);
        } else {
            emitType("error", "update_" + code);
        }
    }

    private void emitPurchase(Purchase p) {
        if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) {
            emitType("pending", null);
            return;
        }
        if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return;
        for (String id : p.getProducts()) {
            if (!isKnown(id)) continue;
            JSONObject event = new JSONObject();
            put(event, "type", "purchase");
            put(event, "productId", id);
            put(event, "token", p.getPurchaseToken());
            emit(event);
        }
    }

    // ---------------------------------------------------------------- yardımcılar

    private static boolean isKnown(String id) {
        if (id == null) return false;
        for (String known : PRODUCT_IDS) if (known.equals(id)) return true;
        return false;
    }

    private static void put(JSONObject o, String key, Object value) {
        try {
            o.put(key, value);
        } catch (JSONException ignored) {
            // Anahtar boş olamaz; değerler JSON ile uyumlu.
        }
    }

    private void emitType(String type, String code) {
        JSONObject event = new JSONObject();
        put(event, "type", type);
        if (code != null) put(event, "code", code);
        emit(event);
    }

    /** Olayı oyuna iletir: JSON metni güvenli bir JavaScript dizesi olarak verilir (kod enjeksiyonu yok). */
    private void emit(JSONObject event) {
        final String js = "window.AFPPlayBillingV175&&window.AFPPlayBillingV175.onNativeEvent("
                + JSONObject.quote(event.toString()) + ")";
        activity.runOnUiThread(() -> web.evaluateJavascript(js, null));
    }

    static String sha256Hex(String text) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }
}
