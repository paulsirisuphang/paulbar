/* ================================================================
   THE CREW
   Three behind a hinoki counter, under a paper lantern, in front of a
   back bar of lit shelves. Always shaking, each on their own rhythm so they never
   fall into step. Tap one and they do their party piece for ten
   seconds: the sommelier juggles three bottles of wine, the golfer
   drives a ball off the bar top, and the yogi stands on her head.

   Each figure is drawn about its waist, at the counter line; arms are
   drawn about the shoulder they swing from. Groups that move carry the
   class `moves` and no transform attribute of their own (crew.css).

   The crew stand on a stage 340 units wide, which keeps the size it
   always had: up to 560px on a phone and 800px on a desktop. The bar
   and the shelves behind them run on to the edges of the window.
   ================================================================ */

const SKIN = '#E6CDB2';
const HAIR = '#2F2924';
const SHIRT = '#F4F0E8';

const CREW = [
  { x: 76,  scale: 1.08, dur: .46, delay: 0,    costume: 'somm', act: 'juggle' },
  { x: 180, scale: 1.14, dur: .53, delay: -.21, costume: 'golf', act: 'golf' },
  { x: 284, scale: 1.06, dur: .49, delay: -.36, costume: 'yoga', act: 'headstand' }
];
const COUNTER_Y = 140;

/* a group the stylesheet animates, sitting inside one that places it */
function joint(x, y, cls) {
  const inner = S('g', { class: 'moves ' + cls });
  const outer = S('g', { transform: 'translate(' + fx(x) + ' ' + fx(y) + ')' }, [inner]);
  return { outer, inner };
}

/* a limb as a brush stroke in its sleeve colour, edged in ink */
function limb(pts, width, color, rand) {
  const g = S('g');
  g.appendChild(S('path', { d: brushD(pts, width + 1.1, { rand, taper: 0, vary: .08 }), fill: INK, 'fill-opacity': .78 }));
  g.appendChild(S('path', { d: brushD(pts, width, { rand, taper: 0, vary: .08 }), fill: color }));
  return g;
}
const hand = (x, y, r = 2.6) => S('circle', { cx: x, cy: y, r, fill: SKIN, stroke: INK, 'stroke-width': .7, 'stroke-opacity': .75 });

/* A cobbler shaker, the one Japanese bartenders use: a body that widens
   to the shoulder, a strainer cone, a small cap. Held about its base. */
function shaker() {
  const g = S('g', { transform: 'rotate(14)' });
  const outline = 'M-3.3,0 L3.3,0 L4.6,-14.6 L4.6,-15.8 C4.2,-18 2.9,-19.6 2.2,-20.4 L2.2,-21.2 ' +
    'C2.2,-23.4 1.4,-24.6 0,-24.6 C-1.4,-24.6 -2.2,-23.4 -2.2,-21.2 L-2.2,-20.4 C-2.9,-19.6 -4.2,-18 -4.6,-15.8 L-4.6,-14.6 Z';
  g.appendChild(wash(outline, '#C6C9C5', { alpha: .97, edge: .3, edgeWidth: .8, edgeAlpha: .8 }));
  /* the seams where the cone and the cap sit */
  g.appendChild(pen([[-4.6, -14.8], [4.6, -14.8]], .5, { alpha: .5, straight: true }));
  g.appendChild(pen([[-2.2, -20.6], [2.2, -20.6]], .45, { alpha: .5, straight: true }));
  g.appendChild(brush(line([-1.5, -2], [-2.4, -13.6], 4), 1.1, { color: GOUACHE, alpha: .85, taper: .3, even: true }));
  g.appendChild(brush(line([-1.6, -16.4], [-.9, -19.4], 3), .7, { color: GOUACHE, alpha: .7, taper: .3, even: true }));
  g.appendChild(S('path', { d: outline, fill: 'none', stroke: INK, 'stroke-width': .7, 'stroke-opacity': .8, 'stroke-linejoin': 'round' }));
  g.appendChild(hand(0, -1.8, 2.8));
  return g;
}

