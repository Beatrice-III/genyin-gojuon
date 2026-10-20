import asyncio
import math
import os
import shutil
import struct
import subprocess
import tempfile
import wave
import edge_tts
from PIL import Image, ImageDraw, ImageFont
from playwright.async_api import async_playwright

ROOT_DIR = r"d:\五十音图"
FFMPEG_BIN = r"D:\ffmpeg-2025-03-31-git-35c091f4b7-full_build\bin\ffmpeg.exe"
if not os.path.exists(FFMPEG_BIN):
    FFMPEG_BIN = "ffmpeg"

CAPTURE_FPS = 8
OUTPUT_FPS = 30
WIDTH = 1920
HEIGHT = 1080

SCENES = [
    {
        "id": "scene_01",
        "chapter": "序章 · 汉字书源与东方书卷美学",
        "narration": "欢迎了解《源音·五十音》。这是一款专为中文母语者设计的五十音图修习应用。界面采用素宣留白与松烟墨韵的书卷排版，摒弃浮夸修辞，回归汉字书源与汉日音韵本身。",
        "subtitles": [
            "欢迎了解《源音·五十音》——专为中文母语者设计的五十音修习应用",
            "界面采用素宣留白、松烟墨韵与朱印点睛的东方书卷排版",
            "摒弃浮夸修辞，回归汉字书源与汉日音韵的深层关联"
        ]
    },
    {
        "id": "scene_02",
        "chapter": "卷一 · 五十音图与单字详考",
        "narration": "在第一卷五十音图中，支持平片同屏、隐音自测与万叶本字矩阵切换。点选任意假名，即可对照聆听日语发音与汉字本音，查阅草书连笔、楷书偏旁、母语正音对比以及汉日同源音读词。",
        "subtitles": [
            "卷一「五十音图」：支持平片同屏、隐音自测与万叶本字视图切换",
            "点选任意假名，对照聆听日语读音与万叶汉字普通话本音",
            "详考草书演变、楷书偏旁、扁唇正音要领与同源音读词汇"
        ]
    },
    {
        "id": "scene_03",
        "chapter": "卷二 · 万叶假名与草书溯源",
        "narration": "第二卷系统梳理了从奈良时代万叶假名，到平安时代草书化平假名、楷书偏旁化片假名的历史源流。四十六个清音中，有二十九组平片假名源自同一个汉字，帮助母语者一眼识破假名结体。",
        "subtitles": [
            "卷二「万叶书源」：梳理奈良万叶假名至平安草书、楷书偏旁的源流",
            "平假名源于晋唐草书连写，片假名源于汉文佛典楷书偏旁省取",
            "四十六音中有二十九组「平片同源字」，记一汉字即可兼通平片"
        ]
    },
    {
        "id": "scene_04",
        "chapter": "音韵拓展 · 浊音、拗音与古入声促音",
        "narration": "在音韵拓展部分，结合汉语音韵学定律「古无轻唇音」解析は行浊化，以汉语拼音介音参照拗音拼读，并揭示中古汉语入声塞音尾如何转化为促音，前鼻音与后鼻音如何分流为拨音与长音。",
        "narration_rate": "+4%",
        "subtitles": [
            "音韵拓展：以清代学者钱大昕「古无轻唇音」定律解析は行浊化",
            "以汉语拼音 i 介音原理参照三十三个拗音的拼读结构",
            "揭示中古汉语入声字如何化为促音，前后鼻音如何分流为拨音与长音"
        ]
    },
    {
        "id": "scene_05",
        "chapter": "卷三 · 十二组形近假名书源辨微",
        "narration": "第三卷专门考辨十二组易混形近假名。例如将片假名シ、ツ、ソ、ン还原为汉字之、川、曾、尔，即可从三点水、川字竖、八字点与两点水的笔势方向上彻底明辨，不再混淆。",
        "subtitles": [
            "卷三「字形辨微」：集中考辨十二组初学者易混的形近假名",
            "将片假名 シ·ツ·ソ·ン 还原为本字「之·川·曾·爾」",
            "由三点水、川字三竖、八字点与两点水的运笔走向自然明辨"
        ]
    },
    {
        "id": "scene_06",
        "chapter": "卷四 · 书道临池：本字叠影与默写",
        "narration": "第四卷书道临池提供米字格毛笔书写画板。底层可叠印万叶汉字本字，直观体察草书安字如何化为平假名あ；亦可切换至默写模式，隐去底稿独立书写，再叠印朱砂范字核验。",
        "subtitles": [
            "卷四「书道临池」：米字格压感毛笔书写与万叶本字叠影",
            "底层叠印汉字「安」，直观体察草书连笔如何化为平假名「あ」",
            "支持切换至「默写模式」隐去底稿独立运笔，再叠印朱砂范字核验"
        ]
    },
    {
        "id": "scene_07",
        "chapter": "卷五与卷六 · 十阶修习与八式演练",
        "narration": "第五卷与第六卷提供十阶修习课程与八式综合演练，涵盖书源配对、平片互转、听音辨字、字形辨微、罗马字盲打与真词拼读。同局答错的题目将在三题后自动复考，并归入温故录，确保完全掌握。",
        "subtitles": [
            "卷五「十阶修习」与卷六「八式演练」：量化题量与90%达标线",
            "涵盖书源配对、平片对照、听音辨字、字形辨微、盲打与真词八大题型",
            "同局错题三题后自动复考并收入温故录，支持安卓APK离线安装使用"
        ]
    }
]


