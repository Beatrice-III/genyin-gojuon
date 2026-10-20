// Enumerate every fixed utterance reachable in the bundled curriculum.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '..');
global.window = {};
require(path.join(root, 'js/data-kana.js'));
require(path.join(root, 'js/data-extensions.js'));
const records = new Map();
function add(lang, text, source, alias = null) {
  if (!text) return;
  text = String(text).trim();
  const spoken = lang === 'ja' ? text.replace(/[⓪①②③④⑤⑥⑦⑧⑨\/／]/g, '').replace(/\s+/g, ' ').trim() : text;
  if (!spoken) return;
  const key = lang + ':' + spoken;
  if (!records.has(key)) records.set(key, {lang, text: spoken, aliases: [], sources: [], id: crypto.createHash('sha256').update(key).digest('hex').slice(0, 16)});
  const item = records.get(key);
  for (const value of [text, alias].filter(Boolean)) if (!item.aliases.includes(value)) item.aliases.push(value);
  if (!item.sources.includes(source)) item.sources.push(source);
}
for (const k of window.KANA_DATA) {
  add('ja', k.hiragana, `kana:${k.id}`, k.katakana);
  add('zh', k.hiraOrigin.kanji, `origin:${k.id}`);
  add('zh', k.kataOrigin.kanji, `origin-katakana:${k.id}`);
  for (const w of k.words) add('ja', w.kana, `word:${k.id}`);
}
for (const group of window.DAKUON_DATA) for (const item of group.items) {
  add('ja', item.hira, `dakuon:${item.id}`, item.kata);
  add('ja', item.word.split(/[ (（]/)[0], `dakuon-word:${item.id}`);
}
for (const group of window.YOON_DATA.rows) for (const item of group.items) {
  add('ja', item.hira, `yoon:${item.romaji}`, item.kata);
  add('ja', item.word.split(/[ (（]/)[0], `yoon-word:${item.romaji}`);
}
for (const section of window.SPECIAL_SOUNDS_DATA) for (const ex of section.examples) {
  const actual = ex.kana.replace(/ [⓪①② \/]/g, '');
  add('ja', actual, `special:${section.name}`, ex.kana);
  for (const part of ex.kana.split(/[\/／]/)) add('ja', part, `special-example:${section.name}`);
}
for (const word of window.VOCAB_QUIZ_BANK) add('ja', word.kana, `quiz-word:${word.category}`);
const inventory = [...records.values()].sort((a,b) => a.lang.localeCompare(b.lang) || a.text.localeCompare(b.text));
const output = process.argv[2] || path.join(root, 'work/audio_v3/inventory.json');
fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, JSON.stringify({version: 1, count: inventory.length, japanese: inventory.filter(x => x.lang==='ja').length, chinese: inventory.filter(x => x.lang==='zh').length, entries: inventory}, null, 2));
console.log(JSON.stringify({file: output, count: inventory.length, japanese: inventory.filter(x=>x.lang==='ja').length, chinese: inventory.filter(x=>x.lang==='zh').length}));