function bottle(rand) {
  const g = S('g');
  const shape = 'M-3.3,8 L3.3,8 L3.3,-2.5 Q3.3,-5.6 1.3,-7.2 L1.3,-12 L-1.3,-12 L-1.3,-7.2 Q-3.3,-5.6 -3.3,-2.5 Z';
  g.appendChild(wash(shape, '#3E5A43', { alpha: .95, edge: .3, edgeWidth: .7 }));
  g.appendChild(S('rect', { x: -2.6, y: -1, width: 5.2, height: 5, fill: SHIRT, stroke: INK, 'stroke-width': .35, 'stroke-opacity': .6 }));
  g.appendChild(S('rect', { x: -1.5, y: -13, width: 3, height: 3.4, fill: '#7B2B22' }));
  g.appendChild(brush(line([-1.9, 6], [-1.9, -3], 3), .7, { color: GOUACHE, alpha: .6, taper: .3, even: true }));
  g.appendChild(S('path', { d: shape, fill: 'none', stroke: INK, 'stroke-width': .6, 'stroke-opacity': .8 }));
  return g;
}

function figure(cfg, rand) {
  const c = cfg.costume;
  const sleeve = c === 'somm' ? SHIRT : c === 'golf' ? '#A6B08B' : SKIN;
  const cloth = c === 'somm' ? '#3D3833' : c === 'golf' ? '#A6B08B' : '#6F7F99';

  const place = S('g', { transform: 'translate(' + fx(cfg.x) + ' ' + COUNTER_Y + ') scale(' + cfg.scale + ')' });
  const tender = S('g', { class: 'tender act-' + cfg.act });
  place.appendChild(tender);

  /* the headstand turns the whole body about its middle */
  const mid = S('g', { transform: 'translate(0 -34)' });
  const flip = S('g', { class: 'moves flip' });
  const back = S('g', { transform: 'translate(0 34)' });
  mid.appendChild(flip);
  flip.appendChild(back);
  tender.appendChild(mid);

  const body = S('g', { class: 'moves tender-body' });
  body.style.setProperty('--d', cfg.dur + 's');
  body.style.setProperty('--t', cfg.delay + 's');
  back.appendChild(body);

  const swingArm = (x, y) => {
    const j = joint(x, y, 'tender-arms');
    j.inner.style.setProperty('--d', cfg.dur + 's');
    j.inner.style.setProperty('--t', cfg.delay + 's');
    return j;
  };

  /* legs, only ever seen upside down */
  if (cfg.act === 'headstand') {
    const legs = S('g', { class: 'legs' });
    const sway = joint(0, 0, '');
    sway.inner.appendChild(limb([[-4.5, 0], [-5.5, 20], [-6.2, 40]], 6.4, '#3F4960', rand));
    sway.inner.appendChild(limb([[4.5, 0], [5.6, 20], [6.6, 40]], 6.4, '#3F4960', rand));
    sway.inner.appendChild(hand(-6.3, 42, 2.8));
    sway.inner.appendChild(hand(6.7, 42, 2.8));
    legs.appendChild(sway.outer);
    body.appendChild(legs);
  }

  /* torso */
  const torso = 'M-14,2 C-14.6,-14 -15.4,-27 -14,-32.6 Q-12,-37.6 -6,-38.6 L6,-38.6 Q12,-37.6 14,-32.6 C15.4,-27 14.6,-14 14,2 Z';
  body.appendChild(wash(torso, cloth, { alpha: .96, edge: .25, edgeWidth: .8 }));
  if (c === 'somm') {
    /* white shirt in the V of a black waistcoat, bow tie, tastevin on its chain */
    body.appendChild(S('path', { d: 'M-6,-38.6 L0,-24 L6,-38.6 Z', fill: SHIRT }));
    body.appendChild(S('path', { d: 'M-6.6,-40.4 L-.6,-37.8 L-6.6,-35.2 Z M6.6,-40.4 L.6,-37.8 L6.6,-35.2 Z', fill: '#B0392A' }));
    body.appendChild(S('circle', { cx: 0, cy: -37.8, r: 1.1, fill: '#93301F' }));
    body.appendChild(pen([[-5.5, -36], [-3, -27], [3.5, -22.5]], .4, { color: '#8D928F', alpha: .9 }));
    body.appendChild(wash(smooth(arc(4.6, -21.5, 2.6, 2.3, 0, Math.PI * 2, 10), true), '#C3C6C2', { alpha: 1, edge: .4, edgeWidth: .6 }));
    [-19, -13, -7].forEach((y) => body.appendChild(S('circle', { cx: .3, cy: y, r: .7, fill: '#C9C2B4' })));
  } else if (c === 'golf') {
    /* polo: collar points, a short placket, two buttons */
    body.appendChild(S('path', { d: 'M-6,-38.6 L-1,-32 L-3.6,-38.6 Z M6,-38.6 L1,-32 L3.6,-38.6 Z', fill: SHIRT, stroke: INK, 'stroke-width': .45, 'stroke-opacity': .7 }));
    body.appendChild(pen([[0, -34], [0, -26]], .5, { alpha: .5, straight: true }));
    [-31.5, -28].forEach((y) => body.appendChild(S('circle', { cx: 1.1, cy: y, r: .55, fill: INK, 'fill-opacity': .55 })));
  } else {
    /* a scoop-neck vest, bare shoulders */
    body.appendChild(S('path', { d: 'M-14,-32.6 Q-12,-37.6 -9,-38.4 L-8.2,-31 Q0,-24.6 8.2,-31 L9,-38.4 Q12,-37.6 14,-32.6 Z', fill: SKIN }));
    body.appendChild(pen([[-8.2, -31], [0, -25.2], [8.2, -31]], .6, { alpha: .55 }));
  }
  body.appendChild(S('path', { d: torso, fill: 'none', stroke: INK, 'stroke-width': .9, 'stroke-opacity': .78, 'stroke-linejoin': 'round' }));

  /* neck and head */
  body.appendChild(S('rect', { x: -3.2, y: -44.6, width: 6.4, height: 7, fill: SKIN }));
  body.appendChild(pen([[-3.2, -44], [-3.2, -38.4]], .6, { alpha: .6, straight: true }));
  body.appendChild(pen([[3.2, -44], [3.2, -38.4]], .6, { alpha: .6, straight: true }));
  body.appendChild(S('circle', { cx: 0, cy: -53.2, r: 9.6, fill: SKIN, stroke: INK, 'stroke-width': .9, 'stroke-opacity': .8 }));
  /* eyes closed, concentrating */
  body.appendChild(pen([[-4.9, -51.4], [-3.6, -50.5], [-2.3, -51.4]], .55, { alpha: .7 }));
  body.appendChild(pen([[2.3, -51.4], [3.6, -50.5], [4.9, -51.4]], .55, { alpha: .7 }));

  if (c === 'somm') {
    body.appendChild(wash('M-9.8,-54 Q-10.6,-64.6 -1,-63.6 Q8.8,-63.8 9.8,-55 Q5,-60 -2.4,-58.6 Q-7.2,-57.8 -9.8,-54 Z', HAIR, { alpha: .95, edge: .2, edgeWidth: .6 }));
    /* round spectacles */
    [-3.6, 3.6].forEach((x) => body.appendChild(S('circle', { cx: x, cy: -51.2, r: 2.9, fill: GOUACHE, 'fill-opacity': .35, stroke: INK, 'stroke-width': .6, 'stroke-opacity': .9 })));
    body.appendChild(pen([[-.7, -51.6], [.7, -51.6]], .55, { straight: true, alpha: .9 }));
  } else if (c === 'golf') {
    /* a flat cap in tweed */
    body.appendChild(wash('M-10.4,-55.4 Q-11,-66.6 0,-66.4 Q10.6,-66.2 10.8,-56.2 Q0,-59.8 -10.4,-55.4 Z', '#A17F55', { alpha: .97, edge: .3, edgeWidth: .8 }));
    body.appendChild(wash('M-10.6,-56 Q0,-60.4 11.2,-56.6 Q12.8,-54.2 9.6,-53.8 Q0,-56.4 -9.2,-53.6 Q-12.2,-53.8 -10.6,-56 Z', '#8C6B44', { alpha: .97, edge: .3, edgeWidth: .7 }));
    body.appendChild(S('circle', { cx: 0, cy: -66.2, r: .9, fill: '#6E5234' }));
    body.appendChild(pen([[-7, -61.6], [-2, -63.4], [5, -62.6]], .35, { alpha: .35 }));
  } else {
    /* hair up in a knot, a band to keep it there */
    body.appendChild(wash('M-9.8,-54.6 Q-10.4,-64 -1,-63.4 Q9.6,-63.4 9.8,-54.4 Q6,-59.2 0,-59 Q-6,-59.2 -9.8,-54.6 Z', HAIR, { alpha: .95, edge: .2, edgeWidth: .6 }));
    body.appendChild(wash(smooth(arc(0, -66.4, 4.6, 4.2, 0, Math.PI * 2, 12), true), HAIR, { alpha: .95, edge: .2, edgeWidth: .6 }));
    body.appendChild(brush(arc(0, -53.2, 9.7, 9.7, -Math.PI * .9, -Math.PI * .1, 12), 2.2, { color: '#8B9A5D', alpha: .95, taper: .1, even: true }));
  }

  /* hands planted either side of the head, for when she's upside down */
  if (cfg.act === 'headstand') {
    const act = S('g', { class: 'act' });
    act.appendChild(limb([[-11, -34], [-16, -45], [-11.5, -58]], 4.4, SKIN, rand));
    act.appendChild(limb([[11, -34], [16, -45], [11.5, -58]], 4.4, SKIN, rand));
    act.appendChild(hand(-11.4, -60));
    act.appendChild(hand(11.4, -60));
    body.appendChild(act);
  }

  /* the near arm and the shaker, in front of everything */
  const near = swingArm(11, -34);
  near.inner.appendChild(limb([[0, 0], [8, 9], [14, -5]], 5, sleeve, rand));
  near.inner.appendChild(S('g', { transform: 'translate(14.4 -4.4)' }, [shaker()]));
  body.appendChild(near.outer);

  /* ---------- the party pieces ---------- */

  if (cfg.act === 'juggle') {
    const act = S('g', { class: 'act' });
    act.appendChild(limb([[-11, -34], [-15, -46], [-12, -60]], 4.6, sleeve, rand));
    act.appendChild(limb([[11, -34], [15, -46], [12, -60]], 4.6, sleeve, rand));
    act.appendChild(hand(-12, -61));
    act.appendChild(hand(12, -61));
    const loop = S('g', { transform: 'translate(0 -88)' });
    for (let i = 0; i < 3; i++) {
      const b = S('g', { class: 'moves bottle' }, [bottle(rand)]);
      b.style.animationDelay = (-i * 1.3 / 3).toFixed(2) + 's';
      loop.appendChild(b);
    }
    act.appendChild(loop);
    tender.appendChild(act);
  }

  if (cfg.act === 'golf') {
    const act = S('g', { class: 'act' });
    act.appendChild(limb([[-11, -34], [-6, -28], [1, -25]], 4.6, sleeve, rand));
    act.appendChild(limb([[11, -34], [8, -28], [3, -25]], 4.6, sleeve, rand));
    /* the club turns about the grip */
    const grip = joint(2, -25, 'swing');
    grip.inner.appendChild(pen([[0, 0], [0, 29]], 1.1, { color: '#5C5650', alpha: .95, straight: true }));
    grip.inner.appendChild(wash('M-1.2,28 L5.4,29.6 L5.6,32.4 L-1.2,31.6 Z', '#8E9391', { alpha: 1, edge: .4, edgeWidth: .6 }));
    grip.inner.appendChild(S('rect', { x: -1.3, y: -1, width: 2.6, height: 6, rx: 1, fill: '#2F2924' }));
    act.appendChild(grip.outer);
    act.appendChild(hand(1, -25));
    act.appendChild(hand(3, -21.5));
    /* teed up on the bar top, beside him */
    act.appendChild(pen([[21, 0], [21, -3]], 1, { color: '#C7A26A', alpha: 1, straight: true }));
    const ball = S('g', { class: 'moves golf-ball' }, [S('circle', { cx: 21, cy: -5.3, r: 2.4, fill: GOUACHE, stroke: INK, 'stroke-width': .6, 'stroke-opacity': .8 })]);
    act.appendChild(ball);
    tender.appendChild(act);
  }

  return place;
}

