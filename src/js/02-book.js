/* ================================================================
   THE ORDER BOOK
   Every order is written to this browser first, so nothing is lost
   when the wifi drops, then to the shared book (Firestore) so every
   phone sees the same list the moment it changes. Without a shared
   book configured, the bar runs on whichever device the orders were
   placed on.
   ================================================================ */

const Book = (() => {
  const shared = !!(BOOK.apiKey && BOOK.projectId);
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

  /* Firebase's own library, fetched only when there is a book to talk
     to. A pinned version, so the page never changes under the bar. */
  const SDK = 'https://www.gstatic.com/firebasejs/12.19.0/';
  let fs = null;
  let db = null;

  /* An order as the book keeps it: the id is the document's name, and
     every field the database's rules allow is always there. */
  const toDoc = (o) => ({
    drink: o.drink, guest: o.guest, smoke: !!o.smoke, wood: o.wood || null,
    egg: !!o.egg, zero: !!o.zero, yuzu: !!o.yuzu, umami: !!o.umami,
    note: o.note || '', at: o.at, done: !!o.done, doneAt: o.doneAt || null
  });
  const fromDoc = (id, d) => ({
    id, drink: d.drink, guest: d.guest, smoke: !!d.smoke, wood: d.wood || null,
    egg: !!d.egg, zero: !!d.zero, yuzu: !!d.yuzu, umami: !!d.umami,
    note: d.note || '', at: Number(d.at), done: !!d.done, doneAt: d.doneAt || null
  });

  const orderDoc = (id) => fs.doc(db, 'orders', id);

  /* Firestore holds a write it can't send yet and sends it when it can,
     so an order is only marked arrived once the book has it. */
  function push(order) {
    if (!db || inflight[order.id]) return;
    order.pending = true;
    inflight[order.id] = true;
    fs.setDoc(orderDoc(order.id), toDoc(order))
      .then(() => { delete inflight[order.id]; order.pending = false; save(); })
      .catch(() => { delete inflight[order.id]; /* goes again with the next change in the book */ });
  }

  /* The whole book, newest first, every time it changes. Orders that
     haven't reached it yet are kept, so a dropped connection never loses
     anybody's drink. */
  function listen() {
    const q = fs.query(fs.collection(db, 'orders'), fs.orderBy('at', 'desc'), fs.limit(200));
    fs.onSnapshot(q, { includeMetadataChanges: true }, (snap) => {
      setOnline(!snap.metadata.fromCache);
      if (snap.metadata.fromCache && !snap.size) return;
      const fresh = snap.docs.map((d) => fromDoc(d.id, d.data()));
      const seen = new Set(fresh.map((o) => o.id));
      const waiting = orders.filter((o) => o.pending && !seen.has(o.id));
      orders = fresh.concat(waiting).sort((a, b) => b.at - a.at);
      save();
      changed(true);
      waiting.forEach(push);
    }, () => setOnline(false));
  }

  function connect() {
    return Promise.all([import(SDK + 'firebase-app.js'), import(SDK + 'firebase-firestore.js')])
      .then(([app, firestore]) => {
        fs = firestore;
        db = fs.getFirestore(app.initializeApp(BOOK));
        listen();
        /* anything placed before the book was reached goes now */
        orders.filter((o) => o.pending).forEach(push);
      })
      .catch(() => setOnline(false));
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
      if (shared) order.pending = true;
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
      else if (db) fs.updateDoc(orderDoc(o.id), { done: o.done, doneAt: o.doneAt }).catch(() => {});
      return o;
    },

    clearPoured() {
      const gone = orders.filter((o) => o.done);
      orders = orders.filter((o) => !o.done);
      save();
      changed(false);
      if (!db || !gone.length) return;
      const batch = fs.writeBatch(db);
      gone.forEach((o) => batch.delete(orderDoc(o.id)));
      batch.commit().catch(() => {});
    },

    start() {
      /* another tab on this device placed or ticked something */
      window.addEventListener('storage', (e) => {
        if (e.key !== KEYS.orders) return;
        orders = store.json(KEYS.orders, []);
        changed(true);
      });
      if (shared) connect();
    }
  };
})();

const guestName = () => store.get(KEYS.guest, '');
const rememberGuest = (name) => store.set(KEYS.guest, name);
