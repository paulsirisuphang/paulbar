/* Turns the painted drinks into the pictures the page shows.

     node tools/paint.mjs <folder of PNGs> art [key ...]

   Each <key>.png (a drink id, or <id>-egg) is painted on off-white paper.
   The paper is made see-through in proportion to how close each pixel is
   to it, so the wash, the drips and the glass stay translucent; then it is
   trimmed, sized to 400px tall and saved as art/<key>.webp. The sizes go
   into src/data/04-art.js. The PNGs stay out of the repo. */
import fs from 'node:fs';
import path from 'node:path';
import { launch, openPage } from './browser.mjs';
const [rawDir, outDir, ...only] = process.argv.slice(2);
const files = fs.readdirSync(rawDir).filter((f) => f.endsWith('.png') && (!only.length || only.includes(f.replace('.png', ''))));
fs.mkdirSync(outDir, { recursive: true });
const b = await launch('chromium');
const p = await openPage(b, { width: 400, height: 400 });
await p.setContent('<html><body></body></html>');
for (const f of files) {
  const src = 'data:image/png;base64,' + fs.readFileSync(path.join(rawDir, f)).toString('base64');
  const res = await p.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const im = g.getImageData(0, 0, W, H), d = im.data;
    const edge = [];
    for (let i = 0; i < W; i += 4) for (const y of [2, H - 3]) edge.push((y * W + i) * 4);
    for (let j = 0; j < H; j += 4) for (const x of [2, W - 3]) edge.push((j * W + x) * 4);
    const bg = [0, 1, 2].map((k) => { const v = edge.map((i) => d[i + k]).sort((a, b) => a - b); return v[Math.floor(v.length * 0.9)]; });
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let i = 0; i < d.length; i += 4) {
      let a = 0;
      for (let k = 0; k < 3; k++) a = Math.max(a, (bg[k] - d[i + k]) / bg[k]);
      a = Math.min(1, Math.max(0, (a - 0.035) / 0.965));
      if (a <= 0) { d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0; continue; }
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (d[i + k] - bg[k] * (1 - a)) / a));
      d[i + 3] = Math.round(a * 255);
      if (a > 0.1) { const px = (i / 4) % W, py = Math.floor(i / 4 / W); if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
    }
    g.putImageData(im, 0, 0);
    const pad = 6; x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
    const w = x1 - x0, h = y1 - y0, s = Math.min(1, 400 / h);
    const t = document.createElement('canvas'); t.width = Math.round(w * s); t.height = Math.round(h * s);
    const tg = t.getContext('2d'); tg.imageSmoothingQuality = 'high';
    tg.drawImage(c, x0, y0, w, h, 0, 0, t.width, t.height);
    return { url: t.toDataURL('image/webp', 0.76), w: t.width, h: t.height, bg };
  }, src);
  const out = path.join(outDir, f.replace('.png', '.webp'));
  fs.writeFileSync(out, Buffer.from(res.url.split(',')[1], 'base64'));
  console.log(f, `${res.w}x${res.h}`, Math.round(fs.statSync(out).size / 1024) + 'KB', 'paper', res.bg.join(','));
}
await b.close();

/* the sizes go into the page's data, so it can place each picture before it loads */
const dataFile = path.join(outDir, '..', 'src', 'data', '04-art.js');
const sizes = {};
for (const f of fs.readdirSync(outDir).filter((n) => n.endsWith('.webp')).sort()) {
  const buf = fs.readFileSync(path.join(outDir, f));
  /* VP8X header: canvas width and height minus one, 24 bits each */
  const w = 1 + buf.readUIntLE(24, 3), h = 1 + buf.readUIntLE(27, 3);
  sizes[f.replace('.webp', '')] = [w, h];
}
const lines = Object.entries(sizes).map(([k, [w, h]]) => `  '${k}': [${w}, ${h}]`).join(',\n');
fs.writeFileSync(dataFile, `/* ---------- the watercolours ----------
   One painted picture per drink in art/, with its size in pixels. A sour
   that can take egg white has a second one, <id>-egg, in its coupe.
   tools/paint.mjs writes this file; don't edit it by hand. */

const PICTURES = {
${lines}
};
`);
console.log('wrote', dataFile, Object.keys(sizes).length, 'pictures');
