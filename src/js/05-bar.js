/* ================================================================
   THE BAR
   The bar with nobody at it: a lit back bar of bottles, a paper
   lantern, and on the hinoki counter the tools of the trade. Tap one
   and it does its party piece for ten seconds: the wine bottles juggle
   themselves, the spoon stirs, the shaker gives a hard shake, and a
   golf ball is chipped into a coupe. An order arriving sets the shaker
   going too.

   Every arrival paints it onto the page the way a painter would, a part
   at a time, and presses the house seal on the front of the bar to
   finish.

   Things are drawn on a stage 340 units wide that keeps its size: up
   to 560px on a phone and 800px on a desktop. The counter and the
   shelves run on past it to the edges of the window. Groups that move
   carry the class `moves` and no transform attribute of their own; a
   parent group places them (bar.css).
   ================================================================ */

const COUNTER_Y = 140;                /* the front edge of the bar top */
const BAR_TOP = COUNTER_Y - 2;        /* where things stand on it */
const LABEL = '#F4F0E8';              /* paper labels */

/* a group the stylesheet animates, sitting inside one that places it */
function joint(x, y, cls) {
  const inner = S('g', { class: 'moves ' + cls });
  const outer = S('g', { transform: 'translate(' + fx(x) + ' ' + fx(y) + ')' }, [inner]);
  return { outer, inner };
}
const moving = (x, y, cls, kids) => {
  const j = joint(x, y, cls);
  kids.forEach((k) => j.inner.appendChild(k));
  return j.outer;
};
/* a thing the painter draws as one: the part of the bar it belongs to,
   where it comes in that part's order, and whether its lines go down in
   the order they're drawn here, the way writing does, rather than the
   longest first (see "painted in") */
const paintAs = (el, part, order, written) => {
  el.setAttribute('data-part', part);
  el.setAttribute('data-order', order);
  if (written) el.setAttribute('data-written', '');
  return el;
};

/* ---------- the room ---------- */

/* The paper lantern hangs on a long cord from the ceiling, above the top
   of the page, in front of the top shelf where nothing stands behind it.
   It sways about where the cord is tied. `ceiling` is the top of the page
   in the stage's units; the lantern's cap sits at LANTERN.y. The painter
   brings the cord down first, draws the lantern on the end of it, then
   writes Paul's name down it. Tapping it opens the drink that isn't on
   the menu. */
const LANTERN = { x: 180, y: 8, scale: 1.25 };
/* the middle of its paper, where the light comes from, and its foot */
const LANTERN_GLOW_Y = LANTERN.y + (36.4 - 14.6) * LANTERN.scale;
const LANTERN_FOOT = LANTERN.y + (56.8 - 14.6) * LANTERN.scale;

/* Paul in katakana, brushed down the paper the way a name goes on a
   chōchin: ポ, the long mark (upright, since it's written downwards), ル.
   Each stroke runs the way the brush goes, in the order it's written, on
   a square 2 wide centred on the character. */
const PAUL = [
  /* ポ: across, down with a hook, the two feet, then the small circle */
  { y: 26.6, ring: [.84, -.84], strokes: [
    [[-.85, -.26], [0, -.33], [.82, -.4]],
    [[.02, -.95], [.03, -.2], [.02, .6], [0, .86], [-.2, .7]],
    [[-.36, .06], [-.6, .38], [-.9, .62]],
    [[.42, .12], [.62, .36], [.84, .56]]
  ] },
  /* ー */
  { y: 36.6, strokes: [[[0, -.75], [.05, 0], [0, .75]]] },
  /* ル: the left stroke sweeping away, then down and up to the right */
  { y: 46.4, strokes: [
    [[-.32, -.92], [-.33, -.2], [-.42, .35], [-.62, .7], [-.92, .92]],
    [[.3, -.92], [.3, -.1], [.3, .62], [.42, .8], [.92, .3]]
  ] }
];
function paulInKatakana() {
  const rand = seeded('paul');
  const g = S('g');
  const size = 4.6;
  PAUL.forEach((ch) => {
    const at = ([u, v]) => [u * size, ch.y + v * size];
    ch.strokes.forEach((pts) => g.appendChild(brush(through(pts.map(at), 5), 1.55, { rand, taper: .12, taperEnd: .45, vary: .2, alpha: .88 })));
    if (ch.ring) {
      const [cx, cy] = at(ch.ring);
      g.appendChild(pen(arc(cx, cy, .95, .95, -Math.PI / 2, Math.PI * 1.5, 14), .7, { alpha: .85, closed: true }));
    }
  });
  return g;
}

function lantern(rand, ceiling) {
  const hang = joint(LANTERN.x, ceiling, 'lantern');
  const drop = LANTERN.y - ceiling;
  const place = 'translate(0 ' + fx(drop - 14.6 * LANTERN.scale) + ') scale(' + LANTERN.scale + ')';
  hang.inner.appendChild(paintAs(pen([[0, 0], [0, drop + 1]], .7, { alpha: .7, straight: true }), 'lantern', 0));
  const g = paintAs(S('g', { transform: place }), 'lantern', 1);
  hang.inner.appendChild(g);
  g.appendChild(S('rect', { x: -3.4, y: 14.6, width: 6.8, height: 3.6, rx: .6, fill: '#3B3530' }));
  const glow = inkId('lamp');
  const body = 'M0,18 C13,18 16.6,28 16.6,36.4 C16.6,46 11,55.4 0,55.4 C-11,55.4 -16.6,46 -16.6,36.4 C-16.6,28 -13,18 0,18 Z';
  g.appendChild(S('defs', {}, [S('radialGradient', { id: glow, cx: .45, cy: .48, r: .6 }, [
    S('stop', { offset: 0, 'stop-color': '#FFF4D8' }),
    S('stop', { offset: .7, 'stop-color': '#F3DDAE' }),
    S('stop', { offset: 1, 'stop-color': '#DDBF8A' })
  ])]));
  g.appendChild(S('path', { d: body, fill: '#EFE6D4' }));
  g.appendChild(S('path', { d: body, fill: 'url(#' + glow + ')', class: 'lantern-light' }));
  /* the bamboo ribs show through the paper */
  for (let y = 22.5; y < 53; y += 4.2) {
    const half = 16.6 * Math.sqrt(Math.max(0, 1 - ((y - 36.6) / 19.4) ** 2));
    g.appendChild(pen(arc(0, y, half, half * .16, Math.PI * .98, Math.PI * .02, 12), .45, { alpha: .22 }));
  }
  g.appendChild(S('path', { d: body, fill: 'none', stroke: INK, 'stroke-width': .9, 'stroke-opacity': .75 }));
  g.appendChild(S('rect', { x: -4.2, y: 54.4, width: 8.4, height: 2.4, rx: .8, fill: '#3B3530' }));
  hang.inner.appendChild(paintAs(S('g', { transform: place, class: 'lantern-name' }, [paulInKatakana()]), 'lantern', 2, true));
  return hang.outer;
}

/* the drink that isn't on the menu, behind the lantern */
const SECRET = 'vieux-carre';
const openSecret = () => { const d = drinkById(SECRET); if (d) openSheet(d); };

