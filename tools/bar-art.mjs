/* Writes src/data/05-bar-art.js from the pictures in art/bar/: each one's
   size, and how far down it its foot is, so a picture with a shadow or a
   drip under it still stands on the shelf or the counter rather than above
   it. The foot is the lowest row of paint at least an eighth as wide as the
   thing's widest row, so a stem counts and a drip doesn't.

     node tools/bar-art.mjs */
import fs from 'node:fs';
import { launch, openPage } from './browser.mjs';
const dir = new URL('../art/bar/', import.meta.url).pathname;
const out = new URL('../src/data/05-bar-art.js', import.meta.url).pathname;
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.webp')).sort();
const b = await launch('chromium');
const p = await openPage(b, { width: 400, height: 400 });
await p.setContent('<html><body></body></html>');
const sizes = {};
for (const f of files) {
  const src = 'data:image/webp;base64,' + fs.readFileSync(dir + f).toString('base64');
  sizes[f.replace('.webp', '')] = await p.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const W = img.width, H = img.height;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, W, H).data;
    const rows = [];
    for (let y = 0; y < H; y++) { let n = 0; for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 140) n++; rows.push(n); }
    const widest = Math.max(...rows);
    let foot = H - 1;
    while (foot > 0 && rows[foot] < widest * .12) foot--;
    return [W, H, +((foot + 1) / H).toFixed(3)];
  }, src);
}
await b.close();
const lines = Object.entries(sizes).map(([k, [w, h, ft]]) => `  '${k}': [${w}, ${h}, ${ft}]`).join(',\n');
fs.writeFileSync(out, `/* ---------- the bar in watercolour ----------
   The pieces of the bar painted one by one, in art/bar/: the bottles and
   jars on the shelves, the tools on the counter, the lantern, and the wood
   of the shelves and the counter. Each is its width and height in pixels,
   and how far down the picture its foot is. tools/bar-art.mjs writes this
   file; don't edit it by hand. */

const BAR_ART = {
${lines}
};
`);
console.log(Object.keys(sizes).length, 'pictures');
for (const [k, v] of Object.entries(sizes)) if (v[2] < .97) console.log('  ', k, 'foot at', v[2]);
