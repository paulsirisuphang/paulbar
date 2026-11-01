/* ================================================================
   MARKS — the small drawings around the menu: the tee, the seals, icons,
   smoke that leaves, and the paper plane an order flies off in.
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

/* ---------- the order, folded into a paper plane ---------- */

/* Sending an order folds its card into a paper plane that flies to the
   orders button, top right. The card shrinks to a small sheet in CSS
   (sheet.css); from there it's paper, folded the way a dart is folded by
   hand: the corners to the centre line, the edges to it again, the sheet
   in half, the wings down. A fold splits every piece of paper it crosses,
   so each piece stays flat, and is drawn once in the sheet's own units
   (2 across, y running down from the nose edge) through the one affine
   transform its plane projects to, writing and creases with it. */
const PLANE = { long: 2.83, keel: .3, shrink: 450, fold: 1700, flight: 1500 };
const PAPER_BACK = '#EFE9DD';
const PAPER_SHADE = '#A3927A';
let planesAloft = 0;

const smoothstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const unitVec = (x, y, z = 0) => { const n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; };
const onSheet = (p) => [p[0], PLANE.long / 2 - p[1], 0];

/* rigid motions, { m: 3×3 by rows, t } */
const STILL = { m: [[1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, 0, 0] };
const turnBy = (q, v) => [0, 1, 2].map((i) => q.m[i][0] * v[0] + q.m[i][1] * v[1] + q.m[i][2] * v[2]);
const moveBy = (q, v) => turnBy(q, v).map((n, i) => n + q.t[i]);
/* a, then b */
const andThen = (a, b) => ({
  m: [0, 1, 2].map((i) => [0, 1, 2].map((j) => b.m[i][0] * a.m[0][j] + b.m[i][1] * a.m[1][j] + b.m[i][2] * a.m[2][j])),
  t: moveBy(b, a.t)
});
const undo = (q) => {
  const m = [0, 1, 2].map((i) => [0, 1, 2].map((j) => q.m[j][i]));
  return { m, t: turnBy({ m }, q.t).map((n) => -n) };
};
/* a turn by angle a about the line through o along the unit vector d */
function turnAbout(o, d, a) {
  const c = Math.cos(a), s = Math.sin(a), v = 1 - c, [x, y, z] = d;
  const m = [
    [c + x * x * v, x * y * v - z * s, x * z * v + y * s],
    [y * x * v + z * s, c + y * y * v, y * z * v - x * s],
    [z * x * v - y * s, z * y * v + x * s, c + z * z * v]
  ];
  return { m, t: [0, 1, 2].map((i) => o[i] - (m[i][0] * o[0] + m[i][1] * o[1] + m[i][2] * o[2])) };
}

/* The folds, in order. Each is a line across the paper as it lies by then,
   a point on the side that moves, and how far it turns: toward the eye
   when positive, a half turn when it folds flat. */
function planeFolds() {
  const L = PLANE.long, q = Math.PI / 2, folds = [];
  const fold = (step, b, toward, turn) => folds.push({ step, a: [0, 0], b, toward, turn, flat: Math.abs(turn) > q });
  for (const s of [1, -1]) fold('corners', [s, 1], [s, 0], Math.PI);
  for (const s of [1, -1]) fold('edges', [s, 1 + Math.SQRT2], [s, 2], Math.PI);
  for (const s of [1, -1]) fold('half', [0, L], [s, L / 2], q);
  for (const s of [1, -1]) fold('wings', [s * PLANE.keel, L], [s, L], -q);
  return folds;
}

/* the part of a convex piece on one side of a line, keeping which edges
   are the paper's cut and which are creases; the new edge is a crease */
function clipPiece(pts, edges, side, crease) {
  const out = [];
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length], sp = side(p), sq = side(q);
    const at = () => { const t = sp / (sp - sq); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; };
    const pIn = sp >= -1e-9, qIn = sq >= -1e-9;
    /* a corner on the line, with the rest of its edge outside, leaves along the line */
    if (pIn) out.push([p, qIn || sp > 1e-9 ? edges[i] : crease]);
    if (pIn && !qIn && sp > 1e-9) out.push([at(), crease]);
    if (!pIn && qIn && sq > 1e-9) out.push([at(), edges[i]]);
  });
  const kept = out.filter((e, i) => {
    const n = out[(i + 1) % out.length];
    return Math.hypot(e[0][0] - n[0][0], e[0][1] - n[0][1]) > 1e-9 || out.length < 2;
  });
  const area = kept.reduce((sum, e, i) => {
    const n = kept[(i + 1) % kept.length][0];
    return sum + e[0][0] * n[1] - n[0] * e[0][1];
  }, 0);
  return Math.abs(area) < 1e-7 ? null : { pts: kept.map((e) => e[0]), edges: kept.map((e) => e[1]) };
}