/* The bar top and the front of the slab, from x0 to x1, and the vase and
   the bottle at either end of the stage. The long front edge of the bar
   top is the first line the painter draws; the rest of the slab, its
   other edges and its washes, waits until what stands on it is drawn. */
function counter(rand, x0, x1) {
  const g = S('g');
  const top = COUNTER_Y;
  const slab = paintAs(S('g'), 'counter', 14);
  slab.appendChild(wash(poly([[x0, top - 6], [x1, top - 6], [x1, top], [x0, top]]), '#E6D2B0', { alpha: 1, edge: 0 }));
  slab.appendChild(wash(poly([[x0, top], [x1, top], [x1, top + 22], [x0, top + 22]]), '#D2B288', { alpha: 1, edge: 0 }));
  /* grain, in long runs along the slab */
  const runs = Math.ceil((x1 - x0) / 38);
  for (let i = 0; i < runs; i++) {
    const y = top + 3 + (i % 9) * 2.2 + rand() * 1.2;
    const sx = x0 - 40 + (i / runs) * (x1 - x0) + rand() * 50;
    const pts = trace((t) => [sx + t * (180 + rand() * 60), y + Math.sin(t * Math.PI * (1 + rand())) * 1.2], 10);
    slab.appendChild(pen(pts, .35, { color: '#8C6A43', alpha: .28 + rand() * .2 }));
  }
  const edge = paintAs(brush(line([x0, top], [x1, top], Math.ceil((x1 - x0) / 16)), 1.2, { rand, taper: 0 }), 'counter', 0);
  slab.appendChild(pen(line([x0, top - 6], [x1, top - 6], 2), .5, { alpha: .45, straight: true }));
  slab.appendChild(pen(line([x0, top + 22], [x1, top + 22], 2), .7, { alpha: .55, straight: true }));
  slab.appendChild(pen(line([x0, top - 3.2], [x1, top - 3.2], 2), .8, { color: GOUACHE, alpha: .5, straight: true }));
  g.appendChild(slab);
  g.appendChild(edge);

  /* a single branch in a stoneware vase at one end of the stage… */
  const vx = 30, vy = top - 3;
  const vase = paintAs(S('g'), 'counter', 8);
  g.appendChild(vase);
  vase.appendChild(wash('M' + (vx - 5) + ',' + vy + ' Q' + (vx - 7.4) + ',' + (vy - 9) + ' ' + (vx - 2.2) + ',' + (vy - 13) + ' L' + (vx - 2.2) + ',' + (vy - 17) +
    ' L' + (vx + 2.2) + ',' + (vy - 17) + ' L' + (vx + 2.2) + ',' + (vy - 13) + ' Q' + (vx + 7.4) + ',' + (vy - 9) + ' ' + (vx + 5) + ',' + vy + ' Z',
    '#B9AC97', { alpha: .97, edge: .35, edgeWidth: .8, edgeAlpha: .8 }));
  const branch = [[vx, vy - 16], [vx + 3, vy - 30], [vx + 1, vy - 44], [vx + 7, vy - 56]];
  vase.appendChild(brush(branch, 1.2, { rand, taper: .1, taperEnd: .5 }));
  [[vx + 3, vy - 30, 1], [vx + 1.4, vy - 41, -1], [vx + 5.6, vy - 51, 1]].forEach(([x, y, s]) => {
    vase.appendChild(wash(smooth([[x, y], [x + 4 * s, y - 3], [x + 7.5 * s, y - 1.5], [x + 3.6 * s, y + 1.2]], true), '#7F8F55', { alpha: .9, edge: .3, edgeWidth: .5 }));
  });

  /* …and the bottle that's being poured at the other */
  const bx = 334, by = top - 3;
  const bottleD = 'M' + (bx - 5) + ',' + by + ' L' + (bx - 5) + ',' + (by - 22) + ' Q' + (bx - 5) + ',' + (by - 27) + ' ' + (bx - 1.6) + ',' + (by - 29) +
    ' L' + (bx - 1.6) + ',' + (by - 36) + ' L' + (bx + 1.6) + ',' + (by - 36) + ' L' + (bx + 1.6) + ',' + (by - 29) + ' Q' + (bx + 5) + ',' + (by - 27) + ' ' + (bx + 5) + ',' + (by - 22) + ' L' + (bx + 5) + ',' + by + ' Z';
  const bottle = paintAs(S('g'), 'counter', 13);
  g.appendChild(bottle);
  bottle.appendChild(wash(bottleD, '#A86A2C', { alpha: .9, edge: .3, edgeWidth: .8 }));
  bottle.appendChild(S('rect', { x: bx - 4, y: by - 17, width: 8, height: 8, fill: LABEL, stroke: INK, 'stroke-width': .4, 'stroke-opacity': .6 }));
  bottle.appendChild(brush(line([bx - 3, by - 3], [bx - 3, by - 20], 4), .9, { color: GOUACHE, alpha: .6, taper: .3, even: true }));
  bottle.appendChild(S('rect', { x: bx - 2, y: by - 38.5, width: 4, height: 3, fill: '#3B3530' }));
  bottle.appendChild(S('path', { d: bottleD, fill: 'none', stroke: INK, 'stroke-width': .7, 'stroke-opacity': .8 }));
  return g;
}

/* ---------- the back bar ---------- */

/* Bottles, each standing on 0,0: its outline, where the cap sits, and the
   paper label on the front when it has one. */
const BOTTLES = {
  square:   { w: 9.2, neck: -20.6, nw: 1.5, label: [-3.6, -11.4, 7.2, 6.2],
    d: 'M-4.6,0 L4.6,0 L4.6,-14 Q4.6,-16.2 2.4,-16.6 L1.5,-16.8 L1.5,-20.6 L-1.5,-20.6 L-1.5,-16.8 L-2.4,-16.6 Q-4.6,-16.2 -4.6,-14 Z' },
  round:    { w: 7.2, neck: -24.2, nw: 1.2, label: [-3, -9.6, 6, 5],
    d: 'M-3.6,0 L3.6,0 L3.6,-12 Q3.6,-15.6 1.2,-17.2 L1.2,-24.2 L-1.2,-24.2 L-1.2,-17.2 Q-3.6,-15.6 -3.6,-12 Z' },
  slim:     { w: 6, neck: -26.4, nw: 1.1, label: [-2.4, -12.6, 4.8, 7],
    d: 'M-3,0 L3,0 L3,-17 Q3,-19.2 1.1,-20.2 L1.1,-26.4 L-1.1,-26.4 L-1.1,-20.2 Q-3,-19.2 -3,-17 Z' },
  squat:    { w: 11, neck: -16, nw: 1.3, label: [-3.2, -8, 6.4, 4],
    d: 'M-4.4,0 L4.4,0 Q6.2,-5.6 4.2,-10 Q2.8,-12.2 1.3,-12.6 L1.3,-16 L-1.3,-16 L-1.3,-12.6 Q-2.8,-12.2 -4.2,-10 Q-6.2,-5.6 -4.4,0 Z' },
  decanter: { w: 11.2, neck: -18.2, nw: 1.6, label: null,
    d: 'M-4.9,0 L4.9,0 Q5.7,-6.4 4.9,-12.4 Q4.1,-15.2 1.6,-15.6 L1.6,-18.2 L-1.6,-18.2 L-1.6,-15.6 Q-4.1,-15.2 -4.9,-12.4 Q-5.7,-6.4 -4.9,0 Z' }
};
const BOTTLE_KINDS = Object.keys(BOTTLES);
/* whisky, brandy, gin, a blue gin, the bitter red, vermouth, chartreuse,
   amaro, tequila, a green sake bottle, an old gold liqueur */
