// ============================================================================
// 《源音·五十音》—— 跨平台语音合成与声学反馈引擎
// 兼容：Android 原生 TextToSpeech 桥接 + 桌面端 Web Speech API + Web Audio 泛音合成
// ============================================================================

class AudioEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.jaVoice = null;
    this.zhVoice = null;
    this.rate = 0.92;
    this.sfxEnabled = true;
    this.audioCtx = null;
    this.currentAudio = null;
    this.currentUtterance = null;
    this.noticeTimer = null;
    this.bundledAudioManifest = Object.create(null);
    this.bundledChineseManifest = Object.create(null);
    this.audioReady = this.loadAudioManifest();
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('nativepause', () => this.stop());
    }

    if (this.synth) {
      this.loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  initAudioCtx() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        const resumed = this.audioCtx.resume();
        if (resumed && typeof resumed.catch === 'function') resumed.catch(() => {});
      }
    } catch (_) { /* 音效不可用不应阻止课程发音与作答。 */ }
  }

  loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || !voices.length) return;

    const jaCandidates = voices.filter(v => /^ja(?:[-_]|$)/i.test(v.lang || ''));
    this.jaVoice =
      jaCandidates.find(v => /Nanami|Natural|Google|Kyoko|Otoya|Haruka/i.test(v.name)) ||
      jaCandidates[0] ||
      null;

    const zhCandidates = voices.filter(v => /^zh(?:[-_]|$)/i.test(v.lang || ''));
    this.zhVoice =
      zhCandidates.find(v => /Xiaoxiao|Yunxi|Natural|Google|Huihui/i.test(v.name)) ||
      zhCandidates[0] ||
      null;
  }

  getBundledAudioPath(text) {
    if (Object.prototype.hasOwnProperty.call(this.bundledAudioManifest, text)) return this.bundledAudioManifest[text];
    const kana = (window.KANA_DATA || []).find(k => k.hiragana === text || k.katakana === text);
    // 音频由构建时的 46 清音资源包提供；开发预览也使用相同相对路径。
    return kana && window.GENYIN_BUNDLED_KANA_AUDIO !== false ? `assets/audio/kana/${kana.id}.mp3` : null;
  }

  registerAudioManifest(payload) {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    const entries = parsed && (parsed.audio || parsed.entries || parsed);
    if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return 0;
    let count = 0;
    for (const [text, value] of Object.entries(entries)) {
      const filePath = typeof value === 'string' ? value : value && value.path;
      // 清单仅能引用 APK 内的音频，不能注入远程 URL 或越过资源目录。
      if (!text || typeof filePath !== 'string' || !/^assets\/audio\/[^%\\?#:\u0000-\u001f]+\.(?:mp3|ogg|wav|m4a)$/i.test(filePath) || filePath.split('/').includes('..')) continue;
      this.bundledAudioManifest[text] = filePath;
      count++;
    }
    for (const [text, value] of Object.entries(parsed.chinese || {})) {
      const filePath = typeof value === 'string' ? value : value?.path;
      if (text && typeof filePath === 'string' && /^assets\/audio\/[^%\\?#:\u0000-\u001f]+\.(?:mp3|ogg|wav|m4a)$/i.test(filePath) && !filePath.split('/').includes('..')) {
        this.bundledChineseManifest[text] = filePath;
        count++;
      }
    }
    return count;
  }

  loadAudioManifest() {
    try {
      if (window.GENYIN_AUDIO_MANIFEST) {
        this.registerAudioManifest(window.GENYIN_AUDIO_MANIFEST);
        return Promise.resolve(true);
      }
      // Android 保留旧版 file 来源以继承进度，由只读桥提供 JSON，避免放宽文件权限。
      if (window.AndroidApp && typeof window.AndroidApp.getAudioManifest === 'function') {
        this.registerAudioManifest(window.AndroidApp.getAudioManifest());
        return Promise.resolve(true);
      }
      if (typeof fetch === 'function') {
        return fetch('assets/audio/manifest.json').then(response => {
          if (!response.ok) return false;
          return response.json().then(payload => { this.registerAudioManifest(payload); return true; });
        }).catch(() => false);
      }
    } catch (_) { /* 清单缺失仍可用固定路径的 46 个基础假名。 */ }
    return Promise.resolve(false);
  }

  getJapaneseAvailability(text = '') {
    if (text ? this.getBundledAudioPath(String(text)) : Object.keys(this.bundledAudioManifest).length || (window.KANA_DATA || []).length && window.GENYIN_BUNDLED_KANA_AUDIO !== false) {
      return { available: true, source: 'bundled' };
    }
    if (window.AndroidTTS && typeof window.AndroidTTS.speakJapanese === 'function') {
      try {
        if (window.AndroidApp && typeof window.AndroidApp.getInfo === 'function') {
          const info = JSON.parse(window.AndroidApp.getInfo());
          if (info.ttsJapanese === true) return { available: true, source: 'android' };
        } else {
          return { available: true, source: 'android' };
        }
      } catch (_) { /* 继续检测浏览器语言包。 */ }
    }
    if (!this.jaVoice) this.loadVoices();
    return { available: !!this.jaVoice, source: this.jaVoice ? 'browser' : 'unavailable' };
  }

  canSpeakJapanese(text = '') {
    return this.getJapaneseAvailability(text).available;
  }

  showSpeechUnavailable(language = 'ja', message = '') {
    const text = message || (language === 'ja'
      ? '这段日语音频未能播放，请重试。'
      : '这段汉语音频未能播放，请重试。');
    if (typeof window.showToast === 'function') {
      window.showToast(text);
      return;
    }
    if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('genyin-audio-unavailable', { detail: { message: text, language } }));
    }
    if (typeof document === 'undefined' || !document.body || typeof document.createElement !== 'function') return;
    let notice = document.getElementById('audio-availability-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'audio-availability-notice';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;left:20px;right:20px;bottom:94px;z-index:9999;margin:auto;max-width:460px;padding:14px 18px;border-radius:16px;background:#243a35;color:#fff;box-shadow:0 6px 24px #0003;font:14px/1.6 sans-serif;pointer-events:none;';
      document.body.appendChild(notice);
    }
    notice.textContent = text;
    notice.style.display = 'block';
    clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => { notice.style.display = 'none'; }, 6500);
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.synth) this.synth.cancel();
    if (window.AndroidTTS && typeof window.AndroidTTS.stop === 'function') {
      try { window.AndroidTTS.stop(); } catch (_) { /* 旧 APK 不提供 stop。 */ }
    }
    this.currentUtterance = null;
  }

  // 播放日语假名或词汇发音
  speakJapanese(text, slow = false) {
    text = String(text || '').trim();
    if (!text) return false;
    this.stop();

    const audioPath = this.getBundledAudioPath(text);
    if (audioPath && typeof Audio === 'function') {
      const clip = new Audio(audioPath);
      this.currentAudio = clip;
      clip.playbackRate = slow ? 0.75 : 1;
      const failed = () => {
        if (this.currentAudio !== clip) return;
        this.currentAudio = null;
        this.speakJapaneseWithTts(text, slow);
      };
      clip.onerror = failed;
      try {
        const played = clip.play();
        if (played && typeof played.catch === 'function') played.catch(failed);
        return true;
      } catch (_) {
        this.currentAudio = null;
        return this.speakJapaneseWithTts(text, slow);
      }
    }
    return this.speakJapaneseWithTts(text, slow);
  }

  speakJapaneseWithTts(text, slow = false) {

    // 1. 优先调用 Android 原生 TextToSpeech 接口（APK 环境）
    if (window.AndroidTTS && typeof window.AndroidTTS.speakJapanese === 'function') {
      try {
        const result = window.AndroidTTS.speakJapanese(String(text), Boolean(slow));
        if (result !== false) return true;
      } catch (e) {
        // 继续尝试 Web Speech
      }
    }

    // 2. Web Speech API
    if (!this.jaVoice) this.loadVoices();
    if (!this.synth || !this.jaVoice) {
      this.showSpeechUnavailable('ja');
      return false;
    }

    try {
      this.synth.cancel();
      if (!this.jaVoice) this.loadVoices();

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ja-JP';
      if (this.jaVoice) {
        utter.voice = this.jaVoice;
      }
      utter.rate = slow ? 0.65 : this.rate;
      utter.pitch = 1.02;
      utter.volume = 1.0;

      utter.onerror = event => {
        if (!event || !['canceled', 'interrupted'].includes(event.error)) this.showSpeechUnavailable('ja');
      };

      this.currentUtterance = utter;
      this.synth.speak(utter);
      return true;
    } catch (e) {
      this.showSpeechUnavailable('ja');
      return false;
    }
  }

  // 播放汉字本字普通话读音
  speakChinese(text) {
    text = String(text || '').trim();
    this.stop();
    const path = this.bundledChineseManifest[text];
    if (path && typeof Audio === 'function') {
      const clip = new Audio(path); this.currentAudio = clip;
      const failed = () => { if (this.currentAudio === clip) { this.currentAudio = null; this.speakChineseWithTts(text); } };
      clip.onerror = failed;
      try { const p = clip.play(); if (p?.catch) p.catch(failed); return true; } catch (_) { failed(); }
    }
    return this.speakChineseWithTts(text);
  }

  speakChineseWithTts(text) {
    text = String(text || '').trim();
    if (!text) return false;
    this.stop();

    if (window.AndroidTTS && typeof window.AndroidTTS.speakChinese === 'function') {
      try {
        const result = window.AndroidTTS.speakChinese(String(text));
        if (result !== false) return true;
      } catch (e) {
        // 继续尝试 Web Speech
      }
    }

    if (!this.zhVoice) this.loadVoices();
    if (!this.synth || !this.zhVoice) {
      this.showSpeechUnavailable('zh');
      return false;
    }
    try {
      this.synth.cancel();
      if (!this.zhVoice) this.loadVoices();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      if (this.zhVoice) {
        utter.voice = this.zhVoice;
      }
      utter.rate = 0.88;
      utter.onerror = event => {
        if (!event || !['canceled', 'interrupted'].includes(event.error)) this.showSpeechUnavailable('zh');
      };
      this.currentUtterance = utter;
      this.synth.speak(utter);
      return true;
    } catch (e) {
      this.showSpeechUnavailable('zh');
      return false;
    }
  }

  playToneFallback() {
    this.initAudioCtx();
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.16);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playCorrectSfx(combo = 1) {
    if (!this.sfxEnabled) return;
    this.initAudioCtx();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const baseFreq = Math.min(523.25 * Math.pow(1.05946, Math.min(combo - 1, 8)), 987.77);

    [baseFreq, baseFreq * 1.25].forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.065);
      gain.gain.setValueAtTime(0.11, now + idx * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.22);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now + idx * 0.065);
      osc.stop(now + idx * 0.065 + 0.23);
    });
  }

  playWrongSfx() {
    if (!this.sfxEnabled) return;
    this.initAudioCtx();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    [220, 196].forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.11);
      gain.gain.setValueAtTime(0.1, now + idx * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.2);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now + idx * 0.11);
      osc.stop(now + idx * 0.11 + 0.22);
    });
  }

  playStageClearSfx() {
    if (!this.sfxEnabled) return;
    this.initAudioCtx();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.13, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.42);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.44);
    });
  }
}

window.audioEngine = new AudioEngine();