/* the sheet cut into the flat pieces the folds make. Each remembers the
   folds that move it, with where it lay before each one, and its layer in
   the stack: a fold lays what it moves over everything, upside down */
function planePieces() {
  const L = PLANE.long;
  let pieces = [{ pts: [[-1, 0], [1, 0], [1, L], [-1, L]], edges: ['cut', 'cut', 'cut', 'cut'], flat: STILL, flips: 0, ops: [], layer: 0 }];
  planeFolds().forEach((f) => {
    const A = onSheet(f.a), d = unitVec(f.b[0] - f.a[0], f.a[1] - f.b[1]), r = onSheet(f.toward).map((n, i) => n - A[i]);
    f.angle = f.turn * Math.sign(d[0] * r[1] - d[1] * r[0]);
    f.axis = [A, d];
    const across = (p) => (f.b[0] - f.a[0]) * (p[1] - f.a[1]) - (f.b[1] - f.a[1]) * (p[0] - f.a[0]);
    const sign = Math.sign(across(f.toward));
    const next = [], moved = [];
    pieces.forEach((pc) => {
      /* where the piece lies now, cut there, and taken back to the sheet */
      const lay = pc.pts.map((p) => { const v = moveBy(pc.flat, onSheet(p)); return [v[0], L / 2 - v[1]]; });
      const back = undo(pc.flat);
      const home = (p) => { const v = moveBy(back, onSheet(p)); return [v[0], L / 2 - v[1]]; };
      [1, -1].forEach((keep) => {
        const part = clipPiece(lay, pc.edges, (p) => keep * sign * across(p), f.step);
        if (!part) return;
        const piece = Object.assign({}, pc, { pts: part.pts.map(home), edges: part.edges });
        if (keep === 1) {
          piece.ops = pc.ops.concat([{ f, before: pc.flat }]);
          if (f.flat) Object.assign(piece, { flat: andThen(pc.flat, turnAbout(A, d, f.angle)), flips: pc.flips + 1 });
          moved.push(piece);
        }
        next.push(piece);
      });
    });
    if (f.flat && moved.length) {
      const top = Math.max(...pieces.map((p) => p.layer)), high = Math.max(...moved.map((p) => p.layer));
      moved.forEach((p) => { p.layer = top + 1 + high - p.layer; });
    }
    pieces = next;
  });
  pieces.forEach((p) => { p.group = p.ops.filter((o) => !o.f.flat).map((o) => o.f.step + o.f.toward[0]).join(' '); });
  return pieces;
}

/* where the piece is, part way through every fold: each fold turns it
   about its line as the paper lay before that fold, so a piece stays
   joined to its neighbours however far each fold has gone */
function planePlace(piece, done) {
  return piece.ops.reduceRight((q, o) => {
    const [A, d] = o.f.axis;
    const fold = andThen(andThen(o.before, turnAbout(A, d, o.f.angle * done[o.f.step])), undo(o.before));
    return andThen(q, fold);
  }, STILL);
}

/* the plane as seen: banked about its length, tipped away from us, then
   turned on the page toward where it's going */