const SPIRITS = ['#B47A34', '#8C5426', '#D5DED7', '#6E8BA3', '#A93A2E', '#6F2C28', '#7E8F4A', '#4B3A2E', '#E2DBC9', '#5F7656', '#C59A4A'];
/* where each shelf's bottles stand: one high, one behind the counter */
const SHELVES = [44, 100];

const placed = (item) => 'translate(' + fx(item.x) + ' ' + item.y + ') scale(' + fx(item.scale) + ')';

function shelfBottle(item) {
  const b = BOTTLES[item.kind];
  const g = S('g', { transform: placed(item) });
  g.appendChild(wash(b.d, item.color, { alpha: .92, edge: .3, edgeWidth: .7 }));
  if (b.label && item.label) g.appendChild(S('rect', { x: b.label[0], y: b.label[1], width: b.label[2], height: b.label[3], rx: .5, fill: '#F3EDE1', 'fill-opacity': .9 }));
  g.appendChild(pen([[-b.w * .27, -2.2], [-b.w * .27, b.neck * .5]], .7, { color: GOUACHE, alpha: .55, straight: true }));
  g.appendChild(S('rect', { x: -b.nw - .3, y: b.neck - 2.4, width: (b.nw + .3) * 2, height: 2.4, rx: .5, fill: item.gold ? '#B08D4A' : '#3B3530' }));
  g.appendChild(S('path', { d: b.d, fill: 'none', stroke: INK, 'stroke-width': .5, 'stroke-opacity': .55, 'stroke-linejoin': 'round' }));
  return g;
}

/* a lidded jar in celadon or tea-brown glaze, between the bottles */
function shelfJar(item) {
  const g = S('g', { transform: placed(item) });
  const body = 'M-4.6,0 L4.6,0 Q7.2,-5.8 5.2,-10.6 Q3.6,-12.6 0,-12.6 Q-3.6,-12.6 -5.2,-10.6 Q-7.2,-5.8 -4.6,0 Z';
  g.appendChild(wash(body, item.color, { alpha: .95, edge: .3, edgeWidth: .8 }));
  g.appendChild(S('ellipse', { cx: 0, cy: -12.8, rx: 3.8, ry: 1.1, fill: deepen(item.color, .2) }));
  g.appendChild(S('rect', { x: -.9, y: -14.8, width: 1.8, height: 2, rx: .7, fill: deepen(item.color, .3) }));
  g.appendChild(pen(arc(0, -6, 4.4, 4.4, Math.PI * .95, Math.PI * 1.3, 6), .7, { color: GOUACHE, alpha: .5 }));
  g.appendChild(S('path', { d: body, fill: 'none', stroke: INK, 'stroke-width': .5, 'stroke-opacity': .55 }));
  return g;
}

/* What stands on a shelf: little groups of two or three with room between
   them, and now and then a jar. The run is laid out from a fixed point far
   to the left, so a wider window shows more of the same bar rather than a
   different one. Nothing stands where the lantern hangs, or on the lower
   shelf right behind the tall things on the counter. */
const clearOnShelf = [
  (x) => Math.abs(x - 180) > 26,
  (x) => Math.abs(x - 30) > 13 && Math.abs(x - 334) > 9 && Math.abs(x - 160) > 12 && Math.abs(x - 190) > 11
];
function shelfItems(row, x0, x1) {
  const r = seeded('shelf' + row);
  const y = SHELVES[row];
  const clear = clearOnShelf[row];
  const items = [];
  const keep = (item) => { if (item.x > x0 - 12 && item.x < x1 + 12 && clear(item.x)) items.push(item); };
  let x = -1600;
  while (x < x1 + 12) {
    if (r() < .14) {
      const scale = .9 + r() * .2;
      keep({ jar: true, x: x + 6 * scale, y, scale, color: r() < .5 ? '#A9B79E' : '#8B6B4C' });
      x += 12 * scale + 16 + r() * 20;
      continue;
    }
    const n = 2 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) {
      const kind = BOTTLE_KINDS[Math.floor(r() * BOTTLE_KINDS.length)];
      const scale = .9 + r() * .22;
      const w = BOTTLES[kind].w * scale;
      keep({ kind, scale, x: x + w / 2, y, color: SPIRITS[Math.floor(r() * SPIRITS.length)], label: r() < .75, gold: r() < .4 });
      x += w + 1.6;
    }
    x += 16 + r() * 20;
  }
  return items;
}

/* Floating hinoki shelves from one edge of the window to the other, lit
   along the back so the bottles stand against a warm glow. */
function backBar(defs, x0, x1) {
  const g = S('g');
  const glow = inkId('shelfglow');
  defs.appendChild(S('linearGradient', { id: glow, x1: 0, y1: 0, x2: 0, y2: 1 }, [
    S('stop', { offset: 0, 'stop-color': '#FBE3B4', 'stop-opacity': 0 }),
    S('stop', { offset: 1, 'stop-color': '#FBE3B4', 'stop-opacity': .85 })
  ]));
  const shade = inkId('shelfshade');
  defs.appendChild(S('linearGradient', { id: shade, x1: 0, y1: 0, x2: 0, y2: 1 }, [
    S('stop', { offset: 0, 'stop-color': '#5A4630', 'stop-opacity': .16 }),
    S('stop', { offset: 1, 'stop-color': '#5A4630', 'stop-opacity': 0 })
  ]));
  SHELVES.forEach((y, row) => {
    g.appendChild(S('rect', { x: x0, y: y - 26, width: x1 - x0, height: 26, fill: 'url(#' + glow + ')', class: 'shelf-glow' }));
    /* each shelf is painted from the top down: its plank, then what
       stands on it from left to right */
    shelfItems(row, x0, x1).forEach((item, i) => g.appendChild(paintAs(item.jar ? shelfJar(item) : shelfBottle(item), 'shelves', row * 1000 + 1 + i)));
    /* the plank edge-on, and its shadow on the wall */
    g.appendChild(paintAs(S('g', {}, [
      S('rect', { x: x0, y: y + 3.4, width: x1 - x0, height: 5, fill: 'url(#' + shade + ')' }),
      wash(poly([[x0, y], [x1, y], [x1, y + 3.4], [x0, y + 3.4]]), '#D3B48A', { alpha: 1, edge: 0 }),
      pen(line([x0, y + .5], [x1, y + .5], 2), .6, { color: GOUACHE, alpha: .6, straight: true }),
      pen(line([x0, y + 3.4], [x1, y + 3.4], 2), .45, { alpha: .45, straight: true })
    ]), 'shelves', row * 1000));
  });
  return g;
}

/* ---------- on the counter ---------- */

