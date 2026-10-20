"""Record real mobile app interactions for the public product walkthrough.

The release app is never edited. A separate Chromium profile and all capture
intermediates live under work/video_v3. Answers, feedback, retry insertion and
writing strokes are produced by the app's normal handlers. Math.random is seeded
only to make the camera plan repeatable. Media play calls are observed, not muted
or replaced; their local asset paths and timing are exported for the editor.

Reproduce final capture:
    python tools/capture_product_demo.py --scale 2 --output capture2x
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / "work" / "video_v3"
OUT = WORK / "capture"
CACHE = WORK / "capture_cache"
for folder in (WORK, OUT, CACHE):
    folder.mkdir(parents=True, exist_ok=True)
for name in ("TEMP", "TMP", "TMPDIR", "XDG_CACHE_HOME"):
    os.environ[name] = str(CACHE)
sys.dont_write_bytecode = True

from playwright.async_api import async_playwright

FFMPEG = Path(r"D:\ffmpeg-2025-03-31-git-35c091f4b7-full_build\bin\ffmpeg.exe")
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
if not CHROME.exists():
    CHROME = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")
PW, PH, FPS = 430, 900, 15
PIXEL_SCALE = 1


class Capture:
    def __init__(self, page, dry_run=False):
        self.page = page
        self.scene = None
        self.events = []
        self.catalog = []
        self.t0 = 0.0
        self.dry_run = dry_run

    def now(self):
        return round(time.monotonic() - self.t0, 4)

    async def geometry(self):
        return await self.page.evaluate("""() => ({scrollY:window.scrollY,rects:Object.fromEntries(
          ['.quiz-question-box','#quiz-q-main','#quiz-choices-container','#quiz-typing-container',
           '#quiz-feedback-container','#calligraphy-canvas','#kana-modal-body','#mobile-answer-dock',
           '#mobile-practice-sheet','#mobile-pause-sheet','#mobile-writing-current'].map(selector=>{
            const el=document.querySelector(selector), r=el?.getBoundingClientRect();
            return [selector,r?{x:r.x,y:r.y,width:r.width,height:r.height,
              visible:r.width>0&&r.height>0&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'}:null];
          }))})""")

    async def mark(self, name, **details):
        event = {"time": self.now(), "type": "mark", "name": name, **details, **await self.geometry()}
        self.events.append(event)
        dest = OUT / f"{self.scene}_{name}.png"
        await self.page.screenshot(path=str(dest), type="png")

    async def wait(self, seconds):
        await self.page.wait_for_timeout((min(seconds, .04) if self.dry_run else seconds) * 1000)

    async def audio_idle(self, minimum=0):
        await self.wait(minimum)
        if not self.dry_run:
            await self.page.wait_for_function("!audioEngine.currentAudio || audioEngine.currentAudio.ended || audioEngine.currentAudio.error", timeout=20000)

    async def nav(self, tab, label=None):
        if await self.page.evaluate("app.currentTab==='tab-arena' && !!app.activeQuiz"):
            await self.tap('#btn-quit-quiz', '暂离练习')
            await self.wait(.2)
            await self.tap('#mobile-pause-sheet .secondary-btn', '先回到学习处')
        await self.tap(f'[data-tab="{tab}"]', label or tab)

    async def disable_origin_overlay(self):
        if await self.page.locator('#dojo-toggle-origin-ghost').is_checked():
            await self.tap('.mobile-writing-notes summary', '展开运笔要领')
            await self.tap('#dojo-toggle-origin-ghost', '关闭本字叠印')
            await self.tap('.mobile-writing-notes summary', '收起运笔要领')

    async def tap(self, selector, label=None, **kwargs):
        loc = self.page.locator(selector).first
        await loc.scroll_into_view_if_needed()
        box = await loc.bounding_box()
        self.events.append({"time": self.now(), "type": "tap", "label": label or selector,
                            "x": round(box["x"] + box["width"] / 2, 2),
                            "y": round(box["y"] + box["height"] / 2, 2)})
        await loc.click(**kwargs)
        self.events.append({"time": self.now(), "type": "after_tap", "label": label or selector, **await self.geometry()})

    async def top(self):
        await self.page.evaluate("window.scrollTo({top:0,behavior:'smooth'})")
        await self.wait(.45)

    async def position(self, selector, top=160):
        # Standard screen scrolling; this does not alter the application state.
        await self.page.locator(selector).first.evaluate(
            "(el, top) => window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-top,behavior:'smooth'})", top)
        await self.wait(.55)

    async def question(self):
        return await self.page.evaluate("JSON.parse(JSON.stringify(app.activeQuiz.currentQ))")

    async def answer(self, correct=True, wanted=None):
        q = await self.question()
        if q["type"] == "typing":
            text = q["correctAnswer"] if correct else "ka"
            await self.tap("#quiz-typing-input", "罗马字输入框")
            for char in text:
                await self.page.locator("#quiz-typing-input").press_sequentially(char, delay=150)
                self.events.append({"time": self.now(), "type": "type", "char": char})
            await self.wait(.65)
            await self.tap("#btn-submit-typing", "提交罗马字")
            answer = text
        else:
            indices = [i for i, c in enumerate(q["choices"]) if c["isCorrect"] == correct]
            idx = indices[0]
            if wanted:
                idx = next((i for i in indices if wanted in q["choices"][i]["label"]), idx)
            answer = q["choices"][idx]["label"]
            await self.tap(f'.quiz-choice-btn[data-cidx="{idx}"]', answer)
        await self.audio_idle(2.15)
        result = await self.page.evaluate("({answered:app.activeQuiz.answeredCurrent,correct:app.activeQuiz.correctCount,count:app.activeQuiz.answeredCount,queue:app.activeQuiz.queue.length})")
        self.events.append({"time": self.now(), "type": "answer", "question": q, "answer": answer,
                            "expectedCorrect": correct, "actualState": result, **await self.geometry()})
        return q

    async def next(self):
        await self.tap("#btn-next-question", "下一题")
        await self.top()

    async def launch(self, mode, ids, count, title, seed=807, only_kata=False):
        await self.page.evaluate("""({seed,conf})=>{
            Math.random=(()=>{let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})();
            app.launchCustomQuiz(conf);
        }""", {"seed": seed, "conf": {
            "title": title, "mode": mode, "kanaIds": ids, "count": count, "onlyKatakana": only_kata}})
        await self.top()

    async def draw(self, strokes, seconds=4.2):
        box = await self.page.locator("#calligraphy-canvas").bounding_box()
        total = sum(len(stroke) for stroke in strokes)
        for si, stroke in enumerate(strokes):
            for pi, (x, y) in enumerate(stroke):
                sx, sy = box["x"] + x * box["width"], box["y"] + y * box["height"]
                await self.page.mouse.move(sx, sy)
                if pi == 0:
                    await self.page.mouse.down()
                self.events.append({"time": self.now(), "type": "draw", "stroke": si + 1,
                                    "x": round(sx, 2), "y": round(sy, 2)})
                await self.wait(seconds / total)
            await self.page.mouse.up()
            await self.wait(.2)
        state = await self.page.evaluate("({target:app.calligraphyPad.targetChar,strokes:app.calligraphyPad.strokes.length,hasWritten:app.calligraphyPad.hasUserWritten(),memory:app.calligraphyPad.isMemoryMode})")
        assert state["strokes"] == len(strokes), state
        assert state["hasWritten"], state
        self.events.append({"time": self.now(), "type": "writing_state", **state})

    async def record(self, scene, action):
        self.scene, self.events = scene, []
        if self.dry_run:
            self.t0 = time.monotonic()
            await self.page.evaluate("window.__captureMediaEvents=[];window.__captureEpoch=performance.now()")
            print('Dry run', scene, flush=True)
            await action()
            result = {'id': scene, 'dryRun': True, 'events': self.events, 'duration': self.now()}
            (OUT / f'{scene}.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), 'utf-8')
            self.catalog.append(result)
            return result
        path = OUT / f"{scene}.mp4"
        log = (OUT / f"{scene}.ffmpeg.log").open("wb")
        encoder = subprocess.Popen([str(FFMPEG), "-y", "-f", "image2pipe", "-vcodec", "png", "-framerate", str(FPS),
                                    "-i", "pipe:0", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "15",
                                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(path)],
                                   stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=log, cwd=str(WORK))
        await self.page.evaluate("window.__captureMediaEvents=[];window.__captureEpoch=performance.now()")
        self.t0 = time.monotonic()
        done = asyncio.Event()
        frames = 0

        async def pump():
            nonlocal frames
            while not done.is_set():
                data = await self.page.screenshot(type="png")
                goal = max(frames + 1, math.floor((time.monotonic() - self.t0) * FPS) + 1)
                for _ in range(goal - frames):
                    encoder.stdin.write(data)
                frames = goal
                await asyncio.sleep(max(0, frames / FPS - (time.monotonic() - self.t0)))

        task = asyncio.create_task(pump())
        print("Recording", scene, flush=True)
        try:
            await self.wait(.4)
            await action()
            await self.wait(.4)
        finally:
            done.set()
            await task
            encoder.stdin.close()
            if encoder.wait() != 0:
                raise RuntimeError(f"Capture encoding failed: {scene}")
            log.close()
        media = await self.page.evaluate("window.__captureMediaEvents")
        result = {"id": scene, "path": str(path), "width": PW * PIXEL_SCALE, "height": PH * PIXEL_SCALE,
                  "pixelWidth": PW * PIXEL_SCALE, "pixelHeight": PH * PIXEL_SCALE,
                  "cssWidth": PW, "cssHeight": PH, "pixelScale": PIXEL_SCALE, "fps": FPS,
                  "frames": frames, "duration": frames / FPS, "events": self.events, "media": media,
                  "provenance": "Real unmodified release frontend in Chromium; separate profile; app handlers produce all answers, feedback, retries and strokes."}
        (OUT / f"{scene}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), "utf-8")
        self.catalog.append(result)
        print(scene, f"{frames/FPS:.2f}s", len(media), "media events", flush=True)
        return result


def smooth(points):
    result = []
    pad = [points[0], *points, points[-1]]
    for i in range(1, len(pad) - 2):
        p0, p1, p2, p3 = pad[i - 1:i + 3]
        for j in range(7):
            t = j / 7
            result.append(tuple(.5 * (2*b + (-a+c)*t + (2*a-5*b+4*c-d)*t*t + (-a+3*b-3*c+d)*t*t*t)
                                for a, b, c, d in zip(p0, p1, p2, p3)))
    return result + [points[-1]]


# Three physical strokes: crossbar, gently curving vertical, looping lower body.
A_STROKES = [smooth(p) for p in [
    [(.25, .31), (.40, .30), (.57, .275), (.68, .25)],
    [(.425, .17), (.405, .33), (.41, .49), (.44, .66), (.49, .76)],
    [(.63, .38), (.59, .50), (.50, .63), (.38, .73), (.27, .74), (.23, .67),
     (.27, .56), (.40, .48), (.57, .45), (.71, .49), (.77, .59), (.75, .70), (.66, .77)],
]]


async def main(url, only=None, scale=1, output="capture", dry_run=False):
    global OUT, PIXEL_SCALE
    OUT, PIXEL_SCALE = WORK / output, scale
    OUT.mkdir(parents=True, exist_ok=True)
    errors = []
    async with async_playwright() as p:
        context = await p.chromium.launch_persistent_context(str(WORK / "capture_profile"), executable_path=str(CHROME),
            headless=True, viewport={"width": PW, "height": PH}, device_scale_factor=PIXEL_SCALE, is_mobile=True, has_touch=True,
            args=["--no-sandbox", "--disable-dev-shm-usage", "--autoplay-policy=no-user-gesture-required", f"--disk-cache-dir={CACHE / 'chromium'}"])
        page = context.pages[0] if context.pages else await context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.add_init_script("""(() => {
            window.__captureMediaEvents=[]; window.__captureEpoch=performance.now();
            const play=HTMLMediaElement.prototype.play, pause=HTMLMediaElement.prototype.pause;
            HTMLMediaElement.prototype.play=function(...args){
                const r=play.apply(this,args);
                const src=this.currentSrc||this.src,path=new URL(src,location.href).pathname.replace(/^\\//,'');
                const id=path.split('/').pop().split('.')[0],kana=window.KANA_DATA?.find(k=>k.id===id);
                const ja=Object.entries(window.audioEngine?.bundledAudioManifest||{}).find(([text,p])=>p===path);
                const zh=Object.entries(window.audioEngine?.bundledChineseManifest||{}).find(([text,p])=>p===path);
                window.__captureMediaEvents.push({time:(performance.now()-window.__captureEpoch)/1000,type:'play',src,path,text:ja?.[0]||zh?.[0]||kana?.hiragana||'',language:zh?'zh':'ja',rate:this.playbackRate});
                return r;
            };
            HTMLMediaElement.prototype.pause=function(...args){
                window.__captureMediaEvents.push({time:(performance.now()-window.__captureEpoch)/1000,type:'pause',src:this.currentSrc||this.src,currentTime:this.currentTime});
                return pause.apply(this,args);
            };
        })();""")
        await page.goto(url, wait_until="networkidle")
        # This is an isolated demo profile; no user profile or backup is touched.
        await page.evaluate("localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_function("window.app && window.audioEngine && window.quizGenerator")
        await page.wait_for_function("window.mobileNavigation && document.body.classList.contains('phone-app')")
        await page.evaluate("window.audioEngine.audioReady")
        await page.evaluate("document.fonts.ready")
        source_fingerprints = {name: hashlib.sha256((ROOT / name).read_bytes()).hexdigest()
            for name in ['js/app.js', 'js/mobile-practice.js', 'css/native-mobile.css', 'assets/audio/manifest.json']
            if (ROOT / name).exists()}
        audio_inventory = await page.evaluate("({japanese:Object.keys(audioEngine.bundledAudioManifest).length,chinese:Object.keys(audioEngine.bundledChineseManifest).length})")
        await page.screenshot(path=str(WORK / ('first_frame_2x.png' if PIXEL_SCALE == 2 else 'first_frame.png')))
        await page.evaluate("""() => {for(const name of ['playCorrectSfx','playWrongSfx','playStageClearSfx']){
            const original=audioEngine[name];if(!original)continue;
            audioEngine[name]=function(...args){window.__captureMediaEvents.push({time:(performance.now()-window.__captureEpoch)/1000,type:'sfx',name,args});return original.apply(this,args)};
        }}""")
        c = Capture(page, dry_run=dry_run)
        if only == ['preview']:
            seeds = await page.evaluate("""() => {const result=[];for(let seed=1000;seed<100000;seed+=991){
              Math.random=(()=>{let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})();
              const q=quizGenerator.generateSessionQueue({mode:'confusable-sniper',kanaIds:['shi','tsu','so','n'],count:16,onlyKatakana:true})[0];
              if(q.kanaId==='shi') result.push(seed);
            }return result;}""")
            print('Seeds with real first question シ:', seeds, flush=True)
            await context.close()
            return

        async def home():
            await c.mark("home")
            await c.wait(1.6)
            await c.position(".gojuon-col-header", top=205)
            await c.wait(1.7)
            await c.tap('.kana-cell[aria-label^="あ ア"]', "打开あ字卡")
            await c.audio_idle(2.4)
            await c.mark("detail")
            await c.tap("#modal-btn-speak-ja", "日语发音")
            await c.audio_idle(2.4)
            await c.tap("#modal-btn-speak-slow", "慢速示范")
            await c.audio_idle(2.8)
            await c.tap('.mobile-detail-tab:nth-child(2)', '发音要点')
            await c.wait(.8)
            await c.mark('pronunciation')
            await c.tap('.mobile-detail-tab:nth-child(3)', '常用词')
            await c.wait(.8)
            await c.mark('words')
            await c.tap('.mobile-detail-tab:nth-child(1)', '字形与来源')
            await c.wait(.8)
            await c.mark("origin")
            await c.wait(2.0)
            await c.tap("#btn-close-modal", "关闭字卡")
            await c.wait(.6)

        async def confusable():
            await c.nav('tab-confusable', '字形辨微')
            await c.position(".confusable-card", 150)
            await c.mark("comparison")
            await c.wait(2.4)
            # A fixed seed chooses a genuine generated question. No queue edits.
            await page.evaluate("""() => document.querySelector('.btn-group-sniper[data-groupid="katakana-big4"]').addEventListener('click',()=>{
                Math.random=(()=>{let s=34694;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})();
            },{once:true,capture:true})""")
            await c.tap('.btn-group-sniper[data-groupid="katakana-big4"]', "本组演练")
            await c.top()
            q = await c.question()
            assert q['kanaId'] == 'shi' and q['promptMain'] == 'シ', q
            await c.mark("question", question=q)
            await c.wait(1.6)
            await c.answer(False, wanted="tsu" if q["kanaId"] == "shi" else "shi")
            await c.mark("wrong_feedback")
            await c.wait(3.5)
            for n in range(3):
                await c.next()
                await c.wait(.9)
                await c.answer(True)
                await c.wait(.8)
            await c.next()
            retry = await c.question()
            assert retry["isRetry"] and retry["promptMain"] == q["promptMain"], (q, retry)
            await c.mark("retry_question", question=retry)
            await c.wait(1.7)
            await c.answer(True)
            await c.mark("retry_correct")
            await c.wait(2.2)
            # Finish this actual 16-question session, including its inserted retry.
            while await page.evaluate('!!app.activeQuiz'):
                await c.tap('#btn-next-question', '下一题')
                if not await page.evaluate('!!app.activeQuiz'):
                    break
                await page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
                await c.wait(.28)
                await c.answer(True)
                await c.wait(.2)
            await c.top()
            await c.mark('session_results')
            await c.wait(2.4)
            await c.tap('#btn-res-retry-wrong', '重练本局错题')
            await c.top()
            await c.wait(1.0)
            await c.answer(True)
            await c.mark('notebook_retry_correct')
            await c.wait(1.6)
            await c.tap('#btn-next-question', '审阅成绩单')
            await c.top()
            await c.mark('notebook_retry_results')
            await c.wait(1.5)

        async def listening():
            await c.launch("audio-dictation", ["ka", "ki", "ku", "ke", "ko"], 5, "听音辨字专项演练", seed=92)
            await c.mark("listen_question", question=await c.question())
            await c.wait(2.0)
            await c.tap("#btn-quiz-replay-audio", "重听发音")
            await c.audio_idle(2.1)
            await c.tap("#btn-quiz-replay-slow", "慢速发音")
            await c.audio_idle(2.7)
            await c.answer(True)
            await c.mark("listen_feedback")
            await c.wait(1.6)
            await c.next()
            await c.wait(1.9)
            await c.answer(True)
            await c.wait(1.5)

        async def cross():
            await c.launch("hira-kata-cross", ["a", "ka", "shi", "tsu", "ne", "ra"], 6, "平片对应专项演练", seed=73)
            await c.mark("cross_question", question=await c.question())
            await c.wait(1.6)
            await c.answer(True)
            await c.wait(1.8)
            await c.next()
            await c.wait(1.6)
            await c.answer(True)
            await c.mark("cross_feedback")
            await c.wait(1.8)

        async def typing():
            await c.launch("typing-blitz", ["shi", "tsu", "chi", "fu", "ne"], 5, "罗马字拼写专项演练", seed=47)
            await c.mark("typing_question", question=await c.question())
            await c.wait(1.6)
            await c.answer(True)
            await c.mark("typing_feedback")
            await c.wait(1.6)
            await c.next()
            await c.wait(1.2)
            await c.answer(True)
            await c.wait(1.5)

        async def origin():
            await c.launch('origin-match', ['a','i','u','ka','ki','shi'], 6, '书源配对专项演练', seed=51)
            await c.mark('origin_question', question=await c.question())
            await c.wait(1.6)
            await c.answer(True)
            await c.mark('origin_feedback')
            await c.wait(2.0)
            await c.next()
            await c.wait(1.3)
            await c.answer(True)
            await c.wait(1.5)

        async def explanation():
            await c.nav('tab-confusable', '字形辨微')
            await c.position('.confusable-card', 150)
            await page.evaluate("""() => document.querySelector('.btn-group-sniper[data-groupid="katakana-big4"]').addEventListener('click',()=>{
                Math.random=(()=>{let s=34694;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})();
            },{once:true,capture:true})""")
            await c.tap('.btn-group-sniper[data-groupid="katakana-big4"]', '本组演练')
            await c.top()
            q = await c.question()
            assert q['kanaId'] == 'shi' and q['promptMain'] == 'シ', q
            await c.wait(1.1)
            await c.answer(False, wanted='tsu')
            await c.position('#quiz-feedback-container', 185)
            await c.mark('full_explanation', question=q)
            await c.wait(4.0)

        async def trace():
            await c.nav('tab-writing', '书写')
            await c.disable_origin_overlay()
            await c.position(".dojo-canvas-panel", 95)
            await c.mark("trace_blank")
            await c.wait(1.2)
            await c.draw(A_STROKES, 4.8)
            await c.mark("trace_complete")
            await c.wait(1.7)

        async def memory():
            if await page.evaluate("app.currentTab!=='tab-writing'"):
                await c.nav('tab-writing', '书写')
            await c.tap("#dojo-mode-memory", "默写")
            await c.tap("#dojo-btn-clear", "清空画板")
            await c.disable_origin_overlay()
            await c.position(".dojo-canvas-panel", 100)
            await c.mark("memory_blank")
            await c.wait(1.3)
            await c.draw(A_STROKES, 4.8)
            await c.mark("memory_written")
            await c.wait(1.3)
            await c.tap("#dojo-btn-reveal", "显示朱砂范字")
            await c.mark("memory_revealed")
            await c.wait(2.6)

        async def course():
            await c.tap('[data-tab="tab-arena"]', '演练定制')
            # Pause, return to learning and resume the identical live question.
            if await page.evaluate('!!app.activeQuiz'):
                before = await page.evaluate('({index:app.activeQuiz.index,count:app.activeQuiz.answeredCount,prompt:app.activeQuiz.currentQ.promptMain})')
                await c.tap('#btn-quit-quiz', '暂离练习')
                await c.mark('pause')
                await c.wait(1.0)
                await c.tap('#mobile-pause-sheet .secondary-btn', '先回到学习处')
                await c.mark('paused_learning')
                await c.wait(.8)
                await c.tap('#mobile-resume-quiz', '继续刚才练习')
                after = await page.evaluate('({index:app.activeQuiz.index,count:app.activeQuiz.answeredCount,prompt:app.activeQuiz.currentQ.promptMain})')
                assert before == after, (before, after)
                await c.mark('resumed', quiz=after)
                await c.wait(.8)
                await c.tap('#btn-quit-quiz', '暂离练习')
                await c.tap('#mobile-pause-sheet .outline-btn', '结束这组看看结果')
            back = page.locator('#btn-res-back-arena')
            if await back.count() and await back.is_visible():
                await c.tap('#btn-res-back-arena', '返回演练定制')
            await c.top()
            await c.mark('setup')
            await c.wait(1.0)
            await c.tap('.mobile-practice-actions button:first-child', '自选题型与范围')
            await page.locator('#mobile-mode-select').select_option('audio-dictation')
            c.events.append({'time': c.now(), 'type': 'select', 'label': '听音辨字', **await c.geometry()})
            await c.tap('#arena-scope-firsthalf', '选择前半范围')
            await c.tap('#arena-count-selector [data-count="15"]', '选择15题')
            await c.mark('setup_selection')
            await c.wait(1.4)
            await c.tap('#mobile-practice-sheet .sheet-done', '完成自选设置')
            await c.tap('.mobile-practice-actions button:nth-child(2)', '十阶课程')
            await c.mark("course")
            await c.wait(1.6)
            await c.position(".stage-card:nth-child(2)", 130)
            await c.wait(1.6)
            await c.tap('#tab-stages .mobile-section-back', '返回练习')
            await c.nav('tab-gojuon', '音图')
            await c.tap('.kana-cell[aria-label^="あ ア"]', '打开あ字卡')
            await c.audio_idle(2.0)
            await c.tap('#modal-btn-go-write', '从字卡前往书写')
            await c.mark('writing_from_card')
            await c.wait(1.2)
            await c.tap('#mobile-writing-back', '返回原来的字卡')
            assert await page.locator('#kana-detail-modal').evaluate('el=>el.classList.contains("open")')
            await c.mark('returned_card')
            await c.wait(1.2)
            await c.tap('#btn-close-modal', '关闭字卡')

        async def backup():
            await c.nav('tab-gojuon', '音图')
            await c.top()
            await c.mark('home')
            await c.wait(1.2)
            await c.tap('#btn-open-settings', '学习记录与设置')
            await c.mark('settings')
            await c.wait(2)
            await c.tap('#btn-toggle-theme', '切换夜间模式')
            await c.wait(1.4)
            await c.tap('#btn-toggle-theme', '切换日间模式')
            await c.wait(.8)
            async with page.expect_download() as download_info:
                await c.tap('#btn-export-progress', '导出学习记录')
            download=await download_info.value
            exported=OUT/'demo-progress.json'
            await download.save_as(str(exported))
            await c.mark('exported')
            await c.wait(.8)
            await page.locator('#progress-file').set_input_files(str(exported))
            await c.mark('import_preview')
            await c.wait(2)
            await c.tap('#btn-cancel-import', '取消恢复')
            await c.wait(.8)
            await c.tap('#btn-close-settings', '关闭设置')
            await c.mark('outro')
            await c.wait(1.6)

        async def practice_overview():
            await c.nav('tab-arena', '练习')
            await c.top()
            await c.mark('practice_home')
            await c.wait(2)
            await c.tap('.mobile-practice-actions button:first-child', '自选题型与范围')
            await page.locator('#mobile-mode-select').select_option('audio-dictation')
            c.events.append({'time':c.now(),'type':'select','label':'听音辨字',**await c.geometry()})
            await c.tap('#arena-scope-firsthalf', '选择前半范围')
            await c.tap('#arena-count-selector [data-count="15"]', '选择15题')
            await c.mark('setup_selection')
            await c.wait(2)
            await c.tap('#mobile-practice-sheet .sheet-done', '完成自选设置')
            await c.tap('.mobile-practice-actions button:nth-child(2)', '十阶课程')
            await c.mark('course')
            await c.wait(2)
            await c.tap('#tab-stages .mobile-section-back', '返回练习')
            await c.mark('practice_ready')
            await c.wait(1)

        scenes = [("01_kana", home), ("02_confusable", confusable), ("03_listening", listening),
                  ("04_cross", cross), ("05_typing", typing), ("06_trace", trace),
                  ("07_memory", memory), ("08_course", course), ("09_origin", origin),
                  ("10_explanation", explanation), ("11_backup", backup), ("12_practice", practice_overview)]
        for scene, action in scenes:
            if only and scene not in only:
                continue
            await c.record(scene, action)
        state = await page.evaluate("JSON.parse(JSON.stringify(window.masteryEngine.state))")
        previous = {}
        catalog_path = OUT / 'catalog.json'
        if only and catalog_path.exists():
            previous = json.loads(catalog_path.read_text('utf-8'))
        merged = {s['id']: s for s in previous.get('scenes', [])}
        merged.update({s['id']: s for s in c.catalog})
        catalog_path.write_text(json.dumps({"scenes": sorted(merged.values(), key=lambda s:s['id']),
            "pageErrors": errors + previous.get('pageErrors', []),
            "dryRun": dry_run, "sourceFingerprints": source_fingerprints, "audioInventory": audio_inventory,
            "finalDemoState": previous.get('finalDemoState', state) if only else state}, ensure_ascii=False, indent=2), 'utf-8')
        await context.close()
        assert not errors, errors
        print("All captured with no page errors", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8766")
    parser.add_argument("--only", nargs="*")
    parser.add_argument('--scale', type=int, choices=[1,2], default=1)
    parser.add_argument('--output', default='capture')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    asyncio.run(main(args.url, args.only, args.scale, args.output, args.dry_run))
