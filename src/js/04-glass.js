/* ================================================================
   THE DRINKS — each one drawn from its own data
   Glass, liquid, ice, bubbles, foam and garnish all come from the
   drink; the options change the drawing (egg white moves a sour into
   a coupe and caps it with foam, smoke sends curls off the rim).
   Seen from a little above, so every rim and surface is an ellipse.

   mode: 'static' — tickets and the toast
         'live'   — the menu; bubbles rise
         'pour'   — the open card; it fills, and the ice melts
   ================================================================ */

const CX = 60;
const ART_BOX = '0 0 120 170';

const GLASS = {
  rocks: { kind: 'tumbler', rimY: 66, rimW: 28, baseY: 146, baseW: 25.5, base: 10, wall: 1.8, tilt: .2, level: .5 },
  tall:  { kind: 'tumbler', rimY: 24, rimW: 19.5, baseY: 148, baseW: 17.5, base: 11, wall: 1.6, tilt: .2, level: .86 },
  coupe: { kind: 'coupe', rimY: 62, rimW: 34, depth: 27, stemY: 142, footW: 19, wall: 1.6, tilt: .22, level: .84 }
};

const CITRUS = {
  orange: { peel: '#E28A33', zest: '#BF6420', pith: '#F7E8C8', flesh: '#F0A04A' },
  lemon:  { peel: '#E7C74A', zest: '#C3A12B', pith: '#F8F1D4', flesh: '#F1DD79' },
  lime:   { peel: '#8EAE48', zest: '#6A8B30', pith: '#EFF2D0', flesh: '#BDD279' }
};
const GLASS_TINT = '#D4DCDA';
const ICE_CLEAR = '#EEF2F0';
const SMOKE_INK = '#8A9497';

/* what the drink looks like once the options are applied */
function visual(drink, opts = {}) {
  const v = {
    glass: drink.glass, color: drink.color, ice: drink.ice, garnish: drink.garnish,
    bubbles: !!drink.bubbles, foam: false, bitters: false, smoke: !!opts.smoke
  };
  /* a sour with egg white goes up in a coupe, no ice, foam on top */
  if (drink.egg && opts.egg) {
    v.glass = 'coupe';
    v.ice = 'none';
    v.foam = true;
    v.bitters = drink.id === 'whiskey-sour';
  }
  return v;
}

/* where the walls are at any height, for either kind of glass */
function geometry(G) {
  if (G.kind === 'tumbler') {
    const outerAt = (y) => G.rimW + (G.baseW - G.rimW) * ((y - G.rimY) / (G.baseY - G.rimY));
    const innerAt = (y) => outerAt(y) - G.wall;
    const bottom = G.baseY - G.base;
    const levelY = bottom - G.level * (bottom - (G.rimY + 4));
    return { G, outerAt, innerAt, bottom, levelY, groundY: G.baseY, groundW: G.baseW };
  }
  const Di = G.depth - G.wall;
  const Ri = G.rimW - G.wall;
  const outerAt = (y) => G.rimW * Math.sqrt(Math.max(0, 1 - ((y - G.rimY) / G.depth) ** 2));
  const innerAt = (y) => Ri * Math.sqrt(Math.max(0, 1 - ((y - G.rimY) / Di) ** 2));
  return {
    G, outerAt, innerAt, Di, Ri,
    bottom: G.rimY + Di,
    levelY: G.rimY + (1 - G.level) * Di,
    groundY: G.stemY, groundW: G.footW
  };
}

/* The inside of the glass filled to y: down one wall, across the bottom,
   up the other, and back along the far edge of the surface. `inset`
   leaves a hair of paper between the wash and the glass's ink line,
   the way a hand-tinted drawing never quite meets its outline. */
function fillPts(geo, y, inset = 0) {
  const { G, bottom } = geo;
  const innerAt = (yy) => Math.max(0, geo.innerAt(yy) - inset);
  const rx = innerAt(y);
  const back = arc(CX, y, rx, rx * G.tilt, 0, -Math.PI, 20);
  if (G.kind === 'tumbler') {
    const bot = bottom - inset * .7;
    const rb = innerAt(bot);
    return join(
      line([CX - rx, y], [CX - rb, bot], 8),
      arc(CX, bot, rb, rb * G.tilt, Math.PI, 0, 20),
      line([CX + rb, bot], [CX + rx, y], 8),
      back
    );
  }
  const Ri = geo.Ri - inset, Di = geo.Di - inset * .7;
  const from = Math.asin(Math.max(-1, Math.min(1, (y - G.rimY) / Di)));
  const left = trace((t) => {
    const p = from + (Math.PI / 2 - from) * t;
    return [CX - Ri * Math.cos(p), G.rimY + Di * Math.sin(p)];
  }, 18);
  const right = left.slice().reverse().map(([x, py]) => [2 * CX - x, py]);
  return join(left, right, back);
}

