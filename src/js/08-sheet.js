/* ================================================================
   THE CARD — one drink, opened: its story, what's in it, how it
   tastes, the choices, and the guest's name
   ================================================================ */

/* the method, in the order it's done — smoking the glass comes first,
   egg white swaps in the dry shake, and the bitters go in at the step
   their drink names */
const BITTERS = ['yuzu', 'umami'];

function stepsFor(drink, opts = {}) {
  const list = (opts.egg && drink.eggSteps ? drink.eggSteps : drink.steps).slice();
  BITTERS.forEach((b) => {
    const add = opts[b] && drink[b];
    if (add) list.splice(add.at == null ? list.length : Math.min(add.at, list.length), 0, add.step);
  });
  if (opts.smoke) {
    const wood = opts.wood || drink.woods[0];
    /* the blend gets its own sentence — "the oak + a pinch of cinnamon chip" doesn't read */
    const blended = wood.includes('+');
    let chipName = blended ? woodLabel('Oak') : woodLabel(wood);
    if (lang === 'en') chipName = chipName.toLowerCase();
    list.unshift(U('smoke_step')(chipName, blended));
  }
  return list;
}

function stepsList(drink, opts) {
  const ol = el('ol', 'steps');
  stepsFor(drink, opts).forEach((step) => ol.appendChild(el('li', null, step)));
  return ol;
}

/* what goes in, with its measure, for whoever is behind the bar */
function buildList(drink, opts = {}) {
  const ul = el('ul', 'build');
  drink.build.forEach(([qty, ing]) => {
    const li = el('li', qty ? '' : 'unmeasured');
    li.appendChild(el('span', 'ing', ing));
    li.appendChild(el('span', 'qty', qty));
    ul.appendChild(li);
  });
  /* egg white and the bitters, when they're in, on the end of the list */
  if (opts.egg && drink.egg) {
    const li = el('li', 'added');
    li.appendChild(el('span', 'ing', U('egg_ing')));
    li.appendChild(el('span', 'qty', U('egg_qty')));
    ul.appendChild(li);
  }
  BITTERS.forEach((b) => {
    if (!opts[b] || !drink[b]) return;
    const li = el('li', 'added');
    li.appendChild(el('span', 'ing', U(b + '_ing')));
    li.appendChild(el('span', 'qty', drink[b].qty));
    ul.appendChild(li);
  });
  return ul;
}

/* five rows of ink dots */
function tastingCard(drink) {
  const card = el('div', 'tasting');
  AXES.forEach((axis) => {
    const v = drink.flavor[axis] || 0;
    const row = el('div', 'taste');
    row.appendChild(el('span', 'caps', U('axis_' + axis)));
    const dots = el('span', 'dots');
    dots.setAttribute('role', 'img');
    dots.setAttribute('aria-label', U('axis_' + axis) + ' ' + v + ' / 5');
    for (let i = 1; i <= 5; i++) dots.appendChild(el('i', i <= v ? 'on' : null));
    row.appendChild(dots);
    card.appendChild(row);
  });
  return card;
}

function field(label, ...kids) {
  const f = el('div', 'field');
  f.appendChild(el('div', 'caps', label));
  kids.forEach((k) => f.appendChild(k));
  return f;
}

function optionRow(cls, title, why) {
  const label = el('label', 'option ' + cls);
  const input = el('input');
  input.type = 'checkbox';
  label.appendChild(input);
  const box = el('span', 'box');
  box.appendChild(icon('tick'));
  label.appendChild(box);
  const text = el('span', 'option-text');
  text.appendChild(el('span', 'option-title', title));
  text.appendChild(el('span', 'option-why', why));
  label.appendChild(text);
  return { label, input };
}

const sheet = $('#sheet');

/* The card is printed on a sheet of handmade paper. The sheet sits behind
   the card's contents, and its deckled edge is drawn to the card's size
   each time that changes. */
function paperSheet() {
  const paper = el('div', 'paper');
  paper.setAttribute('aria-hidden', 'true');
  paper.appendChild(el('div', 'paper-sheet'));
  return paper;
}
if ('ResizeObserver' in window) {
  new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect;
    if (width && height) sheet.style.setProperty('--deckle', paperEdge(width, height));
  }).observe(sheet);
}

/* the card fills the dialog, so a click on the dialog itself is the backdrop */
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });

function openSheet(drink) {
  sheet.innerHTML = '';
  sheet.appendChild(paperSheet());
  /* a drink that takes smoke opens with it on, on the wood that suits it
     best (each drink lists that one first), and one that takes a Japanese
     bitters opens with it in; the guest can take either off for the classic */
  const state = {
    smoke: !!drink.smoke, egg: !!drink.eggDefault, wood: drink.woods ? drink.woods[0] : null,
    yuzu: !!drink.yuzu, umami: !!drink.umami
  };

  const form = el('form', 'sheet');
  form.method = 'dialog';

  /* ---------- head: the drink, drawn and named ---------- */
  const head = el('div', 'sheet-head');
  const close = el('button', 'sheet-close');
  close.type = 'button';
  close.setAttribute('aria-label', U('close'));
  close.appendChild(icon('close'));
  close.addEventListener('click', () => sheet.close());
  head.appendChild(close);

  const preview = artBox('preview', drink, state, 'pour');
  head.appendChild(preview);
  const redraw = () => {
    const was = preview.querySelector('image');
    const art = drinkArt(drink, state, 'pour');
    /* the same picture again, say with smoke turned on, doesn't fade back in */
    const now = art.querySelector('image');
    if (was && now && was.getAttribute('href') === now.getAttribute('href')) now.removeAttribute('class');
    preview.innerHTML = '';
    preview.appendChild(art);
  };

  /* no profile words up here: the tasting card below says it better */
  const h2 = el('h2', 'sheet-title', drink.name);
  h2.id = 'sheet-title';
  head.appendChild(h2);
  head.appendChild(el('p', 'sheet-hook', tasteLine(drink)));
  form.appendChild(head);

  /* ---------- body ---------- */
  const body = el('div', 'sheet-body');

  /* the story opens on its most surprising line */
  if (drink.story) body.appendChild(field(U('the_story'), el('p', 'story', drink.hook + ' ' + drink.story)));

  if (drink.warning) {
    const warn = el('div', 'warn-box');
    warn.appendChild(warnSeal());
    const text = el('p');
    text.appendChild(el('b', null, U('heads_up')));
    text.appendChild(txt(drink.warning));
    warn.appendChild(text);
    body.appendChild(warn);
  }

  /* what's in it, as one line in a guest's words; the measures stay
     behind the bar, in the build on the ticket */
  body.appendChild(field(U('whats_in_it'), el('p', 'inside-line', drink.inside)));

  /* egg white, honey and fish, said plainly; it follows the choices below */
  const containsLine = el('p', 'contains-line');
  const containsField = field(U('contains'), containsLine);
  const paintContains = () => {
    const list = containsFor(drink, state).map((k) => U('has_' + k));
    containsField.hidden = !list.length;
    if (!list.length) return;
    const line = list.join(U('list_sep'));
    containsLine.replaceChildren(txt(line.charAt(0).toUpperCase() + line.slice(1)));
  };
  paintContains();
  body.appendChild(containsField);

  body.appendChild(field(U('tastes_like'), tastingCard(drink)));

  if (drink.smoke) {
    const block = el('div');
    const smoke = optionRow('smoke', U('smoke_it'), drink.smokeNote);
    smoke.input.checked = state.smoke;
    block.appendChild(smoke.label);

    const woods = el('div', 'woods');
    woods.hidden = !state.smoke;
    woods.appendChild(el('div', 'caps', U('wood')));
    const row = el('div', 'wood-row');
    const note = el('p', 'wood-note', woodNote(state.wood));
    drink.woods.forEach((w) => {
      const b = el('button', 'wood');
      b.type = 'button';
      b.dataset.wood = w;
      b.appendChild(el('span', null, woodLabel(w)));
      b.setAttribute('aria-pressed', String(w === state.wood));
      b.addEventListener('click', () => {
        state.wood = w;
        $$('.wood', row).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.wood === w)));
        note.replaceChildren(txt(woodNote(w)));
      });
      row.appendChild(b);
    });
    woods.appendChild(row);
    woods.appendChild(note);
    block.appendChild(woods);

    smoke.input.addEventListener('change', () => {
      state.smoke = smoke.input.checked;
      woods.hidden = !state.smoke;
      redraw();
    });
    body.appendChild(block);
  }

  if (drink.egg) {
    const egg = optionRow('egg', U('egg_white'), U('egg_why'));
    egg.input.checked = state.egg;
    egg.input.addEventListener('change', () => { state.egg = egg.input.checked; redraw(); paintContains(); });
    body.appendChild(egg.label);
  }


  BITTERS.forEach((b) => {
    if (!drink[b]) return;
    const row = optionRow(b, U(b + '_bitters'), U(b + '_why'));
    row.input.checked = state[b];
    row.input.addEventListener('change', () => { state[b] = row.input.checked; paintContains(); });
    body.appendChild(row.label);
  });

  const nameInput = el('input', 'write');
  nameInput.type = 'text';
  nameInput.placeholder = U('name_ph');
  nameInput.value = guestName();
  nameInput.maxLength = 40;
  nameInput.autocomplete = 'given-name';
  body.appendChild(field(U('your_name'), nameInput));

  const noteInput = el('textarea', 'write');
  noteInput.placeholder = U('note_ph');
  noteInput.maxLength = 200;
  noteInput.rows = 2;
  body.appendChild(field(U('anything_else'), noteInput));

  form.appendChild(body);

  /* ---------- foot ---------- */
  const foot = el('div', 'sheet-foot');
  const send = el('button', 'btn', U('send'));
  send.type = 'submit';
  foot.appendChild(send);
  form.appendChild(foot);

  nameInput.addEventListener('input', () => nameInput.classList.remove('wanting'));
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const who = nameInput.value.trim();
    if (!who) {
      nameInput.classList.add('wanting');
      nameInput.placeholder = U('name_ph_err');
      nameInput.focus();
      return;
    }
    rememberGuest(who);
    /* the slip, the shaker and the count answer once the order reaches
       the bar; with motion off, that's at once */
    const reached = () => {
      toast(U('toast_ordered') + drink.name + U('toast_for') + who, drink, state);
      stirTheBar();
      if (state.smoke) releaseSmoke(drink);
    };
    const still = prefersStill();
    if (!still) foldAndFly(sheet, drink.color, () => { pulseCounts(); reached(); });
    Book.add({
      id: 'o' + Date.now() + Math.random().toString(36).slice(2, 6),
      drink: drink.id,
      guest: who,
      smoke: state.smoke,
      wood: state.smoke ? state.wood : null,
      egg: state.egg,
      yuzu: !!drink.yuzu && state.yuzu,
      umami: !!drink.umami && state.umami,
      note: noteInput.value.trim(),
      at: Date.now(),
      done: false
    });
    if (still) {
      sheet.close();
      reached();
    }
  });

  sheet.appendChild(form);
  sheet.showModal();
  /* showModal focuses the close button, which would open the card with a
     ring around it. A phone focuses the card itself, so no ring and no
     keyboard over the drawing; a computer goes straight to the name, or
     to Send if the name is already there. Neither scrolls the body. */
  if (window.matchMedia('(hover: none)').matches) sheet.focus({ preventScroll: true });
  else (nameInput.value ? send : nameInput).focus({ preventScroll: true });
  body.scrollTop = 0;
  requestAnimationFrame(() => { body.scrollTop = 0; });
}