/* A cobbler shaker, the one Japanese bartenders use: a body that widens
   to the shoulder, a strainer cone, a small cap. Drawn standing on 0,0. */
function shaker() {
  const g = S('g');
  const outline = 'M-3.3,0 L3.3,0 L4.6,-14.6 L4.6,-15.8 C4.2,-18 2.9,-19.6 2.2,-20.4 L2.2,-21.2 ' +
    'C2.2,-23.4 1.4,-24.6 0,-24.6 C-1.4,-24.6 -2.2,-23.4 -2.2,-21.2 L-2.2,-20.4 C-2.9,-19.6 -4.2,-18 -4.6,-15.8 L-4.6,-14.6 Z';
  g.appendChild(wash(outline, '#C6C9C5', { alpha: .97, edge: .3, edgeWidth: .8, edgeAlpha: .8 }));
  /* the seams where the cone and the cap sit */
  g.appendChild(pen([[-4.6, -14.8], [4.6, -14.8]], .5, { alpha: .5, straight: true }));
  g.appendChild(pen([[-2.2, -20.6], [2.2, -20.6]], .45, { alpha: .5, straight: true }));
  g.appendChild(brush(line([-1.5, -2], [-2.4, -13.6], 4), 1.1, { color: GOUACHE, alpha: .85, taper: .3, even: true }));
  g.appendChild(brush(line([-1.6, -16.4], [-.9, -19.4], 3), .7, { color: GOUACHE, alpha: .7, taper: .3, even: true }));
  g.appendChild(S('path', { d: outline, fill: 'none', stroke: INK, 'stroke-width': .7, 'stroke-opacity': .8, 'stroke-linejoin': 'round' }));
  return g;
}

/* a bottle of red, standing about its middle */
function wineBottle() {
  const g = S('g');
  const shape = 'M-3.3,8 L3.3,8 L3.3,-2.5 Q3.3,-5.6 1.3,-7.2 L1.3,-12 L-1.3,-12 L-1.3,-7.2 Q-3.3,-5.6 -3.3,-2.5 Z';
  g.appendChild(wash(shape, '#3E5A43', { alpha: .95, edge: .3, edgeWidth: .7 }));
  g.appendChild(S('rect', { x: -2.6, y: -1, width: 5.2, height: 5, fill: LABEL, stroke: INK, 'stroke-width': .35, 'stroke-opacity': .6 }));
  g.appendChild(S('rect', { x: -1.5, y: -13, width: 3, height: 3.4, fill: '#7B2B22' }));
  g.appendChild(brush(line([-1.9, 6], [-1.9, -3], 3), .7, { color: GOUACHE, alpha: .6, taper: .3, even: true }));
  g.appendChild(S('path', { d: shape, fill: 'none', stroke: INK, 'stroke-width': .6, 'stroke-opacity': .8 }));
  return g;
}

/* Everything on the counter is drawn to one scale, the wine bottles' : a
   bottle 30 cm tall is 35 units, so a centimetre is about 1.17. */

/* A Japanese mixing glass, the cut kind, half full and stirred: 11 cm
   tall and 9.5 across the rim, a little narrower at its thick base, with
   a lip on one side to pour from. Drawn standing on 0,0. */
function mixingGlass() {
  const g = S('g');
  const body = 'M-5.3,0 Q-5.7,0 -5.7,-.6 L-6.1,-13.4 L-6.9,-14.1 L6.1,-14.1 L6.1,-13.4 L5.7,-.6 Q5.7,0 5.3,0 Z';
  const defs = S('defs');
  g.appendChild(defs);
  const inside = clipPath(defs, body);
  g.appendChild(S('path', { d: body, fill: GLASS_TINT, 'fill-opacity': .35 }));
  const liquid = 'M-5.2,-1.7 L-5.6,-8.3 L5.6,-8.3 L5.2,-1.7 Z';
  g.appendChild(wash(liquid, '#B4823F', { alpha: .82, edge: .3, edgeWidth: .6, edgeAlpha: .4 }));
  g.appendChild(S('ellipse', { cx: 0, cy: -8.3, rx: 5.6, ry: .9, fill: lighten('#B4823F', .4), 'fill-opacity': .8 }));
  /* the arrow-feather cut on the lower half, inside the glass */
  const cut = S('g', { 'clip-path': 'url(#' + inside + ')' });
  for (let i = -3; i <= 3; i++) {
    cut.appendChild(pen([[i * 2.4 - 3.4, -1.6], [i * 2.4 + 3.4, -9]], .35, { color: GOUACHE, alpha: .45, straight: true }));
    cut.appendChild(pen([[i * 2.4 + 3.4, -1.6], [i * 2.4 - 3.4, -9]], .35, { color: INK, alpha: .14, straight: true }));
  }
  g.appendChild(cut);
  /* the thick base */
  g.appendChild(pen([[-5.6, -1.5], [5.6, -1.5]], .4, { alpha: .35, straight: true }));
  g.appendChild(S('path', { d: body, fill: 'none', stroke: INK, 'stroke-width': .6, 'stroke-opacity': .75, 'stroke-linejoin': 'round' }));
  g.appendChild(S('ellipse', { cx: -.2, cy: -14.1, rx: 6.3, ry: 1, fill: 'none', stroke: INK, 'stroke-width': .5, 'stroke-opacity': .7 }));
  g.appendChild(brush(line([-4.6, -2.4], [-4.9, -12.6], 4), .8, { color: GOUACHE, alpha: .7, taper: .3, even: true }));
  return g;
}

/* a bar spoon, 40 cm, twisted along its length, its foot in the glass and
   drawn from where it leans on the rim */
function barSpoon() {
  const g = S('g');
  const foot = [-2.4, 6], tip = [7, -38];
  g.appendChild(pen([foot, tip], .7, { color: '#8E9391', alpha: 1, straight: true }));
  for (let i = 1; i < 12; i++) {
    const u = i / 12;
    const x = foot[0] + (tip[0] - foot[0]) * u, y = foot[1] + (tip[1] - foot[1]) * u;
    g.appendChild(pen([[x - .7, y + .3], [x + .7, y - .3]], .35, { color: INK, alpha: .45, straight: true }));
  }
  g.appendChild(wash(smooth(arc(tip[0] + .5, tip[1] - 1.6, 1.1, 1.9, 0, Math.PI * 2, 10), true), '#A7ACAA', { alpha: 1, edge: .4, edgeWidth: .5 }));
  return g;
}

/* A smoking gun standing on the counter: a hand-held smoker the size of a
   hair dryer, 16 cm long, its grip down, wood chips smouldering in the
   steel cup on top and its hose lying along the bar. Drawn standing on
   0,0 with its nozzle to the left; the hose is drawn by smokingHose. */