/* the outside of the glass, for its faint tint */
function silhouettePts(geo) {
  const { G } = geo;
  const backRim = arc(CX, G.rimY, G.rimW, G.rimW * G.tilt, 0, -Math.PI, 20);
  if (G.kind === 'tumbler') {
    return join(
      line([CX - G.rimW, G.rimY], [CX - G.baseW, G.baseY], 6),
      arc(CX, G.baseY, G.baseW, G.baseW * G.tilt, Math.PI, 0, 20),
      line([CX + G.baseW, G.baseY], [CX + G.rimW, G.rimY], 6),
      backRim
    );
  }
  const left = trace((t) => {
    const p = (Math.PI / 2) * t;
    return [CX - G.rimW * Math.cos(p), G.rimY + G.depth * Math.sin(p)];
  }, 18);
  const right = left.slice().reverse().map(([x, y]) => [2 * CX - x, y]);
  return join(left, right, backRim);
}

function drawDrink(drink, opts = {}, mode = 'static') {
  const v = visual(drink, opts);
  const G = GLASS[v.glass];
  const geo = geometry(G);
  const rand = seeded(drink.id + ':' + v.glass + (v.foam ? ':foam' : ''));
  const pouring = mode === 'pour' && !prefersStill();
  const moving = mode !== 'static';

  const svg = S('svg', { viewBox: ART_BOX, 'aria-hidden': 'true', focusable: 'false' });
  const defs = S('defs');
  svg.appendChild(defs);

  /* ---------- the paper under it ---------- */
  svg.appendChild(S('ellipse', {
    cx: CX + 5, cy: geo.groundY + 2.4, rx: geo.groundW + 10, ry: 3.6,
    fill: INK, 'fill-opacity': .075
  }));
  /* light through the drink lands on the paper in the drink's colour */
  svg.appendChild(S('ellipse', {
    cx: CX + 12, cy: geo.groundY + 3.4, rx: geo.groundW * .9, ry: 2.6,
    fill: lighten(v.color, .25), 'fill-opacity': .2
  }));

  if (G.kind === 'coupe') svg.appendChild(drawStemAndFoot(geo, rand));

  /* ---------- the glass, faintly ---------- */
  svg.appendChild(S('path', { d: smooth(silhouettePts(geo), true), fill: GLASS_TINT, 'fill-opacity': .24 }));
  svg.appendChild(brush(arc(CX, G.rimY, G.rimW, G.rimW * G.tilt, Math.PI * 1.04, Math.PI * 1.96, 24), .8,
    { rand, alpha: .5, taper: .3 }));

  /* ---------- inside: liquid, ice, bubbles, foam ---------- */
  const inside = clipPath(defs, smooth(fillPts(geo, G.rimY), true));
  const within = S('g', { 'clip-path': 'url(#' + inside + ')' });
  svg.appendChild(within);

  const L = v.foam ? geo.levelY + 1.5 : geo.levelY;
  const liquid = S('g');
  let reveal = null;
  if (pouring) {
    reveal = S('rect', { x: 0, width: 120, y: geo.bottom + 8, height: 0 });
    const rid = inkId('pour');
    defs.appendChild(S('clipPath', { id: rid }, [reveal]));
    liquid.setAttribute('clip-path', 'url(#' + rid + ')');
  }

  const bodyD = smooth(wobble(fillPts(geo, L, 1.1), .3, rand), true);
  const bodyClip = clipPath(defs, bodyD);
  const grad = inkId('lg');
  defs.appendChild(S('linearGradient', { id: grad, x1: 0, y1: 0, x2: .25, y2: 1 }, [
    S('stop', { offset: 0, 'stop-color': lighten(v.color, .3) }),
    S('stop', { offset: .55, 'stop-color': v.color }),
    S('stop', { offset: 1, 'stop-color': deepen(v.color, .08) })
  ]));
  liquid.appendChild(wash(bodyD, v.color, {
    fill: 'url(#' + grad + ')', alpha: .9, edge: .32, edgeWidth: 2.4, edgeAlpha: .42, clipTo: bodyClip
  }));
  /* the paler bloom where the wash ran back on itself */
  const rxL = geo.innerAt(L) - 1.1;
  liquid.appendChild(S('ellipse', {
    cx: CX - rxL * .32, cy: L + (geo.bottom - L) * .42, rx: rxL * .42, ry: Math.max(4, (geo.bottom - L) * .24),
    fill: lighten(v.color, .55), 'fill-opacity': .2, 'clip-path': 'url(#' + bodyClip + ')'
  }));
  liquid.appendChild(S('path', { d: bodyD, fill: 'url(#' + grainPattern(defs, rand, deepen(v.color, .5)) + ')' }));

  if (v.garnish === 'cherry') liquid.appendChild(cherry(geo, L, rand));

  /* ice: tinted where it sits in the drink, clear where it rises out */
  const cubes = iceFor(v.ice, geo, L, rand);
  const below = S('g', { 'clip-path': 'url(#' + clipPath(defs, poly([[0, L], [120, L], [120, 170], [0, 170]])) + ')' });
  const above = S('g', { 'clip-path': 'url(#' + clipPath(defs, poly([[0, 0], [120, 0], [120, L], [0, L]])) + ')' });
  const lines = S('g');
  cubes.forEach((c) => {
    const melt = () => S('g', { class: pouring ? 'melt' : null });
    const place = () => S('g', { transform: 'translate(' + fx(c.x) + ' ' + fx(c.y) + ') rotate(' + fx(c.rot) + ')' });
    const b = place(), bm = melt(); b.appendChild(bm);
    bm.appendChild(S('path', { d: c.d, fill: lighten(v.color, .58), 'fill-opacity': .74 }));
    below.appendChild(b);
    const a = place(), am = melt(); a.appendChild(am);
    am.appendChild(S('path', { d: c.d, fill: ICE_CLEAR, 'fill-opacity': .8 }));
    above.appendChild(a);
    const l = place(), lm = melt(); l.appendChild(lm);
    c.lines.forEach((n) => lm.appendChild(n));
    lines.appendChild(l);
  });
  liquid.appendChild(below);

  /* the surface, lighter where it catches the sky, and its waterline */
  const ry = rxL * G.tilt;
  liquid.appendChild(S('ellipse', { cx: CX, cy: L, rx: rxL, ry, fill: lighten(v.color, .46), 'fill-opacity': .78 }));
  liquid.appendChild(brush(arc(CX, L, rxL - 3, ry - .7, -Math.PI * .86, -Math.PI * .6, 6), 1.1,
    { color: GOUACHE, alpha: .75, taper: .4, even: true }));

  within.appendChild(liquid);
  within.appendChild(above);
  within.appendChild(lines);
  if (G.kind === 'tumbler' && v.garnish === 'orange-slice') within.appendChild(sunkenSlice(geo, L, rand, v.color));

  const surface = S('g');
  if (reveal) surface.setAttribute('clip-path', liquid.getAttribute('clip-path'));
  surface.appendChild(pen(arc(CX, L, rxL, ry, Math.PI, 0, 22), .7, { color: deepen(v.color, .38), alpha: .55 }));
  if (v.bubbles) bubblesIn(surface, geo, L, rand, moving);
  if (v.foam) surface.appendChild(foam(geo, rand, v.bitters));
  within.appendChild(surface);

  /* ---------- garnish that sits on the rim goes behind the glass's ink,
     so the rim and the wall cross it the way a slot would ---------- */
  const g = v.garnish;
  if (g === 'lemon-wheel') svg.appendChild(wheel(geo, CITRUS.lemon, rand));
  else if (/-wedge$/.test(g)) svg.appendChild(wedge(geo, CITRUS[g.split('-')[0]], rand));

  /* ---------- the glass in ink, then light on it ---------- */
  svg.appendChild(G.kind === 'tumbler' ? tumblerInk(geo, rand) : coupeInk(geo, rand));

  /* ---------- garnish that hangs in front, and smoke ---------- */
  if (/-twist$/.test(g)) svg.appendChild(twist(geo, CITRUS[g.split('-')[0]], rand));
  if (g === 'cherry') svg.appendChild(pick(geo, rand));

  if (v.smoke) svg.appendChild(smokeOver(geo, rand, mode === 'pour'));

  if (reveal) pour(reveal, geo, L - ry - 8);
  return svg;
}

