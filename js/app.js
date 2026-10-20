// ============================================================================
// 《源音·五十音》—— 主应用控制器 (雅正书卷排版 · 移动端自适应 · 八式演练状态机)
// ============================================================================

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

class GojuonApp {
  constructor() {
    this.kanaMap = {};
    window.KANA_DATA.forEach(k => {
      this.kanaMap[k.id] = k;
    });

    this.currentTab = 'tab-gojuon';
    this.tabScrollPositions = Object.create(null);
    this.quizSource = null;
    this.writingSource = null;
    this.seionCardMode = 'all';
    this.highlightHard = false;
    this.highlightSameOrigin = false;
    this.originFilterRow = 'all';

    // 书道临池状态
    this.dojoIndex = 0;
    this.dojoScript = 'hira';
    this.dojoMemoryMode = false;
    this.calligraphyPad = null;

    // 演练配置状态
    this.selectedArenaMode = 'mixed';
    this.selectedArenaRows = new Set(['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa', 'n']);
    this.selectedArenaCount = 30;

    // 实时演练会话
    this.activeQuiz = null;

    this.init();
  }

  init() {
    this.bindGlobalNav();
    this.bindGojuonControls();
    this.bindOriginsTab();
    this.bindConfusableTab();
    this.bindWritingDojo();
    this.bindArenaControls();
    this.bindModalEvents();
    this.bindKeyboardShortcuts();

    this.updateHeaderStats();
    this.renderSeionMatrix();
    this.renderDakuonSection();
    this.renderYoonSection();
    this.renderSpecialSoundsSection();
    this.renderOriginHistoryAndGallery();
    this.renderConfusableGroups();
    this.renderDojoState();
    this.renderStagesGrid();
    this.renderMistakeNotebook();

    // 暴露给 Android 原生返回键调用
    window.handleAndroidBack = () => this.onBackPressed();
  }

  onBackPressed() {
    if (window.mobileNavigation?.closeTopSheet?.()) return true;
    const settings = document.getElementById('settings-modal');
    if (settings && settings.classList.contains('open')) { settings.classList.remove('open'); return true; }
    const modal = document.getElementById('kana-detail-modal');
    if (modal && modal.classList.contains('open')) {
      modal.classList.remove('open');
      return true;
    }
    if (this.currentTab === 'tab-arena' && this.activeQuiz) {
      if (window.mobileNavigation?.pauseQuiz) window.mobileNavigation.pauseQuiz();
      else this.switchTab(this.quizSource?.tab || 'tab-gojuon');
      return true;
    }
    if (this.currentTab === 'tab-writing' && this.writingSource) {
      this.returnToWritingSource();
      return true;
    }
    if (this.currentTab !== 'tab-gojuon') {
      this.switchTab('tab-gojuon');
      return true;
    }
    return false;
  }

  // ==================== 顶部统计与导航 ====================
  updateHeaderStats() {
    const sum = window.masteryEngine.getGlobalSummary();
    document.getElementById('stat-mastered-count').textContent = `${sum.masteredCount}/${sum.totalKana}`;
    document.getElementById('stat-avg-mastery').textContent = `${sum.avgMastery}%`;
    document.getElementById('stat-cleared-stages').textContent = `${sum.clearedStages}/${sum.totalStages}`;
    document.getElementById('stat-total-questions').textContent = `${sum.totalQuestions}题`;
    document.getElementById('stat-weak-count').textContent = sum.weakCount;
    document.getElementById('nav-stage-badge').textContent = `${sum.clearedStages}/${sum.totalStages}`;
  }

