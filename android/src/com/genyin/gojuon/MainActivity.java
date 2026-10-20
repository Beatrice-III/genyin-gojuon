package com.genyin.gojuon;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import org.json.JSONObject;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Set;

/** Offline shell. Package, signing identity and asset URL preserve V1 progress. */
public class MainActivity extends Activity {
    private static final String HOME = "file:///android_asset/www/index.html";
    private static final int EXPORT_REQUEST = 41, IMPORT_REQUEST = 42, MAX_BACKUP = 4 * 1024 * 1024;
    private WebView webView;
    private FrameLayout root;
    private TextToSpeech ttsEngine;
    private volatile boolean ttsReady;
    private volatile Voice japaneseVoice, chineseVoice;
    private String pendingExport;
    private OnBackInvokedCallback backCallback;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null) pendingExport = savedInstanceState.getString("pendingExport");
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#F7F5EF"));
        configureSystemBars(false);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#F7F5EF"));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        // android_asset URLs remain accessible with ordinary file access disabled.
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setBlockNetworkLoads(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setTextZoom(100);
        WebView.setWebContentsDebuggingEnabled(
            (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isAppAsset(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !isAppAsset(Uri.parse(url));
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (isAppAsset(request.getUrl())) return null;
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Offline only", null,
                    new ByteArrayInputStream(new byte[0]));
            }
            @Override public void onPageFinished(WebView view, String url) { nativeEvent("ready", "", ""); }
        });
        webView.setWebChromeClient(new WebChromeClient());
        webView.addJavascriptInterface(new AndroidTTSBridge(), "AndroidTTS");
        webView.addJavascriptInterface(new AndroidAppBridge(), "AndroidApp");
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        configureSystemBars(false);
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets safe = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
                return insets;
            });
            root.requestApplyInsets();
        }
        if (Build.VERSION.SDK_INT >= 33) {
            backCallback = this::handleBack;
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, backCallback);
        }
        initTts();
        webView.loadUrl(HOME);
    }

    private boolean isAppAsset(Uri uri) {
        String path = uri.getPath();
        return "file".equals(uri.getScheme()) && path != null && path.startsWith("/android_asset/www/")
            && !path.contains("/../") && (uri.getHost() == null || uri.getHost().isEmpty());
    }

    @SuppressWarnings("deprecation") private void configureSystemBars(boolean dark) {
        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor(dark ? "#1D2425" : "#F7F5EF"));
        window.setNavigationBarColor(Color.parseColor(dark ? "#1D2425" : "#FBFAF6"));
        if (Build.VERSION.SDK_INT >= 29) window.setNavigationBarContrastEnforced(false);
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController control = window.getDecorView().getWindowInsetsController();
            int light = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
            if (control != null) control.setSystemBarsAppearance(dark ? 0 : light, light);
        } else {
            int flags = dark ? 0 : View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (!dark && Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            window.getDecorView().setSystemUiVisibility(flags);
        }
    }

    private void initTts() {
        ttsEngine = new TextToSpeech(getApplicationContext(), status -> {
            if (status != TextToSpeech.SUCCESS || ttsEngine == null) return;
            refreshVoices();
            ttsEngine.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String id) { }
                @Override public void onDone(String id) { }
                @Override public void onError(String id) { nativeEvent("tts-error", "系统语音朗读失败，请检查离线语音包。", id); }
            });
            ttsReady = true;
            nativeEvent("tts-ready", "", "");
        });
    }
    private void refreshVoices() {
        japaneseVoice = localVoice(Locale.JAPANESE);
        chineseVoice = localVoice(Locale.SIMPLIFIED_CHINESE);
    }
    private Voice localVoice(Locale locale) {
        Voice best = null;
        try {
            Set<Voice> voices = ttsEngine.getVoices();
            if (voices == null) return null;
            for (Voice voice : voices) {
                Set<String> features = voice.getFeatures();
                if (!voice.isNetworkConnectionRequired() && locale.getLanguage().equals(voice.getLocale().getLanguage())
                    && (features == null || !features.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED))) {
                    if (best == null || voice.getQuality() > best.getQuality()) best = voice;
                }
            }
        } catch (RuntimeException ignored) { }
        return best;
    }
    private boolean speak(String text, boolean slow, boolean japanese) {
        Voice voice = japanese ? japaneseVoice : chineseVoice;
        if (!ttsReady || voice == null || text == null || text.trim().isEmpty() || text.length() > 2000) return false;
        runOnUiThread(() -> {
            if (ttsEngine == null) return;
            try {
                ttsEngine.setVoice(voice);
                ttsEngine.setSpeechRate(slow ? 0.58f : japanese ? 0.88f : 0.86f);
                if (ttsEngine.speak(text, TextToSpeech.QUEUE_FLUSH, null, japanese ? "ja" : "zh") == TextToSpeech.ERROR)
                    nativeEvent("tts-error", "系统语音朗读失败，请检查离线语音包。", japanese ? "ja" : "zh");
            } catch (RuntimeException error) { nativeEvent("tts-error", "系统语音暂不可用。", japanese ? "ja" : "zh"); }
        });
        return true;
    }
    public class AndroidTTSBridge {
        @JavascriptInterface public boolean speakJapanese(String text, boolean slow) { return speak(text, slow, true); }
        @JavascriptInterface public boolean speakChinese(String text) { return speak(text, false, false); }
        @JavascriptInterface public void stop() { runOnUiThread(() -> { if (ttsEngine != null) ttsEngine.stop(); }); }
        @JavascriptInterface public void openSettings() {
            runOnUiThread(() -> {
                try { startActivity(new Intent("com.android.settings.TTS_SETTINGS")); }
                catch (RuntimeException error) { startActivity(new Intent(Settings.ACTION_SETTINGS)); }
            });
        }
    }
    public class AndroidAppBridge {
        @JavascriptInterface public String getAudioManifest() {
            try (InputStream stream = getAssets().open("www/assets/audio/manifest.json"); ByteArrayOutputStream bytes = new ByteArrayOutputStream()) {
                byte[] block = new byte[4096]; int count;
                while ((count = stream.read(block)) != -1) {
                    if (bytes.size() + count > 1024 * 1024) return "{}";
                    bytes.write(block, 0, count);
                }
                return new String(bytes.toByteArray(), StandardCharsets.UTF_8);
            } catch (Exception ignored) { return "{}"; }
        }
        @JavascriptInterface public String getInfo() {
            try {
                return new JSONObject().put("version", "3.0.0").put("platform", "Android")
                    .put("ttsJapanese", ttsReady && japaneseVoice != null).put("ttsChinese", ttsReady && chineseVoice != null).toString();
            } catch (Exception ignored) { return "{}"; }
        }
        @JavascriptInterface public boolean exportProgress(String json) {
            if (json == null || json.getBytes(StandardCharsets.UTF_8).length > MAX_BACKUP) return false;
            try { new JSONObject(json); } catch (Exception error) { return false; }
            runOnUiThread(() -> {
                if (pendingExport != null) return;
                pendingExport = json;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("application/json").putExtra(Intent.EXTRA_TITLE,
                        "源音五十音-学习备份-" + new SimpleDateFormat("yyyyMMdd-HHmm", Locale.ROOT).format(new Date()) + ".json");
                try { startActivityForResult(intent, EXPORT_REQUEST); }
                catch (RuntimeException error) { pendingExport = null; nativeEvent("backup-error", "此设备没有文件保存应用。", ""); }
            });
            return true;
        }
        @JavascriptInterface public void importProgress() {
            runOnUiThread(() -> {
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*")
                    .putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"application/json", "text/plain", "application/octet-stream"});
                try { startActivityForResult(intent, IMPORT_REQUEST); }
                catch (RuntimeException error) { nativeEvent("backup-error", "此设备没有文件选择应用。", ""); }
            });
        }
        @JavascriptInterface public void setTheme(boolean dark) {
            runOnUiThread(() -> {
                root.setBackgroundColor(Color.parseColor(dark ? "#1D2425" : "#F7F5EF"));
                webView.setBackgroundColor(Color.parseColor(dark ? "#1D2425" : "#F7F5EF"));
                configureSystemBars(dark);
            });
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == EXPORT_REQUEST) {
            String json = pendingExport;
            pendingExport = null;
            if (result != RESULT_OK || data == null || data.getData() == null || json == null) return;
            try (OutputStream stream = getContentResolver().openOutputStream(data.getData(), "wt")) {
                if (stream == null) throw new java.io.IOException("No stream");
                stream.write(json.getBytes(StandardCharsets.UTF_8));
                nativeEvent("backup-exported", "学习备份已保存。", "");
                Toast.makeText(this, "学习备份已保存", Toast.LENGTH_SHORT).show();
            } catch (Exception error) { nativeEvent("backup-error", "备份保存失败，请重试。", ""); }
        } else if (request == IMPORT_REQUEST && result == RESULT_OK && data != null && data.getData() != null) {
            try (InputStream stream = getContentResolver().openInputStream(data.getData()); ByteArrayOutputStream bytes = new ByteArrayOutputStream()) {
                if (stream == null) throw new java.io.IOException("No stream");
                byte[] block = new byte[8192]; int count;
                while ((count = stream.read(block)) != -1) {
                    if (bytes.size() + count > MAX_BACKUP) throw new java.io.IOException("Too large");
                    bytes.write(block, 0, count);
                }
                String json = new String(bytes.toByteArray(), StandardCharsets.UTF_8);
                new JSONObject(json);
                webView.evaluateJavascript("window.onAndroidProgressImport && window.onAndroidProgressImport(" + JSONObject.quote(json) + ")", null);
            } catch (Exception error) { nativeEvent("backup-error", "无法读取备份：请选择小于 4 MB 的有效 JSON 备份。", ""); }
        }
    }
    private void nativeEvent(String type, String message, String language) {
        if (webView == null) return;
        try {
            String json = new JSONObject().put("type", type).put("message", message).put("language", language).toString();
            runOnUiThread(() -> { if (webView != null) webView.evaluateJavascript("window.onAndroidNativeEvent && window.onAndroidNativeEvent(" + json + ")", null); });
        } catch (Exception ignored) { }
    }
    private void handleBack() {
        if (webView == null) { finish(); return; }
        webView.evaluateJavascript("(function(){try{return !!(window.handleAndroidBack && window.handleAndroidBack());}catch(e){return false;}})()",
            value -> { if (!"true".equals(value)) finish(); });
    }
    @SuppressWarnings("deprecation") @Override public void onBackPressed() { handleBack(); }
    @Override protected void onResume() { super.onResume(); if (webView != null) webView.onResume(); if (ttsReady) refreshVoices(); }
    @Override protected void onPause() {
        if (ttsEngine != null) ttsEngine.stop();
        if (webView != null) { webView.evaluateJavascript("window.dispatchEvent(new Event('nativepause'))", null); webView.onPause(); }
        super.onPause();
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        if (pendingExport != null && pendingExport.length() < 200000) state.putString("pendingExport", pendingExport);
    }
    @Override public void onConfigurationChanged(Configuration config) { super.onConfigurationChanged(config); root.requestApplyInsets(); }
    @Override protected void onDestroy() {
        if (Build.VERSION.SDK_INT >= 33 && backCallback != null) getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backCallback);
        if (ttsEngine != null) { ttsEngine.stop(); ttsEngine.shutdown(); ttsEngine = null; }
        if (webView != null) { root.removeView(webView); webView.removeJavascriptInterface("AndroidTTS"); webView.removeJavascriptInterface("AndroidApp"); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
