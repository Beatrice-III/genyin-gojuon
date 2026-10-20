"""Create the bundled 46 Japanese kana examples. Cached files are reused."""
from pathlib import Path
import asyncio,json,subprocess,os
ROOT=Path(__file__).resolve().parents[1]
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'work')
import edge_tts

async def main():
    code="global.window={};require('./js/data-kana.js');process.stdout.write(JSON.stringify(window.KANA_DATA.map(k=>({id:k.id,text:k.hiragana}))))"
    rows=json.loads(subprocess.check_output(['node','-e',code],cwd=ROOT,encoding='utf-8'))
    dest=ROOT/'assets/audio/kana';dest.mkdir(parents=True,exist_ok=True)
    sem=asyncio.Semaphore(4)
    async def one(row):
        p=dest/(row['id']+'.mp3')
        if p.exists() and p.stat().st_size>1000:return
        async with sem:
            for attempt in range(4):
                try:
                    await edge_tts.Communicate(row['text'],'ja-JP-NanamiNeural',rate='-15%').save(str(p))
                    print(row['id'],p.stat().st_size,flush=True);return
                except Exception:
                    if attempt==3:raise
                    await asyncio.sleep(2)
    await asyncio.gather(*(one(row) for row in rows))
    (ROOT/'assets/audio/README.md').write_text('46 清音示范音频，由 Microsoft Edge TTS ja-JP-NanamiNeural 合成，语速 -15%，2026-10-20。\n内置于 APK，播放不需联网。并非真人录音；不等同语音评测。普通话及词汇读音仍使用系统语音。\n',encoding='utf-8')
    print('46 kana audio files ready',flush=True)
if __name__=='__main__':asyncio.run(main())