/* ================================================================
   HELP ME CHOOSE — two questions, then up to three drinks
   ================================================================ */

const TASTES = ['bitter', 'sweet', 'citrus'];
/* no alcohol, light, medium, strong: the same words the menu prints */
const LEVEL_WORDS = ['heavy_none', 'level_light', 'level_medium', 'level_strong'];
const levelOf = (d) => (d.na && !d.warning ? 0 : d.flavor.strength <= 2 ? 1 : d.flavor.strength === 3 ? 2 : 3);

/* the guest's answers stay put if they close it and open it again */
const chosen = { taste: null, level: null };

/* The drinks that taste most like the answer, at about the strength
   asked for. "No alcohol" only ever offers drinks with none at all, and
   any other answer never offers one. The other side of the taste breaks
   a tie: of two sweet drinks, the less bitter one comes first. */
function picksFor(taste, level) {
  const other = taste === 'bitter' ? 'sweet' : 'bitter';
  return drinks()
    .filter((d) => !d.hidden && !d.out && (levelOf(d) === 0) === (level === 0))
    .map((d, i) => ({ d, i, score: d.flavor[taste] * 2 - Math.abs(levelOf(d) - level) * 4 - d.flavor[other] * .1 }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, 3)
    .map((p) => p.d);
}

/* a row of answers to one question; key is the answer it sets */
function pickRow(key, name, options, onPick) {
  const row = el('div', 'pick-row');
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', name);
  options.forEach(([value, label]) => {
    const b = el('button', 'pick');
    b.type = 'button';
    b.dataset.value = String(value);
    b.appendChild(el('span', null, label));
    b.setAttribute('aria-pressed', String(chosen[key] === value));
    b.addEventListener('click', () => {
      chosen[key] = value;
      $$('.pick', row).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      onPick();
    });
    row.appendChild(b);
  });
  return row;
}

function openChooser() {
  sheet.innerHTML = '';
  sheet.appendChild(paperSheet());
  const form = el('form', 'sheet chooser');
  form.method = 'dialog';
  form.addEventListener('submit', (e) => e.preventDefault());

  const head = el('div', 'sheet-head');
  const close = el('button', 'sheet-close');
  close.type = 'button';
  close.setAttribute('aria-label', U('close'));
  close.appendChild(icon('close'));
  close.addEventListener('click', () => sheet.close());
  head.appendChild(close);
  const h2 = el('h2', 'sheet-title', U('choose'));
  h2.id = 'sheet-title';
  head.appendChild(h2);
  head.appendChild(el('p', 'sheet-hook', U('choose_lede')));
  form.appendChild(head);

  const body = el('div', 'sheet-body');
  const results = el('div', 'choose-results');
  results.setAttribute('aria-live', 'polite');
  const show = () => {
    results.innerHTML = '';
    if (chosen.taste == null || chosen.level == null) return;
    const picks = picksFor(chosen.taste, chosen.level);
    results.appendChild(el('div', 'caps', U('choose_picks')(picks.length)));
    const list = el('div', 'entries');
    picks.forEach((d, i) => list.appendChild(entryEl(d, i)));
    results.appendChild(list);
  };
  body.appendChild(field(U('choose_taste'), pickRow('taste', U('choose_taste'), TASTES.map((t) => [t, U('taste_' + t)]), show)));
  body.appendChild(field(U('choose_strength'), pickRow('level', U('choose_strength'), LEVEL_WORDS.map((w, i) => [i, U(w)]), show)));
  body.appendChild(results);
  show();
  form.appendChild(body);

  sheet.appendChild(form);
  sheet.showModal();
  sheet.focus({ preventScroll: true });
}
