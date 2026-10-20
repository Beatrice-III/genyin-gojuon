// ============================================================================
// 《源音·五十音》—— 八式题型与形近干扰项生成引擎
// ============================================================================

class QuizGenerator {
  constructor() {
    this.kanaMap = Object.create(null);
    window.KANA_DATA.forEach(k => {
      this.kanaMap[k.id] = k;
    });
  }

  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // 从候选池中优先抽取视觉或听觉相近的假名作为干扰项
  getSmartDistractors(targetKana, poolIds, count = 3) {
    const confusableIds = (targetKana.confusableWith || []).filter(id => id !== targetKana.id);
    const sameRowOrColIds = window.KANA_DATA
      .filter(k => k.id !== targetKana.id && (k.row === targetKana.row || k.col === targetKana.col))
      .map(k => k.id);

    const priority1 = this.shuffle(confusableIds);
    const priority2 = this.shuffle(sameRowOrColIds.filter(id => !priority1.includes(id)));
    const priority3 = this.shuffle(
      (poolIds || window.KANA_DATA.map(k => k.id)).filter(
        id => id !== targetKana.id && !priority1.includes(id) && !priority2.includes(id)
      )
    );

    const combinedIds = [...priority1, ...priority2, ...priority3].slice(0, count);
    return combinedIds.map(id => this.kanaMap[id]).filter(Boolean);
  }

  generateSingleQuestion(mode, targetKanaId, poolIds, options = {}) {
    const question = this.buildSingleQuestion(mode, targetKanaId, poolIds, options);
    // 演练先检索记忆，作答后再显示字源详解；旧版副标签直接印出了题干字形/答案。
    if (question.type === 'choice' && question.mode !== 'word-combat') {
      question.choices = question.choices.map(choice => ({ ...choice, subLabel: '' }));
    }
    if (question.type === 'typing') {
      question.acceptedAnswers = [...new Set([question.correctAnswer, ...(question.acceptedAnswers || [])])];
    }
    return question;
  }

  normalizeAnswer(answer) {
    return String(answer || '').normalize('NFKC').toLowerCase().trim().replace(/[’‘]/g, "'").replace(/\s+/g, '');
  }

  isTypingAnswerCorrect(question, answer) {
    const normalized = this.normalizeAnswer(answer);
    return !!normalized && (question.acceptedAnswers || [question.correctAnswer]).some(value => this.normalizeAnswer(value) === normalized);
  }

