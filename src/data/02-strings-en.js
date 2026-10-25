const T_EN = {
  tab_menu: 'Menu', tab_orders: 'Orders',
  surprise: 'Surprise me',
  heavy_none: 'No alcohol',
  level_light: 'Light', level_medium: 'Medium', level_strong: 'Strong',

  sec_stirred: 'Strong & stirred', sec_stirred_sub: 'for sipping slowly',
  sec_shaken: 'Sour & bright', sec_shaken_sub: 'fresh citrus · shaken',
  sec_long: 'Tall & fizzy', sec_long_sub: 'soda or tonic · low alcohol',
  sec_mocktail: 'Mocktails', sec_mocktail_sub: 'no alcohol',

  secret_line: 'There is one more.',
  the_story: 'The story',
  whats_in_it: "What's in it", tastes_like: 'Tastes like',
  your_name: 'Your name', anything_else: 'Anything else',
  close: 'Close', send: 'Send to the bar',
  name_ph: 'So the bar knows whose drink this is',
  name_ph_err: 'The bar needs a name for this one',
  note_ph: 'Optional. Light on the vermouth, no garnish, make it two…',

  piece_juggle: 'Juggle the wine bottles', piece_stir: 'Stir the mixing glass',
  piece_shake: 'Shake the shaker', piece_chip: 'Chip the golf ball into the glass',
  piece_smoke: 'Fire up the smoking gun',
  filters_label: 'Show one kind of drink',
  stamp_poured: 'Poured',
  ago_now: 'just now',
  ago_min: (m) => (m === 1 ? '1 min ago' : m + ' min ago'),
  ago_hr: (h) => (h === 1 ? '1 hr ago' : h + ' hrs ago'),
  smoke_it: 'Smoke it', wood: 'Wood', egg_white: 'Egg white',
  egg_why: 'Shaken into a thick white foam and served without ice. Leave it out for a lighter, tarter drink on ice.',
  no_smoke_here: 'No smoke on this one. ', heads_up: 'Good to know. ',

  axis_bitter: 'bitter', axis_sweet: 'sweet', axis_citrus: 'citrus',
  axis_herbal: 'herbal', axis_strength: 'strength',

  orders_lede_a: 'Orders show up here as guests send them. Open ',
  orders_lede_b: 'the recipe',
  orders_lede_c: ", then tick the box once it's poured.",
  working: 'to make', poured: 'poured',
  sync_on: 'Shared with every phone', sync_off: 'Offline, saved on this device only',
  on_the_rail: 'To make', poured_title: 'Poured', clear: 'Clear',
  the_build: 'Recipe',
  bar_quiet: 'The bar is quiet', bar_quiet_sub: 'Orders from the menu show up here.',
  bar_notes: 'Bar notes',

  /* "Cherry smoke" on the menu, "Smoked with cherry" on a ticket */
  chip_smoke: (wood) => wood.charAt(0).toUpperCase() + wood.slice(1) + ' smoke',
  chip_smoke_best: 'Best with smoke',
  chip_smoked: 'Smoked with ', chip_low: 'Low alcohol', chip_na: 'No alcohol',
  chip_warn: 'Not alcohol-free', chip_egg_opt: 'Egg white optional', chip_egg: 'Egg white',
  chip_yuzu: 'Yuzu bitters', chip_umami: 'Umami bitters',

  egg_ing: 'egg white', egg_qty: '1',
  yuzu_bitters: 'Yuzu bitters', yuzu_ing: 'yuzu bitters',
  yuzu_why: 'Tart and floral, somewhere between grapefruit and lime. Leave it out for the classic recipe.',
  umami_bitters: 'Umami bitters', umami_ing: 'umami bitters',
  umami_why: 'Made from kelp, shiitake and smoked bonito. Like a pinch of salt, it makes the other flavors taste fuller. Leave it out for the classic recipe.',

  toast_ordered: 'Ordered: ', toast_poured: 'Poured: ', toast_back: 'Back on the list',
  toast_for: ' for ',

  aside_smoke: 'Smoke: ', aside_tip: 'Worth knowing', aside_warn: 'Not alcohol-free',

  smoke_step: function (chip, blended) {
    return 'Smoke the empty glass: invert it over the ' + chip +
      ' chip for 10–20 seconds, then build in it. Never smoke the finished drink.' +
      (blended ? ' Blend the pinch of cinnamon into the oak. Never burn it on its own.' : '');
  },


  notes: [
    { h: 'Simple syrup', p: 'Equal parts sugar and hot water, stirred until clear. Keeps a month in the fridge.' },
    { h: 'Honey syrup', p: "Two parts honey to one part warm water. Raw honey is too thick to mix cold, so don't skip this. Keeps a month in the fridge." },
    { h: 'Stir or shake', p: "Stir drinks that are all spirits: about 30 seconds in a mixing glass with good ice. Shake anything with citrus or egg: 12 hard seconds, until the shaker is almost too cold to hold." },
    { h: 'Tall drinks', p: 'Fill the glass to the top with ice. Less ice melts faster, not slower.' },
    { h: 'Every mocktail gets salt', p: 'A pinch costs nothing, and it does more to stop a mocktail tasting like plain juice than any expensive alcohol-free spirit.' },
    { h: 'More lemon than you think', p: 'Without alcohol, most people use half the lemon they need. Use the smoke too: it adds flavor without alcohol, and it makes a mocktail feel like a real drink.' },
    { h: 'Smoking a glass', p: "Smoke the empty glass, never the finished drink. Turn it upside down over the lit chip for 10–20 seconds, then make the drink in it. Don't smoke anything shaken with fresh citrus: smoke and fresh lemon clash, and foam hides the smell anyway." }
  ],
  wood_table_head: ['Wood', 'Use on'],
  wood_table: [
    ['Apple, pear, peach', "The lightest. Monte Carlo, and any drink you don't want to cover up"],
    ['Cherry', 'Negroni, Boulevardier. Best match for Campari'],
    ['Oak', 'The standard for whiskey. Old Fashioned, Sazerac, Manhattan'],
    ['Pecan', 'Medium and nutty. Sazerac, Manhattan'],
    ['Cinnamon', 'A pinch blended into oak, never on its own. Old Fashioned only'],
    ['Walnut', 'Strong and bitter, so use a little. Bourbon drinks only, never the Negroni']
  ]
};