const SMOKER = { x: 72, nozzle: [-11.3, -14.5] };
function smokingGun() {
  const g = S('g');
  const grip = 'M-2.2,0 L4.6,0 Q5.1,0 5,-.6 L4.3,-12.2 L-2.3,-12.2 L-2.9,-.6 Q-2.9,0 -2.2,0 Z';
  const head = 'M6.2,-11.8 L-7.4,-11.8 Q-8.4,-11.8 -8.7,-12.9 L-10.6,-13.1 L-10.6,-15.9 L-8.7,-16.1 Q-8.3,-17.4 -6.9,-17.4 L5,-17.4 Q6.4,-17.4 6.4,-16 Z';
  const cup = 'M.6,-17.2 L5.6,-17.2 L6,-21.6 L.2,-21.6 Z';
  g.appendChild(wash(grip, '#4A4542', { alpha: .95, edge: .3, edgeWidth: .6 }));
  g.appendChild(wash(head, '#55504C', { alpha: .95, edge: .3, edgeWidth: .6 }));
  g.appendChild(wash(cup, '#B9BDBA', { alpha: .97, edge: .3, edgeWidth: .5 }));
  g.appendChild(S('rect', { x: -11.3, y: -16.2, width: 1.1, height: 3.4, rx: .4, fill: '#3B3530' }));
  g.appendChild(S('rect', { x: -2.9, y: -9.8, width: 1.1, height: 2.4, rx: .5, fill: '#3B3530' }));
  /* the chips smouldering in the cup */
  [[2, -21.8, '#C2622F'], [3.4, -22, '#8C3B1E'], [4.5, -21.8, '#C2622F']].forEach(([x, y, c]) => g.appendChild(S('circle', { cx: x, cy: y, r: .55, fill: c })));
  g.appendChild(brush(line([-6.6, -16.4], [4.4, -16.4], 5), .7, { color: GOUACHE, alpha: .45, taper: .3, even: true }));
  g.appendChild(pen([[-1.4, -1.6], [-1.6, -10.6]], .5, { color: GOUACHE, alpha: .35, straight: true }));
  g.appendChild(S('path', { d: grip, fill: 'none', stroke: INK, 'stroke-width': .6, 'stroke-opacity': .8, 'stroke-linejoin': 'round' }));
  g.appendChild(S('path', { d: head, fill: 'none', stroke: INK, 'stroke-width': .6, 'stroke-opacity': .8, 'stroke-linejoin': 'round' }));
  g.appendChild(S('path', { d: cup, fill: 'none', stroke: INK, 'stroke-width': .5, 'stroke-opacity': .8, 'stroke-linejoin': 'round' }));
  g.appendChild(S('ellipse', { cx: 3.1, cy: -21.6, rx: 2.9, ry: .6, fill: 'none', stroke: INK, 'stroke-width': .5, 'stroke-opacity': .8 }));
  return g;
}

/* its hose, from the nozzle down onto the counter and along it, in the
   stage's own units: a soft grey tube with a glint along it */
function smokingHose() {
  const g = S('g');
  const [nx, ny] = [SMOKER.x + SMOKER.nozzle[0], BAR_TOP + SMOKER.nozzle[1]];
  const run = through([[nx, ny], [nx - 3.2, ny + 1], [nx - 5.3, ny + 5.5], [nx - 6.1, ny + 10.7], [nx - 8.5, ny + 13.4], [nx - 13.7, ny + 13.8], [nx - 18.2, ny + 13.5]], 4);
  g.appendChild(pen(run, 1.6, { color: '#9A9F9C', alpha: .75 }));
  g.appendChild(pen(run.map(([x, y]) => [x, y - .45]), .35, { color: GOUACHE, alpha: .5 }));
  const [ex, ey] = run[run.length - 1];
  g.appendChild(S('ellipse', { cx: ex - .2, cy: ey, rx: .5, ry: .85, fill: '#3B3530', 'fill-opacity': .7 }));
  return g;
}

/* Smoke: soft grey wisps that rise and thin out, each on its own slow
   loop. `from` is where it leaves, then where it drifts to, in the
   stage's units. */
const SMOKE_GREY = '#9D978F';
function smokeWisps(paths, opts = {}) {
  const g = S('g');
  const rand = seeded('smoke' + (opts.seed || ''));
  paths.forEach((pts, i) => {
    const wisp = S('g', { class: 'smoke-wisp' });
    wisp.style.animationDelay = (-(i * (opts.every || 2.4)) - rand() * .6).toFixed(2) + 's';
    wisp.appendChild(brush(through(pts, 6), (t) => (opts.width || 2.6) * (.5 + t * .9), { rand, taper: .25, taperEnd: .45, vary: .35, alpha: opts.alpha || .42, color: SMOKE_GREY }));
    g.appendChild(wisp);
  });
  return g;
}

/* a Japanese jigger: two cones point to point */
function jigger() {
  const d = 'M-4.6,-17 L4.6,-17 L1.2,-8.6 L4.2,0 L-4.2,0 L-1.2,-8.6 Z';
  return S('g', {}, [
    wash(d, '#C6C9C5', { alpha: .97, edge: .3, edgeWidth: .7 }),
    S('ellipse', { cx: 0, cy: -17, rx: 4.6, ry: 1, fill: '#9EA3A1' }),
    pen([[-2.6, -15], [-.9, -9.6]], .7, { color: GOUACHE, alpha: .7, straight: true }),
    S('path', { d, fill: 'none', stroke: INK, 'stroke-width': .6, 'stroke-opacity': .75 })
  ]);
}

/* What's on the bar, left to right, the stretch of it each one's button
   covers, and the words a screen reader says for it. */
const PIECES = [
  { id: 'juggle', x0: 82, x1: 124, label: 'piece_juggle' },
  { id: 'stir', x0: 136, x1: 170, label: 'piece_stir' },
  { id: 'shake', x0: 176, x1: 204, label: 'piece_shake' },
  { id: 'chip', x0: 232, x1: 300, label: 'piece_chip' },
  { id: 'smoke', x0: 36, x1: 80, label: 'piece_smoke' }
];

/* each piece as a group: what's always there (.still), and what only
   appears while it performs (.act) */
