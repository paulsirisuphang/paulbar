#!/usr/bin/env python3
"""A proof sheet of every drawing in the bar, for working on the illustrations.

    python3 tools/artlab.py      ->  build/artlab.html

Every drink in every variant it can be ordered in, at menu size and at
ticket size, on the same paper the page uses.
"""
import pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "src"))
import build  # noqa: E402

ROOT = build.ROOT
SRC = build.SRC
files = [*sorted((SRC / "data").glob("*.js")),
         *(SRC / "js" / n for n in ("00-core.js", "01-i18n.js", "03-ink.js", "04-glass.js", "06-marks.js"))]
files = [f for f in files if f.exists()]
js = "(() => {\n'use strict';\n" + "\n".join(f.read_text() for f in files) + r"""
const sheet = document.getElementById('sheet');
const row = (title, items) => {
  const sec = el('section'); sec.appendChild(el('h2', null, title));
  const grid = el('div', 'grid'); items.forEach((n) => grid.appendChild(n)); sec.appendChild(grid); sheet.appendChild(sec);
};
const cell = (label, node, cls) => { const c = el('figure', cls || 'cell'); c.appendChild(node); c.appendChild(el('figcaption', null, label)); return c; };
row('Every drink, as the menu draws it', DRINKS.map((d) => cell(d.name, drawDrink(d, {}, 'static'))));
row('With the options', [
  ...DRINKS.filter((d) => d.egg).map((d) => cell(d.name + ' · egg', drawDrink(d, { egg: true }, 'static'))),
  ...DRINKS.filter((d) => d.smoke).slice(0, 6).map((d) => cell(d.name + ' · smoke', drawDrink(d, { smoke: true }, 'static')))
]);
row('Ticket size', DRINKS.slice(0, 12).map((d) => cell(d.id, drawDrink(d, {}, 'static'), 'cell small')));
if (typeof window.labMarks === 'function') window.labMarks(row, cell);
})();"""
css = "\n".join(p.read_text() for p in sorted((SRC / "styles").glob("*.css")))
html = """<!doctype html><meta charset="utf-8"><title>Art lab</title>
<style>%s
%s
body{padding:24px} h2{font:500 12px/1 var(--sans);letter-spacing:.2em;text-transform:uppercase;color:var(--ink-3);margin:28px 0 10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px 14px}
.cell{margin:0;text-align:center} .cell svg{width:120px;height:170px;overflow:visible}
.cell.small svg{width:52px;height:74px}
figcaption{font:400 12px/1.2 var(--sans);color:var(--ink-3);margin-top:2px}
</style><body><div id="sheet"></div><script>%s</script>""" % (build.fonts_css(), css, js)
(ROOT / "build").mkdir(exist_ok=True)
(ROOT / "build" / "artlab.html").write_text(html)
print("build/artlab.html")
