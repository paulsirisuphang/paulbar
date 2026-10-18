/* ================================================================
   THE BAR — paper, arrival, tabs, language, the drink that isn't on
   the list, and switching it all on
   ================================================================ */

/* ---------- washi ---------- */

/* Kozo paper: a tooth of fine specks and long pale fibres, with the odd
   darker one. Drawn once at boot on a canvas that tiles seamlessly — each
   fibre is also drawn shifted by a tile in every direction, so the ones
   that cross an edge come back in on the other side. */
function makeWashi() {
  const rand = seeded('washi');
  const px = 420 * Math.min(2, window.devicePixelRatio || 1);
  const k = px / 420;
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const ctx = c.getContext('2d');
  if (!ctx) return;

  for (let i = 0; i < 7000; i++) {
    const light = rand() < .55;
    ctx.fillStyle = light ? 'rgba(255,253,246,' + (.18 + rand() * .3) + ')' : 'rgba(96,78,52,' + (.04 + rand() * .08) + ')';
    const s = (rand() < .9 ? .7 : 1.4) * k;
    ctx.fillRect(rand() * px, rand() * px, s, s);
  }
  ctx.lineCap = 'round';
  const fibre = (style, width) => {
    const x = rand() * px, y = rand() * px;
    const len = (24 + rand() * 90) * k;
    const a = rand() * Math.PI * 2;
    const bend = (rand() - .5) * len * .6;
    const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
    const mx = (x + ex) / 2 - Math.sin(a) * bend, my = (y + ey) / 2 + Math.cos(a) * bend;
    ctx.strokeStyle = style;
    ctx.lineWidth = width * k;
    for (let dx = -px; dx <= px; dx += px) {
      for (let dy = -px; dy <= px; dy += px) {
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.quadraticCurveTo(mx + dx, my + dy, ex + dx, ey + dy);
        ctx.stroke();
      }
    }
  };
  for (let i = 0; i < 64; i++) fibre('rgba(255,253,247,' + (.1 + rand() * .14) + ')', .35 + rand() * .5);
  for (let i = 0; i < 16; i++) fibre('rgba(120,98,66,' + (.04 + rand() * .05) + ')', .3 + rand() * .4);
  document.documentElement.style.setProperty('--washi', 'url(' + c.toDataURL('image/png') + ')');
}

/* ---------- arriving ---------- */

/* Every arrival gets the brush and the seal, however many times you come
   back through the door. A tap skips it; it never outstays three seconds. */
function arrive() {
  const veil = $('#arrival');
  if (!veil) return;
  if (prefersStill()) { veil.remove(); return; }
  veil.appendChild(arrivalMark());
  let gone = false;
  const open = () => {
    if (gone) return;
    gone = true;
    veil.remove();
    window.removeEventListener('keydown', open);
  };
  veil.addEventListener('click', open);
  veil.addEventListener('touchstart', open, { passive: true });
  window.addEventListener('keydown', open);
  veil.addEventListener('animationend', (e) => { if (e.target === veil) open(); });
  setTimeout(open, 3000);
}

/* ---------- small things that happen ---------- */

