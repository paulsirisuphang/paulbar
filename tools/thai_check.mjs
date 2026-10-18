/* How every Thai string in the copy will break into words on the page:
   the words in TH_KEEP first, then the dictionary for the rest, exactly
   as txt() in core.js does it. Run it after changing Thai copy and look
   for a word cut in two; add that word to TH_KEEP.

     node tools/thai_check.mjs            every string, words split by |
     node tools/thai_check.mjs --short    each short piece once, with its neighbours */
import fs from 'node:fs';
import vm from 'node:vm';

const dir = new URL('../src/data/', import.meta.url).pathname;
const short = process.argv.includes('--short');
const src = fs.readdirSync(dir).sort().map((f) => fs.readFileSync(dir + f, 'utf8')).join('\n');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + '\n;globalThis.__ = { T_TH, TH, WOODS_TH, WOOD_TH, TH_KEEP };', ctx);
const { T_TH, TH, WOODS_TH, WOOD_TH, TH_KEEP } = ctx.__;

const THAI = /[\u0E00-\u0E7F]/;
const keep = new RegExp('(' + [...TH_KEEP].sort((a, b) => b.length - a.length).join('|') + ')');
const seg = new Intl.Segmenter('th', { granularity: 'word' });
const words = (s) => s.replace(/ \u0E46/g, '\u00a0\u0E46').split(keep)
  .flatMap((part, i) => (i % 2 ? [part] : [...seg.segment(part)].map((x) => x.segment)))
  .filter((w) => w.trim());

const all = new Set();
const walk = (v) => {
  if (typeof v === 'string') { if (THAI.test(v)) all.add(v); }
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
};
[T_TH, TH, WOODS_TH, WOOD_TH].forEach(walk);

const split = [...all].map(words);
if (!short) split.forEach((ws) => console.log(ws.join('|')));
else {
  /* a word cut in two shows up as a piece of three letters or fewer */
  const seen = new Map();
  split.forEach((ws) => ws.forEach((w, i) => {
    if (THAI.test(w) && [...w].length <= 3 && !seen.has(w)) seen.set(w, (ws[i - 1] || '') + '|' + w + '|' + (ws[i + 1] || ''));
  }));
  seen.forEach((c) => console.log(c));
}
