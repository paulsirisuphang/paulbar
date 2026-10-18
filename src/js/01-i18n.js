/* ================================================================
   LANGUAGE
   English is the source; Thai overrides it field by field. Each
   language gets its own merged copy of the list, built once, so
   nothing is ever rewritten in place when the language changes.
   ================================================================ */

let lang = store.get(KEYS.lang) === 'th' ? 'th' : 'en';

const LISTS = {
  en: DRINKS,
  th: DRINKS.map((d) => (TH[d.id] ? Object.assign({}, d, TH[d.id]) : d))
};

/* the drinks, in the current language */
const drinks = () => LISTS[lang];
const drinkById = (id) => LISTS[lang].find((d) => d.id === id) || null;

/* a UI string; Thai falls back to English for anything not yet translated */
function U(key) {
  const th = lang === 'th' ? T_TH[key] : undefined;
  return th !== undefined ? th : T_EN[key];
}

const woodLabel = (w) => (lang === 'th' && WOOD_TH[w]) || w;
const woodNote = (w) => ((lang === 'th' ? WOODS_TH : WOODS)[w]) || '';

/* "3 min ago", in whichever language is live */
function ago(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return U('ago_now');
  if (m < 60) return U('ago_min')(m);
  return U('ago_hr')(Math.floor(m / 60));
}

/* The two loudest flavours plus how heavy it lands — read off the same
   scores the tasting card draws, so the two can never disagree. */
function profileWords(drink) {
  const f = drink.flavor;
  const ranked = ['bitter', 'sweet', 'citrus', 'herbal']
    .map((axis) => ({ axis, v: f[axis] || 0 }))
    .sort((a, b) => b.v - a.v);
  /* anything scoring 1 is barely there — naming it would mislead */
  let top = ranked.filter((x) => x.v >= 2).slice(0, 2);
  if (!top.length) top = ranked.slice(0, 1);

  let level;
  if (drink.na && !drink.warning) level = U('heavy_none');
  else if (f.strength <= 2) level = U('level_light');
  else if (f.strength === 3) level = U('level_medium');
  else level = U('level_strong');

  return top.map((x) => U('axis_' + x.axis)).concat(level).join(' · ');
}

const langListeners = [];
const onLang = (fn) => langListeners.push(fn);

function setLang(next) {
  if (next === lang) return;
  lang = next;
  store.set(KEYS.lang, next);
  document.documentElement.lang = lang;
  langListeners.forEach((fn) => fn());
}
