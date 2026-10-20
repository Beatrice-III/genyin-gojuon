# 源音·五十音

面向汉语母语者的日语假名入门练习应用。把五十音表、汉字字源提示、形近字对照、听辨、输入和书写放在一起，练完一轮再回头处理错题。

这个仓库公开 3.0 版 Android 宿主、界面与学习逻辑、完整课程语音清单，以及资源生成、验证和视频制作脚本。项目从 Gemini 辅助制作的初版继续重构，由项目所有者授权开源。

## 可以怎么练

- 点开假名字卡，听读音、看平片假名及字形来源。
- 从形近组入手，分清 `シ / ツ / ソ / ン` 等容易混淆的字。
- 做认读、平片对应、听音选字、字源对应和罗马字输入练习；答错后查看解释并重新练习。
- 临摹后关掉底稿，凭记忆默写，再揭晓范字进行对照。
- 按十阶课程学习，或自选范围、题型和题量；在本机保存记录，并通过 JSON 备份迁移。

手机以音图、辨形、书写、练习四个入口组织内容。查字后能直接练或写，返回时接续原来的内容；做题与书写尽量在当前页面完成。

## 运行与构建

### 浏览器预览

安装 Python 3 后，在仓库根目录执行：

```powershell
python -m http.server 8766
```

浏览器打开 `http://127.0.0.1:8766`。页面使用本地 HTML、CSS 和 JavaScript；Android 的系统后退、文件备份与窗口适配由 Java 宿主提供，浏览器预览无法代替 APK 测试。

### Android APK

需要 Python 3、JDK 17、Android SDK Platform 36 与 Build Tools 36.0.0。Android 最低版本为 7.0（API 24）。无需 Gradle；脚本直接调用 Android 官方构建工具。

先按下节生成课程音频，再执行开发构建：

```powershell
python android/build_apk.py --debug
```

脚本生成独立的 `com.genyin.gojuon.dev` 开发包与临时签名，可和正式版并存。构建参数和正式签名说明见 [android/README.md](android/README.md) 或 `--help`。公开仓库不含发布签名密钥或密码；要覆盖安装既有正式版，必须持有原签名密钥。生成目录为 `outputs/`，临时构建资料放在 `work/`。

### 音频资源

交付 APK 内置清音、浊音、拗音、示例词与汉字来源的 364 条固定读音，安装后可直接离线播放，无需另装日语语音引擎。日语使用 Microsoft Edge TTS Nanami，汉字来源普通话使用 Xiaoxiao。Qwen3-TTS 只用于介绍视频旁白。

公开仓库包含 `assets/audio/manifest.json` 中的完整文字、别名、参数与文件映射，以及可复现的生成工具；不分发 Microsoft 服务生成的 MP3。克隆后需联网生成一次音频，再离线构建与播放。生成工具需要 Node.js、Python 3、`edge-tts` 与 FFmpeg（含 ffprobe）；FFmpeg 路径可以通过 `FFMPEG` 环境变量指定。

```powershell
node tools/audio_inventory.cjs
python -m pip install edge-tts
# 如FFmpeg未安装在脚本默认位置，设置到本机ffmpeg.exe完整路径：
# $env:FFMPEG = 'D:/tools/ffmpeg/bin/ffmpeg.exe'
python tools/prepare_course_audio.py
python tools/publish_source.py --check --require-audio
python android/build_apk.py --debug
```

Qwen 旁白的下载与合成脚本是 `tools/qwen_download.py`、`tools/qwen_synthesize.py`，配置见 [tools/qwen_README.md](tools/qwen_README.md)。介绍视频使用 1.7B CustomVoice 与 Serena 声线，角色是自然、亲近的中文学习搭子。APK 构建不需要 Qwen；模型权重另行下载，不打进手机 APK，也不提交到 Git。

## 目录

| 路径 | 内容 |
| --- | --- |
| `index.html`、`css/` | 应用页面与手机布局 |
| `js/` | 教学数据、题目、书写、音频、进度与复习逻辑 |
| `android/src/`、`android/res/` | Android Java 宿主与原生资源 |
| `assets/fonts/` | 改名后的 OFL 字体子集与许可 |
| `assets/audio/` | 完整课程语音清单、来源说明与本地 MP3 生成位置 |
| `tools/` | 资源处理、验证、录制、旁白与视频渲染脚本 |
| `outputs/`、`work/` | 本地交付件和临时资料；均不进 Git |

Android 构建只打包根目录当前网页源文件。遗产 `android/assets/www/` 的重复副本不参与构建，也不公开为第二套源码。

## 验证与贡献

不依赖浏览器的软件逻辑检查可执行：

```powershell
node tools/verify_learning_logic.cjs
python tools/publish_source.py --check
```

其他 `verify_*` 工具覆盖界面与音频等具体方面，所需浏览器或媒体工具见脚本。CI 检查代码语法、学习逻辑和公开清单；手机可用性、听感与教学正确性仍需要分别验证。

欢迎提交可复现的问题、手机型号与 Android 版本，或附原始资料的内容勘误。涉及学习记录时，请先去除个人信息。请勿提交发布密钥、凭证、进度备份或大体积模型文件。

## 许可

项目代码与文档采用 [MIT](LICENSE)，字体采用 SIL OFL 1.1。Microsoft 服务语音输出不纳入根 MIT 许可，也不进入公开源码。Qwen 上游模型与代码采用 Apache-2.0，仅用于可选的视频旁白工具。详情见 [音频来源说明](assets/audio/LICENSE)、[NOTICE](NOTICE) 和 [THIRD_PARTY.md](THIRD_PARTY.md)。