/* fill from the bottom up over most of a second, easing as it tops up */
function pour(rect, geo, top) {
  const from = geo.bottom + 8;
  const start = performance.now();
  const D = 950;
  const step = (now) => {
    const t = Math.min(1, (now - start) / D);
    const e = 1 - Math.pow(1 - t, 3);
    const y = from - (from - top) * e;
    rect.setAttribute('y', fx(y));
    rect.setAttribute('height', fx(from - y + 2));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(() => requestAnimationFrame(step));
}

/* ---------- the glass ---------- */

function tumblerInk(geo, rand) {
  const { G } = geo;
  const t = G.tilt;
  const ink = S('g');
  /* the thick bottom, a band of glass between two ellipses */
  const ob = geo.outerAt(geo.bottom);
  ink.appendChild(S('path', {
    d: smooth(join(
      line([CX - ob, geo.bottom], [CX - G.baseW, G.baseY], 3),
      arc(CX, G.baseY, G.baseW, G.baseW * t, Math.PI, 0, 20),
      line([CX + G.baseW, G.baseY], [CX + ob, geo.bottom], 3),
      arc(CX, geo.bottom, ob, ob * t, 0, Math.PI, 20)
    ), true),
    fill: GLASS_TINT, 'fill-opacity': .5
  }));
  ink.appendChild(pen(arc(CX, geo.bottom, geo.innerAt(geo.bottom), geo.innerAt(geo.bottom) * t, Math.PI * .97, Math.PI * .03, 18), .6, { alpha: .4 }));
  /* walls */
  ink.appendChild(brush(wobble(line([CX - G.rimW, G.rimY], [CX - G.baseW, G.baseY], 12), .3, rand), 1.55, { rand, taper: .05 }));
  ink.appendChild(brush(wobble(line([CX + G.rimW, G.rimY], [CX + G.baseW, G.baseY], 12), .3, rand), 1.45, { rand, taper: .05 }));
  /* the lip: a heavier front edge with the glass's thickness just inside it */
  ink.appendChild(brush(arc(CX, G.rimY, G.rimW, G.rimW * t, Math.PI, 0, 26), 1.35, { rand, taper: .08 }));
  ink.appendChild(pen(arc(CX, G.rimY + 1, G.rimW - 1.7, (G.rimW - 1.7) * t, Math.PI * .9, Math.PI * .1, 18), .5, { alpha: .32 }));
  ink.appendChild(brush(arc(CX, G.baseY, G.baseW, G.baseW * t, Math.PI, 0, 24), 1.5, { rand, taper: .1 }));
  /* white gouache: a long gleam down the left, a short one on the right */
  ink.appendChild(brush(line([CX - G.rimW + 4.8, G.rimY + 9], [CX - G.baseW + 4.4, geo.bottom - 4], 8), 2.3,
    { color: GOUACHE, alpha: .8, rand, taper: .35 }));
  ink.appendChild(brush(line([CX + G.rimW - 5.2, G.rimY + 14], [CX + G.rimW - 5.6, G.rimY + 14 + (geo.bottom - G.rimY) * .28], 5), 1.2,
    { color: GOUACHE, alpha: .62, taper: .45, even: true }));
  ink.appendChild(brush(arc(CX, G.baseY - 3.4, G.baseW - 5, (G.baseW - 5) * t, Math.PI * .82, Math.PI * .6, 6), 1.3,
    { color: GOUACHE, alpha: .7, taper: .4, even: true }));
  return ink;
}

function coupeInk(geo, rand) {
  const { G } = geo;
  const t = G.tilt;
  const ink = S('g');
  const left = trace((u) => {
    const p = (Math.PI / 2) * u;
    return [CX - G.rimW * Math.cos(p), G.rimY + G.depth * Math.sin(p)];
  }, 20);
  const right = left.slice().reverse().map(([x, y]) => [2 * CX - x, y]);
  ink.appendChild(brush(wobble(join(left, right), .28, rand), 1.45, { rand, taper: .04 }));
  ink.appendChild(brush(arc(CX, G.rimY, G.rimW, G.rimW * t, Math.PI, 0, 28), 1.3, { rand, taper: .08 }));
  ink.appendChild(pen(arc(CX, G.rimY + 1, G.rimW - 1.7, (G.rimW - 1.7) * t, Math.PI * .9, Math.PI * .1, 18), .5, { alpha: .3 }));
  /* gleam along the inside of the bowl */
  ink.appendChild(brush(trace((u) => {
    const p = .2 + .72 * u;
    return [CX - (geo.Ri - 4) * Math.cos(p), G.rimY + 1.5 + (geo.Di - 4) * Math.sin(p)];
  }, 10), 2.1, { color: GOUACHE, alpha: .78, rand, taper: .4 }));
  return ink;
}

function drawStemAndFoot(geo, rand) {
  const { G } = geo;
  const g = S('g');
  const top = G.rimY + G.depth - .6;
  const fr = G.footW * G.tilt;
  g.appendChild(S('ellipse', { cx: CX, cy: G.stemY, rx: G.footW, ry: fr, fill: GLASS_TINT, 'fill-opacity': .45 }));
  g.appendChild(brush(arc(CX, G.stemY, G.footW, fr, Math.PI * 1.04, Math.PI * 1.96, 18), .7, { rand, alpha: .45, taper: .3 }));
  /* a rod of glass that swells into the bowl above and the foot below */
  const bot = G.stemY - fr * .4;
  const half = (u) => 1.2 + (u < .16 ? ((1 - u / .16) ** 2) * 2.8 : 0) + (u > .78 ? (((u - .78) / .22) ** 2) * 4.2 : 0);
  const leftEdge = trace((u) => [CX - half(u), top + (bot - top) * u], 18);
  const rightEdge = trace((u) => [CX + half(u), top + (bot - top) * u], 18);
  g.appendChild(S('path', { d: smooth(join(leftEdge, rightEdge.slice().reverse()), true), fill: GLASS_TINT, 'fill-opacity': .7 }));
  g.appendChild(brush(leftEdge, .85, { rand, taper: .12 }));
  g.appendChild(brush(rightEdge, .8, { rand, taper: .12 }));
  g.appendChild(brush(line([CX - .35, top + 7], [CX - .35, bot - 6], 4), .6, { color: GOUACHE, alpha: .8, taper: .3, even: true }));
  g.appendChild(brush(arc(CX, G.stemY, G.footW, fr, Math.PI, 0, 22), 1.35, { rand, taper: .12 }));
  return g;
}

/* ---------- ice ---------- */

/* A cube as a softened square drawn about its own centre — it is placed
   and rotated by a parent group, so a melt can scale it in place. */
function cube(size, rand) {
  const h = size / 2;
  const r = size * .2;
  const corner = (cx, cy, a0) => arc(cx, cy, r, r, a0, a0 + Math.PI / 2, 4);
  const pts = wobble(join(
    corner(h - r, h - r, 0), corner(-h + r, h - r, Math.PI / 2),
    corner(-h + r, -h + r, Math.PI), corner(h - r, -h + r, Math.PI * 1.5)
  ), size * .012, rand);
  const d = smooth(pts, true);
  const lines = [
    /* the far edges, seen through the ice */
    pen([[-h * .7 + 2.4, -h * .7 - 2.4], [h * .7 + 2.4, -h * .7 - 2.4], [h * .7 + 2.4, h * .7 - 2.4], [-h * .7 + 2.4, h * .7 - 2.4], [-h * .7 + 2.4, -h * .7 - 2.4]],
      .45, { alpha: .2, straight: true }),
    S('path', { d, fill: 'none', stroke: INK, 'stroke-width': .9, 'stroke-opacity': .62, 'stroke-linejoin': 'round' }),
    brush(line([-h + r * .7, -h + 2.2], [h * .3, -h + 1.6], 5), 1.3, { color: GOUACHE, alpha: .85, taper: .4, even: true }),
    brush(line([-h + 2, -h + r * .9], [-h + 1.6, h * .15], 5), 1.1, { color: GOUACHE, alpha: .7, taper: .4, even: true })
  ];
  return { d, lines };
}

function iceFor(kind, geo, L, rand) {
  const B = geo.bottom;
  let spots = [];
  if (kind === 'cube') spots = [[CX + 1, B - 19, 36, -7]];
  if (kind === 'cubes') spots = [[CX - 7, B - 13, 23, -12], [CX + 8, B - 31, 22, 14]];
  /* a highball is packed to the top: stack them until one breaks the surface */
  if (kind === 'tall') {
    for (let y = B - 11, i = 0; y > L; y -= 20, i++) {
      spots.push([CX + (i % 2 ? 2.5 : -1.5), y, 19 - i * .3, i % 2 ? 11 : -8]);
    }
  }
  return spots.map(([x, y, size, rot]) => Object.assign({ x, y, rot: rot + (rand() - .5) * 4 }, cube(size, rand)));
}

/* ---------- bubbles and foam ---------- */

function bubblesIn(group, geo, L, rand, moving) {
  const w = geo.innerAt(geo.bottom) * .62;
  for (let i = 0; i < 8; i++) {
    const x = CX + (rand() * 2 - 1) * w;
    const y = geo.bottom - 4 - rand() * (geo.bottom - L) * .55;
    const c = S('circle', {
      cx: x, cy: y, r: .6 + rand() * .75,
      fill: GOUACHE, 'fill-opacity': .55, stroke: INK, 'stroke-opacity': .38, 'stroke-width': .4,
      class: moving ? 'bubble' : null
    });
    if (moving) {
      c.style.animationDuration = (2.6 + rand() * 2.2).toFixed(2) + 's';
      c.style.animationDelay = (-rand() * 4).toFixed(2) + 's';
      c.style.setProperty('--rise', -(y - L - 3).toFixed(1) + 'px');
    }
    group.appendChild(c);
  }
}

function foam(geo, rand, bitters) {
  const { G } = geo;
  const g = S('g');
  const top = geo.levelY - 2.5;
  const rx = geo.innerAt(top);
  const ry = rx * G.tilt;
  /* the head: everything inside the bowl above a line seven units down */
  const depthY = top + 4.5;
  const rxD = geo.innerAt(depthY);
  const head = join(
    arc(CX, top, rx, ry, Math.PI, Math.PI * 2, 20),
    line([CX + rx, top], [CX + rxD, depthY], 3),
    arc(CX, depthY, rxD, rxD * G.tilt, 0, Math.PI, 20),
    line([CX - rxD, depthY], [CX - rx, top], 3)
  );
  g.appendChild(wash(smooth(head, true), '#E3D5BA', { fill: '#ECE1CB', alpha: .97, edge: .14, edgeAlpha: .45 }));
  g.appendChild(S('ellipse', { cx: CX, cy: top, rx, ry, fill: '#F6EFE1', 'fill-opacity': .96 }));
  g.appendChild(S('ellipse', { cx: CX - rx * .25, cy: top - ry * .2, rx: rx * .45, ry: ry * .45, fill: GOUACHE, 'fill-opacity': .5 }));
  /* a little texture in the foam */
  for (let i = 0; i < 22; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand());
    g.appendChild(S('circle', {
      cx: CX + Math.cos(a) * rx * .9 * d, cy: top + Math.sin(a) * ry * .8 * d + (rand() < .5 ? 0 : 3.5 * rand()),
      r: .3 + rand() * .35, fill: INK, 'fill-opacity': .14 + rand() * .12
    }));
  }
  g.appendChild(pen(arc(CX, top, rx, ry, Math.PI, 0, 20), .5, { color: '#B9AC93', alpha: .7 }));
  if (bitters) {
    [-9, 0, 9].forEach((dx, i) => {
      const cy = top + Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2)) * ry * (i === 1 ? .1 : -.25);
      g.appendChild(wash(smooth(arc(CX + dx, cy, 2, 1.15, 0, Math.PI * 2, 10), true), '#8E2F1F', { alpha: .82, edge: .3, edgeWidth: .5 }));
    });
  }
  return g;
}