def generate_bilibili_cover(out_path):
    img = Image.new("RGB", (WIDTH, HEIGHT), (245, 241, 232))
    draw = ImageDraw.Draw(img)

    draw.rectangle([36, 36, WIDTH - 37, HEIGHT - 37], outline=(166, 52, 41), width=3)
    draw.rectangle([46, 46, WIDTH - 47, HEIGHT - 47], outline=(180, 168, 150), width=1)

    font_serif = r"C:\Windows\Fonts\simsun.ttc"
    font_kaiti = r"C:\Windows\Fonts\simkai.ttf"
    font_sans = r"C:\Windows\Fonts\msyhbd.ttc"

    f_kicker = ImageFont.truetype(font_sans, 30) if os.path.exists(font_sans) else ImageFont.load_default()
    f_title = ImageFont.truetype(font_kaiti, 108) if os.path.exists(font_kaiti) else ImageFont.load_default()
    f_sub = ImageFont.truetype(font_serif, 42) if os.path.exists(font_serif) else ImageFont.load_default()
    f_seal = ImageFont.truetype(font_kaiti, 46) if os.path.exists(font_kaiti) else ImageFont.load_default()
    f_bg_char = ImageFont.truetype(font_kaiti, 240) if os.path.exists(font_kaiti) else ImageFont.load_default()
    f_pill = ImageFont.truetype(font_sans, 28) if os.path.exists(font_sans) else ImageFont.load_default()

    bg_chars = [("安", "あ", 1420, 260), ("以", "い", 1680, 260), ("宇", "う", 1420, 560), ("世", "せ", 1680, 560)]
    for kj, kn, cx, cy in bg_chars:
        draw.text((cx, cy), kj, fill=(230, 223, 210), font=f_bg_char, anchor="mm")
        draw.text((cx + 70, cy + 70), kn, fill=(220, 205, 195), font=f_title, anchor="mm")

    draw.rounded_rectangle([120, 140, 240, 260], radius=16, fill=(166, 52, 41))
    draw.text((180, 175), "源音", fill=(252, 249, 243), font=f_seal, anchor="mm")
    draw.text((180, 225), "五十", fill=(252, 249, 243), font=f_seal, anchor="mm")

    draw.text((270, 175), "专为中文母语者打造的五十音修习应用 · Android APK & Web", fill=(166, 52, 41), font=f_kicker)
    draw.text((270, 220), "万叶假名书源 × 汉日音韵考辨 × 八式演练", fill=(92, 85, 76), font=f_kicker)

    draw.text((120, 360), "源音 · 五十音", fill=(28, 26, 23), font=f_title)
    draw.text((120, 510), "草书连笔识平假 · 楷书偏旁识片假 · 古音脉络通声韵", fill=(43, 69, 92), font=f_sub)

    tags = [
        "四十六音草书与偏旁全溯源",
        "十二组形近假名本字辨微",
        "米字格毛笔本字叠影与默写",
        "十阶修习与八式演练保掌握"
    ]
    tx = 120
    ty = 650
    for i, t in enumerate(tags):
        col = i % 2
        row = i // 2
        bx = tx + col * 580
        by = ty + row * 96
        draw.rounded_rectangle([bx, by, bx + 540, by + 72], radius=10, fill=(252, 249, 243), outline=(166, 52, 41), width=2)
        draw.text((bx + 270, by + 36), t, fill=(28, 26, 23), font=f_pill, anchor="mm")

    img.save(out_path, "PNG")
    print("Generated Bilibili cover:", out_path)