function lantern(rand) {
  /* hung from the top edge; it sways about where the cord is tied */
  const hang = joint(180, -4, 'lantern');
  const g = S('g', { transform: 'scale(.84)' });
  hang.inner.appendChild(g);
  g.appendChild(pen([[0, 0], [0, 15]], .6, { alpha: .7, straight: true }));
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
  return hang.outer;
}

/* the bar top and the front of the slab, from x0 to x1 */
function counter(rand, x0, x1) {
  const g = S('g');
  const top = COUNTER_Y;
  g.appendChild(wash(poly([[x0, top - 6], [x1, top - 6], [x1, top], [x0, top]]), '#E6D2B0', { alpha: 1, edge: 0 }));
  g.appendChild(wash(poly([[x0, top], [x1, top], [x1, top + 22], [x0, top + 22]]), '#D2B288', { alpha: 1, edge: 0 }));
  /* grain, in long runs along the slab */
  const runs = Math.ceil((x1 - x0) / 38);
  for (let i = 0; i < runs; i++) {
    const y = top + 3 + (i % 9) * 2.2 + rand() * 1.2;
    const sx = x0 - 40 + (i / runs) * (x1 - x0) + rand() * 50;
    const pts = trace((t) => [sx + t * (180 + rand() * 60), y + Math.sin(t * Math.PI * (1 + rand())) * 1.2], 10);
    g.appendChild(pen(pts, .35, { color: '#8C6A43', alpha: .28 + rand() * .2 }));
  }
  g.appendChild(brush(line([x0, top], [x1, top], Math.ceil((x1 - x0) / 16)), 1.2, { rand, taper: 0 }));
  g.appendChild(pen(line([x0, top - 6], [x1, top - 6], 2), .5, { alpha: .45, straight: true }));
  g.appendChild(pen(line([x0, top + 22], [x1, top + 22], 2), .7, { alpha: .55, straight: true }));
  g.appendChild(pen(line([x0, top - 3.2], [x1, top - 3.2], 2), .8, { color: GOUACHE, alpha: .5, straight: true }));

  /* a single branch in a stoneware vase at one end of the stage… */
  const vx = 30, vy = top - 3;
  g.appendChild(wash('M' + (vx - 5) + ',' + vy + ' Q' + (vx - 7.4) + ',' + (vy - 9) + ' ' + (vx - 2.2) + ',' + (vy - 13) + ' L' + (vx - 2.2) + ',' + (vy - 17) +
    ' L' + (vx + 2.2) + ',' + (vy - 17) + ' L' + (vx + 2.2) + ',' + (vy - 13) + ' Q' + (vx + 7.4) + ',' + (vy - 9) + ' ' + (vx + 5) + ',' + vy + ' Z',
    '#B9AC97', { alpha: .97, edge: .35, edgeWidth: .8, edgeAlpha: .8 }));
  const branch = [[vx, vy - 16], [vx + 3, vy - 30], [vx + 1, vy - 44], [vx + 7, vy - 56]];
  g.appendChild(brush(branch, 1.2, { rand, taper: .1, taperEnd: .5 }));
  [[vx + 3, vy - 30, 1], [vx + 1.4, vy - 41, -1], [vx + 5.6, vy - 51, 1]].forEach(([x, y, s]) => {
    g.appendChild(wash(smooth([[x, y], [x + 4 * s, y - 3], [x + 7.5 * s, y - 1.5], [x + 3.6 * s, y + 1.2]], true), '#7F8F55', { alpha: .9, edge: .3, edgeWidth: .5 }));
  });

  /* …and the bottle that's being poured at the other */
  const bx = 334, by = top - 3;
  const bottleD = 'M' + (bx - 5) + ',' + by + ' L' + (bx - 5) + ',' + (by - 22) + ' Q' + (bx - 5) + ',' + (by - 27) + ' ' + (bx - 1.6) + ',' + (by - 29) +
    ' L' + (bx - 1.6) + ',' + (by - 36) + ' L' + (bx + 1.6) + ',' + (by - 36) + ' L' + (bx + 1.6) + ',' + (by - 29) + ' Q' + (bx + 5) + ',' + (by - 27) + ' ' + (bx + 5) + ',' + (by - 22) + ' L' + (bx + 5) + ',' + by + ' Z';
  g.appendChild(wash(bottleD, '#A86A2C', { alpha: .9, edge: .3, edgeWidth: .8 }));
  g.appendChild(S('rect', { x: bx - 4, y: by - 17, width: 8, height: 8, fill: SHIRT, stroke: INK, 'stroke-width': .4, 'stroke-opacity': .6 }));
  g.appendChild(brush(line([bx - 3, by - 3], [bx - 3, by - 20], 4), .9, { color: GOUACHE, alpha: .6, taper: .3, even: true }));
  g.appendChild(S('rect', { x: bx - 2, y: by - 38.5, width: 4, height: 3, fill: '#3B3530' }));
  g.appendChild(S('path', { d: bottleD, fill: 'none', stroke: INK, 'stroke-width': .7, 'stroke-opacity': .8 }));
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
/* where each shelf's bottles stand: one above the crew, one at their shoulders */
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
   shelf behind a bartender, their raised shaker, or what's on the counter. */
const clearOnShelf = [
  (x) => Math.abs(x - 180) > 26,
  (x) => CREW.every((c) => x < c.x - 21 || x > c.x + 40) && Math.abs(x - 30) > 13 && Math.abs(x - 334) > 9
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
    shelfItems(row, x0, x1).forEach((item) => g.appendChild(item.jar ? shelfJar(item) : shelfBottle(item)));
    /* the plank edge-on, and its shadow on the wall */
    g.appendChild(S('rect', { x: x0, y: y + 3.4, width: x1 - x0, height: 5, fill: 'url(#' + shade + ')' }));
    g.appendChild(wash(poly([[x0, y], [x1, y], [x1, y + 3.4], [x0, y + 3.4]]), '#D3B48A', { alpha: 1, edge: 0 }));
    g.appendChild(pen(line([x0, y + .5], [x1, y + .5], 2), .6, { color: GOUACHE, alpha: .6, straight: true }));
    g.appendChild(pen(line([x0, y + 3.4], [x1, y + 3.4], 2), .45, { alpha: .45, straight: true }));
  });
  return g;
}

