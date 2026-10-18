/* ================================================================
   THE ORDER BOOK
   Every order is written to this browser first, so nothing is lost
   when the wifi drops, then to the shared book (Supabase) so every
   phone sees the same list. Without a shared book configured, the bar
   runs on whichever device the orders were placed on.
   ================================================================ */

const Book = (() => {
  const shared = !!(BOOK.url && BOOK.key);
  let orders = store.json(KEYS.orders, []);
  if (!Array.isArray(orders)) orders = [];

  let online = true;
  const inflight = {};
  const changeFns = [];
  const statusFns = [];

  const save = () => store.set(KEYS.orders, JSON.stringify(orders));
  const changed = (isNew) => changeFns.forEach((fn) => fn(isNew));
  const find = (id) => orders.find((o) => o.id === id) || null;

  function setOnline(next) {
    if (online === next) return;
    online = next;
    statusFns.forEach((fn) => fn(online));
  }

  /* ---------- the wire ---------- */

  function api(path, opts = {}) {
    return fetch(BOOK.url + '/rest/v1/orders' + path, {
      method: opts.method || 'GET',
      headers: {
        apikey: BOOK.key,
        Authorization: 'Bearer ' + BOOK.key,
        'Content-Type': 'application/json',
        /* re-sending an order updates it rather than colliding with itself */
        Prefer: 'return=minimal,resolution=merge-duplicates'
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setOnline(true);
      /* a write answers with an empty body, a read with the book */
      return r.text().then((body) => (body ? JSON.parse(body) : null));
    }).catch((e) => {
      setOnline(false);
      throw e;
    });
  }

  /* The book's columns were fixed before the zero-sugar option existed,
     so that flag travels on the front of the note and is peeled off again. */
  const ZERO_MARK = '~z ';

  const toRow = (o) => ({
    id: o.id, drink: o.drink, guest: o.guest, smoke: !!o.smoke, wood: o.wood || null,
    egg: !!o.egg, note: (o.zero ? ZERO_MARK : '') + (o.note || ''),
    at: o.at, done: !!o.done, done_at: o.doneAt || null
  });
  const fromRow = (r) => {
    const note = r.note || '';
    const zero = note.startsWith(ZERO_MARK);
    return {
      id: r.id, drink: r.drink, guest: r.guest, smoke: !!r.smoke, wood: r.wood,
      egg: !!r.egg, zero, note: zero ? note.slice(ZERO_MARK.length) : note,
      at: Number(r.at), done: !!r.done, doneAt: r.done_at
    };
  };

  function push(order) {
    if (!shared || inflight[order.id]) return;
    order.pending = true;
    inflight[order.id] = true;
    api('', { method: 'POST', body: toRow(order) })
      .then(() => { delete inflight[order.id]; order.pending = false; save(); })
      .catch(() => { delete inflight[order.id]; /* goes again on the next good pull */ });
  }

  /* The whole book, newest first. Orders that haven't reached it yet are
     kept, so a dropped connection never loses anybody's drink. */
  function pull() {
    if (!shared) return Promise.resolve();
    return api('?select=*&order=at.desc&limit=200').then((rows) => {
      if (!rows) return;
      const seen = new Set(rows.map((r) => r.id));
      const waiting = orders.filter((o) => o.pending && !seen.has(o.id));
      orders = rows.map(fromRow).concat(waiting).sort((a, b) => b.at - a.at);
      save();
      changed(true);
      orders.filter((o) => o.pending).forEach(push);
    });
  }

  /* Every three seconds while the book answers; when it doesn't, wait
     longer each time — up to a minute — instead of hammering a book
     that isn't there. Coming back to the tab always asks at once. */
  const QUICK = 3000;
  const SLOW = 60000;
  let wait = QUICK;
  let timer = null;

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(tick, wait);
  }
  function tick() {
    pull()
      .then(() => { wait = QUICK; })
      .catch(() => { wait = Math.min(SLOW, wait * 2); })
      .then(schedule);
  }

  /* ---------- what the rest of the bar uses ---------- */

  return {
    shared,
    get orders() { return orders; },
    get online() { return online; },
    find,

    onChange: (fn) => changeFns.push(fn),
    onStatus: (fn) => statusFns.push(fn),

    add(order) {
      orders.unshift(order);
      save();
      changed(true);
      push(order);
    },

    toggleDone(id) {
      const o = find(id);
      if (!o) return null;
      o.done = !o.done;
      o.doneAt = o.done ? Date.now() : null;
      save();
      changed(false);
      if (o.pending) push(o);
      else if (shared) {
        api('?id=eq.' + encodeURIComponent(o.id), {
          method: 'PATCH', body: { done: o.done, done_at: o.doneAt || null }
        }).catch(() => {});
      }
      return o;
    },

    clearPoured() {
      orders = orders.filter((o) => !o.done);
      save();
      changed(false);
      if (shared) api('?done=eq.true', { method: 'DELETE' }).catch(() => {});
    },

    start() {
      /* another tab on this device placed or ticked something */
      window.addEventListener('storage', (e) => {
        if (e.key !== KEYS.orders) return;
        orders = store.json(KEYS.orders, []);
        changed(true);
      });
      if (!shared) return;
      tick();
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) return;
        wait = QUICK;
        clearTimeout(timer);
        tick();
      });
    }
  };
})();

const guestName = () => store.get(KEYS.guest, '');
const rememberGuest = (name) => store.set(KEYS.guest, name);