/* ---------- garnish ---------- */

/* A long strip of peel over the rim, twisting down the outside. Its
   width follows the twist, so it reads as a ribbon turning in the light. */
function twist(geo, c, rand) {
  const { G } = geo;
  const x0 = CX + G.rimW + 5;
  const pts = join(
    [[CX + G.rimW * .34, G.rimY + 3.5], [CX + G.rimW * .68, G.rimY - 2.6], [CX + G.rimW + 1.6, G.rimY - 3]],
    trace((t) => [x0 + 4.4 * Math.sin(t * Math.PI * 3.3 + .4), G.rimY - 1 + t * 27], 30)
  );
  const width = (t) => 3.6 * (.3 + .7 * Math.abs(Math.cos(t * Math.PI * 3.6 + .3)));
  const g = S('g');
  const d = brushD(pts, width, { rand, taper: .06, taperEnd: .2, vary: .1 });
  g.appendChild(wash(d, c.peel, { alpha: .95, edge: .35, edgeWidth: .7, edgeAlpha: .7 }));
  /* the pale side of the peel where the ribbon turns */
  g.appendChild(brush(pts, (t) => width(t) * .28, { color: c.pith, alpha: .7, taper: .1, even: true }));
  for (let i = 0; i < 9; i++) {
    const p = pts[Math.floor(4 + rand() * (pts.length - 6))];
    g.appendChild(S('circle', { cx: p[0] + (rand() - .5) * 1.4, cy: p[1] + (rand() - .5) * 1.4, r: .32, fill: c.zest, 'fill-opacity': .8 }));
  }
  g.appendChild(pen(pts.slice(0, 5), .5, { alpha: .45 }));
  return g;
}