def get_audio_duration(filepath):
    cmd = [FFMPEG_BIN, "-i", filepath]
    res = subprocess.run(cmd, capture_output=True, encoding="utf-8", errors="replace")
    out = res.stderr
    for line in out.splitlines():
        if "Duration:" in line:
            parts = line.split("Duration:")[1].split(",")[0].strip().split(":")
            return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
    return 10.0


def generate_ambient_bgm(wav_path, duration_sec, sample_rate=44100):
    total_samples = int(duration_sec * sample_rate)
    pentatonic_freqs = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 392.00, 329.63]
    note_interval = 3.2

    with wave.open(wav_path, "w") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)

        chunk_size = 4410
        for start in range(0, total_samples, chunk_size):
            end = min(total_samples, start + chunk_size)
            buf = bytearray()
            for i in range(start, end):
                t = i / sample_rate
                note_idx = int(t / note_interval) % len(pentatonic_freqs)
                local_t = t % note_interval
                freq = pentatonic_freqs[note_idx]

                env = math.exp(-local_t * 1.4) * min(1.0, local_t / 0.04)
                if t < 1.5:
                    env *= (t / 1.5)
                if t > duration_sec - 2.0:
                    env *= max(0.0, (duration_sec - t) / 2.0)

                val = (
                    0.65 * math.sin(2 * math.pi * freq * local_t)
                    + 0.25 * math.sin(2 * math.pi * (freq * 2) * local_t)
                    + 0.10 * math.sin(2 * math.pi * (freq * 0.5) * local_t)
                ) * env * 0.035

                sample_int = max(-32767, min(32767, int(val * 32767)))
                buf.extend(struct.pack("<hh", sample_int, sample_int))
            wf.writeframes(buf)


async def generate_all_voiceovers(work_dir):
    durations = []
    audio_files = []
    for sc in SCENES:
        mp3_path = os.path.join(work_dir, f"{sc['id']}.mp3")
        if not os.path.exists(mp3_path) or os.path.getsize(mp3_path) < 1000:
            rate = sc.get("narration_rate", "+2%")
            comm = edge_tts.Communicate(sc["narration"], "zh-CN-YunxiNeural", rate=rate)
            await comm.save(mp3_path)
        dur = get_audio_duration(mp3_path) + 0.6
        durations.append(dur)
        audio_files.append(mp3_path)
        print(f"Voiceover {sc['id']}: {dur:.2f}s")
    return audio_files, durations


