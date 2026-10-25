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
    preview.innerHTML = '';
    preview.appendChild(drawDrink(drink, state, 'pour'));
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
  } else {
    const no = el('p', 'no-smoke');
    no.appendChild(el('b', null, U('no_smoke_here')));
    no.appendChild(txt(drink.noSmoke));
    body.appendChild(no);
  }

  if (drink.egg) {
    const egg = optionRow('egg', U('egg_white'), U('egg_why'));
    egg.input.checked = state.egg;
    egg.input.addEventListener('change', () => { state.egg = egg.input.checked; redraw(); });
    body.appendChild(egg.label);
  }


  BITTERS.forEach((b) => {
    if (!drink[b]) return;
    const row = optionRow(b, U(b + '_bitters'), U(b + '_why'));
    row.input.checked = state[b];
    row.input.addEventListener('change', () => { state[b] = row.input.checked; });
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
    sheet.close();
    toast(U('toast_ordered') + drink.name + U('toast_for') + who, drink, state);
    stirTheBar();
    if (state.smoke) releaseSmoke();
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
