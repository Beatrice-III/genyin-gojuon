"""Build the app's ordinary offline lesson recordings (Qwen is only for the video)."""
from pathlib import Path
import argparse, asyncio, hashlib, json, os, shutil, subprocess, sys

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'work/audio_v3'
WORK.mkdir(parents=True,exist_ok=True)
for key in ('TEMP','TMP','TMPDIR'): os.environ[key]=str(WORK)
sys.dont_write_bytecode=True
if hasattr(sys.stdout,'reconfigure'):sys.stdout.reconfigure(encoding='utf-8')
import edge_tts
FFMPEG=Path(os.environ.get('FFMPEG',r'D:\ffmpeg-2025-03-31-git-35c091f4b7-full_build\bin\ffmpeg.exe'))

async def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory',type=Path,default=WORK/'inventory.json')
    args=parser.parse_args()
    inv=json.loads(args.inventory.read_text('utf-8'))
    sem=asyncio.Semaphore(4)
    async def one(item):
        relative=f"assets/audio/{item['lang']}/{item['id']}.mp3"
        target=ROOT/relative;target.parent.mkdir(parents=True,exist_ok=True)
        voice='ja-JP-NanamiNeural' if item['lang']=='ja' else 'zh-CN-XiaoxiaoNeural'
        rate='-15%' if item['lang']=='ja' else '-5%'
        async with sem:
            if not target.is_file() or target.stat().st_size<1000:
                # Reuse the unchanged basic-kana learning recordings.
                core=next((s.split(':')[1] for s in item['sources'] if s.startswith('kana:')),None)
                old=ROOT/'assets/audio/kana'/f'{core}.mp3'
                if core and old.is_file():shutil.copy2(old,target)
                else:
                    raw=WORK/(item['id']+'.mp3')
                    for attempt in range(5):
                        try:
                            await edge_tts.Communicate(item['text'],voice,rate=rate).save(str(raw));break
                        except Exception:
                            if attempt==4:raise
                            await asyncio.sleep(1+attempt)
                    await asyncio.to_thread(subprocess.run,[str(FFMPEG),'-y','-v','error','-i',str(raw),'-af','loudnorm=I=-19:TP=-2:LRA=7','-ar','24000','-ac','1','-c:a','libmp3lame','-b:a','64k',str(target)],check=True)
            data=json.loads(await asyncio.to_thread(subprocess.check_output,[str(FFMPEG.with_name('ffprobe.exe')),'-v','error','-show_format','-of','json',str(target)]))
            duration=float(data['format']['duration'])
            if not .15<duration<20:raise RuntimeError(f'Unexpected duration {item["text"]}: {duration}')
            await asyncio.to_thread(subprocess.run,[str(FFMPEG),'-v','error','-i',str(target),'-f','null','-'],check=True)
            record={**item,'path':relative,'duration':duration,'bytes':target.stat().st_size,
                'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'voice':voice,'rate':rate}
            print(item['lang'],item['text'],round(duration,2),flush=True)
            return record
    records=await asyncio.gather(*(one(item) for item in inv['entries']))
    manifest={'version':2,'complete':True,'provider':'Microsoft Edge TTS','audio':{},'chinese':{},'records':records}
    for item in records:
        mapping=manifest['audio' if item['lang']=='ja' else 'chinese']
        for alias in set([item['text'],*item['aliases']]):
            if alias in mapping and mapping[alias]!=item['path']:raise RuntimeError('Conflicting alias '+alias)
            mapping[alias]=item['path']
    (ROOT/'assets/audio/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf-8')
    (ROOT/'assets/audio/README.md').write_text('课程离线音频：日语使用 Microsoft Edge TTS ja-JP-NanamiNeural（-15%），汉字来源普通话使用 zh-CN-XiaoxiaoNeural（-5%）。所有文件随 APK 提供，播放不依赖系统日语引擎。Qwen3-TTS 仅用于介绍视频旁白。\n\nmanifest.json 保存逐条文本、别名、提供者、语音参数、文件与 SHA-256。源码包含生成清单和脚本；Microsoft 语音输出不纳入根 MIT 代码许可。\n','utf-8')
    report={'count':len(records),'japanese':sum(x['lang']=='ja' for x in records),'chinese':sum(x['lang']=='zh' for x in records),
        'provider':manifest['provider'],'fullDecode':'passed','bytes':sum(x['bytes'] for x in records),'clips':records}
    (ROOT/'outputs/v3').mkdir(parents=True,exist_ok=True)
    (ROOT/'outputs/v3/内置音频验证.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='clips'},ensure_ascii=False))
if __name__=='__main__':asyncio.run(main())