let toastTimer;
function toast(message, drink, opts) {
  $('#toast-text').replaceChildren(txt(message));
  const art = $('#toast-art');
  art.innerHTML = '';
  if (drink) art.appendChild(drawDrink(drink, opts || {}, 'static'));
  const t = $('#toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* smoke doesn't stay in the glass */
function releaseSmoke() {
  if (prefersStill()) return;
  const layer = el('div', 'page-smoke');
  for (let i = 0; i < 4; i++) {
    const plume = smokePlume('plume' + Date.now() + i);
    plume.style.left = (4 + i * 24 + Math.random() * 10) + '%';
    plume.style.setProperty('--drift', (Math.random() * 14 - 7) + 'vw');
    plume.style.animationDelay = (i * .25 + Math.random() * .3).toFixed(2) + 's';
    layer.appendChild(plume);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 7000);
}

/* ---------- the drink that isn't on the list ---------- */

const SECRET = 'vieux-carre';
const secretFound = () => store.get(KEYS.found) === '1';
const openSecret = () => { const d = drinkById(SECRET); if (d) openSheet(d); };

/* once the tee has been found, the eighteenth green appears at the foot
   of the menu, and its flag is the way back */
function paintSecret() {
  const spot = $('#secret');
  spot.hidden = !secretFound();
  spot.innerHTML = '';
  if (spot.hidden) return;
  const green = el('div', 'green');
  green.appendChild(greenScene());
  const flag = el('button', 'flag-hit');
  flag.type = 'button';
  flag.setAttribute('aria-label', U('secret_line'));
  flag.addEventListener('click', openSecret);
  green.appendChild(flag);
  spot.appendChild(green);
}

function wireTee() {
  const tee = $('#tee');
  tee.appendChild(teeMark());
  tee.addEventListener('click', () => {
    if (secretFound()) { openSecret(); return; }
    store.set(KEYS.found, '1');
    paintSecret();
    $('#secret').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ---------- tabs and the menu button ---------- */

function showTab(which) {
  const menu = which === 'menu';
  $('#tab-menu').setAttribute('aria-selected', String(menu));
  $('#tab-orders').setAttribute('aria-selected', String(!menu));
  $('#view-menu').hidden = !menu;
  $('#view-orders').hidden = menu;
  if (!menu) $$('.count').forEach((n) => n.classList.remove('pulse'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function setNav(open) {
  $('#burger').setAttribute('aria-expanded', String(open));
  $('#nav-menu').hidden = !open;
}

function wireChrome() {
  const burger = $('#burger');
  const nav = $('#nav-menu');
  burger.addEventListener('click', (e) => { e.stopPropagation(); setNav(nav.hidden); });
  document.addEventListener('click', (e) => { if (!nav.hidden && !nav.contains(e.target)) setNav(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !nav.hidden) setNav(false); });
  $('#tab-menu').addEventListener('click', () => { showTab('menu'); setNav(false); });
  $('#tab-orders').addEventListener('click', () => { showTab('orders'); setNav(false); });

  /* the name takes you home: the whole menu, from the top */
  $('#home').addEventListener('click', () => {
    showing = 'all';
    renderFilters();
    renderMenu();
    showTab('menu');
    setNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('#lang-en').addEventListener('click', () => setLang('en'));
  $('#lang-th').addEventListener('click', () => setLang('th'));

  const choice = $('#choice');
  choice.addEventListener('click', () => {
    const pool = drinks().filter((d) => !d.hidden);
    choice.classList.add('rolling');
    setTimeout(() => choice.classList.remove('rolling'), 600);
    openSheet(pool[Math.floor(Math.random() * pool.length)]);
  });

  $('#filters').addEventListener('scroll', paintFilterFade, { passive: true });
  window.addEventListener('resize', paintFilterFade);
  /* the first measure is taken before the fonts are in, and they change the widths */
  if (document.fonts) document.fonts.ready.then(paintFilterFade);

  /* the bar gets a hairline once the menu slides under it */
  const bar = $('.topbar');
  const paintBar = () => bar.classList.toggle('scrolled', window.scrollY > 4);
  window.addEventListener('scroll', paintBar, { passive: true });
  paintBar();
}

/* the words that aren't rebuilt by a render function */
function paintStatic() {
  document.documentElement.lang = lang;
  $('#lang-en').setAttribute('aria-pressed', String(lang === 'en'));
  $('#lang-th').setAttribute('aria-pressed', String(lang === 'th'));
  $('#tab-menu-text').textContent = U('tab_menu');
  $('#tab-orders-text').textContent = U('tab_orders');
  $('#orders-title').textContent = U('tab_orders');
  $('#tee').setAttribute('aria-label', U('tee_label'));

  const choice = $('#choice');
  choice.innerHTML = '';
  choice.appendChild(icon('die'));
  choice.appendChild(el('span', null, U('surprise')));

  $$('.tender-tap').forEach((b) => b.setAttribute('aria-label', U('tender_tap')));
  $('#notes-summary').textContent = U('bar_notes');
  const summary = $('#notes-summary').parentNode;
  if (!summary.querySelector('svg')) summary.appendChild(icon('chevron'));

  const lede = $('#orders-lede');
  lede.innerHTML = '';
  lede.appendChild(txt(U('orders_lede_a')));
  lede.appendChild(el('b', null, U('orders_lede_b')));
  lede.appendChild(txt(U('orders_lede_c')));
  $('#tally-working-label').textContent = U('working');
  $('#tally-poured-label').textContent = U('poured');
}

/* ---------- switch it on ---------- */

makeWashi();
arrive();

applyPhase();
setInterval(applyPhase, 60000);

paintStatic();
renderCrew();
wireChrome();
wireTee();
paintSecret();
renderFilters();
renderMenu();
renderOrders();
renderNotes();
paintSync();

onLang(() => {
  paintStatic();
  renderFilters();
  renderMenu();
  renderOrders();
  renderNotes();
  paintSecret();
  paintSync();
});

Book.onChange((isNew) => renderOrders(isNew));
Book.onStatus(paintSync);
Book.start();

/* "3 min ago" keeps up with the clock */
setInterval(() => {
  $$('.ticket-when').forEach((n) => { n.textContent = ago(Number(n.dataset.at)); });
}, 30000);
