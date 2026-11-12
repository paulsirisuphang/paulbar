/* The bar's checks, run against build/test.html (the real page with the
   shared book switched off) in Chromium and in WebKit, the engine every
   iPhone browser runs on.

     python3 src/build.py && node tests/run.mjs            both engines
     node tests/run.mjs webkit                             just one
     node tests/run.mjs chromium tee                       checks whose name has "tee" in it

   Every check starts from a fresh browser with nothing remembered. */
import fs from 'node:fs';
import vm from 'node:vm';
import { launch, openPage, TEST_PAGE } from '../tools/browser.mjs';

const FILTERS_EN = ['Strong & stirred', 'Sour & bright', 'Tall & fizzy', 'Mocktails'];

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
  return [...svg.querySelectorAll('path, rect, circle, ellipse, text, image')].filter((s) => {
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
  ['the bar paints itself in once a visit, from blank paper', { clock: true }, async (page) => {
    /* the clock stands still until it's run on, however slow the machine */
    await page.clock.pauseAt(Date.now() + 1000);
    await page.goto(TEST_PAGE);
    ok(await page.$('#scene.painting'), 'the bar is not painted in on the first load');
    /* each watercolour is washed in, and the wood laid along the bar */
    ok(await count(page, '#scene image.paint-bleed') > 30, 'too few watercolours are washed in');
    ok(await count(page, '#scene image[class*="paint-wipe"]') >= 4, 'the wood of the shelves and the counter is not laid along');
    /* at the first moment the paper is blank; at the last the bar is all there */
    const all = await page.evaluate(() => document.querySelectorAll('#scene svg *').length);
    await page.evaluate(() => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 0; }));
    eq(await inkShowing(page), 0, 'marks on the paper before the painting starts');
    await page.evaluate(() => document.getAnimations().forEach((a) => { a.currentTime = 30000; }));
    const done = await inkShowing(page);
    ok(done > 90, `only ${done} marks of ${all} show at the end of the painting`);
    await page.evaluate(() => document.getAnimations().forEach((a) => a.play()));
    /* it takes its time: still going at nine seconds, done by sixteen */
    await page.clock.runFor(9000);
    ok(await page.$('#scene.painting'), 'the painting was over in under nine seconds');
    await page.clock.runFor(7000);
    ok(!(await page.$('.painting, .painting-page')), 'the painting never finishes on its own');
    /* back for a second drink the same evening, the bar is already there */
    await page.reload();
    ok(!(await page.$('#scene.painting')), 'the bar painted in again on a second visit the same evening');
    ok(await inkShowing(page) > 90, 'the bar is not all there on a second visit');
    /* another evening, it paints in again */
    await page.evaluate(() => localStorage.setItem('paulsbar.painted.v1', String(Date.now() - 7 * 3600 * 1000)));
    await page.reload();
    ok(await page.$('#scene.painting'), 'the bar is not painted in on a visit hours later');
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
        const shapes = o.matches('path, rect, circle, ellipse, image') ? [o] : [...o.querySelectorAll('path, rect, circle, ellipse, image')];
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
    ok(s['shelves 0'].from < s['shelves 1'].from, 'a bottle is drawn before the shelf it stands on');
    const total = plan.seal + .6;
    ok(total >= 10 && total <= 15, `the painting takes ${total.toFixed(1)}s`);
  }],

  ['the lantern hangs on a cord from the top of the page, and its light starts there', {}, async (page) => {
    await enter(page);
    const m = await page.evaluate(() => {
      const svg = document.querySelector('#scene svg');
      const unit = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
      const cord = document.querySelector('#scene .lantern > path');
      const paper = document.querySelector('#scene .lantern image');
      return {
        top: cord.getBoundingClientRect().top + window.scrollY,
        light: document.querySelector('#scene .lantern-glow').getBoundingClientRect().top + window.scrollY,
        wide: paper.getBoundingClientRect().width / unit,
        name: document.querySelectorAll('#scene .lantern-name path').length,
        sways: getComputedStyle(document.querySelector('#scene .lantern')).animationName
      };
    });
    ok(m.top <= 0, `the cord stops ${m.top.toFixed(0)}px below the top of the page`);
    /* light that started where the header ends would draw an edge under it */
    ok(m.light <= 0, `the lantern's light starts ${m.light.toFixed(0)}px below the top of the page`);
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

  ['no em dash in anything a guest or the bar reads, in either language', {}, async () => {
    /* the copy itself, read the way tools/thai_check.mjs reads it */
    const dir = new URL('../src/data/', import.meta.url).pathname;
    const src = fs.readdirSync(dir).sort().map((f) => fs.readFileSync(dir + f, 'utf8')).join('\n');
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(src + '\n;globalThis.__ = { DRINKS, T_EN, T_TH, TH, WOODS, WOODS_TH };', ctx);
    const dashed = [];
    const walk = (v, where) => {
      if (typeof v === 'string' || typeof v === 'function') { if (String(v).includes('\u2014')) dashed.push(where); }
      else if (Array.isArray(v)) v.forEach((x, i) => walk(x, where + '[' + i + ']'));
      else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, where + '.' + k));
    };
    walk(ctx.__, 'copy');
    eq(dashed.join(', '), '', 'em dashes');
  }],

  ['the menu lists every drink but the secret one', {}, async (page) => {
    await enter(page);
    eq(await count(page, '.entry'), 28, 'drinks on the menu');
    /* no Cointreau on the bar, so the drinks that need it are off the menu */
    for (const id of ['sidecar', 'corpse-reviver', 'pegu-club']) eq(await count(page, `.entry[data-drink="${id}"]`), 0, `${id} on the menu`);
    for (const id of ['bobby-burns', 'penicillin', 'pandan-sour']) eq(await count(page, `.entry[data-drink="${id}"]`), 1, id + ' on the menu');
    eq(await count(page, '.entry[data-drink="de-la-louisiane"]'), 0, 'De La Louisiane on the menu');
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

  ['the whiskey sour comes with egg white; the card names what is in it, without measures', {}, async (page) => {
    await enter(page);
    await openDrink(page, 'whiskey-sour');
    ok(await page.$('#sheet .option.egg input:checked'), 'the whiskey sour opens without egg white');
    eq(await text(page, '#sheet .inside-line'), 'Bourbon, lemon, sugar, egg white', 'what is in it');
    eq(await count(page, '#sheet .build'), 0, 'measures on the guest\'s card');
    await closeCard(page);
  }],

  ['the Japanese bitters go in by default, and come out for the classic', {}, async (page) => {
    await enter(page);
    const ids = await page.$$eval('.entry', (n) => n.map((b) => b.dataset.drink));
    const yuzu = [], umami = [];
    for (const id of ids) {
      await openDrink(page, id);
      if (await page.$('#sheet .option.yuzu input:checked')) yuzu.push(id);
      if (await page.$('#sheet .option.umami input:checked')) umami.push(id);
      await closeCard(page);
    }
    eq(yuzu.sort().join(', '), 'bees-knees, gin-tonic, margarita, whiskey-highball, white-negroni', 'drinks with yuzu bitters in');
    eq(umami.sort().join(', '), 'negroni, old-fashioned, rye-manhattan', 'drinks with umami bitters in');
    /* the menu line says so */
    const marked = await page.$$eval('.entry', (n) => n.filter((e) => e.querySelector('.note.umami')).map((e) => e.dataset.drink).sort().join(', '));
    eq(marked, 'negroni, old-fashioned, ponzu-gimlet, rye-manhattan, umami-martini', 'drinks whose menu line says umami bitters, with fish');
    /* unticked, the order is the classic */
    await openDrink(page, 'rye-manhattan');
    await page.click('#sheet .option.umami');
    await page.fill('#sheet input.write', 'Ana');
    await page.click('#sheet .btn');
    await page.waitForFunction(() => !document.getElementById('sheet').open);
    /* the order carries it, and the ticket and its build say so */
    await order(page, 'margarita', 'Kai');
    await page.click('#burger');
    await page.click('#tab-orders');
    ok((await text(page, '.ticket .notes-line')).includes('Yuzu bitters'), 'the ticket does not say yuzu bitters');
    ok(!(await page.locator('.ticket', { hasText: 'Ana' }).textContent()).includes('Umami'), 'the classic Manhattan says umami');
    await page.click('.build-toggle');
    ok((await text(page, '.build-panel .steps')).includes('yuzu bitters to the shaker'), 'the method has no yuzu step');
  }],

  ['a drink that takes smoke opens smoked, on its best wood, and can be unsmoked', {}, async (page) => {
    await enter(page);
    /* the menu shows smoke over every drink that takes it, and no other */
    const smoked = await page.$$eval('.entry', (n) => n.filter((e) => e.querySelector('.entry-art .wisp-soft')).map((e) => e.dataset.drink));
    eq(smoked.length, 8, 'drinks shown smoking on the menu: ' + smoked.join(', '));
    ok(!smoked.includes('gimlet'), 'smoke over a drink that never takes it');
    /* a drink that never takes smoke just doesn't offer it, without saying why */
    await openDrink(page, 'gimlet');
    eq(await count(page, '#sheet .option.smoke'), 0, 'a smoke option on the Gimlet');
    ok(!(await text(page, '#sheet')).includes('No smoke'), 'the Gimlet explains why it has no smoke');
    await closeCard(page);
    await openDrink(page, 'negroni');
    ok(await page.$eval('#sheet .option.smoke input', (i) => i.checked), 'smoke is not on to begin with');
    eq(await text(page, '#sheet .wood[aria-pressed="true"]'), 'Cherry', 'the wood chosen for a Negroni');
    ok(await count(page, '#sheet .preview .wisp') > 0, 'no smoke over the drink on its card');
    /* taking it off takes the smoke away and sends it unsmoked */
    await page.click('#sheet .option.smoke');
    ok(!(await page.$eval('#sheet .option.smoke input', (i) => i.checked)), 'smoke would not come off');
    eq(await count(page, '#sheet .preview .wisp'), 0, 'smoke still over the drink once taken off');
    await page.fill('#sheet input.write', 'Nok');
    await page.click('#sheet .btn');
    await page.waitForSelector('#toast.show');
    eq(await count(page, '#toast .sent-smoke'), 0, 'smoke on the slip for a drink sent without it');
    await page.click('#burger');
    await page.click('#tab-orders');
    eq(await count(page, '.ticket .note.smoke'), 0, 'smoke on a drink sent without it');
    await page.click('#burger');
    await page.click('#tab-menu');
    await openDrink(page, 'old-fashioned');
    eq(await text(page, '#sheet .wood[aria-pressed="true"]'), 'Oak', 'the wood chosen for an Old Fashioned');
    /* sent smoked, one thin curl leaves the glass on the slip; nothing
       crosses the rest of the page */
    await page.fill('#sheet input.write', 'Nok');
    await page.click('#sheet .btn');
    await page.waitForFunction(() => !document.getElementById('sheet').open);
    await page.waitForFunction(() => !document.getElementById('toast').classList.contains('show'));
    await page.waitForSelector('#toast.show');
    eq(await count(page, '#toast .sent-smoke'), 1, 'curls of smoke on the slip');
    eq(await count(page, '.page-smoke'), 0, 'smoke across the page');
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
    await page.waitForSelector('#toast.show');
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
    await order(page, 'bees-knees', 'Ton');
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

  ['the wine stands on the back bar: three bottles on the lower shelf, and none on the counter', {}, async (page) => {
    await enter(page);
    const m = await page.evaluate(() => ({
      wine: [...document.querySelectorAll('#scene .shelf-wine')].map((w) => w.getBoundingClientRect().bottom),
      shelf: [...document.querySelectorAll('#scene .shelf-glow')].map((g) => g.getBoundingClientRect().bottom)
    }));
    eq(m.wine.length, 3, 'wine bottles on the back bar');
    ok(m.wine.every((b) => Math.abs(b - m.shelf[1]) < 2), 'a wine bottle off the lower shelf: ' + m.wine.map((b) => b.toFixed(1)).join(', ') + ' against ' + m.shelf[1].toFixed(1));
    eq(await count(page, '.piece-juggle'), 0, 'wine bottles on the counter');
  }],

  ['each piece on the counter does its party piece, for ten seconds', { clock: true }, async (page) => {
    await enter(page);
    eq(await count(page, '.piece-tap'), 4, 'buttons over the pieces');
    for (const b of await page.$$('.piece-tap')) await b.click();
    const acting = () => page.$$eval('.piece.acting', (p) => p.map((n) => n.className.baseVal.match(/piece-(\w+)/)[1]).join(', '));
    eq(await acting(), 'stir, shake, chip, smoke', 'pieces performing');
    await page.clock.runFor(10100);
    eq(await acting(), '', 'pieces still performing after ten seconds');
    /* an order sets the shaker going for a few seconds, once its plane lands */
    await order(page, 'gimlet', 'Ploy');
    for (let i = 0; i < 60 && !(await page.$('#toast.show')); i++) await page.clock.runFor(100);
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
    const words = await page.$$eval('.entry[data-drink="boulevardier"] .entry-hook .tw', (n) => n.map((w) => w.textContent));
    ok(words.includes('คาราเมล') && words.includes('เบอร์เบิน'), 'a loanword is cut in two: ' + words.join('|'));
    const split = await page.$$eval('.note', (n) => n.filter((x) => x.children.length !== 2).length);
    eq(split, 0, 'notes whose words came apart');
    eq(await page.$eval('.entry-hook', (n) => getComputedStyle(n).fontStyle), 'normal', 'a Thai hook set in italic');
    await comeBack(page);
    eq(await page.getAttribute('html', 'lang'), 'th', 'language after a refresh');
  }],

  ['a Thai name stands upright on the English page too', {}, async (page) => {
    await enter(page);
    await order(page, 'negroni', 'นก');
    await order(page, 'gimlet', 'Ben');
    await page.click('#burger');
    await page.click('#tab-orders');
    const names = await page.$$eval('.ticket-guest', (n) => n.map((g) => g.textContent + ' ' + getComputedStyle(g.firstElementChild || g).fontStyle));
    ok(names.includes('นก normal'), 'a Thai name set in italic: ' + names.join(', '));
    ok(names.includes('Ben italic'), 'an English name lost its italic: ' + names.join(', '));
  }],

  ['sent, the card folds into a paper plane that flies to the orders, and the slip follows', {}, async (page) => {
    await enter(page);
    await openDrink(page, 'pandan-sour');
    await page.fill('#sheet input.write', 'Nok');
    await page.click('#sheet .btn');
    await page.waitForSelector('svg.plane');
    ok(!(await page.$('#toast.show')), 'the slip came before the plane landed');
    eq(await text(page, '#burger-count'), '1', 'the count on the menu button while the plane flies');
    /* it ends small, in the top right corner, on the way to the orders */
    let last = null;
    while (await page.$('svg.plane')) {
      last = await page.$eval('svg.plane', (s) => { const b = s.firstElementChild.nextElementSibling.getBoundingClientRect(); return b.width ? [b.left + b.width / 2, b.top + b.height / 2, b.width] : null; }).catch(() => last) || last;
      await page.waitForTimeout(60);
    }
    const burger = await page.$eval('#burger', (b) => { const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    ok(last && Math.hypot(last[0] - burger[0], last[1] - burger[1]) < 60, 'the plane did not land on the orders button: ' + JSON.stringify(last));
    await page.waitForSelector('#toast.show');
    ok((await text(page, '#toast-text')).includes('Pandan Sour'), 'the slip after the plane');
  }],

  ['with motion off, an order goes straight through: no plane', { reducedMotion: true }, async (page) => {
    await page.goto(TEST_PAGE);
    await openDrink(page, 'gimlet');
    await page.fill('#sheet input.write', 'Nok');
    await page.click('#sheet .btn');
    await page.waitForFunction(() => !document.getElementById('sheet').open);
    ok(await page.$('#toast.show'), 'no slip at once with motion off');
    eq(await count(page, 'svg.plane'), 0, 'a paper plane with motion off');
  }],

  ['with reduced motion the bar is simply there, and nothing performs', { reducedMotion: true }, async (page) => {
    await page.goto(TEST_PAGE);
    eq(await count(page, '.painting, .painting-page, #scene .paint-line'), 0, 'painting with reduced motion');
    ok(await inkShowing(page) > 90, 'the bar is not all there');
    for (const b of await page.$$('.piece-tap')) await b.click();
    eq(await count(page, '.piece.acting'), 0, 'pieces performing');
  }],

  ['nothing scrolls sideways on a small phone', { width: 375, height: 667 }, async (page) => {
    await enter(page);
    const wide = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    eq(await wide(), 0, 'sideways overflow on the menu');
    await openDrink(page, 'pandan-sour');
    eq(await wide(), 0, 'sideways overflow with a card open');
  }],

  ['the bar runs the full width; what is on the counter keeps its size in the middle', { width: 1280, height: 860 }, async (page) => {
    await enter(page);
    /* the stage is 800px on a desktop and 340 units wide; the shaker stands
       10 units right of its middle, and the smoking gun and the sidecar
       stand 208 units apart */
    const measure = () => page.evaluate(() => {
      const svg = document.querySelector('#scene svg').getBoundingClientRect();
      const taps = [...document.querySelectorAll('.piece-tap')].map((b) => { const r = b.getBoundingClientRect(); return r.left + r.width / 2; });
      return { left: svg.left, right: svg.right, width: document.documentElement.clientWidth, shaker: taps[1], apart: taps[2] - taps[3] };
    });
    let m = await measure();
    ok(m.left <= 0 && m.right >= m.width - 1, `the bar spans ${m.left.toFixed(0)}–${m.right.toFixed(0)} of a ${m.width}px window`);
    ok(Math.abs(m.shaker - m.width / 2 - 10 * 800 / 340) < 2, `the shaker is ${(m.shaker - m.width / 2).toFixed(1)}px off centre`);
    ok(Math.abs(m.apart - 208 * 800 / 340) < 2, `the outer pieces are ${m.apart.toFixed(1)}px apart on a desktop`);
    eq(await count(page, '.shelf-glow'), 2, 'lit shelves behind the bar');
    /* a narrower window redraws the bar to fit, on the phone's stage; wait
       for the redraw itself, which a busy machine can take a while over */
    const drawn = await page.$eval('#scene svg', (s) => s.getAttribute('viewBox'));
    await page.setViewportSize({ width: 700, height: 860 });
    await page.waitForFunction((was) => document.querySelector('#scene svg').getAttribute('viewBox') !== was, drawn);
    m = await measure();
    ok(m.left <= 0 && m.right >= m.width - 1, `after narrowing, the bar spans ${m.left.toFixed(0)}–${m.right.toFixed(0)} of ${m.width}px`);
    ok(Math.abs(m.apart - 208 * 560 / 340) < 2, `after narrowing, the outer pieces are ${m.apart.toFixed(1)}px apart`);
  }],

  ['spirit-forward comes first, in the filters and on the card', {}, async (page) => {
    await enter(page);
    eq(await text(page, '.filter'), 'Strong & stirred', 'the first filter');
    eq(await page.$eval('.section', (s) => s.id), 'sec-stirred', 'the first section');
  }],

  ['Surprise me has soft corners; the card is a sheet of deckled paper', {}, async (page) => {
    await enter(page);
    ok(await page.$eval('#choice', (n) => parseFloat(getComputedStyle(n).borderTopLeftRadius)) >= 8, 'Surprise me has square corners');
    await openDrink(page, 'gimlet');
    /* the edge is drawn to the card's size once the card has one */
    await page.waitForFunction(() => document.getElementById('sheet').style.getPropertyValue('--deckle'), null, { timeout: 5000 }).catch(() => {});
    const card = await page.evaluate(() => {
      const paper = getComputedStyle(document.querySelector('#sheet .paper-sheet'));
      const band = getComputedStyle(document.querySelector('#sheet .btn'), '::before');
      return { edge: paper.maskImage || paper.webkitMaskImage || '', ink: band.backgroundImage };
    });
    ok(/data:image\/svg/.test(card.edge), 'the card has no deckled edge');
    ok(/data:image\/svg/.test(card.ink), 'the order button is not a stroke of ink');
  }],

  ['every drink has its watercolour, and a sour its coupe with egg white too', {}, async (page) => {
    const dir = new URL('../src/data/', import.meta.url).pathname;
    const src = fs.readdirSync(dir).sort().map((f) => fs.readFileSync(dir + f, 'utf8')).join('\n');
    const ctx = {};
    vm.createContext(ctx);
    vm.runInContext(src + '\n;globalThis.__ = { DRINKS, PICTURES };', ctx);
    const { DRINKS, PICTURES } = ctx.__;
    const want = DRINKS.flatMap((d) => (d.egg ? [d.id, d.id + '-egg'] : [d.id]));
    eq(want.filter((k) => !PICTURES[k]).join(', '), '', 'drinks without a picture');
    const art = new URL('../art/', import.meta.url).pathname;
    eq(Object.keys(PICTURES).filter((k) => !fs.existsSync(art + k + '.webp')).join(', '), '', 'pictures missing from art/');
    /* on the page, the pictures far down the menu wait until it's scrolled to */
    await enter(page);
    const waiting = () => count(page, '.entry svg.painted image[data-href]');
    ok(await waiting() > 5, 'every picture on the menu loads at once');
    for (const entry of await page.$$('.entry')) await entry.scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector('.entry image[data-href]'));
    /* and then every one loads */
    const broken = await page.evaluate(async () => {
      const hrefs = [...document.querySelectorAll('.entry svg.painted image')].map((i) => i.getAttribute('href'));
      const bad = [];
      for (const h of hrefs) { const img = new Image(); img.src = h; try { await img.decode(); } catch { bad.push(h); } }
      return { count: hrefs.length, bad };
    });
    eq(broken.count, await count(page, '.entry'), 'menu entries showing a picture');
    eq(broken.bad.join(', '), '', 'pictures that failed to load');
    /* unticking egg white swaps the coupe for the rocks glass */
    const shown = () => page.evaluate(() => document.querySelector('#sheet .preview svg image').getAttribute('href'));
    await openDrink(page, 'whiskey-sour');
    ok((await shown()).endsWith('whiskey-sour-egg.webp'), 'the sour opens without its coupe');
    await page.click('#sheet .option.egg');
    ok((await shown()).endsWith('whiskey-sour.webp'), 'no egg white still shows the coupe');
  }],

  ['Help me choose asks two questions and offers drinks to match', { width: 390, height: 844 }, async (page) => {
    await enter(page);
    /* both buttons sit on one line on a phone */
    const tops = await page.$$eval('.hero-actions .choice', (b) => b.map((n) => Math.round(n.getBoundingClientRect().top)));
    eq(tops.length, 2, 'buttons under the bar');
    eq(tops[0], tops[1], 'Surprise me and Help me choose on one line');
    await page.click('#choose');
    await page.waitForFunction(() => document.getElementById('sheet').open);
    eq(await text(page, '#sheet-title'), 'Help me choose', 'the card title');
    eq(await count(page, '#sheet .entry'), 0, 'drinks offered before both questions are answered');
    const pick = async (q, label) => page.locator('#sheet .pick-row').nth(q).locator('.pick', { hasText: label }).click();
    const offered = () => page.$$eval('#sheet .entry', (n) => n.map((e) => e.dataset.drink));
    await pick(0, 'Bitter');
    eq(await count(page, '#sheet .entry'), 0, 'drinks offered after one answer');
    await pick(1, 'Light');
    eq((await offered()).join(', '), 'suze-tonic, bitters-soda, campari-tonic', 'bitter and light');
    await pick(0, 'Sour and fresh');
    await pick(1, 'Strong');
    eq((await offered()).join(', '), 'margarita, gimlet, ponzu-gimlet', 'sour and strong');
    /* no alcohol offers only drinks with none at all */
    await pick(1, 'No alcohol');
    eq((await offered()).join(', '), 'honey-lemon-fizz', 'no alcohol');
    eq(await text(page, '#sheet .choose-results .caps'), 'Try this one', 'the label over a single drink');
    /* every answer offers something, and never the secret or a drink that's out */
    for (const taste of ['Bitter', 'Sweet', 'Sour and fresh']) {
      for (const level of ['Light', 'Medium', 'Strong']) {
        await pick(0, taste);
        await pick(1, level);
        const got = await offered();
        eq(got.length, 3, `drinks offered for ${taste}, ${level}`);
        ok(!got.some((id) => ['sidecar', 'corpse-reviver', 'pegu-club', 'honey-lemon-fizz'].includes(id)), `${taste}, ${level} offered ${got.join(', ')}`);
      }
    }
    /* a drink opens its card, ready to order */
    await page.click('#sheet .entry');
    ok(await page.$('#sheet .sheet-foot .btn'), 'the offered drink did not open its card');
    await closeCard(page);
    /* the answers are still there next time */
    await page.click('#choose');
    await page.waitForFunction(() => document.getElementById('sheet').open);
    eq(await count(page, '#sheet .entry'), 3, 'drinks offered when it opens again');
    ok(!(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'the page scrolls sideways');
  }],

  ['a drink says when it has egg white, honey or fish in it', {}, async (page) => {
    await enter(page);
    const contains = () => page.$eval('#sheet', (s) => { const f = s.querySelector('.contains-line'); return f && !f.closest('[hidden]') ? f.textContent.trim() : ''; });
    await openDrink(page, 'pandan-sour');
    eq(await contains(), 'Egg white, honey', 'the pandan sour');
    await page.click('#sheet .option.egg');
    eq(await contains(), 'Honey', 'the pandan sour without egg white');
    await closeCard(page);
    await openDrink(page, 'rye-manhattan');
    eq(await contains(), 'Fish, in the umami bitters', 'the Manhattan');
    await page.click('#sheet .option.umami');
    eq(await contains(), '', 'the classic Manhattan');
    await closeCard(page);
    await openDrink(page, 'monte-carlo');
    eq(await contains(), 'Honey', 'the Monte Carlo, made with Bénédictine');
    await closeCard(page);
    /* on the menu, honey has its own mark */
    const honey = await page.$$eval('.entry', (n) => n.filter((e) => e.querySelector('.note.honey')).map((e) => e.dataset.drink).sort().join(', '));
    eq(honey, 'bees-knees, bobby-burns, honey-collins, honey-lemon-fizz, margarita, monte-carlo, pandan-sour, penicillin', 'drinks marked honey');
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