function drawPieces(rand) {
  const piece = (id, still, act) => {
    const g = S('g', { class: 'piece piece-' + id });
    if (still) g.appendChild(S('g', { class: 'still' }, still));
    if (act) g.appendChild(S('g', { class: 'act' }, act));
    return g;
  };

  /* three wine bottles, and the same three going round in the air */
  /* the painter's order along the counter: the shaker, the mixing glass and
     its spoon, the wine bottles from the right, the smoking gun, then
     (past the vase) the jigger, the tee and its ball, and the coupe */
  const standing = [92, 103, 114].map((x, i) => paintAs(S('g', { transform: 'translate(' + x + ' ' + (BAR_TOP - 14) + ') scale(1.75)' }, [wineBottle()]), 'counter', 6 - i));
  const loop = S('g', { transform: 'translate(103 64)' });
  for (let i = 0; i < 3; i++) {
    const b = S('g', { class: 'moves bottle' }, [S('g', { transform: 'scale(1.4)' }, [wineBottle()])]);
    b.style.animationDelay = (-i * 1.3 / 3).toFixed(2) + 's';
    loop.appendChild(b);
  }

  /* a ball teed up beside a coupe, which is a Sidecar */
  const coupe = paintAs(drawDrink(drinkById('sidecar'), {}, 'static'), 'counter', 12);
  /* a coupe is 15 cm tall: its glass stands 18 units on the counter */
  [['x', 270.9], ['y', BAR_TOP - 30], ['width', 23], ['height', 32.6]].forEach(([k, v]) => coupe.setAttribute(k, v));

  /* the smoking gun, its hose, and the smoke from its cup and hose end */
  const nozzle = [SMOKER.x + SMOKER.nozzle[0] - 18.2, BAR_TOP - .9];
  const cupTop = [SMOKER.x + 3.1, BAR_TOP - 21.8];
  const drift = (x, y) => [
    [[x, y], [x - .8, y - 6], [x + 1.2, y - 12], [x - .6, y - 18], [x + .6, y - 24]],
    [[x, y], [x + 1, y - 5], [x - 1.4, y - 10], [x + .4, y - 16]],
    [[x, y], [x - 1.2, y - 4], [x - .2, y - 9], [x - 1.8, y - 14], [x - 1, y - 20]]
  ];
  const smoke = smokeWisps([
    ...drift(...cupTop),
    [[nozzle[0], nozzle[1]], [nozzle[0] - 3.5, nozzle[1] - 2.4], [nozzle[0] - 5, nozzle[1] - 7.5], [nozzle[0] - 3, nozzle[1] - 12.5], [nozzle[0] - 4.6, nozzle[1] - 18]],
    [[nozzle[0], nozzle[1] + .2], [nozzle[0] - 5, nozzle[1] - .2], [nozzle[0] - 9, nozzle[1] - 1.4], [nozzle[0] - 13, nozzle[1] - 2.2]]
  ]);
  /* tapped, it pours out a good deal more */
  const billow = smokeWisps([
    ...drift(cupTop[0] - 1, cupTop[1]), ...drift(cupTop[0] + 1, cupTop[1] - 1),
    [[nozzle[0], nozzle[1]], [nozzle[0] - 4, nozzle[1] - 4], [nozzle[0] - 3, nozzle[1] - 11], [nozzle[0] - 6, nozzle[1] - 18], [nozzle[0] - 4, nozzle[1] - 26]],
    [[nozzle[0] + 1, nozzle[1]], [nozzle[0] - 2, nozzle[1] - 6], [nozzle[0] + 1, nozzle[1] - 13], [nozzle[0] - 1, nozzle[1] - 21]]
  ], { seed: 'more', every: .9, width: 3.2, alpha: .34 });

  return [
    piece('juggle', standing, [loop]),
    piece('stir', [
      paintAs(S('g', { transform: 'translate(152 ' + BAR_TOP + ')' }, [mixingGlass()]), 'counter', 2),
      paintAs(moving(152, BAR_TOP - 8, 'spoon', [barSpoon()]), 'counter', 3)
    ]),
    /* a cobbler shaker is 23 cm tall */
    piece('shake', [paintAs(moving(190, BAR_TOP, 'shake-body', [S('g', { transform: 'scale(1.1)' }, [shaker()])]), 'counter', 1)]),
    piece('chip', [
      /* a jigger, 9 cm */
      paintAs(S('g', { transform: 'translate(216 ' + BAR_TOP + ') scale(.58)' }, [jigger()]), 'counter', 9),
      coupe,
      paintAs(pen([[244, BAR_TOP], [244, BAR_TOP - 3.6]], 1.1, { color: '#C7A26A', alpha: 1, straight: true }), 'counter', 10),
      paintAs(moving(244, BAR_TOP - 6, 'chip-ball', [S('circle', { cx: 0, cy: 0, r: 2.6, fill: GOUACHE, stroke: INK, 'stroke-width': .6, 'stroke-opacity': .8 })]), 'counter', 11)
    ]),
    piece('smoke', [paintAs(S('g', {}, [
      smokingHose(),
      S('g', { transform: 'translate(' + SMOKER.x + ' ' + BAR_TOP + ')' }, [smokingGun()]),
      smoke
    ]), 'counter', 7)], [billow])
  ];
}

/* how long a piece keeps going, so a short turn never cuts a long one off */
const pieceUntil = {};
const pieceTimers = {};
function perform(id, ms) {
  if (prefersStill()) return;
  const el = $('#scene .piece-' + id);
  if (!el) return;
  pieceUntil[id] = Math.max(pieceUntil[id] || 0, Date.now() + ms);
  el.classList.add('acting');
  clearTimeout(pieceTimers[id]);
  pieceTimers[id] = setTimeout(() => el.classList.remove('acting'), pieceUntil[id] - Date.now());
}

/* an order lands and the shaker goes for a few seconds */
const stirTheBar = () => perform('shake', 3000);

/* ---------- painted in ---------- */

/* On arrival the bar is painted onto the page the way a painter works: a
   part at a time, and each part outlined in ink, then washed with colour,
   then finished with its fine lines and highlights before the hand moves
   on. The counter comes first: the long line of its front edge, then what
   stands on it, the shaker before anything; then the shelves behind, each
   plank and then its bottles; then the lantern, which is lit last; then
   the seal. A tap, a key or a scroll finishes it at once.

   Each thing in the drawing says which part it belongs to and where it
   comes in that part's order (paintAs). What each of its marks is, an ink
   line, a wash, a highlight, is read from how it's drawn (markOf), so a
   drawing needn't be written with the painting in mind. */

/* How long each part's ink, washes and finishing take, in seconds. A part
   with more in it gets a little longer for each thing, up to `most`; past
   that it's drawn faster, and then a quick hand starts the next thing
   before the last is done, the way it runs along a shelf. */
const PAINT_PARTS = [
  { part: 'counter', ink: 3.1, wash: 1.7, finish: .6 },
  { part: 'shelves', ink: 1.5, each: .015, most: 2.4, wash: 1.6, finish: .5 },
  { part: 'lantern', ink: 1.7, wash: .5, finish: .3 }
];
const PAINT_FROM = .5;          /* a moment of bare paper first */
const INK_SPEED = 150;          /* an unhurried hand, in units of the stage a second */
const PAINT_SKIP = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
/* when a tap last finished the painting, so that tap does nothing else */
let paintSkipped = 0;
const PAINTED = 'path, rect, circle, ellipse';
const UNPAINTED = 'defs, clipPath, mask, pattern, .act';
const HIGHLIGHT = [GOUACHE, PAPER_WASH];     /* white, put on last */
const PAPER = [LABEL, '#F3EDE1'];             /* labels: the wash goes round them */
const INKS = [INK, '#3B3530'];

const filled = (s) => (s.getAttribute('fill') || '').toLowerCase() !== 'none';

/* how far the hand travels along a mark, in units of the stage: a stroke
   of the brush is about half the way round its outline */
function reach(s, k, half) {
  let len = 0;
  try { len = s.getTotalLength(); } catch (e) { /* measured from its box below */ }
  if (!len) { const b = s.getBBox(); len = 2 * (b.width + b.height); }
  return len * k * (half ? .5 : 1);
}

/* What a mark is, from how it's drawn: an ink line, a stroke of the brush
   in ink, a dab of ink, a wash, the ring a wash dries to, a label left as
   paper, a fine line, a highlight, or the lantern's light. k is how big
   the mark is drawn against the stage. */
