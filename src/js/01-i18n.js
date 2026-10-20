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

/* How heavy it lands — read off the same score the tasting card draws,
   so the two can never disagree. */
function strengthWord(drink) {
  const s = drink.flavor.strength;
  if (drink.na && !drink.warning) return U('heavy_none');
  if (s <= 2) return U('level_light');
  if (s === 3) return U('level_medium');
  return U('level_strong');
}

/* how it tastes, in a guest's words, then how strong:
   "Bitter orange and herbs, for sipping slowly. Strong." */
const tasteLine = (drink) => (lang === 'th'
  ? drink.taste + ' · ' + strengthWord(drink)
  : drink.taste + ' ' + strengthWord(drink) + '.');

const langListeners = [];
const onLang = (fn) => langListeners.push(fn);

function setLang(next) {
  if (next === lang) return;
  lang = next;
  store.set(KEYS.lang, next);
  document.documentElement.lang = lang;
  langListeners.forEach((fn) => fn());
}
