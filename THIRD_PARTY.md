# 第三方组件与素材来源

根目录 [LICENSE](LICENSE) 的 MIT 许可适用于本项目自行编写的代码与文档。下面各项保留自己的许可和来源。

| 项目 | 本项目的用途 | 许可或来源 |
| --- | --- | --- |
| Source Kana / Noto Serif CJK JP | 字体经过子集化并改名为 Source Kana，内置于应用 | Copyright © 2017–2024 Adobe；SIL OFL 1.1；[本地许可](assets/fonts/OFL.txt)、[上游仓库](https://github.com/notofonts/noto-cjk)、[上游许可](https://github.com/notofonts/noto-cjk/blob/main/Serif/LICENSE)。原版权信息保留在字体 name 元数据。生成脚本为 `tools/prepare_font.py`。 |
| Android SDK / Android 平台 | 编译 APK、系统 WebView、文件选择器和系统栏 | 使用 Android 提供的 API；SDK 与系统实现不在本仓库内重新分发。见 [Android 许可](https://source.android.com/docs/setup/about/licenses)。 |
| Microsoft Edge TTS / `edge-tts` | APK 全部固定课程读音：日语 Nanami、普通话 Xiaoxiao；早期视频也曾使用该服务 | `edge-tts` 是 [LGPL-3.0 客户端](https://github.com/rany2/edge-tts)，它调用外部 Microsoft 服务。客户端许可不等于语音输出素材许可。本仓库保留项目编写的调用脚本、完整文本清单与文件映射，不提交该服务生成的录音，也不将其以 MIT 或 CC 再授权。使用服务须自行遵守相应条款，见 [Microsoft 服务协议](https://www.microsoft.com/en-us/servicesagreement)。 |
| Qwen3-TTS 上游模型与代码 | 仅用 1.7B CustomVoice、Serena 预置声线合成介绍视频旁白；0.6B 为备用工具配置，未用于 APK | [官方仓库](https://github.com/QwenLM/Qwen3-TTS)、[1.7B 模型](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)。模型和上游实现使用 Apache-2.0；权重与缓存不进入本仓库或 APK。项目调用脚本适用 MIT。 |
| fontTools、Playwright、Pillow、FFmpeg、PyTorch、Hugging Face 等 | 可选字体处理、测试、录制、渲染与语音生成工具 | 依赖通过各自官方发行渠道安装，不复制进本仓库。依赖许可以所安装版本自带的许可为准；调用这些工具的项目脚本适用 MIT。 |

## 教学内容的来源与校订

`js/data-kana.js` 和 `js/data-extensions.js` 来自项目所有者提供的 Gemini 辅助初版，并在重构中继续沿用。五十音字形、词汇、字源记忆提示与汉日音韵说明用于入门学习。当前内容没有完成逐条学术文献校订；学习用的记忆提示也不应自动当作严格的历史音韵推导。欢迎携带原始文献或可靠辞书定位提出修正。

## 公开源码不包含的本地资料

签名密钥及密码、学习进度备份、访问凭证、用户原始 APK、旧交付件、录屏素材、成片、临时目录和模型权重均不进入 Git 历史。公开源码通过 `tools/publish_source.py` 的明确文件清单导出，忽略工作区里的其他文件。

Microsoft 服务生成的全部 MP3（新 `assets/audio/ja/`、`assets/audio/zh/` 与旧 `assets/audio/kana/`）均排除。公开源码保留生成脚本和清单，使用者可按 README 生成本地资源。模型、代码、字体与服务语音输出的许可范围独立。
