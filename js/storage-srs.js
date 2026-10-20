// ============================================================================
// 《源音·五十音》—— 三维熟练度矩阵与艾宾浩斯间隔重复 (SRS) 引擎
// 严苛通关判定：拒绝“答对1次就算学会”，必须平假+片假+听音+字源多维达标才算完全掌握
// ============================================================================

const STORAGE_KEY = 'GENYIN_GOJUON_MASTERY_V1';

class MasterySRSEngine {
  constructor() {
    this.state = this.loadState();
  }

  getDefaultKanaRecord(id) {
    return {
      id,
      studied: false,
      writeCount: 0,
      hiraCorrect: 0,
      hiraAttempts: 0,
      kataCorrect: 0,
      kataAttempts: 0,
      originCorrect: 0,
      originAttempts: 0,
      audioCorrect: 0,
      audioAttempts: 0,
      streak: 0,
      mistakeCount: 0,
      lastMistakeMode: null,
      avgReactionMs: 0,
      masteryScore: 0, // 0 ~ 100
      srsLevel: 0,     // 0 ~ 6
      nextReviewAt: 0,
      lastPracticedAt: 0
    };
  }

  getDefaultState() {
    const kanaRecords = {};
    if (window.KANA_DATA) {
      window.KANA_DATA.forEach(k => {
        kanaRecords[k.id] = this.getDefaultKanaRecord(k.id);
      });
    }

    const stages = {};
    if (window.CURRICULUM_STAGES) {
      window.CURRICULUM_STAGES.forEach(s => {
        stages[s.stage] = {
          stage: s.stage,
          unlocked: s.stage === 1, // 默认解锁第一关，同时允许自由挑战任意关
          cleared: false,
          stars: 0,
          bestAccuracy: 0,
          bestTimeSec: 0,
          attempts: 0
        };
      });
    }

    return {
      version: 1,
      createdAt: Date.now(),
      totalQuestions: 0,
      totalCorrect: 0,
      totalWriteCount: 0,
      maxCombo: 0,
      kanaRecords,
      stages,
      recentMistakes: [] // [{ kanaId, mode, wrongAnswer, correctAnswer, timestamp }]
    };
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.getDefaultState();
      const parsed = JSON.parse(raw);
      return this.validateState(parsed, false);
    } catch (e) {
      // 损坏的旧记录保留一份，避免下次正常保存覆盖唯一的恢复材料。
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw && !localStorage.getItem(`${STORAGE_KEY}_RECOVERY`)) {
          localStorage.setItem(`${STORAGE_KEY}_RECOVERY`, raw);
        }
      } catch (_) { /* 只读或空间不足时仍允许浏览课程。 */ }
      this.storageWarning = '旧学习记录格式异常，已保留恢复副本。';
      return this.getDefaultState();
    }
  }

  // 导入与旧版迁移共用同一份白名单，禁止不可信属性进入应用状态。
  validateState(source, strict = true) {
    const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const fail = message => { throw new Error(`进度文件无效：${message}`); };
    if (!isObject(source)) fail('应为 JSON 对象');
    const scanKeys = value => {
      if (!value || typeof value !== 'object') return;
      for (const key of Object.keys(value)) {
        if (['__proto__', 'prototype', 'constructor'].includes(key)) fail('包含不允许的字段');
        scanKeys(value[key]);
      }
    };
    scanKeys(source);
    if (source.version !== 1) fail('不支持的版本');
    if (!isObject(source.kanaRecords) || !isObject(source.stages)) fail('缺少假名或关卡记录');
    if (strict && !Array.isArray(source.recentMistakes)) fail('缺少错题记录');
    const next = this.getDefaultState();
    const numeric = (value, fallback, label, maximum = Number.MAX_SAFE_INTEGER, integer = true) => {
      if (value === undefined && !strict) return fallback;
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > maximum || (integer && !Number.isInteger(value))) {
        fail(`${label}不是有效数值`);
      }
      return value;
    };
    for (const field of ['createdAt', 'totalQuestions', 'totalCorrect', 'totalWriteCount', 'maxCombo']) {
      next[field] = numeric(source[field], next[field], field);
    }
    if (next.totalCorrect > next.totalQuestions) fail('正确题数超过总题数');
    const counterFields = ['writeCount', 'hiraCorrect', 'hiraAttempts', 'kataCorrect', 'kataAttempts', 'originCorrect', 'originAttempts', 'audioCorrect', 'audioAttempts', 'streak', 'mistakeCount', 'avgReactionMs', 'lastPracticedAt', 'nextReviewAt'];
    for (const [id, record] of Object.entries(source.kanaRecords)) {
      if (!Object.prototype.hasOwnProperty.call(next.kanaRecords, id)) fail(`未知假名 ${id}`);
      if (!isObject(record)) fail(`${id}记录格式不正确`);
      const normalized = this.getDefaultKanaRecord(id);
      if (record.id !== undefined && record.id !== id) fail('假名编号不一致');
      if (strict && typeof record.studied !== 'boolean') fail(`${id}缺少学习状态`);
      if (record.studied !== undefined && typeof record.studied !== 'boolean') fail(`${id}学习状态不正确`);
      normalized.studied = record.studied === true;
      for (const field of counterFields) normalized[field] = numeric(record[field], normalized[field], `${id}.${field}`);
      normalized.srsLevel = numeric(record.srsLevel, 0, `${id}.srsLevel`, 6);
      normalized.masteryScore = numeric(record.masteryScore, 0, `${id}.masteryScore`, 100);
      if (record.lastMistakeMode != null && (typeof record.lastMistakeMode !== 'string' || record.lastMistakeMode.length > 200)) fail('错题类型格式不正确');
      normalized.lastMistakeMode = record.lastMistakeMode || null;
      for (const dimension of ['hira', 'kata', 'origin', 'audio']) {
        if (normalized[`${dimension}Correct`] > normalized[`${dimension}Attempts`]) fail(`${id}正确次数超过作答次数`);
      }
      next.kanaRecords[id] = normalized;
    }
    for (const [stageId, record] of Object.entries(source.stages)) {
      if (!Object.prototype.hasOwnProperty.call(next.stages, stageId) || !isObject(record)) fail('未知关卡或关卡格式不正确');
      const normalized = { ...next.stages[stageId] };
      if (record.stage !== undefined && record.stage !== normalized.stage) fail('关卡编号不一致');
      for (const field of ['unlocked', 'cleared']) {
        if (record[field] === undefined && !strict) continue;
        if (typeof record[field] !== 'boolean') fail('关卡状态不正确');
        normalized[field] = record[field];
      }
      normalized.stars = numeric(record.stars, 0, 'stars', 3);
      normalized.bestAccuracy = numeric(record.bestAccuracy, 0, 'bestAccuracy', 100, false);
      normalized.bestTimeSec = numeric(record.bestTimeSec, 0, 'bestTimeSec');
      normalized.attempts = numeric(record.attempts, 0, 'attempts');
      next.stages[stageId] = normalized;
    }
    if (strict && (Object.keys(source.kanaRecords).length !== Object.keys(next.kanaRecords).length || Object.keys(source.stages).length !== Object.keys(next.stages).length)) fail('学习记录不完整');
    next.recentMistakes = (source.recentMistakes || []).map(item => {
      if (!isObject(item) || !Object.prototype.hasOwnProperty.call(next.kanaRecords, item.kanaId)) fail('错题编号不正确');
      const result = { kanaId: item.kanaId };
      for (const field of ['modeName', 'wrongAnswer', 'correctAnswer']) {
        const value = item[field] === undefined && !strict ? '' : item[field];
        if (typeof value !== 'string' || value.length > 2000) fail('错题内容格式不正确');
        result[field] = value;
      }
      result.timestamp = numeric(item.timestamp, 0, 'timestamp');
      return result;
    }).slice(0, 40);
    return next;
  }

  exportProgress() {
    return JSON.stringify({
      format: 'genyin-progress',
      version: 1,
      exportedAt: new Date().toISOString(),
      state: this.state
    }, null, 2);
  }

  parseProgress(payload) {
    if (typeof payload === 'string' && payload.length > 2 * 1024 * 1024) throw new Error('进度文件过大');
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (parsed && parsed.format !== undefined && parsed.format !== 'genyin-progress') throw new Error('不是源音五十音进度文件');
    if (parsed && parsed.format === 'genyin-progress' && parsed.version !== 1) throw new Error('不支持此版本的进度文件');
    return this.validateState(parsed && parsed.state ? parsed.state : parsed, true);
  }

  importProgress(payload) {
    const next = this.parseProgress(payload);
    // 先成功持久化再替换内存；文件无效或保存失败均保留当前进度。
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this.state = next;
    this.storageWarning = null;
    return this.getGlobalSummary();
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.storageWarning = null;
      return true;
    } catch (e) {
      console.warn('Failed to save progress to localStorage:', e);
      this.storageWarning = '学习记录未能保存，请先导出备份并检查设备存储空间。';
      if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('genyin-storage-error', { detail: { message: this.storageWarning } }));
      }
      return false;
    }
  }

  // 标记某假名已精读学习或手写练习
  recordStudyOrWrite(kanaId, isWrite = false) {
    const rec = this.state.kanaRecords[kanaId] || this.getDefaultKanaRecord(kanaId);
    rec.studied = true;
    if (isWrite) {
      rec.writeCount += 1;
      this.state.totalWriteCount += 1;
    }
    rec.lastPracticedAt = Date.now();
    this.recalculateKanaMastery(rec);
    this.state.kanaRecords[kanaId] = rec;
    this.saveState();
    return rec;
  }

  // 记录一次答题结果并更新 SRS 间隔与三维掌握度
  // dimension: 'hira' | 'kata' | 'origin' | 'audio'
  recordQuizAnswer({ kanaId, dimension = 'hira', isCorrect, reactionMs = 2000, modeName = '', wrongAnswer = '', correctAnswer = '' }) {
    this.state.totalQuestions += 1;
    if (isCorrect) this.state.totalCorrect += 1;

    if (!kanaId || !this.state.kanaRecords[kanaId]) {
      this.saveState();
      return null;
    }

    const rec = this.state.kanaRecords[kanaId];
    rec.studied = true;
    rec.lastPracticedAt = Date.now();

    // 更新对应维度统计
    if (dimension === 'kata') {
      rec.kataAttempts += 1;
      if (isCorrect) rec.kataCorrect += 1;
    } else if (dimension === 'origin') {
      rec.originAttempts += 1;
      if (isCorrect) rec.originCorrect += 1;
    } else if (dimension === 'audio') {
      rec.audioAttempts += 1;
      if (isCorrect) rec.audioCorrect += 1;
    } else {
      rec.hiraAttempts += 1;
      if (isCorrect) rec.hiraCorrect += 1;
    }

    // 更新平均反应速度
    if (rec.avgReactionMs === 0) {
      rec.avgReactionMs = reactionMs;
    } else {
      rec.avgReactionMs = Math.round(rec.avgReactionMs * 0.7 + reactionMs * 0.3);
    }

    // SRS 艾宾浩斯间隔计算 (分钟级别 -> 小时 -> 天)
    const srsIntervalsMinutes = [2, 10, 60, 360, 1440, 4320, 10080];
    if (isCorrect) {
      rec.streak += 1;
      if (reactionMs <= 3000) {
        rec.srsLevel = Math.min(6, rec.srsLevel + 1);
      }
      const intervalMs = srsIntervalsMinutes[rec.srsLevel] * 60 * 1000;
      rec.nextReviewAt = Date.now() + intervalMs;
    } else {
      rec.streak = 0;
      rec.mistakeCount += 1;
      rec.lastMistakeMode = String(modeName || '').slice(0, 200);
      rec.srsLevel = Math.max(0, rec.srsLevel - 2);
      rec.nextReviewAt = Date.now() + 60 * 1000; // 1分钟后立即进入待复习队列

      // 记入错题本（保留最新 40 条答错历史）
      this.state.recentMistakes.unshift({
        kanaId,
        modeName: String(modeName || '').slice(0, 200),
        wrongAnswer: String(wrongAnswer || '').slice(0, 2000),
        correctAnswer: String(correctAnswer || '').slice(0, 2000),
        timestamp: Date.now()
      });
      if (this.state.recentMistakes.length > 40) {
        this.state.recentMistakes = this.state.recentMistakes.slice(0, 40);
      }
    }

    this.recalculateKanaMastery(rec);
    this.state.kanaRecords[kanaId] = rec;
    this.saveState();
    return rec;
  }

  // 核心算法：计算单个假名的真实综合掌握度 (0 ~ 100%)
  // 保证必须有一定训练量且平假名+片假名双双过关才能拿到 90~100%
  recalculateKanaMastery(rec) {
    const totalAttempts = rec.hiraAttempts + rec.kataAttempts + rec.originAttempts + rec.audioAttempts;
    const totalCorrect = rec.hiraCorrect + rec.kataCorrect + rec.originCorrect + rec.audioCorrect;

    if (totalAttempts === 0) {
      rec.masteryScore = rec.studied ? (rec.writeCount > 0 ? 15 : 8) : 0;
      return;
    }

    // 1. 平假名维度得分 (最高 40 分，需至少答对 3 次拿满)
    const hiraAcc = rec.hiraAttempts > 0 ? rec.hiraCorrect / rec.hiraAttempts : 0;
    const hiraVolumeFactor = Math.min(1, rec.hiraCorrect / 3);
    const hiraScore = 40 * hiraAcc * hiraVolumeFactor;

    // 2. 片假名维度得分 (最高 35 分，需至少答对 3 次拿满)
    const kataAcc = rec.kataAttempts > 0 ? rec.kataCorrect / rec.kataAttempts : 0;
    const kataVolumeFactor = Math.min(1, rec.kataCorrect / 3);
    const kataScore = 35 * kataAcc * kataVolumeFactor;

    // 3. 溯源/听音/书写综合与连胜得分 (最高 25 分)
    const extraCorrect = rec.originCorrect + rec.audioCorrect + Math.min(2, rec.writeCount);
    const extraFactor = Math.min(1, (extraCorrect + rec.streak) / 5);
    const overallAcc = totalCorrect / totalAttempts;
    const extraScore = 25 * overallAcc * extraFactor;

    let score = Math.round(hiraScore + kataScore + extraScore);
    // 如果最近刚答错（streak === 0 且 mistakeCount > 0），最高不超过 75%，强制要求重测巩固
    if (rec.streak === 0 && rec.mistakeCount > 0) {
      score = Math.min(score, 72);
    }
    // 综合达标需要实际听辨与字源作答证据；平片连对不能替代这两个维度。
    if (rec.audioCorrect < 1 || rec.originCorrect < 1) {
      score = Math.min(score, 84);
    }
    rec.masteryScore = Math.max(5, Math.min(100, score));
  }

  updateMaxCombo(combo) {
    if (combo > this.state.maxCombo) {
      this.state.maxCombo = combo;
      this.saveState();
    }
  }

  // 记录闯关结果
  recordStageResult(stageNum, accuracy, timeSec) {
    const stageConf = window.CURRICULUM_STAGES.find(s => s.stage === stageNum);
    if (!stageConf) return;

    const st = this.state.stages[stageNum] || {
      stage: stageNum, unlocked: true, cleared: false, stars: 0, bestAccuracy: 0, bestTimeSec: 0, attempts: 0
    };
    st.attempts += 1;
    if (accuracy > st.bestAccuracy) {
      st.bestAccuracy = accuracy;
    }
    if (accuracy >= stageConf.passAccuracy && (st.bestTimeSec === 0 || timeSec < st.bestTimeSec)) {
      st.bestTimeSec = timeSec;
    }

    if (accuracy >= stageConf.passAccuracy) {
      st.cleared = true;
      const stars = accuracy >= 98 ? 3 : (accuracy >= 94 ? 2 : 1);
      st.stars = Math.max(st.stars, stars);
      // 解锁下一关
      if (this.state.stages[stageNum + 1]) {
        this.state.stages[stageNum + 1].unlocked = true;
      }
    }

    this.state.stages[stageNum] = st;
    this.saveState();
    return st;
  }

  // 获取薄弱/错题假名列表（用于“错题歼灭战”与“艾宾浩斯智能复习”）
  getWeakAndDueKanaIds(limit = 15) {
    const now = Date.now();
    const all = Object.values(this.state.kanaRecords);

    // 优先级1：有错题且连胜未恢复 (< 3)
    const mistakeOnes = all
      .filter(r => r.mistakeCount > 0 && r.streak < 3)
      .sort((a, b) => b.mistakeCount - a.mistakeCount);

    // 优先级2：已学习但到了艾宾浩斯复习时间，或熟练度 < 80%
    const dueOnes = all
      .filter(r => r.studied && !mistakeOnes.includes(r) && (r.nextReviewAt <= now || r.masteryScore < 80))
      .sort((a, b) => a.masteryScore - b.masteryScore);

    const combined = [...mistakeOnes, ...dueOnes].map(r => r.id);
    if (combined.length >= 6) {
      return combined.slice(0, limit);
    }

    // 如果用户还没有太多错题，自动补充掌握度最低的假名
    const lowest = all
      .filter(r => !combined.includes(r.id))
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .map(r => r.id);

    return [...combined, ...lowest].slice(0, limit);
  }

  // 获取全局统计概览
  getGlobalSummary() {
    const records = Object.values(this.state.kanaRecords);
    // 熟练度是统计的派生值。旧版升级保留所有作答、书写与关卡数据，
    // 仅在读取概览时按现行规则重算，避免旧版虚高分继续显示为综合达标。
    records.forEach(record => this.recalculateKanaMastery(record));
    const masteredCount = records.filter(r => r.masteryScore >= 85).length;
    const learningCount = records.filter(r => r.masteryScore > 0 && r.masteryScore < 85).length;
    const avgMastery = records.length ? Math.round(records.reduce((acc, r) => acc + r.masteryScore, 0) / records.length) : 0;
    const clearedStages = Object.values(this.state.stages).filter(s => s.cleared).length;
    const weakCount = records.filter(r => r.mistakeCount > 0 && r.streak < 3).length;
    const overallAccuracy = this.state.totalQuestions > 0
      ? Math.round((this.state.totalCorrect / this.state.totalQuestions) * 100)
      : 0;

    return {
      masteredCount,
      learningCount,
      totalKana: records.length,
      avgMastery,
      clearedStages,
      totalStages: window.CURRICULUM_STAGES.length,
      weakCount,
      totalQuestions: this.state.totalQuestions,
      totalCorrect: this.state.totalCorrect,
      overallAccuracy,
      maxCombo: this.state.maxCombo,
      totalWriteCount: this.state.totalWriteCount
    };
  }

  resetAll() {
    this.state = this.getDefaultState();
    this.saveState();
  }
}

window.masteryEngine = new MasterySRSEngine();
