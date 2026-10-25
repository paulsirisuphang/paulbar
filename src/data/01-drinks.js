/* ---------- woods ---------- */

const WOODS = {
  'Apple':   'The lightest smoke. You still taste everything else.',
  'Pear':    'Light, a little fuller than apple.',
  'Peach':   'Light and faintly sweet.',
  'Cherry':  'A little sweet and fruity. The best match for Campari.',
  'Oak':     'The classic smoke for whiskey.',
  'Pecan':   'Medium smoke, nutty.',
  'Oak + a pinch of cinnamon': 'Oak smoke with a little cinnamon. Only for this drink.',
  'Walnut':  'The strongest smoke, a little bitter. Only for bourbon drinks.'
};

/* ---------- the list ---------- */

const AXES = ['bitter', 'sweet', 'citrus', 'herbal', 'strength'];

const DRINKS = [
  {
    id: 'negroni', name: 'Negroni', method: 'Stirred', section: 'stirred',
    inside: "Gin, Campari, sweet vermouth",
    taste: "Bitter orange and herbs, for sipping slowly.",
    umami: { qty: '1 dash', step: 'Add 1 dash of umami bitters.', at: 2 },
    hook: "The count it was named after turned out to be a fencing teacher.",
    story: "The mustached portrait usually printed with his story shows a different man.",
    flavor: { bitter: 5, sweet: 2, citrus: 2, herbal: 4, strength: 4 },
    build: [['1 oz', 'gin'], ['1 oz', 'Campari'], ['1 oz', 'sweet vermouth']],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the gin, Campari and sweet vermouth.",
      "Stir 30 seconds, until the outside of the glass frosts.",
      "Strain over one large cube in a rocks glass, or straight up.",
      "Express an orange peel over the surface and drop it in."
    ],
    smoke: true, woods: ['Cherry', 'Apple', 'Pear', 'Peach'],
    smokeNote: "Cherry wood is the best match for Campari.",
    glass: 'rocks', color: '#A8321C', ice: 'cube', garnish: 'orange-twist'
  },
  {
    id: 'boulevardier', name: 'Boulevardier', method: 'Stirred', section: 'stirred',
    inside: "Bourbon, Campari, sweet vermouth",
    taste: "A bourbon Negroni: bitter orange, caramel and oak.",
    hook: "An American in Paris named it after the magazine he published.",
    story: "Then the drink disappeared for 80 years, until bartenders brought it back.",
    flavor: { bitter: 4, sweet: 3, citrus: 2, herbal: 3, strength: 4 },
    build: [['1.5 oz', 'bourbon'], ['1 oz', 'Campari'], ['1 oz', 'sweet vermouth']],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the bourbon, Campari and sweet vermouth.",
      "Stir 30 seconds.",
      "Strain over one large cube, or straight up.",
      "Express an orange peel over the surface and drop it in."
    ],
    smoke: true, woods: ['Cherry', 'Oak', 'Pecan', 'Walnut'], best: true,
    smokeNote: "The best drink here to smoke. Bourbon's caramel and oak go well with it.",
    glass: 'rocks', color: '#92321B', ice: 'cube', garnish: 'orange-twist'
  },
  {
    id: 'old-fashioned', name: 'Old Fashioned', method: 'Stirred', section: 'stirred',
    inside: "Bourbon or rye, sugar, Angostura",
    taste: "Mostly whiskey, a little sweet, a little spice.",
    umami: { qty: '2 dashes', step: 'Add 2 dashes of umami bitters.', at: 2 },
    hook: "People ordered it the old-fashioned way, and that became its name.",
    story: "By the 1880s bartenders added liqueurs to everything. The old way meant just spirit, sugar, water and bitters.",
    flavor: { bitter: 2, sweet: 3, citrus: 1, herbal: 1, strength: 5 },
    build: [['2 oz', 'bourbon or rye'], ['1', 'sugar cube (or 0.25 oz simple syrup)'], ['2 dashes', 'Angostura']],
    steps: [
      "Put the sugar cube in the glass with the bitters and a bar spoon of water.",
      "Muddle until the sugar is mostly dissolved.",
      "Add the whiskey and one large cube.",
      "Stir 30 seconds, adding a second cube partway through.",
      "Express an orange peel and drop it in."
    ],
    tip: "Try it both ways. Rittenhouse rye at 100 proof makes a very different drink from bourbon.",
    smoke: true, woods: ['Oak', 'Oak + a pinch of cinnamon', 'Pecan', 'Walnut'],
    smokeNote: "The classic drink to smoke. Oak suits the whiskey.",
    glass: 'rocks', color: '#A55E22', ice: 'cube', garnish: 'orange-twist'
  },
  {
    id: 'monte-carlo', name: 'Monte Carlo', method: 'Stirred', section: 'stirred',
    inside: "Rye, Bénédictine (honey-herb liqueur), Angostura",
    taste: "Honey and herbs, less sweet than a Manhattan.",
    hook: "The Bénédictine in it was sold with the story of a monk who never existed.",
    story: "A 19th-century wine merchant seems to have invented him, then built a Gothic palace for the brand.",
    flavor: { bitter: 2, sweet: 3, citrus: 1, herbal: 5, strength: 5 },
    build: [['2 oz', 'rye'], ['0.5 oz', 'Bénédictine'], ['2 dashes', 'Angostura']],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the rye, Bénédictine and Angostura.",
      "Stir 30 seconds.",
      "Strain up into a chilled coupe, or over one large cube.",
      "Express a lemon peel and drop it in."
    ],
    tip: "A Manhattan with Bénédictine instead of vermouth. It's the easiest way to learn what Bénédictine tastes like.",
    smoke: true, woods: ['Apple', 'Pear', 'Peach', 'Oak'],
    smokeNote: "Light smoke goes well with the honey in the Bénédictine.",
    glass: 'coupe', color: '#A9722A', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'rye-manhattan', name: 'Rye Manhattan', method: 'Stirred', section: 'stirred',
    inside: "Rye, sweet vermouth, Angostura",
    taste: "Spicy rye whiskey, rich and a little sweet.",
    umami: { qty: '2 dashes', step: 'Add 2 dashes of umami bitters.', at: 3 },
    hook: "It wasn't invented for Winston Churchill's mother, whatever other bars tell you.",
    story: "She was in England at the time, about to give birth to Winston.",
    flavor: { bitter: 2, sweet: 3, citrus: 1, herbal: 3, strength: 5 },
    build: [['2 oz', 'rye'], ['1 oz', 'sweet vermouth'], ['2 dashes', 'Angostura']],
    steps: [
      "Taste the vermouth before you start. Flat vermouth is what ruins this drink.",
      "Fill a mixing glass with good ice.",
      "Add the rye, sweet vermouth and Angostura.",
      "Stir 30 seconds.",
      "Strain up into a chilled coupe.",
      "Garnish with a cherry, or express an orange peel."
    ],
    tip: "Taste the vermouth first. After a month or two open on the shelf it goes flat, and that's the most common reason a home Manhattan tastes wrong.",
    smoke: true, woods: ['Oak', 'Pecan'],
    smokeNote: "Oak smoke goes well with rye's spice.",
    glass: 'coupe', color: '#8A3B21', ice: 'none', garnish: 'cherry'
  },
  {
    id: 'sazerac', name: 'Sazerac', method: 'Stirred', section: 'stirred',
    inside: "Rye, sugar, Peychaud's bitters",
    taste: "Spice and anise, a little sweet, no ice.",
    hook: "Louisiana's lawmakers refused to make it the state cocktail.",
    story: "In 2008 they worried it would encourage drinking, so it became the official cocktail of New Orleans instead.",
    flavor: { bitter: 3, sweet: 2, citrus: 2, herbal: 2, strength: 5 },
    build: [['2 oz', 'rye'], ['1', 'sugar cube'], ['4 dashes', "Peychaud's"]],
    steps: [
      "Put the sugar cube in a mixing glass with the Peychaud's and a splash of water.",
      "Muddle until the sugar is mostly dissolved.",
      "Add the rye and ice, and stir 30 seconds.",
      "Strain into a chilled rocks glass, with no ice.",
      "Express a lemon peel over the top, then throw the peel away. It does not go in."
    ],
    smoke: true, woods: ['Oak', 'Pecan'],
    smokeNote: "The classic recipe coats the glass with absinthe, which we don't have. Smoke scents the glass instead.",
    glass: 'rocks', color: '#9E5324', ice: 'none', garnish: 'none'
  },
  {
    id: 'vieux-carre', name: 'Smoke Vieux Carré', method: 'Stirred',
    inside: "Rye, cognac, sweet vermouth, Bénédictine, bitters",
    taste: "Rich and spiced, with smoke.",
    section: 'stirred', hidden: true,
    hook: "It was created at a New Orleans hotel whose bar now turns like a carousel.",
    story: "Vieux Carré means old square, the old name for the French Quarter.",
    flavor: { bitter: 3, sweet: 3, citrus: 1, herbal: 5, strength: 5 },
    build: [['1 oz', 'rye'], ['1 oz', 'cognac'], ['1 oz', 'sweet vermouth'],
            ['0.25 oz', 'Bénédictine'], ['1 dash', "Peychaud's"], ['1 dash', 'Angostura']],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the rye, cognac, sweet vermouth and Bénédictine.",
      "Add one dash each of Peychaud's and Angostura.",
      "Stir 30 seconds.",
      "Strain over one large cube.",
      "Express a lemon peel and drop it in."
    ],
    tip: 'If you can make this, you can make almost anything else on the list.',
    smoke: true, woods: ['Oak', 'Pecan', 'Cherry'],
    smokeNote: "This one is rich enough for a strong smoke.",
    glass: 'rocks', color: '#8E4A24', ice: 'cube', garnish: 'lemon-twist'
  },
  {
    id: 'de-la-louisiane', name: 'De La Louisiane', method: 'Stirred', section: 'stirred',
    inside: "Rye, sweet vermouth, Bénédictine, Peychaud's bitters",
    taste: "A sweeter Sazerac, with honey and spice.",
    hook: "It's the house drink of a New Orleans restaurant that opened in 1881.",
    story: "It starts with a Sazerac's rye and Peychaud's bitters, then adds Bénédictine and sweet vermouth.",
    flavor: { bitter: 3, sweet: 4, citrus: 1, herbal: 5, strength: 5 },
    build: [['2 oz', 'rye'], ['0.75 oz', 'sweet vermouth'], ['0.75 oz', 'Bénédictine'], ['3 dashes', "Peychaud's"]],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the rye, sweet vermouth and Bénédictine.",
      "Add three dashes of Peychaud's.",
      "Stir 30 seconds.",
      "Strain up into a chilled coupe.",
      "Garnish with a cherry."
    ],
    smoke: true, woods: ['Oak', 'Pecan'],
    smokeNote: "As in the Sazerac, smoke scents the glass in place of absinthe.",
    glass: 'coupe', color: '#93502A', ice: 'none', garnish: 'cherry'
  },
  {
    id: 'umami-martini', name: 'Umami Martini', method: 'Stirred', section: 'stirred',
    inside: "Gin, junmai sake, umami bitters",
    taste: "Gin and sake, savory and not sweet.",
    hook: "A few dashes of umami bitters turn a gin martini savory.",
    story: "The bitters are made from kelp, shiitake and bonito, the base of Japanese dashi broth. Sake takes the place of vermouth.",
    flavor: { bitter: 1, sweet: 1, citrus: 1, herbal: 3, strength: 5 },
    build: [['2 oz', 'gin'], ['0.5 oz', 'junmai sake'], ['3 dashes', 'umami bitters']],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the gin, sake and umami bitters.",
      "Stir 30 seconds.",
      "Strain up into a chilled coupe."
    ],
    tip: "Start at 3 dashes. The bitters are strong, and a fourth makes it taste like soup.",
    smoke: false,
    noSmoke: "Smoke would cover the sake, and the bitters are already smoky.",
    glass: 'coupe', color: '#ECE6CC', ice: 'none', garnish: 'none'
  },
  {
    id: 'white-negroni', name: 'White Negroni', method: 'Stirred', section: 'stirred',
    inside: "Gin, Suze (bitter root liqueur), Lillet Blanc (orange-scented French wine)",
    taste: "Bitter and floral, softer than a Negroni.",
    yuzu: { qty: '3 dashes', step: 'Add 3 dashes of yuzu bitters.', at: 2 },
    hook: "Wayne Collins and Nick Blacknell invented it because they didn't want to go out.",
    story: "At a 2001 wine fair in Bordeaux, they stayed in and mixed the French bottles they had: Suze for Campari, Lillet for vermouth.",
    flavor: { bitter: 4, sweet: 2, citrus: 2, herbal: 4, strength: 4 },
    build: [['1.5 oz', 'gin'], ['0.75 oz', 'Suze'], ['0.75 oz', 'Lillet Blanc']],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the gin, Suze and Lillet Blanc.",
      "Stir 30 seconds.",
      "Strain over one large cube.",
      "Express a lemon peel and drop it in."
    ],
    smoke: false,
    noSmoke: "Smoke would cover the Suze and Lillet, which give this drink its taste.",
    glass: 'rocks', color: '#BCAE6B', ice: 'cube', garnish: 'lemon-twist'
  },

  {
    id: 'whiskey-sour', name: 'Whiskey Sour', method: 'Shaken', section: 'shaken',
    inside: "Bourbon, lemon, sugar, egg white",
    taste: "Sweet and sour bourbon under a soft foam.",
    eggDefault: true,
    hook: "The egg white adds no flavor, only the foam on top.",
    story: "It's shaken twice: first without ice to whip the egg into foam, then with ice to chill it.",
    flavor: { bitter: 1, sweet: 3, citrus: 4, herbal: 0, strength: 3 },
    build: [['2 oz', 'bourbon'], ['0.75 oz', 'lemon'], ['0.75 oz', 'simple syrup']],
    steps: [
      "Add the bourbon, lemon and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds, until the tin hurts to hold.",
      "Strain over fresh ice."
    ],
    eggSteps: [
      "Add the bourbon, lemon, simple syrup and egg white to a shaker, with no ice yet.",
      "Dry-shake 10 seconds to build the foam.",
      "Add ice and shake hard 12 seconds more.",
      "Double-strain into a chilled glass, no ice.",
      "Three drops of Angostura on the foam."
    ],
    egg: true, smoke: false,
    noSmoke: "Smoke and fresh lemon clash, and the foam would hide the smoke anyway.",
    glass: 'rocks', color: '#BE8330', ice: 'cubes', garnish: 'none'
  },
  {
    id: 'gin-sour', name: 'Gin Sour', method: 'Shaken', section: 'shaken',
    inside: "Gin, lemon, sugar, optional egg white",
    taste: "Tart lemon and gin, lighter than the Whiskey Sour.",
    hook: "A richer version of this drink, the Ramos Gin Fizz, once took 30 people to shake.",
    story: "At the 1915 Carnival, its inventor had a line of shaker boys pass each drink down the bar. This one takes one bartender.",
    flavor: { bitter: 1, sweet: 3, citrus: 4, herbal: 2, strength: 3 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'lemon'], ['0.75 oz', 'simple syrup']],
    steps: [
      "Add the gin, lemon and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds, until the tin hurts to hold.",
      "Strain over fresh ice."
    ],
    eggSteps: [
      "Add the gin, lemon, simple syrup and egg white to a shaker, with no ice yet.",
      "Dry-shake 10 seconds to build the foam.",
      "Add ice and shake hard 12 seconds more.",
      "Double-strain into a chilled glass, no ice."
    ],
    egg: true, smoke: false,
    tip: "Try it once next to the Whiskey Sour.",
    noSmoke: "Smoke and fresh lemon clash.",
    glass: 'rocks', color: '#CBBD75', ice: 'cubes', garnish: 'none'
  },
  {
    id: 'bees-knees', name: "Bee's Knees", method: 'Shaken', section: 'shaken',
    inside: "Gin, honey, lemon",
    taste: "Honey and lemon, soft and floral.",
    yuzu: { qty: '3 dashes', step: 'Add 3 dashes of yuzu bitters to the shaker.', at: 2 },
    hook: "The bartender who first wrote it down was watched by the Gestapo.",
    story: "Frank Meier ran the bar at the Paris Ritz during the German occupation, and supplied forged papers to guests hiding from arrest.",
    flavor: { bitter: 0, sweet: 4, citrus: 4, herbal: 2, strength: 3 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'honey syrup'], ['0.75 oz', 'lemon']],
    steps: [
      "Check you're using honey syrup, not straight honey. Cold honey goes hard.",
      "Add the gin, honey syrup and lemon to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Garnish with a lemon peel."
    ],
    tip: "Use honey syrup, not straight honey. Cold honey goes hard and leaves sweet lumps.",
    smoke: false,
    noSmoke: "Smoke and fresh lemon clash, and the smoke would hide the honey.",
    glass: 'coupe', color: '#CD9C35', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'sidecar', name: 'Sidecar', method: 'Shaken', section: 'shaken',
    inside: "Cognac, Cointreau, lemon",
    taste: "Orange and brandy, tart and not too sweet.",
    hook: "An army captain kept arriving at the bar in a motorcycle sidecar.",
    story: "The Ritz in Paris and Harry's New York Bar both say they made it first, and both stories have the same captain.",
    flavor: { bitter: 1, sweet: 3, citrus: 4, herbal: 1, strength: 4 },
    build: [['1.5 oz', 'cognac'], ['0.75 oz', 'Cointreau'], ['0.75 oz', 'lemon']],
    steps: [
      "Sugar the rim of a chilled coupe first, if you want one.",
      "Add the cognac, Cointreau and lemon to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Double-strain up into the coupe.",
      "Garnish with a lemon peel."
    ],
    smoke: false,
    noSmoke: "Smoke and fresh lemon clash.",
    glass: 'coupe', color: '#C98B3A', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'margarita', name: 'Margarita', method: 'Shaken', section: 'shaken',
    inside: "Tequila, Cointreau, lime, salt on half the rim",
    taste: "Tart lime and tequila, with a salty rim.",
    yuzu: { qty: '3 dashes', step: 'Add 3 dashes of yuzu bitters to the shaker.', at: 2 },
    hook: "Margarita is Spanish for daisy, and the Daisy is an old family of sour drinks.",
    story: "This is simply the tequila version, so at least 8 people have claimed they invented it, and none can prove it.",
    flavor: { bitter: 1, sweet: 3, citrus: 5, herbal: 2, strength: 4 },
    build: [['2 oz', 'tequila'], ['0.75 oz', 'Cointreau'], ['0.75 oz', 'lime']],
    steps: [
      "Salt half the rim of a rocks glass, leaving half bare so there is a choice.",
      "Add the tequila, Cointreau and lime to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Strain over fresh ice."
    ],
    smoke: false,
    noSmoke: "Smoke and fresh lime clash.",
    glass: 'rocks', color: '#CBD489', ice: 'cubes', garnish: 'lime-wedge'
  },


  {
    id: 'corpse-reviver', name: 'Corpse Reviver №2', method: 'Shaken', section: 'shaken',
    inside: "Gin, Cointreau, Lillet Blanc, lemon",
    taste: "Lemon and orange, very easy to drink.",
    hook: "It was published as a hangover cure, with a warning printed underneath.",
    story: "The Savoy Cocktail Book of 1930 warned that drinking 4 in a row would undo the cure.",
    flavor: { bitter: 2, sweet: 3, citrus: 4, herbal: 3, strength: 4 },
    build: [['0.75 oz', 'gin'], ['0.75 oz', 'Cointreau'], ['0.75 oz', 'Lillet Blanc'], ['0.75 oz', 'lemon']],
    steps: [
      "Add everything to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Express a lemon peel over the top."
    ],
    tip: "Equal parts, so any mistake shows. Measure carefully.",
    smoke: true, woods: ['Apple', 'Pear', 'Peach'],
    smokeNote: "The classic recipe coats the glass with absinthe, which we don't have, so light smoke does it instead.",
    glass: 'coupe', color: '#D9CE8E', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'pegu-club', name: 'Pegu Club', method: 'Shaken', section: 'shaken',
    inside: "Gin, Cointreau, lime, Angostura and orange bitters",
    taste: "Lime and orange, with spice at the end.",
    hook: "It's named after a British officers' club in Rangoon.",
    story: "It was the club's house drink, and members who missed it took the recipe to London and New York.",
    flavor: { bitter: 2, sweet: 3, citrus: 5, herbal: 3, strength: 4 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'Cointreau'], ['0.75 oz', 'lime'],
            ['1 dash', 'Angostura'], ['1 dash', 'orange bitters']],
    steps: [
      "Add the gin, Cointreau and lime to a shaker with ice.",
      "Add a dash each of Angostura and orange bitters.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Express a lime peel over the top."
    ],
    smoke: false,
    noSmoke: "Smoke and fresh lime clash.",
    glass: 'coupe', color: '#CFC98A', ice: 'none', garnish: 'lime-twist'
  },
  {
    id: 'gimlet', name: 'Gimlet', method: 'Shaken', section: 'shaken',
    inside: "Gin, lime, sugar",
    taste: "Gin and fresh lime, sharp and simple.",
    hook: "British ships carried lime because it stopped sailors dying of scurvy.",
    story: "Gin was already on board, so the two ended up in the same glass.",
    flavor: { bitter: 1, sweet: 3, citrus: 5, herbal: 3, strength: 4 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'lime'], ['0.75 oz', 'simple syrup']],
    steps: [
      "Add the gin, lime and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Garnish with a lime peel."
    ],
    smoke: false,
    noSmoke: "Smoke and fresh lime clash.",
    glass: 'coupe', color: '#D2DCA0', ice: 'none', garnish: 'lime-twist'
  },
  {
    id: 'ponzu-gimlet', name: 'Ponzu Gimlet', method: 'Shaken', section: 'shaken',
    inside: "Gin, lime, sugar, yuzu and umami bitters",
    taste: "A Gimlet that tastes of ponzu: tart citrus, then savory.",
    hook: "Ponzu comes from pons, the Dutch word for punch.",
    story: "Dutch traders brought the word to Japan, where ponzu became a citrus sauce made with kelp and bonito. The yuzu and umami bitters bring both flavors.",
    flavor: { bitter: 1, sweet: 2, citrus: 5, herbal: 2, strength: 4 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'lime'], ['0.75 oz', 'simple syrup'], ['3 dashes', 'yuzu bitters'], ['1 dash', 'umami bitters']],
    steps: [
      "Add the gin, lime, simple syrup, both bitters and ice to a shaker.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Garnish with a lime peel."
    ],
    tip: 'Taste it next to a plain Gimlet once. The bitters are the only difference.',
    smoke: false,
    noSmoke: "Smoke and fresh lime clash.",
    glass: 'coupe', color: '#D6D79C', ice: 'none', garnish: 'lime-twist'
  },
  {
    id: 'gin-tonic', name: 'Gin & Tonic', method: 'Built', section: 'long', low: true,
    inside: "Gin, tonic, lemon",
    taste: "Crisp and a little bitter, not sweet.",
    yuzu: { qty: '3 dashes', step: 'Finish with 3 dashes of yuzu bitters on top.' },
    hook: "Cheap gin once caused so much trouble in London that Hogarth painted it.",
    story: "The government had backed cheap gin to hurt French brandy, and gin shops filled the city.",
    flavor: { bitter: 2, sweet: 2, citrus: 3, herbal: 3, strength: 2 },
    build: [['2 oz', 'gin'], ['4–5 oz', 'tonic'], ['', 'lemon wedge']],
    steps: [
      "Fill a balloon glass with ice.",
      "Pour in the gin.",
      "Top with tonic.",
      "Stir once, no more. More stirring knocks the bubbles out.",
      "Squeeze a lemon wedge over the top and drop it in."
    ],
    smoke: false, noSmoke: "The bubbles carry the smoke away before you can taste it.",
    glass: 'copa', color: '#B9CBD0', ice: 'bowl', garnish: 'lemon-wedge', bubbles: true
  },
  {
    id: 'lillet-tonic', name: 'Lillet Tonic', method: 'Built', section: 'long', low: true,
    inside: "Lillet Blanc (orange-scented French wine), tonic, orange",
    taste: "Fruity and a little bitter.",
    hook: "Lillet changed its recipe in 1986, so the Vesper martini James Bond ordered can't be made as written.",
    story: "It started in 1887 as Kina Lillet, a bitter tonic wine. Today's Lillet is lighter, fruitier and much less bitter.",
    flavor: { bitter: 1, sweet: 3, citrus: 2, herbal: 2, strength: 1 },
    build: [['2 oz', 'Lillet Blanc'], ['3 oz', 'tonic'], ['', 'orange slice']],
    steps: [
      "Fill a large wine glass with ice.",
      "Pour in the Lillet Blanc.",
      "Top with tonic.",
      "Stir once and garnish with an orange slice."
    ],
    tip: "About 6% alcohol, one of the lightest drinks on the list.",
    smoke: false, noSmoke: "Smoke would cover the light fruit, and the bubbles would carry it away anyway.",
    glass: 'wine', color: '#CDB77C', ice: 'bowl', garnish: 'orange-slice', bubbles: true
  },
  {
    id: 'campari-tonic', name: 'Campari & Tonic', method: 'Built', section: 'long', low: true,
    inside: "Campari, tonic, orange",
    taste: "Bitter orange and fizzy tonic.",
    hook: "Campari's red came from crushed insects until about 2006.",
    story: "The dye, carmine, is made from cochineal beetles, and bottles made for some countries reportedly still use it.",
    flavor: { bitter: 4, sweet: 2, citrus: 2, herbal: 3, strength: 2 },
    build: [['1.5 oz', 'Campari'], ['4 oz', 'tonic'], ['', 'orange wedge']],
    steps: [
      "Fill a tall glass completely with ice.",
      "Pour in the Campari.",
      "Top with tonic.",
      "Stir once and garnish with an orange wedge."
    ],
    smoke: false, noSmoke: "The bubbles carry the smoke away. For smoke, try the Negroni.",
    glass: 'tall', color: '#BB3627', ice: 'tall', garnish: 'orange-wedge', bubbles: true
  },
  {
    id: 'suze-tonic', name: 'Suze & Tonic', method: 'Built', section: 'long', low: true,
    inside: "Suze (bitter root liqueur), tonic, lemon",
    taste: "Earthy, bitter and refreshing.",
    hook: "Picasso pasted a Suze label into a collage that now hangs in a museum.",
    story: "The bitter taste comes from gentian root, dug up in the Alps from plants that are decades old.",
    flavor: { bitter: 5, sweet: 1, citrus: 2, herbal: 4, strength: 2 },
    build: [['1.5 oz', 'Suze'], ['4 oz', 'tonic'], ['', 'lemon wedge']],
    steps: [
      "Fill a large wine glass with ice.",
      "Pour in the Suze.",
      "Top with tonic, low-sugar if you have it.",
      "Squeeze a lemon wedge over the top and drop it in."
    ],
    smoke: false, noSmoke: "Smoke would cover the gentian, the bitter root that gives this drink its taste.",
    glass: 'wine', color: '#C4C075', ice: 'bowl', garnish: 'lemon-wedge', bubbles: true
  },
  {
    id: 'americano', name: 'Americano', method: 'Built', section: 'long', low: true,
    inside: "Campari, sweet vermouth, soda, orange",
    taste: "Bittersweet and fizzy, a Negroni with soda instead of gin.",
    hook: "It's the first drink James Bond orders in the books, before any martini.",
    story: "That was in Casino Royale, 1953, years before the films made him a vodka martini drinker.",
    flavor: { bitter: 4, sweet: 3, citrus: 2, herbal: 4, strength: 2 },
    build: [['1.5 oz', 'Campari'], ['1.5 oz', 'sweet vermouth'], ['', 'top with soda'], ['', 'orange slice']],
    steps: [
      "Fill a tall glass completely with ice.",
      "Add the Campari and sweet vermouth.",
      "Top with soda.",
      "Stir once and garnish with an orange slice."
    ],
    tip: 'Someone asked for this with gin instead of soda, and that was the Negroni.',
    smoke: false, noSmoke: "The bubbles carry the smoke away. For smoke, try the Negroni.",
    glass: 'tall', color: '#AE3527', ice: 'tall', garnish: 'orange-slice', bubbles: true
  },
  {
    id: 'tom-collins', name: 'Tom Collins', method: 'Shaken + soda', section: 'long', low: true,
    inside: "Gin, lemon, sugar, soda",
    taste: "Lemonade with gin in it.",
    hook: "It's named after a man who never existed, and a prank that did.",
    story: "In 1874 New Yorkers told friends that a Tom Collins was insulting them at a bar nearby. When the friends stormed in asking for him, bartenders handed them this.",
    flavor: { bitter: 0, sweet: 3, citrus: 4, herbal: 2, strength: 2 },
    build: [['2 oz', 'gin'], ['1 oz', 'lemon'], ['0.75 oz', 'simple syrup'], ['', 'top with soda']],
    steps: [
      "Add the gin, lemon and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Strain into a tall glass filled with fresh ice.",
      "Top with soda."
    ],
    tip: "Use bourbon instead of gin for a John Collins, or rye for more spice.",
    smoke: false, noSmoke: "Smoke and fresh lemon clash.",
    glass: 'tall', color: '#D0C384', ice: 'tall', garnish: 'none', bubbles: true
  },
  {
    id: 'whiskey-highball', name: 'Whiskey Highball', method: 'Built', section: 'long', low: true,
    inside: "Rittenhouse rye, soda, lemon peel",
    taste: "Whiskey and soda, cold and fizzy.",
    yuzu: { qty: '3 dashes', step: 'Finish with 3 dashes of yuzu bitters on top.' },
    hook: "Suntory used this drink to get Japan drinking whisky again.",
    story: "Sales had fallen for 26 years when Suntory started promoting highballs in 2008. Within a year, bars serving them went from about 5,000 to over 40,000.",
    flavor: { bitter: 1, sweet: 1, citrus: 2, herbal: 1, strength: 2 },
    build: [['2 oz', 'Rittenhouse'], ['4 oz', 'soda'], ['1', 'long lemon peel']],
    steps: [
      "Fill a tall glass completely with ice.",
      "Pour in the Rittenhouse.",
      "Top with soda.",
      "Stir once.",
      "Drop in one long lemon peel."
    ],
    tip: "At 100 proof, the rye still comes through the soda, where a softer bourbon would fade.",
    smoke: false, noSmoke: "The bubbles carry the smoke away. For smoke, try the Old Fashioned.",
    glass: 'tall', color: '#B4823F', ice: 'tall', garnish: 'lemon-twist', bubbles: true
  },
  {
    id: 'honey-collins', name: 'Honey Collins', method: 'Shaken + soda', section: 'long', low: true,
    inside: "Gin, honey, lemon, soda",
    taste: "Honey lemonade with gin, soft and fizzy.",
    hook: "It's a Tom Collins made with honey instead of sugar.",
    story: "Honey gives it more body and a floral smell that sugar doesn't have.",
    flavor: { bitter: 0, sweet: 4, citrus: 4, herbal: 2, strength: 2 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'honey syrup'], ['0.75 oz', 'lemon'], ['', 'top with soda']],
    steps: [
      "Add the gin, honey syrup and lemon to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Strain into a tall glass filled with fresh ice.",
      "Top with soda."
    ],
    smoke: false, noSmoke: "Smoke and fresh lemon clash.",
    glass: 'tall', color: '#C79C4C', ice: 'tall', garnish: 'none', bubbles: true
  },
  {
    id: 'lillet-spritz', name: 'Lillet Spritz', method: 'Built', section: 'long', low: true,
    inside: "Lillet Blanc (orange-scented French wine), soda, lemon",
    taste: "Orange and honey, softer than the Lillet Tonic.",
    hook: "It's a Lillet Tonic made with soda instead of tonic.",
    story: "Without the tonic's bitterness, you taste more of Lillet's orange and honey.",
    flavor: { bitter: 1, sweet: 3, citrus: 2, herbal: 2, strength: 1 },
    build: [['3 oz', 'Lillet'], ['2 oz', 'soda'], ['', 'lemon wheel']],
    steps: [
      "Fill a large wine glass with ice.",
      "Pour in the Lillet.",
      "Top with soda.",
      "Garnish with a lemon wheel."
    ],
    smoke: false, noSmoke: "Smoke would cover the delicate orange and honey.",
    glass: 'wine', color: '#D2BE85', ice: 'bowl', garnish: 'lemon-wheel', bubbles: true
  },

  {
    id: 'honey-lemon-fizz', name: 'Honey Lemon Fizz', method: 'Shaken + soda', section: 'mocktail', na: true,
    inside: "Honey, lemon, a pinch of salt, soda",
    taste: "Honey lemonade with a pinch of salt.",
    hook: "A pinch of salt does more for this drink than an expensive alcohol-free spirit.",
    story: "Salt cuts bitterness and brings out the other flavors, so it doesn't taste like plain juice.",
    flavor: { bitter: 0, sweet: 4, citrus: 4, herbal: 1, strength: 0 },
    build: [['1 oz', 'honey syrup'], ['0.75 oz', 'lemon'], ['pinch', 'salt'], ['3 oz', 'club soda']],
    steps: [
      "Shake the honey syrup, lemon and salt with ice.",
      "Strain into a tall glass over fresh ice.",
      "Top with soda.",
      "Garnish with a lemon wheel."
    ],
    smoke: true, woods: ['Apple', 'Pear', 'Peach'],
    smokeNote: "Light smoke only. Without alcohol, a stronger wood would cover everything.",
    glass: 'tall', color: '#D9C07E', ice: 'tall', garnish: 'lemon-wheel', bubbles: true
  },
  {
    id: 'bitters-soda', name: 'Bitters & Soda', method: 'Built', section: 'mocktail', na: true,
    inside: "Angostura bitters, soda, lemon",
    taste: "Spiced and fizzy, not sweet, with a little alcohol.",
    hook: "Angostura bitters contains no angostura bark at all.",
    story: "The name comes from a town in Venezuela, where a Prussian army surgeon made it in 1824 to settle the stomachs of Simón Bolívar's soldiers.",
    flavor: { bitter: 4, sweet: 1, citrus: 2, herbal: 4, strength: 1 },
    build: [['8 dashes', 'Angostura'], ['5 oz', 'club soda'], ['', 'lemon wedge']],
    steps: [
      "Fill a tall glass with ice.",
      "Add 8 dashes of Angostura.",
      "Top with soda and stir gently.",
      "Squeeze a lemon wedge over the top and drop it in."
    ],
    warning: "Angostura is 44.7% alcohol, so this drink is about 1 to 2%. That's more than a non-alcoholic beer, so skip it if you avoid alcohol completely.",
    smoke: false,
    noSmoke: "The bitters already smell strongly of spice.",
    glass: 'tall', color: '#C3937B', ice: 'tall', garnish: 'lemon-wedge', bubbles: true
  }
];

/* the order they print in at the default hour — the evening reshuffles it */
const SECTIONS = ['stirred', 'shaken', 'long', 'mocktail'];
