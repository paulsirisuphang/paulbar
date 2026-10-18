/* ================================================================
   INK — the drawing kit
   Brush lines that swell and taper, watercolour washes that pool at
   their edges, and white gouache for highlights. Every irregularity
   comes from a generator seeded with the thing being drawn, so a
   drink is drawn by the same hand every time it appears.
   ================================================================ */

const INK = '#2A2520';
const PAPER_WASH = '#F6F2EA';
const GOUACHE = '#FFFDF7';

/* ---------- colour ---------- */

function rgbOf(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hexOf(rgb) {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
function mix(a, b, t) {
  const A = rgbOf(a);
  const B = rgbOf(b);
  return hexOf(A.map((v, i) => v + (B[i] - v) * t));
}
const deepen = (c, t) => mix(c, INK, t);
const lighten = (c, t) => mix(c, PAPER_WASH, t);

/* ---------- a steady hand ---------- */

/* a small, fast generator seeded from a string */
function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* smooth noise in [-1, 1] across t in [0, 1] — the waver of a hand */
function wave(rand, knots = 5) {
  const k = Array.from({ length: knots + 1 }, () => rand() * 2 - 1);
  return (t) => {
    const x = Math.max(0, Math.min(1, t)) * knots;
    const i = Math.min(knots - 1, Math.floor(x));
    const f = x - i;
    const s = (1 - Math.cos(f * Math.PI)) / 2;
    return k[i] * (1 - s) + k[i + 1] * s;
  };
}

let inkUid = 0;
const inkId = (prefix) => prefix + (++inkUid);

/* ---------- geometry ---------- */

const fx = (n) => +n.toFixed(2);

/* points along an ellipse; angles run clockwise on screen, so 0 is the
   right-hand end, π/2 the nearest point, −π/2 the far side */
function arc(cx, cy, rx, ry, a0, a1, n = 20) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * (i / n);
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

function line(p0, p1, n = 6) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]);
  }
  return pts;
}

/* a run of points from a function of t */
function trace(fn, n = 20) {
  const pts = [];
  for (let i = 0; i <= n; i++) pts.push(fn(i / n));
  return pts;
}

/* join point runs end to end, dropping the duplicate where they meet */
function join(...runs) {
  const out = [];
  runs.forEach((run) => run.forEach((p, i) => {
    const last = out[out.length - 1];
    if (i === 0 && last && Math.hypot(last[0] - p[0], last[1] - p[1]) < 0.01) return;
    out.push(p);
  }));
  return out;
}

/* Catmull-Rom through the points, written as cubic Béziers */
function smooth(pts, closed = false) {
  const n = pts.length;
  if (n < 2) return '';
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = 'M' + fx(pts[0][0]) + ',' + fx(pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += 'C' + fx(c1[0]) + ',' + fx(c1[1]) + ' ' + fx(c2[0]) + ',' + fx(c2[1]) + ' ' + fx(p2[0]) + ',' + fx(p2[1]);
  }
  return closed ? d + 'Z' : d;
}

/* straight segments, for shapes that should stay crisp */
const poly = (pts, closed = true) =>
  pts.map((p, i) => (i ? 'L' : 'M') + fx(p[0]) + ',' + fx(p[1])).join('') + (closed ? 'Z' : '');

function normals(pts) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  });
}

/* nudge every point sideways by a little smooth noise */
function wobble(pts, amp, rand) {
  const w = wave(rand, Math.max(3, Math.round(pts.length / 5)));
  const ns = normals(pts);
  return pts.map((p, i) => {
    const d = w(i / (pts.length - 1)) * amp;
    return [p[0] + ns[i][0] * d, p[1] + ns[i][1] * d];
  });
}

/* ---------- marks ---------- */

/* A brush stroke along a centre line: it presses in, swells and lifts
   off. `width` is a number or a function of t; the hand's own waver
   is added on top unless `even` is set. */
function brushD(pts, width, opts = {}) {
  const n = pts.length;
  if (n < 2) return '';
  const lens = [0];
  for (let i = 1; i < n; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = lens[n - 1] || 1;
  const ns = normals(pts);
  const press = opts.rand && !opts.even ? wave(opts.rand, 4) : () => 0;
  const t0 = opts.taper != null ? opts.taper : 0.18;
  const t1 = opts.taperEnd != null ? opts.taperEnd : t0;
  const lift = (x) => Math.sin(Math.max(0, Math.min(1, x)) * Math.PI / 2);
  const left = [], right = [];
  for (let i = 0; i < n; i++) {
    const t = lens[i] / total;
    let w = typeof width === 'function' ? width(t) : width;
    w *= 1 + press(t) * (opts.vary != null ? opts.vary : 0.28);
    if (t0 > 0 && t < t0) w *= 0.25 + 0.75 * lift(t / t0);
    if (t1 > 0 && t > 1 - t1) w *= 0.25 + 0.75 * lift((1 - t) / t1);
    w = Math.max(w, opts.min != null ? opts.min : 0.2) / 2;
    left.push([pts[i][0] + ns[i][0] * w, pts[i][1] + ns[i][1] * w]);
    right.push([pts[i][0] - ns[i][0] * w, pts[i][1] - ns[i][1] * w]);
  }
  return smooth(left.concat(right.reverse()), true);
}

function brush(pts, width, opts = {}) {
  return S('path', {
    d: brushD(pts, width, opts),
    fill: opts.color || INK,
    'fill-opacity': opts.alpha != null ? opts.alpha : 0.9,
    class: opts.cls
  });
}

/* an even pen line, for detail too small to need a brush */
function pen(pts, width, opts = {}) {
  return S('path', {
    d: opts.straight ? poly(pts, false) : smooth(pts, !!opts.closed),
    fill: 'none',
    stroke: opts.color || INK,
    'stroke-width': width,
    'stroke-opacity': opts.alpha != null ? opts.alpha : 0.85,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    class: opts.cls
  });
}

/* A watercolour wash: the body of colour, plus the darker ring that
   pigment leaves where a wash dries. Pass `clipTo` (an id) to keep the
   ring on the inside of the shape, the way it really sits. */
function wash(d, color, opts = {}) {
  const g = S('g', { class: opts.cls });
  g.appendChild(S('path', {
    d, fill: opts.fill || color,
    'fill-opacity': opts.alpha != null ? opts.alpha : 0.88
  }));
  if (opts.edge !== 0) {
    g.appendChild(S('path', {
      d, fill: 'none',
      stroke: deepen(color, opts.edge != null ? opts.edge : 0.22),
      'stroke-width': opts.edgeWidth != null ? opts.edgeWidth : 1.1,
      'stroke-opacity': opts.edgeAlpha != null ? opts.edgeAlpha : 0.5,
      'stroke-linejoin': 'round',
      'clip-path': opts.clipTo ? 'url(#' + opts.clipTo + ')' : null
    }));
  }
  return g;
}

/* pigment that settled into the paper's tooth */
function grainPattern(defs, rand, color) {
  const id = inkId('grain');
  const p = S('pattern', { id, width: 9, height: 9, patternUnits: 'userSpaceOnUse' });
  for (let i = 0; i < 6; i++) {
    p.appendChild(S('circle', {
      cx: rand() * 9, cy: rand() * 9, r: 0.25 + rand() * 0.45,
      fill: color, 'fill-opacity': 0.1 + rand() * 0.14
    }));
  }
  defs.appendChild(p);
  return id;
}

function clipPath(defs, d, id = inkId('clip')) {
  defs.appendChild(S('clipPath', { id }, [S('path', { d })]));
  return id;
}
