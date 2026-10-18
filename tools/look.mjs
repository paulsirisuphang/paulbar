/* Screenshots of the test build, for looking at a change.

     node tools/look.mjs <name> <width> <height> [steps...]

   Each shot is saved as build/<name>-<n>.png. Steps, in order:
     shot | full                 the window, or the whole page
     el:<css selector>           just that element
     scroll:<y>                  scroll the page to y
     open:<drink id>             open a drink's card from the menu
     orders | th                 the orders page; Thai
     wait:<ms>                   let animations run
     at:<ms>                     hold every animation at that moment
     eval:<url-encoded js>       run a line of script on the page
     script:<file>               run a file of script on the page

   ENGINE=webkit for Safari's engine; SCALE=3 for a closer look;
   PAINT=1 keeps the bar being painted in instead of finishing it, and
   stops the clock so it never finishes on its own (pair it with at:);
   QUERY='?a=b' adds a query string to the page's address. */
import fs from 'node:fs';
import { launch, openPage, TEST_PAGE } from './browser.mjs';

const [name, w, h, ...steps] = process.argv.slice(2);
const browser = await launch(process.env.ENGINE);
const paint = !!process.env.PAINT;
const page = await openPage(browser, { width: +w, height: +h, scale: +(process.env.SCALE || 2), clock: paint });
/* an installed clock still runs in real time until it's paused */
if (paint) await page.clock.pauseAt(Date.now() + 1000);
await page.goto(TEST_PAGE + (process.env.QUERY || ''));
if (!paint) {
  /* a key finishes the painting, the way a guest would skip it */
  await page.waitForTimeout(300);
  await page.keyboard.press('Shift');
  await page.waitForTimeout(700);
}

let n = 0;
const out = () => `build/${name}-${n++}.png`;
for (const s of steps) {
  const k = s.split(':')[0];
  const v = s.slice(k.length + 1);
  if (k === 'shot' || k === 'full') await page.screenshot({ path: out(), fullPage: k === 'full' });
  if (k === 'el') await (await page.$(decodeURIComponent(v))).screenshot({ path: out() });
  if (k === 'scroll') { await page.evaluate((y) => window.scrollTo(0, +y), v); await page.waitForTimeout(500); }
  if (k === 'open') { await page.evaluate((id) => document.querySelector(`.entry[data-drink="${id}"]`).click(), v); await page.waitForTimeout(1300); }
  if (k === 'orders') { await page.evaluate(() => document.getElementById('tab-orders').click()); await page.waitForTimeout(500); }
  if (k === 'th') { await page.evaluate(() => document.getElementById('lang-th').click()); await page.waitForTimeout(500); }
  if (k === 'wait') await page.waitForTimeout(+v);
  if (k === 'at') await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = ms; }), +v);
  if (k === 'eval') { await page.evaluate(decodeURIComponent(v)); await page.waitForTimeout(400); }
  if (k === 'script') { await page.evaluate(fs.readFileSync(v, 'utf8')); await page.waitForTimeout(600); }
}
console.log(page.errors.length ? 'ERRORS:\n' + page.errors.join('\n') : 'no errors');
await browser.close();
