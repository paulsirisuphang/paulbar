const T_EN = {
  tab_menu: 'Menu', tab_orders: 'Orders',
  surprise: 'Surprise me',
  heavy_none: 'No alcohol',
  level_light: 'Light', level_medium: 'Medium', level_strong: 'Strong',

  sec_stirred: 'Spirit-forward', sec_stirred_sub: 'strong and slow · smoke works here',
  sec_shaken: 'Sour & bright', sec_shaken_sub: 'fresh citrus · shaken · no smoke',
  sec_long: 'Long & refreshing', sec_long_sub: 'built in the glass · low ABV',
  sec_mocktail: 'Mocktails', sec_mocktail_sub: 'no alcohol · salt in every one',

  secret_line: 'There is one more.',
  the_story: 'The story',
  whats_in_it: "What's in it", tastes_like: 'Tastes like',
  your_name: 'Your name', anything_else: 'Anything else',
  close: 'Close', send: 'Send to the bar',
  name_ph: 'So the bar knows whose drink this is',
  name_ph_err: 'The bar needs a name for this one',
  note_ph: 'Optional — light on the vermouth, no garnish, make it two…',

  tender_tap: 'Get their attention',
  tee_label: 'A golf tee',
  filters_label: 'Show one kind of drink',
  stamp_poured: 'Poured',
  ago_now: 'just now',
  ago_min: (m) => (m === 1 ? '1 min ago' : m + ' min ago'),
  ago_hr: (h) => (h === 1 ? '1 hr ago' : h + ' hrs ago'),
  smoke_it: 'Smoke it', wood: 'Wood', egg_white: 'Egg white',
  zero_sugar: 'Zero-sugar syrup',
  egg_why: 'Dry-shaken first, served up with a thick white foam. Skip it for a leaner, tarter drink over ice.',
  no_smoke_here: 'No smoke on this one. ', heads_up: 'Heads up. ',

  axis_bitter: 'bitter', axis_sweet: 'sweet', axis_citrus: 'citrus',
  axis_herbal: 'herbal', axis_strength: 'strength',

  orders_lede_a: 'Tickets land here as they come in. Open ',
  orders_lede_b: 'the build',
  orders_lede_c: " for the recipe, tick the box when it's poured.",
  working: 'working', poured: 'poured',
  sync_on: 'Shared with every phone', sync_off: 'Offline — saved on this device',
  on_the_rail: 'On the rail', poured_title: 'Poured', clear: 'Clear',
  the_build: 'The build',
  bar_quiet: 'The bar is quiet', bar_quiet_sub: 'Orders from the menu show up here.',
  bar_notes: 'Bar notes',

  chip_smoke: 'Smoke — ', chip_smoke_best: 'Smoke — the best of them',
  chip_smoked: 'Smoked — ', chip_low: 'Low ABV', chip_na: 'No alcohol',
  chip_warn: 'Not alcohol-free', chip_egg_opt: 'Egg white optional', chip_egg: 'Egg white',
  chip_zero_opt: 'Zero-sugar option', chip_zero: 'Zero sugar',

  toast_ordered: 'Ordered — ', toast_poured: 'Poured — ', toast_back: 'Back on the rail',
  toast_for: ' for ',

  aside_smoke: 'Smoke — ', aside_zero: 'Zero-sugar syrup', aside_tip: 'Worth knowing', aside_warn: 'Not alcohol-free',

  smoke_step: function (chip, blended) {
    return 'Smoke the empty glass: invert it over the ' + chip +
      ' chip for 10–20 seconds, then build in it. Never smoke the finished drink.' +
      (blended ? ' Blend the pinch of cinnamon into the oak — never burn it on its own.' : '');
  },


  notes: [
    { h: 'Simple syrup', p: 'Equal parts sugar and hot water, stirred until clear. Keeps a month in the fridge.' },
    { h: 'Honey syrup', p: "Two parts honey to one part warm water. Raw honey is too thick to mix cold, so this step isn't optional. Keeps a month." },
    { h: 'Stir or shake', p: "Stir anything that's all spirits — about 30 seconds in a mixing glass with good ice. Shake anything with citrus, egg, or syrup — 12 hard seconds, until the tin hurts to hold." },
    { h: 'The long ones', p: 'Fill the glass completely with ice. A half-full glass dilutes faster, not slower.' },
    { h: 'Every mocktail gets salt', p: 'A pinch, free, and it does more to stop a drink tasting like flat juice than any expensive non-alcoholic spirit.' },
    { h: 'Push the acid higher', p: 'Without booze most people underdo the lemon by half. And use the smoker — it is the one flavor tool that needs no alcohol, and it makes a mocktail taste intentional rather than apologetic.' },
    { h: 'Smoking a glass', p: 'Smoke the empty glass, never the finished drink. Invert it over the chip for 10–20 seconds, then build or pour in. Never smoke anything shaken with fresh citrus — smoke plus fresh lemon reads muddy, and foam kills the aroma anyway.' }
  ],
  wood_table_head: ['Wood', 'Use on'],
  wood_table: [
    ['Apple, pear, peach', "The gentlest. Monte Carlo, anything you don't want to bury"],
    ['Cherry', 'Negroni, Boulevardier. Best match for Campari'],
    ['Oak', 'The neutral whiskey wood. Old Fashioned, Sazerac, Manhattan'],
    ['Pecan', 'Middle gear, nutty. Sazerac, Manhattan'],
    ['Cinnamon', 'A pinch blended into oak, never solo. Old Fashioned only'],
    ['Walnut', 'Go light — tannic and assertive. Bourbon drinks only, never the Negroni']
  ]
};
