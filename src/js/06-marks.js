/* ================================================================
   MARKS — the small drawings around the menu: the tee, the seals, icons,
   smoke that leaves.
   ================================================================ */

const SEAL_RED = '#B0392A';

/* a little paper showing through, the way a seal never prints solid */
function speckle(g, rand, cx, cy, w, h, n, color = PAPER_WASH) {
  for (let i = 0; i < n; i++) {
    g.appendChild(S('circle', {
      cx: cx + (rand() - .5) * w, cy: cy + (rand() - .5) * h,
      r: .25 + rand() * .7, fill: color, 'fill-opacity': .55 + rand() * .45
    }));
  }
}

/* ---------- the golf tee: the exclamation mark in Paul's Bar! ---------- */

function teeMark() {
  const rand = seeded('tee');
  const svg = S('svg', { viewBox: '0 0 16 40', 'aria-hidden': 'true', focusable: 'false' });
  const cup = 'M1.4,4.6 Q3.4,10.2 6.6,11.2 L9.4,11.2 Q12.6,10.2 14.6,4.6 Z';
  const shaft = 'M6.6,11.2 L7.4,35.6 Q8,39.4 8.6,35.6 L9.4,11.2 Z';
  svg.appendChild(wash(cup, '#CFAE7C', { alpha: 1, edge: .25, edgeWidth: .6 }));
  svg.appendChild(wash(shaft, '#D3B485', { alpha: 1, edge: .25, edgeWidth: .6 }));
  svg.appendChild(S('ellipse', { cx: 8, cy: 4.6, rx: 6.6, ry: 1.9, fill: '#E9D5B0' }));
  svg.appendChild(S('ellipse', { cx: 8, cy: 4.8, rx: 4, ry: 1, fill: '#9C774A' }));
  svg.appendChild(brush(line([7.4, 13], [7.9, 32], 4), .8, { color: GOUACHE, alpha: .7, taper: .3, even: true }));
  svg.appendChild(S('path', { d: cup + shaft, fill: 'none', stroke: INK, 'stroke-width': .8, 'stroke-opacity': .85, 'stroke-linejoin': 'round' }));
  svg.appendChild(S('ellipse', { cx: 8, cy: 4.6, rx: 6.6, ry: 1.9, fill: 'none', stroke: INK, 'stroke-width': .7, 'stroke-opacity': .8 }));
  return svg;
}

/* ---------- seals ---------- */

/* The house seal: Paul's Bar pressed in vermilion. */
function houseSeal(size = 50, x = 0, y = 0) {
  const rand = seeded('seal');
  const g = S('g', { class: 'seal' });
  const h = size / 2;
  const edge = wobble(join(
    line([x - h, y - h], [x + h, y - h], 6), line([x + h, y - h], [x + h, y + h], 6),
    line([x + h, y + h], [x - h, y + h], 6), line([x - h, y + h], [x - h, y - h], 6)
  ), .5, rand);
  g.appendChild(S('path', { d: smooth(edge, true), fill: SEAL_RED, 'fill-opacity': .94 }));
  g.appendChild(S('path', { d: smooth(wobble(edge.map(([px, py]) => [x + (px - x) * .82, y + (py - y) * .82]), .3, rand), true),
    fill: 'none', stroke: PAPER_WASH, 'stroke-width': .9, 'stroke-opacity': .85 }));
  const word = (text, dy, fs) => S('text', {
    x, y: y + dy, 'text-anchor': 'middle', fill: PAPER_WASH,
    'font-family': 'Cormorant Garamond, serif', 'font-weight': 600, 'font-size': fs
  }, [document.createTextNode(text)]);
  g.appendChild(word("Paul's", -2.2, size * .27));
  g.appendChild(word('Bar', size * .27, size * .3));
  speckle(g, rand, x, y, size * .95, size * .95, 26);
  return g;
}

/* The round seal pressed on a ticket once its drink is poured. */
function pouredStamp() {
  const rand = seeded('poured');
  const svg = S('svg', { viewBox: '0 0 80 80', class: 'stamp', 'aria-hidden': 'true', focusable: 'false' });
  const ring = (r, w) => S('path', {
    d: smooth(wobble(arc(40, 40, r, r, 0, Math.PI * 2, 30).slice(0, 30), .35, rand), true),
    fill: 'none', stroke: SEAL_RED, 'stroke-width': w
  });
  svg.appendChild(ring(35, 2.6));
  svg.appendChild(ring(29.5, .9));
  const label = U('stamp_poured');
  svg.appendChild(S('text', {
    x: 40, y: 44, 'text-anchor': 'middle', fill: SEAL_RED,
    'font-family': lang === 'th' ? 'Anuphan, sans-serif' : 'Jost, sans-serif', 'font-weight': 500,
    'font-size': lang === 'th' ? 12 : 10.5, 'letter-spacing': lang === 'th' ? 0 : 1.6
  }, [document.createTextNode(lang === 'th' ? label : label.toUpperCase())]));
  [[40, 18], [40, 62]].forEach(([cx, cy]) => svg.appendChild(S('circle', { cx, cy, r: 1.6, fill: SEAL_RED })));
  speckle(svg, rand, 40, 40, 70, 70, 34);
  return svg;
}

