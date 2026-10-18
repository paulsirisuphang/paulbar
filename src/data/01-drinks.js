/* ---------- woods ---------- */

const WOODS = {
  'Apple':   'The gentlest of the set. Will not bury anything.',
  'Pear':    'As gentle as apple, a little rounder.',
  'Peach':   'The gentlest of the set, faintly sweet.',
  'Cherry':  'The best match for Campari.',
  'Oak':     'The neutral whiskey wood.',
  'Pecan':   'Middle gear, nutty.',
  'Oak + a pinch of cinnamon': 'Cinnamon blended into oak, never on its own. This drink only.',
  'Walnut':  'Tannic and assertive — go light. Bourbon drinks only.'
};

/* ---------- the list ---------- */

const AXES = ['bitter', 'sweet', 'citrus', 'herbal', 'strength'];

const DRINKS = [
  {
    id: 'negroni', name: 'Negroni', method: 'Stirred', section: 'stirred',
    hook: "The count it was named after turned out to be a fencing teacher.",
    story: "He turns up in an 1892 ship manifest and a New York directory, and the cowboy and gambler versions are padding. Better still, the handsome mustachioed portrait everyone prints of him is a different man entirely.",
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
    smokeNote: 'Cherry is the best match for Campari. Never walnut on this one.',
    glass: 'rocks', color: '#A8321C', ice: 'cube', garnish: 'orange-twist'
  },
  {
    id: 'boulevardier', name: 'Boulevardier', method: 'Stirred', section: 'stirred',
    hook: "An American in Paris named it after the magazine he published.",
    story: "Erskine Gwynne reamed shells in a French munitions factory and worked cargo boats round the world before landing in Jazz Age Paris. Then the drink vanished for eighty years — not so much forgotten as never really remembered.",
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
    smokeNote: 'The best drink here to smoke. Bourbon gives the smoke caramel and oak to hold onto instead of botanicals to fight.',
    glass: 'rocks', color: '#92321B', ice: 'cube', garnish: 'orange-twist'
  },
  {
    id: 'old-fashioned', name: 'Old Fashioned', method: 'Stirred', section: 'stirred',
    hook: "Drinkers began asking for it the old-fashioned way, and the name stuck.",
    story: "By the 1880s bartenders were loading everything with absinthe, maraschino and curaçao. Asking for it the old way meant spirit, sugar, water and bitters, which is what the word cocktail had meant since 1806. In Wisconsin they ignore all of it, use brandy, and top it with 7-Up.",
    flavor: { bitter: 2, sweet: 3, citrus: 1, herbal: 1, strength: 5 },
    build: [['2 oz', 'bourbon or rye'], ['1', 'sugar cube (or 0.25 oz simple syrup)'], ['2 dashes', 'Angostura']],
    steps: [
      "Put the sugar cube in the glass with the bitters and a bar spoon of water.",
      "Muddle until the sugar is mostly dissolved.",
      "Add the whiskey and one large cube.",
      "Stir 30 seconds, adding a second cube partway through.",
      "Express an orange peel and drop it in."
    ],
    tip: 'Worth making both ways — Rittenhouse at 100 proof is a noticeably different drink from bourbon.',
    smoke: true, woods: ['Oak', 'Oak + a pinch of cinnamon', 'Pecan', 'Walnut'],
    smokeNote: 'The archetype. Sugar and smoke are the entire point.',
    zero: { from: 'sugar cube (or 0.25 oz simple syrup)', qty: '0.25 oz', to: 'zero-sugar syrup',
      note: 'Nothing to muddle, so it comes together faster. What you lose is the grain of sugar that never quite dissolves.',
      steps: [
        'Put the zero-sugar syrup in the glass with the bitters.',
        'Add the whiskey and one large cube.',
        'Stir 30 seconds, adding a second cube partway through.',
        'Express an orange peel and drop it in.'
      ] },
    glass: 'rocks', color: '#A55E22', ice: 'cube', garnish: 'orange-twist'
  },
  {
    id: 'monte-carlo', name: 'Monte Carlo', method: 'Stirred', section: 'stirred',
    hook: "The Bénédictine in it was sold on the story of a monk who never existed.",
    story: "The label credits a 1510 recipe by Dom Bernardo Vincelli, found in an attic. There is no record he ever lived: a 19th-century wine merchant appears to have invented him, borrowed D.O.M. from real monastic manuscripts, and built a Gothic palace to house the story.",
    flavor: { bitter: 2, sweet: 3, citrus: 1, herbal: 5, strength: 5 },
    build: [['2 oz', 'rye'], ['0.5 oz', 'Bénédictine'], ['2 dashes', 'Angostura']],
    steps: [
      "Fill a mixing glass with good ice.",
      "Add the rye, Bénédictine and Angostura.",
      "Stir 30 seconds.",
      "Strain up into a chilled coupe, or over one large cube.",
      "Express a lemon peel and drop it in."
    ],
    tip: 'A Manhattan with Bénédictine standing in for vermouth — the easiest way to learn what Bénédictine tastes like.',
    smoke: true, woods: ['Apple', 'Pear', 'Peach', 'Oak'],
    smokeNote: "Bénédictine's honey against smoke is better than it sounds on paper. Stay gentle here.",
    glass: 'coupe', color: '#A9722A', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'rye-manhattan', name: 'Rye Manhattan', method: 'Stirred', section: 'stirred',
    hook: "It was not invented for Winston Churchill's mother, whatever the bar tells you.",
    story: "Lady Randolph Churchill was in England at the time, heavily pregnant with Winston. What is true is what Prohibition did to rye: distilleries shut for good, and cheap subsidised corn kept bourbon on top for the next fifty years.",
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
    tip: "Taste the vermouth first. Open on the shelf more than a month or two and it's flat — the most common reason a home Manhattan disappoints.",
    smoke: true, woods: ['Oak', 'Pecan'],
    smokeNote: 'Reliable, if less interesting than the Monte Carlo.',
    glass: 'coupe', color: '#8A3B21', ice: 'none', garnish: 'cherry'
  },
  {
    id: 'sazerac', name: 'Sazerac', method: 'Stirred', section: 'stirred',
    hook: "Louisiana decided it was too disreputable to be the state cocktail.",
    story: "The legislature balked in 2008, worrying aloud that it would encourage drinking, and settled for making it the official cocktail of New Orleans instead. The absinthe rinse is a workaround too — banned in 1912, faked ever since.",
    flavor: { bitter: 3, sweet: 2, citrus: 2, herbal: 2, strength: 5 },
    build: [['2 oz', 'rye'], ['1', 'sugar cube'], ['4 dashes', "Peychaud's"]],
    steps: [
      "Put the sugar cube in a mixing glass with the Peychaud's and a splash of water.",
      "Muddle until the sugar is mostly dissolved.",
      "Add the rye and ice, and stir 30 seconds.",
      "Strain into a chilled rocks glass — no ice.",
      "Express a lemon peel over the top, then throw the peel away. It does not go in."
    ],
    smoke: true, woods: ['Oak', 'Pecan'],
    smokeNote: 'Smoke stands in for the absinthe rinse we do not have. Different flavor, same job.',
    zero: { from: 'sugar cube', qty: '0.25 oz', to: 'zero-sugar syrup',
      note: 'A straight swap for the cube. It lands drier, which the rye can carry.',
      steps: [
        "Put the zero-sugar syrup in a mixing glass with the Peychaud's.",
        'Add the rye and ice, and stir 30 seconds.',
        'Strain into a chilled rocks glass — no ice.',
        'Express a lemon peel over the top, then throw the peel away. It does not go in.'
      ] },
    glass: 'rocks', color: '#9E5324', ice: 'none', garnish: 'none'
  },
  {
    id: 'vieux-carre', name: 'Smoke Vieux Carré', method: 'Stirred',
    section: 'stirred', hidden: true,
    hook: "Three spirits in equal parts, which is one more than most drinks risk.",
    story: "Walter Bergeron mixed it at the Hotel Monteleone in New Orleans in 1938. The hotel's bar was later rebuilt as a carousel that turns a full circle every fifteen minutes, and has been revolving since 1949. The name means old square — the French Quarter.",
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
    smokeNote: 'Enough going on already that smoke has plenty to hold onto.',
    glass: 'rocks', color: '#8E4A24', ice: 'cube', garnish: 'lemon-twist'
  },
  {
    id: 'de-la-louisiane', name: 'De La Louisiane', method: 'Stirred', section: 'stirred',
    hook: "It is the house drink of a New Orleans restaurant that opened in 1881.",
    story: "Named for Restaurant de la Louisiane in the French Quarter, and built like a Sazerac that sat down to eat: the same rye and Peychaud's, sweetened with Bénédictine and lengthened with vermouth. It wants an absinthe rinse too, so the smoker covers it.",
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
    smokeNote: 'Standing in for the absinthe rinse, the same job it does in the Sazerac.',
    glass: 'coupe', color: '#93502A', ice: 'none', garnish: 'cherry'
  },
  {
    id: 'white-negroni', name: 'White Negroni', method: 'Stirred', section: 'stirred',
    hook: "Two men invented it because they could not be bothered going out.",
    story: "Bordeaux, 2001: Wayne Collins and Plymouth Gin's Nick Blacknell stayed in during a wine fair and mixed with whatever French bottles were to hand — Suze where the Campari goes, Lillet where the vermouth was. Nobody cared at the time. It caught on years later in New York.",
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
    noSmoke: "The instinct will be strong. Suze's gentian and Lillet's floral character are exactly what smoke destroys.",
    glass: 'rocks', color: '#BCAE6B', ice: 'cube', garnish: 'lemon-twist'
  },

  {
    id: 'whiskey-sour', name: 'Whiskey Sour', method: 'Shaken', section: 'shaken',
    hook: "The egg white adds no flavor at all — it is there for the texture.",
    story: "Shaking without ice first throws all the energy into unfolding the egg proteins so they trap air, instead of wasting it on chilling. The second shake, with ice, is what sets the foam.",
    flavor: { bitter: 1, sweet: 3, citrus: 4, herbal: 0, strength: 3 },
    build: [['2 oz', 'bourbon'], ['0.75 oz', 'lemon'], ['0.75 oz', 'simple syrup']],
    steps: [
      "Add the bourbon, lemon and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds, until the tin hurts to hold.",
      "Strain over fresh ice."
    ],
    eggSteps: [
      "Add the bourbon, lemon, simple syrup and egg white to a shaker — no ice yet.",
      "Dry-shake 10 seconds to build the foam.",
      "Add ice and shake hard 12 seconds more.",
      "Double-strain into a chilled glass, no ice.",
      "Three drops of Angostura on the foam."
    ],
    egg: true, smoke: false,
    noSmoke: 'Smoke over fresh citrus reads muddy, and foam kills the aroma anyway.',
    zero: { from: 'simple syrup', to: 'zero-sugar syrup',
      note: 'One for one. Sugar carries weight as well as sweetness, so it pours thinner — take the egg white and you will not notice.' },
    glass: 'rocks', color: '#BE8330', ice: 'cubes', garnish: 'none'
  },
  {
    id: 'gin-sour', name: 'Gin Sour', method: 'Shaken', section: 'shaken',
    hook: "This is the calm relative of a drink that once took thirty men to shake.",
    story: "Its show-off relative is the Ramos Gin Fizz, shaken so long that during the 1915 Carnival its inventor kept a line of thirty-odd shaker boys passing the tin hand to hand down the bar. This one asks considerably less of you.",
    flavor: { bitter: 1, sweet: 3, citrus: 4, herbal: 2, strength: 3 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'lemon'], ['0.75 oz', 'simple syrup']],
    steps: [
      "Add the gin, lemon and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds, until the tin hurts to hold.",
      "Strain over fresh ice."
    ],
    eggSteps: [
      "Add the gin, lemon, simple syrup and egg white to a shaker — no ice yet.",
      "Dry-shake 10 seconds to build the foam.",
      "Add ice and shake hard 12 seconds more.",
      "Double-strain into a chilled glass, no ice."
    ],
    egg: true, smoke: false,
    tip: 'Worth doing side by side with the whiskey sour once.',
    noSmoke: 'Smoke over fresh citrus reads muddy, and foam kills the aroma anyway.',
    zero: { from: 'simple syrup', to: 'zero-sugar syrup',
      note: 'One for one. Leaner without the sugar behind it, which gin minds less than bourbon does.' },
    glass: 'rocks', color: '#CBBD75', ice: 'cubes', garnish: 'none'
  },
  {
    id: 'bees-knees', name: "Bee's Knees", method: 'Shaken', section: 'shaken',
    hook: "The bartender who first wrote it down was under Gestapo surveillance.",
    story: "Frank Meier ran the bar at the Paris Ritz through the occupation — Austrian-born of Jewish descent, watched by the Gestapo living upstairs, and documented supplying forged papers to guests dodging round-ups. After the war he was sacked for funnelling customers' bar tabs into a London account, and disappeared.",
    flavor: { bitter: 0, sweet: 4, citrus: 4, herbal: 2, strength: 3 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'honey syrup'], ['0.75 oz', 'lemon']],
    steps: [
      "Check you're using honey syrup, not straight honey — honey seizes in the cold.",
      "Add the gin, honey syrup and lemon to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Garnish with a lemon peel."
    ],
    tip: 'Honey syrup, not straight honey — honey seizes in the cold and leaves sweet lumps.',
    smoke: false,
    noSmoke: 'Smoke over fresh citrus reads muddy, and it would bury the honey.',
    glass: 'coupe', color: '#CD9C35', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'sidecar', name: 'Sidecar', method: 'Shaken', section: 'shaken',
    hook: "A captain kept arriving at the bar in a motorcycle sidecar.",
    story: "Both the Ritz in Paris and Harry's New York Bar claim to have made it first, and the same captain turns up in each version. The proportions have been argued over ever since — the French school pours equal parts, the English school pours twice as much brandy.",
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
    noSmoke: 'Shaken with fresh citrus — never smoke this.',
    glass: 'coupe', color: '#C98B3A', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'margarita', name: 'Margarita', method: 'Shaken', section: 'shaken',
    hook: "Margarita is Spanish for daisy, and a daisy is exactly what this is.",
    story: "The Daisy was a whole family of sours sweetened with a liqueur instead of syrup, and this is simply the tequila one — which is why at least eight people have credibly claimed to have invented it and none can prove it. Salt only half the rim, so nobody is stuck with a decision they didn't make.",
    flavor: { bitter: 1, sweet: 3, citrus: 5, herbal: 2, strength: 4 },
    build: [['2 oz', 'tequila'], ['0.75 oz', 'Cointreau'], ['0.75 oz', 'lime']],
    steps: [
      "Salt half the rim of a rocks glass, leaving half bare so there is a choice.",
      "Add the tequila, Cointreau and lime to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Strain over fresh ice."
    ],
    smoke: false,
    noSmoke: 'Shaken with fresh citrus — never smoke this.',
    glass: 'rocks', color: '#CBD489', ice: 'cubes', garnish: 'lime-wedge'
  },


  {
    id: 'corpse-reviver', name: 'Corpse Reviver №2', method: 'Shaken', section: 'shaken',
    hook: "It was published as a hangover cure, with a warning printed underneath.",
    story: "The Savoy Cocktail Book put it in print in 1930 as a morning restorative, then added that four taken in swift succession will unrevive the corpse again. It should have an absinthe rinse, which we do not have.",
    flavor: { bitter: 2, sweet: 3, citrus: 4, herbal: 3, strength: 4 },
    build: [['0.75 oz', 'gin'], ['0.75 oz', 'Cointreau'], ['0.75 oz', 'Lillet Blanc'], ['0.75 oz', 'lemon']],
    steps: [
      "Add everything to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Express a lemon peel over the top."
    ],
    tip: 'Equal parts, so nothing hides. Measure it properly.',
    smoke: true, woods: ['Apple', 'Pear', 'Peach'],
    smokeNote: 'This breaks the rule about smoke and fresh citrus on purpose — the smoke is standing in for an absinthe rinse. Gentle wood only, and try it once before you decide.',
    glass: 'coupe', color: '#D9CE8E', ice: 'none', garnish: 'lemon-twist'
  },
  {
    id: 'pegu-club', name: 'Pegu Club', method: 'Shaken', section: 'shaken',
    hook: "It is named after a British officers' club in Rangoon.",
    story: "The club stood in Rangoon and this was its house drink, carried back to London and New York by members who missed it. The two bitters do most of the work — Angostura for spice, orange for lift.",
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
    noSmoke: 'Shaken with fresh citrus — never smoke this.',
    glass: 'coupe', color: '#CFC98A', ice: 'none', garnish: 'lime-twist'
  },
  {
    id: 'gimlet', name: 'Gimlet', method: 'Shaken', section: 'shaken',
    hook: "Lime went to sea because it stopped sailors dying of scurvy.",
    story: "Gin was already aboard, and the two found each other. The old version uses sweetened lime cordial; fresh lime and sugar makes a sharper, cleaner drink, which is what we pour.",
    flavor: { bitter: 1, sweet: 3, citrus: 5, herbal: 3, strength: 4 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'lime'], ['0.75 oz', 'simple syrup']],
    steps: [
      "Add the gin, lime and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Double-strain up into a chilled coupe.",
      "Garnish with a lime peel."
    ],
    smoke: false,
    noSmoke: 'Shaken with fresh citrus — never smoke this.',
    zero: { from: 'simple syrup', to: 'zero-sugar syrup',
      note: 'One for one. Three things in the glass and nowhere to hide, so taste it before you strain.' },
    glass: 'coupe', color: '#D2DCA0', ice: 'none', garnish: 'lime-twist'
  },
  {
    id: 'gin-tonic', name: 'Gin & Tonic', method: 'Built', section: 'long', low: true,
    hook: "Cheap gin once had London in such a state that Hogarth painted it.",
    story: "The tidy version — officers in India cutting their quinine ration — was invented in the 1970s, and no tonic ever carried a medicinal dose. What actually happened was the Gin Craze: the Crown pushed cheap gin to spite French brandy, and London filled with gin shops.",
    flavor: { bitter: 2, sweet: 2, citrus: 3, herbal: 3, strength: 2 },
    build: [['2 oz', 'gin'], ['4–5 oz', 'tonic'], ['', 'lemon wedge']],
    steps: [
      "Fill a balloon glass with ice.",
      "Pour in the gin.",
      "Top with tonic.",
      "Stir once, no more — over-stirring flattens it.",
      "Squeeze a lemon wedge over the top and drop it in."
    ],
    smoke: false, noSmoke: 'Nothing long and fizzy takes smoke — the bubbles carry it straight off.',
    glass: 'copa', color: '#B9CBD0', ice: 'bowl', garnish: 'lemon-wedge', bubbles: true
  },
  {
    id: 'lillet-tonic', name: 'Lillet Tonic', method: 'Built', section: 'long', low: true,
    hook: "Lillet changed its recipe in 1986, which is why Bond's Vesper cannot be made.",
    story: "It began in 1887 as a genuine medicinal tonic wine, dosed with Peruvian cinchona bark and sold as Kina Lillet. What is in the bottle today is lighter, fruitier and far less bitter — close enough to being a different drink that bartenders reach for something else entirely.",
    flavor: { bitter: 1, sweet: 3, citrus: 2, herbal: 2, strength: 1 },
    build: [['2 oz', 'Lillet Blanc'], ['3 oz', 'tonic'], ['', 'orange slice']],
    steps: [
      "Fill a large wine glass with ice.",
      "Pour in the Lillet Blanc.",
      "Top with tonic.",
      "Stir once and garnish with an orange slice."
    ],
    tip: 'Around 6% ABV — the lightest drink on the list.',
    smoke: false, noSmoke: 'Far too delicate, and the bubbles would carry the smoke off anyway.',
    glass: 'wine', color: '#CDB77C', ice: 'bowl', garnish: 'orange-slice', bubbles: true
  },
  {
    id: 'campari-tonic', name: 'Campari & Tonic', method: 'Built', section: 'long', low: true,
    hook: "Campari's red came from crushed insects until about 2006.",
    story: "The colour came from carmine, made from cochineal beetles, and it was phased out in the mid-2000s — but not everywhere at once. Bottles made for Sweden and Mexico reportedly still use it, so depending where yours came from, the answer may still be bugs.",
    flavor: { bitter: 4, sweet: 2, citrus: 2, herbal: 3, strength: 2 },
    build: [['1.5 oz', 'Campari'], ['4 oz', 'tonic'], ['', 'orange wedge']],
    steps: [
      "Fill a tall glass completely with ice.",
      "Pour in the Campari.",
      "Top with tonic.",
      "Stir once and garnish with an orange wedge."
    ],
    smoke: false, noSmoke: 'The bubbles carry smoke straight off. Smoke a Negroni instead.',
    glass: 'tall', color: '#BB3627', ice: 'tall', garnish: 'orange-wedge', bubbles: true
  },
  {
    id: 'suze-tonic', name: 'Suze & Tonic', method: 'Built', section: 'long', low: true,
    hook: "Picasso pasted a Suze label into a collage that now hangs in a museum.",
    story: "It is from 1912, with real newspaper clippings glued in around it — Balkan War dispatches sitting next to café gossip. What was actually in the bottle is gentian root, dug out of Alpine scree with a metre-long two-pronged fork, from plants decades old and close enough in appearance to deadly white hellebore that foragers have poisoned themselves.",
    flavor: { bitter: 5, sweet: 1, citrus: 2, herbal: 4, strength: 2 },
    build: [['1.5 oz', 'Suze'], ['4 oz', 'tonic'], ['', 'lemon wedge']],
    steps: [
      "Fill a large wine glass with ice.",
      "Pour in the Suze.",
      "Top with tonic — low-sugar if you have it.",
      "Squeeze a lemon wedge over the top and drop it in."
    ],
    smoke: false, noSmoke: 'Gentian is exactly what smoke destroys.',
    glass: 'wine', color: '#C4C075', ice: 'bowl', garnish: 'lemon-wedge', bubbles: true
  },
  {
    id: 'americano', name: 'Americano', method: 'Built', section: 'long', low: true,
    hook: "This is the first drink James Bond orders in print, before the martini.",
    story: "Casino Royale, 1953. A decade of films later turned him into a vodka martini man, but on the page he starts here, with something bitter and low and Italian. Campari from Milan, vermouth from Turin, soda on top, about 8%.",
    flavor: { bitter: 4, sweet: 3, citrus: 2, herbal: 4, strength: 2 },
    build: [['1.5 oz', 'Campari'], ['1.5 oz', 'sweet vermouth'], ['', 'top with soda'], ['', 'orange slice']],
    steps: [
      "Fill a tall glass completely with ice.",
      "Add the Campari and sweet vermouth.",
      "Top with soda.",
      "Stir once and garnish with an orange slice."
    ],
    tip: 'Someone asked for this with gin instead of soda, and that was the Negroni.',
    smoke: false, noSmoke: 'The soda carries smoke straight off. Smoke the Negroni instead.',
    glass: 'tall', color: '#AE3527', ice: 'tall', garnish: 'orange-slice', bubbles: true
  },
  {
    id: 'tom-collins', name: 'Tom Collins', method: 'Shaken + soda', section: 'long', low: true,
    hook: "It is named after a man who never existed, and a prank that did.",
    story: "In 1874 New Yorkers played a prank on each other: tell a friend that Tom Collins is in a bar down the street saying vile things about him, then watch him storm off to confront nobody. Newspapers joined in with fake sightings. When the furious marks arrived demanding Tom Collins, bartenders handed them a glass.",
    flavor: { bitter: 0, sweet: 3, citrus: 4, herbal: 2, strength: 2 },
    build: [['2 oz', 'gin'], ['1 oz', 'lemon'], ['0.75 oz', 'simple syrup'], ['', 'top with soda']],
    steps: [
      "Add the gin, lemon and simple syrup to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Strain into a tall glass filled with fresh ice.",
      "Top with soda."
    ],
    tip: 'Swap bourbon for a John Collins, or rye for more bite.',
    smoke: false, noSmoke: 'Shaken with fresh citrus — never smoke this.',
    zero: { from: 'simple syrup', to: 'zero-sugar syrup',
      note: 'One for one, and the soda covers the missing body better than anywhere else on the list.' },
    glass: 'tall', color: '#D0C384', ice: 'tall', garnish: 'none', bubbles: true
  },
  {
    id: 'whiskey-highball', name: 'Whiskey Highball', method: 'Built', section: 'long', low: true,
    hook: "Suntory talked an entire country back into drinking whisky with this.",
    story: "Japanese whisky had declined for twenty-six straight years when Suntory launched a deliberate highball revival in 2008 — taps in izakaya, cans in convenience stores, an actress in the ads. Bars serving highballs went from about 5,000 to over 40,000 in a year.",
    flavor: { bitter: 1, sweet: 1, citrus: 2, herbal: 1, strength: 2 },
    build: [['2 oz', 'Rittenhouse'], ['4 oz', 'soda'], ['1', 'long lemon peel']],
    steps: [
      "Fill a tall glass completely with ice.",
      "Pour in the Rittenhouse.",
      "Top with soda.",
      "Stir once.",
      "Drop in one long lemon peel."
    ],
    tip: 'The 100 proof holds up where a softer bourbon disappears.',
    smoke: false, noSmoke: 'The soda carries the smoke straight off. Smoke an Old Fashioned instead.',
    glass: 'tall', color: '#B4823F', ice: 'tall', garnish: 'lemon-twist', bubbles: true
  },
  {
    id: 'honey-collins', name: 'Honey Collins', method: 'Shaken + soda', section: 'long', low: true,
    hook: "Honey syrup is thicker than sugar, and you can taste the difference.",
    story: "It carries more body, so the drink lands rounder and softer, with a floral edge that granulated sweetness cannot reach. Lengthened with soda it turns into something you can hold on to all afternoon.",
    flavor: { bitter: 0, sweet: 4, citrus: 4, herbal: 2, strength: 2 },
    build: [['2 oz', 'gin'], ['0.75 oz', 'honey syrup'], ['0.75 oz', 'lemon'], ['', 'top with soda']],
    steps: [
      "Add the gin, honey syrup and lemon to a shaker with ice.",
      "Shake hard for 12 seconds.",
      "Strain into a tall glass filled with fresh ice.",
      "Top with soda."
    ],
    smoke: false, noSmoke: 'Shaken with fresh citrus — never smoke this.',
    glass: 'tall', color: '#C79C4C', ice: 'tall', garnish: 'none', bubbles: true
  },
  {
    id: 'lillet-spritz', name: 'Lillet Spritz', method: 'Built', section: 'long', low: true,
    hook: "The florals only come forward once the quinine steps out of the way.",
    story: "Soda dilutes more gently than tonic and brings no bitterness of its own, so there is nothing for Lillet's honeyed orange to fight. It is the lightest thing on the list.",
    flavor: { bitter: 1, sweet: 3, citrus: 2, herbal: 2, strength: 1 },
    build: [['3 oz', 'Lillet'], ['2 oz', 'soda'], ['', 'lemon wheel']],
    steps: [
      "Fill a large wine glass with ice.",
      "Pour in the Lillet.",
      "Top with soda.",
      "Garnish with a lemon wheel."
    ],
    smoke: false, noSmoke: 'Far too delicate.',
    glass: 'wine', color: '#D2BE85', ice: 'bowl', garnish: 'lemon-wheel', bubbles: true
  },

  {
    id: 'honey-lemon-fizz', name: 'Honey Lemon Fizz', method: 'Shaken + soda', section: 'mocktail', na: true,
    hook: "A pinch of salt does more for this than any expensive substitute.",
    story: "Salt suppresses bitterness and lifts everything else, which is what stops a drink without alcohol tasting like flat juice. The whole trick costs nothing.",
    flavor: { bitter: 0, sweet: 4, citrus: 4, herbal: 1, strength: 0 },
    build: [['1 oz', 'honey syrup'], ['0.75 oz', 'lemon'], ['pinch', 'salt'], ['3 oz', 'club soda']],
    steps: [
      "Shake the honey syrup, lemon and salt with ice.",
      "Strain into a tall glass over fresh ice.",
      "Top with soda.",
      "Garnish with a lemon wheel."
    ],
    smoke: true, woods: ['Apple', 'Pear', 'Peach'],
    smokeNote: 'Gentle wood only. There is no alcohol here to stand up to anything heavier.',
    glass: 'tall', color: '#D9C07E', ice: 'tall', garnish: 'lemon-wheel', bubbles: true
  },
  {
    id: 'bitters-soda', name: 'Bitters & Soda', method: 'Built', section: 'mocktail', na: true,
    hook: "Angostura bitters contains no angostura bark at all.",
    story: "The name is a town in Venezuela, where a Prussian army surgeon mixed it in 1824 to settle Simón Bolívar's soldiers' stomachs. It is also 44.7% alcohol, which is why eight dashes make this not quite an alcohol-free drink.",
    flavor: { bitter: 4, sweet: 1, citrus: 2, herbal: 4, strength: 1 },
    build: [['8 dashes', 'Angostura'], ['5 oz', 'club soda'], ['', 'lemon wedge']],
    steps: [
      "Fill a tall glass with ice.",
      "Add 8 dashes of Angostura.",
      "Top with soda and stir gently.",
      "Squeeze a lemon wedge over the top and drop it in."
    ],
    warning: 'Not alcohol-free. Angostura is 44% ABV, so this lands at roughly a fifth of a non-alcoholic beer — fine for most people, but not for anyone avoiding alcohol strictly.',
    smoke: false,
    noSmoke: 'Angostura is already carrying all the aroma this needs.',
    glass: 'tall', color: '#C3937B', ice: 'tall', garnish: 'lemon-wedge', bubbles: true
  }
];

/* the order they print in at the default hour — the evening reshuffles it */
const SECTIONS = ['stirred', 'shaken', 'long', 'mocktail'];
