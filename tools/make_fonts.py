"""Cut the site's webfonts from the Google Fonts sources.

Latin faces keep Latin-1 plus typographic punctuation; Thai faces keep only
the Thai block, because the Latin face in front of them in every font stack
already covers digits and punctuation. Variable sources are pinned to the one
weight the site uses, which is most of the saving.
"""
import io, pathlib, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SRC = pathlib.Path("src")
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "out"); OUT.mkdir(parents=True, exist_ok=True)

LATIN = ("U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,"
         "U+2010-2027,U+2030-203A,U+2116,U+2122,U+20AC,U+2190-2193,U+2212")
THAI = "U+0E01-0E5B,U+200B-200D,U+25CC"

JOBS = [
    # out name,               source file,                                   wght,  ranges
    ("cormorant-500.woff2",   "cormorantgaramond--CormorantGaramond[wght].ttf", 500, LATIN),
    ("cormorant-600.woff2",   "cormorantgaramond--CormorantGaramond[wght].ttf", 600, LATIN),
    ("garamond-400.woff2",    "ebgaramond--EBGaramond[wght].ttf",              400, LATIN),
    ("garamond-500.woff2",    "ebgaramond--EBGaramond[wght].ttf",              500, LATIN),
    ("garamond-400i.woff2",   "ebgaramond--EBGaramond-Italic[wght].ttf",       400, LATIN),
    ("trirong-400.woff2",     "trirong--Trirong-Regular.ttf",                  None, THAI),
    ("trirong-400i.woff2",    "trirong--Trirong-Italic.ttf",                   None, THAI),
    ("trirong-500.woff2",     "trirong--Trirong-Medium.ttf",                   None, THAI),
    ("trirong-600.woff2",     "trirong--Trirong-SemiBold.ttf",                 None, THAI),
    ("jost-400.woff2",        "jost--Jost[wght].ttf",                          400, LATIN),
    ("jost-500.woff2",        "jost--Jost[wght].ttf",                          500, LATIN),
    ("anuphan-400.woff2",     "anuphan--Anuphan[wght].ttf",                    400, THAI),
    ("anuphan-500.woff2",     "anuphan--Anuphan[wght].ttf",                    500, THAI),
]

def unicodes(spec):
    out = []
    for part in spec.split(","):
        part = part.replace("U+", "")
        if "-" in part:
            a, b = part.split("-"); out += range(int(a, 16), int(b, 16) + 1)
        else:
            out.append(int(part, 16))
    return out

total = 0
for name, src, wght, ranges in JOBS:
    font = TTFont(SRC / src)
    if wght is not None and "fvar" in font:
        font = instancer.instantiateVariableFont(font, {"wght": wght}, updateFontNames=False)
    opts = subset.Options()
    opts.flavor = "woff2"
    # kerning, ligatures and Thai mark stacking stay; swashes, small caps and
    # alternates go, which is where most of the Garamond file size lives
    opts.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk",
                            "onum", "lnum", "tnum", "pnum", "case"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.hinting = False                 # screens this size don't need TrueType hinting
    opts.desubroutinize = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=unicodes(ranges))
    sub.subset(font)
    buf = io.BytesIO(); font.flavor = "woff2"; font.save(buf)
    (OUT / name).write_bytes(buf.getvalue())
    total += len(buf.getvalue())
    print(f"{name:24s} {len(buf.getvalue())/1024:6.1f} KB")
print(f"{'total':24s} {total/1024:6.1f} KB")