/* a small square seal, for the one warning on the menu */
function warnSeal() {
  const svg = S('svg', { viewBox: '0 0 26 26', class: 'seal', 'aria-hidden': 'true', focusable: 'false' });
  svg.appendChild(S('rect', { x: 2, y: 2, width: 22, height: 22, rx: 2, fill: SEAL_RED }));
  svg.appendChild(S('path', { d: 'M13 7v8', stroke: PAPER_WASH, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  svg.appendChild(S('circle', { cx: 13, cy: 19, r: 1.5, fill: PAPER_WASH }));
  return svg;
}

/* ---------- the card's paper ---------- */

/* The deckled edge of a sheet of handmade paper, as a mask w × h pixels
   for the card: the edge wanders a few pixels in from the box, slowly
   and finely, the corners are worn round, and the odd fibre stands out
   past it. Each side keeps its own waver, so a card that only grows
   taller keeps its top and bottom edges. Not blurred: WebKit softens a
   blurred mask several times over. */
function paperEdge(w, h) {
  const IN = 3.4, ROUND = 9;
  const side = (name, len) => {
    const rand = seeded('deckle-' + name);
    const slow = wave(rand, Math.max(3, Math.round(len / 120)));
    const n = Math.max(10, Math.round(len / 5));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const along = i / n * len;
      const end = Math.min(along, len - along);
      /* worn round at the corners */
      const worn = end < ROUND ? ROUND * (1 - Math.sqrt(Math.max(0, 1 - ((ROUND - end) / ROUND) ** 2))) : 0;
      pts.push([along, IN * (.5 + .3 * slow(i / n) + .3 * (rand() - .5)) + worn]);
    }
    const hairs = [];
    for (let a = 20 + rand() * 40; a < len - 20; a += 26 + rand() * 60) {
      const tilt = (rand() - .5) * 4;
      hairs.push([[a, IN + 1.2 + rand() * 1.4], [a + tilt, .6 + rand() * .8]]);
    }
    return { pts, hairs };
  };
  /* each side runs clockwise; put it in the box */
  const sides = [
    [side('top', w), ([s, i]) => [s, i]],
    [side('right', h), ([s, i]) => [w - i, s]],
    [side('bottom', w), ([s, i]) => [w - s, h - i]],
    [side('left', h), ([s, i]) => [i, h - s]]
  ];
  const outline = [];
  let hairs = '';
  sides.forEach(([{ pts, hairs: hs }, at]) => {
    pts.slice(0, -1).forEach((p) => outline.push(at(p)));
    hs.forEach(([a, b]) => {
      const [x0, y0] = at(a), [x1, y1] = at(b);
      hairs += '<path d="M' + fx(x0) + ',' + fx(y0) + 'L' + fx(x1) + ',' + fx(y1) + '" stroke="#fff" stroke-width=".6" stroke-opacity=".7"/>';
    });
  });
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + fx(w) + '" height="' + fx(h) + '" viewBox="0 0 ' + fx(w) + ' ' + fx(h) + '">' +
    '<path d="' + smooth(outline, true) + '" fill="#fff"/>' + hairs + '</svg>';
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}

/* One loaded stroke of a wide brush, pulled left to right: dense through
   the middle, running dry at the end. Drawn once as an image and
   stretched to the button that sends an order. */
function inkBand() {
  const rand = seeded('band');
  const W = 400, H = 60;
  const spine = trace((t) => [9 + t * (W - 18), H / 2 + Math.sin(t * Math.PI * 1.2 + .5) * 1.6], 48);
  const d = brushD(spine, (t) => 42 * (.9 + .1 * Math.sin(t * Math.PI)), { rand, taper: .03, taperEnd: .06, vary: .1 });
  let dry = '';
  for (let i = 0; i < 9; i++) {
    const y = 13 + rand() * 34, x0 = W * (.66 + rand() * .16), x1 = W - 8 - rand() * 22;
    dry += '<path d="M' + fx(x0) + ',' + fx(y) + 'L' + fx(x1) + ',' + fx(y + (rand() - .5) * 2.4) + '" stroke="' + PAPER_WASH +
      '" stroke-width="' + fx(.5 + rand() * 1.3) + '" stroke-opacity="' + fx(.18 + rand() * .3) + '" stroke-linecap="round"/>';
  }
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' +
    '<path d="' + d + '" fill="' + INK + '"/>' + dry + '</svg>';
  return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
}

/* ---------- icons, drawn with the same hand ---------- */

const ICONS = {
  /* a die — for when you can't decide */
  die: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2.5" y="2.5" width="11" height="11" rx="2.4"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="5.3" cy="5.3" r=".9" fill="currentColor" stroke="none"/><circle cx="10.7" cy="10.7" r=".9" fill="currentColor" stroke="none"/></svg>',
  close: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M4.5 4.5l11 11M15.5 4.5l-11 11"/></svg>',
  chevron: '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 1.5L7 5 3.5 8.5"/></svg>',
  /* a brushed tick, heavier on the downstroke */
  tick: '<svg viewBox="0 0 20 20"><path d="M3.6 10.4c1.6.9 3 2.4 4.1 4.3.3.5.9.5 1.2 0C10.9 10.6 13.3 7 16.6 3.6c.3-.3-.1-.8-.5-.5-3.4 2.6-5.9 5.8-7.6 9.2-.9-1.4-2.1-2.5-3.6-3.2-.5-.2-.9.5-1.3 1.3z" fill="currentColor"/></svg>',
  /* the small marks in a menu line */
  smoke: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M5 11c-1.8-1.6 1.5-3.1 0-5S5.6 2.8 7 1"/><path d="M8.2 11c-1.1-1 .9-2 0-3.2" opacity=".6"/></svg>',
  drop: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><path d="M6 1.6C4.7 3.7 3.1 5.5 3.1 7.4a2.9 2.9 0 0 0 5.8 0C8.9 5.5 7.3 3.7 6 1.6z"/></svg>',
  leaf: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"><path d="M2.2 9.8C2 5.4 4.8 2.4 9.8 2.2 9.6 7 6.6 9.8 2.2 9.8zM2.2 9.8L6.6 5.4"/></svg>',
  egg: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 1.4c2.1 0 3.8 3 3.8 5.4S8.1 10.6 6 10.6 2.2 9.2 2.2 6.8 3.9 1.4 6 1.4z"/></svg>',
  low: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><circle cx="6" cy="6" r="4.4"/><path d="M1.6 7.2h8.8" /></svg>',
  none: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1"><circle cx="6" cy="6" r="4.4"/></svg>',
  warn: '<svg viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9" rx="1.4" fill="currentColor"/><path d="M6 3.6v3.4" stroke="#F6F2EA" stroke-width="1.2" stroke-linecap="round"/><circle cx="6" cy="8.6" r=".7" fill="#F6F2EA"/></svg>'
};
const icon = (name) => svgFrom(ICONS[name]);

/* a short stroke of the brush under a heading */
function brushRule() {
  const rand = seeded('rule');
  const svg = S('svg', { viewBox: '0 0 56 8', 'aria-hidden': 'true', focusable: 'false' });
  svg.appendChild(brush(trace((t) => [3 + t * 50, 4.6 - Math.sin(t * Math.PI) * 1.1], 12), (t) => 2.6 * (1 - t * .4), { rand, taper: .1, taperEnd: .45, alpha: .75 }));
  return svg;
}

/* ---------- smoke that leaves the glass ---------- */

/* one thin curl, for the glass on the order slip: a pale veil round a
   finer line, drawn from the rim (the foot of the box) upwards */
function smokeCurl(seedKey) {
  const rand = seeded(seedKey);
  const svg = S('svg', { viewBox: '0 0 40 120', class: 'sent-smoke', 'aria-hidden': 'true', focusable: 'false' });
  const lean = (rand() - .5) * 8;
  const turn = rand() * Math.PI * 2;
  const pts = trace((t) => [20 + Math.sin(t * Math.PI * 1.4 + turn) * (1 + t * 5) + lean * t, 120 - t * 116], 24);
  svg.appendChild(brush(pts, (t) => 4 + t * 9, { color: SMOKE_INK, alpha: .12, rand, taper: .2, taperEnd: .3, vary: .3 }));
  svg.appendChild(brush(pts, (t) => 1.8 + t * 3, { color: SMOKE_INK, alpha: .16, rand, taper: .15, taperEnd: .35, vary: .2 }));
  svg.appendChild(brush(pts, (t) => 1 * (1 - t * .5), { color: SMOKE_INK, alpha: .3, rand, taper: .1, taperEnd: .5, vary: .12 }));
  return svg;
}

/* an empty coupe, waiting, for when no one has ordered yet */
function emptyGlass() {
  const geo = geometry(GLASS.coupe);
  const rand = seeded('empty');
  const svg = S('svg', { viewBox: ART_BOX, 'aria-hidden': 'true', focusable: 'false' });
  svg.appendChild(S('ellipse', { cx: CX + 5, cy: geo.groundY + 2.4, rx: geo.groundW + 10, ry: 3.6, fill: INK, 'fill-opacity': .075 }));
  svg.appendChild(drawStemAndFoot(geo, rand));
  svg.appendChild(S('path', { d: smooth(silhouettePts(geo), true), fill: GLASS_TINT, 'fill-opacity': .3 }));
  svg.appendChild(brush(arc(CX, GLASS.coupe.rimY, GLASS.coupe.rimW, GLASS.coupe.rimW * GLASS.coupe.tilt, Math.PI * 1.04, Math.PI * 1.96, 24), .8, { rand, alpha: .5, taper: .3 }));
  svg.appendChild(coupeInk(geo, rand));
  return svg;
}
