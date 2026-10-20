"""Prepare the short product-demo voice clips, keeping all intermediates on D:."""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
VOICE_DIR = ROOT / "work" / "video_v2" / "voice"
CACHE = VOICE_DIR / "cache"
for directory in (VOICE_DIR, CACHE):
    directory.mkdir(parents=True, exist_ok=True)
for name in ("TEMP", "TMP", "TMPDIR", "XDG_CACHE_HOME"):
    os.environ[name] = str(CACHE)
sys.dont_write_bytecode = True

import edge_tts

VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "+6%"
FFPROBE = Path(r"D:\ffmpeg-2025-03-31-git-35c091f4b7-full_build\bin\ffprobe.exe")
if not FFPROBE.exists():
    FFPROBE = Path(shutil.which("ffprobe") or "ffprobe")

TEXTS = {
    "hook": "这个假名，你能一眼认出来吗？",
    "wrong": "看着眼熟，选的时候却认反了。",
    "intro": "这是源音·五十音，给汉语母语者的日语入门练习。",
    "retry_explain": "答错先看解释，隔三题，再来一次。",
    "retry": "刚才的字又回来了。这次，选哪一个？",
    "results": "一轮练完，还能单独重练错题。",
    "lookup": "记不住的时候，点开字卡。看字形，查来源，也能听读音。",
    "listening": "接下来，只凭声音选字。",
    "slow": "没听清？点一下，慢速再听。",
    "cross": "平假名和片假名，也可以这样互相对应。",
    "origin": "记住汉字来源，再反过来找假名。",
    "typing": "再把选项拿掉，直接输入读音。想好，提交。",
    "trace": "先跟着底稿，完整写一遍。",
    "memory": "清空，关掉提示，再凭记忆写一次。",
    "reveal": "写完，揭晓范字，对着看。",
    "course": "想按顺序学，就从第一阶开始。也能自己选题型、范围和题量。",
    "outro": "听、认、写、练。源音·五十音，从第一个假名开始。",
}


def media_info(path: Path) -> dict:
    result = subprocess.run(
        [str(FFPROBE), "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
        check=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


async def synthesize(clip_id: str, text: str, semaphore: asyncio.Semaphore) -> dict:
    audio = VOICE_DIR / f"{clip_id}.mp3"
    metadata = VOICE_DIR / f"{clip_id}.json"
    fingerprint = hashlib.sha256((VOICE + RATE + text).encode("utf-8")).hexdigest()
    saved = json.loads(metadata.read_text("utf-8")) if metadata.exists() else None
    if audio.exists() and saved and saved.get("fingerprint") == fingerprint:
        print(f"Cached {clip_id}: {saved['duration']:.3f}s", flush=True)
        return saved
    async with semaphore:
        boundaries = []
        communicate = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="SentenceBoundary")
        with audio.open("wb") as handle:
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    handle.write(chunk["data"])
                elif chunk["type"] == "SentenceBoundary":
                    boundaries.append({
                        "start": round(chunk["offset"] / 10_000_000, 7),
                        "end": round((chunk["offset"] + chunk["duration"]) / 10_000_000, 7),
                        "text": chunk["text"],
                    })
        info = media_info(audio)
        duration = float(info["format"]["duration"])
        if not boundaries or not audio.stat().st_size:
            raise RuntimeError(f"Missing audio or sentence boundaries for {clip_id}")
        saved = {
            "id": clip_id,
            "text": text,
            "file": audio.name,
            "path": str(audio.resolve()),
            "duration": duration,
            "boundaries": boundaries,
            "voice": VOICE,
            "rate": RATE,
            "fingerprint": fingerprint,
            "sha256": hashlib.sha256(audio.read_bytes()).hexdigest(),
        }
        metadata.write_text(json.dumps(saved, ensure_ascii=False, indent=2), "utf-8")
        print(f"Synthesized {clip_id}: {duration:.3f}s, {len(boundaries)} sentence boundaries", flush=True)
        return saved


async def main() -> None:
    semaphore = asyncio.Semaphore(2)
    clips = await asyncio.gather(*(synthesize(key, text, semaphore) for key, text in TEXTS.items()))
    catalog = {
        "voice": VOICE,
        "rate": RATE,
        "boundary_type": "SentenceBoundary",
        "time_unit": "seconds",
        "clips": clips,
        "total_voice_duration": sum(clip["duration"] for clip in clips),
    }
    (VOICE_DIR / "catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2), "utf-8")
    print(f"Wrote {len(clips)} clips, {catalog['total_voice_duration']:.3f}s", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
