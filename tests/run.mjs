/* The bar's checks, run against build/test.html (the real page with the
   shared book switched off) in Chromium and in WebKit, the engine every
   iPhone browser runs on.

     python3 src/build.py && node tests/run.mjs            both engines
     node tests/run.mjs webkit                             just one
     node tests/run.mjs chromium tee                       checks whose name has "tee" in it

   Every check starts from a fresh browser with nothing remembered. */
import { launch, openPage, TEST_PAGE } from '../tools/browser.mjs';

const ZERO_SUGAR = ['old-fashioned', 'sazerac', 'whiskey-sour', 'gin-sour', 'gimlet', 'tom-collins'];
const FILTERS_EN = ['Spirit-forward', 'Sour & bright', 'Long & refreshing', 'Mocktails'];

class Failed extends Error {}
const ok = (cond, msg) => { if (!cond) throw new Failed(msg); };
const eq = (got, want, msg) => ok(got === want, `${msg}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);

/* through the door: the arrival screen goes on a tap */
async function enter(page) {
  await page.goto(TEST_PAGE);
  if (await page.$('#arrival')) await page.click('#arrival');
  await page.waitForFunction(() => !document.getElementById('arrival'));
}
/* until a smooth scroll has come to rest */
async function settle(page) {
  let last = -1;
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last) return;
    last = y;
    await page.waitForTimeout(120);
  }
}
const count = (page, sel) => page.$$eval(sel, (n) => n.length);
const text = (page, sel) => page.$eval(sel, (n) => n.textContent.trim());
const visible = (page, sel) => page.$eval(sel, (n) => !n.hidden && n.getClientRects().length > 0);
async function openDrink(page, id) {
  await page.click(`.entry[data-drink="${id}"]`);
  await page.waitForFunction(() => document.getElementById('sheet').open);
}
async function closeCard(page) {
  await page.click('.sheet-close');
  await page.waitForFunction(() => !document.getElementById('sheet').open);
}
async function order(page, id, guest) {
  await openDrink(page, id);
  await page.fill('#sheet input.write', guest);
  await page.click('#sheet .btn');
  await page.waitForFunction(() => !document.getElementById('sheet').open);
}

const checks = [
  ['the arrival screen comes back on every load and leaves on its own', {}, async (page) => {
    await page.goto(TEST_PAGE);
    ok(await page.$('#arrival'), 'no arrival screen on the first load');
    await page.waitForFunction(() => !document.getElementById('arrival'), null, { timeout: 4000 });
    await page.reload();
    ok(await page.$('#arrival'), 'no arrival screen after a refresh');
  }],

  ['the menu lists every drink but the secret one', {}, async (page) => {
    await enter(page);
    eq(await count(page, '.entry'), 28, 'drinks on the menu');
    eq(await count(page, '.entry[data-drink="vieux-carre"]'), 0, 'the secret drink on the menu');
    eq(await count(page, '.section'), 4, 'sections');
  }],

  ['the filters use their full names and fit one line on a phone', { width: 360, height: 780 }, async (page) => {
    await enter(page);
    await page.evaluate(() => document.fonts.ready);
    const names = await page.$$eval('.filter', (n) => n.map((b) => b.textContent.trim()));
    eq(names.slice().sort().join(' / '), FILTERS_EN.slice().sort().join(' / '), 'filter names');
    eq(await count(page, '.filter[aria-pressed="true"]'), 0, 'filters chosen at the start');
    const row = await page.$eval('#filters', (n) => ({ over: n.scrollWidth - n.clientWidth, fade: n.classList.contains('more') }));
    ok(row.over <= 1, `the filters run ${row.over}px off the side of a 360px phone`);
    ok(!row.fade, 'the filters fade out at the edge though they fit');
  }],

  ['a filter shows its section, and tapping it again shows everything', {}, async (page) => {
    await enter(page);
    await page.click('.filter:has-text("Sour & bright")');
    eq(await count(page, '.section'), 1, 'sections with one filter chosen');
    ok(await page.$('#sec-shaken'), 'the chosen section is not the one showing');
    await page.click('.filter:has-text("Sour & bright")');
    eq(await count(page, '.section'), 4, 'sections after letting the filter go');
  }],

  ['zero sugar is offered on exactly the six drinks it suits', {}, async (page) => {
    await enter(page);
    const ids = await page.$$eval('.entry', (n) => n.map((b) => b.dataset.drink));
    const offered = [];
    for (const id of ids) {
      await openDrink(page, id);
      if (await page.$('#sheet .option.zero')) offered.push(id);
      await closeCard(page);
    }
    eq(offered.sort().join(', '), ZERO_SUGAR.slice().sort().join(', '), 'drinks offering zero sugar');
  }],

  ['zero sugar swaps the syrup in the recipe', {}, async (page) => {
    await enter(page);
    await openDrink(page, 'old-fashioned');
    eq(await count(page, '#sheet .build li.swapped'), 0, 'swapped lines before ticking it');
    await page.click('#sheet .option.zero');
    eq(await count(page, '#sheet .build li.swapped'), 1, 'swapped lines after ticking it');
    ok((await text(page, '#sheet .build li.swapped')).includes('zero-sugar'), 'the swapped line is not the zero-sugar syrup');
  }],

  ['an order needs a name, then lands on the rail', {}, async (page) => {
    await enter(page);
    await openDrink(page, 'gin-tonic');
    await page.fill('#sheet input.write', '');
    await page.click('#sheet .btn');
    ok(await page.$eval('#sheet', (d) => d.open), 'the card closed without a name');
    ok(await page.$('#sheet input.write.wanting'), 'the name line is not marked as wanted');
    await page.fill('#sheet input.write', 'Mai');
    await page.click('#sheet .btn');
    await page.waitForFunction(() => !document.getElementById('sheet').open);
    ok(await page.$('#toast.show'), 'no toast after ordering');
    eq(await text(page, '#burger-count'), '1', 'the count on the menu button');
    await page.click('#burger');
    await page.click('#tab-orders');
    eq(await count(page, '.ticket'), 1, 'tickets on the rail');
    eq(await text(page, '.ticket-drink'), 'Gin & Tonic', 'the ticket');
    eq(await text(page, '.ticket-guest'), 'Mai', 'the guest');
  }],

  ['an open build stays open while new orders arrive', {}, async (page) => {
    await enter(page);
    await order(page, 'negroni', 'Ben');
    await page.click('#burger');
    await page.click('#tab-orders');
    await page.click('.build-toggle');
    ok(await visible(page, '.build-panel'), 'the build did not open');
    /* another phone's order arriving redraws the rail */
    await page.click('#burger');
    await page.click('#tab-menu');
    await order(page, 'gimlet', 'Ploy');
    await page.click('#burger');
    await page.click('#tab-orders');
    await page.waitForTimeout(3500);
    const open = await page.$$eval('.ticket', (t) => t.filter((n) => n.querySelector('.build-panel:not([hidden])')).map((n) => n.querySelector('.ticket-drink').textContent));
    eq(open.join(), 'Negroni', 'builds open after a redraw and a wait');
  }],

  ['pouring stamps the ticket, and clearing empties the rail', {}, async (page) => {
    await enter(page);
    await order(page, 'sidecar', 'Ton');
    await page.click('#burger');
    await page.click('#tab-orders');
    await page.click('.pour');
    ok(await page.$('.ticket.done .stamp'), 'no stamp on the poured ticket');
    eq(await text(page, '#tally-poured'), '1', 'poured tally');
    await page.click('.link-btn');
    eq(await count(page, '.ticket'), 0, 'tickets after clearing');
    ok(await page.$('.empty'), 'no quiet-bar message');
  }],

  ['the tee finds the eighteenth green, and its flag opens the secret', {}, async (page) => {
    await enter(page);
    ok(!(await visible(page, '#secret')), 'the green shows before the tee is found');
    await page.click('#tee');
    ok(await visible(page, '#secret .green svg'), 'no green after tapping the tee');
    /* tap where the flag is drawn, so the button has to be over it */
    await settle(page);
    const flag = await page.$eval('.green .pennant', (n) => { const r = n.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    await page.mouse.click(...flag);
    await page.waitForFunction(() => document.getElementById('sheet').open, null, { timeout: 2000 }).catch(() => {});
    ok(await page.$eval('#sheet', (d) => d.open), 'tapping the flag opens nothing');
    eq(await text(page, '#sheet-title'), 'Smoke Vieux Carré', 'the drink behind the flag');
    ok(await page.$eval('#sheet .option.smoke input', (i) => i.checked), 'smoke is not on by default');
    await closeCard(page);
    await page.click('#tee');
    eq(await text(page, '#sheet-title'), 'Smoke Vieux Carré', 'the drink behind the tee once found');
    await closeCard(page);
    await page.reload();
    await page.click('#arrival');
    ok(await visible(page, '#secret .green svg'), 'the green is forgotten after a refresh');
  }],

  ['the name goes home: the whole menu, from the top', {}, async (page) => {
    await enter(page);
    await page.click('.filter:has-text("Mocktails")');
    await page.click('#burger');
    await page.click('#tab-orders');
    await page.click('#home');
    ok(await visible(page, '#view-menu'), 'the menu is not showing');
    eq(await count(page, '.filter[aria-pressed="true"]'), 0, 'filters still chosen');
    eq(await count(page, '.section'), 4, 'sections');
  }],

  ['the tee is the exclamation mark, hard against the r and on the line', {}, async (page) => {
    await enter(page);
    const m = await page.evaluate(() => {
      const home = document.getElementById('home').getBoundingClientRect();
      const tee = document.querySelector('#tee svg').getBoundingClientRect();
      return { gap: tee.left - home.right, bottom: (tee.bottom - home.top) / home.height };
    });
    ok(m.gap > -4 && m.gap < 3, `the tee sits ${m.gap.toFixed(1)}px from the r`);
    ok(m.bottom > .62 && m.bottom < .95, `the tee floats off the baseline (its foot at ${(m.bottom * 100).toFixed(0)}% of the line)`);
  }],

  ['each bartender does their own party piece, for ten seconds', { clock: true }, async (page) => {
    await enter(page);
    eq(await count(page, '.tender-tap'), 3, 'buttons over the bartenders');
    for (const b of await page.$$('.tender-tap')) await b.click();
    eq(await count(page, '.tender.acting'), 3, 'bartenders performing');
    const flips = await page.$$eval('.tender', (t) => t.map((n) => getComputedStyle(n.querySelector('.flip')).animationName));
    eq(flips.join(', '), 'none, none, headstand', 'who turns upside down');
    await page.clock.runFor(10100);
    eq(await count(page, '.tender.acting'), 0, 'bartenders still performing after ten seconds');
  }],

  ['Thai: everything moves, and words stay whole', {}, async (page) => {
    await enter(page);
    await page.click('#lang-th');
    eq(await page.getAttribute('html', 'lang'), 'th', 'page language');
    const filters = await page.$$eval('.filter', (n) => n.map((b) => b.textContent));
    ok(filters.every((f) => /[\u0E00-\u0E7F]/.test(f)), 'a filter is not in Thai');
    const words = await page.$$eval('.entry[data-drink="americano"] .entry-hook .tw', (n) => n.map((w) => w.textContent));
    ok(words.includes('มาร์ตินี่') && words.includes('ก่อน'), 'a loanword is cut in two: ' + words.join('|'));
    const split = await page.$$eval('.note', (n) => n.filter((x) => x.children.length !== 2).length);
    eq(split, 0, 'notes whose words came apart');
    await page.reload();
    await page.click('#arrival');
    eq(await page.getAttribute('html', 'lang'), 'th', 'language after a refresh');
  }],

  ['with reduced motion there is no arrival and nobody performs', { reducedMotion: true }, async (page) => {
    await page.goto(TEST_PAGE);
    eq(await count(page, '#arrival'), 0, 'arrival screens');
    await page.click('.tender-tap');
    eq(await count(page, '.tender.acting'), 0, 'bartenders performing');
  }],

  ['nothing scrolls sideways on a small phone', { width: 375, height: 667 }, async (page) => {
    await enter(page);
    const wide = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    eq(await wide(), 0, 'sideways overflow on the menu');
    await openDrink(page, 'corpse-reviver');
    eq(await wide(), 0, 'sideways overflow with a card open');
  }],

  ['the bar runs the full width; the crew keep their size in the middle', { width: 1280, height: 860 }, async (page) => {
    await enter(page);
    /* the crew's stage is 800px on a desktop, 340 units wide: tap areas 104 units apart */
    const measure = () => page.evaluate(() => {
      const svg = document.querySelector('#crew svg').getBoundingClientRect();
      const taps = [...document.querySelectorAll('.tender-tap')].map((b) => { const r = b.getBoundingClientRect(); return r.left + r.width / 2; });
      return { left: svg.left, right: svg.right, width: document.documentElement.clientWidth, middle: taps[1], apart: taps[2] - taps[0] };
    });
    let m = await measure();
    ok(m.left <= 0 && m.right >= m.width - 1, `the bar spans ${m.left.toFixed(0)}–${m.right.toFixed(0)} of a ${m.width}px window`);
    ok(Math.abs(m.middle - m.width / 2) < 2, `the middle bartender is ${(m.middle - m.width / 2).toFixed(1)}px off centre`);
    ok(Math.abs(m.apart - 208 * 800 / 340) < 2, `the outer bartenders are ${m.apart.toFixed(1)}px apart on a desktop`);
    eq(await count(page, '.shelf-glow'), 2, 'lit shelves behind the bar');
    /* a narrower window redraws the bar to fit, and the crew drop to the phone stage */
    await page.setViewportSize({ width: 700, height: 860 });
    await page.waitForTimeout(500);
    m = await measure();
    ok(m.left <= 0 && m.right >= m.width - 1, `after narrowing, the bar spans ${m.left.toFixed(0)}–${m.right.toFixed(0)} of ${m.width}px`);
    ok(Math.abs(m.apart - 208 * 560 / 340) < 2, `after narrowing, the outer bartenders are ${m.apart.toFixed(1)}px apart`);
  }],

  ['spirit-forward comes first, in the filters and on the card', {}, async (page) => {
    await enter(page);
    eq(await text(page, '.filter'), 'Spirit-forward', 'the first filter');
    eq(await page.$eval('.section', (s) => s.id), 'sec-stirred', 'the first section');
  }],

  ['buttons and the card have soft corners', {}, async (page) => {
    await enter(page);
    const radius = (sel) => page.$eval(sel, (n) => parseFloat(getComputedStyle(n).borderTopLeftRadius));
    ok(await radius('#choice') >= 8, 'Surprise me has square corners');
    await openDrink(page, 'gimlet');
    ok(await radius('#sheet') >= 14, 'the card has square corners');
    ok(await radius('#sheet .btn') >= 8, 'Send to the bar has square corners');
    ok(await radius('#sheet .option') >= 8, 'the options have square corners');
  }],

  ['Surprise me pours something from the menu, never the secret', {}, async (page) => {
    await enter(page);
    for (let i = 0; i < 6; i++) {
      await page.click('#choice');
      await page.waitForFunction(() => document.getElementById('sheet').open);
      ok((await text(page, '#sheet-title')) !== 'Smoke Vieux Carré', 'the secret came out of Surprise me');
      await closeCard(page);
    }
  }]
];

const [engineArg, only] = process.argv.slice(2);
const engines = engineArg && engineArg !== 'all' ? [engineArg] : ['chromium', 'webkit'];
let failures = 0;
for (const engine of engines) {
  const browser = await launch(engine);
  console.log('\n' + engine);
  for (const [name, opts, fn] of checks.filter(([n]) => !only || n.includes(only))) {
    const page = await openPage(browser, opts);
    try {
      await fn(page);
      ok(!page.errors.length, 'the page logged: ' + page.errors.join(' | '));
      console.log('  ok    ' + name);
    } catch (e) {
      failures++;
      console.log('  FAIL  ' + name + '\n        ' + (e instanceof Failed ? e.message : e.stack.split('\n').slice(0, 3).join('\n        ')));
    }
    await page.context().close();
  }
  await browser.close();
}
console.log(failures ? `\n${failures} failed` : '\nall passed');
process.exit(failures ? 1 : 0);
