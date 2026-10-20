# Android 构建与验证

本目录提供源音·五十音 3.0 的离线 Android 宿主。保留包名 `com.genyin.gojuon`、原签名密钥与 `file:///android_asset/www/index.html`，让原版可覆盖升级并沿用 WebView 的学习记录。

## 复现构建

在项目根目录执行：

```powershell
python android/build_apk.py --debug
```

默认使用 `C:\Android` 的 Android 36 平台与 Build Tools 36.0.0、Microsoft JDK 17。可用 `--sdk`、`--java` 改路径；可用 `--output`、`--report` 改交付位置，但必须在项目 `outputs/` 或 `work/` 中。

脚本直接使用 Android 官方 `aapt2`、`javac`、`d8`、`zipalign`、`apksigner`。公开源码用 `--debug` 生成临时开发签名，包名为 `com.genyin.gojuon.dev`，可与正式版并存。正式版构建使用私人 `--keystore`、`--key-alias` 和环境变量 `GENYIN_KEYSTORE_PASSWORD`；密钥及密码不在开源仓库中。SDK/JDK 仅从已安装位置读取；构建临时文件、Java 临时目录与缓存均放在项目 `work/android-build/`，成功后自动清理。加 `--keep-work` 可以保留排错材料。

网页资源来自根目录 `index.html` 及 `css/`、`js/`、`assets/`、`audio/`、`fonts/`，不会使用遗产 `android/assets/www/` 中的旧副本。生成报告验证 APK 签名、16 KB ZIP 对齐、ZIP 完整性、包名/版本及所有网页资源的逐字节一致性；若根目录原 APK 仍在，还会强制核对原证书。

此构建方式没有 Gradle 依赖，也没有运行 Android Lint。Java 编译开启全部警告；完整的设备测试结果在交付验证说明中单独记录，不能以打包成功替代设备验证。

## Android 桥

- `AndroidTTS.speakJapanese(text, slow)`、`speakChinese(text)` 返回布尔值；设备没有已安装的对应离线语音或引擎未就绪时返回 `false`。
- `AndroidTTS.stop()` 停止当前系统朗读，`openSettings()` 打开系统文字转语音设置。
- `AndroidApp.getInfo()` 返回 JSON 字符串，包括版本、平台、日语与中文离线 TTS 可用性。
- `AndroidApp.getAudioManifest()` 同步读取内置 `assets/audio/manifest.json`，供禁用 file 跨源访问时安全获取音频映射；文件缺失返回空 JSON 对象。
- `AndroidApp.exportProgress(json)` 打开 Android 文件保存界面，仅接受小于 4 MB 的 JSON 对象。
- `AndroidApp.importProgress()` 打开文件选择界面；读到合法 JSON 后调用网页 `window.onAndroidProgressImport(jsonString)`。网页承担格式校验、预览及用户确认后替换记录。
- `AndroidApp.setTheme(dark)` 同步原生系统栏图标、WebView 与安全区背景。
- 原生状态以 `window.onAndroidNativeEvent({type, message, language})` 通知网页。事件包括 `ready`、`tts-ready`、`tts-error`、`backup-exported`、`backup-error`。
- 系统后退调用 `window.handleAndroidBack()`；返回 `true` 表示网页已关闭弹层或返回上一层，`false` 才离开应用。Android 13+ 使用平台 `OnBackInvokedCallback`。

## 运行约束

最低 Android 7.0（API 24），目标 API 36。API 30+ 对状态栏、手势栏、刘海和键盘使用原生 WindowInsets 留出实际空间；网页无需再次叠加 Android 安全区。日语和中文系统 TTS 只选已安装的离线 voice。应用不申请联网、麦克风、相机或存储权限；备份只使用 Android 文件选择器。普通 file/content 访问、跨文件 JavaScript 访问、混合内容、网络加载和远程网页导航均禁用。保留的本地 asset URL 仅为兼容旧版学习记录。

开发参考：[WindowInsets](https://developer.android.com/develop/ui/views/layout/insets)、[系统后退回调](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture)、[WebSettings](https://developer.android.com/reference/android/webkit/WebSettings)、[离线语音 Voice](https://developer.android.com/reference/android/speech/tts/Voice)。
