# 本地 Qwen3-TTS 配音

使用 [Qwen 团队官方实现](https://github.com/QwenLM/Qwen3-TTS)，模型来自官方 Hugging Face 仓库：

- [Qwen3-TTS-12Hz-1.7B-CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)：本项目介绍片旁白，可用 `instruct` 控制语气。
- [Qwen3-TTS-12Hz-0.6B-CustomVoice](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice)：已下载的备用模型，未用于本次 APK 或视频；该版没有 1.7B 版的指令控制能力。

官方代码与模型标示 Apache-2.0。此项目没有把模型权重加入源码仓库；脚本从官方仓库下载，`downloaded_assets.json` 记录实际模型 commit、文件 SHA256 和大小。

## 环境

本次环境为 Windows、Python 3.12、PyTorch 2.6.0+cu124、RTX 4050 Laptop 6GB。`qwen_setup.ps1` 创建 D 盘独立 venv，复用机器已有的 CUDA 版 PyTorch，不修改全局环境；其他机器先按 PyTorch 官方安装说明配置与本机驱动匹配的 CUDA 版 PyTorch。

```powershell
./tools/qwen_setup.ps1
& D:/CodexData/runtimes/qwen-tts/Scripts/python.exe tools/qwen_download.py --size 1.7B
& D:/CodexData/runtimes/qwen-tts/Scripts/python.exe tools/qwen_download.py --size 0.6B
& D:/CodexData/runtimes/qwen-tts/Scripts/python.exe tools/qwen_synthesize.py --manifest tools/qwen_serena_samples.json --output outputs/video/voice_samples
```

模型存于 `D:/CodexData/models`，环境存于 `D:/CodexData/runtimes/qwen-tts`；这些可复用资源保留。临时文件、模型缓存、下载缓存置于 D 盘。Windows 使用 PyTorch SDPA，无需安装 FlashAttention。

## 配音角色

旁白使用官方 Serena 预置音色。声音角色是自然、有亲近感的女生日语学习搭子：像朋友在旁边带着操作，有轻微好奇、停顿和互动。中文普通话，语速适中，重点轻轻强调。角色没有对应或模仿现实人物。

`qwen_synthesize.py` 的 JSON 输入是数组，条目支持 `id`、`text`、`speaker`、`language`、`instruct`、`seed`、`max_new_tokens`。默认逐条合成，可用 `--batch-size 2` 或 `4`。本次成片的 17 段角色台词、指令与种子保存在 `qwen_narration_v3.json`。

```powershell
& D:/CodexData/runtimes/qwen-tts/Scripts/python.exe tools/qwen_synthesize.py --manifest tools/qwen_narration_v3.json --batch-size 2 --output work/qwen_narration_v3
```

合成结果为 24-bit PCM WAV；`synthesis.json` 记录文字、音色、随机种子、用时、音频时长与显存峰值。脚本检查非空、有限波形；实际听感与日语读音仍需试听，不能用波形检查替代。既有 WAV 默认跳过，`--overwrite` 可重新生成。

本次视频使用 1.7B、Serena、BF16、SDPA，17 段旁白总计 79.04 秒，合成批量为 2（末段为 1）。CUDA 分配峰值为 4400.4 MiB；所有段均为 24 kHz、单声道、PCM24，已检查文件完整性、可解码性、非空和非有限采样。0.6B 没有投入课程合成；APK 固定语音采用单独的普通语音方案。

批量生成时随机种子作用于整批，实际值保存在结果的 `batch_seed`。要复现本次配音，保持台词顺序、`--batch-size 2`、模型 commit 和运行环境版本一致。
