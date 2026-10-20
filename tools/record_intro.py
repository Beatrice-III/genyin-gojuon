"""源音五十音：手机界面实录、1080p B站介绍视频。

All task-created caches, audio intermediates and browser profiles stay in work/video.
The original Gemini recording script and original cover remain untouched.
Usage: python tools/record_intro.py --prepare
       python tools/record_intro.py --record --url http://127.0.0.1:8766
       python tools/record_intro.py --verify
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
from functools import lru_cache
import io
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import wave

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "work" / "video"
OUT = ROOT / "outputs" / "video"
CACHE = WORK / "cache"
for folder in (WORK, OUT, CACHE):
    folder.mkdir(parents=True, exist_ok=True)
os.environ["TEMP"] = str(CACHE)
os.environ["TMP"] = str(CACHE)
os.environ["TMPDIR"] = str(CACHE)
os.environ["XDG_CACHE_HOME"] = str(CACHE)

import edge_tts
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from playwright.async_api import async_playwright

FFMPEG = Path(r"D:\ffmpeg-2025-03-31-git-35c091f4b7-full_build\bin\ffmpeg.exe")
FFPROBE = FFMPEG.with_name("ffprobe.exe")
if not FFMPEG.exists():
    FFMPEG, FFPROBE = Path("ffmpeg"), Path("ffprobe")
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
if not CHROME.exists():
    CHROME = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")

W, H = 1920, 1080
PW, PH = 390, 844
FPS = 15
OUTPUT_FPS = 30
PAPER = "#F7F5EF"
INK = "#263737"
RED = "#A84B3B"
TEAL = "#315B55"
MUTED = "#71817A"
LINE = "#D9DFD7"
VOICE = "zh-CN-YunxiNeural"
VIDEO = OUT / "源音五十音_安卓版介绍_1080p.mp4"
FONT_ROOT = Path(r"C:\Windows\Fonts")

SCENES = [
    {
        "id": "01", "label": "从汉字出发", "headline": ["从汉字，", "读懂假名。"],
        "notes": ["专为汉语母语者整理", "源音 · 五十音  /  Android"],
        "motif": "あ ア", "foot": "让熟悉的字形，成为入门的线索",
        "narration": "如果你会写汉字，学假名时，其实已经有了一把钥匙。这是重新为安卓手机整理的《源音·五十音》，一款面向汉语母语者的日语入门学习工具。",
    },
    {
        "id": "02", "label": "五十音图与单字详解", "headline": ["一个假名，", "一条记忆线索。"],
        "notes": ["平片对照  ·  隐音自测", "汉字来源  ·  发音要点"],
        "motif": "安 → あ", "foot": "借助汉字联想，再回到日语发音",
        "narration": "打开五十音图，可以并排查看平假名和片假名，也能隐藏读音，试着独立回忆。点开一个假名，把汉字来源、字形说明和发音要点放在一起看，建立自己的记忆线索。",
    },
    {
        "id": "03", "label": "书源与声音", "headline": ["把字形连起来，", "把声音分清。"],
        "notes": ["书源条目与平片关系", "浊音  ·  拗音  ·  特殊音拍"],
        "motif": "か が きゃ", "foot": "字源辅助记形；发音以日语音值为准",
        "narration": "书源部分把汉字和假名的关系集中整理，方便来回对照。浊音、拗音和特殊音拍也有独立入口。汉字可以帮助记形，普通话近似音只作参照，发音仍要回到日语本身。",
    },
    {
        "id": "04", "label": "形近字专项练习", "headline": ["越是相似，", "越要放在一起看。"],
        "notes": ["十二组形近假名", "先观察差别，再进入辨认练习"],
        "motif": "シ · ツ", "foot": "把注意力留给关键的笔画与方向",
        "narration": "比如屏幕上这组片假名，初学时很容易看错。字形辨微把常见的形近假名放在一起，提示需要留意的笔画和方向。观察之后，再做针对性的辨认练习。",
    },
    {
        "id": "05", "label": "临摹与默写", "headline": ["先写一次，", "再自己回忆。"],
        "notes": ["米字格  ·  本字叠影", "隐藏底稿  →  书写  →  揭晓对照"],
        "motif": "あ", "foot": "用于自由临摹与对照，不自动评判笔顺",
        "narration": "在临池里，可以对着米字格自由书写，也可以关掉底稿，凭记忆写一次，再揭晓范字对照。这里提供的是临摹和自查工具，不会把随手写出的字，当成已经掌握的证明。",
    },
    {
        "id": "06", "label": "阶梯修习与错题温习", "headline": ["看懂之后，", "还要独立答出来。"],
        "notes": ["十阶修习  ·  多种演练题型", "答题反馈  ·  错题回练"],
        "motif": "看 → 想 → 答", "foot": "用练习反馈，决定下一次复习什么",
        "narration": "十阶修习和综合演练，把认形、听辨、平片对应、书源配对和罗马字输入串起来。答错后可以查看解释，错题会进入后续温习。学习进度帮助安排下一步，真正记住，还需要反复独立回忆。",
    },
    {
        "id": "07", "label": "为手机重新整理", "headline": ["随身打开，", "一点一点记牢。"],
        "notes": ["适合手机的字号与触控区域", "本地内容  ·  本机学习进度"],
        "motif": "源音", "foot": "源音 · 五十音  /  安卓重构版",
        "narration": "这次重构重新整理了手机排版、阅读层级和触控区域，让查阅、书写和练习连得更顺。四十六个清音发音已经内置，词汇和普通话读音使用系统语音。从熟悉的汉字出发，把假名慢慢变成自己的能力。",
    },
]


def run(cmd, **kwargs):
    return subprocess.run([str(s) for s in cmd], check=True, capture_output=True, **kwargs)


def probe(path):
    return json.loads(run([FFPROBE, "-v", "error", "-show_format", "-show_streams", "-of", "json", path]).stdout)


@lru_cache(maxsize=64)
def font(size, kind="sans"):
    names = {"sans": "msyh.ttc", "bold": "msyhbd.ttc", "serif": "simsun.ttc", "kai": "simkai.ttf", "jp": "YuGothM.ttc"}
    return ImageFont.truetype(str(FONT_ROOT / names[kind]), size)


def wrap(text, fnt, width, draw):
    lines, line = [], ""
    for char in text:
        if char == "\n":
            lines.append(line)
            line = ""
        elif draw.textlength(line + char, font=fnt) > width and line:
            lines.append(line)
            line = char
        else:
            line += char
    if line:
        lines.append(line)
    return lines


async def prepare_audio():
    prepared = []
    for sc in SCENES:
        ap = WORK / f"voice_{sc['id']}.mp3"
        bp = WORK / f"voice_{sc['id']}.json"
        fingerprint = hashlib.sha256((sc["narration"] + VOICE + "+4%").encode()).hexdigest()
        boundaries = None
        if ap.exists() and bp.exists():
            saved = json.loads(bp.read_text("utf-8"))
            if saved.get("fingerprint") == fingerprint:
                boundaries = saved["boundaries"]
        if boundaries is None:
            print("Synthesizing", sc["id"], flush=True)
            boundaries = []
            communicate = edge_tts.Communicate(sc["narration"], VOICE, rate="+4%", boundary="SentenceBoundary")
            with ap.open("wb") as handle:
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        handle.write(chunk["data"])
                    elif chunk["type"] in ("SentenceBoundary", "WordBoundary"):
                        boundaries.append({"start": chunk["offset"] / 10_000_000, "end": (chunk["offset"] + chunk["duration"]) / 10_000_000, "text": chunk["text"]})
            bp.write_text(json.dumps({"fingerprint": fingerprint, "boundaries": boundaries}, ensure_ascii=False, indent=2), "utf-8")
        audio_duration = float(probe(ap)["format"]["duration"])
        duration = math.ceil((audio_duration + 0.7) * FPS) / FPS
        prepared.append({**sc, "audio": str(ap), "audio_duration": audio_duration, "duration": duration, "boundaries": boundaries})
        print(f"Scene {sc['id']}: {duration:.2f}s, {len(boundaries)} subtitle sentences", flush=True)
    (WORK / "scenes.json").write_text(json.dumps(prepared, ensure_ascii=False, indent=2), "utf-8")
    print("Total:", sum(s["duration"] for s in prepared), flush=True)
    create_mix(prepared)
    create_srt(prepared)
    create_cover()
    create_post(prepared)
    return prepared


def create_mix(scenes):
    clips = []
    for sc in scenes:
        dest = WORK / f"voice_{sc['id']}_padded.wav"
        run([FFMPEG, "-y", "-i", sc["audio"], "-af", f"apad=whole_dur={sc['duration']}", "-t", str(sc["duration"]), "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", dest])
        clips.append(dest)
    cp = WORK / "voice_concat.txt"
    cp.write_text("".join(f"file '{str(p).replace(chr(92), '/')}\u0027\n" for p in clips), "utf-8")
    voice = WORK / "voice_full.wav"
    run([FFMPEG, "-y", "-f", "concat", "-safe", "0", "-i", cp, "-c", "copy", voice])
    duration = sum(s["duration"] for s in scenes)
    create_bgm(WORK / "ambient.wav", duration)
    run([FFMPEG, "-y", "-i", voice, "-i", WORK / "ambient.wav", "-filter_complex", "[0:a]loudnorm=I=-18:TP=-2:LRA=9[v];[v][1:a]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=10[a]", "-map", "[a]", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", WORK / "final_audio.m4a"])


def create_bgm(path, duration, sr=48000):
    # Original, programmatically synthesized soft pentatonic plucks; no external music.
    n = int(duration * sr)
    result = np.zeros(n, dtype=np.float32)
    pitches = [261.63, 329.63, 392.0, 293.66, 440.0, 392.0, 329.63, 293.66]
    for j, onset in enumerate(np.arange(0, duration, 3.6)):
        start = int(onset * sr)
        count = min(int(5.0 * sr), n - start)
        t = np.arange(count, dtype=np.float32) / sr
        f = pitches[j % len(pitches)]
        env = (1 - np.exp(-t * 65)) * np.exp(-t * 1.1)
        signal = (np.sin(2 * np.pi * f * t) + 0.22 * np.sin(2 * np.pi * 2 * f * t) + 0.11 * np.sin(2 * np.pi * f * 0.5 * t)) * env * 0.014
        result[start:start + count] += signal
    fade = np.minimum(np.arange(n) / (sr * 2.0), (n - np.arange(n)) / (sr * 3.0))
    result *= np.minimum(1, fade)
    stereo = np.column_stack((result, result * 0.94))
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes((stereo * 32767).astype("<i2").tobytes())


def timestamp(seconds):
    ms = round(seconds * 1000)
    return f"{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}"


def create_srt(scenes):
    entries, offset = [], 0.0
    drawer = ImageDraw.Draw(Image.new("RGB", (W, H)))
    for sc in scenes:
        for si, sub in enumerate(sc["boundaries"]):
            text = "\n".join(wrap(sub["text"], font(30), 1660, drawer))
            next_start = sc["boundaries"][si + 1]["start"] if si + 1 < len(sc["boundaries"]) else sc["duration"]
            entries.append(f"{len(entries) + 1}\n{timestamp(offset + sub['start'])} --> {timestamp(offset + min(sub['end'], next_start, sc['duration']))}\n{text}\n")
        offset += sc["duration"]
    (OUT / "源音五十音_介绍字幕.srt").write_text("\n".join(entries), "utf-8-sig")


def background():
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, 18, H), fill=RED)
    d.line((116, 130, 1800, 130), fill=LINE, width=2)
    d.text((120, 67), "源音  /  五十音", font=font(28, "bold"), fill=INK)
    d.text((1065, 75), "ANDROID REDESIGN", font=font(18), fill=MUTED, anchor="ra")
    for x in range(1100, 1830, 42):
        for y in range(170, 958, 42):
            d.ellipse((x, y, x + 2, y + 2), fill="#E0E4DC")
    return img


def create_cover():
    img = background()
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((120, 192, 410, 244), radius=26, fill=TEAL)
    d.text((265, 217), "汉语母语者的日语入门", font=font(22, "bold"), fill=PAPER, anchor="mm")
    d.text((115, 300), "从汉字，", font=font(104, "bold"), fill=INK)
    d.text((115, 432), "读懂假名。", font=font(104, "bold"), fill=INK)
    d.text((122, 623), "源音 · 五十音  /  安卓重构版", font=font(35), fill=TEAL)
    d.text((122, 708), "查字源  ·  辨字形  ·  练书写  ·  做演练", font=font(29), fill=MUTED)
    d.line((122, 830, 1030, 830), fill=LINE, width=2)
    d.text((122, 866), "为手机重新整理的五十音学习工具", font=font(24), fill=MUTED)
    d.rounded_rectangle((1194, 205, 1754, 808), radius=36, fill="#E9EEE7", outline="#CDD7CE", width=2)
    d.text((1474, 360), "安", font=font(156, "kai"), fill="#A6B9AB", anchor="mm")
    d.line((1310, 476, 1638, 476), fill="#B9C8BC", width=2)
    d.text((1474, 620), "あ", font=font(178, "jp"), fill=RED, anchor="mm")
    d.text((1474, 863), "从熟悉的字形，建立新的联想", font=font(23), fill=TEAL, anchor="mm")
    img.save(OUT / "源音五十音_B站封面_1920x1080.png")


def create_post(scenes):
    duration = sum(s["duration"] for s in scenes)
    content = f"""# 投稿文案

