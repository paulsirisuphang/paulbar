/* The browsers the tools and tests drive, in one place.

   There is no package.json here on purpose: the site is one HTML file
   and needs nothing installed. The checks borrow a Playwright that is
   already on the machine. Point PLAYWRIGHT at its package folder, and
   CHROMIUM at a Chrome build if the one Playwright expects isn't there. */

const PLAYWRIGHT = process.env.PLAYWRIGHT ||
  '/Users/Ekabutr.jc/.npm/_npx/705bc6b22212b352/node_modules/playwright';
const CHROMIUM = process.env.CHROMIUM ||
  '/Users/Ekabutr.jc/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const pw = await import(PLAYWRIGHT + '/index.mjs');

/* engine: 'chromium' or 'webkit' (Safari's engine, which every iPhone browser uses) */
export async function launch(engine = 'chromium') {
  if (engine === 'webkit') return pw.webkit.launch();
  return pw.chromium.launch({ executablePath: CHROMIUM });
}

/* a page the size of a phone or a desktop, collecting anything the page logs as an error */
export async function openPage(browser, { width = 390, height = 844, scale = 2, reducedMotion, clock } = {}) {
  const mobile = width < 700;
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
    isMobile: mobile,
    hasTouch: mobile,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference'
  });
  const page = await ctx.newPage();
  if (clock) await page.clock.install();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  return page;
}

/* the test build: the real page with the shared book switched off, so
   nothing a check does reaches the bar's real orders */
export const TEST_PAGE = 'file://' + new URL('../build/test.html', import.meta.url).pathname;