/* a wheel of citrus slotted onto the rim */
function wheel(geo, c, rand) {
  const { G } = geo;
  const cx = CX + G.rimW + 2.5, cy = G.rimY - 1, r = 11.5;
  const g = S('g');
  const disc = (rr) => smooth(wobble(arc(cx, cy, rr, rr, 0, Math.PI * 2, 24).slice(0, 24), .18, rand), true);
  g.appendChild(wash(disc(r), c.peel, { alpha: .95, edge: .35, edgeWidth: .8, edgeAlpha: .7 }));
  g.appendChild(S('path', { d: disc(r - 1.5), fill: c.pith }));
  g.appendChild(wash(disc(r - 2.5), c.flesh, { alpha: .9, edge: .18, edgeWidth: .6 }));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * .12;
    g.appendChild(pen([[cx + Math.cos(a) * 1.4, cy + Math.sin(a) * 1.4], [cx + Math.cos(a) * (r - 2.6), cy + Math.sin(a) * (r - 2.6)]], .7,
      { color: c.pith, alpha: .95, straight: true }));
  }
  g.appendChild(S('circle', { cx, cy, r: 1.3, fill: c.pith }));
  g.appendChild(S('path', { d: disc(r), fill: 'none', stroke: INK, 'stroke-width': .55, 'stroke-opacity': .45 }));
  return g;
}

