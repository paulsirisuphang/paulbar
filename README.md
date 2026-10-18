# Paul's Bar

A cocktail menu that friends order from on their phones, in English or Thai.
It's set like a printed card on washi paper: 28 drinks in four sections, each
one drawn in ink and wash from its own recipe, plus one that isn't on the
list.

- The **menu** opens on the bar at rest: shelves of bottles, a paper
  lantern, and the tools left out on a hinoki counter. Every visit paints
  it onto the page, line by line and wash by wash, and presses the house
  seal on the front of the bar to finish; a tap finishes it at once. Tap
  a piece on the counter and it does a party piece for ten seconds. The
  four filters show one section at a time; with none chosen, the whole
  card shows.
- A **drink's card** has its story, what's in it, how it tastes, and the
  options it takes: smoke and a choice of wood on 10 drinks, egg white on 2,
  zero-sugar syrup on 6.
- **Orders** land on a rail as tickets, each with the full build behind it.
  Ticking a ticket stamps it poured.
- The golf tee in the name is the exclamation mark. It finds the eighteenth
  green at the foot of the menu, and the flag opens the drink that isn't on
  the list.

## Running it

`index.html` is the whole site: fonts, drawings and code are all inside it.
Open it in a browser or serve it anywhere. GitHub Pages serves it from `main`.

## Building it

`index.html` is generated. Edit the files in `src/`, then:

```
python3 src/build.py
```

That writes `index.html`, plus `build/test.html`, the same page with the
shared book switched off, which is what the checks and screenshots use. The
build stops if the script doesn't parse or the stylesheets don't balance.

| Where | What |
| --- | --- |
| `src/page.html` | The page's markup, with slots for fonts, styles and script |
| `src/styles/` | The stylesheets, joined in order: tokens, base, chrome, bar, menu, card, orders, scenes |
| `src/data/` | The drinks, the English and Thai copy, and the shared book's address |
| `src/js/` | The code, joined in order into one script |
| `src/fonts/` | The fonts, cut down to the letters the page uses (`tools/make_fonts.py`) |

The code, file by file:

| File | Job |
| --- | --- |
| `00-core.js` | DOM helpers, storage, and Thai text set word by word |
| `01-i18n.js` | The two languages, and switching between them |
| `02-book.js` | The order book: this browser first, then the shared book |
| `03-ink.js` | The brush: strokes, washes and paper grain |
| `04-glass.js` | Every drink, drawn from its recipe |
| `05-bar.js` | The bar: shelves, lantern, counter, the party pieces, and painting it in |
| `06-marks.js` | The seal, the tee, the green, the icons |
| `07-menu.js` | Filters, sections and the list |
| `08-sheet.js` | A drink's card and placing an order |
| `09-orders.js` | The tickets and their builds |
| `10-app.js` | Paper, tabs, the secret, and starting it all |

## Orders on every phone

Orders are saved in the browser that placed them, then sent to a Supabase
table so every phone sees the same rail. `src/data/00-config.js` holds the
project URL and its publishable key. The publishable key is meant to be in a
web page; the secret key never goes in this repo.

The table is `orders`, with columns `id` (text, primary key), `drink`,
`guest`, `smoke`, `wood`, `egg`, `note`, `at`, `done` and `done_at`. Without a
reachable book the bar still works on each phone by itself, and the Orders
page says it's offline.

## Thai

Drink names stay in Latin, the way Thai bar menus print them; everything else
is translated in `src/data/03-strings-th.js`. Thai is written without spaces,
so the browser finds line breaks with a dictionary that cuts loanwords in
half (ออร์เด|อร์). The page sets Thai one whole word at a time instead, and
`TH_KEEP` lists the words the dictionary gets wrong. After changing Thai copy,
`node tools/thai_check.mjs --short` shows the short pieces with their
neighbours, which is where a cut word shows up.

## Checks and tools

The checks and tools borrow a Playwright that's already installed;
`tools/browser.mjs` says where it is.

```
node tests/run.mjs                 every check, in Chromium and WebKit
node tools/look.mjs <name> 390 844 shot open:negroni shot
PAINT=1 node tools/look.mjs <name> 390 844 at:1500 shot   the painting, 1.5 s in
python3 tools/artlab.py            every drawing on one sheet, build/artlab.html
```

The checks cover the painting, the menu, the filters, the card, ordering,
the build panel, pouring, the tee and the green, the party pieces, Thai,
reduced motion, and phone and desktop layouts.

## Fonts

Cormorant Garamond for the display type, EB Garamond for the text, Trirong for
Thai, and Jost with Anuphan for small capitals. All are under the SIL Open
Font License; the licences are in `src/fonts/`.
