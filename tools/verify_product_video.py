"""Check the finished walkthrough in a real Chromium media element."""
from pathlib import Path
import asyncio, json, os, sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'work/video_v4/browser_validation'
WORK.mkdir(parents=True,exist_ok=True)
for name in ('TEMP','TMP','TMPDIR','XDG_CACHE_HOME'):os.environ[name]=str(WORK)
from playwright.async_api import async_playwright

async def main():
    output=ROOT/'outputs/video_v4'
    name='源音五十音_上手介绍_1080p.mp4'
    video=output/name
    assert video.is_file()
    async with async_playwright() as pw:
        chrome=Path(r'C:\Program Files\Google\Chrome\Application\chrome.exe')
        if not chrome.exists():chrome=Path(r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
        context=await pw.chromium.launch_persistent_context(str(WORK/'profile_local'),executable_path=str(chrome),
          headless=True,viewport={'width':1920,'height':1080},args=['--autoplay-policy=no-user-gesture-required',f'--disk-cache-dir={WORK / "cache"}'])
        page=context.pages[0]
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.goto(video.as_uri(),wait_until='domcontentloaded')
        await page.evaluate("window.preview=document.querySelector('video');preview.style.cssText='width:1920px;height:1080px;display:block';document.body.style.margin=0")
        print('Loaded local MP4 in Chromium',flush=True)
        await page.wait_for_function('preview.readyState>=2',timeout=30000)
        await asyncio.wait_for(page.evaluate('preview.play()'),timeout=15)
        await page.wait_for_timeout(1800)
        assert await page.evaluate('preview.currentTime>1 && !preview.paused')
        await page.evaluate('preview.pause()')
        samples=[]
        for at in [4,27,51,82,115,135,163,175]:
            await page.evaluate('(t)=>{preview.currentTime=t}',at)
            await page.wait_for_function('(t)=>!preview.seeking && Math.abs(preview.currentTime-t)<1',arg=at,timeout=10000)
            print('Seeked',at,flush=True)
            await page.wait_for_timeout(180)
            samples.append(await page.evaluate('({time:preview.currentTime,width:preview.videoWidth,height:preview.videoHeight,readyState:preview.readyState,error:preview.error?.message||null})'))
        await page.evaluate('preview.currentTime=preview.duration-1;preview.play()')
        await page.wait_for_function('preview.ended',timeout=10000)
        state=await page.evaluate('({duration:preview.duration,ended:preview.ended,readyState:preview.readyState,width:preview.videoWidth,height:preview.videoHeight,error:preview.error?.message||null,quality:preview.getVideoPlaybackQuality().toJSON?.()||{totalVideoFrames:preview.getVideoPlaybackQuality().totalVideoFrames,droppedVideoFrames:preview.getVideoPlaybackQuality().droppedVideoFrames}})')
        assert state['ended'] and state['width']==1920 and state['height']==1080 and not state['error']
        assert not errors,errors
        report={'file':name,'browser':'Chromium','source':'local MP4 file','realPlaybackAdvanced':True,'seekSamples':samples,'playbackReachedEnd':True,'state':state,'pageErrors':errors}
        (output/'浏览器播放验证.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
        print(json.dumps(report,ensure_ascii=False))
        await context.close()

if __name__=='__main__':asyncio.run(main())
