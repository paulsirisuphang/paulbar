/* ================================================================
   THE MENU — filters, sections, and a line for every drink
   ================================================================ */

/* a section id, or 'all' — nothing chosen means everything. The sections
   always run in the card's order, spirit-forward first (SECTIONS). */
let showing = 'all';

function phaseNow(now = new Date()) {
  const h = now.getHours();
  if (h >= 2 && h < 5) return 'lastcall';
  if (h >= 5 && h < 17) return 'day';
  if (h >= 17 && h < 23) return 'evening';
  return 'late';
}

/* the room's light changes with the hour; nothing announces it */
function applyPhase() {
  document.documentElement.dataset.phase = phaseNow();
}

const listed = (sec) => drinks().filter((d) => d.section === sec && !d.hidden);

/* ---------- filters ---------- */

function renderFilters() {
  const bar = $('#filters');
  bar.innerHTML = '';
  bar.setAttribute('aria-label', U('filters_label'));
  SECTIONS.forEach((sec) => {
    if (!listed(sec).length) return;
    const b = el('button', 'filter');
    b.type = 'button';
    b.appendChild(el('span', null, U('sec_' + sec)));
    b.setAttribute('aria-pressed', String(showing === sec));
    b.addEventListener('click', () => {
      /* tapping the live one lets it go, back to everything */
      showing = showing === sec ? 'all' : sec;
      renderFilters();
      renderMenu();
      const top = $('#filters').getBoundingClientRect().top + window.scrollY - 70;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    });
    bar.appendChild(b);
  });
  paintFilterFade();
}

/* fade the right edge only while there is genuinely more to swipe to */
function paintFilterFade() {
  const bar = $('#filters');
  bar.classList.toggle('more', bar.scrollWidth > bar.clientWidth + 2 && bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2);
}

/* ---------- a drink, as the menu lists it ---------- */

/* what's particular about it, as a line of small print */
function notesFor(drink) {
  const out = [];
  if (drink.smoke) {
    out.push({ cls: 'smoke', icon: 'smoke', text: drink.best ? U('chip_smoke_best') : U('chip_smoke') + woodLabel(drink.woods[0]).toLowerCase() });
  }
  if (drink.low) out.push({ cls: 'low', icon: 'low', text: U('chip_low') });
  if (drink.na && !drink.warning) out.push({ cls: 'na', icon: 'none', text: U('chip_na') });
  if (drink.warning) out.push({ cls: 'warn', icon: 'warn', text: U('chip_warn') });
  if (drink.egg) out.push({ cls: 'egg', icon: 'egg', text: U(drink.eggDefault ? 'chip_egg' : 'chip_egg_opt') });
  if (drink.zero) out.push({ cls: 'zero', icon: 'leaf', text: U('chip_zero_opt') });
  if (drink.yuzu) out.push({ cls: 'yuzu', icon: 'drop', text: U('chip_yuzu') });
  if (drink.umami) out.push({ cls: 'umami', icon: 'drop', text: U('chip_umami') });
  return out;
}

function notesLine(items) {
  const line = el('div', 'notes-line');
  items.forEach((n) => {
    const s = el('span', 'note ' + n.cls);
    s.appendChild(icon(n.icon));
    s.appendChild(txt(n.text));
    line.appendChild(s);
  });
  return line;
}

function entryEl(drink, index) {
  const b = el('button', 'entry');
  b.type = 'button';
  b.dataset.drink = drink.id;
  b.style.setProperty('--i', String(index));
  /* a drink that's smoked by default shows its smoke on the menu too */
  b.appendChild(artBox('entry-art', drink, { smoke: !!drink.smoke, egg: !!drink.eggDefault }, 'live'));

  const text = el('div', 'entry-text');
  const name = el('div', 'entry-name');
  name.appendChild(el('span', null, drink.name));
  text.appendChild(name);
  /* what's in it, then how it tastes: what a guest chooses by. The
     story is on the card, for whoever taps through. */
  text.appendChild(el('div', 'entry-inside', drink.inside));
  text.appendChild(el('p', 'entry-hook', tasteLine(drink)));
  const notes = notesFor(drink);
  if (notes.length) text.appendChild(notesLine(notes));
  b.appendChild(text);

  b.addEventListener('click', () => openSheet(drink));
  return b;
}

function renderMenu() {
  const body = $('#menu-body');
  body.innerHTML = '';
  let shown = 0;
  SECTIONS.forEach((sec) => {
    if (showing !== 'all' && showing !== sec) return;
    const list = listed(sec);
    if (!list.length) return;

    const section = el('section', 'section');
    section.id = 'sec-' + sec;
    const head = el('header', 'section-head');
    head.appendChild(el('h2', 'section-title', U('sec_' + sec)));
    head.appendChild(el('p', 'caps', U('sec_' + sec + '_sub')));
    head.appendChild(brushRule());
    section.appendChild(head);

    const grid = el('div', 'entries');
    list.forEach((d, i) => grid.appendChild(entryEl(d, shown + i)));
    section.appendChild(grid);
    body.appendChild(section);
    shown += list.length;
  });
  if (!shown) body.appendChild(el('p', 'no-match', U('bar_quiet_sub')));
}
