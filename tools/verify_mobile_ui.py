"""Exercise the shared learning UI at phone widths; save evidence under outputs/."""
from pathlib import Path
import asyncio,json,os,sys
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[1]
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'work')
from playwright.async_api import async_playwright

async def main():
    evidence=ROOT/'outputs/screenshots';evidence.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.launch(channel='msedge',headless=True,downloads_path=str(ROOT/'work'))
        page=await browser.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        await page.goto('http://127.0.0.1:8766');await page.evaluate('document.fonts.ready')
        for width in [320,360,390,430,768,1024]:
            await page.set_viewport_size({'width':width,'height':844})
            for tab in ['gojuon','origins','confusable','writing','stages','arena']:
                await page.evaluate('(t)=>app.switchTab("tab-"+t)',tab)
                assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,tab)
        await page.set_viewport_size({'width':390,'height':844})
        await page.evaluate('app.switchTab("tab-gojuon")')
        await page.screenshot(path=str(evidence/'01-首页.png'))
        await page.locator('.kana-cell:not(.empty-cell)').first.click()
        assert await page.locator('#kana-detail-modal').evaluate('e=>e.classList.contains("open")')
        await page.screenshot(path=str(evidence/'02-假名详解.png'))
        await page.locator('#btn-close-modal').click()
        for sub in ['dakuon','yoon','special','seion']:
            await page.locator(f'[data-subview="{sub}"]').click()
            assert await page.locator('#subview-'+sub).is_visible()
        await page.locator('[data-cardmode="hira-blind"]').click()
        assert await page.locator('.blind-hide').count()==46
        await page.locator('[data-cardmode="all"]').click()
        audio=await page.evaluate('''async()=>{const a=new Audio('assets/audio/kana/a.mp3');await new Promise((ok,no)=>{a.onloadedmetadata=ok;a.onerror=no;a.load()});return {duration:a.duration,files:KANA_DATA.length}}''')
        assert audio['duration']>0.3
        await page.locator('[data-tab="tab-writing"]').click()
        before=await page.evaluate('masteryEngine.state.totalWriteCount')
        await page.locator('#dojo-btn-complete').click()
        assert await page.evaluate('masteryEngine.state.totalWriteCount')==before
        canvas=await page.locator('#calligraphy-canvas').bounding_box()
        await page.mouse.move(canvas['x']+55,canvas['y']+80);await page.mouse.down()
        await page.mouse.move(canvas['x']+200,canvas['y']+110,steps=12);await page.mouse.up()
        assert await page.evaluate('app.calligraphyPad.hasUserWritten()')
        await page.screenshot(path=str(evidence/'03-临写.png'))
        await page.locator('#dojo-btn-complete').click()
        assert await page.evaluate('masteryEngine.state.totalWriteCount')==before+1
        await page.evaluate('app.launchCustomQuiz({title:"平假名认读练习",mode:"hira-romaji",kanaIds:["a","i","u","e","o"],count:15})')
        wrong=await page.evaluate('app.activeQuiz.currentQ.choices.findIndex(c=>!c.isCorrect)')
        await page.locator(f'[data-cidx="{wrong}"]').click()
        assert await page.locator('#quiz-feedback-container').is_visible()
        assert await page.evaluate('app.activeQuiz.queue.some(q=>q.isRetry)')
        await page.locator('#btn-next-question').click()
        correct=await page.evaluate('app.activeQuiz.currentQ.choices.findIndex(c=>c.isCorrect)')
        await page.locator(f'[data-cidx="{correct}"]').click()
        assert await page.evaluate('app.activeQuiz.correctCount')==1
        await page.screenshot(path=str(evidence/'04-练习反馈.png'))
        await page.locator('#btn-quit-quiz').click()
        await page.evaluate('app.launchCustomQuiz({title:"Typing safety",mode:"typing-blitz",kanaIds:["a"],count:15})')
        await page.locator('#quiz-typing-input').fill('<img src=x onerror=alert(1)>')
        await page.locator('#btn-submit-typing').click()
        assert await page.locator('#quiz-feedback-container img').count()==0
        await page.locator('#btn-quit-quiz').click()
        backup=await page.evaluate('masteryEngine.exportProgress()')
        await page.locator('#btn-open-settings').click()
        async with page.expect_download() as info: await page.locator('#btn-export-progress').click()
        download=await info.value;await download.save_as(str(ROOT/'work/test-export.json'))
        assert json.loads((ROOT/'work/test-export.json').read_text('utf-8'))['format']=='genyin-progress'
        await page.evaluate('(raw)=>onAndroidProgressImport(raw)',backup)
        assert await page.locator('#import-preview').is_visible()
        await page.locator('#btn-confirm-import').click()
        assert await page.evaluate('localStorage.getItem("GENYIN_BEFORE_IMPORT")!==null')
        await page.locator('#btn-toggle-theme').click()
        assert await page.evaluate('document.body.classList.contains("dark-mode")')
        await page.locator('#btn-close-settings').click();await page.evaluate('app.switchTab("tab-gojuon")')
        await page.screenshot(path=str(evidence/'05-夜间.png'))
        await page.reload()
        assert await page.evaluate('document.body.classList.contains("dark-mode")')
        assert await page.evaluate('masteryEngine.state.totalWriteCount')==before+1
        assert not errors,errors
        report={'status':'passed','widths':[320,360,390,430,768,1024],'tabLayoutsChecked':36,'pageErrors':errors,'audio':audio,'flows':['detail sheet','all sound categories','blind reading','blank writing prevention','actual stroke recording','wrong-answer retry','correct-answer scoring','typing HTML escape','backup export','backup import and pre-import recovery','dark theme reload','progress persistence'],'scope':'Desktop Edge mobile viewport; Android runtime evidence is reported separately.'}
        (ROOT/'outputs/界面验证.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps(report,ensure_ascii=False))
        await browser.close()
if __name__=='__main__':asyncio.run(main())
