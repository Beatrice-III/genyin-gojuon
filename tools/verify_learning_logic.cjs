// Run: node tools/verify_learning_logic.cjs
// Deterministic checks of migration, import transactions, question validity,
// unavailable speech handling and pointer cancellation. No browser or packages.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
let assertions = 0;
function check(condition, message) { assertions++; assert.ok(condition, message); }
function equal(actual, expected, message) { assertions++; assert.deepEqual(actual, expected, message); }
function rejected(callback, message) { assertions++; assert.throws(callback, undefined, message); }

function environment(initial = {}) {
  const stored = new Map(Object.entries(initial));
  const events = [];
  const windowListeners = new Map();
  let randomSeed = 0x5a17;
  const seededMath = Object.create(Math);
  seededMath.random = () => {
    randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0;
    return randomSeed / 0x100000000;
  };
  const context = vm.createContext({
    window: {}, console, Date, Math: seededMath, performance, setTimeout, clearTimeout,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    localStorage: {
      getItem: key => stored.get(key) ?? null,
      setItem: (key, value) => { stored.set(key, value); }
    }
  });
  context.window.addEventListener = (type, listener) => windowListeners.set(type, listener);
  context.window.dispatchEvent = event => { events.push(event); };
  for (const name of ['data-kana.js', 'data-extensions.js', 'storage-srs.js', 'quiz-generator.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'js', name), 'utf8'), context, { filename: name });
  }
  return { context, window: context.window, engine: context.window.masteryEngine, quiz: context.window.quizGenerator, stored, events, windowListeners };
}

const storageKey = 'GENYIN_GOJUON_MASTERY_V1';
const env = environment();
const { engine, quiz } = env;
equal(Object.keys(engine.state.kanaRecords).length, 46, '46 basic kana initialized');
equal(Object.keys(engine.state.stages).length, 10, 'all legacy stages initialized');
engine.recordStudyOrWrite('shi', true);
engine.recordQuizAnswer({ kanaId: 'shi', dimension: 'kata', isCorrect: true, reactionMs: 1200 });
engine.recordQuizAnswer({ kanaId: 'shi', dimension: 'audio', isCorrect: false, reactionMs: 2400, modeName: '听音辨字', wrongAnswer: 'ツ', correctAnswer: 'シ' });
equal(engine.state.kanaRecords.shi.kataCorrect, 1, 'katakana recorded in its dimension');
equal(engine.state.kanaRecords.shi.audioAttempts, 1, 'audio recorded in its dimension');
equal(engine.state.kanaRecords.shi.streak, 0, 'mistake resets streak');
check(engine.state.kanaRecords.shi.nextReviewAt - Date.now() <= 60000, 'mistake schedules one minute review');
equal(engine.getWeakAndDueKanaIds(1)[0], 'shi', 'weak item prioritized');
engine.recordStageResult(1, 20, 4);
equal(engine.state.stages[1].bestTimeSec, 0, 'failed fast run cannot become passing best time');
engine.recordStageResult(1, 94, 130);
equal(engine.state.stages[1].bestTimeSec, 130, 'first passing run saves time');
check(engine.state.stages[2].unlocked, 'passing unlocks following stage');
engine.recordStageResult(1, 90, 150);
equal(engine.state.stages[1].bestTimeSec, 130, 'slower passing run keeps best time');
const fractionalAccuracy = environment();
fractionalAccuracy.engine.recordStageResult(1, 35 / 39 * 100, 80);
check(!fractionalAccuracy.engine.state.stages[1].cleared, '89.74 percent must not pass a 90 percent gate');
const fractionalReload = environment({ [storageKey]: fractionalAccuracy.stored.get(storageKey) });
equal(fractionalReload.engine.state.stages[1].bestAccuracy, 35 / 39 * 100, 'fractional percentage survives reload');

const exported = engine.exportProgress();
const imported = environment();
imported.engine.importProgress(exported);
equal(JSON.stringify(imported.engine.state), JSON.stringify(engine.state), 'export/import roundtrip is lossless');
const before = JSON.stringify(imported.engine.state);
for (const mutate of [
  data => { data.state.totalCorrect = data.state.totalQuestions + 1; },
  data => { data.state.kanaRecords.shi.audioAttempts = -2; },
  data => { delete data.state.kanaRecords.a; },
  data => { data.state.kanaRecords.shi.srsLevel = 7; },
  data => { data.state.stages[1].bestAccuracy = 101; },
  data => { data.state.version = 9; },
  data => { data.state.recentMistakes[0].wrongAnswer = {}; },
  data => { data.state.kanaRecords['unknown'] = data.state.kanaRecords.a; }
]) {
  const broken = JSON.parse(exported);
  mutate(broken);
  rejected(() => imported.engine.importProgress(JSON.stringify(broken)), 'invalid import rejected');
  equal(JSON.stringify(imported.engine.state), before, 'invalid import preserves in-memory progress');
  equal(imported.stored.get(storageKey), before, 'invalid import preserves saved progress');
}
rejected(() => imported.engine.importProgress('{"version":1,"__proto__":{"polluted":true},"kanaRecords":{},"stages":{}}'), 'prototype pollution rejected');
equal({}.polluted, undefined, 'Object prototype remains clean');
const importedStorageSet = imported.context.localStorage.setItem;
imported.context.localStorage.setItem = () => { throw new Error('disk full'); };
rejected(() => imported.engine.importProgress(exported), 'failed storage write throws');
equal(JSON.stringify(imported.engine.state), before, 'failed storage write preserves memory');
imported.context.localStorage.setItem = importedStorageSet;

const partial = JSON.parse(JSON.stringify(engine.state));
delete partial.kanaRecords.shi.audioAttempts;
delete partial.kanaRecords.shi.audioCorrect;
const migrated = environment({ [storageKey]: JSON.stringify(partial) });
equal(migrated.engine.state.kanaRecords.shi.audioAttempts, 0, 'sparse legacy records merge each default field');
check(Number.isFinite(migrated.engine.state.kanaRecords.shi.masteryScore), 'migration preserves numeric score');
const corrupted = environment({ [storageKey]: '{broken' });
equal(corrupted.stored.get(`${storageKey}_RECOVERY`), '{broken', 'corrupt source retained for recovery');
equal(corrupted.stored.get(storageKey), '{broken', 'loading corruption does not silently overwrite source');
const longInput = environment();
longInput.engine.recordQuizAnswer({ kanaId: 'a', isCorrect: false, wrongAnswer: 'x'.repeat(2200), modeName: 'mode'.repeat(100), correctAnswer: 'a' });
const longInputReload = environment({ [storageKey]: longInput.stored.get(storageKey) });
equal(longInputReload.engine.state.totalQuestions, 1, 'long accidental input cannot invalidate saved progress on reload');
equal(longInputReload.engine.state.recentMistakes[0].wrongAnswer.length, 2000, 'persisted free text obeys schema length limit');
const legacyMastery = environment();
const oldRecord = legacyMastery.engine.state.kanaRecords.a;
oldRecord.hiraAttempts = oldRecord.hiraCorrect = oldRecord.kataAttempts = oldRecord.kataCorrect = 3;
oldRecord.streak = 6;
oldRecord.masteryScore = 100;
equal(legacyMastery.engine.getGlobalSummary().masteredCount, 0, 'old inflated score does not count as comprehensive mastery');
equal(oldRecord.masteryScore, 84, 'missing listening and origin evidence caps score at 84');
equal(oldRecord.hiraCorrect, 3, 'mastery migration retains historical answers');
oldRecord.audioAttempts = oldRecord.audioCorrect = 1;
equal(legacyMastery.engine.getGlobalSummary().masteredCount, 0, 'listening alone cannot replace origin evidence');
oldRecord.originAttempts = oldRecord.originCorrect = 1;
equal(legacyMastery.engine.getGlobalSummary().masteredCount, 1, 'four dimensions of evidence allow comprehensive mastery');

let generated = 0;
env.window.audioEngine = { canSpeakJapanese: () => true };
const modes = ['origin-match', 'hira-romaji', 'kata-romaji', 'hira-kata-cross', 'audio-dictation', 'confusable-sniper', 'typing-blitz', 'word-combat'];
for (const kana of env.window.KANA_DATA) {
  for (const mode of modes) {
    for (let repeat = 0; repeat < 12; repeat++) {
      const question = quiz.generateSingleQuestion(mode, kana.id, [kana.id]);
      generated++;
      if (question.type === 'choice') {
        equal(question.choices.filter(choice => choice.isCorrect).length, 1, 'exactly one correct option');
        equal(new Set(question.choices.map(choice => choice.label)).size, question.choices.length, 'no duplicate option labels');
        equal(question.choices.length, 4, 'four valid choices even for one-target drills');
        if (mode !== 'word-combat') check(question.choices.every(choice => !choice.subLabel), 'no option subtitle leaks answer');
      } else {
        check(quiz.isTypingAnswerCorrect(question, question.correctAnswer), 'canonical typing answer accepted');
      }
      if (mode === 'audio-dictation' && ['o', 'wo'].includes(kana.id)) {
        const labels = question.choices.map(choice => choice.label);
        check(!(labels.includes('お') && labels.includes('を')) && !(labels.includes('オ') && labels.includes('ヲ')), 'homophones never become mutually exclusive listening options');
      }
      if (mode === 'word-combat') equal(question.kanaId, null, 'word results never inflate a random kana mastery');
    }
  }
}
const shiQuestion = quiz.generateSingleQuestion('typing-blitz', 'shi', ['shi']);
check(quiz.isTypingAnswerCorrect(shiQuestion, ' ＳＨＩ '), 'fullwidth phone keyboard answer accepted');
check(quiz.isTypingAnswerCorrect(shiQuestion, 'si'), 'legacy alternative romanization accepted');
check(!quiz.isTypingAnswerCorrect(shiQuestion, ''), 'empty answer rejected');
const filteredQueue = quiz.generateSessionQueue({ kanaIds: [null, 'missing', 'a', 'a'], count: 5, mode: 'typing-blitz' });
check(filteredQueue.every(question => question.kanaId === 'a'), 'invalid and duplicate pool ids removed');
const kataQueue = quiz.generateSessionQueue({ onlyKatakana: true, count: 100 });
check(kataQueue.every(question => question.dimension !== 'hira'), 'katakana-only stage never asks for a hiragana target');
env.window.audioEngine.canSpeakJapanese = () => false;
check(quiz.generateSingleQuestion('audio-dictation', 'a', ['a']).audioUnavailable, 'unavailable audio becomes visible reading fallback');
const snapshot = JSON.stringify(engine.state.kanaRecords);
engine.recordQuizAnswer({ kanaId: null, isCorrect: true });
equal(JSON.stringify(engine.state.kanaRecords), snapshot, 'vocabulary only changes session totals');

// Audio tests never synthesize a tone as a substitute for Japanese pronunciation.
vm.runInContext(fs.readFileSync(path.join(root, 'js/audio-engine.js'), 'utf8'), env.context);
env.window.GENYIN_BUNDLED_KANA_AUDIO = false;
check(!env.window.audioEngine.canSpeakJapanese('あ'), 'no false availability without a voice or audio pack');
check(!env.window.audioEngine.speakJapanese('あ'), 'speech returns false when unavailable');
check(env.events.some(event => event.type === 'genyin-audio-unavailable'), 'unavailable speech broadcasts UI status');
env.window.GENYIN_BUNDLED_KANA_AUDIO = true;
check(env.window.audioEngine.canSpeakJapanese('あ'), 'bundled basic kana available offline');
check(!env.window.audioEngine.canSpeakJapanese('がっこう'), 'basic pack does not claim arbitrary vocabulary speech');
equal(env.window.audioEngine.getBundledAudioPath('ア'), 'assets/audio/kana/a.mp3', 'katakana shares corresponding recording');
env.window.audioEngine.registerAudioManifest({ audio: {
  'がっこう': 'assets/audio/words/gakkou.mp3',
  badRemote: 'https://example.com/audio.mp3',
  badTraversal: 'assets/audio/../../outside.mp3',
  badEncoded: 'assets/audio/%2e%2e/outside.mp3',
  badBackslash: 'assets/audio/..\\outside.mp3'
} });
check(env.window.audioEngine.canSpeakJapanese('がっこう'), 'manifest enables bundled vocabulary speech');
equal(env.window.audioEngine.getBundledAudioPath('がっこう'), 'assets/audio/words/gakkou.mp3', 'manifest maps exact text to local audio');
check(['badRemote', 'badTraversal', 'badEncoded', 'badBackslash'].every(text => env.window.audioEngine.getBundledAudioPath(text) === null), 'manifest rejects external and traversal paths');
let shownToast = '';
env.window.showToast = message => { shownToast = message; };
const priorEvents = env.events.length;
env.window.audioEngine.showSpeechUnavailable('ja', '详细发音错误');
equal(shownToast, '详细发音错误', 'existing app toast receives detailed speech error');
equal(env.events.length, priorEvents, 'existing toast prevents duplicate unavailable event notices');
let paused = false;
env.window.audioEngine.currentAudio = { pause: () => { paused = true; } };
env.windowListeners.get('nativepause')();
check(paused && !env.window.audioEngine.currentAudio, 'native pause stops bundled audio');

// Exercise the actual pointer event state machine with a canvas mock.
const listeners = new Map();
const ctx = new Proxy({}, { get: (_, key) => key === 'measureText' ? () => ({ width: 10 }) : () => {} });
const canvas = {
  width: 420, height: 420, style: {}, getContext: () => ctx,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 210, height: 210 }),
  addEventListener: (type, callback) => listeners.set(type, callback),
  setPointerCapture: () => {}, releasePointerCapture: () => {}
};
env.context.document = { getElementById: () => canvas };
env.window.PointerEvent = function () {};
vm.runInContext(fs.readFileSync(path.join(root, 'js/calligraphy-canvas.js'), 'utf8'), env.context);
const pad = new env.window.CalligraphyPad('canvas');
function pointer(x, y, pointerId = 1) {
  return { clientX: x, clientY: y, pointerId, pointerType: 'touch', button: 0, isPrimary: true, cancelable: true, preventDefault() {} };
}
listeners.get('pointerdown')(pointer(10, 10));
listeners.get('pointermove')(pointer(30, 30, 2));
equal(pad.currentStroke.length, 1, 'secondary touch does not draw into active stroke');
listeners.get('pointermove')(pointer(30, 30));
listeners.get('pointerup')(pointer(30, 30));
check(pad.hasUserWritten(), 'scaled pointer stroke counts as writing');
equal(pad.strokes[0][1].x, 60, 'pointer coordinates follow CSS-to-canvas scale');
listeners.get('pointerdown')(pointer(40, 40));
listeners.get('pointercancel')(pointer(40, 40));
check(!pad.isDrawing, 'Android system gesture cancellation stops drawing');
pad.clear();
listeners.get('pointerdown')(pointer(10, 10));
listeners.get('pointerup')(pointer(10, 10));
check(!pad.hasUserWritten(), 'single accidental tap cannot count as a practice');
listeners.get('pointerdown')(pointer(15, 15));
pad.setCharacter('い', '以');
check(!pad.isDrawing && !pad.currentStroke.length && !pad.strokes.length, 'changing kana cancels active pointer state');
equal(canvas.style.touchAction, 'none', 'canvas owns writing touches without page scroll');

console.log(JSON.stringify({ status: 'passed', assertions, generatedQuestions: generated, checked: ['legacy migration', 'atomic backup import', 'SRS and stage timing', 'choice uniqueness and homophones', 'mobile romanization', 'speech availability', 'pointer cancel and scaled writing'] }, null, 2));