async def run_scene_choreography(page, scene_idx, progress, sub_text, chapter_text, triggered):
    await page.evaluate(
        """({ chapter, subtitle }) => {
            if (window.__updateBiliHud) {
                window.__updateBiliHud(chapter, subtitle);
            }
        }""",
        {"chapter": chapter_text, "subtitle": sub_text}
    )

    if scene_idx == 0:
        if "s0_init" not in triggered:
            triggered.add("s0_init")
            await page.evaluate("window.app.switchTab('tab-gojuon')")
        if "s0_same" not in triggered and progress >= 0.28:
            triggered.add("s0_same")
            await page.evaluate("document.getElementById('btn-highlight-sameorigin').click()")
        if "s0_kanji" not in triggered and progress >= 0.55:
            triggered.add("s0_kanji")
            await page.evaluate("document.querySelector('[data-cardmode=\"kanji-matrix\"]').click()")
        if "s0_all" not in triggered and progress >= 0.82:
            triggered.add("s0_all")
            await page.evaluate("document.querySelector('[data-cardmode=\"all\"]').click()")
            await page.evaluate("document.getElementById('btn-highlight-sameorigin').click()")

    elif scene_idx == 1:
        if "s1_open_a" not in triggered and progress >= 0.12:
            triggered.add("s1_open_a")
            await page.evaluate("window.app.openKanaDetailModal('a')")
        if "s1_open_u" not in triggered and progress >= 0.52:
            triggered.add("s1_open_u")
            await page.evaluate("window.app.openKanaDetailModal('u')")
        if "s1_close" not in triggered and progress >= 0.88:
            triggered.add("s1_close")
            await page.evaluate("document.getElementById('kana-detail-modal').classList.remove('open')")

    elif scene_idx == 2:
        if "s2_tab" not in triggered:
            triggered.add("s2_tab")
            await page.evaluate("window.app.switchTab('tab-origins')")
            await page.evaluate("window.scrollTo(0, 0)")
        if 0.25 <= progress < 0.65:
            y = int(((progress - 0.25) / 0.40) * 420)
            await page.evaluate(f"window.scrollTo(0, {y})")
        if "s2_same" not in triggered and progress >= 0.65:
            triggered.add("s2_same")
            await page.evaluate("document.querySelector('#origin-row-filter [data-row=\"same\"]').click()")
            await page.evaluate("window.scrollTo(0, 480)")

    elif scene_idx == 3:
        if "s3_dakuon" not in triggered:
            triggered.add("s3_dakuon")
            await page.evaluate("window.app.switchTab('tab-gojuon')")
            await page.evaluate("document.querySelector('#gojuon-subview-group [data-subview=\"dakuon\"]').click()")
            await page.evaluate("window.scrollTo(0, 0)")
        if 0.15 <= progress < 0.40:
            y = int(min(1.0, (progress - 0.15) / 0.18) * 580)
            await page.evaluate(f"window.scrollTo(0, {y})")
        if "s3_yoon" not in triggered and progress >= 0.42:
            triggered.add("s3_yoon")
            await page.evaluate("document.querySelector('#gojuon-subview-group [data-subview=\"yoon\"]').click()")
            await page.evaluate("window.scrollTo(0, 0)")
        if "s3_special" not in triggered and progress >= 0.68:
            triggered.add("s3_special")
            await page.evaluate("document.querySelector('#gojuon-subview-group [data-subview=\"special\"]').click()")
            await page.evaluate("window.scrollTo(0, 0)")

    elif scene_idx == 4:
        if "s4_tab" not in triggered:
            triggered.add("s4_tab")
            await page.evaluate("window.app.switchTab('tab-confusable')")
            await page.evaluate("window.scrollTo(0, 0)")
        if progress >= 0.45:
            y = int(min(1.0, (progress - 0.45) / 0.35) * 440)
            await page.evaluate(f"window.scrollTo(0, {y})")

    elif scene_idx == 5:
        if "s5_init" not in triggered:
            triggered.add("s5_init")
            await page.evaluate("window.app.switchTab('tab-writing')")
            await page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
            await page.evaluate("""() => {
                window.app.dojoIndex = 0;
                window.app.renderDojoState();
                window.__demoStrokes = [
                    [{x:85,y:95,width:11},{x:110,y:93,width:10.5},{x:145,y:90,width:10},{x:185,y:87,width:9.5},{x:225,y:85,width:10.5}],
                    [{x:155,y:52,width:12},{x:152,y:85,width:10.5},{x:148,y:135,width:10},{x:146,y:185,width:9.5},{x:145,y:230,width:10}],
                    [{x:192,y:115,width:10.5},{x:175,y:155,width:9.5},{x:145,y:195,width:9},{x:115,y:220,width:9.5},{x:90,y:215,width:10},{x:85,y:185,width:9.5},{x:115,y:155,width:9},{x:165,y:148,width:9.5},{x:210,y:165,width:10},{x:228,y:198,width:9.5},{x:210,y:232,width:8.5},{x:175,y:245,width:7}]
                ];
            }""")
        if 0.12 <= progress < 0.58:
            stroke_prog = (progress - 0.12) / 0.46
            await page.evaluate("""(p) => {
                const pad = window.app.calligraphyPad;
                if (!pad || !window.__demoStrokes) return;
                const all = window.__demoStrokes;
                const totalPts = all.reduce((a, s) => a + s.length, 0);
                let targetPts = Math.max(1, Math.floor(p * totalPts));
                const built = [];
                for (const s of all) {
                    if (targetPts <= 0) break;
                    built.push(s.slice(0, targetPts));
                    targetPts -= s.length;
                }
                pad.strokes = built;
                pad.render();
            }""", stroke_prog)
        if "s5_memory" not in triggered and progress >= 0.62:
            triggered.add("s5_memory")
            await page.evaluate("""() => {
                document.getElementById('dojo-mode-memory').click();
                window.app.calligraphyPad.strokes = window.__demoStrokes;
                window.app.calligraphyPad.render();
            }""")
        if "s5_reveal" not in triggered and progress >= 0.76:
            triggered.add("s5_reveal")
            await page.evaluate("document.getElementById('dojo-btn-reveal').click()")

    elif scene_idx == 6:
        if "s6_stages" not in triggered:
            triggered.add("s6_stages")
            await page.evaluate("window.app.switchTab('tab-stages')")
            await page.evaluate("window.scrollTo({ top: 0, behavior: 'instant' })")
        if "s6_launch" not in triggered and progress >= 0.30:
            triggered.add("s6_launch")
            await page.evaluate("window.app.launchStageQuiz(1)")
        if "s6_ans1" not in triggered and progress >= 0.50:
            triggered.add("s6_ans1")
            await page.evaluate("""() => {
                if (!window.app.activeQuiz) return;
                const q = window.app.activeQuiz.currentQ;
                if (q && q.choices) {
                    const idx = q.choices.findIndex(c => c.isCorrect);
                    if (idx !== -1) window.app.handleChoiceSelect(idx);
                } else if (q && q.type === 'typing') {
                    document.getElementById('quiz-typing-input').value = q.correctAnswer;
                    window.app.submitTypingAnswer();
                }
            }""")
        if "s6_next1" not in triggered and progress >= 0.68:
            triggered.add("s6_next1")
            await page.evaluate("if (window.app.activeQuiz) window.app.nextQuestion()")
        if "s6_ans2" not in triggered and progress >= 0.82:
            triggered.add("s6_ans2")
            await page.evaluate("""() => {
                if (!window.app.activeQuiz) return;
                const q = window.app.activeQuiz.currentQ;
                if (q && q.choices) {
                    const idx = q.choices.findIndex(c => c.isCorrect);
                    if (idx !== -1) window.app.handleChoiceSelect(idx);
                } else if (q && q.type === 'typing') {
                    document.getElementById('quiz-typing-input').value = q.correctAnswer;
                    window.app.submitTypingAnswer();
                }
            }""")


