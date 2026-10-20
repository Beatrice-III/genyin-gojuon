"""Check every course utterance in Chromium with all system speech engines disabled."""
from pathlib import Path
import asyncio,json,os,sys
ROOT=Path(__file__).resolve().parents[1]
TMP=ROOT/'work/audio_v3/browser';TMP.mkdir(parents=True,exist_ok=True)
os.environ['TEMP']=os.environ['TMP']=str(TMP)
sys.dont_write_bytecode=True
from playwright.async_api import async_playwright

async def main():
    manifest=json.loads((ROOT/'assets/audio/manifest.json').read_text('utf-8'))
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(channel='msedge',headless=True,downloads_path=str(TMP))
        page=await browser.new_page(viewport={'width':390,'height':844})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        await page.goto('http://127.0.0.1:8766')
        await page.evaluate('audioEngine.audioReady')
        result=await page.evaluate('''async manifest=>{
            audioEngine.synth=null;audioEngine.jaVoice=null;audioEngine.zhVoice=null;
            let fallback=0;
            window.AndroidTTS={speakJapanese(){fallback++;return false},speakChinese(){fallback++;return false},stop(){}};
            const decoded=[];
            for(const row of manifest.records){
                const aliases=[...new Set([row.text,...row.aliases])];
                for(const text of aliases){
                    const path=row.lang==='ja'?audioEngine.getBundledAudioPath(text):audioEngine.bundledChineseManifest[text];
                    if(path!==row.path)throw new Error('Missing alias: '+text);
                }
                const clip=new Audio(row.path);
                await new Promise((resolve,reject)=>{clip.onloadeddata=resolve;clip.onerror=()=>reject(new Error(row.path));clip.load()});
                if(!Number.isFinite(clip.duration)||clip.duration<=0)throw new Error('Empty audio '+row.path);
                decoded.push({text:row.text,path:row.path,duration:clip.duration});
            }
            const playback=[];
            for(const [lang,text,slow] of [['ja','あ',false],['ja','ぎゃ',false],['ja','アイスクリーム',true],['ja','がっこう',false],['zh','安',false],['zh','爾',false]]){
                if(lang==='ja')audioEngine.speakJapanese(text,slow);else audioEngine.speakChinese(text);
                const clip=audioEngine.currentAudio;if(!clip)throw new Error('No bundled playback '+text);
                await new Promise((resolve,reject)=>{clip.onended=resolve;clip.onerror=()=>reject(new Error(text))});
                playback.push({lang,text,rate:clip.playbackRate,ended:clip.ended});
            }
            if(fallback)throw new Error('System speech was called');
            return {decoded,playback,systemSpeechCalls:fallback,japaneseAliases:Object.keys(audioEngine.bundledAudioManifest).length,chineseAliases:Object.keys(audioEngine.bundledChineseManifest).length};
        }''',manifest)
        assert not errors,errors
        result.update(status='passed',systemSpeechDisabled=True,pageErrors=errors)
        (ROOT/'outputs/v3/无系统语音引擎验证.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
        print(json.dumps({k:v if k!='decoded' else len(v) for k,v in result.items()},ensure_ascii=False))
        await browser.close()
if __name__=='__main__':asyncio.run(main())
