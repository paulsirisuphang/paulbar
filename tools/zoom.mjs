/* Close-ups of chosen drawings from the art lab (python3 tools/artlab.py first):

     node tools/zoom.mjs <out.png> <index,index,...> [size]

   Indexes count the lab's figures from 0, in the order it lays them out. */
import { launch, openPage } from './browser.mjs';
const [out, list, size = 300] = process.argv.slice(2);
const browser = await launch();
const page = await openPage(browser, { width: 1400, height: 900 });
await page.goto('file://' + new URL('../build/artlab.html', import.meta.url).pathname);
await page.waitForTimeout(500);
await page.evaluate(([ids, size]) => {
  const cells = [...document.querySelectorAll('figure')];
  const keep = ids.split(',').map(Number).map((i) => cells[i]);
  const strip = document.createElement('div');
  strip.id = 'strip';
  strip.style.cssText = 'display:flex;gap:18px;padding:16px;background:var(--paper)';
  keep.forEach((c) => { const k = c.cloneNode(true); k.querySelector('svg').style.cssText = `width:${size}px;height:${size * 170 / 120}px`; strip.appendChild(k); });
  document.body.prepend(strip);
}, [list, +size]);
await (await page.$('#strip')).screenshot({ path: out });
await browser.close();
