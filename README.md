# Paul's Bar

A cocktail menu your friends order from. Twenty cocktails and five mocktails,
in English or Thai.

- Every drink is drawn from its own data — real glass, real color, real garnish.
- Pick by flavor and how heavy you want it, not by spirit.
- Eight drinks take smoke, and you choose the wood.
- Numbered method for every drink, which changes with what you pick.
- Orders land on the **Orders** tab with the full build and a checkbox.

## Running it

`index.html` is completely self-contained — fonts, illustrations and all.
Open it in any browser, or serve it anywhere. No build step, no dependencies.

## Orders only reach the device they were placed on

Orders are stored in the browser that placed them, so this is a one-device bar:
leave a phone or tablet on the counter and check the Orders tab. Carrying an
order from a guest's phone to yours needs a backend, which this doesn't have.

## Editing

`index.html` is generated. Edit `src/bar.src.html` (and `src/th-data.js` for the
Thai copy), then rebuild:

```
cd src && python3 build.py && mv paulsbar.html ../index.html
```

The build inlines the two woff2 fonts as data URIs and the Thai strings, which
is what makes the single file self-contained.