/* a wedge perched on the rim, flesh towards us */
function wedge(geo, c, rand) {
  const { G } = geo;
  const cx = CX + G.rimW - 6, cy = G.rimY + 3;
  const r = 14;
  const a0 = -Math.PI * .92, a1 = -Math.PI * .34;
  const g = S('g');
  const sector = (rr) => join([[cx, cy]], arc(cx, cy, rr, rr * .92, a0, a1, 14));
  g.appendChild(wash(smooth(wobble(sector(r), .15, rand), true), c.peel, { alpha: .95, edge: .35, edgeWidth: .8, edgeAlpha: .7 }));
  g.appendChild(S('path', { d: smooth(sector(r - 1.5), true), fill: c.pith }));
  g.appendChild(wash(smooth(sector(r - 2.6), true), c.flesh, { alpha: .9, edge: .18, edgeWidth: .6 }));
  [.36, .64].forEach((f) => {
    const a = a0 + (a1 - a0) * f;
    g.appendChild(pen([[cx, cy], [cx + Math.cos(a) * (r - 2.6), cy + Math.sin(a) * (r - 2.6) * .92]], .65, { color: c.pith, straight: true, alpha: .95 }));
  });
  g.appendChild(S('path', { d: smooth(sector(r), true), fill: 'none', stroke: INK, 'stroke-width': .55, 'stroke-opacity': .45 }));
  return g;
}