标题：从汉字，读懂假名｜源音·五十音 安卓重构版

简介：
一款为汉语母语者整理的五十音学习工具。这次围绕安卓手机重做排版与交互，保留平片对照、汉字书源、形近辨认、临摹默写、阶梯修习与综合演练。

视频展示：五十音图与单字详解 → 书源与音拍 → 形近假名 → 临摹默写 → 阶梯练习和答题反馈。

学习内容与进度保存在本机；四十六个清音发音已经内置，词汇和普通话读音使用系统语音。字源与汉语近似音用于辅助联想，不能替代日语音值训练。临摹功能不自动评判笔顺。

画面为重构后的手机网页界面实录（390 × 844），配以原创编排；并非安卓真机录屏。中文旁白由 Microsoft Edge TTS 的 Yunxi 合成；背景音乐为本地程序合成的原创轻音型。画面中的字体演变是辅助示意，不是原始书法史料摹本。

推荐分区：知识 → 野生技能协会（或按账号定位选科技 → 软件应用）
标签：日语入门、五十音、假名、安卓应用、汉字、学习工具

文件：源音五十音_安卓版介绍_1080p.mp4
成片规格：1920 × 1080，30 fps，H.264 + AAC，约 {duration:.1f} 秒；已烧录中文字幕，另附 SRT。

