/* ================================================================
   MARKS — the small drawings around the menu: the tee, the seal, the
   brushed circle, icons, the eighteenth green, smoke that leaves.
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

/* ---------- the eighteenth: a green beside a raked bunker ---------- */

function greenScene() {
  const rand = seeded('green');
  const svg = S('svg', { viewBox: '0 0 320 150', 'aria-hidden': 'true', focusable: 'false' });
  const defs = S('defs');
  svg.appendChild(defs);

  /* the bunker, raked the way a temple garden is */
  const bunker = wobble(trace((t) => {
    const a = t * Math.PI * 2;
    return [96 + Math.cos(a) * 62 + Math.cos(a * 2) * 6, 112 + Math.sin(a) * 19 + Math.sin(a * 3) * 2];
  }, 40).slice(0, 40), 1.2, rand);
  const bunkerD = smooth(bunker, true);
  const bclip = clipPath(defs, bunkerD);
  svg.appendChild(wash(bunkerD, '#DCCDAE', { fill: '#E9DEC6', alpha: 1, edge: .22, edgeWidth: 1.4, edgeAlpha: .5, clipTo: bclip }));
  const rake = S('g', { 'clip-path': 'url(#' + bclip + ')' });
  for (let i = 1; i <= 7; i++) {
    rake.appendChild(pen(trace((t) => [20 + t * 160, 92 + i * 5.2 + Math.sin(t * Math.PI * 2 + i * .4) * 1.6], 24), .55, { color: '#9C8C6C', alpha: .55 }));
  }
  /* raked in rings around the stone */
  for (let r = 6; r <= 16; r += 4.2) rake.appendChild(pen(arc(64, 110, r * 1.5, r * .6, 0, Math.PI * 2, 26), .55, { color: '#9C8C6C', alpha: .6 }));
  svg.appendChild(rake);
  svg.appendChild(brush(bunker.concat([bunker[0]]), .9, { rand, taper: 0, alpha: .55 }));
  const stone = 'M54,111 Q53,101 62,99 Q72,98 75,105 Q77,112 67,114 Q57,115 54,111 Z';
  svg.appendChild(wash(stone, '#8F8B82', { alpha: .95, edge: .35, edgeWidth: 1 }));
  svg.appendChild(wash('M58,103 Q62,99.4 68,100 Q64,102 58,103 Z', '#7F8F55', { alpha: .85, edge: 0 }));
  svg.appendChild(S('path', { d: stone, fill: 'none', stroke: INK, 'stroke-width': .8, 'stroke-opacity': .75 }));

  /* the green */
  const green = wobble(trace((t) => {
    const a = t * Math.PI * 2;
    return [212 + Math.cos(a) * 92 + Math.sin(a * 2) * 5, 104 + Math.sin(a) * 25 + Math.cos(a * 3) * 2];
  }, 44).slice(0, 44), 1.4, rand);
  const greenD = smooth(green, true);
  const gclip = clipPath(defs, greenD);
  const shade = inkId('turf');
  defs.appendChild(S('radialGradient', { id: shade, cx: .55, cy: .4, r: .65 }, [
    S('stop', { offset: 0, 'stop-color': '#A9B67E' }),
    S('stop', { offset: 1, 'stop-color': '#7E8D55' })
  ]));
  svg.appendChild(wash(greenD, '#7E8D55', { fill: 'url(#' + shade + ')', alpha: .92, edge: .3, edgeWidth: 2, edgeAlpha: .4, clipTo: gclip }));
  const mown = S('g', { 'clip-path': 'url(#' + gclip + ')' });
  for (let i = 0; i < 6; i++) {
    const x = 120 + i * 34;
    mown.appendChild(S('path', { d: poly([[x, 70], [x + 17, 70], [x + 4, 140], [x - 13, 140]]), fill: GOUACHE, 'fill-opacity': .07 }));
  }
  svg.appendChild(mown);
  svg.appendChild(S('path', { d: greenD, fill: 'url(#' + grainPattern(defs, rand, '#3F4A28') + ')' }));
  svg.appendChild(brush(green.concat([green[0]]), 1, { rand, taper: 0, alpha: .6 }));
  /* a few blades at the edge */
  [[126, 112], [131, 115], [292, 98], [297, 101], [250, 128]].forEach(([x, y]) =>
    svg.appendChild(pen([[x, y], [x + 1.2, y - 4.5]], .6, { alpha: .55, straight: true })));

  /* the cup, the pin and the flag */
  svg.appendChild(S('ellipse', { cx: 236, cy: 100, rx: 7, ry: 2.5, fill: INK, 'fill-opacity': .92 }));
  svg.appendChild(pen(arc(236, 100.3, 7, 2.5, Math.PI * .1, Math.PI * .9, 10), .6, { color: GOUACHE, alpha: .6 }));
  svg.appendChild(brush(line([236, 100], [236, 18], 10), 1.4, { rand, taper: .04, even: true }));
  svg.appendChild(brush(line([235.4, 24], [235.4, 92], 4), .5, { color: GOUACHE, alpha: .7, taper: .2, even: true }));
  const flag = S('g', { class: 'pennant' });
  flag.appendChild(S('path', { d: 'M236.6,19 C247,21 258,24.6 270,27.6 C258,30.6 247,34.2 236.6,36.6 Z', fill: SEAL_RED }));
  flag.appendChild(S('text', { x: 244.5, y: 31.2, fill: PAPER_WASH, 'font-size': 9.4 }, [document.createTextNode('18')]));
  svg.appendChild(flag);
  /* the ball, a putt short */
  svg.appendChild(S('ellipse', { cx: 203, cy: 108.6, rx: 4.6, ry: 1.4, fill: INK, 'fill-opacity': .18 }));
  svg.appendChild(S('circle', { cx: 202, cy: 105.4, r: 3.4, fill: GOUACHE, stroke: INK, 'stroke-width': .7, 'stroke-opacity': .8 }));
  return svg;
}

/* ---------- smoke that leaves the glass ---------- */

function smokePlume(seedKey) {
  const rand = seeded(seedKey);
  const svg = S('svg', { viewBox: '0 0 100 300', 'aria-hidden': 'true', focusable: 'false' });
  const drift = (rand() - .5) * 30;
  const pts = trace((t) => [50 + Math.sin(t * Math.PI * 2.6 + rand() * 3) * (6 + t * 16) + drift * t, 300 - t * 300], 40);
  svg.appendChild(brush(pts, (t) => 18 + t * 30, { color: SMOKE_INK, alpha: .06, rand, taper: .15, taperEnd: .3, vary: .4 }));
  svg.appendChild(brush(pts, (t) => 7 + t * 12, { color: SMOKE_INK, alpha: .1, rand, taper: .15, taperEnd: .35, vary: .35 }));
  svg.appendChild(brush(pts, (t) => 2.2 * (1 - t * .5), { color: SMOKE_INK, alpha: .22, rand, taper: .05, taperEnd: .5, vary: .25 }));
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