function markOf(s, k) {
  const attr = (a) => (s.getAttribute(a) || '').toUpperCase();
  const num = (a) => { const v = parseFloat(s.getAttribute(a)); return isNaN(v) ? 1 : v; };
  if (/lantern-light/.test(s.getAttribute('class') || '')) return 'light';
  const fill = attr('fill'), stroke = attr('stroke');
  const stroked = stroke !== '' && stroke !== 'NONE';
  if (fill === 'NONE') {
    if (!stroked) return null;
    if (HIGHLIGHT.includes(stroke)) return 'shine';
    const body = s.previousElementSibling;
    if (body && s.getAttribute('d') && body.getAttribute('d') === s.getAttribute('d') && filled(body)) return 'ring';
    if (num('stroke-opacity') < .3 || num('stroke-width') * k < .4 || reach(s, k) < 4) return 'fine';
    return 'line';
  }
  if (stroked && !HIGHLIGHT.includes(stroke)) return 'line';
  if (HIGHLIGHT.includes(fill)) return 'shine';
  if (PAPER.includes(fill)) return 'paper';
  if (INKS.includes(fill) && num('fill-opacity') >= .3) return s.tagName === 'path' ? 'stroke' : 'dab';
  return 'wash';
}

/* which way a stroke of the brush was pulled: from the end its outline
   starts at, along its longer side */
function pulled(s) {
  const b = s.getBBox();
  const m = /M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/.exec(s.getAttribute('d') || '');
  if (b.width >= b.height) return !m || +m[1] - b.x <= b.x + b.width - +m[1] ? 'r' : 'l';
  return !m || +m[2] - b.y <= b.y + b.height - +m[2] ? 'd' : 'u';
}

/* a wash laid along with a wide brush rather than dropped in */
const longWash = (s, k) => { const b = s.getBBox(); return b.width * k > 60 && b.width > b.height * 4; };

function paintIn(box, svg) {
  const view = svg.getScreenCTM();
  if (!view || !box.clientWidth) return;
  const unit = Math.hypot(view.a, view.b);

  /* the hand's timetable: when each mark starts (--d) and how long it takes (--len) */
  const timed = new Set();
  const put = (s, how, at, len) => {
    how.split(' ').forEach((c) => s.classList.add(c));
    if (how.includes('paint-line')) s.setAttribute('pathLength', 1);
    s.style.setProperty('--d', at.toFixed(2) + 's');
    s.style.setProperty('--len', len.toFixed(2) + 's');
    timed.add(s);
    return at + len;
  };

  /* what's in each part, in order, and every mark of every thing */
  const parts = {};
  svg.querySelectorAll('[data-part]').forEach((o) => {
    const part = o.getAttribute('data-part');
    (parts[part] = parts[part] || []).push(o);
  });
  const marks = new Map();
  const marksOf = (o) => {
    if (!marks.has(o)) {
      const shapes = o.matches(PAINTED) ? [o] : Array.from(o.querySelectorAll(PAINTED));
      marks.set(o, shapes.filter((s) => !s.closest(UNPAINTED)).map((s) => {
        const m = s.getScreenCTM();
        const k = m ? Math.hypot(m.a, m.b) / unit : 1;
        const kind = markOf(s, k);
        return { s, k, kind, long: kind === 'wash' && longWash(s, k) };
      }).filter((m) => m.kind));
    }
    return marks.get(o);
  };

  /* The ink: each thing's outlines one after another, the longest first,
     so its contour goes down before what's inside it (or, for writing, in
     the order they're written), and its dark dabs last; then on to the
     next thing. */
  function ink(list, from, time) {
    const plans = list.map((o) => {
      const steps = [];
      let t = 0;
      const lines = marksOf(o).filter((m) => m.kind === 'line' || m.kind === 'stroke')
        .map((m) => [m, reach(m.s, m.k, m.kind === 'stroke')]);
      if (!o.hasAttribute('data-written')) lines.sort((a, b) => b[1] - a[1]);
      lines.forEach(([m, far]) => {
          const len = Math.min(.9, Math.max(.1, far / INK_SPEED));
          steps.push([m, t, len]);
          t += len + .05;
        });
      marksOf(o).forEach((m) => {
        if (m.kind !== 'dab') return;
        steps.push([m, Math.max(0, t - .1), .2]);
        t += .05;
      });
      return { steps, len: t };
    });
    const GAP = .12;
    const whole = plans.reduce((sum, p) => sum + p.len + GAP, 0);
    const pace = Math.min(1.2, Math.max(.3, time / whole));
    const tail = plans.length ? plans[plans.length - 1].len * pace : 0;
    const spread = whole * pace > time ? Math.max(.08, (time - tail) / (whole * pace - tail)) : 1;
    let t = from, end = from;
    plans.forEach((p) => {
      p.steps.forEach(([m, at, len]) => {
        const how = m.kind === 'line' ? 'paint-line' + (filled(m.s) ? ' paint-filled' : '')
          : m.kind === 'dab' || m.s.hasAttribute('clip-path') ? 'paint-fade' : 'paint-wipe-' + pulled(m.s);
        end = Math.max(end, put(m.s, how, t + at * pace, len * pace));
      });
      t += (p.len + GAP) * pace * spread;
    });
    return end;
  }

  /* The colour: the long washes first, laid along one after another with a
     wide brush, then each thing's own, a thing at a time, spreading from
     where the brush touched. The ring a wash dries to comes up after it,
     and a label is left as paper. */
  function washes(list, from, time) {
    let lead = 0, end = from;
    list.forEach((o) => marksOf(o).forEach((m) => {
      if (!m.long) return;
      end = Math.max(end, put(m.s, 'paint-wipe-r', from + lead, Math.min(1.2, Math.max(.5, m.s.getBBox().width * m.k / 320))));
      lead += .15;
    }));
    const coloured = list.filter((o) => marksOf(o).some((m) => m.kind === 'wash' && !m.long));
    const step = Math.min(.14, Math.max(.015, (time - 1.1) / Math.max(1, coloured.length)));
    let t = from + Math.min(lead, .3), n = 0;
    coloured.forEach((o) => {
      const when = new Map();
      /* a thing's own washes go on within a third of a second of each other */
      const inner = Math.min(.05, .3 / marksOf(o).filter((m) => m.kind === 'wash' && !m.long).length);
      let i = 0;
      marksOf(o).forEach((m) => {
        if (m.kind === 'wash' && !m.long) {
          const at = t + i++ * inner;
          when.set(m.s, at);
          end = Math.max(end, put(m.s, m.s.hasAttribute('clip-path') ? 'paint-fade' : 'paint-bleed' + (n++ % 2 ? ' paint-bleed-b' : ''), at, .8));
        } else if (m.kind === 'ring') {
          const body = m.s.previousElementSibling;
          end = Math.max(end, put(m.s, 'paint-fade', (when.has(body) ? when.get(body) : t) + .35, .6));
        } else if (m.kind === 'paper') end = Math.max(end, put(m.s, 'paint-fade', t, .4));
      });
      t += step;
    });
    return end;
  }

  /* The finish: fine lines and highlights, quickly, thing by thing. */
  function finish(list, from, time) {
    const all = [];
    list.forEach((o) => marksOf(o).forEach((m) => { if (m.kind === 'fine' || m.kind === 'shine') all.push(m); }));
    const step = Math.min(.03, (time - .4) / Math.max(1, all.length));
    let end = from;
    all.forEach((m, i) => {
      const line = !filled(m.s);
      end = Math.max(end, put(m.s, line ? 'paint-line' : m.s.hasAttribute('clip-path') ? 'paint-fade' : 'paint-wipe-' + pulled(m.s),
        from + i * step, line ? Math.min(.6, Math.max(.08, reach(m.s, m.k) / 300)) : .3));
    });
    return end;
  }

  let t = PAINT_FROM, menuAt = 0;
  PAINT_PARTS.forEach((p) => {
    const list = (parts[p.part] || []).sort((a, b) => a.getAttribute('data-order') - b.getAttribute('data-order'));
    t = ink(list, t, Math.min(p.most || p.ink, p.ink + (p.each || 0) * list.length));
    t = washes(list, t - .1, p.wash);
    t = finish(list, t - .3, p.finish);
    if (p.part === 'counter') menuAt = t;
  });

  /* the lantern is lit, then its light reaches the room and the shelves */
  const lit = t + .1;
  svg.querySelectorAll('.lantern-light').forEach((s) => put(s, 'paint-fade', lit, .8));
  svg.querySelectorAll('.lantern-glow').forEach((s) => put(s, 'paint-fade', lit + .25, 1.3));
  svg.querySelectorAll('.shelf-glow').forEach((s) => put(s, 'paint-fade', lit + .4, 1.3));
  /* anything the timetable missed comes up with the light, never before */
  svg.querySelectorAll(PAINTED).forEach((s) => {
    if (!timed.has(s) && !s.closest(UNPAINTED + ', .bar-seal')) put(s, 'paint-fade', lit, 1);
  });
  const sealAt = lit + 1.1;
  svg.style.setProperty('--seal-at', sealAt.toFixed(2) + 's');
  /* the menu comes in under the bar once the counter is painted */
  document.documentElement.style.setProperty('--menu-at', menuAt.toFixed(2) + 's');
  box.classList.add('painting');
  document.documentElement.classList.add('painting-page');

  let done = false;
  const end = (e) => {
    if (done) return;
    done = true;
    if (e) paintSkipped = Date.now();
    box.classList.remove('painting');
    document.documentElement.classList.remove('painting-page');
    document.documentElement.style.removeProperty('--menu-at');
    PAINT_SKIP.forEach((type) => window.removeEventListener(type, end));
  };
  PAINT_SKIP.forEach((type) => window.addEventListener(type, end, { passive: true }));
  setTimeout(end, (sealAt + .6) * 1000);
}

