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

/* through the door: a key finishes painting the bar, the way a guest
   would skip it */
async function skipPainting(page) {
  await page.keyboard.press('Shift');
  await page.waitForFunction(() => !document.querySelector('.painting'));
}
async function enter(page) {
  await page.goto(TEST_PAGE);
  await skipPainting(page);
}
async function comeBack(page) {
  await page.reload();
  await skipPainting(page);
}
/* everything in the bar's drawing that shows at this moment of the painting */
const inkShowing = (page) => page.evaluate(() => {
  const svg = document.querySelector('#scene svg');
  return [...svg.querySelectorAll('path, rect, circle, ellipse, text')].filter((s) => {
    if (s.closest('defs, clipPath, mask, pattern, .act')) return false;
    for (let n = s; n !== svg; n = n.parentNode) if (+getComputedStyle(n).opacity < .02) return false;
    const cs = getComputedStyle(s);
    if (cs.strokeDasharray !== 'none' && parseFloat(cs.strokeDashoffset) >= 1) return false;
    if (/inset\([^)]*100%|circle\(0/.test(cs.clipPath)) return false;
    return cs.display !== 'none' && cs.visibility !== 'hidden';
  }).length;
});
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
  ['the bar paints itself in on every load, from blank paper', { clock: true }, async (page) => {
    /* the clock stands still until it's run on, however slow the machine */
    await page.clock.pauseAt(Date.now() + 1000);
    await page.goto(TEST_PAGE);
    ok(await page.$('#scene.painting'), 'the bar is not painted in on the first load');
    ok(await count(page, '#scene .paint-line') > 100, 'too few lines are drawn in');
    ok(await count(page, '#scene .paint-bleed') > 60, 'too few washes are laid in');
    /* at the first moment the paper is blank; at the last the bar is all there */
    const all = await page.evaluate(() => document.querySelectorAll('#scene svg *').length);
    await page.evaluate(() => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; }));
    eq(await inkShowing(page), 0, 'marks on the paper before the painting starts');
    await page.evaluate(() => document.getAnimations().forEach((a) => { a.currentTime = 30000; }));
    const done = await inkShowing(page);
    ok(done > 300, `only ${done} marks of ${all} show at the end of the painting`);
    await page.evaluate(() => document.getAnimations().forEach((a) => a.play()));
    /* it takes its time: still going at nine seconds, done by sixteen */
    await page.clock.runFor(9000);
    ok(await page.$('#scene.painting'), 'the painting was over in under nine seconds');
    await page.clock.runFor(7000);
    ok(!(await page.$('.painting, .painting-page')), 'the painting never finishes on its own');
    await page.reload();
    ok(await page.$('#scene.painting'), 'the bar is not painted in after a refresh');
  }],

  ['it paints the way a painter would: a part at a time, outline before colour', { width: 1280, height: 860 }, async (page) => {
    await page.goto(TEST_PAGE);
    const plan = await page.evaluate(() => {
      const spans = {};
      const add = (key, s) => {
        const d = parseFloat(s.style.getPropertyValue('--d')), len = parseFloat(s.style.getPropertyValue('--len'));
        if (isNaN(d)) return;
        const k = spans[key] = spans[key] || { from: Infinity, to: 0 };
        k.from = Math.min(k.from, d);
        k.to = Math.max(k.to, d + len);
      };
      document.querySelectorAll('#scene [data-part]').forEach((o) => {
        const part = o.getAttribute('data-part'), order = o.getAttribute('data-order');
        const shapes = o.matches('path, rect, circle, ellipse') ? [o] : [...o.querySelectorAll('path, rect, circle, ellipse')];
        shapes.forEach((s) => {
          add(part, s);
          add(part + ' ' + order, s);
          if (s.classList.contains('paint-line')) add(part + ' ' + order + ' lines', s);
          if (s.classList.contains('paint-bleed')) add(part + ' ' + order + ' washes', s);
        });
      });
      document.querySelectorAll('#scene [style*="--d"]').forEach((s) => add('all', s));
      return { spans, seal: parseFloat(document.querySelector('#scene svg').style.getPropertyValue('--seal-at')) };
    });
    const s = plan.spans;
    ok(s.counter.to <= s.shelves.from + .05, `the shelves start at ${s.shelves.from.toFixed(2)}s, before the counter is done at ${s.counter.to.toFixed(2)}s`);
    ok(s.shelves.to <= s.lantern.from + .05, `the lantern starts at ${s.lantern.from.toFixed(2)}s, before the shelves are done at ${s.shelves.to.toFixed(2)}s`);
    eq(s['counter 0'].from, s.all.from, 'the first mark is not the front edge of the bar');
    ok(s['counter 1'].from < s['counter 12'].from, 'the coupe is drawn before the shaker');
    /* Paul's name goes on the lantern stroke by stroke, in the order it's written */
    const written = await page.$$eval('#scene .lantern-name path', (p) => p.map((s) => parseFloat(s.style.getPropertyValue('--d'))));
    ok(written.every((d, i) => !i || d > written[i - 1]), 'the name is not written stroke after stroke: ' + written.join(', '));
    ok(s['counter 1 lines'].to <= s['counter 1 washes'].from, 'the shaker is coloured before it is outlined');
    ok(s['shelves 0'].from < s['shelves 1'].from, 'a bottle is drawn before the shelf it stands on');
    const total = plan.seal + .6;
    ok(total >= 10 && total <= 15, `the painting takes ${total.toFixed(1)}s`);
  }],

  ['the lantern hangs on a cord from the top of the page', {}, async (page) => {
    await enter(page);
    const m = await page.evaluate(() => {
      const svg = document.querySelector('#scene svg');
      const unit = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      const cord = document.querySelector('#scene .lantern > path');
      const paper = [...document.querySelectorAll('#scene .lantern path')].find((p) => p.getAttribute('fill') === '#EFE6D4');
      return {
        top: cord.getBoundingClientRect().top + window.scrollY,
        wide: paper.getBoundingClientRect().width / unit,
        name: document.querySelectorAll('#scene .lantern-name path').length,
        sways: getComputedStyle(document.querySelector('#scene .lantern')).animationName
      };
    });
    ok(m.top <= 0, `the cord stops ${m.top.toFixed(0)}px below the top of the page`);
    ok(m.wide >= 38, `the lantern is only ${m.wide.toFixed(0)} units wide`);
    /* ホ is four strokes and the small circle makes it ポ; then ー, then ル in two */
    eq(m.name, 8, 'brush marks in ポール on the lantern');
    eq(m.sways, 'lantern', 'the lantern\'s sway');
  }],

  ['a tap finishes the painting at once', {}, async (page) => {
    await page.goto(TEST_PAGE);
    ok(await page.$('#scene.painting'), 'the bar is not being painted');
    const box = await page.$eval('#scene', (n) => { const r = n.getBoundingClientRect(); return [r.left + 6, r.top + r.height * .3]; });
    await page.mouse.click(...box);
    ok(!(await page.$('.painting, .painting-page')), 'the painting carried on after a tap');
  }],

  ['the menu lists every drink but the secret one', {}, async (page) => {
    await enter(page);
    eq(await count(page, '.entry'), 27, 'drinks on the menu');
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

  ['the lantern opens the drink that isn\'t on the menu; the tee is only the !', {}, async (page) => {
    await page.goto(TEST_PAGE);
    /* the tap that finishes the painting doesn't open the lantern as well */
    await page.click('.lantern-tap');
    ok(!(await page.$('.painting')), 'the painting carried on after a tap');
    ok(!(await page.$eval('#sheet', (d) => d.open)), 'the tap that finished the painting opened the lantern too');
    await page.waitForTimeout(800);
    await page.click('.lantern-tap');
    await page.waitForFunction(() => document.getElementById('sheet').open, null, { timeout: 2000 }).catch(() => {});
    ok(await page.$eval('#sheet', (d) => d.open), 'tapping the lantern opens nothing');
    eq(await text(page, '#sheet-title'), 'Smoke Vieux Carré', 'the drink behind the lantern');
    ok(await page.$eval('#sheet .option.smoke input', (i) => i.checked), 'smoke is not on by default');
    await closeCard(page);
    await page.click('#tee');
    await page.waitForTimeout(300);
    ok(!(await page.$eval('#sheet', (d) => d.open)), 'the tee still opens something');
    eq(await count(page, '#secret, .green, .flag-hit, button#tee'), 0, 'the old way to the green is still on the page');
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

  ['each piece on the counter does its party piece, for ten seconds', { clock: true }, async (page) => {
    await enter(page);
    eq(await count(page, '.piece-tap'), 5, 'buttons over the pieces');
    for (const b of await page.$$('.piece-tap')) await b.click();
    const acting = () => page.$$eval('.piece.acting', (p) => p.map((n) => n.className.baseVal.match(/piece-(\w+)/)[1]).join(', '));
    eq(await acting(), 'juggle, stir, shake, chip, smoke', 'pieces performing');
    await page.clock.runFor(10100);
    eq(await acting(), '', 'pieces still performing after ten seconds');
    /* an order sets the shaker going for a few seconds */
    await order(page, 'gimlet', 'Ploy');
    eq(await acting(), 'shake', 'pieces performing after an order');
    await page.clock.runFor(3100);
    eq(await acting(), '', 'the shaker still going after three seconds');
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
    await comeBack(page);
    eq(await page.getAttribute('html', 'lang'), 'th', 'language after a refresh');
  }],

  ['with reduced motion the bar is simply there, and nothing performs', { reducedMotion: true }, async (page) => {
    await page.goto(TEST_PAGE);
    eq(await count(page, '.painting, .painting-page, #scene .paint-line'), 0, 'painting with reduced motion');
    ok(await inkShowing(page) > 300, 'the bar is not all there');
    for (const b of await page.$$('.piece-tap')) await b.click();
    eq(await count(page, '.piece.acting'), 0, 'pieces performing');
  }],

  ['nothing scrolls sideways on a small phone', { width: 375, height: 667 }, async (page) => {
    await enter(page);
    const wide = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    eq(await wide(), 0, 'sideways overflow on the menu');
    await openDrink(page, 'corpse-reviver');
    eq(await wide(), 0, 'sideways overflow with a card open');
  }],

  ['the bar runs the full width; what is on the counter keeps its size in the middle', { width: 1280, height: 860 }, async (page) => {
    await enter(page);
    /* the stage is 800px on a desktop and 340 units wide; the shaker stands
       10 units right of its middle, and the wine bottles and the sidecar
       stand 163 units apart */
    const measure = () => page.evaluate(() => {
      const svg = document.querySelector('#scene svg').getBoundingClientRect();
      const taps = [...document.querySelectorAll('.piece-tap')].map((b) => { const r = b.getBoundingClientRect(); return r.left + r.width / 2; });
      return { left: svg.left, right: svg.right, width: document.documentElement.clientWidth, shaker: taps[2], apart: taps[3] - taps[0] };
    });
    let m = await measure();
    ok(m.left <= 0 && m.right >= m.width - 1, `the bar spans ${m.left.toFixed(0)}–${m.right.toFixed(0)} of a ${m.width}px window`);
    ok(Math.abs(m.shaker - m.width / 2 - 10 * 800 / 340) < 2, `the shaker is ${(m.shaker - m.width / 2).toFixed(1)}px off centre`);
    ok(Math.abs(m.apart - 163 * 800 / 340) < 2, `the outer pieces are ${m.apart.toFixed(1)}px apart on a desktop`);
    eq(await count(page, '.shelf-glow'), 2, 'lit shelves behind the bar');
    /* a narrower window redraws the bar to fit, on the phone's stage */
    await page.setViewportSize({ width: 700, height: 860 });
    await page.waitForTimeout(500);
    m = await measure();
    ok(m.left <= 0 && m.right >= m.width - 1, `after narrowing, the bar spans ${m.left.toFixed(0)}–${m.right.toFixed(0)} of ${m.width}px`);
    ok(Math.abs(m.apart - 163 * 560 / 340) < 2, `after narrowing, the outer pieces are ${m.apart.toFixed(1)}px apart`);
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
