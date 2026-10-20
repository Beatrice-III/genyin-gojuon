# Qwen3-TTS 视频旁白与制作复现

当前介绍视频使用一位女声，按实际操作顺序从头到尾说明功能。18 段旁白的完整文字、语气指令和随机种子在 [qwen_narration_walkthrough.json](qwen_narration_walkthrough.json) 中；不使用旧版角色对话脚本。

Qwen 只负责视频旁白。APK 的固定教学读音是普通日语 Nanami、中文 Xiaoxiao，与本页的视频配音流程分开。

## 模型与声音

- 官方实现：[QwenLM/Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)。
- 本次模型：[Qwen3-TTS-12Hz-1.7B-CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)。
- 预置声线：Serena；语言：普通话；风格：自然、清晰、平实，像一边操作手机一边说明功能。
- 生成设置：BF16、PyTorch SDPA、批量 2。18 段原始旁白合计 90.96 秒，24 kHz 单声道 PCM24；视频中的旁白按操作画面安排，中间保留实际练习和播放的时间。

官方代码和模型采用 Apache-2.0。模型权重不进入仓库或 APK。`qwen_download.py` 从官方仓库下载，生成的 `downloaded_assets.json` 保存模型 commit、文件 SHA-256 和大小。0.6B 仅为备用模型，未用于本次 APK 或视频。

## 环境和配音

本次制作环境：Windows、Python 3.12、PyTorch 2.6.0+cu124、RTX 4050 Laptop 6GB。`qwen_setup.ps1` 在 D 盘建立独立 venv，并复用机器已有的 CUDA 版 PyTorch；其他机器先按 [PyTorch 官方说明](https://pytorch.org/get-started/locally/) 安装与驱动匹配的版本。

在项目根目录运行：

```powershell
./tools/qwen_setup.ps1
& D:/CodexData/runtimes/qwen-tts/Scripts/python.exe tools/qwen_download.py --size 1.7B
& D:/CodexData/runtimes/qwen-tts/Scripts/python.exe tools/qwen_synthesize.py --manifest tools/qwen_narration_walkthrough.json --batch-size 2 --output outputs/video_v4/配音工程
```

模型位于 `D:/CodexData/models`，环境位于 `D:/CodexData/runtimes/qwen-tts`。临时文件及下载缓存都放在 D 盘；Windows 使用 SDPA，不需要 FlashAttention。

输入 JSON 条目支持 `id`、`text`、`speaker`、`language`、`instruct`、`seed` 和 `max_new_tokens`。当前文件的 18 个条目全部使用 Serena，并逐条指定平实介绍的语气。`synthesis.json` 记录实际文本、指令、音色、批次随机种子、音频时长、用时与显存峰值。已有 WAV 默认跳过，添加 `--overwrite` 可重新生成。

批量生成的随机种子作用于整批，实际值记录为 `batch_seed`。复现同一批配音时，保持台词顺序、`--batch-size 2`、模型 commit 和运行环境一致。

## 录制与合成视频

先按主 [README](../README.md) 的开发步骤生成 App 教学音频。视频工具另需 Playwright、Pillow、NumPy、FFmpeg，以及本机 Chrome 或 Edge。当前脚本里的 FFmpeg 默认路径是 `D:/ffmpeg-2025-03-31-git-35c091f4b7-full_build/bin`，浏览器和字体读取 Windows 已安装资源；在其他机器上按实际安装位置调整脚本常量。

先在一个终端启动页面：

```powershell
python -m http.server 8766
```

再在另一个终端执行：

```powershell
python tools/capture_product_demo.py --url http://127.0.0.1:8766 --scale 2 --output capture2x
python tools/render_product_demo.py --storyboard
python tools/render_product_demo.py --render --verify
```

录制工具使用独立演示进度，操作真实页面的字卡、练习、听音、输入、书写与备份按钮，输出位于 `work/video_v3/capture2x`。渲染脚本默认读取该目录；也可以通过 `GENYIN_VIDEO_CAPTURE` 指定其他捕获目录。视频渲染临时资料位于 `work/video_v4`。

最终工程输出位于 `outputs/video_v4/`：

- `源音五十音_上手介绍_1080p.mp4`：1920×1080 的普通操作介绍。
- `源音五十音_上手介绍.srt`、`旁白稿.txt`：字幕和完整念稿。
- `源音五十音_功能介绍封面_1920x1080.png`：介绍封面。
- `配音工程/`：18 段 WAV 与实际合成记录。
- `声音与操作时间线.json`、`视频验证.json`：配音、App 发音和画面操作的时间记录及格式检查。

历史配音清单仍保留在源码中。当前制作入口是 `qwen_narration_walkthrough.json` 与 `render_product_demo.py`；旧版角色脚本不作为当前视频的输入。