/* ---------- the scene ---------- */

const STAGE_W = 340;
/* the drawing runs from 2 units above the stage's top, 176 units down */
const VIEW_TOP = -2, VIEW_TALL = 176;
/* pixels to a unit of the stage */
function stageUnit() {
  const main = $('main');
  const cs = getComputedStyle(main);
  const content = main.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  return Math.min(content, window.innerWidth >= 760 ? 800 : 560) / STAGE_W;
}

/* the width the bar was last drawn at, so a resize only redraws it when it has to */
let sceneWidth = 0;

/* paint: draw it in, the way it arrives on a fresh visit */
function renderScene(paint = false) {
  const box = $('#scene');
  sceneWidth = box.clientWidth;
  const span = Math.max(sceneWidth / stageUnit(), STAGE_W);
  const x0 = 180 - span / 2, x1 = 180 + span / 2;
  const rand = seeded('bar');
  const svg = S('svg', { viewBox: [x0, VIEW_TOP, span, VIEW_TALL].map((n) => fx(n)).join(' '), 'aria-hidden': 'true', focusable: 'false' });
  const defs = S('defs');
  const glow = inkId('room');
  /* the lantern's pool of light, round whatever the width */
  defs.appendChild(S('radialGradient', { id: glow, gradientUnits: 'userSpaceOnUse', cx: LANTERN.x, cy: LANTERN_GLOW_Y, r: 210 }, [
    S('stop', { offset: 0, 'stop-color': '#F2C98C', 'stop-opacity': .5 }),
    S('stop', { offset: .55, 'stop-color': '#EBC48E', 'stop-opacity': .14 }),
    S('stop', { offset: 1, 'stop-color': '#EBC48E', 'stop-opacity': 0 })
  ]));
  svg.appendChild(defs);

  svg.appendChild(backBar(defs, x0 - 2, x1 + 2));
  svg.appendChild(S('rect', { x: x0, y: -2, width: span, height: COUNTER_Y + 2, fill: 'url(#' + glow + ')', class: 'lantern-glow' }));
  /* the top of the page, where the lantern's cord is tied, with room to
     spare in case the header settles taller once its fonts arrive */
  const ceiling = VIEW_TOP - (box.getBoundingClientRect().top + window.scrollY) * span / sceneWidth - 30;
  svg.appendChild(lantern(rand, ceiling));
  svg.appendChild(counter(rand, x0 - 2, x1 + 2));
  drawPieces(rand).forEach((g) => svg.appendChild(g));
  /* the house seal on the front of the bar, the way a painter signs */
  svg.appendChild(S('g', { transform: 'translate(322 151.5)' }, [S('g', { class: 'bar-seal' }, [houseSeal(17)])]));

  box.innerHTML = '';
  box.appendChild(svg);

  /* a real button over each piece: a phone won't reliably tap an SVG shape */
  const taps = el('div', 'piece-taps');
  PIECES.forEach((p) => {
    const b = el('button', 'piece-tap');
    b.type = 'button';
    b.style.left = ((p.x0 - x0) / span * 100).toFixed(3) + '%';
    b.style.width = ((p.x1 - p.x0) / span * 100).toFixed(3) + '%';
    b.setAttribute('aria-label', U(p.label));
    b.addEventListener('click', () => perform(p.id, 10000));
    taps.appendChild(b);
  });
  box.appendChild(taps);

  /* and one over the lantern, which opens the drink that isn't on the menu;
     a tap that only finished the painting doesn't open it as well */
  const lamp = el('button', 'lantern-tap');
  lamp.type = 'button';
  lamp.setAttribute('aria-label', U('secret_line'));
  const lampTop = LANTERN.y - 4;
  lamp.style.left = ((LANTERN.x - 24 - x0) / span * 100).toFixed(3) + '%';
  lamp.style.width = (48 / span * 100).toFixed(3) + '%';
  lamp.style.top = ((lampTop - VIEW_TOP) / VIEW_TALL * 100).toFixed(3) + '%';
  lamp.style.height = ((LANTERN_FOOT + 1 - lampTop) / VIEW_TALL * 100).toFixed(3) + '%';
  lamp.addEventListener('click', () => { if (Date.now() - paintSkipped > 700) openSecret(); });
  box.appendChild(lamp);

  if (paint && !prefersStill()) paintIn(box, svg);
}

/* a turned phone or a resized window gets the bar redrawn to its new width */
function fitScene() {
  const box = $('#scene');
  if (box.clientWidth && box.clientWidth !== sceneWidth) renderScene();
}
