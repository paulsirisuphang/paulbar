import base64, pathlib, re

FONTS = pathlib.Path("/Users/Ekabutr.jc/Desktop/Claude Master Folder/design-prototypes/node_modules/@rentspree/ui/dist/css/fonts")

src = pathlib.Path("bar.src.html").read_text()
src = src.replace("__NEWSREADER__", base64.b64encode((FONTS / "Newsreader-latin.woff2").read_bytes()).decode())
src = src.replace("__JAKARTA__", base64.b64encode((FONTS / "PlusJakartaSans-latin.woff2").read_bytes()).decode())

thai = pathlib.Path("th-data.js").read_text()
thai = "\n".join(("  " + ln) if ln.strip() else ln for ln in thai.split("\n"))
src = src.replace("__THAI_DATA__", thai)

for token in ("__NEWSREADER__", "__JAKARTA__", "__THAI_DATA__"):
    assert token not in src, token

pathlib.Path("paulsbar.html").write_text(src)

# A local copy with the shared book switched off, so test runs never write
# into the real order list.
local = re.sub(
    r"var SUPABASE = \{[^}]*\};",
    "var SUPABASE = { url: '', key: '' }; /* local build: shared book off */",
    src, count=1,
)
assert "udyvhtrdrulpgxygznoc" not in local, "local build still points at the live project"
pathlib.Path("paulsbar-local.html").write_text(local)

print("built", len(src), "bytes (+ paulsbar-local.html for tests)")