  buildSingleQuestion(mode, targetKanaId, poolIds, options = {}) {
    const kana = this.kanaMap[targetKanaId] || window.KANA_DATA[0];
    const distractors = this.getSmartDistractors(kana, poolIds, 3);
    const allChoicesKana = this.shuffle([kana, ...distractors]);

    let actualMode = mode;
    if (mode === 'mixed') {
      if (options.onlyKatakana) {
        const kataModes = ['kata-romaji', 'hira-kata-cross', 'origin-match', 'audio-dictation', 'typing-blitz', 'confusable-sniper'];
        actualMode = kataModes[Math.floor(Math.random() * kataModes.length)];
      } else if (options.includeVocabAndExtensions && Math.random() < 0.28) {
        actualMode = 'word-combat';
      } else {
        const stdModes = [
          'origin-match',
          'hira-romaji',
          'kata-romaji',
          'hira-kata-cross',
          'audio-dictation',
          'confusable-sniper',
          'typing-blitz'
        ];
        actualMode = stdModes[Math.floor(Math.random() * stdModes.length)];
      }
    }

    const baseExplanation = this.buildExplanation(kana);

    switch (actualMode) {
      case 'origin-match': {
        const subType = options.onlyKatakana ? 1 : Math.floor(Math.random() * 3);
        if (subType === 0) {
          return {
            type: 'choice',
            mode: 'origin-match',
            dimension: 'origin',
            kanaId: kana.id,
            audioText: kana.hiragana,
            tag: '书源考辨 · 草书化平假',
            promptTitle: `万叶本字「${kana.hiraOrigin.kanji}」(${kana.hiraOrigin.pinyin}) 的草书演变为哪一个平假名？`,
            promptMain: kana.hiraOrigin.kanji,
            promptSub: `要旨：${kana.hiraOrigin.mnemonic}`,
            choices: allChoicesKana.map(k => ({
              label: k.hiragana,
              subLabel: `源于「${k.hiraOrigin.kanji}」`,
              value: k.hiragana,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.hiragana,
            explanation: baseExplanation
          };
        } else if (subType === 1) {
          return {
            type: 'choice',
            mode: 'origin-match',
            dimension: 'origin',
            kanaId: kana.id,
            audioText: kana.katakana,
            tag: '书源考辨 · 偏旁化片假',
            promptTitle: `截取汉字「${kana.kataOrigin.kanji}」的【${kana.kataOrigin.radicalPart}】演变为哪一个片假名？`,
            promptMain: kana.kataOrigin.kanji,
            promptSub: `提取部位：${kana.kataOrigin.radicalPart}`,
            choices: allChoicesKana.map(k => ({
              label: k.katakana,
              subLabel: `源于「${k.kataOrigin.kanji}」`,
              value: k.katakana,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.katakana,
            explanation: baseExplanation
          };
        } else {
          const useKata = Math.random() < 0.45;
          const charShow = useKata ? kana.katakana : kana.hiragana;
          const originObj = useKata ? kana.kataOrigin : kana.hiraOrigin;
          return {
            type: 'choice',
            mode: 'origin-match',
            dimension: 'origin',
            kanaId: kana.id,
            audioText: kana.hiragana,
            tag: '书源考辨 · 汉字本源',
            promptTitle: `${useKata ? '片假名' : '平假名'}「${charShow}」[${kana.romaji}] 源于哪一个万叶汉字？`,
            promptMain: charShow,
            promptSub: `读音：[${kana.romaji}] · 审视其笔画结体与声韵对应`,
            choices: allChoicesKana.map(k => {
              const o = useKata ? k.kataOrigin : k.hiraOrigin;
              return {
                label: `${o.kanji} (${o.pinyin})`,
                subLabel: `衍生「${useKata ? k.katakana : k.hiragana}」[${k.romaji}]`,
                value: o.kanji,
                isCorrect: k.id === kana.id
              };
            }),
            correctAnswer: `${originObj.kanji} (${originObj.pinyin})`,
            explanation: baseExplanation
          };
        }
      }

      case 'hira-romaji': {
        const reverse = Math.random() < 0.45;
        if (!reverse) {
          return {
            type: 'choice',
            mode: 'hira-romaji',
            dimension: 'hira',
            kanaId: kana.id,
            audioText: kana.hiragana,
            tag: '平假名认读',
            promptTitle: '请选择该平假名的罗马字读音：',
            promptMain: kana.hiragana,
            promptSub: `书源提示：汉字「${kana.hiraOrigin.kanji}」之草书`,
            choices: allChoicesKana.map(k => ({
              label: k.romaji,
              subLabel: k.hiragana,
              value: k.romaji,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.romaji,
            explanation: baseExplanation
          };
        } else {
          return {
            type: 'choice',
            mode: 'hira-romaji',
            dimension: 'hira',
            kanaId: kana.id,
            audioText: kana.hiragana,
            tag: '读音识平假',
            promptTitle: `读音 [${kana.romaji}] 对应的平假名是：`,
            promptMain: kana.romaji,
            promptSub: '留意排除形近干扰项',
            choices: allChoicesKana.map(k => ({
              label: k.hiragana,
              subLabel: `[${k.romaji}] ← ${k.hiraOrigin.kanji}`,
              value: k.hiragana,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.hiragana,
            explanation: baseExplanation
          };
        }
      }

      case 'kata-romaji': {
        const reverse = Math.random() < 0.45;
        if (!reverse) {
          return {
            type: 'choice',
            mode: 'kata-romaji',
            dimension: 'kata',
            kanaId: kana.id,
            audioText: kana.katakana,
            tag: '片假名认读',
            promptTitle: '请选择该片假名的罗马字读音：',
            promptMain: kana.katakana,
            promptSub: `书源提示：取自「${kana.kataOrigin.kanji}」之 ${kana.kataOrigin.radicalPart}`,
            choices: allChoicesKana.map(k => ({
              label: k.romaji,
              subLabel: k.katakana,
              value: k.romaji,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.romaji,
            explanation: baseExplanation
          };
        } else {
          return {
            type: 'choice',
            mode: 'kata-romaji',
            dimension: 'kata',
            kanaId: kana.id,
            audioText: kana.katakana,
            tag: '读音识片假',
            promptTitle: `读音 [${kana.romaji}] 对应的片假名是：`,
            promptMain: kana.romaji,
            promptSub: `书源提示：汉字「${kana.kataOrigin.kanji}」(${kana.kataOrigin.radicalPart})`,
            choices: allChoicesKana.map(k => ({
              label: k.katakana,
              subLabel: `[${k.romaji}] ← ${k.kataOrigin.kanji}`,
              value: k.katakana,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.katakana,
            explanation: baseExplanation
          };
        }
      }

      case 'hira-kata-cross': {
        const hiraToKata = options.onlyKatakana || Math.random() < 0.55;
        const sameOrigin = kana.hiraOrigin.kanji === kana.kataOrigin.kanji;
        if (hiraToKata) {
          return {
            type: 'choice',
            mode: 'hira-kata-cross',
            dimension: 'kata',
            kanaId: kana.id,
            audioText: kana.hiragana,
            tag: '平片假名对照',
            promptTitle: `平假名「${kana.hiragana}」对应的片假名是：`,
            promptMain: kana.hiragana,
            promptSub: sameOrigin
              ? `平片同源：两者皆源于汉字「${kana.hiraOrigin.kanji}」`
              : `平假源于「${kana.hiraOrigin.kanji}」 · 片假源于「${kana.kataOrigin.kanji}」`,
            choices: allChoicesKana.map(k => ({
              label: k.katakana,
              subLabel: `对应平假「${k.hiragana}」[${k.romaji}]`,
              value: k.katakana,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.katakana,
            explanation: baseExplanation
          };
        } else {
          return {
            type: 'choice',
            mode: 'hira-kata-cross',
            dimension: 'hira',
            kanaId: kana.id,
            audioText: kana.katakana,
            tag: '片平假名对照',
            promptTitle: `片假名「${kana.katakana}」对应的平假名是：`,
            promptMain: kana.katakana,
            promptSub: sameOrigin
              ? `平片同源：两者皆源于汉字「${kana.kataOrigin.kanji}」`
              : `片假源于「${kana.kataOrigin.kanji}」 · 平假源于「${kana.hiraOrigin.kanji}」`,
            choices: allChoicesKana.map(k => ({
              label: k.hiragana,
              subLabel: `对应片假「${k.katakana}」[${k.romaji}]`,
              value: k.hiragana,
              isCorrect: k.id === kana.id
            })),
            correctAnswer: kana.hiragana,
            explanation: baseExplanation
          };
        }
      }

      case 'audio-dictation': {
        if (window.audioEngine && !window.audioEngine.canSpeakJapanese(kana.hiragana)) {
          const fallback = this.generateSingleQuestion(options.onlyKatakana ? 'kata-romaji' : 'hira-romaji', kana.id, poolIds, options);
          fallback.audioUnavailable = true;
          fallback.tag = '发音未就绪 · 认读练习';
          return fallback;
        }
        const testKata = options.onlyKatakana || Math.random() < 0.45;
        // 现代标准日语的「お / を」同音，听辨时不能同时作为互斥选项。
        const homophoneId = kana.id === 'o' ? 'wo' : kana.id === 'wo' ? 'o' : null;
        const listeningChoices = allChoicesKana.filter(k => k.id !== homophoneId);
        if (listeningChoices.length < 4) {
          const extra = this.shuffle(window.KANA_DATA.filter(k => k.id !== homophoneId && !listeningChoices.some(choice => choice.id === k.id)));
          listeningChoices.push(...extra.slice(0, 4 - listeningChoices.length));
        }
        return {
          type: 'choice',
          mode: 'audio-dictation',
          dimension: 'audio',
          kanaId: kana.id,
          audioText: kana.hiragana,
          autoPlayAudio: true,
          tag: '听音辨字',
          promptTitle: `请聆听发音，选择对应的${testKata ? '片假名' : '平假名'}：`,
          promptMain: '聆听发音',
          promptSub: '可点击下方按钮重播标准语速或慢速示范',
          choices: this.shuffle(listeningChoices).map(k => ({
            label: testKata ? k.katakana : k.hiragana,
            subLabel: `[${k.romaji}] · 源字「${testKata ? k.kataOrigin.kanji : k.hiraOrigin.kanji}」`,
            value: testKata ? k.katakana : k.hiragana,
            isCorrect: k.id === kana.id
          })),
          correctAnswer: testKata ? kana.katakana : kana.hiragana,
          explanation: baseExplanation
        };
      }

      case 'confusable-sniper': {
        const useKata = options.onlyKatakana || (['shi', 'tsu', 'so', 'n', 'u', 'wa', 'fu', 'ra', 'ku', 'ta', 'ke', 'ko', 'yu', 'yo'].includes(kana.id) && Math.random() < 0.6);
        const charShow = useKata ? kana.katakana : kana.hiragana;
        return {
          type: 'choice',
          mode: 'confusable-sniper',
          dimension: useKata ? 'kata' : 'hira',
          kanaId: kana.id,
          audioText: kana.hiragana,
          tag: '字形辨微',
          promptTitle: `审视笔画细节与本字结构，辨识「${charShow}」的读音与书源：`,
          promptMain: charShow,
          promptSub: useKata
            ? `观察点位排列与撇提走向（书源提示：${kana.kataOrigin.radicalPart}）`
            : `观察横画数目与收笔形态（书源提示：草书「${kana.hiraOrigin.kanji}」）`,
          choices: allChoicesKana.map(k => ({
            label: `${k.romaji} （${useKata ? k.kataOrigin.kanji : k.hiraOrigin.kanji}）`,
            subLabel: `${useKata ? k.katakana : k.hiragana}`,
            value: k.romaji,
            isCorrect: k.id === kana.id
          })),
          correctAnswer: `${kana.romaji} （${useKata ? kana.kataOrigin.kanji : kana.hiraOrigin.kanji}）`,
          explanation: baseExplanation
        };
      }

      case 'typing-blitz': {
        const useKata = options.onlyKatakana || Math.random() < 0.45;
        const charShow = useKata ? kana.katakana : kana.hiragana;
        return {
          type: 'typing',
          mode: 'typing-blitz',
          dimension: useKata ? 'kata' : 'hira',
          kanaId: kana.id,
          audioText: kana.hiragana,
          tag: '罗马字拼写',
          promptTitle: `请键入该${useKata ? '片假名' : '平假名'}的罗马字读音：`,
          promptMain: charShow,
          promptSub: `书源提示：${useKata ? `「${kana.kataOrigin.kanji}」(${kana.kataOrigin.radicalPart})` : `草书「${kana.hiraOrigin.kanji}」`}`,
          acceptedAnswers: kana.aliases || [kana.romaji],
          correctAnswer: kana.romaji,
          explanation: baseExplanation
        };
      }

      case 'word-combat': {
        const wordPool = window.VOCAB_QUIZ_BANK;
        const targetWord = wordPool[Math.floor(Math.random() * wordPool.length)];
        const isTyping = Math.random() < 0.45;

        if (isTyping) {
          return {
            type: 'typing',
            mode: 'word-combat',
            dimension: 'hira',
            kanaId: null,
            audioText: targetWord.kana,
            autoPlayAudio: true,
            tag: `词汇拼读 · ${targetWord.category}`,
            promptTitle: `请键入词汇「${targetWord.kana}」(${targetWord.meaning}) 的完整罗马字：`,
            promptMain: targetWord.kana,
            promptSub: `对应汉字/释义：${targetWord.display} — ${targetWord.meaning}（${targetWord.note}）`,
            acceptedAnswers: [targetWord.romaji, targetWord.romaji.replace(/'/g, '')],
            correctAnswer: targetWord.romaji,
            explanation: `词汇解析：${targetWord.kana} [${targetWord.romaji}] 对应「${targetWord.display}」—— ${targetWord.meaning}。${targetWord.note}。`
          };
        } else {
          const otherWords = this.shuffle(wordPool.filter(w => w.kana !== targetWord.kana)).slice(0, 3);
          const wordChoices = this.shuffle([targetWord, ...otherWords]);
          return {
            type: 'choice',
            mode: 'word-combat',
            dimension: 'hira',
            kanaId: null,
            audioText: targetWord.kana,
            autoPlayAudio: true,
            tag: `词汇拼读 · ${targetWord.category}`,
            promptTitle: `词汇「${targetWord.kana}」对应的读音与词义是：`,
            promptMain: targetWord.kana,
            promptSub: `提示：${targetWord.note}`,
            choices: wordChoices.map(w => ({
              label: `[${w.romaji}] ${w.display}`,
              subLabel: w.meaning,
              value: w.romaji,
              isCorrect: w.kana === targetWord.kana
            })),
            correctAnswer: `[${targetWord.romaji}] ${targetWord.display}`,
            explanation: `词汇解析：${targetWord.kana} [${targetWord.romaji}] 对应「${targetWord.display}」—— ${targetWord.meaning}。${targetWord.note}。`
          };
        }
      }

      default:
        return this.generateSingleQuestion('hira-romaji', targetKanaId, poolIds, options);
    }
  }

  buildExplanation(kana) {
    return `${kana.hiragana} / ${kana.katakana} [${kana.romaji}]：平假名「${kana.hiragana}」源于汉字「${kana.hiraOrigin.kanji}」(${kana.hiraOrigin.pinyin}) 之草书（${kana.hiraOrigin.mnemonic}）；片假名「${kana.katakana}」取自汉字「${kana.kataOrigin.kanji}」之【${kana.kataOrigin.radicalPart}】（${kana.kataOrigin.mnemonic}）。`;
  }

  generateSessionQueue({ mode = 'mixed', kanaIds = null, count = 25, onlyKatakana = false, includeVocabAndExtensions = false }) {
    const requestedPool = (kanaIds && kanaIds.length > 0) ? kanaIds : window.KANA_DATA.map(k => k.id);
    const validPool = [...new Set(requestedPool.filter(id => Object.prototype.hasOwnProperty.call(this.kanaMap, id)))];
    const pool = validPool.length ? validPool : window.KANA_DATA.map(k => k.id);
    count = Number.isFinite(count) ? Math.max(1, Math.min(300, Math.floor(count))) : 25;
    const queue = [];

    const weightedPool = [];
    pool.forEach(id => {
      const rec = window.masteryEngine.state.kanaRecords[id];
      const weight = (!rec || rec.masteryScore < 60) ? 3 : (rec.masteryScore < 85 ? 2 : 1);
      for (let w = 0; w < weight; w++) {
        weightedPool.push(id);
      }
    });

    const guaranteedOrder = this.shuffle(pool);
    for (let i = 0; i < count; i++) {
      let targetId;
      if (i < guaranteedOrder.length) {
        targetId = guaranteedOrder[i];
      } else {
        targetId = weightedPool[Math.floor(Math.random() * weightedPool.length)];
      }
      queue.push(
        this.generateSingleQuestion(mode, targetId, pool, { onlyKatakana, includeVocabAndExtensions })
      );
    }

    return queue;
  }
}

window.quizGenerator = new QuizGenerator();