function planeView(v, cam) {
  let [x, y, z] = v;
  let c = Math.cos(cam.roll), s = Math.sin(cam.roll);
  [x, z] = [x * c + z * s, z * c - x * s];
  c = Math.cos(cam.tilt); s = Math.sin(cam.tilt);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(cam.turn); s = Math.sin(cam.turn);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

/* the card it was, in a few strokes: the drink, its name, the story, the
   button at the foot */
function planeWriting(color) {
  const rand = seeded('plane');
  const g = S('g', { fill: 'none', stroke: INK, 'stroke-linecap': 'round' });
  g.appendChild(S('ellipse', { cx: -.58, cy: .5, rx: .2, ry: .24, fill: color, 'fill-opacity': .35, stroke: 'none' }));
  const stroke = (x0, x1, y, w, a) => g.appendChild(S('path', {
    d: `M${x0} ${y}L${x1} ${y}`, 'stroke-width': w, 'stroke-opacity': a, 'vector-effect': 'non-scaling-stroke'
  }));
  stroke(-.18, .66, .52, 2, .42);
  for (let i = 0; i < 6; i++) stroke(-.72, .3 + rand() * .42, .98 + i * .2, 1, .2);
  stroke(-.6, .6, 2.5, 3.5, .26);
  return g;
}

/* where it flies to: the orders button, or the corner if that's hidden */
function planeTarget() {
  const b = $('#burger').getBoundingClientRect();
  return b.width ? [b.left + b.width / 2, b.top + b.height / 2] : [innerWidth - 32, 32];
}

function foldAndFly(card, color, landed) {
  const box = card.getBoundingClientRect();
  const w = Math.min(140, box.width * .38);
  card.style.setProperty('--send-x', (w / box.width).toFixed(4));
  card.style.setProperty('--send-y', (w * PLANE.long / 2 / box.height).toFixed(4));
  card.classList.add('sending');
  planesAloft++;
  setTimeout(() => {
    if (card.open) card.close();
    card.classList.remove('sending');
    flyPlane(box.left + box.width / 2, box.top + box.height / 2, w / 2, color, () => {
      planesAloft--;
      landed();
    });
  }, PLANE.shrink);
}

function flyPlane(x0, y0, size, color, landed) {
  const svg = S('svg', { class: 'plane', 'aria-hidden': 'true', focusable: 'false' });
  const defs = S('defs');
  const id = inkId('plane');
  defs.appendChild(S('filter', { id: id + 's', x: '-40%', y: '-40%', width: '180%', height: '180%' }, [
    S('feDropShadow', { dx: 0, dy: 7, stdDeviation: 5, 'flood-color': '#342618', 'flood-opacity': .2 })
  ]));
  const all = S('g', { filter: `url(#${id}s)` });
  svg.append(defs, all);

  const pieces = planePieces();
  const line = { 'vector-effect': 'non-scaling-stroke', fill: 'none', stroke: INK, 'stroke-linecap': 'round' };
  const edgesD = (p, kind) => p.edges.map((e, i) => {
    if (e !== kind) return '';
    const [a, b] = [p.pts[i], p.pts[(i + 1) % p.pts.length]];
    return `M${a[0].toFixed(4)} ${a[1].toFixed(4)}L${b[0].toFixed(4)} ${b[1].toFixed(4)}`;
  }).join('');
  pieces.forEach((p, i) => {
    const pts = p.pts.map((q) => q.map((n) => n.toFixed(4)).join(',')).join(' ');
    defs.appendChild(S('clipPath', { id: id + 'c' + i, clipPathUnits: 'userSpaceOnUse' }, [S('polygon', { points: pts })]));
    p.g = S('g');
    /* the fill strokes itself in its own colour, so no seam shows between pieces */
    p.fill = S('polygon', { points: pts, 'stroke-width': .8, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' });
    p.ink = S('g', { 'clip-path': `url(#${id}c${i})` }, [planeWriting(color)]);
    p.cut = S('path', Object.assign({ d: edgesD(p, 'cut'), 'stroke-width': .9 }, line));
    p.creases = ['corners', 'edges', 'half', 'wings'].filter((n) => p.edges.includes(n))
      .map((n) => ({ n, el: S('path', Object.assign({ d: edgesD(p, n), 'stroke-width': .7 }, line)) }));
    p.g.append(p.fill, p.ink, p.cut, ...p.creases.map((c) => c.el));
  });
  document.body.appendChild(svg);

  const light = unitVec(-.35, .55, .75);
  const end = planeTarget();
  /* out to the right at first, then up into the corner */
  const mid = [x0 + (end[0] - x0) * .7, y0 + (end[1] - y0) * .12];
  const heading = (dx, dy) => Math.atan2(-dy, dx) - Math.PI / 2;
  const turn0 = heading(mid[0] - x0, mid[1] - y0);

  function draw(done, cam, look) {
    const depth = {};
    pieces.forEach((p) => {
      const place = planePlace(p, done);
      const at = (x, y) => planeView(moveBy(place, onSheet([x, y])), cam);
      const o = at(0, 0), a = at(1, 0), b = at(0, 1);
      const m = [a[0] - o[0], o[1] - a[1], b[0] - o[0], o[1] - b[1]].map((n) => n * cam.size);
      const front = m[0] * m[3] - m[1] * m[2] > 0;
      const u = [a[0] - o[0], a[1] - o[1], a[2] - o[2]], w = [b[0] - o[0], b[1] - o[1], b[2] - o[2]];
      const n = unitVec(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]);
      const lit = (front ? -1 : 1) * (n[0] * light[0] + n[1] * light[1] + n[2] * light[2]);
      const fill = mix(front ? PAPER_WASH : PAPER_BACK, PAPER_SHADE, Math.min(.4, Math.max(0, (.75 - lit) * .45)));
      /* the stack faces the eye or away from it, which decides which layer is on top */
      const up = planeView(turnBy(place, [0, 0, p.flips % 2 ? -1 : 1]), { roll: cam.roll, tilt: cam.tilt, turn: cam.turn })[2];
      p.order = up >= 0 ? p.layer : -p.layer;
      const g = depth[p.group] || (depth[p.group] = { z: 0, n: 0 });
      p.pts.forEach((q) => { g.z += at(q[0], q[1])[2]; g.n++; });
      p.g.setAttribute('transform', `matrix(${m.concat(cam.x + o[0] * cam.size, cam.y - o[1] * cam.size).map((v) => v.toFixed(3)).join(' ')})`);
      p.fill.setAttribute('fill', fill);
      p.fill.setAttribute('stroke', fill);
      p.ink.setAttribute('opacity', front ? look.ink : 0);
      p.cut.setAttribute('stroke-opacity', .55 * look.edge);
      p.creases.forEach((c) => c.el.setAttribute('stroke-opacity', .4 * done[c.n]));
    });
    /* we always look down on it, so the body hanging under the wings goes
       first; then nearer groups of paper over farther ones, and within one
       flat stack, by layer */
    const rank = (p) => (p.group.includes('wings') ? 1 : 0);
    const z = (p) => depth[p.group].z / depth[p.group].n;
    pieces.slice().sort((a, b) => rank(a) - rank(b) || (Math.abs(z(a) - z(b)) > 1e-6 ? z(a) - z(b) : a.order - b.order))
      .forEach((p) => all.appendChild(p.g));
    svg.style.opacity = look.alpha;
  }

  const t0 = performance.now();
  function frame(now) {
    const ms = now - t0;
    if (ms < PLANE.fold) {
      const u = ms / PLANE.fold;
      const settle = smoothstep((u - .44) / .56);
      draw(
        { corners: smoothstep(u / .22), edges: smoothstep((u - .22) / .22), half: smoothstep((u - .44) / .3), wings: smoothstep((u - .58) / .3) },
        { x: x0, y: y0, size: size * (1 - .2 * settle), tilt: -.85 * settle, turn: turn0 * smoothstep((u - .55) / .45), roll: -.35 * settle },
        { ink: smoothstep(u / .1), edge: smoothstep(u / .2), alpha: 1 }
      );
    } else {
      const t = (ms - PLANE.fold) / PLANE.flight;
      if (t >= 1) { svg.remove(); landed(); return; }
      /* along a curve, easing in and out: nothing lurches */
      const p = (1 - Math.cos(Math.PI * t)) / 2, q = 1 - p;
      const along = (i) => q * q * [x0, y0][i] + 2 * q * p * mid[i] + p * p * end[i];
      const slope = (i) => 2 * q * (mid[i] - [x0, y0][i]) + 2 * p * (end[i] - mid[i]);
      draw(
        { corners: 1, edges: 1, half: 1, wings: 1 },
        { x: along(0), y: along(1), size: size * .8 * (1 - .72 * p), tilt: -.85, turn: heading(slope(0), slope(1)), roll: -.35 - .15 * Math.sin(Math.PI * p) },
        { ink: 1, edge: 1, alpha: 1 - smoothstep((t - .78) / .22) }
      );
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
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