  switchTab(tabId, { forceTop = false } = {}) {
    if (this.currentTab !== tabId) this.tabScrollPositions[this.currentTab] = window.scrollY;
    this.currentTab = tabId;
    document.body.classList.toggle('quiz-mode', tabId === 'tab-arena' && !!this.activeQuiz);
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
      btn.setAttribute('aria-selected', String(btn.dataset.tab === tabId));
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === tabId);
    });

    const restoreY = forceTop ? 0 : (this.tabScrollPositions[tabId] || 0);
    requestAnimationFrame(() => { if (this.currentTab === tabId) window.scrollTo({ top: restoreY, behavior: 'instant' }); });

    if (tabId === 'tab-writing' && this.calligraphyPad) {
      setTimeout(() => this.calligraphyPad.render(), 40);
    }
    if (tabId === 'tab-stages') {
      this.renderStagesGrid();
    }
    if (tabId === 'tab-arena') {
      this.renderMistakeNotebook();
    }
    if (tabId === 'tab-gojuon') {
      this.renderSeionMatrix();
    }
  }

  bindGlobalNav() {
    document.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    const themeBtn = document.getElementById('btn-toggle-theme');
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      localStorage.setItem('GENYIN_THEME', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
      try { window.AndroidApp?.setTheme?.(document.body.classList.contains('dark-mode')); } catch (_) {}
      const isDark = document.body.classList.contains('dark-mode');
      themeBtn.innerHTML = `<span>${isDark ? '切换日间模式' : '切换夜间模式'}</span><span>◐</span>`;
      this.calligraphyPad?.render();
    });

    document.getElementById('btn-quick-weak-drill').addEventListener('click', () => {
      this.startWeaknessDrill();
    });

    document.getElementById('btn-start-recommended-stage').addEventListener('click', () => {
      const stages = Object.values(window.masteryEngine.state.stages);
      const nextStage = stages.find(s => !s.cleared) || stages[stages.length - 1];
      this.launchStageQuiz(nextStage.stage);
    });
  }

  // ==================== 卷一：五十音图 ====================
  bindGojuonControls() {
    document.querySelectorAll('#gojuon-subview-group .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#gojuon-subview-group .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sub = btn.dataset.subview;
        document.querySelectorAll('.gojuon-subview').forEach(el => {
          el.style.display = 'none';
        });
        document.getElementById(`subview-${sub}`).style.display = 'block';
        document.getElementById('seion-display-controls').style.display = sub === 'seion' ? 'flex' : 'none';
      });
    });

    document.querySelectorAll('#seion-display-controls .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#seion-display-controls .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.seionCardMode = btn.dataset.cardmode;
        this.renderSeionMatrix();
      });
    });

    const hardBtn = document.getElementById('btn-highlight-hard');
    hardBtn.addEventListener('click', () => {
      this.highlightHard = !this.highlightHard;
      hardBtn.classList.toggle('active', this.highlightHard);
      this.renderSeionMatrix();
    });

    const sameBtn = document.getElementById('btn-highlight-sameorigin');
    sameBtn.addEventListener('click', () => {
      this.highlightSameOrigin = !this.highlightSameOrigin;
      sameBtn.classList.toggle('active', this.highlightSameOrigin);
      this.renderSeionMatrix();
    });
  }

  renderSeionMatrix() {
    const container = document.getElementById('gojuon-matrix-rows');
    container.innerHTML = '';

    window.GOJUON_GRID.forEach(rowConf => {
      const rowEl = document.createElement('div');
      rowEl.className = 'gojuon-row-group';

      const validIds = rowConf.cells.filter(Boolean);
      const headerCell = document.createElement('div');
      headerCell.className = 'row-meta-box';
      headerCell.innerHTML = `
        <div>
          <div class="row-meta-title">${rowConf.rowName}</div>
          <div class="row-meta-desc">${rowConf.phoneticDesc}</div>
        </div>
        <button class="row-practice-link" data-rowdrill="${rowConf.rowId}">本行演练</button>
      `;
      headerCell.querySelector('.row-practice-link').addEventListener('click', () => {
        this.launchCustomQuiz({
          title: `${rowConf.rowName} · 专项演练`,
          mode: 'mixed',
          kanaIds: validIds,
          count: Math.max(15, validIds.length * 4)
        });
      });
      rowEl.appendChild(headerCell);

      rowConf.cells.forEach(kanaId => {
        if (!kanaId) {
          const empty = document.createElement('div');
          empty.className = 'kana-cell empty-cell';
          empty.textContent = '空缺';
          rowEl.appendChild(empty);
          return;
        }

        const k = this.kanaMap[kanaId];
        const rec = window.masteryEngine.state.kanaRecords[kanaId] || { masteryScore: 0 };
        const sameOrigin = k.hiraOrigin.kanji === k.kataOrigin.kanji;

        const cell = document.createElement('div');
        cell.className = 'kana-cell';
        cell.tabIndex = 0; cell.setAttribute('role','group'); cell.setAttribute('aria-label', `${k.hiragana} ${k.katakana} ${k.romaji}，打开详解`);
        cell.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.openKanaDetailModal(k.id); } });
        if (this.highlightHard && k.pronunciation.isHardForChinese) {
          cell.classList.add('hard-highlight');
        } else if (this.highlightSameOrigin && sameOrigin) {
          cell.classList.add('same-origin-highlight');
        }
        if (this.seionCardMode === 'hira-blind' || this.seionCardMode === 'kata-blind') {
          cell.classList.add('blind-hide');
        }

        let centerHtml = '';
        if (this.seionCardMode === 'hira-blind') {
          centerHtml = `<span class="cell-hira" style="font-size:36px;">${k.hiragana}</span>`;
        } else if (this.seionCardMode === 'kata-blind') {
          centerHtml = `<span class="cell-kata" style="font-size:34px;color:var(--ink-900);">${k.katakana}</span>`;
        } else if (this.seionCardMode === 'kanji-matrix') {
          centerHtml = `
            <span class="cell-kanji-hero">${k.hiraOrigin.kanji}</span>
            <span style="font-size:13px;color:var(--ink-300);">→</span>
            <span class="cell-hira" style="font-size:24px;">${k.hiragana}</span>
          `;
        } else {
          centerHtml = `
            <span class="cell-hira">${k.hiragana}</span>
            <span class="cell-kata">${k.katakana}</span>
          `;
        }

        const fillClass = rec.masteryScore < 40 ? 'low' : (rec.masteryScore < 85 ? 'mid' : '');
        const originLabel = sameOrigin
          ? `<span>${k.hiraOrigin.kanji}</span>`
          : `<span>${k.hiraOrigin.kanji}</span> · <span>${k.kataOrigin.kanji}</span>`;

        cell.innerHTML = `
          <div class="cell-top">
            <span class="cell-romaji">${k.romaji}</span>
            <button class="cell-sound-trigger" aria-label="播放 ${k.hiragana} 的读音" title="播放发音">♪</button>
          </div>
          <div class="cell-center">${centerHtml}</div>
          <div class="cell-bottom">
            <div class="cell-origin-pair">${originLabel}</div>
            <span class="cell-mastery-dot">${rec.masteryScore}%</span>
          </div>
          <div class="cell-progress-line">
            <div class="cell-progress-fill ${fillClass}" style="width:${rec.masteryScore}%"></div>
          </div>
        `;

        const soundBtn = cell.querySelector('.cell-sound-trigger');
        soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.audioEngine.speakJapanese(k.hiragana);
        });

        cell.addEventListener('click', () => {
          window.audioEngine.speakJapanese(k.hiragana);
          this.openKanaDetailModal(k.id);
        });

        rowEl.appendChild(cell);
      });

      container.appendChild(rowEl);
    });
  }

  renderDakuonSection() {
    const container = document.getElementById('dakuon-container');
    let html = `
      <div class="editorial-card">
        <h3>汉日清浊与送气考辨：为何日语清音在词中听感近于中文不送气音？</h3>
        <div class="scholarly-note">
          一、<strong>普通话塞音以「送气与否」别义</strong>：普通话的 p/b、t/d、k/g 均为清音（声带不发生强烈振动），区别在于 p、t、k 送出强气流，而 b、d、g 不送气。
          二、<strong>日语塞音以「声带振动与否（清浊）」别义</strong>：日语的 か/が、た/だ、ぱ/ば 靠声带是否振动区分。
          三、日语清音（か、た）位于词首时略带送气，位于词中（如 わ<strong>た</strong>し watashi）则<strong>不送气</strong>。不送气的清音 t 听在普通话母语者耳中，便与普通话的不送气音 d（达）极为相似；而日语真正的浊音（が、だ、ば）则需令声带充分振动（如吴语、湘语保留的古全浊声母）。
        </div>
      </div>
    `;

    window.DAKUON_DATA.forEach(group => {
      html += `
        <div class="editorial-card">
          <h3>${group.rowName} <span style="font-size:13px;color:var(--indigo);font-weight:400;margin-left:8px;">由 ${group.baseRow} 派生</span></h3>
          <div class="scholarly-note">${group.rule}</div>
          <div class="dakuon-grid">
            ${group.items.map(item => `
              <div class="mini-kana-card" data-speak="${item.hira}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="cell-romaji">${item.romaji}</span>
                  <span style="font-size:11px;color:var(--ink-500);">清音: ${item.base}</span>
                </div>
                <div style="display:flex;align-items:baseline;justify-content:center;gap:8px;margin:6px 0;">
                  <span style="font-family:var(--font-kaiti);font-size:28px;">${item.hira}</span>
                  <span style="font-size:20px;color:var(--ink-500);">${item.kata}</span>
                </div>
                <div style="font-size:11.5px;color:var(--ink-700);text-align:center;padding-top:4px;border-top:1px solid var(--line-hair);">
                  <div>${item.word}</div>
                  <div style="color:var(--ink-500);font-size:11px;">${item.wordMeaning}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    container.querySelectorAll('.mini-kana-card').forEach(card => {
      card.addEventListener('click', () => {
        window.audioEngine.speakJapanese(card.dataset.speak);
      });
    });
  }

  renderYoonSection() {
    const container = document.getElementById('yoon-container');
    let html = `
      <div class="editorial-card">
        <h3>拗音三十三音 · 汉语拼音 i 介音拼读参照</h3>
        <div class="scholarly-note">${window.YOON_DATA.intro}</div>
      </div>
    `;

    window.YOON_DATA.rows.forEach(row => {
      html += `
        <div class="editorial-card">
          <h3>${row.rowName} <span style="font-size:13px;color:var(--ink-500);font-weight:400;margin-left:8px;">（${row.base}）</span></h3>
          <div class="yoon-grid">
            ${row.items.map(item => `
              <div class="mini-kana-card" data-speak="${item.hira}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="cell-romaji">${item.romaji}</span>
                  <span style="font-size:11px;color:var(--ink-300);">点按聆听</span>
                </div>
                <div style="display:flex;align-items:baseline;justify-content:center;gap:10px;margin:4px 0;">
                  <span style="font-family:var(--font-kaiti);font-size:28px;">${item.hira}</span>
                  <span style="font-size:20px;color:var(--ink-500);">${item.kata}</span>
                </div>
                <div style="font-size:12px;color:var(--ink-700);text-align:center;padding-top:4px;border-top:1px solid var(--line-hair);">
                  ${item.word} — <span style="color:var(--ink-500);">${item.meaning}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    container.querySelectorAll('.mini-kana-card').forEach(card => {
      card.addEventListener('click', () => {
        window.audioEngine.speakJapanese(card.dataset.speak);
      });
    });
  }

  renderSpecialSoundsSection() {
    const container = document.getElementById('special-sounds-container');
    container.innerHTML = window.SPECIAL_SOUNDS_DATA.map(sp => `
      <div class="editorial-card">
        <div style="margin-bottom:10px;">
          <span class="adv-badge">${sp.badge}</span>
          <h3>${sp.name} <small style="font-size:13px;color:var(--ink-500);font-weight:400;margin-left:6px;">（书写形式：${sp.symbol}）</small></h3>
        </div>
        <div class="scholarly-note">${sp.coreRule}</div>
        <div class="scholarly-note vermilion">${sp.chineseSecret}</div>
        <p style="font-size:12.5px;color:var(--indigo);margin-bottom:14px;">键盘输入规则：${sp.inputTip}</p>
        <div class="dakuon-grid" style="grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));">
          ${sp.examples.map(ex => `
            <div class="mini-kana-card" data-speak="${ex.kana.replace(/[⓪①②③④⑤⑥⑦⑧⑨\/／\s]/g, '')}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong style="font-family:var(--font-serif);font-size:16px;color:var(--vermilion);">${ex.kana}</strong>
                <span class="cell-romaji">${ex.romaji}</span>
              </div>
              <div style="font-size:14px;font-weight:600;color:var(--ink-900);">${ex.kanji}</div>
              <div style="font-size:12px;color:var(--ink-700);">${ex.meaning}</div>
              <div style="font-size:11px;color:var(--indigo);margin-top:2px;">${ex.contrast}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.mini-kana-card').forEach(card => {
      card.addEventListener('click', () => {
        window.audioEngine.speakJapanese(card.dataset.speak);
      });
    });
  }

  // ==================== 卷二：万叶书源 ====================
  bindOriginsTab() {
    document.getElementById('btn-start-origin-quiz').addEventListener('click', () => {
      this.launchCustomQuiz({
        title: '万叶书源配对演练',
        mode: 'origin-match',
        kanaIds: window.KANA_DATA.map(k => k.id),
        count: 30
      });
    });

    document.querySelectorAll('#origin-row-filter .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#origin-row-filter .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.originFilterRow = btn.dataset.row;
        this.renderOriginGallery();
      });
    });
  }

  renderOriginHistoryAndGallery() {
    const hist = window.ORIGIN_HISTORY;
    document.getElementById('origin-history-title').textContent = hist.title;
    document.getElementById('origin-history-subtitle').textContent = hist.subtitle;

    document.getElementById('origin-timeline-grid').innerHTML = hist.timeline.map(item => `
      <div class="timeline-card">
        <div class="timeline-era">${item.era}</div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    `).join('');

    document.getElementById('origin-advantages-grid').innerHTML = hist.chineseAdvantages.map(adv => `
      <div class="adv-card">
        <span class="adv-badge">${adv.badge}</span>
        <h4 style="font-family:var(--font-serif);font-size:15.5px;margin-bottom:6px;">${adv.title}</h4>
        <p style="font-size:12.5px;color:var(--ink-700);line-height:1.65;">${adv.content}</p>
      </div>
    `).join('');

    this.renderOriginGallery();
  }

  renderOriginGallery() {
    const container = document.getElementById('origin-gallery-container');
    let list = window.KANA_DATA;
    if (this.originFilterRow === 'same') {
      list = list.filter(k => k.hiraOrigin.kanji === k.kataOrigin.kanji);
    } else if (this.originFilterRow === 'wa') {
      list = list.filter(k => k.row === 'wa' || k.row === 'n');
    } else if (this.originFilterRow !== 'all') {
      list = list.filter(k => k.row === this.originFilterRow);
    }

    container.innerHTML = list.map(k => {
      const isSame = k.hiraOrigin.kanji === k.kataOrigin.kanji;
      return `
        <div class="origin-evo-card">
          <div class="evo-card-header">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="evo-romaji-badge">${k.romaji}</span>
              <span style="font-size:22px;font-family:var(--font-kaiti);">${k.hiragana} · ${k.katakana}</span>
              ${isSame ? '<span class="brand-tag">平片同源</span>' : ''}
            </div>
            <div class="btn-group">
              <button class="outline-btn btn-evo-ja" data-ja="${k.hiragana}">日语 [${k.romaji}]</button>
              <button class="outline-btn btn-evo-zh" data-zh="${k.hiraOrigin.kanji}">本字「${k.hiraOrigin.kanji}」</button>
            </div>
          </div>

          <!-- 平假名草书演变 -->
          <div class="evo-track">
            <div class="evo-track-title">
              <span>平假名 · 草书演变（女手）</span>
              <span style="color:var(--vermilion);">本字：${k.hiraOrigin.kanji} (${k.hiraOrigin.pinyin})</span>
            </div>
            <div class="evo-stages-flow">
              <div class="evo-step-box">
                <span class="evo-step-char kaisho">${k.hiraOrigin.kanji}</span>
                <span class="evo-step-label">楷体示意</span>
              </div>
              <span class="evo-arrow">→</span>
              <div class="evo-step-box">
                <span class="evo-step-char sosho">${k.hiraOrigin.kanji}</span>
                <span class="evo-step-label">字形参照</span>
              </div>
              <span class="evo-arrow">→</span>
              <div class="evo-step-box">
                <span class="evo-step-char final-kana">${k.hiragana}</span>
                <span class="evo-step-label">现代平假名</span>
              </div>
            </div>
            <div class="evo-desc-text">${k.hiraOrigin.evolution}</div>
          </div>

          <!-- 片假名楷书偏旁提取 -->
          <div class="evo-track">
            <div class="evo-track-title">
              <span>片假名 · 楷书偏旁省取</span>
              <span style="color:var(--indigo);">本字：${k.kataOrigin.kanji} (${k.kataOrigin.pinyin})</span>
            </div>
            <div class="evo-stages-flow">
              <div class="evo-step-box">
                <span class="evo-step-char kaisho">${k.kataOrigin.kanji}</span>
                <span class="evo-step-label">楷书本字</span>
              </div>
              <span class="evo-arrow">→</span>
              <div class="evo-step-box">
                <span class="evo-step-char radical-box">${k.kataOrigin.radicalPart}</span>
                <span class="evo-step-label">截取部件</span>
              </div>
              <span class="evo-arrow">→</span>
              <div class="evo-step-box">
                <span class="evo-step-char final-kana" style="font-family:var(--font-sans);">${k.katakana}</span>
                <span class="evo-step-label">现代片假名</span>
              </div>
            </div>
            <div class="evo-desc-text">${k.kataOrigin.evolution}</div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-evo-ja').forEach(btn => {
      btn.addEventListener('click', () => window.audioEngine.speakJapanese(btn.dataset.ja));
    });
    container.querySelectorAll('.btn-evo-zh').forEach(btn => {
      btn.addEventListener('click', () => window.audioEngine.speakChinese(btn.dataset.zh));
    });
  }

  // ==================== 卷三：十二组字形辨微 ====================
  bindConfusableTab() {
    document.getElementById('btn-start-all-confusable-quiz').addEventListener('click', () => {
      const allConfusableIds = Array.from(
        new Set(window.CONFUSABLE_GROUPS.flatMap(g => g.members.map(m => m.kanaId)))
      );
      this.launchCustomQuiz({
        title: '十二组形近假名综合演练',
        mode: 'confusable-sniper',
        kanaIds: allConfusableIds,
        count: 40
      });
    });
  }

  renderConfusableGroups() {
    const container = document.getElementById('confusable-groups-container');
    container.innerHTML = window.CONFUSABLE_GROUPS.map(group => `
      <div class="confusable-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div>
            <span class="adv-badge" style="margin-bottom:0;margin-right:6px;">${group.level}</span>
            <h3 style="font-family:var(--font-serif);font-size:16.5px;display:inline;">${group.title}</h3>
          </div>
          <button class="outline-btn btn-group-sniper" data-groupid="${group.id}">
            本组演练（16题）
          </button>
        </div>
        <p style="font-size:12.5px;color:var(--ink-500);">${group.summary}</p>
        <div class="confusable-members-row">
          ${group.members.map(m => `
            <div class="conf-member-box" data-kanaid="${m.kanaId}">
              <div class="conf-member-char">${m.char}</div>
              <div class="conf-member-romaji">[${m.romaji}]</div>
              <div class="conf-member-origin">源字：${m.origin}</div>
              <div class="conf-member-feature">${m.keyFeature}</div>
            </div>
          `).join('')}
        </div>
        <div class="scholarly-note" style="margin-bottom:0;">${group.secretFormula}</div>
      </div>
    `).join('');

    container.querySelectorAll('.conf-member-box').forEach(box => {
      box.addEventListener('click', () => {
        const k = this.kanaMap[box.dataset.kanaid];
        if (k) {
          window.audioEngine.speakJapanese(k.hiragana);
          this.openKanaDetailModal(k.id);
        }
      });
    });

    container.querySelectorAll('.btn-group-sniper').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = window.CONFUSABLE_GROUPS.find(g => g.id === btn.dataset.groupid);
        if (!group) return;
        const ids = group.members.map(m => m.kanaId);
        const isKataGroup = /[ァ-ヴ]/.test(group.members[0].char);
        this.launchCustomQuiz({
          title: `字形辨微 · ${group.title}`,
          mode: 'confusable-sniper',
          kanaIds: ids,
          onlyKatakana: isKataGroup,
          count: 16
        });
      });
    });
  }

  // ==================== 卷四：书道临池 ====================
  bindWritingDojo() {
    this.calligraphyPad = new window.CalligraphyPad('calligraphy-canvas', {
      targetChar: 'あ',
      originKanji: '安',
      showGhost: true,
      showOriginOverlay: true,
      isMemoryMode: false
    });

    const traceBtn = document.getElementById('dojo-mode-trace');
    const memoryBtn = document.getElementById('dojo-mode-memory');
    const revealBtn = document.getElementById('dojo-btn-reveal');
    const memoryPrompt = document.getElementById('dojo-memory-prompt');

    traceBtn.addEventListener('click', () => {
      this.dojoMemoryMode = false;
      traceBtn.classList.add('active');
      memoryBtn.classList.remove('active');
      revealBtn.style.display = 'none';
      memoryPrompt.style.display = 'none';
      this.calligraphyPad.setMode({ isMemoryMode: false });
      this.renderDojoState();
    });

    memoryBtn.addEventListener('click', () => {
      this.dojoMemoryMode = true;
      memoryBtn.classList.add('active');
      traceBtn.classList.remove('active');
      revealBtn.style.display = 'inline-flex';
      memoryPrompt.style.display = 'block';
      this.calligraphyPad.setMode({ isMemoryMode: true });
      this.renderDojoState();
    });

    const hiraBtn = document.getElementById('dojo-script-hira');
    const kataBtn = document.getElementById('dojo-script-kata');
    hiraBtn.addEventListener('click', () => {
      this.dojoScript = 'hira';
      hiraBtn.classList.add('active');
      kataBtn.classList.remove('active');
      this.renderDojoState();
    });
    kataBtn.addEventListener('click', () => {
      this.dojoScript = 'kata';
      kataBtn.classList.add('active');
      hiraBtn.classList.remove('active');
      this.renderDojoState();
    });

    document.getElementById('dojo-toggle-origin-ghost').addEventListener('change', (e) => {
      this.calligraphyPad.setMode({ showOriginOverlay: e.target.checked });
    });

    document.getElementById('dojo-btn-undo').addEventListener('click', () => this.calligraphyPad.undo());
    document.getElementById('dojo-btn-clear').addEventListener('click', () => this.calligraphyPad.clear());
    revealBtn.addEventListener('click', () => this.calligraphyPad.revealAnswer());

    document.getElementById('dojo-btn-complete').addEventListener('click', () => {
      if (!this.calligraphyPad.hasUserWritten()) { window.showToast?.('先写下假名，再记录这次练习。'); return; }
      const k = window.KANA_DATA[this.dojoIndex];
      window.masteryEngine.recordStudyOrWrite(k.id, true);
      window.audioEngine.playCorrectSfx(2);
      window.audioEngine.speakJapanese(k.hiragana);
      this.updateHeaderStats();
      this.dojoIndex = (this.dojoIndex + 1) % window.KANA_DATA.length;
      this.renderDojoState();
    });

    document.getElementById('dojo-btn-prev').addEventListener('click', () => {
      this.dojoIndex = (this.dojoIndex - 1 + window.KANA_DATA.length) % window.KANA_DATA.length;
      this.renderDojoState();
    });

    document.getElementById('dojo-btn-next').addEventListener('click', () => {
      this.dojoIndex = (this.dojoIndex + 1) % window.KANA_DATA.length;
      this.renderDojoState();
    });

    document.getElementById('dojo-btn-speak').addEventListener('click', () => {
      const k = window.KANA_DATA[this.dojoIndex];
      window.audioEngine.speakJapanese(k.hiragana);
    });
  }

  renderDojoState() {
    const k = window.KANA_DATA[this.dojoIndex];
    const rec = window.masteryEngine.state.kanaRecords[k.id] || { writeCount: 0, masteryScore: 0 };
    const targetChar = this.dojoScript === 'hira' ? k.hiragana : k.katakana;
    const originObj = this.dojoScript === 'hira' ? k.hiraOrigin : k.kataOrigin;

    if (this.calligraphyPad) {
      this.calligraphyPad.setCharacter(targetChar, originObj.kanji);
    }

    const detailBox = document.getElementById('dojo-char-detail-box');
    const charDisplay = this.dojoMemoryMode ? '（默写隐去字形）' : `${k.hiragana} · ${k.katakana}`;

    detailBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line-hair);padding-bottom:12px;">
        <div>
          <span class="evo-romaji-badge">读音 [${k.romaji}]</span>
          <strong style="font-size:24px;font-family:var(--font-kaiti);margin-left:10px;font-weight:500;">${charDisplay}</strong>
        </div>
        <span style="font-size:12px;color:var(--ink-500);">已临写 ${rec.writeCount} 次 · 熟练度 ${rec.masteryScore}%</span>
      </div>

      <div class="scholarly-note" style="margin-top:12px;margin-bottom:0;">
        <strong>当前临池：${this.dojoScript === 'hira' ? '平假名（草书体）' : '片假名（楷书偏旁）'}</strong>
        ● <strong>万叶本字</strong>：源于汉字「<strong>${originObj.kanji}</strong>」(${originObj.pinyin}) ${this.dojoScript === 'kata' ? `之【${k.kataOrigin.radicalPart}】` : '之草书连笔'}
        ● <strong>书源解析</strong>：${originObj.evolution}
        ● <strong>运笔要领</strong>：${this.dojoScript === 'hira' ? `共 ${k.writingTip.hiraStrokes} 笔 —— ${k.writingTip.hiraGuide}` : `共 ${k.writingTip.kataStrokes} 笔 —— ${k.writingTip.kataGuide}`}
        ● <strong>发音参照</strong>：${k.pronunciation.chineseApprox}
      </div>
    `;

    const selector = document.getElementById('dojo-kana-selector');
    selector.innerHTML = window.KANA_DATA.map((item, idx) => {
      const r = window.masteryEngine.state.kanaRecords[item.id];
      const practiced = r && r.writeCount > 0;
      return `
        <button class="kana-mini-pill ${idx === this.dojoIndex ? 'active' : ''}" data-idx="${idx}" style="${practiced && idx !== this.dojoIndex ? 'border-color:var(--celadon);color:var(--celadon);' : ''}">
          ${this.dojoScript === 'hira' ? item.hiragana : item.katakana} <small style="opacity:0.75;">${item.romaji}</small>
        </button>
      `;
    }).join('');

    selector.querySelectorAll('.kana-mini-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dojoIndex = parseInt(btn.dataset.idx, 10);
        this.renderDojoState();
      });
    });
  }

  // ==================== 卷五：十阶修习 ====================
  renderStagesGrid() {
    const container = document.getElementById('stages-grid-container');
    container.innerHTML = window.CURRICULUM_STAGES.map(stConf => {
      const stState = window.masteryEngine.state.stages[stConf.stage] || {
        cleared: false, stars: 0, bestAccuracy: 0, attempts: 0
      };
      const rankLabels = ['未修毕', '初通 · 一印', '熟稔 · 二印', '圆融 · 三印'];
      const rankText = rankLabels[stState.stars] || '未修毕';

      return `
        <div class="stage-card ${stState.cleared ? 'cleared' : ''}">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span class="stage-num-badge">${stState.cleared ? '已修毕' : '待修习'} · 第 ${stConf.stage} 阶</span>
              <span style="font-family:var(--font-serif);font-size:12px;color:${stState.cleared ? 'var(--celadon)' : 'var(--ink-500)'};">${rankText}</span>
            </div>
            <h3 style="font-family:var(--font-serif);font-size:16.5px;margin-bottom:6px;">${stConf.title}</h3>
            <p style="font-size:12.5px;color:var(--ink-700);margin-bottom:10px;">${stConf.subtitle}</p>
            <div style="font-size:12px;background:var(--bg-canvas);padding:10px 12px;border-radius:6px;border:1px solid var(--line-hair);color:var(--ink-500);">
              <div>要旨：${stConf.focusDesc}</div>
              <div style="margin-top:4px;">规制：共 ${stConf.targetCount} 题 · 达标正确率 ${stConf.passAccuracy}% · 历史最高 ${Math.round(stState.bestAccuracy * 10) / 10}%（已演练 ${stState.attempts} 次）</div>
            </div>
          </div>
          <div>
            <button class="primary-btn btn-start-stage" data-stage="${stConf.stage}" style="width:100%;justify-content:center;">
              ${stState.cleared ? '重温本阶修习' : '进入本阶修习'}（${stConf.targetCount}题）
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-start-stage').forEach(btn => {
      btn.addEventListener('click', () => {
        const stageNum = parseInt(btn.dataset.stage, 10);
        this.launchStageQuiz(stageNum);
      });
    });
  }

  // ==================== 卷六：八式演练与温故录 ====================
  bindArenaControls() {
    document.querySelectorAll('#arena-mode-selector .mode-select-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#arena-mode-selector .mode-select-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedArenaMode = card.dataset.mode;
      });
    });

    document.querySelectorAll('#arena-row-checkboxes .outline-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = btn.dataset.rowscope;
        if (this.selectedArenaRows.has(r)) {
          if (this.selectedArenaRows.size > 1) {
            this.selectedArenaRows.delete(r);
            btn.classList.remove('active');
          }
        } else {
          this.selectedArenaRows.add(r);
          btn.classList.add('active');
        }
      });
    });

    const updateRowButtonsUI = () => {
      document.querySelectorAll('#arena-row-checkboxes .outline-btn').forEach(btn => {
        btn.classList.toggle('active', this.selectedArenaRows.has(btn.dataset.rowscope));
      });
    };

    document.getElementById('arena-scope-all').addEventListener('click', () => {
      this.selectedArenaRows = new Set(['a', 'ka', 'sa', 'ta', 'na', 'ha', 'ma', 'ya', 'ra', 'wa', 'n']);
      updateRowButtonsUI();
    });

    document.getElementById('arena-scope-firsthalf').addEventListener('click', () => {
      this.selectedArenaRows = new Set(['a', 'ka', 'sa', 'ta']);
      updateRowButtonsUI();
    });

    document.getElementById('arena-scope-secondhalf').addEventListener('click', () => {
      this.selectedArenaRows = new Set(['na', 'ha', 'ma', 'ya', 'ra', 'wa', 'n']);
      updateRowButtonsUI();
    });

    document.getElementById('arena-scope-weak').addEventListener('click', () => {
      this.startWeaknessDrill();
    });

    document.querySelectorAll('#arena-count-selector .seg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#arena-count-selector .seg-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedArenaCount = parseInt(btn.dataset.count, 10);
      });
    });

    document.getElementById('btn-launch-custom-quiz').addEventListener('click', () => {
      const kanaIds = window.KANA_DATA
        .filter(k => this.selectedArenaRows.has(k.row))
        .map(k => k.id);

      this.launchCustomQuiz({
        title: `自由演练（${this.selectedArenaCount}题）`,
        mode: this.selectedArenaMode,
        kanaIds,
        count: this.selectedArenaCount
      });
    });

    document.getElementById('btn-drill-mistakes-now').addEventListener('click', () => {
      this.startWeaknessDrill();
    });

    document.getElementById('btn-reset-progress').addEventListener('click', () => {
      if (confirm('确定要清空所有五十音修习记录与温故录吗？')) {
        window.masteryEngine.resetAll();
        this.updateHeaderStats();
        this.renderSeionMatrix();
        this.renderStagesGrid();
        this.renderMistakeNotebook();
      }
    });

    document.getElementById('btn-quit-quiz').addEventListener('click', () => {
      if (window.mobileNavigation?.pauseQuiz) window.mobileNavigation.pauseQuiz();
      else this.finishQuizSession(true);
    });

    document.getElementById('btn-quiz-replay-audio').addEventListener('click', () => {
      if (this.activeQuiz && this.activeQuiz.currentQ) {
        window.audioEngine.speakJapanese(this.activeQuiz.currentQ.audioText, false);
      }
    });

    document.getElementById('btn-quiz-replay-slow').addEventListener('click', () => {
      if (this.activeQuiz && this.activeQuiz.currentQ) {
        window.audioEngine.speakJapanese(this.activeQuiz.currentQ.audioText, true);
      }
    });

    document.getElementById('btn-submit-typing').addEventListener('click', () => {
      this.submitTypingAnswer();
    });

    document.getElementById('quiz-typing-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (this.activeQuiz && this.activeQuiz.answeredCurrent) {
          this.nextQuestion();
        } else {
          this.submitTypingAnswer();
        }
      }
    });
  }

  startWeaknessDrill() {
    const weakIds = window.masteryEngine.getWeakAndDueKanaIds(15);
    this.launchCustomQuiz({
      title: '温故录 · 薄弱假名专项演练',
      mode: 'mixed',
      kanaIds: weakIds,
      count: 25
    });
  }

  launchStageQuiz(stageNum) {
    const stConf = window.CURRICULUM_STAGES.find(s => s.stage === stageNum);
    if (!stConf) return;

    this.launchCustomQuiz({
      title: stConf.title,
      stageNum: stConf.stage,
      passAccuracy: stConf.passAccuracy,
      mode: 'mixed',
      kanaIds: stConf.kanaIds,
      onlyKatakana: !!stConf.onlyKatakana,
      includeVocabAndExtensions: !!stConf.includeVocabAndExtensions,
      count: stConf.targetCount
    });
  }

  launchCustomQuiz({ title, mode = 'mixed', kanaIds, count = 25, stageNum = null, passAccuracy = 90, onlyKatakana = false, includeVocabAndExtensions = false, questions = null }) {
    const source = this.currentTab === 'tab-arena' && this.quizSource
      ? this.quizSource : { tab: this.currentTab, scrollY: window.scrollY };
    this.quizSource = source;
    this.switchTab('tab-arena', { forceTop: true });

    const queue = questions ? questions.map(original => {
      const copy = JSON.parse(JSON.stringify(original));
      copy.isRetry = false;
      if (copy.choices) copy.choices = window.quizGenerator.shuffle(copy.choices);
      return copy;
    }) : window.quizGenerator.generateSessionQueue({
      mode,
      kanaIds,
      count,
      onlyKatakana,
      includeVocabAndExtensions
    });

    document.body.classList.add('quiz-mode');
    this.activeQuiz = {
      title,
      source,
      stageNum,
      passAccuracy,
      queue,
      index: 0,
      currentQ: null,
      answeredCurrent: false,
      questionStartTime: 0,
      sessionStartTime: Date.now(),
      initialTotal: queue.length,
      answeredCount: 0,
      correctCount: 0,
      combo: 0,
      wrongItems: []
    };

    document.getElementById('arena-setup-wrapper').style.display = 'none';
    document.getElementById('quiz-result-wrapper').style.display = 'none';
    document.getElementById('quiz-live-wrapper').style.display = 'block';
    document.getElementById('quiz-session-title').textContent = title;

    this.renderCurrentQuestion();
  }

  renderCurrentQuestion() {
    if (!this.activeQuiz) return;
    if (this.activeQuiz.index >= this.activeQuiz.queue.length) {
      this.finishQuizSession(false);
      return;
    }

    const q = this.activeQuiz.queue[this.activeQuiz.index];
    this.activeQuiz.currentQ = q;
    this.activeQuiz.answeredCurrent = false;
    this.activeQuiz.questionStartTime = performance.now();

    const totalLen = this.activeQuiz.queue.length;
    const curNum = this.activeQuiz.index + 1;
    const acc = this.activeQuiz.answeredCount > 0
      ? Math.round((this.activeQuiz.correctCount / this.activeQuiz.answeredCount) * 100)
      : 100;

    document.getElementById('quiz-progress-text').textContent = `${curNum}/${totalLen}`;
    document.getElementById('quiz-accuracy-text').textContent = `${acc}%`;
    document.getElementById('quiz-combo-text').textContent = this.activeQuiz.combo;
    document.getElementById('quiz-progress-bar-fill').style.width = `${Math.round(((curNum - 1) / totalLen) * 100)}%`;
    document.getElementById('quiz-retry-badge').style.display = q.isRetry ? 'inline-block' : 'none';

    document.getElementById('quiz-q-tag').textContent = q.tag;
    document.getElementById('quiz-q-title').textContent = q.promptTitle;
    document.getElementById('quiz-q-main').textContent = q.promptMain;
    document.getElementById('quiz-q-sub').textContent = q.promptSub;

    const fbContainer = document.getElementById('quiz-feedback-container');
    fbContainer.style.display = 'none';
    fbContainer.innerHTML = '';

    const choicesBox = document.getElementById('quiz-choices-container');
    const typingBox = document.getElementById('quiz-typing-container');

    if (q.type === 'typing') {
      choicesBox.style.display = 'none';
      typingBox.style.display = 'flex';
      const input = document.getElementById('quiz-typing-input');
      input.value = '';
      input.disabled = false;
      setTimeout(() => input.focus(), 30);
    } else {
      typingBox.style.display = 'none';
      choicesBox.style.display = 'grid';
      choicesBox.innerHTML = q.choices.map((c, idx) => `
        <button class="quiz-choice-btn" data-cidx="${idx}">
          <span class="choice-main">${c.label}</span>
          <span class="choice-sub">${c.subLabel || ''}</span>
        </button>
      `).join('');

      choicesBox.querySelectorAll('.quiz-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const cIdx = parseInt(btn.dataset.cidx, 10);
          this.handleChoiceSelect(cIdx);
        });
      });
    }

    if (q.autoPlayAudio) {
      window.audioEngine.speakJapanese(q.audioText, false);
    }
  }

  handleChoiceSelect(choiceIdx) {
    if (!this.activeQuiz || this.activeQuiz.answeredCurrent) return;
    const q = this.activeQuiz.currentQ;
    if (!q || !q.choices || !q.choices[choiceIdx]) return;

    this.activeQuiz.answeredCurrent = true;
    const chosen = q.choices[choiceIdx];
    const isCorrect = !!chosen.isCorrect;
    const reactionMs = Math.round(performance.now() - this.activeQuiz.questionStartTime);

    const buttons = document.querySelectorAll('#quiz-choices-container .quiz-choice-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (q.choices[idx].isCorrect) {
        btn.classList.add('correct');
      } else if (idx === choiceIdx && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    this.processAnswerResult(isCorrect, chosen.label, reactionMs);
  }

  submitTypingAnswer() {
    if (!this.activeQuiz || this.activeQuiz.answeredCurrent) return;
    const q = this.activeQuiz.currentQ;
    const input = document.getElementById('quiz-typing-input');
    const val = (input.value || '').trim().toLowerCase();
    if (!val) return;

    this.activeQuiz.answeredCurrent = true;
    input.disabled = true;
    const reactionMs = Math.round(performance.now() - this.activeQuiz.questionStartTime);
    const isCorrect = window.quizGenerator.isTypingAnswerCorrect(q, input.value);

    this.processAnswerResult(isCorrect, val, reactionMs);
  }

  processAnswerResult(isCorrect, userAnswerStr, reactionMs) {
    const q = this.activeQuiz.currentQ;
    this.activeQuiz.answeredCount += 1;

    if (isCorrect) {
      this.activeQuiz.correctCount += 1;
      this.activeQuiz.combo += 1;
      window.masteryEngine.updateMaxCombo(this.activeQuiz.combo);
      window.audioEngine.playCorrectSfx(this.activeQuiz.combo);
    } else {
      this.activeQuiz.combo = 0;
      window.audioEngine.playWrongSfx();
      this.activeQuiz.wrongItems.push({
        kanaId: q.kanaId,
        prompt: q.promptMain,
        wrongAnswer: userAnswerStr,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        question: JSON.parse(JSON.stringify(q))
      });

      if (!q.isRetry && this.activeQuiz.queue.length < this.activeQuiz.initialTotal + 15) {
        const retryClone = JSON.parse(JSON.stringify(q));
        retryClone.isRetry = true;
        if (retryClone.choices) {
          retryClone.choices = window.quizGenerator.shuffle(retryClone.choices);
        }
        const insertPos = Math.min(this.activeQuiz.queue.length, this.activeQuiz.index + 4);
        this.activeQuiz.queue.splice(insertPos, 0, retryClone);
      }
    }

    setTimeout(() => {
      window.audioEngine.speakJapanese(q.audioText, false);
    }, 140);

    window.masteryEngine.recordQuizAnswer({
      kanaId: q.kanaId,
      dimension: q.dimension,
      isCorrect,
      reactionMs,
      modeName: q.tag,
      wrongAnswer: userAnswerStr,
      correctAnswer: q.correctAnswer
    });

    this.updateHeaderStats();

    const fbContainer = document.getElementById('quiz-feedback-container');
    fbContainer.style.display = 'block';
    fbContainer.innerHTML = `
      <div class="quiz-feedback-box ${isCorrect ? 'correct' : 'wrong'}">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <strong>
            ${isCorrect
              ? `答对 · 用时 ${(reactionMs / 1000).toFixed(1)} 秒`
              : `答误 · 所选「${escapeHTML(userAnswerStr)}」，正答为「${q.correctAnswer}」（已安排三题后复考）`}
          </strong>
          <button class="primary-btn" id="btn-next-question">
            ${this.activeQuiz.index + 1 >= this.activeQuiz.queue.length ? '审阅成绩单' : '下一题'}
          </button>
        </div>
        <div style="color:var(--ink-700);">${q.explanation}</div>
      </div>
    `;

    document.getElementById('btn-next-question').addEventListener('click', () => {
      this.nextQuestion();
    });
    requestAnimationFrame(() => fbContainer.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  nextQuestion() {
    if (!this.activeQuiz) return;
    this.activeQuiz.index += 1;
    this.renderCurrentQuestion();
  }

  finishQuizSession(aborted = false) {
    if (!this.activeQuiz) return;
    const quiz = this.activeQuiz;
    this.activeQuiz = null;
    document.body.classList.remove('quiz-mode');

    document.getElementById('quiz-live-wrapper').style.display = 'none';

    if (aborted && quiz.answeredCount === 0) {
      document.getElementById('arena-setup-wrapper').style.display = 'block';
      this.renderMistakeNotebook();
      return;
    }

    const totalAnswered = Math.max(1, quiz.answeredCount);
    const rawAccuracy = (quiz.correctCount / totalAnswered) * 100;
    const accuracy = Math.round(rawAccuracy * 10) / 10;
    const durationSec = Math.max(1, Math.round((Date.now() - quiz.sessionStartTime) / 1000));

    let stageResultHtml = '';
    if (quiz.stageNum && !aborted) {
      window.masteryEngine.recordStageResult(quiz.stageNum, rawAccuracy, durationSec);
      const passed = rawAccuracy >= quiz.passAccuracy;
      if (passed) {
        window.audioEngine.playStageClearSfx();
      }
      stageResultHtml = `
        <div class="scholarly-note ${passed ? '' : 'vermilion'}" style="margin:14px 0;">
          <strong>
            ${passed
              ? `第 ${quiz.stageNum} 阶修习达标（正确率 ${accuracy}%），已解锁后续阶梯。`
              : `尚未达到本阶标准（要求正确率 ≥ ${quiz.passAccuracy}%，当前为 ${accuracy}%），建议温习错题后再行尝试。`}
          </strong>
        </div>
      `;
    }

    this.updateHeaderStats();
    this.renderMistakeNotebook();

    const resWrapper = document.getElementById('quiz-result-wrapper');
    resWrapper.style.display = 'block';
    resWrapper.innerHTML = `
      <div class="quiz-active-stage">
        <h2 style="font-family:var(--font-serif);font-size:21px;text-align:center;margin-bottom:6px;">
          演练小结 · ${quiz.title}
        </h2>
        ${stageResultHtml}

        <div class="advantage-cards" style="margin-top:16px;">
          <div class="adv-card" style="text-align:center;">
            <div class="timeline-era">本局正确率</div>
            <div style="font-family:var(--font-serif);font-size:32px;font-weight:700;color:var(--vermilion);">${accuracy}%</div>
            <p style="font-size:12px;color:var(--ink-500);">${quiz.correctCount} 题答对 / 共作答 ${quiz.answeredCount} 题</p>
          </div>
          <div class="adv-card" style="text-align:center;">
            <div class="timeline-era">演练用时</div>
            <div style="font-family:var(--font-serif);font-size:32px;font-weight:700;color:var(--indigo);">${durationSec}秒</div>
            <p style="font-size:12px;color:var(--ink-500);">平均每题 ${(durationSec / totalAnswered).toFixed(1)} 秒</p>
          </div>
          <div class="adv-card" style="text-align:center;">
            <div class="timeline-era">待温习错题</div>
            <div style="font-family:var(--font-serif);font-size:32px;font-weight:700;color:var(--celadon);">${quiz.wrongItems.length}</div>
            <p style="font-size:12px;color:var(--ink-500);">${quiz.wrongItems.length === 0 ? '全部答对' : '已记入温故录'}</p>
          </div>
        </div>

        ${quiz.wrongItems.length > 0 ? `
          <div style="margin:16px 0;">
            <h4 style="font-family:var(--font-serif);font-size:15px;margin-bottom:10px;color:var(--vermilion);">本局失误复盘：</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${quiz.wrongItems.map(w => `
                <div style="background:var(--bg-canvas);border:1px solid var(--line-hair);padding:10px 14px;border-radius:6px;font-size:13px;">
                  <strong>题目「${w.prompt}」</strong>：所选 <code>${escapeHTML(w.wrongAnswer)}</code> → 正答为 <strong style="color:var(--celadon);">${w.correctAnswer}</strong>
                  <div style="color:var(--ink-700);margin-top:3px;">${w.explanation}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="btn-group" style="justify-content:center;margin-top:20px;">
          ${quiz.wrongItems.length > 0 ? `
            <button class="primary-btn" id="btn-res-retry-wrong">
              重练本局错题
            </button>
          ` : ''}
          <button class="secondary-btn" id="btn-res-back-arena">
            返回演练定制
          </button>
          <button class="outline-btn" id="btn-res-go-stages">
            前往十阶修习
          </button>
          ${quiz.source && quiz.source.tab !== 'tab-arena' ? '<button class="outline-btn" id="btn-res-return-source">返回刚才的学习处</button>' : ''}
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('btn-res-retry-wrong');
    document.getElementById('btn-res-return-source')?.addEventListener('click', () => {
      this.tabScrollPositions[quiz.source.tab] = quiz.source.scrollY;
      this.switchTab(quiz.source.tab);
    });
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        const originalQuestions = [...new Map(quiz.wrongItems.filter(w => w.question).map(w => [w.question.mode + ':' + w.question.promptMain + ':' + w.correctAnswer, w.question])).values()];
        this.launchCustomQuiz({
          title: '本局错题专项温习',
          questions: originalQuestions
        });
      });
    }

    document.getElementById('btn-res-back-arena').addEventListener('click', () => {
      resWrapper.style.display = 'none';
      document.getElementById('arena-setup-wrapper').style.display = 'block';
    });

    document.getElementById('btn-res-go-stages').addEventListener('click', () => {
      resWrapper.style.display = 'none';
      document.getElementById('arena-setup-wrapper').style.display = 'block';
      this.switchTab('tab-stages');
    });
  }

  renderMistakeNotebook() {
    const container = document.getElementById('mistake-notebook-container');
    const records = Object.values(window.masteryEngine.state.kanaRecords)
      .filter(r => r.mistakeCount > 0)
      .sort((a, b) => b.mistakeCount - a.mistakeCount);

    if (records.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:24px;color:var(--ink-500);font-size:13px;">
          温故录暂无错题记录。完成演练后，凡有失误或迟疑之假名皆会自动归集于此。
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="dakuon-grid" style="grid-template-columns:repeat(auto-fill, minmax(190px, 1fr));">
        ${records.map(r => {
          const k = this.kanaMap[r.id];
          if (!k) return '';
          return `
            <div class="mini-kana-card" data-kanaid="${k.id}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="cell-romaji">${k.romaji}</span>
                <span style="font-size:11px;color:var(--vermilion);">失误 ${r.mistakeCount} 次</span>
              </div>
              <div style="display:flex;align-items:baseline;justify-content:center;gap:10px;margin:4px 0;">
                <span style="font-family:var(--font-kaiti);font-size:28px;">${k.hiragana}</span>
                <span style="font-size:20px;color:var(--ink-500);">${k.katakana}</span>
              </div>
              <div style="font-size:11.5px;color:var(--ink-500);text-align:center;">
                草书：${k.hiraOrigin.kanji} · 偏旁：${k.kataOrigin.kanji}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.mini-kana-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.kanaid;
        window.audioEngine.speakJapanese(this.kanaMap[id].hiragana);
        this.openKanaDetailModal(id);
      });
    });
  }

  // ==================== 假名详考模态窗 ====================
  bindModalEvents() {
    const modal = document.getElementById('kana-detail-modal');
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      modal.classList.remove('open');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }

  openKanaDetailModal(kanaId) {
    const k = this.kanaMap[kanaId];
    if (!k) return;

    const rec = window.masteryEngine.recordStudyOrWrite(kanaId, false);
    this.updateHeaderStats();

    const sameOrigin = k.hiraOrigin.kanji === k.kataOrigin.kanji;
    const confusableKanas = (k.confusableWith || [])
      .map(id => this.kanaMap[id])
      .filter(Boolean);

    const modalBody = document.getElementById('kana-modal-body');
    modalBody.parentElement.scrollTop = 0;
    modalBody.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;border-bottom:1px solid var(--line-hair);padding-bottom:16px;padding-right:36px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <div style="background:var(--bg-canvas);border:1px solid var(--line-strong);border-radius:10px;padding:8px 18px;text-align:center;">
            <span style="font-family:var(--font-kaiti);font-size:42px;color:var(--ink-900);">${k.hiragana}</span>
            <span style="font-size:30px;color:var(--indigo);margin-left:8px;">${k.katakana}</span>
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
              <span class="evo-romaji-badge">读音 [${k.romaji}]</span>
              <span style="font-size:12px;color:var(--ink-500);">音标 ${k.pronunciation.ipa}</span>
              ${sameOrigin ? '<span class="brand-tag">平片同源字</span>' : ''}
            </div>
            <div style="font-size:12.5px;color:var(--ink-500);">
              当前熟练度：${rec.masteryScore}%（平假 ${rec.hiraCorrect}/${rec.hiraAttempts} · 片假 ${rec.kataCorrect}/${rec.kataAttempts} · 临池 ${rec.writeCount}次）
            </div>
          </div>
        </div>

        <div class="btn-group">
          <button class="primary-btn" id="modal-btn-speak-ja">日语发音</button>
          <button class="outline-btn" id="modal-btn-speak-slow">慢速示范</button>
          <button class="outline-btn" id="modal-btn-speak-zh">本字「${k.hiraOrigin.kanji}」读音</button>
        </div>
      </div>

      <div class="detail-grid-two">
        <div class="evo-track">
          <div class="evo-track-title">
            <span>平假名「${k.hiragana}」 · 草书演变</span>
            <strong style="color:var(--vermilion);">本字：${k.hiraOrigin.kanji} (${k.hiraOrigin.pinyin})</strong>
          </div>
          <div class="evo-stages-flow">
            <div class="evo-step-box">
              <span class="evo-step-char kaisho">${k.hiraOrigin.kanji}</span>
              <span class="evo-step-label">楷体示意</span>
            </div>
            <span class="evo-arrow">→</span>
            <div class="evo-step-box">
              <span class="evo-step-char sosho">${k.hiraOrigin.kanji}</span>
              <span class="evo-step-label">字形参照</span>
            </div>
            <span class="evo-arrow">→</span>
            <div class="evo-step-box">
              <span class="evo-step-char final-kana">${k.hiragana}</span>
              <span class="evo-step-label">平假名</span>
            </div>
          </div>
          <p class="evo-desc-text"><strong>书源解析：</strong>${k.hiraOrigin.evolution}</p>
          <p class="evo-desc-text" style="margin-top:6px;color:var(--vermilion);"><strong>记忆要旨：</strong>${k.hiraOrigin.mnemonic}</p>
          <p class="evo-desc-text" style="margin-top:6px;"><strong>笔顺（${k.writingTip.hiraStrokes}笔）：</strong>${k.writingTip.hiraGuide}</p>
        </div>

        <div class="evo-track">
          <div class="evo-track-title">
            <span>片假名「${k.katakana}」 · 楷书偏旁</span>
            <strong style="color:var(--indigo);">本字：${k.kataOrigin.kanji} (${k.kataOrigin.pinyin})</strong>
          </div>
          <div class="evo-stages-flow">
            <div class="evo-step-box">
              <span class="evo-step-char kaisho">${k.kataOrigin.kanji}</span>
              <span class="evo-step-label">楷书本字</span>
            </div>
            <span class="evo-arrow">→</span>
            <div class="evo-step-box">
              <span class="evo-step-char radical-box">${k.kataOrigin.radicalPart}</span>
              <span class="evo-step-label">截取偏旁</span>
            </div>
            <span class="evo-arrow">→</span>
            <div class="evo-step-box">
              <span class="evo-step-char final-kana" style="font-family:var(--font-sans);">${k.katakana}</span>
              <span class="evo-step-label">片假名</span>
            </div>
          </div>
          <p class="evo-desc-text"><strong>书源解析：</strong>${k.kataOrigin.evolution}</p>
          <p class="evo-desc-text" style="margin-top:6px;color:var(--indigo);"><strong>记忆要旨：</strong>${k.kataOrigin.mnemonic}</p>
          <p class="evo-desc-text" style="margin-top:6px;"><strong>笔顺（${k.writingTip.kataStrokes}笔）：</strong>${k.writingTip.kataGuide}</p>
        </div>
      </div>

      <div class="scholarly-note ${k.pronunciation.isHardForChinese ? 'vermilion' : ''}">
        <strong>汉日正音对比：</strong>${k.pronunciation.chineseApprox}
        <br/><strong>发音留意事项：</strong>${k.pronunciation.pitfall}
      </div>

      <div style="margin:14px 0;">
        <h4 style="font-family:var(--font-serif);font-size:14.5px;margin-bottom:8px;color:var(--ink-900);">同源音读词与常用语汇（点选可聆听读音）：</h4>
        <div class="yoon-grid">
          ${k.words.map(w => `
            <div class="mini-kana-card modal-word-card" data-word="${w.kana}">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <strong style="font-size:15.5px;color:var(--vermilion);">${w.kana}</strong>
                <span class="brand-tag">${w.tag}</span>
              </div>
              <div style="font-size:14.5px;font-weight:600;">${w.kanji} <small style="color:var(--ink-500);font-weight:400;">[${w.romaji}]</small></div>
              <div style="font-size:12px;color:var(--ink-700);">${w.meaning}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line-hair);">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="font-size:12px;color:var(--ink-500);">形近假名对照：</span>
          ${confusableKanas.map(ck => `
            <button class="outline-btn modal-jump-kana" data-jumpid="${ck.id}">
              ${ck.hiragana}·${ck.katakana} [${ck.romaji}]（${ck.hiraOrigin.kanji}）
            </button>
          `).join('')}
        </div>

        <div class="btn-group">
          <button class="secondary-btn" id="modal-btn-go-write">前往临池摹写</button>
          <button class="primary-btn" id="modal-btn-drill-this">本字与形近字演练</button>
        </div>
      </div>
    `;

    document.getElementById('modal-btn-speak-ja').addEventListener('click', () => {
      window.audioEngine.speakJapanese(k.hiragana, false);
    });
    document.getElementById('modal-btn-speak-slow').addEventListener('click', () => {
      window.audioEngine.speakJapanese(k.hiragana, true);
    });
    document.getElementById('modal-btn-speak-zh').addEventListener('click', () => {
      window.audioEngine.speakChinese(k.hiraOrigin.kanji);
    });

    modalBody.querySelectorAll('.modal-word-card').forEach(card => {
      card.addEventListener('click', () => {
        window.audioEngine.speakJapanese(card.dataset.word, false);
      });
    });

    modalBody.querySelectorAll('.modal-jump-kana').forEach(btn => {
      btn.addEventListener('click', () => {
        const jId = btn.dataset.jumpid;
        window.audioEngine.speakJapanese(this.kanaMap[jId].hiragana);
        this.openKanaDetailModal(jId);
      });
    });

    document.getElementById('modal-btn-go-write').addEventListener('click', () => {
      this.writingSource = { tab: this.currentTab, scrollY: window.scrollY, kanaId: k.id };
      document.getElementById('kana-detail-modal').classList.remove('open');
      const idx = window.KANA_DATA.findIndex(item => item.id === k.id);
      if (idx !== -1) this.dojoIndex = idx;
      this.switchTab('tab-writing', { forceTop: true });
      this.renderDojoState();
      const back = document.getElementById('mobile-writing-back');
      if (back) { back.hidden = false; back.onclick = () => this.returnToWritingSource(); }
    });

    document.getElementById('modal-btn-drill-this').addEventListener('click', () => {
      document.getElementById('kana-detail-modal').classList.remove('open');
      const pool = [k.id, ...(k.confusableWith || [])];
      this.launchCustomQuiz({
        title: `「${k.hiragana}·${k.katakana}」与形近字演练`,
        mode: 'mixed',
        kanaIds: pool,
        count: 15
      });
    });

    document.getElementById('kana-detail-modal').classList.add('open');
  }

  returnToWritingSource() {
    const source = this.writingSource;
    if (!source) { this.switchTab('tab-gojuon'); return; }
    this.writingSource = null;
    this.tabScrollPositions[source.tab] = source.scrollY;
    this.switchTab(source.tab);
    this.openKanaDetailModal(source.kanaId);
    const back = document.getElementById('mobile-writing-back');
    if (back) back.hidden = true;
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('kana-detail-modal');
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        modal.classList.remove('open');
        return;
      }

      if (this.currentTab === 'tab-arena' && this.activeQuiz) {
        const q = this.activeQuiz.currentQ;
        if (!q) return;

        if (e.key === ' ' && document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          window.audioEngine.speakJapanese(q.audioText, false);
          return;
        }

        if (this.activeQuiz.answeredCurrent && e.key === 'Enter') {
          e.preventDefault();
          this.nextQuestion();
          return;
        }

        if (!this.activeQuiz.answeredCurrent && q.type === 'choice') {
          if (['1', '2', '3', '4'].includes(e.key)) {
            e.preventDefault();
            this.handleChoiceSelect(parseInt(e.key, 10) - 1);
          }
        }
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new GojuonApp();
});
