#!/usr/bin/env python3
"""Build the bar into one self-contained page.

    python3 src/build.py

Reads src/ and writes:
  index.html        the page GitHub Pages serves — fonts, styles, data and
                    script all inlined, so it needs nothing else to run
  build/test.html   the same page with the shared order book switched off,
                    which the tests run against so they never touch real orders

Styles are concatenated in file-name order, then data, then scripts, all
inside one function scope. The script is syntax-checked with node before
anything is written.
"""
import base64
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
BUILD = ROOT / "build"

LATIN = ("U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2010-2027, "
         "U+2030-203A, U+2116, U+2122, U+20AC, U+2190-2193, U+2212")
THAI = "U+0E01-0E5B, U+200B-200D, U+25CC"

# family, weight, style, file, unicode-range
FACES = [
    ("Cormorant Garamond", 500, "normal", "cormorant-500.woff2", LATIN),
    ("Cormorant Garamond", 600, "normal", "cormorant-600.woff2", LATIN),
    ("EB Garamond", 400, "normal", "garamond-400.woff2", LATIN),
    ("EB Garamond", 500, "normal", "garamond-500.woff2", LATIN),
    ("EB Garamond", 400, "italic", "garamond-400i.woff2", LATIN),
    ("Trirong", 400, "normal", "trirong-400.woff2", THAI),
    ("Trirong", 500, "normal", "trirong-500.woff2", THAI),
    ("Trirong", 600, "normal", "trirong-600.woff2", THAI),
    ("Jost", 400, "normal", "jost-400.woff2", LATIN),
    ("Jost", 500, "normal", "jost-500.woff2", LATIN),
    ("Anuphan", 400, "normal", "anuphan-400.woff2", THAI),
    ("Anuphan", 500, "normal", "anuphan-500.woff2", THAI),
]

# a vermilion seal with a coupe pressed into it, for the browser tab
FAVICON = (
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>"
    "<rect x='2' y='2' width='28' height='28' rx='3' fill='#B0392A'/>"
    "<path d='M8.5 10.5q0 7.5 7.5 7.8q7.5-.3 7.5-7.8z' fill='#F6F2EA'/>"
    "<path d='M16 18.3v5.2M11.6 24.6q4.4-1.6 8.8 0' fill='none' stroke='#F6F2EA' "
    "stroke-width='1.6' stroke-linecap='round'/></svg>"
)


def read(path):
    return path.read_text(encoding="utf-8")


def fonts_css():
    rules = []
    for family, weight, style, file, rng in FACES:
        data = base64.b64encode((SRC / "fonts" / file).read_bytes()).decode()
        rules.append(
            "@font-face { font-family: '%s'; font-weight: %d; font-style: %s; font-display: swap; "
            "src: url(data:font/woff2;base64,%s) format('woff2'); unicode-range: %s; }"
            % (family, weight, style, data, rng)
        )
    return "\n".join(rules)


def styles():
    css = "\n".join(read(p) for p in sorted((SRC / "styles").glob("*.css")))
    if css.count("{") != css.count("}"):
        sys.exit("styles: unbalanced braces — %d { against %d }" % (css.count("{"), css.count("}")))
    return css


def script():
    parts = []
    for p in sorted((SRC / "data").glob("*.js")) + sorted((SRC / "js").glob("*.js")):
        parts.append("/* ---------- %s/%s ---------- */\n%s" % (p.parent.name, p.name, read(p)))
    body = "\n".join(parts)
    js = "(() => {\n'use strict';\n\n" + body + "\n})();"
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as f:
        f.write(js)
    check = subprocess.run(["node", "--check", f.name], capture_output=True, text=True)
    pathlib.Path(f.name).unlink()
    if check.returncode != 0:
        sys.exit("script does not parse:\n" + check.stderr)
    return js


def main():
    page = read(SRC / "page.html")
    favicon = "data:image/svg+xml," + FAVICON.replace("#", "%23").replace("<", "%3C").replace(">", "%3E")
    out = (page
           .replace("{{FAVICON}}", favicon)
           .replace("{{FONTS}}", fonts_css())
           .replace("{{STYLES}}", styles())
           .replace("{{SCRIPT}}", script()))
    left = re.findall(r"\{\{[A-Z]+\}\}", out)
    if left:
        sys.exit("unfilled placeholders: %s" % left)

    (ROOT / "index.html").write_text(out, encoding="utf-8")

    test = re.sub(r"const BOOK = \{[^}]*\};", "const BOOK = {}; /* test build: shared book off */", out, count=1)
    if "AIza" in test or "firebaseapp.com" in test:
        sys.exit("the test build still points at the real order book")
    BUILD.mkdir(exist_ok=True)
    (BUILD / "test.html").write_text(test, encoding="utf-8")

    print("index.html  %d KB" % (len(out.encode("utf-8")) // 1024))


if __name__ == "__main__":
    main()
