/* ================================================================
   THE BAR — paper, smoke, tabs, language, and switching it all on
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

/* A smoked order: one thin curl of smoke rises from the glass on the slip
   and fades, and nothing else on the page moves. It starts at the rim,
   which sits at a different height in each kind of glass. */
function releaseSmoke(drink) {
  if (prefersStill()) return;
  const curl = smokeCurl('sent' + Date.now());
  const rim = GLASS[drink.glass].rimY / 170;
  curl.style.bottom = ((1 - rim) * 100 - 3).toFixed(1) + '%';
  $('#toast-art').appendChild(curl);
  setTimeout(() => curl.remove(), 3600);
}

/* ---------- tabs and the menu button ---------- */

function showTab(which) {
  const menu = which === 'menu';
  $('#tab-menu').setAttribute('aria-selected', String(menu));
  $('#tab-orders').setAttribute('aria-selected', String(!menu));
  $('#view-menu').hidden = !menu;
  $('#view-orders').hidden = menu;
  /* the window may have changed width while the bar was out of sight */
  if (menu) fitScene();
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

  /* the bar is drawn to the window's width; redraw it once a resize settles */
  let fitTimer;
  window.addEventListener('resize', () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(() => { if (!$('#view-menu').hidden) fitScene(); }, 150);
  });

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

  const choice = $('#choice');
  choice.innerHTML = '';
  choice.appendChild(icon('die'));
  choice.appendChild(el('span', null, U('surprise')));

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
/* the stroke of ink the order button is printed in */
document.documentElement.style.setProperty('--ink-band', inkBand());

applyPhase();
setInterval(applyPhase, 60000);

paintStatic();
/* every arrival paints the bar in, however many times you come back */
renderScene(true);
wireChrome();
/* the golf tee is the exclamation mark in the name, and only that */
$('#tee').appendChild(teeMark());
renderFilters();
renderMenu();
renderOrders();
renderNotes();
paintSync();

onLang(() => {
  paintStatic();
  renderScene();
  renderFilters();
  renderMenu();
  renderOrders();
  renderNotes();
  paintSync();
});

Book.onChange((isNew) => renderOrders(isNew));
Book.onStatus(paintSync);
Book.start();

/* "3 min ago" keeps up with the clock */
setInterval(() => {
  $$('.ticket-when').forEach((n) => { n.textContent = ago(Number(n.dataset.at)); });
}, 30000);