/* half a wheel pressed against the inside of a highball, among the ice */
function sunkenSlice(geo, L, rand, liquid) {
  const c = CITRUS.orange;
  const cx = CX - geo.innerAt(L) * .35, cy = L + (geo.bottom - L) * .38, r = 11;
  const g = S('g', { transform: 'rotate(-14 ' + fx(cx) + ' ' + fx(cy) + ')' });
  const half = (rr) => smooth(join(arc(cx, cy, rr, rr, -Math.PI / 2, Math.PI / 2, 14), [[cx, cy + rr]]), true);
  g.appendChild(wash(half(r), mix(c.peel, liquid, .25), { alpha: .9, edge: .3, edgeWidth: .7 }));
  g.appendChild(S('path', { d: half(r - 1.4), fill: mix(c.pith, liquid, .2) }));
  g.appendChild(wash(half(r - 2.4), mix(c.flesh, liquid, .25), { alpha: .88, edge: .15, edgeWidth: .5 }));
  for (let i = 1; i < 5; i++) {
    const a = -Math.PI / 2 + (i / 5) * Math.PI;
    g.appendChild(pen([[cx + 1, cy], [cx + Math.cos(a) * (r - 2.4), cy + Math.sin(a) * (r - 2.4)]], .6, { color: mix(c.pith, liquid, .2), straight: true }));
  }
  return g;
}

