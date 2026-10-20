/*
 * Phone interaction layer.
 * Keeps the original learning controller and persisted record format intact.
 * Existing controls are moved, rather than copied, so their handlers remain live.
 */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const button = (text, className, action) => {
    const el = make('button', className, text);
    el.type = 'button';
    if (action) el.addEventListener('click', action);
    return el;
  };

  window.addEventListener('DOMContentLoaded', () => {
    const app = window.app;
    if (!app) return;
    document.body.classList.add('phone-app');

    // A sheet owns real controls and participates in Android's back handling.
    const sheetStack = [];
    function createSheet(id, title, subtitle) {
      const backdrop = make('div', 'modal-backdrop mobile-sheet');
      backdrop.id = id;
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-label', title);
      const card = make('section', 'modal-card mobile-sheet-card');
      const head = make('div', 'mobile-sheet-head');
      const copy = make('div');
      copy.append(make('h2', '', title));
      if (subtitle) copy.append(make('p', '', subtitle));
      const close = button('完成', 'sheet-done', () => closeSheet(backdrop));
      head.append(copy, close);
      const content = make('div', 'mobile-sheet-content');
      card.append(head, content);
      backdrop.append(card);
      document.body.append(backdrop);
      backdrop.addEventListener('click', e => {
        if (e.target === backdrop) closeSheet(backdrop);
      });
      return { backdrop, card, content, close };
    }
    function openSheet(sheet, source) {
      const el = sheet.backdrop || sheet;
      el._returnFocus = source || document.activeElement;
      if (!sheetStack.includes(el)) sheetStack.push(el);
      el.classList.add('open');
      el.querySelector('.sheet-done')?.focus({ preventScroll: true });
    }
    function closeSheet(sheet) {
      const el = sheet.backdrop || sheet;
      el.classList.remove('open');
      const i = sheetStack.indexOf(el);
      if (i >= 0) sheetStack.splice(i, 1);
      el._returnFocus?.focus({ preventScroll: true });
    }
    function closeTopSheet() {
      while (sheetStack.length && !sheetStack.at(-1).classList.contains('open')) sheetStack.pop();
      const top = sheetStack.at(-1);
      if (!top) return false;
      closeSheet(top);
      return true;
    }
    window.mobileNavigation = { closeTopSheet, openSheet, closeSheet };
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && closeTopSheet()) e.preventDefault();
    });

    // Four destinations leave each bottom item a full thumb-sized hit area.
    document.querySelectorAll('.nav-tab').forEach(tab => {
      const names = {
        'tab-gojuon': '音图', 'tab-confusable': '辨形',
        'tab-writing': '书写', 'tab-arena': '练习'
      };
      tab.classList.toggle('secondary-nav-item', !names[tab.dataset.tab]);
      if (names[tab.dataset.tab]) tab.querySelector('span').textContent = names[tab.dataset.tab];
    });
    const libraryButton = button('汉字字源图鉴  ›', 'mobile-library-link', () => app.switchTab('tab-origins'));
    byId('tab-gojuon').querySelector('.section-heading').before(libraryButton);
    byId('tab-gojuon').querySelector('.home-hero .chapter-kicker').textContent = '汉语母语者的五十音';
    byId('tab-gojuon').querySelector('.home-hero h1').innerHTML = '从汉字，读懂假名<span>。</span>';
    byId('tab-gojuon').querySelector('.home-hero p').textContent = '听、认、写，把假名学进手里。';
    byId('tab-gojuon').querySelector('.section-heading > span').textContent = '点字看详情，点喇叭听音';
    byId('btn-start-recommended-stage').setAttribute('aria-label', '继续当前课程');

    // View modes and highlighting are an intentional settings sheet.
    const viewSheet = createSheet('mobile-display-sheet', '字表显示', '选择看字方式，也可以标出重点。');
    const displayControls = byId('seion-display-controls');
    viewSheet.content.append(displayControls);
    const viewButton = button('平片对照  ⌄', 'mobile-view-button', e => openSheet(viewSheet, e.currentTarget));
    byId('gojuon-subview-group').after(viewButton);
    displayControls.addEventListener('click', e => {
      const target = e.target.closest('[data-cardmode]');
      if (target) {
        viewButton.textContent = `${target.textContent.trim()}  ⌄`;
        closeSheet(viewSheet);
      }
    });
    byId('gojuon-subview-group').addEventListener('click', () => {
      viewButton.hidden = !byId('subview-seion').offsetParent;
    });

    // The practice home presents actual things to do, not a configuration form.
    const setup = byId('arena-setup-wrapper');
    const configuration = setup.querySelector('.editorial-card');
    const practiceSheet = createSheet('mobile-practice-sheet', '自选练习', '题型、范围和题量，下次打开继续沿用。');
    practiceSheet.content.append(configuration);
    configuration.classList.add('mobile-configuration');
    const startButton = byId('btn-launch-custom-quiz');
    startButton.textContent = '开始练习';
    startButton.addEventListener('click', () => closeSheet(practiceSheet));
    const configFooter = make('div', 'mobile-sheet-footer');
    configFooter.append(startButton);
    practiceSheet.card.append(configFooter);
    configuration.firstElementChild.hidden = true;

    const title = make('div', 'mobile-page-title');
    title.append(make('span', 'mobile-eyebrow', '每天练一点'), make('h1', '', '今天，练哪一种？'));
    title.append(make('p', '', '每组 15 题，答后看解析，错题会再次出现。'));
    const quickGrid = make('div', 'mobile-quick-grid');
    const quickModes = [
      ['听音辨字', '听一听，再选字', 'audio-dictation', '聽'],
      ['平假名认读', '看到假名，读出来', 'hira-romaji', 'あ'],
      ['片假名认读', '外来语入门必练', 'kata-romaji', 'ア'],
      ['罗马字输入', '不靠选项，自己写', 'typing-blitz', 'a'],
      ['词汇拼读', '把假名放进词里', 'word-combat', '詞'],
      ['综合练习', '八种题型换着来', 'mixed', '↔']
    ];
    quickModes.forEach(([name, desc, mode, glyph]) => {
      const entry = button('', 'mobile-quick-card', () => app.launchCustomQuiz({
        title: name, mode, kanaIds: window.KANA_DATA.map(k => k.id), count: 15
      }));
      entry.append(make('span', 'mobile-quick-glyph', glyph));
      const copy = make('span');
      copy.append(make('strong', '', name), make('small', '', desc));
      entry.append(copy, make('span', 'mobile-quick-arrow', '›'));
      quickGrid.append(entry);
    });
    const practiceActions = make('div', 'mobile-practice-actions');
    practiceActions.append(
      button('自选题型与范围  ›', 'outline-btn', e => openSheet(practiceSheet, e.currentTarget)),
      button('十阶课程  ›', 'outline-btn', () => app.switchTab('tab-stages'))
    );
    const resume = button('继续刚才的练习  ›', 'mobile-resume', () => app.switchTab('tab-arena'));
    resume.id = 'mobile-resume-quiz';
    resume.hidden = true;
    document.querySelector('.main-container').prepend(resume);
    const pauseSheet = createSheet('mobile-pause-sheet', '先歇一会儿？', '本次练习会留在原题，随时接着做。');
    const pauseActions = make('div', 'mobile-pause-actions');
    pauseActions.append(
      button('继续作答', 'primary-btn', () => {
        closeSheet(pauseSheet);
        if (app.activeQuiz?.currentQ?.type === 'typing' && !app.activeQuiz.answeredCurrent) {
          byId('quiz-typing-input').focus();
        }
      }),
      button('先回到刚才的学习处', 'secondary-btn', () => {
        closeSheet(pauseSheet);
        byId('quiz-typing-input').blur();
        const source = app.activeQuiz?.source || app.quizSource;
        const destination = source?.tab && source.tab !== 'tab-arena' ? source.tab : 'tab-gojuon';
        if (source?.tab === destination) app.tabScrollPositions[destination] = source.scrollY || 0;
        app.switchTab(destination);
      }),
      button('结束这组，看看结果', 'outline-btn', () => {
        closeSheet(pauseSheet);
        app.switchTab('tab-arena');
        app.finishQuizSession(true);
      })
    );
    pauseSheet.content.append(pauseActions);
    window.mobileNavigation.pauseQuiz = () => {
      if (app.activeQuiz) {
        byId('quiz-typing-input').blur();
        openSheet(pauseSheet, byId('btn-quit-quiz'));
      }
    };
    setup.prepend(title, quickGrid, practiceActions);

    // Keep all modes, with a native single-choice picker replacing nine cards.
    const modeGrid = byId('arena-mode-selector');
    const modeNames = {
      mixed: '综合练习 · 八种题型', 'origin-match': '汉字字源配对',
      'hira-romaji': '平假名认读', 'kata-romaji': '片假名认读',
      'hira-kata-cross': '平片假名互转', 'audio-dictation': '听音辨字',
      'confusable-sniper': '形近字辨认', 'typing-blitz': '罗马字输入',
      'word-combat': '词汇拼读'
    };
    const modeLabel = make('label', 'mobile-field-label', '练习题型');
    modeLabel.htmlFor = 'mobile-mode-select';
    const modeSelect = make('select', 'mobile-native-select');
    modeSelect.id = 'mobile-mode-select';
    Object.entries(modeNames).forEach(([value, name]) => modeSelect.add(new Option(name, value)));
    const modeDescription = make('p', 'mobile-field-description');
    function updateModeDescription() {
      modeSelect.value = app.selectedArenaMode;
      modeDescription.textContent = modeGrid.querySelector('.selected p')?.textContent || '';
    }
    modeSelect.addEventListener('change', () => {
      modeGrid.querySelector(`[data-mode="${modeSelect.value}"]`).click();
      updateModeDescription();
    });
    modeGrid.before(modeLabel, modeSelect, modeDescription);
    modeGrid.hidden = true;
    updateModeDescription();
    const preferencesKey = 'GENYIN_PRACTICE_PREFERENCES';
    try {
      const saved = JSON.parse(localStorage.getItem(preferencesKey) || 'null');
      if (saved && modeNames[saved.mode]) {
        modeGrid.querySelector(`[data-mode="${saved.mode}"]`).click();
        const countChoice = byId('arena-count-selector').querySelector(`[data-count="${Number(saved.count)}"]`);
        countChoice?.click();
        const rows = Array.isArray(saved.rows) ? saved.rows.filter(row => window.KANA_DATA.some(k => k.row === row)) : [];
        if (rows.length) {
          app.selectedArenaRows = new Set(rows);
          byId('arena-row-checkboxes').querySelectorAll('[data-rowscope]').forEach(el => {
            el.classList.toggle('active', app.selectedArenaRows.has(el.dataset.rowscope));
          });
        }
        updateModeDescription();
      }
    } catch (_) { /* An invalid preference never prevents entering practice. */ }
    function savePreferences() {
      try {
        localStorage.setItem(preferencesKey, JSON.stringify({
          mode: app.selectedArenaMode, count: app.selectedArenaCount, rows: [...app.selectedArenaRows]
        }));
      } catch (_) { /* The learning engine reports storage errors independently. */ }
    }
    configuration.addEventListener('click', savePreferences);
    modeSelect.addEventListener('change', savePreferences);
    const configHeadings = [...configuration.querySelectorAll('h3')];
    configHeadings.forEach((h, i) => { h.textContent = ['选择题型', '练习范围', '每组题量'][i]; });
    configHeadings[0].hidden = true;
    const rangeDetails = make('details', 'mobile-range-details');
    rangeDetails.append(make('summary', '', '按行选择范围'));
    byId('arena-row-checkboxes').before(rangeDetails);
    rangeDetails.append(byId('arena-row-checkboxes'));
    byId('arena-scope-weak').textContent = '薄弱项专项练习';
    byId('arena-scope-weak').addEventListener('click', () => closeSheet(practiceSheet));
    byId('arena-scope-all').textContent = '全部';
    byId('arena-scope-firsthalf').textContent = 'あ～た行';
    byId('arena-scope-secondhalf').textContent = 'な～ん行';
    byId('arena-count-selector').querySelectorAll('button').forEach(el => { el.textContent = `${el.dataset.count} 题`; });
    const notebook = setup.querySelector('.editorial-card');
    if (notebook) {
      notebook.classList.add('mobile-notebook');
      notebook.querySelector('h3').textContent = '温故录';
      notebook.querySelector('p').textContent = '练习中的错题与薄弱假名，会记在这里。';
      byId('btn-drill-mistakes-now').textContent = '练薄弱项';
      // Destructive record reset belongs with record management.
      const reset = byId('btn-reset-progress');
      reset.className = 'settings-row mobile-danger-row';
      reset.textContent = '清空学习记录';
      byId('settings-modal').querySelector('.about-note').before(reset);
    }

    // Writing stays on the pad. Character selection and detailed notes open on demand.
    const writing = byId('tab-writing');
    writing.querySelector('.chapter-intro h2').textContent = '写一遍，记得更牢';
    writing.querySelector('.chapter-intro p').textContent = '跟着范字临摹，也可以藏起范字自己写。';
    const writingBack = button('‹ 返回字卡', 'mobile-writing-return');
    writingBack.id = 'mobile-writing-back';
    writingBack.hidden = true;
    writing.querySelector('.chapter-intro').prepend(writingBack);
    const writingSheet = createSheet('mobile-writing-sheet', '选一个字来写', '平假名和片假名沿用当前选择。');
    writingSheet.content.append(byId('dojo-kana-selector'));
    writingSheet.content.addEventListener('click', e => {
      if (e.target.closest('.kana-mini-pill')) closeSheet(writingSheet);
    });
    const writingHeader = make('div', 'mobile-writing-header');
    const writingCurrent = make('div', 'mobile-writing-current');
    writingCurrent.id = 'mobile-writing-current';
    const selectWriting = button('换个字  ⌄', 'outline-btn', e => openSheet(writingSheet, e.currentTarget));
    writingHeader.append(writingCurrent, selectWriting);
    writing.querySelector('.dojo-canvas-panel').prepend(writingHeader);
    const writingDetails = make('details', 'mobile-writing-notes');
    writingDetails.append(make('summary', '', '看字源与运笔要领'));
    const info = writing.querySelector('.dojo-info-panel');
    const writingDetail = byId('dojo-char-detail-box');
    info.replaceChildren(writingDetails);
    writingDetails.append(writingDetail);
    const modeSwitch = byId('dojo-mode-trace').parentElement;
    const scriptSwitch = byId('dojo-script-hira').parentElement;
    const scriptRow = scriptSwitch.parentElement;
    const switches = make('div', 'mobile-writing-switches');
    modeSwitch.before(switches);
    switches.append(modeSwitch, scriptSwitch);
    writingDetails.prepend(byId('dojo-toggle-origin-ghost').parentElement);
    scriptRow.remove();
    byId('dojo-btn-complete').parentElement.classList.add('mobile-writing-tools');
    byId('dojo-btn-complete').textContent = '写好了，记下并换字';
    byId('dojo-btn-reveal').textContent = '显示范字';
    byId('dojo-btn-speak').textContent = '听发音';
    byId('dojo-toggle-origin-ghost').parentElement.classList.add('mobile-ghost-label');
    function syncWriting() {
      const kana = window.KANA_DATA[app.dojoIndex];
      writingCurrent.replaceChildren(
        make('strong', '', app.dojoMemoryMode ? kana.romaji : `${kana.hiragana}  ${kana.katakana}`),
        make('span', '', `${app.dojoMemoryMode ? '默写' : kana.romaji} · ${app.dojoIndex + 1} / 46`)
      );
      byId('dojo-memory-prompt').textContent = `默写「${kana.romaji}」，写好后点“显示范字”对照。`;
    }

    // Library browsing displays one item with previous/next controls.
    function makePager(container, labelForCard) {
      let index = 0;
      const pager = { onChange: null };
      const bar = make('div', 'mobile-item-pager');
      const previous = button('‹', 'mobile-pager-arrow', () => show(index - 1));
      previous.setAttribute('aria-label', '上一组');
      const label = make('div', 'mobile-pager-label');
      const next = button('›', 'mobile-pager-arrow', () => show(index + 1));
      next.setAttribute('aria-label', '下一组');
      bar.append(previous, label, next);
      container.before(bar);
      function show(at) {
        const cards = [...container.children];
        index = Math.max(0, Math.min(at, cards.length - 1));
        cards.forEach((card, i) => { card.hidden = i !== index; });
        label.replaceChildren(make('strong', '', labelForCard(cards[index], index)), make('span', '', `${index + 1} / ${cards.length}`));
        previous.disabled = index === 0;
        next.disabled = index >= cards.length - 1;
        pager.onChange?.(index);
      }
      return Object.assign(pager, { reset: () => show(0), show });
    }
    const origin = byId('tab-origins');
    const libraryBack = button('‹ 五十音图', 'mobile-section-back', () => app.switchTab('tab-gojuon'));
    origin.prepend(libraryBack);
    byId('origin-history-title').textContent = '假名，原来有汉字的来处';
    byId('origin-history-subtitle').textContent = '按行选字，看看平假名与片假名是怎么来的。';
    byId('btn-start-origin-quiz').textContent = '练字源配对';
    const history = make('details', 'mobile-history');
    history.append(make('summary', '', '假名的历史与记忆方法'));
    byId('origin-timeline-grid').before(history);
    history.append(byId('origin-timeline-grid'), byId('origin-advantages-grid'));
    const originFilter = byId('origin-row-filter');
    const originSelect = make('select', 'mobile-native-select');
    originSelect.setAttribute('aria-label', '选择书源行');
    [...originFilter.children].forEach(el => originSelect.add(new Option(el.textContent, el.dataset.row)));
    originFilter.before(originSelect);
    originFilter.hidden = true;
    originSelect.addEventListener('change', () => originFilter.querySelector(`[data-row="${originSelect.value}"]`).click());
    const originPager = makePager(byId('origin-gallery-container'), card => card?.querySelector('.evo-card-header > div')?.textContent.trim() || '字源');
    const confusablePager = makePager(byId('confusable-groups-container'), (card, i) => card?.querySelector('h3')?.textContent || `形近字第 ${i + 1} 组`);
    originFilter.querySelector('[data-row="a"]').click();
    originSelect.value = 'a';
    originPager.reset();
    confusablePager.reset();
    const groups = make('select', 'mobile-native-select');
    groups.setAttribute('aria-label', '选择形近字组');
    [...byId('confusable-groups-container').children].forEach((card, i) => groups.add(new Option(card.querySelector('h3')?.textContent || `第 ${i + 1} 组`, String(i))));
    byId('confusable-groups-container').previousElementSibling.before(groups);
    groups.addEventListener('change', () => confusablePager.show(Number(groups.value)));
    confusablePager.onChange = index => { groups.value = String(index); };
    byId('tab-confusable').querySelector('.chapter-intro h2').textContent = '把相似的字，分清楚';
    byId('btn-start-all-confusable-quiz').textContent = '形近字综合练习';
    const stageBack = button('‹ 练习', 'mobile-section-back', () => app.switchTab('tab-arena'));
    byId('tab-stages').prepend(stageBack);

    // The same primary action remains under the thumb throughout every question.
    const dock = make('div', 'mobile-answer-dock');
    dock.id = 'mobile-answer-dock';
    dock.hidden = true;
    const dockStatus = make('span', 'mobile-answer-status');
    const dockAction = make('div', 'mobile-answer-action');
    dock.append(dockStatus, dockAction);
    document.body.append(dock);
    const submit = byId('btn-submit-typing');
    const typingHome = byId('quiz-typing-container');
    const typingInput = byId('quiz-typing-input');
    typingInput.enterKeyHint = 'done';
    typingInput.inputMode = 'text';
    typingInput.setAttribute('autocorrect', 'off');
    byId('btn-quit-quiz').textContent = '暂离';
    function syncQuiz() {
      const quiz = app.activeQuiz;
      const live = !!quiz && app.currentTab === 'tab-arena';
      document.body.classList.toggle('mobile-practice-on', live);
      document.body.classList.toggle('mobile-typing-on', live && quiz.currentQ?.type === 'typing' && !quiz.answeredCurrent);
      dock.hidden = !live;
      resume.hidden = !quiz || live;
      if (quiz) resume.textContent = `继续：${quiz.title} · 第 ${quiz.index + 1} 题  ›`;
      if (!live) {
        submit.hidden = false;
        if (!typingHome.contains(submit)) typingHome.append(submit);
        dockAction.replaceChildren();
        return;
      }
      const question = quiz.currentQ;
      const answered = quiz.answeredCurrent;
      if (answered) {
        typingInput.blur();
        const next = byId('btn-next-question');
        if (next && !dockAction.contains(next)) dockAction.replaceChildren(next);
        const correct = byId('quiz-feedback-container').querySelector('.quiz-feedback-box.correct');
        dockStatus.textContent = correct ? '记住了，继续' : `正确答案：${question.correctAnswer}`;
        const status = byId('quiz-feedback-container').querySelector('strong');
        if (status) status.textContent = correct ? '答对了' : `再看一眼：${question.correctAnswer}`;
      } else if (question?.type === 'typing') {
        submit.hidden = false;
        if (!dockAction.contains(submit)) dockAction.replaceChildren(submit);
        dockStatus.textContent = '输入读音后提交';
      } else {
        if (!typingHome.contains(submit)) typingHome.append(submit);
        dockAction.replaceChildren();
        dockStatus.textContent = '选出你的答案';
      }
      requestAnimationFrame(() => {
        // Starting each question at the question prevents the previous
        // feedback's scroll position from carrying into the next exercise.
        if (!answered) window.scrollTo({ top: 0, behavior: 'instant' });
      });
    }
    function syncNav() {
      const parent = app.currentTab === 'tab-origins' ? 'tab-gojuon'
        : app.currentTab === 'tab-stages' ? 'tab-arena' : app.currentTab;
      document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === parent);
        tab.setAttribute('aria-selected', String(tab.dataset.tab === parent));
      });
      syncQuiz();
    }
    function after(method, effect) {
      const original = app[method].bind(app);
      app[method] = function (...args) {
        const value = original(...args);
        effect(...args);
        return value;
      };
    }
    after('switchTab', syncNav);
    after('renderCurrentQuestion', syncQuiz);
    after('processAnswerResult', syncQuiz);
    after('finishQuizSession', syncQuiz);
    after('renderDojoState', syncWriting);
    after('renderOriginGallery', originPager.reset);

    // Detail actions are always reachable; content uses three short views.
    const modalBody = byId('kana-modal-body');
    function arrangeDetail() {
      if (!modalBody.children.length || modalBody.querySelector('.mobile-detail-tabs')) return;
      const children = [...modalBody.children];
      if (children.length < 5) return;
      const tabs = make('div', 'mobile-detail-tabs');
      const panels = [children[1], children[2], children[3]];
      const labels = ['字形与来源', '发音要点', '常用词'];
      const actions = children.at(-1);
      actions.classList.add('mobile-detail-actions');
      labels.forEach((name, i) => {
        const tab = button(name, 'mobile-detail-tab', () => {
          panels.forEach((panel, n) => { panel.hidden = n !== i; });
          [...tabs.children].forEach((el, n) => el.classList.toggle('active', n === i));
        });
        tabs.append(tab);
      });
      children[0].after(tabs);
      const comparisons = actions.firstElementChild;
      const comparisonDetails = make('details', 'mobile-comparison-details');
      comparisonDetails.append(make('summary', '', '看看容易混淆的字'));
      comparisonDetails.append(comparisons);
      actions.before(comparisonDetails);
      tabs.firstElementChild.click();
    }
    new MutationObserver(arrangeDetail).observe(modalBody, { childList: true });

    // Resize with the actual visible viewport when the Android keyboard opens.
    let largestHeight = window.innerHeight;
    function syncViewport() {
      const viewport = window.visualViewport;
      const height = Math.round(viewport?.height || window.innerHeight);
      largestHeight = Math.max(largestHeight, window.innerHeight);
      const keyboard = largestHeight - height > 150;
      document.documentElement.style.setProperty('--visible-height', `${height}px`);
      document.body.classList.toggle('mobile-keyboard-open', keyboard);
    }
    window.visualViewport?.addEventListener('resize', syncViewport);
    window.addEventListener('resize', syncViewport);
    syncViewport();
    app.renderDojoState();
    syncNav();
  });
})();
