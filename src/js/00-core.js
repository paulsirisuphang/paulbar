/* ================================================================
   CORE — DOM and storage helpers everything else leans on
   ================================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* an HTML element, with an optional class and text */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.appendChild(txt(text));
  return n;
}

/* Text for the page. Thai is set one word to a span, each kept whole,
   with a place to break between them: the words in TH_KEEP first (the
   browser's dictionary cuts those mid-word), then the dictionary splits
   what's left. The words come wrapped in one span, so a flex row they
   land in sees a single item. Text with no Thai in it is just text. */
const THAI = /[\u0E00-\u0E7F]/;
let thaiKeep = null;
let thaiWords = null;
function txt(text) {
  text = String(text);
  if (!THAI.test(text) || typeof Intl === 'undefined' || !Intl.Segmenter) return document.createTextNode(text);
  if (!thaiWords) {
    thaiWords = new Intl.Segmenter('th', { granularity: 'word' });
    thaiKeep = new RegExp('(' + TH_KEEP.slice().sort((a, b) => b.length - a.length).join('|') + ')');
  }
  const run = document.createElement('span');
  let lastThai = false;
  /* the repeat mark ๆ belongs to the word before it, never the next line */
  text.replace(/ ๆ/g, '\u00a0ๆ').split(thaiKeep).forEach((part, i) => {
    const words = i % 2 ? [part] : Array.from(thaiWords.segment(part), (s) => s.segment);
    words.forEach((w) => {
      if (!w) return;
      const thai = THAI.test(w);
      if (thai && lastThai) run.appendChild(document.createElement('wbr'));
      if (thai) run.appendChild(el('span', 'tw')).textContent = w;
      else run.appendChild(document.createTextNode(w));
      lastThai = thai;
    });
  });
  return run;
}

/* an SVG element. Numbers are rounded to two places so a drawing made of
   computed curves doesn't carry fifteen decimals per point. */
const SVG_NS = 'http://www.w3.org/2000/svg';
function S(tag, attrs = {}, kids = []) {
  const n = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    n.setAttribute(k, typeof v === 'number' ? String(+v.toFixed(2)) : v);
  }
  kids.forEach((k) => k && n.appendChild(k));
  return n;
}

/* a whole SVG from a string — for the fixed marks that are easier to
   read as markup than as calls */
function svgFrom(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* localStorage that never throws — private windows and full disks just
   behave as if nothing was saved */
const store = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : v; } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* nothing to be done */ }
  },
  json(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
};

const KEYS = {
  orders: 'paulsbar.orders.v1',
  guest: 'paulsbar.guest.v1',
  lang: 'paulsbar.lang.v1'
};