/* ---------- the scene ---------- */

const STAGE_W = 340;
/* pixels to a unit of the stage */
function stageUnit() {
  const main = $('main');
  const cs = getComputedStyle(main);
  const content = main.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  return Math.min(content, window.innerWidth >= 760 ? 800 : 560) / STAGE_W;
}

/* the width the bar was last drawn at, so a resize only redraws it when it has to */
let crewWidth = 0;

function renderCrew() {
  const box = $('#crew');
  crewWidth = box.clientWidth;
  const span = Math.max(crewWidth / stageUnit(), STAGE_W);
  const x0 = 180 - span / 2, x1 = 180 + span / 2;
  const rand = seeded('crew');
  const svg = S('svg', { viewBox: [x0, -2, span, 176].map((n) => fx(n)).join(' '), 'aria-hidden': 'true', focusable: 'false' });
  const defs = S('defs');
  const glow = inkId('room');
  /* the lantern's pool of light, round whatever the width */
  defs.appendChild(S('radialGradient', { id: glow, gradientUnits: 'userSpaceOnUse', cx: 180, cy: 40, r: 210 }, [
    S('stop', { offset: 0, 'stop-color': '#F2C98C', 'stop-opacity': .5 }),
    S('stop', { offset: .55, 'stop-color': '#EBC48E', 'stop-opacity': .14 }),
    S('stop', { offset: 1, 'stop-color': '#EBC48E', 'stop-opacity': 0 })
  ]));
  svg.appendChild(defs);

  svg.appendChild(backBar(defs, x0 - 2, x1 + 2));
  svg.appendChild(S('rect', { x: x0, y: -2, width: span, height: COUNTER_Y + 2, fill: 'url(#' + glow + ')', class: 'lantern-glow' }));
  CREW.forEach((cfg) => svg.appendChild(figure(cfg, rand)));
  svg.appendChild(lantern(rand));
  svg.appendChild(counter(rand, x0 - 2, x1 + 2));

  box.innerHTML = '';
  box.appendChild(svg);

  /* one real button over each of them — taps on SVG shapes are unreliable on phones */
  const taps = el('div', 'tender-taps');
  const figures = $$('.tender', svg);
  const timers = [];
  CREW.forEach((cfg, i) => {
    const b = el('button', 'tender-tap');
    b.type = 'button';
    b.style.left = ((cfg.x - 52 - x0) / span * 100).toFixed(3) + '%';
    b.style.width = (104 / span * 100).toFixed(3) + '%';
    b.setAttribute('aria-label', U('tender_tap'));
    b.addEventListener('click', () => {
      if (prefersStill()) return;
      figures[i].classList.add('acting');
      clearTimeout(timers[i]);
      timers[i] = setTimeout(() => figures[i].classList.remove('acting'), 10000);
    });
    taps.appendChild(b);
  });
  box.appendChild(taps);
}

/* a turned phone or a resized window gets the bar redrawn to its new width */
function fitCrew() {
  const box = $('#crew');
  if (box.clientWidth && box.clientWidth !== crewWidth) renderCrew();
}

/* an order lands and they work faster for a few seconds */
let busyTimer;
function stirTheBar() {
  const box = $('#crew');
  box.classList.add('busy');
  clearTimeout(busyTimer);
  busyTimer = setTimeout(() => box.classList.remove('busy'), 4000);
}