制作与验证的具体结果见同目录「视频验证.json」。未上传至任何平台。
"""
    (OUT / "B站投稿文案.md").write_text(content, "utf-8")


def caption_for(sc, t):
    for sub in sc["boundaries"]:
        if sub["start"] - 0.03 <= t <= sub["end"] + 0.1:
            return sub["text"]
    return ""


def composite(sc, t, shot):
    img = background()
    d = ImageDraw.Draw(img)
    entrance = min(1.0, t / 0.7)
    ease = 1 - (1 - entrance) ** 3
    dx = int((1 - ease) * 26)
    d.text((120 + dx, 188), f"{sc['id']}   /   {sc['label']}", font=font(23, "bold"), fill=RED)
    for j, line in enumerate(sc["headline"]):
        d.text((115 + dx, 262 + j * 102), line, font=font(70, "bold"), fill=INK)
    for j, line in enumerate(sc["notes"]):
        y = 512 + j * 59
        d.line((122, y + 17, 146, y + 17), fill=RED, width=3)
        d.text((166, y), line, font=font(28), fill=TEAL)
    motif_font = font(98 if len(sc["motif"]) < 8 else 64, "jp" if any(ch in sc["motif"] for ch in "あアかがきゃシツ") else "kai")
    d.text((122, 665), sc["motif"], font=motif_font, fill="#8A9F91")
    d.line((122, 822, 1074, 822), fill=LINE, width=2)
    d.text((122, 853), sc["foot"], font=font(24), fill=MUTED)
    # Device chrome is deliberately unobtrusive; the app surface is an actual browser screenshot.
    screen_w, screen_h = 390, 844
    px, py = 1284, 68
    shadow = Image.new("RGBA", (W, H))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle((px - 26, py - 26, px + screen_w + 34, py + screen_h + 30), radius=47, fill=(32, 53, 43, 44))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    img = Image.alpha_composite(img.convert("RGBA"), shadow)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((px - 15, py - 20, px + screen_w + 15, py + screen_h + 20), radius=40, fill=INK)
    screen = shot.convert("RGBA")
    mask = Image.new("L", (PW, PH), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, PW - 1, PH - 1), radius=27, fill=255)
    img.paste(screen, (px, py), mask)
    d = ImageDraw.Draw(img)
    capture_label = "Android APK 运行实录" if sc.get("apk_capture") else "手机界面实录  ·  390 × 844"
    d.text((px + PW / 2, 31), capture_label, font=font(17), fill=MUTED, anchor="mm")
    # Fixed captions stay outside the phone's controls and above B站's standard progress bar.
    caption = caption_for(sc, t)
    if caption:
        lines = wrap(caption, font(30), 1640, d)
        bh = 28 + 43 * len(lines)
        by = H - 44 - bh
        overlay = Image.new("RGBA", (W, H))
        od = ImageDraw.Draw(overlay)
        od.rounded_rectangle((100, by, 1820, H - 44), radius=16, fill=(29, 45, 42, 240))
        for j, line in enumerate(lines):
            od.text((960, by + 16 + j * 43), line, font=font(30), fill=PAPER, anchor="mt")
        img = Image.alpha_composite(img, overlay)
    return img.convert("RGB")


async def click(page, selector):
    await page.locator(selector).first.click(timeout=5000)


def smooth_stroke(points):
    result = []
    padded = [points[0]] + points + [points[-1]]
    for i in range(1, len(padded) - 2):
        p0, p1, p2, p3 = padded[i-1:i+3]
        for t in np.linspace(0, 1, 10, endpoint=False):
            pos = []
            for axis in (0, 1):
                a, b, c, d = p0[axis], p1[axis], p2[axis], p3[axis]
                pos.append(0.5 * ((2*b) + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t))
            result.append(pos)
    return result + [points[-1]]


async def prepare_scene(page, index):
    await page.evaluate("document.getElementById('kana-detail-modal').classList.remove('open')")
    await page.evaluate("window.scrollTo({top:0, behavior:'instant'})")
    if index == 0:
        await page.evaluate("app.switchTab('tab-gojuon')")
        await click(page, '[data-subview="seion"]')
        await click(page, '[data-cardmode="all"]')
    elif index == 1:
        await page.evaluate("app.switchTab('tab-gojuon'); document.querySelector('[data-subview=\"seion\"]').click(); document.querySelector('[data-cardmode=\"all\"]').click(); window.scrollTo({top:560,behavior:'instant'})")
    elif index == 2:
        await page.evaluate("app.switchTab('tab-origins')")
    elif index == 3:
        await page.evaluate("app.switchTab('tab-confusable')")
    elif index == 4:
        await page.evaluate("app.switchTab('tab-writing'); app.dojoIndex=0; app.dojoMemoryMode=false; app.renderDojoState()")
        await page.locator("#calligraphy-canvas").scroll_into_view_if_needed()
    elif index == 5:
        await page.evaluate("app.switchTab('tab-stages')")
    else:
        await page.evaluate("if(app.activeQuiz) app.finishQuizSession(true); app.switchTab('tab-gojuon')")
        await click(page, '[data-subview="seion"]')
        await click(page, '[data-cardmode="all"]')
    await page.wait_for_timeout(200)


async def act(page, index, p, fired):
    async def once(key, threshold, code):
        if p >= threshold and key not in fired:
            fired[key] = True
            await page.evaluate(code)
    if index == 0:
        if 0.28 < p < 0.70:
            await page.evaluate("y => window.scrollTo({top:y,behavior:'instant'})", (p - 0.28) / 0.42 * 240)
        await once("same", 0.74, "document.getElementById('btn-highlight-sameorigin').click()")
    elif index == 1:
        await once("blind", 0.10, "document.querySelector('[data-cardmode=\"hira-blind\"]').click()")
        await once("all", 0.30, "document.querySelector('[data-cardmode=\"all\"]').click()")
        await once("detail", 0.47, "app.openKanaDetailModal('a')")
        if 0.64 < p < 0.91:
            await page.evaluate("v => {const el=document.querySelector('.modal-content') || document.querySelector('#kana-detail-modal > div'); if(el)el.scrollTop=v}", (p - 0.64) / 0.27 * 430)
        await once("close", 0.96, "document.getElementById('kana-detail-modal').classList.remove('open'); document.querySelector('[data-cardmode=\"kanji-matrix\"]').click()")
    elif index == 2:
        if 0.05 < p < 0.36:
            await page.evaluate("y => window.scrollTo({top:y,behavior:'instant'})", (p - 0.05) / 0.31 * 460)
        await once("dakuon", 0.43, "app.switchTab('tab-gojuon'); document.querySelector('[data-subview=\"dakuon\"]').click(); window.scrollTo({top:0,behavior:'instant'})")
        await once("yoon", 0.69, "document.querySelector('[data-subview=\"yoon\"]').click(); window.scrollTo({top:0,behavior:'instant'})")
        await once("special", 0.85, "document.querySelector('[data-subview=\"special\"]').click(); window.scrollTo({top:0,behavior:'instant'})")
    elif index == 3:
        if 0.2 < p < 0.68:
            await page.evaluate("y => window.scrollTo({top:y,behavior:'instant'})", (p - 0.2) / 0.48 * 420)
        await once("drill", 0.74, "app.launchCustomQuiz({title:'形近字辨认',mode:'confusable-sniper',kanaIds:['shi','tsu','so','n'],count:10})")
    elif index == 4:
        await once("memory", 0.20, "document.getElementById('dojo-mode-memory').click(); {const el=document.getElementById('dojo-toggle-origin-ghost');el.checked=false;el.dispatchEvent(new Event('change'));} document.getElementById('calligraphy-canvas').scrollIntoView({block:'center',behavior:'instant'})")
        # Draw through the canvas's real mouse handlers instead of fabricating a completion record.
        if 0.26 <= p <= 0.67:
            box = await page.locator("#calligraphy-canvas").bounding_box()
            q = (p - 0.26) / 0.41
            raw_strokes = [
                [(0.24, 0.31), (0.40, 0.28), (0.58, 0.25), (0.72, 0.24)],
                [(0.46, 0.14), (0.44, 0.34), (0.43, 0.56), (0.45, 0.76)],
                [(0.61, 0.35), (0.56, 0.50), (0.45, 0.65), (0.31, 0.73), (0.24, 0.67), (0.28, 0.53), (0.42, 0.46), (0.60, 0.46), (0.72, 0.56), (0.74, 0.68), (0.63, 0.79), (0.54, 0.81)],
            ]
            strokes = [smooth_stroke(s) for s in raw_strokes]
            lengths = [len(s) for s in strokes]
            total = sum(lengths)
            current = min(total - 1, int(q * total))
            previous = fired.get("drawstep", -1)
            if current > previous:
                for step in range(previous + 1, current + 1):
                    count = 0
                    for si, stroke in enumerate(strokes):
                        if step < count + len(stroke):
                            pi = step - count
                            x, y = stroke[pi]
                            await page.mouse.move(box["x"] + x * box["width"], box["y"] + y * box["height"])
                            if pi == 0:
                                await page.mouse.down()
                            if pi == len(stroke) - 1:
                                await page.mouse.up()
                            break
                        count += len(stroke)
                fired["drawstep"] = current
        if p > 0.69 and "mouseup" not in fired:
            fired["mouseup"] = True
            await page.mouse.up()
        await once("reveal", 0.76, "document.getElementById('dojo-btn-reveal').click()")
    elif index == 5:
        await once("quiz", 0.27, "app.launchCustomQuiz({title:'平片对应练习',mode:'hira-kata-cross',kanaIds:['a','i','u','e','o'],count:10})")
        await once("wrong", 0.45, "{ const q=app.activeQuiz.currentQ; if(q.choices)app.handleChoiceSelect(q.choices.findIndex(c=>!c.isCorrect)); }")
        await once("next", 0.67, "app.nextQuestion()")
        await once("right", 0.82, "{const q=app.activeQuiz.currentQ; if(q.choices)app.handleChoiceSelect(q.choices.findIndex(c=>c.isCorrect)); }")
    else:
        await once("dark", 0.24, "document.getElementById('btn-toggle-theme').click()")
        await once("light", 0.55, "document.getElementById('btn-toggle-theme').click()")
        if 0.63 < p < 0.82:
            await page.evaluate("y => window.scrollTo({top:y,behavior:'instant'})", (p - 0.63) / 0.19 * 200)


async def record(url, apk_path=None, apk_start=7.0):
    scenes = json.loads((WORK / "scenes.json").read_text("utf-8"))
    total = sum(sc["duration"] for sc in scenes)
    capture_video = WORK / "picture_only.mp4"
    cmd = [str(FFMPEG), "-y", "-f", "rawvideo", "-pixel_format", "rgb24", "-video_size", f"{W}x{H}", "-framerate", str(FPS), "-i", "pipe:0", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-r", str(OUTPUT_FPS), "-pix_fmt", "yuv420p", str(capture_video)]
    log = (WORK / "encoder.log").open("wb")
    encoder = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=log, cwd=WORK)
    errors = []
    used_apk = False
    start = time.time()
    try:
        async with async_playwright() as p:
            context = await p.chromium.launch_persistent_context(str(WORK / "browser-profile"), executable_path=str(CHROME), headless=True, viewport={"width": PW, "height": PH}, device_scale_factor=1, is_mobile=True, has_touch=True, args=["--no-sandbox", "--disable-dev-shm-usage", f"--disk-cache-dir={CACHE / 'chromium'}"])
            page = context.pages[0] if context.pages else await context.new_page()
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            await page.goto(url, wait_until="networkidle")
            await page.evaluate("localStorage.clear()")
            await page.reload(wait_until="networkidle")
            await page.wait_for_function("window.app && window.KANA_DATA")
            # Deterministic demo questions, with no preset mastery data.
            await page.evaluate("Math.random=(()=>{let seed=807;return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}})()")
            # Narration replaces UI sound. Never present silent browser TTS as an Android voice test.
            await page.evaluate("if(window.audioEngine){window.audioEngine.speakJapanese=()=>Promise.resolve();window.audioEngine.speakChinese=()=>Promise.resolve();window.audioEngine.playCorrectSfx=()=>{};window.audioEngine.playWrongSfx=()=>{}}")
            for si, sc in enumerate(scenes):
                await prepare_scene(page, si)
                fired = {}
                frames = round(sc["duration"] * FPS)
                decoder = None
                if si == len(scenes) - 1 and apk_path:
                    print("Awaiting APK footage:", apk_path, flush=True)
                    deadline = time.time() + 300
                    while not apk_path.exists() and time.time() < deadline:
                        await asyncio.sleep(5)
                    if not apk_path.exists():
                        raise FileNotFoundError(apk_path)
                    probe(apk_path)
                    used_apk = True
                    sc["apk_capture"] = True
                    decoder = subprocess.Popen([str(FFMPEG), "-v", "error", "-stream_loop", "-1", "-ss", str(apk_start), "-i", str(apk_path), "-vf", f"fps={FPS},scale={PW}:{PH}:force_original_aspect_ratio=decrease,pad={PW}:{PH}:(ow-iw)/2:(oh-ih)/2:color=0xF7F5EF", "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "pipe:1"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, cwd=WORK)
                for fi in range(frames):
                    t = fi / FPS
                    if decoder:
                        size = PW * PH * 3
                        data = decoder.stdout.read(size)
                        if len(data) != size:
                            raise RuntimeError("APK footage decode ended prematurely")
                        shot = Image.frombytes("RGB", (PW, PH), data)
                    else:
                        await act(page, si, t / sc["duration"], fired)
                        data = await page.screenshot(type="png")
                        shot = Image.open(io.BytesIO(data))
                    frame = composite(sc, t, shot)
                    if fi in {round(frames * 0.18), round(frames * 0.58), round(frames * 0.85)}:
                        frame.save(WORK / f"review_{sc['id']}_{fi:04d}.jpg", quality=93)
                    encoder.stdin.write(frame.tobytes())
                    if fi % (FPS * 5) == 0:
                        print(f"Scene {sc['id']} {t:.1f}/{sc['duration']:.1f}s", flush=True)
                print(f"Captured scene {sc['id']}; elapsed {time.time()-start:.1f}s", flush=True)
                if decoder:
                    decoder.stdout.close()
                    decoder.terminate()
                    decoder.wait()
            await context.close()
    finally:
        encoder.stdin.close()
        encoder.wait()
        log.close()
    if encoder.returncode:
        raise RuntimeError((WORK / "encoder.log").read_text(errors="replace")[-4000:])
    run([FFMPEG, "-y", "-i", capture_video, "-i", WORK / "final_audio.m4a", "-map", "0:v", "-map", "1:a", "-c", "copy", "-t", f"{total:.6f}", "-movflags", "+faststart", "-metadata", "title=源音·五十音 安卓重构版", "-metadata", "comment=手机网页界面实录，AI合成中文旁白；非安卓真机录屏", VIDEO])
    (WORK / "browser_errors.json").write_text(json.dumps(errors, ensure_ascii=False, indent=2), "utf-8")
    if used_apk:
        post = OUT / "B站投稿文案.md"
        content = post.read_text("utf-8").replace("画面为重构后的手机网页界面实录（390 × 844），配以原创编排；并非安卓真机录屏。", "前六部分为重构后的手机网页界面实录（390 × 844）；最后一部分为 Android 15 模拟器中运行交付 APK 的实际屏幕录制。片内已分别标注，均非实体手机录屏。")
        post.write_text(content, "utf-8")
        original_apk_capture = OUT / "Android_APK运行实录.mp4"
        if apk_path.resolve() != original_apk_capture.resolve():
            shutil.copy2(apk_path, original_apk_capture)
        (WORK / "apk_capture.json").write_text(json.dumps({"path": original_apk_capture.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(apk_path.read_bytes()).hexdigest(), "source_start_seconds": apk_start, "used_duration_seconds": scenes[-1]["duration"], "used_in_scene": "07", "type": "Android emulator screenrecord"}, ensure_ascii=False, indent=2), "utf-8")
    verify()


async def preview(url):
    scenes = json.loads((WORK / "scenes.json").read_text("utf-8"))
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(str(WORK / "preview-profile"), executable_path=str(CHROME), headless=True, viewport={"width": PW, "height": PH}, device_scale_factor=1, is_mobile=True, has_touch=True, args=["--no-sandbox", f"--disk-cache-dir={CACHE / 'preview'}"])
        page = context.pages[0] if context.pages else await context.new_page()
        await page.goto(url, wait_until="networkidle")
        await page.evaluate("localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_function("window.app && window.KANA_DATA")
        await page.evaluate("if(window.audioEngine){window.audioEngine.speakJapanese=()=>Promise.resolve();window.audioEngine.speakChinese=()=>Promise.resolve();window.audioEngine.playCorrectSfx=()=>{};window.audioEngine.playWrongSfx=()=>{}}")
        for si, sc in enumerate(scenes):
            await prepare_scene(page, si)
            fired = {}
            for progress in (0.18, 0.58, 0.85):
                await act(page, si, progress, fired)
                await page.wait_for_timeout(150)
                data = await page.screenshot(type="png")
                shot = Image.open(io.BytesIO(data))
                composite(sc, sc["duration"] * progress, shot).save(WORK / f"preview_{sc['id']}_{int(progress*100)}.jpg", quality=94)
            print("Previewed", sc["id"], flush=True)
        await context.close()


async def playback_check(url):
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(str(WORK / "playback-profile"), executable_path=str(CHROME), headless=True, viewport={"width": 1280, "height": 800}, args=["--no-sandbox", "--autoplay-policy=no-user-gesture-required", f"--disk-cache-dir={CACHE / 'playback'}"])
        page = context.pages[0] if context.pages else await context.new_page()
        await page.goto(url, wait_until="domcontentloaded")
        await page.wait_for_function("document.querySelector('video') && document.querySelector('video').readyState >= 3")
        # A plain local HTTP server may not implement byte-range requests.
        # Decode a fully fetched blob for a reliable end-seek check.
        await page.evaluate("async()=>{const v=document.querySelector('video');const b=await(await fetch(v.currentSrc)).blob();v.src=URL.createObjectURL(b);v.load();await new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=()=>reject(new Error(v.error?.message))})}")
        await page.evaluate("async()=>{const v=document.querySelector('video');v.muted=false;await v.play()}")
        await page.wait_for_timeout(700)
        start = await page.evaluate("()=>{const v=document.querySelector('video');return{readyState:v.readyState,paused:v.paused,currentTime:v.currentTime,duration:v.duration,width:v.videoWidth,height:v.videoHeight,error:v.error?.message||null,muted:v.muted,audioDecodedBytes:v.webkitAudioDecodedByteCount||0}}")
        await page.evaluate("async()=>{const v=document.querySelector('video');await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=v.duration-0.4});await v.play()}")
        await page.wait_for_timeout(1100)
        end = await page.evaluate("()=>{const v=document.querySelector('video');return{ended:v.ended,currentTime:v.currentTime,error:v.error?.message||null}}")
        await page.screenshot(path=str(WORK / "playback_end.png"))
        result = {"start": start, "end": end, "note": "Browser actual playback and end-seek check; this is not a human auditory review"}
        qa_path = OUT / "视频验证.json"
        qa = json.loads(qa_path.read_text("utf-8"))
        qa["browser_playback"] = result
        qa_path.write_text(json.dumps(qa, ensure_ascii=False, indent=2), "utf-8")
        print(json.dumps(result, ensure_ascii=False, indent=2), flush=True)
        await context.close()


def verify():
    qa_path = OUT / "视频验证.json"
    sha256 = hashlib.sha256(VIDEO.read_bytes()).hexdigest()
    existing = json.loads(qa_path.read_text("utf-8")) if qa_path.exists() else {}
    if existing.get("sha256") != sha256:
        existing = {}
    result = probe(VIDEO)
    run([FFMPEG, "-v", "error", "-i", VIDEO, "-f", "null", "-"])
    streams = result["streams"]
    v = next(s for s in streams if s["codec_type"] == "video")
    a = next(s for s in streams if s["codec_type"] == "audio")
    loud = run([FFMPEG, "-hide_banner", "-i", VIDEO, "-af", "loudnorm=I=-16:TP=-1.5:LRA=10:print_format=json", "-vn", "-f", "null", "-"])
    log = loud.stderr.decode("utf-8", errors="replace")
    match = re.search(r'\{\s*"input_i".*?\}', log, re.S)
    loudness = json.loads(match.group()) if match else {}
    errors_file = WORK / "browser_errors.json"
    errors = json.loads(errors_file.read_text("utf-8")) if errors_file.exists() else existing.get("browser_runtime_errors")
    apk_footage = json.loads((WORK / "apk_capture.json").read_text("utf-8")) if (WORK / "apk_capture.json").exists() else existing.get("apk_footage")
    qa = {
        "file": VIDEO.name, "sha256": sha256, "bytes": VIDEO.stat().st_size,
        "duration_seconds": float(result["format"]["duration"]),
        "video": {"codec": v["codec_name"], "width": v["width"], "height": v["height"], "frame_rate": v["avg_frame_rate"], "pixel_format": v["pix_fmt"]},
        "audio": {"codec": a["codec_name"], "sample_rate": a["sample_rate"], "channels": a["channels"], "loudness": loudness},
        "full_decode": "passed", "browser_runtime_errors": errors,
        "capture": "Scenes 01-06: Chromium mobile viewport 390x844 with real app interactions. Scene 07: Android 15 emulator running APK, original screenrecord preserved in outputs/video. No physical handset recording." if apk_footage else "Real rebuilt web app in Chromium mobile viewport 390x844; deterministic demo interactions; no fabricated progress; not Android hardware recording",
        "apk_footage": apk_footage,
        "voice": f"Microsoft Edge TTS {VOICE}, rate +4%; synthetic narration",
        "music": "Original programmatically synthesized pentatonic ambient notes",
        "verification_boundary": "Automated format, full decode, audio loudness and browser runtime checks; key frames inspected separately. No human auditory review claimed.",
    }
    for field in ("browser_playback", "visual_review"):
        if field in existing:
            qa[field] = existing[field]
    qa_path.write_text(json.dumps(qa, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps(qa, ensure_ascii=False, indent=2), flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--prepare", action="store_true")
    parser.add_argument("--record", action="store_true")
    parser.add_argument("--verify", action="store_true")
    parser.add_argument("--preview", action="store_true")
    parser.add_argument("--url", default="http://127.0.0.1:8766")
    parser.add_argument("--apk", type=Path)
    parser.add_argument("--apk-start", type=float, default=7.0)
    parser.add_argument("--playback")
    args = parser.parse_args()
    if args.prepare:
        asyncio.run(prepare_audio())
    if args.record:
        asyncio.run(record(args.url, args.apk.resolve() if args.apk else None, args.apk_start))
    if args.verify:
        verify()
    if args.preview:
        asyncio.run(preview(args.url))
    if args.playback:
        asyncio.run(playback_check(args.playback))
    if not any((args.prepare, args.record, args.verify, args.preview, args.playback)):
        parser.print_help()


if __name__ == "__main__":
    main()
