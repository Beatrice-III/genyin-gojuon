/* Platform conveniences, independent of the original learning engine. */
(() => {
  const $ = id => document.getElementById(id);
  let toastTimer;
  window.showToast = message => {
    $('app-toast').textContent = message;
    $('app-toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('app-toast').classList.remove('visible'), 3500);
  };
  let previousFocus;
  const settings = $('settings-modal');
  function openSettings() {
    previousFocus = document.activeElement;
    settings.classList.add('open');
    $('btn-export-before-import').hidden = !localStorage.getItem('GENYIN_BEFORE_IMPORT');
    $('btn-close-settings').focus();
  }
  function closeSettings() { settings.classList.remove('open'); previousFocus?.focus(); }
  $('btn-open-settings').addEventListener('click', openSettings);
  $('btn-close-settings').addEventListener('click', closeSettings);
  settings.addEventListener('click', e => { if (e.target === settings) closeSettings(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSettings();
    if (e.key !== 'Tab') return;
    const modal = [...document.querySelectorAll('.modal-backdrop.open')].pop();
    if (!modal) return;
    const focusable = [...modal.querySelectorAll('button,input,[tabindex="0"]')].filter(el => el.offsetParent !== null);
    if (!focusable.length) return;
    if (e.shiftKey && document.activeElement === focusable[0]) { e.preventDefault(); focusable.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === focusable.at(-1)) { e.preventDefault(); focusable[0].focus(); }
  });
  new MutationObserver(() => {
    document.body.style.overflow = document.querySelector('.modal-backdrop.open') ? 'hidden' : '';
  }).observe(document.body, { subtree:true, attributes:true, attributeFilter:['class'] });
  function downloadProgress(json) {
    if (window.AndroidApp?.exportProgress) { window.AndroidApp.exportProgress(json); return; }
    const url = URL.createObjectURL(new Blob([json], {type:'application/json'}));
    const a = document.createElement('a');
    a.href = url; a.download = `源音学习记录-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  $('btn-export-progress').addEventListener('click', () => {
    try { downloadProgress(window.masteryEngine.exportProgress()); } catch (_) { window.showToast('导出失败，请重试。'); }
  });
  $('btn-export-before-import').addEventListener('click', () => {
    const json = localStorage.getItem('GENYIN_BEFORE_IMPORT'); if (json) downloadProgress(json);
  });
  let pendingImport = null;
  window.onAndroidProgressImport = raw => {
    openSettings();
    try {
      if (typeof raw !== 'string' || raw.length > 2000000) throw new Error('文件过大或格式不正确');
      const state = window.masteryEngine.parseProgress(raw);
      pendingImport = raw;
      $('import-summary').textContent = `这份记录包含 ${state.totalQuestions} 次作答。导入后会替换当前进度，当前记录将先备份在本机。`;
      $('import-preview').hidden = false;
      $('import-preview').scrollIntoView({block:'nearest'});
    } catch (e) { pendingImport = null; window.showToast(e.message || '无法读取这份记录。'); }
  };
  $('btn-import-progress').addEventListener('click', () => {
    if (window.app?.activeQuiz) { window.showToast('请先结束当前演练，再导入记录。'); return; }
    if (window.AndroidApp?.importProgress) window.AndroidApp.importProgress();
    else $('progress-file').click();
  });
  $('progress-file').addEventListener('change', async e => {
    const f = e.target.files[0]; if (f) window.onAndroidProgressImport(await f.text()); e.target.value = '';
  });
  $('btn-cancel-import').addEventListener('click', () => { pendingImport=null; $('import-preview').hidden=true; });
  $('btn-confirm-import').addEventListener('click', () => {
    if (!pendingImport) return;
    const previousBackup = localStorage.getItem('GENYIN_BEFORE_IMPORT');
    try {
      window.masteryEngine.parseProgress(pendingImport);
      const backup = window.masteryEngine.exportProgress();
      localStorage.setItem('GENYIN_BEFORE_IMPORT', backup);
      window.masteryEngine.importProgress(pendingImport);
      pendingImport=null; $('import-preview').hidden=true; $('btn-export-before-import').hidden=false;
      window.app.updateHeaderStats(); window.app.renderSeionMatrix(); window.app.renderStagesGrid(); window.app.renderMistakeNotebook(); window.app.renderDojoState();
      window.showToast('学习记录已恢复，原进度已备份。');
    } catch(e) {
      try { if (previousBackup === null) localStorage.removeItem('GENYIN_BEFORE_IMPORT'); else localStorage.setItem('GENYIN_BEFORE_IMPORT', previousBackup); } catch (_) {}
      window.showToast(`未导入：${e.message}`);
    }
  });
  window.addEventListener('genyin-storage-error', e => window.showToast(e.detail.message));
  window.onAndroidNativeEvent = event => { if (event?.message && event.type !== 'backup-exported') window.showToast(event.message); };
  window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('GENYIN_THEME') === 'dark') {
      document.body.classList.add('dark-mode');
      $('btn-toggle-theme').innerHTML='<span>切换日间模式</span><span>◐</span>';
      try { window.AndroidApp?.setTheme?.(true); } catch (_) {}
    }
    const originalUpdate = window.app.updateHeaderStats.bind(window.app);
    window.app.updateHeaderStats = () => {
      originalUpdate();
      const next = window.CURRICULUM_STAGES.find(s => !window.masteryEngine.state.stages[s.stage]?.cleared) || window.CURRICULUM_STAGES.at(-1);
      $('next-stage-label').textContent = `第 ${next.stage} 阶 · ${next.title.replace(/^第.*?[·：]\s*/, '')}`;
    };
    window.app.updateHeaderStats();
    document.querySelectorAll('.mode-select-card').forEach(card => {
      card.tabIndex=0;card.setAttribute('role','button');
      card.addEventListener('keydown', e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});
    });
    if (document.fonts?.ready) document.fonts.ready.then(() => window.app.calligraphyPad?.render());
  });
})();