async def main():
    cover_path = os.path.join(ROOT_DIR, "源音五十音-B站封面.png")
    generate_bilibili_cover(cover_path)

    work_dir = os.path.join(tempfile.gettempdir(), "genyin_bili_video")
    os.makedirs(work_dir, exist_ok=True)
    frames_dir = os.path.join(work_dir, "frames")
    if os.path.exists(frames_dir):
        shutil.rmtree(frames_dir)
    os.makedirs(frames_dir, exist_ok=True)

    audio_files, durations = await generate_all_voiceovers(work_dir)

    concat_list_path = os.path.join(work_dir, "audio_list.txt")
    silence_pad = os.path.join(work_dir, "pad.wav")
    generate_ambient_bgm(silence_pad, 0.6)

    with open(concat_list_path, "w", encoding="utf-8") as f:
        for af in audio_files:
            wav_af = af.replace(".mp3", ".wav")
            subprocess.run(
                [FFMPEG_BIN, "-y", "-i", af, "-ar", "44100", "-ac", "2", wav_af],
                capture_output=True
            )
            f.write(f"file '{wav_af}'\n")
            f.write(f"file '{silence_pad}'\n")

    voice_track = os.path.join(work_dir, "voice_full.wav")
    subprocess.run(
        [FFMPEG_BIN, "-y", "-f", "concat", "-safe", "0", "-i", concat_list_path, "-c", "copy", voice_track],
        capture_output=True
    )

    total_duration = sum(durations)
    bgm_track = os.path.join(work_dir, "bgm.wav")
    generate_ambient_bgm(bgm_track, total_duration)

    mixed_audio = os.path.join(work_dir, "final_audio.aac")
    subprocess.run([
        FFMPEG_BIN, "-y",
        "-i", voice_track,
        "-i", bgm_track,
        "-filter_complex", "[0:a]volume=1.15[v];[1:a]volume=0.85[b];[v][b]amix=inputs=2:duration=first[aout]",
        "-map", "[aout]",
        "-c:a", "aac", "-b:a", "192k",
        mixed_audio
    ], capture_output=True)

    print(f"Total video duration: {total_duration:.2f}s. Recording 1080p frames via Playwright...")

    chrome_exe = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_exe):
        chrome_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path=chrome_exe)
        context = await browser.new_context(
            viewport={"width": WIDTH, "height": HEIGHT},
            device_scale_factor=1
        )
        page = await context.new_page()

        index_url = "file:///" + os.path.join(ROOT_DIR, "index.html").replace("\\", "/")
        await page.goto(index_url, wait_until="networkidle")

        await page.evaluate("""() => {
            const style = document.createElement('style');
            style.textContent = `
                .bili-chapter-hud {
                    position: fixed;
                    top: 16px;
                    right: 24px;
                    z-index: 9999;
                    background: rgba(28, 26, 23, 0.88);
                    color: #FCF9F3;
                    border-left: 3px solid #A63429;
                    padding: 7px 16px;
                    border-radius: 5px;
                    font-family: "Noto Serif CJK SC", "Songti SC", serif;
                    font-size: 15px;
                    letter-spacing: 0.8px;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                }
                .bili-subtitle-bar {
                    position: fixed;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                    background: rgba(24, 22, 19, 0.86);
                    color: #FCF9F3;
                    border: 1px solid rgba(252, 249, 243, 0.22);
                    padding: 11px 32px;
                    border-radius: 36px;
                    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
                    font-size: 22px;
                    font-weight: 500;
                    letter-spacing: 0.8px;
                    white-space: nowrap;
                    box-shadow: 0 8px 28px rgba(0,0,0,0.3);
                }
            `;
            document.head.appendChild(style);

            const chapEl = document.createElement('div');
            chapEl.className = 'bili-chapter-hud';
            chapEl.id = 'bili-chapter-hud';
            document.body.appendChild(chapEl);

            const subEl = document.createElement('div');
            subEl.className = 'bili-subtitle-bar';
            subEl.id = 'bili-subtitle-bar';
            document.body.appendChild(subEl);

            window.__updateBiliHud = (chapter, subtitle) => {
                chapEl.textContent = chapter;
                subEl.textContent = subtitle;
            };
        }""")

        frame_idx = 0
        for s_idx, sc in enumerate(SCENES):
            dur = durations[s_idx]
            num_frames = max(1, int(round(dur * CAPTURE_FPS)))
            subs = sc["subtitles"]
            triggered = set()

            for f in range(num_frames):
                prog = f / num_frames
                sub_i = min(len(subs) - 1, int(prog * len(subs)))
                await run_scene_choreography(page, s_idx, prog, subs[sub_i], sc["chapter"], triggered)

                frame_path = os.path.join(frames_dir, f"frame_{frame_idx:05d}.jpg")
                await page.screenshot(path=frame_path, type="jpeg", quality=92)
                frame_idx += 1

            print(f"Captured scene {s_idx + 1}/{len(SCENES)} ({num_frames} frames)")

        await browser.close()

    output_mp4 = os.path.join(ROOT_DIR, "源音五十音-B站介绍视频.mp4")
    print("Encoding final 1080p MP4 with FFmpeg...")
    subprocess.run([
        FFMPEG_BIN, "-y",
        "-framerate", str(CAPTURE_FPS),
        "-i", os.path.join(frames_dir, "frame_%05d.jpg"),
        "-i", mixed_audio,
        "-r", str(OUTPUT_FPS),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-shortest",
        "-movflags", "+faststart",
        output_mp4
    ], check=True)

    print("SUCCESS! Video created:", output_mp4, "Size:", os.path.getsize(output_mp4), "bytes")


if __name__ == "__main__":
    asyncio.run(main())
