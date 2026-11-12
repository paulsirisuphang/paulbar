/* Cuts a painted sheet of things standing in a row into one picture each.

     node tools/sprites.mjs <sheet.png> <out folder> <name,name,...> [rows]

   The paper is made see-through the way tools/paint.mjs does it; then each
   patch of paint, with its drips and loose specks gathered in, becomes one
   picture, named left to right (or top to bottom with `rows`). Prints how
   many it found, so a sheet that cut wrongly shows up at once. */
import fs from 'node:fs';
import path from 'node:path';
import { launch, openPage } from './browser.mjs';
const [sheet, outDir, namesArg, mode] = process.argv.slice(2);
const names = namesArg.split(',');
fs.mkdirSync(outDir, { recursive: true });
const b = await launch('chromium');
const p = await openPage(b, { width: 400, height: 400 });
await p.setContent('<html><body></body></html>');
const src = 'data:image/png;base64,' + fs.readFileSync(sheet).toString('base64');
const res = await p.evaluate(async ({ src, rows, maxH }) => {
  const img = new Image(); img.src = src; await img.decode();
  const W = img.width, H = img.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const im = g.getImageData(0, 0, W, H), d = im.data;
  const edge = [];
  for (let i = 0; i < W; i += 4) edge.push((2 * W + i) * 4, ((H - 3) * W + i) * 4);
  const bg = [0, 1, 2].map((k) => { const v = edge.map((i) => d[i + k]).sort((a, b) => a - b); return v[Math.floor(v.length * 0.9)]; });
  const A = new Float32Array(W * H);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) {
    let a = 0;
    for (let k = 0; k < 3; k++) a = Math.max(a, (bg[k] - d[i + k]) / bg[k]);
    a = Math.min(1, Math.max(0, (a - 0.035) / 0.965));
    A[j] = a;
    if (a <= 0) { d[i + 3] = 0; continue; }
    for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (d[i + k] - bg[k] * (1 - a)) / a));
    d[i + 3] = Math.round(a * 255);
  }
  g.putImageData(im, 0, 0);
  /* patches of paint on a coarse grid, grown a little so a leaf or a drip
     joins the thing it belongs to */
  const S = 8, gw = Math.ceil(W / S), gh = Math.ceil(H / S);
  const on = new Uint8Array(gw * gh);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (A[y * W + x] > .12) on[Math.floor(y / S) * gw + Math.floor(x / S)] = 1;
  const grow = (m, r) => { const o = new Uint8Array(m.length); for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) if (m[y * gw + x]) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < gh && xx >= 0 && xx < gw) o[yy * gw + xx] = 1; } return o; };
  const m = grow(on, 2);
  const lab = new Int32Array(gw * gh).fill(-1);
  const boxes = [];
  for (let i = 0; i < m.length; i++) {
    if (!m[i] || lab[i] >= 0) continue;
    const id = boxes.length, q = [i]; lab[i] = id;
    const bx = { x0: gw, y0: gh, x1: 0, y1: 0, n: 0 };
    while (q.length) {
      const k = q.pop(), x = k % gw, y = (k - x) / gw;
      bx.n++; bx.x0 = Math.min(bx.x0, x); bx.x1 = Math.max(bx.x1, x); bx.y0 = Math.min(bx.y0, y); bx.y1 = Math.max(bx.y1, y);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < gw && yy >= 0 && yy < gh) { const kk = yy * gw + xx; if (m[kk] && lab[kk] < 0) { lab[kk] = id; q.push(kk); } } });
    }
    boxes.push(bx);
  }
  /* the big ones are the things; a speck goes to the thing whose box it sits under or beside */
  const big = boxes.filter((bx) => bx.n > 60);
  const along = rows ? (bx) => (bx.y0 + bx.y1) / 2 : (bx) => (bx.x0 + bx.x1) / 2;
  big.sort((a, b) => along(a) - along(b));
  const out = big.map((bx) => {
    const pad = 3;
    const x0 = Math.max(0, (bx.x0 - pad) * S), y0 = Math.max(0, (bx.y0 - pad) * S);
    const x1 = Math.min(W, (bx.x1 + 1 + pad) * S), y1 = Math.min(H, (bx.y1 + 1 + pad) * S);
    /* only this patch's paint, so a neighbour's edge never rides along */
    const w = x1 - x0, h = y1 - y0;
    const t = document.createElement('canvas'); t.width = w; t.height = h;
    const tg = t.getContext('2d'); tg.drawImage(c, x0, y0, w, h, 0, 0, w, h);
    const ti = tg.getImageData(0, 0, w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const gx = Math.floor((x + x0) / S), gy = Math.floor((y + y0) / S);
      const l = lab[gy * gw + gx];
      if (l >= 0 && boxes[l] !== bx && boxes[l].n > 60) ti.data[(y * w + x) * 4 + 3] = 0;
    }
    tg.putImageData(ti, 0, 0);
    /* trimmed tight to the paint, so the foot of the picture is the foot of the thing */
    let tx0 = w, ty0 = h, tx1 = 0, ty1 = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (ti.data[(y * w + x) * 4 + 3] > 30) { if (x < tx0) tx0 = x; if (x > tx1) tx1 = x; if (y < ty0) ty0 = y; if (y > ty1) ty1 = y; }
    const cw = tx1 - tx0 + 1, ch = ty1 - ty0 + 1;
    const s = rows ? Math.min(1, 2400 / cw) : Math.min(1, maxH / ch);
    const f = document.createElement('canvas'); f.width = Math.round(cw * s); f.height = Math.round(ch * s);
    const fg = f.getContext('2d'); fg.imageSmoothingQuality = 'high'; fg.drawImage(t, tx0, ty0, cw, ch, 0, 0, f.width, f.height);
    return { url: f.toDataURL('image/webp', 0.8), w: f.width, h: f.height, at: [x0 + tx0, y0 + ty0, cw, ch] };
  });
  return { found: out.length, all: boxes.length, out };
}, { src, rows: mode === 'rows', maxH: 360 });
console.log(path.basename(sheet), 'found', res.found, 'things (', res.all, 'patches )');
res.out.forEach((o, i) => {
  const name = names[i] || 'extra-' + i;
  const file = path.join(outDir, name + '.webp');
  fs.writeFileSync(file, Buffer.from(o.url.split(',')[1], 'base64'));
  console.log(' ', name, o.w + 'x' + o.h, Math.round(fs.statSync(file).size / 1024) + 'KB', 'from', o.at.join(','));
});
await b.close();