/* a cherry on a bamboo pick, resting across the rim of the coupe */
function cherry(geo, L, rand) {
  const { G } = geo;
  const cx = CX + 7, cy = L + 8.5;
  const g = S('g');
  g.appendChild(wash(smooth(wobble(arc(cx, cy, 4.9, 4.6, 0, Math.PI * 2, 16).slice(0, 16), .15, rand), true), '#7C1D27', { alpha: .95, edge: .4, edgeWidth: 1 }));
  g.appendChild(brush(arc(cx, cy, 2.8, 2.6, -Math.PI * .9, -Math.PI * .55, 5), 1.1, { color: GOUACHE, alpha: .65, taper: .4, even: true }));
  return g;
}
function pick(geo, rand) {
  const { G } = geo;
  const g = S('g');
  const from = [CX + G.rimW + 9, G.rimY - 20];
  const to = [CX + 5.5, geo.levelY + 11];
  g.appendChild(brush(line(from, to, 8), 1.6, { color: '#C7A26A', alpha: .95, taper: .05, even: true }));
  g.appendChild(pen(line(from, to, 2), .45, { alpha: .55, straight: true }));
  /* the bark left on at the top of a kuromoji pick */
  g.appendChild(brush(line(from, [from[0] + (to[0] - from[0]) * .16, from[1] + (to[1] - from[1]) * .16], 3), 1.9, { color: '#6E4E2E', alpha: .9, taper: 0, even: true }));
  return g;
}

/* ---------- smoke ---------- */

/* Smoke drawn the way incense rises: a fine line at the core, a fainter
   wider haze around it, both widening and wandering as they climb. */
function smokeOver(geo, rand, rising) {
  const { G } = geo;
  const g = S('g');
  const top = G.rimY - G.rimW * G.tilt - 1;
  [
    { x: CX - 3, h: rising ? 46 : 30, amp: 4.5, ph: 0, delay: 0 },
    { x: CX + 6, h: rising ? 38 : 25, amp: 3.6, ph: 2.3, delay: 2.4 }
  ].forEach((w) => {
    const pts = trace((t) => [w.x + Math.sin(t * Math.PI * 2.1 + w.ph) * w.amp * (.25 + t) + t * t * 5, top - t * w.h], 26);
    const wisp = S('g', { class: rising ? 'wisp' : null, opacity: rising ? null : .75 });
    wisp.appendChild(brush(pts, (t) => 8 * (.35 + t), { color: SMOKE_INK, alpha: .07, rand, taper: .25, taperEnd: .35, vary: .35 }));
    wisp.appendChild(brush(pts, (t) => 3.4 * (.45 + t * .7), { color: SMOKE_INK, alpha: .13, rand, taper: .2, taperEnd: .4, vary: .3 }));
    wisp.appendChild(brush(pts, (t) => 1.1 * (1 - t * .45), { color: SMOKE_INK, alpha: .34, rand, taper: .08, taperEnd: .55, vary: .2 }));
    if (rising) wisp.style.animationDelay = w.delay + 's';
    g.appendChild(wisp);
  });
  return g;
}

/* a drawing in a box, ready to drop into the page */
function artBox(cls, drink, opts, mode) {
  const box = el('div', cls);
  box.appendChild(drawDrink(drink, opts, mode));
  return box;
}
