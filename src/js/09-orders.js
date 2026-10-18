/* ================================================================
   ORDERS — tickets on the rail, the build behind each one, and a
   seal pressed on every drink that's been poured
   ================================================================ */

/* which builds are open, kept outside the tickets so a redraw restores them */
const openBuilds = new Set();
/* tickets poured since the last draw, so only they get the stamp's thump */
const justPoured = new Set();
let lastOrdersKey = null;
let lastWorking = 0;

/* What the book looks like right now. The shared copy is re-read every
   few seconds, and redrawing on every read would close the build that
   somebody is halfway through reading. */
function ordersKey() {
  return lang + Book.orders.map((o) => [
    o.id, o.at, o.drink, o.guest, o.note || '', o.wood || '',
    (o.done ? 'd' : '') + (o.smoke ? 's' : '') + (o.egg ? 'e' : '') + (o.zero ? 'z' : '') + (o.pending ? 'p' : '')
  ].join('\u0001')).join('\u0002');
}

function aside(cls, label, text) {
  const a = el('div', 'aside ' + cls);
  a.appendChild(el('div', 'caps', label));
  a.appendChild(el('div', null, text));
  return a;
}

function ticketEl(order) {
  const drink = drinkById(order.drink);
  if (!drink) return null;

  const wrap = el('article', 'ticket' + (order.done ? ' done' : ''));
  const main = el('div', 'ticket-main');

  const pour = el('button', 'pour');
  pour.type = 'button';
  pour.setAttribute('role', 'checkbox');
  pour.setAttribute('aria-checked', String(!!order.done));
  pour.setAttribute('aria-label', (order.done ? U('toast_back') : U('toast_poured') + drink.name) + U('toast_for') + order.guest);
  pour.appendChild(icon('tick'));
  pour.addEventListener('click', () => {
    /* noted before the toggle, because the toggle redraws the list */
    const before = Book.find(order.id);
    if (before && !before.done) justPoured.add(order.id);
    const o = Book.toggleDone(order.id);
    if (!o) return;
    toast(o.done ? U('toast_poured') + drink.name + U('toast_for') + o.guest : U('toast_back'), drink, o);
  });
  main.appendChild(pour);
  main.appendChild(artBox('ticket-art', drink, order, 'static'));

  /* the drink, then who it's for and when they asked */
  const text = el('div', 'ticket-text');
  text.appendChild(el('div', 'ticket-drink', drink.name));
  const who = el('div', 'ticket-who');
  who.appendChild(el('span', 'ticket-guest', order.guest));
  const when = el('span', 'ticket-when', ago(order.at));
  when.dataset.at = order.at;
  who.appendChild(when);
  text.appendChild(who);

  /* how it's to be made, in small print */
  const notes = [{ cls: '', icon: 'none', text: drink.method }];
  if (order.smoke) notes.push({ cls: 'smoke', icon: 'smoke', text: U('chip_smoked') + woodLabel(order.wood || drink.woods[0]).toLowerCase() });
  if (order.egg) notes.push({ cls: 'egg', icon: 'egg', text: U('chip_egg') });
  if (order.zero) notes.push({ cls: 'zero', icon: 'leaf', text: U('chip_zero') });
  text.appendChild(notesLine(notes));
  if (order.note) text.appendChild(el('p', 'ticket-note', order.note));
  main.appendChild(text);
  wrap.appendChild(main);

  if (order.done) {
    const stamp = pouredStamp();
    if (justPoured.has(order.id)) stamp.classList.add('fresh');
    wrap.appendChild(stamp);
  }

  /* the build: what goes in, the method, and anything worth knowing */
  const panelId = 'build-' + order.id;
  const toggle = el('button', 'build-toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', String(openBuilds.has(order.id)));
  toggle.setAttribute('aria-controls', panelId);
  toggle.appendChild(icon('chevron'));
  toggle.appendChild(txt(U('the_build')));

  const panel = el('div', 'build-panel');
  panel.id = panelId;
  panel.hidden = !openBuilds.has(order.id);
  panel.appendChild(buildList(drink, order));
  panel.appendChild(stepsList(drink, order));
  if (order.zero && drink.zero) panel.appendChild(aside('zero', U('aside_zero'), drink.zero.note));
  if (order.smoke) {
    const wood = order.wood || drink.woods[0];
    panel.appendChild(aside('smoke', U('aside_smoke') + woodLabel(wood), woodNote(wood)));
  }
  if (drink.warning) panel.appendChild(aside('warn', U('aside_warn'), drink.warning));
  if (drink.tip) panel.appendChild(aside('tip', U('aside_tip'), drink.tip));

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
    if (open) openBuilds.delete(order.id); else openBuilds.add(order.id);
  });
  wrap.appendChild(toggle);
  wrap.appendChild(panel);
  return wrap;
}

