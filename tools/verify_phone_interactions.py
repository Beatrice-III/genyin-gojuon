"""Check phone interactions against a local server on 127.0.0.1:8766.

Run the server from the repository root, then run this script. Evidence is
written to outputs/v3, and disposable browser files stay in work/mobile_v3.
This does not replace the Android runtime / software keyboard check.
"""
import asyncio,json,os,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
(ROOT/'work/mobile_v3').mkdir(parents=True,exist_ok=True)
os.environ['TEMP']=os.environ['TMP']=str(ROOT/'work/mobile_v3')
sys.dont_write_bytecode=True
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(channel='msedge',headless=True,downloads_path=str(ROOT/'work/mobile_v3'))
    page=await browser.new_page(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto('http://127.0.0.1:8766');await page.evaluate('document.fonts.ready')
    await page.wait_for_timeout(200)
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-home.png'))
    print('errors',errors)
    assert not errors,errors
    assert await page.locator('.nav-tab:visible').count()==4
    for width in [320,360,390,430,768]:
      await page.set_viewport_size({'width':width,'height':844})
      for tab in ['gojuon','origins','confusable','writing','stages','arena']:
        await page.evaluate('(t)=>app.switchTab("tab-"+t)',tab)
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,tab)
    await page.set_viewport_size({'width':390,'height':844})
    await page.evaluate('app.switchTab("tab-gojuon")')
    await page.locator('.mobile-view-button').click()
    await page.locator('[data-cardmode="hira-blind"]').click()
    assert await page.locator('.blind-hide').count()==46
    assert not await page.locator('#mobile-display-sheet').evaluate('e=>e.classList.contains("open")')
    await page.locator('.kana-cell:not(.empty-cell)').first.click()
    await page.wait_for_timeout(150)
    assert await page.locator('.mobile-detail-tab').count()==3
    await page.locator('.mobile-detail-tab').nth(2).click()
    assert await page.locator('.modal-word-card').first.is_visible()
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-detail.png'))
    await page.locator('#btn-close-modal').click()
    await page.evaluate('app.switchTab("tab-arena")')
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-practice-home.png'))
    await page.locator('.mobile-practice-actions button').first.click()
    await page.locator('#mobile-mode-select').select_option('typing-blitz')
    assert await page.evaluate('app.selectedArenaMode')=='typing-blitz'
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-configuration.png'))
    await page.locator('#btn-launch-custom-quiz').click()
    assert await page.locator('#quiz-typing-input').is_visible()
    assert await page.locator('#mobile-answer-dock #btn-submit-typing').is_visible()
    answer=await page.evaluate('app.activeQuiz.currentQ.correctAnswer')
    await page.locator('#quiz-typing-input').fill(answer)
    await page.locator('#btn-submit-typing').click()
    assert await page.locator('#mobile-answer-dock #btn-next-question').is_visible()
    await page.locator('#btn-next-question').click()
    assert await page.locator('#mobile-answer-dock #btn-submit-typing').is_visible()
    await page.evaluate('app.finishQuizSession(true)')
    await page.evaluate('app.launchCustomQuiz({title:"平假名认读",mode:"hira-romaji",kanaIds:["a","i","u","e","o"],count:15})')
    wrong=await page.evaluate('app.activeQuiz.currentQ.choices.findIndex(c=>!c.isCorrect)')
    await page.locator(f'[data-cidx="{wrong}"]').click()
    assert await page.locator('#mobile-answer-dock #btn-next-question').is_visible()
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-practice-feedback.png'))
    assert await page.evaluate('app.activeQuiz.queue.some(q=>q.isRetry)')
    await page.locator('#btn-next-question').click()
    correct=await page.evaluate('app.activeQuiz.currentQ.choices.findIndex(c=>c.isCorrect)')
    await page.locator(f'[data-cidx="{correct}"]').click()
    await page.locator('#btn-next-question').click()
    quiz_before=await page.evaluate('({index:app.activeQuiz.index,answered:app.activeQuiz.answeredCount,question:app.activeQuiz.currentQ.promptMain,queue:app.activeQuiz.queue.length})')
    await page.evaluate('mobileNavigation.pauseQuiz()')
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-pause.png'))
    await page.locator('#mobile-pause-sheet .secondary-btn').click()
    assert await page.evaluate('app.currentTab')=='tab-gojuon'
    assert await page.locator('#mobile-resume-quiz').is_visible()
    await page.locator('#mobile-resume-quiz').click()
    quiz_after=await page.evaluate('({index:app.activeQuiz.index,answered:app.activeQuiz.answeredCount,question:app.activeQuiz.currentQ.promptMain,queue:app.activeQuiz.queue.length})')
    assert quiz_before==quiz_after,(quiz_before,quiz_after)
    await page.evaluate('app.finishQuizSession(true)')
    await page.evaluate('app.switchTab("tab-writing")')
    assert await page.locator('#mobile-writing-current').inner_text()
    await page.locator('.mobile-writing-header button').click()
    await page.locator('#dojo-kana-selector button').nth(6).click()
    assert await page.evaluate('app.dojoIndex')==6
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-writing.png'))
    before=await page.evaluate('masteryEngine.state.totalWriteCount')
    await page.locator('#dojo-btn-complete').click()
    assert await page.evaluate('masteryEngine.state.totalWriteCount')==before
    canvas=await page.locator('#calligraphy-canvas').bounding_box()
    await page.mouse.move(canvas['x']+50,canvas['y']+60);await page.mouse.down()
    await page.mouse.move(canvas['x']+220,canvas['y']+200,steps=12);await page.mouse.up()
    await page.locator('#dojo-btn-complete').click()
    assert await page.evaluate('masteryEngine.state.totalWriteCount')==before+1
    assert await page.evaluate('app.dojoIndex')==7
    await page.evaluate('app.switchTab("tab-gojuon"); app.openKanaDetailModal("ka")')
    await page.locator('#modal-btn-go-write').click()
    assert await page.locator('#mobile-writing-back').is_visible()
    assert await page.evaluate('app.dojoIndex')==5
    await page.locator('#mobile-writing-back').click()
    assert await page.locator('#kana-detail-modal').evaluate('e=>e.classList.contains("open")')
    await page.locator('#btn-close-modal').click()
    await page.evaluate('app.switchTab("tab-origins")')
    assert await page.locator('#origin-gallery-container>.origin-evo-card:visible').count()==1
    await page.screenshot(path=str(ROOT/'outputs/v3/screenshots/mobile-origins.png'))
    await page.reload()
    assert await page.evaluate('app.selectedArenaMode')=='typing-blitz'
    assert await page.locator('#mobile-mode-select').input_value()=='typing-blitz'
    for mode in ['origin-match','hira-romaji','kata-romaji','hira-kata-cross','audio-dictation','confusable-sniper','typing-blitz','word-combat','mixed']:
      await page.set_viewport_size({'width':320,'height':640})
      await page.evaluate('(mode)=>app.launchCustomQuiz({title:mode,mode,kanaIds:KANA_DATA.map(k=>k.id),count:15})',mode)
      assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),mode
      for _ in range(3):
        answer_type=await page.evaluate('app.activeQuiz.currentQ.type')
        if answer_type=='typing':
          await page.locator('#quiz-typing-input').fill(await page.evaluate('app.activeQuiz.currentQ.correctAnswer'))
          await page.locator('#btn-submit-typing').click()
        else:
          idx=await page.evaluate('app.activeQuiz.currentQ.choices.findIndex(c=>c.isCorrect)')
          await page.locator(f'[data-cidx="{idx}"]').click()
        rect=await page.locator('#btn-next-question').bounding_box()
        assert rect['y']>=0 and rect['y']+rect['height']<=640,(mode,rect)
        await page.locator('#btn-next-question').click()
      await page.evaluate('app.finishQuizSession(true)')
    assert not errors,errors
    report={'status':'passed','scope':'Desktop Edge mobile viewports; Android runtime and software keyboard are verified separately.','widths':[320,360,390,430,768],'compactQuizViewport':{'width':320,'height':640,'modesExercised':9,'answersChecked':27},'pageErrors':errors,'pauseResume':{'before':quiz_before,'after':quiz_after},'flows':['four bottom destinations','display mode sheet','detail content tabs','practice preset home','native mode picker','typing submit dock','feedback next dock','wrong question retry','pause and resume at identical question and queue','writing selection sheet','real writing recorded','detail to writing and return to original card','single-item library browsing','custom preference reload','all nine mode selectors and primary action visible at 320x640']}
    (ROOT/'outputs/v3/手机交互验证.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
    await browser.close()
asyncio.run(main())