function railHead(title, action) {
  const h = el('div', 'rail-head');
  h.appendChild(el('h3', 'rail-title', title));
  if (action) h.appendChild(action);
  return h;
}

function renderOrders(isNew) {
  const key = ordersKey();
  if (key === lastOrdersKey) return;
  lastOrdersKey = key;

  /* an order for a drink that has since come off the menu isn't shown,
     so it isn't counted either */
  const orders = Book.orders.filter((o) => drinkById(o.drink));
  const working = orders.filter((o) => !o.done);
  const poured = orders.filter((o) => o.done);

  $('#tally-working').textContent = working.length;
  $('#tally-poured').textContent = poured.length;
  const counts = [$('#pending-count'), $('#burger-count')];
  counts.forEach((n) => { n.textContent = working.length; n.hidden = !working.length; });
  if (isNew && working.length > lastWorking && $('#tab-orders').getAttribute('aria-selected') !== 'true') {
    counts.forEach((n) => { n.classList.remove('pulse'); void n.offsetWidth; n.classList.add('pulse'); });
  }
  lastWorking = working.length;

  const body = $('#orders-body');
  body.innerHTML = '';

  if (!orders.length) {
    const empty = el('div', 'empty');
    empty.appendChild(emptyGlass());
    empty.appendChild(el('div', 'empty-title', U('bar_quiet')));
    empty.appendChild(el('p', null, U('bar_quiet_sub')));
    body.appendChild(empty);
    return;
  }

  if (working.length) {
    body.appendChild(railHead(U('on_the_rail')));
    const list = el('div', 'tickets');
    working.forEach((o) => { const t = ticketEl(o); if (t) list.appendChild(t); });
    body.appendChild(list);
  }

  if (poured.length) {
    const clear = el('button', 'link-btn', U('clear'));
    clear.type = 'button';
    clear.addEventListener('click', () => Book.clearPoured());
    body.appendChild(railHead(U('poured_title'), clear));
    const list = el('div', 'tickets');
    poured.forEach((o) => { const t = ticketEl(o); if (t) list.appendChild(t); });
    body.appendChild(list);
  }
  justPoured.clear();
}

function paintSync() {
  const tag = $('#sync');
  tag.hidden = !Book.shared;
  if (!Book.shared) return;
  tag.classList.toggle('off', !Book.online);
  tag.textContent = U(Book.online ? 'sync_on' : 'sync_off');
}

/* the house notes and the wood table, folded at the foot of the orders */
function renderNotes() {
  const notes = $('#notes-body');
  notes.innerHTML = '';
  const grid = el('div', 'notes-grid');
  U('notes').forEach((n) => {
    const cell = el('div');
    cell.appendChild(el('h3', null, n.h));
    cell.appendChild(el('p', null, n.p));
    grid.appendChild(cell);
  });
  notes.appendChild(grid);

  const wrap = el('div', 'table-wrap');
  const table = el('table', 'wood-table');
  const head = el('tr');
  U('wood_table_head').forEach((h) => head.appendChild(el('th', 'caps', h)));
  table.appendChild(el('thead')).appendChild(head);
  const tbody = el('tbody');
  U('wood_table').forEach((r) => {
    const tr = el('tr');
    r.forEach((c) => tr.appendChild(el('td', null, c)));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  notes.appendChild(wrap);
}
